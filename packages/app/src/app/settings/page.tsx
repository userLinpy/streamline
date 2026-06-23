import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { SettingsClient } from './SettingsClient'
import type { Section } from '@/components/ui/app-sidebar'

const VALID_SECTIONS: Section[] = [
  'statistiques', 'notifications',
  'profile', 'securite', 'donnees', 'historique', 'suppression',
]

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>
}) {
  const [{ s }, session] = await Promise.all([searchParams, auth()])

  const userId = session?.user?.id ?? null
  const initialSection: Section | null = VALID_SECTIONS.includes(s as Section)
    ? (s as Section)
    : null

  const dbUser = userId
    ? await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true },
      })
    : null

  return (
    <SettingsClient
      isAuthenticated={!!userId}
      name={session?.user?.name ?? null}
      email={session?.user?.email ?? null}
      image={session?.user?.image ?? null}
      hasPassword={!!dbUser?.password}
      initialSection={initialSection}
    />
  )
}
