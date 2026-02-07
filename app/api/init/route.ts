import { NextResponse } from 'next/server';
import { getDb, getEvents, getStatistics } from '@/lib/db';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes

export async function POST() {
  try {
    console.log('Initializing database...');
    
    // Initialize database schema (this creates tables)
    getDb();
    
    // Check if already has data
    const stats = getStatistics();
    if (stats.totalEvents > 0) {
      return NextResponse.json({
        status: 'already_initialized',
        message: 'Database already contains data',
        stats
      });
    }

    // Run initialization scripts
    console.log('Running backfill...');
    await execAsync('npm run backfill', { 
      cwd: process.cwd(),
      timeout: 60000 
    });
    
    console.log('Collecting live data...');
    await execAsync('npm run collect', { 
      cwd: process.cwd(),
      timeout: 90000 
    });
    
    console.log('Running analysis...');
    await execAsync('npm run analyze', { 
      cwd: process.cwd(),
      timeout: 30000 
    });
    
    const finalStats = getStatistics();
    
    return NextResponse.json({
      status: 'success',
      message: 'Database initialized successfully',
      stats: finalStats
    });
    
  } catch (error: any) {
    console.error('Initialization failed:', error);
    return NextResponse.json({
      status: 'error',
      message: error.message,
      details: error.stderr || error.stdout
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const stats = getStatistics();
    const isInitialized = stats.totalEvents > 0;
    
    return NextResponse.json({
      initialized: isInitialized,
      stats,
      message: isInitialized 
        ? 'Database is initialized' 
        : 'Database needs initialization - POST to /api/init to initialize'
    });
  } catch (error: any) {
    return NextResponse.json({
      initialized: false,
      error: error.message
    }, { status: 500 });
  }
}
