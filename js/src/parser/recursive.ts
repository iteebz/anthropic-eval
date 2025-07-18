import { z } from 'zod';
import { InterfaceType } from '../types';

// Zod schemas for type-safe parsing
const ComponentTokenSchema = z.object({
  type: z.string(),
  data: z.record(z.any()).optional(),
  content: z.string().optional(),
  children: z.array(z.any()).optional(),
});

const InterfaceComponentSchema = z.object({
  type: z.string(),
  data: z.record(z.any()).default({}),
  content: z.string().default(''),
  children: z.array(z.any()).default([]),
  raw: z.string()
});

export type InterfaceComponent = z.infer<typeof InterfaceComponentSchema>;

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
  parse(input: string, depth: number = 0): InterfaceComponent[] {
    if (depth >= this.maxDepth) {
      throw new Error(`Maximum parsing depth of ${this.maxDepth} exceeded`);
    }

    const components: InterfaceComponent[] = [];
    const tokens = this.tokenize(input);
    
    for (const token of tokens) {
      if (token.type === 'text') {
        if (token.content.trim()) {
          components.push(this.createTextComponent(token.content));
        }
      } else if (token.type === 'component') {
        try {
          const parsed = this.parseToken(token.content, depth);
          components.push(parsed);
        } catch (error) {
          if (this.strictMode) {
            throw error;
          }
          // In non-strict mode, treat as literal text
          components.push(this.createTextComponent(`{{${token.content}}}`));
        }
      }
    }

    return components;
  }

  /**
   * Tokenize input handling nested braces properly
   */
  private tokenize(input: string): Array<{type: 'text' | 'component', content: string}> {
    const tokens: Array<{type: 'text' | 'component', content: string}> = [];
    let i = 0;
    let currentText = '';

    while (i < input.length) {
      if (input[i] === '{' && input[i + 1] === '{') {
        // Found start of component token
        if (currentText) {
          tokens.push({ type: 'text', content: currentText });
          currentText = '';
        }

        // Find matching closing braces
        let braceCount = 1;
        let j = i + 2;
        let tokenContent = '';

        while (j < input.length && braceCount > 0) {
          if (input[j] === '{' && input[j + 1] === '{') {
            braceCount++;
            tokenContent += input[j] + input[j + 1];
            j += 2;
          } else if (input[j] === '}' && input[j + 1] === '}') {
            braceCount--;
            if (braceCount > 0) {
              tokenContent += input[j] + input[j + 1];
            }
            j += 2;
          } else {
            tokenContent += input[j];
            j++;
          }
        }

        if (braceCount === 0) {
          tokens.push({ type: 'component', content: tokenContent });
          i = j;
        } else {
          // Unmatched braces, treat as text
          currentText += input[i];
          i++;
        }
      } else {
        currentText += input[i];
        i++;
      }
    }

    if (currentText) {
      tokens.push({ type: 'text', content: currentText });
    }

    return tokens;
  }

  private parseToken(tokenContent: string, depth: number): InterfaceComponent {
    // Split by pipe to separate component definition from nested content
    const [componentDef, ...nestedParts] = tokenContent.split('|');
    const nestedContent = nestedParts.join('|');

    // Parse component definition: "component:data" or "component"
    // Handle JSON properly by finding the first colon, not splitting on all colons
    const colonIndex = componentDef.indexOf(':');
    let type: string;
    let dataStr: string | undefined;
    
    if (colonIndex === -1) {
      type = componentDef;
      dataStr = undefined;
    } else {
      type = componentDef.substring(0, colonIndex);
      dataStr = componentDef.substring(colonIndex + 1);
    }
    
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
    let children: InterfaceComponent[] = [];
    if (nestedContent) {
      children = this.parse(nestedContent, depth + 1);
    }

    // Apply custom token processing
    if (this.customTokens[type]) {
      data = this.customTokens[type](data);
    }

    const component: InterfaceComponent = {
      type,
      data,
      content: '', // Will be populated by children
      children,
      raw: `{{${tokenContent}}}`
    };

    // Validate with Zod schema
    return InterfaceComponentSchema.parse(component);
  }

  private createTextComponent(text: string): InterfaceComponent {
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
  parseWithSlots(input: string, slots: Record<string, any> = {}): InterfaceComponent[] {
    const components = this.parse(input);
    return this.processSlots(components, slots);
  }

  private processSlots(components: InterfaceComponent[], slots: Record<string, any>): InterfaceComponent[] {
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
  serialize(components: InterfaceComponent[]): string {
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
  validate(components: InterfaceComponent[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    const validateComponent = (component: InterfaceComponent, path: string = '') => {
      try {
        InterfaceComponentSchema.parse(component);
      } catch (error) {
        errors.push(`Invalid component at ${path}: ${(error as Error).message}`);
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
export function parseComponent(input: string, options: ParserOptions = {}): InterfaceComponent[] {
  const parser = createParser(options);
  return parser.parse(input);
}

export function parseWithValidation(input: string, options: ParserOptions = {}): {
  components: InterfaceComponent[];
  validation: { valid: boolean; errors: string[] };
} {
  const parser = createParser(options);
  const components = parser.parse(input);
  const validation = parser.validate(components);
  
  return { components, validation };
}