export interface NavItem {
  title: string;
  href: string;
  children?: NavItem[];
}

export const mainNavigation: NavItem[] = [
  {
    title: "Documentation",
    href: "/docs",
  },
  {
    title: "Examples",
    href: "/examples",
  },
  {
    title: "GitHub",
    href: "https://github.com/iteebz/agentinterface",
  },
];

export const docsNavigation: NavItem[] = [
  {
    title: "Getting Started",
    href: "/docs",
    children: [
      { title: "Introduction", href: "/docs" },
      { title: "Installation", href: "/docs/installation" },
      { title: "Quick Start", href: "/docs/quickstart" },
    ],
  },
  {
    title: "Core Concepts",
    href: "/docs/primitives",
    children: [
      { title: "Protocol", href: "/docs/primitives/protocol" },
      { title: "Components", href: "/docs/primitives/component" },
      { title: "Response", href: "/docs/primitives/response" },
      { title: "Action", href: "/docs/primitives/action" },
      { title: "Renderer", href: "/docs/primitives/renderer" },
      { title: "Extensions", href: "/docs/primitives/extensions" },
    ],
  },
  {
    title: "Components",
    href: "/docs/components",
    children: [
      { title: "Text", href: "/docs/components/text" },
      { title: "Markdown", href: "/docs/components/markdown" },
      { title: "Image", href: "/docs/components/image" },
      { title: "Button", href: "/docs/components/button" },
      { title: "Form", href: "/docs/components/form" },
      { title: "Card", href: "/docs/components/card" },
      { title: "List", href: "/docs/components/list" },
      { title: "Table", href: "/docs/components/table" },
    ],
  },
  {
    title: "API Reference",
    href: "/docs/api",
    children: [
      { title: "Python API", href: "/docs/api/python" },
      { title: "JavaScript API", href: "/docs/api/javascript" },
    ],
  },
];