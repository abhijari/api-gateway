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

// Fetch runtime gateway URL once and cache it in-memory on the client.
// The runtime URL is returned by the server route `/api/runtime-config` which
// reads `process.env.GATEWAY_API_URL` at runtime (no NEXT_PUBLIC_* usage).
let cachedGatewayUrl: string | null = null;
let fetchingGatewayUrl: Promise<string> | null = null;

async function getGatewayUrl(): Promise<string> {
  if (cachedGatewayUrl) return cachedGatewayUrl;
  if (fetchingGatewayUrl) return fetchingGatewayUrl;

  fetchingGatewayUrl = (async () => {
    const res = await fetch('/api/runtime-config', { cache: 'no-store' });
    if (!res.ok) {
      fetchingGatewayUrl = null;
      throw new Error('Failed to fetch runtime config');
    }
    const data = await res.json();
    if (!data.gatewayApiUrl) {
      throw new Error('GATEWAY_API_URL missing from runtime config');
    }
    const url = data.gatewayApiUrl;
    if (!url) {
      fetchingGatewayUrl = null;
      throw new Error('GATEWAY_API_URL is not configured on the server');
    }
    cachedGatewayUrl = url;
    fetchingGatewayUrl = null;
    return url;
  })();

  return fetchingGatewayUrl;
}

// API Key endpoints
export async function createApiKey(
  userId: string,
  limitPerMinute = 60,
  limitPerDay = 10000
): Promise<ApiKey> {
  const gatewayUrl = await getGatewayUrl();
  const response = await fetch(`${gatewayUrl}/keys`, {
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
  const gatewayUrl = await getGatewayUrl();
  const url = userId ? `${gatewayUrl}/keys?userId=${userId}` : `${gatewayUrl}/keys`;
  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error('Failed to fetch API keys');
  }

  return response.json();
}

export async function getApiKey(id: string): Promise<ApiKey> {
  const gatewayUrl = await getGatewayUrl();
  const response = await fetch(`${gatewayUrl}/keys/${id}`, {
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
  const gatewayUrl = await getGatewayUrl();
  const response = await fetch(`${gatewayUrl}/keys/${id}`, {
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
  const gatewayUrl = await getGatewayUrl();
  const response = await fetch(`${gatewayUrl}/keys/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete API key');
  }
}

// Usage endpoints
export async function getUsageStats(keyId: string): Promise<UsageStats> {
  const gatewayUrl = await getGatewayUrl();
  const response = await fetch(`${gatewayUrl}/usage/${keyId}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch usage statistics');
  }

  return response.json();
}

