import express, { Request, Response } from 'express';
import path from 'node:path';
import { createReadStream, existsSync, mkdirSync, readFileSync } from 'node:fs';
import cors from 'cors';
import id3 from 'node-id3';
import { Bucket, Storage, StorageOptions } from '@google-cloud/storage';
import os from 'node:os';
import multer from 'multer';
import { create as createTarball } from 'tar';
import { v4 as uuid } from 'uuid';

// Multer config
const upload = multer({
  storage: multer.memoryStorage()
});

type RequestFile = Express.Multer.File;

// Express config
const app = express();
app.use(cors());

// GCS Config
const gcs_api = 'http://host.docker.internal:4443'
const gcs_connection_options: StorageOptions = {
  apiEndpoint: gcs_api,
  projectId: 'test'
}

const storage = new Storage(gcs_connection_options);
let bucket: Bucket;

const fileName = 'Dont_Go_Way_Nobody_with_tags.mp3'
const downloadedFile = path.resolve(`./assets/${fileName}`);
const tagsFile = path.resolve('./assets/tags.json');
const id3File = id3.update(JSON.parse(readFileSync(tagsFile).toString()), downloadedFile)

if (id3File === true) {
  console.info('Tags written to file!');
} else {
  console.error(id3File.message);
}

app.get('/audio/stream', async (req: Request, res: Response) => {
  const dest = path.resolve(`${os.tmpdir()}/current.mp3`);
  await (await bucket.getFiles({ prefix: 'current' }))[0]
    .find(f => f.name.endsWith('.mp3'))
    ?.download({ destination: dest })
  createReadStream(dest).pipe(res);
});
app.get('/audio/download', async (req: Request, res: Response) => {
  const dest = path.resolve(`${os.tmpdir()}/audio.mp3`);
  await storage.bucket('sample_bucket').file(fileName).download({ destination: dest });
  res.download(dest);
});
app.post(
  '/audio/save',
  upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'cover', maxCount: 1 }, { name: 'tags', maxCount: 1 }]),
  async (req: Request, res: Response) => {
    // Error out if the files don't show up
    if (!req.files || Array.isArray(req.files)) {
      console.info('Request:', req);
      console.error(`Request files isn't an array for some reason: ${req.files ? JSON.stringify(req.files, null, 2) : req.files} `);
      res.status(500).send('Server error. Check logs.');
      return;
    }

    const { audio: audios, cover: covers, tags: tagForms } = req.files;
    
    // Form validation
    if (!audios || !audios[0]) {
      res.status(400).send('audio field required');
      return;
    }

    if (!covers || !covers[0]) {
      res.status(400).send('covers field required');
      return;
    }

    if (!tagForms || !tagForms[0]) {
      res.status(400).send('tags field required');
      return;
    }

    const audio = audios[0];
    const cover = covers[0];
    const tagForm = tagForms[0];

    /**
     * Saves files to GCS. Run it last.
     * 
     * @param id The ID of the song
     * @param audio the song's audio file
     * @param cover the cover art file
     * @param tags the mp3 metadata
     */
    const saveToCurrent = async (id: string, audio: RequestFile, cover: RequestFile, tags: RequestFile): Promise<void> => {
      console.info(`New song to be published to \`current/${id}.<json/mp3/png>\` in GCP`);

      await Promise.all([
        bucket.file(`current/${id}.json`).save(tags.buffer).then(() => console.info('\t📄 Tags file published!')),
        bucket.file(`current/${id}.mp3`).save(audio.buffer).then(() => console.info('\t🔉 Audio file publihed!')),
        bucket.file(`current/${id}.png`).save(cover.buffer).then(() => console.info('\t🖼️ Cover file publihed!')),
      ]).then(() => console.info(`✅ Files for ${id} published into current directory.`));
    };

    /**
     * Takes the current song, makes it a tarball and puts it in GCS before deleting the other song from GCS.
     */
    const archivePast = async (): Promise<void> => {
      const [ currentFiles ] = await bucket.getFiles({ prefix: 'current' });

      if (currentFiles.length === 0) {
        console.warn('No files to archive. Skipping ⏭️');
        return;
      }

      const oldId = currentFiles[0]?.name.split('/')[1]?.split('.')[0]

      console.info(`Archiving files for ${oldId}:
${currentFiles.map(f => `- ${f.name}`).join('\n')}`)

      const archivePrep = `${os.tmpdir()}/archive_prep`
      if (!existsSync(archivePrep)) {
        mkdirSync(archivePrep);
      }

      const tmpArchiveDirectory = `${archivePrep}/${oldId}`;
      mkdirSync(tmpArchiveDirectory);

      console.info(`Saving old files to temp archive directory...`)
      for (const old of currentFiles) {
        const fileName = old.name;
        const splitName = fileName.split('.');
        const fileEnding = splitName[splitName.length - 1] ?? 'no ending';

        const getTarName = (ending: string): 'tags' | 'audio' | 'cover' => {
          switch (ending.toLowerCase()) {
            case 'json': return 'tags';
            case 'mp3': return 'audio';
            case 'png': return 'cover';
            default: {
              console.error(`File ending ${ending} not valid. Cannot archive.`);
              throw new Error(`File ending ${ending} not valid.`);
            };
          }
        };

        const dest = `${tmpArchiveDirectory}/${getTarName(fileEnding)}.${fileEnding}`;

        await bucket.file(fileName).download({ destination: dest }).then(() => console.info(`📥 ${fileName} downloaded to temp file at ${dest}.`));
      }

      console.info(`Creating tarball archive in temp directory...`);
      const tmpTarball = `${oldId}.tgz`
      await createTarball({
        gzip: true,
        file: tmpTarball,
        cwd: tmpArchiveDirectory
      }, [ '.' ]).then(() => console.info(`📦 Tarball created at ${tmpTarball}.`));

      // TODO extract the deletion process and put it in a different function
      console.info(`Publishing archive file and deleting previous current files...`)
      const archiveName = `archive/${oldId}.tgz`;
      await Promise.all([
        bucket.file(archiveName).save(readFileSync(tmpTarball)).then(() => console.info(`📤 Tarball saved in GCS as ${archiveName}.`)),
        ...currentFiles.map(async f => {
          const fileName = f.name;
          return bucket.file(fileName).delete().then(() => console.info(`🗑️ ${fileName} deleted from GCS.`));
        })
      ]).then(() => console.info(`✅ Archival process for ${oldId} complete!`));
    };

    const id = uuid();
    console.info(`New save:
  id: ${id}
  audio size: ${audio.size}
  cover size: ${cover.size}
  tags size: ${tagForm.size}`);
    
    try {
      // TODO make this whole thing asynchronous
      await archivePast()
      await saveToCurrent(id, audio, cover, tagForm)

      res.status(201).send(id)
    } catch(e: any) {
      console.error(e);
      res.status(500).send("Error with the promises. ID is " + id);
    }
  }
);
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
  console.info('Getting storage bucket...');
  bucket = storage.bucket('sample_bucket');
  console.info('Server ready to go! 👌');
})