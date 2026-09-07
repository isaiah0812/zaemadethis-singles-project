import express, { Request, Response } from 'express';
import { stripe } from '../config/stripe';

const payments = express();

payments.post('/start-payment', async (req: Request, res: Response) => {
  const session = await stripe.checkout.sessions.create({
    ui_mode: 'elements',
    mode: 'payment',
    return_url: 'http://localhost:8080/audio/download',
    line_items: [
        {
            price_data: {
                currency: 'usd',
                product_data: {
                    name: 'Current Song'
                },
                unit_amount: 100
            },
            quantity: 1
        }
    ]
  });

  if (!session.client_secret) {
    console.error('Session is missing the secret.');
    res.status(500).send('Payment not created. Something went wrong');
    return;
  }

  res.send(session.client_secret);
});

export default payments;