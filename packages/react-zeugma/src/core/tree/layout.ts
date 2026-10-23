import type { TreeNode, SplitNode, SplitDirection, PaneNode } from '../types'

export interface ComputedPane {
  paneId: string
  left: number
  top: number
  width: number
  height: number
  node: PaneNode
}

export interface ComputedSplitter {
  id: string
  currentNode: SplitNode
  direction: SplitDirection
  left: number
  top: number
  width: number
  height: number
  parentLeft: number
  parentTop: number
  parentWidth: number
  parentHeight: number
}

export function computeLayout(
  node: TreeNode | null,
  left = 0,
  top = 0,
  width = 100,
  height = 100,
  path = 'root',
): { panes: ComputedPane[]; splitters: ComputedSplitter[] } {
  if (node === null) return { panes: [], splitters: [] }
  if (node.type === 'pane') {
    return {
      panes: [{ paneId: node.id, left, top, width, height, node }],
      splitters: [],
    }
  }

  const { direction, splitPercentage, first, second } = node
  const splitterId = `splitter-${path}-${direction}`

  const currentSplitter: ComputedSplitter = {
    id: splitterId,
    currentNode: node,
    direction,
    left: direction === 'row' ? left + width * (splitPercentage / 100) : left,
    top: direction === 'column' ? top + height * (splitPercentage / 100) : top,
    width: direction === 'row' ? 0 : width,
    height: direction === 'column' ? 0 : height,
    parentLeft: left,
    parentTop: top,
    parentWidth: width,
    parentHeight: height,
  }

  let firstLayout = { panes: [] as ComputedPane[], splitters: [] as ComputedSplitter[] }
  let secondLayout = { panes: [] as ComputedPane[], splitters: [] as ComputedSplitter[] }

  if (direction === 'row') {
    const firstWidth = width * (splitPercentage / 100)
    firstLayout = computeLayout(first, left, top, firstWidth, height, `${path}-L`)
    secondLayout = computeLayout(
      second,
      left + firstWidth,
      top,
      width - firstWidth,
      height,
      `${path}-R`,
    )
  } else {
    const firstHeight = height * (splitPercentage / 100)
    firstLayout = computeLayout(first, left, top, width, firstHeight, `${path}-T`)
    secondLayout = computeLayout(
      second,
      left,
      top + firstHeight,
      width,
      height - firstHeight,
      `${path}-B`,
    )
  }

  return {
    panes: [...firstLayout.panes, ...secondLayout.panes],
    splitters: [currentSplitter, ...firstLayout.splitters, ...secondLayout.splitters],
  }
}
