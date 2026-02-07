#!/usr/bin/env tsx
/**
 * Live Data Collection Script
 * Collects real-time geopolitical events from multiple sources
 * Run: npx tsx scripts/collect-live-data.ts
 * Or schedule with cron: 0 * * * * (every hour)
 */

import { getEvents, createEvent, createConnection, updateSource } from '../lib/db';
import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    item: ['media:content', 'media:thumbnail']
  }
});

// Free News Sources (no API key needed)
const RSS_SOURCES = [
  {
    id: 'reuters-world',
    name: 'Reuters World',
    url: 'https://www.reuters.com/rssFeed/worldNews',
    category: 'general'
  },
  {
    id: 'bbc-world',
    name: 'BBC World',
    url: 'http://feeds.bbci.co.uk/news/world/rss.xml',
    category: 'general'
  },
  {
    id: 'aljazeera',
    name: 'Al Jazeera',
    url: 'https://www.aljazeera.com/xml/rss/all.xml',
    category: 'general'
  },
  {
    id: 'guardian-world',
    name: 'The Guardian World',
    url: 'https://www.theguardian.com/world/rss',
    category: 'general'
  },
  {
    id: 'nyt-world',
    name: 'New York Times World',
    url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
    category: 'general'
  }
];

// Keywords for geopolitical event detection
const KEYWORDS = {
  conflict: ['war', 'conflict', 'military', 'attack', 'strike', 'troops', 'battle', 'invasion', 'missile'],
  trade: ['trade', 'tariff', 'sanctions', 'export', 'import', 'embargo', 'wto', 'trade war'],
  politics: ['election', 'coup', 'government', 'president', 'parliament', 'democracy', 'protest', 'riots'],
  economy: ['gdp', 'inflation', 'recession', 'debt', 'currency', 'market crash', 'economic crisis'],
  climate: ['drought', 'flood', 'hurricane', 'wildfire', 'climate', 'disaster', 'famine'],
  supply_chain: ['supply chain', 'shipping', 'port', 'logistics', 'disruption', 'shortage', 'bottleneck'],
  energy: ['oil', 'gas', 'energy', 'pipeline', 'opec', 'petroleum', 'fuel'],
  tech: ['cyber', 'hack', 'technology', 'semiconductor', 'chip war', 'ai', 'surveillance']
};

// Country detection (simple version - would use NLP in production)
const COUNTRIES = [
  'United States', 'China', 'Russia', 'Ukraine', 'Israel', 'Gaza', 'Iran',
  'India', 'Pakistan', 'North Korea', 'South Korea', 'Japan', 'Taiwan',
  'United Kingdom', 'France', 'Germany', 'Italy', 'Spain',
  'Australia', 'New Zealand', 'Canada', 'Mexico', 'Brazil',
  'Saudi Arabia', 'UAE', 'Egypt', 'Turkey', 'Syria',
  'Afghanistan', 'Iraq', 'Yemen', 'Lebanon', 'Venezuela'
];

// Severity scoring
function calculateSeverity(title: string, description: string): 'low' | 'medium' | 'high' | 'critical' {
  const text = (title + ' ' + description).toLowerCase();
  
  // Critical: war, invasion, nuclear, major disasters
  if (text.match(/war|invasion|nuclear|major attack|coup|assassination/i)) {
    return 'critical';
  }
  
  // High: conflict, sanctions, major disruptions
  if (text.match(/conflict|sanctions|strike|disruption|crisis|emergency/i)) {
    return 'high';
  }
  
  // Medium: political changes, economic shifts
  if (text.match(/election|trade|tariff|protest|policy/i)) {
    return 'medium';
  }
  
  return 'low';
}

