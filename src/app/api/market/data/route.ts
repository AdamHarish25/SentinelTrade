import { NextResponse } from "next/server";
import { type MarketData, type WatchlistItem } from "@/lib/types";
import { getMarketData } from "@/lib/market-service";

const TICKERS = ["BBCA.JK", "BMRI.JK", "BBRI.JK", "TLKM.JK", "ADRO.JK", "GOTO.JK", "UNVR.JK", "ASII.JK"];

export async function GET() {
    const results: WatchlistItem[] = [];

    await Promise.all(
        TICKERS.map(async (ticker) => {
            const { data: history, source } = await getMarketData(ticker);

            if (!history || history.length < 21) {
                // Fallback or skip if insufficient data
                return;
            }

            const latest = history[0];
            const prev = history[1];

            // Calculate MA(20) of Volume
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
            const recentVols = history.slice(0, 3).map(d => d.volume);
            const avgRecentVol = recentVols.reduce((a, b) => a + b, 0) / 3;
            // Use avgVolume (20d) as baseline
            const rvol = avgRecentVol / avgVolume;

            // 2. Price Compression (High - Low) / Close
            const dailyRange = (latest.high - latest.low) / latest.close;
            let priceCompressionScore = 0;
            if (dailyRange < 0.015) priceCompressionScore = 100; // < 1.5% range
            else if (dailyRange < 0.03) priceCompressionScore = 50;

            // 3. OBV Trend (Approximation)
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
                symbol: ticker.split(".")[0], // Strip .JK for display
                price: latest.close,
                change,
                changePercent,
                volume: latest.volume,
                avgVolume,
                flow,
                accumulationQuality: accumulationScore,
                isStealth,
                isMock: source === "Mock",
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
    let sentiment = 50;
    results.forEach(r => {
        if (r.changePercent > 1) sentiment += 10;
        else if (r.changePercent > 0) sentiment += 5;
        else if (r.changePercent < -1) sentiment -= 10;
        else if (r.changePercent < 0) sentiment -= 5;

        if (r.flow === "Inflow") sentiment += 5;
        if (r.flow === "Outflow") sentiment -= 5;
    });
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
