import {
  Home,
  Upload,
  BarChart3,
  DollarSign,
  Settings,
  Image,
  Users,
  Calendar,
  ShoppingBag,
  Heart,
  MessageSquare,
  UserPlus,
  HandHeart,
  TrendingUp,
  FileText,
  Ticket,
  HardDrive,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  icon: LucideIcon
  label: string
  href: string
}

export const DASHBOARD_NAV: Record<'artist' | 'admin' | 'collector', NavItem[]> = {
  artist: [
    { icon: Home, label: 'Dashboard', href: '/dashboard/artist' },
    { icon: Upload, label: 'Upload', href: '/dashboard/artist/upload' },
    { icon: Image, label: 'Artworks', href: '/dashboard/artist/artworks' },
    { icon: DollarSign, label: 'Earnings', href: '/dashboard/artist/earnings' },
    { icon: Users, label: 'Followers', href: '/dashboard/artist/followers' },
    { icon: Heart, label: 'Support', href: '/dashboard/artist/support' },
    { icon: BarChart3, label: 'Analytics', href: '/dashboard/artist/analytics' },
    { icon: Users, label: 'Collaborations', href: '/dashboard/artist/collaborations' },
    { icon: Ticket, label: 'Bookings', href: '/dashboard/artist/bookings' },
    { icon: Settings, label: 'Settings', href: '/dashboard/artist/settings' },
  ],
  admin: [
    { icon: Home, label: 'Dashboard', href: '/dashboard/admin' },
    { icon: DollarSign, label: 'Transactions', href: '/dashboard/admin/transactions' },
    { icon: Image, label: 'Artworks', href: '/dashboard/admin/artworks' },
    { icon: Users, label: 'Users', href: '/dashboard/admin/users' },
    { icon: TrendingUp, label: 'Artists', href: '/dashboard/admin/artists' },
    { icon: Calendar, label: 'Exhibitions', href: '/dashboard/admin/exhibitions' },
    { icon: Ticket, label: 'Bookings', href: '/dashboard/admin/bookings' },
    { icon: MessageSquare, label: 'Notifications', href: '/dashboard/admin/notifications' },
    { icon: HardDrive, label: 'Storage', href: '/dashboard/admin/storage' },
    { icon: BarChart3, label: 'Analytics', href: '/dashboard/admin/analytics' },
    { icon: Settings, label: 'Settings', href: '/dashboard/admin/settings' },
  ],
  collector: [
    { icon: Home, label: 'Dashboard', href: '/dashboard/collector' },
    { icon: ShoppingBag, label: 'Purchases', href: '/dashboard/collector/purchases' },
    { icon: Heart, label: 'Favorites', href: '/dashboard/collector/favorites' },
    { icon: UserPlus, label: 'Following', href: '/dashboard/collector/following' },
    { icon: HandHeart, label: 'Support', href: '/dashboard/collector/support' },
    { icon: MessageSquare, label: 'Comments', href: '/dashboard/collector/comments' },
    { icon: Ticket, label: 'Bookings', href: '/dashboard/collector/bookings' },
    { icon: Settings, label: 'Settings', href: '/dashboard/collector/settings' },
  ],
}

export const DASHBOARD_ACCENT = 'orange' as const
