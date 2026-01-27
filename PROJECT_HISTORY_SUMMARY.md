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
*   **Core Formula:** `isStealth = (Volume > 1.5 * AvgVol20) && (AbsChange < 0.5 * ATR)`
*   **Scoring System (0-100):**
    *   **Base Score:** 80 points for matching the core signal.
    *   **Bonuses:**
        *   **OBV Momentum:** +15 points if On-Balance Volume is rising while price is flat.
        *   **Price Compression:** +15 points if daily range is at a 20-day low (Coiling).
    *   **Penalties:** Large price drops or selling climaxes reduce the score.

### **2. Dynamic Volatility (Adaptive TR)**
*   **Upgrade:** Replaced static 1.5% limit with **Average True Range (ATR)** based threshold.
*   **Logic:** `Abs(Change) < 0.5 * ATR(14)`.
*   **Benefit:** Adapts to the "personality" of the stock. Bluechips require tight compression; Commodities are allowed moderate volatility while still flagging abnormal stillness.

---

## III. The "Quality Gate" (Anti-Gorengan Filter)

To prevent the scanner from flagging low-quality stocks ("Gorengan"), we implemented a strict Fundamental Filter layer that runs *before* the technical scan.

### **1. FundamentalService**
*   **Source:** Created a Multi-File JSON Join engine (`allCompanies` + `financial_ratio` + `companySummary`).
*   **Strict Rules:**
    *   **Market Cap:** Must be > Rp 5 Trillion.
    *   **Financial Health:** Debt-to-Equity (DER) < 2.0 (Filters out distress).
    *   **Profitability:** Return on Equity (ROE) > 0 (Filters out money losers).

### **2. Audit Trail & Tagging**
*   **Visual Logic:** Dashboard now displays specific group tags (Astra, Salim, BUMN, Bakrie) for context.
*   **Stats:** Added a live "Audit Bar" showing: `Universe Scanned` -> `Quality Passed` -> `Stealth Found`.

---

## IV. UI/UX Refinement (Mobile-First FinTech)

### **1. Responsive "App-Like" Layout**
*   **Mobile Sidebar:** Converted the persistent sidebar into a **Sheet / Drawer** triggered by a hamburger menu on mobile.
*   **Adaptive Header:** Header items (Time, Status) auto-collapse on small screens.
*   **Scrollable Data:** The "Fundamental Explorer" table now supports horizontal scrolling on mobile, preserving data density without breaking layout.

### **2. Educational Hover Cards**
*   **Feature:** Integrated `HoverCard` components into the VSA Analysis panel.
*   **Detail:** Hovering over terms like "RVOL", "Elevated", or "OBV" now reveals detailed definitions and context for the user.

### **3. Infinite Ticker Tape**
*   **Feature:** A Bloomberg-style running ticker in the header.
*   **Tech:** Custom CSS Keyframes (`animate-infinite-scroll`) in `globals.css` with a smooth, endless loop that pauses on hover.

---

## V. Technical Summary
*   **Framework:** Next.js 15 (App Router).
*   **Language:** TypeScript.
*   **Data Provider:** `yahoo-finance2`.
*   **Styling:** TailwindCSS + Shadcn UI (Sheet, HoverCard, Dialog).
*   **State Management:** Server Actions + React Hooks (`useState`, `useMemo`).
