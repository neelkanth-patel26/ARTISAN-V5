import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { paymentId, orderId, signature } = await request.json()

    // Mock verification for testing - always return true
    const verified = true

    return NextResponse.json({ verified })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, verified: false }, { status: 500 })
  }
}
