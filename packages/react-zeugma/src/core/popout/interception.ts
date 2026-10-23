/**
 * Cross-window DOM interception for popout windows.
 *
 * Popout windows run in separate window contexts with their own Document, Window,
 * and constructor prototypes. Libraries like @dnd-kit, Floating UI, and standard
 * React portal hooks expect elements to pass `instanceof Node`, `document.contains()`,
 * and query methods against the active document.
 *
 * This module manages global patches and completely restores all original
 * prototype descriptors and methods upon teardown when all popouts close.
 */

let lastActiveEvent: Event | null = null
let interceptionInitialized = false
let activePopoutDocument: Document | null = null
const activePopoutDocuments = new Set<Document>()

// Saved original constructors and descriptors for clean restoration
const originalHasInstances = new Map<object, PropertyDescriptor | undefined>()
const originalWinDescriptors = new Map<string, PropertyDescriptor | undefined>()
let originalContains: ((this: Node, other: Node | null) => boolean) | null = null
let originalCreateElement: typeof document.createElement | null = null
let originalGetElementById: typeof document.getElementById | null = null
let originalQuerySelector: typeof document.querySelector | null = null
let originalQuerySelectorAll: typeof document.querySelectorAll | null = null

const DOC_PROPERTIES = [
  'body',
  'documentElement',
  'head',
  'activeElement',
  'defaultView',
  'scrollingElement',
] as const

const WIN_PROPERTIES = [
  'innerWidth',
  'innerHeight',
  'pageXOffset',
  'pageYOffset',
  'scrollX',
  'scrollY',
  'screenX',
  'screenY',
  'outerWidth',
  'outerHeight',
  'devicePixelRatio',
] as const

const EVENTS_TO_TRACK = [
  'pointerdown',
  'mousedown',
  'click',
  'keydown',
  'focus',
  'touchstart',
] as const

function resetActive() {
  lastActiveEvent = null
  activePopoutDocument = null
}

export function setActivePopoutDocument(doc: Document | null): void {
  activePopoutDocument = doc
}

export function setLastActiveEvent(event: Event | null): void {
  lastActiveEvent = event
}

export function getActivePopoutDocuments(): Set<Document> {
  return activePopoutDocuments
}

export function addActivePopoutDocument(doc: Document): void {
  activePopoutDocuments.add(doc)
}

export function removeActivePopoutDocument(doc: Document): void {
  activePopoutDocuments.delete(doc)
}

export function isPopoutInterceptionActive(): boolean {
  return interceptionInitialized
}

export function getActiveDocument(): Document | null {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return null
  }

  if (lastActiveEvent && lastActiveEvent.target) {
    const doc = (lastActiveEvent.target as Node).ownerDocument
    if (doc && doc !== document && activePopoutDocuments.has(doc)) {
      return doc
    }
  }

  const currentEvent = (window as unknown as { event?: Event }).event
  if (currentEvent && currentEvent.target) {
    const target = currentEvent.target as Node
    const doc = target.ownerDocument
    if (doc && doc !== document && activePopoutDocuments.has(doc)) {
      return doc
    }
  }

  if (activePopoutDocument && activePopoutDocuments.has(activePopoutDocument)) {
    return activePopoutDocument
  }

  return document
}

function isProtoOf(instance: unknown, proto: unknown): boolean {
  if (!instance || !proto) return false
  try {
    let currentProto = Object.getPrototypeOf(instance)
    while (currentProto) {
      if (currentProto === proto) return true
      currentProto = Object.getPrototypeOf(currentProto)
    }
  } catch {}
  return false
}

function patchHasInstance(
  Constructor: unknown,
  checkFn: (obj: Record<string, unknown>) => boolean,
) {
  if (!Constructor || typeof Constructor !== 'function') return
  try {
    const target = Constructor as object
    if (!originalHasInstances.has(target)) {
      originalHasInstances.set(target, Object.getOwnPropertyDescriptor(target, Symbol.hasInstance))
    }
    Object.defineProperty(target, Symbol.hasInstance, {
      value: function (instance: unknown) {
        if (!instance) return false
        if (isProtoOf(instance, (Constructor as { prototype?: unknown }).prototype)) return true
        return checkFn(instance as Record<string, unknown>)
      },
      configurable: true,
      writable: true,
    })
  } catch (e) {
    console.warn('Failed to patch Symbol.hasInstance on', Constructor, e)
  }
}

