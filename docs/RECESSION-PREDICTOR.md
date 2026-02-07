# 📊 Recession Prediction System

Executive-grade recession risk monitoring with 10 leading economic indicators.

## Overview

The Recession Prediction System provides real-time economic intelligence for strategic decision-making in construction and logistics industries. It tracks 10 key indicators, calculates weighted risk scores, and provides actionable recommendations.

## Features

### 1. **Recession Risk Meter Widget**
- **Location:** Main dashboard (top-left)
- **Risk Score:** 0-100 weighted calculation
- **Color Coding:**
  - 🟢 Green (0-30): Low Risk
  - 🟡 Yellow (30-60): Moderate Risk
  - 🟠 Orange (60-80): High Risk
  - 🔴 Red (80+): Critical Risk
- **Timeline Predictions:** "Recession likely in 12-18 months" or "Low risk next 2 years"

### 2. **10 Economic Indicators**

| Indicator | Data Source | Weight | Description |
|-----------|-------------|--------|-------------|
| **Yield Curve** | FRED (T10Y2Y) | 40% | 10yr-2yr Treasury spread (inversion = recession signal) |
| Manufacturing PMI | FRED (MANEMP) | 10% | Manufacturing sector health |
| Unemployment Rate | FRED (UNRATE) | 10% | Job market strength |
| Consumer Confidence | FRED (UMCSENT) | 5% | Consumer sentiment index |
| GDP Growth | FRED (A191RL1Q225SBEA) | 10% | Economic expansion rate |
| Market Volatility (VIX) | FRED (VIXCLS) | 5% | Fear index |
| Housing Starts | FRED (HOUST) | 5% | Construction sector health |
| Corporate Bond Spread | FRED (BAMLC0A4CBBB) | 5% | Credit market stress |
| Commodity Prices | FRED (DCOILWTICO) | 5% | Demand indicator (WTI oil) |
| Banking Stress | FRED (DRTSCILM) | 5% | Loan delinquency rates |

### 3. **Yield Curve Chart**
- Historical 10yr-2yr Treasury spread
- Inversion highlighting (negative spread = recession warning)
- 90-day trend visualization
- Historical accuracy: Inversions preceded every recession since 1970

### 4. **Economic Indicators Grid**
- All 10 indicators in one view
- Real-time status for each
- Color-coded risk levels
- Hover for detailed interpretation

### 5. **Smart Recommendations**

**High Risk (60+):**
- Delay major capex
- Secure credit lines
- Build cash reserves
- Review supplier contracts
- Hedge commodity exposure

**Low Risk (< 30):**
- Expansion opportunities
- Lock in favorable rates
- Invest in efficiency
- Secure long-term contracts
- Strategic hiring

### 6. **AI Strategic Advisor Integration**
- Recession risk displayed in strategic recommendations
- Contextual advice based on current risk level
- Automated alerts when risk crosses thresholds (40%, 60%, 80%)

## Data Sources

### FRED API (Federal Reserve Economic Data)
- **Free:** No rate limits
- **Reliable:** Official government data
- **Sign Up:** https://fred.stlouisfed.org/docs/api/api_key.html
- **Setup:** Add `FRED_API_KEY` to `.env`

### Fallback: Mock Data
- If no API key, system generates realistic mock data
- Useful for testing and development
- Production should use real FRED data

## Installation & Setup

### 1. Get FRED API Key
```bash
# Visit https://fred.stlouisfed.org/
# Sign up (free)
# Go to: https://fred.stlouisfed.org/docs/api/api_key.html
# Copy your API key
```

### 2. Configure Environment
```bash
# Add to .env
FRED_API_KEY=your_api_key_here
```

### 3. Initialize Database
```bash
npm run db:init
```

### 4. Backfill Historical Data (6 months)
```bash
npm run backfill:economy
```

### 5. Collect Current Data
```bash
npm run collect:economy
```

### 6. Start Dashboard
```bash
npm run dev
```

## Usage

### Manual Data Collection
```bash
# Collect latest economic indicators
npm run collect:economy
```

### Automated Collection (Cron)
Set up cron job for every 6 hours:
```bash
0 */6 * * * cd /path/to/project && npm run collect:economy
```

Or use Node cron in production:
```javascript
import cron from 'node-cron';
import { collectEconomicData } from './scripts/collect-economic-data';

// Run every 6 hours
cron.schedule('0 */6 * * *', async () => {
  console.log('Running economic data collection...');
  await collectEconomicData();
});
```

### Update All Data
```bash
# Collect geopolitical events + economic indicators + AI analysis + alerts
npm run update
```

## API Endpoints

### GET `/api/recession-risk`
Returns current recession risk score and breakdown.

**Response:**
```json
{
  "riskScore": 32.5,
  "prediction": "Low risk - economy showing strength",
  "recommendation": "🟢 LOW RISK: Expansion opportunities available...",
  "indicators": [...],
  "lastUpdated": "2026-02-07"
}
```

