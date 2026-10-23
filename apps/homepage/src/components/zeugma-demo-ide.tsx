'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Zeugma, Pane, useZeugma, TabDetails } from 'react-zeugma/react'

import { defaultOuterLayout, LAYOUT_PRESETS } from './mock-files'

import { isTabOpenInTree, findActiveEditorPane } from './zeugma-demo-ide/utils'
import { TabContentWrapper } from './zeugma-demo-ide/TabContentWrapper'
import { IDETab } from './zeugma-demo-ide/IDETab'

import {
  IDEContainer,
  WindowChrome,
  WorkspaceFrame,
  WorkspaceContent,
  WorkspaceZeugmaArea,
  StatusBar,
  PaneContainer,
  PaneHeader,
  PaneControls,
} from './zeugma-demo-ide/IDELayout'

export function ZeugmaDemoIDE({
  className = 'aspect-16/10 min-h-[580px]',
  hideChrome = false,
}: {
  className?: string
  hideChrome?: boolean
}) {
  const [locked, setLocked] = useState(false)
  const [activePreset, setActivePreset] = useState('default')
  const outerZeugma = useZeugma({ initialLayout: defaultOuterLayout })

  const handleReset = () => {
    if (locked) return
    outerZeugma.setLayout(defaultOuterLayout)
    setLocked(false)
    outerZeugma.setLocked(false)
    setActivePreset('default')
  }

  const handlePresetSelect = (presetKey: string) => {
    if (locked) return
    const preset = LAYOUT_PRESETS.find((p) => p.key === presetKey)
    if (preset) {
      outerZeugma.setLayout(preset.layout)
      setActivePreset(presetKey)
    }
  }

  const handleOpenFile = (filename: string) => {
    const isAlreadyOpen = isTabOpenInTree(outerZeugma.layout, filename)
    if (isAlreadyOpen) {
      const pane = outerZeugma.findPaneContainingTab(filename)
      if (pane) outerZeugma.selectTab(pane.id, filename)
    } else {
      const targetPaneId = findActiveEditorPane(outerZeugma.layout)
      if (targetPaneId) {
        outerZeugma.addTab(filename, targetPaneId)
        outerZeugma.selectTab(targetPaneId, filename)
      } else {
        outerZeugma.addTab(filename)
      }
    }
  }

  const handleOpenFileRef = useRef(handleOpenFile)
  useEffect(() => {
    handleOpenFileRef.current = handleOpenFile
  }, [handleOpenFile])

  const stableHandleOpenFile = useCallback((filename: string) => {
    handleOpenFileRef.current(filename)
  }, [])

  // ── Tab content resolution ──────────────────────────────────────────────────
  const renderWidget = useCallback(
    (tab: TabDetails) => {
      return <TabContentWrapper tabId={tab.id} onOpenFile={stableHandleOpenFile} />
    },
    [stableHandleOpenFile],
  )

  // ── Pane rendering ──────────────────────────────────────────────────────────
  const renderPane = useCallback(
    (paneId: string) => (
      <Pane id={paneId}>
        <PaneContainer>
          <PaneHeader>
            <Pane.Tabs
              classNames={{
                container: 'overflow-x-auto scrollbar-none min-w-0 h-full shrink',
                tab: 'h-full flex',
              }}
              renderTab={(tabProps) => <IDETab {...tabProps} />}
            />
            <Pane.DragHandle className="flex-1 h-full min-w-[20px]" />
            <PaneControls />
          </PaneHeader>
          <Pane.Content className="flex-1 flex flex-col min-h-0 bg-[#1e1e1e] relative h-full overflow-hidden">
            {renderWidget}
          </Pane.Content>
        </PaneContainer>
      </Pane>
    ),
    [renderWidget],
  )

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <IDEContainer className={className} hideChrome={hideChrome}>
      <WindowChrome hideChrome={hideChrome} />

      <WorkspaceFrame>
        <WorkspaceContent>
          <WorkspaceZeugmaArea>
            {outerZeugma.layout && (
              <Zeugma
                controller={outerZeugma}
                resizerSize={4}
                renderPane={renderPane}
                renderDragOverlay={undefined}
                enableDragToDismiss={true}
                dismissThreshold={60}
                classNames={{
                  dropPreview:
                    'bg-zinc-800/50 border border-zinc-700 transition-all duration-200 shadow-lg',
                  rootDropPreview: 'zeugma-root-drop-preview',
                  resizer: 'zeugma-resizer',
                  tabDropPreview: 'zeugma-tab-drop-preview',
                }}
              />
            )}
          </WorkspaceZeugmaArea>
        </WorkspaceContent>

        <StatusBar
          activePreset={activePreset}
          onSelectPreset={handlePresetSelect}
          locked={locked}
          onToggleLock={() => {
            const nextLock = !locked
            setLocked(nextLock)
            outerZeugma.setLocked(nextLock)
          }}
          onReset={handleReset}
        />
      </WorkspaceFrame>
    </IDEContainer>
  )
}
