---
name: react-zeugma
description: Rules, types, component composition, and programmatic manipulation guidelines for integrating and using the react-zeugma dashboard layout engine.
---

# Skill: Using react-zeugma

`react-zeugma` is a recursive drag-and-drop dashboard layout engine for React. It manages tree-based pane splitting (similar to `react-mosaic`) and provides a declarative state-driven API (similar to `react-grid-layout`) built on `@dnd-kit/core`.

---

## 1. Core AI Rules & Constraints

- **Immutable State Rule**: Never mutate layout `TreeNode` objects directly in-place. You must treat them as immutable. Always use the pure utility functions exported by `react-zeugma/utils` to perform mutations and return fresh tree references.
- **Headless Styling Rule**: `react-zeugma` is 100% style-agnostic and applies no default CSS. You MUST specify class names in the `classNames` configuration on `<Zeugma>` (specifically for `resizer`, `dropPreview`, `tabDropPreview`, `paneDragPreview`, and `tabDragPreview`) or the layout features will be invisible/non-functional.
- **renderPane Placement Rule**: If using `<Zeugma>` with `children` (Context Provider Mode), you MUST pass the `renderPane` prop directly to `<PaneTree renderPane={renderPane} />`, and `renderPane` is forbidden on `<Zeugma>`. If using `<Zeugma>` in standalone mode (without `children`), you MUST pass `renderPane` directly to `<Zeugma renderPane={renderPane} />`.
- **DragHandle Placement**: Draggable panes require a child `<Pane.DragHandle>` component to define the interactive drag region.
- **Stable Layout During Drag Rule**: The logical `layout` object from the controller or context does not update in real-time during a drag session. It only updates once the drop action is committed. The active visual removals and split previews are managed by the library's internal rendering layout.
- **Immutable Tab Metadata**: Tab metadata is decoupled from the layout topology (`TreeNode`). Metadata is registered at tab creation (`initialMetadata`, `addTab(tabId, targetPaneId?, metadata?)`) and read via `findTabById(tabId)?.metadata`, `getTabMetadata(tabId)`, or `useTabMetadata(tabId)`. No imperative `updateMetadata` mutations exist.

---

## 2. Layout Data Model (JSON Schema)

The dashboard layout is serialized as a recursive binary tree of `TreeNode` elements:

```ts
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
```

