import Link from "next/link"
import { ArrowRight, Activity, ShieldCheck, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-deep-navy text-foreground overflow-x-hidden selection:bg-pelorous-blue selection:text-deep-navy">
      {/* Background Grid */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
      </div>

      <header className="relative z-10 flex h-20 items-center justify-between px-6 lg:px-12 border-b border-border/10 bg-deep-navy/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-pelorous-blue" />
          <span className="font-bold text-xl tracking-tight">SentinelTrade</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">Launch Terminal</Link>
          </Button>
        </div>
      </header>

      <main className="relative z-10 flex flex-col items-center justify-center pt-32 pb-20 text-center px-4">
        <div className="inline-flex items-center rounded-full border border-pelorous-blue/30 bg-pelorous-blue/10 px-3 py-1 text-sm font-medium text-pelorous-blue mb-8 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="flex h-2 w-2 rounded-full bg-pelorous-blue mr-2 animate-pulse"></span>
          v1.0 Now Live on IDX
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 animate-in fade-in slide-in-from-bottom-6 duration-1000 fill-mode-backwards">
          Decode the <span className="text-pelorous-blue">Smart Money</span> Flow
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 fill-mode-backwards">
          Advanced institutional accumulation scanner for the Indonesia Stock Exchange.
          Stop gambling. Start analyzing with institutional-grade data.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300 fill-mode-backwards">
          <Button size="lg" className="h-12 px-8 text-base bg-pelorous-blue hover:bg-pelorous-blue/90 text-deep-navy font-bold" asChild>
            <Link href="/dashboard">
              Start Analysis <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-12 px-8 text-base border-border/50 hover:bg-white/5">
            View Methodology
          </Button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 max-w-6xl w-full px-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500 fill-mode-backwards">
          <div className="flex flex-col items-start p-6 rounded-2xl border border-border/30 bg-card/10 backdrop-blur-sm hover:border-pelorous-blue/50 transition-colors group">
            <div className="h-12 w-12 rounded-lg bg-pelorous-blue/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Zap className="h-6 w-6 text-pelorous-blue" />
            </div>
            <h3 className="text-xl font-bold mb-2">Volume Spikes</h3>
            <p className="text-muted-foreground text-left">Detect unusual volume activity before price checks out. Our algorithms filter noise from signal.</p>
          </div>

          <div className="flex flex-col items-start p-6 rounded-2xl border border-border/30 bg-card/10 backdrop-blur-sm hover:border-success-green/50 transition-colors group">
            <div className="h-12 w-12 rounded-lg bg-success-green/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-6 w-6 text-success-green" />
            </div>
            <h3 className="text-xl font-bold mb-2">Fundamental Safety</h3>
            <p className="text-muted-foreground text-left">Automated safety ratings based on ROE, DER, and Cash Flow. Never get trapped in garbage stocks.</p>
          </div>

          <div className="flex flex-col items-start p-6 rounded-2xl border border-border/30 bg-card/10 backdrop-blur-sm hover:border-purple-500/50 transition-colors group">
            <div className="h-12 w-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Activity className="h-6 w-6 text-purple-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Bandarmology 2.0</h3>
            <p className="text-muted-foreground text-left">Track the "Big Player" movements with our proprietary accumulation scoring system.</p>
          </div>
        </div>
      </main>

      <footer className="relative z-10 py-10 border-t border-border/10 text-center text-sm text-muted-foreground">
        <p>&copy; 2026 SentinelTrade. Data provided by IDX (Delayed 15m).</p>
      </footer>
    </div>
  )
}
