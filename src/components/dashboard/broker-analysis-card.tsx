"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Activity, BarChart3, TrendingUp, Zap, Info } from "lucide-react"
import type { WatchlistItem } from "@/lib/types"

interface VolumeFlowAnalysisCardProps {
    data: WatchlistItem | null;
}

export function VolumeFlowAnalysisCard({ data }: VolumeFlowAnalysisCardProps) {
    if (!data) {
        return (
            <Card className="h-full border-border/50 bg-card/50 backdrop-blur flex items-center justify-center p-6">
                <div className="text-center space-y-2">
                    <div className="mx-auto rounded-full bg-pelorous-blue/10 p-3 w-12 h-12 flex items-center justify-center">
                        <Activity className="h-6 w-6 text-pelorous-blue" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground">Stealth Analytics</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">Select a ticker to view Volume Spread Analysis (VSA) and Buying Pressure metrics.</p>
                </div>
            </Card>
        )
    }

    const { rvol, priceCompressionScore, obvTrend, isAbsorption } = data.volumeFlowAnalysis;

    return (
        <Card className="h-full border-border/50 bg-card/50 backdrop-blur flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-pelorous-blue" />
                        Volume Flow
                    </span>
                    <span className="text-sm px-2 py-1 rounded-md bg-muted text-muted-foreground font-mono">{data.symbol}</span>
                </CardTitle>
                <CardDescription>VSA & Institutional Footprint</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-6">

                {/* RVOL Stat */}
                <div className="rounded-lg bg-black/20 p-4 border border-border/30 flex items-center justify-between">
                    <div>
                        <HoverCard>
                            <HoverCardTrigger asChild>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 cursor-help hover:text-foreground transition-colors">
                                    Relative Volume (RVOL)
                                    <Info className="h-3 w-3" />
                                </p>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80 bg-card border-border">
                                <div className="space-y-2">
                                    <h4 className="text-sm font-semibold">Relative Volume (RVOL)</h4>
                                    <p className="text-xs text-muted-foreground">
                                        Measures current volume against the 20-day average. A value greater than 1.0 means higher than average activity.
                                    </p>
                                    <div className="flex items-center gap-2 pt-2">
                                        <span className="text-xs font-mono bg-yellow-500/10 text-yellow-500 px-1 rounded">&gt; 1.5x</span>
                                        <span className="text-[10px] text-muted-foreground">High Institutional Interest</span>
                                    </div>
                                </div>
                            </HoverCardContent>
                        </HoverCard>
                        <p className="text-xl font-mono font-bold text-foreground">{rvol}x</p>
                    </div>

                    {rvol > 1.5 && (
                        <HoverCard>
                            <HoverCardTrigger asChild>
                                <span className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded cursor-help hover:bg-yellow-500/20 transition-colors">
                                    Elevated
                                </span>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-64 bg-card border-border">
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-yellow-500">Volume Spike Detected</p>
                                    <p className="text-xs text-muted-foreground">
                                        Trading volume is significantly higher than normal ({rvol}x), indicating possible Smart Money entry or exit.
                                    </p>
                                </div>
                            </HoverCardContent>
                        </HoverCard>
                    )}
                </div>

                {/* OBV Trend */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <HoverCard>
                            <HoverCardTrigger asChild>
                                <span className="text-muted-foreground flex items-center gap-1 cursor-help hover:text-foreground transition-colors">
                                    OBV Momentum
                                    <Info className="h-3 w-3" />
                                </span>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80 bg-card border-border">
                                <div className="space-y-2">
                                    <h4 className="text-sm font-semibold">On-Balance Volume (OBV)</h4>
                                    <p className="text-xs text-muted-foreground">
                                        cumulative indicator that uses volume flow to predict changes in stock price.
                                    </p>
                                    <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                                        <li><span className="text-success-green">Up:</span> Volume is flowing INTO the stock (Accumulation).</li>
                                        <li><span className="text-destructive">Down:</span> Volume is flowing OUT (Distribution).</li>
                                    </ul>
                                </div>
                            </HoverCardContent>
                        </HoverCard>
                        <span className={obvTrend === "Up" ? "text-success-green font-bold" : "text-zinc-500"}>{obvTrend}</span>
                    </div>
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-1000 ${obvTrend === "Up" ? "bg-success-green w-3/4" : obvTrend === "Down" ? "bg-destructive w-1/4" : "bg-zinc-500 w-1/2"}`}
                        />
                    </div>
                </div>

                {/* Price Compression */}
                <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-pelorous-blue" />
                            Price Stability
                        </h4>
                        <span className="text-xs text-muted-foreground">{priceCompressionScore}/100</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {priceCompressionScore > 80 ? "High Compression (Spring Loaded)" : "Normal Volatility"}
                    </p>
                </div>

                {/* Absorption Badge */}
                {isAbsorption && (
                    <div className="bg-pelorous-blue/10 border border-pelorous-blue/20 rounded-lg p-3 flex items-center gap-3">
                        <Zap className="h-5 w-5 text-pelorous-blue animate-pulse" />
                        <div>
                            <p className="text-sm font-bold text-pelorous-blue">Absorption Detected</p>
                            <p className="text-xs text-muted-foreground">Smart money is quietly buying supply.</p>
                        </div>
                    </div>
                )}

            </CardContent>
        </Card>
    )
}

