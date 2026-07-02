import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Label,
  LabelList,
  LineChart,
  Line,
} from "recharts";
import {
  LayoutDashboard,
  Settings,
  Download,
  RotateCcw,
  Search,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Target,
  Wallet,
  Sparkles,
  X,
  Triangle,
  CandlestickChart,
  BrickWall,
  Coins,
  Layers,
  Banknote,
  Bitcoin,
  LandPlot,
  AlertTriangle,
  Camera,
  History,
  DollarSign,
  ArrowUp,
  ArrowDown,
  Cloud,
  Loader2,
  RefreshCw,
  Zap,
  Shield,
  BarChart3,
  PieChart as PieChartIcon,
  Sun,
  Moon,
  CornerUpLeft,
  Eye,
  EyeOff,
} from "lucide-react";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { getFirestore, doc, onSnapshot, setDoc } from "firebase/firestore";

/* ═══════════════════════════════════════════════════════
   CONSTANTS & CONFIG
   ═══════════════════════════════════════════════════════ */

const STORAGE_KEY = "asset_warroom_pro_v104_currency_final";
const ONBOARDING_KEY = "asset_warroom_onboarded_v2";
const CLOUD_DOC_PATH = { collection: "warrooms", doc: "shared_asset_warroom" };

const firebaseConfig = {
  apiKey: "AIzaSyCbOt1oq1pUjv7itsgNaTuDR3qw-5azbLU",
  authDomain: "premium-wealth-command-center.firebaseapp.com",
  projectId: "premium-wealth-command-center",
  storageBucket: "premium-wealth-command-center.firebasestorage.app",
  messagingSenderId: "344662439136",
  appId: "1:344662439136:web:2d42f60ae170be0966cc85",
};

const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

const DEFAULT_CATEGORY_ORDER = [
  "美股ETF",
  "美股",
  "基金",
  "台股",
  "現金",
  "虛擬貨幣",
  "其他",
];

const CATEGORY_COLORS = {
  美股ETF: "#1E3A5F",
  美股: "#2B5289",
  基金: "#4A7AB5",
  台股: "#0D7C4A",
  現金: "#3A9B6E",
  虛擬貨幣: "#B91C1C",
  其他: "#7C8594",
};

/* 深色模式專用類別色票：淺色版的深藍系在深色背景上對比不足 */
const CATEGORY_COLORS_DARK = {
  美股ETF: "#6B8EEC",
  美股: "#8B7CF6",
  基金: "#5EC2E8",
  台股: "#34D399",
  現金: "#F0B847",
  虛擬貨幣: "#F97066",
  其他: "#94A3B8",
};

const DEFAULT_COLOR = "#94A3B8";

const INITIAL_DATA = [
  {
    id: "1",
    category: "美股",
    name: "PLTR",
    value: 65000,
    currency: "USD",
    targetPercent: 10,
  },
  {
    id: "2",
    category: "美股",
    name: "TSLA",
    value: 1568,
    currency: "USD",
    targetPercent: 10,
  },
  {
    id: "3",
    category: "美股ETF",
    name: "QQQ",
    value: 15560,
    currency: "USD",
    targetPercent: 15,
  },
  {
    id: "4",
    category: "美股ETF",
    name: "VOO",
    value: 12860,
    currency: "USD",
    targetPercent: 20,
  },
  {
    id: "5",
    category: "美股ETF",
    name: "VTI",
    value: 12720,
    currency: "USD",
    targetPercent: 20,
  },
  {
    id: "6",
    category: "美股ETF",
    name: "VXUS",
    value: 1968,
    currency: "USD",
    targetPercent: 5,
  },
  {
    id: "7",
    category: "美股ETF",
    name: "VT",
    value: 1995,
    currency: "USD",
    targetPercent: 15,
  },
  {
    id: "8",
    category: "台股",
    name: "0050",
    value: 555414,
    currency: "TWD",
    targetPercent: 5,
  },
  {
    id: "9",
    category: "台股",
    name: "00985A",
    value: 195034,
    currency: "TWD",
    targetPercent: 0,
  },
  {
    id: "10",
    category: "基金",
    name: "法巴乾淨能源",
    value: 442316,
    currency: "TWD",
    targetPercent: 0,
  },
  {
    id: "11",
    category: "基金",
    name: "摩根中國A股",
    value: 424064,
    currency: "TWD",
    targetPercent: 0,
  },
  {
    id: "12",
    category: "基金",
    name: "野村高科技",
    value: 74476,
    currency: "TWD",
    targetPercent: 0,
  },
  {
    id: "13",
    category: "基金",
    name: "安聯台灣科技",
    value: 78227,
    currency: "TWD",
    targetPercent: 0,
  },
  {
    id: "14",
    category: "現金",
    name: "台幣活存",
    value: 500000,
    currency: "TWD",
    targetPercent: 0,
  },
  {
    id: "15",
    category: "虛擬貨幣",
    name: "Bitcoin",
    value: 150000,
    currency: "TWD",
    targetPercent: 0,
  },
  {
    id: "16",
    category: "其他",
    name: "保單現值",
    value: 120000,
    currency: "TWD",
    targetPercent: 0,
  },
];

const INITIAL_REF_DATA = {
  lastMonthValue: 6000000,
  startYearValue: 5500000,
  usdToTwd: 32,
};
const INITIAL_NEW_ASSET = {
  category: "其他",
  name: "",
  value: "",
  currency: "TWD",
  targetPercent: "",
};

