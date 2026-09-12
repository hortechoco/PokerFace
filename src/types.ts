export type Stage = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';

export interface PlayerView {
  seat: number;
  username: string | null;
  chips: number;
  folded: boolean;
  all_in: boolean;
}

export interface GameView {
  stage: Stage;
  pot: number;
  community_cards: string[];
  current_seat: number | null;
  current_bet: number;
  small_blind: number;
  big_blind: number;
}

export interface MeView {
  seat_number: number;
}

export interface HandView {
  card_1: string;
  card_2: string;
  round_contributed?: number;
}

export interface StateResponse {
  game: GameView;
  players: PlayerView[];
  me: MeView;
  hand: HandView | null;
  error?: string;
}

export type ActionKind = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all_in';

export interface ActionResponse {
  status?: string;
  error?: string;
  [key: string]: unknown;
}
