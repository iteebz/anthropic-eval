import { type InterfaceData } from "../types";

export interface RendererComponentProps<
  T extends InterfaceData = InterfaceData,
> {
  content: string;
  interfaceData?: T;
  className?: string;
  onSendMessage?: (message: string) => void;
}

export const createComponentProps = (
  content: string,
  interfaceData?: InterfaceData,
  className?: string,
  onSendMessage?: (message: string) => void,
): RendererComponentProps => {
  return {
    content,
    interfaceData,
    className,
    onSendMessage,
  };
};
