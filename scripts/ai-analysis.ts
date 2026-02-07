#!/usr/bin/env tsx
/**
 * AI Analysis & Pattern Detection
 * Analyzes geopolitical events for patterns, trends, and significant changes
 * Generates alerts for business-critical developments
 */

import { getEvents, createInsight, getInsights } from '../lib/db';

interface Pattern {
  type: 'trend' | 'escalation' | 'disruption' | 'opportunity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedRegions: string[];
  impactedIndustries: string[];
  relatedEvents: number[];
  confidence: number;
}

// Analyze event patterns
function analyzePatterns(): Pattern[] {
  const patterns: Pattern[] = [];
  const events = getEvents({ limit: 500 });
  
  // Group by category and region
  const byCategory: Record<string, any[]> = {};
  const byRegion: Record<string, any[]> = {};
  const byCountry: Record<string, any[]> = {};
  
  for (const event of events) {
    // By category
    if (!byCategory[event.category]) byCategory[event.category] = [];
    byCategory[event.category].push(event);
    
    // By region
    if (!byRegion[event.region]) byRegion[event.region] = [];
    byRegion[event.region].push(event);
    
    // By country
    if (!byCountry[event.country]) byCountry[event.country] = [];
    byCountry[event.country].push(event);
  }
  
  // Pattern 1: Conflict Escalation
  const conflictEvents = byCategory['conflict'] || [];
  if (conflictEvents.length >= 3) {
    const recentConflicts = conflictEvents.filter(e => {
      const eventDate = new Date(e.date);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return eventDate > thirtyDaysAgo && e.severity >= 7;
    });
    
    if (recentConflicts.length >= 2) {
      const regions = [...new Set(recentConflicts.map(e => e.region))];
      patterns.push({
        type: 'escalation',
        severity: 'high',
        title: 'Rising Conflict Activity Detected',
        description: `${recentConflicts.length} high-severity conflict events in the last 30 days across ${regions.join(', ')}. Potential supply chain disruptions for construction and logistics sectors.`,
        affectedRegions: regions,
        impactedIndustries: ['construction', 'logistics', 'supply-chain'],
        relatedEvents: recentConflicts.map(e => e.id!),
        confidence: 0.85
      });
    }
  }
  
  // Pattern 2: Supply Chain Disruptions
  const supplyChainEvents = events.filter(e => 
    e.category === 'supply_chain' || 
    (e.impact_tags && e.impact_tags.includes('supply-chain'))
  );
  
  if (supplyChainEvents.length >= 3) {
    const recent = supplyChainEvents.filter(e => {
      const eventDate = new Date(e.date);
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
      return eventDate > sixtyDaysAgo;
    });
    
    if (recent.length >= 2) {
      patterns.push({
        type: 'disruption',
        severity: 'high',
        title: 'Multiple Supply Chain Disruptions',
        description: `${recent.length} supply chain events detected in last 60 days. Expect delays in procurement and increased costs for construction materials.`,
        affectedRegions: [...new Set(recent.map(e => e.region))],
        impactedIndustries: ['construction', 'logistics', 'procurement'],
        relatedEvents: recent.map(e => e.id!),
        confidence: 0.9
      });
    }
  }
  
  // Pattern 3: Commodity Price Pressure
  const commodityEvents = events.filter(e => 
    (e.impact_tags && (
      e.impact_tags.includes('commodities') ||
      e.impact_tags.includes('construction')
    )) &&
    (e.category === 'economy' || e.category === 'trade')
  );
  
  if (commodityEvents.length >= 4) {
    const recent = commodityEvents.filter(e => {
      const eventDate = new Date(e.date);
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      return eventDate > ninetyDaysAgo;
    });
    
    if (recent.length >= 3) {
      patterns.push({
        type: 'trend',
        severity: 'medium',
        title: 'Rising Commodity Cost Pressure',
        description: `${recent.length} events affecting commodity prices for construction materials. Monitor steel, copper, and cement procurement costs.`,
        affectedRegions: ['Global'],
        impactedIndustries: ['construction', 'procurement'],
        relatedEvents: recent.map(e => e.id!),
        confidence: 0.75
      });
    }
  }
  
  // Pattern 4: Regional Trade Opportunities
  const tradeEvents = byCategory['trade'] || [];
  const recentTrade = tradeEvents.filter(e => {
    const eventDate = new Date(e.date);
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    return eventDate > ninetyDaysAgo && e.severity <= 6; // Lower severity = positive trade news
  });
  
  if (recentTrade.length >= 2) {
    patterns.push({
      type: 'opportunity',
      severity: 'low',
      title: 'Trade Agreement Opportunities',
      description: `${recentTrade.length} positive trade developments could reduce procurement costs or open new markets.`,
      affectedRegions: [...new Set(recentTrade.map(e => e.region))],
      impactedIndustries: ['construction', 'procurement', 'logistics'],
      relatedEvents: recentTrade.map(e => e.id!),
      confidence: 0.7
    });
  }
  
  // Pattern 5: Energy Market Volatility
  const energyEvents = events.filter(e => 
    e.category === 'energy' || 
    (e.impact_tags && e.impact_tags.includes('energy'))
  );
  
  if (energyEvents.length >= 3) {
    const recent = energyEvents.filter(e => {
      const eventDate = new Date(e.date);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return eventDate > thirtyDaysAgo;
    });
    
    if (recent.length >= 2) {
      const avgSeverity = recent.reduce((sum, e) => sum + e.severity, 0) / recent.length;
      patterns.push({
        type: avgSeverity >= 7 ? 'disruption' : 'trend',
        severity: avgSeverity >= 7 ? 'high' : 'medium',
        title: 'Energy Market Instability',
        description: `${recent.length} energy-related events in last 30 days. Monitor logistics and transportation costs.`,
        affectedRegions: [...new Set(recent.map(e => e.region))],
        impactedIndustries: ['logistics', 'construction', 'supply-chain'],
        relatedEvents: recent.map(e => e.id!),
        confidence: 0.8
      });
    }
  }
  
  return patterns;
}

