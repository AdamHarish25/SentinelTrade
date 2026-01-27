import { EODHDResponse } from "./types";
import { MOCK_DATA_STORE } from "./mock-data";

// Helper to simulate rate limit storage
const RATE_LIMIT_KEY = "alpha_vantage_requests_today";

// Helper Interface to return Data + Source Metadata
export interface MarketServiceResponse {
    data: EODHDResponse[];
    source: "API" | "Mock";
}

// Alpha Vantage Types
interface AVTimeSeriesDaily {
    "Meta Data": any;
    "Time Series (Daily)": {
        [key: string]: {
            "1. open": string;
            "2. high": string;
            "3. low": string;
            "4. close": string;
            "5. volume": string;
        }
    };
    "Error Message"?: string;
    "Information"?: string;
}

/* 
 * Hybrid Data Toggle Logic
 */
export async function getMarketData(ticker: string): Promise<MarketServiceResponse> {
    const useMock = process.env.USE_MOCK_DATA === "true";
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY || "demo";

    if (useMock) {
        console.log(`[MarketService] Mock Data enabled for ${ticker}`);
        return { data: getMockData(ticker), source: "Mock" };
    }

    // Live Fetch
    try {
        // We prioritize TIME_SERIES_DAILY to get historical volume for logic
        // Using outputsize=compact (last 100 data points) to save data
        const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&apikey=${apiKey}&outputsize=compact`;

        // Server-side caching: next: { revalidate: 3600 }
        const res = await fetch(url, { next: { revalidate: 3600 } });

        if (!res.ok) {
            throw new Error(`Alpha Vantage Error: ${res.statusText}`);
        }

        const data = await res.json() as AVTimeSeriesDaily;

        if (data["Error Message"] || data["Information"]) {
            // "Information" usually means rate limit hits
            console.warn(`[MarketService] API Limit/Error for ${ticker}:`, data["Error Message"] || data["Information"]);
            return { data: getMockData(ticker), source: "Mock" }; // Fallback to mock
        }

        if (!data["Time Series (Daily)"]) {
            return { data: getMockData(ticker), source: "Mock" }; // Fallback
        }

        // Transform AV data to our common format (EODHDResponse-like)
        const timeSeries = data["Time Series (Daily)"];
        const dates = Object.keys(timeSeries).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

        const mappedData: EODHDResponse[] = dates.map(date => {
            const dp = timeSeries[date];
            return {
                date: date,
                open: parseFloat(dp["1. open"]),
                high: parseFloat(dp["2. high"]),
                low: parseFloat(dp["3. low"]),
                close: parseFloat(dp["4. close"]),
                adjusted_close: parseFloat(dp["4. close"]),
                volume: parseInt(dp["5. volume"])
            };
        });

        return { data: mappedData, source: "API" };

    } catch (err) {
        console.error(`[MarketService] Exception fetching ${ticker}:`, err);
        return { data: getMockData(ticker), source: "Mock" };
    }
}

function getMockData(ticker: string): EODHDResponse[] {
    // Remove suffix if mismatch (MOCK_STORE uses BBCA.JK or BBCA)
    const baseTicker = ticker.replace(".JK", "").replace(".US", "");

    // Try exact match first
    if (MOCK_DATA_STORE[ticker]) return MOCK_DATA_STORE[ticker];

    // Try base + .JK
    if (MOCK_DATA_STORE[`${baseTicker}.JK`]) return MOCK_DATA_STORE[`${baseTicker}.JK`];

    // Fallback to random generation logic from current mock-data if needed
    return MOCK_DATA_STORE["BBCA.JK"] || [];
}