// Categorize event
function categorizeEvent(title: string, description: string): string {
  const text = (title + ' ' + description).toLowerCase();
  
  for (const [category, keywords] of Object.entries(KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }
  
  return 'general';
}

// Extract countries mentioned
function extractCountries(text: string): string[] {
  const mentioned: string[] = [];
  const lowerText = text.toLowerCase();
  
  for (const country of COUNTRIES) {
    if (lowerText.includes(country.toLowerCase())) {
      mentioned.push(country);
    }
  }
  
  return mentioned;
}

// Determine region from countries
function determineRegion(countries: string[]): string {
  if (countries.length === 0) return 'Global';
  
  const regionMap: Record<string, string> = {
    'China': 'Asia-Pacific',
    'Japan': 'Asia-Pacific',
    'India': 'Asia-Pacific',
    'Australia': 'Asia-Pacific',
    'Russia': 'Europe',
    'Ukraine': 'Europe',
    'United Kingdom': 'Europe',
    'France': 'Europe',
    'Germany': 'Europe',
    'United States': 'Americas',
    'Canada': 'Americas',
    'Mexico': 'Americas',
    'Brazil': 'Americas',
    'Israel': 'Middle East',
    'Gaza': 'Middle East',
    'Iran': 'Middle East',
    'Saudi Arabia': 'Middle East',
    'Egypt': 'Africa',
    'South Africa': 'Africa'
  };
  
  for (const country of countries) {
    if (regionMap[country]) {
      return regionMap[country];
    }
  }
  
  return 'Global';
}

// Check if event is construction/logistics relevant
function isRelevantToBusiness(title: string, description: string): boolean {
  const text = (title + ' ' + description).toLowerCase();
  
  // Keywords that indicate relevance to construction/logistics/procurement
  const relevantKeywords = [
    'supply chain', 'shipping', 'port', 'logistics', 'trade', 'tariff',
    'material', 'steel', 'copper', 'oil', 'gas', 'energy', 'price',
    'shortage', 'disruption', 'sanctions', 'embargo', 'procurement'
  ];
  
  return relevantKeywords.some(keyword => text.includes(keyword));
}

// Collect from RSS feeds
async function collectFromRSS(): Promise<any[]> {
  const events: any[] = [];
  
  console.log('📰 Collecting from RSS feeds...');
  
  for (const source of RSS_SOURCES) {
    try {
      console.log(`  Fetching ${source.name}...`);
      const feed = await parser.parseURL(source.url);
      
      // Get recent items (last 24 hours)
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      for (const item of feed.items.slice(0, 10)) { // Limit to 10 per source
        const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
        
        // Skip old items
        if (pubDate < yesterday) continue;
        
        const title = item.title || '';
        const description = item.contentSnippet || item.content || '';
        const countries = extractCountries(title + ' ' + description);
        const category = categorizeEvent(title, description);
        const severity = calculateSeverity(title, description);
        const region = determineRegion(countries);
        const relevant = isRelevantToBusiness(title, description);
        
        // Only keep if somewhat geopolitically relevant
        if (category === 'general' && !relevant) continue;
        
        events.push({
          title: title.substring(0, 200),
          description: description.substring(0, 1000),
          category,
          severity,
          region,
          country: countries[0] || 'Global',
          date: pubDate.toISOString().split('T')[0],
          source: source.name,
          sourceUrl: item.link || source.url,
          tags: relevant ? 'construction,logistics,procurement' : ''
        });
      }
      
      // Update source last_scraped
      updateSource(source.id, { last_scraped: new Date().toISOString() });
      
      console.log(`  ✅ Found ${events.filter(e => e.source === source.name).length} events`);
      
    } catch (error) {
      console.error(`  ❌ Error fetching ${source.name}:`, error);
    }
  }
  
  return events;
}

// Save events to database (deduplicate by title)
async function saveEvents(events: any[]): Promise<void> {
  const existing = getEvents({ limit: 1000 });
  const existingTitles = new Set(existing.map((e: any) => e.title.toLowerCase()));
  
  let newCount = 0;
  
  for (const event of events) {
    // Skip duplicates
    if (existingTitles.has(event.title.toLowerCase())) {
      continue;
    }
    
    try {
      createEvent(event);
      newCount++;
    } catch (error) {
      console.error('Error saving event:', error);
    }
  }
  
  console.log(`\n✅ Saved ${newCount} new events (${events.length - newCount} duplicates skipped)`);
}

// Main execution
async function main() {
  console.log('🌍 Geopolitical Intelligence - Live Data Collection\n');
  console.log(`Started: ${new Date().toISOString()}\n`);
  
  try {
    // Collect from RSS feeds
    const events = await collectFromRSS();
    
    console.log(`\n📊 Total events collected: ${events.length}`);
    
    // Save to database
    await saveEvents(events);
    
    console.log('\n✅ Collection complete!');
    console.log(`\nFinished: ${new Date().toISOString()}`);
    
  } catch (error) {
    console.error('❌ Collection failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { main as collectLiveData };
