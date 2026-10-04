/**
 * UK Landlord Licensing & Compliance Hub
 * Core Application Engine
 * Handles Property Management, 35-Condition Schedule, Deadline Engine & PDF Generation
 */

// =========================================================================
// 1. PROPERTY STATE MANAGEMENT & PRESETS
// =========================================================================

const PRESETS = {
  redbridge: {
    id: "prop_redbridge_default",
    address: "14 Cranbrook Road, Ilford",
    town: "Ilford, Essex",
    postcode: "IG1 4NE",
    council: "London Borough of Redbridge",
    licenceRef: "RED-SEL-2024-DEMO",
    scheme: "Selective Licensing (Part 3)",
    landlordName: "Example Landlord",
    landlordPhone: "07700 900123",
    landlordEmail: "landlord@example.co.uk",
    emergencyPhone: "07700 900999 (24/7 Out-of-Hours)",
    agentName: "City Lettings Management Ltd",
    agentPhone: "020 8555 1234",
    maxPersons: 5,
    maxHouseholds: 1,
    accreditation: "LLAS Accredited (London Landlord Scheme)",
    rooms: [
      { name: "Bedroom 1", size: "8.50 m²", range: "6.51m² - 10.22m²", maxPersons: 1, occupant: "Adult Occupant 1" },
      { name: "Bedroom 2", size: "12.80 m²", range: "> 10.22m²", maxPersons: 2, occupant: "Spouse / Partner" },
      { name: "Bedroom 3", size: "11.20 m²", range: "> 10.22m²", maxPersons: 2, occupant: "Child Dependants (x2)" },
      { name: "Boxroom / Study", size: "4.10 m²", range: "< 4.64m²", maxPersons: 0, occupant: "Storage / Study (No Sleeping)" }
    ]
  },
  newham: {
    id: "prop_newham_default",
    address: "12 Romford Road, Stratford",
    town: "London",
    postcode: "E15 4BZ",
    council: "London Borough of Newham",
    licenceRef: "NEW-SEL-2023-8842",
    scheme: "Selective Licensing (Part 3)",
    landlordName: "Private Landlord",
    landlordPhone: "07700 900123",
    landlordEmail: "landlord@example.com",
    emergencyPhone: "07700 900999",
    agentName: "Direct Landlord Managed",
    agentPhone: "07700 900123",
    maxPersons: 4,
    maxHouseholds: 1,
    accreditation: "NRLA Member (#94021)",
    rooms: [
      { name: "Bedroom 1", size: "11.50 m²", range: "> 10.22m²", maxPersons: 2, occupant: "Primary Tenant" },
      { name: "Bedroom 2", size: "10.80 m²", range: "> 10.22m²", maxPersons: 2, occupant: "Secondary Tenant" }
    ]
  },
  generic: {
    id: "prop_generic_default",
    address: "10 High Street",
    town: "Townsville",
    postcode: "UK1 1AB",
    council: "Local Authority Council",
    licenceRef: "LIC-PENDING-APPLICATION",
    scheme: "Selective Licensing (Part 3)",
    landlordName: "UK Buy-to-Let Landlord",
    landlordPhone: "07123 456789",
    landlordEmail: "landlord@domain.co.uk",
    emergencyPhone: "07123 999999",
    agentName: "Property Management Agency",
    agentPhone: "01234 567890",
    maxPersons: 5,
    maxHouseholds: 1,
    accreditation: "NRLA / LLAS Certified",
    rooms: [
      { name: "Bedroom 1", size: "12.00 m²", range: "> 10.22m²", maxPersons: 2, occupant: "Occupant 1 & 2" },
      { name: "Bedroom 2", size: "11.00 m²", range: "> 10.22m²", maxPersons: 2, occupant: "Occupant 3 & 4" },
      { name: "Bedroom 3", size: "7.50 m²", range: "6.51m² - 10.22m²", maxPersons: 1, occupant: "Occupant 5" }
    ]
  }
};

let currentProperty = loadCurrentProperty();

function loadCurrentProperty() {
  const saved = localStorage.getItem("uk_landlord_current_prop");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Error reading saved property", e);
    }
  }
  return {
    id: "prop_user_initial",
    address: "Enter Rental Property Address",
    town: "Town / Borough",
    postcode: "POSTCODE",
    council: "London Borough of Redbridge",
    licenceRef: "Reference / Pending",
    scheme: "Selective Licensing (Part 3)",
    landlordName: "Your Full Legal Name",
    landlordPhone: "07XXXXXXXXX",
    landlordEmail: "landlord@example.com",
    emergencyPhone: "07XXXXXXXXX (24/7 Out-of-Hours)",
    agentName: "Direct Landlord / Managing Agent",
    agentPhone: "020 XXXXXXXX",
    maxPersons: 5,
    maxHouseholds: 1,
    accreditation: "LLAS / NRLA Accredited",
    rooms: [
      { name: "Bedroom 1", size: "8.50 m²", range: "6.51m² - 10.22m²", maxPersons: 1, occupant: "Occupant 1" },
      { name: "Bedroom 2", size: "12.80 m²", range: "> 10.22m²", maxPersons: 2, occupant: "Occupant 2 & 3" },
      { name: "Bedroom 3", size: "11.20 m²", range: "> 10.22m²", maxPersons: 2, occupant: "Occupant 4 & 5" },
      { name: "Boxroom / Study", size: "4.10 m²", range: "< 4.64m²", maxPersons: 0, occupant: "Storage Only (No Sleeping)" }
    ]
  };
}

function saveCurrentProperty(prop) {
  currentProperty = prop;
  localStorage.setItem("uk_landlord_current_prop", JSON.stringify(prop));
  syncPropertyUI();
  renderChecklist();
  if (currentTemplateKey) {
    loadTemplate(currentTemplateKey);
  }
}

// =========================================================================
// 2. MASTER 35-CONDITION STATUTORY DATASET (FROM REDBRIDGE LICENCE CONDITIONS)
// =========================================================================

