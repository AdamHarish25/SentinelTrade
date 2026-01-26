"use client"

import { Watchlist } from "@/components/dashboard/watchlist"
import { VolumeFlowAnalysisCard } from "@/components/dashboard/broker-analysis-card"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useMarketData } from "@/components/providers/market-data-provider"
import { useState } from "react"
import type { WatchlistItem } from "@/lib/types"

export default function ScannerPage() {
    const { data, isLoading } = useMarketData()
    const [selectedStock, setSelectedStock] = useState<WatchlistItem | null>(null)

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Smart Money Scanner</h1>
                    <p className="text-muted-foreground">Advanced detection of institutional accumulation and distribution.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="lg:col-span-2 h-full flex flex-col min-h-0">
                    <Watchlist
                        items={data?.watchlist || []}
                        isLoading={isLoading}
                        onSelect={setSelectedStock}
                        selectedSymbol={selectedStock?.symbol}
                    />
                </div>
                <div className="lg:col-span-1 h-full min-h-0">
                    <VolumeFlowAnalysisCard data={selectedStock} />

                    <Card className="mt-6 border-border/50 bg-card/50 backdrop-blur">
                        <CardHeader>
                            <CardTitle>Stealth Algorithm</CardTitle>
                            <CardDescription>How accumulation is scored</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Volume Spike Factor</span>
                                    <span className="text-pelorous-blue font-bold">+30%</span>
                                </div>
                                <div className="h-1 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-pelorous-blue w-[30%]" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Silence Factor (Low Vol)</span>
                                    <span className="text-success-green font-bold">+30%</span>
                                </div>
                                <div className="h-1 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-success-green w-[30%]" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Trend Factor</span>
                                    <span className="text-zinc-500 font-bold">+20%</span>
                                </div>
                                <div className="h-1 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-zinc-500 w-[20%]" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Inst. Footprint</span>
                                    <span className="text-purple-500 font-bold">+20%</span>
                                </div>
                                <div className="h-1 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-500 w-[20%]" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
