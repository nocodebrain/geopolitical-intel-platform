#!/usr/bin/env tsx
import { seedAllData } from '../lib/data-collection/seed-data';
import { getDb, closeDb } from '../lib/db';

async function main() {
  try {
    console.log('Initializing database...');
    getDb(); // This will create tables if they don't exist
    
    console.log('Seeding data...');
    seedAllData();
    
    console.log('\nDatabase seeding completed successfully!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    closeDb();
  }
}

main();
