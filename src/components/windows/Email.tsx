import React, { useState, useRef, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { WindowState } from "../../types/window";
import { PERSONAL_DATA } from "../../config/personalData.config";
import logger from "../../utils/logger";
import { createMessage } from "../../services/databaseService";

type EmailFormInputs = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(0.8); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.5; }
  100% { transform: scale(0.8); opacity: 1; }
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-bottom: 30px;
  height: 100%;
  scrollbar-width: thin; /* Firefox */
  animation: ${slideIn} 0.3s ease-out;
`;

const FormLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 48px;
  width: 60%;
  align-self: center;

  @media (max-width: 550px) {
    grid-template-columns: 1fr;
    width: 100%;
    align-self: unset;
  }
`;

const FormHeader = styled.div`
  margin-bottom: 32px;
  padding-left: 45px;
  @media (max-width: 550px) {
    padding-left: 0;
  }
`;

const FormTitle = styled.h2`
  color: ${({ theme }) => theme.colors.text["100"]};
  margin: 0 0 8px 0;
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.02em;
`;

const FormSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.text["200"]};
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
`;

const Label = styled.label`
  color: ${({ theme }) => theme.colors.text["100"]};
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.01em;
`;

const baseInputStyles = (theme: import("styled-components").DefaultTheme) => `
  padding: 14px 16px;
  border: 2px solid #6a6162ff !important;
  border-radius: 10px;
  background-color: transparent !important;  
  color: ${theme.colors.text["100"]};
  font-size: 0.95rem;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  &::placeholder {
    color: ${theme.colors.text["100"]};
    opacity: 0.7;
  }

  &:invalid:not(:placeholder-shown) {
    border-color: #bf616a !important;
  }
`;

const Input = styled.input`
  ${({ theme }) => baseInputStyles(theme)}
`;

const Textarea = styled.textarea`
  ${({ theme }) => baseInputStyles(theme)}
  min-height: 140px;
  resize: vertical;
  line-height: 1.6;
`;

const ErrorText = styled.span`
  color: #bf616a;
  font-size: 0.8rem;
  font-weight: 500;
  padding-left: 4px;
  animation: ${slideIn} 0.2s ease-out;
`;

const SubmitButton = styled.button`
  position: relative;
  padding: 14px 28px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: 12px;
  box-shadow: 0 4px 14px ${({ theme }) => `${theme.colors.primary}40`};
  min-height: 52px;
  width: 100%;
  margin-bottom: 48px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px ${({ theme }) => `${theme.colors.primary}55`};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 8px ${({ theme }) => `${theme.colors.primary}40`};
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 576px) {
    padding: 12px 20px;
    min-height: 48px;
    font-size: 0.95rem;
  }
`;

const Spinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: ${pulse} 0.8s infinite;
  margin-right: 8px;
  vertical-align: middle;
`;

const SuccessMessage = styled.div`
  padding: 20px;
  background: linear-gradient(135deg, #a3be8c, #88c0d0);
  color: #2e3440;
  border-radius: 10px;
  margin-bottom: 24px;
  text-align: center;
  font-weight: 600;
  animation: ${slideIn} 0.3s ease-out;
  box-shadow: 0 4px 12px rgba(163, 190, 140, 0.3);
`;

const ErrorMessage = styled.div`
  padding: 20px;
  background: linear-gradient(135deg, #bf616a, #d08770);
  color: #2e3440;
  border-radius: 10px;
  margin-bottom: 24px;
  text-align: center;
  font-weight: 600;
  animation: ${slideIn} 0.3s ease-out;
  box-shadow: 0 4px 12px rgba(191, 97, 106, 0.3);

  p {
    margin: 8px 0;
    font-weight: 500;
    font-size: 0.95rem;
  }

  a {
    color: #2e3440;
    text-decoration: underline;
    font-weight: 600;

    &:hover {
      color: #eceff4;
    }
  }
`;

const ContactLink = styled.a`
  color: ${({ theme }) => theme.colors.text["200"]};
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: underline;
  }
`;

const ContactInfo = styled.div`
  padding: 24px;
  background-color: ${({ theme }) => `${theme.colors.scrollHandle}10`};
  border-radius: 12px;
  height: fit-content;
  position: sticky;
  top: 0;

  h4 {
    color: ${({ theme }) => theme.colors.text["100"]};
    margin: 0 0 16px 0;
    font-size: 1rem;
    font-weight: 600;
  }

  p {
    color: ${({ theme }) => theme.colors.text["200"]};
    margin: 10px 0;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    word-break: break-all;
  }

  @media (max-width: 576px) {
    padding-bottom: 50px;
    position: static;

    h4 {
      font-size: 0.95rem;
      margin-bottom: 12px;
    }

    p {
      font-size: 0.825rem;
      margin: 8px 0;
    }
  }
`;

