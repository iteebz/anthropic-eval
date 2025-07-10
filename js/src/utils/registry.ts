/**
 * Registry utilities for AgentInterface components
 */
import React from "react";
import {
  INTERFACE_SCHEMAS,
  type InterfaceType,
  type InterfaceData,
  type Logger,
} from "../core/types";
import type { RendererComponentProps } from "../react/utils/componentProps";

export function renderInterfaceComponent(
  interfaceType: InterfaceType,
  content: string,
  interfaceData: unknown,
  className: string,
  onSendMessage: ((message: string) => void) | undefined,
  ComponentRegistry: Partial<
    Record<
      InterfaceType,
      React.ComponentType<RendererComponentProps<InterfaceData>>
    >
  >,
  logger?: Logger,
) {
  const renderStart = performance.now();

  // Validate UI type first - check if it exists in the registry
  if (!(interfaceType in ComponentRegistry)) {
    logger?.warn("Unknown UI type, falling back to markdown", {
      component: "interfaceRegistry",
      userJourney: { interfaceType, action: "fallbackToMarkdown" },
      error: {
        details: {
          requestedType: interfaceType,
          availableTypes: Object.keys(ComponentRegistry),
        },
      },
    });
    const MarkdownComponent = ComponentRegistry.markdown;
    if (MarkdownComponent) {
      return React.createElement(MarkdownComponent, {
        content,
        className,
        onSendMessage,
      });
    } else {
      // Fallback if markdown component is also not found (should not happen)
      logger?.error("Markdown component not found in registry fallback.", {
        component: "interfaceRegistry",
        userJourney: { interfaceType, action: "markdownComponentNotFound" },
      });
      return null; // Or throw an error, or render a generic error message
    }
  }

  // Validate UI data if provided
  let validatedData: InterfaceData | undefined = undefined;
  if (interfaceData && interfaceType !== "markdown") {
    const schema = INTERFACE_SCHEMAS[interfaceType];
    if (schema) {
      const validation = schema.safeParse(interfaceData);
      if (validation.success) {
        logger?.debug("UI data validated successfully", {
          component: "interfaceRegistry",
          userJourney: { interfaceType, action: "dataValidated" },
        });
        validatedData = validation.data;
      } else {
        logger?.warn("UI data validation failed, using safe defaults", {
          component: "interfaceRegistry",
          userJourney: { interfaceType, action: "dataValidationFailed" },
          error: {
            details: {
              validationError: validation.error,
              originalData: interfaceData,
            },
          },
        });
        // Fallback to a default empty object if validation fails
        validatedData = {} as InterfaceData;
      }
    } else {
      logger?.warn("No schema found for interface type, using raw data", {
        component: "interfaceRegistry",
        userJourney: { interfaceType, action: "noSchemaFound" },
      });
      validatedData = interfaceData as InterfaceData; // Use raw data if no schema
    }
  } else if (interfaceType === "markdown") {
    // Markdown doesn't have specific interfaceData, so it's always undefined
    validatedData = undefined;
  }

  const Component = ComponentRegistry[interfaceType] as React.ComponentType<
    RendererComponentProps<InterfaceData>
  >;

  const renderTime = performance.now() - renderStart;
  if (logger && logger.uiRender) {
    logger.uiRender(interfaceType, renderTime, {
      userJourney: { interfaceType },
      performance: { renderTime },
    });
  }

  return React.createElement(Component, {
    content,
    interfaceData: validatedData,
    className,
    onSendMessage,
  });
}
