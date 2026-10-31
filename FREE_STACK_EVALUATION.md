# FREE & OPEN-SOURCE STACK EVALUATION

This document provides a thorough audit of all zero-cost, open-source, and free-tier technologies selected for the AgroConnect platform. It details their operational limits, commercial licensing, migration pathways, and specific local environment constraints.

---

## 1. Summary of Selected Free & Cost-Effective Stack

| Component | Selected Technology | Commercial License / Terms | Free Tier Allowance | Migration Trigger / Path |
| :--- | :--- | :--- | :--- | :--- |
| **Database & Auth** | **Supabase (PostgreSQL 15)** | Open Source (Apache 2.0) / Hosted Free Tier | 500 MB DB, 1 GB Storage, 50,000 MAU, 500k Edge Invocations | Upgrade to Pro ($25/mo) or Self-Host via Docker/Coolify on a $5/mo VPS |
| **Mobile Framework** | **React Native + Expo SDK 52** | Open Source (MIT) | Unlimited local builds; 30 free EAS Cloud Builds/month | Local builds via CLI or custom CI/CD (GitHub Actions) |
| **Mobile Preview** | **Expo Go** | Free App (Google Play / App Store) | Unlimited live testing on physical devices via QR code | Standalone APK build via EAS or local Gradle build |
| **Admin Web Hosting** | **Cloudflare Pages / Vercel** | Free Tier (Commercial Use Permitted) | Unlimited static bandwidth, 100 custom domains, free SSL | Paid enterprise tiers (only needed for massive corporate scale) |
| **Mapping Engine** | **OpenStreetMap + Leaflet / MapLibre** | Open Database License (ODbL) / BSD | Free standard tiles with mandatory attribution | Self-hosted PMTiles on Cloudflare R2 / Stadia Maps free tier (200k tiles/mo) |
| **Weather Engine** | **Open-Meteo API** | Free for commercial use with attribution | 10,000 API calls/day, zero API keys required | Paid API key (€15/mo) if daily calls exceed 10,000 |
| **Payments** | **Paystack** | Transaction-based (No fixed cost) | Unlimited Sandbox / Test Mode; Live fee: 1.5% + ₦100 per transaction | Negotiated enterprise processing rates at high volume (>₦50M/mo) |
| **Push Notifications**| **Expo Push Notification API** | Free Service | Unlimited push notifications routed to APNs and FCM | Self-managed Google Firebase Cloud Messaging (FCM) credentials |

---

## 2. In-Depth Evaluation of Core Services

### 2.1. Supabase (Managed PostgreSQL Backend)
* **What it powers**: Relational database, user authentication (JWT), Row Level Security (RLS), image storage, edge function webhooks.
* **Free Tier Limits**:
  - **Database Size**: 500 MB. (Sufficient for ~150,000 user records, 50,000 crop cycle updates, and 100,000 transactions before reaching capacity).
  - **File Storage**: 1 GB bandwidth/storage. (Sufficient for ~2,500 compressed farm photos during pilot validation).
  - **Monthly Active Users**: 50,000 auth users.
  - **Edge Functions**: 500,000 invocations per month.
* **Critical Operational Consideration: Inactivity Pause**:
  - Supabase pauses free-tier projects after **7 consecutive days of inactivity**.
  - *Mitigation*: During development and staging, any periodic test or simple cron/ping keeps the project active. If paused, it resumes within 60 seconds from the Supabase web dashboard.
* **Long-Term Migration**:
  - Because Supabase is built on standard PostgreSQL and open-source Docker containers, the entire database can be exported via `pg_dump` and migrated to a self-hosted instance (e.g., Hetzner, AWS, or DigitalOcean) at any time with zero vendor lock-in.

---

### 2.2. Expo & React Native (Mobile Application)
* **What it powers**: The cross-platform mobile application running on Android and iOS.
* **Why Expo?**
  - **Zero Heavy Toolchain Requirement**: Using **Expo Go**, developers and testers can scan a QR code from a mobile phone and immediately run the live application over Wi-Fi without needing a 15 GB Android Studio installation or heavy system emulators.
  - **Over-The-Air (OTA) Updates**: Minor bug fixes and UI updates can be deployed directly to testers' phones without waiting for app store review.
