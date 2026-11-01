import fs from 'fs';
import path from 'path';
import {
  DEFAULT_BULLETIN,
  SituationalBulletinData,
  RegionSituation,
} from './bulletin-types';

export type { SituationalBulletinData, RegionSituation };
export { DEFAULT_BULLETIN };

// Preserve bulletin in globalThis across Next.js API routes & dev module reloads
const globalForBulletin = globalThis as unknown as {
  currentBulletin?: SituationalBulletinData;
};

const CACHE_FILE = path.join(process.cwd(), '.bulletin-cache.json');

export function getCurrentBulletin(): SituationalBulletinData {
  if (globalForBulletin.currentBulletin) {
    return globalForBulletin.currentBulletin;
  }

  // Try reading from persisted cache file on disk
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const fileContent = fs.readFileSync(CACHE_FILE, 'utf-8');
      const parsed = JSON.parse(fileContent);
      if (parsed && parsed.title && Array.isArray(parsed.regions)) {
        globalForBulletin.currentBulletin = parsed;
        return parsed;
      }
    }
  } catch {
    // Fallback to default
  }

  globalForBulletin.currentBulletin = { ...DEFAULT_BULLETIN };
  return globalForBulletin.currentBulletin;
}

export function updateCurrentBulletin(newBulletin: SituationalBulletinData): void {
  globalForBulletin.currentBulletin = newBulletin;

  // Persist to disk cache
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(newBulletin, null, 2), 'utf-8');
  } catch {
    // Ignore write errors in read-only environments
  }
}
