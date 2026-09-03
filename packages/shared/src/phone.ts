/**
 * Macedonian phone normalization to E.164 (+389…). Hand-written per PRD §12.2
 * (no libphonenumber-js unless foreign numbers appear). Tested in __tests__/phone.test.ts.
 *
 * MK mobile: national 07X XXX XXX (9 digits, leading 0). Valid mobile prefixes after the 0:
 * 70,71,72,75,76,77,78. E.164 form: +3897XXXXXXXX (country code 389, drop the leading 0).
 */

const MK_CC = '389';
const MK_MOBILE_PREFIXES = ['70', '71', '72', '75', '76', '77', '78'];

/** Strip everything except digits and a single leading '+'. */
function clean(raw: string): string {
  const trimmed = raw.trim();
  const plus = trimmed.startsWith('+');
  const digits = trimmed.replace(/[^\d]/g, '');
  return plus ? `+${digits}` : digits;
}

/**
 * Normalize a Macedonian mobile number to E.164, or return null if it is not a valid MK mobile.
 * Accepts: 076676819, 076 676 819, 07/6676819, +38976676819, 0038976676819, 38976676819.
 */
export function normalizeMkPhone(raw: string): string | null {
  if (!raw) return null;
  let s = clean(raw);

  if (s.startsWith('+')) s = s.slice(1);
  if (s.startsWith('00')) s = s.slice(2);

  // National form 0XXXXXXXX → drop leading 0, prepend CC.
  if (s.startsWith('0')) {
    s = MK_CC + s.slice(1);
  } else if (!s.startsWith(MK_CC)) {
    // Bare subscriber number (e.g. 76676819) — assume MK.
    s = MK_CC + s;
  }

  // Now s must be: 389 + 8-digit subscriber (2-digit prefix + 6 digits).
  if (!s.startsWith(MK_CC)) return null;
  const subscriber = s.slice(MK_CC.length);
  if (subscriber.length !== 8) return null;

  const prefix = subscriber.slice(0, 2);
  if (!MK_MOBILE_PREFIXES.includes(prefix)) return null;

  return `+${s}`;
}

/** True if the input is a valid MK mobile number. */
export function isValidMkPhone(raw: string): boolean {
  return normalizeMkPhone(raw) !== null;
}

/** Pretty national display: +38976676819 → 076/676/819. */
export function formatMkPhoneDisplay(e164: string): string {
  const n = normalizeMkPhone(e164);
  if (!n) return e164;
  const sub = n.slice(1 + MK_CC.length); // 8 digits
  return `0${sub.slice(0, 2)}/${sub.slice(2, 5)}/${sub.slice(5)}`;
}

/** `tel:` href with a dialable E.164 number (in-app browsers won't dial `076/676/819`). */
export function telHref(raw: string): string {
  const n = normalizeMkPhone(raw);
  return `tel:${n ?? raw.replace(/[^\d+]/g, '')}`;
}

/** Viber deep link — requires bare international digits, no `+`/spaces/slashes. */
export function viberHref(raw: string): string {
  const n = normalizeMkPhone(raw) ?? raw;
  return `viber://chat?number=${n.replace(/[^\d]/g, '')}`;
}
