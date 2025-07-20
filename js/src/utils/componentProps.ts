import { type InterfaceData } from "../types";

export interface RendererComponentProps<
  T extends InterfaceData = InterfaceData,
> {
  content: string;
  interfaceData?: T;
  className?: string;
  onSendMessage?: (message: string) => void;
  children?: React.ReactNode;
}

export interface RecursiveRendererProps {
  content: any;
  depth?: number;
  maxDepth?: number;
  onSendMessage?: (message: string) => void;
  className?: string;
}

