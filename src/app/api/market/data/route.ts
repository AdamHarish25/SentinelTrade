import { NextResponse } from "next/server";
import { type MarketData } from "@/lib/types";
import { scanIndex } from "@/lib/market-service";
import { FundamentalService, DEFAULT_QUALITY_FILTER } from "@/lib/fundamental-service";

// Cache for 60 minutes (3600 seconds)
export const revalidate = 3600;

export async function GET() {
    // 1. Get Metrics (Total Universe vs Quality Universe)
    const metrics = FundamentalService.getMetrics();

    // 2. Get Quality Index (Anti-Gorengan Filter)
    const qualityTickers = FundamentalService.getTickers(DEFAULT_QUALITY_FILTER);

    // 3. Scan the Technicals (Yahoo Finance)
    const technicalResults = await scanIndex(qualityTickers);

    // 4. Merge Fundamental Metadata
    const allFundamentals = FundamentalService.getAllData();
    const results = technicalResults.map(item => {
        const meta = allFundamentals.find(f => f.symbol === item.symbol || f.symbol.startsWith(item.symbol));
        return {
            ...item,
            fundamental: meta ? {
                sector: meta.sector,
                conglomerate: meta.conglomerate,
                marketCapT: meta.marketCap / 1_000_000_000_000
            } : undefined
        };
    });

    // 5. Calculate Market Metadata
    const accumulationCount = results.filter(r => r.flow === "Inflow").length;
    const distributionCount = results.filter(r => r.flow === "Outflow").length;
    const neutralCount = results.length - accumulationCount - distributionCount;

    // 6. Market Sentiment Score
    let sentiment = 50;
    results.forEach(r => {
        if (r.changePercent > 1) sentiment += 2;
        else if (r.changePercent > 0) sentiment += 1;
        else if (r.changePercent < -1) sentiment -= 2;
        else if (r.changePercent < 0) sentiment -= 1;

        if (r.flow === "Inflow") sentiment += 1;
    });
    sentiment = Math.max(0, Math.min(100, sentiment));

    // 7. Check Market Open Time (WIB)
    const now = new Date();
    // Use Intl to get correct Jakarta time values
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
    let isMarketOpen = false;

    // Sat/Sun Closed
    if (weekday !== "Sat" && weekday !== "Sun") {
        if (weekday === "Fri") {
            // Friday: 09:00-11:30 & 14:00-16:00
            const session1 = currentTime >= 9 * 60 && currentTime < 11 * 60 + 30;
            const session2 = currentTime >= 14 * 60 && currentTime < 16 * 60;
            isMarketOpen = session1 || session2;
        } else {
            // Mon-Thu: 09:00-12:00 & 13:30-16:00
            const session1 = currentTime >= 9 * 60 && currentTime < 12 * 60;
            const session2 = currentTime >= 13 * 60 + 30 && currentTime < 16 * 60;
            isMarketOpen = session1 || session2;
        }
    }

    // EXTENDED RESPONSE with Audit Trail
    const responseData = {
        watchlist: results,
        marketSentiment: sentiment,
        smartMoneyFlow: {
            accumulation: accumulationCount,
            distribution: distributionCount,
            neutral: neutralCount
        },
        auditTrail: {
            scannedUniverse: metrics.total,
            qualityPassed: metrics.passed,
            stealthFound: accumulationCount
        },
        lastUpdated: new Date().toISOString(),
        isMarketOpen
    } as any; // Cast to avoid strict type error since we added auditTrail temporarily

    return NextResponse.json(responseData);
}
