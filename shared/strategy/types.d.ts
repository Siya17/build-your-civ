// Concrete contracts for the dependency-free JavaScript engine. No TypeScript
// transpilation is required. These are saved-state schemas, not a database schema.
export type Resource = 'food' | 'materials' | 'knowledge' | 'culture';
export type ResourceStock = Record<Resource, number>;
export type Cargo = Partial<ResourceStock>;
export type TileId = `${number},${number}`;
export type PlayerId = string;
export type Terrain = 'plains' | 'hills' | 'river' | 'forest' | 'wetland';
export type Structure = 'farm' | 'mine' | 'workshop' | 'archive' | 'shrine' | 'storehouse';
export type Infrastructure = 'road' | 'bridge' | 'canal';
export type Civilization = 'highland' | 'river' | 'woodland';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type AssemblyPolicy = 'conserve' | 'mobilize';

export interface Axial { q: number; r: number }
export interface Tile extends Axial {
  id: TileId;
  terrain: Terrain;
  owner: PlayerId | null;
  structure: Structure | 'settlement' | null;
  infrastructure: Infrastructure | null;
  cleared: boolean;
  exploredBy: PlayerId[];
  node: { kind: 'materials' | 'natural-wonder'; reward: Cargo; claimedBy: PlayerId | null } | null;
  disabledUntil: number;
}
export type Board = Record<TileId, Tile>;
export interface AdjacencyYield {
  yield: ResourceStock;
  multiplier: number;
  crossroads: TileId[];
  impact: number;
}
export interface SeasonClock { round: number; season: Season; step: number }
export interface PlayerState {
  id: PlayerId;
  civilization: Civilization;
  settlement: TileId;
  stock: ResourceStock;
  health: number;
  actionsLeft: number;
  ready: boolean;
}
export interface WorkMilestone {
  id: string;
  round: number;
  delivered: ResourceStock;
  contributors: Record<PlayerId, ResourceStock>;
}
export interface GreatWork {
  id: 'winter-sanctuary';
  site: TileId;
  stage: number;
  delivered: ResourceStock;
  contributors: Record<PlayerId, ResourceStock>;
  history: WorkMilestone[];
  complete: boolean;
}
export interface Delivery {
  from: PlayerId;
  to: PlayerId | 'winter-sanctuary';
  cargo: ResourceStock;
  path: TileId[];
}
export interface LogisticsPipe {
  edgeUsage: Record<string, number>; // Sorted undirected edge: "q,r|q,r"
  deliveries: Delivery[];          // Delivered during planning, retained until round reset
}
export interface GameOutcome {
  status: 'won' | 'lost';
  reason: string;
  round: number;
}
export type GameLogEntry = { round: number; type: 'action'; playerId: PlayerId; action: SessionAction['type'] }
  | { round: number; type: 'harvest'; playerId: PlayerId; yield: ResourceStock; upkeep: number; health: number }
  | { round: number; type: 'discovery'; playerId: PlayerId; tileId: TileId; kind: 'materials' | 'natural-wonder' }
  | { round: number; type: 'assembly'; policy: AssemblyPolicy }
  | { round: number; type: 'crisis'; kind: 'flood' | 'drought'; tiles?: TileId[]; warning: string }
  | ({ type: 'outcome' } & GameOutcome);
export interface SessionState {
  schemaVersion: 1;
  revision: number;
  era: 'age-of-rivers';
  phase: 'planning' | 'resolution' | 'assembly' | 'ended';
  clock: SeasonClock;
  players: Record<PlayerId, PlayerState>;
  board: Board;
  ecosystem: number;
  work: GreatWork;
  logistics: LogisticsPipe;
  assembly: { afterRound: number; votes: Record<PlayerId, AssemblyPolicy> } | null;
  outcome: GameOutcome | null;
  log: GameLogEntry[];
}
export type SessionAction = { actorId: PlayerId; expectedRevision: number } & (
  | { type: 'ready' }
  | { type: 'vote'; policy: AssemblyPolicy }
  | { type: 'scout' | 'clear'; tileId: TileId }
  | { type: 'build'; tileId: TileId; structure: Structure }
  | { type: 'infrastructure'; tileId: TileId; infrastructure: Infrastructure }
  | { type: 'ship'; toPlayerId: PlayerId; cargo: Cargo; path: TileId[] }
  | { type: 'contribute'; cargo: Cargo; path: TileId[] }
);
export type FoggedTile = Axial & { id: TileId; fogged: true };
export type SessionView = Omit<SessionState, 'board'> & { board: Record<TileId, Tile | FoggedTile> };
