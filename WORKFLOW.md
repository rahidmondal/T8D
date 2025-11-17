# 🧪 Team Workflow Guide

This document outlines the development workflow and practices for the T8D project. Following these guidelines ensures consistency and quality across the codebase.

## 🔧 Branching Strategy

We follow a Git Flow inspired workflow with two main branches:

- **`main`**: Contains only stable, production-ready releases. Direct commits are not allowed.
- **`dev`**: Active development branch where all features are integrated and tested.

**Important**: All new branches **must** start from `dev` and are merged back via Pull Requests (PRs).

---

## 🌱 Branch Naming Conventions

Use descriptive branch names that follow this pattern:

- `feature/<name>` – New features or enhancements
- `fix/<name>` – Bug fixes
- `hotfix/<name>` – Urgent production fixes (from main)
- `improvement/<name>` – UI/UX or performance improvements
- `test/<name>` – Adding or improving tests
- `docs/<name>` – Documentation updates
- `refactor/<name>` – Code restructuring without behavior change

**Examples:**

```bash
feature/offline-sync
fix/todo-deletion-bug
hotfix/critical-auth-issue
docs/api-endpoints
```

**Best Practices:**

- Keep branch names short but descriptive
- Use lowercase with hyphens for separation
- Reference issue numbers when applicable: `fix/123-login-error`

---

## ✍️ Commit Message Format

