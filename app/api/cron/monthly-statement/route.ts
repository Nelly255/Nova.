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
            <div style="font-family: 'Helvetica Neue', Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F8FAFC; padding: 40px 20px; border-radius: 16px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #4F46E5; font-size: 28px; margin: 0; font-weight: 900; letter-spacing: -1px;">Nova.</h1>
                <p style="color: #64748B; font-size: 14px; margin-top: 5px; text-transform: uppercase; letter-spacing: 1px;">Monthly Statement</p>
              </div>
              
              <div style="background-color: #FFFFFF; padding: 40px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.02); border: 1px solid #E2E8F0;">
                <h2 style="color: #0F172A; font-size: 20px; margin-top: 0; margin-bottom: 5px;">Hello ${name},</h2>
                <p style="color: #475569; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
                  Your financial statement for <strong>${monthName} ${yearName}</strong> is ready. Here is a quick snapshot of your monthly flow.
                </p>

                <div style="background-color: #F8FAFC; padding: 20px; border-radius: 16px; margin-bottom: 30px; border: 1px solid #E2E8F0;">
                  
                  <div style="margin-bottom: 20px;">
                    <p style="font-size: 11px; color: #64748B; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 5px 0; font-weight: bold;">Total Income</p>
                    <p style="font-size: 24px; color: #10B981; margin: 0; font-weight: 800;">+TSh ${stats.income.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  
                  <div style="margin-bottom: 20px;">
                    <p style="font-size: 11px; color: #64748B; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 5px 0; font-weight: bold;">Total Expenses</p>
                    <p style="font-size: 24px; color: #E11D48; margin: 0; font-weight: 800;">-TSh ${stats.expense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  
                  <div style="border-top: 2px solid #E2E8F0; padding-top: 20px;">
                    <p style="font-size: 11px; color: #4F46E5; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 5px 0; font-weight: bold;">Net Cash Flow</p>
                    <p style="font-size: 28px; color: #0F172A; margin: 0; font-weight: 900;">${netFlow >= 0 ? '+' : ''}TSh ${netFlow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>

                </div>

                <p style="color: #475569; font-size: 15px; line-height: 1.6; text-align: center; margin-bottom: 25px;">
                  Need this for your accountant? Download the fully itemized official PDF report directly from your vault.
                </p>

                <a href="https://nova.co.tz/dashboard/settings" style="display: block; width: 100%; text-align: center; background-color: #0F172A; color: #FFFFFF; padding: 16px 0; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px;">
                  Download Official PDF
                </a>
              </div>
              
              <p style="text-align: center; color: #94A3B8; font-size: 12px; margin-top: 30px;">
                Securely generated by the Nova Tracking Engine.<br>Arusha, Tanzania
              </p>
            </div>
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