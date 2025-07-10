export interface EmptyStateProps {
  className?: string;
}

export const EmptyState = ({ className = "" }: EmptyStateProps) => {
  return (
    <div
      className={`rounded border border-gray-200 bg-gray-50 p-4 ${className}`}
    >
      <p className="text-gray-600">No interface configuration available</p>
    </div>
  );
};
