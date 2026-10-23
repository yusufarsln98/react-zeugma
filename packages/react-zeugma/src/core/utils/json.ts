export function safeJsonStringify(val: unknown): string {
  try {
    return JSON.stringify(val)
  } catch {
    return ''
  }
}
