## Mail System Setup

This project uses a custom mail queue with Redis and your own SMTP server (no third-party API). Outgoing mail is enqueued by the backend and sent by a mail worker.

### 1. Install Redis and SMTP

```bash
sudo apt install redis-server -y
sudo systemctl enable redis-server
sudo systemctl start redis-server
sudo apt install msmtp -y   # or postfix
```

Configure your SMTP server (e.g. msmtp or postfix) to allow local mail relay. For msmtp, edit `/etc/msmtprc` as needed.

### 2. Configure .env


### 2. Configure .env and Create Admin Account

Use the interactive setup script to generate your `.env` file (mail system, domain, Redis, SMTP) and create an admin user:

```bash
cd server
node setup.js
```

The script will prompt for:
- Your domain (for the frontend)
- SMTP server details (host, port, username, password, sender email)
- Redis URL
- JWT secret
- Admin username, email, and password

It will create `.env` and the admin user in the database automatically.

**Note:** Setting up systemd services and nginx must be done manually (see below).

### 3. Start the Mail Worker

```bash
cd server
node mailWorker.js
# Or run as a systemd service (see below)
```

### 4. Systemd Service for Mail Worker

```bash
sudo nano /etc/systemd/system/uec-mail-worker.service
```

Paste:

```
[Unit]
Description=UEC Launcher Mail Worker
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/launcher/server
EnvironmentFile=/var/www/launcher/.env
ExecStart=/usr/bin/node mailWorker.js
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable uec-mail-worker
sudo systemctl start uec-mail-worker
sudo systemctl status uec-mail-worker
```



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



## VPS/Production Deployment (Systemd Only, No PM2)

### 1. Prepare Your VPS

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nodejs npm git nginx sqlite3 certbot python3-certbot-nginx ufw
```

### 2. Clone the Repository

```bash
cd /var/www
git clone https://github.com/uec-developers/launcher.git
cd launcher
```


### 3. Environment Setup

Edit `.env` in `/var/www/launcher` and set all required secrets:

```env
# JWT and App
JWT_SECRET=your_very_secure_random_string_here
DATABASE_URL=./data/database.sqlite
PORT=3001
FRONTEND_URL=https://your-domain.com

# Redis (for mail queue)
REDIS_URL=redis://localhost:6379

# SMTP (for outgoing mail)
SMTP_HOST=localhost
SMTP_PORT=25
# If using authentication:
# SMTP_USER=your_smtp_user
# SMTP_PASS=your_smtp_password
SMTP_FROM_EMAIL=noreply@yourdomain.com
```
### 4. Install Redis and SMTP Server

Install Redis:
```bash
sudo apt install redis-server -y
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

Install a local SMTP server (choose one):

- For simple local delivery (recommended for most VPS):
  ```bash
  sudo apt install msmtp -y
  # Or use postfix: sudo apt install postfix -y
  ```

Configure your SMTP server to allow local mail relay. For msmtp, edit `/etc/msmtprc` as needed.

Test Redis:
```bash
redis-cli ping
# Should return PONG
```
### 6. Start the Mail Worker

The backend enqueues outgoing mail to Redis. You must run the mail worker to process and send emails:

```bash
cd /var/www/launcher/server
node mailWorker.js
```

For production, run the mail worker as a systemd service:

```bash
sudo nano /etc/systemd/system/uec-mail-worker.service
```

Paste:

```
[Unit]
Description=UEC Launcher Mail Worker
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/launcher/server
EnvironmentFile=/var/www/launcher/.env
ExecStart=/usr/bin/node mailWorker.js
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable uec-mail-worker
sudo systemctl start uec-mail-worker
sudo systemctl status uec-mail-worker
```

### 4. Install Node.js Dependencies

```bash
npm install
```

### 5. Build the Frontend

```bash
npm run build
```

### 6. Database & Data Directory

```bash
mkdir -p ./data
```

### 7. Systemd Services (Backend & Frontend)

Create the backend service:

```bash
sudo nano /etc/systemd/system/uec-launcher-backend.service
```

Paste:

```
[Unit]
Description=UEC Launcher Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/launcher
Environment=NODE_ENV=production
ExecStart=/usr/bin/node server/index.js
Restart=always

[Install]
WantedBy=multi-user.target
```

Create the frontend service:

```bash
sudo nano /etc/systemd/system/uec-launcher-frontend.service
```

Paste:

```
[Unit]
Description=UEC Launcher Frontend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/launcher
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm run preview
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start both:

```bash
sudo systemctl daemon-reload
sudo systemctl enable uec-launcher-backend
sudo systemctl enable uec-launcher-frontend
sudo systemctl start uec-launcher-backend
sudo systemctl start uec-launcher-frontend
sudo systemctl status uec-launcher-backend
sudo systemctl status uec-launcher-frontend
```

### 8. Nginx Reverse Proxy Setup

Create `/etc/nginx/sites-available/uec-launcher`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:4173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable config and restart nginx:

```bash
sudo ln -s /etc/nginx/sites-available/uec-launcher /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### 9. SSL with Certbot

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
sudo systemctl enable certbot.timer
```

### 10. Firewall (UFW)

```bash
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw status
```

### 11. DNS Setup

Point your domain's A record to your VPS IP address.

### 12. Automatic Updates (Optional)

```bash
sudo crontab -e
# Add:
0 * * * * cd /var/www/launcher && git pull origin main && npm install && npm run build
```

### 13. Backup (Recommended)

See `DEPLOYMENT_GUIDE.md` for a backup script and more advanced options.

---

**Note:** This project uses a custom mail system built from scratch. All outgoing mail is enqueued to Redis and sent via your own SMTP server (Postfix, msmtp, etc). No third-party mail API is used. You can further customize mail logic in `server/mail.js` and `server/mailWorker.js`.

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
