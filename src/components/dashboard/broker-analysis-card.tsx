"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Code, Users, Wallet } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import type { WatchlistItem } from "@/lib/types"

interface BrokerAnalysisCardProps {
    data: WatchlistItem | null;
}

export function BrokerAnalysisCard({ data }: BrokerAnalysisCardProps) {
    if (!data) {
        return (
            <Card className="h-full border-border/50 bg-card/50 backdrop-blur flex items-center justify-center p-6">
                <div className="text-center space-y-2">
                    <div className="mx-auto rounded-full bg-pelorous-blue/10 p-3 w-12 h-12 flex items-center justify-center">
                        <Code className="h-6 w-6 text-pelorous-blue" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground">Broker Intelligence</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">Select a ticker from the scanner to analyze institutional ownership and broker concentration.</p>
                </div>
            </Card>
        )
    }

    return (
        <Card className="h-full border-border/50 bg-card/50 backdrop-blur flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-pelorous-blue" />
                        Broker Summary
                    </span>
                    <span className="text-sm px-2 py-1 rounded-md bg-muted text-muted-foreground font-mono">{data.symbol}</span>
                </CardTitle>
                <CardDescription>Top 3 Buyers vs Retail Distribution</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-6">

                {/* Concentration Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-success-green font-medium">Top 3 Brokers (Smart Money)</span>
                        <span className="text-zinc-grey">Retail</span>
                    </div>
                    <div className="flex h-4 w-full overflow-hidden rounded-full bg-slate-800">
                        <div
                            className="bg-success-green transition-all duration-1000 ease-out"
                            style={{ width: `${data.brokerSummary.top3Percentage}%` }}
                        />
                        <div
                            className="bg-muted transition-all duration-1000 ease-out"
                            style={{ width: `${data.brokerSummary.retailPercentage}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{data.brokerSummary.top3Percentage}% Controlled</span>
                        <span>{data.brokerSummary.retailPercentage}% Fragmented</span>
                    </div>
                </div>

                {/* Top Buyers List */}
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-pelorous-blue" />
                        Top Accumulators
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                        {data.brokerSummary.topBuyers.map(broker => (
                            <div key={broker} className="bg-muted/50 rounded-md p-2 text-center border border-border/50">
                                <span className="font-bold text-pelorous-blue">{broker}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Avg Value Stat */}
                <div className="rounded-lg bg-black/20 p-4 border border-border/30">
                    <p className="text-xs text-muted-foreground mb-1">Avg. Transaction Value</p>
                    <p className="text-2xl font-mono font-bold text-foreground">
                        {data.brokerSummary.avgTxValue.toLocaleString("id-ID")} <span className="text-xs text-muted-foreground font-sans">lots</span>
                    </p>
                    <p className="text-xs text-emerald-400 mt-1">
                        {data.brokerSummary.avgTxValue > 500 ? "High Institutional Activity" : "Normal Retail Flow"}
                    </p>
                </div>

            </CardContent>
        </Card>
    )
}
