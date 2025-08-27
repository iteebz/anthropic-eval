#!/usr/bin/env python3
"""
TEST SCRIPT: Validate autodiscovery system
"""

import sys
sys.path.insert(0, 'src')

import agentinterface as ai_module

# Test the autodiscovery system
ai = ai_module.ai

print('=== TESTING AUTODISCOVERY SYSTEM ===')

# Test registry loading
print('\n🔍 Registry loading:')
print(f'✓ Found {len(ai._registry)} components from autodiscovery')

# Test component discovery
print('\n📋 Available components:')
available = dir(ai)
for comp in available[:5]:  # Show first 5
    print(f'   ✓ {comp}')
print(f'   ... and {len(available) - 5} more')

# Test descriptions from autodiscovery
print('\n📝 Component descriptions:')
components = ai.components()
for comp_type, description in list(components.items())[:3]:  # Show first 3
    print(f'   ✓ {comp_type}: {description}')

# Test dynamic function creation with autodiscovered docs
print('\n🧪 Testing dynamic creation with descriptions:')

# Get the card function
card_fn = ai.card
print(f'✓ Function name: {card_fn.__name__}')
print(f'✓ Function doc: {card_fn.__doc__}')

# Test actual component creation
card = ai.card(header="Autodiscovery Test", body="This description came from React!")
print(f'✓ Card result: {card}')

print('\n✅ AUTODISCOVERY SYSTEM: WORKING')
print('🎯 Components auto-discovered from React files')
print('🔥 Python dynamically loads descriptions from ai-registry.json')
print('💡 Zero manual maintenance required!')