// Generate insights from patterns
async function generateInsights(patterns: Pattern[]): Promise<void> {
  console.log('\n🧠 Generating AI insights...\n');
  
  const today = new Date().toISOString().split('T')[0];
  
  // Check if we already have insights for today
  const existingInsights = getInsights('ai_analysis', 10);
  const hasToday = existingInsights.some(i => i.date === today);
  
  if (hasToday) {
    console.log('  ℹ️  Insights already generated for today');
    return;
  }
  
  // Create insight for each critical/high pattern
  let created = 0;
  for (const pattern of patterns) {
    if (pattern.severity === 'critical' || pattern.severity === 'high') {
      createInsight({
        title: pattern.title,
        content: pattern.description,
        category: 'ai_analysis',
        impact_level: pattern.severity,
        relevant_industries: JSON.stringify(pattern.impactedIndustries),
        related_events: JSON.stringify(pattern.relatedEvents),
        date: today
      });
      created++;
      console.log(`  ✅ Created insight: ${pattern.title}`);
    }
  }
  
  // Create daily summary if patterns exist
  if (patterns.length > 0) {
    const summary = generateDailySummary(patterns);
    createInsight({
      title: `Daily Intelligence Brief - ${today}`,
      content: summary,
      category: 'daily_brief',
      impact_level: patterns.some(p => p.severity === 'critical') ? 'critical' : 'high',
      relevant_industries: JSON.stringify(['construction', 'logistics', 'procurement']),
      related_events: JSON.stringify([]),
      date: today
    });
    created++;
    console.log(`  ✅ Created daily brief`);
  }
  
  console.log(`\n✅ Generated ${created} insights`);
}

