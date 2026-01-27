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
