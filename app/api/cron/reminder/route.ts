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
        from: 'Nova <onboarding@resend.dev>',
        to: user.email!,
        subject: 'Did you spend anything today? 🌙',
        html: `
          <div style="font-family: 'Inter', sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background-color: #FAFAFA; border-radius: 16px; border: 1px solid #E5E7EB;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #4F46E5; font-size: 24px; margin: 0; font-weight: 800;">Nova.</h1>
            </div>
            <div style="background-color: #FFFFFF; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
              <h2 style="color: #0F172A; font-size: 18px; margin-top: 0;">Evening Vault Check</h2>
              <p style="color: #475569; font-size: 15px; line-height: 1.6;">
                Hey ${name}, we noticed your vault has been quiet today. 
              </p>
              <p style="color: #475569; font-size: 15px; line-height: 1.6;">
                Did you grab a coffee? Pay for transport? Keep your financial tracking perfectly accurate by taking 30 seconds to log your expenses before bed.
              </p>
              <a href="https://nova-two-beta.vercel.app/dashboard" style="display: block; width: 100%; text-align: center; background-color: #0F172A; color: #FFFFFF; padding: 14px 0; text-decoration: none; border-radius: 10px; font-weight: bold; margin-top: 25px;">
                Open My Vault
              </a>
            </div>
          </div>
        `
      });
    }

    return NextResponse.json({ success: true, emailedCount: forgetfulUsers.length });
  } catch (error) {
    console.error("Cron Job Failed:", error);
    return NextResponse.json({ error: 'Failed to run cron job' }, { status: 500 });
  }
}