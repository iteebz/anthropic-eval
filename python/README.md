# AgentInterface Python

AI agents choose UI components. Zero ceremony.

```python
from agentinterface import get_interface_options

# Agent gets clean options
options = get_interface_options(['markdown', 'card_grid', 'timeline'])

# Returns:
# markdown: Default text/conversation  
# card_grid: Multiple items as visual cards
# timeline: Chronological events
```

## Usage

```python
# All components
all_options = get_interface_options()

# Opt-in subset (prevents prompt explosion) 
filtered_options = get_interface_options(['markdown', 'timeline'])
```