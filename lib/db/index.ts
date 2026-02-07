import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';

const DB_PATH = join(process.cwd(), 'data', 'geopolitical.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    // Ensure data directory exists
    const { mkdirSync, existsSync } = require('fs');
    const dataDir = join(process.cwd(), 'data');
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }

    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    
    // Initialize schema
    initializeSchema(db);
  }
  return db;
}

function initializeSchema(database: Database.Database) {
  const schemaPath = join(process.cwd(), 'lib', 'db', 'schema.sql');
  try {
    const schema = readFileSync(schemaPath, 'utf-8');
    database.exec(schema);
  } catch (error) {
    console.error('Failed to initialize database schema:', error);
    throw error;
  }
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

// Event-related queries
export interface Event {
  id?: number;
  title: string;
  description: string;
  category: string;
  severity: number;
  region: string;
  country: string;
  country_code?: string;
  latitude?: number;
  longitude?: number;
  date: string;
  source_url?: string;
  source_name?: string;
  entities?: string; // JSON string
  sentiment_score?: number;
  impact_tags?: string; // JSON string
  created_at?: string;
  updated_at?: string;
}

export interface Connection {
  id?: number;
  event_a_id: number;
  event_b_id: number;
  relationship_type: string;
  confidence_score: number;
  explanation: string;
  created_at?: string;
}

export interface Country {
  id?: number;
  name: string;
  region: string;
  iso_code: string;
  iso_code_3?: string;
  latitude?: number;
  longitude?: number;
  stability_index?: number;
  risk_level?: string;
  active_conflicts_count?: number;
  economic_indicators?: string; // JSON string
  trade_relationships?: string; // JSON string
  updated_at?: string;
}

export interface Insight {
  id?: number;
  title: string;
  content: string;
  category: string;
  impact_level?: string;
  relevant_industries?: string; // JSON string
  related_events?: string; // JSON string
  date: string;
  created_at?: string;
}

export interface Source {
  id?: number;
  name: string;
  url?: string;
  type: string;
  category?: string;
  enabled?: number;
  last_scraped?: string;
  status?: string;
  error_message?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EconomicIndicator {
  id?: number;
  indicator_name: string;
  value: number;
  date: string;
  source?: string;
  interpretation?: string;
  score?: number;
  metadata?: string; // JSON
  created_at?: string;
}

export interface RecessionRiskHistory {
  id?: number;
  risk_score: number;
  prediction: string;
  indicators_snapshot: string; // JSON
  recommendation: string;
  date: string;
  created_at?: string;
}

// Event operations
export function createEvent(event: Event): number {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO events (
      title, description, category, severity, region, country, country_code,
      latitude, longitude, date, source_url, source_name, entities,
      sentiment_score, impact_tags
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    event.title,
    event.description,
    event.category,
    event.severity,
    event.region,
    event.country,
    event.country_code || null,
    event.latitude || null,
    event.longitude || null,
    event.date,
    event.source_url || null,
    event.source_name || null,
    event.entities || null,
    event.sentiment_score || null,
    event.impact_tags || null
  );
  
  return result.lastInsertRowid as number;
}

export function getEvents(filters?: {
  category?: string;
  region?: string;
  country?: string;
  severity?: number;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}): Event[] {
  const db = getDb();
  let query = 'SELECT * FROM events WHERE 1=1';
  const params: any[] = [];

  if (filters?.category) {
    query += ' AND category = ?';
    params.push(filters.category);
  }
  if (filters?.region) {
    query += ' AND region = ?';
    params.push(filters.region);
  }
  if (filters?.country) {
    query += ' AND country = ?';
    params.push(filters.country);
  }
  if (filters?.severity) {
    query += ' AND severity >= ?';
    params.push(filters.severity);
  }
  if (filters?.startDate) {
    query += ' AND date >= ?';
    params.push(filters.startDate);
  }
  if (filters?.endDate) {
    query += ' AND date <= ?';
    params.push(filters.endDate);
  }

  query += ' ORDER BY date DESC, severity DESC';

  if (filters?.limit) {
    query += ' LIMIT ?';
    params.push(filters.limit);
  }
  if (filters?.offset) {
    query += ' OFFSET ?';
    params.push(filters.offset);
  }

  const stmt = db.prepare(query);
  return stmt.all(...params) as Event[];
}

export function getEventById(id: number): Event | undefined {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM events WHERE id = ?');
  return stmt.get(id) as Event | undefined;
}

export function searchEvents(searchTerm: string, limit: number = 50): Event[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM events 
    WHERE title LIKE ? OR description LIKE ? OR country LIKE ?
    ORDER BY date DESC, severity DESC
    LIMIT ?
  `);
  const term = `%${searchTerm}%`;
  return stmt.all(term, term, term, limit) as Event[];
}

// Connection operations
export function createConnection(connection: Connection): number {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO connections (
      event_a_id, event_b_id, relationship_type, confidence_score, explanation
    ) VALUES (?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    connection.event_a_id,
    connection.event_b_id,
    connection.relationship_type,
    connection.confidence_score,
    connection.explanation
  );
  
  return result.lastInsertRowid as number;
}

export function getConnectionsForEvent(eventId: number): Connection[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM connections 
    WHERE event_a_id = ? OR event_b_id = ?
    ORDER BY confidence_score DESC
  `);
  return stmt.all(eventId, eventId) as Connection[];
}

export function getAllConnections(): Connection[] {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM connections ORDER BY confidence_score DESC');
  return stmt.all() as Connection[];
}

// Country operations
export function upsertCountry(country: Country): number {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO countries (
      name, region, iso_code, iso_code_3, latitude, longitude,
      stability_index, risk_level, active_conflicts_count,
      economic_indicators, trade_relationships
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(iso_code) DO UPDATE SET
      name = excluded.name,
      region = excluded.region,
      latitude = excluded.latitude,
      longitude = excluded.longitude,
      stability_index = excluded.stability_index,
      risk_level = excluded.risk_level,
      active_conflicts_count = excluded.active_conflicts_count,
      economic_indicators = excluded.economic_indicators,
      trade_relationships = excluded.trade_relationships,
      updated_at = datetime('now')
  `);
  
  const result = stmt.run(
    country.name,
    country.region,
    country.iso_code,
    country.iso_code_3 || null,
    country.latitude || null,
    country.longitude || null,
    country.stability_index || null,
    country.risk_level || null,
    country.active_conflicts_count || 0,
    country.economic_indicators || null,
    country.trade_relationships || null
  );
  
  return result.lastInsertRowid as number;
}

export function getCountries(): Country[] {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM countries ORDER BY name');
  return stmt.all() as Country[];
}

export function getCountryByCode(isoCode: string): Country | undefined {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM countries WHERE iso_code = ?');
  return stmt.get(isoCode) as Country | undefined;
}

// Insight operations
export function createInsight(insight: Insight): number {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO insights (
      title, content, category, impact_level, relevant_industries,
      related_events, date
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    insight.title,
    insight.content,
    insight.category,
    insight.impact_level || null,
    insight.relevant_industries || null,
    insight.related_events || null,
    insight.date
  );
  
  return result.lastInsertRowid as number;
}

export function getInsights(category?: string, limit: number = 20): Insight[] {
  const db = getDb();
  let query = 'SELECT * FROM insights';
  const params: any[] = [];

  if (category) {
    query += ' WHERE category = ?';
    params.push(category);
  }

  query += ' ORDER BY date DESC LIMIT ?';
  params.push(limit);

  const stmt = db.prepare(query);
  return stmt.all(...params) as Insight[];
}

export function getLatestDailyBrief(): Insight | undefined {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM insights 
    WHERE category = 'daily_brief' 
    ORDER BY date DESC 
    LIMIT 1
  `);
  return stmt.get() as Insight | undefined;
}

// Source operations
export function upsertSource(source: Source): number {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO sources (name, url, type, category, enabled, status)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(name) DO UPDATE SET
      url = excluded.url,
      type = excluded.type,
      category = excluded.category,
      enabled = excluded.enabled,
      status = excluded.status,
      updated_at = datetime('now')
  `);
  
  const result = stmt.run(
    source.name,
    source.url || null,
    source.type,
    source.category || null,
    source.enabled !== undefined ? source.enabled : 1,
    source.status || 'active'
  );
  
  return result.lastInsertRowid as number;
}

export function updateSourceStatus(name: string, status: string, errorMessage?: string) {
  const db = getDb();
  const stmt = db.prepare(`
    UPDATE sources 
    SET status = ?, 
        error_message = ?,
        last_scraped = datetime('now'),
        updated_at = datetime('now')
    WHERE name = ?
  `);
  stmt.run(status, errorMessage || null, name);
}

export function getSources(type?: string): Source[] {
  const db = getDb();
  let query = 'SELECT * FROM sources';
  const params: any[] = [];

  if (type) {
    query += ' WHERE type = ?';
    params.push(type);
  }

  query += ' ORDER BY name';

  const stmt = db.prepare(query);
  return stmt.all(...params) as Source[];
}

// Statistics
export function getStatistics() {
  const db = getDb();
  
  const totalEvents = db.prepare('SELECT COUNT(*) as count FROM events').get() as { count: number };
  const totalConnections = db.prepare('SELECT COUNT(*) as count FROM connections').get() as { count: number };
  const totalCountries = db.prepare('SELECT COUNT(*) as count FROM countries').get() as { count: number };
  const criticalEvents = db.prepare('SELECT COUNT(*) as count FROM events WHERE severity >= 8').get() as { count: number };
  
  const eventsByCategory = db.prepare(`
    SELECT category, COUNT(*) as count 
    FROM events 
    GROUP BY category 
    ORDER BY count DESC
  `).all() as { category: string; count: number }[];
  
  const eventsByRegion = db.prepare(`
    SELECT region, COUNT(*) as count 
    FROM events 
    GROUP BY region 
    ORDER BY count DESC
  `).all() as { region: string; count: number }[];
  
  return {
    totalEvents: totalEvents.count,
    totalConnections: totalConnections.count,
    totalCountries: totalCountries.count,
    criticalEvents: criticalEvents.count,
    eventsByCategory,
    eventsByRegion
  };
}

// Economic Indicators operations
export function upsertEconomicIndicator(indicator: EconomicIndicator): number {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO economic_indicators (
      indicator_name, value, date, source, interpretation, score, metadata
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(indicator_name, date) DO UPDATE SET
      value = excluded.value,
      source = excluded.source,
      interpretation = excluded.interpretation,
      score = excluded.score,
      metadata = excluded.metadata,
      created_at = datetime('now')
  `);
  
  const result = stmt.run(
    indicator.indicator_name,
    indicator.value,
    indicator.date,
    indicator.source || null,
    indicator.interpretation || null,
    indicator.score || null,
    indicator.metadata || null
  );
  
  return result.lastInsertRowid as number;
}

