# 🔌 API Documentation

Complete reference for all API endpoints in the Geopolitical Intelligence Platform.

## 📋 Base URL

**Local Development:**
```
http://localhost:3000/api
```

**Production:**
```
https://your-domain.com/api
```

## 🔐 Authentication

Currently no authentication required (single-user MVP). Multi-user authentication planned for Phase 4.

## 📊 Response Format

All endpoints return JSON with consistent structure:

**Success Response:**
```json
{
  "data": { ... },
  "count": 10,
  "timestamp": "2026-02-07T12:00:00.000Z"
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2026-02-07T12:00:00.000Z"
}
```

## 📍 Endpoints

### Events

#### GET `/api/events`

Retrieve a list of geopolitical events with optional filtering.

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `search` | string | Search in title, description, country | `?search=steel` |
| `category` | string | Filter by category | `?category=Trade` |
| `region` | string | Filter by region | `?region=Asia-Pacific` |
| `country` | string | Filter by country | `?country=China` |
| `severity` | number | Minimum severity (1-10) | `?severity=8` |
| `startDate` | string | ISO date (YYYY-MM-DD) | `?startDate=2026-01-01` |
| `endDate` | string | ISO date | `?endDate=2026-02-07` |
| `limit` | number | Max results (default: 100) | `?limit=50` |
| `offset` | number | Pagination offset | `?offset=50` |

**Example Request:**
```bash
curl "http://localhost:3000/api/events?category=Conflict&severity=7&limit=10"
```

**Example Response:**
```json
{
  "events": [
    {
      "id": 1,
      "title": "Red Sea Shipping Attacks Disrupt Global Trade Routes",
      "description": "Houthi attacks on commercial vessels...",
      "category": "Conflict",
      "severity": 9,
      "region": "Middle East",
      "country": "Yemen",
      "country_code": "YE",
      "latitude": 15.5527,
      "longitude": 48.5164,
      "date": "2026-02-05T00:00:00.000Z",
      "source_name": "Reuters",
      "source_url": "https://reuters.com/example",
      "entities": "{\"countries\":[\"Yemen\",\"Saudi Arabia\"],\"companies\":[],\"people\":[],\"commodities\":[\"oil\",\"shipping\"]}",
      "sentiment_score": -0.8,
      "impact_tags": "[\"logistics\",\"supply-chain\",\"shipping\"]",
      "created_at": "2026-02-07T00:00:00.000Z"
    }
  ],
  "count": 1,
  "filters": {
    "category": "Conflict",
    "severity": 7
  }
}
```

#### GET `/api/events/[id]`

Retrieve a specific event by ID with related connections.

**Path Parameters:**
- `id` (number): Event ID

**Example Request:**
```bash
curl "http://localhost:3000/api/events/1"
```

**Example Response:**
```json
{
  "event": {
    "id": 1,
    "title": "Red Sea Shipping Attacks...",
    ...
  },
  "connections": [
    {
      "id": 1,
      "event_a_id": 1,
      "event_b_id": 4,
      "relationship_type": "causes",
      "confidence_score": 0.8,
      "explanation": "Shipping disruptions increase logistics costs...",
      "created_at": "2026-02-07T00:00:00.000Z"
    }
  ]
}
```

### Countries

#### GET `/api/countries`

Retrieve all country profiles with risk assessments.

**Example Request:**
```bash
curl "http://localhost:3000/api/countries"
```

**Example Response:**
```json
{
  "countries": [
    {
      "id": 1,
      "name": "China",
      "region": "Asia-Pacific",
      "iso_code": "CN",
      "iso_code_3": "CHN",
      "latitude": 39.9042,
      "longitude": 116.4074,
      "stability_index": 75,
      "risk_level": "moderate",
      "active_conflicts_count": 0,
      "updated_at": "2026-02-07T00:00:00.000Z"
    }
  ],
  "count": 37
}
```

### Insights

#### GET `/api/insights`

Retrieve AI-generated insights and briefs.

**Query Parameters:**
- `category` (string): Filter by category (`daily_brief`, `analysis`, `prediction`)
- `limit` (number): Max results (default: 20)

