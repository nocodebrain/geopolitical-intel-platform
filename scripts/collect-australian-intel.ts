#!/usr/bin/env tsx
/**
 * Australian Intelligence Collection Script
 * Collects real news from Australian-centric sources with impact analysis
 * Run: tsx scripts/collect-australian-intel.ts
 */

import { fetchAllAustralianNews } from '../lib/data-collection/australian-sources';
import { analyzeAustralianImpact } from '../lib/data-collection/australian-impact-analyzer';
import { categorizeEvent, calculateSeverity, extractEntities, analyzeSentiment } from '../lib/data-collection/ai-processor';
import { createEvent, updateSourceStatus, closeDb, type Event } from '../lib/db';

async function collectAustralianIntelligence() {
  console.log('🇦🇺 AUSTRALIAN GEOPOLITICAL INTELLIGENCE COLLECTION\n');
  console.log('='.repeat(60));
  console.log('Collecting news from Australian-centric sources...');
  console.log('='.repeat(60) + '\n');
  
  try {
    // Fetch news from all Australian-centric sources
    const newsItems = await fetchAllAustralianNews(20);
    
    console.log(`\n📊 Processing ${newsItems.length} relevant articles...\n`);
    
    let processedCount = 0;
    let skippedCount = 0;
    
    for (const { source, item, relevance } of newsItems) {
      try {
        if (!item.title) {
          skippedCount++;
          continue;
        }
        
        const description = (item as any).contentSnippet || 
                          (item as any).description || 
                          (item as any).content || '';
        
        console.log(`\n📰 Processing: ${item.title.substring(0, 60)}...`);
        console.log(`   Source: ${source}`);
        console.log(`   Australian Relevance: ${relevance.score}/100 (${relevance.impactLevel})`);
        
        // AI-powered event analysis
        console.log('   🤖 Running AI analysis...');
        const category = await categorizeEvent(item.title, description);
        const severity = await calculateSeverity(item.title, description, category);
        const entities = await extractEntities(item.title, description);
        const sentiment = await analyzeSentiment(item.title, description);
        
        // Extract location from entities
        const { region, country, countryCode, latitude, longitude } = extractLocationFromEntities(entities);
        
        console.log(`   Category: ${category}, Severity: ${severity}/10`);
        console.log(`   Location: ${country}, ${region}`);
        
        // Australian impact analysis
        console.log('   🇦🇺 Analyzing Australian impact...');
        const australianImpact = await analyzeAustralianImpact(
          item.title,
          description,
          category,
          severity,
          country || 'Unknown',
          region
        );
        
        console.log(`   Impact: ${australianImpact.summary}`);
        console.log(`   Industries: ${australianImpact.affectedIndustries.join(', ')}`);
        console.log(`   Timeframe: ${australianImpact.timeframe}`);
        
        // Prepare event data
        const eventDate = (item as any).pubDate 
          ? new Date((item as any).pubDate).toISOString()
          : new Date().toISOString();
        
        // Combine impact tags with relevance reasons
        const impactTags = [
          ...australianImpact.affectedIndustries,
          `relevance:${relevance.score}`,
          `impact:${relevance.impactLevel}`
        ];
        
        // Store enhanced metadata including Australian impact
        const metadata = {
          australianRelevance: relevance.score,
          australianImpact: {
            summary: australianImpact.summary,
            detailedAnalysis: australianImpact.detailedAnalysis,
            affectedIndustries: australianImpact.affectedIndustries,
            tradeImpact: australianImpact.tradeImpact,
            supplyChainImpact: australianImpact.supplyChainImpact,
            commodityImpact: australianImpact.commodityImpact,
            recommendation: australianImpact.recommendation,
            timeframe: australianImpact.timeframe,
            confidenceScore: australianImpact.confidenceScore
          },
          relevanceReasons: relevance.reasons
        };
        
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
          source_name: source,
          entities: JSON.stringify(entities),
          sentiment_score: sentiment,
          impact_tags: JSON.stringify(impactTags)
        };
        
        // Add Australian impact to description for display
        event.description = `[AUSTRALIAN IMPACT: ${australianImpact.summary}]\n\n${event.description}`;
        
        createEvent(event);
        processedCount++;
        
        console.log('   ✅ Saved to database');
        
        // Rate limiting - be respectful
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`   ❌ Error processing item:`, error);
        skippedCount++;
      }
    }
    
    // Update source status
    for (const { source } of newsItems) {
      updateSourceStatus(source, 'active');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📈 COLLECTION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully processed: ${processedCount} events`);
    console.log(`⏭️  Skipped: ${skippedCount} events`);
    console.log(`📊 Total relevant articles: ${newsItems.length}`);
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('❌ Error in intelligence collection:', error);
    throw error;
  }
}

// Helper function to extract location from entities
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

// Region mapping focused on Australian perspective
function getRegionForCountry(country: string): string {
  const regionMap: Record<string, string> = {
    // Asia-Pacific (Australia's backyard)
    'Australia': 'Asia-Pacific',
    'China': 'Asia-Pacific',
    'Japan': 'Asia-Pacific',
    'South Korea': 'Asia-Pacific',
    'India': 'Asia-Pacific',
    'Indonesia': 'Asia-Pacific',
    'Thailand': 'Asia-Pacific',
    'Vietnam': 'Asia-Pacific',
    'Philippines': 'Asia-Pacific',
    'Singapore': 'Asia-Pacific',
    'Malaysia': 'Asia-Pacific',
    'Taiwan': 'Asia-Pacific',
    'New Zealand': 'Asia-Pacific',
    'Papua New Guinea': 'Asia-Pacific',
    'PNG': 'Asia-Pacific',
    'Fiji': 'Asia-Pacific',
    'Solomon Islands': 'Asia-Pacific',
    
    // Major trade partners
    'United States': 'Americas',
    'USA': 'Americas',
    'U.S.': 'Americas',
    'United Kingdom': 'Europe',
    'UK': 'Europe',
    'Germany': 'Europe',
    'France': 'Europe',
    
    // Middle East (energy)
    'Saudi Arabia': 'Middle East',
    'UAE': 'Middle East',
    'Qatar': 'Middle East',
    'Iran': 'Middle East',
    'Iraq': 'Middle East',
    
    // Rest of world
    'Russia': 'Europe',
    'Brazil': 'Americas',
    'South Africa': 'Africa'
  };
  
  return regionMap[country] || 'Global';
}

// Country code mapping
function getCountryCode(country: string): string | null {
  const codeMap: Record<string, string> = {
    'Australia': 'AU',
    'China': 'CN',
    'Japan': 'JP',
    'South Korea': 'KR',
    'India': 'IN',
    'Indonesia': 'ID',
    'United States': 'US',
    'USA': 'US',
    'U.S.': 'US',
    'United Kingdom': 'GB',
    'UK': 'GB',
    'Germany': 'DE',
    'France': 'FR',
    'Taiwan': 'TW',
    'Singapore': 'SG',
    'Malaysia': 'MY',
    'Thailand': 'TH',
    'Vietnam': 'VN',
    'Philippines': 'PH',
    'New Zealand': 'NZ',
    'Papua New Guinea': 'PG',
    'PNG': 'PG'
  };
  
  return codeMap[country] || null;
}

// Coordinates mapping
function getCountryCoordinates(country: string): { latitude: number; longitude: number } | null {
  const coordMap: Record<string, { latitude: number; longitude: number }> = {
    'Australia': { latitude: -25.2744, longitude: 133.7751 }, // Geographic center
    'China': { latitude: 39.9042, longitude: 116.4074 }, // Beijing
    'Japan': { latitude: 35.6762, longitude: 139.6503 }, // Tokyo
    'South Korea': { latitude: 37.5665, longitude: 126.9780 }, // Seoul
    'India': { latitude: 28.6139, longitude: 77.2090 }, // New Delhi
    'Indonesia': { latitude: -6.2088, longitude: 106.8456 }, // Jakarta
    'United States': { latitude: 38.9072, longitude: -77.0369 }, // Washington DC
    'United Kingdom': { latitude: 51.5074, longitude: -0.1278 }, // London
    'Singapore': { latitude: 1.3521, longitude: 103.8198 },
    'Taiwan': { latitude: 25.0330, longitude: 121.5654 }, // Taipei
    'New Zealand': { latitude: -41.2865, longitude: 174.7762 }, // Wellington
    'Papua New Guinea': { latitude: -9.4438, longitude: 147.1803 } // Port Moresby
  };
  
  return coordMap[country] || null;
}

async function main() {
  try {
    await collectAustralianIntelligence();
    console.log('✅ Australian intelligence collection completed successfully!\n');
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    closeDb();
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { collectAustralianIntelligence };
