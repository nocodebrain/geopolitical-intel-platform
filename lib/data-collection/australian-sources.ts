/**
 * Australian-Centric News & Data Sources
 * Real RSS feeds and APIs focused on Australian business interests
 */

import Parser from 'rss-parser';
import axios from 'axios';
import * as cheerio from 'cheerio';

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'media'],
      ['content:encoded', 'contentEncoded'],
      ['description', 'description']
    ]
  }
});

// 🇦🇺 AUSTRALIAN NEWS SOURCES
export const AUSTRALIAN_NEWS_SOURCES = [
  {
    name: 'ABC News Australia',
    url: 'https://www.abc.net.au/news/feed/51120/rss.xml',
    category: 'australian_news',
    region: 'Australia',
    priority: 10, // Highest priority for Australian perspective
    enabled: true
  },
  {
    name: 'ABC News Business',
    url: 'https://www.abc.net.au/news/feed/2908/rss.xml',
    category: 'business',
    region: 'Australia',
    priority: 10,
    enabled: true
  },
  {
    name: 'ABC News World',
    url: 'https://www.abc.net.au/news/feed/45910/rss.xml',
    category: 'world',
    region: 'Global',
    priority: 9,
    enabled: true
  },
  // Note: AFR requires subscription, using general news for now
  {
    name: 'The Australian',
    url: 'https://www.theaustralian.com.au/feed/',
    category: 'australian_news',
    region: 'Australia',
    priority: 9,
    enabled: false // May require auth
  }
];

// 🌏 ASIA-PACIFIC FOCUSED SOURCES
export const ASIA_PACIFIC_SOURCES = [
  {
    name: 'Bloomberg Asia',
    url: 'https://www.bloomberg.com/feed/news',
    category: 'asia_business',
    region: 'Asia-Pacific',
    priority: 8,
    enabled: true
  },
  {
    name: 'Reuters Asia',
    url: 'https://www.reutersagency.com/feed/?best-region=asia&post_type=best',
    category: 'asia_news',
    region: 'Asia-Pacific',
    priority: 8,
    enabled: true
  },
  {
    name: 'Nikkei Asia',
    url: 'https://asia.nikkei.com/rss/feed/nar',
    category: 'asia_business',
    region: 'Asia-Pacific',
    priority: 7,
    enabled: true
  },
  {
    name: 'South China Morning Post',
    url: 'https://www.scmp.com/rss/91/feed',
    category: 'china',
    region: 'Asia-Pacific',
    priority: 7,
    enabled: true
  },
  {
    name: 'Japan Times',
    url: 'https://www.japantimes.co.jp/feed/',
    category: 'japan',
    region: 'Asia-Pacific',
    priority: 6,
    enabled: true
  }
];

// 🛡️ STRATEGIC & DEFENSE SOURCES
export const STRATEGIC_SOURCES = [
  {
    name: 'ASPI (Australian Strategic Policy Institute)',
    url: 'https://www.aspi.org.au/rss.xml',
    category: 'strategic',
    region: 'Australia',
    priority: 9,
    enabled: true
  },
  {
    name: 'Defense News',
    url: 'https://www.defensenews.com/arc/outboundfeeds/rss/',
    category: 'defense',
    region: 'Global',
    priority: 6,
    enabled: true
  },
  {
    name: 'CSIS (Center for Strategic & International Studies)',
    url: 'https://www.csis.org/analysis/feed',
    category: 'strategic',
    region: 'Global',
    priority: 6,
    enabled: true
  }
];

// 📦 TRADE & LOGISTICS SOURCES
export const TRADE_SOURCES = [
  {
    name: 'Lloyd\'s List (Shipping News)',
    url: 'https://lloydslist.maritimeintelligence.informa.com/rss',
    category: 'shipping',
    region: 'Global',
    priority: 7,
    enabled: true
  },
  {
    name: 'FreightWaves',
    url: 'https://www.freightwaves.com/news/feed',
    category: 'logistics',
    region: 'Global',
    priority: 6,
    enabled: true
  },
  {
    name: 'JOC (Journal of Commerce)',
    url: 'https://www.joc.com/rss.xml',
    category: 'trade',
    region: 'Global',
    priority: 6,
    enabled: true
  }
];

