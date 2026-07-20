/**
 * useAiLimit — React hook for checking the user's AI OCR quota
 *
 * Usage:
 *   const { checkLimit, limitExceeded, used, limit, closeLimitModal } = useAiLimit()
 *
 *   // Before sending a file to OCR:
 *   const canProceed = await checkLimit()
 *   if (!canProceed) return  // AiLimitModal is now open
 *
 * The hook also caches the last known limit/used values in memory so that
 * repeated opens of the same modal don't need extra network requests.
 *
 * The check-limit endpoint is lightweight (read-only, no quota consumed).
 */

import { useState, useCallback, useRef } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

// Module-level cache so all hook instances share the same data within a session.
// Invalidated after each successful OCR so the updated count is reflected.
let _cached = null       // { used, limit, canUse, fetchedAt }
const CACHE_TTL_MS = 60_000  // re-fetch at most once per minute

const getFromCache = () => {
  if (!_cached) return null
  if (Date.now() - _cached.fetchedAt > CACHE_TTL_MS) return null
  return _cached
}

export const invalidateAiLimitCache = () => {
  _cached = null
}

export const useAiLimit = () => {
  const [limitModalOpen, setLimitModalOpen] = useState(false)
  const [used, setUsed] = useState(0)
  const [limit, setLimit] = useState(0)
  const fetchingRef = useRef(false)

  /**
   * Checks whether the user can use one more AI scan.
   * Returns true if OK to proceed, false if limit exceeded (modal is opened).
   */
  const checkLimit = useCallback(async () => {
    // Try module-level cache first
    const cached = getFromCache()
    if (cached) {
      if (!cached.canUse) {
        setUsed(cached.used)
        setLimit(cached.limit)
        setLimitModalOpen(true)
        return false
      }
      return true
    }

    // Guard against concurrent fetches
    if (fetchingRef.current) return true
    fetchingRef.current = true

    try {
      const res = await axios.get(`${API_URL}/api/ocr/check-limit`, { withCredentials: true })
      const { canUse = true, used: u = 0, limit: l = 0 } = res.data || {}

      _cached = { canUse, used: u, limit: l, fetchedAt: Date.now() }

      if (!canUse) {
        setUsed(u)
        setLimit(l)
        setLimitModalOpen(true)
        return false
      }
      return true
    } catch {
      // If check fails, allow through — the OCR endpoint will enforce the limit
      return true
    } finally {
      fetchingRef.current = false
    }
  }, [])

  const closeLimitModal = useCallback(() => {
    setLimitModalOpen(false)
  }, [])

  return {
    checkLimit,
    limitModalOpen,
    closeLimitModal,
    used,
    limit,
  }
}
