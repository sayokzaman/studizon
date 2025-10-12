import { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { useDebouncedValue } from './use-debounced-value';

interface UseFetchListProps<TData, TParams extends Record<string, unknown>> {
    /** API endpoint to call */
    url: string;

    /** Optional search query */
    search?: string;

    /** Additional query parameters (like department_id, program_id, etc.) */
    params?: TParams;

    /** Transform function for mapping API response to TData[] */
    mapResponse?: (response: unknown) => TData[];

    /** Debounce delay (ms) */
    delay?: number;

    /** Whether fetching is enabled */
    enabled?: boolean;
}

/**
 * Generic, type-safe data fetching hook with search, debounce, and dependencies.
 */
export function useFetchList<TData, TParams extends Record<string, unknown> = Record<string, never>>({
    url,
    search = '',
    params,
    mapResponse,
    delay = 300,
    enabled = true,
}: UseFetchListProps<TData, TParams>) {
    const [data, setData] = useState<TData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<AxiosError | null>(null);

    const debouncedSearch = useDebouncedValue(search, delay);

    useEffect(() => {
        if (!enabled) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(url, {
                    params: { search: debouncedSearch, ...(params || {}) },
                });

                let list: TData[] = [];

                if (mapResponse) {
                    list = mapResponse(response.data);
                } else if (Array.isArray(response.data)) {
                    list = response.data;
                } else if (
                    typeof response.data === 'object' &&
                    response.data !== null
                ) {
                    const firstValue = Object.values(response.data)[0];
                    if (Array.isArray(firstValue)) {
                        list = firstValue as TData[];
                    }
                }

                setData(list);
                setError(null);
            } catch (err) {
                console.error(`Error fetching from ${url}:`, err);
                setError(err as AxiosError);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url, debouncedSearch, JSON.stringify(params), enabled]);

    return { data, loading, error };
}
