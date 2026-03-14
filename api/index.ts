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
app.post('/audio/save', (req: Request, res: Response) => res.send('Saving Audio!'));
app.get('/audio/list', (req: Request, res: Response) => res.send('List all the audio!'));
app.patch('/audio/:id/publish', (req: Request, res: Response) => res.send('Publish this Audio!'));
app.patch('/audio/:id/archive', (req: Request, res: Response) => res.send('Archive this audio!'));
app.get('/audio/:id/file', (req: Request, res: Response) => res.send('Get this audio file!'));

// TODO developer notes blog implementation
app.get('/blog/posts', (req: Request, res: Response) => res.send('Getting (short) blog posts!'));
app.post('/blog/posts', (req: Request, res: Response) => res.send('Posting a blog post!'));
app.get('/blog/posts/:id', (req: Request, res: Response) => res.send('Getting one blog post!'));
app.put('/blog/posts/:id', (req: Request, res: Response) => res.send('Updating this blog post!'));
app.patch('/blog/posts/:id/archive', (req: Request, res: Response) => res.send('Archive this blog post!'));

app.listen(8080, () => {
  console.log('Hello World!');
})