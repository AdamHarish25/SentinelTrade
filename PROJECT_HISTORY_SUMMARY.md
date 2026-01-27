# SentinelTrade Development Log & Feature Summary

**Date:** January 27, 2026
**Role:** Senior Full-stack Engineer & Quant Developer
**Objective:** Evolve SentinelTrade from a simple dashboard into a professional-grade "Quality-First" Stock Screener with Smart Money detection.

---

## I. Core Architecture & Data Migration (The "Limitless" Upgrade)

### **1. Migration to Yahoo Finance**
*   **Problem:** The previous Alpha Vantage API had strict rate limits (25 requests/day), causing frequent crashes and fallback to mock data.
*   **Solution:** Migrated the entire data fetching layer to the `yahoo-finance2` library.
*   **Implementation:**
    *   Refactored `src/lib/market-service.ts` to use `yahooFinance.historical()`.
    *   Implemented proper Class instantiation (`new YahooFinance()`) to fix build errors.
    *   **Result:** "Limitless" data fetching capabilities for IDX stocks with no API keys required.

### **2. Batch Processing Engine**
*   **Feature:** Enabled scanning of entire indices (e.g., LQ45) rather than just a static watchlist.
*   **Logic:** Implemented `scanIndex()` with concurrency control (processing 5 tickers at a time) to ensure stability and prevent rate-limiting from the data provider side.
*   **Caching:** Configured Server-Side `revalidate` to **3600 seconds (1 Hour)** for efficient resource usage.

---

## II. The "Stealth Scanner" Algorithm (Quant Logic)

### **1. VSA (Volume Spread Analysis) Core**
Implemented a proprietary logic to detect "Smart Money" accumulation:
*   **Concept:** Institutions buy huge quantities without moving the price (Absorption).
*   **Formula:**
    ```typescript
    const isStealth = (Volume > 2.5 * AvgVol20) && (Math.abs(ChangePercent) < 1.5);
    ```
*   **Scoring System (0-100):**
    *   **Base Score:** 80 points for matching the core signal.
    *   **Bonuses:**
        *   **OBV Momentum:** +15 points if On-Balance Volume is rising while price is flat.
        *   **Price Compression:** +15 points if daily range is at a 20-day low (Coiling).
    *   **Penalties:** Large price drops or selling climaxes reduce the score.

### **2. Volume Normalization**
*   **Adjustment:** Converted raw volume from Yahoo Finance into **"Lots"** (Volume / 100) to align with standard IDX trading terminology.

---

## III. The "Quality Gate" (Fundamental Filtering)

To prevent the scanner from flagging low-quality stocks ("Gorengan"), we implemented a strict Fundamental Filter layer.

### **1. FundamentalService**
*   **Source:** Created `src/lib/fundamental-service.ts` using mock JSON data (`src/data/fundamental-data.ts`).
*   **Anti-Gorengan Rules:**
    *   **Market Cap:** Must be > Rp 5 Trillion.
    *   **Financial Health:** Debt-to-Equity (DER) < 2.0.
    *   **Profitability:** Return on Equity (ROE) > 0 (Positive).

### **2. Conglomerate & Sector Tagging**
*   **Context:** Added metadata to track business groups (Astra, Salim, BUMN, Bakrie) and Sectors (Energy, Finance).
*   **Integration:** This metadata is merged with the live technical data in the API response.

---

## IV. UI/UX Refinement (FinTech Aesthetic)

### **1. Scanner Dashboard (New Layout)**
*   **Dual View System:**
    *   **Sentinel Watchlist (Grid):** Displays high-quality stocks with a Stealth Score > 75.
    *   **Fundamental Explorer (Table):** A sortable list of all other quality assets.
*   **Interactive Filters:** Added a filter bar to toggle views by Conglomerate (e.g., "Show only Astra Group").

### **2. Infinite Ticker Tape**
*   **Feature:** A Bloomberg-style running ticker in the header.
*   **Tech:** Custom CSS Keyframes (`animate-infinite-scroll`) in `globals.css` with a smooth, endless loop that pauses on hover.

### **3. Theme Enforcement**
*   **Aesthetic:** "Deep Navy" (#0F172A) & "Pelorous Blue" (#4AA6C6).
*   **Fix:** Hardcoded the color palette variables in `:root` to ensure the Dark Mode theme is always active and consistent.

---

## V. Technical Summary
*   **Framework:** Next.js 15 (App Router).
*   **Language:** TypeScript.
*   **Data Provider:** `yahoo-finance2`.
*   **Styling:** TailwindCSS + Custom Keyframes.
*   **State Management:** Server Actions + React Hooks (`useState`, `useMemo`).
