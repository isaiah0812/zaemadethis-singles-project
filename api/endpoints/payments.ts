import express, { Request, Response } from 'express';

const payments = express();

payments.post('/start-payment', (req: Request, res: Response) => {
  res.send('Start the payment process!');
})

export default payments;