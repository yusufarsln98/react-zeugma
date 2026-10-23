---
name: react-zeugma-api-change-maintenance
description: Checklist and instructions for updating all documentation, contract tests, code examples, demos, and references across the monorepo after a change to the react-zeugma library API (props, hooks, types, utilities, or exports).
---

# Skill: API Change Maintenance

When a **react-zeugma** library API surface changes — e.g. a prop is added/removed/renamed, a hook signature changes, a type is modified, a utility function is added, or an export is removed — the entire monorepo must be audited and updated to stay in sync.

---

## 1. Core Architectural Invariants

Before updating any API surface, verify that changes comply with the library's design principles:

1. **Pure Spatial Topology**: The layout tree (`TreeNode` = `SplitNode | PaneNode`) represents spatial structure only. `PaneNode` has `tabIds: string[]` and `activeTabId: string`. It does **not** store mutable application state.
2. **Immutable Tab Metadata**: Tab metadata is decoupled into a fine-grained store (`useSyncExternalStore`). It is registered at tab creation (`initialMetadata`, `addTab`) and read via `findTabById(tabId)?.metadata`, `getTabMetadata(tabId)`, or `useTabMetadata(tabId)`. No imperative `updateMetadata` mutations exist on the layout controller.
3. **Pure Function Decomposition**: Tree mutations (`src/shared/lib/tree/*`) and drop resolution (`src/entities/zeugma/lib/resolve-drop.ts`) are pure, deterministic functions decoupled from React hooks and DOM operations.
4. **Three Public Entrypoints**:
   - `react-zeugma` (`packages/react-zeugma/src/index.ts`): Components, hooks, context, core types.
   - `react-zeugma/utils` (`packages/react-zeugma/src/utils.ts`): Pure tree manipulation utilities.
   - `react-zeugma/devtools` (`packages/react-zeugma/src/devtools.ts`): Render counters, badges, and footers.

---

## 2. Public Entrypoints & Runtime Contract Tests

Whenever an export is added, removed, or renamed:

### Files to Update

- **Main entry:** `packages/react-zeugma/src/index.ts`
- **Utils entry:** `packages/react-zeugma/src/utils.ts`
- **DevTools entry:** `packages/react-zeugma/src/devtools.ts`
- **Type definitions:** `packages/react-zeugma/src/shared/model/types.ts`

### Mandatory Contract Test

**File:** `packages/react-zeugma/src/__tests__/public-exports.test.ts`

This test snapshot-validates the exact exported keys of all three entrypoints. **You MUST update this test** to reflect the new or removed export, and verify that it passes:

```bash
npm test -- src/__tests__/public-exports.test.ts
```

---

## 3. Internal Modular Subsystems & Tests

The library is organized into single-responsibility modules. Implementations and tests live in dedicated directories:

| Subsystem            | Source Location                                | Tests Location                                   | Responsibility                                                                                              |
| :------------------- | :--------------------------------------------- | :----------------------------------------------- | :---------------------------------------------------------------------------------------------------------- |
| **Tree Factory**     | `src/shared/lib/tree/factory.ts`               | `characterization.test.ts`                       | Pure node constructors                                                                                      |
| **Tree Traversal**   | `src/shared/lib/tree/traverse.ts`              | `characterization.test.ts`                       | Visitor and depth-first walks                                                                               |
| **Tree Queries**     | `src/shared/lib/tree/query.ts`                 | `characterization.test.ts`                       | Finders (`findPaneById`, `findPaneContainingTab`, `findTabById`)                                            |
| **Pane Mutations**   | `src/shared/lib/tree/mutate-pane.ts`           | `characterization.test.ts`, `invariants.test.ts` | `splitPane`, `removePane`, `updatePaneLock`, `insertLeaf`                                                   |
| **Tab Mutations**    | `src/shared/lib/tree/mutate-tab.ts`            | `characterization.test.ts`                       | `addTab`, `removeTab`, `selectTab`, `moveTab`, `swapTabs`, `mergeTab`, `movePaneTabs`                       |
| **Tree Layout**      | `src/shared/lib/tree/layout.ts`                | `characterization.test.ts`                       | Split percentages & `computeLayout`                                                                         |
| **Tree Validation**  | `src/shared/lib/tree/validate.ts`              | `invariants.test.ts`                             | `isValidTreeNode`, cycle detection, structural guards                                                       |
| **Tree Barrel**      | `src/shared/lib/tree/index.ts`                 | All above                                        | Direct barrel export of the tree subsystem                                                                  |
| **Drop Resolution**  | `src/entities/zeugma/lib/resolve-drop.ts`      | `resolve-drop.test.ts`                           | Pure `resolveDrop` algorithm                                                                                |
| **DnD IDs**          | `src/shared/lib/dnd-ids.ts`                    | `dnd-ids.test.ts`                                | Typed ID builders and `parseDropTarget`                                                                     |
| **Pointer Tracking** | `src/entities/zeugma/lib/pointer.ts`           | `pointer.test.ts`                                | Pointer position math and calculations                                                                      |
| **Popout Subsystem** | `src/entities/zeugma/model/popout/*`           | `popout.test.ts`                                 | Window lifecycle (`window.ts`), style mirroring (`style-mirror.ts`), event interception (`interception.ts`) |
| **Resizer**          | `src/features/resize-pane/hooks/useResizer.ts` | `useResizer.test.tsx`                            | Split drag handle math and pointer events                                                                   |

