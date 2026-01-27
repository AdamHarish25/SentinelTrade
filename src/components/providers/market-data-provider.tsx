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

// Version bumped to apply new 5-min cache strategy
const CACHE_KEY = "sentinel_market_data_cache_v3_5min";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function MarketDataProvider({ children }: { children: React.ReactNode }) {
    const [data, setData] = useState<MarketData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const loadFromCache = (): boolean => {
        if (typeof window === 'undefined') return false;
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
        if (!force) {
            const hasCache = loadFromCache();
            if (hasCache) {
                setIsLoading(false);
                return;
            }
        }

        try {
            if (!data) setIsLoading(true);

            const res = await fetch('/api/market/data');
            if (!res.ok) throw new Error('Failed to fetch market data');
            const jsonData = await res.json();

            setData(jsonData);
            setError(null);

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

        // Check cache expiration every 1 minute to ensure we catch the 5-min mark promptly
        const interval = setInterval(() => {
            fetchData(false);
        }, 60 * 1000);

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
