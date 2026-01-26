"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    ScanLine,
    FlaskConical,
    List,
    ScrollText,
    Activity
} from "lucide-react"

import { cn } from "@/lib/utils"

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Smart Money", href: "/dashboard/scanner", icon: ScanLine },
    { name: "Fundamental Lab", href: "/dashboard/fundamental", icon: FlaskConical },
    { name: "Watchlist", href: "/dashboard/watchlist", icon: List },
    { name: "System Logs", href: "/dashboard/logs", icon: ScrollText },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="flex h-full w-64 flex-col border-r bg-card/50">
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
                                className={cn(
                                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                                    isActive ? "bg-accent/50 text-accent-foreground" : "text-muted-foreground"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>
            <div className="p-4 border-t text-xs text-muted-foreground">
                <p>SentinelTrade v1.0</p>
                <p>Connected: IDX (15ms)</p>
            </div>
        </div>
    )
}
