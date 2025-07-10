import React from "react";

export const RawContentDetails = ({ content }: { content: string }) => (
  <details className="mt-3 text-xs text-gray-500">
    <summary className="cursor-pointer">Show raw content</summary>
    <pre className="mt-2 overflow-x-auto rounded border bg-white p-2 dark:bg-gray-800">
      {content.slice(0, 300)}...
    </pre>
  </details>
);

export const SkeletonCard = ({ count = 2 }: { count?: number }) => (
  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
    {Array.from({ length: count }, (_, i) => (
      <div
        key={i}
        className="rounded border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"
      >
        <div className="mb-2 h-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="mb-1 h-3 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-3 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    ))}
  </div>
);

export const FallbackContainer = ({
  icon: Icon,
  title,
  children,
  content,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  content: string;
}) => (
  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
    <div className="mb-3 flex items-center gap-2">
      <Icon className="size-4 text-gray-500" />
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {title}
      </span>
    </div>
    {children}
    <RawContentDetails content={content} />
  </div>
);
