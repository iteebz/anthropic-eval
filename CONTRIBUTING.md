# Contributing to AgentInterface

Thank you for your interest in contributing to AgentInterface! This guide will help you get started.

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/tysonchan/agentinterface.git
   cd agentinterface
   ```

2. **Python Development**
   ```bash
   cd python
   pip install -e ".[dev]"
   pytest
   ```

3. **JavaScript Development**
   ```bash
   cd js
   npm install
   npm test
   ```

## Architecture Overview

AgentInterface provides a protocol and libraries for building conversational AI agents with rich, dynamic user interfaces:

- **Protocol**: Standardized interface descriptions for UI components
- **Python Library**: Agent-side UI generation and component definitions
- **JavaScript/React Library**: Client-side component rendering and interaction
- **Examples**: Reference implementations for both ecosystems

See `docs/architecture.md` for detailed architecture documentation.

## Contributing Guidelines

### Code Style

**Python**
- Follow PEP 8 for Python code style
- Use type hints for all function signatures
- Write docstrings for all public functions and classes
- Maximum line length: 88 characters

**JavaScript/TypeScript**
- Follow project ESLint configuration
- Use TypeScript for all new code
- Write JSDoc comments for public APIs
- Use Prettier for consistent formatting

### Testing

- Write tests for all new features
- Maintain test coverage above 90%
- Python: Use pytest framework
- JavaScript: Use Vitest framework
- Mock external dependencies in tests

### Component Development

When adding new UI components:

1. **Define the protocol**
   ```python
   # Pe - component definition
   @component
   class YourComponent(BaseComponent):
       def __init__(self, **props):
           super().__init__("your_component", props)
   ```

2. **Implement React component**
   ```typescript
   // JavaScript side - component implementation
   export const YourComponent: React.FC<YourComponentProps> = (props) => {
       // Implementation
   };
   ```

3. **Add comprehensive tests**
   - Unit tests for component logic
   - Integration tests with mock agents
   - Visual regression tests for UI components

### Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the coding standards
   - Add tests for new functionality
   - Update documentation as needed

3. **Run the test suite**
   ```bash
   # Python
   cd python && pytest && mypy src/
   
   # JavaScript
   cd js && npm test && npm run type-check
   ```

4. **Submit pull request**
   - Provide clear description of changes
   - Link to any related issues
   - Ensure CI tests pass

## Types of Contributions

### Core Components
Submit new UI components that follow the protocol:
- Must work across Python and JavaScript
- Should have clear interaction patterns
- Need comprehensive tests and examples

### Protocol Extensions
Add new protocol features:
- Backward compatibility required
- Update both Python and JavaScript libraries
- Include migration documentation

### Platform Integrations
Implement AgentInterface for new platforms:
- Follow existing library patterns
- Add platform-specific optimizations
- Include integration examples

### Documentation
Improve documentation:
- Architecture explanations
- Usage examples
- API documentation
- Cross-platform tutorials

## Issue Reporting

When reporting issues:

1. **Use the issue template**
2. **Specify affected platform** (Python, JavaScript, or both)
3. **Provide minimal reproduction case**
4. **Include environment information**
5. **Describe expected vs actual behavior**

## Questions and Support

- **Documentation**: Check `docs/` directory
- **Issues**: Use GitHub issues for bug reports
- **Discussions**: Use GitHub discussions for questions

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Maintain professional communication

## Development Philosophy

AgentInterface prioritizes:

1. **Cross-Platform Consistency**: Components work identically across platforms
2. **Developer Experience**: Simple APIs that scale to complex use cases
3. **Performance**: Efficient rendering and minimal overhead
4. **Extensibility**: Easy to add new components and platforms
5. **Maintainability**: Clear separation between protocol and implementation

## Release Process

1. **Version Bumping**: Follow semantic versioning for both libraries
2. **Changelog**: Update CHANGELOG.md with changes
3. **Testing**: Ensure all tests pass on both platforms
4. **Documentation**: Update docs and examples
5. **Release**: Coordinate Python PyPI and JavaScript npm releases

Thank you for contributing to AgentInterface! Your contributions help make conversational AI interfaces more powerful and accessible.