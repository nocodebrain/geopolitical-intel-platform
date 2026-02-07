import { createEvent, upsertCountry, createConnection, createInsight, upsertSource, type Event } from '../db';

// Seed initial data sources
export function seedSources() {
  const sources = [
    { name: 'Reuters World News', url: 'https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best', type: 'rss', category: 'news', enabled: 1, status: 'active' },
    { name: 'BBC World News', url: 'http://feeds.bbci.co.uk/news/world/rss.xml', type: 'rss', category: 'news', enabled: 1, status: 'active' },
    { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', type: 'rss', category: 'news', enabled: 1, status: 'active' },
    { name: 'Associated Press', url: 'https://www.ap.org/rss/news', type: 'rss', category: 'news', enabled: 1, status: 'active' },
    { name: 'NewsAPI', url: 'https://newsapi.org', type: 'api', category: 'news', enabled: 1, status: 'active' },
    { name: 'GDELT', url: 'https://www.gdeltproject.org/', type: 'api', category: 'news', enabled: 0, status: 'planned' },
    { name: 'ACLED', url: 'https://acleddata.com/', type: 'api', category: 'conflict', enabled: 0, status: 'planned' },
    { name: 'World Bank API', url: 'https://api.worldbank.org/v2/', type: 'api', category: 'economic', enabled: 0, status: 'planned' }
  ];
  
  sources.forEach(source => upsertSource(source));
  console.log(`Seeded ${sources.length} data sources`);
}

// Seed country data with regions and basic info
export function seedCountries() {
  const countries = [
    // Asia-Pacific
    { name: 'China', region: 'Asia-Pacific', iso_code: 'CN', iso_code_3: 'CHN', latitude: 39.9042, longitude: 116.4074, risk_level: 'moderate' },
    { name: 'Japan', region: 'Asia-Pacific', iso_code: 'JP', iso_code_3: 'JPN', latitude: 35.6762, longitude: 139.6503, risk_level: 'low' },
    { name: 'India', region: 'Asia-Pacific', iso_code: 'IN', iso_code_3: 'IND', latitude: 28.6139, longitude: 77.2090, risk_level: 'moderate' },
    { name: 'Australia', region: 'Asia-Pacific', iso_code: 'AU', iso_code_3: 'AUS', latitude: -33.8688, longitude: 151.2093, risk_level: 'low' },
    { name: 'South Korea', region: 'Asia-Pacific', iso_code: 'KR', iso_code_3: 'KOR', latitude: 37.5665, longitude: 126.9780, risk_level: 'moderate' },
    { name: 'Taiwan', region: 'Asia-Pacific', iso_code: 'TW', iso_code_3: 'TWN', latitude: 25.0330, longitude: 121.5654, risk_level: 'high' },
    { name: 'Indonesia', region: 'Asia-Pacific', iso_code: 'ID', iso_code_3: 'IDN', latitude: -6.2088, longitude: 106.8456, risk_level: 'moderate' },
    { name: 'Vietnam', region: 'Asia-Pacific', iso_code: 'VN', iso_code_3: 'VNM', latitude: 21.0285, longitude: 105.8542, risk_level: 'moderate' },
    { name: 'Thailand', region: 'Asia-Pacific', iso_code: 'TH', iso_code_3: 'THA', latitude: 13.7563, longitude: 100.5018, risk_level: 'moderate' },
    { name: 'Singapore', region: 'Asia-Pacific', iso_code: 'SG', iso_code_3: 'SGP', latitude: 1.3521, longitude: 103.8198, risk_level: 'low' },
    
    // Middle East
    { name: 'Israel', region: 'Middle East', iso_code: 'IL', iso_code_3: 'ISR', latitude: 31.7683, longitude: 35.2137, risk_level: 'high' },
    { name: 'Iran', region: 'Middle East', iso_code: 'IR', iso_code_3: 'IRN', latitude: 35.6892, longitude: 51.3890, risk_level: 'high' },
    { name: 'Saudi Arabia', region: 'Middle East', iso_code: 'SA', iso_code_3: 'SAU', latitude: 24.7136, longitude: 46.6753, risk_level: 'moderate' },
    { name: 'UAE', region: 'Middle East', iso_code: 'AE', iso_code_3: 'ARE', latitude: 24.4539, longitude: 54.3773, risk_level: 'moderate' },
    { name: 'Turkey', region: 'Middle East', iso_code: 'TR', iso_code_3: 'TUR', latitude: 39.9334, longitude: 32.8597, risk_level: 'moderate' },
    { name: 'Iraq', region: 'Middle East', iso_code: 'IQ', iso_code_3: 'IRQ', latitude: 33.3152, longitude: 44.3661, risk_level: 'critical' },
    { name: 'Syria', region: 'Middle East', iso_code: 'SY', iso_code_3: 'SYR', latitude: 33.5138, longitude: 36.2765, risk_level: 'critical' },
    { name: 'Yemen', region: 'Middle East', iso_code: 'YE', iso_code_3: 'YEM', latitude: 15.5527, longitude: 48.5164, risk_level: 'critical' },
    
    // Europe
    { name: 'United Kingdom', region: 'Europe', iso_code: 'GB', iso_code_3: 'GBR', latitude: 51.5074, longitude: -0.1278, risk_level: 'low' },
    { name: 'France', region: 'Europe', iso_code: 'FR', iso_code_3: 'FRA', latitude: 48.8566, longitude: 2.3522, risk_level: 'low' },
    { name: 'Germany', region: 'Europe', iso_code: 'DE', iso_code_3: 'DEU', latitude: 52.5200, longitude: 13.4050, risk_level: 'low' },
    { name: 'Italy', region: 'Europe', iso_code: 'IT', iso_code_3: 'ITA', latitude: 41.9028, longitude: 12.4964, risk_level: 'low' },
    { name: 'Spain', region: 'Europe', iso_code: 'ES', iso_code_3: 'ESP', latitude: 40.4168, longitude: -3.7038, risk_level: 'low' },
    { name: 'Russia', region: 'Europe', iso_code: 'RU', iso_code_3: 'RUS', latitude: 55.7558, longitude: 37.6173, risk_level: 'high' },
    { name: 'Ukraine', region: 'Europe', iso_code: 'UA', iso_code_3: 'UKR', latitude: 50.4501, longitude: 30.5234, risk_level: 'critical' },
    { name: 'Poland', region: 'Europe', iso_code: 'PL', iso_code_3: 'POL', latitude: 52.2297, longitude: 21.0122, risk_level: 'moderate' },
    
    // Americas
    { name: 'United States', region: 'Americas', iso_code: 'US', iso_code_3: 'USA', latitude: 38.9072, longitude: -77.0369, risk_level: 'low' },
    { name: 'Canada', region: 'Americas', iso_code: 'CA', iso_code_3: 'CAN', latitude: 45.4215, longitude: -75.6972, risk_level: 'low' },
    { name: 'Mexico', region: 'Americas', iso_code: 'MX', iso_code_3: 'MEX', latitude: 19.4326, longitude: -99.1332, risk_level: 'moderate' },
    { name: 'Brazil', region: 'Americas', iso_code: 'BR', iso_code_3: 'BRA', latitude: -15.8267, longitude: -47.9218, risk_level: 'moderate' },
    { name: 'Argentina', region: 'Americas', iso_code: 'AR', iso_code_3: 'ARG', latitude: -34.6037, longitude: -58.3816, risk_level: 'moderate' },
    { name: 'Chile', region: 'Americas', iso_code: 'CL', iso_code_3: 'CHL', latitude: -33.4489, longitude: -70.6693, risk_level: 'low' },
    
    // Africa
    { name: 'Egypt', region: 'Africa', iso_code: 'EG', iso_code_3: 'EGY', latitude: 30.0444, longitude: 31.2357, risk_level: 'moderate' },
    { name: 'South Africa', region: 'Africa', iso_code: 'ZA', iso_code_3: 'ZAF', latitude: -25.7479, longitude: 28.2293, risk_level: 'moderate' },
    { name: 'Nigeria', region: 'Africa', iso_code: 'NG', iso_code_3: 'NGA', latitude: 9.0765, longitude: 7.3986, risk_level: 'high' },
    { name: 'Kenya', region: 'Africa', iso_code: 'KE', iso_code_3: 'KEN', latitude: -1.2864, longitude: 36.8172, risk_level: 'moderate' },
    { name: 'Ethiopia', region: 'Africa', iso_code: 'ET', iso_code_3: 'ETH', latitude: 9.1450, longitude: 40.4897, risk_level: 'high' }
  ];
  
  countries.forEach(country => upsertCountry(country));
  console.log(`Seeded ${countries.length} countries`);
}

// Seed sample events for testing/demo
export function seedSampleEvents() {
  const now = new Date();
  const events: Event[] = [
    // High severity - Conflicts
    {
      title: 'Red Sea Shipping Attacks Disrupt Global Trade Routes',
      description: 'Houthi attacks on commercial vessels in the Red Sea have forced major shipping companies to reroute around Africa, adding 10-14 days to delivery times and increasing freight costs by 30-40%. This affects supply chains for construction materials, electronics, and consumer goods.',
      category: 'Conflict',
      severity: 9,
      region: 'Middle East',
      country: 'Yemen',
      country_code: 'YE',
      latitude: 15.5527,
      longitude: 48.5164,
      date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      source_name: 'Reuters',
      source_url: 'https://reuters.com/example',
      entities: JSON.stringify({ countries: ['Yemen', 'Saudi Arabia', 'United States'], companies: [], people: [], commodities: ['oil', 'shipping'] }),
      sentiment_score: -0.8,
      impact_tags: JSON.stringify(['logistics', 'supply-chain', 'shipping', 'construction'])
    },
    {
      title: 'Taiwan Strait Tensions Rise as Military Exercises Intensify',
      description: 'China conducts large-scale military drills around Taiwan following high-level US diplomatic visit. Semiconductor industry faces potential disruption risks. TSMC stock declines 5% amid concerns about production continuity.',
      category: 'Conflict',
      severity: 8,
      region: 'Asia-Pacific',
      country: 'Taiwan',
      country_code: 'TW',
      latitude: 25.0330,
      longitude: 121.5654,
      date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      source_name: 'BBC',
      source_url: 'https://bbc.com/example',
      entities: JSON.stringify({ countries: ['Taiwan', 'China', 'United States'], companies: ['TSMC'], people: [], commodities: ['semiconductors'] }),
      sentiment_score: -0.7,
      impact_tags: JSON.stringify(['tech', 'construction', 'supply-chain'])
    },
    
    // Medium-high severity - Trade & Economy
    {
      title: 'EU Imposes New Tariffs on Chinese Steel and Aluminum',
      description: 'European Union announces 25% tariffs on Chinese steel and aluminum imports, citing unfair subsidies and overcapacity. China threatens retaliatory measures. Construction industry braces for material cost increases across Europe.',
      category: 'Trade',
      severity: 7,
      region: 'Europe',
      country: 'Germany',
      country_code: 'DE',
      latitude: 52.5200,
      longitude: 13.4050,
      date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      source_name: 'Bloomberg',
      source_url: 'https://bloomberg.com/example',
      entities: JSON.stringify({ countries: ['China', 'Germany', 'France'], companies: [], people: [], commodities: ['steel', 'aluminum'] }),
      sentiment_score: -0.5,
      impact_tags: JSON.stringify(['trade', 'construction', 'materials', 'pricing'])
    },
    {
      title: 'Global Copper Prices Surge 15% on Supply Concerns',
      description: 'Copper futures hit 18-month high as major mines in Chile and Peru face labor strikes and operational disruptions. Construction and electrical industries face rising input costs. Analysts predict sustained elevated prices through Q2.',
      category: 'Economy',
      severity: 6,
      region: 'Americas',
      country: 'Chile',
      country_code: 'CL',
      latitude: -33.4489,
      longitude: -70.6693,
      date: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      source_name: 'Reuters',
      source_url: 'https://reuters.com/example',
      entities: JSON.stringify({ countries: ['Chile', 'Peru', 'China'], companies: [], people: [], commodities: ['copper'] }),
      sentiment_score: -0.4,
      impact_tags: JSON.stringify(['economy', 'construction', 'materials', 'pricing'])
    },
    {
      title: 'India-Australia Free Trade Agreement Expands Construction Materials Access',
      description: 'New trade deal removes tariffs on Australian iron ore, coal, and construction equipment exports to India. Expected to boost bilateral trade by $20B annually. Australian construction sector gains improved access to Indian market.',
      category: 'Trade',
      severity: 5,
      region: 'Asia-Pacific',
      country: 'Australia',
      country_code: 'AU',
      latitude: -33.8688,
      longitude: 151.2093,
      date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      source_name: 'Australian Financial Review',
      source_url: 'https://afr.com/example',
      entities: JSON.stringify({ countries: ['Australia', 'India'], companies: [], people: [], commodities: ['iron ore', 'coal'] }),
      sentiment_score: 0.7,
      impact_tags: JSON.stringify(['trade', 'construction', 'procurement'])
    },
    
    // Medium severity - Politics & Climate
    {
      title: 'Middle East Peace Talks Resume in Qatar',
      description: 'Regional leaders meet in Doha to discuss ceasefire agreements and reconstruction efforts. Potential for stabilization could open new construction and infrastructure opportunities worth $50B+.',
      category: 'Politics',
      severity: 5,
      region: 'Middle East',
      country: 'Qatar',
      country_code: 'QA',
      latitude: 25.2854,
      longitude: 51.5310,
      date: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      source_name: 'Al Jazeera',
      source_url: 'https://aljazeera.com/example',
      entities: JSON.stringify({ countries: ['Qatar', 'Saudi Arabia', 'Iran', 'Israel'], companies: [], people: [], commodities: [] }),
      sentiment_score: 0.6,
      impact_tags: JSON.stringify(['politics', 'construction'])
    },
    {
      title: 'Severe Flooding in Southeast Asia Disrupts Manufacturing Hubs',
      description: 'Thailand and Vietnam experience worst flooding in decade, affecting major industrial zones. Electronics and automotive manufacturing face 2-3 week shutdowns. Supply chain ripple effects expected globally.',
      category: 'Climate',
      severity: 7,
      region: 'Asia-Pacific',
      country: 'Thailand',
      country_code: 'TH',
      latitude: 13.7563,
      longitude: 100.5018,
      date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      source_name: 'BBC',
      source_url: 'https://bbc.com/example',
      entities: JSON.stringify({ countries: ['Thailand', 'Vietnam'], companies: [], people: [], commodities: [] }),
      sentiment_score: -0.6,
      impact_tags: JSON.stringify(['climate', 'logistics', 'supply-chain', 'disruption'])
    },
    
    // Lower severity - Tech & Updates
    {
      title: 'G20 Summit Agrees on Global Infrastructure Investment Framework',
      description: 'Member nations commit to $2 trillion infrastructure development fund focusing on emerging markets. Emphasis on sustainable construction and climate-resilient projects. Implementation begins 2026.',
      category: 'Politics',
      severity: 4,
      region: 'Global',
      country: 'India',
      country_code: 'IN',
      latitude: 28.6139,
      longitude: 77.2090,
      date: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      source_name: 'Reuters',
      source_url: 'https://reuters.com/example',
      entities: JSON.stringify({ countries: ['India', 'United States', 'China', 'Germany'], companies: [], people: [], commodities: [] }),
      sentiment_score: 0.8,
      impact_tags: JSON.stringify(['politics', 'construction'])
    },
    {
      title: 'US Federal Reserve Holds Interest Rates Steady',
      description: 'Fed maintains current rates at 5.25-5.5%, signaling potential cuts in late 2026 if inflation continues to moderate. Construction lending costs remain elevated but stable.',
      category: 'Economy',
      severity: 3,
      region: 'Americas',
      country: 'United States',
      country_code: 'US',
      latitude: 38.9072,
      longitude: -77.0369,
      date: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString(),
      source_name: 'Bloomberg',
      source_url: 'https://bloomberg.com/example',
      entities: JSON.stringify({ countries: ['United States'], companies: [], people: [], commodities: [] }),
      sentiment_score: 0.3,
      impact_tags: JSON.stringify(['economy', 'construction'])
    },
    {
      title: 'Japan Launches Advanced Construction Robotics Initiative',
      description: 'Government announces $5B program to accelerate automation in construction sector amid labor shortages. Technology exports expected to boost regional partnerships.',
      category: 'Tech',
      severity: 4,
      region: 'Asia-Pacific',
      country: 'Japan',
      country_code: 'JP',
      latitude: 35.6762,
      longitude: 139.6503,
      date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      source_name: 'Nikkei Asia',
      source_url: 'https://asia.nikkei.com/example',
      entities: JSON.stringify({ countries: ['Japan'], companies: [], people: [], commodities: [] }),
      sentiment_score: 0.7,
      impact_tags: JSON.stringify(['tech', 'construction'])
    }
  ];
  
  let count = 0;
  events.forEach(event => {
    try {
      createEvent(event);
      count++;
    } catch (error) {
      console.error('Failed to create event:', event.title, error);
    }
  });
  
  console.log(`Seeded ${count} sample events`);
  return count;
}

// Seed sample connections between events
export function seedSampleConnections() {
  const connections = [
    {
      event_a_id: 1, // Red Sea attacks
      event_b_id: 4, // Copper price surge
      relationship_type: 'causes',
      confidence_score: 0.8,
      explanation: 'Shipping disruptions in Red Sea increase logistics costs, contributing to commodity price increases including copper'
    },
    {
      event_a_id: 3, // EU tariffs on Chinese steel
      event_b_id: 5, // India-Australia trade deal
      relationship_type: 'relates_to',
      confidence_score: 0.7,
      explanation: 'EU tariffs on Chinese materials create opportunities for alternative suppliers like Australia-India partnership'
    },
    {
      event_a_id: 2, // Taiwan tensions
      event_b_id: 7, // Southeast Asia flooding
      relationship_type: 'relates_to',
      confidence_score: 0.6,
      explanation: 'Both events threaten Asian manufacturing hubs and global supply chains for electronics and construction tech'
    },
    {
      event_a_id: 1, // Red Sea attacks
      event_b_id: 3, // EU steel tariffs
      relationship_type: 'causes',
      confidence_score: 0.75,
      explanation: 'Shipping route disruptions compound effects of trade restrictions, further straining construction material supply chains in Europe'
    }
  ];
  
  let count = 0;
  connections.forEach(conn => {
    try {
      createConnection(conn);
      count++;
    } catch (error) {
      console.error('Failed to create connection:', error);
    }
  });
  
  console.log(`Seeded ${count} event connections`);
  return count;
}

// Seed sample insights
export function seedSampleInsights() {
  const now = new Date();
  
  const insights = [
    {
      title: 'Daily Intelligence Brief',
      content: `**Top 3 Insights for ${now.toISOString().split('T')[0]}:**

1. **Red Sea Crisis Escalates Supply Chain Pressure** - Houthi attacks force major shipping reroutes, adding 10-14 days to transit times and 30-40% to freight costs. Immediate impact on construction material deliveries. Consider advancing procurement schedules and securing alternative suppliers.

2. **EU-China Trade Tensions Impact Material Costs** - New 25% tariffs on Chinese steel/aluminum will ripple through European construction markets. Australian and Indian suppliers may offer competitive alternatives under new trade agreements. Evaluate diversification opportunities.

3. **Asia-Pacific Manufacturing Disruptions** - Taiwan tensions + Southeast Asia flooding create dual threats to electronics and construction tech supply chains. Monitor semiconductor availability for construction management software and smart building systems.

**Strategic Recommendations:**
- Hedge commodity exposure, especially copper (+15% this week)
- Develop contingency plans for 2-3 week shipping delays
- Explore Australia-India trade corridor for materials procurement
- Lock in Q2 material prices where possible`,
      category: 'daily_brief',
      impact_level: 'high',
      relevant_industries: JSON.stringify(['construction', 'logistics', 'procurement']),
      related_events: JSON.stringify([1, 2, 3, 4, 7]),
      date: now.toISOString()
    },
    {
      title: 'Construction Sector Outlook: Mixed Signals',
      content: `Recent geopolitical developments present both risks and opportunities for construction/logistics sector:

**Risks:**
- Supply chain disruptions (Red Sea, Asia flooding) = 7-14 day delays
- Material cost inflation (steel +25% tariffs, copper +15%)
- Semiconductor shortages may affect construction tech

**Opportunities:**
- $2T G20 infrastructure fund (2026 implementation)
- Australia-India trade deal opens new procurement channels
- Middle East reconstruction potential ($50B+)
- Japan construction robotics initiative may boost efficiency

**Net Assessment:** Elevated operational risks in H1 2026, but strong medium-term fundamentals. Focus on supply chain resilience and diversification.`,
      category: 'analysis',
      impact_level: 'medium',
      relevant_industries: JSON.stringify(['construction', 'logistics']),
      related_events: JSON.stringify([1, 3, 4, 5, 6, 8]),
      date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
  
  let count = 0;
  insights.forEach(insight => {
    try {
      createInsight(insight);
      count++;
    } catch (error) {
      console.error('Failed to create insight:', error);
    }
  });
  
  console.log(`Seeded ${count} insights`);
  return count;
}

// Master seed function
export function seedAllData() {
  console.log('Starting database seeding...\n');
  
  seedSources();
  seedCountries();
  const eventsCount = seedSampleEvents();
  const connectionsCount = seedSampleConnections();
  const insightsCount = seedSampleInsights();
  
  console.log('\n=== Seeding Complete ===');
  console.log(`Events: ${eventsCount}`);
  console.log(`Connections: ${connectionsCount}`);
  console.log(`Insights: ${insightsCount}`);
  console.log('======================\n');
}
