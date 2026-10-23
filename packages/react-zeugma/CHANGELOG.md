# react-zeugma

## 7.2.0

### Minor Changes

- 3685354: Make popout placeholder in `Pane.Content` style-agnostic and headless:

  - Remove hardcoded default values, container styling (`#161719`), blue button (`#2563eb`), hover events, and static copy from `Pane.Content`.
  - Add `renderPopoutPlaceholder` prop to `Pane.Content` and `Zeugma` to allow custom placeholder rendering with `{ tabId, dock }`.
  - Add `popoutPlaceholder` class name to `ZeugmaClassNames`.
  - Export `PopoutPlaceholderProps` and `PaneContentProps` from `react-zeugma`.

## 7.1.2

### Patch Changes

- Refactor core layout subsystems, modularize tree helpers, and harden drag-and-drop architecture:
  - Modularize tree algorithms into single-responsibility modules under `src/shared/lib/tree/` (`factory`, `traverse`, `query`, `mutate-pane`, `mutate-tab`, `layout`, `validate`, `compare`).
  - Decouple drag-and-drop drop resolution into pure deterministic `resolveDrop` algorithm (`src/entities/zeugma/lib/resolve-drop.ts`) and add typed DnD ID helpers (`src/shared/lib/dnd-ids.ts`).
  - Modularize popout window management, style mirroring, and event interception under `src/entities/zeugma/model/popout/`.
  - Add runtime public API export contract tests (`public-exports.test.ts`), structural invariant tests, and characterization regression suites.
  - Upgrade `@changesets/cli` to `3.0.3` to eliminate all transitive security vulnerabilities (`braces`, `sprintf-js`).

## 7.1.1

### Patch Changes

- Resolve security audit findings, harden supply chain, and enhance drag/resize resilience:
  - Add `pointercancel` and `blur` event handlers to drag sessions and cleanup refs in `useResizer` to prevent stuck resizing states when pointers are interrupted.
  - Wrap `localStorage` access in `try/catch` and add schema validation (`isValidTreeNode`) in `useZeugmaPersistence` to guard against corrupted or invalid stored layouts.
  - Add `WeakSet` cycle detection and recursion depth guard in `compare.ts` to prevent call stack overflow.
  - Clean up DevTools render counter store entries when listeners reach zero to eliminate memory leaks.
  - Remove global window/document monkey-patching in `useZeugmaPopouts` and guard against SSR ReferenceError.
  - Export `isValidTreeNode` utility from `react-zeugma/utils`.

## 7.1.0

### Minor Changes

- Make tab and pane metadata strictly immutable and remove metadata mutation APIs (`updateMetadata`, `updateTabMetadata`). Tab metadata is defined on initial layout declaration or via `addTab(tabId, targetPaneId?, metadata?)` and preserved across layout actions.

## 7.0.0

### Major Changes

- **Decoupled Tab Metadata & Isolated Reactivity**:
  - Removed `tabsMetadata` from `PaneNode` and the layout `TreeNode` hierarchy. Layout trees now represent pure spatial topology (`id`, `tabIds`, `activeTabId`, `locked`).
  - Introduced fine-grained metadata store backed by React 18/19 `useSyncExternalStore` (`useTabMetadata(tabId)` and `useAllMetadata()`).
  - Mutating tab metadata via `controller.updateMetadata(tabId, updater)` re-renders only the targeted tab/widget without re-rendering the layout tree, split resizers, or sibling tabs, and without triggering `onChange(layout)`.
  - Added controlled metadata options (`initialMetadata`, `metadata`, `onMetadataChange`) to `useZeugma()`.
  - Added automatic metadata persistence to `localStorage` when `persist` is enabled.

## 6.9.12

### Patch Changes

- fix: always force widget remounting on popout transitions to prevent style/context/DOM side effects

## 6.9.9

### Patch Changes

- Eliminate remaining Tailwind CSS inline utility classes in `<RenderCounterFooter>` component and replace them with explicit inline style attributes.
- Replace Tailwind styling on popout window root container in `useZeugmaPopouts` with standard styles and rename the class to `zeugma-popout-container`.

## 6.9.8

### Patch Changes

- Restore `renderPopoutWrapper` callback prop on `<Zeugma>` component to allow wrapping popped-out widgets with custom style/context providers (e.g. styled-components StyleSheetManager or antd ConfigProvider).

## 6.9.7

### Patch Changes

- Remove hardcoded default Tailwind CSS classes from DevTools components (`RenderCounterBadge` and `RenderCounterFooter`) to keep them completely style-agnostic and unstyled for consumer applications.

## 6.9.6

### Patch Changes

- Add built-in DevTools utilities (`react-zeugma/devtools`) featuring React 18/19 StrictMode-safe mount and render counters (`useRenderCounter`, `<RenderCounterBadge>`, `<RenderCounterFooter>`).

## 6.9.5

### Patch Changes

- Prevent layout modifications (closes, additions, splits, merges, resizes, and popouts) at the API level when a pane/tab is in fullscreen mode.

## 6.9.4

### Patch Changes

- Automatically close and clean up active popout windows when the corresponding widget is removed from the layout tree.

## 6.9.3

### Patch Changes

- Fix a regression where widgets were remounted when popped out into separate windows or docked back to the main layout. The portal wrapper element is now adopted to the target document rather than recreated, preserving React portal target references and keeping widget state intact.

## 6.9.2

### Patch Changes

- Fix Ant Design dropdown positioning, theme CSS variables injection, and relative font/image asset resolution inside popout portal windows.

