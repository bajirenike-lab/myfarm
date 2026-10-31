# MVP IMPLEMENTATION ROADMAP: AGROCONNECT PLATFORM

This roadmap details the phased, milestone-by-milestone engineering schedule designed to deliver a validation-ready, secure, and revenue-generating agricultural technology platform.

---

## Roadmap Overview & Progress Tracker

| Phase | Milestone Name | Status | Key Deliverables | Risk Level |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 1** | **Project Understanding & Foundations** | **COMPLETED** | Comprehensive specifications, architecture, schema, free-stack evaluation | Low |
| **Phase 2** | **Database Schema, Migrations & Seed Data** | **UPCOMING** | Supabase SQL schema, RLS policies, Ibadan seed datasets | Low |
| **Phase 3** | **Mobile App Scaffold & Authentication** | Queued | Expo SDK 52, TypeScript, Auth screens, Onboarding, Nav tabs | Medium |
| **Phase 4** | **Farm & Crop Discovery + Budget Calculator** | Queued | Map view, Crop catalog, Itemized production cost estimator | Low |
| **Phase 5** | **Production Checkout & Payment Engine** | Queued | Mock sandbox payment, Paystack abstraction, Webhook verification | High |
| **Phase 6** | **Farming Timeline & Verified Progress Tracking** | Queued | Visual growth stages, farmer photos/videos, milestone events | Medium |
| **Phase 7** | **Web Admin Portal & Farmer Operations** | Queued | Operator approvals, plot allocation, crop management dashboard | Medium |
| **Phase 8** | **Harvest Management & Post-Harvest Choices** | Queued | Actual yield logging vs estimate, Delivery vs Sell decision engine | Medium |
| **Phase 9** | **Marketplace Commerce & Seller Settlements** | Queued | In-app produce catalog, Cart, Checkout, Settlement ledger | High |
| **Phase 10**| **End-to-End Testing & Ibadan Pilot Launch** | Queued | Security audit, performance validation, pilot user onboarding | Medium |

---

## Phase Details

### Phase 1: Project Understanding & Architecture Foundation (Current)
- **Objective**: Establish crystal-clear product definitions, technical blueprints, and commercial safeguards before writing code.
- **Deliverables**:
  - `PROJECT_BRIEF.md`
  - `CUSTOMER_JOURNEY.md`
  - `TECHNICAL_ARCHITECTURE.md`
  - `DATABASE_DESIGN.md`
  - `MVP_ROADMAP.md`
  - `FREE_STACK_EVALUATION.md`
  - `PROJECT_STATUS.md`
- **Definition of Done**: All 7 documents drafted, cross-checked for contradictions, and presented to the founder for formal approval.

---

### Phase 2: Database Schema, Migrations & Ibadan Seed Data
- **Objective**: Deploy the complete PostgreSQL relational schema to Supabase with strict security policies and rich local sample data.
- **Deliverables**:
  - Version-controlled SQL migration scripts in `supabase/migrations/`.
  - Row Level Security (RLS) policies for participants, farmers, and admins.
  - Development seed data (`supabase/seed.sql`) containing:
    - 2 verified Ibadan partner farms (Ido Agro Farm & Akinyele Horticultural Center).
    - 4 representative crop profiles (Roma Tomatoes, Habanero Pepper/Atarodo, Maize, Cassava).
    - Production packages (50 sqm Starter, 100 sqm Family, 250 sqm Commercial) with itemized cost breakdowns.
  - Automated database types generation script for TypeScript.
- **Exit Criteria**: All tables, foreign keys, triggers, and RLS rules compile without errors on Supabase.

---

### Phase 3: Mobile Application Foundation & Authentication
- **Objective**: Establish the React Native Expo mobile application with brand identity, design tokens, and authentication workflows.
- **Deliverables**:
  - Expo SDK 52 + TypeScript app configured with Expo Router.
  - Visual Design System: Brand colors (Forest Green `#1B4D3E`, Harvest Gold `#E5A93C`, Leaf Green `#2E7D32`, Crisp White `#FFFFFF`).
  - Swipable 3-screen Onboarding Walkthrough explaining remote farming in plain English.
  - Authentication flow: Sign In, Sign Up, Password Reset, Persistent Session management via Supabase Auth.
  - Home Dashboard (Cockpit) with empty state ("Start Your Farm") and active participant state.
- **Exit Criteria**: User can register, log in, view the dashboard on an Android device or emulator, and log out cleanly.

---

