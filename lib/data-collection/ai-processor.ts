import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Cache to avoid redundant API calls
const cache = new Map<string, any>();

function getCacheKey(prefix: string, title: string, description: string): string {
  return `${prefix}:${title.substring(0, 100)}`;
}

export async function categorizeEvent(title: string, description: string): Promise<string> {
  const cacheKey = getCacheKey('category', title, description);
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  // Simple rule-based categorization (fallback if AI not available)
  const text = `${title} ${description}`.toLowerCase();
  
  let category = 'Politics';
  
  if (text.match(/war|conflict|attack|military|defense|terrorism|violence|bombing|missile/)) {
    category = 'Conflict';
  } else if (text.match(/trade|tariff|export|import|supply chain|shipping|logistics|commodity|price|cost/)) {
    category = 'Trade';
  } else if (text.match(/gdp|economy|economic|inflation|recession|market|finance|currency/)) {
    category = 'Economy';
  } else if (text.match(/climate|disaster|earthquake|flood|drought|weather|hurricane|typhoon|wildfire/)) {
    category = 'Climate';
  } else if (text.match(/technology|tech|cyber|digital|semiconductor|ai|artificial intelligence|software/)) {
    category = 'Tech';
  }
  
  cache.set(cacheKey, category);
  return category;
}

export async function calculateSeverity(title: string, description: string, category: string): Promise<number> {
  const cacheKey = getCacheKey('severity', title, description);
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  // Rule-based severity scoring (1-10 scale)
  const text = `${title} ${description}`.toLowerCase();
  let severity = 5; // Default medium severity
  
  // High severity indicators
  const highSeverityKeywords = [
    'war', 'crisis', 'attack', 'invasion', 'disaster', 'collapse', 
    'critical', 'emergency', 'catastrophe', 'shutdown', 'blockade'
  ];
  
  // Medium-high severity
  const mediumHighKeywords = [
    'conflict', 'disruption', 'sanctions', 'embargo', 'escalation',
    'shortage', 'warning', 'threat', 'tension'
  ];
  
  // Low severity
  const lowSeverityKeywords = [
    'meeting', 'discussion', 'plan', 'proposal', 'announcement',
    'agreement', 'cooperation'
  ];
  
  if (highSeverityKeywords.some(kw => text.includes(kw))) {
    severity = 8;
  } else if (mediumHighKeywords.some(kw => text.includes(kw))) {
    severity = 6;
  } else if (lowSeverityKeywords.some(kw => text.includes(kw))) {
    severity = 3;
  }
  
  // Adjust based on category
  if (category === 'Conflict') {
    severity = Math.min(10, severity + 2);
  } else if (category === 'Climate' && text.includes('disaster')) {
    severity = Math.min(10, severity + 2);
  }
  
  // Cap specific terms
  if (text.includes('nuclear')) severity = 10;
  if (text.includes('pandemic')) severity = 9;
  if (text.includes('world war')) severity = 10;
  
  cache.set(cacheKey, severity);
  return severity;
}

export async function extractEntities(title: string, description: string): Promise<any> {
  const cacheKey = getCacheKey('entities', title, description);
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  const text = `${title} ${description}`;
  
  // Extract countries
  const countries = extractCountries(text);
  
  // Extract companies
  const companies = extractCompanies(text);
  
  // Extract commodities
  const commodities = extractCommodities(text);
  
  // Extract people (simple pattern matching for now)
  const people = extractPeople(text);
  
  const entities = {
    countries,
    companies,
    people,
    commodities
  };
  
  cache.set(cacheKey, entities);
  return entities;
}

export async function analyzeSentiment(title: string, description: string): Promise<number> {
  const cacheKey = getCacheKey('sentiment', title, description);
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  // Simple rule-based sentiment (-1 to 1 scale)
  const text = `${title} ${description}`.toLowerCase();
  
  const negativeWords = [
    'crisis', 'conflict', 'war', 'attack', 'disaster', 'collapse',
    'failure', 'threat', 'disruption', 'decline', 'shortage', 'death'
  ];
  
  const positiveWords = [
    'agreement', 'cooperation', 'growth', 'success', 'improvement',
    'recovery', 'peace', 'stability', 'deal', 'partnership'
  ];
  
  let score = 0;
  
  for (const word of negativeWords) {
    if (text.includes(word)) score -= 0.15;
  }
  
  for (const word of positiveWords) {
    if (text.includes(word)) score += 0.15;
  }
  
  // Clamp between -1 and 1
  score = Math.max(-1, Math.min(1, score));
  
  cache.set(cacheKey, score);
  return score;
}

