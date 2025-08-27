# AGENTINTERFACE ECOSYSTEM - Universal React ↔ Agent Protocol

## 🚀 THE VISION

**Make ANY React component library instantly agent-compatible.**

```typescript
// Any library can adopt ai() protocol
export const Button = ai('button', 'Interactive button', ButtonComponent)
export const Modal = ai('modal', 'Overlay dialog', ModalComponent)  
export const Chart = ai('chart', 'Data visualization', ChartComponent)
```

**Then Python agents get everything:**
```python
import agentinterface as ai

# Works with ANY library using ai() protocol
button = ai.button(text="Click me", variant="primary")    # shadcn/ui
modal = ai.modal(title="Settings", open=True)             # mantine
chart = ai.chart(data=[...], type="line")                 # recharts
```

## 🔌 MAKING YOUR LIBRARY AGENT-COMPATIBLE

### Step 1: Add ai() Wrapper

```bash
npm install agentinterface
```

```typescript
// your-ui-lib/src/Button.tsx
import { ai } from 'agentinterface'

function ButtonComponent({ text, variant, onClick }) {
  return <button className={variant} onClick={onClick}>{text}</button>
}

// 🔥 ONE LINE MAKES IT AGENT-COMPATIBLE
export const Button = ai('button', 'Interactive button with variants', ButtonComponent)
```

### Step 2: Configure package.json

```json
{
  "name": "your-ui-lib",
  "agentinterface": {
    "registry": "./dist/ai-registry.json",
    "components": "./src/components/**/*.tsx"
  }
}
```

### Step 3: Generate Registry (Build Step)

```bash
# Add to your build process
npx agentinterface-extract

# Generates ./dist/ai-registry.json automatically
```

**DONE!** Your library is now agent-compatible.

## 🌍 ECOSYSTEM AUTODISCOVERY

AgentInterface automatically discovers:

### Local Project Components
```
src/components/**/*.tsx     # Your app components
packages/*/src/**/*.tsx     # Monorepo packages  
```

### Node Modules Libraries
```
node_modules/shadcn-ui/     # If has agentinterface config
node_modules/mantine/       # Scans for ai() wrappers
node_modules/my-ui-lib/     # Auto-discovers registries
```

### External Registries
```json
// ai.config.json - Manual registry inclusion
{
  "registries": [
    "./external/custom-registry.json",
    "https://cdn.example.com/ai-registry.json"
  ]
}
```

## 🎯 ECOSYSTEM BENEFITS

### For Library Authors
- **Instant Agent Compatibility**: One wrapper makes components agent-usable
- **Zero Breaking Changes**: Existing APIs unchanged
- **Massive Discoverability**: Python agents find your components automatically
- **Future-Proof**: Standard protocol for agent ↔ UI communication

### For Agent Developers  
- **Universal Interface**: `ai.anything()` works across all libraries
- **Auto-Discovery**: No manual component registration
- **Rich Metadata**: Descriptions and schemas from source libraries
- **Ecosystem Growth**: More libraries = more components automatically

### For End Users
- **Just Works**: Install library → agents can use it immediately  
- **No Configuration**: Auto-discovery handles everything
- **Cross-Library**: Mix components from any ai()-compatible library
- **Future Components**: New libraries automatically available

## 📋 ECOSYSTEM REGISTRY FORMAT

```json
{
  "generated_at": "2025-01-01T00:00:00Z",
  "total_components": 156,
  "sources": {
    "local": ["card", "timeline"],
    "shadcn-ui": ["button", "input", "dialog"],
    "mantine": ["datepicker", "table", "chart"],
    "my-custom-lib": ["chat", "dashboard"]
  },
  "components": {
    "button": {
      "description": "Interactive button with variants",
      "componentName": "ButtonComponent", 
      "file": "node_modules/shadcn-ui/src/button.tsx",
      "source": "shadcn-ui"
    }
  }
}
```

## 🛠️ USAGE EXAMPLES

### Basic Component Creation
```python
import agentinterface as ai

# Simple components
text = ai.text(content="Hello World")
card = ai.card(header="Title", body="Content")
```

### Cross-Library Usage  
```python
# Mix components from different libraries seamlessly
layout = ai.grid(
    items=[
        ai.button(text="Save", variant="primary"),      # shadcn
        ai.datepicker(defaultDate="today"),             # mantine
        ai.chart(data=metrics, type="line")             # recharts
    ]
)
```

### Dynamic Discovery
```python
# See what's available
print(ai.components())  # All components with descriptions
print(ai.sources())     # Components grouped by source library

# Refresh after installing new packages
ai.refresh()
```

## 🔥 THE NETWORK EFFECT

**More libraries adopt ai() → More components available → More agent value → More library adoption**

This creates a **virtuous cycle** where the ecosystem grows exponentially.

**AgentInterface becomes the universal bridge between React ecosystem and AI agents.**

---

**Ready to make your library agent-compatible? Just wrap with `ai()` and join the ecosystem!**