export function setupPopoutInterception(): void {
  if (typeof window === 'undefined' || interceptionInitialized) return
  interceptionInitialized = true

  // Patch [Symbol.hasInstance] globally on constructors to correctly identify cross-window DOM nodes
  if (typeof Node !== 'undefined') {
    patchHasInstance(Node, (instance) => {
      return typeof instance.nodeType === 'number' && typeof instance.nodeName === 'string'
    })
  }
  if (typeof Element !== 'undefined') {
    patchHasInstance(Element, (instance) => {
      return instance.nodeType === 1
    })
  }
  if (typeof HTMLElement !== 'undefined') {
    patchHasInstance(HTMLElement, (instance) => {
      return instance.nodeType === 1 && typeof instance.style === 'object'
    })
  }
  if (typeof HTMLBodyElement !== 'undefined') {
    patchHasInstance(HTMLBodyElement, (instance) => {
      return instance.nodeType === 1 && instance.tagName === 'BODY'
    })
  }
  if (typeof HTMLHtmlElement !== 'undefined') {
    patchHasInstance(HTMLHtmlElement, (instance) => {
      return instance.nodeType === 1 && instance.tagName === 'HTML'
    })
  }
  if (typeof HTMLInputElement !== 'undefined') {
    patchHasInstance(HTMLInputElement, (instance) => {
      return instance.nodeType === 1 && instance.tagName === 'INPUT'
    })
  }
  if (typeof HTMLTextAreaElement !== 'undefined') {
    patchHasInstance(HTMLTextAreaElement, (instance) => {
      return instance.nodeType === 1 && instance.tagName === 'TEXTAREA'
    })
  }
  if (typeof ShadowRoot !== 'undefined') {
    patchHasInstance(ShadowRoot, (instance) => {
      return instance.nodeType === 11 && instance.host !== undefined
    })
  }
  if (typeof SVGElement !== 'undefined') {
    patchHasInstance(SVGElement, (instance) => {
      return instance.nodeType === 1 && typeof instance.getBBox === 'function'
    })
  }
  if (typeof Document !== 'undefined') {
    patchHasInstance(Document, (instance) => {
      return instance.nodeType === 9
    })
  }
  if (typeof Window !== 'undefined') {
    patchHasInstance(Window, (instance) => {
      return (
        instance && typeof instance.document === 'object' && typeof instance.location === 'object'
      )
    })
  }

  // Proxy Document properties to active popout document when one is active
  const docProto = Document.prototype
  const originalDocBody = Object.getOwnPropertyDescriptor(docProto, 'body')
  const originalDocEl = Object.getOwnPropertyDescriptor(docProto, 'documentElement')
  const originalDocHead = Object.getOwnPropertyDescriptor(docProto, 'head')
  const originalDocActive = Object.getOwnPropertyDescriptor(docProto, 'activeElement')
  const originalDocDefaultView = Object.getOwnPropertyDescriptor(docProto, 'defaultView')
  const originalDocScrolling = Object.getOwnPropertyDescriptor(docProto, 'scrollingElement')

  Object.defineProperties(document, {
    body: {
      get() {
        const activeDoc = getActiveDocument()
        if (activeDoc && activeDoc !== document) {
          return activeDoc.body
        }
        return originalDocBody?.get?.call(document) || document.body
      },
      configurable: true,
    },
    documentElement: {
      get() {
        const activeDoc = getActiveDocument()
        if (activeDoc && activeDoc !== document) {
          return activeDoc.documentElement
        }
        return originalDocEl?.get?.call(document) || document.documentElement
      },
      configurable: true,
    },
    head: {
      get() {
        const activeDoc = getActiveDocument()
        if (activeDoc && activeDoc !== document) {
          return activeDoc.head
        }
        return originalDocHead?.get?.call(document) || document.head
      },
      configurable: true,
    },
    activeElement: {
      get() {
        const activeDoc = getActiveDocument()
        if (activeDoc && activeDoc !== document) {
          return activeDoc.activeElement
        }
        return originalDocActive?.get?.call(document) || document.activeElement
      },
      configurable: true,
    },
    defaultView: {
      get() {
        const activeDoc = getActiveDocument()
        if (activeDoc && activeDoc !== document) {
          return activeDoc.defaultView
        }
        return originalDocDefaultView?.get?.call(document) || document.defaultView
      },
      configurable: true,
    },
    scrollingElement: {
      get() {
        const activeDoc = getActiveDocument()
        if (activeDoc && activeDoc !== document) {
          return activeDoc.scrollingElement
        }
        return originalDocScrolling?.get?.call(document) || document.scrollingElement
      },
      configurable: true,
    },
  })

  // Proxy Window properties to active popout window when one is active
  const winProto = Window.prototype
  const originalWinGetters: Record<string, (() => unknown) | undefined> = {}
  WIN_PROPERTIES.forEach((prop) => {
    const desc =
      Object.getOwnPropertyDescriptor(winProto, prop) ||
      Object.getOwnPropertyDescriptor(window, prop)
    if (!originalWinDescriptors.has(prop)) {
      originalWinDescriptors.set(prop, Object.getOwnPropertyDescriptor(window, prop))
    }
    if (desc && desc.get) {
      originalWinGetters[prop] = desc.get
    }
  })

  WIN_PROPERTIES.forEach((prop) => {
    Object.defineProperty(window, prop, {
      get() {
        const activeDoc = getActiveDocument()
        if (activeDoc && activeDoc !== document && activeDoc.defaultView) {
          try {
            return (activeDoc.defaultView as unknown as Record<string, unknown>)[prop]
          } catch {}
        }
        const orig = originalWinGetters[prop]
        if (orig) {
          return orig.call(window)
        }
        return (window as unknown as Record<string, unknown>)[prop]
      },
      configurable: true,
    })
  })

  // Proxy Node.prototype.contains to account for nodes inside popout documents
  originalContains = Node.prototype.contains
  Node.prototype.contains = function (this: Node, otherNode: Node | null) {
    if (!otherNode) return false
    if (originalContains!.call(this, otherNode)) return true

    if (this === document || this === document.body || this === document.documentElement) {
      for (const doc of activePopoutDocuments) {
        try {
          if (doc.contains(otherNode)) {
            return true
          }
        } catch {}
      }
    }
    return false
  }

  // Reset active document on main window events
  EVENTS_TO_TRACK.forEach((evtName) => {
    window.addEventListener(evtName, resetActive, true)
  })

  // Intercept document creation & query methods
  originalCreateElement = document.createElement
  document.createElement = function (tagName: string, options?: ElementCreationOptions) {
    const activeDoc = getActiveDocument()
    if (activeDoc && activeDoc !== document) {
      return activeDoc.createElement(tagName, options)
    }
    return originalCreateElement!.call(document, tagName, options)
  }

  originalGetElementById = document.getElementById
  document.getElementById = function (id: string) {
    const activeDoc = getActiveDocument()
    if (activeDoc && activeDoc !== document) {
      return activeDoc.getElementById(id)
    }
    const mainEl = originalGetElementById!.call(document, id)
    if (mainEl) return mainEl

    // Fallback lookups to popout documents
    for (const doc of activePopoutDocuments) {
      try {
        const el = doc.getElementById(id)
        if (el) return el
      } catch {}
    }
    return null
  }

  originalQuerySelector = document.querySelector
  document.querySelector = function (selector: string) {
    const activeDoc = getActiveDocument()
    if (activeDoc && activeDoc !== document) {
      return activeDoc.querySelector(selector)
    }
    const mainEl = originalQuerySelector!.call(document, selector)
    if (mainEl) return mainEl

    for (const doc of activePopoutDocuments) {
      try {
        const el = doc.querySelector(selector)
        if (el) return el
      } catch {}
    }
    return null
  }

  originalQuerySelectorAll = document.querySelectorAll
  document.querySelectorAll = function (selector: string) {
    const activeDoc = getActiveDocument()
    if (activeDoc && activeDoc !== document) {
      return activeDoc.querySelectorAll(selector)
    }
    const mainResults = originalQuerySelectorAll!.call(document, selector)
    if (mainResults.length > 0) return mainResults

    for (const doc of activePopoutDocuments) {
      try {
        const results = doc.querySelectorAll(selector)
        if (results.length > 0) return results
      } catch {}
    }
    return mainResults
  }
}

