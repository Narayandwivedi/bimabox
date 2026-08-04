import { useState, useEffect } from 'react'
import axios from 'axios'
import { PLANS_CONFIG } from '../config/plansConfig'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

let cache = null
let inflight = null

const configForPlanKey = (planKey) => {
  if (!planKey) return null
  return PLANS_CONFIG.find((p) => p.id === planKey) || PLANS_CONFIG.find((p) => p.name.toLowerCase() === String(planKey).toLowerCase()) || null
}

// Merges the backend's current plan record (planKey, status, usage, expiry)
// with the frontend-managed plan definitions from plansConfig.js. Features and
// limits come from the frontend config.
const buildPlan = (data) => {
  if (!data) return null
  const config = configForPlanKey(data.planKey)
  return {
    ...(config || {}),
    planKey: data.planKey,
    name: config?.name || data.name || 'Free',
    status: data.status,
    startDate: data.startDate,
    expiryDate: data.expiryDate,
    usage: data.usage,
    clientsUsed: data.clientsUsed,
  }
}

const fetchPlan = () => {
  if (inflight) return inflight
  inflight = axios
    .get(`${API_URL}/api/user-plans/my-plan`, { withCredentials: true })
    .then((res) => {
      cache = buildPlan(res.data?.data || null)
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

  const features = plan?.status === 'active' ? plan.features || {} : {}

  return { plan, features, loading, resetCache }
}

export default useCurrentPlan
