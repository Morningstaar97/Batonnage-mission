export type MissionType = 'GP' | 'CC' | 'SAD' | 'SAD auto' | 'GAG';

export interface Mission {
  id: string;
  sinistre: string;
  assure: string;
  type: MissionType;
  dateMission: string; // ISO String
  arEnvoye: boolean;
  kycOk: boolean;
  isAlert: boolean;
  reasonNonSad?: string;
  observations: string;
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
  createdBy: string;
}

export interface LocalUser {
  id: string;
  email: string;
  name?: string;
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
