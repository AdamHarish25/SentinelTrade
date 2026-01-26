"use client"

import { useState } from "react"
import { SmartMoneyPulse } from "@/components/dashboard/smart-money-pulse"
import { MarketSentiment } from "@/components/dashboard/market-sentiment"
import { Watchlist } from "@/components/dashboard/watchlist"
import { BrokerAnalysisCard } from "@/components/dashboard/broker-analysis-card"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Terminal } from "lucide-react"
import { useMarketData } from "@/components/providers/market-data-provider"
import type { WatchlistItem } from "@/lib/types"

export default function DashboardPage() {
    const { data, isLoading } = useMarketData()
    const [selectedStock, setSelectedStock] = useState<WatchlistItem | null>(null)

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Market Overview</h1>
                    <p className="text-muted-foreground">Real-time analysis of IDX smart money flow.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${data?.isMarketOpen ? 'bg-green-500/10 text-green-500 ring-green-500/20' : 'bg-yellow-500/10 text-yellow-500 ring-yellow-500/20'}`}>
                        {data?.isMarketOpen ? 'System Online (Market Open)' : 'System Standby (Market Closed)'}
                    </span>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <SmartMoneyPulse flowData={data?.smartMoneyFlow} isLoading={isLoading} />
                <MarketSentiment score={data?.marketSentiment || 0} isLoading={isLoading} />

                {/* Logic Preview Card (Static) */}
                <Card className="col-span-1 border-border/50 bg-card/50 backdrop-blur flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Terminal className="h-5 w-5 text-pelorous-blue" />
                            Logic Preview
                        </CardTitle>
                        <CardDescription>Live Scalar Logic</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="h-full rounded-md bg-black/50 p-4 font-mono text-xs text-green-400 border border-border/50 shadow-inner">
                            <p className="text-muted-foreground mb-2">// Detecting Accumulation</p>
                            <p><span className="text-purple-400">if</span> (Vol {'>'} <span className="text-yellow-400">2.5</span> * Avg && Abs(Chg) {'<'} <span className="text-yellow-400">1.5%</span>) {'{'}</p>
                            <p className="pl-4"><span className="text-purple-400">return</span> <span className="text-yellow-400">"STEALTH_ACCUMULATION"</span>;</p>
                            <p>{'}'}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <Watchlist
                        items={data?.watchlist || []}
                        isLoading={isLoading}
                        onSelect={setSelectedStock}
                        selectedSymbol={selectedStock?.symbol}
                    />
                </div>

                <div className="lg:col-span-1">
                    <BrokerAnalysisCard data={selectedStock} />
                </div>
            </div>
        </div>
    )
}
