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

export function MarketDataProvider({ children }: { children: React.ReactNode }) {
    const [data, setData] = useState<MarketData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = async () => {
        try {
            // Don't set loading to true on refresh to avoid flashing
            if (!data) setIsLoading(true)

            const res = await fetch('/api/market/data')
            if (!res.ok) throw new Error('Failed to fetch market data')
            const jsonData = await res.json()
            setData(jsonData)
            setError(null)
        } catch (err) {
            console.error(err)
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
        // Refresh every 1 minute
        const interval = setInterval(fetchData, 60000)
        return () => clearInterval(interval)
    }, [])

    return (
        <MarketDataContext.Provider value={{ data, isLoading, error, refresh: fetchData }}>
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
