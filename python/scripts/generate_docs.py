#!/usr/bin/env python3
"""
Generate API documentation from agentinterface OSS project.
Extracts docs via Python inspection and outputs JSON for Astro.

Run from website: python scripts/generate_docs.py
Or with poetry: cd ../../ && poetry run python website/scripts/generate_docs.py
"""

import importlib.util
import inspect
import json
import sys
from pathlib import Path
from typing import Any, Dict


def load_agentinterface_python_module():
    """Load the agentinterface package from the current environment."""
    try:
        import agentinterface

        return agentinterface
    except ImportError as e:
        print(f"Failed to import agentinterface: {e}")
        return None


def extract_class_info(cls) -> Dict[str, Any]:
    """Extract documentation info from a class."""
    info = {
        "name": cls.__name__,
        "docstring": inspect.getdoc(cls) or "",
        "module": cls.__module__,
        "methods": [],
    }

    # Get constructor signature
    try:
        init_sig = inspect.signature(cls.__init__)
        info["init_signature"] = str(init_sig)
    except (ValueError, TypeError):
        info["init_signature"] = ""

    # Extract public methods
    for name, method in inspect.getmembers(cls, inspect.isfunction):
        if not name.startswith("_"):
            method_info = {
                "name": name,
                "docstring": inspect.getdoc(method) or "",
                "signature": str(inspect.signature(method)) if callable(method) else "",
            }
            info["methods"].append(method_info)

    return info


def extract_function_info(func) -> Dict[str, Any]:
    """Extract documentation info from a function."""
    try:
        signature = str(inspect.signature(func))
    except (ValueError, TypeError):
        signature = ""

    return {
        "name": func.__name__,
        "docstring": inspect.getdoc(func) or "",
        "module": func.__module__,
        "signature": signature,
    }


def generate_python_api_docs() -> Dict[str, Any]:
    """Generate comprehensive API documentation for Python package."""
    agentinterface = load_agentinterface_python_module()
    if not agentinterface:
        return {}

    docs = {
        "package": {
            "name": "agentinterface",
            "version": getattr(agentinterface, "__version__", "unknown"),
            "docstring": inspect.getdoc(agentinterface) or "",
        },
        "modules": {},
    }

    # Core modules to document - adjust based on actual structure
    module_names = ["core", "selector", "registry"]

    # Try to discover all submodules
    try:
        import pkgutil

        discovered_modules = [
            name
            for _, name, _ in pkgutil.iter_modules(
                agentinterface.__path__, agentinterface.__name__ + "."
            )
        ]
        for full_name in discovered_modules:
            name = full_name.split(".")[-1]
            if name not in module_names and not name.startswith("_"):
                module_names.append(name)
    except (ImportError, AttributeError) as e:
        print(f"Warning: Could not discover submodules: {e}")

    for module_name in module_names:
        try:
            # Try direct attribute access first
            module = getattr(agentinterface, module_name, None)

            # If that fails, try importing the module
            if module is None:
                full_name = f"agentinterface.{module_name}"
                module = importlib.import_module(full_name)

            if module:
                module_info = {
                    "name": module_name,
                    "docstring": inspect.getdoc(module) or "",
                    "classes": [],
                    "functions": [],
                }

                # Extract classes
                for _name, obj in inspect.getmembers(module, inspect.isclass):
                    if obj.__module__.startswith("agentinterface"):
                        module_info["classes"].append(extract_class_info(obj))

                # Extract functions
                for _name, obj in inspect.getmembers(module, inspect.isfunction):
                    if obj.__module__.startswith("agentinterface"):
                        module_info["functions"].append(extract_function_info(obj))

                docs["modules"][module_name] = module_info

        except ImportError as e:
            print(f"Warning: Could not import agentinterface.{module_name}: {e}")

    return docs


def generate_js_api_docs() -> Dict[str, Any]:
    """Generate documentation for JavaScript package using static analysis."""
    # This is a placeholder for JavaScript documentation generation
    # In a real implementation, you would use a tool like TypeDoc or JSDoc to extract documentation

    return {
        "package": {
            "name": "agentinterface",
            "version": "0.1.0",
            "docstring": "AgentInterface JavaScript implementation",
        },
        "modules": {
            "core": {
                "name": "core",
                "docstring": "Core functionality for AgentInterface",
                "classes": [
                    {
                        "name": "AgentInterface",
                        "docstring": "Main class for creating agent interfaces",
                        "module": "agentinterface.core",
                        "methods": [
                            {
                                "name": "createResponse",
                                "docstring": "Create a new response object",
                                "signature": "()",
                            }
                        ],
                        "init_signature": "(options?: AgentInterfaceOptions)",
                    }
                ],
                "functions": [],
            },
            "components": {
                "name": "components",
                "docstring": "UI components for AgentInterface",
                "classes": [
                    {
                        "name": "Text",
                        "docstring": "Simple text component",
                        "module": "agentinterface.components",
                        "methods": [],
                        "init_signature": "(text: string)",
                    },
                    {
                        "name": "Markdown",
                        "docstring": "Markdown component for formatted text",
                        "module": "agentinterface.components",
                        "methods": [],
                        "init_signature": "(markdown: string)",
                    },
                    {
                        "name": "Button",
                        "docstring": "Interactive button component",
                        "module": "agentinterface.components",
                        "methods": [],
                        "init_signature": "(options: { text: string, action: string })",
                    },
                ],
                "functions": [],
            },
        },
    }


def main():
    """Main entry point."""
    # Default to website autodocs directory
    output_dir = "../website/src/data/autodocs"

    if len(sys.argv) > 1:
        output_dir = sys.argv[1]

    print(f"Output directory: {output_dir}")

    # Ensure output directory exists
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    # Generate Python documentation
    python_docs = generate_python_api_docs()

    if not python_docs or not python_docs.get("modules"):
        print("⚠️ No Python documentation generated or empty modules")
    else:
        print(f"✅ Generated Python documentation for {len(python_docs['modules'])} modules")
        print(f"Modules: {list(python_docs['modules'].keys())}")

    # Generate JavaScript documentation
    js_docs = generate_js_api_docs()

    if not js_docs or not js_docs.get("modules"):
        print("⚠️ No JavaScript documentation generated or empty modules")
    else:
        print(f"✅ Generated JavaScript documentation for {len(js_docs['modules'])} modules")
        print(f"Modules: {list(js_docs['modules'].keys())}")

    # Combine documentation
    combined_docs = {"python": python_docs, "javascript": js_docs}

    # Write to JSON file
    output_file = output_path / "api_docs.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(combined_docs, f, indent=2, ensure_ascii=False)

    print(f"✅ Output written to: {output_file}")


if __name__ == "__main__":
    main()
