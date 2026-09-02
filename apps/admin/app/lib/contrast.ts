/** WCAG relative-luminance contrast ratio between two hex colours (for the AA token check). */
export function contrastRatio(hex1: string, hex2: string): number | null {
  const lum = (hex: string): number | null => {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
    if (!m) return null;
    const ch = [m[1], m[2], m[3]].map((h) => {
      const v = parseInt(h ?? '0', 16) / 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * (ch[0] ?? 0) + 0.7152 * (ch[1] ?? 0) + 0.0722 * (ch[2] ?? 0);
  };
  const l1 = lum(hex1);
  const l2 = lum(hex2);
  if (l1 == null || l2 == null) return null;
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}
