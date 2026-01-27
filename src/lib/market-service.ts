import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance();
import { EODHDResponse, WatchlistItem } from "./types";
import { MOCK_DATA_STORE } from "./mock-data";

// Helper Interface to return Data + Source Metadata
export interface MarketServiceResponse {
    data: EODHDResponse[];
    source: "API" | "Mock";
}

// ----------------------------------------------------------------------
// CORE DATA FETCHING
// ----------------------------------------------------------------------

export async function getMarketData(ticker: string): Promise<MarketServiceResponse> {
    const useMock = process.env.USE_MOCK_DATA === "true";

    if (useMock) {
        console.log(`[MarketService] Mock Data enabled for ${ticker}`);
        return { data: getMockData(ticker), source: "Mock" };
    }

    try {
        // Calculate date range: Last 45 days to ensure we get >30 trading days
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 45);

        const result: any = await yahooFinance.historical(ticker, {
            period1: startDate,
            period2: endDate,
            interval: '1d'
        });

        if (!result || result.length === 0) {
            console.warn(`[MarketService] No data returned for ${ticker}`);
            return { data: getMockData(ticker), source: "Mock" };
        }

        const mappedData: EODHDResponse[] = result
            .filter((quote: any) => quote.close !== null && quote.close !== undefined && quote.volume !== null)
            .map((quote: any) => ({
                date: quote.date.toISOString().split('T')[0],
                open: quote.open || quote.close,
                high: quote.high || quote.close,
                low: quote.low || quote.close,
                close: quote.close,
                adjusted_close: quote.adjClose || quote.close,
                volume: Math.round((quote.volume || 0) / 100) // Convert to Lots
            }))
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return { data: mappedData, source: "API" };

    } catch (err) {
        console.error(`[MarketService] Yahoo Finance Error for ${ticker}:`, err);
        return { data: getMockData(ticker), source: "Mock" };
    }
}

function getMockData(ticker: string): EODHDResponse[] {
    const baseTicker = ticker.replace(".JK", "").replace(".US", "");
    if (MOCK_DATA_STORE[ticker]) return MOCK_DATA_STORE[ticker];
    if (MOCK_DATA_STORE[`${baseTicker}.JK`]) return MOCK_DATA_STORE[`${baseTicker}.JK`];
    return MOCK_DATA_STORE["BBCA.JK"] || [];
}

// ----------------------------------------------------------------------
// STEALTH SCANNER BRAIN
// ----------------------------------------------------------------------

export function analyzeTicker(ticker: string, history: EODHDResponse[], isMock: boolean): WatchlistItem | null {
    if (!history || history.length < 21) return null;

    const latest = history[0];
    const prev = history[1];

    // 1. Core Metrics
    const last20 = history.slice(1, 21);
    const avgVolume = last20.reduce((acc, d) => acc + d.volume, 0) / last20.length;

    // Core Signal: High Vol + Low Price Movement
    const change = latest.close - prev.close;
    const changePercent = (change / prev.close) * 100;
    const absChange = Math.abs(changePercent);
    const isVolumeSpike = latest.volume > 2.5 * avgVolume;

    // 2. Flow Detection
    const isBullish = latest.close > latest.open;
    const isBearish = latest.close < latest.open;
    const isInflow = isVolumeSpike && isBullish;
    const isOutflow = isVolumeSpike && isBearish;

    let flow: "Inflow" | "Outflow" | "Neutral" = "Neutral";
    if (isInflow) flow = "Inflow";
    if (isOutflow) flow = "Outflow";

    // 3. Stealth Logic

    // RVOL
    const recentVols = history.slice(0, 3).map(d => d.volume);
    const avgRecentVol = recentVols.reduce((a, b) => a + b, 0) / 3;
    const rvol = avgRecentVol / avgVolume;

    // OBV Momentum (Last 5 days)
    let upVol = 0;
    let downVol = 0;
    history.slice(0, 5).forEach((day, i, arr) => {
        if (i === arr.length - 1) return;
        const prevDay = arr[i + 1];
        if (day.close > prevDay.close) upVol += day.volume;
        else if (day.close < prevDay.close) downVol += day.volume;
    });
    const obvTrend = upVol > downVol * 1.5 ? "Up" : downVol > upVol * 1.5 ? "Down" : "Flat";

    // Price Compression
    const dailyRange = (latest.high - latest.low) / latest.close;
    let priceCompressionScore = 0;
    if (dailyRange < 0.015) priceCompressionScore = 100;
    else if (dailyRange < 0.03) priceCompressionScore = 50;

    // SCORING ENGINE (New Logic)
    let baseScore = 0;
    let obvPoints = 0;
    let compressionPoints = 0;
    let penalty = 0;

    const isCoreAbsorption = (latest.volume > 2.5 * avgVolume) && (absChange < 1.5);

    if (isCoreAbsorption) {
        baseScore = 80;
    } else {
        // Fallback for non-core but accumulating
        if (rvol > 1.2 && flow !== "Outflow") baseScore += 40;
        if (changePercent > 0) baseScore += 10;
    }

    // OBV Momentum
    if (obvTrend === "Up") obvPoints += 15;

    // Price Compression
    if (priceCompressionScore > 80) compressionPoints += 15;

    // Penalties
    if (changePercent < -2) penalty += 30; // Drop bad
    if (rvol > 5.0) penalty += 10; // Extreme climax maybe distribution

    let finalScore = baseScore + obvPoints + compressionPoints - penalty;
    finalScore = Math.min(100, Math.max(0, Math.floor(finalScore)));

    const isStealth = finalScore >= 75;

    return {
        symbol: ticker.split(".")[0],
        price: latest.close,
        change,
        changePercent,
        volume: latest.volume,
        avgVolume,
        flow,
        accumulationQuality: finalScore,
        isStealth,
        isMock,
        volumeFlowAnalysis: {
            rvol: parseFloat(rvol.toFixed(2)),
            priceCompressionScore,
            obvTrend,
            isAbsorption: isCoreAbsorption
        },
        stealthBreakdown: {
            coreSignalPoints: baseScore,
            obvPoints,
            compressionPoints,
            penalty
        }
    };
} // END analyzeTicker

// ----------------------------------------------------------------------
// BATCH PROCESSING
// ----------------------------------------------------------------------

export async function scanIndex(tickers: string[]): Promise<WatchlistItem[]> {
    const results: WatchlistItem[] = [];
    const BATCH_SIZE = 5; // Concurrency limit

    // Helper to process a chunk
    const processBatch = async (batch: string[]) => {
        const promises = batch.map(async (ticker) => {
            try {
                const { data: history, source } = await getMarketData(ticker);
                const analysis = analyzeTicker(ticker, history, source === "Mock");
                if (analysis) results.push(analysis);
            } catch (e) {
                console.error(`Failed to scan ${ticker}`, e);
            }
        });
        await Promise.all(promises);
    };

    // Loop through chunks
    for (let i = 0; i < tickers.length; i += BATCH_SIZE) {
        const batch = tickers.slice(i, i + BATCH_SIZE);
        await processBatch(batch);
        // Optional: slight delay to be nice to Yahoo?
        // await new Promise(r => setTimeout(r, 100)); 
    }

    // Sort: Stealth (Score) Descending
    return results.sort((a, b) => b.accumulationQuality - a.accumulationQuality);
}
