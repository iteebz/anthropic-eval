export interface LoadingStateProps {
  className?: string;
}

export const LoadingState = ({ className = "" }: LoadingStateProps) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
      <div className="h-4 w-1/2 rounded bg-gray-200"></div>
    </div>
  );
};
