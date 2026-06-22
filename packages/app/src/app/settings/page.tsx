import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { SettingsClient } from './SettingsClient'

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  })

  return (
    <SettingsClient
      userId={session.user.id}
      name={session.user.name ?? null}
      email={session.user.email ?? null}
      image={session.user.image ?? null}
      hasPassword={!!dbUser?.password}
    />
  )
}
