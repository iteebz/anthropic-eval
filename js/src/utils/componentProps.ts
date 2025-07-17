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

export const createComponentProps = (
  content: string,
  interfaceData?: InterfaceData,
  className?: string,
  onSendMessage?: (message: string) => void,
  children?: React.ReactNode,
): RendererComponentProps => {
  return {
    content,
    interfaceData,
    className,
    onSendMessage,
    children,
  };
};

export const createRecursiveProps = (
  content: any,
  depth = 0,
  maxDepth = 10,
  onSendMessage?: (message: string) => void,
  className?: string,
): RecursiveRendererProps => {
  return {
    content,
    depth,
    maxDepth,
    onSendMessage,
    className,
  };
};
