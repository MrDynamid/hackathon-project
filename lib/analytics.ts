export function trackEvent(name: string, properties: Record<string, string | number | boolean> = {}) {
  if (typeof window === 'undefined') return
  const detail = { name, properties, timestamp: Date.now() }
  window.dispatchEvent(new CustomEvent('preppilot:analytics', { detail }))
  if (process.env.NODE_ENV === 'development') console.debug('[v0] analytics', detail)
}
