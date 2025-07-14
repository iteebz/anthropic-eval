import { type BlogPostData, type InterfaceProps } from "../../types";
import { MarkdownRenderer } from "../render/MarkdownRenderer";

export function BlogPost({
  content,
  interfaceData,
  className,
}: InterfaceProps) {
  const data = interfaceData as BlogPostData;

  return (
    <div className={className}>
      {data?.title && (
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{data.title}</h1>
          {data.author && (
            <div className="text-sm text-gray-600 mb-1">By {data.author}</div>
          )}
          {data.date && (
            <div className="text-sm text-gray-500">{data.date}</div>
          )}
          {data.summary && (
            <div className="text-gray-700 mt-4 p-4 bg-gray-50 rounded border-l-4 border-blue-500">
              {data.summary}
            </div>
          )}
        </div>
      )}

      <div className="prose max-w-none">
        <MarkdownRenderer content={content} />
      </div>

      {data?.tags && data.tags.length > 0 && (
        <div className="mt-6 pt-4 border-t">
          <div className="flex flex-wrap gap-2">
            {data.tags.map((tag, index) => (
              <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}