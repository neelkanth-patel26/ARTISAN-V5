import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { paymentId, orderId, signature } = await request.json()

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${orderId}|${paymentId}`)
      .digest('hex')

    const verified = generatedSignature === signature

    return NextResponse.json({ verified })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, verified: false }, { status: 500 })
  }
}
