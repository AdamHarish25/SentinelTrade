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
