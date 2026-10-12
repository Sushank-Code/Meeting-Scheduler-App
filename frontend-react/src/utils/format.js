// Shared date / duration / platform formatting helpers.
// Import from here instead of redefining these in every page.

/**
 * Rich date-time formatter for detail views.
 * Returns { date, time } with Today / Tomorrow awareness.
 * Example: formatDateTime('2026-10-10T10:00:00')
 *   → { date: 'Today, October 10, 2026', time: '10:00 AM' }
 */
export const formatDateTime = (value) => {
  if (!value) return { date: 'Date not set', time: '' }
  const d = new Date(value)
  if (isNaN(d.getTime())) return { date: value, time: '' }
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  const tomorrow = new Date(now)
  tomorrow.setDate(now.getDate() + 1)
  const isTomorrow = d.toDateString() === tomorrow.toDateString()

  let dateStr = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  if (isToday) dateStr = 'Today, ' + d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  else if (isTomorrow) dateStr = 'Tomorrow, ' + d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  return { date: dateStr, time: timeStr }
}

/**
 * Compact single-string date-time formatter for tables / lists.
 * Example: formatDate('2026-10-10T10:00:00') → 'Oct 10, 2026, 10:00 AM'
 */
export const formatDate = (value) => {
  if (!value) return 'Date not available'
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
  } catch {
    return value
  }
}

/**
 * Duration formatter. Accepts seconds (number / numeric string)
 * or an 'H:MM:SS' string. Returns e.g. '2h 30m', '2h', '30m'.
 */
export const formatDuration = (duration) => {
  if (!duration) return null
  if (/^\d+(\.\d+)?$/.test(String(duration))) {
    const totalMinutes = Math.round(Number(duration) / 60)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    if (hours && minutes) return `${hours}h ${minutes}m`
    if (hours) return `${hours}h`
    return `${minutes}m`
  }
  const [h, m] = String(duration).split(':').map(Number)
  if (!Number.isFinite(h)) return duration
  if (h && m) return `${h}h ${m}m`
  if (h) return `${h}h`
  return `${m}m`
}

/** 'google_meet' → 'Google Meet', anything else → 'Zoom' */
export const platformName = (locationType) =>
  locationType === 'google_meet' ? 'Google Meet' : 'Zoom'
