import { NextRequest, NextResponse } from 'next/server';
import { getInsights, getLatestDailyBrief } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20;
    
    if (category === 'daily_brief') {
      const brief = getLatestDailyBrief();
      return NextResponse.json({ insight: brief });
    }
    
    const insights = getInsights(category, limit);
    return NextResponse.json({ insights, count: insights.length });
    
  } catch (error) {
    console.error('Error fetching insights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch insights' },
      { status: 500 }
    );
  }
}
