# AgentInterface - Beautiful, simple, and effective justfile
# Default command: list all commands
default:
    @just --list

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ⚙️  SETUP & ENVIRONMENT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Install all dependencies (TypeScript + Python)
install:
    @echo "Installing TypeScript dependencies..."
    @pnpm install
    @echo "Installing Python dependencies..."
    @cd python && poetry install

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🚀 DEVELOPMENT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Start development mode
dev:
    @echo "Starting development server..."
    @pnpm dev

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🧪 TESTING
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Run all tests (TypeScript + Python)
test:
    @echo "Running TypeScript tests..."
    @pnpm --filter agentinterface run test:run
    @echo "Running Python tests..."
    @cd python && poetry run pytest tests -v

# Run tests with coverage
test-cov:
    @echo "Running TypeScript tests with coverage..."
    @pnpm --filter agentinterface run test:coverage
    @echo "Running Python tests with coverage..."
    @cd python && poetry run pytest --cov=src tests/

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🔍 CODE QUALITY
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Format code (TypeScript + Python)
format:
    @echo "Formatting TypeScript code..."
    @pnpm --filter agentinterface run format
    @echo "Formatting Python code..."
    @cd python && poetry run ruff format .

# Lint code (TypeScript + Python)
lint:
    @echo "Linting TypeScript code..."
    @pnpm --filter agentinterface run lint
    @echo "Linting Python code..."
    @cd python && poetry run ruff check .

# Fix linting issues (TypeScript + Python)
fix:
    @echo "Fixing TypeScript linting issues..."
    @pnpm --filter agentinterface run lint:fix
    @echo "Fixing Python linting issues..."
    @cd python && poetry run ruff check . --fix

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 📦 DISTRIBUTION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Build main packages (TypeScript + Python)
build:
    @echo "Building TypeScript package..."
    @pnpm --filter agentinterface run build
    @echo "Building Python package..."
    @cd python && poetry build

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🧹 MAINTENANCE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Clean build artifacts and cache directories
clean:
    @echo "Cleaning build artifacts and cache directories..."
    @pnpm clean
    @cd python && rm -rf dist build .pytest_cache .ruff_cache __pycache__
    @find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
    @find . -type d -name ".ruff_cache" -exec rm -rf {} + 2>/dev/null || true

# Run CI checks locally (format, lint, test, build)
ci: format fix test build