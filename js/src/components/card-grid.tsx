import { type CardGridData } from "../types";
import { MarkdownRenderer } from "./MarkdownRenderer";

export interface InterfaceProps {
  content: string;
  interfaceData?: CardGridData;
  className?: string;
  onSendMessage?: (message: string) => void;
}

export function CardGrid({
  content,
  interfaceData,
  className,
  onSendMessage,
}: InterfaceProps) {
  const data = interfaceData as CardGridData;
  const cards = data?.cards || [];

  return (
    <div className={className}>
      {content && (
        <div className="mb-4">
          <MarkdownRenderer content={content} />
        </div>
      )}

      {cards.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {cards.map((card, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="font-medium mb-2">{card.title}</div>
              <div className="text-sm text-gray-600 mb-3">{card.description}</div>
              
              {card.tags && card.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {card.tags.map((tag, tagIndex) => (
                    <span key={tagIndex} className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {card.links && card.links.length > 0 && (
                <div className="flex gap-2">
                  {card.links.map((link, linkIndex) => (
                    <button
                      key={linkIndex}
                      onClick={() => {
                        if (link.type === "action" && onSendMessage) {
                          onSendMessage(`Tell me more about ${card.title}`);
                        } else if (link.url) {
                          window.open(link.url, "_blank", "noopener noreferrer");
                        }
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}