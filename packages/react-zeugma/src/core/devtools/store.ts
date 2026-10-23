type Listener = () => void

interface GlobalCounterRecord {
  mounts: number
  renders: number
  listeners: Set<Listener>
}

const store = new Map<string, GlobalCounterRecord>()

export function getCounterRecord(id: string): GlobalCounterRecord {
  let record = store.get(id)
  if (!record) {
    record = { mounts: 0, renders: 0, listeners: new Set() }
    store.set(id, record)
  }
  return record
}

export function subscribeCounter(id: string, listener: Listener): () => void {
  const record = getCounterRecord(id)
  record.listeners.add(listener)
  return () => {
    record.listeners.delete(listener)
    if (record.listeners.size === 0 && record.mounts === 0) {
      store.delete(id)
    }
  }
}

export function notifyCounter(id: string) {
  const record = store.get(id)
  if (record) {
    record.listeners.forEach((fn) => fn())
  }
}

export function resetCounterRecord(id: string) {
  const record = store.get(id)
  if (record) {
    record.mounts = 0
    record.renders = 0
    notifyCounter(id)
  }
}

export function clearAllCounters() {
  store.clear()
}
