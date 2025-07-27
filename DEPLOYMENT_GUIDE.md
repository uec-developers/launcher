#  VPS Deployment Guide for UEC Launcher

## Pre-Deployment Checklist

### 1. Prepare Your VPS
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install nginx
sudo apt install nginx -y
```

### 2. Upload Files to VPS
```bash
# Create project directory
mkdir -p /var/www/uec-launcher
cd /var/www/uec-launcher

# Upload your project files here
# Use scp, rsync, or git clone
```

### 3. Install Dependencies
```bash
# Install backend dependencies
npm install

# Build frontend for production
npm run build
```

## Environment Configuration

### 4. Update .env File
```bash
# Edit environment variables for production
nano .env
```

Update these values:
```env
JWT_SECRET=your_secure_random_string_here_change_this
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
FRONTEND_URL=https://yourdomain.com
PORT=3001
NODE_ENV=production
```

## Database Setup

### 5. Database Persistence
```bash
# Create data directory
mkdir -p /var/www/uec-launcher/data

# Update server/index.js to use persistent database
# Change this line:
# const db = new sqlite3.Database(':memory:')
# To:
# const db = new sqlite3.Database('./data/database.sqlite')
```

## Process Management

### 6. Create PM2 Ecosystem File
```bash
nano ecosystem.config.js
```

Add this content:
```javascript
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

### 7. Start Application
```bash
# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

## Nginx Configuration

### 8. Create Nginx Config
```bash
sudo nano /etc/nginx/sites-available/uec-launcher
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend files
    location / {
        root /var/www/uec-launcher/dist;
        try_files $uri $uri/ /index.html;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
    }

    # API routes
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

    # WebSocket for chat
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

    # Client files
    location /clients {
        root /var/www/uec-launcher/public;
        try_files $uri $uri/ =404;
    }
}
```

### 9. Enable Site
```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/uec-launcher /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

## SSL Certificate (Optional but Recommended)

### 10. Install SSL with Certbot
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

## Firewall Configuration

### 11. Setup UFW Firewall
```bash
# Enable firewall
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'

# Check status
sudo ufw status
```

## Final Steps

### 12. Verify Deployment
```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs uec-launcher

# Check nginx status
sudo systemctl status nginx

# Test application
curl http://localhost:3001/api/news
```

### 13. Domain DNS Configuration
Point your domain's A record to your VPS IP address:
```
A record: yourdomain.com -> YOUR_VPS_IP
A record: www.yourdomain.com -> YOUR_VPS_IP
```

## Monitoring and Maintenance

### 14. Regular Maintenance Commands
```bash
# View application logs
pm2 logs uec-launcher

# Restart application
pm2 restart uec-launcher

# Monitor resources
pm2 monit

# View nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 15. Backup Strategy
```bash
# Create backup script
nano backup.sh
```

Add this content:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/uec-launcher"
mkdir -p $BACKUP_DIR

# Backup database
cp /var/www/uec-launcher/data/database.sqlite $BACKUP_DIR/database_$DATE.sqlite

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz -C /var/www uec-launcher

# Keep only last 7 days of backups
find $BACKUP_DIR -type f -mtime +7 -delete
```

Make executable and add to crontab:
```bash
chmod +x backup.sh
sudo crontab -e
# Add: 0 2 * * * /var/www/uec-launcher/backup.sh
```

## Troubleshooting

### Common Issues:

#### Chat Not Working:
- Check WebSocket connection in browser dev tools
- Verify PM2 process is running
- Check nginx WebSocket proxy configuration

#### Database Issues:
- Ensure data directory has correct permissions
- Check if SQLite database file was created
- Verify application can write to data directory

#### Client Launch Issues:
- Ensure client files are in public/clients/ directory
- Check nginx serves static files correctly
- Verify file permissions

### 16. Security Hardening
```bash
# Change file ownership
sudo chown -R www-data:www-data /var/www/uec-launcher

# Set proper permissions
sudo chmod -R 755 /var/www/uec-launcher
sudo chmod -R 644 /var/www/uec-launcher/data

# Secure nginx configuration
sudo nano /etc/nginx/nginx.conf
# Add: server_tokens off;
```

Your UEC Launcher is now ready for production deployment!
 