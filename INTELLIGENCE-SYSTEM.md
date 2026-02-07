# Geopolitical Intelligence System

## Overview
Automated intelligence platform that tracks global events, analyzes patterns, and alerts on significant changes affecting construction, logistics, and procurement sectors.

## Data Coverage
- **Historical:** 2 years (2024-2026) - 21 major curated events
- **Live:** 24+ events from 4 RSS sources (updated hourly)
- **Total:** 55+ events with impact analysis

## Data Sources
### Live RSS Feeds (Hourly)
- BBC World News
- Al Jazeera
- The Guardian World
- New York Times World

### Historical Database
- Major geopolitical events (2024-2026)
- Supply chain disruptions
- Conflict escalations
- Trade policy changes
- Commodity market events
- Energy sector developments

## AI Pattern Detection
The system analyzes events for:

1. **Conflict Escalation Patterns**
   - Tracks frequency and severity of conflicts
   - Identifies regional hotspots
   - Predicts supply chain disruptions

2. **Supply Chain Disruptions**
   - Monitors shipping routes (Red Sea, Panama Canal, etc.)
   - Port closures and delays
   - Material procurement impact

3. **Commodity Price Pressure**
   - Steel, copper, cement price movements
   - Trade restrictions affecting materials
   - Energy costs impacting logistics

4. **Trade Opportunities**
   - New trade agreements
   - Tariff reductions
   - Market access improvements

5. **Energy Market Volatility**
   - Oil/gas price impacts
   - Pipeline disruptions
   - Renewable energy shifts

## Alert System
### Severity Levels
- 🚨 **CRITICAL** - Immediate action required (conflicts, major disruptions)
- ⚠️ **HIGH** - Significant impact expected (supply chain issues, price spikes)
- 📊 **MEDIUM** - Monitor situation (political changes, trade shifts)
- ℹ️ **LOW** - Awareness only (opportunities, minor events)

### Alert Triggers
- **Critical:** Severity ≥9, Confidence ≥75%
- **High:** Severity ≥7, Confidence ≥75%
- **Cooldown:** Maximum 1 alert per hour (prevents spam)

### Delivery
- Telegram notifications to Hash
- Includes daily intelligence brief
- Links to full dashboard analysis

## Automation Schedule
### Hourly Cron Job (every hour, on the hour)
```bash
0 * * * * # Runs at :00 minutes past each hour
```

**Tasks:**
1. Collect latest news from RSS feeds
2. Analyze patterns and detect changes
3. Generate insights and daily brief
4. Send alerts if significant changes detected

## Scripts
```bash
# One-time setup
npm run db:seed          # Initialize database schema
npm run backfill         # Load 2 years historical data

# Regular operations
npm run collect          # Collect latest news
npm run analyze          # Run AI pattern detection
npm run alert            # Check and send alerts

# Combined
npm run update           # Run all three (collect → analyze → alert)
```

## Dashboard Features
- **Events List** - Searchable, filterable event database
- **World Map** - Geographic visualization of events
- **Analytics** - Charts, trends, regional breakdowns
- **Insights** - AI-generated daily briefs
- **Connections** - Event relationship mapping

## Business Impact Analysis
Every event is tagged with industry impact:
- `construction` - Building projects, material costs
- `logistics` - Shipping, transportation, delivery
- `procurement` - Material sourcing, supplier risks
- `supply-chain` - Broader supply network effects
- `commodities` - Raw material prices
- `energy` - Fuel costs, power supply

## Construction-Specific Insights
The AI prioritizes events that affect:
- Steel, cement, copper, aluminum prices
- Shipping delays and freight costs
- Workforce availability (immigration, visas)
- Government contracts and compliance
- Energy costs for operations
- Trade tariffs on materials

## Alert Example
```
🌍 GEOPOLITICAL INTELLIGENCE ALERT

2026-02-07

⚠️ HIGH PRIORITY: Rising Conflict Activity Detected

4 high-severity conflict events in the last 30 days across 
Middle East, Europe, Global. Potential supply chain disruptions 
for construction and logistics sectors.

Regions: Middle East, Europe, Global

────────────────────────────────────────────

⚠️ HIGH PRIORITY: Multiple Supply Chain Disruptions

10 supply chain events detected in last 60 days. Expect delays 
in procurement and increased costs for construction materials.

Regions: Asia-Pacific, Global, Middle East

📋 DAILY BRIEF:
[Summary of top insights, strategic recommendations, and 
market intelligence relevant to construction and logistics]
```

## Maintenance
- Database: SQLite (lightweight, file-based)
- Storage: ~10MB for 1000 events
- Automated cleanup: None needed (events are historical record)

## Future Enhancements
- [ ] ACLED conflict data integration
- [ ] World Bank economic indicators
- [ ] Commodity price tracking (oil, steel, copper)
- [ ] Shipping route monitoring
- [ ] Weather/climate impact analysis
- [ ] Predictive modeling (ML-based)
- [ ] Custom watchlists per user/project

## Cron Job Details
**Name:** Geopolitical Intel - Hourly Update  
**ID:** e372d8f9-5514-4a1c-9869-0d0e320cb85c  
**Schedule:** Every hour (0 * * * *)  
**Timezone:** Asia/Kuala_Lumpur  
**Session:** Isolated (background)  
**Delivery:** Announces to Hash via Telegram  
**Status:** ✅ Active

Next run: Top of every hour
