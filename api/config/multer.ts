import multer from 'multer';
import { Express } from 'express';

// Multer config
export const upload = multer({
  storage: multer.memoryStorage()
});

export type RequestFile = Express.Multer.File;