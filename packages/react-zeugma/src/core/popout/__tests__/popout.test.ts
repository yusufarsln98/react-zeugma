import { describe, it, expect, beforeEach, afterEach } from 'vitest'
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

    // Run setup
    setupPopoutInterception()

    // Methods should be wrapped
    expect(document.createElement).not.toBe(originalCreateElement)
    expect(document.querySelector).not.toBe(originalQuerySelector)

    // Run teardown
    teardownPopoutInterception()

    // Methods should be restored
    expect(document.createElement).toBe(originalCreateElement)
    expect(document.querySelector).toBe(originalQuerySelector)
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
})
