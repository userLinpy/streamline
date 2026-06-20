import { XMLParser } from 'fast-xml-parser'
import type { TechItem } from '@/types'

type AnyRecord = Record<string, unknown>

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function domainInitials(url: string): string {
  try {
    const h = new URL(url).hostname.replace(/^www\./, '')
    return h.slice(0, 2).toUpperCase()
  } catch {
    return 'RS'
  }
}

function parseDate(val: unknown): string {
  if (!val) return new Date().toISOString()
  const d = new Date(String(val))
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString()
}

function str(val: unknown): string {
  if (!val) return ''
  if (typeof val === 'string') return val
  if (typeof val === 'object' && val !== null && '#text' in val) {
    return String((val as AnyRecord)['#text'])
  }
  return String(val)
}

export async function fetchRSSFeed(url: string): Promise<TechItem[]> {
  const res = await fetch(url, {
    headers: {
      Accept: 'application/rss+xml, application/xml, application/atom+xml, text/xml, */*',
    },
    next: { revalidate: 1800 },
  })
  if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`)

  const xml = await res.text()

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    textNodeName: '#text',
    isArray: name => ['item', 'entry', 'link'].includes(name),
  })

  const parsed = parser.parse(xml) as AnyRecord

  const isAtom = !!parsed.feed
  const channel: AnyRecord = isAtom
    ? (parsed.feed as AnyRecord)
    : ((parsed.rss as AnyRecord)?.channel as AnyRecord)

  if (!channel) throw new Error('Format de flux non reconnu (RSS 2.0 ou Atom attendu)')

  const feedTitle = str(channel.title)
  const rawItems = (isAtom ? channel.entry : channel.item) as AnyRecord[]
  if (!Array.isArray(rawItems) || rawItems.length === 0) return []

  return rawItems.slice(0, 20).map((entry, i) => {
    let title: string
    let link: string
    let description: string
    let pubDate: unknown

    if (isAtom) {
      title = str(entry.title)
      const links = (entry.link ?? []) as AnyRecord[]
      const altLink = links.find(l => l['@_rel'] === 'alternate') ?? links[0]
      link = str(altLink?.['@_href'])
      description = str(entry.summary) || str(entry.content)
      pubDate = entry.updated ?? entry.published
    } else {
      title = str(entry.title)
      link = str(entry.link) || str(entry.guid)
      description = str(entry.description) || str(entry['content:encoded'])
      pubDate = entry.pubDate ?? entry['dc:date']
    }

    const plainDesc = stripHtml(description).slice(0, 200)
    const initials = domainInitials(link || url)
    const rawId = `${feedTitle}-${link || String(i)}`
    const id = `rss-${Buffer.from(rawId).toString('base64').slice(0, 16)}`

    return {
      id,
      source: 'rss' as const,
      title: title || 'Sans titre',
      description: plainDesc || feedTitle || 'Flux RSS',
      url: link,
      tags: [],
      stars: 0,
      readTime: 0,
      publishedAt: parseDate(pubDate),
      coverInitials: initials,
    }
  })
}
