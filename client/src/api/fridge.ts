export interface FridgeItem {
  id: string
  name: string
  quantity: string
  category: string
}

function getFridgeStorageKey(): string {
  const token = window.localStorage.getItem('access_token')
  const payload = token?.split('.')[1]
  if (!payload) {
    throw new Error('Your session could not be verified. Please sign in again.')
  }

  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
  let decoded: unknown
  try {
    decoded = JSON.parse(
      window.atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='))
    )
  } catch (error: unknown) {
    throw new Error('Your fridge could not be loaded from this browser.', {
      cause: error,
    })
  }

  if (
    typeof decoded !== 'object' ||
    decoded === null ||
    !('sub' in decoded) ||
    typeof decoded.sub !== 'string' ||
    !decoded.sub
  ) {
    throw new Error('Your session does not contain a valid user ID.')
  }

  return `fridge-items:${decoded.sub}`
}

function isFridgeItem(value: unknown): value is FridgeItem {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string' &&
    'name' in value &&
    typeof value.name === 'string' &&
    'quantity' in value &&
    typeof value.quantity === 'string' &&
    'category' in value &&
    typeof value.category === 'string'
  )
}

export function getFridgeItems(): FridgeItem[] {
  const stored = window.localStorage.getItem(getFridgeStorageKey())
  if (!stored) return []

  let parsed: unknown
  try {
    parsed = JSON.parse(stored)
  } catch {
    throw new Error('Saved fridge data is unreadable. Add an item to replace the saved list.')
  }

  if (!Array.isArray(parsed) || !parsed.every(isFridgeItem)) {
    throw new Error('Saved fridge data is invalid. Add an item to replace the saved list.')
  }

  return parsed
}

export function saveFridgeItems(items: FridgeItem[]): void {
  window.localStorage.setItem(getFridgeStorageKey(), JSON.stringify(items))
}
