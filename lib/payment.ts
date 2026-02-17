// Payment Gateway Integration (Razorpay)
// Add to .env.local:
// NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key_id
// RAZORPAY_KEY_SECRET=your_key_secret

import { supabase } from './supabase'

export interface PaymentData {
  amount: number
  currency?: string
  receipt?: string
  notes?: Record<string, string>
}

export interface PaymentResult {
  success: boolean
  paymentId?: string
  orderId?: string
  error?: string
}

// Initialize Razorpay payment
export async function initiatePayment(data: PaymentData): Promise<{ orderId: string; amount: number }> {
  const response = await fetch('/api/payment/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  
  if (!response.ok) throw new Error('Failed to create payment order')
  return response.json()
}

// Verify payment
export async function verifyPayment(paymentId: string, orderId: string, signature: string): Promise<boolean> {
  const response = await fetch('/api/payment/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentId, orderId, signature })
  })
  
  if (!response.ok) return false
  const result = await response.json()
  return result.verified
}

// Process artwork purchase
export async function processArtworkPurchase(
  artworkId: string,
  buyerId: string,
  artistId: string,
  amount: number,
  paymentMethod: string
): Promise<PaymentResult> {
  try {
    // Create Razorpay order
    const { orderId, amount: orderAmount } = await initiatePayment({
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `artwork_${artworkId}_${Date.now()}`,
      notes: { artworkId, buyerId, artistId }
    })

    // Open Razorpay checkout
    return new Promise((resolve) => {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderAmount,
        currency: 'INR',
        name: 'Art Museum',
        description: 'Artwork Purchase',
        order_id: orderId,
        handler: async function (response: any) {
          const verified = await verifyPayment(
            response.razorpay_payment_id,
            response.razorpay_order_id,
            response.razorpay_signature
          )

          if (verified) {
            // Calculate fees
            const platformFee = amount * 0.1 // 10% platform fee
            const artistEarnings = amount - platformFee

            // Create transaction record
            const { error } = await supabase.from('transactions').insert({
              transaction_code: `TXN${Date.now()}`,
              buyer_id: buyerId,
              artwork_id: artworkId,
              artist_id: artistId,
              amount,
              platform_fee: platformFee,
              artist_earnings: artistEarnings,
              payment_method: paymentMethod,
              status: 'completed',
              payment_gateway_id: response.razorpay_payment_id,
              transaction_type: 'purchase',
              completed_at: new Date().toISOString()
            })

            if (!error) {
              // Mark artwork as sold
              await supabase.from('artworks').update({ is_sold: true }).eq('id', artworkId)
            }

            resolve({ success: true, paymentId: response.razorpay_payment_id, orderId })
          } else {
            resolve({ success: false, error: 'Payment verification failed' })
          }
        },
        modal: {
          ondismiss: function () {
            resolve({ success: false, error: 'Payment cancelled' })
          }
        }
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    })
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Process artist support
export async function processArtistSupport(
  artistId: string,
  supporterId: string,
  amount: number,
  paymentMethod: string
): Promise<PaymentResult> {
  try {
    const { orderId, amount: orderAmount } = await initiatePayment({
      amount: amount * 100,
      currency: 'INR',
      receipt: `support_${artistId}_${Date.now()}`,
      notes: { artistId, supporterId }
    })

    return new Promise((resolve) => {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderAmount,
        currency: 'INR',
        name: 'Art Museum',
        description: 'Artist Support',
        order_id: orderId,
        handler: async function (response: any) {
          const verified = await verifyPayment(
            response.razorpay_payment_id,
            response.razorpay_order_id,
            response.razorpay_signature
          )

          if (verified) {
            const platformFee = amount * 0.05 // 5% platform fee for support
            const artistEarnings = amount - platformFee

            const { error } = await supabase.from('transactions').insert({
              transaction_code: `SUP${Date.now()}`,
              buyer_id: supporterId,
              artist_id: artistId,
              amount,
              platform_fee: platformFee,
              artist_earnings: artistEarnings,
              payment_method: paymentMethod,
              status: 'completed',
              payment_gateway_id: response.razorpay_payment_id,
              transaction_type: 'support',
              completed_at: new Date().toISOString()
            })

            resolve({ success: !error, paymentId: response.razorpay_payment_id, orderId })
          } else {
            resolve({ success: false, error: 'Payment verification failed' })
          }
        },
        modal: {
          ondismiss: function () {
            resolve({ success: false, error: 'Payment cancelled' })
          }
        }
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    })
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
