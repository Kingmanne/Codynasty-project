// 🔧 AppConfig hook — polls for feature flags from Lambda
// Your existing appconfig.js logic lives in Lambda, this hook reads the result
import { useState, useEffect } from 'react'
import api from '../api/client'

export function useAppConfig() {
  const [config, setConfig] = useState({
    maintenance_mode: false,
    show_new_banner: false,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await api.get('/config')
        setConfig(res.data)
      } catch {
        // fallback to defaults — Lambda may not be deployed yet
        console.warn('AppConfig endpoint not reachable, using defaults')
      } finally {
        setLoading(false)
      }
    }

    fetchConfig()
    // Poll every 30s (same cadence as your Lambda refreshConfig)
    const interval = setInterval(fetchConfig, 30000)
    return () => clearInterval(interval)
  }, [])

  return { config, loading }
}
