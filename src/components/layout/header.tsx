"use client"

import { useEffect, useState } from "react"
import { Clock } from "lucide-react"
import { useMarketData } from "@/components/providers/market-data-provider"
import { Skeleton } from "@/components/ui/skeleton"

export function Header() {
    const [time, setTime] = useState<string>("")
    const { data, isLoading } = useMarketData()

    useEffect(() => {
        const updateTime = () => {
            const now = new Date().toLocaleTimeString("en-US", {
                timeZone: "Asia/Jakarta",
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            })
            setTime(now)
        }
        updateTime()
        const interval = setInterval(updateTime, 1000)
        return () => clearInterval(interval)
    }, [])

    return (
        <header className="sticky top-0 z-20 flex h-16 w-full items-center gap-4 border-b bg-background/95 backdrop-blur px-6 transition-all">
            <div className="flex items-center gap-4 flex-1 overflow-hidden mask-linear-fade">
                {/* Ticker Tape */}
                <div className="flex items-center gap-8 text-sm text-muted-foreground animate-infinite-scroll hover:[animation-play-state:paused] whitespace-nowrap">
                    {!data || isLoading ? (
                        // Skeleton Loading State
                        Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <Skeleton className="h-4 w-12" />
                                <Skeleton className="h-4 w-10" />
                            </div>
                        ))
                    ) : (
                        [...data.watchlist, ...data.watchlist].map((item, index) => (
                            <div key={`${item.symbol}-${index}`} className="flex items-center gap-2">
                                <span className="font-bold text-foreground">{item.symbol}</span>
                                <span className={`font-mono ${item.changePercent >= 0 ? 'text-secondary' : 'text-destructive'}`}>
                                    {item.changePercent > 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                    <div className={`h-2 w-2 rounded-full animate-pulse ${data?.isMarketOpen ? 'bg-secondary' : 'bg-yellow-500'}`} />
                    <span className="text-muted-foreground">{data?.isMarketOpen ? 'Market Open' : 'Market Closed'}</span>
                </div>

                <div className="h-4 w-px bg-border" />

                <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{time} WIB</span>
                </div>
            </div>
        </header>
    )
}
