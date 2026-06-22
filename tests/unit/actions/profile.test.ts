import { vi, describe, it, expect, beforeEach } from 'vitest'

// ── Mocks (doivent être déclarés avant les imports des modules mockés) ──────

const {
  mockAuth,
  mockUserUpdate,
  mockUserFindUnique,
  mockUserDelete,
  mockFavoriteFindMany,
  mockReadLaterFindMany,
  mockBcryptCompare,
  mockBcryptHash,
} = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockUserUpdate: vi.fn(),
  mockUserFindUnique: vi.fn(),
  mockUserDelete: vi.fn(),
  mockFavoriteFindMany: vi.fn(),
  mockReadLaterFindMany: vi.fn(),
  mockBcryptCompare: vi.fn(),
  mockBcryptHash: vi.fn(),
}))

vi.mock('@/auth', () => ({ auth: mockAuth }))

vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      update: mockUserUpdate,
      findUnique: mockUserFindUnique,
      delete: mockUserDelete,
    },
    favorite: { findMany: mockFavoriteFindMany },
    readLater: { findMany: mockReadLaterFindMany },
  },
}))

vi.mock('bcryptjs', () => ({
  default: { compare: mockBcryptCompare, hash: mockBcryptHash },
}))

// ── Import après les mocks ────────────────────────────────────────────────

import {
  updateProfile,
  changePassword,
  revokeAllSessions,
  deleteAccount,
  exportData,
} from '@/actions/profile'

// ── Tests ─────────────────────────────────────────────────────────────────

describe('updateProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockUserUpdate.mockResolvedValue({})
  })

  it('should update name and image', async () => {
    const result = await updateProfile({ name: 'Alice', image: 'https://example.com/a.jpg' })
    expect(result).toEqual({})
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { name: 'Alice', image: 'https://example.com/a.jpg' },
    })
  })

  it('should update only name when image is omitted', async () => {
    await updateProfile({ name: 'Bob' })
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { name: 'Bob' },
    })
  })

  it('should return error when not logged in', async () => {
    mockAuth.mockResolvedValue(null)
    const result = await updateProfile({ name: 'Alice' })
    expect(result).toEqual({ error: 'Non connecté' })
    expect(mockUserUpdate).not.toHaveBeenCalled()
  })
})

describe('changePassword', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockUserFindUnique.mockResolvedValue({ password: 'hashed_old_password' })
    mockUserUpdate.mockResolvedValue({})
  })

  it('should return error when not logged in', async () => {
    mockAuth.mockResolvedValue(null)
    const result = await changePassword({ current: 'old', next: 'new123456' })
    expect(result).toEqual({ error: 'Non connecté' })
  })

  it('should return error for OAuth user (no password)', async () => {
    mockUserFindUnique.mockResolvedValue({ password: null })
    const result = await changePassword({ current: 'old', next: 'new123456' })
    expect(result).toEqual({ error: 'Compte OAuth — pas de mot de passe local' })
  })

  it('should return error when current password is wrong', async () => {
    mockBcryptCompare.mockResolvedValue(false)
    const result = await changePassword({ current: 'wrongpass', next: 'new123456' })
    expect(result).toEqual({ error: 'Mot de passe actuel incorrect' })
    expect(mockUserUpdate).not.toHaveBeenCalled()
  })

  it('should return error when new password is too short', async () => {
    mockBcryptCompare.mockResolvedValue(true)
    const result = await changePassword({ current: 'correctpass', next: 'short' })
    expect(result).toEqual({ error: 'Mot de passe trop court (min 8 caractères)' })
    expect(mockUserUpdate).not.toHaveBeenCalled()
  })

  it('should update password when current password is correct', async () => {
    mockBcryptCompare.mockResolvedValue(true)
    mockBcryptHash.mockResolvedValue('hashed_new_password')
    const result = await changePassword({ current: 'correctpass', next: 'new123456' })
    expect(result).toEqual({})
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { password: 'hashed_new_password' },
    })
  })
})

describe('revokeAllSessions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockUserUpdate.mockResolvedValue({})
  })

  it('should increment tokenVersion', async () => {
    await revokeAllSessions()
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { tokenVersion: { increment: 1 } },
    })
  })

  it('should do nothing when not logged in', async () => {
    mockAuth.mockResolvedValue(null)
    await revokeAllSessions()
    expect(mockUserUpdate).not.toHaveBeenCalled()
  })
})

describe('deleteAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockUserDelete.mockResolvedValue({})
  })

  it('should delete the user', async () => {
    await deleteAccount()
    expect(mockUserDelete).toHaveBeenCalledWith({ where: { id: 'user-1' } })
  })

  it('should do nothing when not logged in', async () => {
    mockAuth.mockResolvedValue(null)
    await deleteAccount()
    expect(mockUserDelete).not.toHaveBeenCalled()
  })
})

describe('exportData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockFavoriteFindMany.mockResolvedValue([{ itemData: { id: 'item-1', title: 'Test' } }])
    mockReadLaterFindMany.mockResolvedValue([{ itemData: { id: 'item-2', title: 'Read' } }])
  })

  it('should return favorites and readLater', async () => {
    const result = await exportData()
    expect(result.favorites).toHaveLength(1)
    expect(result.readLater).toHaveLength(1)
  })

  it('should return empty arrays when not logged in', async () => {
    mockAuth.mockResolvedValue(null)
    const result = await exportData()
    expect(result).toEqual({ favorites: [], readLater: [] })
  })
})
