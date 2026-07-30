# Contributing to Lexara

Thank you for your interest in contributing to Lexara! This document provides guidelines and instructions for contributing.

## 🚀 Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/yourusername/lexara.git
   cd lexara
   ```
3. **Install dependencies**
   ```bash
   pnpm install
   ```
4. **Set up the development environment**
   ```bash
   # Start PostgreSQL
   docker-compose up -d
   
   # Set up backend
   cd apps/api
   cp .env.example .env
   pnpm prisma:generate
   pnpm prisma:migrate
   pnpm prisma:seed
   
   # Set up frontend
   cd ../web
   cp .env.example .env.local
   ```
5. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📋 Development Workflow

### Running the Project

```bash
# Start all apps from root
pnpm dev

# Or start individually
cd apps/api && pnpm dev    # Backend on :3001
cd apps/web && pnpm dev    # Frontend on :3000
```

### Code Style

- **TypeScript** for all new code
- **ESLint** for linting
- **Prettier** for formatting

Format your code before committing:
```bash
pnpm format
```

### Commit Messages

Follow conventional commits:
- `feat: add YouTube import`
- `fix: vocabulary duplicate issue`
- `docs: update README`
- `refactor: improve tokenizer performance`
- `test: add SRS algorithm tests`

## 🎯 What to Contribute

### High Priority
- [ ] Manual content import (paste articles)
- [ ] YouTube subtitle import
- [ ] AI contextual translation
- [ ] Additional SRS activities (cloze, dictation)
- [ ] Dark mode implementation
- [ ] Mobile responsive improvements

### Good First Issues
- [ ] Add loading skeletons
- [ ] Improve error messages
- [ ] Add keyboard shortcuts
- [ ] Write tests for core features
- [ ] Improve documentation

### Ideas Welcome
- New language support
- Content providers (Netflix, podcasts)
- Community features
- Gamification improvements

## 🧪 Testing

```bash
# Run tests (when implemented)
pnpm test

# Type check
pnpm type-check

# Lint
pnpm lint
```

## 📝 Pull Request Process

1. **Update documentation** if you change APIs or add features
2. **Test your changes** thoroughly
3. **Update the README** if needed
4. **Create a PR** with a clear description:
   - What does this PR do?
   - Why is this change needed?
   - Screenshots (for UI changes)
   - Testing steps

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How to Test
1. Step one
2. Step two

## Screenshots (if applicable)

## Checklist
- [ ] My code follows the project's style
- [ ] I have tested my changes
- [ ] I have updated documentation
- [ ] All tests pass
```

## 🐛 Reporting Bugs

Use GitHub Issues with:
- **Clear title**: "Vocabulary not saving after lesson"
- **Steps to reproduce**
- **Expected behavior**
- **Actual behavior**
- **Screenshots** if helpful
- **Environment**: browser, OS, etc.

## 💡 Feature Requests

Use GitHub Issues with:
- **Clear description** of the feature
- **Use case**: Why is this needed?
- **Alternatives**: Have you considered other approaches?
- **Mockups** if applicable

## 🤝 Code of Conduct

### Our Pledge
We are committed to providing a welcoming and inclusive environment.

### Our Standards
- Be respectful and considerate
- Welcome newcomers
- Focus on what's best for the community
- Show empathy

### Unacceptable Behavior
- Harassment of any kind
- Trolling or insulting comments
- Public or private harassment
- Publishing others' private information

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## ❓ Questions?

- Open a GitHub Discussion
- Check existing Issues
- Read the docs in `/docs`

Thank you for contributing to Lexara! 🎉
