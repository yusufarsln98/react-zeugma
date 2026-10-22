# Contributing to react-zeugma

Thank you for your interest in contributing! This document will help you get set up and guide you through the contribution process.

## Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **npm** ≥ 10

### Setup

```bash
# 1. Fork and clone the repository
git clone https://github.com/<your-username>/react-zeugma.git
cd react-zeugma

# 2. Install all workspace dependencies
npm install

# 3. Build the library
npm run build
```

### Development Scripts

| Command             | Description                                       |
| ------------------- | ------------------------------------------------- |
| `npm run dev`       | Watch mode — rebuilds the library on file changes |
| `npm run build`     | Production build (CJS + ESM + `.d.ts`)            |
| `npm run lint`      | Lint source files with ESLint                     |
| `npm run typecheck` | Run TypeScript type-checking                      |
| `npm run format`    | Format source files with Prettier                 |

---

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feat/my-feature
# or
git checkout -b fix/my-bugfix
```

### 2. Make Your Changes

- Write your code in `src/`
- Test interactively using the homepage app (npm run dev:homepage)
- Ensure `npm run lint` and `npm run typecheck` pass

### 3. Add a Changeset

We use [Changesets](https://github.com/changesets/changesets) for versioning and changelog generation. Before committing, run:

```bash
npx changeset
```

This will prompt you to:

1. Select the package (`react-zeugma`)
2. Choose the semver bump type (`patch`, `minor`, or `major`)
3. Write a short summary of your change

A markdown file will be created in `.changeset/` — commit it with your PR.

### 4. Commit & Push

Commits are automatically linted and formatted by the pre-commit hook (via Husky + lint-staged).

```bash
git add .
git commit -m "feat: add cool new feature"
git push origin feat/my-feature
```

### 5. Open a Pull Request

- Open a PR against the `master` branch
- CI will automatically run lint, type-check, and build checks
- Fill out the PR template and link any relevant issues

---

## Code Style

- **TypeScript** is required for all source code
- **Prettier** handles formatting (config in `.prettierrc`)
- **ESLint** handles linting
- Keep components focused and tree-shakeable
- Prefer named exports over default exports

---

## Project Structure

```
react-zeugma/
├── apps/                 # Workspace applications (homepage)
├── packages/             # Workspace packages (react-zeugma)
├── .changeset/           # Changeset configuration
├── .github/workflows/    # CI and release workflows
├── dist/                 # Build output (gitignored)
└── package.json
```

---

## Releasing

Versioning and releasing to NPM are fully automated via GitHub Actions using Changesets:

1. **Add a changeset**: Before committing your code, run `npx changeset` to create a changeset description. Commit the generated file with your PR.
2. **Merge PR**: When a PR is merged into `master`, the workflow runs. If new changesets are present, it will automatically open or update a **"Version Packages"** Pull Request.
3. **Publish to NPM**: Merging the **"Version Packages"** Pull Request into `master` triggers the release workflow to build the library, publish it to NPM, and create the corresponding Git tag and GitHub Release.

---

## Questions?

Open an [issue](https://github.com/yusufarsln98/react-zeugma/issues) or start a [discussion](https://github.com/yusufarsln98/react-zeugma/discussions).

Thank you for helping make `react-zeugma` better.
