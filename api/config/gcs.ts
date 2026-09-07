import { Bucket, Storage, StorageOptions } from '@google-cloud/storage';
import os from 'node:os';

// GCS Config
const gcs_api = 'http://host.docker.internal:4443'
const gcs_connection_options: StorageOptions = {
  apiEndpoint: gcs_api,
  projectId: 'test'
}

export const storage = new Storage(gcs_connection_options);
export let bucket: Bucket;

export const initBucket = () => {
    bucket = storage.bucket('sample_bucket')
};

export const downloadsFolder = `${os.tmpdir()}/downloads`;
export const archivePrepFolder = `${os.tmpdir()}/archive_prep`;