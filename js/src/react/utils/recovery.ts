import type { InterfaceType } from "../../core/validation";

export const getRecoveryMessage = (interfaceType: InterfaceType): string => {
  const messages: Partial<Record<InterfaceType, string>> = {
    markdown: "The content will be displayed as plain text instead.",
    timeline: "Timeline events couldn't be rendered. Check data format.",
    key_insights: "Insights couldn't be displayed. Verify data structure.",
    tech_deep_dive:
      "Technical content couldn't be rendered. Check code examples.",
    expandable_detail:
      "Expandable sections couldn't be created. Content may be too large.",
    inline_link: "Reference links couldn't be displayed. Check reference data.",
    card_grid: "Card grid couldn't be displayed. Check data format.",
  };

  return (
    messages[interfaceType] ||
    "The content will be displayed in a simplified format."
  );
};

export const categorizePerformanceImpact = (
  ms: number,
): "low" | "medium" | "high" => {
  if (ms < 16) return "low"; // < 1 frame at 60fps
  if (ms < 100) return "medium"; // < 100ms
  return "high"; // > 100ms
};
