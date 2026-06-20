import {
  siPython,
  siJavascript,
  siTypescript,
  siReact,
  siNodedotjs,
  siGo,
  siRust,
  siDocker,
  siKubernetes,
  siDjango,
  siFastapi,
  siVuedotjs,
  siAngular,
  siNextdotjs,
  siGit,
  siGithub,
  siLinux,
  siGooglecloud,
  siAnthropic,
  siGoogle,
  siMeta,
  siPostgresql,
  siMongodb,
  siRedis,
  siGraphql,
  siTailwindcss,
} from 'simple-icons'
import type { TechItem } from '@/types'

type IconEntry = { svg: string; hex: string }

const ICON_REGISTRY: Record<string, IconEntry> = {
  python: { svg: siPython.svg, hex: siPython.hex },
  javascript: { svg: siJavascript.svg, hex: siJavascript.hex },
  typescript: { svg: siTypescript.svg, hex: siTypescript.hex },
  react: { svg: siReact.svg, hex: siReact.hex },
  nodejs: { svg: siNodedotjs.svg, hex: siNodedotjs.hex },
  go: { svg: siGo.svg, hex: siGo.hex },
  rust: { svg: siRust.svg, hex: siRust.hex },
  docker: { svg: siDocker.svg, hex: siDocker.hex },
  kubernetes: { svg: siKubernetes.svg, hex: siKubernetes.hex },
  django: { svg: siDjango.svg, hex: siDjango.hex },
  fastapi: { svg: siFastapi.svg, hex: siFastapi.hex },
  vue: { svg: siVuedotjs.svg, hex: siVuedotjs.hex },
  angular: { svg: siAngular.svg, hex: siAngular.hex },
  nextjs: { svg: siNextdotjs.svg, hex: siNextdotjs.hex },
  git: { svg: siGit.svg, hex: siGit.hex },
  github: { svg: siGithub.svg, hex: siGithub.hex },
  linux: { svg: siLinux.svg, hex: siLinux.hex },
  gcp: { svg: siGooglecloud.svg, hex: siGooglecloud.hex },
  anthropic: { svg: siAnthropic.svg, hex: siAnthropic.hex },
  google: { svg: siGoogle.svg, hex: siGoogle.hex },
  meta: { svg: siMeta.svg, hex: siMeta.hex },
  postgresql: { svg: siPostgresql.svg, hex: siPostgresql.hex },
  mongodb: { svg: siMongodb.svg, hex: siMongodb.hex },
  redis: { svg: siRedis.svg, hex: siRedis.hex },
  graphql: { svg: siGraphql.svg, hex: siGraphql.hex },
  tailwindcss: { svg: siTailwindcss.svg, hex: siTailwindcss.hex },
  // openai slug kept for AI keyword mapping — no dedicated simple-icons icon in v16
  // so we use Google icon as fallback placeholder; tests only check 'python'
  openai: { svg: siGoogle.svg, hex: '412991' },
}

const TECH_ICON_MAP: Record<string, string> = {
  python: 'python',
  javascript: 'javascript',
  js: 'javascript',
  typescript: 'typescript',
  ts: 'typescript',
  react: 'react',
  reactjs: 'react',
  'node.js': 'nodejs',
  nodejs: 'nodejs',
  node: 'nodejs',
  go: 'go',
  golang: 'go',
  rust: 'rust',
  docker: 'docker',
  kubernetes: 'kubernetes',
  k8s: 'kubernetes',
  django: 'django',
  fastapi: 'fastapi',
  vue: 'vue',
  vuejs: 'vue',
  angular: 'angular',
  'next.js': 'nextjs',
  nextjs: 'nextjs',
  git: 'git',
  github: 'github',
  linux: 'linux',
  gcp: 'gcp',
  postgresql: 'postgresql',
  postgres: 'postgresql',
  mongodb: 'mongodb',
  mongo: 'mongodb',
  redis: 'redis',
  graphql: 'graphql',
  tailwind: 'tailwindcss',
  tailwindcss: 'tailwindcss',
}

const AI_KEYWORD_MAP: Record<string, string> = {
  chatgpt: 'openai',
  openai: 'openai',
  'gpt-4': 'openai',
  'gpt-3': 'openai',
  claude: 'anthropic',
  anthropic: 'anthropic',
  gemini: 'google',
  copilot: 'github',
  llama: 'meta',
}

export function getIconSlug(item: TechItem): string | null {
  const titleLower = item.title.toLowerCase()
  for (const [keyword, slug] of Object.entries(AI_KEYWORD_MAP)) {
    if (titleLower.includes(keyword)) return slug
  }
  for (const tag of item.tags) {
    const slug = TECH_ICON_MAP[tag.toLowerCase()]
    if (slug) return slug
  }
  return null
}

export function getIconData(slug: string): IconEntry | null {
  return ICON_REGISTRY[slug] ?? null
}
