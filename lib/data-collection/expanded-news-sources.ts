import Parser from 'rss-parser';
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

// EXPANDED RSS FEEDS - 15+ premium sources
export const EXPANDED_RSS_FEEDS = [
  // Original sources
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
  
  // NEW PREMIUM SOURCES
  {
    name: 'Reuters Business',
    url: 'https://www.reutersagency.com/feed/?best-topics=business-finance&post_type=best',
    category: 'business',
    region: 'Global'
  },
  {
    name: 'Financial Times',
    url: 'https://www.ft.com/?format=rss',
    category: 'business',
    region: 'Global'
  },
  {
    name: 'CNBC World',
    url: 'https://www.cnbc.com/id/100727362/device/rss/rss.html',
    category: 'business',
    region: 'Global'
  },
  {
    name: 'The Economist',
    url: 'https://www.economist.com/international/rss.xml',
    category: 'analysis',
    region: 'Global'
  },
  {
    name: 'Politico',
    url: 'https://www.politico.com/rss/politics08.xml',
    category: 'politics',
    region: 'Global'
  },
  {
    name: 'Defense News',
    url: 'https://www.defensenews.com/arc/outboundfeeds/rss/',
    category: 'defense',
    region: 'Global'
  },
  {
    name: 'South China Morning Post',
    url: 'https://www.scmp.com/rss/91/feed',
    category: 'news',
    region: 'Asia-Pacific'
  },
  {
    name: 'Lloyd\'s List - Shipping',
    url: 'https://lloydslist.maritimeintelligence.informa.com/rss',
    category: 'shipping',
    region: 'Global'
  },
  {
    name: 'Mining.com',
    url: 'https://www.mining.com/feed/',
    category: 'commodities',
    region: 'Global'
  },
  {
    name: 'Construction Dive',
    url: 'https://www.constructiondive.com/feeds/news/',
    category: 'construction',
    region: 'Global'
  },
  {
    name: 'JOC - Supply Chain',
    url: 'https://www.joc.com/rss/all',
    category: 'supply-chain',
    region: 'Global'
  },
  {
    name: 'World Trade Organization',
    url: 'https://www.wto.org/english/news_e/news_rss_e.xml',
    category: 'trade',
    region: 'Global'
  },
  {
    name: 'IMF News',
    url: 'https://www.imf.org/en/News/rss',
    category: 'economic',
    region: 'Global'
  }
];

// Keywords for executive-level filtering
const EXECUTIVE_KEYWORDS = [
  // High-priority conflicts & security
  'conflict', 'war', 'attack', 'military', 'defense', 'security', 'terrorism', 'sanctions',
  'tension', 'dispute', 'escalation', 'crisis', 'invasion', 'bombing', 'missile', 'naval',
  
  // Trade & supply chain (critical for executives)
  'trade', 'tariff', 'export', 'import', 'supply chain', 'shipping', 'logistics',
  'procurement', 'commodity', 'steel', 'copper', 'oil', 'cement', 'aluminum',
  'construction', 'infrastructure', 'port', 'disruption', 'shortage', 'price surge',
  'freight rate', 'container', 'vessel', 'route', 'canal', 'strait',
  
  // Economic indicators
  'gdp', 'inflation', 'interest rate', 'currency', 'recession', 'growth', 'forecast',
  'investment', 'debt', 'bond', 'market crash', 'bubble',
  
  // Politics & governance
  'election', 'government', 'policy', 'regulation', 'law', 'treaty', 'agreement',
  'diplomatic', 'summit', 'negotiation', 'protest', 'coup', 'sanctions',
  
  // Climate & disasters (business impact)
  'climate', 'disaster', 'earthquake', 'flood', 'drought', 'storm', 'hurricane',
  'typhoon', 'wildfire', 'extreme weather', 'climate risk',
  
  // Technology & innovation
  'semiconductor', 'cyber attack', 'digital', 'ai', 'artificial intelligence',
  'technology ban', 'chip', 'rare earth', 'critical minerals'
];

