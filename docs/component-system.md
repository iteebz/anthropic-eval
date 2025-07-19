# AIP Component System - Developer Guide

## Overview

The Agent Interface Protocol (AIP) uses a **unified registry system** for maximum extensibility and zero-ceremony component registration. Components are beautiful, dark-mode aware, and use shadcn/ui + Tailwind semantic colors.

## Architecture Principles

- **Magical Registration**: Import component file → auto-registers via side effects
- **Zero Ceremony**: No manual wiring, no configuration files
- **Type Safety**: Zod schemas with runtime validation
- **Dark Mode Native**: Tailwind semantic colors adapt automatically
- **Shadcn Integration**: Use proven UI components where possible
- **Structured Interactivity**: JSON payloads via `onSendMessage`

## Adding a New Component

### 1. Create Component File

```typescript
// src/components/interface/my-awesome-component.tsx
import React from 'react';
import { z } from 'zod';
import { registerComponent } from '../../registry/unified';
import { Card, CardContent } from '../ui/card';

const MyAwesomeSchema = z.object({
  title: z.string(),
  items: z.array(z.string()),
  className: z.string().optional(),
  onSendMessage: z.function().optional() // For interactivity
});

type MyAwesomeData = z.infer<typeof MyAwesomeSchema>;

export function MyAwesome(props: MyAwesomeData) {
  const { title, items, className, onSendMessage } = props;

  return (
    <Card className={className}>
      <CardContent>
        <h3 className="font-semibold mb-3">{title}</h3>
        <div className="space-y-2">
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => onSendMessage?.(JSON.stringify({
                type: 'item-selected',
                item,
                index: i
              }))}
              className="block w-full text-left p-2 rounded border hover:bg-muted/50"
            >
              {item}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// 🪄 MAGICAL REGISTRATION - No manual wiring needed!
registerComponent({
  type: 'my-awesome-component',
  schema: MyAwesomeSchema,
  render: MyAwesome
});
```

### 2. Import in Auto-Discovery (Folio)

```typescript
// folio/web/src/components/registry-discovery.ts
import '../../../../agentinterface/js/src/components/interface/my-awesome-component';
```

### 3. Use in Agent Responses

```json
{
  "type": "my-awesome-component",
  "data": {
    "title": "Choose Your Adventure",
    "items": ["Option A", "Option B", "Option C"]
  }
}
```

**That's it.** No build steps, no manual registration, no configuration files.

## Design System Guidelines

### Colors & Dark Mode

Use Tailwind **semantic colors** that automatically adapt:

```typescript
// ✅ BEAUTIFUL - Adapts to dark mode
"text-muted-foreground"     // Secondary text
"bg-muted"                  // Subtle backgrounds
"border-border"             // Default borders
"text-primary"              // Primary actions
"bg-primary/10"             // Subtle primary tints
"text-destructive"          // Errors
"bg-emerald-50 dark:bg-emerald-950/20" // Success states

// ❌ BULLSHIT - Hardcoded colors
"text-gray-600"
"bg-blue-50"
"border-red-500"
```

### Shadcn Components

Use shadcn components for consistency:

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';

// Beautiful, consistent, accessible
<Card>
  <CardHeader>
    <CardTitle>Perfect</CardTitle>
  </CardHeader>
  <CardContent>
    <Badge variant="secondary">Status</Badge>
  </CardContent>
</Card>
```

### Spacing & Layout

```typescript
// ✅ Consistent spacing
"space-y-3"      // Vertical stack spacing
"gap-4"          // Grid/flex gaps
"p-4"            // Padding
"mb-4"           // Margins

// ✅ Responsive design
"grid gap-4 md:grid-cols-2"
"text-sm md:text-base"
```

## Interactivity Pattern

### Adding Interactive Behavior

1. **Add `onSendMessage` to schema**:
```typescript
const MySchema = z.object({
  // ... other props
  onSendMessage: z.function().optional()
});
```

2. **Send structured JSON on interactions**:
```typescript
onClick={() => onSendMessage?.(JSON.stringify({
  type: 'action-name',
  data: { /* structured payload */ }
}))}
```

3. **Agent receives structured data** for follow-up responses

### Example Interactive Patterns

```typescript
// Button click
onSendMessage(JSON.stringify({
  type: 'button-clicked',
  buttonId: 'save',
  context: formData
}));

// Form submission
onSendMessage(JSON.stringify({
  type: 'form-submitted',
  formData,
  status: 'success'
}));

// Selection change
onSendMessage(JSON.stringify({
  type: 'selection-changed',
  selectedId: item.id,
  selectedValue: item.value
}));
```

## Registry Internals

### Core Registry Functions

```typescript
// Register component (called automatically via imports)
registerComponent<T>({
  type: string,           // Unique component identifier
  schema?: ZodSchema<T>,  // Optional runtime validation
  render: (props: T) => JSX.Element
});

