---
'react-zeugma': minor
---

Make popout placeholder in `Pane.Content` style-agnostic and headless:

- Remove hardcoded default values, container styling (`#161719`), blue button (`#2563eb`), hover events, and static copy from `Pane.Content`.
- Add `renderPopoutPlaceholder` prop to `Pane.Content` and `Zeugma` to allow custom placeholder rendering with `{ tabId, dock }`.
- Add `popoutPlaceholder` class name to `ZeugmaClassNames`.
- Export `PopoutPlaceholderProps` and `PaneContentProps` from `react-zeugma`.
