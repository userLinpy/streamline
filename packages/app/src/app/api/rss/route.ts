import { NextRequest, NextResponse } from 'next/server'
import { fetchRSSFeed } from '@/lib/rss'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) {
    return NextResponse.json({ error: 'Paramètre url manquant' }, { status: 400 })
  }

  try {
    const items = await fetchRSSFeed(url)
    return NextResponse.json(items)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
