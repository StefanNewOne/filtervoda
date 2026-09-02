# ADR-003 — Media storage: StorageService abstraction (MinIO local / Cloudinary prod)

- **Status:** Accepted (prod driver pending `[D-6]` client sign-off)
- **Date:** 2026-09-01
- **Refs:** PRD §12.2, §9.2

## Context

Media needs responsive AVIF/WebP variants, alt text, and image replacement without changing the
URL. We want one code path regardless of where bytes live.

## Decision

A `StorageService` interface with two drivers, selected by `STORAGE_DRIVER`:

- **Local / self-hosted:** `s3` driver → MinIO (S3 API) + `sharp` for variant generation.
- **Production (recommended):** `cloudinary` driver → upload + on-the-fly transformations,
  already used elsewhere in the ecosystem, no self-hosted image pipeline.

The image component receives a `variants` object (widths + formats) independent of the driver.
Uploads are re-encoded server-side (no user SVG). `Media` row stores `driver, key, url,
variants (JSON), width, height, alt, size, mime`.

## Consequences

Switching drivers is a config + env change, not a code rewrite. Final prod driver is confirmed
with the client (`[D-6]`); until then local uses MinIO.
