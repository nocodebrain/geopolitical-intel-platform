# 📡 Data Sources Documentation

Complete overview of data sources, collection methods, and integration details.

## 🎯 Data Collection Strategy

### Principles
1. **Free/Accessible First**: Prioritize free-tier and open data
2. **Reliability**: Multiple sources for cross-validation
3. **Timeliness**: Real-time or near-real-time updates
4. **Relevance**: Focus on construction/logistics impacts
5. **Compliance**: Respect robots.txt, rate limits, ToS

### Update Frequencies

| Data Type | Target Frequency | Current Status |
|-----------|-----------------|----------------|
| News | Every hour | Manual (Phase 2: Automated) |
| Conflict Data | Every 6 hours | Manual |
| Economic Data | Daily | Manual |
| Commodity Prices | Daily | Planned |
| Shipping Routes | 6 hours | Planned |

## 📰 News Sources

### Active Sources

#### 1. Reuters World News
- **Type**: RSS Feed
- **URL**: `https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best`
- **Update**: Hourly
- **Coverage**: Global, comprehensive
- **Cost**: Free
- **Reliability**: ⭐⭐⭐⭐⭐
- **Integration**: `lib/data-collection/news-aggregator.ts`

**Focus Areas:**
- Breaking news
- Business/trade
- Politics
- Conflicts

#### 2. BBC World News
- **Type**: RSS Feed
- **URL**: `http://feeds.bbci.co.uk/news/world/rss.xml`
- **Update**: Hourly
- **Coverage**: Global, trusted
- **Cost**: Free
- **Reliability**: ⭐⭐⭐⭐⭐
- **Integration**: RSS parser

**Focus Areas:**
- International news
- Business
- Analysis

#### 3. Al Jazeera
- **Type**: RSS Feed
- **URL**: `https://www.aljazeera.com/xml/rss/all.xml`
- **Update**: Hourly
- **Coverage**: Middle East focus, global
- **Cost**: Free
- **Reliability**: ⭐⭐⭐⭐⭐
- **Integration**: RSS parser

**Focus Areas:**
- Middle East
- Conflicts
- Politics

#### 4. Associated Press
- **Type**: RSS Feed
- **URL**: `https://www.ap.org/rss/news`
- **Update**: Hourly
- **Coverage**: US focus, global
- **Cost**: Free
- **Reliability**: ⭐⭐⭐⭐⭐
- **Integration**: RSS parser

#### 5. NewsAPI.org
- **Type**: REST API
- **URL**: `https://newsapi.org/v2/everything`
- **Update**: Real-time
- **Coverage**: 80,000+ sources worldwide
- **Cost**: Free tier (100 requests/day), Pro ($449/mo for commercial)
- **Reliability**: ⭐⭐⭐⭐
- **Integration**: API client

**API Example:**
```bash
curl https://newsapi.org/v2/everything \
  ?q=supply+chain+disruption \
  &sortBy=publishedAt \
  &apiKey=YOUR_KEY
```

**Rate Limits:**
- Free: 100 requests/day
- Developer: 250 requests/day ($49/mo)
- Pro: Unlimited

### Planned Sources

#### GDELT Project
- **Type**: BigQuery/API
- **Update**: Every 15 minutes
- **Coverage**: Comprehensive global events
- **Cost**: Free (Google BigQuery costs may apply)
- **Status**: Phase 2

**Why GDELT?**
- Monitors 100+ languages
- Real-time event detection
- Geographic coding
- Tone/sentiment analysis

#### Google News RSS
- **Type**: RSS Feed
- **Coverage**: Regional feeds available
- **Cost**: Free
- **Status**: Phase 2

## ⚔️ Conflict Data Sources

### Planned Integrations

#### 1. ACLED (Armed Conflict Location & Event Data Project)
- **Type**: REST API
- **URL**: `https://api.acleddata.com/acled/read`
- **Update**: Weekly
- **Coverage**: 200+ countries, real-time conflict tracking
- **Cost**: Free registration required
- **Status**: Phase 2

**Data Includes:**
- Conflict events (battles, explosions, violence)
- Protest events
- Strategic developments
- Actor information
- Fatalities

