export interface Profile {
  id: string
  email: string
  full_name: string
  phone?: string
  location?: string
  avatar_url?: string
  role: 'admin' | 'artist' | 'collector'
  status: 'active' | 'suspended' | 'banned'
  bio?: string
  website?: string
  upi_id?: string
  upi_qr_code?: string
  followers_count: number
  following_count: number
  total_views: number
  created_at: string
  updated_at: string
  last_active_at: string
}

export interface StoredUser {
  user_id: string
  user_role: string
  user_name: string
}

export interface Artwork {
  id: string
  artist_id: string
  category_id?: string
  category?: string
  title: string
  description?: string
  image_url: string
  thumbnail_url?: string
  price: number
  status: 'pending' | 'approved' | 'rejected'
  is_featured: boolean
  is_sold: boolean
  views_count: number
  likes_count: number
  dimensions?: string
  medium?: string
  year_created?: number
  tags?: string[]
  created_at: string
  updated_at: string
  approved_at?: string
  approved_by?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  artwork_count: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Exhibition {
  id: string
  title: string
  description?: string
  location: string
  image_url?: string
  start_date: string
  end_date: string
  status: 'upcoming' | 'active' | 'completed' | 'cancelled'
  visitors_count: number
  artworks_count: number
  created_by?: string
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  transaction_code: string
  buyer_id: string
  artwork_id: string
  artist_id: string
  amount: number
  platform_fee: number
  artist_earnings: number
  payment_method: 'credit_card' | 'debit_card' | 'upi' | 'net_banking' | 'wallet'
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  payment_gateway_id?: string
  created_at: string
  completed_at?: string
}

export interface Like {
  id: string
  user_id: string
  artwork_id: string
  created_at: string
}

export interface Follow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

export interface Review {
  id: string
  reviewer_id: string
  artwork_id?: string
  artist_id?: string
  rating: number
  comment?: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
}

export interface VisitBooking {
  id: string
  user_id: string
  visitor_name: string
  visitor_email: string
  visitor_phone: string
  visit_date: string
  visit_time: string
  number_of_visitors: number
  special_requirements?: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  link?: string
  is_read: boolean
  created_at: string
}

export interface Admin {
  id: string
  email: string
  full_name: string | null
  permissions: string[]
  is_super_admin: boolean
  created_at: string
  updated_at: string
}

export const PERMISSIONS = {
  READ: 'read',
  WRITE: 'write',
  DELETE: 'delete',
  MANAGE_USERS: 'manage_users',
  MANAGE_ARTWORKS: 'manage_artworks',
  MANAGE_TRANSACTIONS: 'manage_transactions',
  MANAGE_ADMINS: 'manage_admins'
} as const

export function hasPermission(admin: Admin | null, permission: string): boolean {
  if (!admin) return false
  if (admin.is_super_admin) return true
  return admin.permissions.includes(permission)
}

export function isSuperAdmin(admin: Admin | null): boolean {
  return admin?.is_super_admin || false
}
