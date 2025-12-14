import { GATEWAY_API_URL } from './utils';

export interface ApiKey {
  id: string;
  key: string;
  userId: string;
  userEmail?: string;
  active: boolean;
  limitPerMinute: number;
  limitPerDay: number;
  createdAt: string;
}

export interface UsageLog {
  id: string;
  apiKeyId: string;
  path: string;
  statusCode: number;
  latencyMs: number;
  timestamp: string;
}

export interface UsageStats {
  apiKeyId: string;
  statistics: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    todayRequests: number;
    averageLatencyMs: number;
  };
  recentLogs: UsageLog[];
}

export interface User {
  id: string;
  email: string;
  createdAt: string;
}

// API Key endpoints
export async function createApiKey(
  userId: string,
  limitPerMinute = 60,
  limitPerDay = 10000
): Promise<ApiKey> {
  const response = await fetch(`${GATEWAY_API_URL}/keys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, limitPerMinute, limitPerDay }),
  });

  if (!response.ok) {
    throw new Error('Failed to create API key');
  }

  return response.json();
}

export async function getApiKeys(userId?: string): Promise<ApiKey[]> {
  const url = userId
    ? `${GATEWAY_API_URL}/keys?userId=${userId}`
    : `${GATEWAY_API_URL}/keys`;
  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error('Failed to fetch API keys');
  }

  return response.json();
}

export async function getApiKey(id: string): Promise<ApiKey> {
  const response = await fetch(`${GATEWAY_API_URL}/keys/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch API key');
  }

  return response.json();
}

export async function updateApiKey(
  id: string,
  data: { active?: boolean; limitPerMinute?: number; limitPerDay?: number }
): Promise<ApiKey> {
  const response = await fetch(`${GATEWAY_API_URL}/keys/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update API key');
  }

  return response.json();
}

export async function deleteApiKey(id: string): Promise<void> {
  const response = await fetch(`${GATEWAY_API_URL}/keys/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete API key');
  }
}

// Usage endpoints
export async function getUsageStats(keyId: string): Promise<UsageStats> {
  const response = await fetch(`${GATEWAY_API_URL}/usage/${keyId}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch usage statistics');
  }

  return response.json();
}

