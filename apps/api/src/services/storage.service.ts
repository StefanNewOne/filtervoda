/**
 * StorageService abstraction (ADR-003). Drivers: `local` (filesystem, served by the API at
 * /api/v1/uploads — dev) and `s3` (MinIO/S3-compatible — prod-like). Cloudinary can be added
 * as a third driver. Generates responsive AVIF/WebP variants with sharp; images are re-encoded
 * on upload (no user SVG). The Media record is driver-agnostic (stores url + variants).
 */
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { env } from '../config/env.js';
import type { ImageVariant } from '@filtervoda/shared';

const VARIANT_WIDTHS = [400, 800, 1200];
const UPLOAD_DIR = join(process.cwd(), 'apps/api/uploads');

export interface StoredMedia {
  driver: string;
  key: string;
  url: string;
  variants: ImageVariant[];
  width: number;
  height: number;
  size: number;
  mime: string;
}

interface Driver {
  put(key: string, body: Buffer, mime: string): Promise<string>; // returns public url
}

const localDriver: Driver = {
  async put(key, body) {
    const full = join(UPLOAD_DIR, key);
    await mkdir(join(full, '..'), { recursive: true });
    await writeFile(full, body);
    return `/api/v1/uploads/${key}`;
  },
};

function s3Driver(): Driver {
  const client = new S3Client({
    endpoint: env.S3_ENDPOINT,
    region: 'us-east-1',
    forcePathStyle: true,
    credentials: { accessKeyId: env.S3_ACCESS_KEY ?? '', secretAccessKey: env.S3_SECRET_KEY ?? '' },
  });
  return {
    async put(key, body, mime) {
      await client.send(
        new PutObjectCommand({ Bucket: env.S3_BUCKET, Key: key, Body: body, ContentType: mime, ACL: 'public-read' }),
      );
      const base = env.CDN_BASE_URL || `${env.S3_ENDPOINT}/${env.S3_BUCKET}`;
      return `${base}/${key}`;
    },
  };
}

function driver(): Driver {
  return env.STORAGE_DRIVER === 's3' ? s3Driver() : localDriver;
}

/** Process an uploaded image: re-encode original + generate AVIF/WebP variants; store all. */
export async function storeImage(buffer: Buffer, originalName: string): Promise<StoredMedia> {
  const image = sharp(buffer, { failOn: 'error' });
  const meta = await image.metadata();
  const id = randomUUID();
  const base = originalName.replace(/\.[^.]+$/, '').replace(/[^a-z0-9-]/gi, '-').toLowerCase().slice(0, 40);
  const drv = driver();

  // Original re-encoded as high-quality webp (strips metadata, prevents polyglot files).
  const originalWebp = await image.clone().webp({ quality: 90 }).toBuffer();
  const originalKey = `${id}/${base}.webp`;
  const url = await drv.put(originalKey, originalWebp, 'image/webp');

  const variants: ImageVariant[] = [];
  for (const width of VARIANT_WIDTHS) {
    if (meta.width && width > meta.width) continue; // don't upscale
    for (const format of ['avif', 'webp'] as const) {
      const buf = await image.clone().resize(width).toFormat(format, { quality: 72 }).toBuffer();
      const key = `${id}/${base}-${width}.${format}`;
      const vUrl = await drv.put(key, buf, `image/${format}`);
      variants.push({ width, format, url: vUrl });
    }
  }

  return {
    driver: env.STORAGE_DRIVER,
    key: originalKey,
    url,
    variants,
    width: meta.width ?? 0,
    height: meta.height ?? 0,
    size: originalWebp.length,
    mime: 'image/webp',
  };
}
