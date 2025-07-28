const  API_BASE = process.env.NODE_ENV === 'production' 
  ? `http://${window.location.hostname}:3001/api`
  : 'http://localhost:3001/api'  

export const chatAPI = {
  getMessages: async (limit = 50) => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE}/chat/messages?limit=${limit}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    return response.json()
  },

  sendMessage: async (message) => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE}/chat/send`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message })
    })
    return response.json()
  },

  getOnlineUsers: async () => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE}/chat/online-users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    return response.json()
  },

  connectWebSocket: (onMessage, onUserStatusChange) => {
    const wsHost = process.env.NODE_ENV === 'production' 
      ? `ws://${window.location.hostname}:3001`
      : 'ws://localhost:3001' 
    const ws = new WebSocket(wsHost) 
    
    ws.onopen = () => {
      const token = localStorage.getItem('token')
      if (token) {
        ws.send(JSON.stringify({ type: 'auth', token }))
      }
    }
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      if (data.type === 'message') {
        onMessage(data.data)
      } else if (data.type === 'userOnline' || data.type === 'userOffline') {
        onUserStatusChange(data.data, data.type === 'userOnline')
      }
    }
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
    
    return ws
  }
}
 