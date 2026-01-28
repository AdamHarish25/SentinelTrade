
import fs from 'fs';
import path from 'path';
import YahooFinance from 'yahoo-finance2';
import { fileURLToPath } from 'url';

const yahooFinance = new YahooFinance();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Correct path relative to this script (scripts/update-financials.mjs -> ../src/data/)
const dataPath = path.resolve(__dirname, '../src/data/financial_ratio.json');

if (!fs.existsSync(dataPath)) {
    console.error("Could not find data file at:", dataPath);
    process.exit(1);
}

const rawData = fs.readFileSync(dataPath, 'utf-8');
let companies = JSON.parse(rawData);

async function update() {
    console.log(`Starting update for ${companies.length} companies...`);

    const updatedStats = { success: 0, failed: 0 };
    const updatedData = [];

    // Process sequentially to be gentle on rate limits
    for (let i = 0; i < companies.length; i++) {
        const comp = companies[i];
        const symbol = `${comp.KodeEmiten}.JK`;

        process.stdout.write(`[${i + 1}/${companies.length}] Fetching ${symbol}... `);

        try {
            // Fetch modules
            const quote = await yahooFinance.quoteSummary(symbol, {
                modules: ['financialData', 'summaryDetail', 'defaultKeyStatistics']
            });

            const fin = quote.financialData || {};
            const sum = quote.summaryDetail || {};

            // 1. DER (Debt to Equity Ratio)
            // Yahoo returns 'debtToEquity' as a percentage (e.g., 20.5 for 20.5%).
            // Our JSON uses a ratio (e.g., 0.205).
            // Transformation: / 100
            let der = comp.der;
            if (fin.debtToEquity !== undefined && fin.debtToEquity !== null) {
                der = parseFloat((fin.debtToEquity / 100).toFixed(2));
            }

            // 2. ROE (Return on Equity)
            // Yahoo returns 'returnOnEquity' as a decimal (e.g., 0.22 for 22%).
            // Our JSON uses percentage (e.g., 22.0).
            // Transformation: * 100
            let roe = comp.roe;
            if (fin.returnOnEquity !== undefined && fin.returnOnEquity !== null) {
                roe = parseFloat((fin.returnOnEquity * 100).toFixed(2));
            }

            // 3. PER (Price to Earnings)
            // Yahoo returns 'trailingPE' or computed
            let per = comp.per;
            if (sum.trailingPE !== undefined && sum.trailingPE !== null) {
                per = parseFloat(sum.trailingPE.toFixed(2));
            }

            // 4. Market Cap
            // Yahoo returns raw number (e.g. 1200000000000000)
            let marketCap = comp.marketCap;
            if (sum.marketCap !== undefined && sum.marketCap !== null) {
                marketCap = sum.marketCap;
            }

            updatedData.push({
                KodeEmiten: comp.KodeEmiten,
                der,
                roe,
                per,
                marketCap
            });

            console.log("OK");
            updatedStats.success++;

        } catch (error) {
            console.log(`FAILED (${error.message})`);
            updatedData.push(comp); // Keep original data if fetch fails
            updatedStats.failed++;
        }

        // Small delay
        await new Promise(r => setTimeout(r, 200));
    }

    // Sort by Market Cap descending (optional, but good for organization)
    updatedData.sort((a, b) => b.marketCap - a.marketCap);

    fs.writeFileSync(dataPath, JSON.stringify(updatedData, null, 4));
    console.log(`\nUpdate Complete.`);
    console.log(`Success: ${updatedStats.success}`);
    console.log(`Failed: ${updatedStats.failed}`);
    console.log(`File saved to: ${dataPath}`);
}

update().catch(err => console.error(err));
