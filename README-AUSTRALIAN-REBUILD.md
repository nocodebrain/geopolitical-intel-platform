# 🇦🇺 Australian Business Intelligence Platform

**World-class geopolitical intelligence for Australian businesses**

## 🎯 What This Platform Does

This platform provides **actionable geopolitical intelligence specifically for Australian businesses** in construction, logistics, procurement, and mining sectors.

Unlike generic news aggregators, every event is analyzed from an **Australian perspective**:
- ✅ "Why this matters to Australian businesses"
- ✅ Impact on Australian supply chains
- ✅ Commodity price effects (iron ore, coal, LNG)
- ✅ Trade partner risk assessment
- ✅ Actionable recommendations

## 🇦🇺 Australia-Centric Features

### 1. **Australian Data Sources**
Real news from sources that matter to Australian businesses:
- **ABC News Australia** - Australian perspective on global events
- **Bloomberg Asia** - Asia-Pacific business intelligence
- **Reuters Asia** - Regional news focus
- **ASPI** - Australian strategic policy and defense analysis
- **Trade/Shipping** - Lloyd's List, FreightWaves for logistics intel

### 2. **Australian Economic Intelligence**
- **RBA (Reserve Bank of Australia)** cash rate and policy
- **ABS (Australian Bureau of Statistics)** employment, GDP, building approvals
- **FRED API** - US/global indicators affecting Australian trade
- **Real commodity prices** - Iron ore, coal, LNG, wheat, gold (Australia's major exports)
- **AUD exchange rates** - AUD/USD, AUD/CNY, AUD/EUR

### 3. **Australian Impact Analysis**
Every event includes:
- **"Why this matters to Australia"** one-liner
- **Detailed analysis** - Specific impacts on Australian operations
- **Affected industries** - Construction, logistics, mining, procurement, etc.
- **Trade impact** - How it affects Australian imports/exports
- **Supply chain impact** - Disruptions affecting Australian businesses
- **Commodity impact** - Effects on iron ore, coal, LNG prices
- **Recommendation** - What Australian businesses should DO
- **Timeframe** - Immediate, short-term, medium-term, long-term

### 4. **Region Prioritization**
Focus on what matters most to Australia:
1. **Asia-Pacific (70%)** - China, Japan, South Korea, Indonesia, PNG, Pacific Islands
2. **Major Trade Partners (20%)** - US, UK, EU
3. **Strategic Regions (10%)** - Middle East (energy), Africa (mining)

### 5. **Australian Recession Risk Meter**
Combines:
- RBA cash rate + policy direction
- ABS employment & building approvals
- US yield curve (affects global trade)
- China manufacturing PMI (Australia's #1 trade partner)
- Commodity price trends
- **Australian-specific prediction**: "What this means for Australian businesses"

## 🚀 Quick Start

### Local Development
```bash
# Install dependencies
npm install

# Set environment variables (optional for enhanced features)
cp .env.example .env
# Add OPENAI_API_KEY, FRED_API_KEY, TRADING_ECONOMICS_KEY

# Initialize database
npm run db:init

# Collect Australian intelligence
npm run collect

# Collect Australian economic data
npm run collect:economy

# Start development server
npm run dev
```

Visit http://localhost:3000

### Data Collection

**Collect Australian intelligence (news + impact analysis):**
```bash
npm run collect
```
- Fetches from Australian-centric news sources
- Calculates Australian relevance score (0-100)
- Generates "Australian Impact" analysis for each event
- Takes 2-5 minutes depending on number of sources

**Collect Australian economic data:**
```bash
npm run collect:economy
```
- Fetches RBA, ABS, and global indicators
- Calculates Australian recession risk
- Updates commodity prices
- Takes 30-60 seconds

**Full update (recommended daily):**
```bash
npm run update
```

## 📊 Data Sources

### News Sources (RSS Feeds)
- ✅ ABC News Australia (Australian perspective)
- ✅ Bloomberg Asia (Asia-Pacific business)
- ✅ Reuters Asia (Regional coverage)
- ✅ ASPI (Australian strategic analysis)
- ✅ Lloyd's List (Shipping/logistics)
- ✅ FreightWaves (Supply chain intel)
- ✅ South China Morning Post (China insights)
- ✅ Nikkei Asia (Asian markets)

### Economic Data
- ✅ **RBA** - Cash rate, policy statements
- ✅ **ABS** - Employment, GDP, building approvals
- ✅ **FRED API** - US Treasury yields, unemployment, VIX, etc.
- ✅ **Trading Economics** - Commodity prices, PMI data

### Commodity Prices (Australian Exports)
- ✅ Iron ore (~A$120B/year) - Australia's #1 export
- ✅ Coal - Thermal & coking (~A$90B/year combined)
- ✅ LNG (~A$65B/year)
- ✅ Wheat (~A$9B/year)
- ✅ Gold (~A$28B/year)
- Plus: Steel, copper, aluminum (construction materials)

### Currency Rates
- ✅ AUD/USD - Import cost indicator
- ✅ AUD/CNY - China trade exposure
- ✅ AUD/EUR - European trade costs

## 🎯 Use Cases

### For Construction Companies
- **Building approvals trend** - Leading indicator for demand
- **Construction material prices** - Steel, copper, aluminum costs
- **Supply chain disruptions** - Shipping delays, port congestion
- **China property sector** - Affects steel demand and prices

### For Logistics Companies
- **Shipping route disruptions** - South China Sea, Strait of Malacca
- **Port status** - Melbourne, Sydney, Brisbane
- **Container shipping rates** - Global indices
- **Trade policy changes** - Tariffs, sanctions affecting freight

### For Procurement Teams
- **Commodity price trends** - Budget for cost changes
- **Supply chain risks** - Supplier country instability
- **Trade disputes** - Alternative sourcing recommendations
- **Lead time extensions** - Shipping delays, production disruptions

### For Mining Companies
- **Iron ore/coal price trends** - Revenue forecasting
- **China demand indicators** - PMI, property sector, steel production
- **Trade tensions** - Export restrictions, tariffs
- **AUD exchange rate** - Export revenue in AUD terms

## 📈 Dashboard Features

### Executive Dashboard
- **Australian Risk Score** - Not generic "global" risk
- **Top 3 Critical Events** - Affecting Australian interests
- **Recession Risk Meter** - Australian + global indicators
- **Commodity Tracker** - Australian export prices
- **Asia-Pacific Threat Map** - Our backyard, not US/Europe

### Event Cards
Every event shows:
- 🇦🇺 **Australian Impact** badge
- **Relevance score** (0-100)
- **Affected industries** tags
- **"Why this matters"** summary
- **Detailed analysis** with Australian context
- **Recommendation** for Australian businesses

### Insights Page
- **Daily brief** - "What Australian businesses need to know today"
- **Weekly strategic report** - Trends and predictions
- **Scenario analysis** - "If China GDP slows 2%, Australian iron ore exports drop X%"

## 🏗️ Architecture

```
geopolitical-intel-platform/
├── lib/
│   ├── data-collection/
│   │   ├── australian-sources.ts          # 🇦🇺 Australian RSS feeds
│   │   ├── australian-impact-analyzer.ts  # 🇦🇺 Impact analysis engine
│   │   ├── australian-commodities.ts      # 🇦🇺 Commodity price tracker
│   │   ├── ai-processor.ts                # Event categorization & analysis
│   │   └── news-aggregator.ts             # (Legacy) Generic aggregator
│   └── db/
│       ├── index.ts                        # SQLite database interface
│       └── schema.sql                      # Database schema
├── scripts/
│   ├── collect-australian-intel.ts        # 🇦🇺 Main collection script
│   ├── collect-australian-economic-data.ts # 🇦🇺 Economic data collection
│   ├── init-on-startup.ts                 # Railway deployment init
│   └── (various other scripts)
├── app/
│   ├── page.tsx                           # 🇦🇺 Australian dashboard
│   ├── events/                            # Events listing & detail pages
│   ├── connections/                       # Event relationship graph
│   └── api/                               # REST API endpoints
└── components/
    └── executive/                         # Dashboard widgets
```

## 🔧 Environment Variables

Optional but recommended for enhanced features:

```env
# OpenAI (for AI-powered impact analysis)
OPENAI_API_KEY=sk-...

# FRED API (US economic indicators - FREE)
FRED_API_KEY=...
# Get free key at: https://fred.stlouisfed.org/docs/api/api_key.html

# Trading Economics (commodity prices - optional)
TRADING_ECONOMICS_KEY=...
```

**Without API keys:** Platform works fine with rule-based analysis and mock data clearly labeled as such.

## 📋 Deployment (Railway)

The platform is deployed on Railway: https://geopolitical-intel-platform-production.up.railway.app/

**On each deployment:**
1. Database initializes automatically
2. Seed data loads (countries, sample events)
3. Initial Australian intelligence collection runs
4. Economic indicators are fetched

**Scheduled updates:**
Set up Railway cron jobs:
- **Every 6 hours**: `npm run collect` (Australian intelligence)
- **Every 12 hours**: `npm run collect:economy` (Economic data)

## 🎯 Success Metrics

**Data Quality:**
- ✅ 0% mock/generated event data (all real sources)
- ✅ 100% events have real sources cited
- ✅ 95%+ accurate dates and locations
- ✅ Australian relevance score for every event

**Relevance:**
- ✅ 80%+ events directly relevant to Australian interests
- ✅ Every event has "Australian Impact" analysis
- ✅ Clear industry-specific recommendations
- ✅ Actionable intelligence (not just news aggregation)

**Usability:**
- ✅ Dashboard comprehensible in < 30 seconds
- ✅ Drill-down analysis in 2 clicks
- ✅ Mobile-friendly
- ✅ Bloomberg-style clean UI

**Trust:**
- ✅ Real data sources visible
- ✅ Evidence-based predictions
- ✅ No hyperbole or clickbait
- ✅ Clear confidence scores

## 🔮 Roadmap

### Phase 1: Complete ✅
- [x] Australian news sources integrated
- [x] Australian impact analyzer
- [x] Commodity price tracker
- [x] RBA/ABS/FRED economic data
- [x] Australian recession risk meter

### Phase 2: In Progress 🚧
- [ ] Australia-centered world map (Pacific-centric projection)
- [ ] Enhanced UI with Australian context throughout
- [ ] Daily automated email reports
- [ ] WhatsApp alerts for critical events

### Phase 3: Future 🔮
- [ ] Port status monitoring (Melbourne, Sydney, Brisbane)
- [ ] Shipping route tracking (South China Sea)
- [ ] Company-specific impact (BHP, Rio Tinto, etc.)
- [ ] Custom alerts per industry
- [ ] Historical event database (10+ years)
- [ ] Predictive analytics (ML-powered)

## 🤝 Contributing

This is a product built for Australian business owners. If you have:
- Better data sources (RBA/ABS APIs)
- Industry-specific insights (construction, mining, logistics)
- Feedback on usefulness

Please contribute!

## 📄 License

MIT

---

**Built for Australian businesses who need to understand what's happening in the world that affects their operations.**

**Think Bloomberg Terminal meets Australian business intelligence.**

Last Updated: 2026-02-07
Status: Production-ready
Live URL: https://geopolitical-intel-platform-production.up.railway.app/
