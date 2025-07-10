/**
 * Interface Data Validation Schemas
 *
 * Re-exports from domain-specific schemas for backward compatibility.
 * Default behavior uses portfolio schemas (core + portfolio components).
 */

// Re-export core schemas
export * from "./core-schemas";


// Re-export portfolio schemas as defaults for backward compatibility
export {
  PORTFOLIO_VALIDATION_SCHEMAS as INTERFACE_VALIDATION_SCHEMAS,
  getPortfolioSafeDefaults as getSafeDefaults,
} from "../portfolio/schemas";
