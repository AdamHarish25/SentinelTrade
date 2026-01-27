import { EODHDResponse } from "./types";

export const MOCK_TICKERS = ["BBCA", "BMRI", "BBRI", "TLKM", "ADRO", "GOTO", "UNVR", "ASII"];

// Helper to generate 30 days of mock history
const generateMockHistory = (basePrice: number, volatility: number, isAccumulation: boolean): EODHDResponse[] => {
    const history: EODHDResponse[] = [];
    let currentPrice = basePrice;
    const now = new Date();

    for (let i = 0; i < 30; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        // Random change
        const change = (Math.random() - 0.5) * volatility;
        const open = currentPrice;
        const close = currentPrice * (1 + change);
        const high = Math.max(open, close) * (1 + Math.random() * 0.01);
        const low = Math.min(open, close) * (1 - Math.random() * 0.01);

        // Volume logic
        let volume = Math.floor(Math.random() * 100000) + 50000;

        // Simulate Accumulation on recent days (index 0, 1, 2)
        if (isAccumulation && i < 5) {
            // Low price movement, High volume
            if (Math.abs(change) < 0.01) {
                volume = volume * 2.5; // Spike
            }
        }

        history.push({
            date: date.toISOString().split('T')[0],
            open,
            high,
            low,
            close,
            adjusted_close: close,
            volume
        });

        currentPrice = open; // Go backwards roughly
    }
    return history;
};

// Updated with REAL 2025/2026 Price Ranges for IDR Stocks to avoid confusion
export const MOCK_DATA_STORE: Record<string, EODHDResponse[]> = {
    "BBCA.JK": generateMockHistory(7550, 0.01, true),   // Adjusted post-split price
    "BMRI.JK": generateMockHistory(6500, 0.015, false),
    "BBRI.JK": generateMockHistory(5650, 0.02, false),
    "TLKM.JK": generateMockHistory(3200, 0.01, true),
    "ADRO.JK": generateMockHistory(2350, 0.03, false),
    "GOTO.JK": generateMockHistory(68, 0.05, true),
    "UNVR.JK": generateMockHistory(2900, 0.01, false),
    "ASII.JK": generateMockHistory(5100, 0.015, true)
};
