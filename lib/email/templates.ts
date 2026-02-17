// Email templates for ARTISAN platform

export const purchaseEmailToBuyer = (data: {
  buyerName: string
  artworkTitle: string
  artworkImage: string
  amount: number
  transactionId: string
  artistName: string
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Purchase Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #1c1917; border: 1px solid rgba(217, 119, 6, 0.3); border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, rgba(217, 119, 6, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%); padding: 40px; text-align: center; border-bottom: 1px solid rgba(217, 119, 6, 0.2);">
              <h1 style="margin: 0; color: #d97706; font-size: 32px; font-weight: 300; letter-spacing: 0.1em;">ARTISAN</h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.6); font-size: 14px; letter-spacing: 0.05em;">CURATED ART MARKETPLACE</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #d97706; font-size: 24px; font-weight: 400;">🎉 Purchase Confirmed!</h2>
              <p style="margin: 0 0 30px; color: rgba(255, 255, 255, 0.8); font-size: 16px; line-height: 1.6;">
                Dear ${data.buyerName},
              </p>
              <p style="margin: 0 0 30px; color: rgba(255, 255, 255, 0.7); font-size: 15px; line-height: 1.6;">
                Thank you for your purchase! Your order has been confirmed and the artist has been notified.
              </p>
              
              <!-- Artwork Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(217, 119, 6, 0.05); border: 1px solid rgba(217, 119, 6, 0.2); border-radius: 12px; overflow: hidden; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <img src="${data.artworkImage}" alt="${data.artworkTitle}" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 10px; color: #ffffff; font-size: 20px; font-weight: 400;">${data.artworkTitle}</h3>
                    <p style="margin: 0 0 15px; color: rgba(255, 255, 255, 0.6); font-size: 14px;">by ${data.artistName}</p>
                    <div style="border-top: 1px solid rgba(217, 119, 6, 0.2); padding-top: 15px; margin-top: 15px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="color: rgba(255, 255, 255, 0.6); font-size: 14px;">Amount Paid:</td>
                          <td align="right" style="color: #d97706; font-size: 20px; font-weight: 500;">₹${data.amount.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td style="color: rgba(255, 255, 255, 0.6); font-size: 12px; padding-top: 10px;">Transaction ID:</td>
                          <td align="right" style="color: rgba(255, 255, 255, 0.5); font-size: 12px; padding-top: 10px;">${data.transactionId}</td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 20px; color: rgba(255, 255, 255, 0.7); font-size: 14px; line-height: 1.6;">
                The artist will contact you shortly regarding delivery details. You can track your order in your dashboard.
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="https://artisan.com/dashboard/collector" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #d97706 0%, #b45309 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 500; letter-spacing: 0.05em;">VIEW ORDER</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: rgba(0, 0, 0, 0.3); padding: 30px; text-align: center; border-top: 1px solid rgba(217, 119, 6, 0.2);">
              <p style="margin: 0 0 10px; color: rgba(255, 255, 255, 0.5); font-size: 12px;">
                © 2019-2026 Gaming Network Studio Media Group
              </p>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.4); font-size: 11px;">
                All Rights Reserved
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

export const purchaseEmailToArtist = (data: {
  artistName: string
  artworkTitle: string
  artworkImage: string
  amount: number
  platformFee: number
  earnings: number
  buyerName: string
  transactionId: string
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Sale Notification</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #1c1917; border: 1px solid rgba(217, 119, 6, 0.3); border-radius: 16px; overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, rgba(217, 119, 6, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%); padding: 40px; text-align: center; border-bottom: 1px solid rgba(217, 119, 6, 0.2);">
              <h1 style="margin: 0; color: #d97706; font-size: 32px; font-weight: 300; letter-spacing: 0.1em;">ARTISAN</h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.6); font-size: 14px; letter-spacing: 0.05em;">CURATED ART MARKETPLACE</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #d97706; font-size: 24px; font-weight: 400;">🎨 Congratulations! You Made a Sale!</h2>
              <p style="margin: 0 0 30px; color: rgba(255, 255, 255, 0.8); font-size: 16px; line-height: 1.6;">
                Dear ${data.artistName},
              </p>
              <p style="margin: 0 0 30px; color: rgba(255, 255, 255, 0.7); font-size: 15px; line-height: 1.6;">
                Great news! Your artwork has been purchased. Please contact the buyer to arrange delivery.
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(217, 119, 6, 0.05); border: 1px solid rgba(217, 119, 6, 0.2); border-radius: 12px; overflow: hidden; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <img src="${data.artworkImage}" alt="${data.artworkTitle}" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 10px; color: #ffffff; font-size: 20px; font-weight: 400;">${data.artworkTitle}</h3>
                    <p style="margin: 0 0 15px; color: rgba(255, 255, 255, 0.6); font-size: 14px;">Purchased by ${data.buyerName}</p>
                    <div style="border-top: 1px solid rgba(217, 119, 6, 0.2); padding-top: 15px; margin-top: 15px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 10px;">
                        <tr>
                          <td style="color: rgba(255, 255, 255, 0.6); font-size: 14px; padding: 5px 0;">Sale Amount:</td>
                          <td align="right" style="color: #ffffff; font-size: 16px; padding: 5px 0;">₹${data.amount.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td style="color: rgba(255, 255, 255, 0.6); font-size: 14px; padding: 5px 0;">Platform Fee (10%):</td>
                          <td align="right" style="color: rgba(255, 255, 255, 0.5); font-size: 14px; padding: 5px 0;">- ₹${data.platformFee.toLocaleString()}</td>
                        </tr>
                        <tr style="border-top: 1px solid rgba(217, 119, 6, 0.2);">
                          <td style="color: rgba(255, 255, 255, 0.8); font-size: 16px; padding: 10px 0 5px; font-weight: 500;">Your Earnings:</td>
                          <td align="right" style="color: #d97706; font-size: 22px; padding: 10px 0 5px; font-weight: 600;">₹${data.earnings.toLocaleString()}</td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>
              </table>
              
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="https://artisan.com/dashboard/artist" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #d97706 0%, #b45309 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 500; letter-spacing: 0.05em;">VIEW DASHBOARD</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <tr>
            <td style="background: rgba(0, 0, 0, 0.3); padding: 30px; text-align: center; border-top: 1px solid rgba(217, 119, 6, 0.2);">
              <p style="margin: 0 0 10px; color: rgba(255, 255, 255, 0.5); font-size: 12px;">
                © 2019-2026 Gaming Network Studio Media Group
              </p>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.4); font-size: 11px;">
                All Rights Reserved
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

export const supportEmailToCollector = (data: {
  collectorName: string
  artistName: string
  artistImage: string
  amount: number
  transactionId: string
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Support Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #1c1917; border: 1px solid rgba(217, 119, 6, 0.3); border-radius: 16px; overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, rgba(217, 119, 6, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%); padding: 40px; text-align: center; border-bottom: 1px solid rgba(217, 119, 6, 0.2);">
              <h1 style="margin: 0; color: #d97706; font-size: 32px; font-weight: 300; letter-spacing: 0.1em;">ARTISAN</h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.6); font-size: 14px; letter-spacing: 0.05em;">CURATED ART MARKETPLACE</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #d97706; font-size: 24px; font-weight: 400;">💝 Thank You for Your Support!</h2>
              <p style="margin: 0 0 30px; color: rgba(255, 255, 255, 0.8); font-size: 16px; line-height: 1.6;">
                Dear ${data.collectorName},
              </p>
              <p style="margin: 0 0 30px; color: rgba(255, 255, 255, 0.7); font-size: 15px; line-height: 1.6;">
                Thank you for supporting ${data.artistName}! Your contribution helps artists continue creating amazing work.
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(217, 119, 6, 0.05); border: 1px solid rgba(217, 119, 6, 0.2); border-radius: 12px; overflow: hidden; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <img src="${data.artistImage}" alt="${data.artistName}" style="width: 120px; height: 120px; border-radius: 60px; object-fit: cover; border: 3px solid #d97706; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 10px; color: #ffffff; font-size: 20px; font-weight: 400;">${data.artistName}</h3>
                    <p style="margin: 0 0 20px; color: rgba(255, 255, 255, 0.6); font-size: 14px;">Artist</p>
                    <div style="border-top: 1px solid rgba(217, 119, 6, 0.2); padding-top: 20px; margin-top: 20px;">
                      <p style="margin: 0 0 10px; color: rgba(255, 255, 255, 0.6); font-size: 14px;">Support Amount</p>
                      <p style="margin: 0; color: #d97706; font-size: 28px; font-weight: 600;">₹${data.amount.toLocaleString()}</p>
                    </div>
                  </td>
                </tr>
              </table>
              
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="https://artisan.com/dashboard/collector" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #d97706 0%, #b45309 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 500; letter-spacing: 0.05em;">VIEW DASHBOARD</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <tr>
            <td style="background: rgba(0, 0, 0, 0.3); padding: 30px; text-align: center; border-top: 1px solid rgba(217, 119, 6, 0.2);">
              <p style="margin: 0 0 10px; color: rgba(255, 255, 255, 0.5); font-size: 12px;">
                © 2019-2026 Gaming Network Studio Media Group
              </p>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.4); font-size: 11px;">
                All Rights Reserved
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

export const supportEmailToArtist = (data: {
  artistName: string
  collectorName: string
  amount: number
  platformFee: number
  earnings: number
  transactionId: string
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Support Received</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #1c1917; border: 1px solid rgba(217, 119, 6, 0.3); border-radius: 16px; overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, rgba(217, 119, 6, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%); padding: 40px; text-align: center; border-bottom: 1px solid rgba(217, 119, 6, 0.2);">
              <h1 style="margin: 0; color: #d97706; font-size: 32px; font-weight: 300; letter-spacing: 0.1em;">ARTISAN</h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.6); font-size: 14px; letter-spacing: 0.05em;">CURATED ART MARKETPLACE</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #d97706; font-size: 24px; font-weight: 400;">❤️ You Received Support!</h2>
              <p style="margin: 0 0 30px; color: rgba(255, 255, 255, 0.8); font-size: 16px; line-height: 1.6;">
                Dear ${data.artistName},
              </p>
              <p style="margin: 0 0 30px; color: rgba(255, 255, 255, 0.7); font-size: 15px; line-height: 1.6;">
                Wonderful news! ${data.collectorName} has supported your work. Keep creating amazing art!
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(217, 119, 6, 0.05); border: 1px solid rgba(217, 119, 6, 0.2); border-radius: 12px; overflow: hidden; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 30px; text-align: center;">
                    <p style="margin: 0 0 10px; color: rgba(255, 255, 255, 0.6); font-size: 14px;">Support from</p>
                    <h3 style="margin: 0 0 30px; color: #ffffff; font-size: 20px; font-weight: 400;">${data.collectorName}</h3>
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 10px;">
                      <tr>
                        <td style="color: rgba(255, 255, 255, 0.6); font-size: 14px; padding: 5px 0;">Support Amount:</td>
                        <td align="right" style="color: #ffffff; font-size: 16px; padding: 5px 0;">₹${data.amount.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td style="color: rgba(255, 255, 255, 0.6); font-size: 14px; padding: 5px 0;">Platform Fee (5%):</td>
                        <td align="right" style="color: rgba(255, 255, 255, 0.5); font-size: 14px; padding: 5px 0;">- ₹${data.platformFee.toLocaleString()}</td>
                      </tr>
                      <tr style="border-top: 1px solid rgba(217, 119, 6, 0.2);">
                        <td style="color: rgba(255, 255, 255, 0.8); font-size: 16px; padding: 10px 0 5px; font-weight: 500;">You Receive:</td>
                        <td align="right" style="color: #d97706; font-size: 22px; padding: 10px 0 5px; font-weight: 600;">₹${data.earnings.toLocaleString()}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="https://artisan.com/dashboard/artist" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #d97706 0%, #b45309 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 500; letter-spacing: 0.05em;">VIEW DASHBOARD</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <tr>
            <td style="background: rgba(0, 0, 0, 0.3); padding: 30px; text-align: center; border-top: 1px solid rgba(217, 119, 6, 0.2);">
              <p style="margin: 0 0 10px; color: rgba(255, 255, 255, 0.5); font-size: 12px;">
                © 2019-2026 Gaming Network Studio Media Group
              </p>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.4); font-size: 11px;">
                All Rights Reserved
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
