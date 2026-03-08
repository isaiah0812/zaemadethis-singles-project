import express, { Request, Response } from 'express';
import path from 'node:path';
import { createReadStream, readFileSync } from 'node:fs';
import cors from 'cors';
import id3 from 'node-id3';

const app = express();
app.use(cors());

const downloadedFile = path.resolve('./assets/Dont_Go_Way_Nobody_with_tags.mp3');
const tagsFile = path.resolve('./assets/tags.json');
const id3File = id3.update(JSON.parse(readFileSync(tagsFile).toString()), downloadedFile)

if (id3File === true) {
  console.log('Tags written to file!');
} else {
  console.error(id3File.message);
}

app.get('/audio/stream', (req: Request, res: Response) => createReadStream(path.resolve('./assets/Dont_Go_Way_Nobody.mp3')).pipe(res));
app.get('/audio/download', (req: Request, res: Response) => res.download(downloadedFile));

app.listen(8080, () => {
  console.log('Hello World!');
})