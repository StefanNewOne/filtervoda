// Ad-hoc load test for the live preview. Node 20+ (global fetch).
//   node scripts/loadtest.mjs [baseUrl] [concurrency] [durationSec]
const BASE = process.argv[2] ?? 'https://135.181.156.104.sslip.io';
const CONCURRENCY = Number(process.argv[3] ?? 200);
const DURATION = Number(process.argv[4] ?? 20) * 1000;

// Storefront pages (each triggers SSR → internal API fan-out) + a couple of API/static hits.
const PATHS = [
  '/', '/', '/proizvodi', '/proizvodi/spar-crystal-digital-600hf',
  '/za-biznis', '/soveti', '/kontakt', '/za-nas',
];

const codes = new Map();
const lat = [];
let done = 0, inflight = 0, started = false;
const t0 = Date.now();

function rec(status, ms) {
  codes.set(status, (codes.get(status) ?? 0) + 1);
  lat.push(ms);
  done++;
}

async function hit(path) {
  const s = Date.now();
  try {
    const res = await fetch(BASE + path, { redirect: 'manual', signal: AbortSignal.timeout(15000) });
    // drain body so the connection frees
    await res.arrayBuffer().catch(() => {});
    rec(res.status, Date.now() - s);
  } catch (e) {
    rec(e.name === 'TimeoutError' ? 'timeout' : 'error', Date.now() - s);
  }
}

async function worker(id) {
  let i = id;
  while (Date.now() - t0 < DURATION) {
    inflight++;
    await hit(PATHS[i % PATHS.length]);
    inflight--;
    i++;
  }
}

function pct(arr, p) {
  if (!arr.length) return 0;
  const a = [...arr].sort((x, y) => x - y);
  return a[Math.min(a.length - 1, Math.floor((p / 100) * a.length))];
}

console.log(`▶ load test ${BASE} · concurrency=${CONCURRENCY} · duration=${DURATION / 1000}s`);
const workers = Array.from({ length: CONCURRENCY }, (_, i) => worker(i));
await Promise.all(workers);

const secs = (Date.now() - t0) / 1000;
console.log(`\n=== RESULTS (${secs.toFixed(1)}s) ===`);
console.log(`total requests : ${done}`);
console.log(`throughput     : ${(done / secs).toFixed(1)} req/s`);
console.log(`status codes   :`);
for (const [c, n] of [...codes.entries()].sort()) {
  console.log(`   ${c}: ${n} (${((n / done) * 100).toFixed(1)}%)`);
}
const ok = (codes.get(200) ?? 0) + (codes.get(304) ?? 0);
console.log(`success (2xx)  : ${((ok / done) * 100).toFixed(1)}%`);
console.log(`latency ms     : p50=${pct(lat, 50)} p95=${pct(lat, 95)} p99=${pct(lat, 99)} max=${Math.max(...lat)}`);
