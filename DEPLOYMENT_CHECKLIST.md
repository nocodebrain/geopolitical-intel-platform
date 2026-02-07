# ✅ Deployment Checklist

## Pre-Deployment

- [x] Build succeeds locally (`npm run build`)
- [x] Database initialized (`npm run db:seed`)
- [x] All pages load correctly
- [x] API endpoints tested
- [x] Documentation complete
- [x] `.gitignore` configured
- [x] Environment variables documented (`.env.example`)

## Railway Deployment

### Step 1: Repository Setup
- [ ] Create GitHub repository
- [ ] Push code to GitHub
  ```bash
  git init
  git add .
  git commit -m "Initial commit: Geopolitical Intel Platform MVP"
  git remote add origin <your-repo-url>
  git push -u origin main
  ```

### Step 2: Railway Setup
- [ ] Sign up at [railway.app](https://railway.app)
- [ ] Create new project
- [ ] Connect GitHub repository
- [ ] Verify build settings:
  - Build Command: `npm run build`
  - Start Command: `npm start`
  - Port: 3000 (auto-detected)

### Step 3: Configure Environment
- [ ] Add environment variables in Railway dashboard:
  - `OPENAI_API_KEY` (optional but recommended)
  - `NEWS_API_KEY` (optional)
  - `NEXT_PUBLIC_APP_URL` (Railway provides this)

### Step 4: Persistent Storage
- [ ] Add volume for SQLite database:
  - Mount path: `/app/data`
  - Size: 1GB minimum

### Step 5: Initialize Database
- [ ] Open Railway terminal
- [ ] Run: `npm run db:seed`
- [ ] Verify: Check logs for "Seeding Complete"
- [ ] Restart service

### Step 6: Verify Deployment
- [ ] Visit Railway URL
- [ ] Dashboard loads successfully
- [ ] Events page shows 10 sample events
- [ ] Map displays event markers
- [ ] Connections page shows 4 relationships
- [ ] Insights page shows daily brief
- [ ] Regions page displays countries
- [ ] All filters work correctly
- [ ] Search functionality operational
- [ ] Mobile responsive (test on phone)

## Vercel Deployment (Alternative)

### Note
SQLite resets on each deployment with Vercel. Consider PostgreSQL for production.

### Steps
- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] Run: `vercel login`
- [ ] Run: `vercel`
- [ ] Set environment variables in dashboard
- [ ] Deploy: `vercel --prod`

## Post-Deployment

### Testing
- [ ] Load test all pages
- [ ] Test all API endpoints
- [ ] Verify search functionality
- [ ] Test filters (category, region, severity)
- [ ] Check event detail pages
- [ ] Verify connections display
- [ ] Test mobile responsiveness

### Performance
- [ ] Page load < 2 seconds
- [ ] API responses < 500ms
- [ ] Map loads smoothly
- [ ] No console errors

### Documentation
- [ ] Update README with live URL
- [ ] Share deployment guide with team
- [ ] Document any deployment issues

### Monitoring
- [ ] Check Railway logs regularly
- [ ] Monitor error rates
- [ ] Track database size
- [ ] Set up alerts (optional)

## Phase 2 Setup (Optional)

### Scheduled Data Collection
- [ ] Create `railway.toml` for cron jobs
- [ ] Schedule hourly news collection
- [ ] Schedule daily analysis generation
- [ ] Monitor collection logs

### Backups
- [ ] Set up automated database backups
- [ ] Store backups in separate location
- [ ] Test restore procedure

## Troubleshooting

### Build Fails
- Verify Node.js version (18+)
- Clear `.next` directory
- Run `npm install` again
- Check for TypeScript errors

### Database Issues
- Remove lock files (`*.db-shm`, `*.db-wal`)
- Re-run `npm run db:seed`
- Check volume mount path

### Runtime Errors
- Check Railway logs
- Verify environment variables
- Test API endpoints individually
- Check database connectivity

## Success Criteria

Deployment is successful when:
- [x] Application is accessible via public URL
- [x] All pages load without errors
- [x] Database contains sample data
- [x] Map displays event markers
- [x] Filters and search work
- [x] Mobile responsive
- [x] Performance meets targets (< 2s load time)

## Next Steps After Deployment

1. **Share URL** with stakeholders
2. **Gather feedback** on UX and features
3. **Monitor usage** and errors
4. **Plan Phase 2** features
5. **Set up analytics** (optional)

---

**Ready to deploy!** 🚀

When complete, your Geopolitical Intelligence Platform will be live and monitoring the world 24/7.
