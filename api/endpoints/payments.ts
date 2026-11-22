import express, { Request, Response } from 'express';
import { stripe } from '../config/stripe';
import { getCurrentFiles } from './audio';
import { current_id } from '../tools/utils';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const payments = express();

interface StartPaymentRequest {
  price: number;
}

payments.post('/start-payment', async (req: Request<any, any, StartPaymentRequest>, res: Response) => {
  const { price } = req.body;

  const session = await stripe.checkout.sessions.create({
    ui_mode: 'elements',
    mode: 'payment',
    return_url: `http://localhost:3000?session_id={CHECKOUT_SESSION_ID}&song_id=${current_id}`,
    line_items: [
        {
            price_data: {
                currency: 'usd',
                product_data: {
                    name: 'Current Song'
                },
                unit_amount: price
            },
            quantity: 1
        }
    ],
    metadata: {
      song_id: current_id
    }
  });

  if (!session.client_secret) {
    console.error('Session is missing the secret.');
    res.status(500).send('Payment not created. Something went wrong');
    return;
  }

  res.send(session.client_secret);
  console.info('Checkout session started!')
});

interface VerifyPaymentParams {
  session_id: string
}

payments.get('/verify-payment/:session_id', async (req: Request<VerifyPaymentParams>, res: Response) => {
  const session_id = req.params.session_id;

  if (!req.query.song_id) {
    res.status(400).send('song_id required.');
    return;
  }
  console.info(`Verifying payment of session ${session_id}...`);

  const session = await stripe.checkout.sessions.retrieve(session_id);

  let message;

  if (session.payment_status !== 'paid') {
    message = 'Checkout not paid.';
    res.status(400);
    console.warn(`session ${session_id} status: ${message}`);
  } else if (session.metadata?.song_id !== req.query.song_id) {
    message = 'Invalid payment for selected song.';
    res.status(400);
    console.warn(`session ${session_id} status: ${message}`);
  } else {
    message = jwt.sign({ song_id: req.query.song_id }, process.env.JWT_SECRET!, { expiresIn: 3600 });
    res.status(200);
    console.info(`session ${session_id} verified!`);
  }

  res.send(message);
});

export default payments;