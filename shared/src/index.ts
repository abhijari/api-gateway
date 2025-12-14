// Shared types and utilities

export interface ApiKey {
  id: string;
  key: string;
  userId: string;
  active: boolean;
  limitPerMinute: number;
  limitPerDay: number;
  createdAt: Date;
}

export interface UsageLog {
  id: string;
  apiKeyId: string;
  path: string;
  statusCode: number;
  latencyMs: number;
  timestamp: Date;
}

