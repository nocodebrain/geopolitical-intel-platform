import Parser from 'rss-parser';
import axios from 'axios';
import { createEvent, updateSourceStatus, type Event } from '../db';
import { extractEntities, categorizeEvent, calculateSeverity, analyzeSentiment } from './ai-processor';

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'media'],
      ['content:encoded', 'contentEncoded']
    ]
  }
});

// RSS Feed sources
const RSS_FEEDS = [
  {
    name: 'Reuters World News',
    url: 'https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best',
    category: 'news',
    region: 'Global'
  },
  {
    name: 'BBC World News',
    url: 'http://feeds.bbci.co.uk/news/world/rss.xml',
    category: 'news',
    region: 'Global'
  },
  {
    name: 'Al Jazeera',
    url: 'https://www.aljazeera.com/xml/rss/all.xml',
    category: 'news',
    region: 'Global'
  },
  {
    name: 'Associated Press',
    url: 'https://www.ap.org/rss/news',
    category: 'news',
    region: 'Global'
  },
  {
    name: 'Reuters Business',
    url: 'https://www.reutersagency.com/feed/?best-topics=business-finance&post_type=best',
    category: 'news',
    region: 'Global'
  }
];

// Keywords for filtering relevant events
const RELEVANT_KEYWORDS = [
  // Conflicts & Security
  'conflict', 'war', 'attack', 'military', 'defense', 'security', 'terrorism', 'sanctions',
  'tension', 'dispute', 'escalation', 'crisis', 'invasion', 'bombing', 'missile',
  
  // Trade & Economics
  'trade', 'tariff', 'export', 'import', 'supply chain', 'shipping', 'logistics',
  'procurement', 'commodity', 'oil', 'steel', 'copper', 'aluminum', 'construction',
  'infrastructure', 'port', 'disruption', 'shortage', 'price', 'cost',
  
  // Politics & Governance
  'election', 'government', 'policy', 'regulation', 'law', 'treaty', 'agreement',
  'diplomatic', 'summit', 'negotiation', 'protest', 'coup',
  
  // Climate & Disasters
  'climate', 'disaster', 'earthquake', 'flood', 'drought', 'storm', 'hurricane',
  'typhoon', 'wildfire', 'extreme weather',
  
  // Technology
  'technology', 'semiconductor', 'cyber', 'digital', 'ai', 'artificial intelligence'
];

function isRelevant(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase();
  return RELEVANT_KEYWORDS.some(keyword => text.includes(keyword.toLowerCase()));
}

