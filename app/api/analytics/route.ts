import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const period = searchParams.get('period') || '30d'
  const role = searchParams.get('role') || 'artist'

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 })
  }

  const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  const previousStartDate = new Date(startDate)
  previousStartDate.setDate(previousStartDate.getDate() - days)

  try {
    // Get current period transactions
    const { data: currentTxns } = await supabase
      .from('transactions')
      .select('artist_earnings, amount, created_at, transaction_type, artwork_id')
      .eq(role === 'artist' ? 'artist_id' : 'buyer_id', userId)
      .eq('status', 'completed')
      .gte('created_at', startDate.toISOString())

    // Get previous period transactions
    const { data: previousTxns } = await supabase
      .from('transactions')
      .select('artist_earnings, amount')
      .eq(role === 'artist' ? 'artist_id' : 'buyer_id', userId)
      .eq('status', 'completed')
      .gte('created_at', previousStartDate.toISOString())
      .lt('created_at', startDate.toISOString())

    // Get user stats
    const { data: user } = await supabase
      .from('users')
      .select('total_views, followers_count')
      .eq('id', userId)
      .single()

    // Calculate revenue (use artist_earnings for artists, amount for collectors)
    const currentRevenue = currentTxns?.reduce((sum, t) => 
      sum + Number(role === 'artist' ? t.artist_earnings : t.amount), 0) || 0
    const previousRevenue = previousTxns?.reduce((sum, t) => 
      sum + Number(role === 'artist' ? t.artist_earnings : t.amount), 0) || 0
    const revenueTrend = previousRevenue > 0 ? Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100) : 0

    // Calculate sales
    const currentSales = currentTxns?.filter(t => t.transaction_type === 'purchase').length || 0
    const previousSalesCount = previousTxns?.length || 0
    const salesTrend = previousSalesCount > 0 ? Math.round(((currentSales - previousSalesCount) / previousSalesCount) * 100) : 0

    // Get artworks for category distribution and top performers
    const { data: artworks } = await supabase
      .from('artworks')
      .select('id, title, category, views, price')
      .eq('artist_id', userId)
      .eq('status', 'approved')

    // Category distribution
    const categoryMap = new Map<string, number>()
    artworks?.forEach(a => {
      categoryMap.set(a.category, (categoryMap.get(a.category) || 0) + 1)
    })

    // Revenue chart data (group by day)
    const revenueByDay = new Map<string, number>()
    currentTxns?.forEach(t => {
      const date = new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const revenue = Number(role === 'artist' ? t.artist_earnings : t.amount)
      revenueByDay.set(date, (revenueByDay.get(date) || 0) + revenue)
    })

    const chartLabels = Array.from({ length: Math.min(days, 30) }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (Math.min(days, 30) - i - 1))
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    })

    // Calculate sales per artwork
    const artworkSales = new Map<string, number>()
    currentTxns?.filter(t => t.transaction_type === 'purchase' && t.artwork_id).forEach(t => {
      artworkSales.set(t.artwork_id!, (artworkSales.get(t.artwork_id!) || 0) + 1)
    })

    const data = {
      revenue: { current: currentRevenue, previous: previousRevenue, trend: revenueTrend },
      views: { current: user?.total_views || 0, previous: user?.total_views || 0, trend: 0 },
      sales: { current: currentSales, previous: previousSalesCount, trend: salesTrend },
      followers: { current: user?.followers_count || 0, previous: user?.followers_count || 0, trend: 0 },
      revenueChart: {
        labels: chartLabels,
        data: chartLabels.map(label => revenueByDay.get(label) || 0)
      },
      categoryChart: {
        labels: Array.from(categoryMap.keys()),
        data: Array.from(categoryMap.values())
      },
      topArtworks: artworks
        ?.sort((a, b) => b.views - a.views)
        .slice(0, 5)
        .map(a => ({
          id: a.id,
          title: a.title,
          views: a.views,
          sales: artworkSales.get(a.id) || 0,
          revenue: Number(a.price) * (artworkSales.get(a.id) || 0)
        })) || []
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 })
  }
}
