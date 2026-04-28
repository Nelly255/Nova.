import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  // 1. SECURITY LOCK: Make sure only Vercel can trigger this API!
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized Hacker Activity Blocked', { status: 401 });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    // 2. VIP DATABASE ACCESS: We use the service_role key to see all data
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! 
    );

    // 3. THE DETECTIVE WORK: Find today's date
    const today = new Date().toISOString().split('T')[0];

    // Find ALL transactions that happened today
    const { data: todayTxns } = await supabaseAdmin
      .from('transactions')
      .select('user_id')
      .gte('date', today);

    // Create a unique list of user IDs who DID log something today
    const activeUserIds = new Set(todayTxns?.map(tx => tx.user_id) || []);

    // Get a list of ALL registered users
    const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    if (userError) throw userError;

    // Filter out the active users. Whoever is left is FORGETFUL!
    const forgetfulUsers = users.filter(user => !activeUserIds.has(user.id));

    // 4. THE POSTMAN: Loop through the forgetful users and email them
    for (const user of forgetfulUsers) {
      const name = user.user_metadata?.full_name?.split(" ")[0] || 'there';

      // NOTE: Until you buy a domain, Resend will only successfully deliver to YOUR email address.
      await resend.emails.send({
        from: 'Nova <info@nova.co.tz>',
        to: user.email!,
        subject: 'Did you spend anything today?',
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Evening Vault Check</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #F4F4F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #09090B;">
            
            <div style="display: none; max-height: 0px; overflow: hidden;">
              We noticed your vault has been quiet today. Keep your financial tracking perfectly accurate...
            </div>

            <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F4F4F5" style="padding: 40px 20px;">
              <tr>
                <td align="center">
                  
                  <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" bgcolor="#FFFFFF" style="max-width: 600px; border-radius: 24px; overflow: hidden; box-shadow: 0 8px 40px rgba(0,0,0,0.04); border: 1px solid #E4E4E7;">
                    
                    <tr>
                      <td align="center" style="padding: 48px 40px 32px 40px; border-bottom: 1px solid #F4F4F5;">
                        <h1 style="margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -1px; color: #09090B;">
                          Nova<span style="color: #4F46E5;">.</span>
                        </h1>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding: 40px;">
                        <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; letter-spacing: 1px; color: #A1A1AA; text-transform: uppercase;">Evening Check-in</p>
                        
                        <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; color: #09090B;">
                          Hey ${name}, your vault has been quiet.
                        </h2>
                        
                        <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 26px; color: #52525B;">
                          Did you grab a coffee? Pay for transport? Send a mobile money transfer?
                        </p>

                        <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 26px; color: #52525B;">
                          The secret to building lasting wealth is knowing exactly where every shilling goes. Take 30 seconds to log your daily activity before bed so your True Net Worth stays perfectly accurate.
                        </p>

                        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 16px;">
                          <tr>
                            <td align="center">
                              <a href="https://nova.co.tz/dashboard" target="_blank" style="display: block; width: 100%; text-align: center; padding: 18px 0; background-color: #09090B; color: #FFFFFF; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 12px; letter-spacing: 0.5px;">Open My Vault</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; padding-top: 32px;">
                    <tr>
                      <td align="center">
                        <p style="margin: 0 0 8px 0; font-size: 12px; color: #A1A1AA;">© 2026 Nova Finance. All rights reserved.</p>
                        <p style="margin: 0; font-size: 12px; color: #A1A1AA;">Arusha, Tanzania</p>
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>
            </table>
          </body>
          </html>
        `
      });
    }

    return NextResponse.json({ success: true, emailedCount: forgetfulUsers.length });
  } catch (error) {
    console.error("Cron Job Failed:", error);
    return NextResponse.json({ error: 'Failed to run cron job' }, { status: 500 });
  }
}