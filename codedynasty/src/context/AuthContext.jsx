import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('cd_token'))

  useEffect(() => {
    const stored = localStorage.getItem('cd_user')
    if (stored && token) {
      try { setUser(JSON.parse(stored)) } catch { logout() }
    }
  }, [])

  function login(userData, jwt) {
    setUser(userData)
    setToken(jwt)
    localStorage.setItem('cd_token', jwt)
    localStorage.setItem('cd_user', JSON.stringify(userData))
  }

  function logout() {
    setUser(null)
    setToken(null)
    localStorage.removeItem('cd_token')
    localStorage.removeItem('cd_user')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuth: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
