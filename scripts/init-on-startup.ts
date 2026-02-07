#!/usr/bin/env tsx
/**
 * Automatic Database Initialization Script
 * Runs on Railway startup to ensure database has data
 * Checks if database is empty and seeds it if needed
 */

import { getDb, getStatistics, closeDb } from '../lib/db';
import { seedAllData } from '../lib/data-collection/seed-data';
import { collectEconomicData } from './collect-economic-data';

async function initializeOnStartup() {
  console.log('🚀 Railway Startup: Checking database state...\n');

  try {
    // Initialize database connection and schema
    const db = getDb();
    console.log('✅ Database connection established');

    // Check if database has data
    const stats = getStatistics();
    console.log(`📊 Current database stats:`);
    console.log(`   - Events: ${stats.totalEvents}`);
    console.log(`   - Connections: ${stats.totalConnections}`);
    console.log(`   - Countries: ${stats.totalCountries}`);

    // If database is empty, seed it
    if (stats.totalEvents === 0) {
      console.log('\n⚠️  Database is empty - initializing with seed data...\n');
      
      // Seed basic data (events, countries, connections, insights)
      seedAllData();
      
      // Collect economic indicators
      console.log('\n📈 Collecting economic indicators...');
      await collectEconomicData();
      
      const finalStats = getStatistics();
      console.log('\n✅ Database initialization completed!');
      console.log(`📊 Final stats:`);
      console.log(`   - Events: ${finalStats.totalEvents}`);
      console.log(`   - Connections: ${finalStats.totalConnections}`);
      console.log(`   - Countries: ${finalStats.totalCountries}\n`);
    } else {
      console.log('✅ Database already contains data - skipping initialization\n');
    }

  } catch (error) {
    console.error('❌ Error during startup initialization:', error);
    // Don't exit - let the app start even if initialization fails
  } finally {
    closeDb();
  }
}

// Run initialization
initializeOnStartup().catch(console.error);
