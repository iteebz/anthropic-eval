/**
 * AIP Component Registry - Auto-magical component discovery and registration
 */

import { 
  CardGrid, 
  CodeSnippet, 
  ContactForm,
  ExpandableSection, 
  ImageGallery,
  InlineReference, 
  KeyInsights, 
  Timeline,
} from '../components/interface'
import { MarkdownRenderer } from '../components/render/MarkdownRenderer'
import type { RendererComponentProps } from '../utils/componentProps'

// Enhanced markdown component with inline component support
const MarkdownComponent = ({ content }: { content?: string }) => (
  <MarkdownRenderer 
    content={content || ''} 
    enableInlineComponents={true}
  />
)

// AIP Core Components - auto-discovered
const AIP_CORE_COMPONENTS: Record<string, React.ComponentType<RendererComponentProps>> = {
  markdown: MarkdownComponent,
  'card-grid': CardGrid,
  'code-snippet': CodeSnippet,
  'contact-form': ContactForm,
  'expandable-section': ExpandableSection,
  'image-gallery': ImageGallery,
  'inline-reference': InlineReference,
  'key-insights': KeyInsights,
  timeline: Timeline,
}

// Extension registry for domain-specific components
const EXTENSION_REGISTRY: Record<string, React.ComponentType<RendererComponentProps>> = {}

/**
 * Register extension components with AIP
 */
export const registerComponents = (components: Record<string, React.ComponentType<RendererComponentProps>>) => {
  Object.assign(EXTENSION_REGISTRY, components)
}

/**
 * Get all registered components (core + extensions)
 */
export const getComponentRegistry = () => {
  return { ...AIP_CORE_COMPONENTS, ...EXTENSION_REGISTRY }
}

/**
 * Check if a component type is valid
 */
export const isValidInterfaceType = (type: string): boolean => {
  const registry = getComponentRegistry()
  return type in registry
}

/**
 * Get component names for each category
 */
export const getComponentTypes = () => {
  return {
    core: Object.keys(AIP_CORE_COMPONENTS),
    extensions: Object.keys(EXTENSION_REGISTRY),
    all: Object.keys(getComponentRegistry())
  }
}

// Export core components for convenience
export { AIP_CORE_COMPONENTS }