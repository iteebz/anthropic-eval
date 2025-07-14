/**
 * AgentInterface Registry - Zero Bullshit
 */

export { buildRegistry, getAgentOptions, type ComponentInfo } from './auto';

// Plug-and-play integration
export function createAgentInterface(enabledComponents?: string[]) {
  return {
    getOptions: () => getAgentOptions(enabledComponents),
    getRegistry: () => buildRegistry('./components', enabledComponents)
  };
}