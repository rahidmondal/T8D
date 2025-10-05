# Contributing to T8D

Thank you for your interest in contributing to T8D! This guide will help you get started with contributing to our offline-first to-do application.

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/) (recommended package manager)
- [Git](https://git-scm.com/)

### Setup

1. **Fork the repository** on GitHub
2. **Clone your fork:**
   ```bash
   git clone https://github.com/rahidmondal/T8D.git
   cd T8D
   ```
3. **Install dependencies:**
   ```bash
   pnpm install
   ```
4. **Start development:**
   ```bash
   pnpm run dev
   ```

## Development Workflow

### 1. Create a Branch

Before starting, **fork the repository** on GitHub if you haven't already. Then, create a branch named after the issue or feature you plan to work on:

```bash
git checkout dev
git pull origin dev
git checkout -b feature/<issue-or-feature-name>
```

### 2. Make Your Changes

Make your changes to the codebase. Be sure to follow the coding conventions and best practices outlined in this document.

### 3. Test Your Changes

Run Comprehensive checks to ensure everything works as expected:

```bash
pnpm check
```

### 4. Commit Your Changes

Follow our commit format:

```bash
git add .
git commit -m "feat(todo): add subtask support"
```

See [WORKFLOW.md](WORKFLOW.md) for commit message guidelines.

### 5. Submit a Pull Request

1. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
2. Go to the original T8D repository on GitHub and create a pull request from your branch to the `dev` branch.
3. Complete the PR template, providing a clear summary and linking related issues.
4. Wait for review, respond to feedback, and make any requested changes.

## 📋 Coding Conventions

### File Organization

```
src/
├── components/     # React components
├── hooks/         # Custom hooks
├── utils/         # Utility functions
├── models/        # TypeScript types
└── context/       # React contexts
```

### Naming Conventions

- **Components**: PascalCase (`TodoItem.tsx`)
- **Hooks**: camelCase starting with `use` (`useTaskLists.ts`)
- **Utilities**: camelCase (`todo.ts`)
- **Types/Interfaces**: PascalCase (`Task`, `TaskList`)

### Styling

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Maintain consistent spacing using Tailwind's scale
- Use semantic color names in dark/light theme variants

**Example:**

```jsx
<div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Task Title</h2>
</div>
```

## 🚨 Issue Reporting

### Bug Reports

When reporting bugs, include:

- **Environment**: Browser, OS, device type
- **Steps to reproduce**: Clear, numbered steps
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Screenshots**: If applicable

### Feature Requests

For new features, provide:

- **Problem statement**: What problem does this solve?
- **Proposed solution**: How should it work?
- **Alternative solutions**: Other approaches considered
- **Additional context**: Mockups, examples, use cases

## 📦 Release Process

### For Maintainers

1. **Prepare release:**

   ```bash
   git checkout dev
   git pull origin dev
   ```

2. **Update version and changelog:**
   - Bump version in `package.json`
   - Update `CHANGELOG.md`

3. **Create release PR:**

   ```bash
   git checkout -b release/v1.2.3
   git commit -m "chore: prepare release v1.2.3"
   git push origin release/v1.2.3
   ```

4. **Merge to main and tag:**
   ```bash
   git checkout main
   git merge release/v1.2.3
   git tag v1.2.3
   git push origin main --tags
   ```

## 🤝 Code of Conduct

### Our Standards

- **Be respectful**: Treat everyone with respect and kindness
- **Be inclusive**: Welcome people of all backgrounds and experience levels
- **Be constructive**: Provide helpful feedback and suggestions
- **Be patient**: Remember that everyone is learning

### Unacceptable Behavior

- Harassment, trolling, or discriminatory language
- Publishing private information without consent
- Spam or irrelevant promotional content
- Any conduct that would be inappropriate in a professional setting

## ❓ Getting Help

- **Documentation**: Check README files
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for questions
- **Code Review**: Ask for feedback on your PRs

Thank you for contributing to T8D! Your efforts help make task management better for everyone. 🚀