// Enhanced AI-powered analysis using OpenAI (optional, with fallback)
export async function analyzeEventWithAI(title: string, description: string): Promise<{
  category: string;
  severity: number;
  entities: any;
  sentiment: number;
  summary: string;
}> {
  if (!process.env.OPENAI_API_KEY) {
    // Fallback to rule-based methods
    const category = await categorizeEvent(title, description);
    const severity = await calculateSeverity(title, description, category);
    const entities = await extractEntities(title, description);
    const sentiment = await analyzeSentiment(title, description);
    
    return {
      category,
      severity,
      entities,
      sentiment,
      summary: description.substring(0, 200) + '...'
    };
  }
  
  try {
    const prompt = `Analyze this geopolitical event and provide structured output:

Title: ${title}
Description: ${description}

Provide:
1. Category (one of: Conflict, Trade, Politics, Economy, Climate, Tech)
2. Severity (1-10 scale, where 10 is most severe/impactful)
3. Entities (countries, companies, people, commodities mentioned)
4. Sentiment (-1 to 1, where -1 is very negative, 1 is very positive)
5. Brief summary (50 words max)

Format as JSON:
{
  "category": "...",
  "severity": X,
  "entities": {"countries": [], "companies": [], "people": [], "commodities": []},
  "sentiment": X.X,
  "summary": "..."
}`;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a geopolitical analyst. Provide concise, accurate analysis in JSON format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });
    
    const content = response.choices[0].message.content || '{}';
    const analysis = JSON.parse(content);
    
    return analysis;
    
  } catch (error) {
    console.error('AI analysis failed, using fallback:', error);
    
    // Fallback to rule-based
    const category = await categorizeEvent(title, description);
    const severity = await calculateSeverity(title, description, category);
    const entities = await extractEntities(title, description);
    const sentiment = await analyzeSentiment(title, description);
    
    return {
      category,
      severity,
      entities,
      sentiment,
      summary: description.substring(0, 200) + '...'
    };
  }
}

// Country extraction using regex patterns
function extractCountries(text: string): string[] {
  const countries = [
    'China', 'United States', 'USA', 'U.S.', 'India', 'Japan', 'Germany', 
    'United Kingdom', 'UK', 'France', 'Italy', 'Brazil', 'Canada', 'Russia',
    'Australia', 'South Korea', 'Spain', 'Mexico', 'Indonesia', 'Turkey',
    'Saudi Arabia', 'Iran', 'Israel', 'Egypt', 'South Africa', 'Ukraine',
    'Taiwan', 'Vietnam', 'Thailand', 'Philippines', 'Singapore', 'Malaysia',
    'Pakistan', 'Bangladesh', 'Nigeria', 'Kenya', 'Argentina', 'Chile',
    'Colombia', 'Peru', 'Venezuela', 'Poland', 'Netherlands', 'Belgium',
    'Sweden', 'Norway', 'Denmark', 'Finland', 'Ireland', 'New Zealand',
    'UAE', 'Qatar', 'Kuwait', 'Iraq', 'Syria', 'Lebanon', 'Jordan', 'Yemen'
  ];
  
  const found = new Set<string>();
  const lowerText = text.toLowerCase();
  
  for (const country of countries) {
    if (lowerText.includes(country.toLowerCase())) {
      // Normalize variations
      if (country === 'USA' || country === 'U.S.') {
        found.add('United States');
      } else if (country === 'UK') {
        found.add('United Kingdom');
      } else {
        found.add(country);
      }
    }
  }
  
  return Array.from(found);
}

// Company extraction
function extractCompanies(text: string): string[] {
  const companies = [
    'Apple', 'Microsoft', 'Google', 'Amazon', 'Tesla', 'Meta', 'Facebook',
    'Boeing', 'Airbus', 'Samsung', 'Toyota', 'Volkswagen', 'Shell', 'BP',
    'ExxonMobil', 'Chevron', 'Walmart', 'JPMorgan', 'Bank of America',
    'HSBC', 'Goldman Sachs', 'Morgan Stanley', 'Huawei', 'Alibaba', 'Tencent',
    'TSMC', 'Intel', 'NVIDIA', 'AMD', 'Qualcomm', 'Lockheed Martin',
    'Raytheon', 'Northrop Grumman', 'General Electric', 'Siemens', 'Sony'
  ];
  
  const found = new Set<string>();
  
  for (const company of companies) {
    const regex = new RegExp(`\\b${company}\\b`, 'i');
    if (regex.test(text)) {
      found.add(company);
    }
  }
  
  return Array.from(found);
}

