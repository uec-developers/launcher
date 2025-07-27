#  Admin Panel Setup Guide for UEC Launcher

## Overview
The admin panel provides comprehensive management tools for your UEC Launcher, including user management, chat moderation, content management, and system statistics.

## Default Admin Account
- **Username:** `admin`
- **Password:** `admin123`
- **Important:** Change the default password immediately after first login!

## Features Included

### 1. User Management
- View all registered users
- See online/offline status
- Ban/unban users
- View user registration dates
- Monitor user activity

### 2. Chat Moderation
- View complete chat history
- Delete inappropriate messages
- Monitor real-time chat activity
- Ban users from chat
- Review reported messages

### 3. Content Management
- **News Articles:** Create and manage news posts
- **Partners:** Add and manage partner listings
- **Announcements:** Send system-wide announcements
- **Events:** Schedule and manage events (future feature)

### 4. System Statistics
- Total registered users
- Currently online users
- Total chat messages
- Active reports count

## Database Schema Updates

### New Tables Added:
```sql
-- Enhanced users table with admin features
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';
ALTER TABLE users ADD COLUMN is_banned BOOLEAN DEFAULT 0;

-- News management
CREATE TABLE news (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  preview TEXT NOT NULL,
  author_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users (id)
);

-- Partners management
CREATE TABLE partners (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  website TEXT,
  logo TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Announcements
CREATE TABLE announcements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users (id)
);

-- Enhanced chat messages with deletion tracking
ALTER TABLE chat_messages ADD COLUMN is_deleted BOOLEAN DEFAULT 0;
```

## New API Endpoints

### Admin Authentication
- All admin endpoints require `role: 'admin'` in JWT token
- Admin middleware validates user role before granting access

### Admin Endpoints:
```
GET /api/admin/stats - Get system statistics
GET /api/admin/users - Get all users with admin info
GET /api/admin/chat-history - Get complete chat history
POST /api/admin/ban-user - Ban a user
DELETE /api/admin/delete-message - Delete a chat message
POST /api/admin/news - Create news article
POST /api/admin/partners - Add new partner
POST /api/admin/announcement - Send system announcement
```

### Public Endpoints:
```
GET /api/news - Get all news articles
GET /api/partners - Get all partners
```

## How to Access Admin Panel

### 1. Sign in as Admin
- Use the default admin credentials or create a new admin user
- The admin panel icon (Settings) will appear in the header for admin users

### 2. Admin Panel Sections

#### Statistics Panel (Left Side):
- Quick overview of system metrics
- Real-time user count
- Total messages and reports

#### User Management:
- Complete user list with status indicators
- Ban/unban functionality
- User profile viewing
- Registration date tracking

#### Chat History:
- Full chat message history
- Message deletion capability
- User identification for each message
- Timestamps for moderation tracking

#### Content Management Buttons:
- **Add News Article:** Create new news posts
- **Add Partner:** Add new partner listings
- **Send Announcement:** Broadcast system messages
- **Schedule Event:** Plan future events

## Creating Admin Users

### Method 1: Database Direct
```sql
-- Update existing user to admin
UPDATE users SET role = 'admin' WHERE username = 'your_username';
```

### Method 2: Code Registration
Modify the registration endpoint to accept admin creation (for development only):
```javascript
// In registration endpoint, add role parameter
const role = req.body.role === 'admin' ? 'admin' : 'user';
```

## Security Features

### 1. Role-Based Access Control
- JWT tokens include user role
- Admin middleware validates permissions
- Separate admin API routes

### 2. Action Logging
- All admin actions are logged
- User ban/unban tracking
- Message deletion history

### 3. Protected Endpoints
- Admin endpoints require authentication + admin role
- Public endpoints for news/partners (read-only)
- WebSocket admin message broadcasting

## Chat Moderation Workflow

### 1. Real-time Monitoring
- Admin can view chat in real-time
- All messages logged with timestamps
- User identification for accountability

### 2. Message Management
- Soft delete messages (marked as deleted, not removed)
- Preserve chat history for investigation
- Quick delete buttons in admin interface

### 3. User Sanctions
- Temporary chat bans
- Permanent user bans
- Ban status prevents login and chat access

## Content Management Workflow

### 1. News Articles
```javascript
// Example news creation
{
  title: "New Client Update Available",
  preview: "Bug fixes and performance improvements",
  content: "Full article content with HTML support..."
}
```

### 2. Partner Management
```javascript
// Example partner addition
{
  name: "Partner Name",
  description: "What they provide",
  website: "https://partner-website.com",
  logo: "https://logo-url.com/logo.png"
}
```

### 3. System Announcements
```javascript
// Example announcement
{
  title: "Server Maintenance",
  content: "The server will be down for maintenance on..."
}
```

## Real-time Features

### 1. WebSocket Integration
- Real-time user status updates
- Live chat message broadcasting
- Instant announcement delivery
- Admin notification system

### 2. Auto-refresh Data
- Online user count updates automatically
- New messages appear in admin chat history
- Statistics refresh on user actions

## Troubleshooting

### Common Issues:

#### Admin Panel Not Showing:
- Verify user has `role: 'admin'` in database
- Check JWT token includes admin role
- Ensure admin middleware is working

#### Can't Ban Users:
- Verify admin permissions
- Check user ID is correct
- Ensure database write permissions

#### Chat History Not Loading:
- Check database permissions
- Verify admin API endpoints are accessible
- Check for JavaScript console errors

#### Announcements Not Broadcasting:
- Verify WebSocket connection
- Check if users are connected to WebSocket
- Ensure announcement endpoint is working

## Best Practices

### 1. Admin Account Security
- Change default password immediately
- Use strong passwords for admin accounts
- Limit number of admin users
- Regular password updates

### 2. Moderation Guidelines
- Document moderation policies
- Log all admin actions
- Review ban decisions regularly
- Provide appeal process for users

### 3. Content Management
- Review news articles before publishing
- Verify partner information
- Test announcements before sending
- Schedule important announcements

## Future Enhancements

### Planned Features:
- User appeal system
- Advanced reporting tools
- Automated moderation rules
- Content scheduling
- Analytics dashboard
- Backup and restore tools

The admin panel is now fully functional and provides comprehensive management capabilities for your UEC Launcher!
 