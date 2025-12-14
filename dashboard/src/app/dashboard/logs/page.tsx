'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getApiKeys, getUsageStats, type ApiKey, type UsageLog } from '@/lib/api';

export default function LogsPage() {
  const router = useRouter();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      router.push('/login');
      return;
    }

    loadApiKeys();
  }, [router]);

  const loadApiKeys = async () => {
    try {
      const keys = await getApiKeys();
      setApiKeys(keys);
      if (keys.length > 0 && !selectedKeyId) {
        setSelectedKeyId(keys[0].id);
        loadLogs(keys[0].id);
      }
    } catch (error) {
      console.error('Failed to load API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async (keyId: string) => {
    try {
      const stats = await getUsageStats(keyId);
      setLogs(stats.recentLogs);
    } catch (error) {
      console.error('Failed to load logs:', error);
    }
  };

  useEffect(() => {
    if (selectedKeyId) {
      loadLogs(selectedKeyId);
    }
  }, [selectedKeyId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard">
            <Button variant="outline">← Back to Dashboard</Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Request Logs</CardTitle>
            <CardDescription>View request logs for your API keys</CardDescription>
          </CardHeader>
          <CardContent>
            {apiKeys.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No API keys found</p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="text-sm font-medium mb-2 block">Select API Key</label>
                  <select
                    value={selectedKeyId || ''}
                    onChange={(e) => setSelectedKeyId(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    {apiKeys.map((key) => (
                      <option key={key.id} value={key.id}>
                        {key.key.substring(0, 30)}... ({key.userEmail || 'N/A'})
                      </option>
                    ))}
                  </select>
                </div>

                {logs.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No logs found for this API key</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Path</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Latency</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                          <TableCell>
                            <code className="text-xs">{log.path}</code>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                log.statusCode >= 200 && log.statusCode < 300
                                  ? 'success'
                                  : log.statusCode >= 400
                                  ? 'destructive'
                                  : 'default'
                              }
                            >
                              {log.statusCode}
                            </Badge>
                          </TableCell>
                          <TableCell>{log.latencyMs}ms</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

