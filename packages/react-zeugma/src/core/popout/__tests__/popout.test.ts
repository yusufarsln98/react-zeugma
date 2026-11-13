import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  setupPopoutInterception,
  teardownPopoutInterception,
  getActiveDocument,
  setActivePopoutDocument,
  setLastActiveEvent,
  addActivePopoutDocument,
  removeActivePopoutDocument,
  getActivePopoutDocuments,
} from '../interception'
import { detectSeamlessBackground } from '../style-mirror'
import { openPopoutWindow } from '../window'
import { POPOUT_DEFAULT_FALLBACK_BG } from '../../config'

describe('Popout Interception and Isolation', () => {
  beforeEach(() => {
    teardownPopoutInterception()
  })

  afterEach(() => {
    teardownPopoutInterception()
  })

  it('correctly tracks and restores global interception', () => {
    const originalCreateElement = document.createElement
    const originalQuerySelector = document.querySelector
    const originalDocAddEventListener = document.addEventListener
    const originalDocRemoveEventListener = document.removeEventListener
    const originalWinAddEventListener = window.addEventListener
    const originalWinRemoveEventListener = window.removeEventListener

    // Run setup
    setupPopoutInterception()

    // Methods should be wrapped
    expect(document.createElement).not.toBe(originalCreateElement)
    expect(document.querySelector).not.toBe(originalQuerySelector)
    expect(document.addEventListener).not.toBe(originalDocAddEventListener)
    expect(document.removeEventListener).not.toBe(originalDocRemoveEventListener)
    expect(window.addEventListener).not.toBe(originalWinAddEventListener)
    expect(window.removeEventListener).not.toBe(originalWinRemoveEventListener)

    // Run teardown
    teardownPopoutInterception()

    // Methods should be restored
    expect(document.createElement).toBe(originalCreateElement)
    expect(document.querySelector).toBe(originalQuerySelector)
    expect(document.addEventListener).toBe(originalDocAddEventListener)
    expect(document.removeEventListener).toBe(originalDocRemoveEventListener)
    expect(window.addEventListener).toBe(originalWinAddEventListener)
    expect(window.removeEventListener).toBe(originalWinRemoveEventListener)
  })

  it('getActiveDocument returns document by default', () => {
    expect(getActiveDocument()).toBe(document)
  })

  it('getActiveDocument respects active popout documents', () => {
    setupPopoutInterception()

    const mockPopoutDoc = document.implementation.createHTMLDocument('Popout')
    addActivePopoutDocument(mockPopoutDoc)
    expect(getActivePopoutDocuments().has(mockPopoutDoc)).toBe(true)

    // With active popout document set
    setActivePopoutDocument(mockPopoutDoc)
    expect(getActiveDocument()).toBe(mockPopoutDoc)

    // With lastActiveEvent set to an element in the mock popout document
    const mockEl = mockPopoutDoc.createElement('div')
    mockPopoutDoc.body.appendChild(mockEl)
    const mockEvent = { target: mockEl } as unknown as Event
    setLastActiveEvent(mockEvent)
    expect(getActiveDocument()).toBe(mockPopoutDoc)

    // When removed
    removeActivePopoutDocument(mockPopoutDoc)
    expect(getActiveDocument()).toBe(document)
  })

  it('detectSeamlessBackground falls back to POPOUT_DEFAULT_FALLBACK_BG when no style present', () => {
    const bg = detectSeamlessBackground('non-existent-tab')
    expect(bg).toBe(POPOUT_DEFAULT_FALLBACK_BG)
  })

  it('routes document drag listeners to active popout document and removes them after active state resets', () => {
    setupPopoutInterception()

    const mockPopoutDoc = document.implementation.createHTMLDocument('Popout')
    addActivePopoutDocument(mockPopoutDoc)
    setActivePopoutDocument(mockPopoutDoc)

    const onMove = vi.fn()
    const onUp = vi.fn()

    // Simulate Leaflet Draggable._onDown registering document listeners during popout mousedown
    document.addEventListener('mousemove', onMove, false)
    document.addEventListener('mouseup', onUp, false)

    // Active popout state is cleared asynchronously after mousedown
    setActivePopoutDocument(null)
    setLastActiveEvent(null)

    // Events on main document should NOT trigger popout drag listeners
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 10, clientY: 10 }))
    expect(onMove).not.toHaveBeenCalled()

    // Events on popout document SHOULD trigger popout drag listeners
    mockPopoutDoc.dispatchEvent(new MouseEvent('mousemove', { clientX: 25, clientY: 30 }))
    expect(onMove).toHaveBeenCalledTimes(1)

    mockPopoutDoc.dispatchEvent(new MouseEvent('mouseup'))
    expect(onUp).toHaveBeenCalledTimes(1)

    // Removing listeners when activePopoutDocument is null must still unbind from mockPopoutDoc
    document.removeEventListener('mousemove', onMove, false)
    document.removeEventListener('mouseup', onUp, false)

    mockPopoutDoc.dispatchEvent(new MouseEvent('mousemove', { clientX: 40, clientY: 50 }))
    mockPopoutDoc.dispatchEvent(new MouseEvent('mouseup'))
    expect(onMove).toHaveBeenCalledTimes(1)
    expect(onUp).toHaveBeenCalledTimes(1)
  })

  it('routes window listeners to active popout defaultView and removes them after active state resets', () => {
    setupPopoutInterception()

    const mockPopoutDoc = document.implementation.createHTMLDocument('Popout')
    const mockPopoutWin = new EventTarget() as unknown as Window
    Object.defineProperty(mockPopoutDoc, 'defaultView', {
      value: mockPopoutWin,
      configurable: true,
    })

    addActivePopoutDocument(mockPopoutDoc)
    setActivePopoutDocument(mockPopoutDoc)

    const onSelectStart = vi.fn()
    window.addEventListener('selectstart', onSelectStart, false)

    setActivePopoutDocument(null)

    mockPopoutWin.dispatchEvent(new Event('selectstart'))
    expect(onSelectStart).toHaveBeenCalledTimes(1)

    window.removeEventListener('selectstart', onSelectStart, false)
    mockPopoutWin.dispatchEvent(new Event('selectstart'))
    expect(onSelectStart).toHaveBeenCalledTimes(1)
  })

  it('openPopoutWindow passes optional url to window.open and skips synchronous head clearing when url is provided', () => {
    const mockDoc = document.implementation.createHTMLDocument('Popout')
    mockDoc.head.innerHTML = '<meta charset="utf-8">'
    const mockWin = { document: mockDoc } as unknown as Window
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(mockWin)

    try {
      openPopoutWindow('tab-1', 'Map Tab')
      expect(openSpy).toHaveBeenCalledWith(
        '/popout.html',
        'zeugma-popout-tab-1',
        'width=800,height=600',
      )
      expect(mockDoc.head.innerHTML).toBe('<meta charset="utf-8">')

      openPopoutWindow('tab-2', 'Blank Tab', '')
      expect(openSpy).toHaveBeenCalledWith('', 'zeugma-popout-tab-2', 'width=800,height=600')
      expect(mockDoc.title).toBe('Blank Tab')
      expect(mockDoc.head.querySelector('meta')).toBeNull()
    } finally {
      openSpy.mockRestore()
    }
  })
})
