#!/usr/bin/env tsx
/**
 * Australian Intelligence Platform - Startup Initialization
 * Runs on Railway deployment to ensure database has Australian-centric data
 */

import { getDb, getStatistics, closeDb } from '../lib/db';
import { seedAllData } from '../lib/data-collection/seed-data';
import { collectAustralianIntelligence } from './collect-australian-intel';
import { collectAustralianEconomicData } from './collect-australian-economic-data';

async function initializeOnStartup() {
  console.log('🇦🇺 Australian Intelligence Platform - Startup Initialization\n');
  console.log('='.repeat(60));

  try {
    // Initialize database connection and schema
    const db = getDb();
    console.log('✅ Database connection established');

    // Check if database has data
    const stats = getStatistics();
    console.log(`\n📊 Current database state:`);
    console.log(`   - Events: ${stats.totalEvents}`);
    console.log(`   - Connections: ${stats.totalConnections}`);
    console.log(`   - Countries: ${stats.totalCountries}`);

    // If database is empty, initialize with seed data
    if (stats.totalEvents === 0) {
      console.log('\n⚠️  Database is empty - initializing...\n');
      
      // Seed basic data structure
      console.log('📦 Seeding initial data structure...');
      seedAllData();
      console.log('✅ Seed data loaded');
      
      // Collect Australian economic data first (fast)
      console.log('\n📊 Collecting Australian economic indicators...');
      try {
        await collectAustralianEconomicData();
      } catch (error) {
        console.error('⚠️  Economic data collection failed:', error);
      }
      
      // Collect initial Australian intelligence (may take time)
      console.log('\n🇦🇺 Collecting initial Australian intelligence...');
      console.log('   (This may take 1-2 minutes on first run)\n');
      try {
        await Promise.race([
          collectAustralianIntelligence(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 60000)
          )
        ]);
      } catch (error) {
        console.warn('⚠️  Initial collection timed out - will continue in background');
      }
      
      const finalStats = getStatistics();
      console.log('\n' + '='.repeat(60));
      console.log('✅ Australian Intelligence Platform Ready!');
      console.log('='.repeat(60));
      console.log(`📊 Database state:`);
      console.log(`   - Events: ${finalStats.totalEvents}`);
      console.log(`   - Connections: ${finalStats.totalConnections}`);
      console.log(`   - Countries: ${finalStats.totalCountries}`);
      console.log('='.repeat(60) + '\n');
    } else {
      console.log('\n✅ Database already initialized');
      console.log('   Run "npm run collect" to update intelligence\n');
    }

  } catch (error) {
    console.error('❌ Error during startup initialization:', error);
    console.log('\n⚠️  Platform will start with existing data\n');
    // Don't exit - let the app start even if initialization fails
  } finally {
    closeDb();
  }
}

// Run initialization
initializeOnStartup().catch(console.error);
