'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SupabaseTest() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        // Try to fetch a single row from the artists table
        const { data, error } = await supabase
          .from('artists')
          .select('*')
          .limit(1);

        if (error) throw error;

        setData(data);
        setStatus('success');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setStatus('error');
      }
    }

    testConnection();
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Supabase Connection Test</h2>
      
      {status === 'loading' && (
        <div className="text-blue-600">Testing connection...</div>
      )}

      {status === 'success' && (
        <div className="text-green-600">
          <p>✅ Successfully connected to Supabase!</p>
          {data && (
            <div className="mt-4">
              <h3 className="font-semibold">Sample Data:</h3>
              <pre className="mt-2 p-2 bg-gray-100 rounded">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {status === 'error' && (
        <div className="text-red-600">
          <p>❌ Connection failed</p>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
} 