## 6.9.1

### Patch Changes

- Add `renderPopoutWrapper` callback prop to allow wrapping popped-out widgets with custom style/context providers (e.g. styled-components StyleSheetManager or antd ConfigProvider).
- Add `remountOnPopout` option to TabDetails to force-remount specific widgets during window transitions instead of using `adoptNode` (essential for context-bound libraries like Leaflet or AG Grid).
- Implement dynamic style syncing via `MutationObserver` on the main document's head, mirroring newly added styles and absolute-resolved `<link>` elements to all open popouts in real-time.
- Delay child window closures during docking by one frame to let React cleanly execute all portal unmount and cleanup hooks before the context is destroyed.

## 6.9.0

### Minor Changes

- **Popout Tabs (Open in a New Window)**:
  - Re-introduced support for popping out tabs/widgets into separate browser window views.
  - Implemented stable React portal target management using DOM-level `document.adoptNode` and window redirection, preventing components from unmounting and keeping widget runtime states completely intact.
  - Added the `useZeugmaPopouts` hook to manage the lifecycle of popout windows, dynamically copy stylesheets, body classes, and background styles, and focus existing popouts.
  - Patched standard React hooks (`useEffect`, `useLayoutEffect`, `useInsertionEffect`) and DOM APIs (`createElement`, `getElementById`, `querySelector`, etc.) dynamically inside popout contexts to support third-party libraries.
  - Exposed `popoutTab(tabId)` and `dockTab(tabId)` actions, `poppedOutTabIds` state, and `isTabPoppedOut(tabId)` queries via `useZeugmaContext` and `usePaneContext`.
  - Added a placeholder screen in empty/popped-out panes allowing users to dock panels back manually.
  - Integrated popout/dock controls and a new interactive `MapPanel` widget into the homepage demo dashboard.
  - Updated library `README.md`, developer API references, and AI skill configurations to cover popout APIs.

## 6.8.0

### Minor Changes

- **Tab Swapping Drop Zone**:
  - Added a 5th center drop zone to panes (active only when dragging a tab) that swaps the dragged tab with the active tab of the target pane.
  - Exposed a new `swapPreview` custom classname in `ZeugmaClassNames` to style the swap overlay.

## 6.7.4

### Patch Changes

- Disable dragging and dropping of panes and tabs when a pane is zoomed to fullscreen.

## 6.7.3

### Patch Changes

- Implement dragging pane directly into tabs.

## 6.7.2

### Patch Changes

- **Fix metadata being undefined**
  - Error on metadatas fixed when dragging a tab or pane in a multi-tabbed layout.

## 6.7.1

### Patch Changes

- **Refactor render tabs function**
  - Renamed `tabs` to `tabIds` in `TreeNode` interface.
  - Updated renderTabs function to take a singleton tab details.
- **Fix metadata being undefined**
  - Fixed the problem during the tab dragging.

## 6.7.0

### Minor Changes

- **Layout Persistence Support**:
  - Added support for layout persistence using `localStorage`.
  - Introduced the `persist` prop on `<Zeugma>` component, allowing configuring persistence as a boolean (to enable layout saving/restoring with the default key `'zeugma-layout'`) or as a `ZeugmaPersistOptions` object (supporting custom `key` and `enabled` flag).
  - Isolated the persistence logic into a dedicated `useZeugmaPersistence` custom hook.
- **Fixed Multi-Tab Drag Visibility**:
  - Fixed a bug where dragging a tab in a multi-tabbed pane did not visually remove it from the pane's tab list during the drag session. Pane components now resolve their tabs and state using the active `renderingLayout` instead of the logical `layout`.
- **Fixed Tab Drop Back No-Op State Desync**:
  - Fixed a bug where dropping a tab back to its original layout position did not restore it visually on screen (desync between logical layout and rendering layout due to identical/no-op layout state comparisons). `setLayout` now always force-synchronizes `renderingLayout` to the committed layout structure.
- **Fixed Drag Preview Content Rendering**:
  - Fixed a bug where grabbing a tab or pane left the drag preview overlay empty (since the item is removed from the active `renderingLayout`). Pane components now resolve their children and tabs using the original logical `layout` structure when they match the active dragging ID.

## 6.6.2

### Patch Changes

- **Layout State Decoupling**:
  - Decoupled the logical `layout` from the internal `renderingLayout` so the context layout remains stable and unchanged until the user drops the widget.
  - Excluded `renderingLayout` from the public `ZeugmaController` interface to keep internal transitions encapsulated.
- **Resizing Pointer Events Prevention**:
  - Globally disabled pointer events on all non-separator pane elements during resizing sessions to prevent iframe focus/cursor locking.
- **Fixed Default Drag Dimensions**:
  - Removed dynamic bounding rect calculations on drag overlay and hardcoded default widget dimensions to 420px width and 260px height.
- **Default Drag Overlay Scaling**:
  - Implemented automatic scaling of the cursor-following drag preview overlay to `0.8` (using a smooth `150ms` cubic-bezier transition) when there is an active drag-to-dismiss gesture, with no other style overrides.
  - Set `transformOrigin` to `top left` to ensure correct cursor alignment.

## 6.6.1

### Patch Changes

- **Custom Drag Preview ClassNames**:
  - Exposed `paneDragPreview` and `tabDragPreview` keys under `classNames` on `<Zeugma>` to allow styling cursor-following drag preview overlays without default or fallback class names.
  - Updated `stableClassNames` shallow memoization list inside `<Zeugma>` to include the new preview class names.
  - Updated API references in `README.md` and the `react-zeugma` documentation article.

