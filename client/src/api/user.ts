import api from './axios'
import type {
  UserProfile,
  UserSettings,
  UserUpdatePayload,
  UserSettingsUpdatePayload,
} from '../Components/Dashboard/types'

export async function getCurrentUser(): Promise<UserProfile> {
  const response = await api.get<UserProfile>('/users/me')
  return response.data
}

export async function updateCurrentUser(payload: UserUpdatePayload): Promise<UserProfile> {
  const response = await api.patch<UserProfile>('/users/me', payload)
  return response.data
}

export async function getUserSettings(): Promise<UserSettings> {
  const response = await api.get<UserSettings>('/users/me/settings')
  return response.data
}

export async function updateUserSettings(payload: UserSettingsUpdatePayload): Promise<UserSettings> {
  const response = await api.patch<UserSettings>('/users/me/settings', payload)
  return response.data
}

export async function deleteUserAccount(): Promise<void> {
  await api.delete('/users/me')
}