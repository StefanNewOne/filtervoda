import { describe, expect, it } from 'vitest';
import { capiHash, capiHashPhone, ipHash, sha256Hex } from '../hash.js';

describe('ipHash', () => {
  it('is deterministic and hides the raw IP', () => {
    const h = ipHash('1.2.3.4');
    expect(h).toBe(ipHash('1.2.3.4'));
    expect(h).not.toContain('1.2.3.4');
    expect(h).toHaveLength(64); // sha256 hex
  });
  it('differs per IP', () => {
    expect(ipHash('1.2.3.4')).not.toBe(ipHash('1.2.3.5'));
  });
});

describe('capiHash', () => {
  it('normalizes to lowercase + trim before hashing', () => {
    expect(capiHash('  Test@Example.COM ')).toBe(capiHash('test@example.com'));
    expect(capiHash('test@example.com')).toHaveLength(64);
  });
  it('returns undefined for empty input', () => {
    expect(capiHash('')).toBeUndefined();
    expect(capiHash(null)).toBeUndefined();
    expect(capiHash('   ')).toBeUndefined();
  });
});

describe('capiHashPhone', () => {
  it('hashes digits only', () => {
    expect(capiHashPhone('+389 76 676 819')).toBe(capiHash('38976676819'));
  });
  it('returns undefined for empty', () => {
    expect(capiHashPhone(null)).toBeUndefined();
  });
});

describe('sha256Hex', () => {
  it('produces a stable 64-char hex digest', () => {
    expect(sha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });
});