## 6.6.0

### Minor Changes

- **Drag Actual Node Previews & Style-Agnostic Refactoring**:
  - Implemented actual widget/pane content rendering inside the tab drag overlay by treating the dragged tab as a temporary single-tab pane, automatically portalling the live widget content.
  - Sized the tab drag overlay container dynamically to match the parent pane it originated from.
  - Prevented the tab header registration from being prematurely cleared on drag start by checking a shared `activeIdRef` in the portal registry during tab unmount.
  - Refactored code by extracting large components and hooks into separate modules (`DragOverlayPreview`, `FlatSplitter`, `customCollisionDetection`, `useAllTabIds`, `useZeugmaDragMeasurement`, `useRegisterRenderPane`).
  - Removed all non-positional inline styles (shadows, opacity, background, borders, border-radius) from default drag previews to keep the core library fully style-agnostic.

## 6.5.2

### Patch Changes

- Required `controller` prop in `ZeugmaProps` and enforced `renderPane` placement directly on `<PaneTree>` component in provider mode, restricting `<Zeugma>` from accepting `renderPane` when nested children are present.

## 6.5.1

### Patch Changes

- Refactored `<Zeugma>` component to behave strictly as a provider when `children` are supplied, requiring the user to explicitly render `<PaneTree />` inside the children. When no children are provided, it automatically renders `<PaneTree />` in standalone mode.

## 6.5.0

### Minor Changes

- Consolidated ZeugmaProvider and Zeugma into a single `<Zeugma>` component that acts as a provider by default.

## 6.4.2

### Patch Changes

- Refactored the homepage dashboard demo to consume the `ZeugmaProvider` context directly, eliminating prop drilling for widget toggles and layout presets.
- Fixed the drag-out-to-dismiss gesture ("drop to release") for pane-level drag inputs by passing the `removePane` action and checking whether the dragged node is a tab or a pane container.

## 6.4.1

### Patch Changes

- Refactored `ZeugmaProviderProps` to extend `ZeugmaProps` using TypeScript Omit utility instead of duplicating all configuration/callback prop definitions.
- Refactored `<Zeugma>` component into `<ZeugmaProvider>` and `<ZeugmaRenderer>` to support wrapping descendant layout/toolbar components in context while keeping `<PaneTree>` internal and backward-compatible.
- Encapsulated and hid internal context objects (`ZeugmaStateContext`, `ZeugmaActionsContext`) and hooks (`useZeugmaState`, `useZeugmaActions`, `useZeugmaDrag`) from the package's public API surface exports.

## 6.4.0

### Minor Changes

- **Zeugma API Overhaul & Compound Pane Components**:
  - Replaced the old render-prop pattern on `<Pane>` with a declarative, compound-component based API using subcomponents: `<Pane.Content>`, `<Pane.DragHandle>`, `<Pane.Tabs>`, `<Pane.Tab>`, and `<Pane.Controls>`.
  - Introduced `PaneContext` and simplified state flow, making the `<PaneTree>` component internal and removing the need for developers to import or render it manually.
  - Refactored `ZeugmaController` type architecture, segmenting it into `ZeugmaState`, `ZeugmaStateSetters`, `ZeugmaActions`, and `ZeugmaQueries` to eliminate duplicate state and action structures.
  - Cleaned up type assertions, replacing redundant double-casts (`as unknown as`) and improving types in test suites (`useZeugmaDnd.test.tsx`, `ZeugmaContext.test.tsx`, `ZeugmaRemount.test.tsx`).

## 6.3.0

### Minor Changes

- **First-class Widget Support & Layout Tree Refactoring**:
  - Introduced `WidgetNode` leaf type (`{ type: 'widget', id: string, locked?: boolean, metadata?: Record<string, unknown> }`) to support simple, non-tabbed widgets directly in the split tree.
  - Replaced `PaneNode` as the exclusive leaf node type with `LeafNode`, representing `PaneNode | WidgetNode`. Updated `TreeNode` to be `SplitNode | LeafNode`.
  - Refactored `addPane` and `updateTabMetadata` into `addWidget` and `updateMetadata` across the controller APIs and utility helpers.
  - Updated `addTab` signature to take `(tabId, targetPaneId?, metadata?)` to optionally spawn new panes or append to existing ones.
  - Updated `findPaneById` to return `LeafNode | null` instead of `PaneNode | null`.
  - Integrated `Widget` rendering and layout support directly into `<PaneTree>`, DND collision detection, and drag-and-drop actions.

## 6.2.2

### Patch Changes

- Ensure `setLayout` resets transient/drag state when called publicly.
- Make internal layout setter `_internalSetLayout` required on the controller context.

## 6.2.1

### Patch Changes

- Add rootDropPreview configuration and update drop zone styling and dimensions.

## 6.2.0

### Minor Changes

- **Revert and Remove Popup Windows (Popout Tabs)**:
  - Reverted and completely removed all code, utilities, state hooks, contexts, and helper APIs relating to the "Open in a New Window" (popout tabs) feature.
  - Removed `popoutTabs` state map, `setTabPopout` actions, `TabWindowContext`, `useTabWindow` hook, `usePopupWindow` hook, `copyStyles` and `getOrCreateHiddenContainer` DOM helpers.
  - Portal redirection logic (adopted node, intercepting of `document.body` overrides, etc.) has been completely cleaned up.
  - Reverted the workspace homepage demo to exclude popout trigger buttons and active tab placeholder rendering.

