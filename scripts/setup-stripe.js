require('dotenv').config();
const Stripe = require('stripe');

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error("❌ Error: STRIPE_SECRET_KEY is missing from your .env file.");
  console.log("Please add it and try again.");
  process.exit(1);
}

const stripe = Stripe(stripeSecretKey);

async function setup() {
  try {
    console.log("🚀 Starting Stripe Programmatic Setup for XORAS Sentry...\n");

    // ============================================
    // 1. Indie Bundle ($49 One-Time)
    // ============================================
    console.log("Creating 'XORAS Sentry - Indie Bundle' Product...");
    const indieProduct = await stripe.products.create({
      name: 'XORAS Sentry - Indie Bundle',
      description: 'The essential toolkit for solo developers. Includes CLI access, AST scanning, local HTML reports, and pre-commit hook installer.',
    });

    const indiePrice = await stripe.prices.create({
      product: indieProduct.id,
      unit_amount: 4900, // $49.00
      currency: 'usd',
    });

    const indiePaymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: indiePrice.id,
          quantity: 1,
        },
      ],
      after_completion: {
        type: 'redirect',
        redirect: {
          url: 'https://xoras.com/success?tier=indie',
        },
      },
    });

    console.log(`✅ Indie Bundle Created!`);
    console.log(`   Product ID: ${indieProduct.id}`);
    console.log(`   Price ID: ${indiePrice.id}`);
    console.log(`   Payment Link: ${indiePaymentLink.url}\n`);

    // ============================================
    // 2. Team Pro ($79/year Recurring)
    // ============================================
    console.log("Creating 'XORAS Sentry - Team Pro' Product...");
    const teamProduct = await stripe.products.create({
      name: 'XORAS Sentry - Team Pro',
      description: 'Professional-grade enforcement for teams. Includes Github Actions workflow, .sentry-ignore rule builder, and priority support.',
    });

    const teamPrice = await stripe.prices.create({
      product: teamProduct.id,
      unit_amount: 7900, // $79.00
      currency: 'usd',
      recurring: {
        interval: 'year',
      },
    });

    const teamPaymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: teamPrice.id,
          quantity: 1,
        },
      ],
      after_completion: {
        type: 'redirect',
        redirect: {
          url: 'https://xoras.com/success?tier=pro',
        },
      },
    });

    console.log(`✅ Team Pro Created!`);
    console.log(`   Product ID: ${teamProduct.id}`);
    console.log(`   Price ID: ${teamPrice.id}`);
    console.log(`   Payment Link: ${teamPaymentLink.url}\n`);

    console.log("🎉 Stripe setup complete! Use the Payment Links above on your landing page.");

  } catch (error) {
    console.error("❌ Stripe Setup Failed:");
    console.error(error.message);
  }
}

setup();
