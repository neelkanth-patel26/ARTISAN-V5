import { supabase } from './supabase'

interface UserSession {
  user_id: string
  user_role: string
  user_name: string
  email: string
}

export async function signUp(email: string, password: string, role: 'artist' | 'collector' | 'admin', fullName: string) {
  const { data, error } = await supabase.rpc('hash_password', { password })
  if (error) throw new Error('Failed to hash password')
  
  const { data: user, error: insertError } = await supabase
    .from('users')
    .insert({
      email,
      password_hash: data,
      full_name: fullName,
      role
    })
    .select('id')
    .single()

  if (insertError) throw new Error(insertError.message || 'Failed to create account')
  return { userId: user.id }
}

export async function signIn(email: string, password: string): Promise<UserSession> {
  // First, get user by email
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('id, email, full_name, role, status, password_hash')
    .eq('email', email)
    .limit(1)
  
  if (userError || !users || users.length === 0) {
    throw new Error('Invalid email or password')
  }
  
  const user = users[0]
  
  // Verify password
  const { data: isValid, error: verifyError } = await supabase.rpc('verify_password', {
    email_input: email,
    password_input: password
  })
  
  if (verifyError || !isValid) {
    throw new Error('Invalid email or password')
  }
  
  // Check account status
  if (user.status === 'suspended') {
    throw new Error('ACCOUNT_SUSPENDED')
  }
  if (user.status === 'banned') {
    throw new Error('ACCOUNT_BANNED')
  }
  
  const userSession: UserSession = {
    user_id: user.id,
    user_role: user.role,
    user_name: user.full_name,
    email: user.email
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
  if (!data) return null
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
