import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'INR', receipt, notes } = await request.json()

    // Mock order creation for testing
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    return NextResponse.json({ orderId, amount })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
