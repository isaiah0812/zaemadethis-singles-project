import Stripe from 'stripe';
import 'dotenv/config';

export const stripe: Stripe = new Stripe(process.env.STRIPE_KEY ?? 'no-key');