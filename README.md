


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


## VPS/Production Deployment (Full Guide)

### 1. Install All Dependencies

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs git nginx sqlite3
sudo npm install -g pm2
sudo apt install certbot python3-certbot-nginx ufw -y
```

### 2. Clone the Repository

```bash
cd /var/www
git clone https://github.com/uec-developers/launcher.git
cd launcher
```

### 3. Environment Setup

Edit `.env` in `/var/www/launcher` and set your secrets:

```env
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=your_verified_sender_email
JWT_SECRET=your_very_secure_random_string_here
DATABASE_URL=./data/database.sqlite
PORT=3001
FRONTEND_URL=https://your-domain.com
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

### 7. PM2 Process Manager (Recommended)

Create `ecosystem.config.js`:

```js
module.exports = {
  apps: [{
    name: 'uec-launcher',
    script: 'server/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
}
```

Start and enable on boot:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 8. Nginx Reverse Proxy Setup

Create `/etc/nginx/sites-available/uec-launcher`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        root /var/www/launcher/dist;
        try_files $uri $uri/ /index.html;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /ws {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /clients {
        root /var/www/launcher/public;
        try_files $uri $uri/ =404;
    }
}
```

Enable and restart nginx:

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

### 11. Systemd Alternative (Optional)

If you prefer systemd over PM2, create a service file:

```bash
sudo nano /etc/systemd/system/uec-launcher.service
```

Paste:

```
[Unit]
Description=UEC Launcher Node.js Backend
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

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable uec-launcher
sudo systemctl start uec-launcher
sudo systemctl status uec-launcher
```

### 12. DNS Setup

Point your domain's A record to your VPS IP address.

### 13. Automatic Updates (Optional)

```bash
sudo crontab -e
# Add:
0 * * * * cd /var/www/launcher && git pull origin main && npm install && npm run build
```

### 14. Backup (Recommended)

See `DEPLOYMENT_GUIDE.md` for a backup script and more advanced options.

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
