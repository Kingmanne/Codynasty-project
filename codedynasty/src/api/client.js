import axios from 'axios'

// 🔧 Replace with your API Gateway URL after deploying Lambda
const BASE_URL = import.meta.env.VITE_API_URL || 'https://k9niyxwz4e.execute-api.us-east-1.amazonaws.com'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT on every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cd_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api
