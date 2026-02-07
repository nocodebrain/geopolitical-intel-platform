# 🚀 Deployment Guide

Complete instructions for deploying the Geopolitical Intelligence Platform to production.

## 📋 Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database seeded with initial data
- [ ] Build succeeds locally (`npm run build`)
- [ ] All pages load correctly
- [ ] API endpoints respond properly

## Railway Deployment (Recommended)

Railway is recommended because it supports:
- SQLite databases with persistent volumes
- Scheduled cron jobs (for data collection)
- Automatic deployments from Git
- Simple environment variable management

### Step 1: Prepare Your Repository

1. **Create a Git repository**
```bash
git init
git add .
git commit -m "Initial commit: Geopolitical Intel Platform MVP"
```

2. **Push to GitHub/GitLab**
```bash
git remote add origin <your-repo-url>
git push -u origin main
```

3. **Create `.gitignore`** (if not exists)
```
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/
build/
dist/

# Production
/data/*.db
/data/*.db-*

# Environment
.env
.env.local
.env.*.local

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Misc
.DS_Store
*.pem

# IDE
.vscode/
.idea/
*.swp
*.swo
```

### Step 2: Deploy to Railway

1. **Sign up at Railway**
   - Visit [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Choose "Deploy from GitHub repo"
   - Select your repository

3. **Configure Build Settings**
   
   Railway auto-detects Next.js. Verify:
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Port: `3000` (auto-detected)

4. **Add Environment Variables**
   
   In Railway dashboard → Variables tab:
   ```
   OPENAI_API_KEY=sk-proj-...
   NEWS_API_KEY=your_newsapi_key
   NEXT_PUBLIC_APP_URL=https://your-app.railway.app
   ```

5. **Configure Volume (for SQLite)**
   
   In Railway dashboard → Settings → Volumes:
   - Click "Add Volume"
   - Mount Path: `/app/data`
   - Size: 1GB (minimum)

6. **Initialize Database**
   
   After first deployment:
   - Open Railway terminal (Dashboard → Terminal)
   - Run: `npm run db:seed`
   - Restart the service

7. **Enable Automatic Deployments**
   
   Settings → Deploy:
   - ✅ Auto-deploy on main branch push

### Step 3: Verify Deployment

1. Visit your Railway URL
2. Check Dashboard loads
3. Verify Events page shows data
4. Test Connections view
5. Check Insights page

## Vercel Deployment (Alternative)

Vercel is great for static/serverless, but SQLite support requires careful configuration.

### Step 1: Prepare for Vercel

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Create `vercel.json`**
```json
{
  "version": 2,
  "buildCommand": "npm run build && npm run db:seed",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "OPENAI_API_KEY": "@openai_api_key",
    "NEWS_API_KEY": "@news_api_key"
  }
}
```

3. **Note**: SQLite on Vercel has limitations:
   - Database resets on each deployment
   - No persistent storage in serverless functions
   - Consider PostgreSQL for production Vercel deployment

### Step 2: Deploy

1. **Link Project**
```bash
vercel login
vercel link
```

2. **Set Environment Variables**
```bash
vercel env add OPENAI_API_KEY
vercel env add NEWS_API_KEY
```

3. **Deploy**
```bash
vercel --prod
```

### Vercel + PostgreSQL (Production Alternative)

For persistent data on Vercel:

1. **Set up PostgreSQL** (Neon, Supabase, or Railway Postgres)

2. **Update Database Layer**
   - Replace better-sqlite3 with pg
   - Update queries in `lib/db/index.ts`

3. **Add Environment Variable**
```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

## Custom VPS/Server Deployment

### Requirements
- Node.js 18+ installed
- PM2 or systemd for process management
- Nginx for reverse proxy (optional)

### Step 1: Set Up Server

1. **Clone Repository**
```bash
git clone <your-repo-url>
cd geopolitical-intel-platform
```

2. **Install Dependencies**
```bash
npm install
```

3. **Configure Environment**
```bash
cp .env.example .env
nano .env
```

4. **Build Application**
```bash
npm run build
```

5. **Initialize Database**
```bash
npm run db:seed
```

### Step 2: Configure PM2

1. **Install PM2**
```bash
npm install -g pm2
```

2. **Create `ecosystem.config.js`**
```javascript
module.exports = {
  apps: [{
    name: 'geointel-platform',
    script: 'npm',
    args: 'start',
    cwd: '/path/to/geopolitical-intel-platform',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

3. **Start Application**
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Step 3: Configure Nginx (Optional)

1. **Create Nginx Config** `/etc/nginx/sites-available/geointel`
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

2. **Enable Site**
```bash
sudo ln -s /etc/nginx/sites-available/geointel /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

3. **Set Up SSL** (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Scheduled Data Collection

### Railway Cron Jobs

1. **Create `railway.toml`**
```toml
[build]
  builder = "NIXPACKS"

[deploy]
  startCommand = "npm start"

[[cron]]
  schedule = "0 * * * *"  # Every hour
  command = "npm run collect"

[[cron]]
  schedule = "0 0 * * *"  # Daily at midnight
  command = "npm run db:backup"
```

### PM2 Cron (VPS)

1. **Create `collect-data.sh`**
```bash
#!/bin/bash
cd /path/to/geopolitical-intel-platform
npm run collect >> /var/log/geointel-collect.log 2>&1
```

2. **Add to Crontab**
```bash
crontab -e
```

Add:
```
0 * * * * /path/to/collect-data.sh
```

## Database Backup

### Automated Backups

1. **Create Backup Script** `scripts/backup-db.sh`
```bash
#!/bin/bash
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_PATH="/path/to/data/geopolitical.db"

mkdir -p $BACKUP_DIR
cp $DB_PATH "$BACKUP_DIR/geopolitical_$DATE.db"

# Keep only last 30 backups
ls -t $BACKUP_DIR/geopolitical_*.db | tail -n +31 | xargs rm -f
```

2. **Schedule with Cron**
```bash
0 2 * * * /path/to/scripts/backup-db.sh
```

## Monitoring

### Railway Logs
- Dashboard → Logs tab
- View real-time application logs
- Filter by error level

### PM2 Monitoring
```bash
pm2 logs geointel-platform
pm2 monit
```

### Custom Health Check

Create `app/api/health/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const result = db.prepare('SELECT COUNT(*) as count FROM events').get();
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      events: result.count,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: error.message },
      { status: 500 }
    );
  }
}
```

## Troubleshooting

### Database Locked Error
```bash
# Stop application
pm2 stop geointel-platform

# Remove lock files
rm data/*.db-shm data/*.db-wal

# Restart
pm2 start geointel-platform
```

### Memory Issues
- Increase Railway/VPS memory allocation
- Optimize database queries
- Add pagination to large result sets

### Build Failures
- Check Node.js version (18+)
- Clear `.next` and `node_modules`
- Verify all dependencies installed

## Performance Optimization

1. **Enable Next.js Caching**
   - Static generation for pages
   - API route caching

2. **Database Optimization**
   - Add indexes (already in schema)
   - Run VACUUM periodically

3. **CDN (Optional)**
   - Use Vercel Edge Network
   - Or Cloudflare for custom domain

## Security

1. **Environment Variables**
   - Never commit `.env` files
   - Use platform secrets management

2. **API Keys**
   - Rotate periodically
   - Use least-privilege access

3. **HTTPS**
   - Always use SSL in production
   - Railway provides automatic HTTPS

---

**Deployment complete!** 🚀

Your Geopolitical Intelligence Platform is now live and monitoring the world.
