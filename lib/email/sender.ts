// Email sending utility using Supabase Edge Functions
import { supabase } from '../supabase'
import { 
  purchaseEmailToBuyer, 
  purchaseEmailToArtist, 
  supportEmailToCollector, 
  supportEmailToArtist 
} from './templates'

export async function sendPurchaseEmails(data: {
  buyerEmail: string
  buyerName: string
  artistEmail: string
  artistName: string
  artistId: string
  artworkTitle: string
  artworkImage: string
  price: number
  platformFee: number
  artistEarnings: number
  transactionCode: string
}) {
  try {
    // Fetch artist email if not provided
    let artistEmail = data.artistEmail
    if (!artistEmail) {
      const { data: artist } = await supabase
        .from('users')
        .select('email')
        .eq('id', data.artistId)
        .single()
      artistEmail = artist?.email || ''
    }

    if (!artistEmail) {
      console.error('Artist email not found')
      return { success: false, error: 'Artist email not found' }
    }

    // Send email to buyer
    await sendEmailViaSupabase({
      to: data.buyerEmail,
      subject: '🎉 Purchase Confirmed - ARTISAN',
      html: purchaseEmailToBuyer({
        buyerName: data.buyerName,
        artworkTitle: data.artworkTitle,
        artworkImage: data.artworkImage,
        amount: data.price,
        transactionId: data.transactionCode,
        artistName: data.artistName,
      })
    })

    // Send email to artist
    await sendEmailViaSupabase({
      to: artistEmail,
      subject: '🎨 Congratulations! You Made a Sale - ARTISAN',
      html: purchaseEmailToArtist({
        artistName: data.artistName,
        artworkTitle: data.artworkTitle,
        artworkImage: data.artworkImage,
        amount: data.price,
        platformFee: data.platformFee,
        earnings: data.artistEarnings,
        buyerName: data.buyerName,
        transactionId: data.transactionCode,
      })
    })

    return { success: true }
  } catch (error) {
    console.error('Error sending purchase emails:', error)
    return { success: false, error }
  }
}

export async function sendSupportEmails(data: {
  collectorEmail: string
  collectorName: string
  artistEmail: string
  artistName: string
  artistId: string
  amount: number
  platformFee: number
  artistEarnings: number
  transactionCode: string
}) {
  try {
    // Fetch artist email if not provided
    let artistEmail = data.artistEmail
    if (!artistEmail) {
      const { data: artist } = await supabase
        .from('users')
        .select('email, avatar_url')
        .eq('id', data.artistId)
        .single()
      artistEmail = artist?.email || ''
    }

    if (!artistEmail) {
      console.error('Artist email not found')
      return { success: false, error: 'Artist email not found' }
    }

    // Send email to collector
    await sendEmailViaSupabase({
      to: data.collectorEmail,
      subject: '💝 Thank You for Supporting an Artist - ARTISAN',
      html: supportEmailToCollector({
        collectorName: data.collectorName,
        artistName: data.artistName,
        artistImage: '',
        amount: data.amount,
        transactionId: data.transactionCode,
      })
    })

    // Send email to artist
    await sendEmailViaSupabase({
      to: artistEmail,
      subject: '❤️ You Received Support! - ARTISAN',
      html: supportEmailToArtist({
        artistName: data.artistName,
        collectorName: data.collectorName,
        amount: data.amount,
        platformFee: data.platformFee,
        earnings: data.artistEarnings,
        transactionId: data.transactionCode,
      })
    })

    return { success: true }
  } catch (error) {
    console.error('Error sending support emails:', error)
    return { success: false, error }
  }
}

async function sendEmailViaSupabase({ to, subject, html }: { to: string; subject: string; html: string }) {
  // Store email in database for processing
  const { error } = await supabase
    .from('email_queue')
    .insert({
      to_email: to,
      subject,
      html_content: html,
      status: 'pending'
    })

  if (error) {
    console.error('Error queuing email:', error)
    throw error
  }

  console.log('📧 Email queued for:', to)
}