* **Free Tier Limits (Expo Application Services - EAS)**:
  - 30 free cloud Android builds per month.
  - Unlimited local builds using `npx expo run:android` or GitHub Actions.

---

### 2.3. Paystack (Payment Gateway & Financial Settlement)
* **What it powers**: Checkout for crop cycles, marketplace produce purchases, and seller bank account verification.
* **Pricing & Commercial Terms**:
  - **Fixed Monthly Subscription**: ₦0.00.
  - **Setup Fee**: ₦0.00.
  - **Test Sandbox**: 100% Free with simulated credit cards, bank accounts, and USSD responses.
  - **Live Processing Fees (Nigeria)**:
    - 1.5% + ₦100 per successful local transaction.
    - ₦100 fee is **waived** for transactions under ₦2,500.
    - Total fee per transaction is **capped at ₦2,000** (a ₦200,000 transaction only incurs ₦2,000 fee, not ₦3,000).
* **NUBAN Account Verification**:
  - Paystack provides a built-in API to resolve Nigerian 10-digit bank account numbers to verified account holder names before executing seller payouts.

---

### 2.4. Open-Meteo Weather API
* **What it powers**: Weather widgets displaying temperature, humidity, rainfall forecast, and agricultural weather alerts for farm locations in Ibadan and Oyo State.
* **Licensing & Terms**:
  - **Cost**: 100% Free.
  - **API Key**: Not required.
  - **Commercial Use**: Permitted with attribution in app (e.g., *"Weather data by Open-Meteo.com"*).
  - **Rate Limit**: 10,000 daily API calls per IP (more than adequate for thousands of daily mobile sessions).
  - **Geographic Precision**: Supports exact latitude/longitude coordinates (e.g., Ibadan: `7.3775° N, 3.9470° E`).

---

### 2.5. OpenStreetMap (OSM) & MapLibre
* **What it powers**: Interactive farm discovery maps, plot boundaries, and delivery zone visualizations.
* **Licensing & Compliance**:
  - Open Database License (ODbL). Free to use commercially.
  - **Attribution Requirement**: Mandatory attribution string on the map widget: *"© OpenStreetMap contributors"*.
  - **Tile Usage Policy**: Custom `User-Agent` header configured in requests; tile responses cached locally on the device using `@tanstack/react-query` or filesystem storage to avoid excessive tile server requests.

---

## 3. Development Environment Constraints & Optimization Strategy

During our environment inspection of the host machine (`C:\Users\Tope\Downloads\farm project`), we identified specific physical constraints:

1. **Host Disk Space**:
   - **Current Free Space**: ~2.23 GB on the `C:` drive.
   - **Implication**: Installing large developer software such as Android Studio (~10–15 GB) or global emulator images would fail due to disk exhaustion.
   - **Optimization Strategy**:
     - Use **Expo Go** on a physical mobile device for mobile development. Expo Go runs the JavaScript bundle over Wi-Fi without generating multi-gigabyte native binaries on the host disk.
     - Web preview (`npx expo start --web`) can be used for rapid component styling.
     - Monorepo dependencies are configured to share packages to avoid duplicate `node_modules`.
     - Clean `npm cache` if needed (`npm cache clean --force`).
2. **Node.js & Package Execution**:
   - Node.js `v24.22.1` and npm `11.19.1` are installed.
   - Windows PowerShell restricts execution of `.ps1` scripts by default (`PSSecurityException`).
   - *Solution*: Run commands via `cmd /c npm ...` or execute PowerShell with `-ExecutionPolicy Bypass`.
3. **Version Control**:
   - Git is not currently linked in the system `PATH`.
   - *Solution*: Install Git via `winget install --id Git.Git -e --source winget` or configure Git so that commits and version control can be properly maintained.
