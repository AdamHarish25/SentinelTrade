import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Radar, Database, Zap } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { WatchlistItem } from "@/lib/types"

interface WatchlistProps {
    items: WatchlistItem[]
    isLoading: boolean
    onSelect: (item: WatchlistItem) => void
    selectedSymbol?: string
}

export function Watchlist({ items, isLoading, onSelect, selectedSymbol }: WatchlistProps) {
    return (
        <Card className="h-full border-border/50 bg-card/50 backdrop-blur flex flex-col">
            <CardHeader>
                <CardTitle>The "Smart Money" Scanner</CardTitle>
                <CardDescription>Real-time Bandarmology & Volume Analysis</CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
                <div className="overflow-auto h-full max-h-[500px]">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted text-muted-foreground sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-3 font-medium">Ticker</th>
                                <th className="px-6 py-3 font-medium text-right">Price</th>
                                <th className="px-6 py-3 font-medium text-right">Change</th>
                                <th className="px-6 py-3 font-medium text-center">Flow</th>
                                <th className="px-6 py-3 font-medium text-center">Accumulation Quality</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
                                        <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
                                        <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-12 ml-auto" /></td>
                                        <td className="px-6 py-4 text-center"><Skeleton className="h-6 w-16 mx-auto" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-2 w-24 mx-auto" /></td>
                                    </tr>
                                ))
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                        No data available. check API connection.
                                    </td>
                                </tr>
                            ) : (
                                items.map((item) => (
                                    <tr
                                        key={item.symbol}
                                        onClick={() => onSelect(item)}
                                        className={`cursor-pointer transition-colors hover:bg-muted/50 ${selectedSymbol === item.symbol ? "bg-muted/80 border-l-2 border-pelorous-blue" : ""}`}
                                    >
                                        <td className="px-6 py-4 font-bold text-foreground flex items-center gap-2">
                                            {item.symbol}
                                            {item.isMock ? (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Badge variant="outline" className="h-5 px-1 py-0 text-[10px] bg-yellow-500/10 text-yellow-500 border-yellow-500/20">MOCK</Badge>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="bg-deep-navy border-border text-xs">
                                                            <p>Using Mock Data (API Limit Hit or Mock Mode)</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            ) : (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Badge variant="outline" className="h-5 px-1 py-0 text-[10px] bg-pelorous-blue/10 text-pelorous-blue border-pelorous-blue/20">LIVE</Badge>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="bg-deep-navy border-border text-xs">
                                                            <p>Live Data from Y-Finance</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                            {item.isStealth && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Radar className="h-4 w-4 text-pelorous-blue animate-pulse ml-1" />
                                                        </TooltipTrigger>
                                                        <TooltipContent className="bg-deep-navy border-border text-xs max-w-[200px]">
                                                            <p>Stealth Accumulation Detected. High Broker Concentration in Sideways Market.</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono">{item.price.toLocaleString("id-ID")}</td>
                                        <td className={`px-6 py-4 text-right font-mono ${item.changePercent >= 0 ? 'text-success-green' : 'text-destructive'}`}>
                                            {item.changePercent > 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Badge variant={item.flow === 'Inflow' ? 'default' : item.flow === 'Outflow' ? 'destructive' : 'secondary'} className={item.flow === 'Neutral' ? 'bg-zinc-grey text-slate-900' : ''}>
                                                {item.flow}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 w-[200px]">
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                    <span>Score</span>
                                                    <span className={item.accumulationQuality > 70 ? "text-pelorous-blue font-bold" : ""}>{item.accumulationQuality}/100</span>
                                                </div>
                                                <Progress value={item.accumulationQuality} className="h-1.5 bg-slate-800 [&>div]:bg-gradient-to-r [&>div]:from-zinc-500 [&>div]:to-pelorous-blue" />
                                            </div>
                                        </td>
                                    </tr>
                                )))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    )
}
