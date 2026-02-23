import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({ baseURL: BASE_URL, headers: { 'Content-Type': 'application/json' } })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token_caso5')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const loginApi              = (data)     => api.post('/auth/login', data)

export const getAuditorios         = ()         => api.get('/auditorios')
export const crearAuditorio        = (data)     => api.post('/auditorios', data)
export const editarAuditorio       = (id, data) => api.put(`/auditorios/${id}`, data)
export const borrarAuditorio       = (id)       => api.delete(`/auditorios/${id}`)

export const getConferencistas     = ()         => api.get('/conferencistas')
export const crearConferencista    = (data)     => api.post('/conferencistas', data)
export const editarConferencista   = (id, data) => api.put(`/conferencistas/${id}`, data)
export const borrarConferencista   = (id)       => api.delete(`/conferencistas/${id}`)

export const getReservas           = ()         => api.get('/reservas')
export const crearReserva          = (data)     => api.post('/reservas', data)
export const editarReserva         = (id, data) => api.put(`/reservas/${id}`, data)
export const borrarReserva         = (id)       => api.delete(`/reservas/${id}`)

export default api
