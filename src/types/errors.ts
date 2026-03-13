export class FullscreenError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "FullscreenError";
  }
}

export interface FullscreenErrorDetails {
  type: "unsupported" | "permission_denied" | "unknown";
  message: string;
}
