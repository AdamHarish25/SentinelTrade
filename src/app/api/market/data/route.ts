import { NextResponse } from "next/server";
import { type EODHDResponse, type MarketData, type WatchlistItem } from "@/lib/types";

const TICKERS = ["BBCA.JK", "BMRI.JK", "BBRI.JK", "TLKM.JK", "ADRO.JK"];

function getApiToken() {
    const token = process.env.EODHD_API_TOKEN;
    if (token) return token;

    const apiString = process.env.EODHD_API;
    if (apiString && apiString.includes("api_token=")) {
        try {
            const url = new URL(apiString);
            return url.searchParams.get("api_token");
        } catch {
            // If not a valid URL, maybe it's just the key?
            return apiString;
        }
    }
    return "demo";
}

async function fetchTickerData(ticker: string, token: string): Promise<EODHDResponse[] | null> {
    // Use demo URL if token is demo and ticker is foreign, but for JK we need real token.
    // We'll try to fetch.
    // API: https://eodhd.com/api/eod/{TEST}.US?api_token={TOKEN}&fmt=json
    const url = `https://eodhd.com/api/eod/${ticker}?api_token=${token}&fmt=json&order=d&limit=30`;

    try {
        const res = await fetch(url, { next: { revalidate: 300 } }); // Cache for 5 mins
        if (!res.ok) {
            console.error(`Failed to fetch ${ticker}: ${res.statusText}`);
            return null;
        }
        const data = await res.json();
        return Array.isArray(data) ? data : null;
    } catch (error) {
        console.error(`Error fetching ${ticker}`, error);
        return null;
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

            // --- Silent Accumulation Detector Logic ---
            let accumulationScore = 50; // Base Score

            // 1. Volume Factor (Weight: 30%)
            const volRatio = latest.volume / avgVolume;
            if (volRatio > 2.5) accumulationScore += 30;
            else if (volRatio > 1.5) accumulationScore += 15;
            else if (volRatio < 0.5) accumulationScore -= 10;

            // 2. Silence Factor (Price-Volume Divergence) (Weight: 30%)
            // Penalty for loud moves (>2%), Bonus for sideways (0-1.5%)
            const absChange = Math.abs(changePercent);
            if (absChange < 0.5) accumulationScore += 20; // Very Silent
            else if (absChange < 1.5) accumulationScore += 10; // Silent
            else if (absChange > 3.0) accumulationScore -= 10; // Too loud/volatile due to retail FOMO?

            // 3. Trend Factor (Weight: 20%)
            // If close > prev close, it's net buying usually.
            if (changePercent > 0) accumulationScore += 10;

            // 4. Institutional Factor (Avg Tx Value) (Simulated Weight: 20%)
            // We simulate this as "Block Trade" probability if Volume is high but price didn't crash.
            if (latest.volume > avgVolume && changePercent > -1) accumulationScore += 10;

            // Clamp
            accumulationScore = Math.min(100, Math.max(0, accumulationScore));

            const isStealth = accumulationScore > 75 && absChange < 1.5;

            // Mock Broker Summary (Simulating Top 3 Concentration)
            // If score is high, assumed high concentration.
            let top3Pct = 30 + (accumulationScore / 2); // Map score 0-100 to 30-80%
            // Random jitter
            top3Pct += (Math.random() * 10) - 5;
            top3Pct = Math.min(95, Math.max(20, Math.floor(top3Pct)));

            const retailPct = 100 - top3Pct;

            const possibleBuyers = ["YP", "CC", "PD", "AK", "BK", "CS", "KZ"];
            // Shuffle
            const topBuyers = possibleBuyers.sort(() => 0.5 - Math.random()).slice(0, 3);

            results.push({
                symbol: ticker.replace(".JK", ""),
                price: latest.close,
                change,
                changePercent,
                volume: latest.volume,
                avgVolume,
                flow,
                accumulationQuality: Math.floor(accumulationScore),
                isStealth,
                brokerSummary: {
                    top3Percentage: top3Pct,
                    retailPercentage: retailPct,
                    avgTxValue: Math.floor(latest.volume / 1200), // Mock avg size
                    topBuyers
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
