"use client"

import { useState } from "react"
import { SmartMoneyPulse } from "@/components/dashboard/smart-money-pulse"
import { MarketSentiment } from "@/components/dashboard/market-sentiment"
import { ScannerDashboard } from "@/components/dashboard/scanner-dashboard"
import { VolumeFlowAnalysisCard } from "@/components/dashboard/broker-analysis-card"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Terminal } from "lucide-react"
import { useMarketData } from "@/components/providers/market-data-provider"
import type { WatchlistItem } from "@/lib/types"

export default function DashboardPage() {
    const { data, isLoading, refresh } = useMarketData()
    const [selectedStock, setSelectedStock] = useState<WatchlistItem | null>(null)

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Market Scanning Engine</h1>
                    <p className="text-muted-foreground">LQ45 Index Screener & Smart Money Detection</p>
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
                        <CardDescription>Scanner Algorithm v2.0</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="h-full rounded-md bg-black/50 p-4 font-mono text-xs text-green-400 border border-border/50 shadow-inner overflow-hidden">
                            <p className="text-muted-foreground mb-2">// Quality Gate (Anti-Gorengan)</p>
                            <p>if (Cap {'<'} <span className="text-yellow-400">5T</span> || DER {'>'} <span className="text-red-400">2.0</span>) return;</p>
                            <br />
                            <p className="text-muted-foreground mb-2">// VSA Stealth Signal</p>
                            <p><span className="text-purple-400">const</span> isStealth = (</p>
                            <p className="pl-4">Vol {'>'} <span className="text-yellow-400">2.5</span> * MA20 && </p>
                            <p className="pl-4">Abs(Change) {'<'} <span className="text-yellow-400">1.5%</span></p>
                            <p>);</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <ScannerDashboard
                        items={data?.watchlist || []}
                        isLoading={isLoading}
                        onSelect={setSelectedStock}
                        selectedSymbol={selectedStock?.symbol}
                        onRescan={refresh}
                        // @ts-ignore - The API response might include this, but type def expects strict match. 
                        // In real app, update MarketData type to include auditTrail.
                        auditTrail={data ? (data as any).auditTrail : undefined}
                    />
                </div>

                <div className="lg:col-span-1">
                    <div className="sticky top-6">
                        <VolumeFlowAnalysisCard data={selectedStock} />
                    </div>
                </div>
            </div>
        </div>
    )
}