export function getLatestEconomicIndicators(): EconomicIndicator[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT ei1.* 
    FROM economic_indicators ei1
    INNER JOIN (
      SELECT indicator_name, MAX(date) as max_date
      FROM economic_indicators
      GROUP BY indicator_name
    ) ei2 ON ei1.indicator_name = ei2.indicator_name AND ei1.date = ei2.max_date
    ORDER BY ei1.indicator_name
  `);
  return stmt.all() as EconomicIndicator[];
}

export function getEconomicIndicatorHistory(indicatorName: string, limit: number = 100): EconomicIndicator[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM economic_indicators
    WHERE indicator_name = ?
    ORDER BY date DESC
    LIMIT ?
  `);
  return stmt.all(indicatorName, limit) as EconomicIndicator[];
}

export function saveRecessionRiskHistory(history: RecessionRiskHistory): number {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO recession_risk_history (
      risk_score, prediction, indicators_snapshot, recommendation, date
    ) VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(date) DO UPDATE SET
      risk_score = excluded.risk_score,
      prediction = excluded.prediction,
      indicators_snapshot = excluded.indicators_snapshot,
      recommendation = excluded.recommendation,
      created_at = datetime('now')
  `);
  
  const result = stmt.run(
    history.risk_score,
    history.prediction,
    history.indicators_snapshot,
    history.recommendation,
    history.date
  );
  
  return result.lastInsertRowid as number;
}

export function getRecessionRiskHistory(limit: number = 365): RecessionRiskHistory[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM recession_risk_history
    ORDER BY date DESC
    LIMIT ?
  `);
  return stmt.all(limit) as RecessionRiskHistory[];
}

export function getLatestRecessionRisk(): RecessionRiskHistory | undefined {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM recession_risk_history
    ORDER BY date DESC
    LIMIT 1
  `);
  return stmt.get() as RecessionRiskHistory | undefined;
}
