import { NextResponse } from 'next/server';
import { getAllConnections } from '@/lib/db';

export async function GET() {
  try {
    const connections = getAllConnections();
    return NextResponse.json({ connections, count: connections.length });
  } catch (error) {
    console.error('Error fetching connections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch connections' },
      { status: 500 }
    );
  }
}
