# AgentInterface Extensibility

## Overview

AgentInterface uses build-time component discovery for SSR-safe extensibility. Components are discovered through configuration and built into a complete registry at build time, ensuring predictable behavior in server-side rendering environments.

## Core Principles

1. **Build-Time Composition** - Components discovered at build time, not runtime
2. **SSR-Safe** - Predictable behavior in server-side rendering
3. **Configuration-Based** - Extensibility through config files
4. **Type Safe** - Full TypeScript support with JSON Schema
5. **Build-Time Optimization** - Tree-shaking and bundler-friendly

## Convention Over Configuration

AgentInterface follows a standardized directory convention - **no configuration files needed**.

### Standard Directory Structure

```
src/
├── components/
│   ├── aip/                 # Agent Interface Protocol components (STANDARDIZED)
│   │   ├── custom-chart.tsx
│   │   ├── project-list.tsx
│   │   └── data-table.tsx
│   └── ui/                  # Regular React components
│       ├── button.tsx
│       └── modal.tsx
```

### Clear Separation of Concerns

- `src/components/aip/` → Agent Interface Protocol components (discoverable by agents)
- `src/components/ui/` → Regular React components (internal use)

This mirrors established conventions:

- `src/pages/` (Next.js)
- `src/routes/` (Remix)
- `src/lib/` (utilities)

### Ecosystem Benefits

The `/aip` namespace enables ecosystem-wide tooling:

- **VS Code extensions** can recognize and provide IntelliSense for AIP components
- **Linters** can have special rules for AIP component validation
- **Documentation tools** can auto-generate component galleries from `/aip` folders
- **Package managers** can discover and index AIP components automatically
- **Build tools** can optimize AIP component bundles separately

**Brand Recognition**: As AIP becomes the standard protocol for agent-UI communication, `src/components/aip/` becomes the recognized convention across the ecosystem.

## Component Definition Pattern

### JSON Schema + Metadata Export

```typescript
// src/components/aip/custom-chart.tsx
import React from "react";

// JSON Schema - directly serializable
export const CustomChartSchema = {
  type: "object",
  properties: {
    data: {
      type: "array",
      items: {
        type: "object",
        properties: {
          label: { type: "string" },
          value: { type: "number" },
        },
        required: ["label", "value"],
      },
    },
    chartType: {
      type: "string",
      enum: ["bar", "line", "pie"],
    },
  },
  required: ["data", "chartType"],
} as const;

// Component metadata - discoverable by build script
export const metadata = {
  type: "custom-chart",
  description: "Interactive chart with multiple visualization types",
  schema: CustomChartSchema,
  category: "custom",
  tags: ["chart", "visualization", "data"],
} as const;

// TypeScript type inference
type CustomChartProps = {
  data: Array<{ label: string; value: number }>;
  chartType: "bar" | "line" | "pie";
};

export function CustomChart({ data, chartType }: CustomChartProps) {
  return <div className="custom-chart">{/* Chart implementation */}</div>;
}
```

## Build Process

### CLI Command

```bash
# Build registry from standard path
npx agentinterface build

# Always scans: src/components/aip/
# Output: ./agentinterface-registry.json
```

### Build Script Integration

The build script scans all configured paths and generates a complete registry:

```javascript
// Simplified build process
import { glob } from "glob";
import { readFile, writeFile } from "fs/promises";

async function buildRegistry(config) {
  const registry = { version: "0.1.0", components: {} };

  // Scan all configured component paths
  for (const pattern of config.components) {
    const files = await glob(pattern);

    for (const file of files) {
      const content = await readFile(file, "utf8");

      // Extract metadata export
      const metadataMatch = content.match(
        /export const metadata = ({[\s\S]*?}) as const/
      );
      if (metadataMatch) {
        const metadata = eval(`(${metadataMatch[1]})`);
        registry.components[metadata.type] = metadata;
      }
    }
  }

  await writeFile(config.output, JSON.stringify(registry, null, 2));
}
```

## Framework Integration

### Next.js

```javascript
// next.config.js
const { execSync } = require("child_process");

module.exports = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Build registry during server build
      execSync("npx agentinterface build");
    }
    return config;
  },
};
```

### Vite

```javascript
// vite.config.js
import { defineConfig } from "vite";
import { execSync } from "child_process";

export default defineConfig({
  plugins: [
    {
      name: "agentinterface-build",
      buildStart() {
        execSync("npx agentinterface build");
      },
    },
  ],
});
```

### Webpack

```javascript
// webpack.config.js
const { execSync } = require("child_process");

module.exports = {
  plugins: [
    {
      apply: (compiler) => {
        compiler.hooks.beforeRun.tap("AgentInterfaceBuild", () => {
          execSync("npx agentinterface build");
        });
      },
    },
  ],
};
```

## Usage

### Frontend (React)

```typescript
// Components are automatically available after build
import { AIPRenderer } from "agentinterface";

function App() {
  return <AIPRenderer response={agentResponse} />;
}
```

### Backend (Python)

```python
from agentinterface import get_format_instructions, aip_response

# Get all available components (core + custom)
instructions = get_format_instructions()
# Now includes: timeline, markdown, custom-chart, etc.

# Use custom component
response = aip_response("custom-chart", {
    "data": [{"label": "Q1", "value": 100}],
    "chartType": "bar"
})
```

## NPM Package Extensions

### Creating Extension Packages

```typescript
// @my-org/chart-components/src/components/aip/bar-chart.tsx
export const metadata = {
  type: "bar-chart",
  description: "Horizontal bar chart with animations",
  schema: BarChartSchema,
  category: "extension",
} as const;

export function BarChart(props) {
  return <div className="bar-chart">...</div>;
}
```

```json
// @my-org/chart-components/package.json
{
  "name": "@my-org/chart-components",
  "agentinterface": {
    "components": "./src/components/aip/**/*.tsx"
  }
}
```

### Using Extension Packages

```javascript
// agentinterface.config.js
export default {
  components: [
    // Automatically discover from package.json
    "@my-org/chart-components",

    // Or specify explicit paths
    "@my-org/chart-components/src/**/*.tsx",
  ],
};
```

## Development Workflow

### 1. Create Component

```typescript
// src/components/aip/my-component.tsx
export const metadata = {
  type: "my-component",
  description: "My custom component",
  schema: MySchema,
} as const;

export function MyComponent(props) {
  return <div>...</div>;
}
```

### 2. Update Config

```javascript
// agentinterface.config.js
export default {
  components: [
    "./src/components/**/*.tsx", // Includes new component
  ],
};
```

### 3. Build Registry

```bash
npx agentinterface build
```

### 4. Test

```typescript
// Component automatically available
<AIPRenderer response={{
  type: "my-component",
  data: { ... }
}} />
```

## Registry Output

The build process generates a complete registry file:

```json
{
  "version": "0.1.0",
  "components": {
    "markdown": {
      "type": "markdown",
      "description": "Rich text with formatting",
      "schema": { ... },
      "category": "core"
    },
    "custom-chart": {
      "type": "custom-chart",
      "description": "Interactive chart component",
      "schema": { ... },
      "category": "custom"
    }
  }
}
```

## Benefits

### SSR-Safe

- All components known at build time
- No runtime registration race conditions
- Predictable server-side rendering

### Performance

- Build-time optimization
- Tree-shaking friendly
- No runtime discovery overhead

### Type Safety

- Full TypeScript support
- Schema validation at build time
- Compile-time error checking

### Extensibility

- Configuration-based extension
- NPM package support
- Third-party component libraries

This build-time approach ensures reliable behavior across all deployment environments while maintaining clean extensibility patterns.
