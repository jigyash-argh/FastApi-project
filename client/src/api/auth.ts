import api from './axios'

export interface AuthResponse {
  access_token: string
  token_type?: string
}

export interface SignUpPayload {
  username: string
  email: string
  password: string
}

export interface SignUpResponse {
  id: string
  username: string
  email: string
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/login', {
    email,
    password,
  })
  return response.data
}

export async function signup(payload: SignUpPayload): Promise<SignUpResponse> {
  const response = await api.post<SignUpResponse>('/register', payload)
  return response.data
}
export async function logout(): Promise<void> {
  await api.post('/logout')
  window.localStorage.removeItem('access_token')
}