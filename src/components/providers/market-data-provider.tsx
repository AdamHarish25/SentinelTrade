"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import type { MarketData } from "@/lib/types"

interface MarketDataContextType {
    data: MarketData | null
    isLoading: boolean
    error: string | null
    refresh: () => void
}

const MarketDataContext = createContext<MarketDataContextType | undefined>(undefined)

// Version bumped to invalidate old mock data that didn't have isMock flags
const CACHE_KEY = "sentinel_market_data_cache_v2_stealth";
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export function MarketDataProvider({ children }: { children: React.ReactNode }) {
    const [data, setData] = useState<MarketData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const loadFromCache = (): boolean => {
        if (typeof window === 'undefined') return false; // Server-side guard
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                const { timestamp, data: cachedData } = JSON.parse(cached);
                if (Date.now() - timestamp < CACHE_DURATION) {
                    setData(cachedData);
                    return true;
                }
            }
        } catch (e) {
            console.error("Cache load failed", e);
        }
        return false;
    };

    const fetchData = async (force = false) => {
        // If not forced and cache is valid, user sees cached data.
        // We skip network to save API calls (Quota Protection).
        if (!force) {
            const hasCache = loadFromCache();
            if (hasCache) {
                setIsLoading(false);
                return;
            }
        }

        try {
            // Only set loading if we don't have data (first load) or if explicit refresh
            if (!data) setIsLoading(true);

            const res = await fetch('/api/market/data');
            if (!res.ok) throw new Error('Failed to fetch market data');
            const jsonData = await res.json();

            setData(jsonData);
            setError(null);

            // Save to cache
            if (typeof window !== 'undefined') {
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    timestamp: Date.now(),
                    data: jsonData
                }));
            }

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchData();

        // Check every 5 minutes if cache expired
        const interval = setInterval(() => {
            fetchData(false);
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <MarketDataContext.Provider value={{ data, isLoading, error, refresh: () => fetchData(true) }}>
            {children}
        </MarketDataContext.Provider>
    )
}

export function useMarketData() {
    const context = useContext(MarketDataContext)
    if (context === undefined) {
        throw new Error("useMarketData must be used within a MarketDataProvider")
    }
    return context
}
