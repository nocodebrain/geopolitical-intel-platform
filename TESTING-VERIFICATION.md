# Testing & Verification Guide

## Pre-Deployment State (Before Fix)
- ✅ Connections page: Working (34 connections)
- ✅ Regions page: Working (27 countries)
- ✅ Insights page: Working (13 insights)
- ❌ Recession risk: 0 / "No data available"
- ❌ Economic indicators: Empty array

## Post-Deployment Tests

### 1. API Endpoint Tests

#### Check Stats
```bash
curl https://geopolitical-intel-platform-production.up.railway.app/api/stats | jq '.'
```
**Expected**: Shows counts for events, connections, countries

#### Check Recession Risk
```bash
curl https://geopolitical-intel-platform-production.up.railway.app/api/recession-risk | jq '.'
```
**Expected**:
```json
{
  "riskScore": 25-60,  // Should NOT be 0
  "prediction": "Low risk - economy showing strength",  // Should NOT be "No data available"
  "recommendation": "🟢 LOW RISK: Expansion opportunities...",
  "indicators": [/* Array of 10 indicators */],
  "lastUpdated": "2026-02-07"
}
```

#### Check Economic Indicators
```bash
curl https://geopolitical-intel-platform-production.up.railway.app/api/economic-indicators | jq '.count'
```
**Expected**: Should return 10 (not 0)

### 2. Frontend Tests

#### Dashboard
URL: https://geopolitical-intel-platform-production.up.railway.app/

**Check**:
- [ ] Recession Risk Meter shows a number (not 0)
- [ ] Risk label shows "LOW RISK", "MODERATE", or "HIGH RISK" (not empty)
- [ ] Recommendation text is meaningful (not "Run data collection script")
- [ ] Economic Indicators table shows 10 rows with data

#### Connections Page
URL: https://geopolitical-intel-platform-production.up.railway.app/connections

**Check**:
- [ ] Shows ~34 connections (not "No connections identified yet")
- [ ] Each connection card displays two events
- [ ] Confidence scores are visible

#### Regions Page  
URL: https://geopolitical-intel-platform-production.up.railway.app/regions

**Check**:
- [ ] Shows 5 regional sections (Africa, Americas, Asia-Pacific, Europe, Middle East)
- [ ] Shows ~27 countries total
- [ ] Each country card shows event count and severity

#### Insights Page
URL: https://geopolitical-intel-platform-production.up.railway.app/insights

**Check**:
- [ ] Shows "Daily Intelligence Briefs" section
- [ ] Shows "Strategic Analyses" section
- [ ] Shows ~13 total insights (not "No insights generated yet")

### 3. Deployment Persistence Test

#### Trigger Redeploy
```bash
# Make a small change
echo "# Test" >> README.md
git add README.md
git commit -m "test: Trigger redeploy"
git push origin main
```

#### Wait 3-5 minutes, then check:
```bash
# Should still have data (auto-reinitializes)
curl https://geopolitical-intel-platform-production.up.railway.app/api/stats | jq '.totalEvents'

# Recession risk should still work
curl https://geopolitical-intel-platform-production.up.railway.app/api/recession-risk | jq '.riskScore'
```

**Expected**: 
- Events count: ~96
- Risk score: 20-60 (not 0)

### 4. Build Log Verification

Check Railway deployment logs for:

```
🚀 Railway Startup: Checking database state...
✅ Database connection established
📊 Current database stats:
   - Events: 0
   - Connections: 0
   - Countries: 0

⚠️  Database is empty - initializing with seed data...

[Seeding output]

📈 Collecting economic indicators...
📊 Fetching yield_curve...
  → Using mock data
  ✓ yield_curve: 0.85 - Normal (Risk: 20/100)
[More indicators...]

📊 RECESSION RISK ANALYSIS
==========================================================
🎯 Overall Risk Score: 32.5/100
📅 Prediction: Low risk - economy showing strength
💡 Recommendation:
   🟢 LOW RISK: Expansion opportunities available...
==========================================================

✅ Economic data collection completed!
✅ Database initialization completed!
```

## Manual Initialization (If Needed)

If auto-initialization fails:

```bash
# SSH into Railway or use Railway CLI
railway run npm run db:init-startup
```

Or use the API endpoint:
```bash
curl -X POST https://geopolitical-intel-platform-production.up.railway.app/api/init
```

## Common Issues & Solutions

### Issue: Recession risk still shows 0
**Solution**: 
```bash
# Check if economic indicators exist
curl https://geopolitical-intel-platform-production.up.railway.app/api/economic-indicators

# If empty, manually trigger collection:
# Via Railway CLI:
railway run tsx scripts/collect-economic-data.ts
```

### Issue: Postbuild didn't run
**Check**: Railway build logs for "postbuild" execution
**Solution**: Ensure package.json has:
```json
"scripts": {
  "postbuild": "tsx scripts/init-on-startup.ts"
}
```

### Issue: Database still empty after deploy
**Check**: 
1. Railway logs for errors
2. Make sure `tsx` is available during build
3. Verify `scripts/init-on-startup.ts` exists

**Solution**: Manually run initialization:
```bash
railway run npm run db:init-startup
```

## Success Criteria

✅ **All tests pass if**:
1. Recession risk meter shows 20-60 range (not 0)
2. All three pages (Connections, Regions, Insights) show data
3. Economic indicators API returns 10 items
4. Data persists across redeployments
5. Build logs show successful initialization

## Performance Metrics

**Expected timings**:
- Database initialization: 5-10 seconds
- Economic data collection: 5-10 seconds
- Total postbuild overhead: 10-20 seconds
- First page load after deploy: Normal (< 3 seconds)

## Rollback Plan

If deployment fails:

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or roll back via Railway dashboard:
# Deployments → Click on previous successful deployment → Redeploy
```

---

**Last Updated**: 2026-02-07
**Status**: Fixes deployed, awaiting verification