**Action:** When adding or modifying tree operations, edit the specific module under `src/shared/lib/tree/`, re-export through `src/shared/lib/tree/index.ts` and `src/utils.ts`, and add tests in `characterization.test.ts` or `invariants.test.ts`.

---

## 4. Library README (Canonical Source of Truth)

**File:** `packages/react-zeugma/README.md`

This is the user-facing canonical documentation. It contains:

- Component prop tables (`<Zeugma>`, `<PaneTree>`, `<Pane>`, `<Tabs>`)
- Hook options and return tables (`useZeugma`, `useZeugmaContext`, `usePaneContext`, `useResizer`)
- Type definitions (`TreeNode`, `SplitNode`, `PaneNode`, `TabDetails`, `ZeugmaPersistOptions`, `ZeugmaClassNames`)
- Tree utility function signatures (`react-zeugma/utils`)
- Code examples (Quick Start, Standalone, Provider mode, Styling)

**Action:** Update the corresponding prop table, type signature, code block, or utility description.

---

## 5. AI Context Standards (SKILL.md & llms.txt)

Documentation is maintained solely via singleton AI standards:

- **SKILL.md:** `.agents/skills/react-zeugma/SKILL.md` (mirrored to `apps/homepage/public/SKILL.md`)
- **llms.txt:** `apps/homepage/public/llms.txt`

When an API surface changes, audit and update the type definitions, prop signatures, and code examples in:

1. `.agents/skills/react-zeugma/SKILL.md` (and copy to `apps/homepage/public/SKILL.md`)
2. `apps/homepage/public/llms.txt`

---

## 6. Demo Applications & Landing Pages

| File                                                                                | Key API Usage                                                                                        |
| :---------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------- |
| `apps/homepage/src/components/zeugma-demo-dashboard.tsx` & `zeugma-demo-dashboard/` | Full dashboard demo with `DashboardDrawer`, widget panels, controls drawer exposing `<Zeugma>` props |
| `apps/homepage/src/components/zeugma-demo-ide.tsx` & `zeugma-demo-ide/`             | IDE demo with multi-tab panes, tree layout, and popout widgets                                       |
| `apps/homepage/src/views/home/`                                                     | Landing page feature cards and live demo embed                                                       |

**Action:** If a `<Zeugma>` prop or controller method is modified, update the demo components and controls in `DashboardDrawer`.

---

## 7. Monorepo Verification Pipeline

Always run the full verification pipeline before committing or releasing any API change:

```bash
# 1. Run all unit tests (must pass 130+ tests across 14 test files)
npm test

# 2. Typecheck the entire monorepo
npm run typecheck

# 3. Lint the library source
npm run lint:lib

# 4. Build the library (produces ESM, CJS, and DTS bundles)
npm run build:lib

# 5. Build the homepage Next.js application
npm run build:homepage
```

---

## 8. Quick Audit Checklist

When changing any API, verify each item:

- [ ] **Implementation**: Added/updated in modular source file (e.g. `src/shared/lib/tree/<module>.ts`)
- [ ] **Re-export**: Re-exported through barrel (`tree-helpers.ts`) and entrypoint (`src/index.ts`, `src/utils.ts`, or `src/devtools.ts`)
- [ ] **Contract Test**: `packages/react-zeugma/src/__tests__/public-exports.test.ts` updated and passing
- [ ] **Unit Tests**: Added corresponding unit/invariant/characterization tests
- [ ] **Canonical README**: `packages/react-zeugma/README.md` prop tables, types, and examples updated
- [ ] **AI SKILL.md**: `.agents/skills/react-zeugma/SKILL.md` updated and mirrored to `apps/homepage/public/SKILL.md`
- [ ] **AI llms.txt**: `apps/homepage/public/llms.txt` updated
- [ ] **Interactive Demos**: `zeugma-demo-dashboard.tsx` and `zeugma-demo-ide.tsx` updated
- [ ] **Full Build**: `npm test`, `npm run typecheck`, `npm run lint:lib`, `npm run build:lib`, and `npm run build:homepage` all pass cleanly