export function isExecutiveRelevant(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase();
  return EXECUTIVE_KEYWORDS.some(keyword => text.includes(keyword.toLowerCase()));
}

export async function collectFromExpandedSources(): Promise<number> {
  let collectedCount = 0;
  
  console.log('🌍 Starting EXECUTIVE-GRADE data collection from 15+ sources...');
  
  for (const feed of EXPANDED_RSS_FEEDS) {
    try {
      console.log(`📡 Fetching from ${feed.name}...`);
      const feedData = await parser.parseURL(feed.url);
      
      for (const item of feedData.items.slice(0, 15)) {
        if (!item.title || !item.link) continue;
        
        const description = (item as any).contentSnippet || (item as any).content || (item as any).description || '';
        
        // Executive-level filtering
        if (!isExecutiveRelevant(item.title, description)) {
          continue;
        }
        
        try {
          const eventDate = (item as any).pubDate ? new Date((item as any).pubDate).toISOString() : new Date().toISOString();
          
          // AI processing
          const category = await categorizeEvent(item.title, description);
          const severity = await calculateSeverity(item.title, description, category);
          const entities = await extractEntities(item.title, description);
          const sentiment = await analyzeSentiment(item.title, description);
          
          const { region, country, countryCode, latitude, longitude } = extractLocationFromEntities(entities);
          const impactTags = determineExecutiveImpactTags(item.title, description, category);
          
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
          console.error(`❌ Error processing item from ${feed.name}:`, error);
        }
      }
      
      updateSourceStatus(feed.name, 'active');
      console.log(`✅ ${feed.name} - collected successfully`);
      
    } catch (error) {
      console.error(`❌ Error fetching ${feed.name}:`, error);
      updateSourceStatus(feed.name, 'error', (error as Error).message);
    }
    
    // Rate limiting - be respectful
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(`\n🎯 EXECUTIVE COLLECTION COMPLETE: ${collectedCount} high-value events collected\n`);
  return collectedCount;
}

// Executive-focused impact tags
function determineExecutiveImpactTags(title: string, description: string, category: string): string[] {
  const text = `${title} ${description}`.toLowerCase();
  const tags: string[] = [];
  
  // Business impact categories
  if (text.includes('construction') || text.includes('infrastructure') || text.includes('building')) {
    tags.push('construction');
  }
  if (text.includes('shipping') || text.includes('logistics') || text.includes('transport') || text.includes('freight')) {
    tags.push('logistics');
  }
  if (text.includes('procurement') || text.includes('supply') || text.includes('sourcing')) {
    tags.push('procurement');
  }
  if (text.includes('supply chain') || text.includes('supply-chain')) {
    tags.push('supply-chain-critical');
  }
  if (text.includes('steel') || text.includes('copper') || text.includes('aluminum') || text.includes('cement')) {
    tags.push('materials-pricing');
  }
  if (text.includes('port') || text.includes('canal') || text.includes('strait') || text.includes('route')) {
    tags.push('shipping-routes');
  }
  if (text.includes('price') || text.includes('cost') || text.includes('expensive') || text.includes('surge')) {
    tags.push('cost-impact');
  }
  if (text.includes('delay') || text.includes('disruption') || text.includes('shortage') || text.includes('blocked')) {
    tags.push('critical-disruption');
  }
  if (text.includes('opportunity') || text.includes('boom') || text.includes('growth') || text.includes('expansion')) {
    tags.push('opportunity');
  }
  if (text.includes('risk') || text.includes('threat') || text.includes('danger')) {
    tags.push('risk-alert');
  }
  
  return tags.length > 0 ? tags : ['general'];
}

// Enhanced location extraction
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

// Enhanced region mapping
function getRegionForCountry(country: string): string {
  const regionMap: Record<string, string> = {
    // Asia-Pacific
    'China': 'Asia-Pacific', 'Japan': 'Asia-Pacific', 'India': 'Asia-Pacific',
    'Australia': 'Asia-Pacific', 'South Korea': 'Asia-Pacific', 'Indonesia': 'Asia-Pacific',
    'Thailand': 'Asia-Pacific', 'Vietnam': 'Asia-Pacific', 'Philippines': 'Asia-Pacific',
    'Singapore': 'Asia-Pacific', 'Malaysia': 'Asia-Pacific', 'Taiwan': 'Asia-Pacific',
    'New Zealand': 'Asia-Pacific', 'Pakistan': 'Asia-Pacific', 'Bangladesh': 'Asia-Pacific',
    
    // Middle East
    'Israel': 'Middle East', 'Iran': 'Middle East', 'Saudi Arabia': 'Middle East',
    'UAE': 'Middle East', 'Turkey': 'Middle East', 'Iraq': 'Middle East',
    'Syria': 'Middle East', 'Yemen': 'Middle East', 'Jordan': 'Middle East',
    'Lebanon': 'Middle East', 'Kuwait': 'Middle East', 'Qatar': 'Middle East',
    'Oman': 'Middle East', 'Bahrain': 'Middle East',
    
    // Europe
    'United Kingdom': 'Europe', 'France': 'Europe', 'Germany': 'Europe',
    'Italy': 'Europe', 'Spain': 'Europe', 'Russia': 'Europe',
    'Ukraine': 'Europe', 'Poland': 'Europe', 'Netherlands': 'Europe',
    'Belgium': 'Europe', 'Sweden': 'Europe', 'Norway': 'Europe',
    'Greece': 'Europe', 'Portugal': 'Europe', 'Austria': 'Europe',
    
    // Americas
    'United States': 'Americas', 'Canada': 'Americas', 'Mexico': 'Americas',
    'Brazil': 'Americas', 'Argentina': 'Americas', 'Chile': 'Americas',
    'Colombia': 'Americas', 'Peru': 'Americas', 'Venezuela': 'Americas',
    
    // Africa
    'Egypt': 'Africa', 'South Africa': 'Africa', 'Nigeria': 'Africa',
    'Kenya': 'Africa', 'Ethiopia': 'Africa', 'Morocco': 'Africa',
    'Algeria': 'Africa', 'Ghana': 'Africa', 'Tanzania': 'Africa'
  };
  
  return regionMap[country] || 'Global';
}

function getCountryCode(country: string): string | null {
  const codeMap: Record<string, string> = {
    'China': 'CN', 'United States': 'US', 'India': 'IN', 'Japan': 'JP',
    'Germany': 'DE', 'United Kingdom': 'GB', 'France': 'FR', 'Italy': 'IT',
    'Brazil': 'BR', 'Canada': 'CA', 'Russia': 'RU', 'Australia': 'AU',
    'South Korea': 'KR', 'Spain': 'ES', 'Mexico': 'MX', 'Indonesia': 'ID',
    'Turkey': 'TR', 'Saudi Arabia': 'SA', 'Iran': 'IR', 'Israel': 'IL',
    'Egypt': 'EG', 'South Africa': 'ZA', 'Ukraine': 'UA', 'Taiwan': 'TW',
    'Singapore': 'SG', 'Malaysia': 'MY', 'Thailand': 'TH', 'Vietnam': 'VN'
  };
  
  return codeMap[country] || null;
}

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
    'Brazil': { latitude: -15.8267, longitude: -47.9218 },
    'Singapore': { latitude: 1.3521, longitude: 103.8198 },
    'Taiwan': { latitude: 25.0330, longitude: 121.5654 },
    'Saudi Arabia': { latitude: 24.7136, longitude: 46.6753 },
    'Israel': { latitude: 31.7683, longitude: 35.2137 },
    'Ukraine': { latitude: 50.4501, longitude: 30.5234 }
  };
  
  return coordMap[country] || null;
}
