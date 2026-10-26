import api from './axios'

export interface FridgeItem {
  id: string
  name: string
  quantity: string
  category: string
  created_at?: string
}

export interface CreateFridgeItemPayload {
  name: string
  quantity: string
  food_group: string
}

// Backend API helpers
export async function getFridgeItemsApi(): Promise<FridgeItem[]> {
  const response = await api.get<Array<{
    id: string
    name: string
    quantity: string
    food_group: string
    created_at: string
  }>>('/inventory/')

  return response.data.map((item) => ({
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    category: item.food_group,
    created_at: item.created_at,
  }))
}

export async function addFridgeItemApi(payload: CreateFridgeItemPayload): Promise<FridgeItem> {
  const response = await api.post<{
    id: string
    name: string
    quantity: string
    food_group: string
    created_at: string
  }>('/inventory/', payload)

  return {
    id: response.data.id,
    name: response.data.name,
    quantity: response.data.quantity,
    category: response.data.food_group,
    created_at: response.data.created_at,
  }
}

export async function deleteFridgeItemApi(itemId: string): Promise<void> {
  await api.delete(`/inventory/${itemId}`)
}

// ---------------------------------------------------------
// Legacy compatibility aliases (to prevent missing export errors)
// ---------------------------------------------------------
export function getFridgeItems(): FridgeItem[] {
  // Fallback or empty array if components call this synchronously
  return []
}

export function saveFridgeItems(_items: FridgeItem[]): void {
  // No-op fallback since state is now saved via backend POST/DELETE calls
}