**Example Request:**
```bash
curl "http://localhost:3000/api/insights?category=daily_brief"
```

**Example Response:**
```json
{
  "insight": {
    "id": 1,
    "title": "Daily Intelligence Brief",
    "content": "**Top 3 Insights for 2026-02-07:**\n\n1. Red Sea Crisis...",
    "category": "daily_brief",
    "impact_level": "high",
    "relevant_industries": "[\"construction\",\"logistics\",\"procurement\"]",
    "related_events": "[1,2,3,4,7]",
    "date": "2026-02-07T00:00:00.000Z",
    "created_at": "2026-02-07T06:00:00.000Z"
  }
}
```

**Get All Insights:**
```bash
curl "http://localhost:3000/api/insights?limit=50"
```

**Response:**
```json
{
  "insights": [ ... ],
  "count": 10
}
```

### Connections

#### GET `/api/connections`

Retrieve all event connections identified by AI.

**Example Request:**
```bash
curl "http://localhost:3000/api/connections"
```

**Example Response:**
```json
{
  "connections": [
    {
      "id": 1,
      "event_a_id": 1,
      "event_b_id": 4,
      "relationship_type": "causes",
      "confidence_score": 0.8,
      "explanation": "Shipping disruptions in Red Sea increase logistics costs, contributing to commodity price increases including copper",
      "created_at": "2026-02-07T00:00:00.000Z"
    }
  ],
  "count": 4
}
```

### Statistics

#### GET `/api/stats`

Retrieve platform statistics and aggregations.

**Example Request:**
```bash
curl "http://localhost:3000/api/stats"
```

**Example Response:**
```json
{
  "totalEvents": 10,
  "totalConnections": 4,
  "totalCountries": 37,
  "criticalEvents": 2,
  "eventsByCategory": [
    { "category": "Conflict", "count": 3 },
    { "category": "Trade", "count": 2 },
    { "category": "Economy", "count": 2 },
    { "category": "Politics", "count": 2 },
    { "category": "Climate", "count": 1 }
  ],
  "eventsByRegion": [
    { "region": "Asia-Pacific", "count": 4 },
    { "region": "Middle East", "count": 3 },
    { "region": "Europe", "count": 1 },
    { "region": "Americas", "count": 2 }
  ]
}
```

### Health Check

#### GET `/api/health`

Check application and database health.

**Example Request:**
```bash
curl "http://localhost:3000/api/health"
```

**Example Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "events": 10,
  "timestamp": "2026-02-07T12:00:00.000Z"
}
```

**Error Response:**
```json
{
  "status": "unhealthy",
  "error": "Database connection failed",
  "timestamp": "2026-02-07T12:00:00.000Z"
}
```

## 🔍 Filtering Examples

### Complex Event Query

**Multiple Filters:**
```bash
curl "http://localhost:3000/api/events?category=Trade&region=Asia-Pacific&severity=6&startDate=2026-01-01&limit=20"
```

**Search + Filter:**
```bash
curl "http://localhost:3000/api/events?search=steel%20tariffs&category=Trade"
```

**Pagination:**
```bash
# First page (events 0-49)
curl "http://localhost:3000/api/events?limit=50&offset=0"

