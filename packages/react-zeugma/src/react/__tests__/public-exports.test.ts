import { describe, it, expect } from 'vitest'
import * as coreApi from '../../index'
import * as reactApi from '../../react'
import * as devtoolsApi from '../../devtools'

describe('Public API Runtime Exports Snapshot', () => {
  it('should preserve all exports from core entry (index.ts)', () => {
    const keys = Object.keys(coreApi).sort()
    expect(keys).toEqual([
      'addTab',
      'calculateTabDropIndex',
      'computeLayout',
      'findPaneById',
      'findPaneContainingTab',
      'findTabById',
      'generateUniqueId',
      'getActiveTabMetadata',
      'getTabMetadata',
      'insertLeaf',
      'isValidTreeNode',
      'mergeTab',
      'movePaneTabs',
      'moveTab',
      'removePane',
      'removeTab',
      'selectTab',
      'splitPane',
      'swapTabs',
      'updatePaneLock',
      'updateSplitPercentage',
    ])
  })

  it('should preserve all exports from react entry (react.ts)', () => {
    const keys = Object.keys(reactApi).sort()
    expect(keys).toEqual([
      'Pane',
      'PaneTree',
      'RenderCounterBadge',
      'RenderCounterFooter',
      'Zeugma',
      'usePaneContext',
      'useRenderCounter',
      'useResizer',
      'useZeugma',
      'useZeugmaContext',
    ])
  })

  it('should preserve all exports from devtools entry (devtools.ts)', () => {
    const keys = Object.keys(devtoolsApi).sort()
    expect(keys).toEqual([
      'RenderCounterBadge',
      'RenderCounterFooter',
      'clearAllCounters',
      'resetCounterRecord',
      'useRenderCounter',
    ])
  })
})
