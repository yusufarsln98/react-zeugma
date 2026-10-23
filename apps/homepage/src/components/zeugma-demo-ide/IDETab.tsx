import { FileCode2, Folder, Terminal, Code, X } from 'lucide-react'
import { FILES } from '../mock-files'
import { RenderTabProps } from 'react-zeugma/react'

export function getTabMetadata(tabId: string) {
  const basename = tabId.includes('/') ? tabId.split('/').pop()! : tabId
  let title = basename
  let icon = <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
  let closeable = true

  if (tabId === 'explorer') {
    title = 'Explorer'
    icon = <Folder className="w-3.5 h-3.5 text-indigo-400" />
    closeable = false
  } else if (tabId === 'terminal') {
    title = 'Terminal'
    icon = <Terminal className="w-3.5 h-3.5 text-emerald-400" />
    closeable = false
  } else if (tabId === 'inspector') {
    title = 'Layout Inspector'
    icon = <Code className="w-3.5 h-3.5 text-violet-400" />
    closeable = false
  } else {
    icon = FILES[tabId]?.icon ?? icon
  }

  return { title, icon, closeable }
}

export function IDETab({ id, isActive, isDragging, isOver, onSelect, onRemove }: RenderTabProps) {
  const { title, icon, closeable } = getTabMetadata(id)

  const baseClass =
    'px-2.5 flex items-center gap-1.5 border-r border-[#1e1e1e] text-[11px] font-mono tracking-wide transition-all cursor-pointer h-full relative group'

  const activeClass = isActive
    ? 'bg-[#1e1e1e] text-white border-t border-t-indigo-500'
    : 'bg-[#252526] text-[#858585] hover:text-[#cccccc] hover:bg-[#2d2d2d] border-t border-t-transparent'

  const dragClass = isDragging ? 'opacity-40' : ''
  const overClass = isOver ? 'bg-indigo-500/10 animate-pulse' : ''

  const closeBtnClass = `ml-0.5 w-4 h-4 rounded flex items-center justify-center transition-all shrink-0 ${
    isActive
      ? 'text-[#858585] hover:text-white hover:bg-zinc-700'
      : 'opacity-0 group-hover:opacity-100 text-[#858585] hover:text-white hover:bg-zinc-700'
  }`

  return (
    <div onClick={onSelect} className={`${baseClass} ${activeClass} ${dragClass} ${overClass}`}>
      {icon}
      <span className="truncate max-w-[100px]">{title}</span>

      {closeable && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className={closeBtnClass}
          title={`Close ${title}`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}
