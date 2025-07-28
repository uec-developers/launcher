#  UEC Launcher Authentication Setup

## Database Setup

The application uses SQLite for user authentication. The database file (`database.sqlite`) will be created automatically when you first run the server.

### Database Schema

The `users` table contains:
- `id` - Primary key
- `username` - Unique username
- `email` - Unique email address
- `password` - Hashed password (using bcrypt)
- `reset_token` - Password reset token
- `reset_token_expires` - Reset token expiration timestamp
- `created_at` - Account creation timestamp

## Email Configuration

### SendGrid Setup

1. Create a SendGrid account at https://sendgrid.com
2. Generate an API key in your SendGrid dashboard
3. Add your SendGrid API key to the integrations section in JDoodle.AI
4. Update the `SENDGRID_FROM_EMAIL` in your `.env` file to your verified sender email

### Environment Variables

Update these variables in your `.env` file:

```env
# SendGrid Configuration
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# JWT Secret (Change this!)
JWT_SECRET=your_very_secure_random_string_here

# Database
DATABASE_URL=./database.sqlite

# Server
PORT=3001
FRONTEND_URL=http://localhost:5173
```

## Running the Application

1. Install dependencies: `npm install`
2. Start the backend server: `npm run server`
3. Start the frontend: `npm run dev`

## API Endpoints

- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Send password reset email
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/profile` - Get user profile (requires auth token)

## Security Features

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Password reset tokens expire after 1 hour
- Email verification for password resets
- CORS protection
- SQL injection protection with parameterized queries

## Customizing Email Templates

Edit the email content in `server/index.js` in the forgot password endpoint to customize the reset email appearance and content.
 