/* ═══════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');

:root, [data-theme="light"] {
  --c-bg:#F5F6F8; --c-surface:#FFFFFF; --c-surface-2:#F8F9FB; --c-surface-3:#ECEEF2;
  --c-border:rgba(15,23,42,0.06); --c-border-2:rgba(15,23,42,0.10);
  --c-text:#0F172A; --c-text-2:#475569; --c-text-3:#94A3B8;
  --c-accent:#1E3A5F; --c-accent-2:#2B5289;
  --c-green:#0D7C4A; --c-green-dim:rgba(13,124,74,0.07);
  --c-red:#B91C1C; --c-red-dim:rgba(185,28,28,0.06);
  --c-yellow:#92610E; --c-yellow-dim:rgba(146,97,14,0.08);
  --c-topbar-bg:rgba(255,255,255,0.88);
  --c-modal-overlay:rgba(15,23,42,0.30);
  --c-hero-total-bg:linear-gradient(160deg,#0F172A 0%,#1A2744 50%,#162035 100%);
  --c-hero-total-border:rgba(30,58,95,0.15);
  --c-hero-total-mini-bg:rgba(255,255,255,0.06);
  --c-hero-total-mini-border:rgba(255,255,255,0.08);
  --c-chart-grid:rgba(15,23,42,0.05); --c-row-hover:rgba(15,23,42,0.02);
  --c-cat-header-hover:rgba(15,23,42,0.02);
  --c-detail-bg:rgba(248,249,251,0.7); --c-empty-bg:rgba(245,246,248,0.8);
  --c-tooltip-bg:rgba(255,255,255,0.97); --c-tooltip-text:#0F172A;
  --c-tooltip-shadow:0 12px 32px rgba(15,23,42,0.10); --c-tooltip-border:rgba(15,23,42,0.08);
  --c-pie-center-text:#0F172A; --c-pie-center-sub:#94A3B8;
  --radius-sm:6px; --radius-md:10px; --radius-lg:14px; --radius-xl:18px;
  --shadow-sm:0 1px 3px rgba(15,23,42,0.05); --shadow-md:0 4px 14px rgba(15,23,42,0.07);
  --shadow-lg:0 10px 30px rgba(15,23,42,0.09); --shadow-glow:0 0 24px rgba(30,58,95,0.05);
  --font:'IBM Plex Sans',system-ui,-apple-system,sans-serif;
  --mono:'IBM Plex Mono',ui-monospace,monospace;
}

[data-theme="dark"] {
  --c-bg:#08090D; --c-surface:#0E1017; --c-surface-2:#161921; --c-surface-3:#1E222D;
  --c-border:rgba(99,130,180,0.08); --c-border-2:rgba(99,130,180,0.14);
  --c-text:#E2E8F0; --c-text-2:#8B9AB8; --c-text-3:#5A6A82;
  --c-accent:#6B8EEC; --c-accent-2:#8B7CF6;
  --c-green:#34D399; --c-green-dim:rgba(52,211,153,0.10);
  --c-red:#F97066; --c-red-dim:rgba(249,112,102,0.10);
  --c-yellow:#F0B847; --c-yellow-dim:rgba(240,184,71,0.10);
  --c-topbar-bg:rgba(8,9,13,0.88);
  --c-modal-overlay:rgba(0,0,0,0.65);
  --c-hero-total-bg:linear-gradient(160deg,#0C0E14 0%,#111520 50%,#0F1320 100%);
  --c-hero-total-border:rgba(99,130,180,0.14);
  --c-hero-total-mini-bg:rgba(99,130,180,0.04);
  --c-hero-total-mini-border:rgba(99,130,180,0.08);
  --c-chart-grid:rgba(99,130,180,0.06); --c-row-hover:rgba(99,130,180,0.02);
  --c-cat-header-hover:rgba(99,130,180,0.02);
  --c-detail-bg:rgba(12,14,20,0.5); --c-empty-bg:rgba(12,14,20,0.4);
  --c-tooltip-bg:rgba(14,16,23,0.96); --c-tooltip-text:#E2E8F0;
  --c-tooltip-shadow:0 16px 40px rgba(0,0,0,0.5); --c-tooltip-border:rgba(99,130,180,0.12);
  --c-pie-center-text:#E2E8F0; --c-pie-center-sub:#5A6A82;
  --shadow-sm:0 1px 4px rgba(0,0,0,0.3); --shadow-md:0 4px 16px rgba(0,0,0,0.35);
  --shadow-lg:0 12px 36px rgba(0,0,0,0.4); --shadow-glow:0 0 30px rgba(99,130,180,0.06);
}

*{box-sizing:border-box;margin:0;padding:0;}
html,body,#root{min-height:100vh;background:var(--c-bg);color:var(--c-text);font-family:var(--font);-webkit-font-smoothing:antialiased;transition:background 0.35s ease,color 0.35s ease;}
button,input,select{font:inherit;}

@keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
@keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
@keyframes slideDown{from{opacity:0;max-height:0;}to{opacity:1;max-height:2000px;}}
@keyframes slideUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
@keyframes shrink{from{width:100%;}to{width:0%;}}
@keyframes shimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}
@keyframes onboardIn{from{opacity:0;transform:scale(0.94) translateY(24px);}to{opacity:1;transform:scale(1) translateY(0);}}

.animate-in{animation:fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards;opacity:0;}
.delay-1{animation-delay:0.05s;} .delay-2{animation-delay:0.1s;} .delay-3{animation-delay:0.15s;}
.delay-4{animation-delay:0.2s;} .delay-5{animation-delay:0.25s;} .delay-6{animation-delay:0.3s;} .delay-7{animation-delay:0.35s;}
.spin{animation:spin 1s linear infinite;}

.app{min-height:100vh;padding-bottom:100px;}
.shell{max-width:1520px;margin:0 auto;padding:0 24px;}

.topbar{position:sticky;top:0;z-index:100;background:var(--c-topbar-bg);backdrop-filter:blur(24px) saturate(180%);border-bottom:1px solid var(--c-border);}
.topbar-inner{max-width:1520px;margin:0 auto;padding:16px 24px;display:flex;align-items:center;justify-content:space-between;gap:16px;}
.brand{display:flex;align-items:center;gap:16px;}
.brand-badge{width:46px;height:46px;border-radius:14px;display:flex;align-items:center;justify-content:center;color:white;background:linear-gradient(135deg,var(--c-accent) 0%,var(--c-accent-2) 100%);box-shadow:0 6px 20px rgba(30,58,95,0.25),inset 0 1px 0 rgba(255,255,255,0.15);transition:transform 0.2s cubic-bezier(0.16,1,0.3,1),box-shadow 0.2s ease;cursor:pointer;flex-shrink:0;}
.brand-badge:hover{transform:scale(1.08) translateY(-1px);box-shadow:0 10px 28px rgba(30,58,95,0.38),inset 0 1px 0 rgba(255,255,255,0.2);}
.brand-title{font-size:22px;font-weight:800;letter-spacing:-0.04em;color:var(--c-text);}
.brand-title span{color:var(--c-accent);}
.brand-sub{margin-top:3px;font-size:10px;letter-spacing:0.2em;color:var(--c-text-3);font-weight:700;text-transform:uppercase;}
.top-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}

.status-pill{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:7px 14px;background:var(--c-surface-2);border:1px solid var(--c-border);font-size:11px;font-weight:700;}
.status-pill.saved{color:var(--c-green);} .status-pill.saving{color:var(--c-accent);} .status-pill.error{color:var(--c-red);}

.btn{border:1px solid var(--c-border-2);background:var(--c-surface-2);border-radius:var(--radius-sm);padding:9px 16px;color:var(--c-text-2);cursor:pointer;transition:all 0.2s cubic-bezier(0.16,1,0.3,1);display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:700;white-space:nowrap;}
.btn:hover{background:var(--c-surface-3);color:var(--c-text);transform:translateY(-1px);box-shadow:var(--shadow-sm);}
.btn.primary{color:white;background:linear-gradient(135deg,var(--c-accent),var(--c-accent-2));border-color:transparent;font-weight:700;box-shadow:0 4px 16px rgba(30,58,95,0.22);}
.btn.primary:hover{box-shadow:0 8px 24px rgba(30,58,95,0.30);}
.btn.icon{width:40px;height:40px;justify-content:center;padding:0;}
.btn:disabled{opacity:0.4;cursor:not-allowed;transform:none;}

.hero{padding:32px 0 0;}
.hero-card{position:relative;overflow:hidden;border-radius:var(--radius-xl);background:var(--c-surface);border:1px solid var(--c-border-2);box-shadow:var(--shadow-lg),var(--shadow-glow);padding:40px;}
.hero-card::before{content:"";position:absolute;top:-120px;right:-120px;width:400px;height:400px;background:radial-gradient(circle,rgba(30,58,95,0.05),transparent 65%);pointer-events:none;}
.hero-card::after{content:"";position:absolute;inset:0;border-radius:var(--radius-xl);background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");pointer-events:none;opacity:0.4;mix-blend-mode:multiply;}
[data-theme="dark"] .hero-card::after{mix-blend-mode:overlay;opacity:0.7;}
.hero-grid{display:grid;grid-template-columns:1fr 1.15fr;gap:32px;align-items:stretch;position:relative;z-index:1;}
.hero-title{font-size:62px;line-height:0.92;letter-spacing:-0.06em;font-weight:900;color:var(--c-text);}
.hero-desc{margin-top:16px;max-width:480px;color:var(--c-text-3);font-size:15px;line-height:1.7;font-weight:500;}
.hero-tags{margin-top:32px;display:flex;gap:10px;flex-wrap:wrap;}
.hero-tag{display:inline-flex;align-items:center;gap:7px;padding:8px 14px;border-radius:999px;background:var(--c-surface-2);border:1px solid var(--c-border);font-size:12px;font-weight:700;color:var(--c-text-2);}
.hero-right{display:flex;flex-direction:column;justify-content:space-between;gap:16px;}

.hero-total-box{border-radius:var(--radius-lg);padding:28px 32px;background:var(--c-hero-total-bg);border:1px solid var(--c-hero-total-border);box-shadow:inset 0 1px 0 rgba(255,255,255,0.06),0 16px 40px rgba(0,0,0,0.3);flex:1;display:flex;flex-direction:column;justify-content:center;position:relative;overflow:hidden;}
.hero-total-box::before{content:"";position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(99,130,180,0.4),rgba(107,142,236,0.6),rgba(99,130,180,0.4),transparent);pointer-events:none;}
.hero-total-label{font-size:11px;font-weight:700;letter-spacing:0.15em;color:rgba(255,255,255,0.5);margin-bottom:12px;text-transform:uppercase;}
.hero-total-value{font-size:48px;line-height:1;letter-spacing:-0.03em;font-weight:700;color:#FFFFFF;font-family:var(--mono);}
.hero-total-sub{margin-top:16px;font-size:13px;color:rgba(255,255,255,0.5);font-weight:500;line-height:1.6;}
.hero-total-mini-grid{margin-top:16px;display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.hero-total-mini{padding:12px 14px;border-radius:var(--radius-sm);background:var(--c-hero-total-mini-bg);border:1px solid var(--c-hero-total-mini-border);}
.hero-total-mini-label{font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.4);font-weight:700;}
.hero-total-mini-value{margin-top:6px;font-size:22px;font-weight:700;color:rgba(255,255,255,0.9);letter-spacing:-0.03em;font-family:var(--mono);}

.quick-insight{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
.quick-card{border-radius:var(--radius-md);padding:16px;background:var(--c-surface-2);border:1px solid var(--c-border);transition:all 0.2s ease;}
.quick-card:hover{border-color:var(--c-border-2);transform:translateY(-1px);}
.quick-label{font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--c-text-3);font-weight:700;margin-bottom:10px;}
.quick-value{font-size:18px;font-weight:700;letter-spacing:-0.01em;color:var(--c-text);font-family:var(--mono);}
.quick-value.positive{color:var(--c-green);} .quick-value.negative{color:var(--c-red);}

.filters{margin-top:24px;display:flex;flex-direction:column;gap:16px;}
.filters-row{display:grid;grid-template-columns:1.3fr 0.9fr;gap:16px;}
.filter-card{border-radius:var(--radius-lg);padding:20px;background:var(--c-surface);border:1px solid var(--c-border);}
.filter-count{display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border-radius:999px;background:var(--c-accent);color:white;font-size:11px;font-weight:700;white-space:nowrap;}
.filter-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
.search-box{flex:1;min-width:220px;position:relative;}
.search-box input{width:100%;height:44px;border-radius:var(--radius-sm);border:1px solid var(--c-border-2);background:var(--c-surface-2);padding:0 14px 0 42px;outline:none;font-size:13px;font-weight:600;color:var(--c-text);transition:border-color 0.2s;}
.search-box input:focus{border-color:var(--c-accent);}
.search-box input::placeholder{color:var(--c-text-3);}
.search-box svg{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--c-text-3);}
.select-box select{height:44px;min-width:160px;border-radius:var(--radius-sm);border:1px solid var(--c-border-2);background:var(--c-surface-2);padding:0 14px;outline:none;font-size:13px;font-weight:700;color:var(--c-text-2);cursor:pointer;}
.fx-box{display:inline-flex;align-items:center;gap:8px;}
.fx-box input{height:44px;width:88px;border-radius:var(--radius-sm);border:1px solid var(--c-border-2);background:var(--c-surface-2);padding:0 12px;outline:none;font-size:14px;font-weight:700;font-family:var(--mono);color:var(--c-text);text-align:right;}
.fx-box input:focus{border-color:var(--c-accent);}
.fx-label{display:inline-flex;align-items:center;gap:7px;color:var(--c-text-2);font-size:13px;font-weight:800;}
.fx-status{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:700;padding:5px 10px;border-radius:999px;}
.fx-status.loading{color:var(--c-accent);background:rgba(108,142,242,0.1);}
.fx-status.success{color:var(--c-green);background:var(--c-green-dim);}
.fx-status.error{color:var(--c-red);background:var(--c-red-dim);}
.category-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;}
.category-chip{border:1px solid var(--c-border-2);background:var(--c-surface-2);border-radius:999px;padding:8px 14px;cursor:pointer;display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:700;color:var(--c-text-2);transition:all 0.2s ease;}
.category-chip:hover{border-color:var(--c-text-3);color:var(--c-text);}
.category-chip.active{background:var(--c-accent);color:white;border-color:var(--c-accent);box-shadow:0 4px 12px rgba(108,142,242,0.25);}
.category-dot{width:8px;height:8px;border-radius:999px;flex-shrink:0;}

.kpi-grid{margin-top:24px;display:grid;grid-template-columns:1.3fr 1fr 1fr 1fr;gap:16px;}
.card{border-radius:var(--radius-lg);background:var(--c-surface);border:1px solid var(--c-border);transition:all 0.25s cubic-bezier(0.16,1,0.3,1);}
.kpi-card{padding:24px;min-height:150px;position:relative;overflow:hidden;}
.kpi-card.featured{background:var(--c-surface);border:1px solid var(--c-border-2);box-shadow:var(--shadow-md);border-left:3px solid var(--c-accent);}
.kpi-card.featured .kpi-label{color:var(--c-text-3);}
.kpi-card.featured .kpi-value{color:var(--c-accent)!important;}
.kpi-card.featured .kpi-sub{color:var(--c-text-3);}
.kpi-card:hover{border-color:var(--c-border-2);transform:translateY(-2px);box-shadow:var(--shadow-md);}
.kpi-label{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:12px;color:var(--c-text-3);font-weight:700;margin-bottom:16px;}
.kpi-value{font-size:34px;line-height:1;letter-spacing:-0.02em;font-weight:700;color:var(--c-text);font-family:var(--mono);}
.kpi-value.positive{color:var(--c-green);} .kpi-value.negative{color:var(--c-red);}
.kpi-sub{margin-top:10px;font-size:12px;color:var(--c-text-3);font-weight:600;}
.inline-tooltip{position:relative;display:inline-flex;align-items:center;cursor:help;}
.inline-tooltip-bubble{position:absolute;top:calc(100% + 8px);left:0;width:220px;padding:10px 12px;border-radius:var(--radius-sm);background:var(--c-surface-3);color:var(--c-text-2);font-size:12px;line-height:1.6;box-shadow:var(--shadow-lg);opacity:0;pointer-events:none;transition:opacity 0.2s;z-index:10;border:1px solid var(--c-border-2);}
.inline-tooltip:hover .inline-tooltip-bubble{opacity:1;}
.kpi-badge{display:inline-flex;align-items:center;padding:4px 10px;border-radius:999px;font-size:10px;font-weight:800;white-space:nowrap;letter-spacing:0.03em;}

.section-toggle-bar{display:flex;align-items:center;gap:12px;padding:14px 0 10px;cursor:pointer;user-select:none;}
.section-toggle-label{font-size:14px;font-weight:800;color:var(--c-text-2);letter-spacing:0.02em;text-transform:uppercase;flex:1;}
.section-toggle-line{flex:1;height:1px;background:var(--c-border-2);}

.analytics-grid{margin-top:16px;display:grid;grid-template-columns:1.1fr 1fr 1.05fr;gap:16px;}
.chart-card{padding:24px;min-height:460px;display:flex;flex-direction:column;}
.card-title{display:flex;align-items:center;gap:9px;font-size:15px;font-weight:800;color:var(--c-text);margin-bottom:6px;}
.card-desc{margin-bottom:18px;color:var(--c-text-3);font-size:13px;font-weight:500;line-height:1.6;}
.chart-wrap{flex:1;min-height:290px;}
.legend-row{display:flex;justify-content:center;gap:18px;margin-top:16px;flex-wrap:wrap;}
.legend-item{display:inline-flex;align-items:center;gap:6px;font-size:11px;color:var(--c-text-3);font-weight:700;}
.legend-dot{width:8px;height:8px;border-radius:999px;}

.hint-list{flex:1;display:flex;flex-direction:column;gap:10px;overflow-y:auto;padding-right:4px;}
.hint-list::-webkit-scrollbar{width:4px;}
.hint-list::-webkit-scrollbar-track{background:transparent;}
.hint-list::-webkit-scrollbar-thumb{background:var(--c-surface-3);border-radius:4px;}
.hint{border-radius:var(--radius-md);overflow:hidden;display:flex;transition:all 0.2s ease;border:1px solid transparent;}
.hint:hover{transform:translateY(-1px);}
.hint.sell{background:linear-gradient(135deg,rgba(249,112,102,0.06),rgba(249,112,102,0.02));border-color:rgba(249,112,102,0.12);}
.hint.buy{background:linear-gradient(135deg,rgba(52,211,153,0.06),rgba(52,211,153,0.02));border-color:rgba(52,211,153,0.12);}
.hint-side{width:64px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.hint.sell .hint-side{color:var(--c-red);border-right:1px solid rgba(249,112,102,0.12);}
.hint.buy .hint-side{color:var(--c-green);border-right:1px solid rgba(52,211,153,0.12);}
.hint-side-inner{display:flex;flex-direction:column;align-items:center;gap:6px;font-size:10px;font-weight:800;letter-spacing:0.05em;}
.hint-body{flex:1;padding:14px 16px;}
.hint-top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;}
.hint-name{font-size:14px;font-weight:800;color:var(--c-text);}
.hint-meta{margin-top:4px;color:var(--c-text-3);font-size:11px;font-weight:600;}
.hint-badge{white-space:nowrap;padding:4px 10px;border-radius:999px;font-size:10px;font-weight:800;}
.hint.sell .hint-badge{color:var(--c-red);background:var(--c-red-dim);}
.hint.buy .hint-badge{color:var(--c-green);background:var(--c-green-dim);}
.hint-action{margin-top:8px;color:var(--c-text-2);font-size:12px;font-weight:600;}
.hint-action strong{font-size:15px;letter-spacing:-0.02em;}
.hint.sell .hint-action strong{color:var(--c-red);}
.hint.buy .hint-action strong{color:var(--c-green);}

.monthly-grid{margin-top:16px;display:grid;grid-template-columns:1.1fr 0.9fr;gap:16px;}
.monthly-card{padding:24px;}
.monthly-summary-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;}
.summary-mini{border-radius:var(--radius-md);padding:16px;background:var(--c-surface-2);border:1px solid var(--c-border);}
.summary-mini-label{font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:var(--c-text-3);font-weight:700;margin-bottom:8px;}
.summary-mini-value{font-size:18px;font-weight:700;color:var(--c-text);letter-spacing:-0.01em;font-family:var(--mono);}
.summary-mini-value.positive{color:var(--c-green);} .summary-mini-value.negative{color:var(--c-red);}
.summary-mini-sub{margin-top:6px;font-size:11px;color:var(--c-text-3);font-weight:600;}

.snap-list{display:flex;flex-direction:column;gap:8px;max-height:360px;overflow-y:auto;}
.snap-list::-webkit-scrollbar{width:4px;}
.snap-list::-webkit-scrollbar-thumb{background:var(--c-surface-3);border-radius:4px;}
.snap-item{border-radius:var(--radius-md);background:var(--c-surface-2);border:1px solid var(--c-border);padding:14px;transition:border-color 0.2s;}
.snap-item:hover{border-color:var(--c-border-2);}
.snap-item-head{display:flex;justify-content:space-between;align-items:center;}
.snap-date{font-size:14px;font-weight:800;color:var(--c-text);}
.snap-total{font-size:15px;font-weight:700;color:var(--c-accent);font-family:var(--mono);}
.snap-meta{margin-top:6px;font-size:11px;color:var(--c-text-3);font-weight:600;}
.snap-breakdown{margin-top:10px;display:flex;flex-wrap:wrap;gap:6px;}
.snap-chip{display:inline-flex;align-items:center;gap:5px;border-radius:999px;padding:4px 10px;background:var(--c-surface-3);border:1px solid var(--c-border);font-size:10px;font-weight:700;color:var(--c-text-2);}

.empty{flex:1;border-radius:var(--radius-md);border:1px dashed var(--c-border-2);background:var(--c-empty-bg);display:flex;align-items:center;justify-content:center;text-align:center;padding:40px;color:var(--c-text-3);font-weight:600;font-size:13px;line-height:1.7;}
.empty-icon{width:56px;height:56px;border-radius:999px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;background:var(--c-surface-2);border:1px solid var(--c-border);}

.skeleton{border-radius:var(--radius-md);background:linear-gradient(90deg,var(--c-surface-2) 25%,var(--c-surface-3) 50%,var(--c-surface-2) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;height:20px;}
.skeleton-card{border-radius:var(--radius-lg);background:var(--c-surface);border:1px solid var(--c-border);padding:28px;display:flex;flex-direction:column;gap:16px;}

.table-card{margin-top:24px;overflow:hidden;}
.table-head{padding:20px 24px;background:var(--c-surface-2);border-bottom:1px solid var(--c-border);display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;}
.table-head-left{display:flex;flex-direction:column;gap:4px;}
.table-title{display:flex;align-items:center;gap:8px;font-size:15px;font-weight:800;color:var(--c-text);}
.table-sub{color:var(--c-text-3);font-size:12px;font-weight:500;}
.table-head-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap;width:100%;}
.add-inline-form{display:grid;grid-template-columns:140px 1fr 100px 130px 110px auto;gap:8px;width:100%;margin-top:12px;}
.add-inline-form select,.add-inline-form input{width:100%;height:42px;border-radius:var(--radius-sm);border:1px solid var(--c-border-2);background:var(--c-surface-3);padding:0 12px;outline:none;font-size:13px;font-weight:600;color:var(--c-text);}
.add-inline-form input.invalid{border-color:var(--c-red)!important;background:var(--c-red-dim);}
.add-inline-form input::placeholder{color:var(--c-text-3);}
.add-inline-form .mini-btn{height:42px;padding:0 16px;border-radius:var(--radius-sm);border:none;cursor:pointer;font-weight:800;font-size:13px;transition:all 0.2s ease;}
.mini-btn.add{background:linear-gradient(135deg,var(--c-accent),var(--c-accent-2));color:white;box-shadow:0 4px 12px rgba(30,58,95,0.18);}
.mini-btn.add:hover{box-shadow:0 6px 18px rgba(30,58,95,0.28);}
.mini-btn.clear{background:var(--c-surface-3);color:var(--c-text-2);}
.mini-btn.clear:hover{background:var(--c-surface-2);}

.category-block+.category-block{border-top:1px solid var(--c-border);}
.category-header{padding:18px 24px;display:flex;align-items:center;justify-content:space-between;gap:16px;cursor:pointer;transition:background 0.2s;}
.category-header:hover{background:var(--c-cat-header-hover);}
.category-header:focus-visible{outline:2px solid var(--c-accent);outline-offset:-2px;}
.section-toggle-bar:focus-visible{outline:2px solid var(--c-accent);outline-offset:2px;border-radius:8px;}
.category-left{display:flex;align-items:center;gap:14px;min-width:220px;}
.category-color{width:4px;height:36px;border-radius:999px;flex-shrink:0;}
.category-name-wrap{display:flex;flex-direction:column;gap:3px;}
.category-name{display:flex;align-items:center;gap:7px;font-size:14px;font-weight:800;color:var(--c-text);}
.category-count{font-size:11px;color:var(--c-text-3);font-weight:600;}
.category-right{display:flex;align-items:center;gap:20px;flex-wrap:wrap;}
.cat-box{text-align:right;}
.cat-label{font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:var(--c-text-3);font-weight:700;margin-bottom:5px;}
.cat-value{font-size:13px;color:var(--c-text-2);font-family:var(--mono);font-weight:700;}
.cat-value strong{color:var(--c-text);}
.gap-badge{display:inline-flex;align-items:center;gap:5px;padding:6px 10px;border-radius:var(--radius-sm);font-size:11px;font-family:var(--mono);font-weight:800;}
.gap-badge.over{color:var(--c-red);background:var(--c-red-dim);}
.gap-badge.under{color:var(--c-green);background:var(--c-green-dim);}
.sort-actions{display:inline-flex;gap:4px;align-items:center;}
.sort-btn{width:30px;height:30px;border:1px solid var(--c-border-2);border-radius:8px;background:var(--c-surface-2);color:var(--c-text-3);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.15s ease;}
.sort-btn:hover{color:var(--c-text);background:var(--c-surface-3);}
.sort-btn:disabled{opacity:0.3;cursor:not-allowed;}

.category-detail{background:var(--c-detail-bg);border-top:1px solid var(--c-border);padding:0 24px 20px;animation:slideDown 0.3s cubic-bezier(0.16,1,0.3,1);}
.detail-table-wrap{overflow-x:auto;}
.detail-table-wrap::-webkit-scrollbar{height:4px;}
.detail-table-wrap::-webkit-scrollbar-thumb{background:var(--c-surface-3);border-radius:4px;}
.detail-table{width:100%;min-width:1100px;border-collapse:collapse;}
.detail-table th{text-align:left;font-size:10px;color:var(--c-text-3);letter-spacing:0.08em;text-transform:uppercase;font-weight:700;padding:14px 8px;border-bottom:1px solid var(--c-border);}
.detail-table td{padding:12px 8px;border-bottom:1px solid var(--c-border);font-size:13px;color:var(--c-text-2);}
.detail-table tr:hover{background:var(--c-row-hover);}
.item-cell{display:flex;align-items:center;gap:10px;}
.tag{display:inline-flex;align-items:center;padding:3px 8px;border-radius:6px;background:var(--c-surface-3);color:var(--c-text-3);font-size:9px;font-weight:800;letter-spacing:0.06em;}
.item-input{width:130px;border:none;background:transparent;font-size:13px;font-weight:800;color:var(--c-text);outline:none;}
.item-input.invalid{border-bottom:2px solid var(--c-red);}
.value-input{width:100%;border:none;border-bottom:1px solid transparent;background:transparent;text-align:right;outline:none;font-family:var(--mono);font-size:13px;color:var(--c-text);padding-bottom:2px;}
.value-input:hover,.value-input:focus{border-bottom-color:var(--c-text-3);}
.value-input.invalid{border-bottom-color:var(--c-red)!important;color:var(--c-red);}
.percent-inline{display:inline-flex;align-items:center;gap:6px;}
.percent-box{display:inline-flex;align-items:center;gap:4px;border-radius:8px;background:var(--c-surface-3);border:1px solid var(--c-border-2);padding:5px 8px;}
.percent-input{width:40px;border:none;background:transparent;outline:none;text-align:right;color:var(--c-accent);font-weight:800;font-family:var(--mono);font-size:13px;}
.current-pct{color:var(--c-text-3);font-family:var(--mono);font-size:12px;font-weight:700;}
.diff-chip{display:inline-flex;align-items:center;gap:5px;padding:5px 10px;border-radius:var(--radius-sm);font-size:11px;font-family:var(--mono);font-weight:800;}
.diff-chip.over{color:var(--c-red);background:var(--c-red-dim);}
.diff-chip.under{color:var(--c-green);background:var(--c-green-dim);}
.fx-hint{font-size:10px;color:var(--c-text-3);font-weight:600;margin-top:3px;}
.invalid-hint{font-size:10px;color:var(--c-red);font-weight:700;margin-top:3px;}
.delete-btn{width:36px;height:36px;border-radius:8px;border:none;background:transparent;color:var(--c-text-3);cursor:pointer;transition:all 0.2s;display:inline-flex;align-items:center;justify-content:center;}
.delete-btn:hover{background:var(--c-red-dim);color:var(--c-red);}
.category-footer{display:flex;justify-content:flex-start;padding-top:12px;}
.add-btn-inline{display:inline-flex;align-items:center;gap:7px;border:1px dashed var(--c-border-2);background:transparent;color:var(--c-text-3);border-radius:var(--radius-sm);padding:10px 14px;font-size:12px;font-weight:700;cursor:pointer;transition:all 0.2s;}
.add-btn-inline:hover{color:var(--c-accent);border-color:var(--c-accent);background:var(--c-surface-3);}
.add-form-toggle{display:flex;align-items:center;gap:7px;border:1px dashed var(--c-border-2);background:transparent;color:var(--c-text-3);border-radius:var(--radius-sm);padding:10px 16px;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.2s ease;width:100%;justify-content:center;}
.add-form-toggle:hover{color:var(--c-accent);border-color:var(--c-accent);background:var(--c-surface-3);}
.add-form-toggle.open{color:var(--c-accent);border-color:var(--c-accent);border-style:solid;background:var(--c-surface-3);}
.add-form-content{overflow:hidden;max-height:0;opacity:0;transition:max-height 0.3s ease,opacity 0.3s ease,margin 0.3s ease;margin-top:0;}
.add-form-content.open{max-height:200px;opacity:1;margin-top:12px;}

.mobile-asset-card{display:none;border-radius:var(--radius-md);background:var(--c-surface-2);border:1px solid var(--c-border);padding:16px;margin-bottom:8px;}
.mobile-asset-card-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;}
.mobile-asset-card-name{font-size:15px;font-weight:800;color:var(--c-text);display:flex;align-items:center;gap:8px;}
.mobile-asset-card-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.mobile-asset-card-field{display:flex;flex-direction:column;gap:3px;}
.mobile-asset-card-field-label{font-size:10px;text-transform:uppercase;letter-spacing:0.06em;color:var(--c-text-3);font-weight:700;}
.mobile-asset-card-field-value{font-size:13px;font-weight:700;color:var(--c-text);font-family:var(--mono);}

.modal-overlay{position:fixed;inset:0;z-index:200;background:var(--c-modal-overlay);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;padding:24px;animation:fadeIn 0.2s ease;}
.modal{width:100%;max-width:440px;border-radius:var(--radius-lg);background:var(--c-surface);border:1px solid var(--c-border-2);box-shadow:var(--shadow-lg);padding:28px;animation:fadeUp 0.3s cubic-bezier(0.16,1,0.3,1);}
.modal.center{text-align:center;}
.modal-icon-danger{width:56px;height:56px;border-radius:999px;margin:0 auto 18px;display:flex;align-items:center;justify-content:center;background:var(--c-red-dim);color:var(--c-red);}
.modal-title{font-size:20px;font-weight:800;letter-spacing:-0.02em;margin-bottom:8px;color:var(--c-text);}
.modal-text{font-size:13px;line-height:1.7;color:var(--c-text-3);margin-bottom:24px;font-weight:500;}
.modal-actions{display:flex;gap:10px;}
.modal-actions button{flex:1;height:44px;border-radius:var(--radius-sm);border:none;cursor:pointer;font-weight:800;font-size:13px;transition:all 0.2s ease;}
.modal-cancel{background:var(--c-surface-2);color:var(--c-text-2);border:1px solid var(--c-border-2)!important;}
.modal-cancel:hover{background:var(--c-surface-3);}
.modal-confirm{background:var(--c-red);color:white;box-shadow:0 4px 12px rgba(249,112,102,0.25);}
.modal-confirm:hover{box-shadow:0 6px 18px rgba(249,112,102,0.35);}
.settings-title{display:flex;align-items:center;gap:8px;font-size:18px;font-weight:800;color:var(--c-text);margin-bottom:20px;}
.form-group+.form-group{margin-top:18px;}
.form-label{display:block;margin-bottom:8px;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:var(--c-text-3);font-weight:700;}
.form-input{width:100%;height:48px;border-radius:var(--radius-sm);border:1px solid var(--c-border-2);background:var(--c-surface-2);padding:0 14px;text-align:right;font-size:18px;font-family:var(--mono);font-weight:700;color:var(--c-text);outline:none;}
.form-input:focus{border-color:var(--c-accent);box-shadow:0 0 0 3px rgba(108,142,242,0.15);}
.settings-actions{display:flex;justify-content:flex-end;margin-top:24px;}
.settings-done{height:44px;border-radius:var(--radius-sm);border:none;padding:0 20px;background:linear-gradient(135deg,var(--c-accent),var(--c-accent-2));color:white;font-weight:700;cursor:pointer;box-shadow:0 4px 12px rgba(30,58,95,0.18);}

.onboard-modal{max-width:560px;animation:onboardIn 0.4s cubic-bezier(0.16,1,0.3,1);}
.onboard-badge{display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;background:var(--c-yellow-dim);border:1px solid rgba(146,97,14,0.15);color:var(--c-yellow);font-size:11px;font-weight:800;letter-spacing:0.08em;margin-bottom:20px;}
.onboard-title{font-size:26px;font-weight:900;letter-spacing:-0.03em;color:var(--c-text);margin-bottom:10px;}
.onboard-sub{font-size:14px;color:var(--c-text-3);line-height:1.7;margin-bottom:24px;}
.onboard-steps{display:flex;flex-direction:column;gap:12px;margin-bottom:24px;}
.onboard-step{display:flex;align-items:flex-start;gap:14px;padding:14px 16px;border-radius:var(--radius-md);background:var(--c-surface-2);border:1px solid var(--c-border);}
.onboard-step-num{width:28px;height:28px;border-radius:999px;display:flex;align-items:center;justify-content:center;background:var(--c-accent);color:white;font-size:12px;font-weight:800;flex-shrink:0;margin-top:1px;}
.onboard-step-body{flex:1;}
.onboard-step-title{font-size:14px;font-weight:800;color:var(--c-text);margin-bottom:3px;}
.onboard-step-desc{font-size:12px;color:var(--c-text-3);line-height:1.5;}
.onboard-cta{width:100%;height:52px;border-radius:var(--radius-md);border:none;cursor:pointer;font-size:15px;font-weight:800;color:white;background:linear-gradient(135deg,var(--c-accent),var(--c-accent-2));box-shadow:0 6px 20px rgba(30,58,95,0.25);transition:all 0.2s;}
.onboard-cta:hover{box-shadow:0 10px 28px rgba(30,58,95,0.35);transform:translateY(-1px);}

.toast-stack{position:fixed;bottom:28px;left:50%;transform:translateX(-50%);z-index:300;display:flex;flex-direction:column;gap:10px;pointer-events:none;}
.toast{display:flex;align-items:center;gap:14px;padding:14px 18px;border-radius:var(--radius-lg);background:var(--c-text);color:var(--c-bg);box-shadow:0 12px 32px rgba(0,0,0,0.25);font-size:13px;font-weight:700;pointer-events:all;min-width:300px;animation:slideUp 0.3s cubic-bezier(0.16,1,0.3,1);}
.toast-undo-btn{background:rgba(255,255,255,0.18);border:none;color:inherit;border-radius:6px;padding:6px 12px;cursor:pointer;font-size:12px;font-weight:800;display:flex;align-items:center;gap:5px;transition:background 0.2s;white-space:nowrap;}
.toast-undo-btn:hover{background:rgba(255,255,255,0.28);}
.toast-bar{height:3px;background:rgba(255,255,255,0.25);border-radius:999px;overflow:hidden;flex:1;}
.toast-bar-fill{height:100%;background:rgba(255,255,255,0.6);border-radius:999px;}

.nudge-banner{margin-top:16px;border-radius:var(--radius-lg);padding:16px 20px;background:var(--c-yellow-dim);border:1px solid rgba(146,97,14,0.15);display:flex;align-items:center;gap:14px;}
.nudge-icon{width:36px;height:36px;border-radius:999px;display:flex;align-items:center;justify-content:center;background:rgba(146,97,14,0.12);color:var(--c-yellow);flex-shrink:0;}
.nudge-body{flex:1;}
.nudge-title{font-size:13px;font-weight:800;color:var(--c-yellow);margin-bottom:2px;}
.nudge-sub{font-size:12px;color:var(--c-text-3);line-height:1.5;}
.nudge-dismiss{background:transparent;border:none;color:var(--c-text-3);cursor:pointer;padding:4px;border-radius:4px;display:flex;transition:color 0.2s;}
.nudge-dismiss:hover{color:var(--c-text);}

.example-banner{margin-top:16px;border-radius:var(--radius-lg);padding:14px 20px;background:rgba(30,58,95,0.06);border:1px solid rgba(30,58,95,0.12);display:flex;align-items:center;gap:12px;}
.example-banner-text{flex:1;font-size:12px;color:var(--c-text-2);font-weight:600;line-height:1.5;}
.example-banner-text strong{color:var(--c-accent);font-weight:800;}

.insight-box{margin-bottom:16px;padding:16px 18px;border-radius:var(--radius-md);background:var(--c-surface-2);border:1px solid var(--c-border);}
.insight-label{font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:var(--c-text-3);font-weight:700;margin-bottom:8px;}
.insight-text{font-size:13px;line-height:1.8;color:var(--c-text-2);font-weight:500;}

.t-up{transform:none;} .t-down{transform:rotate(180deg);}

.mobile-add-sheet{display:none;}
.mobile-add-sheet-overlay{display:none;position:fixed;inset:0;z-index:140;background:var(--c-modal-overlay);backdrop-filter:blur(4px);}
.mobile-add-sheet-overlay.open{display:block;}

@media (max-width:768px){
  .mobile-add-sheet{display:block;position:fixed;bottom:0;left:0;right:0;z-index:150;background:var(--c-surface);border-top:1px solid var(--c-border-2);padding:20px 16px 32px;box-shadow:0 -12px 40px rgba(0,0,0,0.15);transform:translateY(100%);transition:transform 0.35s cubic-bezier(0.16,1,0.3,1);}
  .mobile-add-sheet.open{transform:translateY(0);}
  .mobile-add-sheet-handle{width:36px;height:4px;border-radius:999px;background:var(--c-border-2);margin:0 auto 20px;}
  .mobile-add-sheet-overlay{display:none;position:fixed;inset:0;z-index:140;background:var(--c-modal-overlay);backdrop-filter:blur(4px);}
  .mobile-add-sheet-overlay.open{display:block;}
  .mobile-add-form{display:flex;flex-direction:column;gap:12px;}
  .mobile-add-form select,.mobile-add-form input{width:100%;height:48px;border-radius:var(--radius-sm);border:1px solid var(--c-border-2);background:var(--c-surface-2);padding:0 14px;outline:none;font-size:15px;font-weight:600;color:var(--c-text);}
  .mobile-add-form-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
  .mobile-add-form-cta{height:52px;border-radius:var(--radius-md);border:none;cursor:pointer;font-size:15px;font-weight:800;color:white;background:linear-gradient(135deg,var(--c-accent),var(--c-accent-2));box-shadow:0 4px 16px rgba(30,58,95,0.22);}
  .add-inline-form{display:none!important;}
  .add-form-toggle{display:none!important;}
  #mobile-add-trigger{display:inline-flex!important;}
  .topbar-inner{flex-direction:column;align-items:flex-start;}
  .hero-title{font-size:34px;}
  .hero-card{padding:24px;}
  .hero-grid,.kpi-grid,.quick-insight,.monthly-summary-grid,.filters-row{grid-template-columns:1fr;}
  .hero-total-value{font-size:36px;}
  .category-header{flex-direction:column;align-items:flex-start;gap:12px;}
  .category-right{width:100%;justify-content:space-between;}
  .shell{padding:0 16px;}
  .detail-table-wrap{display:none;}
  .mobile-asset-card{display:block;}
  .analytics-grid,.monthly-grid{grid-template-columns:1fr;}
  .delete-btn{width:44px;height:44px;}
}
`;

/* ═══════════════════════════════════════════════════════
   UTILITY FUNCTIONS
   ═══════════════════════════════════════════════════════ */