We follow modified [Conventional Commits](https://www.conventionalcommits.org/) specification for clear, structured commit messages.

### 📌 Header Format

```
<type>(<optional-scope>): <short summary>
```

**Example:**

```
feat(auth): add JWT token refresh endpoint
fix(sync): resolve conflict resolution bug
docs(api): update authentication documentation
```

### 🔠 Full Format (Optional)

For complex changes, use the extended format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Example:**

```
feat(sync): implement real-time websocket synchronization

This change adds WebSocket support for real-time task updates
across multiple devices. The sync algorithm ensures conflict
resolution using last-write-wins with hash comparison.

Closes #42
```

---

### ✅ Commit Types

| Type       | Description                             | Example                                        |
| ---------- | --------------------------------------- | ---------------------------------------------- |
| `feat`     | New feature or functionality            | `feat(tasks): add subtask support`             |
| `fix`      | Bug fix                                 | `fix(auth): resolve token expiration issue`    |
| `refactor` | Code restructuring (no behavior change) | `refactor(sync): simplify conflict resolution` |
| `style`    | Formatting changes only                 | `style: fix indentation in auth module`        |
| `docs`     | Documentation updates                   | `docs: update API endpoint documentation`      |
| `test`     | Adding or modifying tests               | `test(sync): add integration tests`            |
| `chore`    | Maintenance tasks                       | `chore: update dependencies`                   |
| `ci`       | CI/CD pipeline changes                  | `ci: add Docker build workflow`                |
| `build`    | Build system or dependency changes      | `build: upgrade to Node 20`                    |
| `perf`     | Performance improvements                | `perf(db): optimize query performance`         |
| `revert`   | Revert a previous commit                | `revert: rollback websocket changes`           |

### 📝 Commit Message Guidelines

- Use the imperative mood: "add feature" not "added feature"
- Keep the subject line under 72 characters
- Capitalize the first letter of the subject
- Don't end the subject with a period
- Use the body to explain "what" and "why", not "how"
- Reference issues and PRs in the footer

---

## 🚀 Versioning & Releases

We follow [Semantic Versioning](https://semver.org/): `v<major>.<minor>.<patch>`

- **Major** (`1.0.0`): Breaking changes, major feature releases
- **Minor** (`0.1.0`): New features, backward compatible
- **Patch** (`0.0.1`): Bug fixes, small improvements

**Pre-release versions**: `v0.1.0-alpha.1`, `v0.1.0-beta.2`

### Release Process

1. **Feature Freeze**: Stop accepting new features for the release
2. **Testing**: Comprehensive testing on `dev` branch
3. **Version Bump**: Update version in `package.json` files
4. **Changelog**: Update `CHANGELOG.md` with all changes
5. **Release PR**: Create PR from `dev` to `main`
6. **Tag Release**: After merge, create a git tag with version
7. **Deploy**: Automated deployment from `main` branch

---

## 🔄 Development Process

### 1. Start New Work

```bash
# Ensure you're on dev and have latest changes
git checkout dev
git pull origin dev

# Create a new branch (preferably named after the issue)
git checkout -b feature/123-task-description
```

### 2. Make Your Changes

- Write clean, documented code
- Follow the project's coding standards
- Add tests for new features
- Update documentation as needed

### 3. Commit Your Work

```bash
# Stage your changes
git add .

# Commit with a descriptive message
git commit -m "feat(tasks): add task description field"
```

### 4. Keep Your Branch Updated

```bash
# Regularly sync with dev to avoid merge conflicts
git fetch origin
git rebase origin/dev
```

### 5. Run Quality Checks

```bash
# Run comprehensive checks before pushing
pnpm check

# This runs:
# - Linting
# - Type checking
# - Tests
# - Format checking
```

### 6. Push and Create Pull Request

```bash
# Push your branch
git push origin feature/123-task-description

# Create a PR via GitHub targeting the dev branch
```

### 7. Code Review

- Address reviewer feedback promptly
- Make requested changes in new commits
- Keep discussions professional and constructive
- Once approved, maintainer will merge

---

## 🧪 Testing Requirements

Before submitting a PR, ensure:

- [ ] All existing tests pass
- [ ] New features have corresponding tests
- [ ] Code coverage doesn't decrease
- [ ] Manual testing completed
- [ ] No linting errors
- [ ] No type errors
- [ ] Documentation updated

---

## 🤝 Pull Request Guidelines

### PR Title Format

Follow the same convention as commit messages:

```
feat(auth): add OAuth2 authentication
fix(sync): resolve data loss on conflict
```

### PR Description Template

```markdown
## Description

Brief description of the changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues

Closes #123

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests passing
```

---

## 🚨 Hotfix Process

For critical production issues:

1. Create branch from `main`: `git checkout -b hotfix/critical-bug main`
2. Make the fix and test thoroughly
3. Create PR to `main` (not dev)
4. After merge to `main`, also merge to `dev`
5. Tag the hotfix release

---

## 📊 Code Review Standards

### As a Reviewer

- Be constructive and respectful
- Explain the "why" behind suggestions
- Distinguish between "must fix" and "suggestion"
- Approve when code meets quality standards
- Review within 24-48 hours when possible

### As an Author

- Respond to all comments
- Don't take feedback personally
- Ask questions if feedback is unclear
- Mark conversations as resolved when addressed
- Thank reviewers for their time

---

## 🎯 Best Practices

1. **Keep PRs Small**: Easier to review, faster to merge
2. **Single Responsibility**: One feature/fix per PR
3. **Test First**: Write tests before or alongside code
4. **Document As You Go**: Update docs with code changes
5. **Communicate Early**: Discuss major changes before implementing
6. **Stay Updated**: Regularly sync with dev branch
7. **Clean History**: Use `git rebase` for clean commits
8. **Security First**: Never commit secrets, API keys, or sensitive data
9. **Review Dependencies**: Keep dependencies updated and vetted

---

## 🔐 Security Practices

- **Never commit sensitive data**: Use environment variables for secrets
- **Review dependencies**: Check for known vulnerabilities before adding new packages
- **Follow secure coding**: Sanitize inputs, validate data, use parameterized queries
- **Keep dependencies updated**: Regularly update dependencies to patch security issues

---

## 📞 Getting Help

- Check existing documentation
- Search closed issues and PRs
- Ask in GitHub Discussions
- Reach out to maintainers

For questions about this workflow, open an issue with the `question` label.