**API Example:**
```bash
curl "https://api.acleddata.com/acled/read?key=YOUR_KEY&email=YOUR_EMAIL&country=Ukraine&year=2026"
```

#### 2. UCDP (Uppsala Conflict Data Program)
- **Type**: Downloadable datasets
- **URL**: `https://ucdp.uu.se/downloads/`
- **Update**: Annually (historical), monthly (ongoing)
- **Coverage**: Armed conflicts since 1946
- **Cost**: Free
- **Status**: Phase 2

**Datasets:**
- Battle-related deaths
- One-sided violence
- Non-state conflicts
- Peace agreements

#### 3. Crisis Group
- **Type**: Web scraping / RSS
- **URL**: `https://www.crisisgroup.org/`
- **Update**: Weekly reports
- **Coverage**: In-depth conflict analysis
- **Cost**: Free
- **Status**: Phase 2

## 💰 Economic Data Sources

### Planned Integrations

#### 1. World Bank API
- **Type**: REST API
- **URL**: `https://api.worldbank.org/v2/`
- **Update**: Quarterly/Annually
- **Coverage**: 200+ countries, 1,400+ indicators
- **Cost**: Free
- **Status**: Phase 2

**Key Indicators:**
- GDP growth
- Trade balance
- FDI inflows
- Inflation rates
- Infrastructure spending

**API Example:**
```bash
curl "https://api.worldbank.org/v2/country/CHN/indicator/NY.GDP.MKTP.CD?format=json"
```

#### 2. FRED (Federal Reserve Economic Data)
- **Type**: REST API
- **URL**: `https://api.stlouisfed.org/fred/`
- **Coverage**: US economic indicators
- **Cost**: Free
- **Status**: Phase 2

**Relevant Data:**
- Interest rates
- Commodity prices
- Construction spending
- Employment data

#### 3. Trading Economics
- **Type**: Web scraping
- **URL**: `https://tradingeconomics.com/`
- **Update**: Real-time
- **Coverage**: Global indicators, commodities
- **Cost**: Free (with scraping), API $350/mo
- **Status**: Phase 2

#### 4. UN Comtrade
- **Type**: REST API
- **URL**: `https://comtradeapi.un.org/`
- **Coverage**: International trade statistics
- **Cost**: Free
- **Status**: Phase 3

## 🛢️ Commodity Price Sources

### Planned Integrations

#### 1. Investing.com
- **Type**: Web scraping
- **Coverage**: Oil, steel, copper, aluminum, lumber
- **Update**: Real-time
- **Cost**: Free (scraping)
- **Status**: Phase 2

#### 2. London Metal Exchange (LME)
- **Type**: API / Web scraping
- **Coverage**: Industrial metals
- **Cost**: Free (limited), API available
- **Status**: Phase 3

#### 3. IndexMundi
- **Type**: Web scraping
- **Coverage**: Commodity price indices
- **Cost**: Free
- **Status**: Phase 2

## 🚢 Shipping & Logistics Sources

### Planned Integrations

#### 1. MarineTraffic
- **Type**: API
- **Coverage**: Vessel tracking, port congestion
- **Cost**: Free tier available, Pro $600+/mo
- **Status**: Phase 3

#### 2. Freightos Baltic Index (FBX)
- **Type**: Web scraping / API
- **Coverage**: Container shipping rates
- **Cost**: Free (scraping)
- **Status**: Phase 2

#### 3. PortWatch
- **Type**: Web scraping
- **Coverage**: Port congestion metrics
- **Cost**: Free
- **Status**: Phase 3

## 🗺️ Geospatial Data

### Active Sources

#### Natural Earth
- **Type**: Static datasets
- **Coverage**: Country boundaries, cities
- **Cost**: Free
- **Status**: Active (used for country coordinates)

#### OpenStreetMap
- **Type**: Tile server
- **Coverage**: World map tiles
- **Cost**: Free
- **Status**: Active (Leaflet map)

## 🔐 Sanctions Databases

### Planned Integrations

