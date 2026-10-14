// Pixel diff of two screenshot folders produced by visual-snapshots.mjs.
import fs from 'fs'; import { PNG } from 'pngjs'; import pixelmatch from 'pixelmatch';
const [a, b, out] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
for (const f of fs.readdirSync(a).filter(f => f.endsWith('.png')).sort()) {
  const A = PNG.sync.read(fs.readFileSync(`${a}/${f}`));
  if (!fs.existsSync(`${b}/${f}`)) { console.log(f.padEnd(36), 'MISSING in after'); continue; }
  const B = PNG.sync.read(fs.readFileSync(`${b}/${f}`));
  const w = Math.max(A.width, B.width), h = Math.max(A.height, B.height);
  const pad = (img) => { const p = new PNG({ width: w, height: h }); PNG.bitblt(img, p, 0, 0, img.width, img.height, 0, 0); return p; };
  const pa = pad(A), pb = pad(B), d = new PNG({ width: w, height: h });
  const n = pixelmatch(pa.data, pb.data, d.data, w, h, { threshold: 0.1 });
  fs.writeFileSync(`${out}/${f}`, PNG.sync.write(d));
  console.log(f.padEnd(36), `${(100 * n / (w * h)).toFixed(2)}% pixels differ`, A.height !== B.height ? `(height ${A.height} -> ${B.height})` : '');
}
