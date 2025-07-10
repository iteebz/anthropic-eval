import { type InterfaceType } from "../../core/validation";

export interface ComponentNotFoundProps {
  interfaceType: InterfaceType;
  content: string;
  className?: string;
}

export const ComponentNotFound = ({
  interfaceType,
  content,
  className = "",
}: ComponentNotFoundProps) => {
  return (
    <div
      className={`rounded border border-yellow-200 bg-yellow-50 p-4 ${className}`}
    >
      <h3 className="mb-2 font-medium text-yellow-800">Component Not Found</h3>
      <p className="text-sm text-yellow-700">
        No component registered for interface type: {interfaceType}
      </p>
      <pre className="mt-2 overflow-x-auto rounded bg-yellow-100 p-2 text-xs">
        {content}
      </pre>
    </div>
  );
};
