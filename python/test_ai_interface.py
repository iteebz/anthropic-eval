#!/usr/bin/env python3
"""
TEST SCRIPT: Validate ai.component() dynamic interface
"""

import sys
sys.path.insert(0, 'src')

import agentinterface as ai_module

# Test the dynamic interface
ai = ai_module.ai

print('=== TESTING CANONICAL AI() INTERFACE ===')

# Test dynamic component creation
print('\n🧪 Testing ai.card()')
card = ai.card(
    header="Dynamic Card",
    body="Created via ai.card() magic method",
    variant="elevated"
)
print(f'✓ Card result: {card}')
print(f'✓ Card type: {card.get("type")}')

print('\n🧪 Testing ai.markdown()')
markdown = ai.markdown(
    content="# Hello from ai.markdown()\n\nThis is **dynamic**!"
)
print(f'✓ Markdown result: {markdown}')
print(f'✓ Markdown type: {markdown.get("type")}')

print('\n🧪 Testing ai.timeline()')
timeline = ai.timeline(
    events=[
        {"date": "2024-01", "title": "Started", "description": "Project began"},
        {"date": "2024-02", "title": "Progress", "description": "Making headway"}
    ]
)
print(f'✓ Timeline result: {timeline}')
print(f'✓ Timeline type: {timeline.get("type")}')

# Test IDE autocomplete support
print('\n🧪 Testing __dir__ for IDE support')
available = dir(ai)
print(f'✓ Available components: {available[:5]}... ({len(available)} total)')

print('\n✅ CANONICAL AI() INTERFACE: WORKING')
print('💡 Usage: ai.card(), ai.markdown(), ai.timeline(), etc.')
print('🎯 Zero ceremony, maximum power!')