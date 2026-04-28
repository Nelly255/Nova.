import { Resend } from 'resend';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Moved inside the function! Now the build won't crash.
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const { email, name } = await request.json();

    const data = await resend.emails.send({
      from: 'Nova <info@nova.co.tz>', 
      to: email, 
      subject: 'Welcome to Nova. Your vault is ready.',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Nova</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #F4F4F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #09090B;">
          
          <div style="display: none; max-height: 0px; overflow: hidden;">
            Your financial dashboard is successfully set up and ready to go.
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
                      <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; color: #09090B;">
                        Welcome to the Vault, ${name || 'there'}.
                      </h2>
                      <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 26px; color: #52525B;">
                        Your command center is officially online. You now have the tools to track every asset, crush debt, and monitor your subscriptions from one breathtaking dashboard. Stop wondering where your money went, and start directing exactly where it goes.
                      </p>

                      <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#FAFAFA" style="border-radius: 16px; padding: 24px; border: 1px solid #F4F4F5; margin-bottom: 32px;">
                        <tr>
                          <td>
                            <p style="margin: 0 0 16px 0; font-size: 12px; font-weight: 700; letter-spacing: 1px; color: #A1A1AA; text-transform: uppercase;">Next Steps to Wealth</p>
                            
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                              <tr>
                                <td width="24" valign="top" style="padding-bottom: 12px;">
                                  <div style="width: 20px; height: 20px; border-radius: 10px; background-color: #EEF2FF; color: #4F46E5; font-size: 12px; font-weight: bold; text-align: center; line-height: 20px;">1</div>
                                </td>
                                <td valign="top" style="padding-bottom: 12px; font-size: 15px; color: #3F3F46; font-weight: 500;">Set your first budget limit</td>
                              </tr>
                              <tr>
                                <td width="24" valign="top" style="padding-bottom: 12px;">
                                  <div style="width: 20px; height: 20px; border-radius: 10px; background-color: #EEF2FF; color: #4F46E5; font-size: 12px; font-weight: bold; text-align: center; line-height: 20px;">2</div>
                                </td>
                                <td valign="top" style="padding-bottom: 12px; font-size: 15px; color: #3F3F46; font-weight: 500;">Add your current cash & assets</td>
                              </tr>
                              <tr>
                                <td width="24" valign="top">
                                  <div style="width: 20px; height: 20px; border-radius: 10px; background-color: #EEF2FF; color: #4F46E5; font-size: 12px; font-weight: bold; text-align: center; line-height: 20px;">3</div>
                                </td>
                                <td valign="top" style="font-size: 15px; color: #3F3F46; font-weight: 500;">Log your first transaction</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 40px;">
                        <tr>
                          <td align="center">
                            <a href="https://nova.co.tz/dashboard" target="_blank" style="display: inline-block; padding: 16px 32px; background-color: #09090B; color: #FFFFFF; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 12px; letter-spacing: 0.5px;">Open Dashboard</a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 0; font-size: 16px; line-height: 26px; color: #52525B;">
                        Let's build wealth,<br/>
                        <strong style="color: #09090B;">The Nova Team</strong>
                      </p>
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
      `,
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error });
  }
}