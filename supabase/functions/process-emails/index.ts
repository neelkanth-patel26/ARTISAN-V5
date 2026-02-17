import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch pending emails (limit 10 per run)
    const { data: emails, error } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .lt('attempts', 3)
      .order('created_at', { ascending: true })
      .limit(10)

    if (error) throw error
    if (!emails || emails.length === 0) {
      return new Response(JSON.stringify({ message: 'No pending emails' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Configure SMTP client
    const client = new SMTPClient({
      connection: {
        hostname: Deno.env.get('SMTP_HOST') ?? '',
        port: Number(Deno.env.get('SMTP_PORT')) ?? 587,
        tls: true,
        auth: {
          username: Deno.env.get('SMTP_USER') ?? '',
          password: Deno.env.get('SMTP_PASS') ?? '',
        },
      },
    })

    let sent = 0
    let failed = 0

    for (const email of emails) {
      try {
        await client.send({
          from: Deno.env.get('SMTP_FROM') ?? 'noreply@artisan.com',
          to: email.to_email,
          subject: email.subject,
          html: email.html_content,
        })

        await supabase
          .from('email_queue')
          .update({ status: 'sent', sent_at: new Date().toISOString() })
          .eq('id', email.id)

        sent++
      } catch (err) {
        await supabase
          .from('email_queue')
          .update({
            status: email.attempts >= 2 ? 'failed' : 'pending',
            attempts: email.attempts + 1,
            error_message: err.message,
          })
          .eq('id', email.id)

        failed++
      }
    }

    await client.close()

    return new Response(
      JSON.stringify({ sent, failed, total: emails.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
