export interface EODHDResponse {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    adjusted_close: number;
    volume: number;
}

export interface WatchlistItem {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    avgVolume: number;
    flow: "Inflow" | "Outflow" | "Neutral";
    accumulationQuality: number; // Stealth Score (0-100)
    isStealth: boolean;
    isMock?: boolean;
    volumeFlowAnalysis: {
        rvol: number;
        priceCompressionScore: number;
        obvTrend: "Up" | "Down" | "Flat";
        isAbsorption: boolean;
    };
    stealthBreakdown?: {
        coreSignalPoints: number;
        obvPoints: number;
        compressionPoints: number;
        penalty: number;
    };
    // NEW: Fundamental Context for Filtering
    fundamental?: {
        sector: string;
        conglomerate?: string;
        marketCapT: number; // Trillions
    };
}

export interface MarketData {
    watchlist: WatchlistItem[];
    marketSentiment: number; // 0-100
    smartMoneyFlow: {
        accumulation: number;
        distribution: number;
        neutral: number;
    };
    lastUpdated: string;
    isMarketOpen: boolean;
}

// ----------------------------------------------------------------------
// MARKET SCHEDULE LOGIC (Centralized)
// ----------------------------------------------------------------------

export function isMarketOpenNow(now: Date = new Date()): boolean {
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

    return isOpen;
}
