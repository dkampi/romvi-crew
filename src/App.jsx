import { useState, useEffect } from "react";

// ─── SUPABASE ────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://utrppsmttlwfbrzgspno.supabase.co";
const SUPABASE_KEY = "sb_publishable_WwS8PMPnqzQPCHdBHZGR8w_XZM1wwDy";

const sb = async (method, table, body = null, params = "") => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${params}`, {
    method,
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": method === "POST" ? "return=representation" : "return=representation",
    },
    body: body ? JSON.stringify(body) : null,
  });
  if (!res.ok) { const e = await res.text(); console.error(e); return null; }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

const dbGet = (table, params = "") => sb("GET", table, null, params);
const dbPost = (table, body) => sb("POST", table, body);
const dbPatch = (table, body, params) => sb("PATCH", table, body, params);

// ─── CREW ────────────────────────────────────────────────────────────────────
const CREW_NAMES = ["Γιάννης", "Τάσος", "Βασιλική", "Ιάσωνας", "Δημήτρης"];

// ─── CHECKLIST ITEMS ─────────────────────────────────────────────────────────
const DAILY_SECTIONS = [
  {
    title: "Πριν από ναύλο",
    items: [
      "Μπαλονάκια",
      "Ανοξείδωτα",
      "Black hatches",
      "Τζαμιά",
      "Πάτωμα",
      "Έλεγχος αναψυκτικά/ψυγείο",
      "Έλεγχος τουαλέτες",
      "Έλεγχος επιφάνειες",
      "Καθαρισμός λευκά ταμπούκια εξωτερικά τα 2 πίσω",
      "Σφηνάκια στην κατάψυξη (Ν+2)",
    ],
  },
  {
    title: "Μετά από ναύλο — Εξωτερικά",
    items: [
      "Καθαρό νερό: πουφ",
      "Καθαρό νερό: μάσκες/βατραχοπέδιλα",
      "Καθαρό νερό: SUP",
      "Καθαρό νερό: πλώρη/πρύμνη",
      "Καθαρό νερό: σκοινιά",
    ],
  },
  {
    title: "Μετά από ναύλο — Εσωτερικά",
    items: [
      "Πετσέτες για πελάτες",
      "Πετώ σκουπίδια",
      "Άπλυτα κουζίνας",
      "Τουαλέτες",
      "Επιφάνειες",
      "Σκούπισμα/σφουγγάρισμα",
      "Γέμισμα ψυγείων (γράφεις τι λείπει αφού γεμίσεις κάβα)",
    ],
  },
  {
    title: "Γενικά ημερήσια",
    items: [
      "Καθαρισμός σκίαστρων",
      "Καθαρισμός χαράδρες hatch",
      "Καθαρισμός ταμπουκιών",
      "Καθαρισμός φωτοβολταϊκών",
      "Έλεγχος επιφανειών από άλατα",
      "Έλεγχος λαδιών (μηχανές, πόδι)",
      "Έλεγχος SUP (αέρα)",
      "Έλεγχος σκουριών",
      "Έλεγχος μπαταριών",
      "Έλεγχος νερού",
    ],
  },
];

// Flat list for backward compat
const DAILY_ITEMS = DAILY_SECTIONS.flatMap(s => s.items);

const WEEKLY_ITEMS = [
  "Πετρέλαιο",
  "Απόψυξη",
  "Αέρας τέντερ",
  "Έλεγχος Paraflu",
  "Έλεγχος νερό μηχανής",
  "Έλεγχος νερό σεντίνες",
  "Έλεγχος λειτουργίας σεντίνες",
  "Έλεγχος υγραέριο",
  "Έλεγχος προπέλες",
  "Έλεγχος σχοινιά-πετονιές",
  "Χλωρίνη σε νερό",
  "Έλεγχος φαρμακείου",
];

// ─── SUPPLIES CATALOGUE ───────────────────────────────────────────────────────
const SUPPLIES_CATALOGUE = {
  "🧹 Καθαριστικά": [
    "Χαρτοπετσέτες", "Σφουγγάρια", "Υγρό πιάτων",
    "Χαρτί κουζίνας", "Χαρτί υγείας",
    "Γάντια", "Υγρό τουαλέτας",
    "Σακούλες μεγάλες", "Σακούλες μικρές",
    "Viakal", "Detol", "AJAX", "Υγρό σφουγγαρίσματος", "Κρεμοσάπουνο", "Σύρμα κατσαρόλων",
  ],
  "🛒 Τρόφιμα": [
    "Τσάι", "Γαλατάκια", "Ζάχαρη", "Οδοντογλυφίδες", "Καλαμάκια",
    "Λάδι", "Ξύδι", "Αλάτι", "Πιπέρι", "Παξιμάδια", "Ελιές",
    "Μέλι", "Ρίγανη", "Καφέδες", "Βαλσάμικο κρέμα/ξύδι",
    "Ψωμί χωρίς γλουτένη", "Μαρμελάδα", "Κρίτσινια",
  ],
  "🍷 Κάβα": [
    "Κρασί λευκό", "Κρασί ροζέ", "Μπίρες",
    "Coca Cola Zero", "Coca Cola original", "Λεμονάδες",
    "Βυσσινάδες", "Πορτοκαλάδες", "Ανθρακούχο νερό", "Νερό",
  ],
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().slice(0, 10);
const now = () => new Date().toISOString();
const weekStart = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff)).toISOString().slice(0, 10);
};
const fmt = (iso) => new Date(iso).toLocaleString("el-GR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
const fmtDate = (iso) => new Date(iso).toLocaleDateString("el-GR", { day: "2-digit", month: "2-digit", year: "numeric" });

const VESSELS = ["MARTA", "ROMVI"];
const PINS = { crew: "1234", admin: "9999" };
const SEVERITIES = ["Χαμηλή", "Μέτρια", "Υψηλή"];
const PRIORITIES = ["Κανονική", "Επείγον"];
const DAMAGE_STATUSES = ["Ανοιχτό", "Σε εξέλιξη", "Κλειστό"];
const ORDER_STATUSES = ["Εκκρεμεί", "Παραγγέλθηκε", "Παραδόθηκε"];
const VESSEL_COLORS = { MARTA: "#1B6CA8", ROMVI: "#0D4D7A" };
const SEV_COLORS = { "Χαμηλή": "#22c55e", "Μέτρια": "#f59e0b", "Υψηλή": "#ef4444" };
const STATUS_COLORS = {
  "Ανοιχτό": "#ef4444", "Σε εξέλιξη": "#f59e0b", "Κλειστό": "#22c55e",
  "Εκκρεμεί": "#ef4444", "Παραγγέλθηκε": "#f59e0b", "Παραδόθηκε": "#22c55e",
};

// ─── STYLES ──────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Montserrat:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --ocean: #1B6CA8; --ocean-dark: #0D4D7A; --ocean-light: #e8f3fc;
    --sand: #f8f5ef; --text: #1a1a2e; --text-light: #5a6a7a;
    --border: #dde8f0; --white: #ffffff;
    --danger: #ef4444; --warning: #f59e0b; --success: #22c55e;
    --radius: 12px; --shadow: 0 2px 12px rgba(13,77,122,0.10); --shadow-lg: 0 8px 32px rgba(13,77,122,0.15);
  }
  body { font-family: 'Montserrat', sans-serif; background: var(--sand); color: var(--text); min-height: 100vh; }
  h1, h2, h3 { font-family: 'Cormorant Garamond', serif; }

  .login-wrap { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: linear-gradient(160deg, var(--ocean-dark) 0%, var(--ocean) 60%, #2a8fd4 100%); padding: 24px; }
  .login-logo-wrap { text-align: center; margin-bottom: 28px; }
  .login-card { background: rgba(255,255,255,0.96); border-radius: 20px; padding: 36px 32px 32px; width: 100%; max-width: 380px; box-shadow: var(--shadow-lg); text-align: center; }
  .login-logo { font-family: 'Cormorant Garamond', serif; font-size: 2.4rem; font-weight: 700; color: var(--ocean-dark); letter-spacing: 2px; margin-bottom: 4px; }
  .login-sub { font-size: 0.72rem; letter-spacing: 2px; text-transform: none; color: var(--text-light); margin-bottom: 32px; }
  .login-label { font-size: 0.7rem; letter-spacing: 1px; text-transform: none; color: var(--text-light); margin-bottom: 8px; display: block; text-align: left; }
  .login-input { width: 100%; padding: 14px 16px; border: 1.5px solid var(--border); border-radius: var(--radius); font-family: 'Montserrat', sans-serif; font-size: 1.1rem; letter-spacing: 6px; text-align: center; margin-bottom: 20px; outline: none; transition: border-color 0.2s; background: var(--sand); }
  .login-input:focus { border-color: var(--ocean); }
  .login-btn { width: 100%; padding: 14px; background: var(--ocean); color: white; border: none; border-radius: var(--radius); font-family: 'Montserrat', sans-serif; font-size: 0.85rem; font-weight: 600; letter-spacing: 1px; text-transform: none; cursor: pointer; transition: background 0.2s; }
  .login-btn:hover { background: var(--ocean-dark); }
  .login-error { color: var(--danger); font-size: 0.78rem; margin-top: -12px; margin-bottom: 16px; }

  .name-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px; }
  .name-btn { padding: 14px 10px; border: 1.5px solid var(--border); border-radius: var(--radius); background: var(--sand); font-family: 'Montserrat', sans-serif; font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: all 0.15s; color: var(--text); }
  .name-btn:hover { border-color: var(--ocean); color: var(--ocean); background: var(--ocean-light); }

  .app { max-width: 480px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; }
  .header { background: var(--ocean-dark); color: white; padding: 16px 20px 12px; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 12px rgba(0,0,0,0.2); }
  .header-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
  .header-logo { font-family: 'Cormorant Garamond', serif; font-size: 1.5rem; font-weight: 700; letter-spacing: 2px; }
  .header-info { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
  .header-name { font-size: 0.72rem; font-weight: 600; letter-spacing: 1px; opacity: 0.9; }
  .header-role { font-size: 0.62rem; letter-spacing: 1px; text-transform: none; opacity: 0.6; }
  .logout-btn { background: rgba(255,255,255,0.15); border: none; color: white; padding: 6px 12px; border-radius: 8px; font-family: 'Montserrat', sans-serif; font-size: 0.7rem; cursor: pointer; letter-spacing: 1px; }
  .vessel-tabs { display: flex; gap: 8px; }
  .vessel-tab { flex: 1; padding: 8px; border: 1.5px solid rgba(255,255,255,0.25); border-radius: 8px; background: transparent; color: rgba(255,255,255,0.6); font-family: 'Montserrat', sans-serif; font-size: 0.75rem; font-weight: 600; letter-spacing: 2px; cursor: pointer; transition: all 0.2s; text-transform: none; }
  .vessel-tab.active { background: white; color: var(--ocean-dark); border-color: white; }

  .nav { display: flex; background: white; border-top: 1px solid var(--border); position: sticky; bottom: 0; z-index: 100; box-shadow: 0 -2px 12px rgba(0,0,0,0.06); }
  .nav-btn { flex: 1; padding: 12px 4px 10px; border: none; background: transparent; color: var(--text-light); cursor: pointer; font-family: 'Montserrat', sans-serif; font-size: 0.55rem; font-weight: 500; letter-spacing: 0.5px; text-transform: none; display: flex; flex-direction: column; align-items: center; gap: 4px; transition: color 0.2s; }
  .nav-btn svg { width: 20px; height: 20px; }
  .nav-btn.active { color: var(--ocean); }

  .content { flex: 1; padding: 20px 16px 16px; overflow-y: auto; }
  .section-title { font-family: 'Cormorant Garamond', serif; font-size: 1.6rem; font-weight: 700; color: var(--ocean-dark); margin-bottom: 4px; }
  .section-sub { font-size: 0.7rem; color: var(--text-light); letter-spacing: 1px; text-transform: none; margin-bottom: 20px; font-weight: 500; }

  .card { background: white; border-radius: var(--radius); padding: 18px; margin-bottom: 14px; box-shadow: var(--shadow); border: 1px solid var(--border); }
  .card-title { font-size: 0.8rem; font-weight: 600; color: var(--ocean-dark); letter-spacing: 0.5px; text-transform: none; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
  .card-title-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--ocean); display: inline-block; }

  .check-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); cursor: pointer; }
  .check-item:last-child { border-bottom: none; }
  .check-box { width: 22px; height: 22px; border-radius: 6px; border: 2px solid var(--border); flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: all 0.15s; background: white; }
  .check-box.checked { background: var(--ocean); border-color: var(--ocean); }
  .check-label { font-size: 0.82rem; color: var(--text); line-height: 1.4; transition: color 0.15s; flex: 1; }
  .check-label.checked { color: var(--text-light); text-decoration: line-through; }
  .check-who { font-size: 0.62rem; color: var(--text-light); white-space: nowrap; }
  .progress-bar-wrap { height: 6px; background: var(--ocean-light); border-radius: 3px; margin: 12px 0 4px; overflow: hidden; }
  .progress-bar { height: 100%; background: var(--ocean); border-radius: 3px; transition: width 0.3s; }
  .progress-label { font-size: 0.7rem; color: var(--text-light); text-align: right; }

  .note-area { width: 100%; padding: 12px; border: 1.5px solid var(--border); border-radius: 10px; font-family: 'Montserrat', sans-serif; font-size: 0.82rem; resize: vertical; min-height: 70px; outline: none; transition: border-color 0.2s; background: var(--sand); }
  .note-area:focus { border-color: var(--ocean); }

  .btn { padding: 12px 20px; border-radius: 10px; border: none; font-family: 'Montserrat', sans-serif; font-size: 0.78rem; font-weight: 600; letter-spacing: 1px; cursor: pointer; transition: all 0.2s; }
  .btn-primary { background: var(--ocean); color: white; }
  .btn-primary:hover { background: var(--ocean-dark); }
  .btn-outline { background: transparent; border: 1.5px solid var(--ocean); color: var(--ocean); }
  .btn-sm { padding: 6px 12px; font-size: 0.7rem; }
  .btn-full { width: 100%; }
  .btn-row { display: flex; gap: 8px; margin-top: 14px; }

  .form-group { margin-bottom: 14px; }
  .form-label { font-size: 0.68rem; font-weight: 600; letter-spacing: 0.5px; text-transform: none; color: var(--text-light); margin-bottom: 6px; display: block; }
  .form-input { width: 100%; padding: 11px 14px; border: 1.5px solid var(--border); border-radius: 10px; font-family: 'Montserrat', sans-serif; font-size: 0.83rem; outline: none; transition: border-color 0.2s; background: var(--sand); }
  .form-input:focus { border-color: var(--ocean); }
  .form-select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235a6a7a' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px; }

  .badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 0.65rem; font-weight: 600; letter-spacing: 0.5px; }
  .list-item { background: white; border-radius: var(--radius); padding: 16px; margin-bottom: 10px; box-shadow: var(--shadow); border: 1px solid var(--border); border-left: 4px solid var(--ocean); }
  .list-item-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 8px; }
  .list-item-title { font-size: 0.88rem; font-weight: 600; color: var(--text); line-height: 1.3; }
  .list-item-meta { font-size: 0.7rem; color: var(--text-light); margin-top: 4px; }
  .list-item-actions { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; }

  .history-item { padding: 12px 0; border-bottom: 1px solid var(--border); }
  .history-item:last-child { border-bottom: none; }
  .history-date { font-size: 0.68rem; color: var(--text-light); margin-bottom: 4px; }
  .history-text { font-size: 0.8rem; color: var(--text); }
  .history-by { display: inline-block; background: var(--ocean-light); color: var(--ocean-dark); font-size: 0.62rem; font-weight: 600; padding: 2px 8px; border-radius: 4px; margin-right: 6px; }

  .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
  .stat-card { background: white; border-radius: var(--radius); padding: 16px; text-align: center; box-shadow: var(--shadow); border: 1px solid var(--border); }
  .stat-num { font-family: 'Cormorant Garamond', serif; font-size: 2.2rem; font-weight: 700; color: var(--ocean-dark); line-height: 1; }
  .stat-label { font-size: 0.63rem; color: var(--text-light); letter-spacing: 0.5px; text-transform: none; margin-top: 4px; }

  .alert-banner { background: #fff8e6; border: 1px solid #f59e0b; border-radius: 10px; padding: 12px 16px; margin-bottom: 14px; font-size: 0.78rem; color: #92400e; display: flex; align-items: center; gap: 8px; }

  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: flex-end; justify-content: center; }
  .modal { background: white; border-radius: 20px 20px 0 0; padding: 24px 20px 32px; width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; animation: slideUp 0.25s ease; }
  @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
  .modal-title { font-family: 'Cormorant Garamond', serif; font-size: 1.4rem; font-weight: 700; color: var(--ocean-dark); margin-bottom: 20px; }
  .modal-handle { width: 40px; height: 4px; background: var(--border); border-radius: 2px; margin: 0 auto 20px; }

  .cat-header { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.5px; text-transform: none; color: var(--ocean-dark); padding: 10px 0 6px; margin-top: 8px; border-bottom: 1px solid var(--ocean-light); }
  .supply-item { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px solid var(--border); cursor: pointer; }
  .supply-item:last-child { border-bottom: none; }
  .supply-check { width: 20px; height: 20px; border-radius: 5px; border: 2px solid var(--border); flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
  .supply-check.checked { background: var(--ocean); border-color: var(--ocean); }
  .supply-label { font-size: 0.82rem; flex: 1; }
  .supply-qty-row { display: flex; gap: 8px; align-items: center; }
  .supply-qty { width: 60px; padding: 6px 8px; border: 1.5px solid var(--border); border-radius: 8px; font-family: 'Montserrat', sans-serif; font-size: 0.8rem; text-align: center; outline: none; background: var(--sand); }
  .supply-unit { width: 80px; padding: 6px 8px; border: 1.5px solid var(--border); border-radius: 8px; font-family: 'Montserrat', sans-serif; font-size: 0.8rem; outline: none; background: var(--sand); }
  .tabs { display: flex; background: var(--ocean-light); border-radius: 10px; padding: 3px; margin-bottom: 16px; }
  .tab { flex: 1; padding: 8px; border: none; background: transparent; color: var(--text-light); font-family: 'Montserrat', sans-serif; font-size: 0.72rem; font-weight: 600; cursor: pointer; border-radius: 8px; transition: all 0.2s; letter-spacing: 0.5px; }
  .tab.active { background: white; color: var(--ocean-dark); box-shadow: var(--shadow); }
  .empty { text-align: center; padding: 40px 20px; color: var(--text-light); }
  .empty-icon { font-size: 2.5rem; margin-bottom: 12px; opacity: 0.4; }
  .empty-text { font-size: 0.82rem; }
  .search-input { width: 100%; padding: 10px 14px; border: 1.5px solid var(--border); border-radius: 10px; font-family: 'Montserrat', sans-serif; font-size: 0.83rem; outline: none; transition: border-color 0.2s; background: white; margin-bottom: 4px; }
  .search-input:focus { border-color: var(--ocean); }
`;

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 20 }) => {
  const icons = {
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    daily: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    weekly: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
    damage: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    orders: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
    history: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  };
  return icons[name] || null;
};

