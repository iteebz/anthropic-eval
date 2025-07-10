# justfile for AgentInterface

# Default target
default: help

# Help message
help:
	@echo "AgentInterface Justfile Commands:"
	@echo "  help                 - Display this help message."
	@echo "  install-python       - Install Python dependencies."
	@echo "  install-js           - Install JavaScript dependencies."
	@echo "  build-python         - Build the Python package."
	@echo "  build-js             - Build the JavaScript package."
	@echo "  build-all            - Build both Python and JavaScript packages."
	@echo "  test-python          - Run Python tests."
	@echo "  test-js              - Run JavaScript tests."
	@echo "  test-all             - Run all tests."
	@echo "  publish-python       - Publish Python package to PyPI."
	@echo "  publish-js           - Publish JavaScript package to NPM."
	@echo "  clean                - Clean build artifacts."

# Install dependencies
install-python:
	@echo "Installing Python dependencies..."
	cd python && poetry install

install-js:
	@echo "Installing JavaScript dependencies..."
	cd js && npm install

# Build packages
build-python:
	@echo "Building Python package..."
	cd python && poetry build

build-js:
	@echo "Building JavaScript package..."
	cd js && npm run build

build-all: build-python install-js build-js

# Run tests
test-python:
	@echo "Running Python tests..."
	cd python && poetry run pytest

test-js:
	@echo "Running JavaScript tests..."
	cd js && npm test

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf python/dist python/.venv
	rm -rf js/dist js/node_modules