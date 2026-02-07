-- Geopolitical Intelligence Platform Database Schema

-- Events table: Stores all geopolitical events
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- Conflict, Trade, Politics, Economy, Climate, Tech
  severity INTEGER NOT NULL CHECK (severity >= 1 AND severity <= 10), -- 1-10 scale
  region TEXT NOT NULL, -- Asia-Pacific, Middle East, Europe, Americas, Africa
  country TEXT NOT NULL,
  country_code TEXT, -- ISO 3166-1 alpha-2
  latitude REAL,
  longitude REAL,
  date TEXT NOT NULL, -- ISO 8601 format
  source_url TEXT,
  source_name TEXT,
  entities TEXT, -- JSON: {countries: [], companies: [], people: [], commodities: []}
  sentiment_score REAL, -- -1 to 1 scale
  impact_tags TEXT, -- JSON: [construction, logistics, procurement, supply-chain]
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Connections table: Links related events
CREATE TABLE IF NOT EXISTS connections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_a_id INTEGER NOT NULL,
  event_b_id INTEGER NOT NULL,
  relationship_type TEXT NOT NULL, -- causes, relates_to, follows, contradicts
  confidence_score REAL CHECK (confidence_score >= 0 AND confidence_score <= 1), -- 0-1
  explanation TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (event_a_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (event_b_id) REFERENCES events(id) ON DELETE CASCADE,
  UNIQUE(event_a_id, event_b_id)
);

-- Countries table: Country profiles and risk assessments
CREATE TABLE IF NOT EXISTS countries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  region TEXT NOT NULL,
  iso_code TEXT NOT NULL UNIQUE, -- ISO 3166-1 alpha-2
  iso_code_3 TEXT, -- ISO 3166-1 alpha-3
  latitude REAL,
  longitude REAL,
  stability_index REAL, -- 0-100 scale
  risk_level TEXT, -- low, moderate, high, critical
  active_conflicts_count INTEGER DEFAULT 0,
  economic_indicators TEXT, -- JSON: {gdp, trade_balance, etc}
  trade_relationships TEXT, -- JSON: {main_partners: [], exports: [], imports: []}
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Insights table: AI-generated insights and briefs
CREATE TABLE IF NOT EXISTS insights (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL, -- daily_brief, weekly_report, prediction, analysis
  impact_level TEXT, -- low, medium, high, critical
  relevant_industries TEXT, -- JSON: [construction, logistics, procurement]
  related_events TEXT, -- JSON: [event_ids]
  date TEXT NOT NULL, -- ISO 8601 format
  created_at TEXT DEFAULT (datetime('now'))
);

-- Watchlist table: User-defined monitoring topics
CREATE TABLE IF NOT EXISTS watchlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL, -- region, country, keyword, category
  value TEXT NOT NULL, -- e.g., "Asia-Pacific", "China", "steel prices"
  notification_enabled INTEGER DEFAULT 1, -- 0 or 1 (boolean)
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, type, value)
);

-- Sources table: Data source configuration and status
CREATE TABLE IF NOT EXISTS sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  url TEXT,
  type TEXT NOT NULL, -- rss, api, scraper
  category TEXT, -- news, conflict, economic, trade
  enabled INTEGER DEFAULT 1, -- 0 or 1
  last_scraped TEXT,
  status TEXT, -- active, error, disabled
  error_message TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Commodity prices table: Track material costs
CREATE TABLE IF NOT EXISTS commodity_prices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  commodity TEXT NOT NULL, -- oil, steel, copper, aluminum, etc.
  price REAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  unit TEXT, -- barrel, ton, pound
  date TEXT NOT NULL,
  source TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(commodity, date)
);

-- Shipping routes table: Track disruptions
CREATE TABLE IF NOT EXISTS shipping_routes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  start_port TEXT,
  end_port TEXT,
  status TEXT NOT NULL, -- normal, delayed, disrupted, blocked
  disruption_reason TEXT,
  delay_days INTEGER,
  last_updated TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date DESC);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_region ON events(region);
CREATE INDEX IF NOT EXISTS idx_events_country ON events(country);
CREATE INDEX IF NOT EXISTS idx_events_severity ON events(severity DESC);
CREATE INDEX IF NOT EXISTS idx_connections_event_a ON connections(event_a_id);
CREATE INDEX IF NOT EXISTS idx_connections_event_b ON connections(event_b_id);
CREATE INDEX IF NOT EXISTS idx_countries_risk_level ON countries(risk_level);
CREATE INDEX IF NOT EXISTS idx_insights_date ON insights(date DESC);
CREATE INDEX IF NOT EXISTS idx_commodity_prices_commodity ON commodity_prices(commodity);
CREATE INDEX IF NOT EXISTS idx_commodity_prices_date ON commodity_prices(date DESC);
