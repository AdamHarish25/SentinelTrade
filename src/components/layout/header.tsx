"use client"

import { useEffect, useState } from "react"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, Activity, LayoutDashboard, ScanLine, FlaskConical, List, ScrollText, Clock } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMarketData } from "@/components/providers/market-data-provider"
import { Skeleton } from "@/components/ui/skeleton"

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Smart Money", href: "/dashboard/scanner", icon: ScanLine },
    { name: "Fundamental Lab", href: "/dashboard/fundamental", icon: FlaskConical },
    { name: "Watchlist", href: "/dashboard/watchlist", icon: List },
    { name: "System Logs", href: "/dashboard/logs", icon: ScrollText },
]

export function Header() {
    const [time, setTime] = useState<string>("")
    const [isMarketOpen, setIsMarketOpen] = useState<boolean>(false)
    const { data, isLoading } = useMarketData()
    const pathname = usePathname()

    useEffect(() => {
        const updateTime = () => {
            const now = new Date()

            // 1. Display Time (WIB)
            const timeStr = now.toLocaleTimeString("en-US", {
                timeZone: "Asia/Jakarta",
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            })
            setTime(timeStr)

            // 2. Logic: Market Status (WIB)
            const options: Intl.DateTimeFormatOptions = { timeZone: "Asia/Jakarta", hour: 'numeric', minute: 'numeric', weekday: 'short', hour12: false };
            const formatter = new Intl.DateTimeFormat('en-US', options);
            const parts = formatter.formatToParts(now);

            let hour = 0, minute = 0, weekday = "";
            parts.forEach(p => {
                if (p.type === 'hour') hour = parseInt(p.value);
                if (p.type === 'minute') minute = parseInt(p.value);
                if (p.type === 'weekday') weekday = p.value;
            });

            const currentTime = hour * 60 + minute;
            let isOpen = false;

            // Schedule: 
            // Mon-Thu: 09:00-12:00 & 13:30-16:00
            // Fri: 09:00-11:30 & 14:00-16:00
            if (weekday !== "Sat" && weekday !== "Sun") {
                if (weekday === "Fri") {
                    const session1 = currentTime >= 9 * 60 && currentTime < 11 * 60 + 30; // 09:00 - 11:30
                    const session2 = currentTime >= 14 * 60 && currentTime < 16 * 60;      // 14:00 - 16:00
                    isOpen = session1 || session2;
                } else {
                    const session1 = currentTime >= 9 * 60 && currentTime < 12 * 60;       // 09:00 - 12:00
                    const session2 = currentTime >= 13 * 60 + 30 && currentTime < 16 * 60; // 13:30 - 16:00
                    isOpen = session1 || session2;
                }
            }
            setIsMarketOpen(isOpen)
        }
        updateTime()
        const interval = setInterval(updateTime, 1000)
        return () => clearInterval(interval)
    }, [])

    return (
        <header className="sticky top-0 z-20 flex h-16 w-full items-center gap-4 border-b bg-background/95 backdrop-blur px-4 md:px-6 transition-all">
            {/* Mobile Sidebar Trigger */}
            <div className="md:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="shrink-0">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle navigation menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="flex flex-col w-64 p-0">
                        <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>
                        <div className="flex h-16 items-center border-b px-6">
                            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
                                <Activity className="h-6 w-6" />
                                <span>SentinelTrade</span>
                            </Link>
                        </div>
                        <div className="flex-1 overflow-y-auto py-4">
                            <nav className="grid gap-1 px-2">
                                {navigation.map((item) => {
                                    const isActive = pathname === item.href
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${isActive ? "bg-accent/50 text-accent-foreground" : "text-muted-foreground"}`}
                                        >
                                            <item.icon className="h-4 w-4" />
                                            {item.name}
                                        </Link>
                                    )
                                })}
                            </nav>
                        </div>
                        <div className="p-4 border-t text-xs text-muted-foreground">
                            <p>SentinelTrade Mobile v1.0</p>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

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

            <div className="flex items-center gap-2 md:gap-4 shrink-0">
                <div className="flex items-center gap-2 text-sm">
                    <div className={`h-2 w-2 rounded-full animate-pulse ${isMarketOpen ? 'bg-secondary' : 'bg-yellow-500'}`} />
                    <span className="text-muted-foreground hidden sm:inline">{isMarketOpen ? 'Market Open' : 'Market Closed'}</span>
                </div>

                <div className="h-4 w-px bg-border text-muted-foreground/20" />

                <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{time} <span className="hidden sm:inline">WIB</span></span>
                </div>
            </div>
        </header>
    )
}