function formatCurrency(val) {
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    maximumFractionDigits: 0,
  }).format(val || 0);
}
function formatUsd(val) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(val || 0);
}
function formatCompact(val) {
  return new Intl.NumberFormat("zh-TW", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(val || 0);
}
function formatCompactFixed(val) {
  const num = Number(val) || 0;
  if (Math.abs(num) >= 10000) return `${(num / 10000).toFixed(1)} 萬`;
  return num.toLocaleString("zh-TW", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}
function formatFullNumber(val) {
  return new Intl.NumberFormat("zh-TW").format(Math.round(val || 0));
}
function generateId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
function getCategoryColor(category, dark) {
  const palette = dark ? CATEGORY_COLORS_DARK : CATEGORY_COLORS;
  return palette[category] || DEFAULT_COLOR;
}
function inferCurrencyFromCategory(category) {
  return category === "美股ETF" || category === "美股" ? "USD" : "TWD";
}
function getDisplayCurrency(asset) {
  return asset.currency || inferCurrencyFromCategory(asset.category);
}
function convertAssetToTwd(asset, usdToTwd) {
  const value = Number(asset.value) || 0;
  return getDisplayCurrency(asset) === "USD" ? value * usdToTwd : value;
}
function convertValueByCurrency(value, fromCurrency, toCurrency, usdToTwd) {
  const num = Number(value) || 0;
  if (fromCurrency === toCurrency) return num;
  if (fromCurrency === "USD" && toCurrency === "TWD")
    return Math.round(num * usdToTwd);
  if (fromCurrency === "TWD" && toCurrency === "USD")
    return usdToTwd ? Number((num / usdToTwd).toFixed(2)) : num;
  return num;
}
function getMonthKey(dateObj) {
  return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
}
function buildSnapshot({ assets, usdToTwd, date }) {
  const dateObj = date ? new Date(date) : new Date();
  const totalValue = assets.reduce(
    (sum, a) => sum + convertAssetToTwd(a, usdToTwd),
    0
  );
  const categoryMap = {};
  assets.forEach((a) => {
    const cat = a.category || "其他";
    categoryMap[cat] = (categoryMap[cat] || 0) + convertAssetToTwd(a, usdToTwd);
  });
  return {
    id: generateId(),
    date: dateObj.toISOString(),
    monthKey: getMonthKey(dateObj),
    totalValue,
    usdToTwd,
    assetCount: assets.length,
    categoryBreakdown: Object.entries(categoryMap)
      .map(([category, value]) => ({
        category,
        value,
        percent:
          totalValue > 0 ? Number(((value / totalValue) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.value - a.value),
  };
}
function normalizeAssets(list) {
  return (Array.isArray(list) ? list : []).map((item) => ({
    ...item,
    currency: item.currency || inferCurrencyFromCategory(item.category),
  }));
}
function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw)
      return {
        assets: normalizeAssets(INITIAL_DATA),
        refData: INITIAL_REF_DATA,
        snapshots: [],
        categoryOrder: DEFAULT_CATEGORY_ORDER,
      };
    const parsed = JSON.parse(raw);
    return {
      assets: normalizeAssets(
        Array.isArray(parsed.assets) ? parsed.assets : INITIAL_DATA
      ),
      refData:
        parsed.refData && typeof parsed.refData.lastMonthValue === "number"
          ? parsed.refData
          : INITIAL_REF_DATA,
      snapshots: Array.isArray(parsed.snapshots) ? parsed.snapshots : [],
      categoryOrder: Array.isArray(parsed.categoryOrder)
        ? parsed.categoryOrder
        : DEFAULT_CATEGORY_ORDER,
    };
  } catch {
    return {
      assets: normalizeAssets(INITIAL_DATA),
      refData: INITIAL_REF_DATA,
      snapshots: [],
      categoryOrder: DEFAULT_CATEGORY_ORDER,
    };
  }
}

/* ═══════════════════════════════════════════════════════
   SMALL COMPONENTS
   ═══════════════════════════════════════════════════════ */
function CategoryIcon({ category }) {
  const props = { size: 14 };
  if (category.includes("ETF")) return <CandlestickChart {...props} />;
  if (category === "美股") return <BrickWall {...props} />;
  if (category.includes("基金")) return <Coins {...props} />;
  if (category.includes("台股")) return <Layers {...props} />;
  if (category.includes("現金")) return <Banknote {...props} />;
  if (category.includes("虛擬")) return <Bitcoin {...props} />;
  if (category.includes("房產")) return <LandPlot {...props} />;
  return <LayoutDashboard {...props} />;
}

function KPIValue({ label, value, subValue, isPositive, tooltip, badge }) {
  return (
    <>
      <div className="kpi-label">
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          {label}
          {tooltip && (
            <span className="inline-tooltip">
              <HelpCircle size={12} color="var(--c-text-3)" />
              <span className="inline-tooltip-bubble">{tooltip}</span>
            </span>
          )}
        </span>
        {badge && (
          <span
            className="kpi-badge"
            style={{ color: badge.color, background: badge.bg }}
          >
            {badge.label}
          </span>
        )}
      </div>
      <div
        className={`kpi-value ${
          isPositive === undefined ? "" : isPositive ? "positive" : "negative"
        }`}
      >
        {value}
      </div>
      {subValue && <div className="kpi-sub">{subValue}</div>}
    </>
  );
}

/* ── Undo Toast Component ── */
function UndoToast({ toasts, onUndo, onDismiss }) {
  return (
    <div className="toast-stack" aria-live="polite" aria-atomic="false">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          <span style={{ flex: 1 }}>已刪除「{t.name}」</span>
          <button className="toast-undo-btn" onClick={() => onUndo(t.id)}>
            <CornerUpLeft size={13} /> 復原
          </button>
          <div className="toast-bar">
            <div
              className="toast-bar-fill"
              style={{
                animation: `shrink ${t.duration}ms linear forwards`,
                width: "100%",
              }}
            />
          </div>
          <button
            onClick={() => onDismiss(t.id)}
            style={{
              background: "transparent",
              border: "none",
              color: "rgba(255,255,255,0.5)",
              cursor: "pointer",
              padding: "0 0 0 8px",
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
            }}
            title="關閉"
          >
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ── Skeleton Screen ── */
function SkeletonDashboard() {
  return (
    <div
      style={{
        padding: "32px 0",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      <div className="skeleton-card" style={{ height: 220 }}>
        <div className="skeleton" style={{ width: "40%", height: 14 }} />
        <div className="skeleton" style={{ width: "60%", height: 48 }} />
        <div className="skeleton" style={{ width: "80%", height: 14 }} />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 16,
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton-card" style={{ height: 140 }}>
            <div className="skeleton" style={{ width: "50%", height: 12 }} />
            <div className="skeleton" style={{ width: "70%", height: 36 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Onboarding Modal ── */
function OnboardingModal({ onDismiss, isExampleData }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onDismiss();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onDismiss]);
  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="歡迎使用資產戰情室"
    >
      <div className="modal onboard-modal">
        <div className="onboard-badge">
          <Sparkles size={12} /> 歡迎使用
        </div>
        <div className="onboard-title">資產戰情室 Pro</div>
        <div className="onboard-sub">
          {isExampleData
            ? "目前顯示的是範例資料，幫你了解功能。你可以直接修改數字，或清空後輸入自己的資產。"
            : "你的資產資料已從雲端載入。"}
        </div>
        <div className="onboard-steps">
          {[
            {
              num: 1,
              title: "更新資產市值",
              desc: "在「資產明細」點開各類別，直接修改每筆資產的市值。",
            },
            {
              num: 2,
              title: "設定目標占比",
              desc: "每筆資產都有「目標 %」欄位，設定後系統會自動計算再平衡建議。",
            },
            {
              num: 3,
              title: "記錄月度快照",
              desc: "每個月底按「記錄本月快照」，就能追蹤資產長期變化趨勢。",
            },
          ].map((s) => (
            <div key={s.num} className="onboard-step">
              <div className="onboard-step-num">{s.num}</div>
              <div className="onboard-step-body">
                <div className="onboard-step-title">{s.title}</div>
                <div className="onboard-step-desc">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <button className="onboard-cta" onClick={onDismiss} autoFocus>
          開始使用 →
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════ */

/* ── Confirm Modal Component ── */
function ConfirmModal({ title, message, onConfirm, onCancel }) {
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onCancel]);
  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="modal center">
        <div className="modal-icon-danger">
          <AlertTriangle size={24} />
        </div>
        <div className="modal-title">{title}</div>
        <div className="modal-text">{message}</div>
        <div className="modal-actions">
          <button className="modal-cancel" onClick={onCancel}>
            取消
          </button>
          <button className="modal-confirm" autoFocus onClick={onConfirm}>
            確認
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Settings Modal Component (proper Esc via useEffect) ── */
function SettingsModal({ refData, setRefData, onClose }) {
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="基準與匯率設定"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <div className="settings-title">
          <Settings size={18} />
          基準與匯率設定
        </div>
        <div className="form-group">
          <label className="form-label">上個月底總資產（台幣）</label>
          <input
            className="form-input"
            type="number"
            value={refData.lastMonthValue}
            onChange={(e) =>
              setRefData((p) => ({
                ...p,
                lastMonthValue: Number(e.target.value) || 0,
              }))
            }
          />
          <div
            style={{
              marginTop: 6,
              fontSize: 11,
              color: "var(--c-text-3)",
              fontWeight: 600,
              lineHeight: 1.5,
            }}
          >
            已有上月快照時，「本月變動」會優先採用快照數值，此欄位僅作為備援。
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">今年年初總資產 YTD（台幣）</label>
          <input
            className="form-input"
            type="number"
            value={refData.startYearValue}
            onChange={(e) =>
              setRefData((p) => ({
                ...p,
                startYearValue: Number(e.target.value) || 0,
              }))
            }
          />
        </div>
        <div className="form-group">
          <label className="form-label">美元匯率 USD/TWD</label>
          <input
            className="form-input"
            type="number"
            step="0.01"
            value={refData.usdToTwd}
            onChange={(e) =>
              setRefData((p) => ({
                ...p,
                usdToTwd: Number(e.target.value) || 0,
              }))
            }
          />
        </div>
        <div className="settings-actions">
          <button className="settings-done" autoFocus onClick={onClose}>
            完成設定
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const initialData = loadFromLocalStorage();

  const [assets, setAssets] = useState(initialData.assets);
  const [refData, setRefData] = useState(initialData.refData);
  const [snapshots, setSnapshots] = useState(initialData.snapshots);
  const [categoryOrder, setCategoryOrder] = useState(initialData.categoryOrder);
  const [saveStatus, setSaveStatus] = useState("saved");
  const [cloudStatus, setCloudStatus] = useState("connecting");
  const [cloudError, setCloudError] = useState("");
  const [isCloudReady, setIsCloudReady] = useState(false);
  const [isCloudHydrated, setIsCloudHydrated] = useState(false);
  const [fxLoading, setFxLoading] = useState(false);
  const [fxStatus, setFxStatus] = useState(null);
  const [fxUpdatedAt, setFxUpdatedAt] = useState(null);
  const [fxSuggestion, setFxSuggestion] = useState(null);
  const [hydrationTimedOut, setHydrationTimedOut] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const closeSettings = useCallback(() => setShowSettings(false), []);
  const [confirmDialog, setConfirmDialog] = useState(null); // {message,title,onConfirm}
  const [expandedCategories, setExpandedCategories] = useState(() => {
    try {
      const raw = localStorage.getItem("asset_warroom_expanded");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("全部");
  const [sortMode, setSortMode] = useState("manual");
  const [newAsset, setNewAsset] = useState(INITIAL_NEW_ASSET);
  const [showAddForm, setShowAddForm] = useState(false);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("asset_warroom_theme") || "light";
    } catch {
      return "light";
    }
  });
  const [showAnalytics, setShowAnalytics] = useState(true);

  // ── NEW STATE ──
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      return !localStorage.getItem(ONBOARDING_KEY);
    } catch {
      return true;
    }
  });
  // Derived: true only while assets exactly match the built-in defaults
  const isExampleData = useMemo(() => {
    if (assets.length !== INITIAL_DATA.length) return false;
    return assets.every((a, i) => {
      const d = INITIAL_DATA[i];
      return (
        a.id === d.id &&
        a.name === d.name &&
        Number(a.value) === Number(d.value)
      );
    });
  }, [assets]);
  const [undoToasts, setUndoToasts] = useState([]);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [nudgeDismissed, setNudgeDismissed] = useState(() => {
    try {
      return !!localStorage.getItem("asset_warroom_nudge_dismissed");
    } catch {
      return false;
    }
  });
  const [showMobileAdd, setShowMobileAdd] = useState(false);
  useEffect(() => {
    if (!showMobileAdd) return;
    const h = (e) => {
      if (e.key === "Escape") setShowMobileAdd(false);
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [showMobileAdd]);
  const [newAssetErrors, setNewAssetErrors] = useState({});

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("asset_warroom_theme", theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));
  const isDark = theme === "dark";

  // ── Privacy Mode：一鍵隱藏所有金額 ──
  const [privacyMode, setPrivacyMode] = useState(() => {
    try {
      return localStorage.getItem("asset_warroom_privacy") === "1";
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("asset_warroom_privacy", privacyMode ? "1" : "0");
    } catch {}
  }, [privacyMode]);
  const maskMoney = (formatted) => (privacyMode ? "＊＊＊＊＊" : formatted);

  const isInitialLoad = useRef(true);
  const cloudHydratedRef = useRef(false);
  const skipNextCloudSaveRef = useRef(false);
  const lastSyncedJsonRef = useRef("");

  const buildCloudPureData = () => ({
    assets,
    refData,
    snapshots,
    categoryOrder,
  });

  // ── Exchange Rate ──
  // applyDirectly=true（手動按鈕）直接套用；false（載入時自動）只提示建議，不覆蓋已存匯率
  const fetchExchangeRate = async (applyDirectly = true) => {
    if (applyDirectly) {
      setFxLoading(true);
      setFxStatus(null);
    }
    try {
      const res = await fetch("https://open.er-api.com/v6/latest/USD");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.result !== "success") throw new Error("API error");
      const rate = data?.rates?.TWD;
      if (!rate) throw new Error("TWD rate not found");
      const rounded = Math.round(rate * 100) / 100;
      if (applyDirectly) {
        setRefData((prev) => ({ ...prev, usdToTwd: rounded }));
        setFxSuggestion(null);
        setFxStatus("success");
        setFxUpdatedAt(
          new Date().toLocaleTimeString("zh-TW", {
            hour: "2-digit",
            minute: "2-digit",
          })
        );
      } else {
        setFxSuggestion(rounded);
      }
    } catch (err) {
      if (applyDirectly) setFxStatus("error");
    } finally {
      if (applyDirectly) setFxLoading(false);
    }
  };

  // 等雲端資料就緒後才抓建議匯率，避免 race condition 蓋掉雲端已存的值
  const fxAutoFetchedRef = useRef(false);
  useEffect(() => {
    if (fxAutoFetchedRef.current) return;
    if (!isCloudHydrated && cloudStatus !== "error" && !hydrationTimedOut)
      return;
    fxAutoFetchedRef.current = true;
    fetchExchangeRate(false);
  }, [isCloudHydrated, cloudStatus, hydrationTimedOut]);

  // 離線保護：雲端 4 秒內沒回應就先顯示本地資料，不卡 skeleton
  useEffect(() => {
    const t = setTimeout(() => setHydrationTimedOut(true), 4000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const dynamicCategories = Array.from(
      new Set(assets.map((a) => a.category || "其他"))
    );
    setCategoryOrder((prev) =>
      Array.from(new Set([...prev, ...dynamicCategories]))
    );
  }, [assets]);

  // ── Firebase Auth & Sync ──
  useEffect(() => {
    let unsubDoc = null;
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          await signInAnonymously(auth);
          return;
        }
        const docRef = doc(db, CLOUD_DOC_PATH.collection, CLOUD_DOC_PATH.doc);
        unsubDoc = onSnapshot(
          docRef,
          async (snap) => {
            setIsCloudReady(true);
            if (snap.exists()) {
              const data = snap.data() || {};
              const incoming = {
                assets: normalizeAssets(
                  Array.isArray(data.assets) ? data.assets : INITIAL_DATA
                ),
                refData:
                  data.refData &&
                  typeof data.refData.lastMonthValue === "number"
                    ? data.refData
                    : INITIAL_REF_DATA,
                snapshots: Array.isArray(data.snapshots) ? data.snapshots : [],
                categoryOrder: Array.isArray(data.categoryOrder)
                  ? data.categoryOrder
                  : DEFAULT_CATEGORY_ORDER,
              };
              const incomingJson = JSON.stringify(incoming);
              if (incomingJson !== lastSyncedJsonRef.current) {
                skipNextCloudSaveRef.current = true;
                setAssets(incoming.assets);
                setRefData(incoming.refData);
                setSnapshots(incoming.snapshots);
                setCategoryOrder(incoming.categoryOrder);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(incoming));
                lastSyncedJsonRef.current = incomingJson;
              }
              cloudHydratedRef.current = true;
              setIsCloudHydrated(true);
              setCloudStatus("connected");
              setCloudError("");
            } else {
              const seedData = {
                assets,
                refData,
                snapshots,
                categoryOrder,
                updatedAt: new Date().toISOString(),
              };
              await setDoc(docRef, seedData);
              lastSyncedJsonRef.current = JSON.stringify({
                assets,
                refData,
                snapshots,
                categoryOrder,
              });
              cloudHydratedRef.current = true;
              setIsCloudHydrated(true);
              setCloudStatus("connected");
              setCloudError("");
            }
          },
          (error) => {
            setCloudStatus("error");
            setCloudError(error.message || "雲端同步失敗");
          }
        );
      } catch (error) {
        setCloudStatus("error");
        setCloudError(error.message || "Firebase 登入失敗");
      }
    });
    return () => {
      unsubAuth();
      if (unsubDoc) unsubDoc();
    };
  }, []);

  // ── Save Effect ──
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    setSaveStatus("saving");
    const timer = setTimeout(async () => {
      try {
        const pureData = buildCloudPureData();
        const pureJson = JSON.stringify(pureData);
        localStorage.setItem(STORAGE_KEY, pureJson);
        if (skipNextCloudSaveRef.current) {
          skipNextCloudSaveRef.current = false;
          lastSyncedJsonRef.current = pureJson;
          setSaveStatus("saved");
          return;
        }
        if (isCloudReady && cloudHydratedRef.current) {
          const docRef = doc(db, CLOUD_DOC_PATH.collection, CLOUD_DOC_PATH.doc);
          await setDoc(docRef, {
            ...pureData,
            updatedAt: new Date().toISOString(),
          });
          lastSyncedJsonRef.current = pureJson;
        }
        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [assets, refData, snapshots, categoryOrder, isCloudReady]);

  // ── Auto Snapshot ──
  // 等雲端資料就緒才自動快照，避免用 localStorage 的過期資料建檔
  const autoSnapDoneRef = useRef(false);
  useEffect(() => {
    if (autoSnapDoneRef.current) return;
    if (!isCloudHydrated && cloudStatus !== "error") return;
    const now = new Date();
    if (now.getDate() !== 1) return;
    autoSnapDoneRef.current = true;
    const monthKey = getMonthKey(now);
    setSnapshots((prev) => {
      if (prev.some((s) => s.monthKey === monthKey)) return prev;
      return [
        buildSnapshot({ assets, usdToTwd: refData.usdToTwd, date: now }),
        ...prev,
      ].sort((a, b) => new Date(b.date) - new Date(a.date));
    });
  }, [isCloudHydrated, cloudStatus, assets, refData.usdToTwd]);

  /* ═══════════════════════════════════════════════════════
     COMPUTED
     ═══════════════════════════════════════════════════════ */
  const orderedCategories = useMemo(() => {
    const dynamic = Array.from(
      new Set(assets.map((a) => a.category || "其他"))
    );
    return Array.from(new Set([...categoryOrder, ...dynamic]));
  }, [assets, categoryOrder]);

  const categories = useMemo(
    () => ["全部", ...orderedCategories],
    [orderedCategories]
  );

  const totalValue = useMemo(
    () =>
      assets.reduce(
        (sum, item) => sum + convertAssetToTwd(item, refData.usdToTwd),
        0
      ),
    [assets, refData.usdToTwd]
  );

  const filteredAssets = useMemo(() => {
    let list = [...assets];
    if (activeCategory !== "全部")
      list = list.filter((i) => i.category === activeCategory);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (i) =>
          String(i.name).toLowerCase().includes(q) ||
          String(i.category).toLowerCase().includes(q)
      );
    }
    switch (sortMode) {
      case "value-desc":
        list.sort(
          (a, b) =>
            convertAssetToTwd(b, refData.usdToTwd) -
            convertAssetToTwd(a, refData.usdToTwd)
        );
        break;
      case "value-asc":
        list.sort(
          (a, b) =>
            convertAssetToTwd(a, refData.usdToTwd) -
            convertAssetToTwd(b, refData.usdToTwd)
        );
        break;
      case "name-asc":
        list.sort((a, b) =>
          String(a.name).localeCompare(String(b.name), "zh-Hant")
        );
        break;
      case "target-desc":
        list.sort((a, b) => (b.targetPercent || 0) - (a.targetPercent || 0));
        break;
      default:
        break;
    }
    return list;
  }, [assets, activeCategory, search, sortMode, refData.usdToTwd]);

  const categoryStats = useMemo(() => {
    const stats = {};
    orderedCategories.forEach((cat) => {
      stats[cat] = { currentVal: 0, targetPct: 0, items: [] };
    });
    filteredAssets.forEach((asset) => {
      const cat = asset.category || "其他";
      if (!stats[cat]) stats[cat] = { currentVal: 0, targetPct: 0, items: [] };
      stats[cat].currentVal += convertAssetToTwd(asset, refData.usdToTwd);
      stats[cat].targetPct += Number(asset.targetPercent) || 0;
      stats[cat].items.push(asset);
    });
    Object.keys(stats).forEach((cat) => {
      if (stats[cat].items.length === 0) delete stats[cat];
    });
    return stats;
  }, [filteredAssets, refData.usdToTwd, orderedCategories]);

  const globalCategoryStats = useMemo(() => {
    const stats = {};
    assets.forEach((asset) => {
      const cat = asset.category || "其他";
      if (!stats[cat]) stats[cat] = { currentVal: 0, targetPct: 0, items: [] };
      stats[cat].currentVal += convertAssetToTwd(asset, refData.usdToTwd);
      stats[cat].targetPct += Number(asset.targetPercent) || 0;
      stats[cat].items.push(asset);
    });
    return stats;
  }, [assets, refData.usdToTwd]);

  // 圖表一律用全域資料，不受搜尋／篩選影響（避免占比口徑錯亂）
  const pieData = useMemo(
    () =>
      orderedCategories
        .map((cat) => {
          const d = globalCategoryStats[cat];
          return d
            ? {
                name: cat,
                value: d.currentVal,
                color: getCategoryColor(cat, isDark),
              }
            : null;
        })
        .filter((d) => d && d.value > 0),
    [globalCategoryStats, orderedCategories, isDark]
  );

  const barData = useMemo(
    () =>
      orderedCategories
        .map((cat) => {
          const d = globalCategoryStats[cat];
          if (!d) return null;
          const currentPct =
            totalValue > 0
              ? parseFloat(((d.currentVal / totalValue) * 100).toFixed(1))
              : 0;
          return {
            name: cat,
            目前占比: currentPct,
            目標占比: d.targetPct,
            gapPct: parseFloat((currentPct - d.targetPct).toFixed(1)),
          };
        })
        .filter(Boolean),
    [globalCategoryStats, totalValue, orderedCategories]
  );

  const deviationScore = useMemo(() => {
    if (totalValue === 0) return "0.0";
    let totalDiff = 0;
    Object.values(globalCategoryStats).forEach((d) => {
      totalDiff += Math.abs((d.currentVal / totalValue) * 100 - d.targetPct);
    });
    return (totalDiff / 2).toFixed(1);
  }, [globalCategoryStats, totalValue]);

  const rebalanceHints = useMemo(() => {
    const hints = [];
    assets.forEach((a) => {
      const targetPct = Number(a.targetPercent) || 0;
      // 未設定目標的資產不進建議清單，避免整排「賣出」噪音
      if (targetPct <= 0) return;
      const twdVal = convertAssetToTwd(a, refData.usdToTwd);
      const curPct = totalValue > 0 ? (twdVal / totalValue) * 100 : 0;
      const diffPct = curPct - targetPct;
      const targetVal = totalValue * (targetPct / 100);
      const diffVal = twdVal - targetVal;
      if (Math.abs(diffPct) > 1 || Math.abs(diffVal) > 50000) {
        hints.push({
          id: a.id,
          name: a.name,
          category: a.category,
          targetPct: targetPct,
          currentPct: curPct.toFixed(1),
          diffPct: Math.abs(diffPct).toFixed(1),
          diffVal: Math.abs(diffVal),
          actionType: diffPct > 0 ? "sell" : "buy",
        });
      }
    });
    return hints.sort((a, b) => b.diffVal - a.diffVal).slice(0, 6);
  }, [assets, totalValue, refData.usdToTwd]);

  const allTargetsZero = useMemo(
    () =>
      assets.length > 0 &&
      assets.every((a) => !a.targetPercent || Number(a.targetPercent) === 0),
    [assets]
  );

  const largestAsset = useMemo(
    () =>
      assets.length
        ? [...assets].sort(
            (a, b) =>
              convertAssetToTwd(b, refData.usdToTwd) -
              convertAssetToTwd(a, refData.usdToTwd)
          )[0]
        : null,
    [assets, refData.usdToTwd]
  );

  const highestTargetGap = useMemo(() => {
    if (!assets.length || totalValue === 0) return null;
    return assets
      .map((i) => {
        const t = convertAssetToTwd(i, refData.usdToTwd);
        return {
          ...i,
          diffAbs: Math.abs((t / totalValue) * 100 - i.targetPercent),
        };
      })
      .sort((a, b) => b.diffAbs - a.diffAbs)[0];
  }, [assets, totalValue, refData.usdToTwd]);

  const totalTargetPercent = useMemo(
    () => assets.reduce((s, i) => s + (Number(i.targetPercent) || 0), 0),
    [assets]
  );
  const usdAssetValue = useMemo(
    () =>
      assets
        .filter((i) => getDisplayCurrency(i) === "USD")
        .reduce((s, i) => s + convertAssetToTwd(i, refData.usdToTwd), 0),
    [assets, refData.usdToTwd]
  );
  const cashAssetValue = useMemo(
    () =>
      assets
        .filter((i) => i.category === "現金")
        .reduce((s, i) => s + convertAssetToTwd(i, refData.usdToTwd), 0),
    [assets, refData.usdToTwd]
  );
  const usdAssetRatio = useMemo(
    () =>
      totalValue > 0 ? ((usdAssetValue / totalValue) * 100).toFixed(1) : "0.0",
    [usdAssetValue, totalValue]
  );
  const cashAssetRatio = useMemo(
    () =>
      totalValue > 0 ? ((cashAssetValue / totalValue) * 100).toFixed(1) : "0.0",
    [cashAssetValue, totalValue]
  );
  const cashStatus = useMemo(() => {
    const r = Number(cashAssetRatio);
    if (r < 5)
      return {
        label: "偏低",
        color: "var(--c-yellow)",
        bg: "var(--c-yellow-dim)",
      };
    if (r > 30)
      return {
        label: "偏高",
        color: "var(--c-yellow)",
        bg: "var(--c-yellow-dim)",
      };
    return {
      label: "適中",
      color: "var(--c-green)",
      bg: "var(--c-green-dim)",
    };
  }, [cashAssetRatio]);

  const orderedSnapshots = useMemo(
    () => [...snapshots].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [snapshots]
  );

  // 「本月變動」基準統一：有上月（或更早）快照就用快照，否則退回手動設定值
  const effectiveLastMonth = useMemo(() => {
    const nowKey = getMonthKey(new Date());
    const prevSnap = orderedSnapshots.find((s) => s.monthKey < nowKey);
    if (prevSnap)
      return { value: prevSnap.totalValue, source: `${prevSnap.monthKey} 快照` };
    return { value: refData.lastMonthValue, source: "手動基準" };
  }, [orderedSnapshots, refData.lastMonthValue]);

  const performance = useMemo(() => {
    const baseline = effectiveLastMonth.value;
    const monthDiff = totalValue - baseline;
    const monthPct =
      baseline > 0 ? ((monthDiff / baseline) * 100).toFixed(1) : "0";
    const yearDiff = totalValue - refData.startYearValue;
    const yearPct =
      refData.startYearValue > 0
        ? ((yearDiff / refData.startYearValue) * 100).toFixed(1)
        : "0";
    return {
      monthDiff,
      monthPct,
      yearDiff,
      yearPct,
      baselineSource: effectiveLastMonth.source,
    };
  }, [totalValue, refData.startYearValue, effectiveLastMonth]);
  const snapshotChartData = useMemo(
    () =>
      [...snapshots]
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map((i) => ({ month: i.monthKey, totalValue: i.totalValue })),
    [snapshots]
  );

  const monthlySummary = useMemo(() => {
    if (orderedSnapshots.length === 0)
      return {
        currentTotal: totalValue,
        diff: 0,
        diffPct: 0,
        biggestCategory: "-",
        biggestCategoryPercent: "-",
        deviationText: "尚無紀錄",
        deviationSub: "先建立本月快照",
      };
    const current = orderedSnapshots[0];
    const prev = orderedSnapshots[1];
    const currentTop = current.categoryBreakdown?.[0];
    const diff = prev ? current.totalValue - prev.totalValue : 0;
    const diffPct =
      prev && prev.totalValue > 0 ? (diff / prev.totalValue) * 100 : 0;
    const currentDeviation = Number(deviationScore);
    let prevDeviation = null;
    if (prev) {
      let targetMap = {};
      assets.forEach((a) => {
        const cat = a.category || "其他";
        targetMap[cat] = (targetMap[cat] || 0) + (Number(a.targetPercent) || 0);
      });
      let totalDiff = 0;
      prev.categoryBreakdown.forEach((i) => {
        totalDiff += Math.abs(i.percent - (targetMap[i.category] || 0));
      });
      Object.keys(targetMap).forEach((cat) => {
        if (!prev.categoryBreakdown.some((i) => i.category === cat))
          totalDiff += Math.abs(targetMap[cat]);
      });
      prevDeviation = Number((totalDiff / 2).toFixed(1));
    }
    return {
      currentTotal: current.totalValue,
      diff,
      diffPct,
      biggestCategory: currentTop?.category || "-",
      biggestCategoryPercent: currentTop ? `${currentTop.percent}%` : "-",
      deviationText:
        prevDeviation === null
          ? `${currentDeviation}%`
          : `${prevDeviation}% → ${currentDeviation}%`,
      deviationSub:
        prevDeviation === null
          ? "尚無上月可比較"
          : currentDeviation <= prevDeviation
          ? "偏離縮小"
          : "偏離擴大",
    };
  }, [orderedSnapshots, deviationScore, totalValue, assets]);

  const latestSnapshotDelta = useMemo(() => {
    if (orderedSnapshots.length < 2) return null;
    const diff =
      orderedSnapshots[0].totalValue - orderedSnapshots[1].totalValue;
    return {
      diff,
      pct:
        orderedSnapshots[1].totalValue > 0
          ? (diff / orderedSnapshots[1].totalValue) * 100
          : 0,
    };
  }, [orderedSnapshots]);

  const allocationStatus = useMemo(() => {
    const s = Number(deviationScore);
    if (s < 8)
      return {
        label: "穩定",
        color: "var(--c-green)",
        bg: "var(--c-green-dim)",
      };
    if (s < 15)
      return {
        label: "注意",
        color: "var(--c-yellow)",
        bg: "var(--c-yellow-dim)",
      };
    return { label: "需調整", color: "var(--c-red)", bg: "var(--c-red-dim)" };
  }, [deviationScore]);

  const monthlyStatus = useMemo(() => {
    if (performance.monthDiff > 0)
      return {
        label: "月增",
        color: "var(--c-green)",
        bg: "var(--c-green-dim)",
      };
    if (performance.monthDiff < 0)
      return { label: "月減", color: "var(--c-red)", bg: "var(--c-red-dim)" };
    return {
      label: "持平",
      color: "var(--c-text-3)",
      bg: "var(--c-surface-2)",
    };
  }, [performance.monthDiff]);

  const monthlyInsight = useMemo(() => {
    if (orderedSnapshots.length === 0)
      return "尚未建立月度快照。按「記錄本月快照」留下第一筆紀錄後，這裡會自動比較每月變化並產生判讀。";
    if (orderedSnapshots.length === 1)
      return `已建立 ${orderedSnapshots[0].monthKey} 的第一筆快照。下個月再記錄一次，這裡就會開始比較月度變化。`;
    const direction =
      monthlySummary.diff > 0
        ? "增加"
        : monthlySummary.diff < 0
        ? "減少"
        : "持平";
    const deviationHint =
      monthlySummary.deviationSub === "偏離縮小"
        ? "整體配置更接近目標"
        : monthlySummary.deviationSub === "偏離擴大"
        ? "配置偏離較上月明顯"
        : "目前尚無足夠月度資料比較";
    const topCategoryText =
      monthlySummary.biggestCategory !== "-"
        ? `目前權重最高的類別是「${monthlySummary.biggestCategory}」`
        : "目前尚無明確主導類別";
    const usdPct = Number(usdAssetRatio);
    const usdHint =
      usdPct >= 50
        ? "目前美元資產占比較高，匯率波動對總資產影響偏大。"
        : usdPct >= 30
        ? "美元資產占比中等，匯率仍是重要影響因子。"
        : "目前美元資產占比較低，匯率影響相對有限。";
    return `本月總資產較上月${direction} ${Math.abs(
      Number(monthlySummary.diffPct)
    ).toFixed(1)}%，${topCategoryText}，${deviationHint}。${usdHint}`;
  }, [monthlySummary, usdAssetRatio, orderedSnapshots]);

  /* ═══════════════════════════════════════════════════════
     ACTIONS
     ═══════════════════════════════════════════════════════ */
  const updateAsset = useCallback((id, field, value) => {
    setAssets((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        let parsed = value;
        // 市值輸入中保留原始字串（否則清空會變 0、小數點打不出來），離開欄位時再由 sanitizeAssetValue 正規化
        if (field === "targetPercent") {
          parsed = Number.isNaN(Number(value)) ? 0 : Number(value);
          parsed = Math.min(100, Math.max(0, parsed));
        }
        return { ...item, [field]: parsed };
      })
    );
  }, []);

  // 市值欄位 onBlur：非數字歸零、負數 clamp 到 0，避免負值被計入總資產
  const sanitizeAssetValue = useCallback((id) => {
    setAssets((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const n = Number(item.value);
        const clean = Number.isNaN(n) ? 0 : Math.max(0, n);
        if (clean === item.value) return item;
        return { ...item, value: clean };
      })
    );
  }, []);

  const toggleCategory = (cat) =>
    setExpandedCategories((prev) => {
      const next = { ...prev, [cat]: !prev[cat] };
      try {
        localStorage.setItem("asset_warroom_expanded", JSON.stringify(next));
      } catch {}
      return next;
    });

  // ── Undo Delete Logic ──
  const handleDeleteRequest = (id) => {
    const originalIndex = assets.findIndex((a) => a.id === id);
    const asset = assets[originalIndex];
    if (!asset) return;
    // Soft-delete: remove immediately, show undo toast
    setAssets((prev) => prev.filter((i) => i.id !== id));
    const toastId = generateId();
    const DURATION = 5000;
    setUndoToasts((prev) => [
      ...prev,
      {
        id: toastId,
        assetId: id,
        asset,
        name: asset.name,
        duration: DURATION,
        originalIndex,
      },
    ]);
    setTimeout(() => {
      setUndoToasts((prev) => prev.filter((t) => t.id !== toastId));
    }, DURATION);
  };

  const handleUndoDelete = (toastId) => {
    const toast = undoToasts.find((t) => t.id === toastId);
    if (!toast) return;
    setAssets((prev) => {
      const next = [...prev];
      const insertAt = Math.min(toast.originalIndex, next.length);
      next.splice(insertAt, 0, toast.asset);
      return next;
    });
    setUndoToasts((prev) => prev.filter((t) => t.id !== toastId));
  };

  const moveCategory = (cat, direction) => {
    setCategoryOrder((prev) => {
      const idx = prev.indexOf(cat);
      if (idx === -1) return prev;
      const t = direction === "up" ? idx - 1 : idx + 1;
      if (t < 0 || t >= prev.length) return prev;
      const c = [...prev];
      [c[idx], c[t]] = [c[t], c[idx]];
      return c;
    });
  };

  const moveAssetWithinCategory = (id, direction) => {
    if (sortMode !== "manual") return;
    setAssets((prev) => {
      const idx = prev.findIndex((i) => i.id === id);
      if (idx === -1) return prev;
      const cat = prev[idx].category;
      const c = [...prev];
      if (direction === "up") {
        for (let i = idx - 1; i >= 0; i--) {
          if (c[i].category === cat) {
            [c[i], c[idx]] = [c[idx], c[i]];
            return c;
          }
        }
      } else {
        for (let i = idx + 1; i < c.length; i++) {
          if (c[i].category === cat) {
            [c[i], c[idx]] = [c[idx], c[i]];
            return c;
          }
        }
      }
      return prev;
    });
  };

  const canMoveAssetWithinCategory = (id, direction) => {
    if (sortMode !== "manual") return false;
    const idx = assets.findIndex((i) => i.id === id);
    if (idx === -1) return false;
    const cat = assets[idx].category;
    if (direction === "up") {
      for (let i = idx - 1; i >= 0; i--) {
        if (assets[i].category === cat) return true;
      }
      return false;
    }
    for (let i = idx + 1; i < assets.length; i++) {
      if (assets[i].category === cat) return true;
    }
    return false;
  };

  // 切換幣別時一律依匯率換算金額，維持台幣等值不變（避免 65000 TWD 誤變 65000 USD）
  const changeAssetCurrency = (id, nextCurrency) => {
    setAssets((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const cur = getDisplayCurrency(item);
        if (cur === nextCurrency) return item;
        return {
          ...item,
          value: convertValueByCurrency(
            item.value,
            cur,
            nextCurrency,
            refData.usdToTwd
          ),
          currency: nextCurrency,
        };
      })
    );
  };

  const handleReset = async () => {
    openConfirm(
      "確認重置",
      "確定要重置成預設資料嗎？目前資料、排序與快照都會被清除。",
      async () => {
        const r = {
          assets: normalizeAssets(INITIAL_DATA),
          refData: INITIAL_REF_DATA,
          snapshots: [],
          categoryOrder: DEFAULT_CATEGORY_ORDER,
        };
        setAssets(r.assets);
        setRefData(r.refData);
        setSnapshots(r.snapshots);
        setCategoryOrder(r.categoryOrder);
        localStorage.removeItem(STORAGE_KEY);
        try {
          localStorage.removeItem("asset_warroom_nudge_dismissed");
        } catch {}
        setNudgeDismissed(false);
        setSaveStatus("saved");
        setSearch("");
        setActiveCategory("全部");
        setSortMode("manual");
        setNewAssetErrors({});
        try {
          await setDoc(doc(db, CLOUD_DOC_PATH.collection, CLOUD_DOC_PATH.doc), {
            ...r,
            updatedAt: new Date().toISOString(),
          });
          lastSyncedJsonRef.current = JSON.stringify(r);
        } catch {}
      }
    );
  };

  const exportCSV = () => {
    // 欄位加引號跳脫，名稱含逗號才不會讓欄位錯位
    const esc = (s) => `"${String(s).replace(/"/g, '""')}"`;
    const rows = assets.map((i) =>
      [
        esc(i.category),
        esc(i.name),
        getDisplayCurrency(i),
        Number(i.value) || 0,
        Math.round(convertAssetToTwd(i, refData.usdToTwd)),
        `${Number(i.targetPercent) || 0}%`,
      ].join(",")
    );
    const link = document.createElement("a");
    link.href =
      "data:text/csv;charset=utf-8,%EF%BB%BF" +
      encodeURIComponent(
        "類別,項目,輸入幣別,輸入市值,換算台幣,目標占比\n" + rows.join("\n")
      );
    link.download = `資產戰情室_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 2500);
  };

  // ── Validate new asset form ──
  const validateNewAsset = () => {
    const errs = {};
    if (!String(newAsset.name || "").trim()) errs.name = true;
    if (
      newAsset.value !== "" &&
      (Number.isNaN(Number(newAsset.value)) || Number(newAsset.value) < 0)
    )
      errs.value = true;
    if (
      newAsset.targetPercent !== "" &&
      (Number.isNaN(Number(newAsset.targetPercent)) ||
        Number(newAsset.targetPercent) < 0 ||
        Number(newAsset.targetPercent) > 100)
    )
      errs.targetPercent = true;
    setNewAssetErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const addQuickAsset = () => {
    if (!validateNewAsset()) return;
    const name = String(newAsset.name || "").trim();
    const item = {
      id: generateId(),
      category: newAsset.category || "其他",
      name,
      value: Number(newAsset.value) || 0,
      currency: newAsset.currency || "TWD",
      targetPercent: Math.min(
        100,
        Math.max(0, Number(newAsset.targetPercent) || 0)
      ),
    };
    setAssets((prev) => [...prev, item]);
    setExpandedCategories((prev) => ({ ...prev, [item.category]: true }));
    setNewAsset(INITIAL_NEW_ASSET);
    setNewAssetErrors({});
    setShowAddForm(false);
    setShowMobileAdd(false);
  };

  const addAssetToCategory = (cat) => {
    const item = {
      id: generateId(),
      category: cat,
      name: "新項目",
      value: 0,
      currency: inferCurrencyFromCategory(cat),
      targetPercent: 0,
    };
    setAssets((prev) => [...prev, item]);
    setExpandedCategories((prev) => ({ ...prev, [cat]: true }));
  };

  const createSnapshot = () => {
    const s = buildSnapshot({
      assets,
      usdToTwd: refData.usdToTwd,
      date: new Date(),
    });
    const existingIdx = snapshots.findIndex((x) => x.monthKey === s.monthKey);
    if (existingIdx >= 0) {
      openConfirm(
        "覆蓋快照",
        `${s.monthKey} 已有快照紀錄，確定要覆蓋嗎？`,
        () => {
          setSnapshots((prev) => {
            const idx = prev.findIndex((x) => x.monthKey === s.monthKey);
            if (idx >= 0) {
              const c = [...prev];
              c[idx] = { ...s, id: c[idx].id };
              return c.sort((a, b) => new Date(b.date) - new Date(a.date));
            }
            return [s, ...prev].sort(
              (a, b) => new Date(b.date) - new Date(a.date)
            );
          });
        }
      );
      return;
    }
    setSnapshots((prev) => {
      const idx = prev.findIndex((x) => x.monthKey === s.monthKey);
      if (idx >= 0) {
        const c = [...prev];
        c[idx] = { ...s, id: c[idx].id };
        return c.sort((a, b) => new Date(b.date) - new Date(a.date));
      }
      return [s, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date));
    });
  };

  const clearSnapshots = () =>
    openConfirm("清空紀錄", "確定要清空所有月度紀錄嗎？此動作無法復原。", () =>
      setSnapshots([])
    );

  const dismissOnboarding = useCallback(() => {
    setShowOnboarding(false);
    try {
      localStorage.setItem(ONBOARDING_KEY, "1");
    } catch {}
  }, []);

  const openConfirm = useCallback(
    (title, message, onConfirm) =>
      setConfirmDialog({ title, message, onConfirm }),
    []
  );
  const closeConfirm = useCallback(() => setConfirmDialog(null), []);

  const manualMode = sortMode === "manual";

  /* ─ Chart theme ─ */
  const chartTooltipStyle = {
    borderRadius: "6px",
    border: `1px solid ${
      isDark ? "rgba(99,130,180,0.14)" : "rgba(15,15,10,0.08)"
    }`,
    boxShadow: isDark
      ? "0 12px 32px rgba(0,0,0,0.5)"
      : "0 12px 32px rgba(15,15,10,0.10)",
    fontSize: "12px",
    fontFamily: "'IBM Plex Mono',monospace",
    background: isDark ? "rgba(14,16,23,0.96)" : "rgba(255,255,255,0.97)",
    color: isDark ? "#E2E8F0" : "#1A1A18",
    backdropFilter: "blur(12px)",
  };
  const chartGridColor = isDark
    ? "rgba(99,130,180,0.06)"
    : "rgba(15,15,10,0.06)";
  const chartCursorFill = isDark
    ? "rgba(99,130,180,0.03)"
    : "rgba(15,15,10,0.03)";
  const pieCenterColor = isDark ? "#E2E8F0" : "#1A1A18";
  const pieCenterSubColor = isDark ? "#5A6A82" : "#9C9888";
  const chartAccent1 = isDark ? "#6B8EEC" : "#1E3A5F";
  const chartAccent2 = isDark ? "#8B7CF6" : "#4A7AB5";
  const chartRed = isDark ? "#F97066" : "#B91C1C";
  const chartGreen = isDark ? "#34D399" : "#0D7C4A";

  /* ═══════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════ */
  return (
    <div className="app">
      <style>{STYLES}</style>

      {/* ── Onboarding Modal ── */}
      {showOnboarding && (
        <OnboardingModal
          onDismiss={dismissOnboarding}
          isExampleData={isExampleData}
        />
      )}

      {/* ── Undo Toast Stack ── */}
      <UndoToast
        toasts={undoToasts}
        onUndo={handleUndoDelete}
        onDismiss={(id) => setUndoToasts((p) => p.filter((t) => t.id !== id))}
      />

      {/* ── Export Success Toast ── */}
      {exportSuccess && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            bottom: 28,
            right: 28,
            zIndex: 300,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 18px",
            borderRadius: "var(--radius-lg)",
            background: "var(--c-green)",
            color: "white",
            fontWeight: 700,
            fontSize: 13,
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            animation: "slideUp 0.3s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <CheckCircle2 size={16} /> CSV 已匯出
        </div>
      )}

      {/* ── Custom Confirm Dialog ── */}
      {confirmDialog && (
        <ConfirmModal
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={() => {
            confirmDialog.onConfirm();
            closeConfirm();
          }}
          onCancel={closeConfirm}
        />
      )}

      {/* ── Delete Confirm Modal (only for non-soft-delete edge cases, kept for API compat) ── */}

      {/* ── Settings Modal ── */}
      {showSettings && (
        <SettingsModal
          refData={refData}
          setRefData={setRefData}
          onClose={closeSettings}
        />
      )}

      {/* ── Mobile Add Sheet Overlay ── */}
      <div
        className={`mobile-add-sheet-overlay ${showMobileAdd ? "open" : ""}`}
        onClick={() => setShowMobileAdd(false)}
      />
      <div className={`mobile-add-sheet ${showMobileAdd ? "open" : ""}`}>
        <div className="mobile-add-sheet-handle" />
        <div
          style={{
            fontSize: 17,
            fontWeight: 800,
            color: "var(--c-text)",
            marginBottom: 16,
          }}
        >
          新增資產
        </div>
        <div className="mobile-add-form">
          <select
            value={newAsset.category}
            onChange={(e) =>
              setNewAsset((p) => ({
                ...p,
                category: e.target.value,
                currency: inferCurrencyFromCategory(e.target.value),
              }))
            }
          >
            {categories
              .filter((c) => c !== "全部")
              .map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
          </select>
          <input
            placeholder="項目名稱，例如：SCHD"
            value={newAsset.name}
            className={newAssetErrors.name ? "invalid" : ""}
            onChange={(e) => {
              setNewAsset((p) => ({ ...p, name: e.target.value }));
              setNewAssetErrors((p) => ({ ...p, name: false }));
            }}
          />
          <div className="mobile-add-form-row">
            <select
              value={newAsset.currency}
              onChange={(e) =>
                setNewAsset((p) => ({ ...p, currency: e.target.value }))
              }
            >
              <option value="TWD">TWD 台幣</option>
              <option value="USD">USD 美元</option>
            </select>
            <input
              type="number"
              placeholder="市值"
              className={newAssetErrors.value ? "invalid" : ""}
              value={newAsset.value}
              onChange={(e) => {
                setNewAsset((p) => ({ ...p, value: e.target.value }));
                setNewAssetErrors((p) => ({ ...p, value: false }));
              }}
            />
          </div>
          <input
            type="number"
            placeholder="目標占比 % (選填)"
            min="0"
            max="100"
            className={newAssetErrors.targetPercent ? "invalid" : ""}
            value={newAsset.targetPercent}
            onChange={(e) => {
              setNewAsset((p) => ({ ...p, targetPercent: e.target.value }));
              setNewAssetErrors((p) => ({ ...p, targetPercent: false }));
            }}
          />
          <button className="mobile-add-form-cta" onClick={addQuickAsset}>
            新增資產
          </button>
          <button
            className="btn"
            style={{ width: "100%", justifyContent: "center" }}
            onClick={() => setShowMobileAdd(false)}
          >
            取消
          </button>
        </div>
      </div>

      {/* ── Topbar ── */}
      <div className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <div className="brand-badge">
              <LayoutDashboard size={22} />
            </div>
            <div>
              <h1 className="brand-title">
                資產戰情室 <span>Pro</span>
              </h1>
              <div className="brand-sub">Elite Financial Terminal</div>
            </div>
          </div>
          <div className="top-actions">
            <div
              className={`status-pill ${
                saveStatus === "saving"
                  ? "saving"
                  : saveStatus === "error"
                  ? "error"
                  : "saved"
              }`}
            >
              {saveStatus === "saving" ? (
                <>
                  <Loader2 size={12} className="spin" />
                  儲存中
                </>
              ) : saveStatus === "error" ? (
                <>
                  <AlertCircle size={12} />
                  失敗
                </>
              ) : (
                <>
                  <CheckCircle2 size={12} />
                  已保存
                </>
              )}
            </div>
            <div
              className={`status-pill ${
                cloudStatus === "connecting"
                  ? "saving"
                  : cloudStatus === "error"
                  ? "error"
                  : "saved"
              }`}
              title={cloudError || "Firebase 雲端同步"}
            >
              {cloudStatus === "connecting" ? (
                <>
                  <Loader2 size={12} className="spin" />
                  連線中
                </>
              ) : cloudStatus === "error" ? (
                <>
                  <AlertCircle size={12} />
                  雲端失敗
                </>
              ) : (
                <>
                  <Cloud size={12} />
                  同步中
                </>
              )}
            </div>
            <button
              className="btn icon"
              onClick={() => setPrivacyMode((p) => !p)}
              title={privacyMode ? "顯示金額" : "隱藏金額（隱私模式）"}
              aria-pressed={privacyMode}
            >
              {privacyMode ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            <button
              className="btn icon"
              onClick={toggleTheme}
              title={isDark ? "切換淺色模式" : "切換深色模式"}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button className="btn" onClick={() => setShowSettings(true)}>
              <Settings size={15} />
              基準設定
            </button>
            <button className="btn icon" onClick={handleReset} title="重置">
              <RotateCcw size={16} />
            </button>
            <button className="btn primary" onClick={exportCSV}>
              <Download size={15} />
              匯出 CSV
            </button>
          </div>
        </div>
      </div>

      <div className="shell">
        <section className="hero">
          {/* ── Skeleton when cloud connecting（逾時後直接顯示本地資料）── */}
          {cloudStatus === "connecting" &&
          !isCloudHydrated &&
          !hydrationTimedOut ? (
            <SkeletonDashboard />
          ) : (
            <>
              {/* ── Example Data Banner ── */}
              {isExampleData && (
                <div className="example-banner animate-in">
                  <AlertCircle size={16} color="var(--c-accent)" />
                  <div className="example-banner-text">
                    <strong>目前顯示的是範例資料</strong>
                    ——請展開各類別，修改成你的實際資產市值與目標占比。資料會自動儲存至雲端。
                  </div>
                </div>
              )}

              {/* ── Target Nudge Banner ── */}
              {allTargetsZero && !nudgeDismissed && (
                <div className="nudge-banner animate-in">
                  <div className="nudge-icon">
                    <Target size={18} />
                  </div>
                  <div className="nudge-body">
                    <div className="nudge-title">尚未設定任何目標占比</div>
                    <div className="nudge-sub">
                      在「資產明細」每筆資產的「目標
                      %」欄位設定後，再平衡建議與偏離度才會啟動。
                    </div>
                  </div>
                  <button
                    className="nudge-dismiss"
                    onClick={() => {
                      setNudgeDismissed(true);
                      try {
                        localStorage.setItem(
                          "asset_warroom_nudge_dismissed",
                          "1"
                        );
                      } catch {}
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* ── Hero Card ── */}
              <div className="hero-card animate-in" style={{ marginTop: 16 }}>
                <div className="hero-grid">
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <h2 className="hero-title">資產戰情室</h2>
                      <p className="hero-desc">
                        即時掌握總資產、配置偏離與月度變化，讓每一筆投資決策都有數據支撐。
                      </p>
                    </div>
                    <div className="hero-tags">
                      {[
                        {
                          icon: <Wallet size={13} />,
                          text: `${assets.length} 項資產`,
                        },
                        {
                          icon: <DollarSign size={13} />,
                          text: `匯率 ${refData.usdToTwd}`,
                        },
                        {
                          icon: <Target size={13} />,
                          text: `目標總占比 ${totalTargetPercent.toFixed(1)}%`,
                          warn: totalTargetPercent > 100,
                          soft:
                            totalTargetPercent > 0 && totalTargetPercent < 100,
                        },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="hero-tag"
                          style={
                            item.warn
                              ? {
                                  color: "var(--c-red)",
                                  borderColor: "rgba(185,28,28,0.2)",
                                  background: "var(--c-red-dim)",
                                }
                              : item.soft
                              ? {
                                  color: "var(--c-yellow)",
                                  borderColor: "rgba(146,97,14,0.2)",
                                  background: "var(--c-yellow-dim)",
                                }
                              : {}
                          }
                        >
                          {item.icon}
                          {item.text}
                          {item.warn && (
                            <span style={{ fontSize: 10, marginLeft: 4 }}>
                              ⚠ 超過100%
                            </span>
                          )}
                          {item.soft && (
                            <span style={{ fontSize: 10, marginLeft: 4 }}>
                              未配置 {(100 - totalTargetPercent).toFixed(1)}%
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="hero-right">
                    <div className="hero-total-box">
                      <div className="hero-total-label">
                        Total Portfolio Value (TWD)
                      </div>
                      <div className="hero-total-value">
                        {maskMoney(formatCompact(totalValue))}
                      </div>
                      <div className="hero-total-sub">
                        共 {assets.length} 項資產｜美元匯率 {refData.usdToTwd}
                        ｜目標總占比 {totalTargetPercent.toFixed(1)}%
                      </div>
                      <div className="hero-total-mini-grid">
                        {[
                          { label: "美元資產占比", value: `${usdAssetRatio}%` },
                          { label: "現金占比", value: `${cashAssetRatio}%` },
                        ].map((box, i) => (
                          <div key={i} className="hero-total-mini">
                            <div className="hero-total-mini-label">
                              {box.label}
                            </div>
                            <div className="hero-total-mini-value">
                              {box.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="quick-insight">
                      {[
                        {
                          label: "最大持倉",
                          value: largestAsset ? largestAsset.name : "-",
                        },
                        {
                          label: "偏離最大",
                          value: highestTargetGap ? highestTargetGap.name : "-",
                        },
                        {
                          label: "本月變化",
                          value: latestSnapshotDelta
                            ? `${
                                latestSnapshotDelta.diff >= 0 ? "+" : ""
                              }${latestSnapshotDelta.pct.toFixed(1)}%`
                            : "-",
                          cls: latestSnapshotDelta
                            ? latestSnapshotDelta.diff >= 0
                              ? "positive"
                              : "negative"
                            : "",
                        },
                      ].map((item, i) => (
                        <div key={i} className="quick-card">
                          <div className="quick-label">{item.label}</div>
                          <div className={`quick-value ${item.cls || ""}`}>
                            {item.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Filters ── */}
              <div className="filters animate-in delay-1">
                <div className="filters-row">
                  <div className="filter-card">
                    <div className="filter-row">
                      <div className="search-box">
                        <Search size={15} />
                        <input
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="搜尋資產名稱或類別…"
                          aria-label="搜尋資產名稱或類別"
                        />
                      </div>
                      <div className="select-box">
                        <select
                          value={sortMode}
                          onChange={(e) => setSortMode(e.target.value)}
                        >
                          <option value="manual">手動排序</option>
                          <option value="value-desc">市值：高→低</option>
                          <option value="value-asc">市值：低→高</option>
                          <option value="name-asc">名稱：A→Z</option>
                          <option value="target-desc">目標占比：高→低</option>
                        </select>
                      </div>
                      {(search || activeCategory !== "全部") && (
                        <button
                          className="btn"
                          onClick={() => {
                            setSearch("");
                            setActiveCategory("全部");
                          }}
                        >
                          <X size={13} />
                          清除篩選
                        </button>
                      )}
                      {(search || activeCategory !== "全部") && (
                        <span className="filter-count">
                          找到 {filteredAssets.length} 項
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="filter-card">
                    <div
                      className="filter-row"
                      style={{
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 10,
                      }}
                    >
                      <div className="fx-label">
                        <DollarSign size={15} />
                        美元匯率
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <div className="fx-box">
                          <input
                            type="number"
                            step="0.01"
                            value={refData.usdToTwd}
                            aria-label="美元匯率 USD/TWD"
                            onChange={(e) =>
                              setRefData((p) => ({
                                ...p,
                                usdToTwd: Number(e.target.value) || 0,
                              }))
                            }
                          />
                        </div>
                        <button
                          className="btn"
                          onClick={() => fetchExchangeRate(true)}
                          disabled={fxLoading}
                          style={{ padding: "7px 12px", fontSize: 12 }}
                        >
                          {fxLoading ? (
                            <Loader2 size={13} className="spin" />
                          ) : (
                            <RefreshCw size={13} />
                          )}
                          {fxLoading ? "更新中" : "即時匯率"}
                        </button>
                        {fxStatus === "success" && (
                          <span className="fx-status success">
                            <CheckCircle2 size={11} />
                            {fxUpdatedAt} 更新
                          </span>
                        )}
                        {fxStatus === "error" && (
                          <span className="fx-status error">
                            <AlertCircle size={11} />
                            抓取失敗
                          </span>
                        )}
                        {fxLoading && (
                          <span className="fx-status loading">
                            <Loader2 size={11} className="spin" />
                            連線中
                          </span>
                        )}
                        {fxSuggestion !== null &&
                          Math.abs(fxSuggestion - refData.usdToTwd) >= 0.01 && (
                            <span className="fx-status loading">
                              最新匯率 {fxSuggestion}
                              <button
                                onClick={() => {
                                  setRefData((p) => ({
                                    ...p,
                                    usdToTwd: fxSuggestion,
                                  }));
                                  setFxSuggestion(null);
                                }}
                                style={{
                                  border: "none",
                                  background: "var(--c-accent)",
                                  color: "white",
                                  borderRadius: 6,
                                  padding: "3px 8px",
                                  fontSize: 10,
                                  fontWeight: 800,
                                  cursor: "pointer",
                                }}
                              >
                                套用
                              </button>
                              <button
                                onClick={() => setFxSuggestion(null)}
                                title="忽略建議"
                                style={{
                                  border: "none",
                                  background: "transparent",
                                  color: "var(--c-text-3)",
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  padding: 0,
                                }}
                              >
                                <X size={11} />
                              </button>
                            </span>
                          )}
                      </div>
                    </div>
                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 10,
                        color: "var(--c-text-3)",
                        fontWeight: 600,
                      }}
                    >
                      資料來源：open.er-api.com ·
                      載入時僅提示建議、不自動覆蓋你存的匯率 · 可手動調整
                    </div>
                  </div>
                </div>
                <div className="filter-card" style={{ padding: "14px 20px" }}>
                  <div className="category-chips">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        className={`category-chip ${
                          activeCategory === cat ? "active" : ""
                        }`}
                        onClick={() => setActiveCategory(cat)}
                      >
                        {cat !== "全部" && (
                          <span
                            className="category-dot"
                            style={{ background: getCategoryColor(cat, isDark) }}
                          />
                        )}
                        {cat}
                        {cat !== "全部" && globalCategoryStats[cat] && (
                          <span
                            style={{
                              fontSize: 10,
                              opacity: 0.6,
                              fontWeight: 600,
                            }}
                          >
                            {globalCategoryStats[cat].items.length}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── KPI Grid ── */}
              <div className="kpi-grid">
                <div className="card kpi-card featured animate-in delay-2">
                  <KPIValue
                    label="現金水位"
                    value={`${cashAssetRatio}%`}
                    subValue={`${maskMoney(
                      formatCompact(cashAssetValue)
                    )} 可動用現金`}
                    badge={cashStatus}
                    tooltip="現金類資產占總資產的比例。太低缺乏緩衝與加碼空間，太高則拖累長期報酬。"
                  />
                </div>
                {[
                  {
                    el: (
                      <KPIValue
                        label="本月變動"
                        value={`${
                          performance.monthDiff >= 0 ? "+" : "-"
                        }${Math.abs(Number(performance.monthPct))}%`}
                        subValue={`${
                          performance.monthDiff >= 0 ? "+" : ""
                        }${maskMoney(
                          formatCompactFixed(performance.monthDiff)
                        )}｜基準：${performance.baselineSource}`}
                        isPositive={performance.monthDiff >= 0}
                        badge={monthlyStatus}
                      />
                    ),
                    d: "delay-3",
                  },
                  {
                    el: (
                      <KPIValue
                        label="今年以來（YTD）"
                        value={`${
                          performance.yearDiff >= 0 ? "+" : "-"
                        }${Math.abs(Number(performance.yearPct))}%`}
                        subValue={`${
                          performance.yearDiff >= 0 ? "+" : ""
                        }${maskMoney(formatCompactFixed(performance.yearDiff))}`}
                        isPositive={performance.yearDiff >= 0}
                      />
                    ),
                    d: "delay-4",
                  },
                  {
                    el: (
                      <KPIValue
                        label="配置偏離度"
                        value={`${deviationScore}%`}
                        subValue="距離目標配置的整體差距"
                        isPositive={Number(deviationScore) < 10}
                        badge={allocationStatus}
                        tooltip="計算方式：所有類別與目標占比的差距總和，再除以 2。數值越低越接近你的目標配置。"
                      />
                    ),
                    d: "delay-5",
                  },
                ].map((item, i) => (
                  <div key={i} className={`card kpi-card animate-in ${item.d}`}>
                    {item.el}
                  </div>
                ))}
              </div>

              {/* ── Collapsible Analytics ── */}
              <div
                className="section-toggle-bar animate-in delay-4"
                role="button"
                tabIndex={0}
                aria-expanded={showAnalytics}
                onClick={() => setShowAnalytics((p) => !p)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setShowAnalytics((p) => !p);
                  }
                }}
              >
                <div className="section-toggle-line" />
                <div
                  className="section-toggle-label"
                  style={{ whiteSpace: "nowrap", padding: "0 12px" }}
                >
                  <ChevronDown
                    size={14}
                    style={{
                      display: "inline",
                      marginRight: 6,
                      transition: "transform 0.25s ease",
                      transform: showAnalytics
                        ? "rotate(0deg)"
                        : "rotate(-90deg)",
                    }}
                  />
                  進階分析
                </div>
                <div className="section-toggle-line" />
              </div>

              {showAnalytics && (
                <>
                  {/* ── Analytics Grid ── */}
                  <div className="analytics-grid">
                    {/* Pie Chart */}
                    <div className="card chart-card animate-in delay-4">
                      <div className="card-title">
                        <PieChartIcon size={17} />
                        資產分佈
                      </div>
                      <div className="card-desc">
                        所有資產先換算成台幣後，檢視目前整體配置結構（不受搜尋篩選影響）。
                      </div>
                      <div className="chart-wrap">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              innerRadius="62%"
                              outerRadius="85%"
                              paddingAngle={3}
                              dataKey="value"
                              cornerRadius={8}
                            >
                              {pieData.map((entry, index) => (
                                <Cell
                                  key={index}
                                  fill={entry.color}
                                  stroke="none"
                                />
                              ))}
                              <Label
                                content={({ viewBox }) => {
                                  if (!viewBox || !("cx" in viewBox))
                                    return null;
                                  const { cx, cy } = viewBox;
                                  return (
                                    <text
                                      x={cx}
                                      y={cy}
                                      textAnchor="middle"
                                      dominantBaseline="middle"
                                    >
                                      <tspan
                                        x={cx}
                                        y={cy - 12}
                                        fontSize="11"
                                        fill={pieCenterSubColor}
                                        fontWeight="700"
                                      >
                                        {assets.length} 項
                                      </tspan>
                                      <tspan
                                        x={cx}
                                        y={cy + 14}
                                        fontSize="22"
                                        fill={pieCenterColor}
                                        fontWeight="700"
                                        fontFamily="IBM Plex Mono,monospace"
                                      >
                                        {maskMoney(formatCompact(totalValue))}
                                      </tspan>
                                    </text>
                                  );
                                }}
                              />
                            </Pie>
                            <RechartsTooltip
                              formatter={(val) => maskMoney(formatCurrency(val))}
                              contentStyle={chartTooltipStyle}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="legend-row">
                        {pieData.map((item) => (
                          <div key={item.name} className="legend-item">
                            <span
                              className="legend-dot"
                              style={{ background: item.color }}
                            />
                            {item.name}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Rebalance Hints */}
                    <div className="card chart-card animate-in delay-5">
                      <div className="card-title">
                        <Zap size={17} />
                        再平衡建議
                      </div>
                      <div className="card-desc">
                        優先列出影響最大的偏離部位，幫你更快判斷下一步。
                      </div>
                      <div className="hint-list">
                        {rebalanceHints.length > 0 ? (
                          rebalanceHints.map((hint) => (
                            <div
                              key={hint.id}
                              className={`hint ${hint.actionType}`}
                            >
                              <div className="hint-side">
                                <div className="hint-side-inner">
                                  <Triangle
                                    size={16}
                                    className={
                                      hint.actionType === "sell"
                                        ? "t-down"
                                        : "t-up"
                                    }
                                    fill="currentColor"
                                  />
                                  <span>
                                    {hint.actionType === "sell" ? "減" : "補"}
                                  </span>
                                </div>
                              </div>
                              <div className="hint-body">
                                <div className="hint-top">
                                  <div>
                                    <div className="hint-name">{hint.name}</div>
                                    <div className="hint-meta">
                                      目標 {hint.targetPct}% ／ 當前{" "}
                                      {hint.currentPct}%
                                    </div>
                                  </div>
                                  <div className="hint-badge">
                                    {hint.actionType === "sell"
                                      ? "偏高"
                                      : "偏低"}{" "}
                                    {hint.diffPct}%
                                  </div>
                                </div>
                                <div className="hint-action">
                                  建議
                                  {hint.actionType === "sell" ? "賣出" : "買入"}
                                  約{" "}
                                  <strong>
                                    {maskMoney(formatCompactFixed(hint.diffVal))}
                                  </strong>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="empty">
                            <div>
                              <div className="empty-icon">
                                <Shield size={24} color="var(--c-green)" />
                              </div>
                              <div>
                                {allTargetsZero
                                  ? "先在資產明細設定「目標 %」，再平衡建議就會出現在這裡。"
                                  : "目前配置很接近目標，暫無需要調整的項目。"}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bar Chart */}
                    <div className="card chart-card animate-in delay-6">
                      <div className="card-title">
                        <BarChart3 size={17} />
                        類別達標狀況
                      </div>
                      <div className="card-desc">
                        比較各類別目前占比與目標占比的距離。
                      </div>
                      <div className="chart-wrap" style={{ height: 320 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={barData}
                            layout="vertical"
                            margin={{ top: 0, right: 95, left: 10, bottom: 0 }}
                            barGap={2}
                            barCategoryGap={18}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              horizontal={false}
                              stroke={chartGridColor}
                            />
                            <XAxis
                              type="number"
                              hide
                              domain={[0, "dataMax + 10"]}
                            />
                            <YAxis
                              dataKey="name"
                              type="category"
                              width={86}
                              tick={({ x, y, payload }) => (
                                <g transform={`translate(${x},${y})`}>
                                  <text
                                    x={0}
                                    y={0}
                                    dy={4}
                                    textAnchor="end"
                                    fill={pieCenterSubColor}
                                    fontSize={11}
                                    fontWeight={700}
                                  >
                                    {payload.value}
                                  </text>
                                </g>
                              )}
                              axisLine={false}
                              tickLine={false}
                            />
                            <RechartsTooltip
                              cursor={{ fill: chartCursorFill }}
                              contentStyle={chartTooltipStyle}
                              formatter={(val) => [`${val}%`, "占比"]}
                            />
                            <Bar
                              dataKey="目前占比"
                              fill={chartAccent1}
                              radius={[0, 6, 6, 0]}
                              barSize={10}
                              fillOpacity={0.6}
                            />
                            <Bar
                              dataKey="目標占比"
                              fill={chartAccent2}
                              radius={[0, 6, 6, 0]}
                              barSize={10}
                              fillOpacity={0.4}
                            >
                              <LabelList
                                dataKey="gapPct"
                                position="right"
                                content={(props) => {
                                  const { x, y, height, value } = props;
                                  if (x == null || y == null) return null;
                                  const val = Number(value);
                                  const isOver = val > 0;
                                  return (
                                    <text
                                      x={x + 6}
                                      y={y + height / 2 + 4}
                                      fill={isOver ? chartRed : chartGreen}
                                      fontSize={10}
                                      fontWeight="800"
                                    >
                                      {val > 0 ? "+" : ""}
                                      {val}% {isOver ? "超標" : "未達"}
                                    </text>
                                  );
                                }}
                              />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="legend-row">
                        <div className="legend-item">
                          <span
                            className="legend-dot"
                            style={{ background: chartAccent1, opacity: 0.6 }}
                          />
                          當前佔比
                        </div>
                        <div className="legend-item">
                          <span
                            className="legend-dot"
                            style={{ background: chartAccent2, opacity: 0.4 }}
                          />
                          目標佔比
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Monthly Grid ── */}
                  <div className="monthly-grid">
                    <div className="card monthly-card animate-in delay-5">
                      <div className="card-title">
                        <History size={17} />
                        月度資產變化
                      </div>
                      <div className="card-desc">
                        追蹤每月總資產與配置變化。
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          marginBottom: 16,
                          flexWrap: "wrap",
                        }}
                      >
                        <button className="btn" onClick={createSnapshot}>
                          <Camera size={14} />
                          記錄本月快照
                        </button>
                        {snapshots.length > 0 && (
                          <button className="btn" onClick={clearSnapshots}>
                            <Trash2 size={14} />
                            清空紀錄
                          </button>
                        )}
                      </div>
                      <div className="chart-wrap" style={{ height: 320 }}>
                        {snapshotChartData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={snapshotChartData}
                              margin={{
                                top: 10,
                                right: 10,
                                left: 10,
                                bottom: 0,
                              }}
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke={chartGridColor}
                              />
                              <XAxis
                                dataKey="month"
                                tick={{ fontSize: 11, fill: pieCenterSubColor }}
                              />
                              <YAxis
                                tick={{ fontSize: 11, fill: pieCenterSubColor }}
                                tickFormatter={(v) =>
                                  privacyMode ? "•" : formatCompact(v)
                                }
                              />
                              <RechartsTooltip
                                formatter={(val) =>
                                  maskMoney(formatCurrency(val))
                                }
                                contentStyle={chartTooltipStyle}
                              />
                              <Line
                                type="monotone"
                                dataKey="totalValue"
                                stroke={chartAccent1}
                                strokeWidth={2.5}
                                dot={{
                                  r: 4,
                                  fill: chartAccent1,
                                  stroke: "var(--c-surface)",
                                  strokeWidth: 2,
                                }}
                                activeDot={{ r: 6 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="empty">
                            <div>
                              <div className="empty-icon">
                                <Camera size={22} color="var(--c-text-3)" />
                              </div>
                              <div>
                                目前還沒有月度紀錄
                                <br />
                                按「記錄本月快照」開始追蹤
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="card monthly-card animate-in delay-6">
                      <div className="card-title">
                        <Sparkles size={17} />
                        本月變化摘要
                      </div>
                      <div className="card-desc">
                        快速知道這個月發生了什麼。
                      </div>
                      <div className="monthly-summary-grid">
                        {[
                          {
                            label: "本月總資產",
                            value: maskMoney(
                              formatCompact(monthlySummary.currentTotal)
                            ),
                            sub: "依目前匯率換算",
                            cls: "",
                          },
                          {
                            label: "較上月變化",
                            value: `${
                              monthlySummary.diff >= 0 ? "+" : ""
                            }${monthlySummary.diffPct.toFixed(1)}%`,
                            sub: `${
                              monthlySummary.diff >= 0 ? "+" : ""
                            }${maskMoney(
                              formatCompactFixed(monthlySummary.diff)
                            )}`,
                            cls:
                              monthlySummary.diff >= 0
                                ? "positive"
                                : "negative",
                          },
                          {
                            label: "占比最大類別",
                            value: monthlySummary.biggestCategory,
                            sub: `目前佔比 ${monthlySummary.biggestCategoryPercent}`,
                            cls: "",
                          },
                          {
                            label: "偏離度變化",
                            value: monthlySummary.deviationText,
                            sub: monthlySummary.deviationSub,
                            cls: "",
                          },
                        ].map((item, i) => (
                          <div key={i} className="summary-mini">
                            <div className="summary-mini-label">
                              {item.label}
                            </div>
                            <div className={`summary-mini-value ${item.cls}`}>
                              {item.value}
                            </div>
                            <div className="summary-mini-sub">{item.sub}</div>
                          </div>
                        ))}
                      </div>
                      <div className="insight-box">
                        <div className="insight-label">本月判讀</div>
                        <div className="insight-text">{monthlyInsight}</div>
                      </div>
                      <div className="snap-list">
                        {orderedSnapshots.length > 0 ? (
                          orderedSnapshots.slice(0, 4).map((snap) => (
                            <div className="snap-item" key={snap.id}>
                              <div className="snap-item-head">
                                <div className="snap-date">{snap.monthKey}</div>
                                <div className="snap-total">
                                  {maskMoney(formatCompact(snap.totalValue))}
                                </div>
                              </div>
                              <div className="snap-meta">
                                匯率 {snap.usdToTwd}｜
                                {new Date(snap.date).toLocaleDateString(
                                  "zh-TW"
                                )}
                                ｜{snap.assetCount} 項
                              </div>
                              <div className="snap-breakdown">
                                {snap.categoryBreakdown
                                  .slice(0, 4)
                                  .map((item) => (
                                    <div
                                      className="snap-chip"
                                      key={item.category}
                                    >
                                      <span
                                        className="category-dot"
                                        style={{
                                          background: getCategoryColor(
                                            item.category,
                                            isDark
                                          ),
                                        }}
                                      />
                                      {item.category} {item.percent}%
                                    </div>
                                  ))}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="empty" style={{ minHeight: 140 }}>
                            <div>
                              <div className="empty-icon">
                                <Camera
                                  size={20}
                                  color="var(--c-accent)"
                                  style={{ opacity: 0.5 }}
                                />
                              </div>
                              <div
                                style={{
                                  fontWeight: 700,
                                  color: "var(--c-text-2)",
                                  marginBottom: 4,
                                }}
                              >
                                尚無月度紀錄
                              </div>
                              <div
                                style={{
                                  fontSize: 11,
                                  color: "var(--c-text-3)",
                                }}
                              >
                                按「記錄本月快照」開始追蹤
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ── Asset Detail Table ── */}
              <div className="card table-card animate-in delay-7">
                <div className="table-head">
                  <div className="table-head-left">
                    <div className="table-title">
                      <LayoutDashboard size={17} />
                      資產明細
                    </div>
                    <div className="table-sub">
                      {manualMode
                        ? "手動排序模式，可自由調整分類與項目順序。"
                        : "自動排序檢視模式；切回「手動排序」可調整順序。"}
                    </div>
                  </div>
                  <div className="table-head-actions">
                    {/* Desktop add form toggle */}
                    <button
                      className={`add-form-toggle ${showAddForm ? "open" : ""}`}
                      onClick={() => setShowAddForm((p) => !p)}
                    >
                      {showAddForm ? (
                        <ChevronDown size={14} />
                      ) : (
                        <Plus size={14} />
                      )}
                      {showAddForm ? "收合新增表單" : "快速新增資產"}
                    </button>
                    {/* Mobile add trigger */}
                    <button
                      className="btn"
                      id="mobile-add-trigger"
                      onClick={() => setShowMobileAdd(true)}
                    >
                      <Plus size={14} />
                      新增資產
                    </button>
                    <div
                      className={`add-form-content ${
                        showAddForm ? "open" : ""
                      }`}
                    >
                      <div className="add-inline-form">
                        <select
                          value={newAsset.category}
                          onChange={(e) =>
                            setNewAsset((p) => ({
                              ...p,
                              category: e.target.value,
                              currency: inferCurrencyFromCategory(
                                e.target.value
                              ),
                            }))
                          }
                        >
                          {categories
                            .filter((c) => c !== "全部")
                            .map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                        </select>
                        <input
                          placeholder="項目名稱，例如：SCHD / 美金活存"
                          className={newAssetErrors.name ? "invalid" : ""}
                          value={newAsset.name}
                          onChange={(e) => {
                            setNewAsset((p) => ({
                              ...p,
                              name: e.target.value,
                            }));
                            setNewAssetErrors((p) => ({ ...p, name: false }));
                          }}
                        />
                        <select
                          value={newAsset.currency}
                          onChange={(e) =>
                            setNewAsset((p) => ({
                              ...p,
                              currency: e.target.value,
                            }))
                          }
                        >
                          <option value="TWD">TWD</option>
                          <option value="USD">USD</option>
                        </select>
                        <input
                          type="number"
                          placeholder={
                            newAsset.currency === "USD"
                              ? "美元市值"
                              : "台幣市值"
                          }
                          className={newAssetErrors.value ? "invalid" : ""}
                          value={newAsset.value}
                          onChange={(e) => {
                            setNewAsset((p) => ({
                              ...p,
                              value: e.target.value,
                            }));
                            setNewAssetErrors((p) => ({ ...p, value: false }));
                          }}
                        />
                        <input
                          type="number"
                          placeholder="目標占比 %"
                          min="0"
                          max="100"
                          className={
                            newAssetErrors.targetPercent ? "invalid" : ""
                          }
                          value={newAsset.targetPercent}
                          onChange={(e) => {
                            setNewAsset((p) => ({
                              ...p,
                              targetPercent: e.target.value,
                            }));
                            setNewAssetErrors((p) => ({
                              ...p,
                              targetPercent: false,
                            }));
                          }}
                        />
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            className="mini-btn add"
                            onClick={addQuickAsset}
                          >
                            新增
                          </button>
                          <button
                            className="mini-btn clear"
                            onClick={() => {
                              setNewAsset(INITIAL_NEW_ASSET);
                              setNewAssetErrors({});
                            }}
                          >
                            清空
                          </button>
                        </div>
                      </div>
                      {(newAssetErrors.name ||
                        newAssetErrors.value ||
                        newAssetErrors.targetPercent) && (
                        <div
                          style={{
                            marginTop: 8,
                            fontSize: 12,
                            color: "var(--c-red)",
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <AlertCircle size={13} />
                          {newAssetErrors.name ? "請填寫項目名稱。 " : ""}
                          {newAssetErrors.value
                            ? "市值必須是有效的正數。 "
                            : ""}
                          {newAssetErrors.targetPercent
                            ? "目標占比需介於 0–100%。"
                            : ""}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {orderedCategories
                  .filter((cat) => categoryStats[cat])
                  .map((cat) => {
                    const stat = categoryStats[cat];
                    // header 的市值／占比一律用全域數字，搜尋篩選只影響下方明細列
                    const gstat = globalCategoryStats[cat] || stat;
                    const isExpanded = expandedCategories[cat];
                    const catColor = getCategoryColor(cat, isDark);
                    const catCurrentPct =
                      totalValue > 0
                        ? ((gstat.currentVal / totalValue) * 100).toFixed(1)
                        : "0.0";
                    const catGap = (
                      Number(catCurrentPct) - gstat.targetPct
                    ).toFixed(1);
                    const isOver = Number(catGap) > 0;
                    const catIndex = orderedCategories.indexOf(cat);

                    return (
                      <div key={cat} className="category-block">
                        <div
                          className="category-header"
                          role="button"
                          tabIndex={0}
                          aria-expanded={!!isExpanded}
                          onClick={() => toggleCategory(cat)}
                          onKeyDown={(e) => {
                            if (
                              e.target === e.currentTarget &&
                              (e.key === "Enter" || e.key === " ")
                            ) {
                              e.preventDefault();
                              toggleCategory(cat);
                            }
                          }}
                        >
                          <div className="category-left">
                            {isExpanded ? (
                              <ChevronDown size={15} color="var(--c-text-3)" />
                            ) : (
                              <ChevronRight size={15} color="var(--c-text-3)" />
                            )}
                            <div
                              className="category-color"
                              style={{ background: catColor }}
                            />
                            <div className="category-name-wrap">
                              <div className="category-name">
                                <CategoryIcon category={cat} />
                                {cat}
                              </div>
                              <div className="category-count">
                                {stat.items.length === gstat.items.length
                                  ? `${stat.items.length} 項目`
                                  : `顯示 ${stat.items.length} / 共 ${gstat.items.length} 項`}
                              </div>
                            </div>
                          </div>
                          <div className="category-right">
                            <div className="cat-box">
                              <div className="cat-label">總市值</div>
                              <div
                                className="cat-value"
                                title={
                                  privacyMode
                                    ? undefined
                                    : formatFullNumber(gstat.currentVal)
                                }
                              >
                                {maskMoney(
                                  formatCompactFixed(gstat.currentVal)
                                )}
                              </div>
                            </div>
                            <div className="cat-box">
                              <div className="cat-label">目前 / 目標</div>
                              <div className="cat-value">
                                <strong>{catCurrentPct}%</strong> /{" "}
                                {gstat.targetPct}%
                              </div>
                            </div>
                            <div className="cat-box">
                              <div className="cat-label">差距</div>
                              <div
                                className={`gap-badge ${
                                  isOver ? "over" : "under"
                                }`}
                              >
                                <Triangle
                                  size={9}
                                  className={isOver ? "t-down" : "t-up"}
                                  fill="currentColor"
                                />
                                {isOver ? "+" : ""}
                                {catGap}%
                              </div>
                            </div>
                            {manualMode && (
                              <div
                                className="sort-actions"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  className="sort-btn"
                                  onClick={() => moveCategory(cat, "up")}
                                  disabled={catIndex <= 0}
                                >
                                  <ArrowUp size={13} />
                                </button>
                                <button
                                  className="sort-btn"
                                  onClick={() => moveCategory(cat, "down")}
                                  disabled={
                                    catIndex >= orderedCategories.length - 1
                                  }
                                >
                                  <ArrowDown size={13} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="category-detail">
                            <div className="detail-table-wrap">
                              <table className="detail-table">
                                <thead>
                                  <tr>
                                    <th style={{ width: "24%" }}>項目名稱</th>
                                    <th
                                      style={{
                                        width: "10%",
                                        textAlign: "right",
                                      }}
                                    >
                                      幣別
                                    </th>
                                    <th
                                      style={{
                                        width: "15%",
                                        textAlign: "right",
                                      }}
                                    >
                                      輸入市值
                                    </th>
                                    <th
                                      style={{
                                        width: "15%",
                                        textAlign: "right",
                                      }}
                                    >
                                      換算台幣
                                    </th>
                                    <th
                                      style={{
                                        width: "15%",
                                        textAlign: "right",
                                      }}
                                    >
                                      目標 / 目前
                                    </th>
                                    <th
                                      style={{
                                        width: "10%",
                                        textAlign: "right",
                                      }}
                                    >
                                      差距
                                    </th>
                                    {manualMode && (
                                      <th
                                        style={{
                                          width: "6%",
                                          textAlign: "right",
                                        }}
                                      >
                                        排序
                                      </th>
                                    )}
                                    <th
                                      style={{
                                        width: "5%",
                                        textAlign: "right",
                                      }}
                                    >
                                      操作
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {stat.items.map((item) => {
                                    const twdValue = convertAssetToTwd(
                                      item,
                                      refData.usdToTwd
                                    );
                                    const currentPct =
                                      totalValue > 0
                                        ? (
                                            (twdValue / totalValue) *
                                            100
                                          ).toFixed(1)
                                        : "0.0";
                                    const diff =
                                      twdValue -
                                      totalValue * (item.targetPercent / 100);
                                    const isActionOver = diff > 0;
                                    const inputCurrency =
                                      getDisplayCurrency(item);
                                    const isValueInvalid =
                                      String(item.value).trim() !== "" &&
                                      (Number.isNaN(Number(item.value)) ||
                                        Number(item.value) < 0);

                                    return (
                                      <tr key={item.id}>
                                        <td>
                                          <div className="item-cell">
                                            <CategoryIcon category={cat} />
                                            <input
                                              className={`item-input ${
                                                !String(item.name).trim()
                                                  ? "invalid"
                                                  : ""
                                              }`}
                                              value={item.name}
                                              aria-label="項目名稱"
                                              onChange={(e) =>
                                                updateAsset(
                                                  item.id,
                                                  "name",
                                                  e.target.value
                                                )
                                              }
                                              placeholder="請輸入名稱"
                                            />
                                            <span className="tag">
                                              {cat === "美股ETF"
                                                ? "ETF"
                                                : cat === "美股"
                                                ? "STOCK"
                                                : cat.includes("基金")
                                                ? "FUND"
                                                : cat.includes("虛擬")
                                                ? "CRYPTO"
                                                : cat.includes("現金")
                                                ? "CASH"
                                                : "ASSET"}
                                            </span>
                                          </div>
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                          <select
                                            value={getDisplayCurrency(item)}
                                            aria-label={`${item.name} 幣別（切換時自動換算金額）`}
                                            title={`切換幣別會依匯率 ${refData.usdToTwd} 自動換算金額`}
                                            onChange={(e) =>
                                              changeAssetCurrency(
                                                item.id,
                                                e.target.value
                                              )
                                            }
                                            style={{
                                              height: 34,
                                              minWidth: 72,
                                              borderRadius: 8,
                                              border:
                                                "1px solid var(--c-border-2)",
                                              background: "var(--c-surface-3)",
                                              padding: "0 8px",
                                              fontWeight: 500,
                                              color: "var(--c-text-2)",
                                              fontSize: 12,
                                              fontFamily: "var(--mono)",
                                            }}
                                          >
                                            <option value="TWD">TWD</option>
                                            <option value="USD">USD</option>
                                          </select>
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                          {privacyMode ? (
                                            <div
                                              style={{
                                                fontFamily: "var(--mono)",
                                                fontSize: 13,
                                                color: "var(--c-text)",
                                              }}
                                            >
                                              ＊＊＊＊＊
                                            </div>
                                          ) : (
                                            <>
                                              <input
                                                className={`value-input ${
                                                  isValueInvalid
                                                    ? "invalid"
                                                    : ""
                                                }`}
                                                type="number"
                                                value={item.value}
                                                aria-label={`${item.name} 市值（${inputCurrency}）`}
                                                title={
                                                  inputCurrency === "USD"
                                                    ? formatUsd(item.value)
                                                    : formatCurrency(
                                                        item.value
                                                      )
                                                }
                                                onChange={(e) =>
                                                  updateAsset(
                                                    item.id,
                                                    "value",
                                                    e.target.value
                                                  )
                                                }
                                                onBlur={() =>
                                                  sanitizeAssetValue(item.id)
                                                }
                                              />
                                              <div
                                                className={
                                                  isValueInvalid
                                                    ? "fx-hint invalid-hint"
                                                    : "fx-hint"
                                                }
                                                style={
                                                  isValueInvalid
                                                    ? {
                                                        color: "var(--c-red)",
                                                        fontWeight: 700,
                                                      }
                                                    : {}
                                                }
                                              >
                                                {isValueInvalid
                                                  ? "數值不可為負數"
                                                  : inputCurrency === "USD"
                                                  ? formatUsd(item.value)
                                                  : formatCurrency(
                                                      item.value
                                                    )}
                                              </div>
                                            </>
                                          )}
                                        </td>
                                        <td
                                          style={{
                                            textAlign: "right",
                                            fontWeight: 800,
                                            color: "var(--c-text)",
                                            fontFamily: "var(--mono)",
                                            fontSize: 13,
                                          }}
                                        >
                                          {maskMoney(formatCurrency(twdValue))}
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                          <div className="percent-inline">
                                            <div className="percent-box">
                                              <input
                                                className="percent-input"
                                                type="number"
                                                min="0"
                                                max="100"
                                                aria-label={`${item.name} 目標占比`}
                                                value={item.targetPercent}
                                                onChange={(e) =>
                                                  updateAsset(
                                                    item.id,
                                                    "targetPercent",
                                                    e.target.value
                                                  )
                                                }
                                              />
                                              <span
                                                style={{
                                                  color: "var(--c-text-3)",
                                                  fontWeight: 700,
                                                  fontSize: 12,
                                                }}
                                              >
                                                %
                                              </span>
                                            </div>
                                            <span
                                              style={{
                                                color: "var(--c-text-3)",
                                                fontWeight: 700,
                                              }}
                                            >
                                              /
                                            </span>
                                            <span className="current-pct">
                                              {currentPct}%
                                            </span>
                                          </div>
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                          <div
                                            className={`diff-chip ${
                                              isActionOver ? "over" : "under"
                                            }`}
                                          >
                                            {isActionOver ? "+" : ""}
                                            {maskMoney(
                                              formatCompactFixed(diff)
                                            )}
                                          </div>
                                        </td>
                                        {manualMode && (
                                          <td style={{ textAlign: "right" }}>
                                            <div
                                              className="sort-actions"
                                              style={{
                                                justifyContent: "flex-end",
                                              }}
                                            >
                                              <button
                                                className="sort-btn"
                                                onClick={() =>
                                                  moveAssetWithinCategory(
                                                    item.id,
                                                    "up"
                                                  )
                                                }
                                                disabled={
                                                  !canMoveAssetWithinCategory(
                                                    item.id,
                                                    "up"
                                                  )
                                                }
                                              >
                                                <ArrowUp size={12} />
                                              </button>
                                              <button
                                                className="sort-btn"
                                                onClick={() =>
                                                  moveAssetWithinCategory(
                                                    item.id,
                                                    "down"
                                                  )
                                                }
                                                disabled={
                                                  !canMoveAssetWithinCategory(
                                                    item.id,
                                                    "down"
                                                  )
                                                }
                                              >
                                                <ArrowDown size={12} />
                                              </button>
                                            </div>
                                          </td>
                                        )}
                                        <td style={{ textAlign: "right" }}>
                                          <button
                                            className="delete-btn"
                                            title="刪除"
                                            onClick={() =>
                                              handleDeleteRequest(item.id)
                                            }
                                          >
                                            <Trash2 size={13} />
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>

                            {/* Mobile Cards */}
                            {stat.items.map((item) => {
                              const twdValue = convertAssetToTwd(
                                item,
                                refData.usdToTwd
                              );
                              const currentPct =
                                totalValue > 0
                                  ? ((twdValue / totalValue) * 100).toFixed(1)
                                  : "0.0";
                              const diff =
                                twdValue -
                                totalValue * (item.targetPercent / 100);
                              const isActionOver = diff > 0;
                              const inputCurrency = getDisplayCurrency(item);
                              return (
                                <div
                                  className="mobile-asset-card"
                                  key={`m-${item.id}`}
                                >
                                  <div className="mobile-asset-card-head">
                                    <div className="mobile-asset-card-name">
                                      <CategoryIcon category={cat} />
                                      {item.name}
                                      <span className="tag">
                                        {inputCurrency}
                                      </span>
                                    </div>
                                    <button
                                      className="delete-btn"
                                      onClick={() =>
                                        handleDeleteRequest(item.id)
                                      }
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                  <div className="mobile-asset-card-grid">
                                    <div className="mobile-asset-card-field">
                                      <div className="mobile-asset-card-field-label">
                                        輸入市值
                                      </div>
                                      <div className="mobile-asset-card-field-value">
                                        {maskMoney(
                                          inputCurrency === "USD"
                                            ? formatUsd(item.value)
                                            : formatCurrency(item.value)
                                        )}
                                      </div>
                                    </div>
                                    <div className="mobile-asset-card-field">
                                      <div className="mobile-asset-card-field-label">
                                        換算台幣
                                      </div>
                                      <div className="mobile-asset-card-field-value">
                                        {maskMoney(formatCurrency(twdValue))}
                                      </div>
                                    </div>
                                    <div className="mobile-asset-card-field">
                                      <div className="mobile-asset-card-field-label">
                                        目標 / 目前
                                      </div>
                                      <div
                                        className="mobile-asset-card-field-value"
                                        style={{ color: "var(--c-accent)" }}
                                      >
                                        {item.targetPercent}% / {currentPct}%
                                      </div>
                                    </div>
                                    <div className="mobile-asset-card-field">
                                      <div className="mobile-asset-card-field-label">
                                        差距
                                      </div>
                                      <div
                                        className={`diff-chip ${
                                          isActionOver ? "over" : "under"
                                        }`}
                                        style={{
                                          fontSize: 11,
                                          padding: "3px 8px",
                                          width: "fit-content",
                                        }}
                                      >
                                        {isActionOver ? "+" : ""}
                                        {maskMoney(formatCompactFixed(diff))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}

                            <div className="category-footer">
                              <button
                                className="add-btn-inline"
                                onClick={() => addAssetToCategory(cat)}
                              >
                                <Plus size={13} />
                                新增 {cat} 項目
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                {Object.keys(categoryStats).length === 0 && (
                  <div style={{ padding: 28 }}>
                    <div className="empty">
                      <div>
                        <div className="empty-icon">
                          <Search
                            size={22}
                            color="var(--c-accent)"
                            style={{ opacity: 0.5 }}
                          />
                        </div>
                        <div
                          style={{
                            fontWeight: 700,
                            color: "var(--c-text-2)",
                            marginBottom: 4,
                          }}
                        >
                          沒有符合的資產
                        </div>
                        <div style={{ fontSize: 11, color: "var(--c-text-3)" }}>
                          試試清除篩選條件
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
