export interface FallbackProps {
  content: string;
}

export interface ErrorContext {
  interfaceType: string;
  content: string;
  interfaceData?: unknown;
  timestamp: number;
  userAgent: string;
}
