import { NextRequest, NextResponse } from 'next/server';
import { getEvents, searchEvents, getStatistics } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    
    if (search) {
      const results = searchEvents(search, 100);
      return NextResponse.json({ events: results, count: results.length });
    }
    
    const filters = {
      category: searchParams.get('category') || undefined,
      region: searchParams.get('region') || undefined,
      country: searchParams.get('country') || undefined,
      severity: searchParams.get('severity') ? parseInt(searchParams.get('severity')!) : undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0
    };
    
    const events = getEvents(filters);
    
    return NextResponse.json({
      events,
      count: events.length,
      filters
    });
    
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
