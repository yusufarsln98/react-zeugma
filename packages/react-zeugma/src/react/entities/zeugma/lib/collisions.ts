import { CollisionDetection, DroppableContainer, pointerWithin, closestCenter } from '@dnd-kit/core'
import { TAB_HEADER_PREFIX, TAB_DROP_PREFIX, DROP_ROOT_PREFIX } from '../../../../core/dnd'

export const customCollisionDetection: CollisionDetection = (args) => {
  const activeIdStr = args.active.id.toString()
  const isTabDrag = activeIdStr.startsWith(TAB_HEADER_PREFIX)

  const pointerCollisions = pointerWithin(args)
  // We allow tab-drop colliders for both tab drags and pane drags.
  const filteredCollisions = pointerCollisions

  if (filteredCollisions.length > 0) {
    const sortedCollisions = [...filteredCollisions].sort((a, b) => {
      const aId = a.id.toString()
      const bId = b.id.toString()

      // Prioritize tab drop zones over root/pane drop zones for both tab and pane drags
      const aIsTab = aId.startsWith(TAB_DROP_PREFIX)
      const bIsTab = bId.startsWith(TAB_DROP_PREFIX)
      if (aIsTab && !bIsTab) return -1
      if (!aIsTab && bIsTab) return 1

      const aIsRoot = aId.startsWith(DROP_ROOT_PREFIX)
      const bIsRoot = bId.startsWith(DROP_ROOT_PREFIX)
      if (aIsRoot && !bIsRoot) return -1
      if (!aIsRoot && bIsRoot) return 1

      return 0
    })
    return sortedCollisions
  }

  if (isTabDrag) {
    const tabDroppables = args.droppableContainers.filter((container: DroppableContainer) =>
      container.id.toString().startsWith(TAB_DROP_PREFIX),
    )
    return closestCenter({ ...args, droppableContainers: tabDroppables })
  }
  return []
}
