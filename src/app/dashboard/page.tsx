"use client"

import { SmartMoneyPulse } from "@/components/dashboard/smart-money-pulse"
import { MarketSentiment } from "@/components/dashboard/market-sentiment"
import { Watchlist } from "@/components/dashboard/watchlist"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Code, Terminal } from "lucide-react"
import { useMarketData } from "@/components/providers/market-data-provider"

export default function DashboardPage() {
    const { data, isLoading } = useMarketData()

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
                            <p><span className="text-purple-400">if</span> (Volume {'>'} <span className="text-yellow-400">2.5</span> * MA(<span className="text-yellow-400">20</span>)) {'{'}</p>
                            <p className="pl-4"><span className="text-purple-400">const</span> <span className="text-blue-400">priceAction</span> = <span className="text-yellow-400">"bullish"</span>;</p>
                            <p className="pl-4"><span className="text-purple-400">return</span> <span className="text-yellow-400">"SMART_MONEY_ENTRY"</span>;</p>
                            <p>{'}'}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <Watchlist items={data?.watchlist || []} isLoading={isLoading} />
                </div>

                <Card className="border-border/50 bg-card/50 backdrop-blur flex items-center justify-center p-6 lg:col-span-1">
                    <div className="text-center space-y-2">
                        <div className="mx-auto rounded-full bg-pelorous-blue/10 p-3 w-12 h-12 flex items-center justify-center">
                            <Code className="h-6 w-6 text-pelorous-blue" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground">Fundamental Deep Dive</h3>
                        <p className="text-sm text-muted-foreground max-w-xs mx-auto">Select a ticker from the watchlist to view comprehensive financial health checks.</p>
                    </div>
                </Card>
            </div>
        </div>
    )
}
