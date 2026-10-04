# UK Landlord Licensing & Compliance Hub 🇬🇧

A professional, audit-ready web application for UK Buy-to-Let (BTL) landlords, property managers, and letting agents. Built to manage **Selective Licensing (Housing Act 2004 Part 3)**, **Additional HMO Licensing**, local council compliance audits, and statutory document generation with **instant downloadable PDF templates**.

Pre-loaded with the **London Borough of Redbridge Selective Licensing Schedule (35-condition benchmark)** and adaptable to **any local authority in England & Wales** (Newham, Brent, Waltham Forest, Nottingham, Manchester, Liverpool, etc.).

---

## 🚀 Key Features

### 1. Multi-Council & Multi-Property Switcher
* **Generic for Any UK Property:** Easily customize property address, borough, postcode, licence reference, landlord contact, managing agent, and room sizes.
* **1-Click Presets:**
  * **London Borough of Redbridge** (Official 35-condition Selective Licensing benchmark)
  * **London Borough of Newham** (Selective Scheme)
  * **Generic UK Selective Property** (Part 3 Housing Act standard)
* **100% Client-Side Privacy:** All property details and checklist states are securely stored *only* inside each user's browser via `localStorage`. No data is ever sent to or stored on servers.

### 2. The 35-Condition Master Checklist Tracker
* Covers all 35 statutory conditions specified in official UK council licensing schedules:
  * **Occupancy Caps:** Maximum permitted persons (5) and single-family households (1).
  * **Room Standards:** Space standards (<4.64m² = 0; 4.64-6.51m² = 0 adults; 6.51-10.22m² = 1; >10.22m² = 2).
  * **Mandatory Safety Certifications:** Gas Safety (CP12), 5-year EICR, Smoke & CO Alarms.
  * **Management & ASB:** 7-day ASB written warning protocol and mandatory 5-year archive.
  * **Waste & Gardens:** Zero bulky waste/mattresses in gardens, 7-day warning notices.
* Dynamic **Compliance Score** (0–100%) and potential penalty exposure calculator.

### 3. Digital Legal Templates & High-Resolution PDF Generator
Generate and download **7 official legal PDF documents** ready to be signed or produced to council inspectors within the statutory 28-day demand window:

1. **6-Month Property Inspection Audit & Condition Log** *(Cond 14, 1, 2, 20)*
   * Room-by-room occupancy checks, alarm push-test logs, damp/mould checks, repair notes, and signatures.
2. **Statutory Safety & Equipment Declarations** *(Cond 7, 8, 11, 12)*
   * Furniture Fire Safety (1988), Electrical Equipment (2016), and Smoke/CO alarm positioning declaration of truth.
3. **Tenant Onboarding, Emergency & Refuse Notice** *(Cond 18, 19, 25, 27, 30, 35)*
   * 24/7 out-of-hours phone number, waste collection rules, bulky waste prohibition, and tenant signature receipt.
4. **Formal 7-Day Anti-Social Behaviour (ASB) Warning Notice** *(Cond 34)*
   * Legal warning with Housing Act 1988 Ground 7A/14 notices and mandatory 5-year retention seal.
5. **Managing Agent Joint Liability Consent Agreement** *(Cond 23)*
   * Bilateral legal deed acknowledging potential £30,000 penalties per breach.
6. **Household Census & Permitted Room Register** *(Cond 26)*
   * Occupant names, dates of birth, relationships, and room assignments to satisfy 28-day council demands.
7. **Master 28-Day Council Audit Dossier** *(Full Compliance Executive Package)*
   * Consolidated summary dossier showing all completed items and certifications.

### 4. Statutory Deadline & Trigger Calculator
* **7-Day Window:** Pest eradication action (Cond 15), garden waste warning (Cond 19), ASB response (Cond 34).
* **28-Day Window:** Local authority document production deadline for all certificates and logs.
* **30-Day Window:** Tenancy Deposit Protection (Housing Act 2004 s.213) and physical abandonment welfare inspection (Cond 31).
* **6-Month Cycle:** Recurring property condition inspections (Cond 14).
* **Mandatory Retention Schedule:** Visual archive timeline (5 years for ASB, 3 years for complaints/inspections).

### 5. Statutory Penalties & Article 4 Direction Engine
* Civil Penalty Notices up to **£30,000 per offence** (Housing Act 2004 s.249A).
* Rent Repayment Orders (RROs) up to 12 months' rent.
* Article 4 Planning Direction analysis (explaining why letting to unrelated sharers breaches planning).

### 6. Live UK Housing & Council Regulatory News Hub
* **Government Bills & Reforms:** Real-time updates on the **Renters' Rights Bill** (Section 21 abolition, periodic tenancies, landlord database, Awaab's Law in PRS).
* **Council Licensing Designations:** Tracking active selective and additional schemes across London (Redbridge, Newham, Brent, Waltham Forest, Westminster) and major UK cities (Birmingham, Nottingham, Manchester, Liverpool, Leeds).
* **Enforcement & Fines Tracking:** Monitoring civil penalties, Home Office Right to Rent penalty increases (tripled up to £10k/tenant), and Tribunal Rent Repayment Order rulings.
* **Interactive Council Scheme Lookup Tool:** Instant lookup for any local authority's active licensing rules, fee schedules, and direct council portal links.

---

## 📦 Project Structure

```
uk-landlord-licensing/
├── index.html            # Main single-page application
├── app.js                # Core logic, checklist, templates & html2pdf generator
├── styles.css            # Stylesheet with bespoke @media print layout
├── vercel.json           # Vercel zero-config deployment settings
├── package.json          # Project metadata
├── push_to_github.bat    # 1-click batch script to initialize & push to GitHub
├── run_local.bat         # 1-click script to run local HTTP server
├── .gitignore            # Git ignore file
└── README.md             # Documentation & setup guide
```

---

## 💻 Local Quick Start

1. Double click `run_local.bat`, or run via terminal:
   ```bash
   python -m http.server 8080
   ```
2. Open your browser at:
   ```
   http://localhost:8080
   ```

---

## 🌐 Deploy to GitHub & Vercel (Step-by-Step)

### Step 1: Push to GitHub
1. Create a new empty repository on GitHub:
   * Go to **[https://github.com/new](https://github.com/new)**
   * Repository name: `uk-landlord-licensing`
   * Leave "Initialize this repository with a README" **UNCHECKED**.
   * Click **Create repository**.
2. Double click `push_to_github.bat` in this folder.
   * The script will initialize git, stage all files, commit, and push directly to `main`.

### Step 2: Connect to Vercel (Instant Deployment)
1. Log in to your **[Vercel Dashboard](https://vercel.com)**.
2. Click **"Add New..."** → **"Project"**.
3. Import your GitHub repository: `anildutta007/uk-landlord-licensing`.
4. Leave all build settings as default (Framework Preset: *Other* or *None*).
5. Click **"Deploy"**.
6. Your web application is live with an SSL certificate and custom Vercel URL (e.g., `https://uk-landlord-licensing.vercel.app`)!
7. Any future changes committed to your GitHub repository will automatically trigger instant redeployments on Vercel.

---

## ⚖️ Legal Disclaimer

*This application provides regulatory compliance tools, guidance, and document templates based on private rented sector housing legislation in England & Wales (Housing Act 2004, Housing and Planning Act 2016, Deregulation Act 2015). It does not constitute formal legal representation. Landlords facing contested enforcement action or tribunal proceedings should seek independent advice from a qualified solicitor.*
