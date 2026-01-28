import allCompanies from "@/data/allCompanies.json";
import financialRatios from "@/data/financial_ratio.json";
import companySummaries from "@/data/companySummaryByKodeEmiten.json";
import { CompanyProfile } from "@/data/fundamental-data";

// ----------------------------------------------------------------------
// DATA INTEFACES (Matching the JSONs)
// ----------------------------------------------------------------------

interface RawCompany {
    KodeEmiten: string;
    NamaEmiten: string;
}

interface RawFinancialRatio {
    KodeEmiten: string;
    der: number;
    roe: number;
    per: number;
    marketCap: number;
}

interface RawSummary {
    KodeEmiten: string;
    Sektor: string;
    SubSektor: string;
}

// ----------------------------------------------------------------------
// SERVICE CONFIGURATION
// ----------------------------------------------------------------------

export interface QualityFilterParams {
    minMarketCapT: number; // Trillion
    maxDER: number;
    minROE: number;
    maxPER?: number;
    minPER?: number;

    // Advanced Tags
    sectors?: string[];
    conglomerates?: string[];
    onlyBluechips?: boolean;
}

export const DEFAULT_QUALITY_FILTER: QualityFilterParams = {
    minMarketCapT: 2,
    maxDER: 2.0,
    minROE: 0,
    maxPER: 100,
    minPER: 0,
};

// ----------------------------------------------------------------------
// THE "ANTI-GORENGAN" ENGINE
// ----------------------------------------------------------------------

export class FundamentalService {

    // In-memory cache of the joined dataset
    // REMOVED static caching to ensure hot-reload of JSON data works during development
    // private static _joinedData: CompanyProfile[] = [];
    // private static _initialized = false;

    private static getJoinedData(): CompanyProfile[] {
        // JOIN LOGIC: (AllCompanies + Financials + Summaries)
        return (allCompanies as RawCompany[]).map(comp => {
            const ratio = (financialRatios as RawFinancialRatio[]).find(r => r.KodeEmiten === comp.KodeEmiten);
            const summary = (companySummaries as RawSummary[]).find(s => s.KodeEmiten === comp.KodeEmiten);

            if (!ratio) return null; // Skip if no financial data (delisted or error)

            // Normalize Market Cap (JSON has raw, we check logic below)
            const marketCapT = ratio.marketCap / 1_000_000_000_000;

            // Conglomerate Tagging Logic
            let conglomerate: CompanyProfile['conglomerate'] = undefined;
            const ticker = comp.KodeEmiten;

            if (["ASII", "UNTR", "ASLC"].includes(ticker)) conglomerate = "Astra";
            else if (["INDF", "ICBP"].includes(ticker)) conglomerate = "Salim";
            else if (["BBRI", "BMRI", "BBNI", "TLKM", "PGAS", "PTBA", "ANTM", "TINS"].includes(ticker)) conglomerate = "BUMN";
            else if (["BUMI", "DEWA", "ENRG"].includes(ticker)) conglomerate = "Bakrie";
            else if (["GOTO", "ARTO"].includes(ticker)) conglomerate = "Goto";

            // Map to Internal Profile
            return {
                symbol: `${comp.KodeEmiten}.JK`,
                name: comp.NamaEmiten,
                sector: summary?.Sektor as any || "Others",
                subSector: summary?.SubSektor || "Others",
                marketCap: ratio.marketCap,
                der: ratio.der,
                roe: ratio.roe,
                conglomerate
            };
        }).filter(Boolean) as CompanyProfile[]; // Remove nulls
    }

    static getTickers(filter: QualityFilterParams = DEFAULT_QUALITY_FILTER): string[] {
        const data = this.getJoinedData();
        const T = 1_000_000_000_000;

        const filtered = data.filter(company => {
            // 1. LIQUIDITY & SIZE GATE
            if (company.marketCap < filter.minMarketCapT * T) return false;

            // 2. FINANCIAL HEALTH GATE
            // DER < 2.0 (Solvency)
            if (company.der >= filter.maxDER) return false;

            // ROE > 0 (Profitability)
            if (company.roe <= filter.minROE) return false;

            // 3. TAG FILTERING (Optional)
            if (filter.conglomerates && filter.conglomerates.length > 0) {
                if (!company.conglomerate || !filter.conglomerates.includes(company.conglomerate)) return false;
            }

            if (filter.onlyBluechips) {
                // Rule: Market Cap > 50T OR LQ45 Member (Approx by cap here for simplicity)
                if (company.marketCap < 50 * T) return false;
            }

            return true;
        });

        return filtered.map(c => c.symbol);
    }

    static getAllData(): CompanyProfile[] {
        return this.getJoinedData();
    }

    static getMetrics(): { total: number, passed: number } {
        const data = this.getJoinedData();
        // This is just a helper, ideally we'd pass filter params to get 'passed' count dynamically
        // Use default filter for summary
        const passed = this.getTickers(DEFAULT_QUALITY_FILTER).length;
        return {
            total: data.length,
            passed
        };
    }
}