const EmailWindow: React.FC<WindowState> = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<EmailFormInputs>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);
  const [isSubmitFailed, setIsSubmitFailed] = useState(false);
  const [errors, setErrors] = useState<Partial<EmailFormInputs>>({});
  const [rerender, setRerender] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Prevent unnecessary rerenders when typing - same logic as terminal
    setRerender(false);

    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for field when user types
    if (errors[name as keyof EmailFormInputs]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof EmailFormInputs];
        return newErrors;
      });
    }

    // Reset submission states when user starts typing again
    setIsSubmitSuccessful(false);
    setIsSubmitFailed(false);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<EmailFormInputs> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const encode = (data: Record<string, string>) => {
    return Object.keys(data)
      .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
      .join("&");
  };

  const onSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setRerender(true);
    setIsSubmitting(true);
    setIsSubmitSuccessful(false);
    setIsSubmitFailed(false);

    try {
      // First save message to database
      await createMessage({
        message: {
          type: "contact_form",
          ...formData,
          submittedAt: new Date().toISOString(),
          userAgent: navigator.userAgent,
        },
      });

      // Also send original Netlify form submission
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode({ "form-name": "contact", ...formData }),
      });

      logger.info("Email form submitted and saved to database");
      setIsSubmitSuccessful(true);
      setIsSubmitFailed(false);

      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      logger.info(`Email form failed: ${error}`);
      setIsSubmitSuccessful(false);
      setIsSubmitFailed(true);
    } finally {
      setIsSubmitting(false);
      setRerender(false);
    }
  };

  // Auto-scroll to bottom when form state changes (success message, errors, submit state)
  useEffect(() => {
    const el = containerRef?.current as unknown as HTMLElement | null;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [isSubmitSuccessful, isSubmitFailed, errors, isSubmitting, rerender]);

  return (
    <FormContainer ref={containerRef}>
      <FormHeader>
        <FormTitle>Get In Touch</FormTitle>
        <FormSubtitle>
          Have a question, project idea, or just want to say hello? Fill out the
          form below and I'll get back to you as soon as possible.
        </FormSubtitle>
      </FormHeader>

      {isSubmitSuccessful && (
        <SuccessMessage>
          ✓ Thank you! Your message has been sent successfully.
        </SuccessMessage>
      )}

      {isSubmitFailed && (
        <ErrorMessage>
          ✗ There was an error sending your message.
          <p>
            You can email me directly at:{" "}
            <a href={`mailto:${PERSONAL_DATA.personalInfo.email}`}>
              {PERSONAL_DATA.personalInfo.email}
            </a>
          </p>
          <p>Or reach out through social links on the right.</p>
        </ErrorMessage>
      )}

      <FormLayout>
        <form
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            width: "100%",
            maxWidth: 650,
          }}
          onSubmit={onSubmit}
          name="contact"
          method="POST"
          noValidate
        >
          <FormGroup>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Your full name"
              autoComplete="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            {errors.name && <ErrorText>{errors.name}</ErrorText>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              autoComplete="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
            />
            {errors.email && <ErrorText>{errors.email}</ErrorText>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              name="subject"
              type="text"
              placeholder="What's this about?"
              autoComplete="off"
              value={formData.subject}
              onChange={handleInputChange}
              required
            />
            {errors.subject && <ErrorText>{errors.subject}</ErrorText>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              name="message"
              placeholder="Write your message here..."
              autoComplete="off"
              value={formData.message}
              onChange={handleInputChange}
              required
            />
            {errors.message && <ErrorText>{errors.message}</ErrorText>}
          </FormGroup>

          <SubmitButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner />
                Sending Message...
              </>
            ) : (
              "Send Message"
            )}
          </SubmitButton>
        </form>

        <ContactInfo>
          <h4>Other ways to reach me</h4>
          <p>
            📧 Email:{" "}
            <ContactLink href={`mailto:${PERSONAL_DATA.personalInfo.email}`}>
              {PERSONAL_DATA.personalInfo.email}
            </ContactLink>
          </p>
          <p>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
            <ContactLink
              href="https://linkedin.com/in/prasadkjose"
              target="_blank"
              rel="noopener noreferrer"
            >
              linkedin.com/in/prasadkjose
            </ContactLink>
          </p>
          <p>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            <ContactLink
              href="https://github.com/prasadkjose"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/prasadkjose
            </ContactLink>
          </p>
        </ContactInfo>
      </FormLayout>
    </FormContainer>
  );
};

export default EmailWindow;