- **`PaneNode` (Leaf)**: Holds active tab IDs (`tabIds`) and the selected `activeTabId`.
- **`SplitNode` (Branch)**: Divides space into `first` and `second` sub-trees based on `splitPercentage` (percentage of the first child's size relative to the parent boundary).

---

## 3. Component Composition Rules

### Standalone Renderer

```tsx
import { useZeugma, Zeugma, Pane } from 'react-zeugma'

function Dashboard() {
  const controller = useZeugma({ initialLayout })
  return (
    <Zeugma
      controller={controller}
      renderPane={(id) => (
        <Pane id={id}>
          <Pane.DragHandle className="drag">Header</Pane.DragHandle>
          <Pane.Content>{(tab) => <div>{tab.id}</div>}</Pane.Content>
        </Pane>
      )}
    />
  )
}
```

### Context Provider Mode

If `<Zeugma>` wraps child components, it serves as a Context Provider. Use `<PaneTree>` (imported from `react-zeugma`) inside it to render the visual panels and pass the `renderPane` function directly to `<PaneTree>`:

```tsx
import { useZeugma, Zeugma, PaneTree, Pane } from 'react-zeugma'

function Dashboard() {
  const controller = useZeugma({ initialLayout })
  const renderPane = (id: string) => (
    <Pane id={id}>
      <Pane.DragHandle className="drag">Header</Pane.DragHandle>
      <Pane.Content>{(tab) => <div>{tab.id}</div>}</Pane.Content>
    </Pane>
  )
  return (
    <Zeugma controller={controller}>
      <div className="custom-wrapper">
        <PaneTree renderPane={renderPane} />
      </div>
    </Zeugma>
  )
}
```

---

## 4. API Reference and Configurations

### `<Zeugma>` Component Props

- `controller`: The layout state controller returned by `useZeugma(options)`.
- `persist?: boolean | ZeugmaPersistOptions`: Layout persistence configuration in localStorage.
  - `enabled?: boolean`: Whether layout persistence is enabled (defaults to true).
  - `key?: string`: The localStorage key (defaults to `'zeugma-layout'`).
- `renderPopoutWrapper?: (props: { tabId: string; document: Document; window: Window; children: React.ReactNode }) => React.ReactNode`: [Experimental] Optional custom wrapper to inject style managers or providers into popout windows.

### `useZeugma(options)`

Instantiates the dashboard state engine.

- `initialLayout?: TreeNode | null` (Initial uncontrolled tree)
- `layout?: TreeNode | null` (Controlled layout tree)
- `onChange?: (newLayout: TreeNode | null) => void` (Layout updates handler)
- `locked?: boolean` (Disable all resize/drag-and-drop operations)
- `fullscreenPaneId?: string | null` (Maximize target pane ID. When active, structural layout changes are blocked)
- `onFullscreenChange?: (paneId: string | null) => void` (Maximize toggle handler)

### `useZeugmaContext()`

Access actions and queries from parent `<Zeugma>` context:

```ts
const {
  layout,
  locked,
  setLocked,
  setLayout,
  removePane,
  addTab,
  selectTab,
  splitPane,
  updatePaneLock,
  findPaneById,
  findPaneContainingTab,
  findTabById,
  getTabMetadata,
  getActiveTabMetadata,
  poppedOutTabIds,
  popoutTab,
  dockTab,
} = useZeugmaContext()
```

### `usePaneContext()`

Access details inside a child component of `<Pane>`:

```ts
const {
  id,
  tabIds,
  activeTabId,
  isDragging,
  isFullscreen,
  toggleFullscreen,
  remove,
  selectTab,
  removeTab,
  metadata,
  locked,
  tabsMetadata,
  isActiveTabPoppedOut,
  popoutTab,
  dockTab,
} = usePaneContext()
```

---

## 5. Pure Tree Manipulation Utilities

Import these layout mutators/queries from `react-zeugma/utils`:

- **`splitPane(tree, targetId, direction, splitType, paneToAdd)`**: Splits `targetId` pane in a direction (`'row'` / `'column'`) and split type (`'left'` | `'right'` | `'top'` | `'bottom'`). `paneToAdd` can be a tab ID string or a full `PaneNode`. Returns the updated tree.
- **`removePane(tree, paneId)`**: Removes a pane and collapses the parent split. Returns the updated tree.
- **`addTab(tree, targetPaneId, tabId, metadata?)`**: Appends a tab to a target pane and sets it active. Returns the updated tree.
- **`removeTab(tree, tabId)`**: Removes a tab from its pane; collapses empty panes. Returns the updated tree.
- **`selectTab(tree, paneId, tabId)`**: Activates a tab inside a pane. Returns the updated tree.
- **`mergeTab(tree, draggedTabId, targetPaneId)`**: Moves a tab from its source pane to target pane. Returns the updated tree.
- **`moveTab(tree, draggedTabId, targetTabId, position?)`**: Moves a tab before/after target tab, or swaps them if position is `'center'`. Returns the updated tree.
- **`swapTabs(tree, draggedTabId, targetTabId)`**: Swaps the positions and active states of two tabs. Returns the updated tree.
- **`movePaneTabs(tree, draggedPaneId, targetTabId, position?)`**: Moves all tabs from a dragged pane before/after target tab. Returns the updated tree.
- **`findPaneById(tree, paneId)`**: Returns matching `PaneNode` or `null`.
- **`findPaneContainingTab(tree, tabId)`**: Returns parent `PaneNode` containing the tab, or `null`.
- **`findTabById(tree, tabId)`**: Returns `TabDetails` or `null`.
- **`updatePaneLock(tree, paneId, locked)`**: Updates the lock state of a specific pane. Returns the updated tree.
- **`isValidTreeNode(node)`**: Validates that an object conforms to the structural `TreeNode` schema with cycle detection.
- **`computeLayout(tree)`**: Calculates absolute positions (`{ left, top, width, height }` as percentages) for all panes and splitters.

---

## 6. Popout Window Styling (Experimental)

When using CSS-in-JS libraries like `styled-components` or `@ant-design/cssinjs` (Ant Design) inside widgets, dynamic styles are injected into the main document's head by default. To make styles apply in popout windows (which are separate windows/documents), use `renderPopoutWrapper` to wrap popped-out widgets with appropriate style providers and cache targets.

React Zeugma automatically clones and syncs static stylesheets, `<link>` tags, and document attributes (such as `data-theme`) to popouts in real-time. Only dynamic CSS-in-JS injection needs wrapping.

### Example Configuration:

```tsx
import React, { useMemo } from 'react'
import { StyleSheetManager } from 'styled-components'
import { StyleProvider, createCache } from '@ant-design/cssinjs'
import { ConfigProvider } from 'antd'

function PopoutStyleManager({ document, children }) {
  const cache = useMemo(() => createCache(), [])

  return (
    <StyleSheetManager target={document.head}>
      <StyleProvider cache={cache} container={document.head}>
        <ConfigProvider getPopupContainer={() => document.body}>{children}</ConfigProvider>
      </StyleProvider>
    </StyleSheetManager>
  )
}

;<Zeugma
  controller={controller}
  renderPopoutWrapper={({ document, children }) => (
    <PopoutStyleManager document={document}>{children}</PopoutStyleManager>
  )}
/>
```

---

## 7. DevTools & Performance Profiling (`react-zeugma/devtools`)

Import mount and render counter utilities from `react-zeugma/devtools` or `react-zeugma`:

- **`useRenderCounter(idOrOptions?, options?)`**: Tracks component mount counts and render cycle passes in a React 18/19 StrictMode safe manner. Returns `{ mounts, renders, reset }`.
- **`<RenderCounterBadge id={id} position="top-right" disabled={disabled} className="..." />`**: Unstyled overlay badge displaying mount and render metrics.
- **`<RenderCounterFooter id={id} label={label} disabled={disabled} className="..." footerClassName="...">`**: Unstyled bottom status footer bar for tabbed widgets or layout panels.

---

## 8. LLM Context Standard (llms.txt)

React Zeugma provides an official, curated `/llms.txt` document conforming to the [llmstxt.org](https://llmstxt.org) standard:

- **URL**: `https://www.react-zeugma.com/llms.txt`
- **Use Case**: Ingesting high-density architecture, layout schemas, and API reference into LLMs (NotebookLM, Claude, ChatGPT, or custom RAG vectors) without parsing HTML.
