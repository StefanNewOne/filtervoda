/**
 * Defense-in-depth HTML sanitizer for admin-authored TipTap content: strips scripts, embedded
 * objects, inline event handlers and javascript: URLs before content is stored/rendered.
 * Not a full HTML parser — a conservative allow-through-strip for trusted-but-guarded input.
 */
export function sanitizeHtml(html: string): string {
  return html
    .replace(/<\s*(script|iframe|object|embed|style|link|meta)[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<\s*(script|iframe|object|embed|style|link|meta)\b[^>]*>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src)\s*=\s*(["']?)\s*javascript:[^"'>\s]*\2/gi, '$1=$2#$2');
}
