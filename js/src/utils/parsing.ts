/**
 * Minimal agent response parsing
 */

export function parseAgentResponse(response: string) {
  const typeMatch = response.match(/INTERFACE_TYPE:\s*(\w+)/);
  const dataMatch = response.match(/INTERFACE_DATA:\s*({.*?})/s);
  
  let data = {};
  if (dataMatch) {
    try {
      data = JSON.parse(dataMatch[1]);
    } catch (e) {
      console.warn("Invalid INTERFACE_DATA JSON");
    }
  }

  // Clean content by removing directives
  const content = response
    .replace(/INTERFACE_TYPE:.*?\n/, '')
    .replace(/INTERFACE_DATA:.*?(?=\n\n|\n[A-Z]|\Z)/s, '')
    .trim();

  return {
    interface_type: typeMatch?.[1] || "markdown",
    interface_data: data,
    raw_content: content || response
  };
}