## 6.1.3

### Patch Changes

- Implemented automatic, zero-configuration React Portal and popup window document redirection. Intercepted DOM prototype elements (`body`, `documentElement`, `createElement`) and Node insertions (`appendChild`, `insertBefore`) to automatically redirect standard portals/popovers (e.g. Radix UI, shadcn/ui, Ant Design) to the correct popped-out window document context without manual configuration.
- Added `TabWindowContext` and `useTabWindow` hook to expose the tab's current active window and document context.
- Fixed a bug where HMR (Hot Module Replacement) caused tab content to go blank until tab selection changed.

## 6.1.2

### Patch Changes

- Fixed a bug where popped-out tab portal target registration was not updated when target element mounted/unmounted. Refactored the internal registration handler in `Pane.tsx` to track the element as state (`targetEl`) instead of a simple ref to support layout transitions (popout/restore) and Fast Refresh (HMR).
- Improved popout window CSS theme synchronization by copying all HTML and Body attributes (classes, styling, dataset keys) in `dom.ts` to ensure CSS variables and theme styles (e.g. Tailwind v4 and Next.js dark mode) propagate correctly.
- Synchronized initial popup window document initialization via synchronous `document.write` in `hooks.ts` to prevent asynchronous browser `about:blank` document reload from wiping custom styles/elements.
- Resolved TypeScript compiler typecheck errors on testing mock instances in `useZeugmaDnd.test.tsx` and `ZeugmaContext.test.tsx`.

## 6.1.1

### Patch Changes

- Refactored popped-out tab state tracking: Migrated the ephemeral `openInNewWindow` window state out of the generic layout `tabsMetadata` tree into a dedicated `popoutTabs` state map and `setTabPopout` action directly on the `ZeugmaController` context.

## 6.1.0

### Minor Changes

- **Open in a New Window Feature (Popout Tabs)**:
  - Added support for popping out tabs into separate popup window views via the `openInNewWindow` metadata property.
  - Implemented stable React portal target management using DOM-level `document.adoptNode` and `win.document.adoptNode` migration, preventing components from unmounting and keeping widget runtime states (like input fields, scroll offsets, etc.) completely intact when opening and closing popups.
  - Implemented automatic styling synchronisation that copies stylesheets dynamically from the parent workspace document to the popped-out document context.
  - Set up window monitoring via `beforeunload` events and polling to automatically restore popped-out tabs back to the main workspace layout when closed.
  - Added the `getOrCreateHiddenContainer` DOM helper utility exported from `react-zeugma/utils`.
  - Added the `usePopupWindow` custom lifecycle hook.

## 6.0.5

### Patch Changes

- Remove the deprecated `ResizableContainer` component and its exports.

## 6.0.4

### Patch Changes

- Support dropping dragging panes and tabs into root container boundaries.

## 6.0.3

### Patch Changes

- Implement style-agnostic root container drop zones for splitting the entire layout at the dashboard boundaries.

## 6.0.2

### Patch Changes

- The dragged element selected as the active tab in its parent pane.

## 6.0.1

### Patch Changes

- Prevent layout object change/mutation when starting a drag operation. The layout is now only updated when a drag is successfully completed (dropped), ensuring consumer applications do not receive incomplete/deleted layouts in their `onChange` handlers mid-drag.

## 6.0.0

### Major Changes

- **Tab Detachment & Live Layout Estimation during Drag**:
  - The active dragged pane or tab is now immediately detached (removed) from the runtime `layout` tree when dragging starts, providing a live, accurate visual estimation of the final layout structure.
  - Introduced the `layoutBeforeDrag` and `setLayoutBeforeDrag` properties to the public `ZeugmaController` interface and `useZeugma` hook to track the pre-drag layout state.
  - Leveraged `layoutBeforeDrag` to preserve portal-based widget mount states (preventing unmounting during drag) and to safely restore the layout if the drag is canceled or dropped on invalid target zones.
  - Consolidated internal types: removed `ZeugmaInternalController` and `ZeugmaInternalStateValue` in favor of unified public interfaces.
- **Refactored Tab Drop Preview Indicator**:
  - Moved tab drop preview rendering from individual `<Tab>` elements into the parent `<Tabs>` container.
  - Tab drop previews are now dynamically rendered at the calculated insertion index exactly between adjacent tabs (or at list boundaries) using a zero-width flex placeholder container, avoiding layout shifting or overlap.
  - Introduced `calculateTabDropIndex` utility helper exported from `react-zeugma/utils`.
- **Expanded Pane Splitting Activation Zones**:
  - Readjusted the interactive split-preview activation overlays within `<Pane>` to cover the entire container (100% width for top/bottom, 50% width for left/right), removing dead zones and making pane splitting gestures highly responsive.

## 5.7.1

### Patch Changes

- Fixed a bug where a pane could be incorrectly dragged and placed inside tab containers by disabling tab droppables and filtering out tab collision detectors when dragging a pane.

## 5.7.0

### Minor Changes

- Introduced the tab separator/divider line feature (`tabSeparator` option in `classNames` configuration), rendering separator indicators between adjacent tabs with smart layout rules (hidden on the first, active, and immediate right-of-active tabs) to cleanly divide tabs.
- Simplified the tab drop preview splitter rendering by using a single `tabDropPreview` class name, positioning the element automatically at left/right boundaries without default inline colors/styles, allowing full custom CSS styling.
- Removed unused default fallback classes (`zeugma-resizable-container`, `disabled`, and `zeugma-resizable-handle`) from the `<ResizableContainer>` and its resize handle.

