/**
 * Agent response parsing utilities
 */

export interface ParsedResponse {
  thinking?: string;
  response?: string;
  interface_type?: string;
  interface_data?: unknown;
  raw_content: string;
}

export function parseAgentResponse(agentResponse: string): ParsedResponse {
  const lines = agentResponse.split("\n");
  let thinking: string | undefined;
  let response: string | undefined;
  let interface_type: string | undefined;
  let interface_data: unknown;

  const contentLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("THINKING:")) {
      thinking = trimmed.replace("THINKING:", "").trim();
    } else if (trimmed.startsWith("RESPONSE:")) {
      response = trimmed.replace("RESPONSE:", "").trim();
    } else if (trimmed.startsWith("INTERFACE_TYPE:")) {
      interface_type = trimmed.replace("INTERFACE_TYPE:", "").trim();
    } else if (trimmed.startsWith("INTERFACE_DATA:")) {
      try {
        const dataStr = trimmed.replace("INTERFACE_DATA:", "").trim();
        interface_data = JSON.parse(dataStr);
      } catch (e) {
        console.warn("Failed to parse INTERFACE_DATA:", e);
        interface_data = undefined;
      }
    } else if (
      !trimmed.startsWith("THINKING:") &&
      !trimmed.startsWith("RESPONSE:") &&
      !trimmed.startsWith("INTERFACE_TYPE:") &&
      !trimmed.startsWith("INTERFACE_DATA:")
    ) {
      contentLines.push(line);
    }
  }

  return {
    thinking,
    response,
    interface_type,
    interface_data,
    raw_content: contentLines.join("\n").trim() || agentResponse,
  };
}

export function extractInterfaceConfig(agentResponse: string): {
  type: string;
  data: unknown;
  content: string;
} {
  const parsed = parseAgentResponse(agentResponse);

  return {
    type: parsed.interface_type || "markdown",
    data: parsed.interface_data || {},
    content: parsed.response || parsed.raw_content,
  };
}
