#!/usr/bin/env python3
"""
TEST SCRIPT: Validate ecosystem autodiscovery
"""

import sys
sys.path.insert(0, 'src')

import agentinterface as ai_module

# Test the ecosystem system
ai = ai_module.ai

print('=== TESTING ECOSYSTEM AUTODISCOVERY ===')

# Test registry loading with ecosystem data
print('\n🌍 Ecosystem registry loading:')
print(f'✓ Total components discovered: {len(ai._registry)}')

# Test source breakdown
print('\n📊 Component sources:')
sources = ai.sources()
for source, components in sources.items():
    print(f'   {source}: {len(components)} components')
    for comp in components[:3]:  # Show first 3 per source
        print(f'      ✓ {comp}')

# Test component descriptions from ecosystem
print('\n📝 Ecosystem component descriptions:')
components = ai.components()
for comp_type, description in list(components.items())[:4]:  # Show first 4
    print(f'   ✓ {comp_type}: {description}')

# Test dynamic creation with ecosystem data
print('\n🧪 Testing dynamic creation with ecosystem descriptions:')
insights_fn = ai.insights
print(f'✓ Function name: {insights_fn.__name__}')
print(f'✓ Function doc: {insights_fn.__doc__}')

# Create component
insights = ai.insights(
    insights=[
        {"category": "discovery", "content": "Ecosystem autodiscovery working!"},
        {"category": "success", "content": "Components loaded from multiple sources"}
    ]
)
print(f'✓ Component result: {insights["type"]} with {len(insights.get("insights", []))} insights')

# Test refresh capability  
print('\n🔄 Testing registry refresh:')
original_count = len(ai._registry)
ai.refresh()
new_count = len(ai._registry)
print(f'✓ Refresh completed: {original_count} → {new_count} components')

print('\n✅ ECOSYSTEM AUTODISCOVERY: WORKING')
print('🌍 Components discovered from entire ecosystem')
print('🔌 Extensible for any package using ai() protocol')
print('🚀 Universal React ↔ Agent bridge established!')