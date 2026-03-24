import { Resend } from 'resend';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Moved inside the function! Now the build won't crash.
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const { email, name } = await request.json();

    const data = await resend.emails.send({
      from: 'Nova <onboarding@resend.dev>', 
      to: email, 
      subject: 'Welcome to Nova. 🚀',
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #FAFAFA; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4F46E5; font-size: 28px; margin: 0;">Nova.</h1>
          </div>
          <div style="background-color: #FFFFFF; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <h2 style="color: #111827; font-size: 20px; margin-top: 0;">Welcome to the Vault, ${name || 'there'}!</h2>
            <p style="color: #4B5563; font-size: 16px; line-height: 1.6;">
              Your financial dashboard is successfully set up and ready to go. Stop wondering where your money went, and start directing where it goes.
            </p>
            <div style="background-color: #EEF2FF; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <p style="color: #3730A3; font-size: 14px; font-weight: bold; margin-top: 0;">NEXT STEPS:</p>
              <ul style="color: #4338CA; font-size: 14px; padding-left: 20px; margin-bottom: 0;">
                <li style="margin-bottom: 8px;">Set your first budget limit</li>
                <li style="margin-bottom: 8px;">Add your current cash & assets</li>
                <li>Log your first transaction</li>
              </ul>
            </div>
            <p style="color: #4B5563; font-size: 16px; margin-bottom: 0;">
              Let's build wealth,<br/>
              <strong>The Nova Team</strong>
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error });
  }
}