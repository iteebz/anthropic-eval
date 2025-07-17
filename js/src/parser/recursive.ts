import { z } from 'zod';
import { InterfaceType } from '../types';

// Zod schemas for type-safe parsing
const ComponentTokenSchema = z.object({
  type: z.string(),
  data: z.record(z.any()).optional(),
  content: z.string().optional(),
  children: z.array(z.any()).optional(),
});

const ParsedComponentSchema = z.object({
  type: z.string(),
  data: z.record(z.any()).default({}),
  content: z.string().default(''),
  children: z.array(z.any()).default([]),
  raw: z.string()
});

export type ParsedComponent = z.infer<typeof ParsedComponentSchema>;

export interface ParserOptions {
  maxDepth?: number;
  strictMode?: boolean;
  allowedComponents?: string[];
  customTokens?: Record<string, (data: any) => any>;
}

export class RecursiveComponentParser {
  private readonly maxDepth: number;
  private readonly strictMode: boolean;
  private readonly allowedComponents: Set<string>;
  private readonly customTokens: Record<string, (data: any) => any>;

  constructor(options: ParserOptions = {}) {
    this.maxDepth = options.maxDepth ?? 10;
    this.strictMode = options.strictMode ?? false;
    this.allowedComponents = new Set(options.allowedComponents);
    this.customTokens = options.customTokens ?? {};
  }

  /**
   * Parse component syntax: {{component:data|nested={{other:data}}}}
   */
  parse(input: string, depth: number = 0): ParsedComponent[] {
    if (depth >= this.maxDepth) {
      throw new Error(`Maximum parsing depth of ${this.maxDepth} exceeded`);
    }

    const components: ParsedComponent[] = [];
    const tokenRegex = /\{\{([^}]+)\}\}/g;
    let match;
    let lastIndex = 0;

    while ((match = tokenRegex.exec(input)) !== null) {
      const [fullMatch, tokenContent] = match;
      const startIndex = match.index;

      // Add text before the token
      if (startIndex > lastIndex) {
        const textContent = input.slice(lastIndex, startIndex);
        if (textContent.trim()) {
          components.push(this.createTextComponent(textContent));
        }
      }

      try {
        const parsed = this.parseToken(tokenContent, depth);
        components.push(parsed);
      } catch (error) {
        if (this.strictMode) {
          throw error;
        }
        // In non-strict mode, treat as literal text
        components.push(this.createTextComponent(fullMatch));
      }

      lastIndex = tokenRegex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < input.length) {
      const textContent = input.slice(lastIndex);
      if (textContent.trim()) {
        components.push(this.createTextComponent(textContent));
      }
    }

    return components;
  }

  private parseToken(tokenContent: string, depth: number): ParsedComponent {
    // Split by pipe to separate component definition from nested content
    const [componentDef, ...nestedParts] = tokenContent.split('|');
    const nestedContent = nestedParts.join('|');

    // Parse component definition: "component:data" or "component"
    const [type, dataStr] = componentDef.split(':');
    
    if (!type) {
      throw new Error('Component type is required');
    }

    // Validate component type
    if (this.allowedComponents.size > 0 && !this.allowedComponents.has(type)) {
      throw new Error(`Component type "${type}" is not allowed`);
    }

    // Parse data as JSON or treat as string
    let data: Record<string, any> = {};
    if (dataStr) {
      try {
        data = JSON.parse(dataStr);
      } catch {
        // If not valid JSON, treat as simple key-value
        data = { value: dataStr };
      }
    }

    // Parse nested content recursively
    let children: ParsedComponent[] = [];
    if (nestedContent) {
      children = this.parse(nestedContent, depth + 1);
    }

    // Apply custom token processing
    if (this.customTokens[type]) {
      data = this.customTokens[type](data);
    }

    const component: ParsedComponent = {
      type,
      data,
      content: '', // Will be populated by children
      children,
      raw: `{{${tokenContent}}}`
    };

    // Validate with Zod schema
    return ParsedComponentSchema.parse(component);
  }

  private createTextComponent(text: string): ParsedComponent {
    return {
      type: 'text',
      data: {},
      content: text,
      children: [],
      raw: text
    };
  }

  /**
   * Advanced parsing with slot composition
   */
  parseWithSlots(input: string, slots: Record<string, any> = {}): ParsedComponent[] {
    const components = this.parse(input);
    return this.processSlots(components, slots);
  }

  private processSlots(components: ParsedComponent[], slots: Record<string, any>): ParsedComponent[] {
    return components.map(component => {
      if (component.type === 'slot' && component.data.name) {
        const slotName = component.data.name;
        if (slots[slotName]) {
          return {
            ...component,
            children: Array.isArray(slots[slotName]) ? slots[slotName] : [slots[slotName]]
          };
        }
      }

      // Recursively process children
      if (component.children.length > 0) {
        return {
          ...component,
          children: this.processSlots(component.children, slots)
        };
      }

      return component;
    });
  }

  /**
   * Serialize parsed components back to string
   */
  serialize(components: ParsedComponent[]): string {
    return components.map(component => {
      if (component.type === 'text') {
        return component.content;
      }

      let token = `{{${component.type}`;
      
      if (Object.keys(component.data).length > 0) {
        token += `:${JSON.stringify(component.data)}`;
      }

      if (component.children.length > 0) {
        token += `|${this.serialize(component.children)}`;
      }

      token += '}}';
      return token;
    }).join('');
  }

  /**
   * Validate component structure
   */
  validate(components: ParsedComponent[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    const validateComponent = (component: ParsedComponent, path: string = '') => {
      try {
        ParsedComponentSchema.parse(component);
      } catch (error) {
        errors.push(`Invalid component at ${path}: ${error.message}`);
        return;
      }

      // Validate children recursively
      component.children.forEach((child, index) => {
        validateComponent(child, `${path}.children[${index}]`);
      });
    };

    components.forEach((component, index) => {
      validateComponent(component, `[${index}]`);
    });

    return { valid: errors.length === 0, errors };
  }
}

// Factory function for common use cases
export function createParser(options: ParserOptions = {}): RecursiveComponentParser {
  return new RecursiveComponentParser(options);
}

// Utility functions
export function parseComponent(input: string, options: ParserOptions = {}): ParsedComponent[] {
  const parser = createParser(options);
  return parser.parse(input);
}

export function parseWithValidation(input: string, options: ParserOptions = {}): {
  components: ParsedComponent[];
  validation: { valid: boolean; errors: string[] };
} {
  const parser = createParser(options);
  const components = parser.parse(input);
  const validation = parser.validate(components);
  
  return { components, validation };
}