// 🌍 GLOBAL NEWS (FILTERED FOR RELEVANCE)
export const GLOBAL_SOURCES = [
  {
    name: 'Reuters World News',
    url: 'https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best',
    category: 'world',
    region: 'Global',
    priority: 7,
    enabled: true
  },
  {
    name: 'BBC World News',
    url: 'http://feeds.bbci.co.uk/news/world/rss.xml',
    category: 'world',
    region: 'Global',
    priority: 7,
    enabled: true
  },
  {
    name: 'Al Jazeera',
    url: 'https://www.aljazeera.com/xml/rss/all.xml',
    category: 'world',
    region: 'Middle East',
    priority: 5,
    enabled: true
  },
  {
    name: 'Financial Times',
    url: 'https://www.ft.com/?format=rss',
    category: 'finance',
    region: 'Global',
    priority: 7,
    enabled: true
  }
];

// Combine all sources
export const ALL_NEWS_SOURCES = [
  ...AUSTRALIAN_NEWS_SOURCES,
  ...ASIA_PACIFIC_SOURCES,
  ...STRATEGIC_SOURCES,
  ...TRADE_SOURCES,
  ...GLOBAL_SOURCES
].filter(source => source.enabled);

// 🔍 AUSTRALIAN RELEVANCE KEYWORDS
export const AUSTRALIAN_RELEVANCE_KEYWORDS = {
  // Direct mentions
  direct: [
    'australia', 'australian', 'canberra', 'sydney', 'melbourne', 'brisbane',
    'perth', 'adelaide', 'aukus', 'quad', 'anzac', 'commonwealth'
  ],
  
  // Key trade partners
  tradePartners: [
    'china', 'chinese', 'beijing', 'japan', 'tokyo', 'south korea', 'seoul',
    'indonesia', 'india', 'united states', 'u.s.', 'usa', 'uk', 'britain',
    'european union', 'eu', 'new zealand'
  ],
  
  // Australian export commodities
  commodities: [
    'iron ore', 'coal', 'lng', 'liquefied natural gas', 'wheat', 'barley',
    'gold', 'lithium', 'rare earth', 'beef', 'wool', 'wine', 'education exports'
  ],
  
  // Supply chain & logistics
  supplyChain: [
    'supply chain', 'shipping', 'container', 'freight', 'port', 'logistics',
    'semiconductor', 'chip shortage', 'construction materials', 'steel',
    'copper', 'aluminum', 'timber', 'cement'
  ],
  
  // Regional security
  security: [
    'south china sea', 'taiwan strait', 'indo-pacific', 'pacific islands',
    'png', 'papua new guinea', 'solomon islands', 'fiji', 'pacific', 
    'strait of malacca', 'malacca strait'
  ],
  
  // Economic impacts
  economic: [
    'tariff', 'trade war', 'sanctions', 'embargo', 'recession', 'inflation',
    'interest rate', 'rba', 'reserve bank', 'commodity price', 'exchange rate',
    'aud', 'australian dollar'
  ],
  
  // Industry-specific
  industries: [
    'construction', 'building', 'infrastructure', 'mining', 'agriculture',
    'farming', 'energy', 'renewable', 'solar', 'wind', 'manufacturing',
    'tourism', 'education', 'universities'
  ]
};

/**
 * Calculate Australian relevance score (0-100)
 */
