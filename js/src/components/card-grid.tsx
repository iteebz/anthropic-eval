import { ExternalLink, Globe, Hash } from "lucide-react";

import { type CardGridData } from "../types";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { Badge } from "./ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { type RendererComponentProps } from "../react/utils/componentProps";

export function CardGrid({
  content,
  interfaceData,
  className,
  onSendMessage,
}: RendererComponentProps<CardGridData>) {
  const data = interfaceData as CardGridData;
  const cards = data?.cards || [];
  const layout = data?.layout || "grid";
  const columns = data?.columns || 2;

  const getGridClass = () => {
    if (layout === "list") return "grid gap-4";
    if (layout === "masonry")
      return "columns-1 md:columns-2 lg:columns-3 gap-4";

    // Default grid layout
    const colClass =
      {
        1: "grid-cols-1",
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
        5: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
        6: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
      }[columns] || "grid-cols-1 md:grid-cols-2";

    return `grid gap-4 ${colClass}`;
  };

  const getLinkIcon = (type: string) => {
    switch (type) {
      case "external": {
        return <ExternalLink className="size-3" />;
      }
      case "internal": {
        return <Globe className="size-3" />;
      }
      case "action": {
        return <Hash className="size-3" />;
      }
      default: {
        return <ExternalLink className="size-3" />;
      }
    }
  };

  return (
    <div className={className}>
      {content && (
        <div className="mb-4">
          <MarkdownRenderer content={content} />
        </div>
      )}

      {cards.length > 0 && (
        <div className={getGridClass()}>
          {cards.map((card, index) => (
            <Card
              key={index}
              className={`border-zinc-700 bg-gradient-to-br from-zinc-800/30 to-zinc-900/30 transition-all duration-300 hover:scale-[1.02] hover:border-zinc-600 hover:bg-gradient-to-br hover:from-zinc-800/50 hover:to-zinc-900/50 hover:shadow-xl ${
                layout === "masonry" ? "mb-4 break-inside-avoid" : ""
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg text-zinc-100">
                    {card.title}
                    {card.media?.type === "icon" && card.media.url && (
                      <img
                        src={card.media.url}
                        alt={card.media.alt || "Icon"}
                        className="size-5"
                      />
                    )}
                  </CardTitle>
                  {card.metadata?.status && (
                    <Badge
                      variant="secondary"
                      className="border border-blue-600/30 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-blue-400"
                    >
                      {card.metadata.status}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <CardDescription className="mb-3 text-sm text-zinc-300">
                  {card.description}
                </CardDescription>

                {card.media?.type === "image" && card.media.url && (
                  <div className="mb-3 overflow-hidden rounded-lg">
                    <img
                      src={card.media.url}
                      alt={card.media.alt || "Card image"}
                      className="h-auto w-full object-cover"
                    />
                  </div>
                )}

                {card.tags && card.tags.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1">
                    {card.tags.map((tag, tagIndex) => (
                      <Badge
                        key={tagIndex}
                        variant="outline"
                        className="border border-zinc-600/50 bg-gradient-to-r from-zinc-700/50 to-slate-700/50 text-zinc-400 transition-all duration-300 hover:from-zinc-600/50 hover:to-slate-600/50"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {card.links && card.links.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {card.links.map((link, linkIndex) => (
                      <button
                        key={linkIndex}
                        onClick={() => {
                          if (link.type === "action" && onSendMessage) {
                            onSendMessage(`Tell me more about ${card.title}`);
                          } else if (link.url) {
                            window.open(
                              link.url,
                              "_blank",
                              "noopener noreferrer",
                            );
                          }
                        }}
                        className="group inline-flex cursor-pointer items-center gap-2 border-none bg-transparent text-sm text-blue-400 transition-all duration-300 hover:gap-3 hover:text-blue-300"
                      >
                        {link.label}
                        {getLinkIcon(link.type)}
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
