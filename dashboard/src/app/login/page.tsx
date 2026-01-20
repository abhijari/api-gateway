'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create or get user from backend. Use runtime config endpoint to
      // obtain the gateway URL (no build-time NEXT_PUBLIC_* dependency).
      const cfgRes = await fetch('/api/runtime-config', { cache: 'no-store' });
      if (!cfgRes.ok) throw new Error('Failed to fetch runtime config');
      const cfg = await cfgRes.json();
      if (!cfg.gatewayApiUrl) {
        throw new Error('GATEWAY_API_URL missing from runtime config');
      }
      const GATEWAY_API_URL = cfg.gatewayApiUrl;
      const response = await fetch(`${GATEWAY_API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to create/get user');
      }

      const user = await response.json();
      
      // Store user info in localStorage
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userId', user.id);
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      alert('Failed to login. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your email to access the dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

