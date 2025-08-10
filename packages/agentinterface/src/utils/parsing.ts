/**
 * Explicit AIP response parsing - Pure JSON
 */

export function parseAgentResponse(response: string) {
  try {
    // Try direct JSON parse first
    const config = JSON.parse(response);
    return {
      interface_type: config.type || 'markdown',
      interface_data: config.props || {},
      raw_content: config.content || '',
    };
  } catch {
    // Fallback to markdown for non-JSON responses
    return {
      interface_type: 'markdown',
      interface_data: {},
      raw_content: response,
    };
  }
}
