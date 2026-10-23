import { useEffect, useState, SetStateAction } from 'react'
import { TreeNode, ZeugmaPersistOptions, DEFAULT_PERSIST_KEY } from '../../../shared'
import { isValidTreeNode, isRenderableTree } from '../../../../core/tree'

export { isValidTreeNode, isRenderableTree }

export interface UseZeugmaPersistenceProps {
  persist?: boolean | ZeugmaPersistOptions
  layout: TreeNode | null
  setLayout: (nextLayoutOrUpdater: SetStateAction<TreeNode | null>) => void
}

export function useZeugmaPersistence({ persist, layout, setLayout }: UseZeugmaPersistenceProps) {
  const isEnabled = typeof persist === 'object' ? persist.enabled !== false : !!persist
  const persistKey = (typeof persist === 'object' && persist.key) || DEFAULT_PERSIST_KEY

  const [isLoaded, setIsLoaded] = useState(false)

  // Load layout from localStorage on mount if persist is enabled
  useEffect(() => {
    if (isEnabled) {
      try {
        const saved = localStorage.getItem(persistKey)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (isRenderableTree(parsed)) {
            setLayout(parsed)
          }
        }
      } catch (e) {
        console.error('Failed to parse persisted zeugma layout', e)
      }
    }
    setIsLoaded(true)
  }, [isEnabled, persistKey, setLayout])

  // Save layout to localStorage when layout changes if persist is enabled
  useEffect(() => {
    if (isEnabled && isLoaded) {
      try {
        if (layout) {
          localStorage.setItem(persistKey, JSON.stringify(layout))
        } else {
          localStorage.removeItem(persistKey)
        }
      } catch (e) {
        console.error('Failed to save persisted zeugma layout', e)
      }
    }
  }, [isEnabled, persistKey, layout, isLoaded])
}
