'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface UseSupabaseCollectionResult<T> {
    data: T[] | null;
    isLoading: boolean;
    error: Error | null;
}

export function useSupabaseCollection<T = any>(tableName: string): UseSupabaseCollectionResult<T> {
    const [data, setData] = useState<T[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let mounted = true;

        async function fetchData() {
            try {
                setIsLoading(true);
                const { data: initialData, error: initialError } = await supabase
                    .from(tableName)
                    .select('*');

                if (initialError) throw initialError;

                if (mounted) {
                    setData(initialData as T[]);
                    setError(null);
                }
            } catch (err: any) {
                if (mounted) {
                    console.error(`Supabase fetch error for ${tableName}:`, err);
                    setError(err);
                }
            } finally {
                if (mounted) setIsLoading(false);
            }
        }

        fetchData();

        // Set up real-time subscription
        const channel = supabase
            .channel(`realtime_${tableName}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: tableName },
                (payload) => {
                    // Simple strategy: Re-fetch entire list on any change for simplicity/correctness
                    // Optimization: Optimistically update state based on payload (INSERT/UPDATE/DELETE)
                    fetchData();
                }
            )
            .subscribe();

        return () => {
            mounted = false;
            supabase.removeChannel(channel);
        };
    }, [tableName]);

    return { data, isLoading, error };
}
