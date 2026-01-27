// MOCKED FUNDAMENTAL DATA FOR INDONESIAN STOCKS
// In a real app, this would be imported from the JSON files requested.

export interface CompanyProfile {
    symbol: string;
    name: string;
    sector: "Energy" | "Basic Materials" | "Financials" | "Technology" | "Consumer" | "Infrastructure" | "Healthcare" | "Industrial";
    subSector: string;
    marketCap: number; // In Trillion IDR (assumed input, or raw bytes) -> Let's store raw IDR
    der: number; // Debt to Equity
    roe: number; // Return on Equity (%)
    conglomerate?: "Astra" | "Salim" | "Sinarmas" | "Bakrie" | "Djarum" | "BUMN" | "Goto" | "MNC" | "Lippo";
}

// Helper: 1 Trillion = 1,000,000,000,000
const T = 1_000_000_000_000;

export const FUNDAMENTAL_DATA: CompanyProfile[] = [
    // --- BLUECHIP BANKS ---
    { symbol: "BBCA.JK", name: "Bank Central Asia", sector: "Financials", subSector: "Bank", marketCap: 1200 * T, der: 0.2, roe: 22, conglomerate: "Djarum" },
    { symbol: "BBRI.JK", name: "Bank Rakyat Indonesia", sector: "Financials", subSector: "Bank", marketCap: 800 * T, der: 1.5, roe: 18, conglomerate: "BUMN" },
    { symbol: "BMRI.JK", name: "Bank Mandiri", sector: "Financials", subSector: "Bank", marketCap: 550 * T, der: 1.8, roe: 19, conglomerate: "BUMN" },
    { symbol: "BBNI.JK", name: "Bank Negara Indonesia", sector: "Financials", subSector: "Bank", marketCap: 200 * T, der: 1.9, roe: 15, conglomerate: "BUMN" },

    // --- ASTRA GROUP ---
    { symbol: "ASII.JK", name: "Astra International", sector: "Consumer", subSector: "Automotive", marketCap: 210 * T, der: 0.9, roe: 12, conglomerate: "Astra" },
    { symbol: "UNTR.JK", name: "United Tractors", sector: "Industrial", subSector: "Heavy Equipment", marketCap: 90 * T, der: 0.8, roe: 16, conglomerate: "Astra" },

    // --- COMMODITY / MINERBA ---
    { symbol: "ADRO.JK", name: "Adaro Energy", sector: "Energy", subSector: "Coal", marketCap: 85 * T, der: 0.7, roe: 25, conglomerate: "Astra" }, // Loosely linked or independent, putting Astra/Boy Thohir for demo
    { symbol: "PTBA.JK", name: "Bukit Asam", sector: "Energy", subSector: "Coal", marketCap: 30 * T, der: 0.6, roe: 20, conglomerate: "BUMN" },
    { symbol: "ANTM.JK", name: "Aneka Tambang", sector: "Basic Materials", subSector: "Nickel/Gold", marketCap: 40 * T, der: 0.5, roe: 10, conglomerate: "BUMN" },
    { symbol: "INCO.JK", name: "Vale Indonesia", sector: "Basic Materials", subSector: "Nickel", marketCap: 38 * T, der: 0.2, roe: 8 },
    { symbol: "MDKA.JK", name: "Merdeka Copper Gold", sector: "Basic Materials", subSector: "Gold", marketCap: 60 * T, der: 1.1, roe: 5 },
    { symbol: "PGAS.JK", name: "Perusahaan Gas Negara", sector: "Energy", subSector: "Gas", marketCap: 28 * T, der: 1.2, roe: 9, conglomerate: "BUMN" },
    { symbol: "AKRA.JK", name: "AKR Corporindo", sector: "Energy", subSector: "Distribution", marketCap: 30 * T, der: 1.1, roe: 14 },

    // --- SALIM GROUP ---
    { symbol: "ICBP.JK", name: "Indofood CBP", sector: "Consumer", subSector: "FMCG", marketCap: 110 * T, der: 0.6, roe: 18, conglomerate: "Salim" },
    { symbol: "INDF.JK", name: "Indofood Sukses Makmur", sector: "Consumer", subSector: "FMCG", marketCap: 55 * T, der: 1.3, roe: 12, conglomerate: "Salim" },

    // --- TECH / NEW ECONOMY ---
    { symbol: "GOTO.JK", name: "GoTo Gojek Tokopedia", sector: "Technology", subSector: "Software", marketCap: 60 * T, der: 0.1, roe: -10, conglomerate: "Goto" }, // GORENGAN FILTER CANDIDATE (Neg ROE)
    { symbol: "BUKA.JK", name: "Bukalapak", sector: "Technology", subSector: "E-commerce", marketCap: 20 * T, der: 0.1, roe: -5 }, // Neg ROE
    { symbol: "ARTO.JK", name: "Bank Jago", sector: "Financials", subSector: "Digital Bank", marketCap: 35 * T, der: 0.1, roe: 1 },

    // --- BAKRIE (Varies) ---
    { symbol: "BUMI.JK", name: "Bumi Resources", sector: "Energy", subSector: "Coal", marketCap: 15 * T, der: 4.5, roe: 25, conglomerate: "Bakrie" }, // DER > 2 (Filter Candidate)
    { symbol: "DEWA.JK", name: "Darma Henwa", sector: "Energy", subSector: "Services", marketCap: 2 * T, der: 3.0, roe: -2, conglomerate: "Bakrie" }, // Market Cap < 5T, Neg ROE (Filter Candidate)
    { symbol: "BRMS.JK", name: "Bumi Resources Minerals", sector: "Basic Materials", subSector: "Minerals", marketCap: 25 * T, der: 0.5, roe: 4, conglomerate: "Bakrie" },

    // --- OTHERS ---
    { symbol: "TLKM.JK", name: "Telkom Indonesia", sector: "Infrastructure", subSector: "Telecommunication", marketCap: 300 * T, der: 0.9, roe: 16, conglomerate: "BUMN" },
    { symbol: "UNVR.JK", name: "Unilever Indonesia", sector: "Consumer", subSector: "FMCG", marketCap: 100 * T, der: 2.5, roe: 80 }, // DER High (Filter Check)
    { symbol: "TINS.JK", name: "Timah", sector: "Basic Materials", subSector: "Tin", marketCap: 6 * T, der: 1.2, roe: 3, conglomerate: "BUMN" },
    { symbol: "KLBF.JK", name: "Kalbe Farma", sector: "Healthcare", subSector: "Pharma", marketCap: 70 * T, der: 0.2, roe: 14 },
    // "Gorengan" Example
    { symbol: "FREN.JK", name: "Smartfren", sector: "Infrastructure", subSector: "Telco", marketCap: 4 * T, der: 2.5, roe: -5, conglomerate: "Sinarmas" } // Invalid all counts
];
