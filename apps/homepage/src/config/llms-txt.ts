/**
 * Canonical llms.txt content conforming to the llmstxt.org standard.
 * Provides high-density knowledge, architectural invariants, component APIs,
 * tree schemas, and utility reference for LLMs and AI coding assistants.
 */
export const LLMS_TXT_CONTENT = `# react-zeugma

> A headless, recursive drag-and-drop workspace layout engine for React 18 & 19. Built with TypeScript on @dnd-kit/core.

react-zeugma combines the recursive binary splitting model of react-mosaic with the declarative, state-driven API ergonomics of react-grid-layout. It is 100% style-agnostic (headless), supports multi-tab docking, isolated fine-grained reactivity, native multi-window popouts, and deterministic serialization.

## Navigation & Quick Links
- [Website & Documentation](https://react-zeugma.vercel.app/docs): Comprehensive documentation and interactive guides.
- [Interactive Demo](https://react-zeugma.vercel.app/demo): Live interactive workspace with multi-tab panels and window popouts.
- [GitHub Repository](https://github.com/yusufarsln98/react-zeugma): Source code, issues, and contributing guidelines.
- [npm Package](https://www.npmjs.com/package/react-zeugma): Official package distribution (v7.1).
- [SKILL.md Specification](https://react-zeugma.vercel.app/docs#skill-md): Official AI coding skill file for Antigravity, Cursor, and Claude Code.

## Documentation Index
- [Introduction & Architecture](https://react-zeugma.vercel.app/docs#introduction): Binary tree spatial topology vs 12-column coordinate grids.
- [Quick Start](https://react-zeugma.vercel.app/docs#quickstart): Installation (pnpm/npm/yarn/bun), standalone vs provider mode, custom pane composition.
- [Tree Layout Engine](https://react-zeugma.vercel.app/docs#tree-layout): Serialized binary tree interfaces (TreeNode, SplitNode, PaneNode, TabDetails).
- [State & Controller](https://react-zeugma.vercel.app/docs#state-controller): useZeugma hook, layout persistence, global and per-pane locking, fullscreen zoom.
- [Pane Customization](https://react-zeugma.vercel.app/docs#pane-customization): Compound components (Pane.DragHandle, Pane.Content, Pane.Tabs, Pane.Controls).
- [Advanced Features](https://react-zeugma.vercel.app/docs#advanced-features): Context hooks (useZeugmaContext, usePaneContext), multi-window popouts, devtools render counters.
- [API Reference](https://react-zeugma.vercel.app/docs#api-reference): Complete prop tables, controller methods, pane context properties, and tree utilities.
- [AI Integration](https://react-zeugma.vercel.app/docs#skill-md): Pre-configured AI coding assistant rules and configuration.

## Core Architectural Invariants & AI Constraints
1. **Immutable State Rule**: Never mutate layout \`TreeNode\` objects directly in-place. Treat them as immutable. Always use pure utility functions exported by \`react-zeugma/utils\` to perform mutations and return fresh tree references.
2. **Headless Styling Rule**: \`react-zeugma\` is 100% style-agnostic and applies no default CSS. You MUST specify class names in the \`classNames\` configuration on \`<Zeugma>\` (specifically for \`resizer\`, \`dropPreview\`, \`tabDropPreview\`, \`paneDragPreview\`, and \`tabDragPreview\`) or the layout features will be invisible/non-functional.
3. **renderPane Placement Rule**:
   - If using \`<Zeugma>\` with \`children\` (Context Provider Mode), pass \`renderPane\` directly to \`<PaneTree renderPane={renderPane} />\`. Passing \`renderPane\` to \`<Zeugma>\` is forbidden in provider mode.
   - If using \`<Zeugma>\` in standalone mode (without \`children\`), pass \`renderPane\` directly to \`<Zeugma renderPane={renderPane} />\`.
4. **DragHandle Placement Rule**: Draggable panes require a child \`<Pane.DragHandle>\` component to define the interactive drag region.
5. **Stable Layout During Drag Rule**: The logical \`layout\` object from the controller or context does not update in real-time during a drag session. It only updates once the drop action is committed. Visual removals and split previews are managed by the library's internal rendering layout.
6. **Immutable Tab Metadata Rule**: Tab metadata is decoupled from layout topology (\`TreeNode\`). Metadata is registered at tab creation (\`initialMetadata\`, \`addTab(tabId, targetPaneId?, metadata?)\`) and read via \`findTabById(tabId)?.metadata\`, \`getTabMetadata(tabId)\`, or \`useTabMetadata(tabId)\`. No imperative \`updateMetadata\` mutations exist on the layout controller.

## Layout Data Model (JSON Schema)
The workspace layout is serialized as a recursive binary tree of \`TreeNode\` elements:

\`\`\`ts
export type SplitDirection = 'row' | 'column'

export interface SplitNode {
  type: 'split'
  direction: SplitDirection
  first: TreeNode
  second: TreeNode
  splitPercentage: number // 0 to 100
}

export interface PaneNode {
  type: 'pane'
  id: string
  tabIds: string[]
  activeTabId: string
  locked?: boolean
  tabsMetadata?: Record<string, Record<string, unknown>>
}

export type TreeNode = SplitNode | PaneNode

export interface TabDetails {
  id: string
  paneId: string
  isActive: boolean
  index: number
  metadata: Record<string, unknown> | undefined
}
\`\`\`

- **\`PaneNode\` (Leaf)**: Holds active tab IDs (\`tabIds\`) and the selected \`activeTabId\`.
- **\`SplitNode\` (Branch)**: Divides space into \`first\` and \`second\` sub-trees based on \`splitPercentage\` (percentage of the first child's size relative to parent boundary).

## Installation
\`\`\`bash
npm install react-zeugma @dnd-kit/core
# or
pnpm add react-zeugma @dnd-kit/core
# or
yarn add react-zeugma @dnd-kit/core
# or
bun add react-zeugma @dnd-kit/core
\`\`\`

## Quick Start Example
\`\`\`tsx
import { useZeugma, Zeugma, Pane, TreeNode } from 'react-zeugma'

const initialLayout: TreeNode = {
  type: 'split',
  direction: 'row',
  splitPercentage: 30,
  first: { type: 'pane', id: 'left-panel', tabIds: ['left-panel'], activeTabId: 'left-panel' },
  second: { type: 'pane', id: 'right-panel', tabIds: ['right-panel'], activeTabId: 'right-panel' },
}

function DashboardPane({ id }: { id: string }) {
  return (
    <Pane id={id}>
      <div className="flex flex-col h-full bg-zinc-900 border border-zinc-700">
        <Pane.DragHandle className="p-2 bg-zinc-800 cursor-grab text-zinc-300 font-semibold select-none">
          {id}
        </Pane.DragHandle>
        <Pane.Content className="flex-1 p-4 text-zinc-400">
          {(tab) => <div>Active Tab Content: {tab.id}</div>}
        </Pane.Content>
      </div>
    </Pane>
  )
}

export default function WorkspaceApp() {
  const controller = useZeugma({ initialLayout })

  return (
    <div className="w-screen h-screen">
      <Zeugma
        controller={controller}
        renderPane={(paneId) => <DashboardPane id={paneId} />}
        classNames={{
          resizer: 'bg-zinc-800 hover:bg-indigo-500 transition-colors',
          dropPreview: 'bg-indigo-500/20 border-2 border-indigo-500 border-dashed',
        }}
      />
    </div>
  )
}
\`\`\`

## Key APIs & Entrypoints

### 1. Root Components & Hooks (\`react-zeugma\`)
- \`<Zeugma controller={controller} renderPane={...} classNames={...} persist={...} />\`: Root dashboard layout component.
- \`<PaneTree renderPane={...} />\`: Renders split tree when \`<Zeugma>\` is used as a context provider with children.
- \`<Pane id={id} locked={false}>\`: Individual panel wrapper establishing drag-and-drop boundary.
- \`<Pane.DragHandle>\`: Draggable region within pane.
- \`<Pane.Content>\`: Tab content renderer (accepts children or render function \`(tab) => ReactNode\`).
- \`<Pane.Controls>\`: Maximize/fullscreen and close buttons.
- \`<Tabs tabIds={...} activeTabId={...} selectTab={...} removeTab={...} />\`: Tab strip container and reorderable tabs.
- \`useZeugma(options)\`: Layout state controller hook.
- \`useZeugmaContext()\`: Access root actions and queries from nested components.
- \`usePaneContext()\`: Access pane state (id, tabIds, activeTabId, isFullscreen, remove, etc.) inside \`<Pane>\`.
- \`useResizer(props)\`: Custom split handle hook.

### 2. Pure Tree Manipulation Utilities (\`react-zeugma/utils\`)
- \`splitPane(tree, targetId, direction, splitType, paneToAdd)\`: Split pane and insert new node.
- \`removePane(tree, paneId)\`: Remove pane and collapse parent split.
- \`addTab(tree, targetPaneId, tabId, metadata?)\`: Append tab to pane.
- \`removeTab(tree, tabId)\`: Remove tab from its pane; collapse empty panes.
- \`selectTab(tree, paneId, tabId)\`: Activate tab in pane.
- \`mergeTab(tree, draggedTabId, targetPaneId)\`: Move tab from source to target pane.
- \`moveTab(tree, draggedTabId, targetTabId, position?)\`: Reorder tab before/after target tab or swap if center.
- \`swapTabs(tree, draggedTabId, targetTabId)\`: Swap positions and active states of two tabs.
- \`movePaneTabs(tree, draggedPaneId, targetTabId, position?)\`: Move all tabs from a pane before/after target tab.
- \`findPaneById(tree, paneId)\`: Query PaneNode by ID.
- \`findPaneContainingTab(tree, tabId)\`: Query parent PaneNode of a tab ID.
- \`findTabById(tree, tabId)\`: Query detailed tab state and position.
- \`updatePaneLock(tree, paneId, locked)\`: Update lock state of a specific pane.
- \`isValidTreeNode(node)\`: Validate node conformity with cycle detection.
- \`computeLayout(tree)\`: Calculate absolute box percentages { left, top, width, height }.

### 3. DevTools & Performance Profiling (\`react-zeugma/devtools\`)
- \`useRenderCounter(idOrOptions?, options?)\`: React 18/19 StrictMode-safe mount and render frequency counters.
- \`<RenderCounterBadge id={id} position="top-right" />\`: Overlay badge showing mounts and renders.
- \`<RenderCounterFooter id={id} label={label} />\`: Bottom status footer for widgets.
`
