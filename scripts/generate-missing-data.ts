#!/usr/bin/env tsx
/**
 * Generate missing connections, countries, and insights
 * Quick fix for Railway deployment
 */

import { getDb, getEvents, createInsight } from '../lib/db';

const db = getDb();

// Generate countries from events
function generateCountries() {
  console.log('🌍 Generating countries from events...');
  const events = getEvents({ limit: 1000 });
  
  const countriesMap = new Map<string, any>();
  
  for (const event of events) {
    if (!countriesMap.has(event.country)) {
      countriesMap.set(event.country, {
        name: event.country,
        region: event.region,
        iso_code: event.country_code || event.country.substring(0, 2).toUpperCase(),
        latitude: event.latitude,
        longitude: event.longitude,
        stability_index: 50, // Default mid-range
        risk_level: event.severity >= 8 ? 'critical' : event.severity >= 6 ? 'high' : event.severity >= 4 ? 'moderate' : 'low',
        active_conflicts_count: 0
      });
    }
    
    // Count conflicts
    if (event.category.toLowerCase().includes('conflict')) {
      const country = countriesMap.get(event.country);
      if (country) {
        country.active_conflicts_count++;
      }
    }
  }
  
  // Insert countries
  const insertCountry = db.prepare(`
    INSERT OR REPLACE INTO countries (name, region, iso_code, latitude, longitude, stability_index, risk_level, active_conflicts_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  let count = 0;
  for (const [, country] of countriesMap) {
    insertCountry.run(
      country.name,
      country.region,
      country.iso_code,
      country.latitude,
      country.longitude,
      country.stability_index,
      country.risk_level,
      country.active_conflicts_count
    );
    count++;
  }
  
  console.log(`✅ Generated ${count} countries`);
  return count;
}

// Generate basic connections
function generateConnections() {
  console.log('🔗 Generating event connections...');
  const events = getEvents({ limit: 1000 });
  
  const insertConnection = db.prepare(`
    INSERT OR IGNORE INTO connections (event_a_id, event_b_id, relationship_type, confidence_score, explanation)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  let count = 0;
  
  // Connect events by same country
  const byCountry = new Map<string, any[]>();
  for (const event of events) {
    if (!byCountry.has(event.country)) {
      byCountry.set(event.country, []);
    }
    byCountry.get(event.country)!.push(event);
  }
  
  for (const [country, countryEvents] of byCountry) {
    if (countryEvents.length >= 2) {
      // Connect high-severity events in same country
      const criticalEvents = countryEvents.filter(e => e.severity >= 7);
      for (let i = 0; i < criticalEvents.length - 1; i++) {
        for (let j = i + 1; j < Math.min(i + 3, criticalEvents.length); j++) {
          insertConnection.run(
            criticalEvents[i].id,
            criticalEvents[j].id,
            'relates_to',
            0.7,
            `Both high-severity events affecting ${country}`
          );
          count++;
        }
      }
    }
  }
  
  // Connect events by same category
  const byCategory = new Map<string, any[]>();
  for (const event of events) {
    const cat = event.category.toLowerCase();
    if (!byCategory.has(cat)) {
      byCategory.set(cat, []);
    }
    byCategory.get(cat)!.push(event);
  }
  
  for (const [category, categoryEvents] of byCategory) {
    if (categoryEvents.length >= 2 && (category === 'conflict' || category === 'trade')) {
      // Connect recent events in same critical category
      const recent = categoryEvents
        .filter(e => {
          const eventDate = new Date(e.date);
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          return eventDate > thirtyDaysAgo && e.severity >= 6;
        })
        .slice(0, 5);
      
      for (let i = 0; i < recent.length - 1; i++) {
        insertConnection.run(
          recent[i].id,
          recent[i + 1].id,
          'follows',
          0.6,
          `Sequential ${category} events`
        );
        count++;
      }
    }
  }
  
  console.log(`✅ Generated ${count} connections`);
  return count;
}

// Generate basic insights
function generateInsights() {
  console.log('💡 Generating insights...');
  const events = getEvents({ limit: 1000 });
  
  let count = 0;
  
  // Group by category
  const byCategory = new Map<string, any[]>();
  for (const event of events) {
    const cat = event.category;
    if (!byCategory.has(cat)) {
      byCategory.set(cat, []);
    }
    byCategory.get(cat)!.push(event);
  }
  
  // Generate category insights
  for (const [category, categoryEvents] of byCategory) {
    if (categoryEvents.length >= 3) {
      const highSeverity = categoryEvents.filter(e => e.severity >= 7);
      const regions = [...new Set(categoryEvents.map(e => e.region))];
      
      let title = '';
      let content = '';
      let impactLevel = 'medium';
      
      if (category.toLowerCase().includes('conflict') && highSeverity.length >= 2) {
        title = 'Escalating Conflict Activity';
        content = `${highSeverity.length} high-severity conflict events detected across ${regions.join(', ')}. Construction and logistics operations may face disruptions in affected regions. Consider supply chain diversification and contingency planning.`;
        impactLevel = 'high';
      } else if (category.toLowerCase().includes('trade')) {
        title = 'Trade Policy Developments';
        content = `${categoryEvents.length} trade-related events monitored. Regions affected: ${regions.join(', ')}. Monitor for potential impacts on material costs and procurement timelines.`;
        impactLevel = 'medium';
      } else if (category.toLowerCase().includes('supply')) {
        title = 'Supply Chain Monitoring';
        content = `${categoryEvents.length} supply chain events tracked. Potential delays or cost increases in ${regions.join(', ')}.`;
        impactLevel = 'high';
      } else {
        title = `${category} Activity Summary`;
        content = `${categoryEvents.length} events in ${category} category across ${regions.length} regions.`;
        impactLevel = 'low';
      }
      
      createInsight({
        title,
        content,
        category: 'analysis',
        impact_level: impactLevel,
        relevant_industries: JSON.stringify(['construction', 'logistics', 'procurement']),
        related_events: JSON.stringify(highSeverity.slice(0, 5).map(e => e.id)),
        date: new Date().toISOString()
      });
      
      count++;
    }
  }
  
  // Generate regional summary
  const byRegion = new Map<string, any[]>();
  for (const event of events) {
    if (!byRegion.has(event.region)) {
      byRegion.set(event.region, []);
    }
    byRegion.get(event.region)!.push(event);
  }
  
  for (const [region, regionEvents] of byRegion) {
    if (regionEvents.length >= 5) {
      const critical = regionEvents.filter(e => e.severity >= 8);
      const avgSeverity = regionEvents.reduce((sum, e) => sum + e.severity, 0) / regionEvents.length;
      
      let content = `${regionEvents.length} events tracked in ${region}. `;
      if (critical.length > 0) {
        content += `${critical.length} critical events detected. `;
      }
      content += `Average severity: ${avgSeverity.toFixed(1)}/10. `;
      
      if (avgSeverity >= 6) {
        content += 'Heightened risk environment - enhanced monitoring recommended.';
      } else {
        content += 'Moderate activity levels - continue standard monitoring.';
      }
      
      createInsight({
        title: `${region} Regional Brief`,
        content,
        category: 'daily_brief',
        impact_level: avgSeverity >= 7 ? 'high' : avgSeverity >= 5 ? 'medium' : 'low',
        relevant_industries: JSON.stringify(['construction', 'logistics']),
        related_events: JSON.stringify(critical.slice(0, 5).map(e => e.id)),
        date: new Date().toISOString()
      });
      
      count++;
    }
  }
  
  console.log(`✅ Generated ${count} insights`);
  return count;
}

// Main execution
async function main() {
  try {
    console.log('🚀 Generating missing data...\n');
    
    const countriesCount = generateCountries();
    const connectionsCount = generateConnections();
    const insightsCount = generateInsights();
    
    console.log('\n✅ Complete!');
    console.log(`  - ${countriesCount} countries`);
    console.log(`  - ${connectionsCount} connections`);
    console.log(`  - ${insightsCount} insights`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
