import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import type { WatchlistItem } from "@/lib/types"

interface WatchlistProps {
    items: WatchlistItem[]
    isLoading: boolean
}

export function Watchlist({ items, isLoading }: WatchlistProps) {
    return (
        <Card className="h-full border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
                <CardTitle>Quick Watchlist</CardTitle>
                <CardDescription>Top Tracked Assets (24h)</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-auto max-h-[400px]">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted text-muted-foreground sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-3 font-medium">Symbol</th>
                                <th className="px-6 py-3 font-medium text-right">Price</th>
                                <th className="px-6 py-3 font-medium text-right">Change</th>
                                <th className="px-6 py-3 font-medium text-center">Flow</th>
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
                                    </tr>
                                ))
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                                        No data available. check API connection.
                                    </td>
                                </tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.symbol} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-foreground">{item.symbol}</td>
                                        <td className="px-6 py-4 text-right font-mono">{item.price.toLocaleString("id-ID")}</td>
                                        <td className={`px-6 py-4 text-right font-mono ${item.changePercent >= 0 ? 'text-success-green' : 'text-destructive'}`}>
                                            {item.changePercent > 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Badge variant={item.flow === 'Inflow' ? 'default' : item.flow === 'Outflow' ? 'destructive' : 'secondary'} className={item.flow === 'Neutral' ? 'bg-zinc-grey text-slate-900' : ''}>
                                                {item.flow}
                                            </Badge>
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
