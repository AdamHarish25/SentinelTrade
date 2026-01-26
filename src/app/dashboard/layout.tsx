import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { MarketDataProvider } from "@/components/providers/market-data-provider"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <MarketDataProvider>
            <div className="flex h-screen overflow-hidden bg-background font-sans text-foreground">
                <Sidebar />
                <div className="flex flex-col flex-1 overflow-hidden">
                    <Header />
                    <main className="flex-1 overflow-y-auto p-6">
                        {children}
                    </main>
                </div>
            </div>
        </MarketDataProvider>
    )
}
