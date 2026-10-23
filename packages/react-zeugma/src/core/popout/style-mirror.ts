import { POPOUT_DEFAULT_FALLBACK_BG } from '../config'

let headObserver: MutationObserver | null = null
let htmlObserver: MutationObserver | null = null

export function startHeadObserver(activePopoutDocuments: Set<Document>): void {
  if (typeof window === 'undefined' || typeof document === 'undefined' || headObserver) return
  headObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (
          node instanceof HTMLElement &&
          (node.tagName.toLowerCase() === 'style' || node.tagName.toLowerCase() === 'link')
        ) {
          activePopoutDocuments.forEach((doc) => {
            try {
              const cloned = node.cloneNode(true) as HTMLElement
              if (cloned.tagName.toLowerCase() === 'link') {
                const href = (node as HTMLLinkElement).href
                if (href) {
                  cloned.setAttribute('href', href)
                }
              }
              doc.head.appendChild(cloned)
            } catch (e) {
              console.warn('Failed to mirror style node to popout:', e)
            }
          })
        }
      })
    })
  })
  headObserver.observe(document.head, { childList: true })
}

export function stopHeadObserver(): void {
  if (headObserver) {
    headObserver.disconnect()
    headObserver = null
  }
}

export function startHtmlObserver(activePopoutDocuments: Set<Document>): void {
  if (typeof window === 'undefined' || typeof document === 'undefined' || htmlObserver) return
  htmlObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName) {
        const val = document.documentElement.getAttribute(mutation.attributeName)
        activePopoutDocuments.forEach((doc) => {
          try {
            if (doc && doc.documentElement) {
              if (val !== null) {
                doc.documentElement.setAttribute(mutation.attributeName!, val)
              } else {
                doc.documentElement.removeAttribute(mutation.attributeName!)
              }
            }
          } catch (e) {
            console.warn('Failed to sync documentElement attribute:', e)
          }
        })
      }
    })
  })
  htmlObserver.observe(document.documentElement, { attributes: true })
}

export function stopHtmlObserver(): void {
  if (htmlObserver) {
    htmlObserver.disconnect()
    htmlObserver = null
  }
}

export function copyDocumentStyles(popup: Window, sourceDoc: Document = document): void {
  try {
    const baseNode = popup.document.createElement('base')
    baseNode.setAttribute('href', window.location.origin + '/')
    popup.document.head.appendChild(baseNode)
  } catch {}

  Array.from(sourceDoc.querySelectorAll('style, link[rel="stylesheet"]')).forEach((node) => {
    const clonedNode = node.cloneNode(true) as HTMLElement
    if (node.tagName.toLowerCase() === 'link') {
      const href = (node as HTMLLinkElement).href
      if (href) {
        clonedNode.setAttribute('href', href)
      }
    } else if (node.tagName.toLowerCase() === 'style') {
      try {
        const rules = (node as HTMLStyleElement).sheet?.cssRules
        if (rules && rules.length > 0) {
          const cssText = Array.from(rules)
            .map((rule) => rule.cssText)
            .join('\n')
          clonedNode.textContent = cssText
        }
      } catch {
        // Ignore cross-origin stylesheet errors
      }
    }
    popup.document.head.appendChild(clonedNode)
  })

  // Copy adopted stylesheets if supported
  if (
    typeof sourceDoc.adoptedStyleSheets !== 'undefined' &&
    typeof popup.document.adoptedStyleSheets !== 'undefined'
  ) {
    try {
      const clonedSheets = Array.from(sourceDoc.adoptedStyleSheets)
        .map((sheet) => {
          try {
            const newSheet = new (
              popup as unknown as {
                CSSStyleSheet: typeof CSSStyleSheet
              }
            ).CSSStyleSheet()
            const cssText = Array.from(sheet.cssRules)
              .map((rule) => rule.cssText)
              .join('\n')
            newSheet.replaceSync(cssText)
            return newSheet
          } catch {
            return null
          }
        })
        .filter((s): s is CSSStyleSheet => s !== null)
      popup.document.adoptedStyleSheets = clonedSheets
    } catch (e) {
      console.warn('Failed to copy adoptedStyleSheets:', e)
    }
  }
}

export function copyDocumentClasses(popup: Window, sourceDoc: Document = document): void {
  popup.document.documentElement.className = sourceDoc.documentElement.className
  popup.document.body.className = sourceDoc.body.className
  Array.from(sourceDoc.documentElement.attributes).forEach((attr) => {
    popup.document.documentElement.setAttribute(attr.name, attr.value)
  })
  popup.document.body.style.margin = '0'
  popup.document.body.style.padding = '0'
  popup.document.body.style.height = '100vh'
  popup.document.body.style.overflow = 'hidden'
}

export function detectSeamlessBackground(tabId: string, sourceDoc: Document = document): string {
  const originalTarget = sourceDoc.getElementById(`zeugma-tab-target-${tabId}`)
  let targetBg = ''
  if (originalTarget && typeof window !== 'undefined') {
    targetBg = window.getComputedStyle(originalTarget).backgroundColor
    if (
      (!targetBg || targetBg === 'transparent' || targetBg === 'rgba(0, 0, 0, 0)') &&
      originalTarget.parentElement
    ) {
      targetBg = window.getComputedStyle(originalTarget.parentElement).backgroundColor
    }
  }

  if (typeof window === 'undefined') {
    return POPOUT_DEFAULT_FALLBACK_BG
  }

  const docComputedStyle = window.getComputedStyle(sourceDoc.documentElement)
  const bodyComputedStyle = window.getComputedStyle(sourceDoc.body)
  const bodyBg = bodyComputedStyle.backgroundColor
  const isBodyBgTrans = !bodyBg || bodyBg === 'transparent' || bodyBg === 'rgba(0, 0, 0, 0)'
  const activeBgColor = isBodyBgTrans ? docComputedStyle.backgroundColor : bodyBg

  const finalBgColor =
    targetBg && targetBg !== 'transparent' && targetBg !== 'rgba(0, 0, 0, 0)'
      ? targetBg
      : activeBgColor && activeBgColor !== 'transparent' && activeBgColor !== 'rgba(0, 0, 0, 0)'
        ? activeBgColor
        : POPOUT_DEFAULT_FALLBACK_BG

  return finalBgColor
}

export function applyThemeAndBackground(
  popup: Window,
  finalBgColor: string,
  sourceDoc: Document = document,
): void {
  if (typeof window === 'undefined') return
  const docComputedStyle = window.getComputedStyle(sourceDoc.documentElement)
  const bodyComputedStyle = window.getComputedStyle(sourceDoc.body)

  const themeAttr = sourceDoc.documentElement.getAttribute('data-theme')
  if (!themeAttr) {
    popup.document.documentElement.style.backgroundColor = finalBgColor
    popup.document.body.style.backgroundColor = finalBgColor
  }
  popup.document.body.style.color = bodyComputedStyle.color || docComputedStyle.color
  popup.document.body.style.fontFamily = bodyComputedStyle.fontFamily || docComputedStyle.fontFamily
}