## 5.6.0

### Minor Changes

- Introduced internal `TabsContext` and `TabContext` (accessed via `useTabContext` hook) for cleaner and decoupled tab management, completely eliminating prop-drilling for custom tab renderers.
- Exposed active drag item (`activeId`, `activeType`) and dismiss intent ID (`dismissIntentId`) on the public state context and `ZeugmaController` APIs to simplify custom layout integration.
- Refactored the `<Tabs>` component to use a mandatory `renderTab` prop and restored support for nested `classNames` and `styles` objects (supporting either static objects/strings or per-tab dynamic function callbacks), while removing the automatic class and style hoisting/cloning from custom child elements.

## 5.5.0

### Minor Changes

- Optimised drag-and-drop performance by splitting volatile hover states (`overTabId`, `overTabPosition`) into a dedicated `ZeugmaDragContext` (accessed via `useZeugmaDrag`), reducing layout rendering waterfalls.
- Wrapped `PortalHostItem` in `React.memo` to isolate widget rendering and prevent layout/widget thrashing during active dragging.
- Configured functional comparison updates for drag states inside `useZeugmaDnd` to avoid redundant React render scheduling.

## 5.4.1

### Patch Changes

- Fixed tabs list rendering and update logic by improving internal event handling and state updates.

## 5.4.0

### Minor Changes

- Introduced the `<Tabs>` container component to handle tab rendering and encapsulate internal drag-and-drop mechanics.
- Hidden `<Tab>` from public exports to simplify the API surface.
- Updated documentation and internal demo usages to consume the new `<Tabs>` component.

## 5.3.2

### Minor Changes

- Reverted TabsList component, PaneContext, and layout optimization changes, restoring the stable workspace demo.

## 5.2.1

### Patch Changes

- Fixed stale closures and layout state overwriting in programmatic actions by introducing ref-based layout tracking (`layoutRef`).
- Resolved context actions identity instability by memoizing all mutations and query methods with ref-based layout dependencies.
- Added programmatic tab uniqueness checks to `addTab` preventing duplicate tab IDs across panes.
- Exposed remaining helper/setter actions (`setFullscreenPaneId`, `setLocked`, `splitPane`, `updateSplitPercentage`, `moveTab`) in public context actions.

## 5.2.0

### Minor Changes

- Added the `addTab` action to `useZeugmaContext` / `ZeugmaController` actions to programmatically append a tab to a specific pane with optional custom metadata.
- Added optional `metadata` argument to the `addPane` action to initialize newly added panes with custom tab metadata.
- Updated the interactive workspace demo with an "Add Tab" button (+) inside pane control bars to easily test programmatic tab spawning with randomized titles, notes, and color metadata.

## 5.1.0

### Minor Changes

- Added the `findTabById` helper function to search for and retrieve specific tab details from the layout tree.
- Exposed tree query methods (`findPaneById`, `findPaneContainingTab`, `findTabById`) and the global lock state updater (`setLocked`) directly on the Zeugma state context for simplified consumption from child components.

## 5.0.0

### Major Changes

- **Terminated Legacy Swap Terminology**:
  - Replaced the obsolete `swap` drop action type with `move` in `onDragEnd` callbacks and types (`types.ts`, `useZeugmaDnd.ts`, and `demo.tsx`).
  - Cleaned up comments and styling documentation referring to layout swaps, aligning the vocabulary with the actual move/reorder actions.
- **Exposed API Refactoring & Context Separation**:
  - Restructured `ZeugmaController` and context types to separate public API from internal drag-and-drop orchestration state variables (such as `activeId`, `activeType`, `dismissIntentId`, `containerRef`, etc.), cleaning up the TypeScript surface.
  - Removed internal actions like `splitPane`, `updateSplitPercentage`, and `moveTab` from the public actions context (`ZeugmaActionsValue`).
  - Renamed `onLayoutChange` context state setter function to `setLayout` across context interfaces and consumers to follow standard React hooks conventions.
- **Set Dragged Tab as Active & Internal Refactoring**:
  - Updated the drag-and-drop state machine to set a tab as the active pane tab immediately when dragging starts.
  - Refactored contexts, context hooks, and types into the `shared` layer to resolve cross-entity FSD dependencies between `entities/pane` and `entities/zeugma`.
  - Modularized `Zeugma.tsx` by extracting dnd-kit handlers, sensors, and collision detection into a dedicated `useZeugmaDnd` custom hook.
  - Fixed TypeScript configuration errors resulting from loose types and unused variables.
- **100% Headless Style-Agnostic Setup & Simplified Tab Drop Preview**:
  - Removed all internal default fallback class names (such as `zeugma-pane-locked`, `zeugma-locked-preview`, `zeugma-resizer`, `zeugma-dashboard-root`, `zeugma-dashboard-dismiss-active`, `zeugma-dashboard-locked`, and `zeugma-dismiss-preview`) to achieve a fully headless, style-agnostic library.
  - Added new `dashboard` and `dashboardDismissActive` options to the `ZeugmaClassNames` interface for styling the root container and its active dismiss state.
  - Replaced the tab drop preview system with an internally-rendered single line element in the `<Tab>` component. This line is absolute-positioned on left/right boundaries internally and can be customized via the single `tabDropPreview` class name.

## 4.1.1

### Patch Changes

