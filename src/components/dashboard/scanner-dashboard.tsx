import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Radar, RefreshCcw, TrendingUp, Filter, Diamond, Layers, Briefcase, Database } from "lucide-react";
import type { WatchlistItem } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

// SUB-COMPONENTS
const HotStockCard = ({ stock, onSelect, isSelected }: { stock: WatchlistItem, onSelect: any, isSelected: boolean }) => (
    <div
        onClick={() => onSelect(stock)}
        className={`relative p-4 rounded-lg border transition-all cursor-pointer hover:bg-muted/50 ${isSelected ? 'border-pelorous-blue bg-muted/30' : 'border-border bg-card'}`}
    >
        <div className="flex justify-between items-start mb-2">
            <div>
                <div className="flex items-center gap-1">
                    <span className="font-bold text-lg">{stock.symbol}</span>
                    {stock.fundamental?.conglomerate && (
                        <Badge variant="outline" className="text-[9px] h-4 px-1 border-white/10 text-muted-foreground">{stock.fundamental.conglomerate}</Badge>
                    )}
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                    {stock.price.toLocaleString()} IDR
                    <Badge variant={stock.flow === 'Inflow' ? 'secondary' : stock.flow === 'Outflow' ? 'destructive' : 'default'} className={`text-[9px] h-4 px-1 py-0 ${stock.flow === 'Neutral' ? 'bg-zinc-grey text-slate-900 border-transparent' : ''}`}>
                        {stock.flow}
                    </Badge>
                </div>
            </div>
            <Badge className="bg-pelorous-blue/20 text-pelorous-blue border-pelorous-blue/50">
                {stock.accumulationQuality} / 100
            </Badge>
        </div>

        <div className="flex items-end justify-between">
            <div className={`text-sm font-bold ${stock.changePercent >= 0 ? 'text-success-green' : 'text-red-500'}`}>
                {stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
            </div>
            <div className="text-right">
                <div className="text-[10px] text-muted-foreground">Vol Stability</div>
                <div className="font-mono text-xs">{stock.volumeFlowAnalysis.rvol}x</div>
            </div>
        </div>

        {/* Visual Pulse for Stealth */}
        {stock.isStealth && (
            <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-pelorous-blue animate-ping" />
        )}
    </div>
);

const ExplorerTable = ({ stocks, onSelect, selectedSymbol }: { stocks: WatchlistItem[], onSelect: any, selectedSymbol?: string }) => (
    <div className="rounded-md border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
            <div className="min-w-[600px]">
                <div className="bg-muted/30 px-4 py-2 text-xs font-medium text-muted-foreground grid grid-cols-12 gap-2">
                    <div className="col-span-2">Ticker</div>
                    <div className="col-span-2">Sector</div>
                    <div className="col-span-2 text-right">Price</div>
                    <div className="col-span-2 text-center">Flow</div>
                    <div className="col-span-2 text-right">Vol (Lots)</div>
                    <div className="col-span-2 text-center">Score</div>
                </div>
                <ScrollArea className="h-[400px]">
                    {stocks.map((stock) => (
                        <div
                            key={stock.symbol}
                            onClick={() => onSelect(stock)}
                            className={`px-4 py-3 text-sm grid grid-cols-12 gap-2 items-center cursor-pointer border-b border-border/50 last:border-0 hover:bg-muted/50 ${selectedSymbol === stock.symbol ? 'bg-muted/80' : ''}`}
                        >
                            <div className="col-span-2 font-bold flex items-center gap-2">
                                <div className="truncate flex items-center">
                                    {stock.symbol}
                                    {stock.isStealth && (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Radar className="h-4 w-4 text-pelorous-blue animate-pulse ml-1 inline" />
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-deep-navy border-border text-xs max-w-[200px]">
                                                    <p>Stealth Accumulation Detected. High Broker Concentration in Sideways Market.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                    {stock.isMock ? (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Badge variant="outline" className="h-4 px-1 py-0 text-[9px] bg-yellow-500/10 text-yellow-500 border-yellow-500/20 ml-1">MOCK</Badge>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-deep-navy border-border text-xs">
                                                    <p>Delisted / Merged / Mock Data</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    ) : (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Badge variant="outline" className="h-4 px-1 py-0 text-[9px] bg-pelorous-blue/10 text-pelorous-blue border-pelorous-blue/20 ml-1">LIVE</Badge>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-deep-navy border-border text-xs">
                                                    <p>Live Data from Y-Finance</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                </div>
                                {stock.fundamental?.conglomerate && (
                                    <span className="md:hidden inline-block w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                                )}
                            </div>
                            <div className="col-span-2 text-xs text-muted-foreground truncate">
                                {stock.fundamental?.sector || "-"}
                            </div>
                            <div className="col-span-2 text-right font-mono">{stock.price.toLocaleString()}</div>
                            <div className="col-span-2 text-center">
                                <Badge variant={stock.flow === 'Inflow' ? 'secondary' : stock.flow === 'Outflow' ? 'destructive' : 'default'} className={`text-[10px] h-5 px-1 ${stock.flow === 'Neutral' ? 'bg-zinc-grey text-slate-900 border-transparent' : ''}`}>
                                    {stock.flow}
                                </Badge>
                            </div>
                            <div className="col-span-2 text-right font-mono text-xs text-muted-foreground">
                                {stock.volume.toLocaleString()}
                            </div>
                            <div className="col-span-2 flex justify-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${stock.accumulationQuality > 50 ? 'border-pelorous-blue/30 text-pelorous-blue bg-pelorous-blue/10' : 'border-border text-muted-foreground'
                                    }`}>
                                    {stock.accumulationQuality}
                                </div>
                            </div>
                        </div>
                    ))}
                </ScrollArea>
            </div>
        </div>
    </div>
);

// MAIN DASHBOARD
interface ScannerDashboardProps {
    items: WatchlistItem[];
    isLoading: boolean;
    onSelect: (item: WatchlistItem) => void;
    selectedSymbol?: string;
    onRescan: () => void;
    auditTrail?: {
        scannedUniverse: number;
        qualityPassed: number;
        stealthFound: number;
    }
}

export function ScannerDashboard({ items, isLoading, onSelect, selectedSymbol, onRescan, auditTrail }: ScannerDashboardProps) {
    // Client-Side Filters
    const [activeConglo, setActiveConglo] = useState<string>("All");

    // Derived Data
    const filteredItems = useMemo(() => {
        return items.filter(item => {
            if (activeConglo !== "All" && item.fundamental?.conglomerate !== activeConglo) return false;
            return true;
        });
    }, [items, activeConglo]);

    const hotList = filteredItems.filter(i => i.accumulationQuality >= 75);
    const explorerList = filteredItems.filter(i => i.accumulationQuality < 75);

    // Extraction for Filter Options
    const conglomerates = Array.from(new Set(items.map(i => i.fundamental?.conglomerate).filter(Boolean)));

    // Default Audit Trail if missing
    const stats = auditTrail || { scannedUniverse: 25, qualityPassed: items.length, stealthFound: items.filter(i => i.isStealth).length };

    return (
        <Card className="h-full border-border/50 bg-card/50 backdrop-blur flex flex-col">
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between pb-2 gap-4">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-success-green" />
                        Quality Scanner
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                        <span className="flex flex-wrap items-center gap-1.5 text-xs bg-muted px-2 py-1 rounded">
                            <Database className="h-3 w-3" />
                            <span>Universe: {stats.scannedUniverse}</span>
                            <span>→</span>
                            <span className="text-secondary font-bold">Passed: {stats.qualityPassed}</span>
                            <span>→</span>
                            <span className="text-pelorous-blue font-bold">Found: {stats.stealthFound}</span>
                        </span>
                    </CardDescription>
                </div>

                {/* Manual Rescan */}
                <Button variant="outline" size="sm" onClick={onRescan} disabled={isLoading} className="ml-auto md:ml-0">
                    <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    {isLoading ? 'Scanning...' : 'Re-scan'}
                </Button>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* FILTER BAR */}
                {!isLoading && (
                    <div className="flex flex-wrap gap-2 pb-2 border-b border-border/50">
                        {/* Conglomerate Filter */}
                        <div className="flex items-center gap-1">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground mr-1">Group:</span>
                            <Badge
                                variant={activeConglo === "All" ? "default" : "outline"}
                                className="cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => setActiveConglo("All")}
                            >
                                All
                            </Badge>
                            {conglomerates.map(c => (
                                <Badge
                                    key={c}
                                    variant={activeConglo === c ? "default" : "outline"}
                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => setActiveConglo(c as string)}
                                >
                                    {c}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {isLoading ? (
                    <div className="py-12 flex flex-col items-center justify-center space-y-4">
                        <div className="w-full max-w-xs space-y-2">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Fundamental Analysis & Filtering...</span>
                                <span>Done</span>
                            </div>
                            <Progress value={undefined} className="h-2 w-full animate-pulse" />
                        </div>
                        <p className="text-sm text-muted-foreground animate-pulse text-center">
                            Applying "Anti-Gorengan" Logic...<br />
                            <span className="text-xs text-muted-foreground/50">(Cap &gt; 5T, DER &lt; 2, ROE &gt; 0)</span>
                        </p>
                    </div>
                ) : (
                    <>
                        {/* HOT WATCHLIST (Grid) */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-semibold text-pelorous-blue">
                                <Diamond className="h-4 w-4" />
                                Sentinel Watchlist (Stealth &gt; 75)
                            </div>
                            {hotList.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {hotList.map(stock => (
                                        <HotStockCard
                                            key={stock.symbol}
                                            stock={stock}
                                            onSelect={onSelect}
                                            isSelected={selectedSymbol === stock.symbol}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 border border-dashed border-border rounded-lg text-center text-sm text-muted-foreground">
                                    No "Stealth Accumulation" found in this category today.
                                </div>
                            )}
                        </div>

                        {/* MARKET EXPLORER (Table) */}
                        <div className="space-y-2 pt-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                                <Layers className="h-4 w-4" />
                                Fundamental Explorer (Quality Passed)
                            </div>
                            <ExplorerTable
                                stocks={explorerList}
                                onSelect={onSelect}
                                selectedSymbol={selectedSymbol}
                            />
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