### GET `/api/economic-indicators`
Returns all 10 latest indicators.

**Response:**
```json
{
  "indicators": [
    {
      "indicator_name": "yield_curve",
      "value": 0.16,
      "interpretation": "Flattening",
      "score": 40,
      "date": "2026-02-07"
    },
    ...
  ],
  "count": 10
}
```

### GET `/api/yield-curve?limit=90`
Returns historical yield curve data.

**Response:**
```json
{
  "history": [
    {
      "date": "2026-02-07",
      "value": 0.16,
      "interpretation": "Flattening"
    },
    ...
  ],
  "count": 90
}
```

### GET `/api/recession-history?limit=365`
Returns recession risk history and historical recessions.

**Response:**
```json
{
  "riskHistory": [...],
  "historicalRecessions": [
    {
      "start": "2007-12-01",
      "end": "2009-06-01",
      "name": "Great Recession"
    },
    ...
  ],
  "count": 365
}
```

## Database Schema

### `economic_indicators` Table
```sql
CREATE TABLE economic_indicators (
  id INTEGER PRIMARY KEY,
  indicator_name TEXT NOT NULL,
  value REAL NOT NULL,
  date TEXT NOT NULL,
  source TEXT,
  interpretation TEXT,
  score REAL,
  metadata TEXT,
  created_at TEXT,
  UNIQUE(indicator_name, date)
);
```

### `recession_risk_history` Table
```sql
CREATE TABLE recession_risk_history (
  id INTEGER PRIMARY KEY,
  risk_score REAL NOT NULL,
  prediction TEXT,
  indicators_snapshot TEXT NOT NULL,
  recommendation TEXT,
  date TEXT NOT NULL,
  created_at TEXT,
  UNIQUE(date)
);
```

## Components

### RecessionRiskMeter.tsx
- Circular gauge visualization
- Risk score 0-100
- Color-coded status
- Strategic recommendations
- Location: Top-left of dashboard

### YieldCurveChart.tsx
- 90-day historical chart
- Inversion highlighting
- Recharts line chart
- Zero-line reference (critical threshold)

### EconomicIndicatorsGrid.tsx
- 10 indicator cards
- Icon-based visualization
- Score bars
- Hover tooltips

## Historical Accuracy

### Yield Curve Inversions → Recessions
- **1989:** Inverted → Gulf War Recession (1990-1991)
- **2000:** Inverted → Dot-com Recession (2001)
- **2006:** Inverted → Great Recession (2007-2009)
- **2019:** Inverted → COVID Recession (2020)

**Average Lead Time:** 12-18 months

## Performance

- **Data Collection:** ~5 seconds (with FRED API)
- **Dashboard Load:** <1 second (cached data)
- **Storage:** ~2KB per day of data
- **Update Frequency:** Every 6 hours (configurable)

## Industry-Specific Impact

### Construction
- Housing starts trend
- Commodity price movements
- Credit availability (bond spreads)
- **Action:** Adjust capex based on risk level

### Logistics
- Demand indicators (GDP, PMI)
- Fuel price trends
- Banking sector health
- **Action:** Optimize inventory and route planning

## Alerts & Notifications

### Threshold Alerts
- **40% Risk:** Monitor closely
- **60% Risk:** Take defensive action
- **80% Risk:** Critical - immediate response

### Integration Points
- AI Strategic Advisor
- Email notifications
- Telegram alerts
- Dashboard highlighting

## Troubleshooting

### No Data Showing
```bash
# Check if database is initialized
npm run db:init

# Run data collection
npm run collect:economy

# Check data in database
sqlite3 data/geopolitical.db "SELECT COUNT(*) FROM economic_indicators;"
```

### FRED API Errors
```bash
# Verify API key in .env
echo $FRED_API_KEY

# Test API key manually
curl "https://api.stlouisfed.org/fred/series/observations?series_id=T10Y2Y&api_key=YOUR_KEY&file_type=json&limit=1"
```

### Stale Data
```bash
# Force fresh collection
npm run collect:economy

# Check last update
sqlite3 data/geopolitical.db "SELECT MAX(date) FROM economic_indicators;"
```

## Roadmap

- [ ] Machine learning recession probability model
- [ ] Sector-specific indicators (construction PMI, freight rates)
- [ ] Alert webhooks for Slack/Teams
- [ ] PDF export of recession reports
- [ ] Mobile app push notifications
- [ ] Custom indicator weights per industry

## Support

For issues or feature requests:
- GitHub Issues: https://github.com/nocodebrain/geopolitical-intel-platform/issues
- Documentation: `/docs/RECESSION-PREDICTOR.md`

## License

Part of the Geopolitical Intelligence Platform  
© 2026 - Executive Decision Intelligence