- **Support Controlled Layout Property**:
  - Implemented both controlled (`layout`) and uncontrolled (`initialLayout`) state modes inside the `useZeugma` hook. The hook now operates in controlled mode when the `layout` prop is provided, and in uncontrolled (self-managed) mode using `initialLayout` on mount when it is omitted.

## 4.1.0

### Minor Changes

- **Unified Context Access Hook (`useZeugmaContext`)**:
  - Implemented and exported the new public `useZeugmaContext` hook to simplify dashboard integration. It merges `useZeugmaState` and `useZeugmaActions` into a single, comprehensive layout control hook, removing callback prop-drilling for external components like sidebars.
  - Added and exported the `ZeugmaContextValue` type interface.

## 4.0.0

### Major Changes

- **Flat API Refactoring & useZeugma Hook Integration (Simplified root API & Context encapsulation)**:
  - Introduced the brand new **`useZeugma` hook**, allowing developers to declare and manage layout state, configuration, and actions setup locally within their components.
  - Re-architected the `<Zeugma>` component props to directly extend `ZeugmaController`. This allows spreading the return value of `useZeugma` directly (e.g., `<Zeugma {...zeugma} />`) rather than manually passing separate `layout`, `onChange`, and other state/callback props individually.
  - Removed internal context hooks (`useZeugmaState`, `useZeugmaActions`) from public exports in `packages/react-zeugma/src/index.ts` to fully encapsulate internal state mechanics and simplify the public library surface.

## 3.0.1

### Patch Changes

- **Bento Puzzle Enhancements & Theme-Specific Styling**:
  - Implemented the custom Zeugma Museum Zen Bento Builder puzzle, complete with interactive archeological widgets (Gypsy Girl, Excavation Grid, Statue of Mars, Euphrates Level, and Conservation Logs).
  - Encapsulated drag-and-drop mechanics inside `<Tab>` and `<DragHandle>` components.
  - Made the puzzle non-closable by disabling pane and tab close triggers to preserve layout components.
  - Aligned drop zone overlays, active tab indicators, reorder markers, and split-pane resizer handles with the warm sand/gold/terracotta theme.

## 3.0.0

### Major Changes

- **Tabbed Panes (Tabulation) & High-Performance Layout Engine**:
  - **First-Class Tabbed Panes**: Added support for multi-tab panels/panes. Panes can now hold multiple tabs, with support for tab selection, closing, and updating tab-specific metadata.
  - **Clean, Encapsulated APIs**: Introduced a custom `<Tab>` wrapper component that handles all `@dnd-kit` drag-and-drop mechanics internally. Consumers can build custom tabbed layouts without importing or dealing with the underlying DND hooks.
  - **Drag-to-Reorder, Tabulate & Split**: Implemented intuitive tab drag gestures:
    - Reorder tabs by dragging them horizontally within their pane.
    - Merge tabs between panes by dragging one tab onto the header bar dropzone of another pane.
    - Split a tab off from a tab group to form side-by-side or stacked pane splits by dropping on its outer borders.
  - **Parent Split Guard**: Enabled parent pane splitting for multi-tab pane groups, accompanied by a guard in the drop handler that blocks splitting single-tab panes (avoiding node deletion issues).
  - **Tab Drop Fallback**: Implemented a custom hybrid collision detection callback that checks if the pointer is within any active drop zone, falling back to `closestCenter` restricted to `tab-drop-` elements when dragging tab headers. This allows dragging and drop-reordering tabs to the end of lists (into empty tab bar space).
  - **CSS Custom Property Resizing**: Offloaded active pane resizing to CSS Custom Properties (`--pane-left-${id}`, etc.) set dynamically on the parent container. Size modifications bypass intermediate React rendering entirely, committing to the React tree state exactly once at gesture end (`pointerup`).
  - **Widget Caching**: Integrated `MemoizedPaneContent` wrapper in `<PaneTree>` to cache layout widget contents. This isolates user-rendered panels (like tables, editors, charts) from executing React render cycles during layout resizes and transitions.
  - **Refactored Calculations**: Consolidated layout bounding box calculations (`computeLayout`) into pure shared utilities in `tree-helpers.ts` for cleaner separation of concerns.

## 2.3.0

### Minor Changes

- **Layout and Pane Lock Feature**:
  - Added support for a first-class `locked` property on the layout tree nodes (`PaneNode`).
  - Added global dashboard-level locking via the `locked` prop on `<Zeugma>`, which disables all pane dragging and split resizing.
  - Implemented the `updatePaneLock` action to toggle individual pane locks dynamically.
  - Implemented automatic pointer cursor overrides (`not-allowed`) using a custom `useBodyCursorOverride` hook when attempting to drag over locked drop zones.
  - Added visual drop previews for blocked target actions (`lockedPreview`).
  - Provided custom class configurations for locks: `paneLocked`, `dashboardLocked`, and `lockedPreview`.
  - Fully type-safe context updates for drag handles, removing legacy `as any` type assertions.

## 2.2.2

### Patch Changes

- **Optimize Resize Performance**:
  - Resizer now keeps the split percentage change completely local to a React hook state during dragging, eliminating heavy re-renders of all dashboard pane widgets on every move event.
  - The parent `onLayoutChange` and `onChange` callbacks are deferred and invoked exactly once when the drag/resize gesture ends.

## 2.2.1

### Patch Changes

- **Revert Drag Hiding and Live Layout Estimation**:
  - Reverted the live layout estimation and hiding of active dragged widgets. Widgets now remain visible at their original layout position during dragging.

## 2.2.0

### Minor Changes

