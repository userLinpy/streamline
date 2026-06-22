import { NextResponse } from 'next/server'
import { fetchHackerNews } from '@/lib/hackernews'

export async function GET() {
  const items = await fetchHackerNews()
  return NextResponse.json(items)
}
