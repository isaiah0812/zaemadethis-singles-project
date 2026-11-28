import express, { Request, Response } from 'express';
import path from 'node:path';
import { bucket, downloadsFolder, archivePrepFolder } from '../config/gcs';
import { createReadStream, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { v4 as uuid } from 'uuid';
import id3 from 'node-id3';
import { upload, RequestFile } from '../config/multer';
import { create as createTarball } from 'tar';
import os from 'node:os';
import { setCurrentId } from '../tools/utils';
import { verifyJwt } from '../tools/middleware';
import decode from '@audio/decode-wav';
import mp3, { StreamEncoder } from '@audio/encode-mp3';
import alac from '@audio/encode-alac';
import flac from '@audio/encode-flac';

const { writeMeta: writeMp3Meta } = require('@audio/encode-mp3/meta');
const { writeMeta: writeFlacMeta } = require('@audio/encode-flac/meta');
const { writeMeta: writeM4aMeta } = require('@audio/encode-mp4/meta');

const audio = express();

export const getCurrentFiles = () => bucket.getFiles({ prefix: 'current' })

audio.get('/stream', async (req: Request, res: Response) => {
  res.contentType('audio/mpeg');
  const dest = path.resolve(`${os.tmpdir()}/current.mp3`);
  await (await getCurrentFiles())[0]
    .find(f => f.name.endsWith('.mp3'))
    ?.download({ destination: dest }).then(() => createReadStream(dest).pipe(res));
});

enum AudioFormats {
  MP3 = 'mp3',
  FLAC = 'flac',
  ALAC = 'alac'
}

enum BitRates {
  LOW = 160,
  NORMAL = 192,
  GOOD = 256,
  GREAT = 320
}

/* TODO: Implement the @audio/encode family to programatically download files of particular format (will take longer, that's fine).
 * This will require a query parameter. Valid formats should be 160-256kbps mp3, 320kbps mp3, FLAC, and ALAC.
 */
// TODO: download from archive if necessary
audio.get('/:songId/download', verifyJwt, async (req: Request<{ songId: string }>, res: Response) => {
  const ERROR_ON_THE_DOWNLOAD_MESSAGE = 'Error on the download. Please contact the system administrator.';

  // Validation
  const { songId } = req.params;
  if (res.locals.auth_info.song_id !== songId) {
    res.status(403).send('Song cannot be downloaded with given credentials.');
    return;
  }

  const { format, bitRate } = req.query;

  if (!format) {
    res.status(400).send('format required');
    return;
  }

  if (!Object.values(AudioFormats).includes(format.toString().toLowerCase() as AudioFormats)) {
    res.status(400).send('invalid format');
    return;
  }

  if (format === AudioFormats.MP3) {
    if (!bitRate) {
      res.status(400).send('bitRate required when format is mp3');
      return;
    }
  
    if (!Object.values(BitRates).includes(parseFloat(bitRate!.toString()))) {
      res.status(400).send('invalid bitRate');
      return;
    }
  }


  const downloadId = uuid();
  console.info(`Download initialized by ${req.ip}! (Download ID: ${downloadId})`);
  const currentDownloadFolder = `${downloadsFolder}/${downloadId}`;

  if (!existsSync(downloadsFolder)) {
    mkdirSync(downloadsFolder);
    console.warn(`⚠️ Downloads folder was deleted. It has been re-created...`);
  }

  mkdirSync(currentDownloadFolder);
  
  const [ current ] = await getCurrentFiles();
  const id = current[0]?.name.split('.')[0];
  console.info(`📥 Song ${id} downloaded for download id ${downloadId}`)

  const rawAudioCloudFile = current.find(f => f.name.endsWith('wav'));
  const tagsFile = current.find(f => f.name.endsWith('json'));

  const rawAudioDest = path.resolve(`${downloadsFolder}/${downloadId}/raw.wav`);
  const tagsDest = path.resolve(`${downloadsFolder}/${downloadId}/tags.json`);

  await Promise.all([
    rawAudioCloudFile?.download({ destination: rawAudioDest }),
    tagsFile?.download({ destination: tagsDest })
  ]).then(() => console.info(`🤝 Song and tags saved to ${rawAudioDest} and ${tagsDest}, respectively for download ${downloadId}.`));

  const rawAudioLocalFile = readFileSync(rawAudioDest);
  const { channelData, sampleRate } = decode(rawAudioLocalFile.buffer);

  if (channelData.length !== 2) {
    console.error('Error decoding the wav file: one of the stereo channels is missing.')
    res.status(500).send(ERROR_ON_THE_DOWNLOAD_MESSAGE);
    return;
  }

  const tagsObject = JSON.parse(readFileSync(tagsDest).toString());
  const metaInput = {
    meta: tagsObject
  }

  let encoder;
  let fileEnd: 'mp3' | 'flac' | 'm4a';
  const channels = 2;

  switch (format) {
    case AudioFormats.MP3:
      encoder = await mp3({ sampleRate, channels, bitrate: parseFloat(bitRate!.toString()) });
      fileEnd = 'mp3';
      break;
    case AudioFormats.ALAC:
      encoder = await alac({ sampleRate, channels, bitDepth: 24, meta: tagsObject });
      fileEnd = 'm4a';
      break;
    case AudioFormats.FLAC:
      encoder = await flac({ sampleRate, channels, bitDepth: 24, compression: 3 });
      fileEnd = 'flac';
      break;
    default: 
      console.error(`No process for the format '${format}'`);
      res.status(500).send(ERROR_ON_THE_DOWNLOAD_MESSAGE);
      return;
  }

  const downloadAudioDest = path.resolve(`${downloadsFolder}/${downloadId}/download.${fileEnd}`);
  const song = encoder.encode(channelData);
  const tail = await encoder.flush();
  let head = null;
  
  if (format !== AudioFormats.ALAC) {
    if (!(encoder as StreamEncoder).head) {
      encoder.free();
      console.error('Error decoding the wav file: for some reason the head function is missing from the encoder.');

    }

    head = (encoder as StreamEncoder).head!() ?? new Uint8Array(0);
  }

  let fullSong = new Uint8Array((head ? head.length : 0) + song.length + tail.length);
  if (head) {
    fullSong.set(head);
  }
  fullSong.set(song);
  fullSong.set(tail);

  switch (format) {
    case AudioFormats.MP3:
      fullSong = writeMp3Meta(fullSong, metaInput);
      res.contentType('audio/mpeg');
      break;
    case AudioFormats.FLAC:
      fullSong = writeFlacMeta(fullSong, metaInput);
      res.contentType('audio/flac');
      break;
    case AudioFormats.ALAC:
      res.contentType('audio/mp4');
      break;
    default:
      console.error('Error encoding the tags: how did it make it this far?');
      res.status(500).send(ERROR_ON_THE_DOWNLOAD_MESSAGE);
      return;
  }

  writeFileSync(downloadAudioDest, Buffer.from(fullSong.buffer));
  console.info(`✅ Tags for ${downloadId} saved to audio file. Sending to ${req.ip}!`);
  res.download(downloadAudioDest);

  // const id3UpdateResult = id3.update(JSON.parse(readFileSync(tagsDest).toString()), rawAudioDest)

  // if (id3UpdateResult === true) {
  // } else {
  //   console.error(`Error adding tags to file (Download ID: ${downloadId}): ${id3UpdateResult.message}`)
  //   res.status(500).send(ERROR_ON_THE_DOWNLOAD_MESSAGE);
  // }
});

/**
 * Saves files to GCS. Run it last.
 * 
 * @param id The ID of the song
 * @param audio the song's audio file
 * @param cover the cover art file
 * @param tags the mp3 metadata
 */
const saveToCurrent = async (id: string, audio: RequestFile, cover: RequestFile, tags: RequestFile): Promise<void> => {
  // Convert wav to streaming mp3
  console.info('Converting wav file to an mp3 for streaming...')
  const { channelData, sampleRate } = decode(audio.buffer)

  if (channelData.length !== 2) {
    throw new Error('Error decoding the wav file: one of the stereo channels is missing.');
  }

  const encoder = await mp3({ sampleRate, channels: 2, bitrate: 256 });
  const song = encoder.encode(channelData);
  const tail = encoder.flush();
  
  if (!encoder.head) {
    encoder.free();
    throw new Error('Error decoding the wav file: for some reason the head function is missing from the encoder.');
  }
  
  const head = encoder.head() ?? new Uint8Array(0);

  if (head.length === 0) {
    console.warn('Head of file empty. Continuing...');
  }

  const fullSong = new Uint8Array(head.length + song.length + tail.length);
  fullSong.set(head);
  fullSong.set(song);
  fullSong.set(tail);
  console.info('🔀 Audio file converted to mp3 for streaming!');
  
  console.info(`New song to be published to \`current/${id}.<json/mp3/wav/png>\` in GCP`);

  await Promise.all([
    bucket.file(`current/${id}.json`).save(tags.buffer).then(() => console.info('\t📄 Tags file published!')),
    bucket.file(`current/${id}.mp3`).save(fullSong).then(() => console.info('\t🔉 Streaming audio file (mp3, 256kbps) publihed!')),
    bucket.file(`current/${id}.wav`).save(audio.buffer).then(() => console.info('`\t🌊 Raw audio file (wav) published!')),
    bucket.file(`current/${id}.png`).save(cover.buffer).then(() => console.info('\t🖼️ Cover file publihed!')),
  ]).then(() => {
    setCurrentId(id);
    console.info(`✅ Files for ${id} published into current directory.`);
    encoder.free();
  });
};

/**
 * Takes the current song, makes it a tarball and puts it in GCS before deleting the other song from GCS.
 */
const archivePast = async (): Promise<void> => {
  const [ currentFiles ] = await getCurrentFiles();

  if (currentFiles.length === 0) {
    console.warn('No files to archive. Skipping ⏭️');
    return;
  }

  const oldId = currentFiles[0]?.name.split('/')[1]?.split('.')[0]

  console.info(`Archiving files for ${oldId}:
${currentFiles.map(f => `- ${f.name}`).join('\n')}`)

  // const archivePrep = `${os.tmpdir()}/archive_prep`
  if (!existsSync(archivePrepFolder)) {
    mkdirSync(archivePrepFolder);
    console.warn(`⚠️ Archive prep folder was deleted. It has been re-created...`);
  }

  const tmpArchiveDirectory = `${archivePrepFolder}/${oldId}`;
  mkdirSync(tmpArchiveDirectory);

  console.info(`Saving old files to temp archive directory...`)
  for (const old of currentFiles) {
    const fileName = old.name;
    const splitName = fileName.split('.');
    const fileEnding = splitName[splitName.length - 1] ?? 'no ending';

    const getTarName = (ending: string): 'tags' | 'stream' | 'cover' | 'raw' => {
      switch (ending.toLowerCase()) {
        case 'json': return 'tags';
        case 'mp3': return 'stream';
        case 'png': return 'cover';
        case 'wav': return 'raw';
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

  // TODO: extract the deletion process and put it in a different function
  console.info(`Publishing archive file and deleting previous current files...`)
  const archiveName = `archive/${oldId}.tgz`;
  await Promise.all([
    bucket.file(archiveName).save(readFileSync(tmpTarball)).then(() => console.info(`📤 Tarball saved in GCS as ${archiveName}.`)),
    ...currentFiles.map(async f => {
      const fileName = f.name;
      return bucket.file(fileName).delete().then(() => console.info(`🗑️ ${fileName} deleted from current folder.`));
    })
  ]).then(() => console.info(`✅ Archival process for ${oldId} complete!`));
};

audio.post(
  '/save',
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

    if (audio.mimetype.toLowerCase() !== 'audio/wav') {
      res.status(400).send('audio file must be wav file');
      return;
    }

    const id = uuid();
    console.info(`New save:
  id: ${id}
  audio size: ${audio.size}
  cover size: ${cover.size}
  tags size: ${tagForm.size}`);
    
    try {
      // TODO: make this whole thing asynchronous
      await archivePast()
      await saveToCurrent(id, audio, cover, tagForm)

      res.status(201).send(id)
    } catch(e: any) {
      console.error(e);
      res.status(500).send("Error with the promises. ID is " + id);
    }
  }
);
audio.get('/list', (req: Request, res: Response) => res.send('List all the audio!'));
audio.patch('/:id/publish', (req: Request, res: Response) => res.send('Publish this Audio!'));
audio.patch('/:id/archive', (req: Request, res: Response) => res.send('Archive this audio!'));
audio.get('/:id/file', (req: Request, res: Response) => res.send('Get this audio file!'));

export default audio;
