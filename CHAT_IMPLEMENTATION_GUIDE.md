#  Chat Implementation Guide for UEC Launcher (Updated)

## Overview
This guide provides updated instructions for the enhanced chat system with admin moderation capabilities.

## New Features Added

### 1. Enhanced Database Schema
```sql
-- Enhanced users table
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';
ALTER TABLE users ADD COLUMN is_banned BOOLEAN DEFAULT 0;

-- Enhanced chat messages
ALTER TABLE chat_messages ADD COLUMN is_deleted BOOLEAN DEFAULT 0;
```

### 2. Admin Moderation Features
- Real-time chat monitoring
- Message deletion capability
- User banning system
- Chat history review
- Moderation logging

### 3. Enhanced Security
- Banned users cannot send messages
- Deleted messages are hidden from public chat
- Admin role verification for moderation actions
- SQL injection protection with parameterized queries

## Updated API Endpoints

### Enhanced Chat Endpoints:
- `GET /api/chat/messages` - Now excludes deleted messages
- `POST /api/chat/send` - Now checks for banned users
- `GET /api/admin/chat-history` - Full chat history for admins
- `DELETE /api/admin/delete-message` - Delete messages (admin only)
- `POST /api/admin/ban-user` - Ban users (admin only)

## Real-time Features

### WebSocket Enhancements:
```javascript
// New WebSocket message types
{
  type: 'message',        // Regular chat message
  type: 'announcement',   // System announcement
  type: 'userOnline',     // User came online
  type: 'userOffline',    // User went offline
  type: 'userBanned',     // User was banned (future)
  type: 'messageDeleted'  // Message was deleted (future)
}
```

### Live Updates:
- Messages appear instantly for all users
- Online status updates in real-time
- Announcements broadcast to all connected users
- Admin actions reflected immediately

## Chat Moderation Workflow

### For Admins:
1. **Access Admin Panel** - Click settings icon (admin users only)
2. **View Chat History** - See all messages including deleted ones
3. **Delete Messages** - Click trash icon next to inappropriate messages
4. **Ban Users** - Click ban icon next to user name
5. **Send Announcements** - Use announcement button for system messages

### For Regular Users:
1. **Sign In Required** - Must be logged in to access chat
2. **Real-time Messaging** - Messages appear instantly
3. **Online Users List** - See who's currently online
4. **Ban Prevention** - Banned users cannot send messages

## Frontend Chat Implementation

### Key Components:
```javascript
// Chat state management
const [chatMessages, setChatMessages] = useState([])
const [onlineUsers, setOnlineUsers] = useState([])
const [ws, setWs] = useState(null)

// WebSocket connection with authentication
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
```

### Chat UI Features:
- **Message Display**: Shows username, message, and timestamp
- **Online Users**: Live list of connected users
- **Input Validation**: Prevents empty messages
- **Auto-scroll**: Keeps latest messages visible
- **Modal Interface**: Clean, focused chat experience

## Backend Implementation Details

### Authentication Flow:
1. User logs in → Receives JWT token with role
2. WebSocket connection → Authenticates with JWT token
3. Real-time updates → Broadcasts to authenticated users only
4. Message sending → Validates user isn't banned

### Database Operations:
```javascript
// Soft delete messages (preserves for admin review)
UPDATE chat_messages SET is_deleted = 1 WHERE id = ?

// Ban user (prevents login and messaging)
UPDATE users SET is_banned = 1, is_online = 0 WHERE id = ?

// Get chat messages (excludes deleted for regular users)
SELECT * FROM chat_messages WHERE is_deleted = 0

// Get full chat history (admin only, includes deleted)
SELECT * FROM chat_messages ORDER BY created_at DESC
```

## Setup Instructions (Updated)

### 1. Database Migration
The server automatically creates new columns when started:
- `role` column in users table
- `is_banned` column in users table  
- `is_deleted` column in chat_messages table

### 2. Admin Account Creation
Default admin account is created automatically:
- Username: `admin`
- Password: `admin123`
- **Important**: Change this password immediately!

### 3. Environment Variables (Same as before)
```env
JWT_SECRET=your_jwt_secret_here
SENDGRID_FROM_EMAIL=your_email@domain.com
FRONTEND_URL=http://localhost:5173
PORT=3001
```

### 4. Running the Application
```bash
# Start backend server
npm run server

# Start frontend (in separate terminal)
npm run dev
```

## Testing the Chat System

### Test Cases:
1. **Regular User Chat**:
   - Sign up → Access chat → Send messages
   - See real-time updates from other users
   - View online users list

2. **Admin Moderation**:
   - Sign in as admin → Access admin panel
   - View chat history → Delete inappropriate messages
   - Ban problematic users → Verify they can't send messages

3. **WebSocket Functionality**:
   - Multiple browser tabs → Messages sync across all
   - User goes offline → Status updates immediately
   - Admin sends announcement → All users receive it

## Error Handling

### Frontend Error Handling:
```javascript
// WebSocket connection errors
ws.onerror = (error) => {
  console.error('WebSocket error:', error)
  // Attempt reconnection
}

// API request errors
try {
  await chatAPI.sendMessage(message)
} catch (error) {
  console.error('Failed to send message:', error)
  // Show user-friendly error message
}
```

### Backend Error Handling:
- Database connection failures
- Invalid JWT tokens
- Banned user attempts
- WebSocket connection errors
- Email sending failures

## Performance Optimizations

### 1. Message Limiting:
- Default limit of 50 recent messages
- Pagination for chat history (admin)
- Automatic cleanup of old messages (configurable)

### 2. WebSocket Management:
- Connection pooling
- Automatic reconnection
- Heartbeat messages
- Clean disconnection handling

### 3. Database Optimizations:
- Indexes on frequently queried columns
- Soft deletes instead of hard deletes
- Efficient join queries for user data

## Security Considerations

### 1. Message Content:
- Input sanitization
- XSS prevention through React's built-in escaping
- Message length limits
- Spam prevention (rate limiting)

### 2. User Authentication:
- JWT token expiration
- Secure password hashing (bcrypt)
- Role-based access control
- Ban system to prevent abuse

### 3. WebSocket Security:
- Token-based authentication
- Connection rate limiting
- Message validation
- Admin action logging

The enhanced chat system is now production-ready with comprehensive moderation tools and real-time functionality!
 