'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader, EmptyState, LoadingSpinner } from '@/components/dashboard'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import { DollarSign, TrendingUp, ShoppingBag, CreditCard, User, Mail, Phone } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { motion } from 'framer-motion'

export default function ArtistEarnings() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEarnings()
  }, [])

  const loadEarnings = async () => {
    const user = await getCurrentUser()
    if (!user?.user_id) return

    const { data } = await supabase
      .from('transactions')
      .select('*, artworks(title, image_url), buyer:users!buyer_id(full_name, email, phone)')
      .eq('artist_id', user.user_id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })

    setTransactions(data || [])
    setLoading(false)
  }

  const totalEarnings = transactions.reduce((sum, t) => sum + Number(t.artist_earnings ?? 0), 0)
  const totalSales = transactions.length
  const platformFees = transactions.reduce((sum, t) => sum + Number(t.platform_fee ?? 0), 0)
  const upiTransactions = transactions.filter(t => t.payment_method === 'upi')
  const upiPlatformFees = upiTransactions.reduce((sum, t) => sum + Number(t.platform_fee ?? 0), 0)

  return (
    <DashboardLayout navItems={DASHBOARD_NAV.artist} role="artist">
      <div className="p-6 lg:p-10">
        <PageHeader title="Earnings" description="Track your sales and transaction history" />

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-neutral-400">Total Earnings</p>
                  <div className="w-10 h-10 rounded-lg bg-green-600/10 flex items-center justify-center">
                    <DollarSign size={20} className="text-green-500" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">₹{totalEarnings.toFixed(2)}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-neutral-400">Total Sales</p>
                  <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center">
                    <ShoppingBag size={20} className="text-blue-500" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">{totalSales}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-neutral-400">Platform Fees</p>
                  <div className="w-10 h-10 rounded-lg bg-orange-600/10 flex items-center justify-center">
                    <CreditCard size={20} className="text-orange-500" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">₹{platformFees.toFixed(2)}</p>
              </motion.div>
            </div>

            {/* Transaction History */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">Transaction History</h2>
                {upiPlatformFees > 0 && (
                  <div className="text-right">
                    <p className="text-xs text-neutral-500">UPI Platform Fees</p>
                    <p className="text-sm text-orange-400 font-medium">₹{upiPlatformFees.toFixed(2)}</p>
                    <p className="text-xs text-neutral-600">gaming.network.studio.mg@okicici</p>
                  </div>
                )}
              </div>
              {transactions.length === 0 ? (
                <EmptyState
                  icon={DollarSign}
                  title="No transactions yet"
                  description="Your earnings will appear here once you make sales"
                />
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx, i) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.03 * i }}
                      className="rounded-lg border border-neutral-800 bg-neutral-800/30 p-4 transition-colors hover:border-neutral-700"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        {tx.artworks?.image_url && (
                          <img
                            src={tx.artworks.image_url}
                            alt={tx.artworks.title}
                            className="w-16 h-16 rounded-lg object-cover border border-neutral-700"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate">{tx.artworks?.title}</p>
                          <p className="text-[11px] leading-relaxed text-neutral-400 break-all">
                            {new Date(tx.created_at).toLocaleDateString()} • <span className="opacity-70">{tx.transaction_code}</span>
                          </p>
                        </div>
                        <div className="text-left sm:text-right w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-700/30">
                          <p className="font-bold text-green-500">+₹{Number(tx.artist_earnings).toFixed(2)}</p>
                          <p className="text-xs text-neutral-500">from ₹{Number(tx.amount).toFixed(2)}</p>
                          {tx.payment_method === 'upi' && tx.platform_fee && (
                            <p className="text-[11px] text-orange-400 font-medium">Fee: ₹{Number(tx.platform_fee).toFixed(2)}</p>
                          )}
                        </div>
                      </div>

                      {/* Buyer Info */}
                      {tx.buyer && (
                        <div className="mt-4 pt-4 border-t border-neutral-700/50">
                          <p className="text-xs font-medium text-neutral-400 mb-2">Buyer Information</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="flex items-center gap-2 text-sm">
                              <User size={14} className="text-neutral-500" />
                              <span className="text-neutral-300">{tx.buyer.full_name}</span>
                            </div>
                            {tx.buyer.email && (
                              <div className="flex items-center gap-2 text-sm">
                                <Mail size={14} className="text-neutral-500" />
                                <a href={`mailto:${tx.buyer.email}`} className="text-neutral-300 hover:text-white transition-colors">
                                  {tx.buyer.email}
                                </a>
                              </div>
                            )}
                            {tx.buyer.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone size={14} className="text-neutral-500" />
                                <a href={`tel:${tx.buyer.phone}`} className="text-neutral-300 hover:text-white transition-colors">
                                  {tx.buyer.phone}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
