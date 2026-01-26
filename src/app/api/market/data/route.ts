import { NextResponse } from "next/server";
import { type EODHDResponse, type MarketData, type WatchlistItem } from "@/lib/types";
import { MOCK_DATA_STORE } from "@/lib/mock-data";

const TICKERS = ["BBCA.JK", "BMRI.JK", "BBRI.JK", "TLKM.JK", "ADRO.JK", "GOTO.JK", "UNVR.JK", "ASII.JK"];

function getApiToken() {
    const token = process.env.EODHD_API_TOKEN;
    if (token) return token;

    const apiString = process.env.EODHD_API;
    if (apiString && apiString.includes("api_token=")) {
        try {
            const url = new URL(apiString);
            return url.searchParams.get("api_token");
        } catch {
            return apiString;
        }
    }
    return "demo"; // Default to demo if nothing found
}

async function fetchTickerData(ticker: string, token: string): Promise<EODHDResponse[] | null> {
    const shouldUseMock = process.env.USE_MOCK_DATA === 'true' || token === 'demo' || token === 'undefined';

    // Check for explicit mock data usage or if using demo key for non-US stocks (EODHD demo limit)
    if (shouldUseMock) {
        console.log(`Using Mock Data for ${ticker}`);
        return MOCK_DATA_STORE[ticker] || null;
    }

    const url = `https://eodhd.com/api/eod/${ticker}?api_token=${token}&fmt=json&order=d&limit=30`;

    try {
        const res = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour
        if (!res.ok) {
            console.warn(`API Fetch Failed for ${ticker} (${res.status}). Falling back to mock.`);
            return MOCK_DATA_STORE[ticker] || null;
        }
        const data = await res.json();
        if (!Array.isArray(data)) {
            return MOCK_DATA_STORE[ticker] || null;
        }
        return data;
    } catch (error) {
        console.error(`Error fetching ${ticker}`, error);
        return MOCK_DATA_STORE[ticker] || null;
    }
}

