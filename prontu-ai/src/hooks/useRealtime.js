import { useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

/**
 * Hook for subscribing to Supabase Realtime changes on a table.
 *
 * @param {string} table - table name to subscribe to
 * @param {string} event - 'INSERT' | 'UPDATE' | 'DELETE' | '*'
 * @param {Function} callback - receives the payload
 * @param {boolean} [enabled=true] - whether subscription is active
 */
export default function useRealtime(table, event, callback, enabled = true) {
  useEffect(() => {
    if (!enabled || !isSupabaseConfigured()) return;

    const channel = supabase
      .channel(`realtime-${table}`)
      .on(
        'postgres_changes',
        { event, schema: 'public', table },
        (payload) => {
          console.log(`[Realtime] ${event} on ${table}:`, payload);
          callback(payload);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, event, enabled]); // eslint-disable-line react-hooks/exhaustive-deps
}
