/**
 * Australian Business Impact Analyzer
 * Generates "Why this matters to Australia" analysis for each event
 */

import OpenAI from 'openai';

let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI | null {
  if (openai) return openai;
  
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log('OpenAI API key not found - using rule-based analysis only');
    return null;
  }
  
  openai = new OpenAI({ apiKey });
  return openai;
}

export interface AustralianImpact {
  summary: string; // One-liner: "Why this matters to Australia"
  detailedAnalysis: string; // 2-3 paragraphs
  affectedIndustries: string[]; // construction, logistics, mining, etc.
  tradeImpact: string | null; // Impact on Australian trade
  supplyChainImpact: string | null; // Supply chain disruptions
  commodityImpact: string | null; // Impact on commodity prices
  recommendation: string; // What Australian businesses should do
  timeframe: 'immediate' | 'short-term' | 'medium-term' | 'long-term';
  confidenceScore: number; // 0-100
}

/**
 * Analyze event impact on Australian businesses using AI
 */
export async function analyzeAustralianImpact(
  title: string,
  description: string,
  category: string,
  severity: number,
  country: string,
  region: string
): Promise<AustralianImpact> {
  const client = getOpenAIClient();
  
  if (!client) {
    return generateRuleBasedImpact(title, description, category, severity, country, region);
  }
  
  try {
    const prompt = `You are a strategic analyst advising Australian business executives (construction, logistics, procurement, mining sectors).

Analyze this geopolitical event from an AUSTRALIAN BUSINESS PERSPECTIVE:

**Event:** ${title}
**Details:** ${description}
**Category:** ${category}
**Severity:** ${severity}/10
**Location:** ${country}, ${region}

Provide a structured analysis:

1. **One-line summary** (15-20 words): Why this matters to Australian businesses
2. **Detailed analysis** (150-200 words): Specific impacts on Australian operations, trade, supply chains
3. **Affected industries** (array): Which Australian industries are impacted (construction, logistics, mining, agriculture, energy, manufacturing, procurement)
4. **Trade impact**: How does this affect Australian imports/exports?
5. **Supply chain impact**: Delays, disruptions, route changes affecting Australian businesses?
6. **Commodity impact**: Effects on iron ore, coal, LNG, wheat, gold prices?
7. **Recommendation** (50-75 words): What should Australian businesses DO about this?
8. **Timeframe**: immediate (0-1 month), short-term (1-3 months), medium-term (3-12 months), long-term (1+ years)
9. **Confidence score** (0-100): How confident are you in this analysis?

Focus on ACTIONABLE intelligence. Be specific. Use Australian context (e.g., "Port of Melbourne delays", "BHP iron ore exports", "AUD exchange rate").

Return as JSON:
{
  "summary": "...",
  "detailedAnalysis": "...",
  "affectedIndustries": ["construction", "logistics"],
  "tradeImpact": "..." or null,
  "supplyChainImpact": "..." or null,
  "commodityImpact": "..." or null,
  "recommendation": "...",
  "timeframe": "short-term",
  "confidenceScore": 75
}`;
    
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a strategic analyst for Australian businesses. Provide practical, actionable intelligence focused on construction, logistics, procurement, and mining sectors. Always think: "How does this affect Australian operations, supply chains, and profitability?"'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.4,
      max_tokens: 800,
      response_format: { type: 'json_object' }
    });
    
    const content = response.choices[0].message.content || '{}';
    const impact = JSON.parse(content);
    
    // Validate and return
    return {
      summary: impact.summary || 'Impact on Australian businesses',
      detailedAnalysis: impact.detailedAnalysis || '',
      affectedIndustries: impact.affectedIndustries || [],
      tradeImpact: impact.tradeImpact || null,
      supplyChainImpact: impact.supplyChainImpact || null,
      commodityImpact: impact.commodityImpact || null,
      recommendation: impact.recommendation || 'Monitor situation closely',
      timeframe: impact.timeframe || 'medium-term',
      confidenceScore: impact.confidenceScore || 50
    };
    
  } catch (error) {
    console.error('AI impact analysis failed:', error);
    return generateRuleBasedImpact(title, description, category, severity, country, region);
  }
}

/**
 * Rule-based impact analysis (fallback when AI not available)
 */
