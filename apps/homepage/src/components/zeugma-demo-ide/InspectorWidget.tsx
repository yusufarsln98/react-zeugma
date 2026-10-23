import { useZeugmaContext } from 'react-zeugma/react'
import { JSONFormatter } from '../syntax-code'

export function InspectorWidget() {
  const { layout } = useZeugmaContext()
  return (
    <div className="h-full w-full bg-[#1e1e1e] overflow-auto">
      <div className="flex items-center justify-between border-b border-[#2d2d30] px-4 py-2 bg-[#2d2d2d] text-[#858585] select-none">
        <span className="text-[10px] uppercase font-bold tracking-wider">
          Active IDE Workspace Layout Tree
        </span>
        <span className="text-[8px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded font-mono uppercase animate-pulse">
          Serialized
        </span>
      </div>
      <JSONFormatter json={layout} />
    </div>
  )
}