// Commodity extraction
function extractCommodities(text: string): string[] {
  const commodities = [
    'oil', 'crude oil', 'natural gas', 'coal', 'steel', 'iron ore',
    'copper', 'aluminum', 'zinc', 'nickel', 'lithium', 'cobalt',
    'gold', 'silver', 'platinum', 'wheat', 'corn', 'soybeans',
    'cotton', 'sugar', 'coffee', 'cocoa', 'lumber', 'cement',
    'semiconductors', 'chips', 'rare earth', 'uranium'
  ];
  
  const found = new Set<string>();
  const lowerText = text.toLowerCase();
  
  for (const commodity of commodities) {
    if (lowerText.includes(commodity)) {
      found.add(commodity);
    }
  }
  
  return Array.from(found);
}

// Simple people extraction (looks for common titles)
function extractPeople(text: string): string[] {
  const found: string[] = [];
  
  // Pattern: Title + First + Last name
  const patterns = [
    /(?:President|Prime Minister|Minister|Secretary|Chancellor|King|Queen|Prince|CEO|Chairman)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/g
  ];
  
  for (const pattern of patterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        found.push(match[1]);
      }
    }
  }
  
  return found.slice(0, 5); // Limit to 5 people
}

// Generate daily brief using AI
export async function generateDailyBrief(events: any[]): Promise<string> {
  if (!process.env.OPENAI_API_KEY || events.length === 0) {
    return `No significant geopolitical events to report today.`;
  }
  
  try {
    // Select top events by severity
    const topEvents = events
      .sort((a, b) => b.severity - a.severity)
      .slice(0, 10)
      .map(e => `- ${e.title} (${e.category}, Severity: ${e.severity}/10)`);
    
    const prompt = `Generate a brief daily geopolitical intelligence summary (3-5 key insights, max 300 words) for a construction/logistics business executive based on these events:

${topEvents.join('\n')}

Focus on:
1. Supply chain impacts
2. Trade/tariff changes
3. Regional stability concerns
4. Construction material costs
5. Strategic opportunities

Keep it actionable and business-focused.`;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a strategic intelligence analyst for construction and logistics industries.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });
    
    return response.choices[0].message.content || 'Unable to generate brief.';
    
  } catch (error) {
    console.error('Failed to generate daily brief:', error);
    return `${events.length} significant events recorded today. Top concern: ${events[0]?.title || 'N/A'}`;
  }
}

// Detect event connections using AI
export async function detectEventConnections(events: any[]): Promise<Array<{
  eventAId: number;
  eventBId: number;
  relationshipType: string;
  confidence: number;
  explanation: string;
}>> {
  if (!process.env.OPENAI_API_KEY || events.length < 2) {
    return [];
  }
  
  const connections: Array<any> = [];
  
  // Only analyze recent high-severity events to save API calls
  const significantEvents = events
    .filter(e => e.severity >= 6)
    .slice(0, 20);
  
  // Simple rule-based connections (fallback)
  for (let i = 0; i < significantEvents.length; i++) {
    for (let j = i + 1; j < significantEvents.length; j++) {
      const eventA = significantEvents[i];
      const eventB = significantEvents[j];
      
      // Check for country overlap
      const entitiesA = JSON.parse(eventA.entities || '{}');
      const entitiesB = JSON.parse(eventB.entities || '{}');
      
      const countriesA = new Set(entitiesA.countries || []);
      const countriesB = new Set(entitiesB.countries || []);
      
      const commonCountries = Array.from(countriesA).filter(c => countriesB.has(c));
      
      if (commonCountries.length > 0) {
        connections.push({
          eventAId: eventA.id,
          eventBId: eventB.id,
          relationshipType: 'relates_to',
          confidence: 0.7,
          explanation: `Both events involve ${commonCountries.join(', ')}`
        });
      }
      
      // Check for category + region match
      if (eventA.category === eventB.category && eventA.region === eventB.region) {
        connections.push({
          eventAId: eventA.id,
          eventBId: eventB.id,
          relationshipType: 'relates_to',
          confidence: 0.6,
          explanation: `Both are ${eventA.category} events in ${eventA.region}`
        });
      }
    }
  }
  
  return connections.slice(0, 30); // Limit to avoid overwhelming the DB
}
