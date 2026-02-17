import { supabase } from './supabase'

interface UserSession {
  user_id: string
  user_role: string
  user_name: string
  email: string
}

export async function signUp(email: string, password: string, role: 'artist' | 'collector' | 'admin', fullName: string) {
  const { data, error } = await supabase
    .from('users')
    .insert({
      email,
      password,
      password_hash: password,
      full_name: fullName,
      role
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message || 'Failed to create account')
  return { userId: data.id }
}

export async function signIn(email: string, password: string): Promise<UserSession> {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, full_name, role, status')
    .eq('email', email)
    .eq('password', password)
    .eq('status', 'active')
    .maybeSingle()

  if (error) throw new Error(error.message || 'Login failed')
  if (!data) throw new Error('Invalid email or password')
  
  const userSession: UserSession = {
    user_id: data.id,
    user_role: data.role,
    user_name: data.full_name,
    email: data.email
  }
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(userSession))
  }
  
  return userSession
}

export async function signOut() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user')
  }
}

export function getCurrentUser(): UserSession | null {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }
  return null
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, full_name, phone, location, avatar_url, role, status, bio, website, followers_count, following_count, total_views, created_at, updated_at, last_active_at')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  if (!data) throw new Error('User not found')
  return data
}

export async function updateProfile(userId: string, updates: any) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}
