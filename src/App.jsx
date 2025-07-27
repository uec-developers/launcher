import  { useState, useEffect } from 'react'
import { Play, Settings, User, Download, Gamepad2, Users, Star, LogIn, HelpCircle, Link, MessageCircle, X, Eye, Trash, Plus, Edit, Calendar, ShieldOff } from 'lucide-react'  
import { authAPI } from './utils/auth'
import { chatAPI } from './utils/chatAPI'
import { adminAPI } from './utils/adminAPI'

export default function App() {
  const [selectedClient, setSelectedClient] = useState('Resent')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [authForm, setAuthForm] = useState({ username: '', email: '', password: '' })
  const [forgotEmail, setForgotEmail] = useState('')
  const [user, setUser] = useState(null)
  const [authMessage, setAuthMessage] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [chatMessages, setChatMessages] = useState([])
  const [onlineUsers, setOnlineUsers] = useState([])
  const [ws, setWs] = useState(null)
   const [showAdminPanel, setShowAdminPanel] = useState(false) 
  const [adminStats, setAdminStats] = useState({})
   const [adminUsers, setAdminUsers] = useState([])
  const [adminChatHistory, setAdminChatHistory] = useState([])
  const [showLinksModal, setShowLinksModal] = useState(false)
  const [showEaglercraftModal, setShowEaglercraftModal] = useState(false)
  const [links, setLinks] = useState([
    { name: 'Discord', url: 'https://discord.gg/6RXQxXhmN9' },
    { name: 'GitHub', url: 'https://github.com' }
  ])
  const [newLink, setNewLink] = useState({ name: '', url: '' }) 

  const clientConfigs = {
    'Resent': {
      name: 'Resent Client',
      url: '/clients/resent/index.html',
      description: 'Enhanced performance and UI'
    },
    'Shadow': {
      name: 'Shadow Client',
      url: '/clients/shadow/index.html',
      description: 'Try the new beta features!'
    },
    'Astra': {
      name: 'Astra Client',
      url: '/clients/astra/index.html',
      description: 'Lightweight and fast'
    },
    'Star-like': {
      name: 'Star-like Client',
      url: '/clients/starlike/index.html',
      description: 'Premium features included'
    },
    'eagly-mc': {
      name: 'Eagly-MC Client',
      url: '/clients/eaglymc/index.html',
      description: 'Classic Eaglercraft experience'
    }
  }

  const handleLaunchClient = () => {
    const client = clientConfigs[selectedClient]
    if (client) {
      window.open(client.url, '_blank')
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!chatMessage.trim()) return

    try {
      await chatAPI.sendMessage(chatMessage)
      setChatMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleAuthSubmit = async (e) => {
    e.preventDefault()
    setAuthMessage('')
    
    try {
      let result
      if (isSignUp) {
        result = await authAPI.register(authForm)
      } else {
        result = await authAPI.login({ username: authForm.username, password: authForm.password })
      }
      
      if (result.error) {
        setAuthMessage(result.error)
      } else {
        localStorage.setItem('token', result.token)
        setUser(result.user)
        setShowAuthModal(false)
        setAuthForm({ username: '', email: '', password: '' })
        initializeChat()
      }
    } catch (error) {
      setAuthMessage('Network error. Please try again.')
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setAuthMessage('')
    
    try {
      const result = await authAPI.forgotPassword(forgotEmail)
      if (result.error) {
        setAuthMessage(result.error)
      } else {
        setAuthMessage('Password reset email sent!')
        setShowForgotPassword(false)
        setForgotEmail('')
      }
    } catch (error) {
      setAuthMessage('Network error. Please try again.')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
    if (ws) {
      ws.close()
      setWs(null)
    }
    setChatMessages([])
    setOnlineUsers([])
    setShowChat(false)
    setShowAdminPanel(false)
  }

  const initializeChat = async () => {
    try {
      const [messages, users] = await Promise.all([
        chatAPI.getMessages(),
        chatAPI.getOnlineUsers()
      ])
      
      if (!messages.error) setChatMessages(messages)
      if (!users.error) setOnlineUsers(users)
      
      const websocket = chatAPI.connectWebSocket(
        (message) => {
          setChatMessages(prev => [...prev, message])
        },
        (user, isOnline) => {
          setOnlineUsers(prev => {
            if (isOnline) {
              return prev.some(u => u.id === user.id) ? prev : [...prev, user]
            } else {
              return prev.filter(u => u.id !== user.id)
            }
          })
        }
      )
      
      setWs(websocket)
    } catch (error) {
      console.error('Error initializing chat:', error)
    }
  }

  const handleChatOpen = () => {
    if (!user) {
      setShowAuthModal(true)
      setAuthMessage('Please sign in to access chat')
      return
    }
    setShowChat(true)
  }

  const handleAdminPanelOpen = async () => {
    if (!user || user.role !== 'admin') {
      setShowAuthModal(true)
      setAuthMessage('Admin access required')
      return
    }
    
    try {
      const [stats, users, chatHistory] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(),
        adminAPI.getChatHistory()
      ])
      
      if (!stats.error) setAdminStats(stats)
      if (!users.error) setAdminUsers(users)
      if (!chatHistory.error) setAdminChatHistory(chatHistory)
      
      setShowAdminPanel(true)
    } catch (error) {
      console.error('Error loading admin data:', error)
    }
  }

  

   useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      authAPI.getProfile().then(result => {
        if (!result.error) {
          setUser(result)
          initializeChat()
        } else {
          localStorage.removeItem('token')
        }
      }).catch(() => {
        localStorage.removeItem('token')
      })
    }
  }, []) 

  return (
    <div className={`min-h-screen bg-cover bg-center ${isDarkMode ? '' : 'brightness-110'}`} style={{backgroundImage: 'url(https://imagedelivery.net/FIZL8110j4px64kO6qJxWA/54d25ea2-e6d9-49f2-4a2d-716a5437e900/public)'}}>
      <div className={`min-h-screen backdrop-blur-sm ${isDarkMode ? 'bg-black/60' : 'bg-white/20'}`}>
        <div className="container mx-auto px-4 py-6">
          
          <header className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-6">
              <img 
                src="https://imagedelivery.net/FIZL8110j4px64kO6qJxWA/2dd12aef-f636-4a50-14f9-7ba77a9a9c00/public" 
                alt="UEC Logo"
                className="w-16 h-16"
              />
              <h1 className="text-white text-2xl font-bold">UEC Launcher</h1>
            </div>
            
            <div className="flex items-center space-x-6">
                           <button 
                onClick={() => setShowEaglercraftModal(true)}
                title="What is Eaglercraft?"
                className="p-2 text-gray-300 hover:text-white transition-colors"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
              
              <button 
                onClick={() => setShowLinksModal(true)}
                title="Links"
                className="p-2 text-gray-300 hover:text-white transition-colors"
              >
                <Link className="w-5 h-5" />
              </button> 
              <button 
                onClick={handleChatOpen}
                title="Chat"
                className="p-2 text-gray-300 hover:text-white transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
              
              {user && user.role === 'admin' && (
                <button 
                  onClick={handleAdminPanelOpen}
                  title="Admin Panel"
                  className="p-2 text-gray-300 hover:text-red-400 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </button>
              )}
              
                           <div className="relative">
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 text-gray-300 hover:text-white transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </button> 
                {showSettings && (
                  <div className="absolute right-0 top-12 bg-gray-800 rounded-lg p-4 w-48 border border-gray-600 z-10">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm">Dark Mode</span>
                      <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className={`w-12 h-6 rounded-full ${isDarkMode ? 'bg-blue-500' : 'bg-gray-600'} relative transition-colors`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button 
                onClick={() => window.open('https://discord.gg/6RXQxXhmN9', '_blank')}
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 rounded-lg px-4 py-2 transition-colors"
              >
                <Users className="w-4 h-4 text-white" />
                <span className="text-white text-sm">Join Discord</span>
              </button>
              
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-white text-sm">Welcome, {user.username}</span>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 rounded-lg px-4 py-2 transition-colors"
                  >
                    <LogIn className="w-4 h-4 text-white" />
                    <span className="text-white text-sm">Logout</span>
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2 transition-colors"
                >
                  <LogIn className="w-4 h-4 text-white" />
                  <span className="text-white text-sm">Sign In</span>
                </button>
              )}
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-900/90 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
                <img 
                  src="https://imagedelivery.net/FIZL8110j4px64kO6qJxWA/653e9116-c630-4cd9-5b5a-d065d0d90600/public" 
                  alt="Minecraft World"
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h2 className="text-xl font-bold text-white mb-2">UEC Launcher</h2>
                <p className="text-gray-300 text-sm mb-4">Best Eaglercraft Launcher out there.</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <label className="text-gray-300 text-sm">Choose Client:</label>
                    <select 
                      value={selectedClient}
                      onChange={(e) => setSelectedClient(e.target.value)}
                      className="bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="Resent">Resent</option>
                      <option value="Shadow">Shadow</option>
                      <option value="Astra">Astra</option>
                      <option value="Star-like">Star-like</option>
                      <option value="eagly-mc">eagly-mc</option>
                    </select>
                  </div>
                  
                  <button 
                    onClick={handleLaunchClient}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    <span>LAUNCH {selectedClient.toUpperCase()}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <button className="bg-gray-800/80 hover:bg-gray-700/80 text-white p-4 rounded-lg flex items-center space-x-3 transition-colors">
                  <Download className="w-5 h-5 text-blue-400" />
                  <span>Download Clients</span>
                </button>
                <button className="bg-gray-800/80 hover:bg-gray-700/80 text-white p-4 rounded-lg flex items-center space-x-3 transition-colors">
                  <Gamepad2 className="w-5 h-5 text-green-400" />
                  <span>Singleplayer</span>
                </button>
                <button className="bg-gray-800/80 hover:bg-gray-700/80 text-white p-4 rounded-lg flex items-center space-x-3 transition-colors">
                  <Users className="w-5 h-5 text-purple-400" />
                  <span>Multiplayer</span>
                </button> 
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-900/90 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
                               <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span>Latest News</span>
                </h3>
                <div className="space-y-4">
                  <div className="border-b border-gray-700 pb-3">
                    <h4 className="text-white text-sm font-medium mb-1">UEC Client Updated!</h4>
                    <p className="text-gray-400 text-xs">New features and bug fixes</p>
                  </div>
                  <div className="border-b border-gray-700 pb-3">
                    <h4 className="text-white text-sm font-medium mb-1">Added Resent Client</h4>
                  </div>
                  <div>
                    <h4 className="text-white text-sm font-medium mb-1">Added Shadow Client</h4>
                  </div>
                </div> 
              </div>

              <div className="bg-gray-900/90 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Client Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Online Users</span>
                    <span className="text-white font-semibold">{onlineUsers.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Server Members</span>
                    <span className="text-white font-semibold">8</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Client Version</span>
                    <span className="text-white font-semibold">v2.1.4</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-gray-400 text-xs text-center">© 2024 UEC Launcher. All rights reserved.</p>
                </div>
              </div> 
            </div>
          </div>
        </div>
      </div>

      

      {/* Admin Panel Modal */}
      {showAdminPanel && user && user.role === 'admin' && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl w-full max-w-6xl h-5/6 mx-4 border border-gray-700 flex">
            <div className="w-1/4 border-r border-gray-700 p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-semibold">Admin Panel</h3>
                <button onClick={() => setShowAdminPanel(false)} className="text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-2">
                <div className="text-blue-400 text-sm font-medium mb-2">Statistics</div>
                <div className="text-gray-300 text-sm space-y-1">
                  <div>Total Users: {adminStats.totalUsers || 0}</div>
                  <div>Online Users: {adminStats.onlineUsers || 0}</div>
                  <div>Total Messages: {adminStats.totalMessages || 0}</div>
                  <div>Active Reports: {adminStats.reports || 0}</div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-white font-semibold">User Management & Chat History</h3>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-white font-medium mb-3">Users</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {adminUsers.map(user => (
                        <div key={user.id} className="flex justify-between items-center p-2 bg-gray-800 rounded">
                          <div>
                            <span className="text-gray-300 text-sm">{user.username}</span>
                            <div className="text-xs text-gray-500">
                              {user.is_online ? 'Online' : `Last seen: ${new Date(user.last_seen).toLocaleDateString()}`}
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <button className="p-1 text-blue-400 hover:text-blue-300" title="View Profile">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-red-400 hover:text-red-300" title="Ban User">
                              <ShieldOff className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-white font-medium mb-3">Recent Chat Messages</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {adminChatHistory.map(msg => (
                        <div key={msg.id} className="p-2 bg-gray-800 rounded">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <span className="font-semibold text-sm text-blue-400">{msg.username}:</span>
                              <span className="text-gray-300 text-sm ml-2">{msg.message}</span>
                            </div>
                            <button className="p-1 text-red-400 hover:text-red-300" title="Delete Message">
                              <Trash className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="text-gray-500 text-xs">
                            {new Date(msg.created_at).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                               <div className="mt-6">
                  <h4 className="text-white font-medium mb-3">Content Management</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg flex items-center space-x-2">
                      <Plus className="w-4 h-4" />
                      <span>Send Announcement</span>
                    </button>
                    <button className="bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-lg flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Schedule Event</span>
                    </button>
                  </div>
                </div> 
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChat && user && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl w-full max-w-4xl h-5/6 mx-4 border border-gray-700 flex">
            <div className="w-1/3 border-r border-gray-700 p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-semibold">Users</h3>
                <button 
                  onClick={() => setShowChat(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-2">
                <div className="text-green-400 text-sm font-medium mb-2">Online ({onlineUsers.length})</div>
                {onlineUsers.map(user => (
                  <div key={user.id} className="flex items-center space-x-2 p-2 hover:bg-gray-800 rounded">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-300 text-sm">{user.username}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-white font-semibold">General Chat</h3>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {chatMessages.map(msg => (
                  <div key={msg.id} className="flex justify-between items-start">
                    <div className="flex space-x-2">
                      <span className="font-semibold text-sm text-blue-400">
                        {msg.username}:
                      </span>
                      <span className="text-gray-300 text-sm">{msg.message}</span>
                    </div>
                    <span className="text-gray-500 text-xs">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-t border-gray-700">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <input 
                    type="text" 
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                  <button 
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-8 max-w-md w-full mx-4 border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </h2>
              <button 
                onClick={() => setShowAuthModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {showForgotPassword ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Email</label>
                  <input 
                    type="email" 
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                
                <button 
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition-colors"
                >
                  Send Reset Email
                </button>
                
                <button 
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="w-full text-gray-400 hover:text-white text-sm"
                >
                  Back to Sign In
                </button>
              </form>
            ) : (
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Username</label>
                  <input 
                    type="text" 
                    value={authForm.username}
                    onChange={(e) => setAuthForm({...authForm, username: e.target.value})}
                    className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="Enter username"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Password</label>
                  <input 
                    type="password" 
                    value={authForm.password}
                    onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                    className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="Enter password"
                    required
                  />
                </div>
                
                {isSignUp && (
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Email</label>
                    <input 
                      type="email" 
                      value={authForm.email}
                      onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                      className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                      placeholder="Enter email"
                      required
                    />
                  </div>
                )}
                
                {authMessage && (
                  <div className={`text-sm p-2 rounded ${authMessage.includes('sent') ? 'text-green-400 bg-green-900/20' : 'text-red-400 bg-red-900/20'}`}>
                    {authMessage}
                  </div>
                )}
                
                <button 
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition-colors"
                >
                  {isSignUp ? 'Sign Up' : 'Sign In'}
                </button>
                
                {!isSignUp && (
                  <button 
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="w-full text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Forgot Password?
                  </button>
                )}
              </form>
            )}
            
            {!showForgotPassword && (
              <div className="mt-4 text-center">
                <button 
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                </button>
              </div>
            )}
          </div>
        </div>
           )}

      {/* Links Modal */}
      {showLinksModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Quick Links</h2>
              <button onClick={() => setShowLinksModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-3 mb-4">
              {links.map((link, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                  <span className="text-white">{link.name}</span>
                  <button 
                    onClick={() => window.open(link.url, '_blank')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Visit
                  </button>
                </div>
              ))}
            </div>
            
            {user && user.role === 'admin' && (
              <div className="border-t border-gray-700 pt-4">
                <h3 className="text-white font-medium mb-2">Add New Link</h3>
                <div className="space-y-2">
                  <input 
                    type="text" 
                    placeholder="Link name"
                    value={newLink.name}
                    onChange={(e) => setNewLink({...newLink, name: e.target.value})}
                    className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-600"
                  />
                  <input 
                    type="url" 
                    placeholder="URL"
                    value={newLink.url}
                    onChange={(e) => setNewLink({...newLink, url: e.target.value})}
                    className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-600"
                  />
                  <button 
                    onClick={() => {
                      if (newLink.name && newLink.url) {
                        setLinks([...links, newLink])
                        setNewLink({ name: '', url: '' })
                      }
                    }}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded"
                  >
                    Add Link
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* What is Eaglercraft Modal */}
      {showEaglercraftModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full mx-4 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">What is Eaglercraft?</h2>
              <button onClick={() => setShowEaglercraftModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="text-gray-300 space-y-4">
              <p>
                Eaglercraft is a browser-based version of Minecraft Java Edition that runs entirely in your web browser. 
                It allows you to play Minecraft without downloading anything to your computer.
              </p>
              
              <div>
                <h3 className="text-white font-semibold mb-2">Key Features:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Runs directly in your browser - no downloads required</li>
                  <li>Supports multiplayer gameplay</li>
                  <li>Compatible with most modern web browsers</li>
                  <li>Multiple client versions available</li>
                  <li>Active community and server support</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-white font-semibold mb-2">Available Clients:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Resent:</strong> Enhanced performance with modern UI</li>
                  <li><strong>Shadow:</strong> Beta features and experimental gameplay</li>
                  <li><strong>Astra:</strong> Lightweight and optimized for speed</li>
                  <li><strong>Star-like:</strong> Premium features and customization</li>
                  <li><strong>Eagly-MC:</strong> Classic Eaglercraft experience</li>
                </ul>
              </div>
              
              <p className="text-sm">
                Simply select a client from the dropdown menu and click "LAUNCH" to start playing. 
                Join our Discord community for servers, support, and updates!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 
 