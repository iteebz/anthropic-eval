/**
 * AgentInterface Registry - Zero Bullshit
 */

import { buildRegistry, getAgentOptions } from './auto';
import { CoreComponentRegistry } from "../core";

// Plug-and-play integration
export function createAgentInterface(enabledComponents?: string[]) {
  return {
    getOptions: () => getAgentOptions(CoreComponentRegistry, enabledComponents),
    getRegistry: () => buildRegistry(CoreComponentRegistry, enabledComponents)
  };
}