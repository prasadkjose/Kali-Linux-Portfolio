import React, { useState, useCallback } from "react";
import { motion, useMotionValue } from "motion/react";
import styled from "styled-components";
import { getFromLS, setToLS } from "../utils/storage";
import { isMobileDevice } from "../utils/typeGuards";
import {
  getComponentId,
  DRAGGABLE_STORAGE_KEY,
  DraggablePositionsMap,
} from "../utils/draggableUtils";

const DraggableContainer = styled(motion.div)`
  position: fixed;
  cursor: grab;
  user-select: none;
  z-index: 10;

  &:active {
    cursor: grabbing;
  }

  /* Add shadow while dragging */
  &:active > * {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }
`;

interface DraggableProps {
  children: React.ReactNode;
  position?: "left" | "right";
  initialX?: number;
  initialY?: number;
}

const Draggable: React.FC<DraggableProps> = ({
  children,
  initialX,
  initialY,
}) => {
  const componentId = getComponentId(children);
  const STORAGE_KEY = DRAGGABLE_STORAGE_KEY;
  const [zIndex, setZIndex] = useState(10);
  const [isMobile] = useState(isMobileDevice());
  const [canDrag, setCanDrag] = useState(true);
  const LONG_PRESS_DELAY = 500; // 500ms long press required on mobile

  const containerRef = React.useRef<HTMLDivElement>(null);
  // Initialize motion values with null - will be set before first paint
  const x = useMotionValue<number | null>(null);
  const y = useMotionValue<number | null>(null);

  // Use useLayoutEffect to set position BEFORE browser paints anything (prevents flicker)
  React.useLayoutEffect(() => {
    const allSavedPositions = getFromLS<DraggablePositionsMap>(STORAGE_KEY, {});
    const savedPosition = allSavedPositions[componentId];

    if (savedPosition) {
      // Use saved position from localStorage if available
      x.set(savedPosition.x);
      y.set(savedPosition.y);
    } else if (initialX !== undefined && initialY !== undefined) {
      // Use explicit initial coordinates if provided via props
      x.set(initialX);
      y.set(initialY);
    } else if (containerRef.current) {
      // No saved position or override - use actual natural DOM position as initial value
      const rect = containerRef.current.getBoundingClientRect();
      x.set(rect.left);
      y.set(rect.top);
    }
  }, [componentId, x, y, initialX, initialY]);

  // Handle touch events for mobile long press
  const handleTouchStart = () => {
    if (!isMobile) return;
    setCanDrag(false);

    window.setTimeout(() => {
      setCanDrag(true);
      bringToFront();
    }, LONG_PRESS_DELAY);
  };

  const handleTouchEnd = () => {
    if (!isMobile) return;
    // Reset drag capability after touch ends
    setCanDrag(false);
  };

  const bringToFront = () => {
    setZIndex(100);
  };

  // Calculate dynamic drag constraints based on actual component size
  const getDragConstraints = useCallback(() => {
    const elementWidth = containerRef.current?.offsetWidth || 280;
    const elementHeight = containerRef.current?.offsetHeight || 280;

    return {
      left: -20,
      right: window.innerWidth - elementWidth + 20,
      top: -20,
      bottom: window.innerHeight - elementHeight + 20,
    };
  }, []);

  // Save position to localStorage when drag ends (store all components in single object)
  const handleDragEnd = useCallback(() => {
    // Get current positions, update only this component's position
    const currentPositions = getFromLS<DraggablePositionsMap>(STORAGE_KEY, {});
    const updatedPositions = {
      ...currentPositions,
      [componentId]: {
        x: x.get(),
        y: y.get(),
      },
    };
    setToLS(STORAGE_KEY, updatedPositions);
  }, [componentId, x, y]);

  return (
    <DraggableContainer
      ref={containerRef}
      drag={canDrag}
      dragMomentum={false}
      dragElastic={0}
      style={(() => {
        const baseStyles = { zIndex };
        // Always pass MotionValue objects directly - Motion will handle updates
        // Passing raw numbers breaks drag binding! Motion can't update your variables
        return {
          ...baseStyles,
          x,
          y,
          touchAction: isMobile ? "manipulation" : "none",
        };
      })()}
      onMouseDown={bringToFront}
      onDragEnd={handleDragEnd}
      dragConstraints={getDragConstraints()}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </DraggableContainer>
  );
};

export default Draggable;
