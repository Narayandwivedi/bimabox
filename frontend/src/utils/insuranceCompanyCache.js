/**
 * Insurance Company Cache
 *
 * Caches the insurance companies list in localStorage so the modal can
 * display and match against the list instantly (without waiting for a
 * network round-trip), and refreshes the cache at most once per day.
 *
 * Cache key: bimabox_insurance_companies
 * Cache shape: { date: "YYYY-MM-DD", data: [...companies] }
 *
 * The midnight refresh is scheduled automatically when this module is first
 * imported, so any page that loads this module will keep the cache fresh.
 */

const CACHE_KEY = 'bimabox_insurance_companies'

/** Returns today's date string in YYYY-MM-DD format (local time). */
const todayStr = () => {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Read cache from localStorage. Returns null if absent or unparseable. */
const readCache = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/** Write a fresh cache entry to localStorage. */
const writeCache = (companies) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ date: todayStr(), data: companies }))
  } catch {
    // localStorage may be full or disabled — silently ignore
  }
}

/** Force-fetch companies from the backend and update the cache. */
export const refreshInsuranceCompaniesCache = async (apiUrl) => {
  const res = await fetch(`${apiUrl}/api/insurance-companies`, { credentials: 'include' })
  const json = await res.json()
  if (json?.success && Array.isArray(json.data)) {
    writeCache(json.data)
    return json.data
  }
  return []
}

/**
 * Returns the insurance companies list.
 *
 * - If a fresh cache exists (fetched today), returns it synchronously via
 *   the resolved Promise (no network request).
 * - Otherwise fetches from the backend, updates the cache, and returns the list.
 *
 * @param {string} apiUrl  Backend base URL (e.g. "http://localhost:5000")
 * @returns {Promise<Array>}
 */
export const getInsuranceCompanies = async (apiUrl) => {
  const cached = readCache()
  if (cached && cached.date === todayStr() && Array.isArray(cached.data) && cached.data.length > 0) {
    return cached.data
  }
  return refreshInsuranceCompaniesCache(apiUrl)
}

/**
 * Returns the cached list synchronously (may be empty [] if not yet fetched).
 * Useful for optimistic reads before the async fetch completes.
 */
export const getInsuranceCompaniesSync = () => {
  const cached = readCache()
  if (cached && cached.date === todayStr() && Array.isArray(cached.data)) {
    return cached.data
  }
  return []
}

/**
 * Schedule a midnight cache refresh.
 * Called once when this module is first imported.
 * Each refresh schedules the next one, keeping the cache perpetually fresh.
 */
const scheduleMidnightRefresh = (apiUrl) => {
  const now = new Date()
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 1, 0) // 00:01 next day
  const msUntilMidnight = midnight.getTime() - now.getTime()

  setTimeout(async () => {
    if (!apiUrl) return
    try {
      await refreshInsuranceCompaniesCache(apiUrl)
      console.log('[InsuranceCompanyCache] Midnight refresh completed.')
    } catch (err) {
      console.warn('[InsuranceCompanyCache] Midnight refresh failed:', err.message)
    }
    // Schedule the next midnight refresh
    scheduleMidnightRefresh(apiUrl)
  }, msUntilMidnight)
}

/**
 * Bootstrap the midnight scheduler.
 * Call this once from your app entry point (or let the modal call it on first load).
 * Passing apiUrl here so the scheduler knows where to fetch from.
 *
 * @param {string} apiUrl
 */
export const initInsuranceCompanyCache = (apiUrl) => {
  scheduleMidnightRefresh(apiUrl)
}
