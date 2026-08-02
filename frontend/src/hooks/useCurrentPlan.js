import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

let cache = null
let inflight = null

const fetchPlan = () => {
  if (inflight) return inflight
  inflight = axios
    .get(`${API_URL}/api/user-plans/my-plan`, { withCredentials: true })
    .then((res) => {
      cache = res.data?.data || null
      return cache
    })
    .catch(() => {
      cache = null
      return cache
    })
    .finally(() => {
      inflight = null
    })
  return inflight
}

const resetCache = () => {
  cache = null
}

const useCurrentPlan = () => {
  const [plan, setPlan] = useState(cache)
  const [loading, setLoading] = useState(!cache)

  useEffect(() => {
    let active = true
    fetchPlan().then((data) => {
      if (active) {
        setPlan(data)
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [])

  const features = plan?.status === 'active' ? plan.planId?.features || {} : {}

  return { plan, features, loading, resetCache }
}

export default useCurrentPlan
