# @agentinterface/devkit

Development tools for building AgentInterface components with zero ceremony.

## Features

### 🔍 Filesystem-Based Component Discovery

Automatically discovers components from your filesystem structure without manual registration.

```typescript
import { ComponentDiscovery } from 'agentinterface/dev';

const discovery = new ComponentDiscovery({
  baseDir: 'src',
  scanDirs: ['components/interface', 'components/render'],
  pattern: /^(?!.*\.(test|spec|d)\.tsx?$).*\.tsx?$/,
  watch: true,
});

await discovery.discover();
const registry = discovery.getRegistry();
```

### 🔥 Hot Reload

Live reload components during development without losing state.

```typescript
import { HotReloadProvider, useHotReload } from 'agentinterface/dev';

function App() {
  return (
    <HotReloadProvider>
      <AgentInterfaceRenderer {...props} />
    </HotReloadProvider>
  );
}

function MyComponent() {
  const hotReload = useHotReload();

  return (
    <button onClick={() => hotReload.reloadAll()}>
      Reload All Components
    </button>
  );
}
```

### 🛠️ Dev Tools Integration

Comprehensive debugging and development utilities.

```typescript
import { AgentInterfaceDevTools } from 'agentinterface/dev';

function App() {
  return (
    <>
      <AgentInterfaceRenderer {...props} />
      <AgentInterfaceDevTools position="bottom-right" />
    </>
  );
}
```

## Quick Start

### 1. Use the Development Renderer

Replace your production renderer with the development version:

```typescript
import { DevAgentInterfaceRenderer } from 'agentinterface/dev';

function App() {
  return (
    <DevAgentInterfaceRenderer
      agentResponse={response}
      components={explicitComponents}
      devConfig={{
        enableDiscovery: true,
        enableHotReload: true,
        enableDevTools: true,
        devToolsPosition: 'bottom-right'
      }}
    />
  );
}
```

### 2. Add Vite Plugin

For optimal development experience, add the Vite plugin:

```typescript
// vite.config.ts
import { agentInterfaceVitePlugin } from 'agentinterface/dev';

export default {
  plugins: [
    agentInterfaceVitePlugin({
      baseDir: 'src',
      scanDirs: ['components/interface', 'components/render'],
      generateManifest: true,
    }),
  ],
};
```

### 3. Create Components

Components are automatically discovered based on file structure:

```
src/
├── components/
│   ├── interface/
│   │   ├── my-custom-component.tsx    # → 'my-custom-component'
│   │   ├── project-card.tsx           # → 'project-card'
│   │   └── timeline.tsx               # → 'timeline'
│   └── render/
│       └── custom-renderer.tsx        # → 'custom-renderer'
```

Component files should export a default React component:

```typescript
// src/components/interface/my-custom-component.tsx

/**
 * Custom component for displaying special content
 */
export default function MyCustomComponent({ content, ...props }) {
  return (
    <div className="custom-component">
      {content}
    </div>
  );
}
```

## Development Tools

### Console Commands

When development mode is enabled, these commands are available in the browser console:

```javascript
// Reload a specific component
agentInterface.reloadComponent('my-component');

// Reload all components
agentInterface.reloadAll();

// Get current registry
agentInterface.getRegistry();
```

### Keyboard Shortcuts

- **Ctrl/Cmd + Shift + R**: Reload all components

### Dev Tools UI

The dev tools provide:

- **Components Tab**: View all discovered components with reload buttons
- **Registry Tab**: Registry information and global controls
- **Errors Tab**: Component errors with retry functionality
- **Performance Tab**: Render performance metrics

## Component Development

### Best Practices

1. **Component Files**: Use kebab-case file names (e.g., `my-component.tsx`)
2. **JSDoc Comments**: Add descriptions for auto-documentation
3. **TypeScript**: Use TypeScript for better development experience
4. **Props Interface**: Define clear prop interfaces

### Component Structure

```typescript
/**
 * Display project information in card format
 */
export interface ProjectCardProps {
  title: string;
  description: string;
  technologies: string[];
  links: { github?: string; demo?: string };
}

export default function ProjectCard({
  title,
  description,
  technologies,
  links
}: ProjectCardProps) {
  return (
    <div className="project-card">
      <h3>{title}</h3>
      <p>{description}</p>
      <div className="technologies">
        {technologies.map(tech => (
          <span key={tech} className="tech-badge">{tech}</span>
        ))}
      </div>
      <div className="links">
        {links.github && <a href={links.github}>GitHub</a>}
        {links.demo && <a href={links.demo}>Demo</a>}
      </div>
    </div>
  );
}
```

### Component Testing

Use the Component Playground for isolated testing:

```typescript
import { ComponentPlayground } from 'agentinterface/dev';

function DevPage() {
  return (
    <ComponentPlayground componentName="project-card" />
  );
}
```

## Configuration

### Development Config

```typescript
interface DevConfig {
  enableDiscovery?: boolean; // Enable filesystem discovery
  enableHotReload?: boolean; // Enable hot reload
  enableDevTools?: boolean; // Enable dev tools UI
  discoveryOptions?: {
    baseDir?: string; // Base directory to scan
    scanDirs?: string[]; // Directories to scan
    pattern?: RegExp; // File pattern to match
  };
  devToolsPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}
```

### Environment Variables

- `NODE_ENV=development`: Enables all development features
- `AGENTINTERFACE_DEV=true`: Force enable development mode

## Production Build

Development features are automatically disabled in production builds. The `DevAgentInterfaceRenderer` falls back to the standard renderer with only explicitly passed components.

## Troubleshooting

### Components Not Discovered

1. Check file paths match `scanDirs` configuration
2. Verify file names match the `pattern` regex
3. Ensure components export a default React component
4. Check console for discovery errors

### Hot Reload Not Working

1. Verify `enableHotReload` is true
2. Check if Vite/webpack dev server is running
3. Look for HMR-related errors in console
4. Try manual reload with `agentInterface.reloadAll()`

### Dev Tools Not Showing

1. Ensure `NODE_ENV=development`
2. Check `enableDevTools` configuration
3. Verify dev tools aren't hidden behind other elements
4. Try different `devToolsPosition` values

## API Reference

See the individual TypeScript files for detailed API documentation:

- `filesystem-discovery.ts`: Component discovery system
- `hot-reload.ts`: Hot reload functionality
- `devtools.tsx`: Development tools UI
- `vite-plugin.ts`: Vite integration
