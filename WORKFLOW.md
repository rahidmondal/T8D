# 🧪 Team Workflow Guide

## 🔧 How We Work

- **`main`**: Only for stable, production-ready releases.
- **`dev`**: Active development branch.
- All new branches **must start from `dev`** and are merged back via Pull Requests (PRs).

---

## 🌱 Branch Naming

Follow consistent branch naming conventions:

- `feature/<name>` – for new features
- `fix/<name>` – for bug fixes
- `hotfix/<name>` – for urgent, critical fixes
- `improvement/<name>` – for UI/UX or general improvements
- `test/<name>` – for writing or improving tests
- `docs/<name>` - for documentation

**Examples:**

```
feature/user-profile
fix/login-bug
hotfix/payment-crash
```

---

## ✍️ Commit Format

Each commit message should include a **header**, with optional **body** and **footer** sections.

### 📌 Header Format

```
<type>(<optional-scope>): <short summary>
```

**Example:**

```
feat(auth): add social login support
```

### 🔠 Full Format

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>         ← (optional; use for context, reasoning, or implications)
<BLANK LINE>
<footer>       ← (optional; references, breaking changes, etc.)
```

---

### ✅ Commit Types

- `feat` – New feature
- `fix` – Bug fix
- `refactor` – Code restructuring (no behavior change)
- `style` – Formatting only (whitespace, commas, etc.)
- `docs` – Documentation updates only
- `test` – Adding or modifying tests
- `chore` – Non-functional updates (e.g., configs, tooling)
- `ci` – Changes to CI/CD pipelines
- `build` – Build tools or dependency changes
- `revert` – Reverting a previous commit
- `perf` – Performance improvements
- `merge` – Manual merge commits

---

## 🚀 Versioning & Releases

We follow semantic versioning:
`v<major>.<minor>.<patch>`

- **Patch** – Minor fixes or small features
- **Minor** – Completed feature/module milestones
- **Major** – Public stable release or major revamp

## Development Process

1. Create branch from `dev` Preferable with the issue name.
2. Make changes with proper commits
3. Test your changes
4. Create PR to `dev`
5. After review, merge to `dev`
