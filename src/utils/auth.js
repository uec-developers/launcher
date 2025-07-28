const  API_BASE = process.env.NODE_ENV === 'production' 
  ? `http://${window.location.hostname}:3001/api`
  : 'http://localhost:3001/api'   

export const authAPI = {
  register: async (userData) => {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })
    return response.json()
  },

  login: async (credentials) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    })
    return response.json()
  },

  forgotPassword: async (email) => {
    const response = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    return response.json()
  },

  resetPassword: async (token, newPassword) => {
    const response = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword })
    })
    return response.json()
  },

  getProfile: async () => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE}/auth/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    return response.json()
  }
}
 