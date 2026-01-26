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

            results.push({
                symbol: ticker.replace(".JK", ""),
                price: latest.close,
                change,
                changePercent,
                volume: latest.volume,
                avgVolume,
                flow
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
