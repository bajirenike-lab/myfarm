# MyFarm — Real-World Gamified Agricultural Platform

> **Pilot Region**: Ibadan, Oyo State, Nigeria  
> **Mobile Framework**: React Native + Expo SDK 52 (TypeScript, Expo Router)  
> **Backend & Auth**: PostgreSQL 15 on Supabase with Row Level Security (RLS)  
> **Weather Integration**: Open-Meteo API (Zero-cost commercial weather for Ibadan)  
> **Payments Engine**: Modular Gateway Abstraction (Interactive Sandbox Mock + Paystack Production)  

---

## 1. Overview & Vision

**MyFarm** connects urban residents, families, and professionals across Nigeria with real-world, verified agricultural production without requiring personal farmland ownership or farming expertise.

Participants select partner farms in Oyo State (e.g., Ido LGA, Akinyele LGA), choose crop packages (Roma Tomatoes, Habanero Pepper, Sweet Corn, Cassava), fund production through transparent itemized budgets, monitor progress via farmer-uploaded photographs and video proof, and choose what happens to their actual harvest (doorstep delivery or sale on the MyFarm marketplace).

---

## 2. Project Structure

```
├── admin/
│   └── index.html                 # Central Operations Hub & Activity Approvals Queue
├── farmer/
│   └── index.html                 # Mobile-First Farmer Field Operator Portal (GPS + Photos)
├── app/                           # Expo Router File-Based Mobile Application
│   ├── (auth)/                    # Onboarding, Login, Registration
│   ├── (tabs)/                    # 5-Tab Navigation Cockpit
│   │   ├── index.tsx              # Home Dashboard (Live Ibadan Weather & Cockpit)
│   │   ├── discover.tsx           # Farm Discovery & Crop Catalog
│   │   ├── cycles.tsx             # Active Cultivations & Progress
│   │   ├── marketplace.tsx        # Fresh Produce Marketplace & Cart
│   │   └── profile.tsx            # Impact Metrics & Farmer Mode Shortcut
│   ├── farm/[id].tsx              # Farm Profile & Infrastructure Specs
│   ├── crop/[id].tsx              # Crop Specifications & Production Packages
│   ├── calculator.tsx             # Interactive Production Budget Estimator
│   ├── checkout.tsx               # Order Confirmation & Payment Trigger
│   ├── cycle/[id].tsx             # Verified Farming Activity Timeline
│   ├── farmer-log.tsx             # In-App Field Logging Tool for Agronomists
│   └── harvest/[id].tsx           # Post-Harvest Decision Engine (Eat vs. Sell)
│
├── constants/
│   └── theme.ts                   # Brand Colors, Typography & Spacing
├── lib/
│   └── supabase.ts                # Supabase Client Initialization
├── services/
│   ├── payment.ts                 # Modular Payment Gateway (Mock + Paystack)
│   └── weather.ts                 # Real-Time Agricultural Weather for Ibadan
├── supabase/
│   ├── complete_setup.sql         # 1-Click Complete Database Setup Script
│   ├── seed.sql                   # Development Seed Data for Ibadan
│   └── migrations/                # Version-Controlled SQL Migrations
├── types/
│   └── index.ts                   # Core TypeScript Interfaces
└── package.json
```

---

## 3. Database Deployment (Supabase)

To deploy the database schema, security rules, and Ibadan seed data:

1. Open your [Supabase Project Dashboard](https://supabase.com/dashboard/project/kmrpzqxkpuedgtuntcyg).
2. Click on **SQL Editor** on the left navigation bar.
3. Click **New query**, copy and paste the entire contents of [`supabase/complete_setup.sql`](file:///c:/Users/Tope/Downloads/farm%20project/supabase/complete_setup.sql).
4. Click **Run**.
5. All 21 tables, enum types, Row Level Security policies, and Ibadan seed records will be created instantly.

---

## 4. Running the Mobile Application

### Step 1: Start the Development Server
```bash
npm start
```

### Step 2: Preview on Your Device
- **On Physical Android Phone (Recommended)**:
  1. Download the free **Expo Go** app from Google Play Store.
  2. Open Expo Go and scan the QR code printed in the terminal.
  3. The app will launch immediately over your local Wi-Fi.
- **On Web Browser**:
  - Press `w` in the terminal to view the application in your browser.

---

## 5. Architectural Documents

Detailed master specifications are available in the repository root:
* [`PROJECT_BRIEF.md`](file:///c:/Users/Tope/Downloads/farm%20project/PROJECT_BRIEF.md) — Product vision, business model, and ethical guidelines.
* [`CUSTOMER_JOURNEY.md`](file:///c:/Users/Tope/Downloads/farm%20project/CUSTOMER_JOURNEY.md) — 16-stage customer lifecycle specification.
* [`TECHNICAL_ARCHITECTURE.md`](file:///c:/Users/Tope/Downloads/farm%20project/TECHNICAL_ARCHITECTURE.md) — System topology, security, and payment model.
* [`DATABASE_DESIGN.md`](file:///c:/Users/Tope/Downloads/farm%20project/DATABASE_DESIGN.md) — Database entity definitions and RLS policies.
* [`MVP_ROADMAP.md`](file:///c:/Users/Tope/Downloads/farm%20project/MVP_ROADMAP.md) — Phased milestone schedule.
* [`FREE_STACK_EVALUATION.md`](file:///c:/Users/Tope/Downloads/farm%20project/FREE_STACK_EVALUATION.md) — Free tiers, licensing, and operational constraints.
* [`PROJECT_STATUS.md`](file:///c:/Users/Tope/Downloads/farm%20project/PROJECT_STATUS.md) — Live progress tracking and decision log.