#### 1. OFAC (US Treasury)
- **URL**: `https://sanctionslist.ofac.treas.gov/`
- **Cost**: Free
- **Status**: Phase 2

#### 2. EU Sanctions
- **URL**: `https://eeas.europa.eu/`
- **Cost**: Free
- **Status**: Phase 2

#### 3. UN Sanctions
- **URL**: `https://www.un.org/securitycouncil/sanctions/`
- **Cost**: Free
- **Status**: Phase 2

## 📊 Data Processing Pipeline

### Current Flow

```
1. RSS/API Collection (news-aggregator.ts)
   ↓
2. Content Extraction (title, description, date)
   ↓
3. AI Processing (ai-processor.ts)
   - Categorization
   - Severity scoring
   - Entity extraction
   - Sentiment analysis
   ↓
4. Database Storage (db/index.ts)
   ↓
5. Connection Detection (AI)
   ↓
6. Insight Generation (Daily briefs)
```

### Planned Enhancements

**Phase 2:**
- Automated scheduled collection (cron jobs)
- Deduplication algorithm
- Multi-source verification
- Historical data backfill

**Phase 3:**
- Real-time streaming (WebSockets)
- Advanced NLP (entity linking, co-reference)
- Machine learning predictions
- Anomaly detection

## 🛠️ Data Quality Controls

### Validation Rules

1. **Deduplication**: Check title + date similarity
2. **Date Validation**: Must be within last 365 days
3. **Location Extraction**: Must map to known country
4. **Source Attribution**: Always store original URL
5. **Severity Range**: 1-10 scale enforcement

### Error Handling

```typescript
try {
  const events = await collectNewsFromRSS();
  updateSourceStatus('Reuters', 'active');
} catch (error) {
  updateSourceStatus('Reuters', 'error', error.message);
  notifyAdmin(error);
}
```

### Monitoring

- **Source Status**: Tracked in `sources` table
- **Error Logging**: Captured with timestamps
- **Data Freshness**: Last update time monitored
- **Collection Metrics**: Events/hour tracked

## 📈 Usage Statistics

**Current Coverage (MVP):**
- 5 active RSS feeds
- 1 API integration (NewsAPI - optional)
- 37 countries profiled
- 10+ sample events seeded

**Target Coverage (Phase 2):**
- 15+ data sources
- Real-time updates
- 100+ events/day
- Historical data (30+ days)

## 🔄 Rate Limiting & Compliance

### RSS Feeds
- **Delay**: 2 seconds between requests
- **Respect**: robots.txt
- **Headers**: User-Agent identification
- **Caching**: Store responses, avoid re-fetching

### APIs
- **NewsAPI**: 100/day free, respect limits
- **ACLED**: 2,000 requests/hour
- **World Bank**: No explicit limit, be reasonable
- **FRED**: 120 requests/minute

### Best Practices

1. **Cache responses** for repeated queries
2. **Batch requests** where possible
3. **Exponential backoff** on errors
4. **Monitor rate limits** proactively
5. **Rotate API keys** if available

## 📝 Adding New Sources

### Step-by-Step Guide

1. **Identify Source**
   - Free/accessible?
   - Reliable?
   - Relevant?

2. **Create Collector Function**
   ```typescript
   // lib/data-collection/new-source.ts
   export async function collectFromNewSource() {
     // Fetch data
     // Parse format
     // Transform to Event schema
     // Store in database
   }
   ```

3. **Add to Sources Table**
   ```typescript
   upsertSource({
     name: 'New Source',
     url: 'https://...',
     type: 'api',
     category: 'news',
     enabled: 1
   });
   ```

4. **Test Locally**
   ```bash
   npm run collect
   ```

5. **Schedule (Phase 2)**
   - Add to cron jobs
   - Monitor errors

## 🎓 References

- [NewsAPI Documentation](https://newsapi.org/docs)
- [ACLED API Guide](https://acleddata.com/resources/quick-guide-to-acled-data/)
- [World Bank API](https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation)
- [GDELT Documentation](https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/)

---

**Data is our foundation. Quality is our commitment.** 📊

*Updated: February 2026*
