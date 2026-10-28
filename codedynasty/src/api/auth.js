import api from './client'

export const signUp = (name, email, password) =>
  api.post('/signup', { name, email, password })

export const login = (email, password) =>
  api.post('/login', { email, password })
