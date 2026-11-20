import { getCurrentFiles } from "../endpoints/audio";

export let current_id: string | null = null;

export const getCurrentId = async () => {
  console.info('Retrieving current song id...');

  const currentFiles = await (await getCurrentFiles())[0];

  if (currentFiles.length === 0) {
    console.warn('❌ No current files found. Upload to set a current file.');
  } else {
    current_id = currentFiles[0]?.name.match(/^[^.]+/)![0].split('/')[1] ?? null;
  }

  console.log(`✔ Current Song ID: ${current_id}`);
};

export const setCurrentId = (new_id: string) => current_id = new_id;