import path from 'node:path';
import fs from 'node:fs/promises';
import { glob } from 'glob';
import sharp from 'sharp';

const ROOT = process.cwd();
const IMAGES_DIR = path.join(ROOT, 'public', 'images');

const WIDTHS = [
  { suffix: 'md', width: 960 },
  { suffix: 'lg', width: 1600 },
];

const WEBP_QUALITY = 78;

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let i = 0;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i += 1;
  }
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

function shouldProcess(relPath) {
  const normalized = relPath.replaceAll('\\', '/');
  const ext = path.extname(relPath).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg') return true;
  // Skip logos and small PNGs; JPGs are the main perf problem here.
  if (ext === '.png') {
    if (normalized.includes('logo/')) return false;
    return true;
  }
  return false;
}

async function main() {
  const patterns = ['**/*.{jpg,jpeg,png,JPG,JPEG,PNG}'];
  const relFiles = await glob(patterns, { cwd: IMAGES_DIR, nodir: true });

  let inTotal = 0;
  let outTotal = 0;
  let generatedCount = 0;
  let skippedCount = 0;

  for (const rel of relFiles) {
    if (!shouldProcess(rel)) {
      skippedCount += 1;
      continue;
    }

    const inAbs = path.join(IMAGES_DIR, rel);
    const inStat = await fs.stat(inAbs);
    inTotal += inStat.size;

    const ext = path.extname(rel);
    const base = rel.slice(0, -ext.length);

    for (const { suffix, width } of WIDTHS) {
      const outRel = `${base}-${suffix}.webp`;
      const outAbs = path.join(IMAGES_DIR, outRel);

      // Skip if already exists and is newer than the source.
      if (await exists(outAbs)) {
        const outStat = await fs.stat(outAbs);
        outTotal += outStat.size;
        if (outStat.mtimeMs >= inStat.mtimeMs) {
          skippedCount += 1;
          continue;
        }
      }

      await fs.mkdir(path.dirname(outAbs), { recursive: true });

      const img = sharp(inAbs, { failOn: 'none' }).rotate();
      const resized = img.resize({
        width,
        withoutEnlargement: true,
      });

      await resized.webp({ quality: WEBP_QUALITY, effort: 5 }).toFile(outAbs);

      const outStat2 = await fs.stat(outAbs);
      outTotal += outStat2.size;
      generatedCount += 1;
    }
  }

  // Summary only; keep logs minimal to avoid noisy CI output.
  console.log(
    JSON.stringify(
      {
        imagesDir: path.relative(ROOT, IMAGES_DIR),
        generated: generatedCount,
        skipped: skippedCount,
        inputTotal: formatBytes(inTotal),
        outputTotal: formatBytes(outTotal),
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
