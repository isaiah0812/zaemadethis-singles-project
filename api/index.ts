import express, { Request, Response } from 'express';
import 'dotenv/config';
import { mkdir } from 'node:fs';
import cors from 'cors';
import blog from './endpoints/blog';
import audio from './endpoints/audio';
import { downloadsFolder, archivePrepFolder, bucket, initBucket } from './config/gcs';
import payments from './endpoints/payments';
import './config/stripe';
import './config/multer';
import { getCurrentId } from './tools/utils';
import jwt from 'jsonwebtoken';

// Express config
const app = express();
app.use(cors());
app.use(express.json());

app.use('/audio', audio);
app.use ('/payments', payments);
app.use('/blog', blog);
app.get('/health', (_: Request, res: Response) => res.status(200).send());

app.listen(8080, async () => {
  // TODO: fail if the secrets aren't there
  console.info('Server configuration starting...');
  await Promise.all([
    mkdir(downloadsFolder, () => console.info(`💾 Downloads folder created at ${downloadsFolder}`)),
    mkdir(archivePrepFolder, () => console.info(`🗄️ Archive prep folder created at ${archivePrepFolder}`))
  ]);
  console.info('Getting storage bucket...');
  initBucket();
  console.info(`🪣 Bucket retrieved (name: ${bucket.name})`);
  
  await getCurrentId();
  console.info('Server ready to go! 👌');
})