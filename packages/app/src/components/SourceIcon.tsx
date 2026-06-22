import { Package, Rss } from 'lucide-react'
import { getIconData } from '@/lib/icons'
import type { TechItem } from '@/types'

const SOURCE_SLUG: Partial<Record<TechItem['source'], string>> = {
  github: 'github',
  devto: 'devto',
  hackernews: 'ycombinator',
}

type Props = {
  source: TechItem['source']
  size?: number
  className?: string
}

export function SourceIcon({ source, size = 12, className }: Props) {
  const slug = SOURCE_SLUG[source]
  if (slug) {
    const iconData = getIconData(slug)
    if (iconData) {
      return (
        <span
          dangerouslySetInnerHTML={{ __html: iconData.svg }}
          style={{ width: size, height: size, color: `#${iconData.hex}`, display: 'inline-flex', flexShrink: 0 }}
          className={`[&>svg]:w-full [&>svg]:h-full ${className ?? ''}`}
        />
      )
    }
  }
  if (source === 'github-release') return <Package size={size} className={className} />
  if (source === 'rss') return <Rss size={size} className={className} />
  return null
}
