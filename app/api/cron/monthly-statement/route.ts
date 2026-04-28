import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  // 1. SECURITY LOCK
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 2. TIME TRAVEL MATH: Find the exact dates for LAST month
    const now = new Date();
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    
    // Format dates for Supabase (YYYY-MM-DD)
    const startDateStr = firstDayOfLastMonth.toISOString().split('T')[0];
    const endDateStr = lastDayOfLastMonth.toISOString().split('T')[0];
    
    const monthName = firstDayOfLastMonth.toLocaleString('default', { month: 'long' });
    const yearName = firstDayOfLastMonth.getFullYear();

    // 3. FETCH EVERYTHING: Get all transactions from last month
    const { data: allTxns, error: txError } = await supabaseAdmin
      .from('transactions')
      .select('user_id, amount, type')
      .gte('date', startDateStr)
      .lte('date', endDateStr);

    if (txError) throw txError;

    // 4. THE AGGREGATOR: Group the math by User ID
    const userStats: Record<string, { income: number; expense: number }> = {};
    
    allTxns?.forEach(tx => {
      if (!userStats[tx.user_id]) {
        userStats[tx.user_id] = { income: 0, expense: 0 };
      }
      if (tx.type === 'income') userStats[tx.user_id].income += Number(tx.amount);
      if (tx.type === 'expense') userStats[tx.user_id].expense += Number(tx.amount);
    });

    // 5. FETCH USERS: Get their emails and names
    const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    if (userError) throw userError;

    // 6. THE DELIVERY: Blast out the beautiful emails
    let emailedCount = 0;

    for (const user of users) {
      // Only send an email if they actually tracked something last month!
      if (userStats[user.id]) {
        const stats = userStats[user.id];
        const netFlow = stats.income - stats.expense;
        const name = user.user_metadata?.full_name?.split(" ")[0] || 'there';

        await resend.emails.send({
          from: 'Nova <info@nova.co.tz>', // Update this when you get your custom domain!
          to: user.email!,
          subject: `Your ${monthName} Financial Statement from Nova 📄`,
          html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Monthly Statement</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #F4F4F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #09090B;">
              
              <div style="display: none; max-height: 0px; overflow: hidden;">
                Your financial statement for ${monthName} ${yearName} is ready. Here is your monthly snapshot...
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
                          <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; letter-spacing: 1px; color: #A1A1AA; text-transform: uppercase;">${monthName} ${yearName} Statement</p>
                          
                          <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; color: #09090B;">
                            Hello ${name},
                          </h2>
                          
                          <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 26px; color: #52525B;">
                            Your financial statement for <strong>${monthName}</strong> is ready. Here is a quick snapshot of your monthly cash flow.
                          </p>

                          <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#FAFAFA" style="border-radius: 16px; padding: 24px; border: 1px solid #F4F4F5; margin-bottom: 32px;">
                            
                            <tr>
                              <td style="padding-bottom: 20px;">
                                <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 700; letter-spacing: 1px; color: #A1A1AA; text-transform: uppercase;">Total Income</p>
                                <p style="margin: 0; font-size: 22px; font-weight: 700; color: #10B981;">+TSh ${stats.income.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                              </td>
                            </tr>
                            
                            <tr>
                              <td style="padding-bottom: 24px; border-bottom: 1px solid #E4E4E7;">
                                <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 700; letter-spacing: 1px; color: #A1A1AA; text-transform: uppercase;">Total Expenses</p>
                                <p style="margin: 0; font-size: 22px; font-weight: 700; color: #E11D48;">-TSh ${stats.expense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                              </td>
                            </tr>
                            
                            <tr>
                              <td style="padding-top: 24px;">
                                <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 700; letter-spacing: 1px; color: #4F46E5; text-transform: uppercase;">Net Cash Flow</p>
                                <p style="margin: 0; font-size: 28px; font-weight: 800; color: #09090B; letter-spacing: -0.5px;">${netFlow >= 0 ? '+' : ''}TSh ${netFlow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                              </td>
                            </tr>

                          </table>

                          <p style="margin: 0 0 32px 0; font-size: 15px; line-height: 24px; color: #52525B; text-align: center;">
                            Need this for your accountant? Download the fully itemized official PDF report directly from your vault.
                          </p>

                          <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td align="center">
                                <a href="https://nova.co.tz/dashboard/settings" target="_blank" style="display: block; width: 100%; text-align: center; padding: 18px 0; background-color: #09090B; color: #FFFFFF; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 12px; letter-spacing: 0.5px;">Download Official PDF</a>
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
        emailedCount++;
      }
    }

    return NextResponse.json({ success: true, emailedCount, month: monthName });
  } catch (error) {
    console.error("Monthly Statement Cron Failed:", error);
    return NextResponse.json({ error: 'Failed to run statement job' }, { status: 500 });
  }
}