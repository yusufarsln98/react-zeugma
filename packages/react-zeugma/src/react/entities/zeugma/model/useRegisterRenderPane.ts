import { useEffect, useContext } from 'react'
import { PortalRegistryContext } from '../../../shared'

export function useRegisterRenderPane(
  renderPane: ((paneId: string) => React.ReactNode) | undefined,
) {
  const portalRegistry = useContext(PortalRegistryContext)
  const registerRenderPane = portalRegistry?.registerRenderPane

  useEffect(() => {
    if (registerRenderPane && renderPane) {
      registerRenderPane(renderPane)
    }
  }, [registerRenderPane, renderPane])
}
