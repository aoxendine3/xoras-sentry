import { verifyStripeSignature, processStripeEvent } from '../../../../../../../packages/integrations/payments/stripe.cjs';
import crypto from 'crypto';
import { db, licenses } from '@xoras/db';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 'fallback-key-to-pass-builds');

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return new Response(JSON.stringify({ error: 'Missing Stripe signature header' }), { status: 400 });
  }

  try {
    // Verify signature using the secret from environment variables
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
      throw new Error('STRIPE_WEBHOOK_SECRET not configured');
    }
    verifyStripeSignature(body, signature, secret);

    const event = JSON.parse(body);

    // Fulfillment Handler
    await processStripeEvent(event, async (ev: any) => {
      if (ev.type === 'checkout.session.completed') {
        const session = ev.data.object;
        console.log('💳 Checkout completed for session', session.id);
        
        // Generate License Key
        const rawKey = crypto.randomBytes(24).toString('hex');
        const licenseKey = `XORAS-${rawKey.substring(0, 8)}-${rawKey.substring(8, 16)}-${rawKey.substring(16, 24)}`;
        
        const customerEmail = session.customer_details?.email || session.customer_email || 'unknown@customer.com';
        
        try {
          // 1. Provision in Database
          await db.insert(licenses).values({
            licenseKey,
            email: customerEmail,
            stripeCustomerId: session.customer,
            tier: 'INSTITUTIONAL'
          });
          console.log(`✅ License ${licenseKey} provisioned for ${customerEmail}`);

          // 2. Dispatch Email Delivery via Resend
          if (process.env.RESEND_API_KEY) {
            const { data, error } = await resend.emails.send({
              from: 'XORAS Sentry <support@xoras.com>', // Update with your verified Resend domain
              to: [customerEmail],
              subject: 'Your XORAS Sentry Institutional License Key',
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #0A0A0A; color: #FFFFFF; padding: 40px; border-radius: 8px; border: 1px solid #1F2937;">
                  <h1 style="color: #00E5FF; text-align: center;">XORAS SENTRY</h1>
                  <h2 style="color: #F3F4F6;">Institutional Access Granted</h2>
                  <p style="color: #9CA3AF; line-height: 1.6;">Thank you for securing your infrastructure with XORAS Sentry. Your institutional license has been provisioned.</p>
                  
                  <div style="background-color: #111827; padding: 20px; border-radius: 6px; margin: 30px 0; border-left: 4px solid #F59E0B;">
                    <p style="color: #9CA3AF; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase;">Your License Key</p>
                    <code style="color: #FCD34D; font-size: 18px; font-weight: bold; letter-spacing: 1px;">${licenseKey}</code>
                  </div>

                  <h3 style="color: #F3F4F6;">Next Steps:</h3>
                  <ol style="color: #9CA3AF; line-height: 1.6;">
                    <li>Install the CLI: <code style="background-color: #1F2937; padding: 2px 6px; border-radius: 4px;">npm install -g xoras-sentry</code></li>
                    <li>Authenticate: <code style="background-color: #1F2937; padding: 2px 6px; border-radius: 4px;">xoras auth --key ${licenseKey}</code></li>
                    <li>Run your first audit: <code style="background-color: #1F2937; padding: 2px 6px; border-radius: 4px;">xoras audit ./src</code></li>
                  </ol>

                  <p style="color: #6B7280; font-size: 12px; margin-top: 40px; text-align: center;">XORAS Global Research &bull; Institutional Infrastructure</p>
                </div>
              `
            });

            if (error) {
              console.error('❌ Failed to dispatch license email:', error);
            } else {
              console.log(`✉️ License email dispatched successfully to ${customerEmail}`);
            }
          } else {
            console.warn('⚠️ RESEND_API_KEY not configured. Skipping email dispatch.');
          }

        } catch (dbErr) {
          console.error('❌ Failed to provision license in DB:', dbErr);
          // depending on policy, you might want to throw here so the stripe event is retried,
          // but for now we catch to avoid breaking the webhook loop.
        }
      } else if (ev.type === 'payment_intent.succeeded') {
        console.log('💰 Payment succeeded:', ev.data.object.id);
        // Additional handling if needed
      }
      return { status: 'handled' };
    });

    return new Response(JSON.stringify({ received: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Stripe webhook error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
}