- **Flat Layout Rendering with Absolute Positioning**:
  - Re-architected layout engine from recursive nested flexboxes to a single-level flat layout positioned with relative percentages.
  - Keeps all pane widgets continuously mounted when reordering, resizing, or switching to and from fullscreen, resolving virtual DOM remounting issues.
- **Live Layout Estimation during Drag**:
  - Dynamically collapses and resizes the remaining panes during dragging as if the dragged pane was removed, giving accurate drop zone previews.
  - Retains the dragged pane mounted invisibly (`display: 'none'`) during the drag to preserve its state and prevent unmounting.

### Patch Changes

- **Fix Drag-Out False-Positives next to Edges**:
  - Implemented window-level pointer/touch move listeners during active drags to track the actual mouse/finger client coordinates.
  - Fixes a bug where hiding the original drag source element in the DOM (via `display: none` for live estimation) caused `@dnd-kit`'s layout delta calculations to jump, resulting in false-positive `onDragOut`/dismiss actions when releasing items near the edges.

## 2.1.0

### Minor Changes

- **Removed Root-Level Tile Placement**:
  - Removed the root-level drop zones feature that allowed placing tiles to the top, bottom, left, or right edges of the entire dashboard root.
  - Removed the `RootDropZone` and `RootDropZones` components.
  - Removed the `splitRoot` tree utility function. Consumers who relied on `splitRoot` should use `splitPane` to split against a specific target pane instead.
  - The `onDragEnd` callback no longer reports `'root'` as the `overId` for root-level drops.

## 2.0.0

### Major Changes

- **Renamed Context Hooks & Types**:
  - Rebranded and renamed all dashboard context hooks, state, values, and contexts to use `Zeugma`-prefixed names instead of legacy `Dashboard` naming.
  - Renamed hooks: `useDashboardState` -> `useZeugmaState`, `useDashboardActions` -> `useZeugmaActions`.
  - Renamed context state values: `DashboardStateValue` -> `ZeugmaStateValue`, `DashboardActionsValue` -> `ZeugmaActionsValue`.
  - Renamed context objects: `DashboardStateContext` -> `ZeugmaStateContext`, `DashboardActionsContext` -> `ZeugmaActionsContext`.
  - Removed all deprecated `DashboardProvider` and `DashboardProviderProps` exports.

- **Refactored Dashboard Architecture**:
  - Renamed the internal component entity directory from `entities/dashboard` to `entities/zeugma`.
  - Modularized the dashboard code: split types/interfaces into `model/types.ts`, context creation into `model/context.ts`, hooks into `model/hooks.ts`, custom sensors into `lib/sensors.ts`, and helper components into `ui/CursorOverlay.tsx`.

## 1.5.0

### Minor Changes

- **Rename Core Layout Wrapper to `<Zeugma>`**:
  - Renamed the primary layout provider component from `<DashboardProvider>` to `<Zeugma>` (with `<ZeugmaProps>`) to align with the workspace layout engine branding.
  - Deprecated `<DashboardProvider>` and `<DashboardProviderProps>` exports.
  - Updated context hook error messages to reference Zeugma providers.

## 1.4.1

### Patch Changes

- **Fix Layout State Syncing & Refactor Callback Refs**:
  - Fixed `handleLocalLayoutChange` (exposed as `onLayoutChange` in state context) to correctly propagate layout updates to the parent component via `onChange(newLayout)`. This resolves a bug where layout actions (such as resizes or preset selection) were reverted on parent re-renders.
  - Refactored `DashboardProvider` to eliminate `useRef` callback-bypassing refs (`layoutRef`, `onChangeRef`, `onDismissIntentChangeRef`, `onResizeEndPropRef`, `renderPaneRef`), replacing them with standard, clean React dependencies in `useCallback` hooks.

## 1.4.0

### Minor Changes

- **Added `ResizableContainer` Widget**: Introduced a new container component that provides vertical resizing via a bottom-edge drag handle.
  - Supports controlled `height` or auto-derived initial heights.
  - Supports optional localStorage height persistence via the `persist` boolean and customizable `localStorageKey` (defaults to `'default-pane'`).
  - Added an `active` boolean prop (default `true`) to toggle resizable behavior dynamically while keeping internal child components continuously mounted.
  - Implemented infinite auto-scrolling during drag gestures when moving near parent container boundaries, calculating height updates to dynamically account for scroll offsets.

## 1.3.1

### Patch Changes

- **Fix Strict Mode Layout Sync**: Changed layout prop synchronization to use state instead of ref to prevent double-rendering bugs and errors in development mode/React Strict Mode.

## 1.3.0

### Minor Changes

- **Refactored to Drag-to-Dismiss Conventions**: Refactored the boundary overflow drag-to-close gesture API to follow standard conventions.
  - Added `enableDragToDismiss` boolean prop (default `false`) to explicitly activate the feature.
  - Renamed `dragOutThreshold` prop to `dismissThreshold` (default `60` pixels).
  - Renamed `onDragOutChange` callback to `onDismissIntentChange`.
  - Renamed context state `draggedOutId` to `dismissIntentId` (`useDashboardState()`).
  - Renamed `dragOut` property in `classNames` to `dismissPreview` for consistency.
  - Removed the redundant `onDragOut` callback and unified boundary drop events to trigger the existing `onRemove` callback directly.

## 1.2.0

### Minor Changes

