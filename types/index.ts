export interface User {
  id: number;
  username: string;
  password_hash: string;
  role: 'superadmin' | 'admin' | 'PLAYER';
  created_at: Date;
}

export interface Match {
  id: number;
  match_datetime: Date;
  location: string;
  status: 'scheduled' | 'completed';
  score_real: number | null;
  score_barca: number | null;
  lineup_real: string | null;
  lineup_barca: string | null;
  coach_real: string | null;
  coach_barca: string | null;
  goals_real: number | null;
  goals_barca: number | null;
  conceded_real: number | null;
  conceded_barca: number | null;
  points_real: number | null;
  points_barca: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface AuthUser {
  id: number;
  username: string;
  role: 'superadmin' | 'admin' | 'PLAYER';
}

export interface CreateMatchData {
  match_datetime: Date;
  location: string;
}

export interface UpdateMatchData {
  match_datetime?: Date;
  location?: string;
  status?: 'scheduled' | 'completed';
  score_real?: number | null;
  score_barca?: number | null;
  lineup_real?: string | null;
  lineup_barca?: string | null;
  coach_real?: string | null;
  coach_barca?: string | null;
  goals_real?: number | null;
  goals_barca?: number | null;
  conceded_real?: number | null;
  conceded_barca?: number | null;
  points_real?: number | null;
  points_barca?: number | null;
}
