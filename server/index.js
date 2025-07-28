const  express = require('express') 
const cors = require('cors')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const sqlite3 = require('sqlite3').verbose()
const WebSocket = require('ws')
const http = require('http')
const path = require('path')

const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

app.use(cors({
   origin: process.env.NODE_ENV === 'production' 
    ? ['*']
    : 'http://localhost:3000',
  credentials: true
}))  
app.use(express.json())

// Use persistent database for production
const dbPath = process.env.NODE_ENV === 'production' ? './data/database.sqlite' : ':memory:'
const db = new sqlite3.Database(dbPath)

// Initialize database
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user',
    is_online INTEGER DEFAULT 0,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)

  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    username TEXT,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`)

  // Check if admin exists, if not create one
  db.get("SELECT * FROM users WHERE role = 'admin'", (err, admin) => {
    if (!admin) {
      const adminPassword = bcrypt.hashSync('admin123', 10)
      db.run("INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)", 
        ['admin', 'admin@uec.com', adminPassword, 'admin'])
    }
  })
})

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key'
const connectedClients = new Map()

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' })
    req.user = user
    next()
  })
}

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}

// Send email function
const sendEmail = async (to, subject, content) => {
  try {
    const response = await fetch('https://hooks.jdoodle.net/proxy?url=https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: to }],
          subject: subject
        }],
        from: { email: process.env.SENDGRID_FROM_EMAIL || 'noreply@uec.com' },
        content: [{
          type: 'text/plain',
          value: content
        }]
      })
    })
    return response.ok
  } catch (error) {
    console.error('Email send error:', error)
    return false
  }
}

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body

  const hashedPassword = await bcrypt.hash(password, 10)
  
  db.run("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", 
    [username, email, hashedPassword], function(err) {
    if (err) {
      return res.json({ error: 'Username or email already exists' })
    }
    
    const token = jwt.sign({ id: this.lastID, username, role: 'user' }, JWT_SECRET)
    res.json({ token, user: { id: this.lastID, username, email, role: 'user' } })
  })
})

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body

  db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
    if (err || !user) {
      return res.json({ error: 'Invalid credentials' })
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.json({ error: 'Invalid credentials' })
    }

    db.run("UPDATE users SET is_online = 1, last_seen = CURRENT_TIMESTAMP WHERE id = ?", [user.id])

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET)
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        role: user.role 
      } 
    })
  })
})

app.get('/api/auth/profile', authenticateToken, (req, res) => {
  db.get("SELECT id, username, email, role FROM users WHERE id = ?", [req.user.id], (err, user) => {
    if (err || !user) {
      return res.json({ error: 'User not found' })
    }
    res.json(user)
  })
})

app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body
  
  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (err || !user) {
      return res.json({ error: 'Email not found' })
    }

    const resetToken = Math.random().toString(36).substring(2, 15)
    const emailSent = await sendEmail(email, 'Password Reset', `Your reset token: ${resetToken}`)
    
    if (emailSent) {
      res.json({ message: 'Password reset email sent' })
    } else {
      res.json({ error: 'Failed to send email' })
    }
  })
})

// Chat routes
app.get('/api/chat/messages', authenticateToken, (req, res) => {
  const limit = req.query.limit || 50
  
  db.all("SELECT * FROM messages ORDER BY created_at DESC LIMIT ?", [limit], (err, messages) => {
    if (err) {
      return res.json({ error: 'Failed to fetch messages' })
    }
    res.json(messages.reverse())
  })
})

app.post('/api/chat/send', authenticateToken, (req, res) => {
  const { message } = req.body
  
  db.run("INSERT INTO messages (user_id, username, message) VALUES (?, ?, ?)", 
    [req.user.id, req.user.username, message], function(err) {
    if (err) {
      return res.json({ error: 'Failed to send message' })
    }
    
    const newMessage = {
      id: this.lastID,
      user_id: req.user.id,
      username: req.user.username,
      message,
      created_at: new Date().toISOString()
    }
    
    // Broadcast to all connected clients
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'message', data: newMessage }))
      }
    })
    
    res.json(newMessage)
  })
})

app.get('/api/chat/online-users', authenticateToken, (req, res) => {
  db.all("SELECT id, username FROM users WHERE is_online = 1", (err, users) => {
    if (err) {
      return res.json({ error: 'Failed to fetch online users' })
    }
    res.json(users)
  })
})

// Admin routes
app.get('/api/admin/stats', authenticateToken, requireAdmin, (req, res) => {
  Promise.all([
    new Promise((resolve) => {
      db.get("SELECT COUNT(*) as count FROM users", (err, result) => {
        resolve(err ? 0 : result.count)
      })
    }),
    new Promise((resolve) => {
      db.get("SELECT COUNT(*) as count FROM users WHERE is_online = 1", (err, result) => {
        resolve(err ? 0 : result.count)
      })
    }),
    new Promise((resolve) => {
      db.get("SELECT COUNT(*) as count FROM messages", (err, result) => {
        resolve(err ? 0 : result.count)
      })
    })
  ]).then(([totalUsers, onlineUsers, totalMessages]) => {
    res.json({
      totalUsers,
      onlineUsers,
      totalMessages,
      reports: 0
    })
  })
})

app.get('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
  db.all("SELECT id, username, email, role, is_online, last_seen, created_at FROM users ORDER BY created_at DESC", (err, users) => {
    if (err) {
      return res.json({ error: 'Failed to fetch users' })
    }
    res.json(users)
  })
})

app.get('/api/admin/chat-history', authenticateToken, requireAdmin, (req, res) => {
  const limit = req.query.limit || 100
  
  db.all("SELECT * FROM messages ORDER BY created_at DESC LIMIT ?", [limit], (err, messages) => {
    if (err) {
      return res.json({ error: 'Failed to fetch chat history' })
    }
    res.json(messages)
  })
})

app.delete('/api/admin/delete-message', authenticateToken, requireAdmin, (req, res) => {
  const { messageId } = req.body
  
  db.run("DELETE FROM messages WHERE id = ?", [messageId], function(err) {
    if (err) {
      return res.json({ error: 'Failed to delete message' })
    }
    res.json({ success: true })
  })
})

app.post('/api/admin/ban-user', authenticateToken, requireAdmin, (req, res) => {
  const { userId } = req.body
  
  db.run("UPDATE users SET is_online = 0 WHERE id = ?", [userId], function(err) {
    if (err) {
      return res.json({ error: 'Failed to ban user' })
    }
    res.json({ success: true })
  })
})

// WebSocket handling
wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message)
      
      if (data.type === 'auth' && data.token) {
        jwt.verify(data.token, JWT_SECRET, (err, user) => {
          if (!err) {
            connectedClients.set(ws, user)
            
            // Broadcast user online status
            wss.clients.forEach(client => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ 
                  type: 'userOnline', 
                  data: { id: user.id, username: user.username } 
                }))
              }
            })
          }
        })
      }
    } catch (error) {
      console.error('WebSocket message error:', error)
    }
  })

  ws.on('close', () => {
    const user = connectedClients.get(ws)
    if (user) {
      connectedClients.delete(ws)
      db.run("UPDATE users SET is_online = 0, last_seen = CURRENT_TIMESTAMP WHERE id = ?", [user.id])
      
      // Broadcast user offline status
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ 
            type: 'userOffline', 
            data: { id: user.id, username: user.username } 
          }))
        }
      })
    }
  })
})

const  PORT = process.env.PORT || 3001
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
}) 
 