- **Drag-Out-to-Close Gesture**: Added support for closing widgets by dragging them outside of the dashboard container boundaries.
  - Added `dragOutThreshold` prop (default `60` pixels) to specify the boundary overflow distance required to trigger the dismiss intent.
  - Added `onDragOutChange` callback to listen for boundary transitions.
  - Added `onDragOut` callback to handle widget dropping outside the container (automatically falls back to pane removal if no callback is supplied).
  - Added `draggedOutId` and `setContainerRef` state variables to the state context hook (`useDashboardState()`).
  - Added `dragOut` class name to `ZeugmaClassNames` to configure custom visual styles when a widget is dragged out.

## 1.1.1

### Patch Changes

- Bump version to force new release and sync documents.

## 1.1.0

### Minor Changes

- Add proper touch sensor support to the dashboard layout engine. Register `TouchSensor` alongside `PointerSensor` and configure `touch-action: none` on interactive drag/resize elements to prevent mobile scrolling conflicts.

## 1.0.0

### Major Changes

- **API Cleanups & Breaking Changes**:
  - Removed **`useDashboard()`** context hook entirely.
  - Removed **`DashboardContextValue`** type entirely.
  - Users are now required to use **`useDashboardState()`** for reactive layout values and **`useDashboardActions()`** for stable mutation actions, preventing accidental full-tree re-render waterfalls.

### Minor Changes

- **Context Splitting**: Split the single context structure into `DashboardStateContext` (for reactive state values) and `DashboardActionsContext` (for stable mutation actions).
  - Added **`useDashboardState()`** hook to consume only reactive layout state.
  - Added **`useDashboardActions()`** hook to consume stable dispatch functions (e.g. `removePane`, `splitPane`). Because these action callbacks are stable and never change reference, components utilizing `useDashboardActions()` will not trigger re-renders on layout updates, improving performance.
- **Performance Optimizations**:
  - **Imperative Resizing**: Flex layouts are now updated imperatively during drag gestures, writing to React state only when resizing completes, preventing full-tree layout updates on every frame.
  - **Ref-Based Prop Syncing**: Replaced two-useState state syncing pattern in `DashboardProvider` with a single ref-based pattern, saving render cycles.
  - **Stable callbacks**: Added stable refs for `onResizeEnd` and custom `renderPane` handlers to immunize callbacks against inline consumer updates.
  - **Memoized Pane Props**: Memoized `renderProps` in `Pane` to prevent unnecessary child pane content component re-renders.
  - **Guarded tree traversal**: Guarded the recursive tree-traversal calculation `hasOtherPanes` in `PaneTree` to only run at the root layout node.

## 0.8.1

### Patch Changes

- 8580fff: Added drag-cancel class.

## 0.8.0

### Minor Changes

- 387763f: Change `onChange` layout callback to only fire when user actions are completed (e.g. at the end of a resize gesture or on drag drop end) rather than continuously during resizing.

## 0.7.0

### Minor Changes

- 831edea: Rename `findPaneNode` utility function to `findPane` and add it to the README.

## 0.6.1

### Patch Changes

- 824e083: fix: Issue with the swapping documents is solved

## 0.6.0

### Minor Changes

- Added optional `metadata` property (`Record<string, unknown>`) to `PaneNode`, allowing consumers to attach arbitrary key-value data to individual panes.

## 0.5.3

### Patch Changes

- docs: update documentation

## 0.5.2

### Patch Changes

- docs: update documentation layout, responsiveness, and padding constraints

## 0.5.1

### Patch Changes

- Fixed root-level drop zones to be bounded by the panels container (PaneTree) instead of occupying the entire browser viewport (which was covering sidebars and controls).

## 0.5.0

### Minor Changes

- Added root-level drop zones to support placing dragged panes into the top, bottom, left, or right half of the entire dashboard root.

## 0.4.0

### Minor Changes

- **API Customization & Callbacks**:
  - Added custom resizer rendering support (`renderResizer` prop on `DashboardProvider` and `PaneTree`).
  - Added drag callbacks (`onDragStart`, `onDragEnd`) to listen to pane dragging states.
  - Added resize callbacks (`onResizeStart`, `onResize`, `onResizeEnd`) to listen to pane resizing states.
  - Added customizable split bounds (`minSplitPercentage`, `maxSplitPercentage`) to constrain pane sizes.
  - Exposed convenient layout mutation helpers (`removePane`, `addPane`, `swapPanes`, `splitPane`, `updateSplitPercentage`) directly on `useDashboard()` context hook.
  - Updated `Pane` removal component logic to automatically fall back to mutating the tree via context if no custom `onRemove` callback is passed.

## 0.3.0

### Minor Changes

- 4ed8cde: - **Feature**: Added resizer edge snapping (magnet snapping). Resizing edges will now snap to adjacent pane edges when they come within a configurable threshold.
  - **Refactor**: Re-architected the folder structure into Feature Sliced Design (FSD) layers (`shared`, `entities`, `features`, `widgets`), establishing clean and unidirectional dependencies.
  - **Performance**: Optimized rendering by memoizing context values in `DashboardProvider` and `Pane` to prevent unnecessary component re-renders during dragging and resizing.

## 0.2.0

### Minor Changes

- f4b812f: - Added `dragActivationDistance` to `DashboardProvider` to configure drag start threshold.
  - Added `renderDragOverlay` support to customize the drag overlay during dragging.
  - Fixed an issue where the fullscreen state would not exit properly when a fullscreen pane was removed.

## 0.1.2

### Patch Changes

- Simplify installation command in documentation by removing manual installation of `@dnd-kit` packages.

## 0.1.1

### Patch Changes

- Initial public release on npm.
