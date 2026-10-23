# react-zeugma

A recursive, drag-and-drop dashboard layout engine for React. It combines the tree-based, arbitrary splitting capabilities of `react-mosaic` with the declarative, state-driven API model of `react-grid-layout`, powered by `@dnd-kit/core`.

[![npm version](https://img.shields.io/npm/v/react-zeugma?color=brightgreen&style=flat-square)](https://www.npmjs.com/package/react-zeugma)
[![bundle size](https://img.shields.io/bundlephobia/minzip/react-zeugma?color=blue&style=flat-square)](https://bundlephobia.com/package/react-zeugma)
[![license](https://img.shields.io/npm/l/react-zeugma?color=yellow&style=flat-square)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)

It is completely style-agnostic (headless), meaning you style all container states, resizers, and drop previews with your own class names.

## Installation

```bash
npm install react-zeugma
```

## Quick Start

Initialize your layout tree with `useZeugma` and render the dashboard using `<Zeugma>`.

```tsx
import { useZeugma, Zeugma, Pane, TreeNode } from 'react-zeugma'

// 1. Define the initial layout tree structure
const initialLayout: TreeNode = {
  type: 'split',
  direction: 'row',
  splitPercentage: 30,
  first: { type: 'pane', id: 'left-panel', tabIds: ['left-panel'], activeTabId: 'left-panel' },
  second: { type: 'pane', id: 'right-panel', tabIds: ['right-panel'], activeTabId: 'right-panel' },
}

// 2. Build your custom pane wrapper
function DashboardPane({ id }: { id: string }) {
  return (
    <Pane id={id}>
      <div className="flex flex-col h-full bg-zinc-900 border border-zinc-700">
        <Pane.DragHandle className="p-2 bg-zinc-800 cursor-grab text-zinc-300 font-semibold">
          {id}
        </Pane.DragHandle>
        <Pane.Content className="flex-1 p-4 text-zinc-400">
          {(tab) => <div>Active Tab Content: {tab.id}</div>}
        </Pane.Content>
      </div>
    </Pane>
  )
}

// 3. Mount the layout controller and dashboard renderer
export default function DashboardApp() {
  const controller = useZeugma({ initialLayout })

  return (
    <div className="w-screen h-screen">
      <Zeugma controller={controller} renderPane={(paneId) => <DashboardPane id={paneId} />} />
    </div>
  )
}
```

---

## API Reference

### Components

#### `<Zeugma>`

The root provider and layout renderer. It configures the drag-and-drop context, calculates panel positions, and renders resize splitters.

##### Usage

```tsx
import { Zeugma } from 'react-zeugma'
;<Zeugma
  controller={controller}
  renderPane={(paneId) => <MyPane id={paneId} />}
  resizerSize={4}
  dragActivationDistance={8}
  snapThreshold={8}
  minSplitPercentage={5}
  maxSplitPercentage={95}
  enableDragToDismiss={false}
  dismissThreshold={60}
  classNames={{
    dashboard: 'bg-zinc-950',
    pane: 'rounded-lg overflow-hidden',
    resizer: 'bg-zinc-800 hover:bg-indigo-500 transition-colors',
    dropPreview: 'bg-indigo-500/20 border border-indigo-500',
  }}
  onRemove={(paneId) => console.log(`Pane ${paneId} closed`)}
  onResizeEnd={(currentNode, percentage) => console.log('Resized to', percentage)}
/>
```

##### Props

| Property                  | Description                                                                                                                                                                             | Type                                                                                                                                                                                             | Default |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- |
| `controller`              | The layout state controller returned by `useZeugma(options)`.                                                                                                                           | `ZeugmaController`                                                                                                                                                                               | -       |
| `children`                | Children components rendered inside the context provider.                                                                                                                               | `ReactNode`                                                                                                                                                                                      | -       |
| `renderPane`              | Callback function to map active pane IDs to custom pane structures. Required in standalone mode (without children) and must not be passed in provider mode.                             | `(paneId: string) => ReactNode`                                                                                                                                                                  | -       |
| `renderDragOverlay`       | Custom overlay renderer function for the drag-under-cursor preview.                                                                                                                     | `(active: DragOverlayActiveItem) => ReactNode`                                                                                                                                                   | -       |
| `classNames`              | CSS class name mapping overrides for custom dashboard and overlay styling.                                                                                                              | `ZeugmaClassNames`                                                                                                                                                                               | -       |
| `resizerSize`             | Thickness of the split resizer bars in pixels.                                                                                                                                          | `number`                                                                                                                                                                                         | `4`     |
| `dragActivationDistance`  | Minimum pointer drag distance (in pixels) required to activate dragging.                                                                                                                | `number`                                                                                                                                                                                         | `8`     |
| `snapThreshold`           | Threshold in pixels to snap layout resizers to adjacent edges.                                                                                                                          | `number`                                                                                                                                                                                         | `8`     |
| `minSplitPercentage`      | Minimum split limit percentage allowed for resized panes.                                                                                                                               | `number`                                                                                                                                                                                         | `5`     |
| `maxSplitPercentage`      | Maximum split limit percentage allowed for resized panes.                                                                                                                               | `number`                                                                                                                                                                                         | `95`    |
| `enableDragToDismiss`     | Enables drag-out-to-dismiss gesture for widgets.                                                                                                                                        | `boolean`                                                                                                                                                                                        | `false` |
| `dismissThreshold`        | Distance in pixels outside container bounds required to trigger dismissal.                                                                                                              | `number`                                                                                                                                                                                         | `60`    |
| `onRemove`                | Callback triggered when a pane is removed.                                                                                                                                              | `(paneId: string) => void`                                                                                                                                                                       | -       |
| `onDragStart`             | Callback triggered when a drag gesture begins.                                                                                                                                          | `(activeId: string) => void`                                                                                                                                                                     | -       |
| `onDragEnd`               | Callback triggered when a drag gesture ends, containing active pane, target pane, and action metadata.                                                                                  | `(activeId: string, overId: string \| null, dropAction: { type: 'split' \| 'move'; direction?: SplitDirection; position?: 'top' \| 'bottom' \| 'left' \| 'right' \| 'center' } \| null) => void` | -       |
| `onResizeStart`           | Callback triggered when resizing begins.                                                                                                                                                | `(currentNode: SplitNode) => void`                                                                                                                                                               | -       |
| `onResize`                | Callback triggered during pane resizing.                                                                                                                                                | `(currentNode: SplitNode, percentage: number) => void`                                                                                                                                           | -       |
| `onResizeEnd`             | Callback triggered when pane resizing completes.                                                                                                                                        | `(currentNode: SplitNode, percentage: number) => void`                                                                                                                                           | -       |
| `onDismissIntentChange`   | Callback triggered when drag-out dismiss intent changes.                                                                                                                                | `(paneId: string \| null) => void`                                                                                                                                                               | -       |
| `persist`                 | Layout persistence configuration in localStorage. If true, uses default options.                                                                                                        | `boolean \| ZeugmaPersistOptions`                                                                                                                                                                | `false` |
| `renderPopoutWrapper`     | **[Experimental]** Custom wrapper to inject context or style managers (e.g. `styled-components`' `StyleSheetManager` or `antd`'s `StyleProvider`/`ConfigProvider`) into popout windows. | `(props: { tabId: string; document: Document; window: Window; children: React.ReactNode }) => React.ReactNode`                                                                                   | -       |
| `renderPopoutPlaceholder` | **[Experimental]** Custom renderer for the placeholder shown in a pane when its active tab is popped out into a new window.                                                             | `(props: PopoutPlaceholderProps) => ReactNode`                                                                                                                                                   | -       |

##### `ZeugmaPersistOptions`

```ts
interface ZeugmaPersistOptions {
  /** Whether layout persistence is enabled. Defaults to true if this configuration object is provided. */
  enabled?: boolean
  /** The key used for localStorage persistence. Defaults to 'zeugma-layout'. */
  key?: string
}
```

##### `TabDetails`

```ts
interface TabDetails {
  /** The tab's unique ID. */
  id: string
  /** The ID of the pane containing this tab. */
  paneId: string
  /** True if this tab is currently selected/active. */
  isActive: boolean
  /** The tab's 0-indexed position in the pane tab bar. */
  index: number
  /** Custom metadata associated with this tab. */
  metadata?: Record<string, unknown>
  /** **[Experimental]** Force-remount the component during window transitions instead of adopting the DOM node. */
  remountOnPopout?: boolean
}
```

---

#### `<PaneTree>`

Recursively renders the dashboard grid hierarchy (resizers, split panels, and active pane contents). **Must be rendered when using `<Zeugma>` as a context provider.**

##### Usage

```tsx
import { Zeugma, PaneTree } from 'react-zeugma'
;<Zeugma controller={controller}>
  <div className="workspace">
    <PaneTree renderPane={(paneId) => <MyPane id={paneId} />} />
  </div>
</Zeugma>
```

##### Props

| Property        | Description                                                                               | Type                            | Default |
| --------------- | ----------------------------------------------------------------------------------------- | ------------------------------- | ------- |
| `renderPane`    | **Required**. Callback function mapping unique pane IDs to custom `<Pane>` components.    | `(paneId: string) => ReactNode` | -       |
| `tree`          | Optional layout subtree to render (defaults to the root layout tree from the controller). | `TreeNode \| null`              | -       |
| `resizerSize`   | Optional override for the thickness of split resizer handles in pixels.                   | `number`                        | `4`     |
| `snapThreshold` | Optional override for the snapping threshold of resizer handles in pixels.                | `number`                        | `8`     |

---

#### `<Pane>`

Wraps each individual pane/widget within the dashboard, establishing drag-and-drop boundaries.

- **`<Pane.DragHandle>`**: Defines the interactive header or area used to drag the pane.
- **`<Pane.Content>`**: Renders the active tab's content. Accepts a child render function `(tab) => React.ReactNode` or static ReactNode, and an optional `renderPopoutPlaceholder` callback when the tab is popped out into a separate window.
- **`<Pane.Controls>`**: Renders standard control buttons for closing or maximizing the pane.

##### Usage

```tsx
import { Pane } from 'react-zeugma'
;<Pane id="pane-1" locked={false}>
  <Pane.DragHandle className="p-2 cursor-grab bg-zinc-800">
    <span>Pane Title</span>
  </Pane.DragHandle>
  <Pane.Controls />
  <Pane.Content
    className="p-4"
    renderPopoutPlaceholder={({ tabId, dock }) => (
      <div>
        <span>Tab {tabId} open in new window</span>
        <button onClick={dock}>Dock Back</button>
      </div>
    )}
  >
    {(tab) => <div>Rendered content for tab: {tab.id}</div>}
  </Pane.Content>
</Pane>
```

##### Props

| Property   | Description                                                        | Type                  | Default |
| ---------- | ------------------------------------------------------------------ | --------------------- | ------- |
| `id`       | The unique ID corresponding to the layout node.                    | `string`              | -       |
| `children` | Children components rendered inside the pane.                      | `React.ReactNode`     | -       |
| `style`    | Optional inline CSS styles applied to the outer pane container.    | `React.CSSProperties` | -       |
| `locked`   | Optional override to lock this specific pane and disable dragging. | `boolean`             | `false` |

---

#### `<Tabs>`

A helper component to render and reorder a list of tabs inside a pane.

##### Usage

```tsx
import { Tabs } from 'react-zeugma'
;<Tabs
  tabIds={['tab1', 'tab2']}
  activeTabId="tab1"
  selectTab={(tabId) => console.log('Select tab:', tabId)}
  removeTab={(tabId) => console.log('Close tab:', tabId)}
  renderTab={({ tabId, activeTabId, onSelect, onRemove }) => (
    <button
      onClick={onSelect}
      className={`px-3 py-1 ${tabId === activeTabId ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}
    >
      {tabId}
      <span
        className="ml-2 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
      >
        ×
      </span>
    </button>
  )}
/>
```

##### Props

| Property       | Description                                            | Type                                                                                                                                                                                                                                             | Default |
| -------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- |
| `tabIds`       | Array of tab IDs.                                      | `string[]`                                                                                                                                                                                                                                       | -       |
| `activeTabId`  | The currently active tab ID.                           | `string`                                                                                                                                                                                                                                         | -       |
| `locked`       | Whether tab dragging/reordering is disabled.           | `boolean`                                                                                                                                                                                                                                        | `false` |
| `tabsMetadata` | Metadata mapping associated with each tab in the pane. | `Record<string, Record<string, unknown>>`                                                                                                                                                                                                        | -       |
| `selectTab`    | Callback when a tab is selected.                       | `(id: string) => void`                                                                                                                                                                                                                           | -       |
| `removeTab`    | Callback when a tab is closed.                         | `(id: string) => void`                                                                                                                                                                                                                           | -       |
| `classNames`   | Custom class names for the container and tabs.         | `{ container?: string; tab?: string \| ((tabId: string) => string) }`                                                                                                                                                                            | -       |
| `styles`       | Custom CSS style overrides for the container and tabs. | `{ container?: CSSProperties; tab?: CSSProperties \| ((tabId: string) => CSSProperties) }`                                                                                                                                                       | -       |
| `renderTab`    | Render prop function called for each tab item.         | `(props: { tabId: string; activeTabId: string; isDragging: boolean; isOver: boolean; metadata?: Record<string, unknown>; onSelect: () => void; onRemove: () => void; isPoppedOut: boolean; popout: () => void; dock: () => void }) => ReactNode` | -       |

---

### Hooks

#### `useZeugma(options)`

A custom state hook that instantiates the dashboard layout engine and returns the controller.

##### Usage

```tsx
import { useZeugma } from 'react-zeugma'

const controller = useZeugma({
  initialLayout: myInitialLayoutTree, // used on mount
  layout: myControlledLayout, // used for controlled mode
  onChange: (nextLayout) => {}, // layout update callback
  locked: false, // lock all dragging and resizing
  fullscreenPaneId: null, // ID of pane to zoom fullscreen
  onFullscreenChange: (paneId) => {}, // callback when pane zoom toggled
})
```

##### Options

| Parameter            | Description                                                                                                                                                              | Type                                    | Default |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------- | ------- |
| `initialLayout`      | Initial layout tree structure. Only used on mount.                                                                                                                       | `TreeNode \| null`                      | `null`  |
| `layout`             | Controlled layout tree structure. Hook runs in controlled mode if provided.                                                                                              | `TreeNode \| null`                      | `null`  |
| `onChange`           | Callback triggered when the layout tree updates.                                                                                                                         | `(newLayout: TreeNode \| null) => void` | -       |
| `fullscreenPaneId`   | Controlled fullscreen pane ID. When active (not null), structural layout changes (closes, additions, splits, merges, resizes, and popouts) are blocked at the API level. | `string \| null`                        | `null`  |
| `onFullscreenChange` | Callback triggered when fullscreen state toggles.                                                                                                                        | `(paneId: string \| null) => void`      | -       |
| `locked`             | Global lock status to disable resizing and drag-and-drop operations.                                                                                                     | `boolean`                               | `false` |

---

#### `useZeugmaContext()`

Context hook to retrieve layout state, queries, and mutation actions from anywhere under the `<Zeugma>` tree.

##### Usage

```tsx
import { useZeugmaContext } from 'react-zeugma'

const { layout, locked, setLocked, addTab, removePane, selectTab, findPaneById } =
  useZeugmaContext()
```

##### Context Values

| Property / Method       | Description                                                                                                                                                             | Type                                                                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `layout`                | The current active layout tree structure.                                                                                                                               | `TreeNode \| null`                                                                                                            |
| `fullscreenPaneId`      | The ID of the maximized fullscreen pane. When active, structural layout changes (closes, additions, splits, merges, resizes, and popouts) are blocked at the API level. | `string \| null`                                                                                                              |
| `locked`                | Whether the dashboard layout is globally locked.                                                                                                                        | `boolean`                                                                                                                     |
| `setLayout`             | React state setter to update the layout tree.                                                                                                                           | `Dispatch<SetStateAction<TreeNode \| null>>`                                                                                  |
| `setFullscreenPaneId`   | Updates the active fullscreen pane ID.                                                                                                                                  | `(paneId: string \| null) => void`                                                                                            |
| `setLocked`             | Updates the global layout lock state.                                                                                                                                   | `Dispatch<SetStateAction<boolean>>`                                                                                           |
| `removePane`            | Removes a pane and collapses the split.                                                                                                                                 | `(paneId: string) => void`                                                                                                    |
| `addTab`                | Adds a tab to a pane, or splits/creates one if target is omitted.                                                                                                       | `(tabId: string, targetPaneId?: string, metadata?: Record<string, unknown>) => void`                                          |
| `updatePaneLock`        | Toggles the lock status of a specific pane.                                                                                                                             | `(paneId: string, locked: boolean) => void`                                                                                   |
| `selectTab`             | Focuses/activates a tab within a pane.                                                                                                                                  | `(paneId: string, tabId: string) => void`                                                                                     |
| `mergeTab`              | Programmatically drags and drops a tab from one pane to another.                                                                                                        | `(draggedTabId: string, targetPaneId: string) => void`                                                                        |
| `removeTab`             | Programmatically closes a tab.                                                                                                                                          | `(tabId: string) => void`                                                                                                     |
| `splitPane`             | Programmatically splits a pane node and adds a new one.                                                                                                                 | `(targetId: string, direction: SplitDirection, splitType: 'left' \| 'right' \| 'top' \| 'bottom', paneToAdd: string) => void` |
| `updateSplitPercentage` | Updates a SplitNode percentage.                                                                                                                                         | `(currentNode: SplitNode, percentage: number) => void`                                                                        |
| `moveTab`               | Reorders a tab next to another, or swaps them if position is 'center'.                                                                                                  | `(draggedTabId: string, targetTabId: string, position?: 'before' \| 'after' \| 'center') => void`                             |
| `findPaneById`          | Queries a PaneNode by its unique ID.                                                                                                                                    | `(paneId: string) => PaneNode \| null`                                                                                        |
| `findPaneContainingTab` | Queries the parent PaneNode of a tab ID.                                                                                                                                | `(tabId: string) => PaneNode \| null`                                                                                         |
| `findTabById`           | Queries detailed tab location and state metadata.                                                                                                                       | `(tabId: string) => TabDetails \| null`                                                                                       |
| `getTabMetadata`        | Gets metadata for a tab ID.                                                                                                                                             | `(tabId: string) => Record<string, unknown> \| undefined`                                                                     |
| `getActiveTabMetadata`  | Gets metadata for the active tab in a pane.                                                                                                                             | `(paneId: string) => Record<string, unknown> \| undefined`                                                                    |
| `poppedOutTabIds`       | **[Experimental]** The list of tab/widget IDs that are currently open in a new window.                                                                                  | `string[]`                                                                                                                    |
| `popoutTab`             | **[Experimental]** Popout the specified tab into a new window.                                                                                                          | `(tabId: string) => void`                                                                                                     |
| `dockTab`               | **[Experimental]** Dock the specified tab back to the main layout.                                                                                                      | `(tabId: string) => void`                                                                                                     |

---

#### `usePaneContext()`

Context hook to access the state and actions of a specific pane. Must be used inside a `<Pane>` component.

##### Usage

```tsx
import { usePaneContext } from 'react-zeugma'

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
} = usePaneContext()
```

##### Context Values

| Property / Method      | Description                                                                | Type                                                   |
| ---------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------ |
| `id`                   | The ID of the current pane.                                                | `string`                                               |
| `tabIds`               | List of tab IDs inside the pane.                                           | `string[]`                                             |
| `activeTabId`          | Currently active tab ID.                                                   | `string`                                               |
| `isDragging`           | `true` if this pane is being dragged.                                      | `boolean`                                              |
| `isFullscreen`         | `true` if this pane is maximized.                                          | `boolean`                                              |
| `toggleFullscreen`     | Toggles maximized state for this pane.                                     | `() => void`                                           |
| `remove`               | Removes this pane from the layout tree.                                    | `() => void`                                           |
| `selectTab`            | Activates a tab within this pane.                                          | `(tabId: string) => void`                              |
| `removeTab`            | Closes a tab from this pane.                                               | `(tabId: string) => void`                              |
| `metadata`             | Active tab's custom metadata.                                              | `Record<string, unknown> \| undefined`                 |
| `locked`               | Whether the pane or the dashboard is locked.                               | `boolean`                                              |
| `tabsMetadata`         | Tab metadata mapping for all tabs inside this pane.                        | `Record<string, Record<string, unknown>> \| undefined` |
| `isActiveTabPoppedOut` | **[Experimental]** Whether the active tab is popped out into a new window. | `boolean`                                              |
| `popoutTab`            | **[Experimental]** Popout the active tab into a new window.                | `(tabId?: string) => void`                             |
| `dockTab`              | **[Experimental]** Dock the active tab back to the main layout.            | `(tabId?: string) => void`                             |

---

#### `useResizer(props)`

Low-level hook for implementing custom pane resizing handles.

##### Usage

```tsx
import { useResizer } from 'react-zeugma'

const handlePointerDown = useResizer({
  containerRef,
  isRow,
  direction,
  splitPercentage,
  resizerSize,
  snapThreshold,
  layout,
  currentNode,
  onLayoutChange: (nextTree) => {},
})
```

---

## Layout Utilities

Import utility functions from `react-zeugma/utils` to programmatically query or update the serialized layout tree.

##### Usage

```ts
import {
  generateUniqueId,
  splitPane,
  removePane,
  addTab,
  removeTab,
  selectTab,
  mergeTab,
  moveTab,
  movePaneTabs,
  findPaneById,
  findPaneContainingTab,
  findTabById,
  computeLayout,
} from 'react-zeugma/utils'

// 1. Generate a random unique pane ID
const newPaneId = generateUniqueId()

// 2. Programmatically split a target pane in the tree
const updatedTree = splitPane(currentTree, 'explorer', 'row', 'right', 'terminal')

// 3. Programmatically add a tab to a pane
const updatedTree = addTab(currentTree, 'editor', 'new-file.js', { status: 'unsaved' })

// 4. Find which pane contains a specific tab
const parentPane = findPaneContainingTab(currentTree, 'new-file.js')
```

---

## Styling & Class Names

`react-zeugma` is 100% headless. You must style resizers, previews, and containers by providing custom class names.

##### Usage

```tsx
<Zeugma
  controller={controller}
  classNames={{
    dashboard: 'dashboard-root',
    pane: 'pane-wrapper',
    resizer: 'custom-resizer-line',
    dropPreview: 'drop-preview-box',
    tabDropPreview: 'tab-line-preview',
  }}
/>
```

##### Class Names Mapping

| Class Key                | Description                                                                   |
| ------------------------ | ----------------------------------------------------------------------------- |
| `dashboard`              | Root dashboard grid container.                                                |
| `dashboardDismissActive` | Dashboard container when active item is dragged outside to dismiss.           |
| `dashboardLocked`        | Dashboard container when layout is globally locked.                           |
| `pane`                   | Outer container div of each `<Pane>`.                                         |
| `paneLocked`             | Pane container wrapper when locked.                                           |
| `paneContainer`          | Pane inner content container wrapper.                                         |
| `paneHeader`             | Drag header wrapper inside the pane.                                          |
| `paneControls`           | Controls wrapper container (maximizing, close, lock).                         |
| `paneButton`             | Maximize/Close control buttons.                                               |
| `dropPreview`            | Preview indicator box for edge layout splits.                                 |
| `rootDropPreview`        | Preview indicator for full layout splits.                                     |
| `dragOverlay`            | Absolute portal wrapper following the dragging cursor.                        |
| `paneDragPreview`        | Outer wrapper container of a pane drag preview node.                          |
| `tabDragPreview`         | Outer wrapper container of a tab drag preview node.                           |
| `resizer`                | Pointer-drag splitter handle bars.                                            |
| `dismissPreview`         | Background indicator showing visual drag-to-dismiss zones.                    |
| `lockedPreview`          | Hover visual feedback indicator for locked pane zones.                        |
| `tabDropPreview`         | Tab list insertion indicator line.                                            |
| `tabSeparator`           | Line separator between static tabs.                                           |
| `tabContentWrapper`      | Custom tab content element wrapper.                                           |
| `tabsContainer`          | Layout tabs container header bar.                                             |
| `tab`                    | Individual tab list items.                                                    |
| `tabCloseButton`         | Close button inside a tab item.                                               |
| `dragHandle`             | Drag target region.                                                           |
| `popoutPlaceholder`      | Custom placeholder container when a tab is popped out into a separate window. |

---

## Popout Window Styling (Experimental)

> [!WARNING]
> Popout window capabilities (opening tabs in separate browser windows via `window.open` and React portals) are **experimental** and may experience limitations or browser warnings depending on popup blockers, iframe restrictions, and context cleanup in third-party libraries. Use with caution in production.

> [!NOTE]
> React Zeugma automatically clones and synchronizes all static stylesheets, `<link>` tags, and document attributes (such as `data-theme` or body classes) from the main window to any active popout window in real-time. You only need `renderPopoutWrapper` to configure dynamic CSS-in-JS style injection and context provider redirection.

When using CSS-in-JS libraries like `styled-components` or `antd` (Ant Design) inside your widgets, dynamic styles are injected into the main document's `<head>` by default. In popped-out tabs, these dynamic styles will not apply because they render inside a separate window. Additionally, shared JS context caches will prevent styles from being re-emitted unless a separate cache instance is created.

You can use the `renderPopoutWrapper` callback prop on the `<Zeugma>` component to wrap popped-out widgets with the required style managers and providers targeting the child window's DOM.

##### Example (`styled-components` & `antd`):

```tsx
import React, { useMemo } from 'react'
import { StyleSheetManager } from 'styled-components'
import { StyleProvider, createCache } from '@ant-design/cssinjs'
import { ConfigProvider } from 'antd'

// Using a wrapper component is recommended to safely instantiate a style cache per popout window
const PopoutStyleManager = ({ document, children }) => {
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
>
  {/* Dashboard grid structure */}
</Zeugma>
```

---

## DevTools & Performance Profiling (`react-zeugma/devtools`)

`react-zeugma` includes built-in DevTools utilities to audit component mount lifecycles and render frequencies across complex dashboard layouts.

### Usage

```tsx
import { useRenderCounter, RenderCounterBadge, RenderCounterFooter } from 'react-zeugma/devtools'
// Or directly from 'react-zeugma'
// import { useRenderCounter, RenderCounterBadge, RenderCounterFooter } from 'react-zeugma'

function MyDashboardWidget({ id }: { id: string }) {
  // Hook usage
  const { mounts, renders, reset } = useRenderCounter(id, { logToConsole: true })

  return (
    <RenderCounterFooter label={id} id={id}>
      <div className="p-4">
        <p>Mount count: {mounts}</p>
        <p>Render count: {renders}</p>
        <button onClick={reset}>Reset Counters</button>
      </div>
    </RenderCounterFooter>
  )
}
```

### Components & Hooks

- `useRenderCounter(idOrOptions?, options?)`: React 18/19 StrictMode-safe hook returning `{ mounts, renders, reset }`.
- `<RenderCounterBadge id={id} position="top-right" className="..." />`: Unstyled overlay badge for any panel or component.
- `<RenderCounterFooter id={id} label="Widget Name" className="..." footerClassName="...">`: Unstyled wrapper component rendering a bottom status footer for tabbed widgets.

---

## AI Integration (SKILL.md & llms.txt)

React Zeugma provides official context specifications optimized for AI coding assistants (Google Antigravity, Cursor, Claude Code, GitHub Copilot) and LLMs:

- **SKILL.md**: Copy the specification below into `.agents/skills/react-zeugma/SKILL.md` or `.cursor/rules/` to guide AI agents to generate hallucination-free recursive layout trees.
- **llms.txt**: A curated plaintext summary conforming to [llmstxt.org](https://llmstxt.org) is available at [https://www.react-zeugma.com/llms.txt](https://www.react-zeugma.com/llms.txt).

````markdown
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

// 1. Create a wrapper component to instantiate a style cache per window
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

// 2. Pass it as renderPopoutWrapper
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
````
