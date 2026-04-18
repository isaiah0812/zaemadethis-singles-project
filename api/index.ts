import express, { Request, Response } from 'express';
import path from 'node:path';
import { createReadStream, readFileSync, rmSync } from 'node:fs';
import cors from 'cors';
import id3 from 'node-id3';
import { Storage } from '@google-cloud/storage';
import os from 'node:os';

const app = express();
app.use(cors());

const storage = new Storage({
  apiEndpoint: 'http://host.docker.internal:4443',
  projectId: 'test'
});

const fileName = 'Dont_Go_Way_Nobody_with_tags.mp3'
const downloadedFile = path.resolve(`./assets/${fileName}`);
const tagsFile = path.resolve('./assets/tags.json');
const id3File = id3.update(JSON.parse(readFileSync(tagsFile).toString()), downloadedFile)

if (id3File === true) {
  console.log('Tags written to file!');
} else {
  console.error(id3File.message);
}

app.get('/audio/stream', (req: Request, res: Response) => createReadStream(path.resolve('./assets/Dont_Go_Way_Nobody.mp3')).pipe(res));
app.get('/audio/download', async (req: Request, res: Response) => {
  const dest = path.resolve(`${os.tmpdir()}/audio.mp3`);
  await storage.bucket('sample_bucket').file(fileName).download({ destination: dest });
  res.download(dest);
});
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

app.listen(8080, async () => {

  const [ files ] = await storage.bucket('sample_bucket').getFiles()
  console.log('Files:');
  files.forEach((file: any) => {
    console.log(file.id);
  })
  console.log('Hello World!');
})