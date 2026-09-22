import express, { Request, Response } from 'express';
import { stripe } from '../config/stripe';
import { getCurrentFiles } from './audio';
import { current_id } from '../config/utils';

const payments = express();

interface StartPaymentRequest {
  price: number;
}

payments.post('/start-payment', async (req: Request<any, any, StartPaymentRequest>, res: Response) => {
  const { price } = req.body;

  const session = await stripe.checkout.sessions.create({
    ui_mode: 'elements',
    mode: 'payment',
    return_url: 'http://localhost:3000?session_id={CHECKOUT_SESSION_ID}',
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
  console.info(`Verifying payment of session ${session_id}`);

  const session = await stripe.checkout.sessions.retrieve(session_id);

  let message;

  if (session.payment_status !== 'paid') {
    message = 'Checkout not paid.';
  } else if (session.metadata?.song_id !== current_id) {
    message = 'Song not available.';
  } else {
    message = 'OK!'
  }

  console.info(`session ${session_id} status: ${message}`);
  res.status(200).send(message);
});

export default payments;