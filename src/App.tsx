import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
} from "recharts";
import {
  Search,
  Trash2,
  Save,
  Trophy,
  CheckCircle2,
  AlertTriangle,
  Pencil,
  TrendingUp,
  TrendingDown,
  Download,
  X,
  BarChart3,
  Activity,
  ArrowUpRight,
  Banknote,
  CalendarDays,
  Cloud,
  CloudOff,
  Loader2,
  Target,
  HelpCircle,
  RefreshCw,
  Plus,
  Zap,
  Shield,
  Crosshair,
  LayoutGrid,
  Table2,
  LineChart as LineChartIcon,
  ChevronUp,
  ChevronDown,
  SlidersHorizontal,
  Moon,
  Sun,
} from "lucide-react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

const STORAGE_KEY = "bestea_asset_growth_cash_other_compact_v1";
const CLOUD_DOC_PATH = ["warrooms", "asset-growth-war-room-v1"];
const firebaseConfig = {
  apiKey: "AIzaSyCbOt1oq1pUjv7itsgNaTuDR3qw-5azbLU",
  authDomain: "premium-wealth-command-center.firebaseapp.com",
  projectId: "premium-wealth-command-center",
  storageBucket: "premium-wealth-command-center.firebasestorage.app",
  messagingSenderId: "344662439136",
  appId: "1:344662439136:web:463fab492d7804f366cc85",
};
/* ─── THEMES ─── */
const THEMES = {
  dark: {
    bg: "#0D1520",
    surface: "#131F2E",
    surfaceAlt: "#1A2840",
    surfaceHover: "#1E2F4A",
    surfaceInset: "#0F1A28",
    text: "#E8EFF8",
    textSecondary: "#8FA3BE",
    textTertiary: "#4E6480",
    textInverse: "#0D1520",
    gold: "#3B82F6",
    goldLight: "rgba(59,130,246,0.12)",
    goldMuted: "#60A5FA",
    positive: "#10B981",
    positiveLight: "rgba(16,185,129,0.12)",
    positiveMuted: "#34D399",
    negative: "#EF4444",
    negativeLight: "rgba(239,68,68,0.12)",
    negativeMuted: "#F87171",
    border: "rgba(255,255,255,0.06)",
    borderStrong: "rgba(255,255,255,0.12)",
    borderAccent: "rgba(59,130,246,0.25)",
    cyan: "#38BDF8",
    purple: "#A78BFA",
    amber: "#FBBF24",
    emerald: "#10B981",
    shadow1: "0 1px 3px rgba(0,0,0,0.3),0 1px 2px rgba(0,0,0,0.2)",
    shadow2: "0 4px 16px rgba(0,0,0,0.4),0 1px 4px rgba(0,0,0,0.3)",
    shadow3: "0 12px 40px rgba(0,0,0,0.5),0 4px 12px rgba(0,0,0,0.3)",
  },
  light: {
    bg: "#F7F6F3",
    surface: "#FFFFFF",
    surfaceAlt: "#F2F1EE",
    surfaceHover: "#F9F8F6",
    surfaceInset: "#EDECE9",
    text: "#1C1C1E",
    textSecondary: "#5C5C60",
    textTertiary: "#A8A8AD",
    textInverse: "#FFFFFF",
    gold: "#1C1C1E",
    goldLight: "rgba(28,28,30,0.05)",
    goldMuted: "#5C5C60",
    positive: "#2D6A4F",
    positiveLight: "rgba(45,106,79,0.07)",
    positiveMuted: "#52B788",
    negative: "#A63228",
    negativeLight: "rgba(166,50,40,0.07)",
    negativeMuted: "#D4785A",
    border: "rgba(28,28,30,0.08)",
    borderStrong: "rgba(28,28,30,0.14)",
    borderAccent: "rgba(28,28,30,0.18)",
    cyan: "#4A7FA5",
    purple: "#6B5B8A",
    amber: "#8A6A2E",
    emerald: "#2D6A4F",
    shadow1: "0 1px 0 rgba(28,28,30,0.06),0 1px 3px rgba(28,28,30,0.03)",
    shadow2: "0 0 0 1px rgba(28,28,30,0.06),0 4px 12px rgba(28,28,30,0.04)",
    shadow3: "0 0 0 1px rgba(28,28,30,0.08),0 8px 24px rgba(28,28,30,0.06)",
  },
};
/* 當前主題（module-level，由 App 在 render 前更新） */
let T = THEMES.dark;
/* ─── Animated Number ─── */
function useAnimNum(target: number, dur: number = 600) {
  const [d, setD] = useState(target);
  const prev = useRef(target);
  const fr = useRef(null);
  useEffect(() => {
    const from = prev.current,
      to = target;
    if (from === to) return;
    const st = performance.now();
    const tick = (now) => {
      const p = Math.min((now - st) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setD(from + (to - from) * e);
      if (p < 1) fr.current = requestAnimationFrame(tick);
      else {
        setD(to);
        prev.current = to;
      }
    };
    fr.current = requestAnimationFrame(tick);
    return () => {
      if (fr.current) cancelAnimationFrame(fr.current);
    };
  }, [target, dur]);
  return d;
}
function AnimV({ value, fmt = (v) => fmtS(v), className = "", style = {} }) {
  const a = useAnimNum(Number(value || 0));
  return (
    <span className={className} style={style}>
      {fmt(a)}
    </span>
  );
}

/* ─── Crosshair Cursor for Charts ─── */
function ChartCursor({ points, height }) {
  if (!points || !points.length) return null;
  const x = points[0]?.x;
  if (x == null) return null;
  return (
    <line
      x1={x}
      x2={x}
      y1={0}
      y2={height}
      stroke={T.gold}
      strokeWidth={1}
      strokeDasharray="3 3"
      opacity={0.5}
    />
  );
}

/* ─── Data ─── */
function defaultCashByMonth(m) {
  return m && m < "2025-12" ? 100000 : 0;
}
const INITIAL_RECORDS = [
  {
    month: "2024-04",
    totalAssets: 1308000,
    cashAssets: 100000,
    otherAssets: 0,
    netIn: 9000,
    netOut: 0,
    note: "歷史資料導入",
  },
  {
    month: "2024-05",
    totalAssets: 1500000,
    cashAssets: 100000,
    otherAssets: 0,
    netIn: 50980,
    netOut: 0,
    note: "歷史資料導入",
  },
  {
    month: "2024-06",
    totalAssets: 1671492,
    cashAssets: 100000,
    otherAssets: 0,
    netIn: 74749,
    netOut: 0,
    note: "歷史資料導入",
  },
  {
    month: "2024-07",
    totalAssets: 1689301,
    cashAssets: 100000,
    otherAssets: 0,
    netIn: 112827,
    netOut: 0,
    note: "歷史資料導入",
  },
  {
    month: "2024-08",
    totalAssets: 2052918,
    cashAssets: 100000,
    otherAssets: 0,
    netIn: 112113,
    netOut: 0,
    note: "歷史資料導入",
  },
  {
    month: "2024-09",
    totalAssets: 2052918,
    cashAssets: 100000,
    otherAssets: 0,
    netIn: 96597,
    netOut: 0,
    note: "歷史資料導入",
  },
  {
    month: "2024-10",
    totalAssets: 2227611,
    cashAssets: 100000,
    otherAssets: 0,
    netIn: 97662,
    netOut: 0,
    note: "歷史資料導入",
  },
  {
    month: "2024-11",
    totalAssets: 2940154,
    cashAssets: 100000,
    otherAssets: 0,
    netIn: 119230,
    netOut: 0,
    note: "歷史資料導入",
  },
  {
    month: "2024-12",
    totalAssets: 2940154,
    cashAssets: 100000,
    otherAssets: 0,
    netIn: 96528,
    netOut: 0,
    note: "歷史資料導入",
  },
  {
    month: "2025-01",
    totalAssets: 2940154,
    cashAssets: 100000,
    otherAssets: 0,
    netIn: 54116,
    netOut: 0,
    note: "歷史資料導入",
  },
  {
    month: "2025-02",
    totalAssets: 4012358,
    cashAssets: 100000,
    otherAssets: 0,
    netIn: 113520,
    netOut: 0,
    note: "歷史資料導入",
  },
  {
    month: "2025-03",
    totalAssets: 4012358,
    cashAssets: 100000,
    otherAssets: 0,
    netIn: 36707,
    netOut: 0,
    note: "歷史資料導入",
  },
  {
    month: "2025-04",
    totalAssets: 3807321,
    cashAssets: 100000,
    otherAssets: 0,
    netIn: 71545,
    netOut: 0,
    note: "歷史資料導入",
  },
  {
    month: "2025-05",
    totalAssets: 3817593,
    cashAssets: 100000,
    otherAssets: 0,
    netIn: 48337,
    netOut: 0,
    note: "歷史資料導入",
  },
  {
    month: "2025-06",
    totalAssets: 4491730,
    cashAssets: 100000,
    otherAssets: 0,
    netIn: 35374,
    netOut: 0,
    note: "歷史資料導入",
  },
  {
    month: "2025-07",
    totalAssets: 5078552,
    cashAssets: 100000,
    otherAssets: 0,
    netIn: 192324,
    netOut: 0,
    note: "歷史資料導入",
  },
  {
    month: "2025-08",
    totalAssets: 5318362,
    cashAssets: 100000,
    otherAssets: 0,
    netIn: 67982,
    netOut: 0,
    note: "歷史資料導入",
  },
  {
    month: "2025-09",
    totalAssets: 5706541,
    cashAssets: 100000,
    otherAssets: 0,
    netIn: 74042,
    netOut: 0,
    note: "歷史資料導入",
  },
  {
    month: "2025-10",
    totalAssets: 6099802,
    cashAssets: 100000,
    otherAssets: 0,
    netIn: 70594,
    netOut: 0,
    note: "歷史資料導入",
  },
  {
    month: "2025-11",
    totalAssets: 5592048,
    cashAssets: 100000,
    otherAssets: 0,
    netIn: 84326,
    netOut: 0,
    note: "歷史資料導入",
  },
  {
    month: "2025-12",
    totalAssets: 5969268,
    cashAssets: 185617,
    otherAssets: 0,
    netIn: 45075,
    netOut: 0,
    note: "",
  },
  {
    month: "2026-01",
    totalAssets: 5845242,
    cashAssets: 139966,
    otherAssets: 0,
    netIn: 46979,
    netOut: 0,
    note: "歷史資料導入",
  },
  {
    month: "2026-02",
    totalAssets: 5845242,
    cashAssets: 139966,
    otherAssets: 0,
    netIn: 65000,
    netOut: 70828,
    note: "歷史資料導入",
  },
];

/* ─── Utils (all preserved logic) ─── */
function migrateRecord(r) {
  const m = r.month || "",
    c =
      r.cashAssets == null || r.cashAssets === ""
        ? defaultCashByMonth(m)
        : Number(r.cashAssets || 0),
    o =
      r.otherAssets == null || r.otherAssets === ""
        ? 0
        : Number(r.otherAssets || 0);
  return {
    month: m,
    totalAssets: Number(r.totalAssets || 0),
    cashAssets: c,
    otherAssets: o,
    netIn: Number(r.netIn || 0),
    netOut: Number(r.netOut || 0),
    note: r.note || "",
  };
}
function normalizeRecords(r) {
  return [...r]
    .map(migrateRecord)
    .filter((x) => x.month)
    .sort((a, b) => a.month.localeCompare(b.month));
}
function getCurrentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function getYear(m) {
  return String(m || "").slice(0, 4);
}
function fmtMS(m) {
  const [y, mo] = String(m).split("-");
  return `${String(y).slice(2)}/${mo}`;
}
function fmtN(v) {
  return Number(v || 0).toLocaleString();
}
function fmtS(v) {
  const n = Number(v || 0);
  if (Math.abs(n) >= 1e8) return `${(n / 1e8).toFixed(2)} 億`;
  if (Math.abs(n) >= 1e4) return `${(n / 1e4).toFixed(1)} 萬`;
  return Math.round(n).toLocaleString();
}
function fmtP(v) {
  return `${Number(v || 0) >= 0 ? "+" : ""}${Number(v || 0).toFixed(2)}%`;
}
function fmtPP(v) {
  return `${Number(v || 0).toFixed(2)}%`;
}
function fmtD(v) {
  return `${Number(v) >= 0 ? "+" : ""}${fmtN(v)}`;
}
function safeLoadLocal() {
  try {
    const r = localStorage.getItem(STORAGE_KEY);
    if (!r) return { records: normalizeRecords(INITIAL_RECORDS) };
    const p = JSON.parse(r);
    return {
      records:
        Array.isArray(p.records) && p.records.length
          ? normalizeRecords(p.records)
          : normalizeRecords(INITIAL_RECORDS),
    };
  } catch {
    return { records: normalizeRecords(INITIAL_RECORDS) };
  }
}
function persistLocal(r) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ records: normalizeRecords(r), updatedAt: Date.now() })
  );
}
function toDateFM(m, mode = "end") {
  const [y, mo] = String(m).split("-").map(Number);
  if (!y || !mo) return new Date();
  return mode === "start" ? new Date(y, mo - 1, 1) : new Date(y, mo, 0);
}
function daysBtw(a, b) {
  return (b.getTime() - a.getTime()) / 864e5;
}
function xnpv(r, c) {
  if (!c.length) return 0;
  const t = c[0].date;
  return c.reduce(
    (s, cf) => s + cf.amount / Math.pow(1 + r, daysBtw(t, cf.date) / 365),
    0
  );
}
function xnpvD(r, c) {
  if (!c.length) return 0;
  const t = c[0].date;
  return c.reduce((s, cf) => {
    const e = daysBtw(t, cf.date) / 365;
    return s + (-e * cf.amount) / Math.pow(1 + r, e + 1);
  }, 0);
}
function xirr(c, g = 0.1) {
  if (
    !c ||
    c.length < 2 ||
    !c.some((x) => x.amount > 0) ||
    !c.some((x) => x.amount < 0)
  )
    return null;
  let r = g;
  for (let i = 0; i < 100; i++) {
    const v = xnpv(r, c),
      d = xnpvD(r, c);
    if (!isFinite(v) || !isFinite(d) || d === 0) return null;
    const nr = r - v / d;
    if (!isFinite(nr) || nr <= -0.999999) return null;
    if (Math.abs(nr - r) < 1e-7) return nr * 100;
    r = nr;
  }
  return null;
}
function calcProcessed(records) {
  const s = [...records].sort((a, b) => a.month.localeCompare(b.month));
  let tp = 0,
    ip = 0,
    ct = 1;
  return s.map((r, i) => {
    const p = i > 0 ? s[i - 1] : null;
    const pA = p ? Number(p.totalAssets || 0) : 0,
      pC = p ? Number(p.cashAssets || 0) : 0,
      pO = p ? Number(p.otherAssets || 0) : 0,
      pI = Math.max(0, pA - pC - pO);
    const tA = Number(r.totalAssets || 0),
      cA = Number(r.cashAssets || 0),
      oA = Number(r.otherAssets || 0),
      iA = Math.max(0, tA - cA - oA);
    const nI = Number(r.netIn || 0),
      nO = Number(r.netOut || 0),
      ncf = nI - nO,
      tc = tA - pA,
      ng = tA - pA - ncf;
    const rr = pA === 0 ? 0 : (ng / pA) * 100;
    ct *= 1 + rr / 100;
    tp = Math.max(tp, tA);
    ip = Math.max(ip, iA);
    return {
      ...r,
      totalAssets: tA,
      cashAssets: cA,
      otherAssets: oA,
      investedAssets: iA,
      prevAssets: pA,
      prevCashAssets: pC,
      prevOtherAssets: pO,
      prevInvestedAssets: pI,
      netIn: nI,
      netOut: nO,
      netCashFlow: ncf,
      totalChange: tc,
      netGain: ng,
      returnRate: rr,
      cashChange: cA - pC,
      otherChange: oA - pO,
      investedChange: iA - pI,
      drawdown: tp === 0 ? 0 : ((tA - tp) / tp) * 100,
      investedDrawdown: ip === 0 ? 0 : ((iA - ip) / ip) * 100,
      cumulativeTwrRate: (ct - 1) * 100,
    };
  });
}
function getAnnualSummary(pd) {
  const g = {};
  pd.forEach((r, i) => {
    const yr = getYear(r.month);
    if (!g[yr]) {
      let sA, sC, sO;
      if (i === 0) {
        sA = Number(r.totalAssets || 0);
        sC = Number(r.cashAssets || 0);
        sO = Number(r.otherAssets || 0);
      } else if (getYear(pd[i - 1].month) !== yr) {
        sA = Number(pd[i - 1].totalAssets || 0);
        sC = Number(pd[i - 1].cashAssets || 0);
        sO = Number(pd[i - 1].otherAssets || 0);
      } else {
        sA = Number(r.prevAssets || 0);
        sC = Number(r.prevCashAssets || 0);
        sO = Number(r.prevOtherAssets || 0);
      }
      g[yr] = {
        year: yr,
        startAssets: sA,
        startCashAssets: sC,
        startOtherAssets: sO,
        endAssets: 0,
        endCashAssets: 0,
        endOtherAssets: 0,
        totalNetInflow: 0,
        months: 0,
        twrFactor: 1,
        rows: [],
      };
    }
    g[yr].endAssets = Number(r.totalAssets || 0);
    g[yr].endCashAssets = Number(r.cashAssets || 0);
    g[yr].endOtherAssets = Number(r.otherAssets || 0);
    g[yr].totalNetInflow += Number(r.netCashFlow || 0);
    g[yr].months += 1;
    g[yr].twrFactor *= 1 + Number(r.returnRate || 0) / 100;
    g[yr].rows.push(r);
  });
  return Object.values(g)
    .map((it) => {
      const sA = it.startAssets,
        eA = it.endAssets,
        sC = it.startCashAssets,
        eC = it.endCashAssets,
        sO = it.startOtherAssets,
        eO = it.endOtherAssets;
      const sI = Math.max(0, sA - sC - sO),
        eI = Math.max(0, eA - eC - eO),
        tag = eA - sA,
        wng = tag - it.totalNetInflow,
        ecr = eA > 0 ? (eC / eA) * 100 : 0,
        twr = (it.twrFactor - 1) * 100;
      const cfs = [];
      if (sA > 0)
        cfs.push({ date: toDateFM(`${it.year}-01`, "start"), amount: -sA });
      it.rows.forEach((r) => {
        const n = Number(r.netCashFlow || 0);
        if (n !== 0) cfs.push({ date: toDateFM(r.month, "end"), amount: -n });
      });
      cfs.push({
        date: toDateFM(
          it.rows[it.rows.length - 1]?.month || `${it.year}-12`,
          "end"
        ),
        amount: eA,
      });
      return {
        ...it,
        startAssets: sA,
        endAssets: eA,
        endCashAssets: eC,
        endInvestedAssets: eI,
        totalAssetGrowth: tag,
        wealthNetGain: wng,
        endCashRatio: ecr,
        twr,
        mwr: xirr(cfs, 0.1),
      };
    })
    .sort((a, b) => Number(b.year) - Number(a.year));
}
function getReturnDist(pd) {
  return [
    { label: "< -3%", min: -Infinity, max: -3, color: T.negative },
    { label: "-3~0%", min: -3, max: 0, color: T.amber },
    { label: "0~3%", min: 0, max: 3, color: T.positiveMuted },
    { label: "> 3%", min: 3, max: Infinity, color: T.positive },
  ].map((b) => ({
    ...b,
    count: pd.filter((r) => r.returnRate >= b.min && r.returnRate < b.max)
      .length,
  }));
}
function toCSV(r) {
  const h = [
    "month",
    "totalAssets",
    "cashAssets",
    "otherAssets",
    "netIn",
    "netOut",
    "note",
  ];
  return [
    h.join(","),
    ...r.map((x) =>
      h.map((k) => `"${String(x[k] ?? "").replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");
}
function downloadCSV(r) {
  const b = new Blob(["\uFEFF" + toCSV(r)], {
    type: "text/csv;charset=utf-8;",
  });
  const u = URL.createObjectURL(b);
  const a = document.createElement("a");
  a.href = u;
  a.download = `asset-growth-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(u);
}
// Firebase 在 module 載入時即時初始化，避免 production build 的時序問題
const _fbApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const _fbAuth = getAuth(_fbApp);
const _fbDb = getFirestore(_fbApp);
function getFirebaseServices() {
  return { app: _fbApp, auth: _fbAuth, db: _fbDb };
}
function projectScenarios(
  pd,
  cur,
  months,
  customRate = null,
  customInflow = null
) {
  const l12 = pd.slice(-12);
  const rets = l12.map((r) => r.returnRate / 100);
  const avg = rets.reduce((a, b) => a + b, 0) / (rets.length || 1);
  const std = Math.sqrt(
    rets.reduce((s, r) => s + (r - avg) ** 2, 0) / (rets.length || 1)
  );
  const avgIn =
    customInflow !== null
      ? customInflow
      : l12.reduce((a, r) => a + r.netCashFlow, 0) / (l12.length || 1);
  const sc = [
    {
      key: "bull",
      label: "樂觀",
      rate:
        customRate !== null ? customRate / 100 + std * 0.5 : avg + std * 0.8,
      color: T.positive,
    },
    {
      key: "base",
      label: "基準",
      rate: customRate !== null ? customRate / 100 : avg,
      color: T.gold,
    },
    {
      key: "bear",
      label: "保守",
      rate:
        customRate !== null ? customRate / 100 - std * 0.5 : avg - std * 0.8,
      color: T.negative,
    },
  ];
  return sc.map((s) => {
    const pts = [{ month: 0, value: cur }];
    let v = cur;
    for (let i = 1; i <= months; i++) {
      v = v * (1 + s.rate) + avgIn;
      pts.push({ month: i, value: Math.max(0, v) });
    }
    return { ...s, points: pts, finalValue: pts[pts.length - 1].value };
  });
}
function cashRC(r) {
  return r < 3 ? T.negative : r < 5 ? T.amber : r > 25 ? T.amber : T.emerald;
}

/* ═══════════ MAIN APP ═══════════ */
export default function App() {
  const loaded = safeLoadLocal();
  const [records, setRecords] = useState(loaded.records);
  const [chartType, setChartType] = useState("return");
  const [trendRange, setTrendRange] = useState("12");
  const [filterYear, setFilterYear] = useState("ALL");
  const [search, setSearch] = useState("");
  const [saveStatus, setSaveStatus] = useState("已載入");
  const [editingMonth, setEditingMonth] = useState("");
  const [toast, setToast] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [goalInput, setGoalInput] = useState("");
  const [goalValue, setGoalValue] = useState(0);
  const [cloudState, setCloudState] = useState("準備連線...");
  const [cloudReady, setCloudReady] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [cloudUid, setCloudUid] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [scenarioMonths, setScenarioMonths] = useState(24);
  const [sortCol, setSortCol] = useState("month");
  const [sortDir, setSortDir] = useState("desc");
  const [scenarioRate, setScenarioRate] = useState(null);
  const [scenarioInflow, setScenarioInflow] = useState(null);
  const [tabKey, setTabKey] = useState(0);
  const [prevTab, setPrevTab] = useState(null);
  const [hoveredMonth, setHoveredMonth] = useState(null);
  const [isDark, setIsDark] = useState(true);
  // Sync module-level T before render
  T = isDark ? THEMES.dark : THEMES.light;
  const remoteAppliedRef = useRef(false);
  const saveTimerRef = useRef(null);
  const remoteJsonRef = useRef(
    JSON.stringify(normalizeRecords(loaded.records))
  );
  const remoteGoalRef = useRef(0);
  const [formData, setFormData] = useState({
    month: getCurrentMonth(),
    totalAssets: "",
    cashAssets: "",
    otherAssets: "0",
    netIn: "0",
    netOut: "0",
    note: "",
  });

  useEffect(() => {
    try {
      persistLocal(records);
      setSaveStatus(`已儲存 ${new Date().toLocaleTimeString("zh-TW")}`);
    } catch (e) {
      console.error("[Save] error:", e);
      setSaveStatus("失敗:" + (e?.code || e?.message || ""));
    }
  }, [records]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  // Firebase
  useEffect(() => {
    let ua: any = null,
      ud: any = null,
      mt = true;
    try {
      if (!mt) return;
      const { auth, db } = getFirebaseServices();
      const cdr = doc(db, CLOUD_DOC_PATH[0], CLOUD_DOC_PATH[1]);
      ua = onAuthStateChanged(auth, async (user) => {
        try {
          if (!user) {
            setCloudState("登入中...");
            await signInAnonymously(auth);
            return;
          }
          if (!mt) return;
          setCloudUid(user.uid);
          setAuthReady(true);
          setCloudState("載入中...");
          ud = onSnapshot(
            cdr,
            (snap) => {
              if (!mt) return;
              const rr = snap.data()?.records;
              const recs = Array.isArray(rr) ? normalizeRecords(rr) : null;
              if (recs && recs.length) {
                const rj = JSON.stringify(recs);
                remoteJsonRef.current = rj;
                remoteAppliedRef.current = true;
                setCloudReady(true);
                const rg = snap.data()?.goalValue;
                if (rg) {
                  setGoalInput(String(rg));
                  setGoalValue(Number(rg));
                  remoteGoalRef.current = Number(rg);
                }
                setRecords((cur) => {
                  if (JSON.stringify(normalizeRecords(cur)) === rj) return cur;
                  persistLocal(recs);
                  setSaveStatus(
                    `已同步 ${new Date().toLocaleTimeString("zh-TW")}`
                  );
                  setToast("已從雲端同步");
                  return recs;
                });
                setCloudState("已連線");
              } else {
                remoteAppliedRef.current = true;
                setCloudReady(true);
                setCloudState("上傳中...");
                remoteJsonRef.current = "";
              }
            },
            (err) => {
              console.error("[CloudSync] snapshot error:", err);
              setCloudReady(false);
              setCloudState("監聽失敗:" + (err?.code || err?.message || ""));
            }
          );
        } catch (e) {
          console.error("[CloudSync] connection error:", e);
          setCloudState("連線失敗:" + (e?.code || e?.message || ""));
        }
      });
    } catch (e) {
      console.error("[CloudSync] init error:", e);
      const msg = (e && (e.code || e.message)) ? String(e.code || e.message).substring(0, 60) : "unknown";
      setCloudState("初始化失敗:" + msg);
    }
    return () => {
      mt = false;
      if (ua) ua();
      if (ud) ud();
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);
  useEffect(() => {
    if (!authReady || !cloudReady || !remoteAppliedRef.current) return;
    const cn = normalizeRecords(records),
      cj = JSON.stringify(cn),
      cg = goalValue || 0;
    if (cj === remoteJsonRef.current && cg === remoteGoalRef.current) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        const { db } = getFirebaseServices();
        await setDoc(
          doc(db, CLOUD_DOC_PATH[0], CLOUD_DOC_PATH[1]),
          {
            records: cn,
            goalValue: cg,
            updatedAt: serverTimestamp(),
            updatedAtClient: Date.now(),
            updatedBy: cloudUid || "anon",
            appName: "asset-growth-war-room",
            version: 1,
          },
          { merge: true }
        );
        remoteJsonRef.current = cj;
        remoteGoalRef.current = cg;
        setCloudState("已同步");
        setSaveStatus(`已同步 ${new Date().toLocaleTimeString("zh-TW")}`);
      } catch {
        setCloudState("儲存失敗");
      }
    }, 700);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [records, goalValue, authReady, cloudReady, cloudUid]);

  const pd = useMemo(() => calcProcessed(records), [records]);
  const annualSummary = useMemo(() => getAnnualSummary(pd), [pd]);
  const trendData = useMemo(
    () => (trendRange === "ALL" ? pd : pd.slice(-Number(trendRange))),
    [pd, trendRange]
  );
  const latest = pd[pd.length - 1] || null;
  const yearOpts = useMemo(
    () =>
      [...new Set(records.map((r) => getYear(r.month)))].sort((a, b) => b - a),
    [records]
  );
  const retDist = useMemo(() => getReturnDist(pd), [pd]);
  const winRate = useMemo(() => {
    const t = pd.length;
    return t ? (pd.filter((r) => r.returnRate > 0).length / t) * 100 : 0;
  }, [pd]);
  const scenarios = useMemo(
    () =>
      latest
        ? projectScenarios(
            pd,
            latest.totalAssets,
            scenarioMonths,
            scenarioRate,
            scenarioInflow
          )
        : [],
    [pd, latest, scenarioMonths, scenarioRate, scenarioInflow]
  );
  const scenarioDefaults = useMemo(() => {
    const l12 = pd.slice(-12);
    const rets = l12.map((r) => r.returnRate);
    const avgR = rets.reduce((a, b) => a + b, 0) / (rets.length || 1);
    const avgIn =
      l12.reduce((a, r) => a + r.netCashFlow, 0) / (l12.length || 1);
    return { avgReturn: avgR, avgInflow: avgIn };
  }, [pd]);
  const scData = useMemo(
    () =>
      scenarios.length
        ? scenarios[0].points.map((_, i) => {
            const o = { month: i };
            scenarios.forEach((s) => {
              o[s.key] = s.points[i]?.value || 0;
            });
            return o;
          })
        : [],
    [scenarios]
  );
  const goalStats = useMemo(() => {
    if (!goalValue || !latest) return null;
    const cur = latest.totalAssets,
      pct = goalValue > 0 ? (cur / goalValue) * 100 : 0,
      rem = Math.max(0, goalValue - cur);
    const l6 = pd.slice(-6),
      avg =
        l6.reduce((a, r) => a + Number(r.totalChange || 0), 0) /
        (l6.length || 1);
    const ml = avg > 0 ? Math.ceil(rem / avg) : null;
    return {
      pct: Math.min(pct, 100),
      remaining: rem,
      timeLabel:
        ml === null
          ? null
          : ml > 24
          ? `約 ${(ml / 12).toFixed(1)} 年`
          : `約 ${ml} 個月`,
      avgMonthlyGrowth: avg,
    };
  }, [goalValue, latest, pd]);

  const stats = useMemo(() => {
    if (!latest)
      return {
        totalAssets: 0,
        cashAssets: 0,
        investedAssets: 0,
        lastMonth: "-",
        latestReturn: 0,
        latestNetGain: 0,
        monthlyChange: 0,
        ytdAssetGrowth: 0,
        ath: 0,
        athDistance: 0,
        maxDrawdown: 0,
        investedMonthlyChange: 0,
        avg6M: 0,
        winStreak: 0,
        lastWinStreak: 0,
        cashRatio: 0,
        totalMonths: 0,
        volatility: 0,
      };
    const cy = getYear(latest.month),
      yr = pd.filter((r) => getYear(r.month) === cy);
    const ysa = Number(yr[0]?.prevAssets || 0),
      ytd = latest.totalAssets - ysa;
    const md = Math.min(...pd.map((r) => r.drawdown), 0),
      ath = Math.max(...pd.map((r) => r.totalAssets), 0);
    const athD = ath > 0 ? ((latest.totalAssets - ath) / ath) * 100 : 0;
    let ws = 0;
    for (let i = pd.length - 1; i >= 0; i--) {
      if (pd[i].returnRate > 0) ws++;
      else break;
    }
    let lws = 0;
    if (ws === 0) {
      let c = false;
      for (let i = pd.length - 2; i >= 0; i--) {
        if (!c && pd[i].returnRate <= 0) {
          c = true;
          continue;
        }
        if (c && pd[i].returnRate > 0) lws++;
        else if (c) break;
      }
    }
    const l6 = pd.slice(-6),
      a6 = l6.reduce((a, c) => a + c.returnRate, 0) / (l6.length || 1);
    const cr =
      latest.totalAssets > 0
        ? (latest.cashAssets / latest.totalAssets) * 100
        : 0;
    const rets = pd.map((r) => r.returnRate),
      ar = rets.reduce((a, b) => a + b, 0) / (rets.length || 1);
    const vol = Math.sqrt(
      rets.reduce((s, r) => s + (r - ar) ** 2, 0) / (rets.length || 1)
    );
    return {
      totalAssets: latest.totalAssets,
      cashAssets: latest.cashAssets,
      investedAssets: latest.investedAssets,
      lastMonth: latest.month,
      latestReturn: latest.returnRate,
      latestNetGain: latest.netGain,
      monthlyChange: latest.totalChange,
      ytdAssetGrowth: ytd,
      ath,
      athDistance: athD,
      maxDrawdown: md,
      investedMonthlyChange: latest.investedChange,
      avg6M: a6,
      winStreak: ws,
      lastWinStreak: lws,
      cashRatio: cr,
      totalMonths: pd.length,
      volatility: vol,
    };
  }, [latest, pd]);

  const formErrors = useMemo(() => {
    const e = [];
    if (!formData.month) e.push("請填月份");
    if (!formData.totalAssets || Number(formData.totalAssets) <= 0)
      e.push("總資產>0");
    if (Number(formData.cashAssets || 0) < 0) e.push("現金≥0");
    if (
      Number(formData.cashAssets || 0) + Number(formData.otherAssets || 0) >
      Number(formData.totalAssets || 0)
    )
      e.push("現金+其它≤總資產");
    return e;
  }, [formData]);
  const tableData = useMemo(() => {
    const kw = search.trim().toLowerCase();
    let d = [...pd]
      .filter((r) => filterYear === "ALL" || getYear(r.month) === filterYear)
      .filter(
        (r) =>
          r.month.includes(kw) ||
          String(r.note || "")
            .toLowerCase()
            .includes(kw)
      );
    const dir = sortDir === "asc" ? 1 : -1;
    d.sort((a, b) => {
      if (sortCol === "month") return a.month.localeCompare(b.month) * dir;
      if (sortCol === "returnRate") return (a.returnRate - b.returnRate) * dir;
      if (sortCol === "totalAssets")
        return (a.totalAssets - b.totalAssets) * dir;
      return 0;
    });
    return d;
  }, [pd, filterYear, search, sortCol, sortDir]);
  const formPreview = useMemo(() => {
    if (!formData.totalAssets) return null;
    const tA = Number(formData.totalAssets || 0),
      cA = Number(formData.cashAssets || 0),
      oA = Number(formData.otherAssets || 0),
      iA = Math.max(0, tA - cA - oA);
    const sorted = [...records].sort((a, b) => a.month.localeCompare(b.month));
    const prev = sorted.filter((r) => r.month < formData.month).pop();
    const pA = prev ? Number(prev.totalAssets) : 0,
      ncf = Number(formData.netIn || 0) - Number(formData.netOut || 0),
      ng = tA - pA - ncf;
    const rr = pA === 0 ? 0 : (ng / pA) * 100,
      ath = Math.max(...records.map((r) => Number(r.totalAssets || 0)), 0);
    return {
      prevAssets: pA,
      netGain: ng,
      returnRate: rr,
      investedAssets: iA,
      isNewHigh: tA > ath,
    };
  }, [formData, records]);
  const gapWarning = useMemo(() => {
    if (!latest) return null;
    const [y, m] = latest.month.split("-").map(Number);
    const d =
      (new Date().getFullYear() - y) * 12 + (new Date().getMonth() - (m - 1));
    return d > 1 ? d : null;
  }, [latest]);
  const insightMsg = useMemo(() => {
    if (!latest) return "尚未建立資料。";
    if (stats.winStreak >= 3)
      return `連續 ${stats.winStreak} 月正報酬。動能強勁，留意集中度。`;
    if (stats.athDistance >= -1 && stats.athDistance < 0)
      return "距歷史高點不到 1%，有望突破。";
    if (stats.athDistance >= 0) return "已創新高。保持節奏，檢視配置。";
    if (stats.latestReturn >= 3) return "本月報酬突出，短期動能偏正。";
    if (stats.latestReturn < 0 && stats.maxDrawdown < -5)
      return "回檔區間。優先看現金彈性。";
    if (stats.ytdAssetGrowth < 0) return "YTD 尚未回正。追蹤投入節奏。";
    return "結構偏穩，持續追蹤同步變化。";
  }, [latest, stats]);
  const maxAbsReturn = useMemo(
    () => Math.max(...pd.map((r) => Math.abs(r.returnRate)), 1),
    [pd]
  );
  const hoveredData = useMemo(() => {
    if (!hoveredMonth) return null;
    return pd.find((r) => r.month === hoveredMonth) || null;
  }, [hoveredMonth, pd]);

  const handleSave = () => {
    setHasSubmitted(true);
    if (formErrors.length) return;
    const c = {
      month: formData.month,
      totalAssets: Number(formData.totalAssets || 0),
      cashAssets:
        formData.cashAssets === ""
          ? defaultCashByMonth(formData.month)
          : Number(formData.cashAssets || 0),
      otherAssets: Number(formData.otherAssets || 0),
      netIn: Number(formData.netIn || 0),
      netOut: Number(formData.netOut || 0),
      note: formData.note || "",
    };
    const ex = records.some((r) => r.month === c.month);
    if (
      ex &&
      editingMonth !== c.month &&
      !window.confirm(`${c.month} 已存在，覆蓋？`)
    )
      return;
    setRecords((p) =>
      normalizeRecords(
        p.some((r) => r.month === c.month)
          ? p.map((r) => (r.month === c.month ? c : r))
          : [...p, c]
      )
    );
    setEditingMonth(c.month);
    setToast(ex ? "已更新" : "已新增");
  };
  const handleForceSync = async () => {
    if (!authReady) {
      setToast("尚未連線");
      return;
    }
    setCloudState("同步中...");
    try {
      const { db } = getFirebaseServices();
      const n = normalizeRecords(records);
      await setDoc(
        doc(db, CLOUD_DOC_PATH[0], CLOUD_DOC_PATH[1]),
        {
          records: n,
          goalValue: goalValue || 0,
          updatedAt: serverTimestamp(),
          updatedAtClient: Date.now(),
          updatedBy: cloudUid || "anon",
          appName: "asset-growth-war-room",
          version: 1,
        },
        { merge: true }
      );
      remoteJsonRef.current = JSON.stringify(n);
      remoteGoalRef.current = goalValue || 0;
      setCloudReady(true);
      remoteAppliedRef.current = true;
      setCloudState("已同步");
      setToast("同步成功");
    } catch {
      setCloudState("同步失敗");
      setToast("同步失敗");
    }
  };
  const handleDel = (m) => {
    if (!window.confirm(`刪除 ${m}？`)) return;
    setRecords((p) => normalizeRecords(p.filter((r) => r.month !== m)));
    if (editingMonth === m) resetForm();
    setToast("已刪除");
  };
  const handleEdit = (row) => {
    setEditingMonth(row.month);
    setFormData({
      month: row.month,
      totalAssets: String(row.totalAssets ?? ""),
      cashAssets: String(row.cashAssets ?? defaultCashByMonth(row.month)),
      otherAssets: String(row.otherAssets ?? 0),
      netIn: String(row.netIn ?? 0),
      netOut: String(row.netOut ?? 0),
      note: row.note || "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const resetForm = () => {
    setEditingMonth("");
    setHasSubmitted(false);
    const m = getCurrentMonth();
    setFormData({
      month: m,
      totalAssets: "",
      cashAssets: String(defaultCashByMonth(m)),
      otherAssets: "0",
      netIn: "0",
      netOut: "0",
      note: "",
    });
  };
  const handleSort = (col) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortCol(col);
      setSortDir("desc");
    }
  };
  const switchTab = (t) => {
    setPrevTab(activeTab);
    setActiveTab(t);
    setTabKey((k) => k + 1);
  };
  const cloudIcon =
    cloudState.includes("已連線") || cloudState.includes("已同步") ? (
      <Cloud size={13} />
    ) : cloudState.includes("登入") ||
      cloudState.includes("載入") ||
      cloudState.includes("同步中") ||
      cloudState.includes("上傳") ? (
      <Loader2 size={13} className="spin" />
    ) : (
      <CloudOff size={13} />
    );
  const cloudColor =
    cloudState.includes("已連線") || cloudState.includes("已同步")
      ? T.positive
      : cloudState.includes("失敗")
      ? T.negative
      : T.textTertiary;

  /* ═══════════ RENDER ═══════════ */
  return (
    <div className="app-root">
      <style>{makeCSS(T)}</style>
      {toast && (
        <div className="toast">
          {toast}
          <button className="toast-close" onClick={() => setToast("")}>
            <X size={12} />
          </button>
        </div>
      )}
      <header className="header">
        <div className="header-left">
          <div className="brand-mark">
            <div className="brand-diamond" />
            <span className="brand-text">WEALTH TERMINAL</span>
          </div>
          <h1 className="header-title">資產成長戰情室</h1>
        </div>
        <div className="header-right">
          <div className="cloud-status" style={{ color: cloudColor }}>
            {cloudIcon}
            <span>{cloudState}</span>
          </div>
          {authReady && cloudState.includes("失敗") && (
            <button className="btn-ghost" onClick={handleForceSync}>
              <RefreshCw size={14} />
              重試
            </button>
          )}
          <button
            className="btn-ghost theme-toggle"
            onClick={() => setIsDark((d) => !d)}
            title={isDark ? "切換淺色" : "切換深色"}
            style={{ padding: "8px 12px" }}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button className="btn-ghost" onClick={() => downloadCSV(records)}>
            <Download size={14} />
            匯出
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              setShowForm(!showForm);
              if (!showForm) resetForm();
            }}
          >
            {showForm ? (
              <>
                <X size={14} />
                關閉
              </>
            ) : (
              <>
                <Plus size={14} />
                新增
              </>
            )}
          </button>
        </div>
      </header>
      <nav className="nav-tabs">
        {[
          { key: "overview", label: "總覽", icon: <LayoutGrid size={15} /> },
          { key: "analysis", label: "分析", icon: <LineChartIcon size={15} /> },
          { key: "records", label: "紀錄", icon: <Table2 size={15} /> },
          { key: "scenario", label: "情境模擬", icon: <Crosshair size={15} /> },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`nav-tab ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => switchTab(tab.key)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {showForm && (
        <section className="card form-card stagger-in" key="form">
          <div className="form-header">
            <div>
              <h3 className="card-title mono">
                {editingMonth ? `編輯 ${editingMonth}` : "新增月度紀錄"}
              </h3>
              <p className="card-desc">
                上次：{latest?.month || "—"} ／ NT${" "}
                {fmtN(latest?.totalAssets || 0)}
              </p>
            </div>
            {editingMonth && (
              <span className="badge badge-blue">
                <Pencil size={12} />
                編輯中
              </span>
            )}
          </div>
          {gapWarning && (
            <div className="alert alert-warn">
              距上次 {gapWarning} 個月（{latest?.month}），是否漏填？
            </div>
          )}
          <div className="form-body">
            <div className="form-fields">
              <FF
                label="年月"
                type="month"
                value={formData.month}
                onChange={(v) => setFormData((p) => ({ ...p, month: v }))}
              />
              <FF
                label="總資產"
                type="number"
                value={formData.totalAssets}
                onChange={(v) => setFormData((p) => ({ ...p, totalAssets: v }))}
                big
              />
              <FF
                label="現金資產"
                type="number"
                value={formData.cashAssets}
                onChange={(v) => setFormData((p) => ({ ...p, cashAssets: v }))}
              />
              <FF
                label="其它資產"
                type="number"
                value={formData.otherAssets}
                onChange={(v) => setFormData((p) => ({ ...p, otherAssets: v }))}
              />
              <FF
                label="淨投入"
                type="number"
                value={formData.netIn}
                onChange={(v) => setFormData((p) => ({ ...p, netIn: v }))}
              />
              <FF
                label="淨提領"
                type="number"
                value={formData.netOut}
                onChange={(v) => setFormData((p) => ({ ...p, netOut: v }))}
              />
              <div className="form-field full">
                <label className="field-label">備註</label>
                <input
                  className="field-input"
                  placeholder="市場回檔、保單、黃金..."
                  value={formData.note}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, note: e.target.value }))
                  }
                />
              </div>
              {hasSubmitted && formErrors.length > 0 && (
                <div className="alert alert-error full">
                  {formErrors.join("、")}
                </div>
              )}
            </div>
            <div className="form-preview">
              <div className="preview-label">即時預覽</div>
              {formPreview ? (
                <div className="preview-rows">
                  <PRow
                    l="上月資產"
                    v={`NT$ ${fmtN(formPreview.prevAssets)}`}
                  />
                  <PRow
                    l="投資資產"
                    v={`NT$ ${fmtN(formPreview.investedAssets)}`}
                  />
                  <PRow
                    l="推估報酬"
                    v={`NT$ ${fmtD(formPreview.netGain)}`}
                    c={formPreview.netGain >= 0 ? T.positive : T.negative}
                  />
                  <PRow
                    l="報酬率"
                    v={fmtP(formPreview.returnRate)}
                    c={formPreview.returnRate >= 0 ? T.positive : T.negative}
                  />
                  {formPreview.isNewHigh && (
                    <div className="new-high-badge">新高 ✦</div>
                  )}
                </div>
              ) : (
                <div className="preview-empty">請輸入總資產</div>
              )}
              <button className="btn-save" onClick={handleSave}>
                <Save size={16} />
                儲存
              </button>
              {editingMonth && (
                <button
                  className="btn-ghost full-w"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                >
                  取消
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {activeTab === "overview" && (
        <div className="tab-enter" key={`ov-${tabKey}`}>
          <section className="hero-kpi si si-0">
            <div className="hero-label">當前總資產</div>
            <div className="hero-value mono">
              <AnimV
                value={stats.totalAssets}
                fmt={(v) => `NT$ ${fmtN(Math.round(v))}`}
              />
            </div>
            <div className="hero-meta">
              <span
                className={`hero-delta ${
                  stats.monthlyChange >= 0 ? "pos" : "neg"
                }`}
              >
                {stats.monthlyChange >= 0 ? (
                  <TrendingUp size={14} />
                ) : (
                  <TrendingDown size={14} />
                )}
                <AnimV
                  value={stats.monthlyChange}
                  fmt={(v) => `${v >= 0 ? "+" : ""}${fmtS(v)}`}
                />{" "}
                本月
              </span>
              <span className="hero-sep">|</span>
              <span
                className={`hero-delta ${
                  stats.ytdAssetGrowth >= 0 ? "pos" : "neg"
                }`}
              >
                <AnimV
                  value={stats.ytdAssetGrowth}
                  fmt={(v) => `${v >= 0 ? "+" : ""}${fmtS(v)}`}
                />{" "}
                YTD
              </span>
              <span className="hero-sep">|</span>
              <span className="hero-date">截至 {stats.lastMonth}</span>
            </div>
          </section>
          <section className="kpi-strip si si-1">
            <div className="kpi-item">
              <div className="kpi-label">月報酬率</div>
              <div
                className="kpi-value mono"
                style={{
                  color: stats.latestReturn >= 0 ? T.positive : T.negative,
                }}
              >
                <AnimV
                  value={stats.latestReturn}
                  fmt={(v) => `${v.toFixed(2)}%`}
                />
              </div>
              <div className="kpi-sub">
                淨增值{" "}
                <AnimV value={stats.latestNetGain} fmt={(v) => fmtS(v)} />
              </div>
            </div>
            <div className="kpi-item">
              <div className="kpi-label">現金資產</div>
              <div className="kpi-value mono" style={{ color: T.emerald }}>
                <AnimV value={stats.cashAssets} fmt={(v) => fmtS(v)} />
              </div>
              <div className="kpi-sub">占比 {stats.cashRatio.toFixed(1)}%</div>
              <div className="cash-bar-track">
                <div
                  className="cash-bar-fill"
                  style={{
                    width: `${Math.min(stats.cashRatio, 100)}%`,
                    background: cashRC(stats.cashRatio),
                  }}
                />
              </div>
              <div
                className="cash-bar-label"
                style={{ color: cashRC(stats.cashRatio) }}
              >
                {stats.cashRatio < 3
                  ? "⚠ 偏低"
                  : stats.cashRatio < 5
                  ? "注意"
                  : stats.cashRatio > 25
                  ? "偏高"
                  : "健康"}
              </div>
            </div>
            <div className="kpi-item">
              <div className="kpi-label">投資資產</div>
              <div className="kpi-value mono" style={{ color: T.cyan }}>
                <AnimV value={stats.investedAssets} fmt={(v) => fmtS(v)} />
              </div>
              <div className="kpi-sub">
                {fmtD(stats.investedMonthlyChange)} 本月
              </div>
            </div>
            <div className="kpi-item">
              <div className="kpi-label">距 ATH</div>
              <div
                className="kpi-value mono"
                style={{
                  color: stats.athDistance >= 0 ? T.positive : T.negative,
                }}
              >
                <AnimV value={stats.athDistance} fmt={(v) => fmtP(v)} />
              </div>
              <div className="kpi-sub">
                ATH <AnimV value={stats.ath} fmt={(v) => fmtS(v)} />
              </div>
            </div>
            <div className="kpi-item">
              <div className="kpi-label">最大回撤</div>
              <div className="kpi-value mono" style={{ color: T.negative }}>
                <AnimV value={stats.maxDrawdown} fmt={(v) => fmtPP(v)} />
              </div>
              <div className="kpi-sub">歷史高點回落</div>
            </div>
            <div className="kpi-item">
              <div className="kpi-label">月波動度</div>
              <div className="kpi-value mono" style={{ color: T.purple }}>
                <AnimV value={stats.volatility} fmt={(v) => fmtPP(v)} />
              </div>
              <div className="kpi-sub">{stats.totalMonths} 個月</div>
            </div>
          </section>
          <section className="signal-card si si-2">
            <div className="signal-icon">
              <Zap size={18} />
            </div>
            <div className="signal-body">
              <div className="signal-label">TERMINAL SIGNAL</div>
              <div className="signal-text">{insightMsg}</div>
            </div>
            <div className="signal-streak">
              <div className="streak-val mono">
                {stats.winStreak > 0 ? (
                  <AnimV value={stats.winStreak} fmt={(v) => Math.round(v)} />
                ) : (
                  "—"
                )}
              </div>
              <div className="streak-label">
                {stats.winStreak > 0 ? "連勝月" : "連勝"}
              </div>
            </div>
          </section>
          <section className="annual-section si si-3">
            <h3 className="section-title">年度績效</h3>
            <div className="annual-grid">
              {annualSummary.map((yr, yi) => (
                <div
                  key={yr.year}
                  className={`annual-card si si-${Math.min(yi + 3, 7)}`}
                >
                  <div className="annual-head">
                    <span className="annual-year mono">{yr.year}</span>
                    <span
                      className={`annual-growth mono ${
                        yr.totalAssetGrowth >= 0 ? "pos" : "neg"
                      }`}
                    >
                      <AnimV
                        value={yr.totalAssetGrowth}
                        fmt={(v) => `${v >= 0 ? "+" : ""}${fmtS(v)}`}
                      />
                    </span>
                  </div>
                  <div className="annual-rows">
                    <ARow
                      l="淨增值"
                      v={`${yr.wealthNetGain >= 0 ? "+" : ""}${fmtS(
                        yr.wealthNetGain
                      )}`}
                    />
                    <ARow
                      l="外部淨投入"
                      v={`${yr.totalNetInflow >= 0 ? "+" : ""}${fmtS(
                        yr.totalNetInflow
                      )}`}
                    />
                    <ARow l="TWR">
                      <AnimV
                        value={yr.twr}
                        fmt={(v) => fmtPP(v)}
                        className="a-row-v mono"
                      />
                    </ARow>
                    <ARow l="MWR">
                      <AnimV
                        value={yr.mwr === null ? 0 : yr.mwr}
                        fmt={(v) => (yr.mwr === null ? "N/A" : fmtPP(v))}
                        className="a-row-v mono"
                      />
                    </ARow>
                    <ARow l="現金占比" v={fmtPP(yr.endCashRatio)} />
                  </div>
                  <Spark rows={yr.rows} />
                </div>
              ))}
            </div>
          </section>
          <div className="two-col si si-6">
            <section className="card">
              <h3 className="card-title">
                <Target size={18} className="icon-gold" />
                資產目標
              </h3>
              <div className="goal-input-wrap">
                <span className="goal-prefix mono">NT$</span>
                <input
                  className="goal-input mono"
                  type="number"
                  placeholder="目標金額"
                  value={goalInput}
                  onChange={(e) => {
                    setGoalInput(e.target.value);
                    setGoalValue(Number(e.target.value) || 0);
                  }}
                />
              </div>
              {goalStats ? (
                <div className="goal-body">
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${goalStats.pct}%`,
                        background: goalStats.pct >= 100 ? T.positive : T.gold,
                      }}
                    />
                  </div>
                  <div className="goal-meta">
                    <span
                      className="mono"
                      style={{ color: T.gold, fontWeight: 700 }}
                    >
                      {goalStats.pct.toFixed(1)}%
                    </span>
                    <span style={{ color: T.textTertiary }}>
                      差 {fmtS(goalStats.remaining)}
                    </span>
                  </div>
                  <div className="goal-rows">
                    <PRow
                      l="近6月均增"
                      v={fmtS(goalStats.avgMonthlyGrowth)}
                      c={
                        goalStats.avgMonthlyGrowth >= 0
                          ? T.positive
                          : T.negative
                      }
                    />
                    <PRow
                      l="預估時程"
                      v={
                        goalStats.pct >= 100
                          ? "已達標 ✦"
                          : goalStats.timeLabel || "—"
                      }
                      c={T.gold}
                    />
                  </div>
                </div>
              ) : (
                <div className="preview-empty">輸入目標金額</div>
              )}
            </section>
            <section className="card">
              <h3 className="card-title">
                <BarChart3 size={18} className="icon-gold" />
                月報酬分布
              </h3>
              <div className="dist-header">
                <div>
                  <span
                    className="dist-rate mono"
                    style={{ color: T.positive }}
                  >
                    {winRate.toFixed(1)}%
                  </span>
                  <span className="dist-label">勝率</span>
                </div>
                <span className="dist-count">{pd.length} 月</span>
              </div>
              <div style={{ height: 160 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={retDist} barSize={40}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke={
                        isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"
                      }
                    />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: T.textTertiary, fontSize: 11 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: T.textTertiary, fontSize: 10 }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      formatter={(v) => [`${v} 月`, ""]}
                      contentStyle={{
                        borderRadius: 8,
                        border: `1px solid ${T.border}`,
                        background: T.surface,
                        color: T.text,
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {retDist.map((it, i) => (
                        <Cell key={i} fill={it.color} fillOpacity={0.8} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>
        </div>
      )}

      {activeTab === "analysis" && (
        <div className="tab-enter" key={`an-${tabKey}`}>
          <section className="card si si-0">
            <div className="chart-header">
              <h3 className="card-title">趨勢分析</h3>
              <div className="chart-controls">
                <div className="seg-group">
                  {[
                    { key: "return", label: "報酬率" },
                    { key: "assets", label: "總資產" },
                    { key: "invested", label: "投資" },
                    { key: "composite", label: "複合" },
                  ].map((it) => (
                    <button
                      key={it.key}
                      className={`seg-btn ${
                        chartType === it.key ? "active" : ""
                      }`}
                      onClick={() => setChartType(it.key)}
                    >
                      {it.label}
                    </button>
                  ))}
                </div>
                <select
                  className="select-sm"
                  value={trendRange}
                  onChange={(e) => setTrendRange(e.target.value)}
                >
                  <option value="12">12M</option>
                  <option value="24">24M</option>
                  <option value="ALL">ALL</option>
                </select>
              </div>
            </div>
            <div
              className="chart-wrap"
              onMouseLeave={() => setHoveredMonth(null)}
            >
              <ResponsiveContainer width="100%" height={340}>
                {chartType === "return" ? (
                  <BarChart data={trendData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke={
                        isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"
                      }
                    />
                    <XAxis
                      dataKey="month"
                      tickFormatter={fmtMS}
                      minTickGap={18}
                      interval="preserveStartEnd"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: T.textTertiary, fontSize: 11 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: T.textTertiary, fontSize: 11 }}
                      unit="%"
                    />
                    <Tooltip
                      content={<CTip mode="return" onHover={setHoveredMonth} />}
                      cursor={<ChartCursor height={340} />}
                    />
                    <ReferenceLine y={0} stroke={T.border} />
                    <Bar dataKey="returnRate" radius={[3, 3, 0, 0]}>
                      {trendData.map((it, i) => (
                        <Cell
                          key={i}
                          fill={it.returnRate >= 0 ? T.positive : T.negative}
                          fillOpacity={0.8}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                ) : chartType === "composite" ? (
                  <ComposedChart data={trendData}>
                    <defs>
                      <linearGradient id="cA" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor={T.gold}
                          stopOpacity={0.2}
                        />
                        <stop offset="95%" stopColor={T.gold} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke={
                        isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"
                      }
                    />
                    <XAxis
                      dataKey="month"
                      tickFormatter={fmtMS}
                      minTickGap={18}
                      interval="preserveStartEnd"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: T.textTertiary, fontSize: 11 }}
                    />
                    <YAxis
                      yAxisId="l"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: T.textTertiary, fontSize: 11 }}
                      tickFormatter={(v) => `${(v / 1e4).toFixed(0)}萬`}
                    />
                    <YAxis
                      yAxisId="r"
                      orientation="right"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: T.textTertiary, fontSize: 11 }}
                      unit="%"
                    />
                    <Tooltip
                      content={
                        <CTip mode="composite" onHover={setHoveredMonth} />
                      }
                      cursor={<ChartCursor height={340} />}
                    />
                    <Area
                      yAxisId="l"
                      type="monotone"
                      dataKey="totalAssets"
                      stroke={T.gold}
                      fill="url(#cA)"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Bar
                      yAxisId="r"
                      dataKey="returnRate"
                      radius={[2, 2, 0, 0]}
                      barSize={16}
                      fillOpacity={0.6}
                    >
                      {trendData.map((it, i) => (
                        <Cell
                          key={i}
                          fill={it.returnRate >= 0 ? T.positive : T.negative}
                        />
                      ))}
                    </Bar>
                  </ComposedChart>
                ) : (
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="aG" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor={chartType === "invested" ? T.cyan : T.gold}
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor={chartType === "invested" ? T.cyan : T.gold}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke={
                        isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"
                      }
                    />
                    <XAxis
                      dataKey="month"
                      tickFormatter={fmtMS}
                      minTickGap={18}
                      interval="preserveStartEnd"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: T.textTertiary, fontSize: 11 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: T.textTertiary, fontSize: 11 }}
                      tickFormatter={(v) => `${(v / 1e4).toFixed(0)}萬`}
                    />
                    <Tooltip
                      content={
                        <CTip mode={chartType} onHover={setHoveredMonth} />
                      }
                      cursor={<ChartCursor height={340} />}
                    />
                    <Area
                      type="monotone"
                      dataKey={
                        chartType === "invested"
                          ? "investedAssets"
                          : "totalAssets"
                      }
                      stroke={chartType === "invested" ? T.cyan : T.gold}
                      fill="url(#aG)"
                      strokeWidth={2.5}
                      dot={{
                        r: 2.5,
                        fill: chartType === "invested" ? T.cyan : T.gold,
                      }}
                      activeDot={{ r: 5, stroke: T.surface, strokeWidth: 2 }}
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
            {hoveredData && (
              <div className="hover-kpi-strip">
                <span className="hover-kpi-label mono">
                  {hoveredData.month}
                </span>
                <span className="hover-kpi-item">
                  總資產 <b className="mono">{fmtS(hoveredData.totalAssets)}</b>
                </span>
                <span className="hover-kpi-item">
                  報酬{" "}
                  <b
                    className="mono"
                    style={{
                      color:
                        hoveredData.returnRate >= 0 ? T.positive : T.negative,
                    }}
                  >
                    {fmtP(hoveredData.returnRate)}
                  </b>
                </span>
                <span className="hover-kpi-item">
                  淨增值{" "}
                  <b
                    className="mono"
                    style={{
                      color: hoveredData.netGain >= 0 ? T.positive : T.negative,
                    }}
                  >
                    {fmtS(hoveredData.netGain)}
                  </b>
                </span>
                <span className="hover-kpi-item">
                  現金 <b className="mono">{fmtS(hoveredData.cashAssets)}</b>
                </span>
              </div>
            )}
          </section>
          <div className="two-col si si-1">
            <section className="card">
              <h3 className="card-title">
                <Trophy size={18} className="icon-gold" />
                表現摘要
              </h3>
              <div className="summary-list">
                <SRow
                  icon={<CheckCircle2 size={15} />}
                  label="連續獲利"
                  value={
                    stats.winStreak > 0
                      ? `${stats.winStreak} 月`
                      : stats.lastWinStreak > 0
                      ? `中斷（前 ${stats.lastWinStreak}）`
                      : "—"
                  }
                  neg={stats.winStreak === 0}
                />
                <SRow
                  icon={<CalendarDays size={15} />}
                  label="近6月均報酬"
                  value={fmtP(stats.avg6M)}
                  pos={stats.avg6M >= 0}
                />
                <SRow
                  icon={<Shield size={15} />}
                  label="現金占比"
                  value={fmtPP(stats.cashRatio)}
                />
                <SRow
                  icon={<Activity size={15} />}
                  label="月波動度 σ"
                  value={fmtPP(stats.volatility)}
                />
              </div>
            </section>
            <section className="card">
              <h3 className="card-title">
                <BarChart3 size={18} className="icon-gold" />
                月報酬分布
              </h3>
              <div className="dist-header">
                <div>
                  <span
                    className="dist-rate mono"
                    style={{ color: T.positive }}
                  >
                    {winRate.toFixed(1)}%
                  </span>
                  <span className="dist-label">勝率</span>
                </div>
              </div>
              <div style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={retDist} barSize={40}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke={
                        isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"
                      }
                    />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: T.textTertiary, fontSize: 11 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: T.textTertiary, fontSize: 10 }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      formatter={(v) => [`${v} 月`, ""]}
                      contentStyle={{
                        borderRadius: 8,
                        border: `1px solid ${T.border}`,
                        background: T.surface,
                        color: T.text,
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {retDist.map((it, i) => (
                        <Cell key={i} fill={it.color} fillOpacity={0.8} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>
        </div>
      )}

      {activeTab === "records" && (
        <div className="tab-enter" key={`rc-${tabKey}`}>
          <section className="card si si-0">
            <div className="table-header">
              <h3 className="card-title">每月明細</h3>
              <div className="table-controls">
                <div className="search-box">
                  <Search size={14} color={T.textTertiary} />
                  <input
                    className="search-input"
                    placeholder="搜尋..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <select
                  className="select-sm"
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                >
                  <option value="ALL">全部</option>
                  {yearOpts.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <ThS
                      col="month"
                      cur={sortCol}
                      dir={sortDir}
                      onClick={handleSort}
                    >
                      月份
                    </ThS>
                    <ThS
                      col="totalAssets"
                      cur={sortCol}
                      dir={sortDir}
                      onClick={handleSort}
                      right
                    >
                      總資產
                    </ThS>
                    <th className="th-r">現金</th>
                    <th className="th-r">投資</th>
                    <th className="th-r">淨投入</th>
                    <th className="th-r">淨提領</th>
                    <th className="th-r">現金流</th>
                    <ThS
                      col="returnRate"
                      cur={sortCol}
                      dir={sortDir}
                      onClick={handleSort}
                      right
                    >
                      月報酬
                    </ThS>
                    <th className="th-l">備註</th>
                    <th className="th-c">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row) => {
                    const barW =
                      maxAbsReturn > 0
                        ? (Math.abs(row.returnRate) / maxAbsReturn) * 100
                        : 0;
                    return (
                      <tr key={row.month}>
                        <td className="td-month mono">{row.month}</td>
                        <td className="td-r mono">{fmtN(row.totalAssets)}</td>
                        <td className="td-r mono">{fmtN(row.cashAssets)}</td>
                        <td className="td-r mono">
                          {fmtN(row.investedAssets)}
                        </td>
                        <td
                          className="td-r mono"
                          style={{
                            color: row.netIn > 0 ? T.positive : T.textTertiary,
                          }}
                        >
                          {row.netIn > 0 ? fmtN(row.netIn) : "—"}
                        </td>
                        <td
                          className="td-r mono"
                          style={{
                            color: row.netOut > 0 ? T.negative : T.textTertiary,
                          }}
                        >
                          {row.netOut > 0 ? fmtN(row.netOut) : "—"}
                        </td>
                        <td className="td-r mono">{fmtN(row.netCashFlow)}</td>
                        <td className="td-r">
                          <div className="return-cell">
                            <div className="return-bar-track">
                              <div
                                className="return-bar-fill"
                                style={{
                                  width: `${barW * 0.5}%`,
                                  background:
                                    row.returnRate >= 0
                                      ? T.positive
                                      : T.negative,
                                  [row.returnRate >= 0 ? "left" : "right"]:
                                    "50%",
                                  position: "absolute",
                                  height: "100%",
                                  borderRadius: 2,
                                }}
                              />
                            </div>
                            <span
                              className={`return-chip ${
                                row.returnRate >= 0 ? "pos" : "neg"
                              }`}
                            >
                              {fmtP(row.returnRate)}
                            </span>
                          </div>
                        </td>
                        <td className="td-note">
                          {!row.note || row.note === "歷史資料導入"
                            ? "—"
                            : row.note}
                        </td>
                        <td className="td-c">
                          <div className="action-group">
                            <button
                              className="icon-btn"
                              onClick={() => handleEdit(row)}
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              className="icon-btn"
                              onClick={() => handleDel(row.month)}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {!tableData.length && (
                    <tr>
                      <td colSpan="10" className="empty-cell">
                        查無資料
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {activeTab === "scenario" && (
        <div className="tab-enter" key={`sc-${tabKey}`}>
          <section className="card si si-0">
            <div className="chart-header">
              <div>
                <h3 className="card-title">
                  <Crosshair size={18} className="icon-gold" />
                  情境模擬
                </h3>
                <p className="card-desc">
                  自訂報酬率與月投入，即時推演三種情境
                </p>
              </div>
              <select
                className="select-sm"
                value={scenarioMonths}
                onChange={(e) => setScenarioMonths(Number(e.target.value))}
              >
                <option value={12}>12M</option>
                <option value={24}>24M</option>
                <option value={36}>36M</option>
              </select>
            </div>
            <div className="scenario-controls si si-1">
              <div className="slider-group">
                <label className="slider-label">
                  <SlidersHorizontal size={13} />
                  月均報酬假設{" "}
                  <span className="mono slider-val">
                    {scenarioRate === null ? (
                      <>
                        自動{" "}
                        <span className="slider-auto-hint">
                          ({scenarioDefaults.avgReturn.toFixed(1)}%)
                        </span>
                      </>
                    ) : (
                      `${scenarioRate.toFixed(1)}%`
                    )}
                  </span>
                </label>
                <input
                  type="range"
                  className="range-input"
                  min={-5}
                  max={10}
                  step={0.1}
                  value={scenarioRate ?? (scenarioDefaults.avgReturn || 0)}
                  onChange={(e) => setScenarioRate(Number(e.target.value))}
                />
                {scenarioRate !== null && (
                  <button
                    className="btn-reset-sm"
                    onClick={() => setScenarioRate(null)}
                  >
                    重置
                  </button>
                )}
              </div>
              <div className="slider-group">
                <label className="slider-label">
                  <SlidersHorizontal size={13} />
                  月均投入{" "}
                  <span className="mono slider-val">
                    {scenarioInflow === null ? (
                      <>
                        自動{" "}
                        <span className="slider-auto-hint">
                          (NT$ {fmtN(Math.round(scenarioDefaults.avgInflow))})
                        </span>
                      </>
                    ) : (
                      `NT$ ${fmtN(Math.round(scenarioInflow))}`
                    )}
                  </span>
                </label>
                <input
                  type="range"
                  className="range-input"
                  min={0}
                  max={300000}
                  step={5000}
                  value={
                    scenarioInflow ?? Math.round(scenarioDefaults.avgInflow)
                  }
                  onChange={(e) => setScenarioInflow(Number(e.target.value))}
                />
                {scenarioInflow !== null && (
                  <button
                    className="btn-reset-sm"
                    onClick={() => setScenarioInflow(null)}
                  >
                    重置
                  </button>
                )}
              </div>
            </div>
            <div className="scenario-summary si si-2">
              {scenarios.map((s) => {
                const delta = s.finalValue - stats.totalAssets;
                const pct =
                  stats.totalAssets > 0 ? (delta / stats.totalAssets) * 100 : 0;
                return (
                  <div
                    key={s.key}
                    className="scenario-sum-card"
                    style={{ borderTopColor: s.color }}
                  >
                    <div className="sc-sum-label" style={{ color: s.color }}>
                      {s.label}
                    </div>
                    <div className="sc-sum-value mono">
                      NT$ <AnimV value={s.finalValue} fmt={(v) => fmtS(v)} />
                    </div>
                    <div
                      className="sc-sum-delta mono"
                      style={{ color: delta >= 0 ? T.positive : T.negative }}
                    >
                      <AnimV
                        value={delta}
                        fmt={(v) => `${v >= 0 ? "+" : ""}${fmtS(v)}`}
                      />{" "}
                      (
                      <AnimV
                        value={pct}
                        fmt={(v) => `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`}
                      />
                      )
                    </div>
                    <div className="sc-sum-period">{scenarioMonths} 個月後</div>
                  </div>
                );
              })}
            </div>
            <div className="chart-wrap si si-3">
              <ResponsiveContainer width="100%" height={360}>
                <AreaChart data={scData}>
                  <defs>
                    <linearGradient id="bG" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={T.positive}
                        stopOpacity={0.15}
                      />
                      <stop
                        offset="95%"
                        stopColor={T.positive}
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient id="bsG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={T.gold} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={T.gold} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="brG" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={T.negative}
                        stopOpacity={0.15}
                      />
                      <stop
                        offset="95%"
                        stopColor={T.negative}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={
                      isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"
                    }
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: T.textTertiary, fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: T.textTertiary, fontSize: 11 }}
                    tickFormatter={(v) => `${(v / 1e4).toFixed(0)}萬`}
                  />
                  <Tooltip
                    content={<ScTip />}
                    cursor={<ChartCursor height={360} />}
                  />
                  <Area
                    type="monotone"
                    dataKey="bull"
                    stroke={T.positive}
                    fill="url(#bG)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="base"
                    stroke={T.gold}
                    fill="url(#bsG)"
                    strokeWidth={2.5}
                    dot={false}
                    strokeDasharray="6 3"
                  />
                  <Area
                    type="monotone"
                    dataKey="bear"
                    stroke={T.negative}
                    fill="url(#brG)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <ReferenceLine
                    y={stats.totalAssets}
                    stroke={T.textTertiary}
                    strokeDasharray="3 3"
                    label={{
                      value: "現在",
                      fill: T.textTertiary,
                      fontSize: 11,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="scenario-note">
              <AlertTriangle size={14} />
              <span>模擬基於歷史外推，不構成投資建議。</span>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

/* ═══════════ SUB-COMPONENTS ═══════════ */
function FF({ label, type, value, onChange, big }) {
  return (
    <div className="form-field">
      <label className="field-label">{label}</label>
      <input
        className={`field-input mono ${big ? "field-big" : ""}`}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
function PRow({ l, v, c = T.text }) {
  return (
    <div className="p-row">
      <span className="p-row-l">{l}</span>
      <span className="p-row-v mono" style={{ color: c }}>
        {v}
      </span>
    </div>
  );
}
function ARow({ l, v, tip, children }) {
  return (
    <div className="a-row">
      <span className="a-row-l">
        {l}
        {tip && (
          <span className="help-tip" title={tip}>
            <HelpCircle size={11} />
          </span>
        )}
      </span>
      {children || <span className="a-row-v mono">{v}</span>}
    </div>
  );
}
function SRow({ icon, label, value, pos, neg }) {
  return (
    <div className="s-row">
      <div className="s-row-left">
        <div className="s-icon">{icon}</div>
        <span>{label}</span>
      </div>
      <span className={`s-row-val mono ${neg ? "neg" : pos ? "pos" : ""}`}>
        {value}
      </span>
    </div>
  );
}
function ThS({ col, cur, dir, onClick, children, right }) {
  const a = cur === col;
  return (
    <th
      className={right ? "th-r th-sort" : "th-l th-sort"}
      onClick={() => onClick(col)}
      style={{ cursor: "pointer", userSelect: "none" }}
    >
      <span className="th-sort-inner">
        {children}
        {a ? (
          dir === "asc" ? (
            <ChevronUp size={12} />
          ) : (
            <ChevronDown size={12} />
          )
        ) : (
          <ChevronDown size={12} style={{ opacity: 0.3 }} />
        )}
      </span>
    </th>
  );
}
function Spark({ rows }) {
  if (!rows || rows.length < 2) return null;
  const vals = rows.map((r) => Number(r.totalAssets || 0));
  const mn = Math.min(...vals),
    mx = Math.max(...vals),
    rg = mx - mn || 1;
  const W = 80,
    H = 24;
  const pts = vals
    .map(
      (v, i) =>
        `${((i / (vals.length - 1)) * W).toFixed(1)},${(
          H -
          ((v - mn) / rg) * H
        ).toFixed(1)}`
    )
    .join(" ");
  const c = vals[vals.length - 1] >= vals[0] ? T.positive : T.negative;
  return (
    <div className="sparkline-wrap">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <polyline
          points={pts}
          fill="none"
          stroke={c}
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity="0.7"
        />
        <circle
          cx={W}
          cy={H - ((vals[vals.length - 1] - mn) / rg) * H}
          r="2"
          fill={c}
        />
      </svg>
    </div>
  );
}
function CTip({ active, payload, label, mode, onHover }) {
  if (!active || !payload?.length) {
    if (onHover) onHover(null);
    return null;
  }
  if (onHover) onHover(label);
  const v = payload[0]?.value;
  let t, s;
  if (mode === "return") {
    t = fmtP(v);
    s = "月報酬率";
  } else if (mode === "invested") {
    t = `NT$ ${fmtN(v)}`;
    s = "投資資產";
  } else if (mode === "composite") {
    t = `NT$ ${fmtN(payload[0]?.value)}`;
    s = `報酬 ${payload[1] ? fmtP(payload[1].value) : ""}`;
  } else {
    t = `NT$ ${fmtN(v)}`;
    s = "總資產";
  }
  return (
    <div className="chart-tooltip">
      <div className="ct-label mono">{label}</div>
      <div className="ct-value mono">{t}</div>
      <div className="ct-sub">{s}</div>
    </div>
  );
}
function ScTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="ct-label mono">第 {label} 月</div>
      {payload.map((p, i) => (
        <div key={i} className="ct-row">
          <span
            className="ct-dot"
            style={{ background: p.color || p.stroke }}
          />
          <span className="mono">NT$ {fmtS(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════ CSS — generated from theme ═══════════ */
const makeCSS = (T) => `
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:opsz,wght@9..40,300..800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body,#root{min-height:100vh;background:${T.bg};color:${T.text}}
body{transition:background 0.3s ease,color 0.3s ease;font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI','Noto Sans TC',sans-serif;font-size:14px;line-height:1.5;-webkit-font-smoothing:antialiased;font-optical-sizing:auto}
button,input,select{font:inherit}
table{border-collapse:collapse}
.mono{font-family:'DM Mono','SF Mono','Fira Code',Menlo,Consolas,monospace;letter-spacing:-0.01em;font-variant-numeric:tabular-nums}
[title]{cursor:help}

@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@keyframes staggerIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes tabEnter{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}
.spin{animation:spin 1s linear infinite}
.si{animation:staggerIn 0.5s cubic-bezier(0.16,1,0.3,1) both}
.si-0{animation-delay:0ms}.si-1{animation-delay:70ms}.si-2{animation-delay:140ms}.si-3{animation-delay:210ms}.si-4{animation-delay:280ms}.si-5{animation-delay:350ms}.si-6{animation-delay:420ms}.si-7{animation-delay:490ms}
.stagger-in{animation:staggerIn 0.4s ease-out}
.tab-enter{animation:tabEnter 0.4s cubic-bezier(0.16,1,0.3,1)}

.app-root{max-width:1400px;margin:0 auto;padding:24px 24px 80px}
@media(max-width:768px){.app-root{padding:16px 16px 64px}}

.toast{position:fixed;top:20px;right:20px;z-index:999;background:${T.surfaceAlt};color:${T.text};border:1px solid ${T.border};padding:12px 20px;border-radius:10px;display:flex;align-items:center;gap:8px;font-size:13px;font-weight:500;box-shadow:${T.shadow3};animation:staggerIn 0.3s ease-out}
.toast-close{background:transparent;border:none;color:${T.textSecondary};cursor:pointer;display:flex;align-items:center;opacity:0.6;transition:opacity 0.15s}
.toast-close:hover{opacity:1}

.header{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:24px;flex-wrap:wrap}
.header-left{display:flex;flex-direction:column;gap:6px}
.brand-mark{display:flex;align-items:center;gap:8px}
.brand-diamond{width:8px;height:8px;background:${T.gold};transform:rotate(45deg);border-radius:1px}
.brand-text{font-size:10px;font-weight:700;letter-spacing:0.25em;color:${T.textTertiary}}
.header-title{font-size:clamp(24px,4vw,36px);font-weight:800;letter-spacing:-0.04em;line-height:1.1;color:${T.text}}
.header-right{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.cloud-status{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:500;padding:8px 12px;background:${T.surface};border:1px solid ${T.border};border-radius:8px;transition:all 0.15s}

.btn-ghost{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border:1px solid ${T.border};background:${T.surface};border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;color:${T.text};transition:all 0.2s cubic-bezier(0.16,1,0.3,1)}
.btn-ghost:hover{border-color:${T.borderStrong};box-shadow:${T.shadow1};transform:translateY(-1px)}
.btn-ghost:active{transform:translateY(0);box-shadow:none}
.btn-ghost:focus-visible{outline:2px solid ${T.gold};outline-offset:2px}
.btn-primary{display:inline-flex;align-items:center;gap:6px;padding:8px 18px;border:none;background:${T.gold};color:#fff;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;transition:all 0.2s cubic-bezier(0.16,1,0.3,1)}
.btn-primary:hover{box-shadow:0 4px 14px rgba(0,0,0,0.2);transform:translateY(-1px)}
.btn-primary:active{transform:translateY(0);box-shadow:none}
.btn-primary:focus-visible{outline:2px solid ${T.gold};outline-offset:2px}
.full-w{width:100%;justify-content:center}

.nav-tabs{display:flex;gap:2px;background:${T.surfaceInset};padding:4px;border-radius:12px;margin-bottom:24px;overflow-x:auto;border:1px solid ${T.border}}
.nav-tab{display:flex;align-items:center;gap:6px;padding:10px 20px;border:none;background:transparent;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;color:${T.textTertiary};transition:all 0.25s cubic-bezier(0.16,1,0.3,1);white-space:nowrap}
.nav-tab.active{background:${T.surfaceAlt};color:${T.text};box-shadow:${T.shadow1}}
.nav-tab:hover:not(.active){color:${T.textSecondary};background:${T.border}}
.nav-tab:focus-visible{outline:2px solid ${T.gold};outline-offset:-2px;border-radius:8px}

.card{background:${T.surface};border:1px solid ${T.border};border-radius:16px;padding:24px;box-shadow:${T.shadow1};margin-bottom:16px;transition:background 0.3s ease,border-color 0.3s ease,box-shadow 0.25s}
.card-title{font-size:16px;font-weight:700;display:flex;align-items:center;gap:8px;margin-bottom:4px;letter-spacing:-0.02em;color:${T.text}}
.card-desc{font-size:13px;color:${T.textTertiary}}
.icon-gold{color:${T.gold}}
.section-title{font-size:18px;font-weight:700;letter-spacing:-0.02em;margin-bottom:16px;color:${T.text}}

.hero-kpi{background:${T.surface};border:1px solid ${T.borderStrong};border-radius:16px;padding:32px;margin-bottom:16px;box-shadow:${T.shadow2};position:relative;overflow:hidden}
.hero-kpi::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,${T.gold} 0%,${T.goldMuted} 50%,transparent 100%)}
.hero-label{font-size:11px;font-weight:700;color:${T.textTertiary};letter-spacing:0.12em;text-transform:uppercase}
.hero-value{font-size:clamp(32px,5vw,48px);font-weight:500;letter-spacing:-0.03em;line-height:1.15;margin:6px 0 10px;color:${T.text}}
.hero-meta{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.hero-delta{display:inline-flex;align-items:center;gap:4px;font-size:13px;font-weight:600}
.hero-delta.pos{color:${T.positive}}.hero-delta.neg{color:${T.negative}}
.hero-sep{color:${T.border};font-size:10px}.hero-date{font-size:12px;color:${T.textTertiary}}

.kpi-strip{display:grid;grid-template-columns:repeat(6,1fr);gap:12px;margin-bottom:16px}
@media(max-width:1024px){.kpi-strip{grid-template-columns:repeat(3,1fr)}}
@media(max-width:640px){.kpi-strip{grid-template-columns:repeat(2,1fr)}}
.kpi-item{background:${T.surface};border:1px solid ${T.border};border-radius:12px;padding:16px;box-shadow:none;transition:all 0.25s cubic-bezier(0.16,1,0.3,1)}
.kpi-item:hover{box-shadow:${T.shadow2};transform:translateY(-2px);border-color:${T.borderStrong}}
.kpi-label{font-size:10px;font-weight:700;color:${T.textTertiary};letter-spacing:0.06em;text-transform:uppercase;margin-bottom:6px}
.kpi-value{font-size:20px;font-weight:500;letter-spacing:-0.02em;line-height:1.2}
.kpi-sub{font-size:11px;color:${T.textTertiary};margin-top:3px}
.cash-bar-track{height:3px;background:${T.surfaceInset};border-radius:999px;overflow:hidden;margin-top:8px}
.cash-bar-fill{height:100%;border-radius:999px;transition:width 0.6s cubic-bezier(0.16,1,0.3,1)}
.cash-bar-label{font-size:9px;font-weight:700;margin-top:4px;letter-spacing:0.03em}

.signal-card{display:flex;align-items:center;gap:16px;background:${T.surface};border:1px solid ${T.border};border-left:3px solid ${T.gold};border-radius:14px;padding:20px 24px;margin-bottom:16px;box-shadow:${T.shadow1}}
.signal-icon{width:40px;height:40px;border-radius:10px;background:${T.goldLight};display:flex;align-items:center;justify-content:center;flex-shrink:0;color:${T.gold}}
.signal-body{flex:1}.signal-label{font-size:9px;font-weight:700;letter-spacing:0.2em;color:${T.textTertiary};margin-bottom:5px}
.signal-text{font-size:13px;line-height:1.65;color:${T.text}}
.signal-streak{text-align:center;padding-left:20px;border-left:1px solid ${T.border};flex-shrink:0;min-width:56px}
.streak-val{font-size:30px;font-weight:500;color:${T.gold};line-height:1}.streak-label{font-size:10px;color:${T.textTertiary};margin-top:4px}

.annual-section{margin-bottom:16px}
.annual-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px}
.annual-card{background:${T.surface};border:1px solid ${T.border};border-radius:14px;padding:20px;transition:all 0.25s cubic-bezier(0.16,1,0.3,1)}
.annual-card:hover{box-shadow:${T.shadow2};transform:translateY(-2px);border-color:${T.borderStrong}}
.annual-head{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid ${T.border}}
.annual-year{font-size:20px;font-weight:500;color:${T.text}}.annual-growth{font-size:18px;font-weight:500}
.annual-growth.pos{color:${T.positive}}.annual-growth.neg{color:${T.negative}}
.annual-rows{display:flex;flex-direction:column;gap:7px}
.a-row{display:flex;justify-content:space-between;align-items:center;font-size:13px}
.a-row-l{color:${T.textSecondary};display:flex;align-items:center;gap:4px}.a-row-v{font-weight:500;font-size:13px;color:${T.text}}
.help-tip{color:${T.textTertiary};cursor:help;display:inline-flex}
.sparkline-wrap{margin-top:14px;padding-top:12px;border-top:1px solid ${T.border};display:flex;justify-content:flex-end}

.two-col{display:grid;grid-template-columns:1fr 1fr;gap:16px}
@media(max-width:768px){.two-col{grid-template-columns:1fr}}

.goal-input-wrap{display:flex;align-items:center;border:1.5px solid ${T.border};border-radius:10px;overflow:hidden;margin:12px 0;transition:border-color 0.2s,box-shadow 0.2s}
.goal-input-wrap:focus-within{border-color:${T.gold};box-shadow:0 0 0 3px ${T.goldLight}}
.goal-prefix{padding:10px 14px;font-size:13px;font-weight:500;color:${T.textTertiary};background:${T.surfaceAlt};border-right:1px solid ${T.border}}
.goal-input{flex:1;border:none;outline:none;padding:10px 14px;font-size:16px;font-weight:500;color:${T.text};background:transparent}
.goal-body{display:flex;flex-direction:column;gap:8px}
.progress-track{height:5px;background:${T.surfaceInset};border-radius:999px;overflow:hidden}
.progress-fill{height:100%;border-radius:999px;transition:width 0.6s cubic-bezier(0.16,1,0.3,1)}
.goal-meta{display:flex;justify-content:space-between;font-size:13px}
.goal-rows{display:flex;flex-direction:column;gap:6px;margin-top:4px}

.dist-header{display:flex;justify-content:space-between;align-items:center;margin:12px 0 4px}
.dist-rate{font-size:24px;font-weight:500}.dist-label{font-size:13px;color:${T.textTertiary};margin-left:8px}
.dist-count{font-size:12px;color:${T.textTertiary}}

.form-card{border:1.5px solid ${T.borderAccent};box-shadow:0 0 0 3px ${T.goldLight}}
.form-header{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:16px;flex-wrap:wrap}
.form-body{display:grid;grid-template-columns:2fr 1fr;gap:20px}
@media(max-width:768px){.form-body{grid-template-columns:1fr}}
.form-fields{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:640px){.form-fields{grid-template-columns:1fr}}
.form-field{display:flex;flex-direction:column;gap:5px}.form-field.full{grid-column:1/-1}
.field-label{font-size:11px;font-weight:700;color:${T.textSecondary};letter-spacing:0.02em}
.field-input{width:100%;border:1.5px solid ${T.border};outline:none;background:${T.surfaceInset};border-radius:8px;padding:10px 14px;font-size:14px;font-weight:500;color:${T.text};transition:border-color 0.2s,box-shadow 0.2s}
.field-input:focus{border-color:${T.gold};box-shadow:0 0 0 3px ${T.goldLight}}
.field-big{font-size:18px;font-weight:500}
.form-preview{background:${T.surfaceAlt};border-radius:14px;padding:20px;display:flex;flex-direction:column;gap:12px;border:1px solid ${T.border}}
.preview-label{font-size:9px;font-weight:700;letter-spacing:0.18em;color:${T.textTertiary};text-transform:uppercase}
.preview-rows{display:flex;flex-direction:column;gap:8px}
.preview-empty{min-height:60px;display:flex;align-items:center;justify-content:center;color:${T.textTertiary};font-size:13px}
.new-high-badge{background:${T.goldLight};color:${T.gold};padding:7px 12px;border-radius:8px;font-size:12px;font-weight:700;text-align:center;letter-spacing:0.02em}
.btn-save{width:100%;border:none;background:${T.positive};color:white;border-radius:10px;padding:13px;font-size:14px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:all 0.2s cubic-bezier(0.16,1,0.3,1)}
.btn-save:hover{box-shadow:0 4px 16px rgba(16,185,129,0.3);transform:translateY(-1px)}
.btn-save:active{transform:translateY(0)}
.btn-save:focus-visible{outline:2px solid ${T.positive};outline-offset:2px}
.p-row{display:flex;justify-content:space-between;align-items:center;font-size:13px}
.p-row-l{color:${T.textSecondary}}.p-row-v{font-weight:500;font-size:13px}
.badge{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;font-size:12px;font-weight:600}
.badge-blue{background:${T.goldLight};color:${T.gold}}
.alert{padding:12px 16px;border-radius:10px;font-size:13px;font-weight:500;margin-bottom:12px}
.alert-warn{background:rgba(138,106,46,0.07);color:${T.amber};border:1px solid rgba(138,106,46,0.18)}
.alert-error{background:${T.negativeLight};color:${T.negative}}

.chart-header{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:16px;flex-wrap:wrap}
.chart-controls{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.seg-group{display:flex;gap:2px;background:${T.surfaceInset};padding:3px;border-radius:9px;border:1px solid ${T.border}}
.seg-btn{border:none;background:transparent;padding:7px 14px;border-radius:7px;cursor:pointer;font-size:12px;font-weight:600;color:${T.textTertiary};transition:all 0.2s cubic-bezier(0.16,1,0.3,1)}
.seg-btn.active{background:${T.surfaceAlt};color:${T.text};box-shadow:${T.shadow1}}
.seg-btn:hover:not(.active){color:${T.textSecondary}}
.select-sm{height:36px;border:1.5px solid ${T.border};outline:none;background:${T.surface};border-radius:8px;padding:0 14px;font-size:13px;font-weight:600;color:${T.text};cursor:pointer;transition:border-color 0.15s}
.select-sm:focus{border-color:${T.gold}}
.chart-wrap{background:${T.surfaceInset};border-radius:12px;padding:20px 12px 12px 4px;border:1px solid ${T.border}}
.chart-tooltip{background:${T.surfaceAlt};backdrop-filter:blur(12px);border:1px solid ${T.borderStrong};border-radius:12px;padding:14px 16px;box-shadow:${T.shadow2}}
.ct-label{font-size:10px;font-weight:600;color:${T.textTertiary};letter-spacing:0.1em;margin-bottom:6px;text-transform:uppercase}
.ct-value{font-size:17px;font-weight:500;color:${T.text}}.ct-sub{font-size:11px;color:${T.textTertiary};margin-top:3px}
.ct-row{display:flex;align-items:center;gap:8px;font-size:13px;margin-top:5px;color:${T.text}}
.ct-dot{width:8px;height:8px;border-radius:2px}

.summary-list{display:flex;flex-direction:column;gap:12px;margin-top:14px}
.s-row{display:flex;justify-content:space-between;align-items:center}
.s-row-left{display:flex;align-items:center;gap:10px;font-size:13px;font-weight:500;color:${T.text}}
.s-icon{width:32px;height:32px;border-radius:8px;background:${T.surfaceAlt};display:flex;align-items:center;justify-content:center;color:${T.textSecondary};flex-shrink:0}
.s-row-val{font-size:15px;font-weight:500;color:${T.text}}
.s-row-val.pos{color:${T.positive}}.s-row-val.neg{color:${T.negative}}

.table-header{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap}
.table-controls{display:flex;align-items:center;gap:8px}
.search-box{display:flex;align-items:center;gap:6px;background:${T.surfaceAlt};border:1px solid ${T.border};border-radius:8px;padding:0 12px;height:36px;min-width:200px;transition:border-color 0.15s}
.search-box:focus-within{border-color:${T.gold}}
.search-input{border:none;outline:none;background:transparent;width:100%;font-size:13px;color:${T.text}}
.table-scroll{overflow-x:auto;margin:0 -24px;padding:0 24px;max-height:600px;overflow-y:auto;scrollbar-width:thin;scrollbar-color:${T.border} transparent}
.data-table{width:100%;min-width:960px}
.data-table thead{position:sticky;top:0;z-index:2}
.data-table th{padding:10px 12px;font-size:10px;font-weight:700;color:${T.textTertiary};text-transform:uppercase;letter-spacing:0.08em;background:${T.surfaceAlt};white-space:nowrap;border-bottom:1.5px solid ${T.borderStrong}}
.th-l{text-align:left}.th-r{text-align:right}.th-c{text-align:center}
.th-sort-inner{display:inline-flex;align-items:center;gap:3px}
.data-table td{padding:12px 12px;white-space:nowrap;font-size:13px;border-bottom:1px solid ${T.border};transition:background 0.15s;color:${T.text}}
.td-month{font-weight:600;color:${T.text}}.td-r{text-align:right;font-weight:400;font-size:13px}.td-c{text-align:center}
.td-note{color:${T.textTertiary};font-size:12px;max-width:160px;overflow:hidden;text-overflow:ellipsis}

.return-cell{display:flex;align-items:center;gap:8px;justify-content:flex-end;min-width:140px}
.return-bar-track{position:relative;width:56px;height:12px;background:${T.surfaceInset};border-radius:3px;overflow:hidden;flex-shrink:0}
.return-bar-fill{transition:width 0.3s cubic-bezier(0.16,1,0.3,1)}
.return-chip{display:inline-block;padding:3px 8px;border-radius:5px;font-size:12px;font-weight:600;white-space:nowrap}
.return-chip.pos{background:${T.positiveLight};color:${T.positive}}.return-chip.neg{background:${T.negativeLight};color:${T.negative}}
.action-group{display:inline-flex;gap:4px}
.icon-btn{width:30px;height:30px;border:1px solid ${T.border};background:${T.surfaceAlt};border-radius:7px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;color:${T.textSecondary};transition:all 0.2s cubic-bezier(0.16,1,0.3,1)}
.icon-btn:hover{border-color:${T.borderStrong};color:${T.text};background:${T.surfaceHover};transform:scale(1.05)}
.icon-btn:active{transform:scale(0.95)}
.icon-btn:focus-visible{outline:2px solid ${T.gold};outline-offset:1px}
.empty-cell{text-align:center;padding:40px;color:${T.textTertiary};font-style:italic}
.data-table tbody tr{transition:background 0.1s}
.data-table tbody tr:hover td{background:${T.surfaceHover}}
.data-table tbody tr:nth-child(even) td{background:${T.surfaceInset}}
.data-table tbody tr:nth-child(even):hover td{background:${T.surfaceHover}}

.scenario-controls{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:16px;padding:20px;background:${T.surfaceInset};border-radius:12px;border:1px solid ${T.border}}
@media(max-width:768px){.scenario-controls{grid-template-columns:1fr}}
.slider-group{display:flex;flex-direction:column;gap:8px}
.slider-label{font-size:12px;font-weight:600;color:${T.textSecondary};display:flex;align-items:center;gap:6px}
.slider-val{color:${T.gold};font-weight:500}
.slider-auto-hint{color:${T.textTertiary};font-weight:400;font-size:11px}
.range-input{-webkit-appearance:none;width:100%;height:5px;border-radius:999px;background:${T.borderStrong};outline:none;cursor:pointer;margin:4px 0}
.range-input::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:${T.gold};cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.25),0 0 0 3px ${T.goldLight};transition:all 0.2s cubic-bezier(0.16,1,0.3,1)}
.range-input::-webkit-slider-thumb:hover{transform:scale(1.12);box-shadow:0 2px 12px rgba(0,0,0,0.3),0 0 0 4px ${T.goldLight}}
.range-input::-moz-range-thumb{width:22px;height:22px;border-radius:50%;background:${T.gold};cursor:pointer;border:none}
.btn-reset-sm{border:1px solid ${T.border};background:${T.surfaceAlt};color:${T.textTertiary};padding:5px 12px;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;align-self:flex-start;transition:all 0.15s}
.btn-reset-sm:hover{color:${T.text};border-color:${T.borderStrong};transform:translateY(-1px)}

.scenario-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px}
@media(max-width:640px){.scenario-summary{grid-template-columns:1fr}}
.scenario-sum-card{background:${T.surface};border:1px solid ${T.border};border-top:3px solid;border-radius:12px;padding:18px;text-align:center;transition:all 0.25s cubic-bezier(0.16,1,0.3,1)}
.scenario-sum-card:hover{box-shadow:${T.shadow2};transform:translateY(-2px);border-color:${T.borderStrong}}
.sc-sum-label{font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px}
.sc-sum-value{font-size:22px;font-weight:500;letter-spacing:-0.02em;margin-bottom:4px;color:${T.text}}
.sc-sum-delta{font-size:13px;font-weight:600;margin-bottom:3px}
.sc-sum-period{font-size:11px;color:${T.textTertiary}}

.scenario-note{display:flex;align-items:flex-start;gap:8px;margin-top:16px;padding:14px 18px;background:${T.surfaceAlt};border-radius:10px;font-size:12px;color:${T.textTertiary};line-height:1.6;border:1px solid ${T.border}}

.hover-kpi-strip{display:flex;align-items:center;gap:16px;padding:10px 16px;margin-top:10px;background:${T.goldLight};border:1px solid ${T.borderAccent};border-radius:10px;font-size:12px;color:${T.textSecondary};flex-wrap:wrap;animation:staggerIn 0.2s ease-out}
.hover-kpi-label{font-weight:700;color:${T.gold};font-size:13px;padding-right:10px;border-right:1px solid ${T.borderAccent}}
.hover-kpi-item{display:flex;align-items:center;gap:4px}
.hover-kpi-item b{font-weight:600;color:${T.text}}

:focus-visible{outline:2px solid ${T.gold};outline-offset:2px;border-radius:4px}
input:focus-visible,select:focus-visible{outline:none}
::selection{background:${T.goldLight}}

/* Scrollbar styling for dark theme */
::-webkit-scrollbar{width:6px;height:6px}
::-webkit-scrollbar-track{background:${T.surfaceInset}}
::-webkit-scrollbar-thumb{background:${T.border};border-radius:3px}
::-webkit-scrollbar-thumb:hover{background:${T.borderStrong}}

/* Dark select option */
select option{background:${T.surfaceAlt};color:${T.text}}

@media(max-width:640px){
  .header{flex-direction:column;align-items:flex-start;gap:12px}
  .header-right{width:100%;justify-content:flex-start}
  .hero-kpi{padding:24px 20px}
  .hero-value{font-size:28px}
  .signal-card{flex-direction:column;gap:12px;padding:16px 20px}
  .signal-streak{border-left:none;border-top:1px solid ${T.border};padding:12px 0 0;display:flex;gap:8px;align-items:center}
  .chart-header{flex-direction:column}
  .annual-grid{grid-template-columns:1fr}
  .nav-tab span{display:none}
  .nav-tab{padding:10px 14px}
  .slider-group{gap:10px}
  .range-input::-webkit-slider-thumb{width:28px;height:28px}
  .range-input::-moz-range-thumb{width:28px;height:28px}
  .card{padding:18px;border-radius:14px}
  .form-body{gap:16px}
}
`;
