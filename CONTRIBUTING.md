# Contributing to SirsiNexus

Thank you for your interest in contributing to SirsiNexus! We welcome contributions from the community and are excited to see what you'll bring to this generative AI infrastructure platform.

## 🚀 Quick Start

1. **Fork the repository** on GitHub
2. **Clone your fork** locally: `git clone https://github.com/YOUR_USERNAME/SirsiNexus.git`
3. **Create a feature branch**: `git checkout -b feature/your-feature-name`
4. **Make your changes** and commit them with clear messages
5. **Push to your fork**: `git push origin feature/your-feature-name`
6. **Submit a Pull Request** with a clear description

## 💡 Ways to Contribute

### Code Contributions
- **Bug fixes** - Help us squash bugs in any component
- **New features** - Implement new AI capabilities or infrastructure features  
- **Performance improvements** - Optimize our Rust, Python, Go, or TypeScript code
- **Documentation** - Improve our guides, API docs, or code comments
- **Tests** - Add unit tests, integration tests, or end-to-end tests

### Non-Code Contributions
- **Issue reporting** - Report bugs or suggest enhancements
- **Documentation** - Improve README, guides, or tutorials
- **Design** - UI/UX improvements for the frontend
- **Community** - Help answer questions in issues or discussions

## 🏗️ Development Setup

### Prerequisites
- **Rust** 1.70+ with Cargo
- **Node.js** 18+ with npm/yarn
- **Python** 3.9+ with pip
- **Go** 1.19+
- **Docker** and Docker Compose
- **Git** for version control

### Local Development
```bash
# Clone the repository
git clone https://github.com/SirsiNexusDev/SirsiNexus.git
cd SirsiNexus

# Start development environment
docker-compose up -d  # Start PostgreSQL and Redis

# Backend (Rust)
cd core-engine
cargo build
cargo test
cargo run

# Frontend (TypeScript/React)
cd ui
npm install
npm run dev

# Analytics Platform (Python)
cd analytics-platform
pip install -r requirements.txt
python -m pytest

# Go Connectors
cd connectors
go mod tidy
go test ./...
go run main.go
```

## 📋 Contribution Guidelines

### Code Style

**Rust**
- Follow `rustfmt` formatting: `cargo fmt`
- Use `clippy` for linting: `cargo clippy`
- Document public APIs with `///` comments
- Write unit tests for new functionality

**TypeScript/React**
- Use Prettier for formatting
- Follow ESLint rules
- Use TypeScript strict mode
- Write Jest tests for components

**Python**
- Follow PEP 8 style guide
- Use `black` for formatting
- Use `mypy` for type checking
- Write pytest tests with good coverage

**Go**
- Use `gofmt` for formatting
- Follow effective Go practices
- Write table-driven tests
- Use meaningful variable names

### Commit Guidelines

We follow conventional commits for clear history:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

**Examples:**
```
feat(ai): add Claude integration for infrastructure generation
fix(auth): resolve JWT token expiration handling
docs(readme): update installation instructions
test(analytics): add unit tests for cost prediction model
```

### Pull Request Process

1. **Update documentation** for any public API changes
2. **Add tests** for new functionality
3. **Ensure all tests pass** locally
4. **Update the changelog** if applicable
5. **Request review** from core team members

### Pull Request Template

```markdown
## Description
Brief description of changes and motivation.

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] I have tested this manually

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
```

## 🐛 Bug Reports

When reporting bugs, please include:

- **Environment details** (OS, versions, etc.)
- **Steps to reproduce** the issue
- **Expected behavior** vs **actual behavior**
- **Error messages** or logs if available
- **Screenshots** if applicable

Use our bug report template when creating issues.

## ✨ Feature Requests

For feature requests, please provide:

- **Clear description** of the feature
- **Use case** - why is this needed?
- **Proposed solution** if you have ideas
- **Alternative solutions** you've considered
- **Additional context** or examples

## 🏷️ Issue Labels

We use labels to categorize issues:

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to docs
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `question` - Further information is requested
- `rust` / `python` / `typescript` / `go` - Language-specific issues

## 🎯 Areas Needing Help

We especially welcome contributions in:

- **AI Model Integration** - Adding new LLM providers
- **Cloud Provider Support** - Expanding multi-cloud capabilities
- **Analytics Features** - Enhanced ML models and dashboards  
- **Documentation** - Tutorials, guides, API documentation
- **Testing** - Improving test coverage across all components
- **Performance** - Optimizing database queries and API responses

## 📞 Getting Help

- **GitHub Discussions** - For questions and community chat
- **GitHub Issues** - For bug reports and feature requests  
- **Documentation** - Check our comprehensive docs first
- **Email** - contact@sirsinexus.dev for sensitive topics

## 🏆 Recognition

Contributors will be:

- **Acknowledged** in our changelog and release notes
- **Listed** in our contributors section
- **Invited** to join our contributor community
- **Eligible** for contributor swag (coming soon!)

## 📜 Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this code.

## 📄 License

By contributing to SirsiNexus, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

**Questions?** Feel free to reach out! We're here to help make your contribution experience great.

Thank you for helping make SirsiNexus the best generative AI infrastructure platform! 🚀
