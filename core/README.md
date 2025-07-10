# Agent Interface Protocol - Core Schemas

This directory contains language-agnostic schemas and type definitions for the Agent Interface Protocol (AIP).

## Contents

- `schemas.json` - JSON Schema definitions for all AIP types
- `types.ts` - TypeScript type definitions (generated from schemas)
- `types.py` - Python type definitions (generated from schemas)

## Usage

These schemas define the contract between different language implementations of the Agent Interface Protocol. They ensure consistency across:

- React components (`../react/`)
- Python backend implementations (`../python/`)
- Other language implementations

## Interface Types

The protocol supports these interface types:

- `markdown` - Default conversational renderer
- `project_cards` - Portfolio display with metadata
- `expandable_detail` - Collapsible long-form content
- `key_insights` - Categorized insights/principles/frameworks
- `timeline` - Chronological progression with events
- `tech_deep_dive` - Technical explanations with code examples
- `inline_link` - Inline expandable references

## Schema Validation

All implementations should validate against these schemas to ensure compatibility and prevent runtime errors.