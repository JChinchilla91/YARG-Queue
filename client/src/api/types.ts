export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  queued?: boolean;
}

export interface QueueEntry {
  id: number;
  songId: string;
  requestedBy: string;
  status: string;
  createdAt: number;
  title: string;
  artist: string;
  album: string;
}

export interface QueueState {
  nowPlaying: QueueEntry | null;
  queue: QueueEntry[];
}

export interface JoinUrl {
  url: string;
  ip: string;
  port: number;
  mode: string;
  interface: string;
  preferred: boolean;
  hint?: string;
}

export interface HealthInfo {
  ok: boolean;
  songCount: number;
  lanAddresses: string[];
  joinUrls?: JoinUrl[];
  hostPinRequired: boolean;
  mode?: string;
}
