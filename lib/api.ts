import { supabase } from './supabase'

// Artworks
export async function getArtworks(filters?: { status?: string; artist_id?: string }) {
  let query = supabase
    .from('artworks')
    .select('*, artist:users!artist_id(id, full_name, email), category:categories(id, name)')
    .order('created_at', { ascending: false })

  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.artist_id) query = query.eq('artist_id', filters.artist_id)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createArtwork(artwork: any) {
  const { data, error } = await supabase
    .from('artworks')
    .insert(artwork)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateArtwork(id: string, updates: any) {
  const { data, error } = await supabase
    .from('artworks')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteArtwork(id: string) {
  const { error } = await supabase
    .from('artworks')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Users
export async function getUsers(filters?: { role?: string; status?: string }) {
  let query = supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters?.role) query = query.eq('role', filters.role)
  if (filters?.status) query = query.eq('status', filters.status)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function updateUserStatus(userId: string, status: string) {
  const { data, error } = await supabase
    .from('users')
    .update({ status })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Categories
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (error) throw error
  return data
}

export async function createCategory(category: any) {
  const { data, error } = await supabase
    .from('categories')
    .insert(category)
    .select()
    .single()

  if (error) throw error
  return data
}

// Transactions
export async function getTransactions(filters?: { buyer_id?: string; artist_id?: string }) {
  let query = supabase
    .from('transactions')
    .select('*, buyer:users!buyer_id(full_name, email), artist:users!artist_id(full_name, email), artwork:artworks(title)')
    .order('created_at', { ascending: false })

  if (filters?.buyer_id) query = query.eq('buyer_id', filters.buyer_id)
  if (filters?.artist_id) query = query.eq('artist_id', filters.artist_id)

  const { data, error } = await query
  if (error) throw error
  return data
}

// Exhibitions
export async function getExhibitions() {
  const { data, error } = await supabase
    .from('exhibitions')
    .select('*, creator:users!created_by(full_name)')
    .order('start_date', { ascending: false })

  if (error) throw error
  return data
}

export async function createExhibition(exhibition: any) {
  const { data, error } = await supabase
    .from('exhibitions')
    .insert(exhibition)
    .select()
    .single()

  if (error) throw error
  return data
}

// Visit Bookings
export async function getVisitBookings(userId?: string) {
  let query = supabase
    .from('visit_bookings')
    .select('*, user:users(full_name, email)')
    .order('visit_date', { ascending: false })

  if (userId) query = query.eq('user_id', userId)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createVisitBooking(booking: any) {
  const { data, error } = await supabase
    .from('visit_bookings')
    .insert(booking)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateVisitBooking(id: string, updates: any) {
  const { data, error } = await supabase
    .from('visit_bookings')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Dashboard Stats
export async function getDashboardStats(userId?: string, role?: string) {
  if (role === 'admin') {
    const [users, artworks, transactions, bookings] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('artworks').select('id', { count: 'exact', head: true }),
      supabase.from('transactions').select('amount'),
      supabase.from('visit_bookings').select('id', { count: 'exact', head: true })
    ])

    const totalRevenue = transactions.data?.reduce((sum, t) => sum + Number(t.amount), 0) || 0

    return {
      totalUsers: users.count || 0,
      totalArtworks: artworks.count || 0,
      totalRevenue,
      totalBookings: bookings.count || 0
    }
  }

  if (role === 'artist' && userId) {
    const [artworks, transactions] = await Promise.all([
      supabase.from('artworks').select('id', { count: 'exact', head: true }).eq('artist_id', userId),
      supabase.from('transactions').select('artist_earnings').eq('artist_id', userId).eq('status', 'completed')
    ])

    const totalEarnings = transactions.data?.reduce((sum, t) => sum + Number(t.artist_earnings), 0) || 0

    return {
      totalArtworks: artworks.count || 0,
      totalEarnings
    }
  }

  if (role === 'collector' && userId) {
    const [transactions, bookings] = await Promise.all([
      supabase.from('transactions').select('id', { count: 'exact', head: true }).eq('buyer_id', userId),
      supabase.from('visit_bookings').select('id', { count: 'exact', head: true }).eq('user_id', userId)
    ])

    return {
      totalPurchases: transactions.count || 0,
      totalBookings: bookings.count || 0
    }
  }

  return {}
}