function generateRuleBasedImpact(
  title: string,
  description: string,
  category: string,
  severity: number,
  country: string,
  region: string
): AustralianImpact {
  const text = `${title} ${description}`.toLowerCase();
  const affectedIndustries: string[] = [];
  let summary = '';
  let detailedAnalysis = '';
  let tradeImpact: string | null = null;
  let supplyChainImpact: string | null = null;
  let commodityImpact: string | null = null;
  let recommendation = '';
  let timeframe: AustralianImpact['timeframe'] = 'medium-term';
  
  // Determine affected industries
  if (text.includes('construction') || text.includes('building') || text.includes('infrastructure')) {
    affectedIndustries.push('construction');
  }
  if (text.includes('shipping') || text.includes('freight') || text.includes('logistics') || text.includes('port')) {
    affectedIndustries.push('logistics');
  }
  if (text.includes('mining') || text.includes('iron ore') || text.includes('coal')) {
    affectedIndustries.push('mining');
  }
  if (text.includes('procurement') || text.includes('supply chain')) {
    affectedIndustries.push('procurement');
  }
  if (text.includes('agriculture') || text.includes('farming') || text.includes('wheat') || text.includes('beef')) {
    affectedIndustries.push('agriculture');
  }
  if (text.includes('energy') || text.includes('lng') || text.includes('gas') || text.includes('oil')) {
    affectedIndustries.push('energy');
  }
  
  // China-specific impacts
  if (country.toLowerCase().includes('china') || text.includes('china') || text.includes('chinese')) {
    summary = 'China event - Australia\'s largest trading partner affected';
    detailedAnalysis = 'China is Australia\'s largest trading partner, accounting for over 30% of Australian exports (primarily iron ore, coal, LNG, and education). Any disruption in China has direct implications for Australian businesses, particularly in the mining and education sectors. Supply chain routes through the South China Sea may be affected.';
    tradeImpact = 'High impact - China is Australia\'s #1 trade partner (A$250B+ annually)';
    
    if (text.includes('iron ore') || text.includes('coal')) {
      commodityImpact = 'Direct impact on Australian mining exports - monitor BHP, Rio Tinto, Fortescue operations';
    }
    
    if (severity >= 7) {
      recommendation = 'URGENT: Diversify supply chains away from China. Review contract exposure. Secure alternative markets (Japan, South Korea, India). Monitor AUD/CNY exchange rate closely.';
      timeframe = 'immediate';
    } else {
      recommendation = 'Monitor China developments closely. Review supply chain dependencies. Consider hedging strategies for commodity price volatility.';
      timeframe = 'short-term';
    }
  }
  
  // Supply chain disruptions
  if (text.includes('supply chain') || text.includes('shipping') || text.includes('port') || text.includes('container')) {
    supplyChainImpact = 'Potential delays in Australian imports/exports. Monitor shipping routes and container availability.';
    
    if (text.includes('south china sea') || text.includes('malacca strait')) {
      supplyChainImpact = 'CRITICAL: Major shipping route affected. 60%+ of Australian trade passes through this region. Expect delays and cost increases.';
      summary = 'Critical shipping route disruption - affects most Australian trade';
      timeframe = 'immediate';
    }
  }
  
  // Commodity impacts
  if (text.includes('iron ore') || text.includes('coal') || text.includes('lng')) {
    commodityImpact = 'Australian export commodities affected. Monitor spot prices and forward contracts.';
    affectedIndustries.push('mining');
  }
  
  // Taiwan tensions
  if (text.includes('taiwan')) {
    summary = 'Taiwan tensions - semiconductor supply chain and regional stability risk';
    detailedAnalysis = 'Taiwan produces 60%+ of global semiconductors, critical for Australian construction equipment, vehicles, and technology. Any conflict would disrupt Australian supply chains and increase costs. Regional instability also affects trade routes through the South China Sea.';
    supplyChainImpact = 'High risk to semiconductor supply - affects construction equipment, vehicles, electronics procurement';
    affectedIndustries.push('construction', 'logistics', 'procurement');
    recommendation = 'Secure semiconductor-dependent equipment early. Review supply chain for Taiwan exposure. Monitor insurance and shipping costs.';
    timeframe = 'short-term';
  }
  
  // US-related events
  if (country.toLowerCase().includes('united states') || text.includes('us') || text.includes('america')) {
    summary = 'US event - key trade partner and economic indicator';
    detailedAnalysis = 'The United States is Australia\'s 3rd largest trading partner and key economic indicator. US economic health, interest rates, and trade policies directly impact the AUD exchange rate, commodity demand, and Australian business confidence.';
    tradeImpact = 'Moderate impact - affects AUD exchange rate and commodity demand';
  }
  
  // Default values
  if (!summary) {
    if (severity >= 7) {
      summary = `High severity ${category} event - potential impact on Australian operations`;
    } else {
      summary = `${category} event in ${region} - monitor for Australian implications`;
    }
  }
  
  if (!detailedAnalysis) {
    detailedAnalysis = `This ${category} event in ${region} may have indirect effects on Australian businesses through trade relationships, supply chain routes, or commodity markets. Monitoring recommended.`;
  }
  
  if (!recommendation) {
    if (severity >= 7) {
      recommendation = 'Monitor situation closely. Review supply chain exposure. Consider contingency planning.';
    } else {
      recommendation = 'Continue monitoring. No immediate action required unless situation escalates.';
    }
  }
  
  if (affectedIndustries.length === 0) {
    affectedIndustries.push('general');
  }
  
  // Determine timeframe based on severity
  if (severity >= 8) {
    timeframe = 'immediate';
  } else if (severity >= 6) {
    timeframe = 'short-term';
  } else if (severity >= 4) {
    timeframe = 'medium-term';
  } else {
    timeframe = 'long-term';
  }
  
  const confidenceScore = 60; // Rule-based has moderate confidence
  
  return {
    summary,
    detailedAnalysis,
    affectedIndustries,
    tradeImpact,
    supplyChainImpact,
    commodityImpact,
    recommendation,
    timeframe,
    confidenceScore
  };
}

/**
 * Batch analyze multiple events (efficient for bulk processing)
 */
export async function batchAnalyzeAustralianImpact(
  events: Array<{
    title: string;
    description: string;
    category: string;
    severity: number;
    country: string;
    region: string;
  }>,
  maxConcurrent: number = 5
): Promise<AustralianImpact[]> {
  const results: AustralianImpact[] = [];
  
  // Process in batches to avoid rate limits
  for (let i = 0; i < events.length; i += maxConcurrent) {
    const batch = events.slice(i, i + maxConcurrent);
    
    const batchResults = await Promise.all(
      batch.map(event => 
        analyzeAustralianImpact(
          event.title,
          event.description,
          event.category,
          event.severity,
          event.country,
          event.region
        )
      )
    );
    
    results.push(...batchResults);
    
    // Rate limiting
    if (i + maxConcurrent < events.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}
