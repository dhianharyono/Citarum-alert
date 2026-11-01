export type StationStatus = 'NORMAL' | 'WASPADA' | 'SIAGA' | 'AWAS';

export interface AWLRStation {
  id: string;
  name: string;
  river: string;
  levelCm: number;
  alertThresholdCm: number;
  status: StationStatus;
  lat: number;
  lng: number;
  updatedAt: string;
  normalThresholdCm?: number;
  warningThresholdCm?: number;
  dangerThresholdCm?: number;
}

export type WaterDepthCategory =
  | 'Mata Kaki (<20cm)'
  | 'Selutut (20-50cm)'
  | 'Sepaha (50-80cm)'
  | 'Diatas 1 Meter';

export type RoadPassabilityStatus = 'Bisa Dilewati' | 'Roda 2 Mogok' | 'Lumpuh Total';

export interface RoadCorridor {
  id: string;
  name: string;
  corridor: string;
  status: RoadPassabilityStatus;
  depthCategory: WaterDepthCategory;
  alternativeRoute?: string;
  lastUpdated: string;
}

export interface FloodReport {
  id: string;
  author: string;
  district: string;
  caption: string;
  depthCategory: WaterDepthCategory;
  depthCmEstimate?: number;
  lat: number;
  lng: number;
  imageUrl?: string;
  tiktokLiveUrl?: string | null;
  upvotes: number;
  downvotes?: number;
  isAiVerified?: boolean;
  aiConfidence?: number;
  aiVerdict?: string;
  createdAt: string;
  createdAtIso?: string;
}

export interface CreateReportInput {
  author?: string;
  caption: string;
  depthCategory: WaterDepthCategory;
  depthCmEstimate?: number;
  lat: number;
  lng: number;
  district: string;
  imageUrl?: string;
  imageBase64?: string;
  tiktokLiveUrl?: string;
}

export interface VerificationResult {
  isFlood: boolean;
  confidence: number;
  estimatedDepthCategory?: WaterDepthCategory;
  explanation: string;
  waterVisible: boolean;
  debrisOrVehiclesAffected: boolean;
}

