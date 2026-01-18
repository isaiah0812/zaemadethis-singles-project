import express, { Request, Response } from 'express';
import path from 'node:path';
import { createReadStream } from 'node:fs';

const app = express();

app.get('/audio/stream', (req: Request, res: Response) => createReadStream(path.resolve('./assets/Dont_Go_Way_Nobody.mp3')).pipe(res));
app.get('/audio/download', (req: Request, res: Response) => res.sendFile(path.resolve('./assets/file_example_WAV_1MG.wav')));

app.listen(8080, () => {
  console.log('Hello World!');
})