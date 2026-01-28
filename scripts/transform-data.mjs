
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../src/data');

const finCompletePath = path.join(DATA_DIR, 'financial_ratioComplete.json');
const allCompletePath = path.join(DATA_DIR, 'allCompaniesComplete.json');

// Outputs
const outAllCompanies = path.join(DATA_DIR, 'allCompanies.json');
const outSummaries = path.join(DATA_DIR, 'companySummaryByKodeEmiten.json');
const outFinancials = path.join(DATA_DIR, 'financial_ratio.json');

// Read Source Files
const finRaw = JSON.parse(fs.readFileSync(finCompletePath, 'utf-8'));
const allRaw = JSON.parse(fs.readFileSync(allCompletePath, 'utf-8'));

const financialsData = finRaw.data || [];
const companiesData = allRaw.data || [];

console.log(`Loaded ${financialsData.length} financial records and ${companiesData.length} company records.`);

// 1. Generate allCompanies.json
const allCompanies = companiesData.map(c => ({
    KodeEmiten: c.KodeEmiten,
    NamaEmiten: c.NamaEmiten
})).sort((a, b) => a.KodeEmiten.localeCompare(b.KodeEmiten));

fs.writeFileSync(outAllCompanies, JSON.stringify(allCompanies, null, 4));
console.log(`Generated allCompanies.json with ${allCompanies.length} entries.`);

// 2. Generate companySummaryByKodeEmiten.json
// Prefer data from 'allCompaniesComplete' as it seems to have 'Sektor' and 'SubSektor' fields directly.
const summaries = companiesData.map(c => ({
    KodeEmiten: c.KodeEmiten,
    Sektor: c.Sektor || "Others",
    SubSektor: c.SubSektor || "Others"
})).sort((a, b) => a.KodeEmiten.localeCompare(b.KodeEmiten));

fs.writeFileSync(outSummaries, JSON.stringify(summaries, null, 4));
console.log(`Generated companySummaryByKodeEmiten.json with ${summaries.length} entries.`);

// 3. Generate financial_ratio.json
const financialRatios = [];

// Create a map for fast lookup of financial data
const finMap = new Map();
financialsData.forEach(item => {
    finMap.set(item.code, item);
});

// We iterate through the master list of companies to ensure we capture everyone we have data for
companiesData.forEach(comp => {
    const code = comp.KodeEmiten;
    const fin = finMap.get(code);

    if (fin) {
        // Calculate Market Cap
        // Logic: specific field not present? Use Equity * PriceBV if available.
        // The file has 'equity' in Billions (likely, based on previous analysis e.g. 44607).
        // 1 Billion = 1,000,000,000.

        let marketCap = 0;
        if (fin.equity && fin.priceBV) {
            // Equity is likely in Billions IDR based on typical IDX data formats for these JSONs
            // e.g. ADRO Equity 123488 = 123 Trillion.
            marketCap = fin.equity * fin.priceBV * 1_000_000_000;
        }

        // PER handle null/0
        // ROE handle null/0

        financialRatios.push({
            KodeEmiten: code,
            der: fin.deRatio || 0,
            roe: fin.roe || 0,
            per: fin.per || 0,
            marketCap: Math.floor(marketCap)
        });
    }
});

// Sort by Market Cap Descending
financialRatios.sort((a, b) => b.marketCap - a.marketCap);

fs.writeFileSync(outFinancials, JSON.stringify(financialRatios, null, 4));
console.log(`Generated financial_ratio.json with ${financialRatios.length} entries.`);

console.log("Transformation Complete.");
