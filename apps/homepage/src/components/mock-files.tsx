import React from 'react'
import { FileCode2, FileText } from 'lucide-react'
import { Token, tokenizeJS } from './syntax-code'
import { TreeNode } from 'react-zeugma'

// ─── Code Strings ─────────────────────────────────────────────────────────────

const APP_TSX_CODE = `import React from 'react'
import { useZeugma, Zeugma, Pane, TreeNode } from 'react-zeugma/react'

// ─── Widget Registry ──────────────────────────────────────────────────────────

const WIDGET_REGISTRY: Record<string, React.FC<{ tabId: string }>> = {
  'explorer': () => <div>File Tree</div>,
  'terminal': () => <div>Terminal Output</div>,
  'README.md': () => <div>Hello react-zeugma!</div>,
  'App.tsx': () => <div>Source Editor</div>,
  'inspector': () => <div>Inspector Content</div>,
}

const initialLayout: TreeNode = {
  type: 'split',
  direction: 'row',
  splitPercentage: 25,
  first: { type: 'pane', id: 'pane-explorer', tabIds: ['explorer'], activeTabId: 'explorer' },
  second: {
    type: 'split',
    direction: 'column',
    splitPercentage: 70,
    first: { type: 'pane', id: 'pane-editor', tabIds: ['README.md', 'App.tsx'], activeTabId: 'App.tsx' },
    second: { type: 'pane', id: 'pane-terminal', tabIds: ['terminal'], activeTabId: 'terminal' },
  },
}

function WorkspacePane({ id }: { id: string }) {
  return (
    <Pane id={id} className="pane">
      <div className="pane-header">
        <Pane.Tabs
          renderTab={({ tabId, activeTabId, onSelect, onRemove }) => (
            <div
              key={tabId}
              onClick={onSelect}
            >
              <span>{tabId}</span>
              <button onClick={() => { onRemove(); }}/>
            </div>
          )}
        />
        <Pane.DragHandle className="drag-handle"/>
        <Pane.Controls />
      </div>
      <div className="pane-content">
        <Pane.Content>
          {(tab) => {
            const Widget = WIDGET_REGISTRY[tab.id]
            return Widget ? <Widget tabId={tab.id} /> : <div className="fallback">Unknown tab: {tab.id}</div>
          }}
        </Pane.Content>
      </div>
    </Pane>
  )
}

export default function App() {
  const controller = useZeugma({ initialLayout })

  return (
    <Zeugma
      controller={controller}
      renderPane={(id) => <WorkspacePane id={id} />}
      classNames={{
        resizer: 'resizer',
        dropPreview: 'drop-preview',
        tabDropPreview: 'tab-preview',
      }}
    />
  )
}`

// ─── File Registry ────────────────────────────────────────────────────────────

interface FileEntry {
  language: string
  icon: React.ReactElement
  tokens: Token[] | null
}

export const FILES: Record<string, FileEntry> = {
  'App.tsx': {
    language: 'tsx',
    icon: <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />,
    tokens: tokenizeJS(APP_TSX_CODE),
  },
  'README.md': {
    language: 'markdown',
    icon: <FileText className="w-3.5 h-3.5 text-zinc-400" />,
    tokens: null,
  },
}

// ─── File tree structure for explorer ─────────────────────────────────────────

export interface TreeEntry {
  name: string
  fileKey?: string
  isFolder?: boolean
  collapsed?: boolean
  children?: TreeEntry[]
}

export const FILE_TREE: TreeEntry[] = [
  { name: 'App.tsx', fileKey: 'App.tsx' },
  { name: 'README.md', fileKey: 'README.md' },
]

export const defaultOuterLayout: TreeNode = {
  type: 'split',
  direction: 'row',
  splitPercentage: 75,
  first: {
    type: 'split',
    direction: 'row',
    splitPercentage: 30,
    first: {
      type: 'pane',
      id: 'pane-explorer',
      tabIds: ['explorer'],
      activeTabId: 'explorer',
    },
    second: {
      type: 'split',
      direction: 'column',
      splitPercentage: 75,
      first: {
        type: 'pane',
        id: 'pane-editor',
        tabIds: ['README.md', 'App.tsx'],
        activeTabId: 'App.tsx',
      },
      second: {
        type: 'pane',
        id: 'pane-terminal',
        tabIds: ['terminal'],
        activeTabId: 'terminal',
      },
    },
  },
  second: {
    type: 'pane',
    id: 'pane-inspector',
    tabIds: ['inspector'],
    activeTabId: 'inspector',
  },
}

// ─── Layout Presets ───────────────────────────────────────────────────────────

export interface LayoutPreset {
  key: string
  label: string
  layout: TreeNode
}

export const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    key: 'default',
    label: 'Default IDE',
    layout: defaultOuterLayout,
  },
  {
    key: 'focused',
    label: 'Focused Editor',
    layout: {
      type: 'split',
      direction: 'column',
      splitPercentage: 75,
      first: {
        type: 'pane',
        id: 'pane-editor',
        tabIds: ['README.md', 'App.tsx'],
        activeTabId: 'App.tsx',
      },
      second: {
        type: 'pane',
        id: 'pane-terminal',
        tabIds: ['terminal'],
        activeTabId: 'terminal',
      },
    },
  },
  {
    key: 'side-by-side',
    label: 'Side-by-Side',
    layout: {
      type: 'split',
      direction: 'row',
      splitPercentage: 50,
      first: {
        type: 'pane',
        id: 'pane-editor-left',
        tabIds: ['App.tsx', 'README.md'],
        activeTabId: 'App.tsx',
      },
      second: {
        type: 'split',
        direction: 'column',
        splitPercentage: 70,
        first: {
          type: 'pane',
          id: 'pane-editor-right',
          tabIds: ['App.tsx'],
          activeTabId: 'App.tsx',
        },
        second: {
          type: 'pane',
          id: 'pane-terminal',
          tabIds: ['terminal'],
          activeTabId: 'terminal',
        },
      },
    },
  },
  {
    key: 'minimal',
    label: 'Minimal',
    layout: {
      type: 'pane',
      id: 'pane-editor',
      tabIds: ['App.tsx'],
      activeTabId: 'App.tsx',
    },
  },
  {
    key: 'three-column',
    label: 'Three Column',
    layout: {
      type: 'split',
      direction: 'row',
      splitPercentage: 25,
      first: {
        type: 'pane',
        id: 'pane-explorer',
        tabIds: ['explorer'],
        activeTabId: 'explorer',
      },
      second: {
        type: 'split',
        direction: 'row',
        splitPercentage: 60,
        first: {
          type: 'split',
          direction: 'column',
          splitPercentage: 70,
          first: {
            type: 'pane',
            id: 'pane-editor',
            tabIds: ['App.tsx'],
            activeTabId: 'App.tsx',
          },
          second: {
            type: 'pane',
            id: 'pane-terminal',
            tabIds: ['terminal'],
            activeTabId: 'terminal',
          },
        },
        second: {
          type: 'pane',
          id: 'pane-inspector',
          tabIds: ['inspector'],
          activeTabId: 'inspector',
        },
      },
    },
  },
]
