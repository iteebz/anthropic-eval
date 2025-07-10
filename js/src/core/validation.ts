/**
 * Core validation utilities for AgentInterface data
 */
import { z } from "zod";
import { INTERFACE_VALIDATION_SCHEMAS, getSafeDefaults } from "./schemas";

export type InterfaceType = keyof typeof INTERFACE_VALIDATION_SCHEMAS;

/**
 * Validate UI data against the appropriate schema for the given UI type.
 */
export function validateInterfaceData<T extends InterfaceType>(
  uiType: T,
  uiData: unknown,
):
  | {
      success: true;
      data: z.infer<(typeof INTERFACE_VALIDATION_SCHEMAS)[T]>;
      error: null;
    }
  | {
      success: false;
      data: z.infer<(typeof INTERFACE_VALIDATION_SCHEMAS)[T]>;
      error: string;
    } {
  const schema = INTERFACE_VALIDATION_SCHEMAS[uiType];

  if (!schema) {
    const defaultData = getSafeDefaults(uiType);
    return {
      success: false,
      data: defaultData,
      error: `Unknown UI type: ${uiType}`,
    };
  }

  try {
    const validatedData = schema.parse(uiData);
    return {
      success: true,
      data: validatedData,
      error: null,
    };
  } catch (error) {
    const defaultData = getSafeDefaults(uiType);
    const errorMessage =
      error instanceof z.ZodError
        ? `Validation failed: ${error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`
        : `Validation failed: ${String(error)}`;

    return {
      success: false,
      data: defaultData,
      error: errorMessage,
    };
  }
}

/**
 * Type guard to check if a UI type is valid.
 */
export function isValidInterfaceType(
  interfaceType: string,
): interfaceType is InterfaceType {
  return interfaceType in INTERFACE_VALIDATION_SCHEMAS;
}
