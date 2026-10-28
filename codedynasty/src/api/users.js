import api from './client'

export const listUsers = () => api.get('/users')
