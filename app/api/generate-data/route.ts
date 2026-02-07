import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST() {
  try {
    console.log('Running data generation...');
    
    const { stdout, stderr } = await execAsync('npx tsx scripts/generate-missing-data.ts', {
      cwd: process.cwd(),
      timeout: 45000
    });
    
    return NextResponse.json({
      status: 'success',
      output: stdout,
      errors: stderr || null
    });
    
  } catch (error: any) {
    console.error('Generation failed:', error);
    return NextResponse.json({
      status: 'error',
      message: error.message,
      output: error.stdout || null,
      errors: error.stderr || null
    }, { status: 500 });
  }
}
