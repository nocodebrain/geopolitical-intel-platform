#!/usr/bin/env tsx
/**
 * Alert Notification System
 * Sends critical alerts via Telegram when significant changes detected
 */

import { runAnalysis } from './ai-analysis';
import { getInsights } from '../lib/db';

// Alert thresholds
const ALERT_CONFIG = {
  minSeverity: 'high', // 'high' or 'critical'
  minConfidence: 0.75,
  cooldownMinutes: 60, // Don't spam - send max once per hour
  telegramEnabled: true
};

interface AlertMessage {
  severity: 'critical' | 'high';
  title: string;
  body: string;
  timestamp: string;
}

let lastAlertTime = 0;

async function sendTelegramAlert(message: string): Promise<void> {
  // This will be called by OpenClaw's message tool
  console.log('\n📱 TELEGRAM ALERT:\n');
  console.log('─'.repeat(60));
  console.log(message);
  console.log('─'.repeat(60));
  
  // In production, OpenClaw will handle the actual Telegram send
  // via the message tool when this script is called from cron
}

async function checkAndSendAlerts(): Promise<void> {
  console.log('🔔 Checking for alerts...\n');
  
  // Check cooldown
  const now = Date.now();
  const minutesSinceLastAlert = (now - lastAlertTime) / 1000 / 60;
  
  if (minutesSinceLastAlert < ALERT_CONFIG.cooldownMinutes && lastAlertTime > 0) {
    console.log(`   ⏳ Cooldown active (${Math.round(ALERT_CONFIG.cooldownMinutes - minutesSinceLastAlert)} min remaining)`);
    return;
  }
  
  // Run analysis
  const { patterns, alerts } = await runAnalysis();
  
  // Filter alerts by config
  const criticalAlerts = alerts.filter(a => a.includes('🚨 CRITICAL'));
  const highAlerts = alerts.filter(a => a.includes('⚠️ HIGH'));
  
  let alertsToSend: string[] = [];
  
  if (ALERT_CONFIG.minSeverity === 'critical') {
    alertsToSend = criticalAlerts;
  } else {
    alertsToSend = [...criticalAlerts, ...highAlerts];
  }
  
  if (alertsToSend.length === 0) {
    console.log('   ✅ No alerts meet threshold criteria');
    return;
  }
  
  // Get latest daily brief
  const dailyBrief = getInsights('daily_brief', 1)[0];
  
  // Compose alert message
  let message = '🌍 **GEOPOLITICAL INTELLIGENCE ALERT**\n\n';
  message += `${new Date().toISOString().split('T')[0]}\n\n`;
  
  message += alertsToSend.join('\n\n' + '─'.repeat(40) + '\n\n');
  
  if (dailyBrief) {
    message += '\n\n📋 **DAILY BRIEF:**\n';
    message += dailyBrief.content;
  }
  
  message += '\n\n🔗 View full analysis: [Dashboard URL]';
  
  // Send alert
  if (ALERT_CONFIG.telegramEnabled) {
    await sendTelegramAlert(message);
    lastAlertTime = now;
    console.log('\n✅ Alert sent successfully');
  } else {
    console.log('\n⚠️  Telegram disabled - alert logged only');
  }
  
  // Save alert state
  console.log(`\n📊 Alert summary:`);
  console.log(`   Critical: ${criticalAlerts.length}`);
  console.log(`   High: ${highAlerts.length}`);
  console.log(`   Sent: ${alertsToSend.length}`);
}

// Run if executed directly
if (require.main === module) {
  checkAndSendAlerts()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Alert check failed:', error);
      process.exit(1);
    });
}

export { checkAndSendAlerts, ALERT_CONFIG };