# Second page (events 50-99)
curl "http://localhost:3000/api/events?limit=50&offset=50"
```

## 📊 Data Models

### Event Model

```typescript
interface Event {
  id: number;
  title: string;                    // Max 500 chars
  description: string;               // Max 2000 chars
  category: string;                  // Conflict, Trade, Politics, Economy, Climate, Tech
  severity: number;                  // 1-10 scale
  region: string;                    // Asia-Pacific, Middle East, Europe, Americas, Africa, Global
  country: string;
  country_code?: string;             // ISO 3166-1 alpha-2
  latitude?: number;
  longitude?: number;
  date: string;                      // ISO 8601
  source_url?: string;
  source_name?: string;
  entities?: string;                 // JSON: {countries, companies, people, commodities}
  sentiment_score?: number;          // -1 to 1
  impact_tags?: string;              // JSON: [construction, logistics, etc.]
  created_at: string;
  updated_at: string;
}
```

### Connection Model

```typescript
interface Connection {
  id: number;
  event_a_id: number;
  event_b_id: number;
  relationship_type: string;        // causes, relates_to, follows
  confidence_score: number;         // 0-1
  explanation: string;
  created_at: string;
}
```

### Country Model

```typescript
interface Country {
  id: number;
  name: string;
  region: string;
  iso_code: string;                 // ISO 3166-1 alpha-2
  iso_code_3?: string;              // ISO 3166-1 alpha-3
  latitude?: number;
  longitude?: number;
  stability_index?: number;         // 0-100
  risk_level?: string;              // low, moderate, high, critical
  active_conflicts_count?: number;
  economic_indicators?: string;     // JSON
  trade_relationships?: string;     // JSON
  updated_at: string;
}
```

### Insight Model

```typescript
interface Insight {
  id: number;
  title: string;
  content: string;                  // Markdown supported
  category: string;                 // daily_brief, analysis, prediction
  impact_level?: string;            // low, medium, high, critical
  relevant_industries?: string;     // JSON: [construction, logistics, etc.]
  related_events?: string;          // JSON: [event_ids]
  date: string;                     // ISO 8601
  created_at: string;
}
```

## 🚨 Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `400` | Bad Request | Invalid query parameters |
| `404` | Not Found | Resource not found |
| `500` | Internal Server Error | Server/database error |

## 🔄 Rate Limiting

**Current:** No rate limiting (single-user MVP)

**Planned (Phase 4):**
- 1000 requests/hour per API key
- 10,000 requests/day per API key
- Burst: 50 requests/minute

## 📦 Response Headers

```
Content-Type: application/json
X-Response-Time: <ms>
Cache-Control: public, max-age=60
```

## 🔧 Development Tools

### cURL Examples

**Get critical events:**
```bash
curl "http://localhost:3000/api/events?severity=8"
```

**Search for supply chain events:**
```bash
curl "http://localhost:3000/api/events?search=supply%20chain"
```

**Get event with connections:**
```bash
curl "http://localhost:3000/api/events/1"
```

### JavaScript Fetch

```javascript
// Get all events
const response = await fetch('/api/events?limit=100');
const data = await response.json();
console.log(data.events);

// Get specific event
const event = await fetch('/api/events/1').then(r => r.json());
console.log(event.event);

// Search events
const results = await fetch('/api/events?search=steel')
  .then(r => r.json());
```

### TypeScript Client Example

```typescript
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function getEvents(params?: {
  category?: string;
  region?: string;
  severity?: number;
  limit?: number;
}) {
  const response = await axios.get(`${API_BASE}/api/events`, { params });
  return response.data;
}

export async function getEventById(id: number) {
  const response = await axios.get(`${API_BASE}/api/events/${id}`);
  return response.data;
}

export async function getDailyBrief() {
  const response = await axios.get(`${API_BASE}/api/insights?category=daily_brief`);
  return response.data.insight;
}

// Usage
const criticalEvents = await getEvents({ severity: 8, limit: 10 });
const event = await getEventById(1);
const brief = await getDailyBrief();
```

## 🚀 Future API Features (Roadmap)

### Phase 2
- [ ] POST `/api/events` - Create events manually
- [ ] PUT `/api/events/[id]` - Update events
- [ ] DELETE `/api/events/[id]` - Delete events
- [ ] GET `/api/watchlist` - User watchlist
- [ ] POST `/api/watchlist` - Add to watchlist

### Phase 3
- [ ] GET `/api/predictions` - Predictive insights
- [ ] GET `/api/scenarios` - Scenario planning
- [ ] GET `/api/reports` - Generate PDF reports
- [ ] POST `/api/alerts` - Configure alerts

### Phase 4
- [ ] Authentication endpoints
- [ ] User management
- [ ] API key management
- [ ] WebSocket support for real-time updates

## 📚 Additional Resources

- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [REST API Best Practices](https://restfulapi.net/)
- [HTTP Status Codes](https://httpstatuses.com/)

---

**API-first. Developer-friendly. Production-ready.** 🔌

*Updated: February 2026*