function generateDailySummary(patterns: Pattern[]): string {
  const critical = patterns.filter(p => p.severity === 'critical');
  const high = patterns.filter(p => p.severity === 'high');
  const medium = patterns.filter(p => p.severity === 'medium');
  
  let summary = '**GEOPOLITICAL INTELLIGENCE DAILY BRIEF**\n\n';
  
  if (critical.length > 0) {
    summary += '🚨 **CRITICAL ALERTS:**\n';
    for (const p of critical) {
      summary += `- ${p.title}: ${p.description}\n`;
    }
    summary += '\n';
  }
  
  if (high.length > 0) {
    summary += '⚠️ **HIGH PRIORITY:**\n';
    for (const p of high) {
      summary += `- ${p.title}: ${p.description}\n`;
    }
    summary += '\n';
  }
  
  if (medium.length > 0) {
    summary += '📊 **MONITORING:**\n';
    for (const p of medium) {
      summary += `- ${p.title}\n`;
    }
    summary += '\n';
  }
  
  summary += '**RECOMMENDATION:** Review related events and assess impact on current projects and procurement plans.';
  
  return summary;
}

// Generate alerts for significant changes
function generateAlerts(patterns: Pattern[]): string[] {
  const alerts: string[] = [];
  
  for (const pattern of patterns) {
    if (pattern.severity === 'critical') {
      alerts.push(
        `🚨 CRITICAL ALERT: ${pattern.title}\n\n` +
        `${pattern.description}\n\n` +
        `Affected: ${pattern.affectedRegions.join(', ')}\n` +
        `Industries: ${pattern.impactedIndustries.join(', ')}\n` +
        `Confidence: ${Math.round(pattern.confidence * 100)}%`
      );
    } else if (pattern.severity === 'high' && pattern.confidence >= 0.8) {
      alerts.push(
        `⚠️ HIGH PRIORITY: ${pattern.title}\n\n` +
        `${pattern.description}\n\n` +
        `Regions: ${pattern.affectedRegions.join(', ')}`
      );
    }
  }
  
  return alerts;
}

// Main analysis function
async function runAnalysis(): Promise<{
  patterns: Pattern[];
  alerts: string[];
}> {
  console.log('🌍 Geopolitical Intelligence - AI Analysis\n');
  console.log(`Started: ${new Date().toISOString()}\n`);
  
  try {
    // Analyze patterns
    console.log('🔍 Analyzing event patterns...');
    const patterns = analyzePatterns();
    console.log(`   Found ${patterns.length} patterns\n`);
    
    // Show pattern summary
    const bySeverity = {
      critical: patterns.filter(p => p.severity === 'critical').length,
      high: patterns.filter(p => p.severity === 'high').length,
      medium: patterns.filter(p => p.severity === 'medium').length,
      low: patterns.filter(p => p.severity === 'low').length
    };
    
    console.log('📊 Pattern breakdown:');
    if (bySeverity.critical > 0) console.log(`   🚨 Critical: ${bySeverity.critical}`);
    if (bySeverity.high > 0) console.log(`   ⚠️  High: ${bySeverity.high}`);
    if (bySeverity.medium > 0) console.log(`   📊 Medium: ${bySeverity.medium}`);
    if (bySeverity.low > 0) console.log(`   ℹ️  Low: ${bySeverity.low}`);
    
    // Generate insights
    await generateInsights(patterns);
    
    // Generate alerts
    const alerts = generateAlerts(patterns);
    
    if (alerts.length > 0) {
      console.log(`\n🔔 Generated ${alerts.length} alerts`);
    } else {
      console.log('\n✅ No critical alerts at this time');
    }
    
    console.log(`\nFinished: ${new Date().toISOString()}`);
    
    return { patterns, alerts };
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  runAnalysis()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Analysis failed:', error);
      process.exit(1);
    });
}

export { runAnalysis, analyzePatterns, generateAlerts };
