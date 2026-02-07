import { NextResponse } from 'next/server';
import { getCountries } from '@/lib/db';

export async function GET() {
  try {
    const countries = getCountries();
    return NextResponse.json({ countries, count: countries.length });
  } catch (error) {
    console.error('Error fetching countries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch countries' },
      { status: 500 }
    );
  }
}
