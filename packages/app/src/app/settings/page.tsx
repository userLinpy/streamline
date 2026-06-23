import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { SettingsClient } from './SettingsClient'

export default async function SettingsPage() {
  const session = await auth()
  const userId = session?.user?.id ?? null

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
    />
  )
}
