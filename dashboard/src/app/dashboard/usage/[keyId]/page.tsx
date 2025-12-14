'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getUsageStats, type UsageStats } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function UsagePage() {
  const router = useRouter();
  const params = useParams();
  const keyId = params.keyId as string;
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      router.push('/login');
      return;
    }

    loadStats();
  }, [keyId, router]);

  const loadStats = async () => {
    try {
      const data = await getUsageStats(keyId);
      setStats(data);
    } catch (error) {
      console.error('Failed to load usage stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Failed to load usage statistics</div>
      </div>
    );
  }

  // Prepare chart data (last 24 hours grouped by hour)
  const chartData = stats.recentLogs
    .slice(0, 24)
    .reverse()
    .map((log) => ({
      time: new Date(log.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      requests: 1,
      latency: log.latencyMs,
    }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard">
            <Button variant="outline">← Back to Dashboard</Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Usage Statistics</CardTitle>
            <CardDescription>Detailed analytics for API key usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Total Requests</div>
                <div className="text-2xl font-bold">{stats.statistics.totalRequests}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Successful</div>
                <div className="text-2xl font-bold text-green-600">
                  {stats.statistics.successfulRequests}
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Failed</div>
                <div className="text-2xl font-bold text-red-600">
                  {stats.statistics.failedRequests}
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Avg Latency</div>
                <div className="text-2xl font-bold">
                  {Math.round(stats.statistics.averageLatencyMs)}ms
                </div>
              </div>
            </div>

            {chartData.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Request Timeline</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="requests" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold mb-4">Recent Logs</h3>
              {stats.recentLogs.length === 0 ? (
                <p className="text-gray-500">No logs found</p>
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
                    {stats.recentLogs.map((log) => (
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