export async function collectNewsFromRSS(): Promise<number> {
  let collectedCount = 0;
  
  console.log('Starting RSS news collection...');
  
  for (const feed of RSS_FEEDS) {
    try {
      console.log(`Fetching from ${feed.name}...`);
      const feedData = await parser.parseURL(feed.url);
      
      for (const item of feedData.items.slice(0, 20)) { // Limit to 20 items per feed
        if (!item.title || !item.link) continue;
        
        const description = (item as any).contentSnippet || (item as any).content || (item as any).description || '';
        
        // Filter for relevance
        if (!isRelevant(item.title, description)) {
          continue;
        }
        
        try {
          // Extract and process event data
          const eventDate = (item as any).pubDate ? new Date((item as any).pubDate).toISOString() : new Date().toISOString();
          
          // Use AI to categorize and extract entities
          const category = await categorizeEvent(item.title, description);
          const severity = await calculateSeverity(item.title, description, category);
          const entities = await extractEntities(item.title, description);
          const sentiment = await analyzeSentiment(item.title, description);
          
          // Determine region and country from entities
          const { region, country, countryCode, latitude, longitude } = extractLocationFromEntities(entities);
          
          // Determine impact tags
          const impactTags = determineImpactTags(item.title, description, category);
          
          const event: Event = {
            title: item.title.substring(0, 500),
            description: description.substring(0, 2000),
            category,
            severity,
            region,
            country: country || 'Unknown',
            country_code: countryCode || undefined,
            latitude: latitude || undefined,
            longitude: longitude || undefined,
            date: eventDate,
            source_url: item.link,
            source_name: feed.name,
            entities: JSON.stringify(entities),
            sentiment_score: sentiment,
            impact_tags: JSON.stringify(impactTags)
          };
          
          createEvent(event);
          collectedCount++;
          
        } catch (error) {
          console.error(`Error processing item from ${feed.name}:`, error);
        }
      }
      
      updateSourceStatus(feed.name, 'active');
      
    } catch (error) {
      console.error(`Error fetching ${feed.name}:`, error);
      updateSourceStatus(feed.name, 'error', (error as Error).message);
    }
    
    // Be respectful - wait between feeds
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(`Collected ${collectedCount} relevant events from RSS feeds`);
  return collectedCount;
}

// NewsAPI.org integration (free tier: 100 requests/day)
export async function collectNewsFromAPI(): Promise<number> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    console.log('NEWS_API_KEY not set, skipping NewsAPI collection');
    return 0;
  }
  
  let collectedCount = 0;
  
  const queries = [
    'trade war',
    'supply chain disruption',
    'shipping route',
    'conflict',
    'sanctions',
    'commodity prices',
    'construction materials'
  ];
  
  for (const query of queries) {
    try {
      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: query,
          sortBy: 'publishedAt',
          language: 'en',
          pageSize: 10,
          apiKey
        }
      });
      
      for (const article of response.data.articles) {
        if (!article.title || !article.url) continue;
        
        const description = (article as any).description || (article as any).content || '';
        const eventDate = (article as any).publishedAt || new Date().toISOString();
        
        try {
          const category = await categorizeEvent(article.title, description);
          const severity = await calculateSeverity(article.title, description, category);
          const entities = await extractEntities(article.title, description);
          const sentiment = await analyzeSentiment(article.title, description);
          
          const { region, country, countryCode, latitude, longitude } = extractLocationFromEntities(entities);
          const impactTags = determineImpactTags(article.title, description, category);
          
          const event: Event = {
            title: article.title.substring(0, 500),
            description: description.substring(0, 2000),
            category,
            severity,
            region,
            country: country || 'Unknown',
            country_code: countryCode || undefined,
            latitude: latitude || undefined,
            longitude: longitude || undefined,
            date: eventDate,
            source_url: (article as any).url,
            source_name: (article as any).source?.name || 'NewsAPI',
            entities: JSON.stringify(entities),
            sentiment_score: sentiment,
            impact_tags: JSON.stringify(impactTags)
          };
          
          createEvent(event);
          collectedCount++;
          
        } catch (error) {
          console.error('Error processing NewsAPI article:', error);
        }
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`Error fetching NewsAPI for query "${query}":`, error);
    }
  }
  
  console.log(`Collected ${collectedCount} events from NewsAPI`);
  return collectedCount;
}

// Extract location information from entities
function extractLocationFromEntities(entities: any): {
  region: string;
  country: string | null;
  countryCode: string | null;
  latitude: number | null;
  longitude: number | null;
} {
  const countries = entities.countries || [];
  
  if (countries.length === 0) {
    return {
      region: 'Global',
      country: null,
      countryCode: null,
      latitude: null,
      longitude: null
    };
  }
  
  // Use first country mentioned
  const country = countries[0];
  const region = getRegionForCountry(country);
  const countryCode = getCountryCode(country);
  const coords = getCountryCoordinates(country);
  
  return {
    region,
    country,
    countryCode,
    latitude: coords?.latitude || null,
    longitude: coords?.longitude || null
  };
}

// Determine impact tags based on content
function determineImpactTags(title: string, description: string, category: string): string[] {
  const text = `${title} ${description}`.toLowerCase();
  const tags: string[] = [];
  
  if (text.includes('construction') || text.includes('infrastructure') || text.includes('building')) {
    tags.push('construction');
  }
  if (text.includes('shipping') || text.includes('logistics') || text.includes('transport') || text.includes('freight')) {
    tags.push('logistics');
  }
  if (text.includes('procurement') || text.includes('supply') || text.includes('sourcing')) {
    tags.push('procurement');
  }
  if (text.includes('supply chain') || text.includes('supply-chain') || text.includes('materials')) {
    tags.push('supply-chain');
  }
  if (text.includes('steel') || text.includes('copper') || text.includes('aluminum') || text.includes('commodity')) {
    tags.push('materials');
  }
  if (text.includes('port') || text.includes('shipping route')) {
    tags.push('shipping');
  }
  if (text.includes('price') || text.includes('cost') || text.includes('expensive')) {
    tags.push('pricing');
  }
  if (text.includes('delay') || text.includes('disruption') || text.includes('shortage')) {
    tags.push('disruption');
  }
  
  return tags.length > 0 ? tags : ['general'];
}