export function calculateAustralianRelevance(title: string, description: string): {
  score: number;
  reasons: string[];
  impactLevel: 'critical' | 'high' | 'medium' | 'low';
} {
  const text = `${title} ${description}`.toLowerCase();
  const reasons: string[] = [];
  let score = 0;
  
  // Direct Australian mentions (40 points max)
  const directMatches = AUSTRALIAN_RELEVANCE_KEYWORDS.direct.filter(kw => 
    text.includes(kw.toLowerCase())
  );
  if (directMatches.length > 0) {
    score += 40;
    reasons.push(`Directly mentions Australia`);
  }
  
  // Trade partners (30 points max)
  const partnerMatches = AUSTRALIAN_RELEVANCE_KEYWORDS.tradePartners.filter(kw => 
    text.includes(kw.toLowerCase())
  );
  if (partnerMatches.length > 0) {
    score += Math.min(30, partnerMatches.length * 10);
    reasons.push(`Involves key trade partners: ${partnerMatches.slice(0, 3).join(', ')}`);
  }
  
  // Commodities (20 points max)
  const commodityMatches = AUSTRALIAN_RELEVANCE_KEYWORDS.commodities.filter(kw => 
    text.includes(kw.toLowerCase())
  );
  if (commodityMatches.length > 0) {
    score += Math.min(20, commodityMatches.length * 10);
    reasons.push(`Affects Australian exports: ${commodityMatches.slice(0, 2).join(', ')}`);
  }
  
  // Supply chain (15 points max)
  const supplyChainMatches = AUSTRALIAN_RELEVANCE_KEYWORDS.supplyChain.filter(kw => 
    text.includes(kw.toLowerCase())
  );
  if (supplyChainMatches.length > 0) {
    score += Math.min(15, supplyChainMatches.length * 5);
    reasons.push(`Supply chain impact`);
  }
  
  // Regional security (25 points max)
  const securityMatches = AUSTRALIAN_RELEVANCE_KEYWORDS.security.filter(kw => 
    text.includes(kw.toLowerCase())
  );
  if (securityMatches.length > 0) {
    score += Math.min(25, securityMatches.length * 10);
    reasons.push(`Regional security concern: ${securityMatches.slice(0, 2).join(', ')}`);
  }
  
  // Economic impacts (15 points max)
  const economicMatches = AUSTRALIAN_RELEVANCE_KEYWORDS.economic.filter(kw => 
    text.includes(kw.toLowerCase())
  );
  if (economicMatches.length > 0) {
    score += Math.min(15, economicMatches.length * 5);
    reasons.push(`Economic impact`);
  }
  
  // Industry-specific (10 points max)
  const industryMatches = AUSTRALIAN_RELEVANCE_KEYWORDS.industries.filter(kw => 
    text.includes(kw.toLowerCase())
  );
  if (industryMatches.length > 0) {
    score += Math.min(10, industryMatches.length * 3);
    reasons.push(`Industry impact: ${industryMatches.slice(0, 2).join(', ')}`);
  }
  
  // Cap at 100
  score = Math.min(100, score);
  
  // Determine impact level
  let impactLevel: 'critical' | 'high' | 'medium' | 'low' = 'low';
  if (score >= 70) impactLevel = 'critical';
  else if (score >= 50) impactLevel = 'high';
  else if (score >= 30) impactLevel = 'medium';
  
  return { score, reasons, impactLevel };
}

/**
 * Fetch RSS feed with error handling
 */
export async function fetchRSSFeed(source: typeof ALL_NEWS_SOURCES[0]): Promise<Parser.Item[]> {
  try {
    const feed = await parser.parseURL(source.url);
    return feed.items || [];
  } catch (error: any) {
    console.error(`Error fetching ${source.name}:`, error.message);
    return [];
  }
}

/**
 * Fetch all news from Australian-centric sources
 */
export async function fetchAllAustralianNews(maxItemsPerSource: number = 20): Promise<Array<{
  source: string;
  item: Parser.Item;
  relevance: ReturnType<typeof calculateAustralianRelevance>;
}>> {
  const allNews: Array<{
    source: string;
    item: Parser.Item;
    relevance: ReturnType<typeof calculateAustralianRelevance>;
  }> = [];
  
  // Sort sources by priority
  const sortedSources = [...ALL_NEWS_SOURCES].sort((a, b) => b.priority - a.priority);
  
  for (const source of sortedSources) {
    console.log(`📰 Fetching from ${source.name}...`);
    
    try {
      const items = await fetchRSSFeed(source);
      
      for (const item of items.slice(0, maxItemsPerSource)) {
        if (!item.title) continue;
        
        const description = (item as any).contentSnippet || 
                          (item as any).description || 
                          (item as any).content || '';
        
        const relevance = calculateAustralianRelevance(item.title, description);
        
        // Only include if relevance score >= 25 (unless it's an Australian source)
        if (relevance.score >= 25 || source.category === 'australian_news') {
          allNews.push({
            source: source.name,
            item,
            relevance
          });
        }
      }
      
      // Rate limiting - be respectful
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error: any) {
      console.error(`Error processing ${source.name}:`, error.message);
    }
  }
  
  // Sort by relevance score
  allNews.sort((a, b) => b.relevance.score - a.relevance.score);
  
  console.log(`\n✅ Collected ${allNews.length} relevant articles`);
  console.log(`   Critical: ${allNews.filter(n => n.relevance.impactLevel === 'critical').length}`);
  console.log(`   High: ${allNews.filter(n => n.relevance.impactLevel === 'high').length}`);
  console.log(`   Medium: ${allNews.filter(n => n.relevance.impactLevel === 'medium').length}\n`);
  
  return allNews;
}
