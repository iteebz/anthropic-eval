import { z } from 'zod';
import { ComponentMetadata, RegistryEntry } from './builder';

export interface ValidationError {
  component: string;
  field: string;
  message: string;
  value?: any;
}

const MetadataSchema = z.object({
  type: z
    .string()
    .min(1)
    .regex(/^[a-z][a-z0-9-]*[a-z0-9]$/, 'Type must be lowercase kebab-case'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(200, 'Description must be less than 200 characters'),
  schema: z.any().optional(),
  category: z.enum([
    'interface',
    'custom',
    'container',
    'display',
    'input',
    'layout',
  ]),
  tags: z
    .array(z.string())
    .min(1, 'Must have at least one tag')
    .max(10, 'Cannot have more than 10 tags'),
});

export class MetadataValidator {
  constructor() {}

  /**
   * Validate a single component's metadata
   */
  validateMetadata(entry: RegistryEntry): ValidationError[] {
    const errors: ValidationError[] = [];
    const { metadata, type } = entry;

    // Validate metadata structure using Zod
    const result = MetadataSchema.safeParse(metadata);

    if (!result.success) {
      for (const issue of result.error.issues) {
        errors.push({
          component: type,
          field: issue.path.join('.') || 'metadata',
          message: issue.message,
          value: issue.code,
        });
      }
    }

    // Additional custom validations
    errors.push(...this.validateCustomRules(entry));

    return errors;
  }

  /**
   * Validate component data schema using basic JSON Schema checks
   */
  validateComponentSchema(
    schema: unknown,
    componentType: string,
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check for required schema properties
    if (!(schema as any)?.type) {
      errors.push({
        component: componentType,
        field: 'schema.type',
        message: 'Schema must have a type property',
      });
    }

    // Skip properties validation for now - parser needs improvement

    // Validate schema structure is reasonable
    if (typeof schema !== 'object') {
      errors.push({
        component: componentType,
        field: 'schema',
        message: 'Schema must be an object',
      });
    }

    return errors;
  }

  /**
   * Validate all registry entries
   */
  validateAll(entries: RegistryEntry[]): ValidationError[] {
    const allErrors: ValidationError[] = [];
    const typesSeen = new Set<string>();

    for (const entry of entries) {
      // Check for duplicate types
      if (typesSeen.has(entry.type)) {
        allErrors.push({
          component: entry.type,
          field: 'type',
          message: `Duplicate component type: ${entry.type}`,
        });
      }
      typesSeen.add(entry.type);

      // Validate metadata
      allErrors.push(...this.validateMetadata(entry));

      // Validate component schema
      allErrors.push(
        ...this.validateComponentSchema(entry.metadata.schema, entry.type),
      );
    }

    return allErrors;
  }

  /**
   * Custom validation rules
   */
  private validateCustomRules(entry: RegistryEntry): ValidationError[] {
    const errors: ValidationError[] = [];
    const { metadata, type } = entry;

    // Type should match path convention
    const expectedFileName = `${type}.tsx`;
    if (!entry.filePath.endsWith(expectedFileName)) {
      errors.push({
        component: type,
        field: 'type',
        message: `Component type '${type}' should match path '${expectedFileName}'`,
      });
    }

    // Description should not be too generic
    const genericDescriptions = ['component', 'renders', 'displays', 'shows'];

    const hasGenericDescription = genericDescriptions.some((generic) =>
      metadata.description.toLowerCase().startsWith(generic.toLowerCase()),
    );

    if (hasGenericDescription) {
      errors.push({
        component: type,
        field: 'description',
        message: 'Description should be more specific and descriptive',
      });
    }

    // Tags should be lowercase and descriptive
    for (const tag of metadata.tags) {
      if (tag !== tag.toLowerCase()) {
        errors.push({
          component: type,
          field: 'tags',
          message: `Tag '${tag}' should be lowercase`,
        });
      }

      if (tag.length < 3) {
        errors.push({
          component: type,
          field: 'tags',
          message: `Tag '${tag}' is too short (minimum 3 characters)`,
        });
      }
    }

    return errors;
  }

  /**
   * Format validation errors for display
   */
  formatErrors(errors: ValidationError[]): string {
    if (errors.length === 0) {
      return '✓ All components validated successfully';
    }

    const errorsByComponent = errors.reduce(
      (acc, error) => {
        if (!acc[error.component]) {
          acc[error.component] = [];
        }
        acc[error.component].push(error);
        return acc;
      },
      {} as Record<string, ValidationError[]>,
    );

    let output = `❌ Found ${errors.length} validation error(s):\n\n`;

    for (const [component, componentErrors] of Object.entries(
      errorsByComponent,
    )) {
      output += `${component}:\n`;
      for (const error of componentErrors) {
        output += `  • ${error.field}: ${error.message}\n`;
      }
      output += '\n';
    }

    return output;
  }
}