// ─── CHECKLIST VIEW ───────────────────────────────────────────────────────────
function ChecklistView({ vessel, type, userName }) {
  const items = type === "daily" ? DAILY_ITEMS : WEEKLY_ITEMS;
  const key = type === "daily" ? today() : weekStart();
  const table = type === "daily" ? "daily_logs" : "weekly_logs";
  const keyField = type === "daily" ? "date" : "week_start";

  const localKey = `romvi_cl_${table}_${vessel}_${key}`;

  const [checkedMap, setCheckedMap] = useState({});
  const [note, setNote] = useState("");
  const [rowId, setRowId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [synced, setSynced] = useState(false);
  const syncTimer = { current: null };

  // Reset state when vessel or type changes, load from localStorage first
  useEffect(() => {
    setSynced(false);
    setRowId(null);
    try {
      const l = localStorage.getItem(localKey);
      if (l) {
        const parsed = JSON.parse(l);
        setCheckedMap(parsed.checked_map || {});
        setNote(parsed.note || "");
      } else {
        setCheckedMap({});
        setNote("");
      }
    } catch {
      setCheckedMap({});
      setNote("");
    }
    // Fetch from Supabase to get rowId and sync if no local data
    dbGet(table, `?vessel=eq.${vessel}&${keyField}=eq.${key}`).then(rows => {
      if (rows && rows.length > 0) {
        const remote = rows[0];
        setRowId(remote.id);
        try {
          const local = localStorage.getItem(localKey);
          if (!local) {
            setCheckedMap(remote.checked_map || {});
            setNote(remote.note || "");
            localStorage.setItem(localKey, JSON.stringify({ checked_map: remote.checked_map || {}, note: remote.note || "" }));
          }
        } catch {
          setCheckedMap(remote.checked_map || {});
          setNote(remote.note || "");
        }
      }
      setSynced(true);
    }).catch(() => setSynced(true));
  }, [vessel, type]);

  const saveLocal = (newMap, newNote) => {
    try { localStorage.setItem(localKey, JSON.stringify({ checked_map: newMap, note: newNote })); } catch {}
  };

  const syncToSupabase = async (newMap, newNote, currentRowId) => {
    setSaving(true);
    try {
      const payload = { vessel, [keyField]: key, checked_map: newMap, note: newNote, last_by: userName, updated_at: now() };
      if (currentRowId) {
        await dbPatch(table, payload, `?id=eq.${currentRowId}`);
      } else {
        const res = await dbPost(table, payload);
        if (res && res.length > 0) setRowId(res[0].id);
      }
    } catch (e) { console.error("Sync failed, data safe in localStorage", e); }
    setSaving(false);
  };

  const upsert = (newMap, newNote) => {
    saveLocal(newMap, newNote);
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => syncToSupabase(newMap, newNote, rowId), 800);
  };

  const toggle = (item) => {
    const newMap = { ...checkedMap };
    if (newMap[item]) delete newMap[item];
    else newMap[item] = userName;
    setCheckedMap(newMap);
    upsert(newMap, note);
  };

  const updateNote = (val) => {
    setNote(val);
    upsert(checkedMap, val);
  };

  const checkedCount = Object.keys(checkedMap).length;
  const pct = Math.round((checkedCount / items.length) * 100);

  const renderItem = (item) => (
    <div key={item} className="check-item" onClick={() => toggle(item)}>
      <div className={`check-box ${checkedMap[item] ? "checked" : ""}`}>
        {checkedMap[item] && <Icon name="check" size={13} />}
      </div>
      <span className={`check-label ${checkedMap[item] ? "checked" : ""}`}>{item}</span>
      {checkedMap[item] && <span className="check-who">{checkedMap[item]}</span>}
    </div>
  );

  return (
    <div>
      <div className="card">
        <div className="card-title">
          <span className="card-title-dot" style={{ background: VESSEL_COLORS[vessel] }}></span>
          {vessel} — {type === "daily" ? fmtDate(today()) : `Εβδ. ${fmtDate(weekStart())}`}
          {saving && <span style={{ fontSize: "0.65rem", color: "var(--text-light)", marginLeft: "auto" }}>Αποθήκευση...</span>}
          {!saving && !synced && <span style={{ fontSize: "0.65rem", color: "#f59e0b", marginLeft: "auto" }}>Εκτός σύνδεσης</span>}
        </div>
        <div className="progress-bar-wrap">
          <div className="progress-bar" style={{ width: `${pct}%`, background: pct === 100 ? "#22c55e" : VESSEL_COLORS[vessel] }} />
        </div>
        <div className="progress-label">{checkedCount}/{items.length} ολοκληρώθηκαν</div>
        <div style={{ marginTop: 16 }}>
          {type === "daily"
            ? DAILY_SECTIONS.map(section => {
                const sectionChecked = section.items.filter(i => checkedMap[i]).length;
                return (
                  <div key={section.title} style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.5px", color: "var(--ocean-dark)", padding: "10px 0 6px", borderBottom: "1px solid var(--ocean-light)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>{section.title}</span>
                      <span style={{ fontSize: "0.65rem", color: "var(--text-light)", fontWeight: 400 }}>{sectionChecked}/{section.items.length}</span>
                    </div>
                    {section.items.map(renderItem)}
                  </div>
                );
              })
            : items.map(renderItem)
          }
        </div>
        <div style={{ marginTop: 16 }}>
          <label className="form-label">Σημειώσεις</label>
          <textarea className="note-area" placeholder="Προσθήκη σχολίου..." value={note} onChange={e => updateNote(e.target.value)} />
        </div>
      </div>
    </div>
  );
}