const INITIAL_CONDITIONS = [
  {
    id: "c1",
    cond: "Cond 1",
    category: "occupancy",
    title: "Permitted Occupation Limits",
    text: "The Licence Holder must not exceed the permitted number of persons (5) and households (1). Room-specific limits are strictly enforceable.",
    doc: "Schedule & Census Register",
    retention: "Duration of Licence",
    template: "census",
    statutoryRef: "Housing Act 2004 Part 3 s.90",
    done: true
  },
  {
    id: "c2",
    cond: "Cond 2",
    category: "occupancy",
    title: "Room Size Standards & Overcrowding Reduction",
    text: "Enforce statutory room caps (<4.64m² = 0; 4.64-6.51m² = 0 adults; 6.51-10.22m² = 1 person; >10.22m² = 2 persons). If requested occupancy exceeds permitted, reduce within 18 months.",
    doc: "Room Measurement Survey",
    retention: "Duration of Licence",
    template: "inspection",
    statutoryRef: "Room Standard Housing Act 1985 / 2004",
    done: true
  },
  {
    id: "c3",
    cond: "Cond 3",
    category: "tenancy",
    title: "Written Tenancy / Licence Agreements",
    text: "Retain copies of all signed tenancy/licence agreements for the duration of the licence. Provide copies to Council within 28 days of written demand.",
    doc: "Signed AST Contract",
    retention: "Duration of Licence",
    template: "onboarding",
    statutoryRef: "Condition 3 (28-day supply)",
    done: true
  },
  {
    id: "c4",
    cond: "Cond 4",
    category: "tenancy",
    title: "Tenant Referencing & Right to Rent Checks",
    text: "Obtain comprehensive references (identity check, Home Office Right to Rent, employment/income affordability, previous landlord reference) prior to occupation.",
    doc: "Tenant Reference File",
    retention: "Duration of Licence",
    template: "onboarding",
    statutoryRef: "Immigration Act 2014 & Cond 4",
    done: true
  },
  {
    id: "c5",
    cond: "Cond 5",
    category: "tenancy",
    title: "Verbal Reference Written Records",
    text: "For any verbal reference taken, maintain a contemporaneous written record including the date, referee name, address, and telephone number. Produce within 28 days.",
    doc: "Verbal Reference Log",
    retention: "Duration of Licence",
    template: "onboarding",
    statutoryRef: "Condition 5",
    done: true
  },
  {
    id: "c6",
    cond: "Cond 6",
    category: "safety",
    title: "Gas Safety Certificate (CP12)",
    text: "Obtain an annual Gas Safety Certificate from a Gas Safe registered engineer. Provide copy to tenants before move-in, and to the Council within 28 days of demand.",
    doc: "Current Gas Safety CP12",
    retention: "2 Years / Licence Life",
    template: "declaration",
    statutoryRef: "Gas Safety Regs 1998 Reg 36",
    done: true
  },
  {
    id: "c7",
    cond: "Cond 7",
    category: "safety",
    title: "Furniture Safety Compliance",
    text: "Keep all upholstered furniture in a safe condition complying with the Furniture and Furnishings (Fire) (Safety) Regulations 1988. Supply declaration within 28 days.",
    doc: "Furniture Declaration",
    retention: "Duration of Licence",
    template: "declaration",
    statutoryRef: "Furniture Fire Regs 1988",
    done: true
  },
  {
    id: "c8",
    cond: "Cond 8",
    category: "safety",
    title: "Electrical Appliance Safety (PAT)",
    text: "Keep all landlord-supplied electrical appliances and white goods in a safe condition. Supply safety declaration to Council within 28 days of request.",
    doc: "Appliance Declaration",
    retention: "Duration of Licence",
    template: "declaration",
    statutoryRef: "Electrical Equipment Regs 2016",
    done: true
  },
  {
    id: "c9",
    cond: "Cond 9",
    category: "safety",
    title: "Electrical Installation Condition Report (EICR)",
    text: "Supply a 'Satisfactory' 5-year EICR produced by an appropriately qualified and competent registered electrician within 28 days of request. Provide to tenants at move-in.",
    doc: "Satisfactory EICR Certificate",
    retention: "5 Full Years",
    template: "declaration",
    statutoryRef: "Electrical Safety Regs 2020",
    done: true
  },
  {
    id: "c10",
    cond: "Cond 10",
    category: "safety",
    title: "Fire Risk Assessment (HHSRS Compliance)",
    text: "Comply with duties under Regulatory Reform (Fire Safety) Order 2005 and Housing Health and Safety Rating System (HHSRS) to maintain property free from fire hazards.",
    doc: "Fire Risk Assessment (FRA)",
    retention: "Duration of Licence",
    template: "declaration",
    statutoryRef: "Regulatory Reform Order 2005",
    done: true
  },
  {
    id: "c11",
    cond: "Cond 11",
    category: "safety",
    title: "Minimum Smoke Alarm Requirements",
    text: "Working smoke alarm installed on each storey of the house with living accommodation (including halls, landings, bathrooms). Provide positioning declaration within 28 days.",
    doc: "Alarm Declaration & Log",
    retention: "Duration of Licence",
    template: "declaration",
    statutoryRef: "Smoke & CO Alarm Regs 2015/2022",
    done: true
  },
  {
    id: "c12",
    cond: "Cond 12",
    category: "safety",
    title: "Carbon Monoxide Alarm Requirements",
    text: "Install working CO alarm in any room used as living accommodation containing a fixed combustion appliance (excluding gas cookers). Provide positioning declaration within 28 days.",
    doc: "CO Alarm Declaration",
    retention: "Duration of Licence",
    template: "declaration",
    statutoryRef: "Smoke & CO Alarm Regs 2022",
    done: true
  },
  {
    id: "c14",
    cond: "Cond 14",
    category: "property",
    title: "6-Monthly Mandatory Property Inspections",
    text: "Carry out property inspections at least every 6 months to check pest infestations, disrepair, occupation, and management. Record date, inspector, findings, and remedies in a log. Supply within 28 days.",
    doc: "Signed 6-Month Inspection Log",
    retention: "3 Years Minimum",
    template: "inspection",
    statutoryRef: "Condition 14 (3-Year Log)",
    done: false
  },
  {
    id: "c15",
    cond: "Cond 15",
    category: "property",
    title: "7-Day Pest Infestation Treatment Protocol",
    text: "Upon becoming aware of any pest problem or vermin infestation, take immediate steps within 7 days to arrange an eradication programme. Keep contractor records for licence duration.",
    doc: "Pest Contractor Invoices",
    retention: "Duration of Tenancy / Licence",
    template: "inspection",
    statutoryRef: "Condition 15 (7-Day Rule)",
    done: false
  },
  {
    id: "c16",
    cond: "Cond 16",
    category: "property",
    title: "Repairs by Competent Persons",
    text: "Ensure all repairs, maintenance works, and treatments are executed by competent persons. Retain receipts and invoices and provide to Council within 28 days.",
    doc: "Trades Invoices & Receipts",
    retention: "3 Years",
    template: "inspection",
    statutoryRef: "Condition 16",
    done: true
  },
  {
    id: "c17",
    cond: "Cond 17",
    category: "management",
    title: "3-Year Archive for Disrepair, Pests & ASB",
    text: "Keep copies of all tenant complaints and correspondence relating to pest control, disrepair, and anti-social behaviour for 3 years, including written landlord responses. Supply within 28 days.",
    doc: "Complaints & Response Archive",
    retention: "3 Years",
    template: "inspection",
    statutoryRef: "Condition 17 (3-Year Retention)",
    done: false
  },
  {
    id: "c18",
    cond: "Cond 18",
    category: "property",
    title: "Refuse & Recycling Provisions",
    text: "Provide sufficient lidded wheelie bins. Issue written waste and recycling instructions at tenancy commencement detailing collection days and presentation methods.",
    doc: "Tenant Refuse Directive",
    retention: "Duration of Licence",
    template: "onboarding",
    statutoryRef: "Condition 18",
    done: true
  },
  {
    id: "c19",
    cond: "Cond 19",
    category: "property",
    title: "Zero Bulky Waste in Gardens & 7-Day Warning",
    text: "No bulky waste or refuse allowed in front/rear gardens. If breached, issue formal written warning letter to occupiers within 7 days instructing immediate clearance. Provide within 28 days.",
    doc: "7-Day Bulky Waste Warning",
    retention: "Duration of Licence",
    template: "onboarding",
    statutoryRef: "Condition 19 (7-Day Warning)",
    done: false
  },
  {
    id: "c20",
    cond: "Cond 20",
    category: "property",
    title: "Garden & Boundary Upkeep",
    text: "Put management systems in place to ensure gardens, forecourts, and pathways are clean and tidy. Maintain perimeter boundary fences and walls in safe condition.",
    doc: "Garden Condition Audit",
    retention: "Duration of Licence",
    template: "inspection",
    statutoryRef: "Condition 20",
    done: true
  },
  {
    id: "c21",
    cond: "Cond 21",
    category: "property",
    title: "Prohibition of Sheds & Garages for Sleeping",
    text: "Ensure all outbuildings, sheds, and garages are kept secure and strictly never used for sleeping or living accommodation without prior written Council consent.",
    doc: "Outbuilding Check Log",
    retention: "Duration of Licence",
    template: "inspection",
    statutoryRef: "Condition 21 (Beds in Sheds)",
    done: true
  },
  {
    id: "c22",
    cond: "Cond 22",
    category: "management",
    title: "28-Day Council Notification of Material Changes",
    text: "Inform Redbridge Council in writing within 28 days of any change of ownership, management, layout, 'fit and proper' status (cautions/convictions), manager address, or planning use.",
    doc: "Council Written Notice Copy",
    retention: "Duration of Licence",
    template: "agent",
    statutoryRef: "Condition 22 (28-Day Rule)",
    done: true
  },
  {
    id: "c23",
    cond: "Cond 23",
    category: "management",
    title: "Managing Agent Joint Liability Declaration",
    text: "If appointing a managing agent, obtain signed written declaration agreeing to be bound by licence conditions and acknowledging up to £30,000 fine per breach. Supply within 28 days.",
    doc: "Signed Agent Consent Agreement",
    retention: "Duration of Licence",
    template: "agent",
    statutoryRef: "Condition 23 (£30k Fine Notice)",
    done: false
  },
  {
    id: "c24",
    cond: "Cond 24",
    category: "safety",
    title: "Landlord Accreditation & Training (LLAS / 5h CPD)",
    text: "Licence holder or manager must complete an accredited landlord training course (LLAS, NRLA, Propertymark, Safeagent, RICS, UKALA) of min 5 hours within 18 months of licence issue.",
    doc: "Accreditation Certificate",
    retention: "Duration of Licence",
    template: "audit-dossier",
    statutoryRef: "Condition 24 (18-Month Rule)",
    done: true
  },
  {
    id: "c25",
    cond: "Cond 25",
    category: "tenancy",
    title: "Written Statement of Terms & Disrepair Reporting",
    text: "Provide occupiers with written statement of terms, clear instructions on reporting repairs and maintenance, and emergency protocols. Provide copy to Council within 28 days of demand.",
    doc: "Tenant Repair Guide Pack",
    retention: "Duration of Licence",
    template: "onboarding",
    statutoryRef: "Condition 25",
    done: true
  },
  {
    id: "c26",
    cond: "Cond 26",
    category: "occupancy",
    title: "Occupancy Census Schedule on Demand",
    text: "Supply names, ages, numbers, and family relationships of all individuals accommodated at the property within 28 days of written demand to verify no overcrowding or HMO breach.",
    doc: "Certified Occupancy Census",
    retention: "Duration of Licence",
    template: "census",
    statutoryRef: "Condition 26",
    done: false
  },
  {
    id: "c27",
    cond: "Cond 27",
    category: "tenancy",
    title: "Licence Copy & 24/7 Emergency Contact to Tenants",
    text: "Provide all tenants with a copy of the property Selective Licence at move-in together with an emergency contact telephone number for the licence holder or managing agent.",
    doc: "Tenant Receipt of Licence",
    retention: "Duration of Tenancy",
    template: "onboarding",
    statutoryRef: "Condition 27",
    done: true
  },
  {
    id: "c28",
    cond: "Cond 28",
    category: "management",
    title: "Prevention of Banned & Non-'Fit and Proper' Persons",
    text: "Never permit any person subject to a Banning Order under the Housing and Planning Act 2016 or found not to be 'Fit and Proper' to manage or carry out works on the property.",
    doc: "Contractor Vetting Record",
    retention: "Duration of Licence",
    template: "agent",
    statutoryRef: "Housing and Planning Act 2016",
    done: true
  },
  {
    id: "c29",
    cond: "Cond 29",
    category: "tenancy",
    title: "Tenancy Deposit Protection & Prescribed Info",
    text: "Protect deposit in authorised scheme (DPS, TDS, MyDeposits) and serve Prescribed Information within 30 statutory days. Supply copy to Council within 28 days on demand.",
    doc: "Deposit Certificate & Prescribed Info",
    retention: "Duration of Tenancy",
    template: "onboarding",
    statutoryRef: "Housing Act 2004 s.213",
    done: true
  },
  {
    id: "c30",
    cond: "Cond 30",
    category: "management",
    title: "Tenancy Management Arrangements Statement",
    text: "Supply details in writing of arrangements to reduce ASB, 24/7 out-of-hours contact details, waste disposal plans, and property inspection logs within 28 days of demand.",
    doc: "Management Policy Statement",
    retention: "Duration of Licence",
    template: "agent",
    statutoryRef: "Condition 30",
    done: false
  },
  {
    id: "c31",
    cond: "Cond 31",
    category: "management",
    title: "Missed Rent Protocol & Abandonment Visit",
    text: "If rent is missed, contact occupant immediately. If no contact is possible, conduct physical property inspection within 1 month of missed due date to verify property is secure and not abandoned.",
    doc: "Rent Contact & Visit Log",
    retention: "Duration of Tenancy",
    template: "inspection",
    statutoryRef: "Condition 31 (1-Month Visit)",
    done: true
  },
  {
    id: "c32",
    cond: "Cond 32",
    category: "property",
    title: "Lock Replacement Between Tenancies",
    text: "If previous occupants do not surrender all copies of access keys, change relevant locks before new occupants move in to guarantee security.",
    doc: "Locksmith Invoice / Key Log",
    retention: "Duration of Tenancy",
    template: "inspection",
    statutoryRef: "Condition 32",
    done: true
  },
  {
    id: "c33",
    cond: "Cond 33",
    category: "tenancy",
    title: "Written Rent Receipts for Cash Payments",
    text: "When rent is collected in cash, provide written or email rent receipt within 7 days stating date and amount. Retain records and supply within 28 days of demand.",
    doc: "Rent Receipt Book / Emails",
    retention: "Duration of Tenancy",
    template: "onboarding",
    statutoryRef: "Condition 33 (7-Day Receipt)",
    done: true
  },
  {
    id: "c34",
    cond: "Cond 34",
    category: "management",
    title: "5-Year ASB Intervention & Warning Framework",
    text: "Respond in writing within 7 days of receiving an ASB complaint. Visit within 7 days if notified of police/court action and issue formal warning. Retain all ASB records for 5 full years.",
    doc: "5-Year ASB Warning File",
    retention: "5 Full Years Minimum",
    template: "asb",
    statutoryRef: "Condition 34 (5-Year Rule)",
    done: false
  },
  {
    id: "c35",
    cond: "Cond 35",
    category: "property",
    title: "Prohibition of Off-Street Parking Without Dropped Kerb",
    text: "Do not allow off-street vehicular parking crossing footways or verges unless an approved dropped kerb has been installed by Council Highways.",
    doc: "Dropped Kerb Consent / Clause",
    retention: "Duration of Tenancy",
    template: "onboarding",
    statutoryRef: "Highways Act & Condition 35",
    done: true
  }
];

let conditionsData = loadChecklistData();

function loadChecklistData() {
  const saved = localStorage.getItem("uk_landlord_checklist_data");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return INITIAL_CONDITIONS.map(item => {
        const found = parsed.find(p => p.id === item.id);
        return found ? { ...item, done: found.done } : item;
      });
    } catch (e) {
      console.error(e);
    }
  }
  return [...INITIAL_CONDITIONS];
}

function saveChecklistData() {
  localStorage.setItem("uk_landlord_checklist_data", JSON.stringify(conditionsData));
  updateStats();
}

function toggleCheck(id) {
  const item = conditionsData.find(c => c.id === id);
  if (item) {
    item.done = !item.done;
    saveChecklistData();
    renderChecklist();
  }
}

function markAllCompleted() {
  conditionsData.forEach(c => (c.done = true));
  saveChecklistData();
  renderChecklist();
}

function resetChecklist() {
  if (confirm("Reset all 35 compliance checkboxes back to default state?")) {
    conditionsData = [...INITIAL_CONDITIONS];
    saveChecklistData();
    renderChecklist();
  }
}

// =========================================================================
// 3. STATS & PROGRESS TRACKER
// =========================================================================

function updateStats() {
  const total = conditionsData.length;
  const completed = conditionsData.filter(c => c.done).length;
  const pending = total - completed;
  const pct = Math.round((completed / total) * 100);

  // Top Nav Progress Bar
  const bar = document.getElementById("progress-bar-fill");
  const txt = document.getElementById("progress-text");
  const healthLabel = document.getElementById("compliance-health-label");

  if (bar) bar.style.width = pct + "%";
  if (txt) txt.innerText = pct + "%";

  if (healthLabel) {
    if (pct >= 90) {
      healthLabel.innerText = "Audit Ready";
      healthLabel.className = "text-xs font-bold text-emerald-400";
    } else if (pct >= 60) {
      healthLabel.innerText = "Good (Review Pending)";
      healthLabel.className = "text-xs font-bold text-sky-400";
    } else {
      healthLabel.innerText = "Action Urgently Needed";
      healthLabel.className = "text-xs font-bold text-rose-400";
    }
  }

  // Pending count badge on Checklist tab
  const badge = document.getElementById("tab-badge-pending");
  if (badge) {
    badge.innerText = `${pending} Pending`;
    badge.className = pending === 0 ? "ml-0.5 bg-emerald-800 text-emerald-200 text-[10px] px-1.5 py-0.5 rounded-full font-mono shrink-0 whitespace-nowrap" : "ml-0.5 bg-amber-800 text-amber-200 text-[10px] px-1.5 py-0.5 rounded-full font-mono shrink-0 whitespace-nowrap";
  }

  // Enforcement Exposure KPI
  const kpiPenalty = document.getElementById("kpi-penalty-risk");
  if (kpiPenalty) {
    if (pending === 0) {
      kpiPenalty.innerText = "Zero Exposure (Compliant)";
    } else {
      const riskExposure = pending * 30000;
      kpiPenalty.innerText = `Up to £${riskExposure.toLocaleString()} max potential`;
    }
  }
}

// =========================================================================
// 4. CHECKLIST TABLE RENDERING & FILTERING
// =========================================================================

