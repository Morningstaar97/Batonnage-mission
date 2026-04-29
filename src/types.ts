export type MissionType = 'GP' | 'CC' | 'SAD' | 'SAD auto' | 'GAG';

export interface Mission {
  id: string;
  sinistre: string;
  assure: string;
  type: MissionType;
  dateMission: any; // Firestore Timestamp
  arEnvoye: boolean;
  kycOk: boolean;
  isAlert: boolean;
  reasonNonSad?: string;
  observations: string;
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
  createdBy: string;
}

export interface MissionStats {
  gp: number;
  cc: number;
  sad: number;
  sadAuto: number;
  gag: number;
  totalGP: number; // GP + SAD
  total: number;
  taux: number; // calculated on GP, SAD, CC only
}