// Simple region mapping (will be enhanced with real data)
function getRegionForCountry(country: string): string {
  const regionMap: Record<string, string> = {
    // Asia-Pacific
    'China': 'Asia-Pacific',
    'Japan': 'Asia-Pacific',
    'India': 'Asia-Pacific',
    'Australia': 'Asia-Pacific',
    'South Korea': 'Asia-Pacific',
    'Indonesia': 'Asia-Pacific',
    'Thailand': 'Asia-Pacific',
    'Vietnam': 'Asia-Pacific',
    'Philippines': 'Asia-Pacific',
    'Singapore': 'Asia-Pacific',
    'Malaysia': 'Asia-Pacific',
    'Taiwan': 'Asia-Pacific',
    
    // Middle East
    'Israel': 'Middle East',
    'Iran': 'Middle East',
    'Saudi Arabia': 'Middle East',
    'UAE': 'Middle East',
    'Turkey': 'Middle East',
    'Iraq': 'Middle East',
    'Syria': 'Middle East',
    'Yemen': 'Middle East',
    'Jordan': 'Middle East',
    'Lebanon': 'Middle East',
    
    // Europe
    'United Kingdom': 'Europe',
    'France': 'Europe',
    'Germany': 'Europe',
    'Italy': 'Europe',
    'Spain': 'Europe',
    'Russia': 'Europe',
    'Ukraine': 'Europe',
    'Poland': 'Europe',
    'Netherlands': 'Europe',
    
    // Americas
    'United States': 'Americas',
    'Canada': 'Americas',
    'Mexico': 'Americas',
    'Brazil': 'Americas',
    'Argentina': 'Americas',
    'Chile': 'Americas',
    'Colombia': 'Americas',
    
    // Africa
    'Egypt': 'Africa',
    'South Africa': 'Africa',
    'Nigeria': 'Africa',
    'Kenya': 'Africa',
    'Ethiopia': 'Africa',
    'Morocco': 'Africa'
  };
  
  return regionMap[country] || 'Global';
}

// Simple country code mapping (subset)
function getCountryCode(country: string): string | null {
  const codeMap: Record<string, string> = {
    'China': 'CN', 'United States': 'US', 'India': 'IN', 'Japan': 'JP',
    'Germany': 'DE', 'United Kingdom': 'GB', 'France': 'FR', 'Italy': 'IT',
    'Brazil': 'BR', 'Canada': 'CA', 'Russia': 'RU', 'Australia': 'AU',
    'South Korea': 'KR', 'Spain': 'ES', 'Mexico': 'MX', 'Indonesia': 'ID',
    'Turkey': 'TR', 'Saudi Arabia': 'SA', 'Iran': 'IR', 'Israel': 'IL',
    'Egypt': 'EG', 'South Africa': 'ZA', 'Ukraine': 'UA', 'Taiwan': 'TW'
  };
  
  return codeMap[country] || null;
}

// Simple coordinates mapping (capitals/major cities)
function getCountryCoordinates(country: string): { latitude: number; longitude: number } | null {
  const coordMap: Record<string, { latitude: number; longitude: number }> = {
    'China': { latitude: 39.9042, longitude: 116.4074 },
    'United States': { latitude: 38.9072, longitude: -77.0369 },
    'India': { latitude: 28.6139, longitude: 77.2090 },
    'Japan': { latitude: 35.6762, longitude: 139.6503 },
    'Germany': { latitude: 52.5200, longitude: 13.4050 },
    'United Kingdom': { latitude: 51.5074, longitude: -0.1278 },
    'France': { latitude: 48.8566, longitude: 2.3522 },
    'Russia': { latitude: 55.7558, longitude: 37.6173 },
    'Australia': { latitude: -33.8688, longitude: 151.2093 },
    'Brazil': { latitude: -15.8267, longitude: -47.9218 }
  };
  
  return coordMap[country] || null;
}
