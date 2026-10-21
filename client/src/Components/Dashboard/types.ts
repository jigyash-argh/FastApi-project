export interface RecipeCardData {
  title: string
  prepTime: string
  calories: string
  matchPercent: number
  ingredientsUsed: string[]
  missingIngredients: string[]
  steps: string[]
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  recipe?: RecipeCardData
}

export interface ChatSession {
  id: string
  title: string
  preview: string
  category: 'Today' | 'Yesterday' | 'Previous 7 Days'
  emoji: string
  pinned?: boolean
  messages: ChatMessage[]
}

export interface UserProfile {
  name: string
  email: string
  badge: string
  fridgeCount: number
  savedRecipes: number
}