// ─── DAMAGES VIEW ─────────────────────────────────────────────────────────────
function DamagesView({ vessel, role, userName }) {
  const [damages, setDamages] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", severity: "Μέτρια" });

  const fetchDamages = () => dbGet("damages", `?vessel=eq.${vessel}&order=created_at.desc`).then(rows => setDamages(rows || []));
  useEffect(() => { fetchDamages(); }, [vessel]);

  const addDamage = async () => {
    if (!form.title.trim()) return;
    await dbPost("damages", { vessel, ...form, status: "Ανοιχτό", by: userName });
    setForm({ title: "", description: "", severity: "Μέτρια" });
    setShowForm(false);
    fetchDamages();
  };

  const updateStatus = async (id, status) => {
    await dbPatch("damages", { status, updated_at: now(), closed_by: userName }, `?id=eq.${id}`);
    fetchDamages();
  };

  const open = damages.filter(d => d.status !== "Κλειστό");
  const closed = damages.filter(d => d.status === "Κλειστό");

  return (
    <div>
      {open.length > 0 && <div className="alert-banner">⚠️ {open.length} ανοιχτ{open.length === 1 ? "ή" : "ές"} βλάβ{open.length === 1 ? "η" : "ες"} σε εκκρεμότητα</div>}
      <button className="btn btn-primary btn-full" onClick={() => setShowForm(true)} style={{ marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <Icon name="plus" size={16} /> Νέα Αναφορά Βλάβης
      </button>
      {damages.length === 0 && <div className="empty"><div className="empty-icon">✅</div><div className="empty-text">Δεν υπάρχουν βλάβες</div></div>}
      {open.map(d => (
        <div key={d.id} className="list-item" style={{ borderLeftColor: SEV_COLORS[d.severity] }}>
          <div className="list-item-header">
            <div>
              <div className="list-item-title">{d.title}</div>
              <div className="list-item-meta">Αναφορά: {d.by} · {fmt(d.created_at)}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
              <span className="badge" style={{ background: SEV_COLORS[d.severity] + "22", color: SEV_COLORS[d.severity] }}>{d.severity}</span>
              <span className="badge" style={{ background: STATUS_COLORS[d.status] + "22", color: STATUS_COLORS[d.status] }}>{d.status}</span>
            </div>
          </div>
          {d.description && <div style={{ fontSize: "0.78rem", color: "var(--text-light)", marginTop: 4 }}>{d.description}</div>}
          {role === "admin" && (
            <div className="list-item-actions">
              {DAMAGE_STATUSES.filter(s => s !== d.status).map(s => (
                <button key={s} className="btn btn-outline btn-sm" onClick={() => updateStatus(d.id, s)}>{s}</button>
              ))}
            </div>
          )}
        </div>
      ))}
      {closed.length > 0 && (
        <details style={{ marginTop: 8 }}>
          <summary style={{ fontSize: "0.75rem", color: "var(--text-light)", cursor: "pointer", padding: "8px 0" }}>Κλειστές βλάβες ({closed.length})</summary>
          {closed.map(d => (
            <div key={d.id} className="list-item" style={{ borderLeftColor: "#22c55e", opacity: 0.7 }}>
              <div className="list-item-header">
                <div className="list-item-title">{d.title}</div>
                <span className="badge" style={{ background: "#22c55e22", color: "#22c55e" }}>Κλειστό</span>
              </div>
              <div className="list-item-meta">Αναφορά: {d.by} · {fmt(d.created_at)}{d.closed_by ? ` · Έκλεισε: ${d.closed_by}` : ""}</div>
            </div>
          ))}
        </details>
      )}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title">Νέα Βλάβη / Φθορά</div>
            <div className="form-group">
              <label className="form-label">Τίτλος *</label>
              <input className="form-input" placeholder="π.χ. Βλάβη κινητήρα Β" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Περιγραφή</label>
              <textarea className="note-area" placeholder="Λεπτομέρειες..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Σοβαρότητα</label>
              <select className="form-input form-select" value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })}>
                {SEVERITIES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="btn-row">
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Άκυρο</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={addDamage}>Καταχώρηση</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ORDERS VIEW ──────────────────────────────────────────────────────────────
function OrdersView({ vessel, role, userName }) {
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [orderTab, setOrderTab] = useState("catalogue");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState({});
  const [manualForm, setManualForm] = useState({ item: "", qty: "", unit: "", priority: "Κανονική" });

  const fetchOrders = () => dbGet("orders", `?vessel=eq.${vessel}&order=created_at.desc`).then(rows => setOrders(rows || []));
  useEffect(() => { fetchOrders(); }, [vessel]);

  const toggleSelected = (item) => {
    const newSel = { ...selected };
    if (newSel[item]) delete newSel[item];
    else newSel[item] = { qty: "", unit: "τμχ", priority: "Κανονική" };
    setSelected(newSel);
  };

  const updateSelField = (item, field, val) => setSelected(s => ({ ...s, [item]: { ...s[item], [field]: val } }));

  const submitCatalogue = async () => {
    const items = Object.entries(selected);
    if (!items.length) return;
    for (const [item, meta] of items) {
      await dbPost("orders", { vessel, item, qty: meta.qty, unit: meta.unit, priority: meta.priority, status: "Εκκρεμεί", by: userName });
    }
    setSelected({});
    setSearch("");
    setShowModal(false);
    fetchOrders();
  };

  const submitManual = async () => {
    if (!manualForm.item.trim()) return;
    await dbPost("orders", { vessel, ...manualForm, status: "Εκκρεμεί", by: userName });
    setManualForm({ item: "", qty: "", unit: "", priority: "Κανονική" });
    setShowModal(false);
    fetchOrders();
  };

  const updateStatus = async (id, status) => {
    await dbPatch("orders", { status, updated_at: now(), updated_by: userName }, `?id=eq.${id}`);
    fetchOrders();
  };

  const pending = orders.filter(o => o.status !== "Παραδόθηκε");
  const done = orders.filter(o => o.status === "Παραδόθηκε");
  const filteredCatalogue = Object.entries(SUPPLIES_CATALOGUE).map(([cat, items]) => ({
    cat, items: search ? items.filter(i => i.toLowerCase().includes(search.toLowerCase())) : items
  })).filter(c => c.items.length > 0);

  return (
    <div>
      <button className="btn btn-primary btn-full" onClick={() => setShowModal(true)} style={{ marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <Icon name="plus" size={16} /> Νέα Παραγγελία
      </button>
      {orders.length === 0 && <div className="empty"><div className="empty-icon">📦</div><div className="empty-text">Δεν υπάρχουν παραγγελίες</div></div>}
      {pending.map(o => (
        <div key={o.id} className="list-item" style={{ borderLeftColor: o.priority === "Επείγον" ? "#ef4444" : "var(--ocean)" }}>
          <div className="list-item-header">
            <div>
              <div className="list-item-title">{o.item}</div>
              <div className="list-item-meta">{o.qty && `${o.qty} ${o.unit} · `}{o.by} · {fmt(o.created_at)}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
              {o.priority === "Επείγον" && <span className="badge" style={{ background: "#ef444422", color: "#ef4444" }}>Επείγον</span>}
              <span className="badge" style={{ background: STATUS_COLORS[o.status] + "22", color: STATUS_COLORS[o.status] }}>{o.status}</span>
            </div>
          </div>
          {role === "admin" && (
            <div className="list-item-actions">
              {ORDER_STATUSES.filter(s => s !== o.status).map(s => (
                <button key={s} className="btn btn-outline btn-sm" onClick={() => updateStatus(o.id, s)}>{s}</button>
              ))}
            </div>
          )}
        </div>
      ))}
      {done.length > 0 && (
        <details style={{ marginTop: 8 }}>
          <summary style={{ fontSize: "0.75rem", color: "var(--text-light)", cursor: "pointer", padding: "8px 0" }}>Παραδόθηκαν ({done.length})</summary>
          {done.map(o => (
            <div key={o.id} className="list-item" style={{ borderLeftColor: "#22c55e", opacity: 0.7 }}>
              <div className="list-item-title">{o.item}</div>
              <div className="list-item-meta">{o.qty && `${o.qty} ${o.unit} · `}{o.by} · {fmt(o.created_at)}</div>
            </div>
          ))}
        </details>
      )}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title">Παραγγελία Προμηθειών</div>
            <div className="tabs">
              <button className={`tab ${orderTab === "catalogue" ? "active" : ""}`} onClick={() => setOrderTab("catalogue")}>Από Κατάλογο</button>
              <button className={`tab ${orderTab === "manual" ? "active" : ""}`} onClick={() => setOrderTab("manual")}>Χειροκίνητα</button>
            </div>
            {orderTab === "catalogue" && (
              <>
                <input className="search-input" placeholder="🔍 Αναζήτηση είδους..." value={search} onChange={e => setSearch(e.target.value)} />
                {Object.keys(selected).length > 0 && (
                  <div style={{ background: "var(--ocean-light)", borderRadius: 8, padding: "8px 12px", marginBottom: 10, fontSize: "0.75rem", color: "var(--ocean-dark)" }}>
                    ✓ {Object.keys(selected).length} είδη επιλεγμένα
                  </div>
                )}
                {filteredCatalogue.map(({ cat, items }) => (
                  <div key={cat}>
                    <div className="cat-header">{cat}</div>
                    {items.map(item => (
                      <div key={item}>
                        <div className="supply-item" onClick={() => toggleSelected(item)}>
                          <div className={`supply-check ${selected[item] ? "checked" : ""}`}>
                            {selected[item] && <Icon name="check" size={11} />}
                          </div>
                          <span className="supply-label">{item}</span>
                        </div>
                        {selected[item] && (
                          <div className="supply-qty-row" style={{ paddingLeft: 30, paddingBottom: 8 }}>
                            <input className="supply-qty" type="number" placeholder="Ποσ." value={selected[item].qty} onChange={e => updateSelField(item, "qty", e.target.value)} onClick={e => e.stopPropagation()} />
                            <input className="supply-unit" placeholder="τμχ / μ / κιλά" value={selected[item].unit} onChange={e => updateSelField(item, "unit", e.target.value)} onClick={e => e.stopPropagation()} />
                            <select className="supply-unit form-select" value={selected[item].priority} onChange={e => updateSelField(item, "priority", e.target.value)} onClick={e => e.stopPropagation()} style={{ width: 100, fontSize: "0.72rem" }}>
                              <option>Κανονική</option><option>Επείγον</option>
                            </select>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
                <div className="btn-row" style={{ position: "sticky", bottom: 0, background: "white", paddingTop: 12 }}>
                  <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Άκυρο</button>
                  <button className="btn btn-primary" style={{ flex: 2 }} onClick={submitCatalogue} disabled={!Object.keys(selected).length}>
                    Καταχώρηση ({Object.keys(selected).length})
                  </button>
                </div>
              </>
            )}
            {orderTab === "manual" && (
              <>
                <div className="form-group">
                  <label className="form-label">Είδος *</label>
                  <input className="form-input" placeholder="π.χ. Σκοινί 12mm" value={manualForm.item} onChange={e => setManualForm({ ...manualForm, item: e.target.value })} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div className="form-group">
                    <label className="form-label">Ποσότητα</label>
                    <input className="form-input" type="number" placeholder="0" value={manualForm.qty} onChange={e => setManualForm({ ...manualForm, qty: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Μονάδα</label>
                    <input className="form-input" placeholder="τμχ, μ, κιλά..." value={manualForm.unit} onChange={e => setManualForm({ ...manualForm, unit: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Προτεραιότητα</label>
                  <select className="form-input form-select" value={manualForm.priority} onChange={e => setManualForm({ ...manualForm, priority: e.target.value })}>
                    <option>Κανονική</option><option>Επείγον</option>
                  </select>
                </div>
                <div className="btn-row">
                  <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Άκυρο</button>
                  <button className="btn btn-primary" style={{ flex: 2 }} onClick={submitManual}>Καταχώρηση</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── HISTORY VIEW ─────────────────────────────────────────────────────────────
function HistoryView({ vessel }) {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    Promise.all([
      dbGet("daily_logs", `?vessel=eq.${vessel}&order=updated_at.desc`),
      dbGet("weekly_logs", `?vessel=eq.${vessel}&order=updated_at.desc`),
      dbGet("damages", `?vessel=eq.${vessel}&order=created_at.desc`),
      dbGet("orders", `?vessel=eq.${vessel}&order=created_at.desc`),
    ]).then(([daily, weekly, damages, orders]) => {
      const all = [];
      (daily || []).forEach(l => {
        const count = Object.keys(l.checked_map || {}).length;
        const who = [...new Set(Object.values(l.checked_map || {}))].join(", ");
        all.push({ date: l.updated_at, text: `Ημερήσιο checklist: ${count} εργασίες ολοκληρώθηκαν${l.note ? " · " + l.note : ""}`, by: who || l.last_by });
      });
      (weekly || []).forEach(l => {
        const count = Object.keys(l.checked_map || {}).length;
        const who = [...new Set(Object.values(l.checked_map || {}))].join(", ");
        all.push({ date: l.updated_at, text: `Εβδομαδιαίο checklist: ${count} εργασίες ολοκληρώθηκαν${l.note ? " · " + l.note : ""}`, by: who || l.last_by });
      });
      (damages || []).forEach(d => all.push({ date: d.created_at, text: `Βλάβη [${d.severity}]: ${d.title} → ${d.status}`, by: d.by }));
      (orders || []).forEach(o => all.push({ date: o.created_at, text: `Παραγγελία: ${o.item}${o.qty ? ` (${o.qty} ${o.unit})` : ""} → ${o.status}`, by: o.by }));
      all.sort((a, b) => new Date(b.date) - new Date(a.date));
      setEntries(all);
    });
  }, [vessel]);

  return (
    <div className="card">
      {entries.length === 0 && <div className="empty"><div className="empty-icon">🕐</div><div className="empty-text">Δεν υπάρχει ιστορικό ακόμα</div></div>}
      {entries.map((e, i) => (
        <div key={i} className="history-item">
          <div className="history-date"><span className="history-by">{e.by || "—"}</span>{fmt(e.date)}</div>
          <div className="history-text">{e.text}</div>
        </div>
      ))}
    </div>
  );
}

// ─── DASHBOARD VIEW ───────────────────────────────────────────────────────────
function DashboardView() {
  const [stats, setStats] = useState({ openDamages: [], pendingOrders: [], todayChecks: 0 });

  useEffect(() => {
    Promise.all([
      dbGet("damages", `?status=neq.Κλειστό`),
      dbGet("orders", `?status=neq.Παραδόθηκε`),
      dbGet("daily_logs", `?date=eq.${today()}`),
    ]).then(([damages, orders, checks]) => {
      setStats({ openDamages: damages || [], pendingOrders: orders || [], todayChecks: (checks || []).length });
    });
  }, []);

  const urgentOrders = stats.pendingOrders.filter(o => o.priority === "Επείγον");
  const highDamages = stats.openDamages.filter(d => d.severity === "Υψηλή");

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-num" style={{ color: stats.openDamages.length > 0 ? "#ef4444" : "#22c55e" }}>{stats.openDamages.length}</div>
          <div className="stat-label">Ανοιχτές Βλάβες</div>
        </div>
        <div className="stat-card">
          <div className="stat-num" style={{ color: stats.pendingOrders.length > 0 ? "#f59e0b" : "#22c55e" }}>{stats.pendingOrders.length}</div>
          <div className="stat-label">Εκκρεμείς Παραγγελίες</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{stats.todayChecks}</div>
          <div className="stat-label">Checklists Σήμερα</div>
        </div>
        <div className="stat-card">
          <div className="stat-num" style={{ color: urgentOrders.length > 0 ? "#ef4444" : "var(--ocean-dark)" }}>{urgentOrders.length}</div>
          <div className="stat-label">Επείγουσες Παραγγελίες</div>
        </div>
      </div>
      {highDamages.length > 0 && <div className="alert-banner">🔴 Υψηλής σοβαρότητας: {highDamages.map(d => `${d.vessel} — ${d.title}`).join(", ")}</div>}
      {urgentOrders.length > 0 && <div className="alert-banner" style={{ background: "#fff0f0", borderColor: "#ef4444", color: "#7f1d1d" }}>🚨 Επείγουσες παραγγελίες: {urgentOrders.map(o => `${o.vessel} — ${o.item}`).join(", ")}</div>}
      {["MARTA", "ROMVI"].map(v => (
        <div key={v} className="card">
          <div className="card-title"><span className="card-title-dot" style={{ background: VESSEL_COLORS[v] }}></span>{v}</div>
          {stats.openDamages.filter(d => d.vessel === v).map(d => (
            <div key={d.id} style={{ fontSize: "0.78rem", marginBottom: 4 }}>⚠️ {d.title} <span style={{ color: SEV_COLORS[d.severity] }}>({d.severity})</span></div>
          ))}
          {stats.pendingOrders.filter(o => o.vessel === v).map(o => (
            <div key={o.id} style={{ fontSize: "0.78rem", color: "var(--text-light)" }}>📦 {o.item} ({o.status})</div>
          ))}
          {stats.openDamages.filter(d => d.vessel === v).length === 0 && stats.pendingOrders.filter(o => o.vessel === v).length === 0 &&
            <div style={{ fontSize: "0.78rem", color: "#22c55e" }}>✅ Όλα εντάξει</div>}
        </div>
      ))}
    </div>
  );
}


// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  // step: "pin" | "name" | "app"
  const [step, setStep] = useState("pin");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [role, setRole] = useState(null);
  const [userName, setUserName] = useState("");
  const [vessel, setVessel] = useState("MARTA");
  const [tab, setTab] = useState("daily");

  const handlePin = () => {
    if (pin === PINS.admin) { setRole("admin"); setPinError(""); setStep("name"); }
    else if (pin === PINS.crew) { setRole("crew"); setPinError(""); setStep("name"); }
    else { setPinError("Λάθος PIN. Δοκίμασε ξανά."); }
    setPin("");
  };

  const handleName = (name) => { setUserName(name); setStep("app"); };

  const handleLogout = () => { setStep("pin"); setRole(null); setUserName(""); setPin(""); };

  // ── PIN SCREEN ──
  if (step === "pin") return (
    <>
      <style>{css}</style>
      <div className="login-wrap">
        <div className="login-logo-wrap">
          <img src="data:image/png;base64,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" alt="Romvi" style={{height: "56px"}}/>
        </div>
        <div className="login-card">
          <div className="login-sub">Sailing · Crew Portal</div>
          <label className="login-label">Εισάγετε PIN</label>
          <input className="login-input" type="password" inputMode="numeric" maxLength={4} value={pin}
            onChange={e => setPin(e.target.value)} onKeyDown={e => e.key === "Enter" && handlePin()} placeholder="····" />
          {pinError && <div className="login-error">{pinError}</div>}
          <button className="login-btn" onClick={handlePin}>Είσοδος</button>
        </div>
      </div>
    </>
  );

  // ── NAME SCREEN ──
  if (step === "name") return (
    <>
      <style>{css}</style>
      <div className="login-wrap">
        <div className="login-logo-wrap">
          <img src="data:image/png;base64,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" alt="Romvi" style={{height: "56px"}}/>
        </div>
        <div className="login-card">
          <div className="login-sub">Ποιος είσαι;</div>
          <div className="name-grid">
            {CREW_NAMES.map(name => (
              <button key={name} className="name-btn" onClick={() => handleName(name)}>{name}</button>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  // ── APP ──
  const navItems = [
    ...(role === "admin" ? [{ id: "dashboard", label: "Dashboard", icon: "check" }] : []),
    { id: "daily", label: "Ημερήσιο", icon: "daily" },
    { id: "weekly", label: "Εβδομαδ.", icon: "weekly" },
    { id: "damages", label: "Βλάβες", icon: "damage" },
    { id: "orders", label: "Παραγγ.", icon: "orders" },
    { id: "history", label: "Ιστορικό", icon: "history" },
  ];

  const titles = { dashboard: "Dashboard", daily: "Ημερήσιο Checklist", weekly: "Εβδομαδιαίο Checklist", damages: "Βλάβες & Φθορές", orders: "Παραγγελίες", history: "Ιστορικό" };

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="header">
          <div className="header-top">
            <img src="data:image/png;base64,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" alt="Romvi" style={{height: "32px"}}/>
            <div className="header-info">
              <div className="header-name">{userName}</div>
              <div className="header-role">{role === "admin" ? "Admin" : "Crew"}</div>
              <button className="logout-btn" style={{ marginTop: 4 }} onClick={handleLogout}>Έξοδος</button>
            </div>
          </div>
          {tab !== "dashboard" && (
            <div className="vessel-tabs">
              {VESSELS.map(v => (
                <button key={v} className={`vessel-tab ${vessel === v ? "active" : ""}`} onClick={() => setVessel(v)}>{v}</button>
              ))}
            </div>
          )}
        </div>

        <div className="content">
          <div className="section-title">{titles[tab]}</div>
          <div className="section-sub">{tab === "dashboard" ? "Συνολικη Εικονα" : vessel}</div>
          {tab === "dashboard" && <DashboardView />}
          {tab === "daily" && <ChecklistView vessel={vessel} type="daily" userName={userName} />}
          {tab === "weekly" && <ChecklistView vessel={vessel} type="weekly" userName={userName} />}
          {tab === "damages" && <DamagesView vessel={vessel} role={role} userName={userName} />}
          {tab === "orders" && <OrdersView vessel={vessel} role={role} userName={userName} />}
          {tab === "history" && <HistoryView vessel={vessel} />}
        </div>

        <nav className="nav">
          {navItems.map(n => (
            <button key={n.id} className={`nav-btn ${tab === n.id ? "active" : ""}`} onClick={() => setTab(n.id)}>
              <Icon name={n.icon} size={20} />
              {n.label}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
