


# UEC Launcher Setup & Deployment Guide



## Requirements

- Node.js v18 or newer
- Ubuntu 20.04+ server (recommended for production)
- SendGrid account (for password reset emails)

# UEC Launcher — Setup & Deployment

Welcome! This guide will help you get the UEC Launcher running locally or on a server. If you run into issues, check the troubleshooting section or reach out to the team.

## Requirements

- Node.js 18+
- Ubuntu 20.04+ (recommended for production)
- SendGrid account & API key (for email)

## Project Structure

- `public/clients/` — Minecraft client builds (Astra, Resent, Starlike, EaglyMC, Shadow, etc.)
- `src/` — React frontend (launcher UI, authentication, chat, admin panel)
- `server/` — Node.js backend (auth, chat, admin, API)

## Local Development

Clone the repo and install dependencies:

```bash
git clone https://github.com/uec-developers/launcher.git
cd launcher
npm install
```

Put your Minecraft clients in `public/clients/` (each in its own folder with an `index.html`).

Edit `.env` in the project root:

```env
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=your_verified_sender_email
JWT_SECRET=your_very_secure_random_string_here
DATABASE_URL=./database.sqlite
PORT=3001
FRONTEND_URL=http://localhost:5173
```

Start the backend:

```bash
npm run server
```

Start the frontend:

```bash
npm run dev
```

## VPS/Production Deployment

1. SSH into your server and prep the system:
   ```bash
   sudo apt update && sudo apt upgrade -y
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo npm install -g pm2
   sudo apt install nginx -y
   ```
2. Clone the repo to `/var/www`:
   ```bash
   cd /var/www
   git clone https://github.com/uec-developers/launcher.git
   cd launcher
   ```
3. Edit `.env` in `/var/www/launcher` and set your secrets.
4. Install dependencies:
   ```bash
   npm install
   ```
5. Build the frontend:
   ```bash
   npm run build
   ```
6. (Optional) Test backend manually:
   ```bash
   npm run server
   ```
7. Set up systemd services for auto-start (see DEPLOYMENT_GUIDE.md for full details).
8. Set up nginx for your domain and SSL (see DEPLOYMENT_GUIDE.md).
9. Launcher access:
   - Frontend: `https://your-domain.com/`
   - API: `https://your-domain.com/api/`
10. Automatic updates:
    - Edit root crontab:
      ```bash
      sudo crontab -e
      ```
    - Add this to update every hour:
      ```bash
      0 * * * * cd /var/www/launcher && git pull origin main && npm install && npm run build
      ```

## API Endpoints

- `POST /api/auth/register` — Register
- `POST /api/auth/login` — Login
- `POST /api/auth/forgot-password` — Request password reset
- `POST /api/auth/reset-password` — Reset password
- `GET /api/auth/profile` — Get user profile
- `GET /api/chat/messages` — Get chat messages
- `POST /api/chat/send` — Send chat message
- `GET /api/admin/chat-history` — Admin chat history
- `DELETE /api/admin/delete-message` — Delete message (admin)
- `POST /api/admin/ban-user` — Ban user (admin)
- `POST /api/send-email` — Send a custom email (fields: `to`, `subject`, `text`, `from`)

## Customization

- Email templates: Edit in `server/index.js` and `server/mail.js`
- All outgoing mail is BCC'd to `ueclauncher@gmail.com` for logging
- Add/remove clients: Drop new builds in `public/clients/`
- Change admin password after first login

## Security

- Passwords are hashed with bcrypt
- JWT authentication
- SQL injection protection
- CORS enabled

## Troubleshooting

- Double-check `.env` values
- Make sure all client files are in `public/clients/`
- Check service status: `sudo systemctl status uec-launcher-backend` and `sudo systemctl status uec-launcher-frontend`
- View logs: `journalctl -u uec-launcher-backend -e` and `journalctl -u uec-launcher-frontend -e`
- For deployment, see `DEPLOYMENT_GUIDE.md`
        sudo systemctl status uec-launcher-backend