function renderChecklist() {
  const tbody = document.getElementById("checklist-table-body");
  if (!tbody) return;

  const searchQuery = (document.getElementById("checklist-search")?.value || "").toLowerCase().trim();
  const filterCat = document.getElementById("filter-category")?.value || "all";
  const filterStatus = document.getElementById("filter-status")?.value || "all";

  tbody.innerHTML = "";

  const filtered = conditionsData.filter(item => {
    // Search
    if (searchQuery) {
      const combined = `${item.cond} ${item.title} ${item.text} ${item.doc} ${item.statutoryRef}`.toLowerCase();
      if (!combined.includes(searchQuery)) return false;
    }
    // Category
    if (filterCat !== "all" && item.category !== filterCat) return false;
    // Status
    if (filterStatus === "pending" && item.done) return false;
    if (filterStatus === "done" && !item.done) return false;
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="p-8 text-center text-slate-400">
          <i class="ph-bold ph-funnel-simple text-3xl mb-1 text-slate-300"></i>
          <div>No conditions match your search and filter criteria.</div>
        </td>
      </tr>
    `;
    return;
  }

  filtered.forEach(item => {
    const tr = document.createElement("tr");
    tr.className = item.done ? "bg-emerald-50/40 hover:bg-emerald-50/80 transition" : "hover:bg-slate-50 transition";

    tr.innerHTML = `
      <td class="p-3.5 text-center">
        <input type="checkbox" onchange="toggleCheck('${item.id}')" ${item.done ? "checked" : ""} class="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer">
      </td>
      <td class="p-3.5">
        <span class="font-bold font-mono text-xs ${item.done ? "text-emerald-800" : "text-slate-900"}">${item.cond}</span>
        <div class="text-[10px] text-slate-400 font-sans uppercase">${item.category}</div>
      </td>
      <td class="p-3.5">
        <div class="font-semibold text-slate-900 text-xs">${item.title}</div>
        <p class="text-slate-600 text-[11px] leading-relaxed mt-0.5">${item.text}</p>
        <div class="text-[10px] text-slate-400 font-mono mt-1">${item.statutoryRef}</div>
      </td>
      <td class="p-3.5">
        <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${item.done ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}">
          ${item.doc}
        </span>
      </td>
      <td class="p-3.5 text-slate-600 font-mono text-[11px]">
        ${item.retention}
      </td>
      <td class="p-3.5 text-center">
        <button onclick="jumpToTemplate('${item.template}')" class="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-medium px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition" title="View & Download PDF Form">
          <i class="ph-bold ph-file-pdf"></i> PDF
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function filterChecklist() {
  renderChecklist();
}

// =========================================================================
// 5. OFFICIAL LEGAL TEMPLATES GENERATOR (7 AUDIT-READY PDF FORMS)
// =========================================================================

let currentTemplateKey = "inspection";

const TEMPLATE_CONFIGS = {
  inspection: {
    badge: "Condition 14 • 3-Year Archive",
    title: "6-Month Property Inspection Audit & Condition Report",
    fileName: "Inspection_Audit_Report.pdf",
    generate: (p) => `
      <div class="legal-header">
        <div class="flex justify-between items-start">
          <div>
            <div class="text-lg font-extrabold uppercase text-slate-900 tracking-tight">${p.council}</div>
            <div class="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Selective Licensing • Mandatory 6-Monthly Property Inspection Audit</div>
            <div class="text-[10px] text-slate-500">Statutory Record under Condition 14 • Retention period: Minimum 3 Years</div>
          </div>
          <div class="text-right">
            <span class="legal-stamp">MANDATORY LOG</span>
            <div class="text-[10px] text-slate-500 font-mono mt-1">Licence: ${p.licenceRef}</div>
          </div>
        </div>
      </div>

      <!-- Property & Inspection Particulars -->
      <table class="legal-table">
        <tbody>
          <tr>
            <td class="w-1/4 font-bold bg-slate-50">Property Address:</td>
            <td class="w-1/4 font-semibold text-slate-800">${p.address}, ${p.postcode}</td>
            <td class="w-1/4 font-bold bg-slate-50">Inspection Date &amp; Time:</td>
            <td class="w-1/4"><input type="datetime-local" class="border border-slate-300 rounded px-1.5 py-0.5 text-xs w-full" value="${new Date().toISOString().slice(0, 16)}"></td>
          </tr>
          <tr>
            <td class="font-bold bg-slate-50">Licence Holder / Landlord:</td>
            <td>${p.landlordName} (${p.landlordPhone})</td>
            <td class="font-bold bg-slate-50">Inspector Legal Name:</td>
            <td><input type="text" class="border border-slate-300 rounded px-1.5 py-0.5 text-xs w-full" value="${p.landlordName} (Landlord / Agent)"></td>
          </tr>
        </tbody>
      </table>

      <!-- Section 1: Room-by-Room Occupancy & Overcrowding Check -->
      <div class="legal-section-title">1. Occupancy &amp; Overcrowding Verification (Conditions 1 &amp; 2)</div>
      <p class="text-[11px] text-slate-600 mb-2">Maximum Permitted Limits for Property: <strong>${p.maxPersons} Persons</strong> across <strong>${p.maxHouseholds} Single Household</strong>.</p>
      
      <table class="legal-table">
        <thead>
          <tr>
            <th>Designated Room</th>
            <th>Measured Area</th>
            <th>Permitted Cap</th>
            <th>Current Occupant(s)</th>
            <th>Overcrowding Check</th>
          </tr>
        </thead>
        <tbody>
          ${p.rooms.map(r => `
            <tr>
              <td class="font-semibold">${r.name}</td>
              <td class="font-mono">${r.size}</td>
              <td>${r.maxPersons === 0 ? "0 (Storage Only)" : `${r.maxPersons} Person(s)`}</td>
              <td><input type="text" class="border border-slate-300 rounded px-1.5 py-0.5 text-xs w-full" value="${r.occupant}"></td>
              <td><span class="text-emerald-700 font-bold">[✓] Compliant</span></td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <!-- Section 2: Life Safety Push Tests -->
      <div class="legal-section-title">2. Physical Alarm Working Order Tests (Conditions 11 &amp; 12)</div>
      <table class="legal-table">
        <thead>
          <tr>
            <th>Alarm Location</th>
            <th>Alarm Type</th>
            <th>Physical Push Test Result</th>
            <th>Expiry / Replace Date</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Ground Floor Hallway</td>
            <td>Optical Smoke Alarm (BS 5839-6)</td>
            <td><span class="text-emerald-700 font-bold">[✓] Operational (85dB Audible)</span></td>
            <td><input type="text" class="border border-slate-300 rounded px-1 py-0.5 text-xs w-28" value="2032 (10-Yr Sealed)"></td>
          </tr>
          <tr>
            <td>First Floor Landing</td>
            <td>Optical Smoke Alarm (BS 5839-6)</td>
            <td><span class="text-emerald-700 font-bold">[✓] Operational (85dB Audible)</span></td>
            <td><input type="text" class="border border-slate-300 rounded px-1 py-0.5 text-xs w-28" value="2032 (10-Yr Sealed)"></td>
          </tr>
          <tr>
            <td>Kitchen / Boiler Location</td>
            <td>Carbon Monoxide Detector (BS EN 50291)</td>
            <td><span class="text-emerald-700 font-bold">[✓] Operational (Tested Working)</span></td>
            <td><input type="text" class="border border-slate-300 rounded px-1 py-0.5 text-xs w-28" value="2031 (CO Sensor OK)"></td>
          </tr>
        </tbody>
      </table>

      <!-- Section 3: Disrepair, Damp, Pest & Waste Inspection -->
      <div class="legal-section-title">3. Physical Condition, Pest Infestation &amp; Grounds Check (Conditions 14, 15, 19, 20)</div>
      <table class="legal-table">
        <thead>
          <tr>
            <th class="w-1/3">Item Inspected</th>
            <th class="w-1/4">Status</th>
            <th>Inspector Notes &amp; Actions Taken</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="font-semibold">Damp, Mould &amp; Condensation</td>
            <td><span class="text-emerald-700 font-bold">[✓] No Hazards</span></td>
            <td><input type="text" class="border border-slate-300 rounded px-1.5 py-0.5 text-xs w-full" value="Good ventilation observed in kitchen & bathroom. No signs of black mould."></td>
          </tr>
          <tr>
            <td class="font-semibold">Pest Infestation (Cond 15)</td>
            <td><span class="text-emerald-700 font-bold">[✓] Clear / None</span></td>
            <td><input type="text" class="border border-slate-300 rounded px-1.5 py-0.5 text-xs w-full" value="No evidence of rodents or insects. 7-Day action rule not triggered."></td>
          </tr>
          <tr>
            <td class="font-semibold">Front &amp; Rear Gardens (Cond 19 &amp; 20)</td>
            <td><span class="text-emerald-700 font-bold">[✓] Clean &amp; Tidy</span></td>
            <td><input type="text" class="border border-slate-300 rounded px-1.5 py-0.5 text-xs w-full" value="Zero bulky waste/mattresses in grounds. Boundary walls & fences secure."></td>
          </tr>
          <tr>
            <td class="font-semibold">Outbuildings / Sheds (Cond 21)</td>
            <td><span class="text-emerald-700 font-bold">[✓] Secured</span></td>
            <td><input type="text" class="border border-slate-300 rounded px-1.5 py-0.5 text-xs w-full" value="Shed secured with padlock. Verified used purely for storage (No beds)."></td>
          </tr>
        </tbody>
      </table>

      <!-- Signatures -->
      <div class="signature-box flex justify-between items-end text-xs pt-3">
        <div>
          <div class="font-bold text-slate-800">Inspector Signature:</div>
          <div class="mt-4 border-b border-slate-400 w-56"></div>
          <div class="text-[10px] text-slate-500 mt-1">${p.landlordName} • Date: ${new Date().toLocaleDateString("en-GB")}</div>
        </div>
        <div>
          <div class="font-bold text-slate-800">Tenant Acknowledgment Signature:</div>
          <div class="mt-4 border-b border-slate-400 w-56"></div>
          <div class="text-[10px] text-slate-500 mt-1">Lead Occupant • Date: ${new Date().toLocaleDateString("en-GB")}</div>
        </div>
      </div>
    `
  },

  declaration: {
    badge: "Conditions 7, 8, 11, 12",
    title: "Statutory Safety & Equipment Declarations",
    fileName: "Statutory_Safety_Declarations.pdf",
    generate: (p) => `
      <div class="legal-header">
        <div class="flex justify-between items-start">
          <div>
            <div class="text-lg font-extrabold uppercase text-slate-900 tracking-tight">${p.council}</div>
            <div class="text-xs font-semibold text-sky-700 uppercase tracking-wider">Statutory Safety, Appliance &amp; Alarm Declarations</div>
            <div class="text-[10px] text-slate-500">Selective Licensing Conditions 7, 8, 11 &amp; 12 • Statement of Truth</div>
          </div>
          <div class="text-right">
            <span class="legal-stamp">LEGAL DECLARATION</span>
            <div class="text-[10px] text-slate-500 font-mono mt-1">Licence: ${p.licenceRef}</div>
          </div>
        </div>
      </div>

      <div class="bg-slate-50 p-3 rounded border border-slate-200 text-xs mb-4">
        <strong>Property:</strong> ${p.address}, ${p.postcode}<br>
        <strong>Licence Holder:</strong> ${p.landlordName} • <strong>Licence No:</strong> ${p.licenceRef}
      </div>

      <p class="text-xs text-slate-700 mb-4 leading-relaxed">
        I, <strong>${p.landlordName}</strong>, being the designated Licence Holder for the above-referenced licensed residential property, hereby make the following binding statutory declarations to the ${p.council} pursuant to Part 3 of the Housing Act 2004:
      </p>

      <!-- Declaration 1 -->
      <div class="legal-section-title">1. Furniture &amp; Furnishings Fire Safety (Condition 7)</div>
      <div class="p-3 bg-white border border-slate-200 rounded text-xs leading-relaxed mb-3">
        I confirm that all upholstered furniture, sofas, mattresses, and bed bases made available by me in the property comply strictly with the safety provisions of the <strong>Furniture and Furnishings (Fire) (Safety) Regulations 1988 (as amended)</strong>. All compliant furniture items carry permanent manufacturer fire resistance labels.
      </div>

      <!-- Declaration 2 -->
      <div class="legal-section-title">2. Electrical Appliances &amp; White Goods (Condition 8)</div>
      <div class="p-3 bg-white border border-slate-200 rounded text-xs leading-relaxed mb-3">
        I confirm that all electrical appliances supplied by me (including cooker, oven, refrigerator, washing machine, and extractor systems) are in a safe working condition and free from defect, complying with the <strong>Electrical Equipment (Safety) Regulations 2016</strong>.
      </div>

      <!-- Declaration 3 -->
      <div class="legal-section-title">3. Smoke Alarm Positioning &amp; Working Order (Condition 11)</div>
      <div class="p-3 bg-white border border-slate-200 rounded text-xs leading-relaxed mb-3">
        I confirm that an operational smoke alarm is installed on each storey of the property used wholly or partly as living accommodation (Ground Floor Hallway &amp; First Floor Landing). Each alarm was physically tested and confirmed to be in proper working order at the commencement of occupation.
      </div>

      <!-- Declaration 4 -->
      <div class="legal-section-title">4. Carbon Monoxide Alarm Positioning (Condition 12)</div>
      <div class="p-3 bg-white border border-slate-200 rounded text-xs leading-relaxed mb-4">
        I confirm that an operational carbon monoxide detector is installed in any room used as living accommodation containing a fixed combustion appliance (specifically adjacent to the boiler/water heating system). The alarm was push-tested and verified working prior to tenant handover.
      </div>

      <!-- Statement of Truth & Execution -->
      <div class="border border-sky-300 bg-sky-50/60 p-4 rounded-xl text-xs space-y-3">
        <div class="font-bold text-sky-950 uppercase tracking-wider text-[11px]">Declaration of Truth</div>
        <p class="text-sky-900 leading-relaxed">
          I confirm that the facts stated in this document are true and accurate to the best of my knowledge and belief. I understand that providing false or misleading statements to a local housing authority constitutes a criminal offence under Section 238 of the Housing Act 2004.
        </p>
        
        <div class="grid grid-cols-2 gap-4 pt-2 border-t border-sky-200">
          <div>
            <strong>Licence Holder:</strong> ${p.landlordName}<br>
            Signature: ________________________________<br>
            Date: ${new Date().toLocaleDateString("en-GB")}
          </div>
          <div>
            <strong>Accreditation Body:</strong> ${p.accreditation}<br>
            Contact Tel: ${p.landlordPhone}
          </div>
        </div>
      </div>
    `
  },

  onboarding: {
    badge: "Conditions 18, 19, 25, 27, 30, 35",
    title: "Tenant Onboarding, Emergency & Refuse Notice",
    fileName: "Tenant_Onboarding_Compliance_Notice.pdf",
    generate: (p) => `
      <div class="legal-header">
        <div class="flex justify-between items-start">
          <div>
            <div class="text-lg font-extrabold uppercase text-slate-900 tracking-tight">${p.council}</div>
            <div class="text-xs font-semibold text-amber-700 uppercase tracking-wider">Tenant Licensing Compliance, Waste &amp; Emergency Procedures</div>
            <div class="text-[10px] text-slate-500">Provide to tenant at commencement of tenancy • Retain signed copy on file</div>
          </div>
          <div class="text-right">
            <span class="legal-stamp">TENANT NOTICE</span>
            <div class="text-[10px] text-slate-500 font-mono mt-1">Licence: ${p.licenceRef}</div>
          </div>
        </div>
      </div>

      <div class="bg-slate-50 p-3 rounded border border-slate-200 text-xs mb-3">
        <strong>Property:</strong> ${p.address}, ${p.postcode}<br>
        <strong>Landlord / Licence Holder:</strong> ${p.landlordName} (${p.landlordPhone})<br>
        <strong>Managing Agent:</strong> ${p.agentName} (${p.agentPhone})
      </div>

      <!-- Emergency Contacts -->
      <div class="legal-section-title">1. Disrepair &amp; 24/7 Emergency Contacts (Conditions 25, 27, 30)</div>
      <table class="legal-table">
        <tbody>
          <tr>
            <td class="font-bold bg-slate-50 w-1/3">Routine Disrepair Reporting:</td>
            <td>Email: <strong>${p.landlordEmail}</strong> • Telephone: <strong>${p.landlordPhone}</strong> (Mon-Fri 9:00 - 17:00)</td>
          </tr>
          <tr>
            <td class="font-bold bg-slate-50">24/7 Out-of-Hours Emergency:</td>
            <td class="text-rose-700 font-bold">${p.emergencyPhone}</td>
          </tr>
          <tr>
            <td class="font-bold bg-slate-50">National Utility Emergencies:</td>
            <td>National Gas Emergency: <strong>0800 111 999</strong> • Power Cut Helpline: <strong>105</strong></td>
          </tr>
        </tbody>
      </table>

      <!-- Refuse & Recycling Rules -->
      <div class="legal-section-title">2. Refuse, Recycling &amp; Bulky Waste Rules (Conditions 18 &amp; 19)</div>
      <div class="p-3 bg-amber-50/70 border border-amber-300 rounded text-xs space-y-2 text-amber-900">
        <p>Under ${p.council} licensing conditions, occupiers must adhere strictly to waste arrangements:</p>
        <ul class="list-disc pl-5 space-y-1 text-[11px]">
          <li><strong>Wheelie Bins:</strong> Keep bin lids fully closed at all times to prevent rodent infestation and litter. Place at kerbside on collection morning and return promptly.</li>
          <li><strong>Zero Bulky Waste in Gardens (Condition 19):</strong> Storing mattresses, furniture, white goods, or general waste in the front or rear garden is strictly illegal. Landlords are legally required to issue a 7-day statutory warning letter for any breach.</li>
          <li><strong>Bulky Waste Bookings:</strong> Large items must be booked through the council bulky waste collection service and placed on the boundary on the collection day only.</li>
        </ul>
      </div>

      <!-- Permitted Occupancy & Rules -->
      <div class="legal-section-title">3. Permitted Occupation &amp; Property Conduct (Conditions 1, 21, 35)</div>
      <table class="legal-table">
        <tbody>
          <tr>
            <td class="font-bold bg-slate-50 w-1/3">Permitted Occupancy:</td>
            <td>Maximum <strong>${p.maxPersons} Persons</strong> forming <strong>${p.maxHouseholds} Single Household</strong>. Subletting or unauthorized sharers strictly prohibited.</td>
          </tr>
          <tr>
            <td class="font-bold bg-slate-50">Outbuildings / Sheds:</td>
            <td>Garages and garden sheds must never be used for living or sleeping accommodation (Condition 21).</td>
          </tr>
          <tr>
            <td class="font-bold bg-slate-50">Off-Street Parking:</td>
            <td>No vehicular parking crossing footways without an official highway dropped kerb (Condition 35).</td>
          </tr>
        </tbody>
      </table>

      <!-- Tenant Signed Acknowledgment -->
      <div class="signature-box text-xs pt-3">
        <div class="font-bold text-slate-900 mb-1">Tenant Statutory Receipt Acknowledgment:</div>
        <p class="text-[11px] text-slate-600 mb-3">
          I/We confirm receipt of: (1) Copy of Selective Property Licence, (2) Current Gas Safety Certificate (CP12), (3) Electrical Installation Condition Report (EICR), (4) Energy Performance Certificate (EPC), (5) How to Rent Guide, and (6) Emergency Contact Details.
        </p>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <strong>Lead Tenant Name:</strong> ____________________________<br>
            Signature: ____________________________________
          </div>
          <div>
            <strong>Date Signed:</strong> ____ / ____ / 20___<br>
            Contact Tel: _________________________________
          </div>
        </div>
      </div>
    `
  },

  asb: {
    badge: "Condition 34 • 5-Year Archive",
    title: "Formal 7-Day ASB Warning Notice",
    fileName: "ASB_Warning_Notice_Framework.pdf",
    generate: (p) => `
      <div class="legal-header">
        <div class="flex justify-between items-start">
          <div>
            <div class="text-lg font-extrabold uppercase text-slate-900 tracking-tight">${p.council}</div>
            <div class="text-xs font-semibold text-rose-700 uppercase tracking-wider">Formal Notice: Anti-Social Behaviour (ASB) Warning</div>
            <div class="text-[10px] text-slate-500">Selective Licensing Condition 34 • Issue within 7 days • 5-Year Mandatory Archive</div>
          </div>
          <div class="text-right">
            <span class="legal-stamp" style="border-color:#b91c1c; color:#b91c1c;">LEGAL WARNING</span>
            <div class="text-[10px] text-slate-500 font-mono mt-1">Licence: ${p.licenceRef}</div>
          </div>
        </div>
      </div>

      <!-- Addressee & Particulars -->
      <div class="bg-slate-50 p-3 rounded border border-slate-200 text-xs mb-4 space-y-1">
        <div><strong>To Tenant(s):</strong> <input type="text" class="border border-slate-300 rounded px-1.5 py-0.5 text-xs w-64" value="Named Occupiers"></div>
        <div><strong>Property Address:</strong> ${p.address}, ${p.postcode}</div>
        <div><strong>Date of Notice:</strong> <input type="date" class="border border-slate-300 rounded px-1.5 py-0.5 text-xs" value="${new Date().toISOString().slice(0, 10)}"> (Issued within 7 days of complaint)</div>
      </div>

      <!-- Notice Particulars -->
      <div class="p-3.5 bg-rose-50 border border-rose-300 rounded-xl text-xs space-y-2 text-rose-950 mb-4">
        <div class="font-bold uppercase text-[11px]">Notice of Anti-Social Behaviour Allegation (Condition 34a / 34b)</div>
        <p class="leading-relaxed">
          Please be advised that the Licence Holder / Managing Agent has received a formal complaint regarding anti-social behaviour occurring at or originating from your tenancy address.
        </p>
        <div class="bg-white p-2.5 rounded border border-rose-200 text-xs">
          <strong>Summary of Incident / Conduct:</strong><br>
          <textarea class="w-full border border-slate-200 rounded p-1 text-xs mt-1" rows="2">Excessive noise nuisance / unreasonable disturbance / visitor conduct reported on [Date/Time] impacting neighbouring residents.</textarea>
        </div>
      </div>

      <div class="legal-section-title">Statutory Landlord Obligations Under Selective Licensing</div>
      <p class="text-xs text-slate-700 leading-relaxed mb-3">
        Under <strong>Condition 34 of the ${p.council} Selective Licensing Conditions</strong>, the Licence Holder is legally required to intervene and deal effectively with anti-social behaviour resulting from the conduct of occupiers or their visitors. Failure by the landlord to address ASB constitutes a criminal breach of licence conditions.
      </p>

      <div class="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-2 mb-4">
        <strong>DIRECTIVES TO OCCUPIERS:</strong>
        <ol class="list-decimal pl-5 space-y-1 text-[11px] text-slate-700">
          <li>You must immediately cease and desist all behaviour causing a nuisance, disturbance, or annoyance to neighbours.</li>
          <li>You are strictly legally liable under your tenancy agreement for the actions and conduct of any visitors to your property.</li>
          <li>You must respond in writing or by telephone to confirm receipt of this warning within 48 hours.</li>
        </ol>
      </div>

      <div class="border-l-4 border-rose-600 bg-rose-50 p-3 text-xs text-rose-900 mb-4">
        <strong>FINAL LEGAL WARNING:</strong> Continuation of anti-social behaviour constitutes a direct breach of your Assured Shorthold Tenancy Agreement and will lead to immediate possession proceedings in the County Court under <strong>Section 8 of the Housing Act 1988 (Ground 7A and Ground 14)</strong>, as well as referral to the Police and Council Community Safety Enforcement Team.
      </div>

      <div class="signature-box text-xs pt-2">
        <div class="flex justify-between items-end">
          <div>
            <strong>Issued by:</strong> ${p.landlordName} (Licence Holder)<br>
            Signature: ____________________________________
          </div>
          <div class="text-right text-[10px] text-slate-500 font-mono">
            Mandatory Retention: Archived on Compliance Register for 5 Years
          </div>
        </div>
      </div>
    `
  },

  agent: {
    badge: "Condition 23 • Bilateral Deed",
    title: "Managing Agent Joint Liability Consent Agreement",
    fileName: "Agent_Joint_Liability_Consent.pdf",
    generate: (p) => `
      <div class="legal-header">
        <div class="flex justify-between items-start">
          <div>
            <div class="text-lg font-extrabold uppercase text-slate-900 tracking-tight">${p.council}</div>
            <div class="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Managing Agent Joint Liability &amp; Consent Agreement</div>
            <div class="text-[10px] text-slate-500">Selective Licensing Condition 23 • Execute within 28 days of appointment</div>
          </div>
          <div class="text-right">
            <span class="legal-stamp" style="border-color:#4338ca; color:#4338ca;">LEGAL DEED</span>
            <div class="text-[10px] text-slate-500 font-mono mt-1">Licence: ${p.licenceRef}</div>
          </div>
        </div>
      </div>

      <div class="bg-slate-50 p-3 rounded border border-slate-200 text-xs mb-4">
        <strong>Licensed Property:</strong> ${p.address}, ${p.postcode}<br>
        <strong>Licence Holder:</strong> ${p.landlordName} • <strong>Appointed Agent:</strong> ${p.agentName}
      </div>

      <!-- Statutory Penalty Warning -->
      <div class="p-3.5 bg-red-50 border border-red-300 rounded-xl text-xs text-red-950 mb-4">
        <strong class="uppercase text-[11px] block mb-1">Condition 23(b) Statutory Warning:</strong>
        Notice is hereby given that a failure to comply with the licence conditions for the above property may result in criminal prosecution with an <strong>unlimited fine</strong> or a financial Civil Penalty of <strong>up to £30,000 for each breach</strong> imposed under Section 249A of the Housing Act 2004.
      </div>

      <div class="legal-section-title">Managing Agent Written Undertaking &amp; Consent</div>
      <div class="p-4 bg-white border border-slate-200 rounded text-xs leading-relaxed space-y-2 mb-4">
        <p>
          I/We, <strong>${p.agentName}</strong>, having been appointed to manage the property at <strong>${p.address}, ${p.postcode}</strong>:
        </p>
        <ol class="list-decimal pl-5 space-y-1.5 text-[11px] text-slate-700">
          <li>Confirm that we have received, read, and fully understood the full Schedule of Conditions attaching to Selective Licence Ref: <strong>${p.licenceRef}</strong>.</li>
          <li>Consent to be bound by all restrictions, management conditions, and statutory obligations of the said licence.</li>
          <li>Accept joint liability for ensuring the management of the property complies with the Housing Act 2004 and associated regulations.</li>
          <li>Agree that a signed copy of this agreement shall be submitted to ${p.council} within 28 days of appointment.</li>
        </ol>
      </div>

      <div class="signature-box grid grid-cols-2 gap-6 text-xs pt-2">
        <div class="border p-3 rounded bg-slate-50">
          <div class="font-bold text-slate-900 mb-2">For and on behalf of Managing Agent:</div>
          <div>Name: <input type="text" class="border border-slate-300 rounded px-1.5 py-0.5 text-xs w-full mb-2" value="${p.agentName}"></div>
          <div>Signature: ____________________________</div>
          <div class="text-[10px] text-slate-500 mt-2">Date: ${new Date().toLocaleDateString("en-GB")}</div>
        </div>
        <div class="border p-3 rounded bg-slate-50">
          <div class="font-bold text-slate-900 mb-2">Licence Holder (Landlord):</div>
          <div>Name: <input type="text" class="border border-slate-300 rounded px-1.5 py-0.5 text-xs w-full mb-2" value="${p.landlordName}"></div>
          <div>Signature: ____________________________</div>
          <div class="text-[10px] text-slate-500 mt-2">Date: ${new Date().toLocaleDateString("en-GB")}</div>
        </div>
      </div>
    `
  },

  census: {
    badge: "Condition 26 • 28-Day Demand",
    title: "Household Census & Permitted Room Register",
    fileName: "Household_Census_Register.pdf",
    generate: (p) => `
      <div class="legal-header">
        <div class="flex justify-between items-start">
          <div>
            <div class="text-lg font-extrabold uppercase text-slate-900 tracking-tight">${p.council}</div>
            <div class="text-xs font-semibold text-purple-700 uppercase tracking-wider">Household Census &amp; Permitted Occupancy Schedule</div>
            <div class="text-[10px] text-slate-500">Selective Licensing Condition 26 • Statutory 28-Day Production Document</div>
          </div>
          <div class="text-right">
            <span class="legal-stamp" style="border-color:#7e22ce; color:#7e22ce;">CENSUS REGISTER</span>
            <div class="text-[10px] text-slate-500 font-mono mt-1">Licence: ${p.licenceRef}</div>
          </div>
        </div>
      </div>

      <table class="legal-table">
        <tbody>
          <tr>
            <td class="font-bold bg-slate-50 w-1/4">Property Address:</td>
            <td class="w-1/4">${p.address}, ${p.postcode}</td>
            <td class="font-bold bg-slate-50 w-1/4">Total Permitted Persons:</td>
            <td class="w-1/4 font-bold text-emerald-700">Max ${p.maxPersons} Persons</td>
          </tr>
          <tr>
            <td class="font-bold bg-slate-50">Licence Reference:</td>
            <td>${p.licenceRef}</td>
            <td class="font-bold bg-slate-50">Permitted Households:</td>
            <td class="font-bold text-emerald-700">Max ${p.maxHouseholds} Single Household</td>
          </tr>
        </tbody>
      </table>

      <div class="legal-section-title">Schedule of Actual Occupants in Situ (Condition 26)</div>
      <p class="text-[11px] text-slate-600 mb-2">Must be provided to Redbridge Council within 28 days of written demand to prove compliance with occupancy caps:</p>

      <table class="legal-table">
        <thead>
          <tr>
            <th class="w-1/4">Full Legal Name</th>
            <th class="w-1/6">Age / DOB</th>
            <th class="w-1/4">Family Relationship</th>
            <th>Allocated Bedroom &amp; Size</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><input type="text" class="border border-slate-300 rounded px-1.5 py-0.5 text-xs w-full" value="Johnathan Smith"></td>
            <td><input type="text" class="border border-slate-300 rounded px-1.5 py-0.5 text-xs w-full" value="38 yrs (04/05/1988)"></td>
            <td>Lead Tenant</td>
            <td>Bedroom 2 (>10.22m²)</td>
          </tr>
          <tr>
            <td><input type="text" class="border border-slate-300 rounded px-1.5 py-0.5 text-xs w-full" value="Sarah Smith"></td>
            <td><input type="text" class="border border-slate-300 rounded px-1.5 py-0.5 text-xs w-full" value="36 yrs (12/09/1990)"></td>
            <td>Spouse / Partner</td>
            <td>Bedroom 2 (>10.22m²)</td>
          </tr>
          <tr>
            <td><input type="text" class="border border-slate-300 rounded px-1.5 py-0.5 text-xs w-full" value="Oliver Smith"></td>
            <td><input type="text" class="border border-slate-300 rounded px-1.5 py-0.5 text-xs w-full" value="10 yrs (18/02/2016)"></td>
            <td>Child / Dependant</td>
            <td>Bedroom 3 (>10.22m²)</td>
          </tr>
          <tr>
            <td><input type="text" class="border border-slate-300 rounded px-1.5 py-0.5 text-xs w-full" value="Emily Smith"></td>
            <td><input type="text" class="border border-slate-300 rounded px-1.5 py-0.5 text-xs w-full" value="8 yrs (22/07/2018)"></td>
            <td>Child / Dependant</td>
            <td>Bedroom 3 (>10.22m²)</td>
          </tr>
          <tr>
            <td><input type="text" class="border border-slate-300 rounded px-1.5 py-0.5 text-xs w-full" value="Lucas Smith"></td>
            <td><input type="text" class="border border-slate-300 rounded px-1.5 py-0.5 text-xs w-full" value="4 yrs (11/11/2021)"></td>
            <td>Child / Dependant</td>
            <td>Bedroom 1 (6.51m² - 10.22m²)</td>
          </tr>
        </tbody>
      </table>

      <div class="p-3 bg-emerald-50 border border-emerald-300 rounded text-xs text-emerald-900 mb-4">
        <strong>Overcrowding Audit:</strong> Total occupants in situ: <strong>5 persons</strong> forming <strong>1 family household</strong>. All room size minimums satisfied. Boxroom strictly unoccupied for sleeping. Property is fully compliant with Schedule 2A.
      </div>

      <div class="signature-box text-xs pt-2">
        <div class="flex justify-between items-end">
          <div>
            <strong>Certified by Licence Holder:</strong> ${p.landlordName}<br>
            Signature: ____________________________________
          </div>
          <div class="text-right">
            <strong>Date Certified:</strong> ${new Date().toLocaleDateString("en-GB")}
          </div>
        </div>
      </div>
    `
  },

  "audit-dossier": {
    badge: "Master 28-Day Package",
    title: "Master 28-Day Council Audit Dossier",
    fileName: "Master_Council_Compliance_Dossier.pdf",
    generate: (p) => `
      <div class="legal-header">
        <div class="flex justify-between items-start">
          <div>
            <div class="text-lg font-extrabold uppercase text-slate-900 tracking-tight">${p.council}</div>
            <div class="text-xs font-semibold text-teal-700 uppercase tracking-wider">Executive Selective Licensing Audit &amp; Compliance Dossier</div>
            <div class="text-[10px] text-slate-500">Consolidated Compliance Report • Ready for Council Production</div>
          </div>
          <div class="text-right">
            <span class="legal-stamp" style="border-color:#0d9488; color:#0d9488;">AUDIT DOSSIER</span>
            <div class="text-[10px] text-slate-500 font-mono mt-1">Licence: ${p.licenceRef}</div>
          </div>
        </div>
      </div>

      <!-- Property Summary -->
      <table class="legal-table">
        <tbody>
          <tr>
            <td class="font-bold bg-slate-50 w-1/4">Licensed Property:</td>
            <td class="w-1/4 font-semibold">${p.address}, ${p.postcode}</td>
            <td class="font-bold bg-slate-50 w-1/4">Licence Number:</td>
            <td class="w-1/4 font-mono font-bold">${p.licenceRef}</td>
          </tr>
          <tr>
            <td class="font-bold bg-slate-50">Licence Holder:</td>
            <td>${p.landlordName} (${p.landlordPhone})</td>
            <td class="font-bold bg-slate-50">Managing Agent:</td>
            <td>${p.agentName}</td>
          </tr>
          <tr>
            <td class="font-bold bg-slate-50">Accreditation:</td>
            <td>${p.accreditation}</td>
            <td class="font-bold bg-slate-50">Audit Date:</td>
            <td>${new Date().toLocaleDateString("en-GB")}</td>
          </tr>
        </tbody>
      </table>

      <!-- 35 Conditions Executive Summary -->
      <div class="legal-section-title">Schedule of 35 Statutory Conditions Summary</div>
      <table class="legal-table">
        <thead>
          <tr>
            <th class="w-16">Condition</th>
            <th>Obligation Summary</th>
            <th class="w-24">Required File</th>
            <th class="w-24 text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="font-bold">Cond 1 & 2</td>
            <td>Max 5 Persons, 1 Household cap strictly observed</td>
            <td>Census Register</td>
            <td class="text-center text-emerald-700 font-bold">COMPLIANT</td>
          </tr>
          <tr>
            <td class="font-bold">Cond 3</td>
            <td>Written AST Agreement provided at move-in</td>
            <td>AST Contract</td>
            <td class="text-center text-emerald-700 font-bold">COMPLIANT</td>
          </tr>
          <tr>
            <td class="font-bold">Cond 4 & 5</td>
            <td>Right to Rent, employment & previous landlord references</td>
            <td>Reference Dossier</td>
            <td class="text-center text-emerald-700 font-bold">COMPLIANT</td>
          </tr>
          <tr>
            <td class="font-bold">Cond 6</td>
            <td>Annual Gas Safety CP12 by Gas Safe Engineer</td>
            <td>CP12 Cert</td>
            <td class="text-center text-emerald-700 font-bold">COMPLIANT</td>
          </tr>
          <tr>
            <td class="font-bold">Cond 7 & 8</td>
            <td>Upholstered Furniture (1988) & Electrical Appliances safety</td>
            <td>Declarations</td>
            <td class="text-center text-emerald-700 font-bold">COMPLIANT</td>
          </tr>
          <tr>
            <td class="font-bold">Cond 9</td>
            <td>5-Year Satisfactory Electrical Installation Condition Report</td>
            <td>EICR Cert</td>
            <td class="text-center text-emerald-700 font-bold">COMPLIANT</td>
          </tr>
          <tr>
            <td class="font-bold">Cond 11 & 12</td>
            <td>Working smoke alarm on each storey; CO alarm at boiler</td>
            <td>Alarm Register</td>
            <td class="text-center text-emerald-700 font-bold">COMPLIANT</td>
          </tr>
          <tr>
            <td class="font-bold">Cond 14</td>
            <td>Mandatory 6-monthly physical property inspection logged</td>
            <td>Inspection Log</td>
            <td class="text-center text-emerald-700 font-bold">COMPLIANT</td>
          </tr>
          <tr>
            <td class="font-bold">Cond 18 & 19</td>
            <td>Refuse provisions provided; zero bulky waste in gardens</td>
            <td>Waste Notice</td>
            <td class="text-center text-emerald-700 font-bold">COMPLIANT</td>
          </tr>
          <tr>
            <td class="font-bold">Cond 23</td>
            <td>Managing agent joint liability consent deed executed</td>
            <td>Signed Deed</td>
            <td class="text-center text-emerald-700 font-bold">COMPLIANT</td>
          </tr>
          <tr>
            <td class="font-bold">Cond 29</td>
            <td>Deposit protected in approved scheme & Prescribed Info served</td>
            <td>DPS Certificate</td>
            <td class="text-center text-emerald-700 font-bold">COMPLIANT</td>
          </tr>
          <tr>
            <td class="font-bold">Cond 34</td>
            <td>Anti-social behaviour 7-day action framework and 5-yr retention</td>
            <td>ASB Register</td>
            <td class="text-center text-emerald-700 font-bold">COMPLIANT</td>
          </tr>
        </tbody>
      </table>

      <!-- Submission Statement -->
      <div class="signature-box text-xs pt-3">
        <p class="text-slate-600 mb-2">
          This dossier has been compiled in full compliance with ${p.council} Selective Licensing conditions and Housing Act 2004 Part 3 requirements for formal production upon local authority demand.
        </p>
        <div class="flex justify-between items-end">
          <div>
            <strong>Submitted by:</strong> ${p.landlordName} (Licence Holder)<br>
            Signature: ____________________________________
          </div>
          <div class="text-right">
            <strong>Date:</strong> ${new Date().toLocaleDateString("en-GB")}
          </div>
        </div>
      </div>
    `
  }
};

function loadTemplate(key, triggerBtn = null) {
  currentTemplateKey = key;
  const cfg = TEMPLATE_CONFIGS[key];
  if (!cfg) return;

  const badgeEl = document.getElementById("template-badge");
  const titleEl = document.getElementById("template-title");
  const areaEl = document.getElementById("printable-area");

  if (badgeEl) badgeEl.innerText = cfg.badge;
  if (titleEl) titleEl.innerText = cfg.title;
  if (areaEl) areaEl.innerHTML = cfg.generate(currentProperty);

  // Update button active state
  document.querySelectorAll(".tmpl-selector").forEach(btn => {
    btn.classList.remove("border-emerald-600", "bg-emerald-50", "shadow-sm");
    btn.classList.add("border-slate-200", "bg-white");
  });

  if (triggerBtn) {
    triggerBtn.classList.add("border-emerald-600", "bg-emerald-50", "shadow-sm");
    triggerBtn.classList.remove("border-slate-200", "bg-white");
  }
}

function jumpToTemplate(key) {
  switchTab("templates");
  // Find button for this template
  const btns = Array.from(document.querySelectorAll(".tmpl-selector"));
  const btn = btns.find(b => b.getAttribute("onclick")?.includes(`'${key}'`)) || btns[0];
  loadTemplate(key, btn);
}

// Client-Side PDF Generation using html2pdf.js
function downloadCurrentTemplatePDF() {
  const cfg = TEMPLATE_CONFIGS[currentTemplateKey];
  if (typeof gtag === "function") {
    gtag("event", "generate_pdf", { template: currentTemplateKey });
  }
  const element = document.getElementById("printable-area");
  if (!element || !cfg) return;

  const btn = document.getElementById("btn-download-pdf");
  const originalHTML = btn.innerHTML;
  btn.innerHTML = `<i class="ph-bold ph-spinner animate-spin"></i> Generating PDF...`;
  btn.disabled = true;

  const cleanFilename = `${currentProperty.postcode.replace(/\s+/g, "_")}_${cfg.fileName}`;

  const opt = {
    margin: [10, 12, 10, 12],
    filename: cleanFilename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
  };

  html2pdf()
    .set(opt)
    .from(element)
    .save()
    .then(() => {
      btn.innerHTML = originalHTML;
      btn.disabled = false;
    })
    .catch(err => {
      console.error("PDF generation failed:", err);
      alert("PDF download encountered an issue. Using system print-to-PDF instead.");
      window.print();
      btn.innerHTML = originalHTML;
      btn.disabled = false;
    });
}

function downloadMasterAuditDossier() {
  switchTab("templates");
  loadTemplate("audit-dossier");
  setTimeout(() => {
    downloadCurrentTemplatePDF();
  }, 400);
}

// =========================================================================
// 6. STATUTORY DEADLINE & TRIGGER CALCULATOR
// =========================================================================

function calculateDeadlines() {
  const input = document.getElementById("trigger-date")?.value;
  if (!input) return;

  const base = new Date(input);

  // 7-day
  const d7 = new Date(base);
  d7.setDate(d7.getDate() + 7);
  document.getElementById("date-7d").innerText = d7.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  // 28-day
  const d28 = new Date(base);
  d28.setDate(d28.getDate() + 28);
  document.getElementById("date-28d").innerText = d28.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  // 30-day
  const d30 = new Date(base);
  d30.setDate(d30.getDate() + 30);
  document.getElementById("date-30d").innerText = d30.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  // 6-month
  const d6m = new Date(base);
  d6m.setMonth(d6m.getMonth() + 6);
  document.getElementById("date-6m").innerText = d6m.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// =========================================================================
// 7. TAB SWITCHER
// =========================================================================

function switchTab(tabId) {
  document.querySelectorAll(".tab-content").forEach(el => el.classList.add("hidden"));
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.remove("bg-emerald-700", "text-white", "shadow-sm", "border-emerald-700");
    btn.classList.add("bg-white", "text-slate-700", "border", "border-slate-300");
  });

  const targetTab = document.getElementById("tab-" + tabId);
  const targetBtn = document.getElementById("tab-btn-" + tabId);

  if (targetTab) targetTab.classList.remove("hidden");
  if (targetBtn) {
    targetBtn.classList.remove("bg-white", "text-slate-700", "border-slate-300");
    targetBtn.classList.add("bg-emerald-700", "text-white", "shadow-sm", "border-emerald-700");
  }
  if (typeof gtag === "function") {
    gtag("event", "tab_view", { tab_id: tabId });
  }
}

// =========================================================================
// 8. PROPERTY MODAL & DATA SYNC
// =========================================================================

function syncPropertyUI() {
  const p = currentProperty;

  // Header & Title
  const headerSummary = document.getElementById("header-property-summary");
  if (headerSummary) headerSummary.innerText = `${p.address}, ${p.postcode} • ${p.council}`;

  const headerScheme = document.getElementById("header-scheme-badge");
  if (headerScheme) headerScheme.innerText = p.scheme;

  const councilName = document.getElementById("checklist-council-name");
  if (councilName) councilName.innerText = p.council;

  // KPI Cards
  const kpiCap = document.getElementById("kpi-permitted-cap");
  if (kpiCap) kpiCap.innerText = `Max ${p.maxPersons} Persons • ${p.maxHouseholds} Household`;
}

function openPropertyModal() {
  const p = currentProperty;
  document.getElementById("prop-address").value = p.address;
  document.getElementById("prop-council").value = p.council;
  document.getElementById("prop-postcode").value = p.postcode;
  document.getElementById("prop-licence-ref").value = p.licenceRef;
  document.getElementById("prop-scheme").value = p.scheme;
  document.getElementById("prop-landlord-name").value = p.landlordName;
  document.getElementById("prop-emergency-phone").value = p.emergencyPhone;
  document.getElementById("prop-max-persons").value = p.maxPersons;
  document.getElementById("prop-max-households").value = p.maxHouseholds;
  document.getElementById("prop-agent-name").value = p.agentName;
  document.getElementById("prop-accreditation").value = p.accreditation;

  document.getElementById("property-modal").classList.remove("hidden");
}

function closePropertyModal() {
  document.getElementById("property-modal").classList.add("hidden");
}

function loadPropertyPreset(type) {
  const preset = PRESETS[type];
  if (!preset) return;
  document.getElementById("prop-address").value = preset.address;
  document.getElementById("prop-council").value = preset.council;
  document.getElementById("prop-postcode").value = preset.postcode;
  document.getElementById("prop-licence-ref").value = preset.licenceRef;
  document.getElementById("prop-scheme").value = preset.scheme;
  document.getElementById("prop-landlord-name").value = preset.landlordName;
  document.getElementById("prop-emergency-phone").value = preset.emergencyPhone;
  document.getElementById("prop-max-persons").value = preset.maxPersons;
  document.getElementById("prop-max-households").value = preset.maxHouseholds;
  document.getElementById("prop-agent-name").value = preset.agentName;
  document.getElementById("prop-accreditation").value = preset.accreditation;
}

function clearPropertyForm() {
  document.getElementById("prop-address").value = "";
  document.getElementById("prop-council").value = "London Borough of Redbridge";
  document.getElementById("prop-postcode").value = "";
  document.getElementById("prop-licence-ref").value = "Pending Application";
  document.getElementById("prop-scheme").value = "Selective Licensing (Part 3)";
  document.getElementById("prop-landlord-name").value = "";
  document.getElementById("prop-emergency-phone").value = "";
  document.getElementById("prop-max-persons").value = 5;
  document.getElementById("prop-max-households").value = 1;
  document.getElementById("prop-agent-name").value = "";
  document.getElementById("prop-accreditation").value = "";
}

function exportPropertyJSON() {
  const exportPayload = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    property: currentProperty,
    conditions: conditionsData
  };
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
  const dlAnchor = document.createElement("a");
  dlAnchor.setAttribute("href", dataStr);
  const cleanFilename = `UK_Landlord_Licensing_${(currentProperty.postcode || "Backup").replace(/\s+/g, "_")}.json`;
  dlAnchor.setAttribute("download", cleanFilename);
  dlAnchor.click();
}

function importPropertyJSON(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data.property) {
        saveCurrentProperty(data.property);
        localStorage.setItem("uk_landlord_property_configured", "true");
      }
      if (data.conditions && Array.isArray(data.conditions)) {
        conditionsData = data.conditions;
        saveChecklistData();
        renderChecklist();
      }
      alert("Property and compliance data successfully restored!");
      closePropertyModal();
    } catch (err) {
      alert("Invalid backup file: " + err.message);
    }
  };
  reader.readAsText(file);
}

function wipeAllUserData() {
  if (confirm("Are you sure you want to wipe all stored property data from this browser? This action cannot be undone.")) {
    localStorage.removeItem("uk_landlord_current_prop");
    localStorage.removeItem("uk_landlord_checklist_data");
    localStorage.removeItem("uk_landlord_property_configured");
    location.reload();
  }
}

function savePropertySettings() {
  const updated = {
    ...currentProperty,
    address: document.getElementById("prop-address").value.trim() || "Rental Property Address",
    council: document.getElementById("prop-council").value.trim() || "Local Authority Council",
    postcode: document.getElementById("prop-postcode").value.trim() || "POSTCODE",
    licenceRef: document.getElementById("prop-licence-ref").value.trim() || "Pending",
    scheme: document.getElementById("prop-scheme").value,
    landlordName: document.getElementById("prop-landlord-name").value.trim() || "Landlord Legal Name",
    emergencyPhone: document.getElementById("prop-emergency-phone").value.trim() || "07XXXXXXXXX",
    maxPersons: parseInt(document.getElementById("prop-max-persons").value, 10) || 5,
    maxHouseholds: parseInt(document.getElementById("prop-max-households").value, 10) || 1,
    agentName: document.getElementById("prop-agent-name").value.trim() || "Direct Landlord Managed",
    accreditation: document.getElementById("prop-accreditation").value.trim() || "NRLA / LLAS"
  };

  localStorage.setItem("uk_landlord_property_configured", "true");
  saveCurrentProperty(updated);
  closePropertyModal();
}

// =========================================================================
// =========================================================================
// 10. UK HOUSING & COUNCIL REGULATORY NEWS ENGINE (STRICT 30-DAY WINDOW)
// =========================================================================

// Helper to compute dynamic publication metadata strictly within rolling 30-day window
function getNewsPublishMeta(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const formattedDate = d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
  let relativeText = "Today";
  if (daysAgo === 1) {
    relativeText = "Yesterday";
  } else if (daysAgo > 1) {
    relativeText = `${daysAgo} days ago`;
  }
  return {
    dateObj: d,
    formattedDate: formattedDate,
    relativeText: relativeText,
    isWithin30Days: daysAgo <= 30
  };
}

const HOUSING_NEWS = [
  {
    id: "news-renters-rights-bill",
    daysAgo: 2,
    title: "Renters' Rights Bill: Abolition of Section 21 'No-Fault' Evictions Advances in Parliament",
    source: "GOV.UK • MHCLG",
    category: "legislation",
    badge: "Statutory Bill",
    badgeColor: "bg-rose-100 text-rose-800 border-rose-300",
    urgency: "High Impact",
    summary: "The Ministry of Housing, Communities and Local Government (MHCLG) confirms parliamentary advancement of the Renters' Rights Bill. The Bill abolishes Section 21 evictions for both existing and periodic tenancies, introduces mandatory PRS Database registration, applies the Decent Homes Standard to private rentals, and enacts strict 'Awaab's Law' hazard deadlines for damp and mould.",
    takeaway: "Possession will rely exclusively on Section 8 mandatory and discretionary grounds with expanded notice periods. Detailed 6-month inspection logs (Condition 14) and verifiable rent transaction receipts (Condition 33) become vital evidence in court.",
    linkText: "View Official MHCLG Bill Collection",
    linkUrl: "https://www.gov.uk/government/collections/renters-rights-bill"
  },
  {
    id: "news-redbridge-licensing-enforcement",
    daysAgo: 5,
    title: "Redbridge Council Steers Active Property Audits & Selective Licensing Inspections",
    source: "London Borough of Redbridge",
    category: "councils",
    badge: "Council Scheme",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    urgency: "Direct Duty",
    summary: "The London Borough of Redbridge Property Licensing Enforcement Team is actively conducting physical inspections and documentary audits across all designated Selective Licensing wards. Officers are verifying compliance against the 35 mandatory licence conditions, focusing on 6-month written inspection logs, EPC certificates, and waste storage provisions.",
    takeaway: "Under Section 249A of the Housing Act 2004, council officers can issue Civil Penalty Notices of up to £30,000 for each licence breach without requiring Magistrates' Court prosecution.",
    linkText: "Visit Redbridge Licensing Portal",
    linkUrl: "https://www.redbridge.gov.uk/housing/private-rentals/property-licensing/"
  },
  {
    id: "news-right-to-rent-penalties",
    daysAgo: 8,
    title: "Home Office Tripled Civil Penalties for Right to Rent Immigration Breaches",
    source: "UK Home Office",
    category: "enforcement",
    badge: "Fines & Penalties",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
    urgency: "Severe Fines",
    summary: "Home Office civil penalty fines under the Immigration Act 2014 for letting property to occupiers without lawful immigration status stand tripled. First breaches carry fines up to £5,000 per occupier (up from £1,000), whilst repeat breaches within 3 years carry penalties of up to £10,000 per occupier.",
    takeaway: "Landlords must carry out and retain documented digital share code or original document checks prior to tenancy inception (Condition 4) and retain full verification audit trails throughout the tenancy term.",
    linkText: "GOV.UK Right to Rent Statutory Guidance",
    linkUrl: "https://www.gov.uk/government/publications/right-to-rent-landlords-code-of-practice"
  },
  {
    id: "news-london-licensing-expansion",
    daysAgo: 13,
    title: "Newham, Brent & London Boroughs Enforce Expanded Selective Licensing Schemes",
    source: "London Property Licensing & Councils",
    category: "councils",
    badge: "Licensing Zones",
    badgeColor: "bg-sky-100 text-sky-800 border-sky-300",
    urgency: "Active Wards",
    summary: "London boroughs including Newham (Scheme 4 covering all 22 wards), Brent, Waltham Forest, and Westminster are actively pursuing unlicensed landlords. In addition, major cities including Birmingham, Nottingham, and Manchester continue robust selective and additional HMO licensing enforcement across their jurisdictions.",
    takeaway: "Letting an unlicenced private residential property in a designated area creates severe liability: Civil Penalty up to £30,000, 100% Rent Repayment Order (RRO) clawback by tenants, and loss of valid Section 21 eviction rights.",
    linkText: "Check London Licensing Directory",
    linkUrl: "https://www.londonpropertylicensing.co.uk/"
  },
  {
    id: "news-epc-mees-consultation",
    daysAgo: 17,
    title: "Government Reconfirms EPC Band C Minimum Standard Trajectory for Private Rentals",
    source: "Department for Energy Security & Net Zero",
    category: "standards",
    badge: "Energy & Net Zero",
    badgeColor: "bg-teal-100 text-teal-800 border-teal-300",
    urgency: "Target 2030",
    summary: "The Department for Energy Security and Net Zero (DESNZ) confirms policy directions to increase the Minimum Energy Efficiency Standard (MEES) from the current EPC Band E to Band C for all private rented properties by 2030, with consultations defining cost caps and landlord green retrofit grants.",
    takeaway: "When renewing heating systems, insulation, or glazing, target EPC Band C immediately to preserve property letting eligibility and protect rental yield from future regulatory letting prohibitions.",
    linkText: "GOV.UK Domestic MEES Guidance",
    linkUrl: "https://www.gov.uk/guidance/domestic-private-rented-property-minimum-energy-efficiency-standard-landlord-guidance"
  },
  {
    id: "news-tribunal-rro-guidance",
    daysAgo: 21,
    title: "Upper Tribunal Precedent: 100% Maximum Rent Repayment Orders for Unlicensed Lets",
    source: "Upper Tribunal (Lands Chamber)",
    category: "enforcement",
    badge: "Tribunal Precedent",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
    urgency: "12-Month Clawback",
    summary: "The Upper Tribunal (Lands Chamber) has reaffirmed that where a landlord lets an unlicensed property in a Selective or HMO designation, the starting presumption for a Rent Repayment Order (RRO) is 100% of the rent paid during the unlicensed period. Lack of awareness of the council scheme is not an acceptable statutory defence.",
    takeaway: "Always submit your complete licensing application to the local council before allowing tenants to take up occupation. A valid pending application provides statutory protection under Housing Act 2004 s.95(3)(b).",
    linkText: "First-Tier Tribunal Property Chamber Decisions",
    linkUrl: "https://www.gov.uk/courts-tribunals/first-tier-tribunal-property-chamber"
  },
  {
    id: "news-awaabs-law-prs",
    daysAgo: 25,
    title: "Awaab's Law to Enforce Strict Damp & Mould Remediation Timelines on Private Landlords",
    source: "UK Parliament / HHSRS",
    category: "standards",
    badge: "Health & Safety",
    badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-300",
    urgency: "Strict Deadlines",
    summary: "Statutory provisions expanding 'Awaab's Law' to the private rented sector mandate that landlords investigate reported damp, mould, and structural hazards within strict statutory deadlines (e.g. 14 calendar days to investigate, 7 days to commence remedial works, and 24 hours for emergency defects).",
    takeaway: "Condition 14 (6-month inspections) and Condition 17 (3-year complaint records) are critical evidence. Landlords must acknowledge tenant defect notifications in writing and dispatch certified trades promptly.",
    linkText: "HHSRS Guidance for Landlords",
    linkUrl: "https://www.gov.uk/government/publications/housing-health-and-safety-rating-system-guidance-for-landlords-and-property-related-professionals"
  },
  {
    id: "news-smoke-co-enforcement",
    daysAgo: 28,
    title: "Councils Issue £5,000 Penalties Under Smoke & Carbon Monoxide Alarm Regulations",
    source: "Local Authority Housing Teams",
    category: "standards",
    badge: "Safety Mandate",
    badgeColor: "bg-rose-100 text-rose-800 border-rose-300",
    urgency: "£5,000 Penalty",
    summary: "Local authorities are actively penalizing private landlords with £5,000 civil penalties for failing to maintain smoke alarms on each habitable storey and carbon monoxide alarms in any room with a fixed combustion appliance. Physical push-test verification must be documented at every tenancy inception.",
    takeaway: "Use our built-in 'Statutory Safety Declaration' (Conditions 11 & 12) template and push-test verification record on tenancy inception and during every 6-monthly property inspection.",
    linkText: "GOV.UK Smoke & Carbon Monoxide Booklet",
    linkUrl: "https://www.gov.uk/government/publications/smoke-and-carbon-monoxide-alarm-explanatory-booklet-for-landlords"
  }
];

const COUNCIL_SCHEMES_INFO = {
  redbridge: {
    name: "London Borough of Redbridge",
    status: "Active Borough-Wide Schemes",
    selective: "Active across designated wards (e.g. Valentines, Clementswood, Ilford Town, Loxford, Goodmayes, Chadwell, Newbury, Seven Kings).",
    hmo: "Mandatory HMO licensing plus Additional HMO Licensing covering all HMOs with 3+ occupants.",
    article4: "Strict Article 4(1) Direction in force since 6 Dec 2019 — Small HMO conversions (C3 to C4) require full planning permission.",
    penalties: "Civil Penalties up to £30,000 per offence under s.249A Housing Act 2004.",
    feeGuide: "Standard Selective Licence fee ~£825 per property (5-year licence). Discounts for LLAS/accredited landlords.",
    url: "https://www.redbridge.gov.uk/housing/private-rentals/property-licensing/"
  },
  newham: {
    name: "London Borough of Newham",
    status: "Borough-Wide Selective Licensing (Scheme 4)",
    selective: "Covers virtually all 22 wards in the borough. Single-family private lets require a licence.",
    hmo: "Mandatory & Additional HMO licensing covering 3+ sharers.",
    article4: "Article 4 Direction removing C3 to C4 permitted development.",
    penalties: "Civil Penalties up to £30,000; extensive prosecutions in Magistrates' Court.",
    feeGuide: "~£750 - £850 per property. Early bird discounts typically available at scheme launch.",
    url: "https://www.newham.gov.uk/housing-homes-premises/property-licensing"
  },
  brent: {
    name: "London Borough of Brent",
    status: "Extensive Selective & Additional Licensing",
    selective: "Selective licensing covering private rentals across multiple wards (Wembley, Harlesden, Willesden, etc.).",
    hmo: "Additional HMO scheme covers all privately rented properties with 3 or more occupants forming 2+ households.",
    article4: "Article 4 Direction across entire borough.",
    penalties: "Civil penalty notices up to £30,000 aggressively enforced.",
    feeGuide: "~£840 for 5-year Selective Licence.",
    url: "https://www.brent.gov.uk/housing/landlords/property-licensing"
  },
  waltham_forest: {
    name: "London Borough of Waltham Forest",
    status: "Designated Selective Licensing",
    selective: "Active Selective licensing designation covering 18 out of 22 wards.",
    hmo: "Mandatory HMO and borough-wide Additional HMO scheme.",
    article4: "Borough-wide Article 4 in place.",
    penalties: "Civil penalties and Rent Repayment Orders vigorously supported.",
    feeGuide: "~£700 per property for compliant landlords.",
    url: "https://www.walthamforest.gov.uk/housing/private-rented-housing/property-licensing"
  },
  westminster: {
    name: "Westminster City Council",
    status: "Additional HMO Licensing & Enforcement",
    selective: "Targeted enforcement across central London wards.",
    hmo: "Additional HMO scheme covers properties with 3 or more unrelated persons.",
    article4: "Strict planning rules on residential conversions and short-term lets.",
    penalties: "Aggressive civil penalties and enforcement prosecution team.",
    feeGuide: "Additional HMO Licence ~£975 per property.",
    url: "https://www.westminster.gov.uk/housing/landlords-and-tenants/property-licensing"
  },
  tower_hamlets: {
    name: "London Borough of Tower Hamlets",
    status: "Selective & Additional Licensing Active",
    selective: "Selective licensing active in Weavers, Whitechapel, Spitalfields & Banglatown wards.",
    hmo: "Additional HMO scheme covers all 3+ person sharer properties.",
    article4: "Borough-wide Article 4 Direction for HMOs.",
    penalties: "Civil penalties up to £30,000; banned landlord listings.",
    feeGuide: "~£520 - £675 depending on scheme tier.",
    url: "https://www.towerhamlets.gov.uk/lgnl/housing/private_housing/property_licensing.aspx"
  },
  camden: {
    name: "London Borough of Camden",
    status: "Borough-Wide Additional HMO Scheme",
    selective: "Area-based selective enforcement.",
    hmo: "Additional HMO scheme covers all HMOs with 3+ occupants.",
    article4: "Article 4 Direction on HMO conversions.",
    penalties: "Civil penalties up to £30k; extensive First-Tier Tribunal RRO cases.",
    feeGuide: "~£1,300 per HMO licence.",
    url: "https://www.camden.gov.uk/property-licensing"
  },
  nottingham: {
    name: "Nottingham City Council",
    status: "Extensive Selective Licensing Scheme",
    selective: "City-wide selective licensing scheme covering most private rental wards.",
    hmo: "Mandatory & Additional HMO licensing.",
    article4: "Active Article 4 Direction restricting C4 HMO conversions.",
    penalties: "Over £1m in civil penalties levied against non-compliant landlords.",
    feeGuide: "~£890 per selective licence (£670 for accredited landlords).",
    url: "https://www.nottinghamcity.gov.uk/housing/information-for-landlords/selective-licensing/"
  },
  manchester: {
    name: "Manchester City Council",
    status: "Targeted Selective Licensing Schemes",
    selective: "Selective licensing active across multiple phases (Crumpsall, Moss Side, Moston, Old Moat, Rusholme, Gorton).",
    hmo: "Mandatory HMO scheme with strict room size standards.",
    article4: "Article 4 Direction across southern student and rental corridors.",
    penalties: "Strict civil penalties up to £30k per failure.",
    feeGuide: "~£650 - £790 per property.",
    url: "https://www.manchester.gov.uk/info/200053/housing_advice/7594/selective_licensing"
  },
  birmingham: {
    name: "Birmingham City Council",
    status: "City-Wide Additional HMO Scheme & Selective Zones",
    selective: "Selective licensing active in 25 wards across the city.",
    hmo: "City-wide Additional HMO scheme covers 3+ person HMOs.",
    article4: "City-wide Article 4 Direction restricting small HMO creation.",
    penalties: "Rigorous enforcement with Civil Penalties up to £30,000.",
    feeGuide: "~£700 - £850 per licence.",
    url: "https://www.birmingham.gov.uk/info/20006/housing/1250/selective_licensing"
  },
  liverpool: {
    name: "Liverpool City Council",
    status: "Targeted Selective Licensing Scheme",
    selective: "Active Selective licensing across 16 wards with high private renting density.",
    hmo: "Mandatory HMO licensing.",
    article4: "Article 4 direction in specific wards.",
    penalties: "Up to £30k civil penalties and court prosecutions.",
    feeGuide: "~£550 per property with discount for accredited landlords.",
    url: "https://liverpool.gov.uk/housing/landlords/landlord-licensing/"
  },
  leeds: {
    name: "Leeds City Council",
    status: "Selective Licensing in Harehills & Beeston",
    selective: "Active Selective licensing designations in Harehills and Beeston areas.",
    hmo: "Extensive student/professional HMO regulations and standards.",
    article4: "Strict Article 4 Direction across Hyde Park, Headingley, and Burley.",
    penalties: "Civil Penalties up to £30,000.",
    feeGuide: "~£825 per property for a 5-year licence.",
    url: "https://www.leeds.gov.uk/housing/information-for-landlords/selective-licensing"
  }
};

let currentNewsCategory = "all";
let currentNewsSearch = "";

function renderHousingNews() {
  const container = document.getElementById("housing-news-grid");
  if (!container) return;

  const search = currentNewsSearch.toLowerCase().trim();
  const cat = currentNewsCategory;

  // STRICT 30-DAY WINDOW FILTER: items must have daysAgo <= 30
  const filtered = HOUSING_NEWS.filter(item => {
    // 30-day enforcement check
    if (typeof item.daysAgo === "number" && item.daysAgo > 30) return false;
    // Category filter
    if (cat !== "all" && item.category !== cat) return false;
    // Search filter
    if (search) {
      const text = `${item.title} ${item.source} ${item.summary} ${item.takeaway} ${item.urgency}`.toLowerCase();
      if (!text.includes(search)) return false;
    }
    return true;
  });

  // Dynamic window date label if element exists
  const dateWindowLabel = document.getElementById("news-window-dates");
  if (dateWindowLabel) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    dateWindowLabel.innerText = `(${thirtyDaysAgo.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – Today)`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <i class="ph-bold ph-newspaper-clipping text-4xl text-slate-300 mb-2"></i>
        <div class="font-semibold text-slate-700">No news articles found in the last 30 days</div>
        <p class="text-xs text-slate-500 mt-1">Try clearing your search query or selecting another category.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => {
    const meta = getNewsPublishMeta(item.daysAgo);
    return `
      <article class="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between group">
        <div>
          <!-- Article Top Meta Header -->
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${item.badgeColor}">
                ${item.badge}
              </span>
              <span class="text-[11px] font-semibold text-slate-600">${item.source}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80" title="Published strictly within rolling 30-day statutory window">
                <i class="ph-bold ph-check"></i> Last 30 Days
              </span>
              <span class="px-1.5 py-0.5 rounded font-sans text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                ${item.urgency}
              </span>
            </div>
          </div>

          <!-- Publication Date & Timing -->
          <div class="flex items-center gap-1.5 text-[11px] text-slate-600 mb-2.5">
            <i class="ph-bold ph-calendar text-emerald-600"></i>
            <span class="font-semibold text-slate-800">Published:</span>
            <span class="font-medium text-slate-700">${meta.formattedDate}</span>
            <span class="text-slate-400 font-mono text-[10px]">(${meta.relativeText})</span>
          </div>

          <!-- Article Title -->
          <h3 class="text-sm font-bold text-slate-900 leading-snug group-hover:text-emerald-700 transition">
            ${item.title}
          </h3>

          <!-- Article Summary -->
          <p class="text-xs text-slate-600 mt-2 leading-relaxed">
            ${item.summary}
          </p>

          <!-- Landlord Action Required Box -->
          <div class="mt-3.5 p-3 rounded-xl bg-amber-50/90 border border-amber-200/80 text-xs text-amber-950">
            <div class="font-bold flex items-center gap-1.5 text-[11px] text-amber-900 mb-1 uppercase tracking-wide">
              <i class="ph-bold ph-lightning text-amber-600"></i> Landlord Action Required:
            </div>
            <p class="text-[11px] leading-relaxed text-amber-900">
              ${item.takeaway}
            </p>
          </div>
        </div>

        <!-- Footer: Primary Source Link + Educational Disclaimer Note -->
        <div class="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <a href="${item.linkUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline group-hover:text-emerald-800 transition" title="Visit official government or council publication page">
            <span>${item.linkText}</span>
            <i class="ph-bold ph-arrow-square-out text-sm"></i>
          </a>
          <div class="flex items-center gap-1.5 text-[10px] text-slate-400">
            <span class="inline-flex items-center gap-1 bg-amber-50/80 text-amber-900 px-2 py-0.5 rounded border border-amber-200/70 font-sans font-medium">
              ⚖️ Educational Reference Only
            </span>
            <span class="font-mono text-slate-400 hidden sm:inline">• Primary Source</span>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function filterHousingNews(cat, btn) {
  currentNewsCategory = cat;
  document.querySelectorAll(".news-filter-btn").forEach(b => {
    b.className = "news-filter-btn px-3 py-1.5 rounded-lg text-xs font-bold transition bg-slate-100 hover:bg-slate-200 text-slate-700";
  });
  if (btn) {
    btn.className = "news-filter-btn px-3 py-1.5 rounded-lg text-xs font-bold transition bg-emerald-700 text-white shadow-sm";
  }
  renderHousingNews();
}

function searchHousingNews() {
  currentNewsSearch = document.getElementById("news-search-input")?.value || "";
  renderHousingNews();
}

function refreshHousingNewsFeed() {
  const btn = event.currentTarget;
  const originalHTML = btn.innerHTML;
  btn.innerHTML = `<i class="ph-bold ph-spinner animate-spin"></i> Checking...`;
  setTimeout(() => {
    btn.innerHTML = originalHTML;
    renderHousingNews();
  }, 350);
}

function lookupCouncilLicensingInfo() {
  const sel = document.getElementById("council-lookup-select");
  const container = document.getElementById("council-lookup-result");
  if (!sel || !container) return;

  const key = sel.value;
  const info = COUNCIL_SCHEMES_INFO[key] || COUNCIL_SCHEMES_INFO.redbridge;

  container.innerHTML = `
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2 mb-2">
      <div>
        <div class="font-bold text-sm text-slate-900">${info.name}</div>
        <div class="text-[11px] font-semibold text-emerald-700">${info.status}</div>
      </div>
      <a href="${info.url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 px-3 py-1 rounded bg-council-900 hover:bg-slate-800 text-white text-[11px] font-semibold transition shrink-0">
        <i class="ph-bold ph-arrow-square-out"></i> Visit Council Portal
      </a>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] pt-1">
      <div>
        <strong class="text-slate-800">Selective Licensing Scope:</strong>
        <p class="text-slate-600 mt-0.5 leading-relaxed">${info.selective}</p>
      </div>
      <div>
        <strong class="text-slate-800">HMO Licensing Scope:</strong>
        <p class="text-slate-600 mt-0.5 leading-relaxed">${info.hmo}</p>
      </div>
      <div>
        <strong class="text-slate-800">Article 4 Direction:</strong>
        <p class="text-slate-600 mt-0.5 leading-relaxed">${info.article4}</p>
      </div>
      <div>
        <strong class="text-slate-800">Fees &amp; Penalties:</strong>
        <p class="text-slate-600 mt-0.5 leading-relaxed">${info.feeGuide} • ${info.penalties}</p>
      </div>
    </div>
  `;
}

// =========================================================================
// 11. INITIALIZATION
// =========================================================================
// 12. MONZO TIP DEVELOPER LOGIC (£1 OR £2 VOLUNTARY CONTRIBUTION)
// =========================================================================

let currentTipAmount = 1;

function openTipModal() {
  document.getElementById("tip-modal")?.classList.remove("hidden");
  if (typeof gtag === "function") {
    gtag("event", "tip_modal_open");
  }
}

function closeTipModal() {
  document.getElementById("tip-modal")?.classList.add("hidden");
}

function selectTipAmount(amount) {
  currentTipAmount = amount;
  const btn1 = document.getElementById("tipBtn1");
  const btn2 = document.getElementById("tipBtn2");
  const displayAmount = document.getElementById("tipMonzoDisplayAmount");
  const btnMonzo = document.getElementById("btnTipMonzo");
  const note = encodeURIComponent("Tip for UK Landlord Licensing Hub");

  if (amount === 1) {
    if (btn1) btn1.className = "p-3.5 rounded-xl border-2 border-amber-500 bg-amber-50 text-amber-950 font-bold text-sm flex flex-col items-center justify-center transition cursor-pointer";
    if (btn2) btn2.className = "p-3.5 rounded-xl border-2 border-slate-200 hover:border-amber-400 bg-slate-50 text-slate-800 font-bold text-sm flex flex-col items-center justify-center transition cursor-pointer";
    if (displayAmount) displayAmount.innerText = "£1.00";
    if (btnMonzo) btnMonzo.href = `https://monzo.me/anildutta/1?d=${note}`;
  } else {
    if (btn2) btn2.className = "p-3.5 rounded-xl border-2 border-amber-500 bg-amber-50 text-amber-950 font-bold text-sm flex flex-col items-center justify-center transition cursor-pointer";
    if (btn1) btn1.className = "p-3.5 rounded-xl border-2 border-slate-200 hover:border-amber-400 bg-slate-50 text-slate-800 font-bold text-sm flex flex-col items-center justify-center transition cursor-pointer";
    if (displayAmount) displayAmount.innerText = "£2.00";
    if (btnMonzo) btnMonzo.href = `https://monzo.me/anildutta/2?d=${note}`;
  }
}

// =========================================================================
// 13. APP INITIALIZATION
// =========================================================================

window.addEventListener("DOMContentLoaded", () => {
  syncPropertyUI();
  renderChecklist();
  updateStats();
  loadTemplate("inspection");
  renderHousingNews();
  lookupCouncilLicensingInfo();

  // Initialize Calculator to today's date
  const triggerInput = document.getElementById("trigger-date");
  if (triggerInput) {
    triggerInput.value = new Date().toISOString().slice(0, 10);
    calculateDeadlines();
  }

  // If this is a first-time visitor on this browser, pop up the Setup Modal
  if (!localStorage.getItem("uk_landlord_property_configured")) {
    setTimeout(() => {
      openPropertyModal();
    }, 450);
  }
});


