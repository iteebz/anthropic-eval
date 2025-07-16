import React from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import type { SyntaxHighlighterProps } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import remarkGfm from "remark-gfm";
import { remarkInlineComponents, InlineComponent } from "../../core/remark-inline-components";
import type { ComponentResolver } from "../../core/inline-components";

import { cn } from "../../lib/utils";

interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
  children?: React.ReactNode;
  node?: unknown;
}

interface MarkdownRendererProps {
  content: string;
  className?: string;
  onSendMessage?: (message: string) => void;
  componentResolver?: ComponentResolver;
  enableInlineComponents?: boolean;
}

export function MarkdownRenderer({
  content,
  className = "",
  componentResolver,
  enableInlineComponents = false,
}: MarkdownRendererProps) {
  const components: Components = {
    // Handle code blocks with syntax highlighting
    code({ node: _, className, children, ...props }: CodeProps) {
      const match = /language-(\w+)/.exec(className || "");

      // If it's a code block with a language specified
      if (match) {
        return (
          <div className="my-4 overflow-hidden rounded-lg">
            <div className="border-b border-zinc-700 bg-zinc-800 px-4 py-2 text-xs text-zinc-400">
              {match[1]}
            </div>
            <SyntaxHighlighter
              style={vscDarkPlus as SyntaxHighlighterProps["style"]}
              language={match[1]}
              PreTag="div"
              showLineNumbers={false}
              customStyle={{
                margin: 0,
                padding: "1rem",
                background: "#1e1e1e",
                fontSize: "0.875rem",
                lineHeight: "1.5",
              }}
              codeTagProps={{
                style: {
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                },
              }}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          </div>
        );
      }

      // If it's inline code
      return (
        <code
          className={cn(
            "px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 text-sm font-mono",
            className,
          )}
          {...props}
        >
          {children}
        </code>
      );
    },
    // Style links
    a({ href, children }: { href?: string; children?: React.ReactNode }) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 transition-colors hover:text-blue-300 hover:underline"
        >
          {children}
        </a>
      );
    },
    // Style blockquotes
    blockquote({ children }: { children?: React.ReactNode }) {
      return (
        <blockquote className="my-2 border-l-2 border-zinc-600 pl-3 italic text-zinc-400">
          {children}
        </blockquote>
      );
    },
    // Style headings with proper spacing
    h1({ children }: { children?: React.ReactNode }) {
      return <h1 className="mb-2 mt-3 text-xl font-bold">{children}</h1>;
    },
    h2({ children }: { children?: React.ReactNode }) {
      return <h2 className="mb-1.5 mt-2.5 text-lg font-bold">{children}</h2>;
    },
    h3({ children }: { children?: React.ReactNode }) {
      return <h3 className="mb-1 mt-2 text-base font-semibold">{children}</h3>;
    },
    h4({ children }: { children?: React.ReactNode }) {
      return <h4 className="mb-1 mt-2 text-sm font-semibold">{children}</h4>;
    },
    // Style paragraphs with reduced spacing
    p({ children }: { children?: React.ReactNode }) {
      return <p className="my-1.5 leading-snug">{children}</p>;
    },
    // Handle inline components
    InlineComponent({ config, resolved }: { config: string; resolved?: string }) {
      return <InlineComponent config={config} resolved={resolved} />;
    },
  };

  // Setup remark plugins
  const remarkPlugins = [remarkGfm];
  if (enableInlineComponents && componentResolver) {
    remarkPlugins.push([remarkInlineComponents, { resolver: componentResolver }]);
  }

  return (
    <div
      className={cn(
        "prose dark:prose-invert max-w-none prose-p:my-1.5 prose-headings:my-2",
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
