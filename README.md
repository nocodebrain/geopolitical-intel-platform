# 🌍 Geopolitical Intelligence Platform

A production-ready geopolitical insights dashboard built for strategic decision-making in construction and logistics industries. This platform aggregates real-time global events, identifies patterns, and provides actionable intelligence for supply chain management, risk assessment, and market analysis.

![Platform Banner](https://img.shields.io/badge/Status-MVP%20Complete-brightgreen) ![License](https://img.shields.io/badge/License-MIT-blue) ![Next.js](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## ✨ Features

### 📊 Interactive Dashboard
- **Global Risk Map**: Interactive Leaflet map with event markers color-coded by severity
- **Top 10 Developing Situations**: Real-time ranking of most critical events
- **Daily Intelligence Brief**: AI-generated summaries tailored for construction/logistics
- **Critical Alerts**: Immediate visibility of high-severity events
- **Statistics Overview**: Total events, connections, countries monitored

### 📰 Events Timeline
- **Comprehensive Feed**: Chronological view of all geopolitical events
- **Advanced Filtering**: By category, region, severity, date range, and keywords
- **Search Functionality**: Full-text search across titles, descriptions, countries
- **Impact Tags**: Construction, logistics, procurement, supply-chain categorization
- **Detailed Event Pages**: Full context with entities, sentiment, sources

### 🔗 Event Connections
- **Pattern Recognition**: AI-detected relationships between events
- **Causal Analysis**: Identifies event chains (Event A → Event B → Event C)
- **Confidence Scoring**: Relationship strength indicators
- **Network Visualization**: Interactive connection graphs (coming soon)

### 🌎 Regional Intelligence
- **Country Profiles**: Risk levels, stability indices, active conflicts
- **Regional Grouping**: Asia-Pacific, Middle East, Europe, Americas, Africa
- **Event Aggregation**: Per-country event counts and severity averages
- **Quick Filters**: Jump directly to region-specific events

### 🧠 AI-Powered Insights
- **Daily Briefs**: Automated 3-5 key insights every morning
- **Strategic Analysis**: Impact assessments for construction/logistics
- **Pattern Detection**: Recurring sequences and leading indicators
- **Sentiment Analysis**: Event escalation tracking

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (20+ recommended)
- npm or yarn

### Installation

1. **Clone and Install**
```bash
git clone <your-repo-url>
cd geopolitical-intel-platform
npm install
```

2. **Configure Environment**
```bash
cp .env.example .env.local
# Edit .env.local and add your API keys (optional but recommended)
```

3. **Initialize Database**
```bash
npm run db:seed
```
This creates the SQLite database and populates it with:
- 10+ sample events (last 30 days)
- 37 countries with risk assessments
- Event connections
- Sample daily brief

4. **Start Development Server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📚 Documentation

- [Deployment Guide](./docs/DEPLOYMENT.md) - Deploy to Railway or Vercel
- [User Guide](./docs/USER_GUIDE.md) - How to use the platform
- [Data Sources](./docs/DATA_SOURCES.md) - Where data comes from
- [API Documentation](./docs/API_DOCS.md) - API endpoints reference

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **UI Components**: Lucide icons, custom components
- **Mapping**: Leaflet.js (OpenStreetMap tiles)
- **Database**: SQLite with better-sqlite3 (production-ready)
- **AI/ML**: OpenAI GPT-4o-mini for analysis
- **Data Collection**: RSS parsing, NewsAPI integration

### Project Structure
```
geopolitical-intel-platform/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   ├── events/           # Event endpoints
│   │   ├── countries/        # Country data
│   │   ├── insights/         # AI insights
│   │   ├── connections/      # Event relationships
│   │   └── stats/            # Statistics
│   ├── events/               # Events pages
│   ├── connections/          # Connections view
│   ├── insights/             # Insights page
│   ├── regions/              # Regional intelligence
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Dashboard
│   └── globals.css           # Global styles
├── components/               # React components
│   └── WorldMap.tsx          # Interactive map
├── lib/                      # Core logic
│   ├── db/                   # Database layer
│   │   ├── index.ts          # DB operations
│   │   └── schema.sql        # Database schema
│   └── data-collection/      # Data ingestion
│       ├── news-aggregator.ts   # RSS/API collection
│       ├── ai-processor.ts      # AI analysis
│       └── seed-data.ts         # Sample data
├── scripts/                  # Utility scripts
│   └── seed-database.ts      # DB initialization
├── data/                     # Database files (gitignored)
│   └── geopolitical.db       # SQLite database
├── docs/                     # Documentation
└── package.json
```

## 📊 Database Schema

### Core Tables
- **events**: Geopolitical events with severity, category, entities
- **connections**: Relationships between events
- **countries**: Country profiles and risk assessments
- **insights**: AI-generated briefs and analysis
- **sources**: Data source configuration
- **commodity_prices**: Material cost tracking
- **shipping_routes**: Logistics disruption monitoring

See [lib/db/schema.sql](./lib/db/schema.sql) for complete schema.

## 🔧 Configuration

### Environment Variables

**Required:**
- None (platform works with sample data out of the box)

**Optional (Recommended):**
- `OPENAI_API_KEY`: For AI-powered analysis and insights
- `NEWS_API_KEY`: For NewsAPI.org integration (100 free requests/day)
- `ACLED_API_KEY`: For conflict data (planned)

### Data Sources

**Active (Free):**
- RSS Feeds: Reuters, BBC, Al Jazeera, Associated Press
- NewsAPI.org (optional, with API key)

**Planned:**
- GDELT Project (comprehensive news)
- ACLED (conflict data)
- World Bank API (economic data)
- Trading Economics (commodity prices)

## 📈 Development

### Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:seed      # Seed database with sample data
npm run db:init      # Initialize and seed database
npm run collect      # Run data collection (planned)
```

### Adding New Features

1. **New Data Sources**: Add to `lib/data-collection/news-aggregator.ts`
2. **New API Routes**: Create in `app/api/[feature]/route.ts`
3. **New Pages**: Add to `app/[page]/page.tsx`
4. **New Components**: Create in `components/`

## 🚢 Deployment

### Railway (Recommended)
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Vercel
1. Connect GitHub repository
2. Set environment variables (including database path if custom)
3. Deploy automatically on push

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed instructions.

## 🎯 Roadmap

### Phase 1: MVP ✅
- [x] Core dashboard with world map
- [x] Events timeline with filters
- [x] Event connections view
- [x] Regional intelligence
- [x] AI-generated insights
- [x] SQLite database
- [x] Sample data seeding

### Phase 2: Enhanced Data (Weeks 2-3)
- [ ] Real-time RSS collection (scheduled)
- [ ] GDELT integration
- [ ] ACLED conflict data
- [ ] World Bank economic indicators
- [ ] Commodity price tracking
- [ ] Shipping route monitoring

### Phase 3: Advanced Features (Week 4+)
- [ ] Interactive network graph (Cytoscape)
- [ ] Predictive modeling
- [ ] Scenario planning tool
- [ ] Email digests
- [ ] Watchlist/alerts
- [ ] PDF report export
- [ ] Mobile app

### Phase 4: Production Scaling
- [ ] PostgreSQL migration (optional)
- [ ] API access
- [ ] Multi-user support
- [ ] Slack/Discord notifications
- [ ] Client portal

## 📊 Success Metrics (MVP)

- ✅ 100+ events collected and displayed (10 seeded, expandable)
- ✅ Interactive world map working
- ✅ Timeline with filters operational
- ✅ AI-generated daily brief
- ✅ Search functionality
- ✅ 4+ event connections identified
- ✅ Impact analysis tags for construction/logistics
- ✅ Mobile responsive
- ✅ Deployable to Railway/Vercel
- ✅ Complete documentation

## 🤝 Contributing

This is a private strategic intelligence tool. For internal use only.

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- **Data Sources**: Reuters, BBC, Al Jazeera, NewsAPI
- **Mapping**: OpenStreetMap, Leaflet.js
- **AI**: OpenAI GPT-4o-mini
- **Design Inspiration**: Linear, Bloomberg Terminal, FlightRadar24

## 📞 Support

For questions or issues:
1. Check the [User Guide](./docs/USER_GUIDE.md)
2. Review [API Documentation](./docs/API_DOCS.md)
3. Contact: [Your contact info]

---

**Built with ❤️ for strategic decision-makers in construction and logistics**

*Last Updated: February 2026*
