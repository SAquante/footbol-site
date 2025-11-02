export interface User {
  id: number;
  username: string;
  password_hash: string;
  role: 'superadmin' | 'admin' | 'PLAYER';
  is_banned: boolean;
  banned_reason?: string | null;
  banned_at?: Date | null;
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
  announcement: string | null;
  created_at: Date;
  updated_at: Date;
}

// Медиа для матчей
export interface MatchMedia {
  id: number;
  match_id: number;
  type: 'photo' | 'video';
  url: string;
  thumbnail_url?: string | null;
  caption?: string | null;
  uploaded_by: number;
  approved: boolean;
  created_at: Date;
}

// Комментарии к матчам
export interface MatchComment {
  id: number;
  match_id: number;
  user_id: number;
  username?: string;
  comment: string;
  created_at: Date;
}

// Реакции на матчи
export interface MatchReaction {
  id: number;
  match_id: number;
  user_id: number;
  username?: string;
  type: '🔥' | '⚽' | '👏' | '😢' | '😂' | '❤️';
  created_at: Date;
}

// Прогнозы
export interface Prediction {
  id: number;
  match_id: number;
  user_id: number;
  username?: string;
  predicted_score_real: number;
  predicted_score_barca: number;
  points_earned: number | null;
  created_at: Date;
}

// История изменений
export interface AuditLog {
  id: number;
  user_id: number;
  username?: string;
  action: 'create' | 'update' | 'delete' | 'ban' | 'unban' | 'approve' | 'reject';
  entity_type: 'match' | 'user' | 'media' | 'comment' | 'setting';
  entity_id: number;
  changes?: any;
  created_at: Date;
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
  announcement?: string | null;
}
