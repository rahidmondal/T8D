# Contributing to T8D

Thank you for your interest in contributing to T8D! This guide will help you get started with contributing to our offline-first task management application.

T8D is a modern, privacy-focused PWA built with React, TypeScript, and Express. We welcome contributions from developers of all experience levels.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Release Process](#release-process)

---

## 🤝 Code of Conduct

### Our Standards

We are committed to providing a welcoming and inclusive environment:

- **Be Respectful**: Treat everyone with respect and professionalism
- **Be Inclusive**: Welcome people of all backgrounds and skill levels
- **Be Constructive**: Provide helpful, actionable feedback
- **Be Patient**: Remember everyone is learning and growing
- **Be Collaborative**: Work together towards common goals

### Unacceptable Behavior

The following behaviors are not tolerated:

- Harassment, intimidation, or discriminatory language
- Personal attacks or trolling
- Publishing others' private information without permission
- Spam or excessive self-promotion
- Any conduct that would be inappropriate in a professional setting

**Reporting**: If you experience or witness unacceptable behavior, please report it to the project maintainers.

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **pnpm** v8+ ([Installation Guide](https://pnpm.io/installation))
- **Git** ([Download](https://git-scm.com/))
- **Docker** (optional, for containerized development)

### Initial Setup

1. **Fork the repository** on GitHub by clicking the "Fork" button

2. **Clone your fork:**

   ```bash
   git clone https://github.com/rahidmondal/T8D.git
   cd T8D
   ```

3. **Add upstream remote:**

   ```bash
   git remote add upstream https://github.com/rahidmondal/T8D.git
   ```

4. **Install dependencies:**

   ```bash
   pnpm install
   ```

5. **Set up environment variables:**

   ```bash
   # Backend
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   ```

6. **Generate Prisma client:**

   ```bash
   pnpm backend:dev  # This will auto-generate the Prisma client
   ```

7. **Start development servers:**

   ```bash
   # Start both frontend and backend
   pnpm run dev:all

   # Or start individually
   pnpm run frontend:dev  # Frontend on http://localhost:5173
   pnpm run backend:dev   # Backend on http://localhost:3000
   ```

---

## 🔄 Development Workflow

### 1. Sync with Upstream

Before starting new work, ensure your fork is up to date:

```bash
git checkout dev
git fetch upstream
git merge upstream/dev
git push origin dev
```

### 2. Create a Feature Branch

Create a descriptive branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

See [WORKFLOW.md](WORKFLOW.md) for branch naming conventions.

### 3. Make Your Changes

- Write clean, readable code
- Follow the project's coding standards (see below)
- Keep changes focused and atomic
- Add tests for new functionality
- Update documentation as needed

### 4. Test Your Changes

Run the full test suite:

```bash
# Run all quality checks
pnpm check

# This includes:
# - Linting (ESLint)
# - Type checking (TypeScript)
# - Unit tests (Vitest)
# - Format checking (Prettier)
```

Run specific checks:

```bash
pnpm run lint           # Lint all packages
pnpm run test           # Run tests
pnpm run type-check     # Type checking
pnpm run format:check   # Check formatting
```

### 5. Commit Your Changes

Follow the Conventional Commits specification:

```bash
git add .
git commit -m "feat(tasks): add subtask support"
```

**Examples:**

```bash
feat(sync): implement real-time websocket sync
fix(auth): resolve JWT token expiration bug
docs(api): update authentication endpoints
refactor(db): optimize query performance
test(tasks): add unit tests for task creation
```

See [WORKFLOW.md](WORKFLOW.md) for detailed commit guidelines.

### 6. Push and Create Pull Request

```bash
# Push your branch to your fork
git push origin feature/your-feature-name
```

Then:

1. Go to the original T8D repository on GitHub
2. Click "New Pull Request"
3. Select your fork and branch
4. Target the `dev` branch (not `main`)
5. Fill out the PR template completely
6. Link related issues using `Closes #123`
7. Request review from maintainers

### 7. Respond to Feedback

- Address all reviewer comments
- Make requested changes promptly
- Push additional commits to the same branch
- Mark conversations as resolved when fixed
- Be open to suggestions and discussion

## 📋 Coding Conventions

### File Organization

```
frontend/src/
├── components/     # React components
├── hooks/         # Custom hooks
├── utils/         # Utility functions
├── models/        # TypeScript types
└── context/       # React contexts

backend/src/
├── auth/          # Authentication logic
├── db/            # Database queries
├── middleware/    # Express middleware
├── realtime/      # Socket.io realtime logic
├── routes/        # API routes
├── sync/          # Sync controllers
└── utils/         # Utility functions
```

### Naming Conventions

- **Components**: PascalCase (`TodoItem.tsx`)
- **Hooks**: camelCase starting with `use` (`useTaskLists.ts`)
- **Utilities**: camelCase (`todo.ts`)
- **Types/Interfaces**: PascalCase (`Task`, `TaskList`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)

### TypeScript Guidelines

- Use explicit types for function parameters and return values
- Prefer interfaces over type aliases for object shapes
- Use enums for fixed sets of values
- Leverage union types for flexibility
- Avoid `any` type; use `unknown` if type is truly unknown

**Example:**

```typescript
interface Task {
  id: string;
  name: string;
  status: TaskStatus;
  createdAt: Date;
}

function createTask(name: string): Task {
  return {
    id: crypto.randomUUID(),
    name,
    status: TaskStatus.NotCompleted,
    createdAt: new Date(),
  };
}
```

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

### API Design

- Use RESTful conventions where applicable
- Return appropriate HTTP status codes
- Include error messages in response body
- Use JWT for authentication
- Validate all inputs with Zod schemas

---

## 🧪 Testing Guidelines

### Writing Tests

- **Unit tests**: Test individual functions and components in isolation
- **Integration tests**: Test API endpoints and database interactions
- **E2E tests**: Test complete user workflows (future enhancement)

### Test Structure

```typescript
import { describe, it, expect } from 'vitest';

describe('TaskList', () => {
  it('should create a new task list', () => {
    const list = createTaskList('My List');
    expect(list.name).toBe('My List');
    expect(list.tasks).toHaveLength(0);
  });
});
```

---

## 🔐 Security Guidelines

### General Security Practices

1. **Input Validation**: Always validate and sanitize user inputs
2. **Authentication**: Use JWT tokens with appropriate expiration
3. **Authorization**: Verify user permissions before data access
4. **SQL Injection**: Use Prisma ORM parameterized queries
5. **XSS Protection**: Sanitize HTML content and use React's built-in escaping
6. **CORS**: Configure allowed origins appropriately
7. **Environment Variables**: Never hardcode secrets or API keys
8. **Dependencies**: Regularly audit and update dependencies

### Password Security

- Minimum 12 characters
- Use bcrypt with salt rounds of 10+
- Enforce password strength with zxcvbn (score >= 3)
- Hash passwords before storing

### Reporting Security Issues

Do not report security vulnerabilities in public issues.

---

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

## 🧪 Testing Requirements

Before submitting a PR, ensure:

- [ ] All existing tests pass
- [ ] New features have corresponding tests
- [ ] Code coverage doesn't decrease significantly
- [ ] Manual testing completed
- [ ] No linting errors
- [ ] No type errors
- [ ] Documentation updated

---

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

5. **Merge back to dev:**
   ```bash
   git checkout dev
   git merge main
   git push origin dev
   ```

---

## ❓ Getting Help

- **Documentation**: Check README files and [WORKFLOW.md](WORKFLOW.md)
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for questions
- **Code Review**: Ask for feedback on your PRs

---

Thank you for contributing to T8D! Your efforts help make task management better for everyone. 🚀