export function teardownPopoutInterception(): void {
  if (typeof window === 'undefined' || !interceptionInitialized) return
  interceptionInitialized = false

  // Restore Symbol.hasInstance on all constructors
  originalHasInstances.forEach((desc, target) => {
    if (desc) {
      Object.defineProperty(target, Symbol.hasInstance, desc)
    } else {
      delete (target as Record<symbol, unknown>)[Symbol.hasInstance]
    }
  })
  originalHasInstances.clear()

  // Remove own property descriptors defined on document
  DOC_PROPERTIES.forEach((prop) => {
    try {
      delete (document as unknown as Record<string, unknown>)[prop]
    } catch {}
  })

  // Restore window property descriptors
  WIN_PROPERTIES.forEach((prop) => {
    const orig = originalWinDescriptors.get(prop)
    try {
      if (orig) {
        Object.defineProperty(window, prop, orig)
      } else {
        delete (window as unknown as Record<string, unknown>)[prop]
      }
    } catch {}
  })
  originalWinDescriptors.clear()

  // Restore Node.prototype.contains
  if (originalContains) {
    Node.prototype.contains = originalContains
    originalContains = null
  }

  // Remove window event listeners
  EVENTS_TO_TRACK.forEach((evtName) => {
    window.removeEventListener(evtName, resetActive, true)
  })

  // Restore document methods
  if (originalCreateElement) {
    document.createElement = originalCreateElement
    originalCreateElement = null
  }
  if (originalGetElementById) {
    document.getElementById = originalGetElementById
    originalGetElementById = null
  }
  if (originalQuerySelector) {
    document.querySelector = originalQuerySelector
    originalQuerySelector = null
  }
  if (originalQuerySelectorAll) {
    document.querySelectorAll = originalQuerySelectorAll
    originalQuerySelectorAll = null
  }

  resetActive()
  activePopoutDocuments.clear()
}
