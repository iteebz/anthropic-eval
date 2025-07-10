import {
  Grid,
  Calendar,
  Lightbulb,
  FileText,
  Code,
  Link as LinkIcon,
} from "lucide-react";
import type { FallbackProps } from "./types";
import { FallbackContainer, SkeletonCard } from "./FallbackComponents";

export const ComponentFallbacks = {
  markdown: ({ content }: FallbackProps) => (
    <FallbackContainer
      icon={FileText}
      title="Markdown Render Error"
      content={content}
    >
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <pre className="whitespace-pre-wrap rounded border bg-white p-3 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
          {content.slice(0, 500)}...
        </pre>
      </div>
    </FallbackContainer>
  ),

  project_cards: ({ content }: FallbackProps) => (
    <FallbackContainer
      icon={Grid}
      title="Project Cards Unavailable"
      content={content}
    >
      <SkeletonCard count={2} />
    </FallbackContainer>
  ),

  timeline: ({ content }: FallbackProps) => (
    <FallbackContainer
      icon={Calendar}
      title="Timeline Unavailable"
      content={content}
    >
      <div className="space-y-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex gap-3">
            <div className="size-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1">
              <div className="mb-1 h-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        ))}
      </div>
    </FallbackContainer>
  ),

  key_insights: ({ content }: FallbackProps) => (
    <FallbackContainer
      icon={Lightbulb}
      title="Key Insights Unavailable"
      content={content}
    >
      <div className="space-y-2">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="flex gap-3 rounded border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="size-6 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1">
              <div className="mb-1 h-3 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-2 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        ))}
      </div>
    </FallbackContainer>
  ),

  tech_deep_dive: ({ content }: FallbackProps) => (
    <FallbackContainer
      icon={Code}
      title="Technical Deep Dive Unavailable"
      content={content}
    >
      <div className="space-y-4">
        <div className="h-6 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="rounded border bg-gray-800 p-3">
          <div className="mb-2 h-3 animate-pulse rounded bg-gray-600" />
          <div className="h-3 w-3/4 animate-pulse rounded bg-gray-600" />
        </div>
      </div>
    </FallbackContainer>
  ),

  expandable_detail: ({ content }: FallbackProps) => (
    <FallbackContainer
      icon={FileText}
      title="Expandable Detail Unavailable"
      content={content}
    >
      <div className="space-y-2">
        {Array.from({ length: 2 }, (_, i) => (
          <div
            key={i}
            className="rounded border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="mb-2 h-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </div>
    </FallbackContainer>
  ),

  card_grid: ({ content }: FallbackProps) => (
    <FallbackContainer
      icon={Grid}
      title="Card Grid Unavailable"
      content={content}
    >
      <SkeletonCard count={4} />
    </FallbackContainer>
  ),

  inline_link: ({ content }: FallbackProps) => (
    <FallbackContainer
      icon={LinkIcon}
      title="Inline Links Unavailable"
      content={content}
    >
      <div className="space-y-2">
        {Array.from({ length: 2 }, (_, i) => (
          <div
            key={i}
            className="flex gap-3 rounded border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="size-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1">
              <div className="mb-1 h-3 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-2 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        ))}
      </div>
    </FallbackContainer>
  ),
};
