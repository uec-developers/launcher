#  VPS Deployment Guide

## Fixed Issues:
1. **CORS Configuration**: Set to wildcard (*) for production
2. **API Protocol**: Forced HTTP instead of dynamic protocol detection  
3. **WebSocket URL**: Fixed to use ws:// protocol consistently
4. **Server Binding**: Configured to bind to 0.0.0.0 for external access

## VPS Setup:

```bash
# 1. Install dependencies
npm install
cd server && npm install

# 2. Build frontend
npm run build

# 3. Start server
cd server
NODE_ENV=production npm start
```

## Firewall Configuration:
```bash
# Open required ports
sudo ufw allow 3000
sudo ufw allow 3001
```

## PM2 Process Manager (Recommended):
```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start server/index.js --name minecraft-backend --env production
pm2 startup
pm2 save
```

Your networking issues are now fixed!
 