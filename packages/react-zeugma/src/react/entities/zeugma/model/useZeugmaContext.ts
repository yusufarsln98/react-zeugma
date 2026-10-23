import { useMemo } from 'react'
import { useZeugmaState, useZeugmaActions, ZeugmaController } from '../../../shared'

export const useZeugmaContext = (): ZeugmaController => {
  const state = useZeugmaState()
  const actions = useZeugmaActions()

  return useMemo(
    () => ({
      layout: state.layout,
      setLayout: state.setLayout,
      fullscreenPaneId: state.fullscreenPaneId,
      setFullscreenPaneId: actions.setFullscreenPaneId,
      locked: state.locked,
      setLocked: actions.setLocked,
      removePane: actions.removePane,
      addTab: actions.addTab,
      updatePaneLock: actions.updatePaneLock,
      selectTab: actions.selectTab,
      mergeTab: actions.mergeTab,
      removeTab: actions.removeTab,
      splitPane: actions.splitPane,
      updateSplitPercentage: actions.updateSplitPercentage,
      moveTab: actions.moveTab,
      findPaneById: state.findPaneById,
      findPaneContainingTab: state.findPaneContainingTab,
      findTabById: state.findTabById,
      getTabMetadata: state.getTabMetadata,
      getActiveTabMetadata: state.getActiveTabMetadata,
      poppedOutTabIds: state.poppedOutTabIds,
      popoutTab: actions.popoutTab,
      dockTab: actions.dockTab,
    }),
    [state, actions],
  )
}
