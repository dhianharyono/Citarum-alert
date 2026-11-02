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

export function getCurrentBulletin(): SituationalBulletinData {
  if (globalForBulletin.currentBulletin) {
    return globalForBulletin.currentBulletin;
  }

  globalForBulletin.currentBulletin = { ...DEFAULT_BULLETIN };
  return globalForBulletin.currentBulletin;
}

export function updateCurrentBulletin(newBulletin: SituationalBulletinData): void {
  globalForBulletin.currentBulletin = newBulletin;
}