// Render component (used by UnifiedRenderer)
renderAIPComponent({
  type: string,
  data: any
}): JSX.Element | null
```

### Validation & Error Handling

- **Schema validation**: Optional Zod schemas provide runtime type safety
- **Graceful degradation**: Unknown components show helpful fallback UI
- **Error boundaries**: Validation failures show clear error messages
- **Dev experience**: Console warnings for missing registrations

## File Organization

```
agentinterface/js/src/
├── components/
│   ├── interface/           # 🎯 All AIP components here
│   │   ├── card-grid.tsx
│   │   ├── decision-tree.tsx
│   │   └── my-awesome-component.tsx
│   ├── ui/                  # Shadcn components
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   └── collapsible.tsx
│   └── UnifiedRenderer.tsx  # Main renderer
├── registry/
│   └── unified.ts          # Core registry logic
└── index.ts               # Public exports

folio/web/src/components/
└── registry-discovery.ts   # Auto-discovery imports
```

## Examples & Patterns

### Simple Display Component

```typescript
// Read-only data display
export function MetricCard({ title, value, trend, className }: MetricCardData) {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">{title}</span>
          <span className={trend > 0 ? 'text-emerald-600' : 'text-destructive'}>
            {trend > 0 ? '↗' : '↘'}
          </span>
        </div>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
```

### Interactive Component

```typescript
// Component with user interactions
export function QuickActions({ actions, onSendMessage }: QuickActionsData) {
  return (
    <div className="grid gap-2 md:grid-cols-3">
      {actions.map(action => (
        <button
          key={action.id}
          onClick={() => onSendMessage?.(JSON.stringify({
            type: 'quick-action',
            actionId: action.id,
            actionLabel: action.label
          }))}
          className="p-3 border rounded-md hover:bg-muted/50 transition-colors"
        >
          <span className="text-lg mr-2">{action.icon}</span>
          {action.label}
        </button>
      ))}
    </div>
  );
}
```

### Complex Layout Component

```typescript
// Multi-section component with nested content
export function Dashboard({ sections, className }: DashboardData) {
  return (
    <div className={cn("grid gap-6 md:grid-cols-2", className)}>
      {sections.map(section => (
        <Card key={section.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>{section.icon}</span>
              {section.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {section.metrics.map(metric => (
              <div key={metric.key} className="flex justify-between py-2">
                <span className="text-muted-foreground">{metric.label}</span>
                <span className="font-medium">{metric.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

## Best Practices

### Component Design

1. **Single Responsibility**: Each component does one thing well
2. **Composable**: Can be combined with other components
3. **Accessible**: Proper ARIA labels, keyboard navigation
4. **Responsive**: Works on mobile and desktop
5. **Themeable**: Uses semantic colors, respects user preferences

### Schema Design

```typescript
// ✅ Good schema design
const GoodSchema = z.object({
  // Required data
  title: z.string(),
  items: z.array(ItemSchema),
  
  // Optional configuration
  variant: z.enum(['default', 'compact', 'detailed']).optional(),
  showActions: z.boolean().optional(),
  
  // Standard props
  className: z.string().optional(),
  onSendMessage: z.function().optional()
});

// ❌ Avoid overly complex schemas
const OvercomplexSchema = z.object({
  // Too many required fields
  config: z.object({
    advanced: z.object({
      nested: z.object({
        tooDeep: z.string()
      })
    })
  })
});
```

### Performance Considerations

- **Lazy Loading**: Components register on import (side effects)
- **Tree Shaking**: Only imported components are bundled
- **Memoization**: Use `React.memo` for expensive renders
- **Bundle Size**: Prefer lightweight dependencies

## Migration Guide

### Converting Legacy Components

1. **Replace hardcoded colors** with semantic Tailwind classes
2. **Extract shadcn components** where applicable
3. **Add proper TypeScript types** and Zod schemas
4. **Implement structured interactivity** via `onSendMessage`
5. **Update registration** to use unified registry

### Before/After Example

```typescript
// ❌ BEFORE - Legacy style
<div className="border rounded bg-gray-50 p-4">
  <h3 className="text-gray-900 font-medium">{title}</h3>
  <p className="text-gray-600 text-sm">{description}</p>
</div>

// ✅ AFTER - Beautiful, semantic
<Card>
  <CardContent>
    <CardTitle>{title}</CardTitle>
    <p className="text-muted-foreground text-sm">{description}</p>
  </CardContent>
</Card>
```

This system gives you **maximum flexibility** with **zero ceremony**. Components just work. 🪄