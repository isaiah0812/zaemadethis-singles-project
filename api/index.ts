import express, { Request, Response } from 'express';
import path from 'node:path';
import { createReadStream } from 'node:fs';

const app = express();

app.get('/', (_: Request, res: Response) => {
  createReadStream(path.resolve('./assets/file_example_WAV_10MG.wav')).pipe(res);
});

app.listen(8080, () => {
  console.log('Hello World!');
})