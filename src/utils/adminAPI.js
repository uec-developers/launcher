const  API_BASE = process.env.NODE_ENV === 'production' 
  ? `http://${window.location.hostname}:3001/api`
  : 'http://localhost:3001/api'  

export const adminAPI = {
  getStats: async () => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    return response.json()
  },

  getUsers: async () => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE}/admin/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    return response.json()
  },

  getChatHistory: async (limit = 100) => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE}/admin/chat-history?limit=${limit}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    return response.json()
  },

  deleteMessage: async (messageId) => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE}/admin/delete-message`, {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ messageId })
    })
    return response.json()
  },

  banUser: async (userId) => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE}/admin/ban-user`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ userId })
    })
    return response.json()
  }
}
 