### Phase 4: Farm & Crop Discovery + Interactive Cost Estimator
- **Objective**: Enable participants to explore partner farms in Ibadan, browse crops, and experiment with production budgets.
- **Deliverables**:
  - Farm Discovery: Map view (OpenStreetMap) and List view with search and filter by Ibadan LGA.
  - Farm Detail Screen: Operator credentials, solar water infrastructure, verified badge, soil type.
  - Crop Catalog: High-definition crop cards showing cultivation days, season, and care level.
  - **Interactive Production Cost Estimator**:
    - Slider for plot size (50 sqm, 100 sqm, 250 sqm).
    - Dynamic calculation of itemized costs (seeds, ridging, fertilizer, labor, platform fee).
    - Expected yield range (min kg – max kg) and estimated cost per kilogram.
    - Transparent risk disclaimer.
- **Exit Criteria**: User can select a farm, select a crop, configure a plot, and see an accurate itemized financial summary.

---

### Phase 5: Production Order Checkout & Payment Processing
- **Objective**: Implement secure order creation and financial checkout with sandbox simulation and Paystack architecture.
- **Deliverables**:
  - Order Review Screen: Farm, crop, plot, schedule, and terms & conditions agreement.
  - Payment Gateway Abstraction (`PaymentGateway` interface).
  - Mock Sandbox Gateway for instant local and offline testing (Simulate Success, Pending, or Failure).
  - Production-ready Paystack integration with server-side HMAC-SHA512 webhook signature verification.
  - Transition of order state to `awaiting_allocation` upon cryptographic payment verification.
- **Exit Criteria**: Order is created, payment verified via webhook, and database state securely updated without relying on client callbacks.

---

### Phase 6: Farming Timeline & Verified Progress Tracking
- **Objective**: Deliver the core emotional experience: following real-world agricultural progress.
- **Deliverables**:
  - Chronological visual timeline showing lifecycle stages (Land Prep → Planting → Weeding → Flowering → Harvest).
  - Activity Feed Cards: Farmer notes, verified photo/video gallery, inputs applied, weather at time of action.
  - Open-Meteo Weather Widget displaying real-time Ibadan weather, temperature, and 7-day rainfall outlook.
  - Milestone completion indicators and in-app alert badges.
- **Exit Criteria**: Participant views verified updates submitted from the field on their live cycle feed.

---

### Phase 7: Web Admin Portal & Farmer Operations Interface
- **Objective**: Empower platform operators and farmers to manage physical operations without touching the database.
- **Deliverables**:
  - Modern Web Admin Dashboard (Next.js/React + Tailwind).
  - Farm & Plot Inventory Management: Add farms, create plots, assign farmers.
  - Crop & Package Configuration: Add crops, adjust cultivation days, modify itemized budget costs.
  - Activity Moderation Queue: Operators review farmer photo/log submissions and click Approve or Reject.
  - Farmer Mobile/Web Input View: Lightweight form allowing farmers to submit photos, description, and inputs.
- **Exit Criteria**: Administrator approves a farmer photo submission on the web portal, and it appears immediately on the mobile app.

---

### Phase 8: Harvest Management & Post-Harvest Decision Engine
- **Objective**: Record real harvest yields and provide seamless choices to the participant.
- **Deliverables**:
  - Field Harvest Recording Form: Farmer logs date, actual gross weight (kg), Grade A / Grade B / damaged breakdown, and scale photos.
  - Yield Comparison Interface: Actual harvested yield displayed against initial scientific estimate.
  - **Post-Harvest Decision Engine Screen**:
    - Option A: Doorstep Delivery (Address entry, delivery fee calculation).
    - Option B: List on AgroConnect Marketplace (Quantity, price per kg, platform fee calculation).
    - Option C: Split Allocation (Interactive slider allocating portions to delivery and marketplace).
- **Exit Criteria**: Participant successfully allocates a harvest between personal delivery and marketplace sale.

---

### Phase 9: Marketplace Commerce & Seller Settlements
- **Objective**: Enable urban buyers to purchase fresh produce, lock inventory, and credit sellers.
- **Deliverables**:
  - Marketplace Produce Browsing with filter by crop and farm origin.
  - Real-time inventory reservation to prevent double-selling.
  - Shopping Cart, Delivery Address selector, and Checkout.
  - Order fulfillment workflow: Preparing → Dispatched → Delivered.
  - Seller Settlement Ledger: Transparent tracking of gross sales, platform commission, and net payout.
- **Exit Criteria**: Independent buyer purchases produce from a participant's listing, order fulfills, and seller receives payout credit.

---

### Phase 10: End-to-End QA, Security Audit & Pilot Validation Launch
- **Objective**: Conduct rigorous testing across all roles and prepare for live validation in Ibadan.
- **Deliverables**:
  - Comprehensive end-to-end testing of customer, farmer, and admin user journeys.
  - Security audit: Verify RLS policies, ensure no sensitive keys in client bundles, audit rate limits.
  - Performance optimization: Image caching, fast cold starts on Android.
  - Ibadan Pilot Launch Kit: Seed data representing actual Ibadan pilot plots, onboarding materials, customer support guide.
- **Exit Criteria**: A non-technical user can execute the entire journey on a physical Android phone from registration to harvest selection.
