'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createApiKey } from '@/lib/api';
import { CheckCircle2, Copy } from 'lucide-react';

export default function CreateKeyPage() {
  const router = useRouter();
  const [limitPerMinute, setLimitPerMinute] = useState('60');
  const [limitPerDay, setLimitPerDay] = useState('10000');
  const [loading, setLoading] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      router.push('/login');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const storedUserId = localStorage.getItem('userId');
      if (!storedUserId) {
        router.push('/login');
        return;
      }

      const key = await createApiKey(
        storedUserId,
        parseInt(limitPerMinute),
        parseInt(limitPerDay)
      );
      setCreatedKey(key.key);
    } catch (error) {
      console.error('Failed to create API key:', error);
      alert('Failed to create API key');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey);
      alert('API key copied to clipboard!');
    }
  };

  if (createdKey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              <CardTitle>API Key Created</CardTitle>
            </div>
            <CardDescription>
              Your API key has been generated. Copy it now - you won't be able to see it again!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-100 p-4 rounded-lg">
              <code className="text-sm break-all">{createdKey}</code>
            </div>
            <div className="flex gap-2">
              <Button onClick={copyToClipboard}>
                <Copy className="mr-2 h-4 w-4" />
                Copy to Clipboard
              </Button>
              <Link href="/dashboard">
                <Button variant="outline">Go to Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
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
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Create New API Key</CardTitle>
            <CardDescription>Generate a new API key with custom rate limits</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Rate Limit (per minute)</label>
                <Input
                  type="number"
                  value={limitPerMinute}
                  onChange={(e) => setLimitPerMinute(e.target.value)}
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Rate Limit (per day)</label>
                <Input
                  type="number"
                  value={limitPerDay}
                  onChange={(e) => setLimitPerDay(e.target.value)}
                  min="1"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating...' : 'Create API Key'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