export async function GET() {
    const token = getApiToken();
    if (!token) {
        return NextResponse.json({ error: "API Token missing" }, { status: 500 });
    }

    const results: WatchlistItem[] = [];

    await Promise.all(
        TICKERS.map(async (ticker) => {
            const history = await fetchTickerData(ticker, token);

            if (!history || history.length < 21) {
                // Fallback or skip
                return;
            }

            // history[0] is the latest (because order=d means descending dates? 
            // Wait, EODHD default is ascending. 
            // Adding &order=d makes index 0 the latest.

            const latest = history[0];
            const prev = history[1];

            // Calculate MA(20) of Volume (excluding today/latest to check if today spiked)
            // Or include today? Usually compare Today Volume vs Avg(20).
            // We'll take slice(1, 21) for previous 20 days.
            const last20 = history.slice(1, 21);
            const avgVolume = last20.reduce((acc, d) => acc + d.volume, 0) / last20.length;

            // Smart Money Logic: Volume > 2.5 * AvgVolume AND Green Candle (Close > Open)
            const isVolumeSpike = latest.volume > 2.5 * avgVolume;
            const isBullish = latest.close > latest.open;
            const isInflow = isVolumeSpike && isBullish;

            // Also check Distribution: High Volume + Red Candle
            const isBearish = latest.close < latest.open;
            const isOutflow = isVolumeSpike && isBearish;

            let flow: "Inflow" | "Outflow" | "Neutral" = "Neutral";
            if (isInflow) flow = "Inflow";
            if (isOutflow) flow = "Outflow";

            const change = latest.close - prev.close;
            const changePercent = (change / prev.close) * 100;

            // --- Stealth Scanner Logic (Price-Volume Only) ---

            // 1. RVOL Stability (Proxy for Institutional Accumulation)
            // Calc RVOL for last 3 days
            const recentVols = history.slice(0, 3).map(d => d.volume);
            const avgRecentVol = recentVols.reduce((a, b) => a + b, 0) / 3;
            // MA20 is based on last 20 days EXCLUDING today usually, but here we used slice(1, 21)
            const rvol = avgRecentVol / avgVolume;

            // 2. Price Compression (High - Low) / Close
            // If range is small but volume is decent, absorption is happening.
            const dailyRange = (latest.high - latest.low) / latest.close;
            let priceCompressionScore = 0;
            if (dailyRange < 0.015) priceCompressionScore = 100; // < 1.5% range
            else if (dailyRange < 0.03) priceCompressionScore = 50;

            // 3. OBV Trend (Approximation)
            // Check if last 3 days had more Up Volume than Down Volume
            let upVol = 0;
            let downVol = 0;
            history.slice(0, 5).forEach((day, i, arr) => {
                if (i === arr.length - 1) return;
                const prevDay = arr[i + 1];
                if (day.close > prevDay.close) upVol += day.volume;
                else if (day.close < prevDay.close) downVol += day.volume;
            });
            const obvTrend = upVol > downVol * 1.5 ? "Up" : downVol > upVol * 1.5 ? "Down" : "Flat";

            // 4. VSA Logic: Narrow Spread + High Volume = Absorption
            const isAbsorption = rvol > 1.2 && dailyRange < 0.02 && changePercent > -1 && changePercent < 1;

            // Final Accumulation Quality Score
            let accumulationScore = 50;
            if (rvol > 1.2 && rvol < 2.5) accumulationScore += 20; // Consistent, not spike
            if (priceCompressionScore > 80) accumulationScore += 20;
            if (obvTrend === "Up") accumulationScore += 20;
            if (isAbsorption) accumulationScore += 15;
            if (changePercent > 0) accumulationScore += 5;

            // Penalties
            if (changePercent < -2) accumulationScore -= 30; // Drop
            if (rvol > 4.0) accumulationScore -= 10; // Too loud (selling climax?)

            accumulationScore = Math.min(100, Math.max(0, Math.floor(accumulationScore)));
            const isStealth = accumulationScore > 75;

            results.push({
                symbol: ticker.replace(".JK", ""),
                price: latest.close,
                change,
                changePercent,
                volume: latest.volume,
                avgVolume,
                flow,
                accumulationQuality: accumulationScore,
                isStealth,
                volumeFlowAnalysis: {
                    rvol: parseFloat(rvol.toFixed(2)),
                    priceCompressionScore,
                    obvTrend,
                    isAbsorption
                }
            });
        })
    );

    // Sorting: Inflow first, then most positive change
    results.sort((a, b) => b.changePercent - a.changePercent);

    // Calculate Market Metadata
    const accumulationCount = results.filter(r => r.flow === "Inflow").length;
    const distributionCount = results.filter(r => r.flow === "Outflow").length;
    const neutralCount = results.length - accumulationCount - distributionCount;

    // Market Sentiment Score (Simple Algo)
    // Base 50. Add points for Inflow/Uptrend. Subtract for Outflow.
    let sentiment = 50;
    results.forEach(r => {
        if (r.changePercent > 1) sentiment += 10;
        else if (r.changePercent > 0) sentiment += 5;
        else if (r.changePercent < -1) sentiment -= 10;
        else if (r.changePercent < 0) sentiment -= 5;

        if (r.flow === "Inflow") sentiment += 5;
        if (r.flow === "Outflow") sentiment -= 5;
    });
    // Clamp 0-100
    sentiment = Math.max(0, Math.min(100, sentiment));

    // Check Market Open Time (WIB)
    // UTC+7
    const now = new Date();
    const wibTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
    const wibHour = wibTime.getHours();
    const wibDay = wibTime.getDay(); // 0 is Sun, 6 is Sat

    const isWeekend = wibDay === 0 || wibDay === 6;
    const isWorkHours = wibHour >= 9 && wibHour < 16;
    const isMarketOpen = !isWeekend && isWorkHours;

    const responseData: MarketData = {
        watchlist: results,
        marketSentiment: sentiment,
        smartMoneyFlow: {
            accumulation: accumulationCount,
            distribution: distributionCount,
            neutral: neutralCount
        },
        lastUpdated: new Date().toISOString(),
        isMarketOpen
    };

    return NextResponse.json(responseData);
}
