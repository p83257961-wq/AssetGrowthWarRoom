import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
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
  PieChart,
  Pie,
  Label,
  LabelList,
  LineChart,
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
  Upload,
  X,
  BarChart3,
  Activity,
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
  Eye,
  EyeOff,
  LayoutDashboard,
  Settings,
  RotateCcw,
  ChevronRight,
  Wallet,
  Sparkles,
  Triangle,
  CandlestickChart,
  BrickWall,
  Coins,
  Layers,
  Bitcoin,
  LandPlot,
  AlertCircle,
  Camera,
  History,
  DollarSign,
  ArrowUp,
  ArrowDown,
  CornerUpLeft,
  PieChart as PieChartIcon,
} from "lucide-react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, initializeAuth, indexedDBLocalPersistence, browserLocalPersistence, inMemoryPersistence, signInAnonymously, onAuthStateChanged } from "firebase/auth";
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
    textTertiary: "#6B7F9E",
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
    textTertiary: "#77777D",
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
/* 當前主題（module-level，由 App 在 render 前更新）；預設淺色 */
let T = THEMES.light;
/* 尊重系統「減少動態效果」設定：數字動畫直接跳到目標值、捲動不用 smooth */
const REDUCED_MOTION =
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
/* ─── Animated Number ─── */
function useAnimNum(target, dur = 600) {
  const [d, setD] = useState(target);
  // shown 追蹤畫面上實際顯示的值：動畫中途換目標時從當前值接續，
  // 不會跳回舊動畫的起點（原本 prev 只在動畫完成時更新，中途 retarget 會視覺跳動）
  const shown = useRef(target);
  const fr = useRef(null);
  useEffect(() => {
    const from = shown.current,
      to = target;
    if (from === to) return;
    if (REDUCED_MOTION) {
      shown.current = to;
      setD(to);
      return;
    }
    const st = performance.now();
    const tick = (now) => {
      const p = Math.min((now - st) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      const v = from + (to - from) * e;
      shown.current = v;
      setD(v);
      if (p < 1) fr.current = requestAnimationFrame(tick);
      else {
        shown.current = to;
        setD(to);
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

/* 連續輸入（滑桿）的防抖：UI 顯示用即時值，昂貴計算改吃延遲值 */
function useDebouncedValue(value, delay = 150) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
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
    liabilities: Number(r.liabilities || 0),
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
/* 月報酬 % → 年化 %（複利，(1+μ)¹²−1）：μ 顯示用 */
function annualizePct(muPct) {
  return (Math.pow(1 + Number(muPct || 0) / 100, 12) - 1) * 100;
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
      netWorth: tA - Number(r.liabilities || 0),
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
  // 區間採 (min, max]：0% 落在「-3~0%」桶，與勝率定義（>0 才算贏）一致
  return [
    { label: "≤ -3%", min: -Infinity, max: -3, color: T.negative },
    { label: "-3~0%", min: -3, max: 0, color: T.amber },
    { label: "0~3%", min: 0, max: 3, color: T.positiveMuted },
    { label: "> 3%", min: 3, max: Infinity, color: T.positive },
  ].map((b) => ({
    ...b,
    count: pd.filter((r) => r.returnRate > b.min && r.returnRate <= b.max)
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
    "liabilities",
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
/* 破壞性操作（匯入／還原／重置／清空）前自動下載當前狀態備份：按錯永遠有後悔藥。
   直接從 localStorage 組檔，主 App 與資產配置分頁都能呼叫，不依賴元件 state */
function downloadPreActionBackup(tag) {
  try {
    let records = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) records = JSON.parse(raw).records || [];
    } catch {}
    let allocation = null;
    try {
      const awRaw = localStorage.getItem(AW_STORAGE_KEY);
      if (awRaw) allocation = JSON.parse(awRaw);
    } catch {}
    const payload = {
      app: "asset-growth-war-room",
      version: 2,
      exportedAt: new Date().toISOString(),
      autoBackupBefore: tag,
      records,
      allocation,
    };
    const b = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const u = URL.createObjectURL(b);
    const a = document.createElement("a");
    a.href = u;
    a.download = `auto-backup-before-${tag}-${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[T:]/g, "")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(u);
  } catch {}
}
/* hex 轉 rgba（熱力圖依報酬強度調透明度用） */
function hexA(hex, a) {
  const h = String(hex).replace("#", "");
  const r = parseInt(h.slice(0, 2), 16),
    g = parseInt(h.slice(2, 4), 16),
    b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}
/* 解析匯出的 CSV（同 toCSV 格式，支援引號跳脫），回傳排序後紀錄或 null */
function parseCSVRecords(text) {
  const clean = String(text || "").replace(/^\uFEFF/, "");
  const lines = clean.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return null;
  const parseLine = (line) => {
    const out = [];
    let cur = "",
      inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQ) {
        if (ch === '"') {
          if (line[i + 1] === '"') {
            cur += '"';
            i++;
          } else inQ = false;
        } else cur += ch;
      } else if (ch === '"') inQ = true;
      else if (ch === ",") {
        out.push(cur);
        cur = "";
      } else cur += ch;
    }
    out.push(cur);
    return out;
  };
  const header = parseLine(lines[0]).map((h) => h.trim());
  const idx = {};
  [
    "month",
    "totalAssets",
    "cashAssets",
    "otherAssets",
    "netIn",
    "netOut",
    "liabilities",
    "note",
  ].forEach((k) => {
    idx[k] = header.indexOf(k);
  });
  if (idx.month === -1 || idx.totalAssets === -1) return null;
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const c = parseLine(lines[i]);
    const month = String(c[idx.month] || "").trim();
    if (!/^\d{4}-\d{2}$/.test(month)) continue;
    rows.push({
      month,
      totalAssets: Number(c[idx.totalAssets] || 0),
      cashAssets: idx.cashAssets >= 0 ? c[idx.cashAssets] : "",
      otherAssets: idx.otherAssets >= 0 ? c[idx.otherAssets] : "",
      netIn: idx.netIn >= 0 ? Number(c[idx.netIn] || 0) : 0,
      netOut: idx.netOut >= 0 ? Number(c[idx.netOut] || 0) : 0,
      liabilities: idx.liabilities >= 0 ? Number(c[idx.liabilities] || 0) : 0,
      note: idx.note >= 0 ? String(c[idx.note] || "") : "",
    });
  }
  rows.sort((a, b) => a.month.localeCompare(b.month));
  return rows.length ? rows : null;
}
// Firebase app 在 module 載入時建立（安全），auth/db 延遲到首次使用以避免 component 註冊競爭
const _fbApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
let _fbAuth = null;
let _fbDb = null;
function getFirebaseServices() {
  if (!_fbAuth) {
    try {
      _fbAuth = initializeAuth(_fbApp, { persistence: [indexedDBLocalPersistence, browserLocalPersistence, inMemoryPersistence] });
    } catch (e) {
      _fbAuth = getAuth(_fbApp);
    }
  }
  if (!_fbDb) _fbDb = getFirestore(_fbApp);
  return { app: _fbApp, auth: _fbAuth, db: _fbDb };
}
/* 匿名登入去重：主 App 與資產配置分頁各自監聽 auth，user 為 null 時
   兩邊會同時要求登入，這裡共用同一個 Promise 避免重複發出匿名登入請求。
   settle 後一律清空：成功後若 Firebase 中途登出（token 失效等），
   下次 user 為 null 時才會發出新的登入請求；進行中的併發呼叫仍共用同一個 Promise */
let _anonSignInPromise = null;
function ensureAnonSignIn(auth) {
  if (!_anonSignInPromise) {
    _anonSignInPromise = signInAnonymously(auth).finally(() => {
      _anonSignInPromise = null;
    });
  }
  return _anonSignInPromise;
}
/* 種子隨機數產生器：同樣輸入永遠產生同樣路徑，拉滑桿時區間不會亂跳 */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function makeRandn(rng) {
  // Box-Muller：均勻分布轉常態分布
  return function () {
    let u = 0,
      v = 0;
    while (u === 0) u = rng();
    while (v === 0) v = rng();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
}
function addMonths(m, n) {
  const [y, mo] = String(m).split("-").map(Number);
  const d = new Date(y, mo - 1 + n, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
/* 情境模擬統計基礎：近12月，排除「總資產與上月完全相同」的未更新月份
   （沒更新的月份會算出假的負報酬＋隔月假暴漲，把 σ 灌水） */
function getScenarioStats(pd) {
  const l12 = pd.slice(-12);
  const real = l12.filter(
    (r) => Number(r.totalAssets) !== Number(r.prevAssets)
  );
  const basis = real.length >= 4 ? real : l12;
  const rets = basis.map((r) => r.returnRate / 100);
  const avg = rets.reduce((a, b) => a + b, 0) / (rets.length || 1);
  const std = Math.sqrt(
    rets.reduce((s, r) => s + (r - avg) ** 2, 0) / (rets.length || 1)
  );
  // 月均投入：剔除大額單月（|淨現金流| 超過中位數 4 倍、且大於 30 萬）——
  // 貸款入金、賣房、年終等一次性事件不該被外推成「每個月都會發生」
  const flows = l12.map((r) => Number(r.netCashFlow || 0));
  const sortedAbs = flows.map(Math.abs).sort((a, b) => a - b);
  const medAbs = sortedAbs.length
    ? sortedAbs[Math.floor(sortedAbs.length / 2)]
    : 0;
  const isExtremeFlow = (f) => Math.abs(f) > Math.max(medAbs * 4, 300000);
  const normalFlows = flows.filter((f) => !isExtremeFlow(f));
  const flowBasis = normalFlows.length >= 6 ? normalFlows : flows;
  const avgIn = flowBasis.reduce((a, b) => a + b, 0) / (flowBasis.length || 1);
  const excludedFlowMonths = flows.length - flowBasis.length;
  // 投入年增率自動推估：近 12 個月 vs 再前 12 個月的平均投入相比。
  // 需至少 24 個月資料；限制 0~10%、負值歸 0（一次性提領或大額投入會污染長期外推，
  // 手動滑桿永遠優先——調薪幅度是使用者自己最清楚的資訊）
  let inflowGrowth = 0;
  let inflowGrowthEstimated = false;
  if (pd.length >= 24) {
    const prev12 = pd.slice(-24, -12);
    const prevAvg =
      prev12.reduce((a, r) => a + Number(r.netCashFlow || 0), 0) / 12;
    if (prevAvg > 0 && avgIn > 0) {
      inflowGrowth = Math.min(10, Math.max(0, (avgIn / prevAvg - 1) * 100));
      inflowGrowthEstimated = true;
    }
  }
  return {
    avgReturn: avg * 100,
    sigma: std * 100,
    avgInflow: avgIn,
    excludedFlowMonths,
    inflowGrowth,
    inflowGrowthEstimated,
    sampleMonths: basis.length,
    excludedMonths: l12.length - basis.length,
  };
}
/* Monte Carlo：每月報酬 ~ N(μ, σ)，500 條路徑，逐月取 P10/P50/P90。
   舊版「每月固定 μ±0.8σ 連續複利」等於假設連續 N 個月每月都偏離平均
   0.8 個標準差，24 個月會複利出脫離現實的區間，因此改用百分位路徑。 */
function projectScenarios(
  pd,
  cur,
  months,
  customRate = null,
  customInflow = null,
  customSigma = null,
  inflowGrowthPct = null,
  events = []
) {
  const st = getScenarioStats(pd);
  const mean = customRate !== null ? customRate / 100 : st.avgReturn / 100;
  const sigma = customSigma !== null ? customSigma / 100 : st.sigma / 100;
  const inflow = customInflow !== null ? customInflow : st.avgInflow;
  const growth = inflowGrowthPct !== null ? inflowGrowthPct : st.inflowGrowth;
  // 投入年增率：第 i 個月的投入＝基準投入 × (1+g)^(經過年數)，模擬薪資成長
  const inflows = [];
  for (let i = 1; i <= months; i++)
    inflows.push(inflow * Math.pow(1 + growth / 100, (i - 1) / 12));
  // 一次性事件：第 month 個月加上 amount（正＝入金、負＝支出），同月多筆累加
  const evMap = {};
  (events || []).forEach((e) => {
    if (e && e.month >= 1 && e.month <= months)
      evMap[e.month] = (evMap[e.month] || 0) + Number(e.amount || 0);
  });
  const N = 500;
  const rng = mulberry32(20260702);
  const randn = makeRandn(rng);
  const paths = [];
  for (let p = 0; p < N; p++) {
    let v = cur;
    const pts = [v];
    for (let i = 1; i <= months; i++) {
      v = v * (1 + mean + sigma * randn()) + inflows[i - 1] + (evMap[i] || 0);
      v = Math.max(0, v);
      pts.push(v);
    }
    paths.push(pts);
  }
  const defs = [
    { key: "bull", label: "樂觀 P90", q: 0.9 },
    { key: "base", label: "基準 P50", q: 0.5 },
    { key: "bear", label: "保守 P10", q: 0.1 },
  ];
  // 每個時間點只排序一次、三個百分位共用
  //（原本 pct(i,q) 每次呼叫都重排 500 元素，FIRE 的 241 點 × 3 分位要排 723 次）
  const pointsByDef = defs.map(() => []);
  for (let i = 0; i <= months; i++) {
    const arr = paths.map((pt) => pt[i]).sort((a, b) => a - b);
    defs.forEach((d, di) => {
      pointsByDef[di].push({
        month: i,
        value: arr[Math.min(N - 1, Math.floor(d.q * N))],
      });
    });
  }
  const scenarios = defs.map((d, di) => {
    const points = pointsByDef[di];
    return {
      ...d,
      points,
      finalValue: points[points.length - 1].value,
      stats: st,
      meanUsed: mean * 100,
      inflowUsed: inflow,
    };
  });
  // 一併回傳原始路徑，供「達標機率」計算（500 條中有幾條在期限內曾達標）
  return { scenarios, paths };
}
function cashRC(r) {
  return r < 3 ? T.negative : r < 5 ? T.amber : r > 25 ? T.amber : T.emerald;
}

/* ═══════════ MAIN APP ═══════════ */
export default function App() {
  // lazy initializer：localStorage 只在首次 render 解析一次
  //（原本每次 render 都跑 safeLoadLocal()，表單每打一個字就重新 JSON.parse 整份紀錄）
  const [records, setRecords] = useState(() => safeLoadLocal().records);
  // 檢視狀態記憶：圖表類型／區間／分頁 重新整理後維持上次狀態
  const [chartType, setChartType] = useState(() => {
    try {
      const v = localStorage.getItem("agwr_chart");
      return ["return", "assets", "invested", "composite", "twr"].includes(v)
        ? v
        : "return";
    } catch {
      return "return";
    }
  });
  const [trendRange, setTrendRange] = useState(() => {
    try {
      const v = localStorage.getItem("agwr_range");
      return ["12", "24", "ALL"].includes(v) ? v : "12";
    } catch {
      return "12";
    }
  });
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
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const t = localStorage.getItem("agwr_tab");
      return ["overview", "analysis", "records", "scenario", "allocation"].includes(
        t
      )
        ? t
        : "overview";
    } catch {
      return "overview";
    }
  });
  const [scenarioMonths, setScenarioMonths] = useState(24);
  const [sortCol, setSortCol] = useState("month");
  const [sortDir, setSortDir] = useState("desc");
  const [scenarioRate, setScenarioRate] = useState(null);
  const [scenarioInflow, setScenarioInflow] = useState(null);
  // σ 滑桿：近 12 個月若剛好平靜，自動 σ 會太窄給假信心，可手動放大測壓力情境
  const [scenarioSigma, setScenarioSigma] = useState(null);
  // 投入年增率：null＝自動（前後 12 月投入推估，需 24 個月資料、限 0~10%），可手動覆寫
  const [scenarioInflowGrowth, setScenarioInflowGrowth] = useState(null);
  // 滑桿顯示用即時值；Monte Carlo 吃 150ms 防抖值，拖曳時不會每個 tick 重跑 500 條路徑
  const debScenarioRate = useDebouncedValue(scenarioRate, 150);
  const debScenarioInflow = useDebouncedValue(scenarioInflow, 150);
  const debScenarioSigma = useDebouncedValue(scenarioSigma, 150);
  const debScenarioInflowGrowth = useDebouncedValue(scenarioInflowGrowth, 150);
  // 一次性事件（信貸入金＋／頭期款支出−）：session 內有效，輸入存字串以便清空
  const [scenarioEvents, setScenarioEvents] = useState([]);
  const [animTab, setAnimTab] = useState(activeTab);
  const visitedTabsRef = useRef(null);
  if (visitedTabsRef.current === null)
    visitedTabsRef.current = { [activeTab]: true };
  const [showDataModal, setShowDataModal] = useState(false);
  const csvInputRef = useRef(null);
  const jsonInputRef = useRef(null);
  const [fireInput, setFireInput] = useState("");
  const [fireExpense, setFireExpense] = useState(0);
  // 退休後年收入（分紅、退休金等會持續的被動收入）：自由數字只需覆蓋「年支出−這筆」的缺口
  const [firePassiveInput, setFirePassiveInput] = useState("");
  const [firePassive, setFirePassive] = useState(0);
  const [hoveredMonth, setHoveredMonth] = useState(null);
  // 熱力圖點選的月份：hover tooltip 手機看不到，改成點擊顯示明細列
  const [hmSel, setHmSel] = useState(null);
  // 備份提醒重算觸發器（下載備份／按「稍後」時 bump 讓橫幅立即更新）
  const [backupPromptTick, setBackupPromptTick] = useState(0);
  // 預設淺色。key 升到 v2：舊 key 存的「dark」是初版自動寫入的預設值而非使用者選擇，
  // 沿用會讓改預設對既有裝置無效；v2 之後只記錄使用者實際切換的結果
  const [isDark, setIsDark] = useState(() => {
    try {
      return localStorage.getItem("agwr_theme_v2") === "dark";
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("agwr_theme_v2", isDark ? "dark" : "light");
    } catch {}
  }, [isDark]);
  useEffect(() => {
    try {
      localStorage.setItem("agwr_chart", chartType);
      localStorage.setItem("agwr_range", trendRange);
    } catch {}
  }, [chartType, trendRange]);
  // 隱私模式：一鍵隱藏所有金額
  const [privacy, setPrivacy] = useState(() => {
    try {
      return localStorage.getItem("agwr_privacy") === "1";
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("agwr_privacy", privacy ? "1" : "0");
    } catch {}
  }, [privacy]);
  // 自訂確認視窗與刪除復原（取代 window.confirm）
  const [confirmDlg, setConfirmDlg] = useState(null);
  // 刪除復原改多筆堆疊：連刪多筆各自都能在 6 秒內復原（原本單槽會被後一筆蓋掉）
  const [undoDels, setUndoDels] = useState([]);
  // Sync module-level T before render
  T = isDark ? THEMES.dark : THEMES.light;
  const css = useMemo(() => makeCSS(T), [isDark]);
  const mask = (s) => (privacy ? "＊＊＊＊＊" : s);
  useEffect(() => {
    if (!showDataModal) return;
    const h = (e) => {
      if (e.key === "Escape") setShowDataModal(false);
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [showDataModal]);
  const remoteAppliedRef = useRef(false);
  const saveTimerRef = useRef(null);
  // lazy init：stringify 只在首次 render 執行一次；此初值僅在雲端 snapshot 到達前有意義
  const remoteJsonRef = useRef(null);
  if (remoteJsonRef.current === null)
    remoteJsonRef.current = JSON.stringify(normalizeRecords(records));
  const remoteGoalRef = useRef(0);
  const remoteFireRef = useRef(0);
  const remotePassiveRef = useRef(0);
  const [formData, setFormData] = useState({
    month: getCurrentMonth(),
    totalAssets: "",
    cashAssets: "",
    otherAssets: "0",
    netIn: "0",
    netOut: "0",
    liabilities: "0",
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
    let ua = null,
      ud = null,
      mt = true;
    try {
      if (!mt) return;
      const { auth, db } = getFirebaseServices();
      const cdr = doc(db, CLOUD_DOC_PATH[0], CLOUD_DOC_PATH[1]);
      ua = onAuthStateChanged(auth, async (user) => {
        try {
          if (!user) {
            setCloudState("登入中...");
            await ensureAnonSignIn(auth);
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
                // != null 而非 truthy：0（已清除）也要同步到其他裝置，只有欄位不存在才跳過
                const rg = snap.data()?.goalValue;
                if (rg != null) {
                  const n = Number(rg) || 0;
                  setGoalInput(n ? String(n) : "");
                  setGoalValue(n);
                  remoteGoalRef.current = n;
                }
                const rf = snap.data()?.fireExpense;
                if (rf != null) {
                  const n = Number(rf) || 0;
                  setFireInput(n ? String(n) : "");
                  setFireExpense(n);
                  remoteFireRef.current = n;
                }
                const fp = snap.data()?.firePassiveIncome;
                if (fp != null) {
                  const n = Number(fp) || 0;
                  setFirePassiveInput(n ? String(n) : "");
                  setFirePassive(n);
                  remotePassiveRef.current = n;
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
      cg = goalValue || 0,
      cf = fireExpense || 0,
      cp = firePassive || 0;
    if (
      cj === remoteJsonRef.current &&
      cg === remoteGoalRef.current &&
      cf === remoteFireRef.current &&
      cp === remotePassiveRef.current
    )
      return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        const { db } = getFirebaseServices();
        await setDoc(
          doc(db, CLOUD_DOC_PATH[0], CLOUD_DOC_PATH[1]),
          {
            records: cn,
            goalValue: cg,
            fireExpense: cf,
            firePassiveIncome: cp,
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
        remoteFireRef.current = cf;
        remotePassiveRef.current = cp;
        setCloudState("已同步");
        setSaveStatus(`已同步 ${new Date().toLocaleTimeString("zh-TW")}`);
      } catch {
        setCloudState("儲存失敗");
      }
    }, 700);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [
    records,
    goalValue,
    fireExpense,
    firePassive,
    authReady,
    cloudReady,
    cloudUid,
  ]);

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
  // 全域統計與情境模擬同口徑：排除「總資產與上月相同」的未更新月份
  const basisPd = useMemo(() => {
    const real = pd.filter(
      (r) => Number(r.totalAssets) !== Number(r.prevAssets)
    );
    return real.length >= 4 ? real : pd;
  }, [pd]);
  // isDark 必須在 deps 裡：桶色是從當前主題 T 取的，否則切主題後顏色停在舊主題
  const retDist = useMemo(() => getReturnDist(basisPd), [basisPd, isDark]);
  const winRate = useMemo(() => {
    const t = basisPd.length;
    return t ? (basisPd.filter((r) => r.returnRate > 0).length / t) * 100 : 0;
  }, [basisPd]);
  // 有效事件：月份 1~600、金額非零才進模擬（輸入框內的半成品不觸發重算）
  const activeEvents = useMemo(
    () =>
      scenarioEvents
        .map((e) => ({
          month: Math.round(Number(e.month)),
          amount: Number(e.amount),
        }))
        .filter(
          (e) =>
            e.month >= 1 &&
            e.month <= 600 &&
            Number.isFinite(e.amount) &&
            e.amount !== 0
        ),
    [scenarioEvents]
  );
  const scenarioSim = useMemo(
    () =>
      latest
        ? projectScenarios(
            pd,
            latest.totalAssets,
            scenarioMonths,
            debScenarioRate,
            debScenarioInflow,
            debScenarioSigma,
            debScenarioInflowGrowth,
            activeEvents
          )
        : null,
    [
      pd,
      latest,
      scenarioMonths,
      debScenarioRate,
      debScenarioInflow,
      debScenarioSigma,
      debScenarioInflowGrowth,
      activeEvents,
    ]
  );
  const scenarios = scenarioSim ? scenarioSim.scenarios : [];
  const scenarioDefaults = useMemo(() => getScenarioStats(pd), [pd]);
  const scData = useMemo(
    () =>
      scenarios.length && latest
        ? scenarios[0].points.map((_, i) => {
            const o = {
              month: i,
              label:
                i === 0 ? fmtMS(latest.month) : fmtMS(addMonths(latest.month, i)),
            };
            scenarios.forEach((s) => {
              o[s.key] = s.points[i]?.value || 0;
            });
            return o;
          })
        : [],
    [scenarios, latest]
  );
  // 各情境何時達標（points index；-1 = 模擬期間內未達標）
  const scenarioGoalReach = useMemo(() => {
    if (!goalValue || !scenarios.length) return null;
    const m = {};
    scenarios.forEach((s) => {
      m[s.key] = s.points.findIndex((p) => p.value >= goalValue);
    });
    return m;
  }, [scenarios, goalValue]);
  // 目標達成機率：500 條路徑中，在模擬期限內「曾經」達到目標金額的比例
  const goalProb = useMemo(() => {
    if (!goalValue || !scenarioSim) return null;
    const hit = scenarioSim.paths.filter((pt) =>
      pt.some((v) => v >= goalValue)
    ).length;
    return {
      pct: (hit / scenarioSim.paths.length) * 100,
      hit,
      total: scenarioSim.paths.length,
    };
  }, [scenarioSim, goalValue]);
  // 成長貢獻分解：總資產 = 起始資產 + 累計投入 + 累計報酬
  const contribData = useMemo(() => {
    if (pd.length < 2) return null;
    const base = pd[0].totalAssets;
    let cin = 0;
    const rows = pd.map((r, i) => {
      if (i > 0) cin += Number(r.netCashFlow || 0);
      return {
        month: r.month,
        base,
        cumInflow: Math.round(cin),
        total: r.totalAssets,
        cumGain: Math.round(r.totalAssets - base - cin),
      };
    });
    const last = rows[rows.length - 1];
    return {
      base,
      rows,
      totalInflow: last.cumInflow,
      totalGain: last.cumGain,
      growth: last.total - base,
    };
  }, [pd]);
  const hasLiab = useMemo(
    () => pd.some((r) => Number(r.liabilities || 0) > 0),
    [pd]
  );
  const heatmapYears = useMemo(() => {
    const map = {};
    pd.forEach((r) => {
      const y = getYear(r.month);
      const m = Number(r.month.slice(5, 7));
      if (!map[y]) map[y] = {};
      map[y][m] = r;
    });
    return Object.keys(map)
      .sort((a, b) => Number(b) - Number(a))
      .map((year) => ({ year, months: map[year] }));
  }, [pd]);
  // 年化報酬（TWR）：報酬鏈用有效月份，年化期間用實際經過月數
  const twrStats = useMemo(() => {
    const chain = basisPd.reduce(
      (f, r) => f * (1 + Number(r.returnRate || 0) / 100),
      1
    );
    const cum = (chain - 1) * 100;
    const n = Math.max(1, pd.length - 1);
    const ann = chain > 0 ? (Math.pow(chain, 12 / n) - 1) * 100 : 0;
    return { cum, ann };
  }, [basisPd, pd]);
  // ── FIRE 設定與計算 ──
  // 提領率可選 4%／3.5%／3.25%（×25／×28.6／×30.8）：4% 法則以 30 年退休期回測，
  // 提早退休（40 年以上）學界普遍建議 3.25~3.5%。選擇存在本機。
  const [fireSwr, setFireSwr] = useState(() => {
    try {
      const v = Number(localStorage.getItem("agwr_fire_swr"));
      return [4, 3.5, 3.25].includes(v) ? v : 4;
    } catch {
      return 4;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("agwr_fire_swr", String(fireSwr));
    } catch {}
  }, [fireSwr]);
  // 樂觀警示：模擬用的 μ 年化超過 10% 時提醒（牛市 12 個月的統計外推 20 年會失真）
  const fireMuWarn = useMemo(() => {
    const mu = scenarioRate ?? scenarioDefaults.avgReturn;
    const annual = (Math.pow(1 + mu / 100, 12) - 1) * 100;
    return annual > 10 ? { mu, annual } : null;
  }, [scenarioRate, scenarioDefaults]);
  // FIRE：自由數字＝(年支出 − 退休後年收) × (100/提領率)，達標門檻隨 2% 通膨逐月成長。
  // 退休後年收＝分紅、退休金等退休後仍會持續的被動收入，視為與通膨同步成長
  //（固定名目金額的年金會略被高估）；有負債時起點與進度用淨值
  const fireStats = useMemo(() => {
    if (!fireExpense || fireExpense <= 0 || !latest) return null;
    const INFL = 0.02;
    const HORIZON = 600; // 最長推算 50 年：不再顯示「未達成」，一律給出實際落點
    const multiple = 100 / fireSwr;
    const passive = Math.max(0, firePassive || 0);
    const netExpense = Math.max(0, fireExpense - passive);
    const covered = netExpense <= 0; // 被動收入已覆蓋全部年支出
    const fireNumber = Math.round(netExpense * multiple);
    const usesNetWorth = Number(latest.liabilities || 0) > 0;
    const base = usesNetWorth ? latest.netWorth : latest.totalAssets;
    const sim = projectScenarios(
      pd,
      Math.max(0, base),
      HORIZON,
      debScenarioRate,
      debScenarioInflow,
      debScenarioSigma,
      debScenarioInflowGrowth,
      activeEvents
    );
    const targetAt = (i) => fireNumber * Math.pow(1 + INFL, i / 12);
    const reach = sim.scenarios.map((s) => ({
      key: s.key,
      label: s.label,
      idx: s.points.findIndex((p, i) => p.value >= targetAt(i)),
    }));
    // 達成機率：路徑在 m 個月內曾越過（隨通膨成長的）門檻的比例
    const probWithin = (m) =>
      (sim.paths.filter((pt) => {
        const end = Math.min(m, pt.length - 1);
        for (let i = 0; i <= end; i++) if (pt[i] >= targetAt(i)) return true;
        return false;
      }).length /
        sim.paths.length) *
      100;
    return {
      fireNumber,
      multiple,
      usesNetWorth,
      base,
      passive,
      netExpense,
      covered,
      reach,
      prob10y: probWithin(120),
      prob20y: probWithin(240),
      progress:
        fireNumber > 0
          ? Math.min(100, Math.max(0, (base / fireNumber) * 100))
          : 100,
    };
  }, [
    fireExpense,
    firePassive,
    fireSwr,
    latest,
    pd,
    debScenarioRate,
    debScenarioInflow,
    debScenarioSigma,
    debScenarioInflowGrowth,
    activeEvents,
  ]);
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
        liabilities: 0,
        netWorth: 0,
      };
    const cy = getYear(latest.month),
      yr = pd.filter((r) => getYear(r.month) === cy);
    const ysa = Number(yr[0]?.prevAssets || 0),
      ytd = latest.totalAssets - ysa;
    const md = Math.min(...pd.map((r) => r.drawdown), 0),
      ath = Math.max(...pd.map((r) => r.totalAssets), 0);
    const athD = ath > 0 ? ((latest.totalAssets - ath) / ath) * 100 : 0;
    // 連勝／均報酬／波動度用有效月份（basisPd），避免未更新月份的假負報酬污染
    let ws = 0;
    for (let i = basisPd.length - 1; i >= 0; i--) {
      if (basisPd[i].returnRate > 0) ws++;
      else break;
    }
    let lws = 0;
    if (ws === 0) {
      let c = false;
      for (let i = basisPd.length - 2; i >= 0; i--) {
        if (!c && basisPd[i].returnRate <= 0) {
          c = true;
          continue;
        }
        if (c && basisPd[i].returnRate > 0) lws++;
        else if (c) break;
      }
    }
    const l6 = basisPd.slice(-6),
      a6 = l6.reduce((a, c) => a + c.returnRate, 0) / (l6.length || 1);
    const cr =
      latest.totalAssets > 0
        ? (latest.cashAssets / latest.totalAssets) * 100
        : 0;
    const rets = basisPd.map((r) => r.returnRate),
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
      liabilities: Number(latest.liabilities || 0),
      netWorth: latest.netWorth ?? latest.totalAssets,
    };
  }, [latest, pd, basisPd]);

  const formErrors = useMemo(() => {
    const e = [];
    if (!formData.month) e.push("請填月份");
    if (!formData.totalAssets || Number(formData.totalAssets) <= 0)
      e.push("總資產>0");
    if (Number(formData.cashAssets || 0) < 0) e.push("現金≥0");
    if (Number(formData.netIn || 0) < 0) e.push("淨投入≥0");
    if (Number(formData.netOut || 0) < 0) e.push("淨提領≥0");
    if (Number(formData.liabilities || 0) < 0) e.push("負債≥0");
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
    const rr = pA === 0 ? 0 : (ng / pA) * 100;
    // ATH 排除正在編輯的月份本身：編輯 ATH 當月時才不會跟自己的舊值比較而漏掉新高徽章
    const ath = Math.max(
      ...records
        .filter((r) => r.month !== formData.month)
        .map((r) => Number(r.totalAssets || 0)),
      0
    );
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
  // 備份提醒：JSON 完整備份超過 60 天（或從未備份）時顯示橫幅；「稍後」暫緩 30 天。
  // 雲端是共用文件不等於備份——本機留檔是資料災難的最後保險
  const backupDue = useMemo(() => {
    try {
      const now = Date.now();
      const snooze = Number(localStorage.getItem("agwr_backup_snooze") || 0);
      if (now - snooze < 30 * 864e5) return null;
      const last = Number(localStorage.getItem("agwr_last_backup") || 0);
      if (!last) return { never: true };
      const days = Math.floor((now - last) / 864e5);
      return days >= 60 ? { days } : null;
    } catch {
      return null;
    }
  }, [backupPromptTick]);
  const insightMsg = useMemo(() => {
    if (!latest) return "尚未建立資料。";
    if (gapWarning)
      return `資料已 ${gapWarning} 個月未更新，以下判讀基於 ${latest.month}。建議先補登最新資產。`;
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
  }, [latest, stats, gapWarning]);
  const maxAbsReturn = useMemo(
    () => Math.max(...pd.map((r) => Math.abs(r.returnRate)), 1),
    [pd]
  );
  const hoveredData = useMemo(() => {
    if (!hoveredMonth) return null;
    return pd.find((r) => r.month === hoveredMonth) || null;
  }, [hoveredMonth, pd]);
  const hmSelData = useMemo(
    () => (hmSel ? pd.find((r) => r.month === hmSel) || null : null),
    [hmSel, pd]
  );

  const applySave = (c, existed) => {
    setRecords((p) =>
      normalizeRecords(
        p.some((r) => r.month === c.month)
          ? p.map((r) => (r.month === c.month ? c : r))
          : [...p, c]
      )
    );
    setEditingMonth(c.month);
    setToast(existed ? "已更新" : "已新增");
  };
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
      liabilities: Number(formData.liabilities || 0),
      note: formData.note || "",
    };
    const ex = records.some((r) => r.month === c.month);
    // 胖手指防呆：與前一個月比，總資產變動超過 ±40% 視為可疑（多打／少打一位數）。
    // 只警示不阻擋——大額進出是真實會發生的事
    const prevRec = [...records]
      .filter((r) => r.month < c.month)
      .sort((a, b) => a.month.localeCompare(b.month))
      .pop();
    const prevTotal = prevRec ? Number(prevRec.totalAssets) : 0;
    const changePct =
      prevTotal > 0 ? ((c.totalAssets - prevTotal) / prevTotal) * 100 : 0;
    const fatFingerMsg =
      prevTotal > 0 && Math.abs(changePct) > 40
        ? `注意：總資產較上月（${mask(fmtN(prevTotal))}）變動 ${
            changePct >= 0 ? "+" : ""
          }${changePct.toFixed(0)}%，請確認沒有多打或少打數字。`
        : "";
    // 編輯中改了月份：明確詢問「移動」或「另存」。
    // 原本會默默新增一筆、舊月份紀錄還留著，使用者以為是搬移，結果多出重複資料
    if (editingMonth && editingMonth !== c.month) {
      setConfirmDlg({
        title: "月份已變更",
        message: `正在編輯 ${editingMonth}，月份已改為 ${c.month}。「移動」會刪除 ${editingMonth} 的原紀錄${
          ex ? `並覆蓋 ${c.month} 現有資料` : ""
        }；「另存」則保留原紀錄、另外新增一筆。${fatFingerMsg}`,
        confirmLabel: "移動",
        secondaryLabel: "另存",
        onConfirm: () => {
          setRecords((p) =>
            normalizeRecords([
              ...p.filter(
                (r) => r.month !== editingMonth && r.month !== c.month
              ),
              c,
            ])
          );
          setEditingMonth(c.month);
          setToast(`已移動至 ${c.month}`);
        },
        onSecondary: () => applySave(c, ex),
      });
      return;
    }
    if (ex && !editingMonth) {
      setConfirmDlg({
        title: "覆蓋紀錄",
        message: `${c.month} 已有資料，確定要覆蓋嗎？原數值將被取代。${fatFingerMsg}`,
        onConfirm: () => applySave(c, true),
      });
      return;
    }
    if (fatFingerMsg) {
      setConfirmDlg({
        title: "數字變動異常",
        message: `${fatFingerMsg}確定要儲存嗎？`,
        confirmLabel: "確定儲存",
        onConfirm: () => applySave(c, ex),
      });
      return;
    }
    applySave(c, ex);
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
          fireExpense: fireExpense || 0,
          firePassiveIncome: firePassive || 0,
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
      remoteFireRef.current = fireExpense || 0;
      remotePassiveRef.current = firePassive || 0;
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
    setConfirmDlg({
      title: "刪除紀錄",
      message: `確定刪除 ${m}？刪除後 6 秒內可復原。`,
      onConfirm: () => {
        const rec = records.find((r) => r.month === m);
        setRecords((p) => normalizeRecords(p.filter((r) => r.month !== m)));
        if (editingMonth === m) resetForm();
        if (rec) {
          const uid = generateId();
          setUndoDels((p) => [...p, { id: uid, record: rec }]);
          setTimeout(() => {
            setUndoDels((p) => p.filter((u) => u.id !== uid));
          }, 6000);
        }
      },
    });
  };
  const handleUndoDel = (uid) => {
    const t = undoDels.find((u) => u.id === uid);
    if (!t) return;
    // 先濾掉同月份：刪除後 6 秒內若重新建立了同月紀錄，復原不會產生重複月份
    setRecords((p) =>
      normalizeRecords([
        ...p.filter((r) => r.month !== t.record.month),
        t.record,
      ])
    );
    setUndoDels((p) => p.filter((u) => u.id !== uid));
    setToast(`已復原 ${t.record.month}`);
  };
  // ── 匯入／備份／還原 ──
  const handleImportCSV = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      const rows = parseCSVRecords(String(reader.result || ""));
      if (!rows) {
        setToast("CSV 格式無法解析");
        return;
      }
      const dup = rows.filter((r) =>
        records.some((x) => x.month === r.month)
      ).length;
      setShowDataModal(false);
      setConfirmDlg({
        title: "匯入 CSV",
        message: `將匯入 ${rows.length} 筆（${rows[0].month} ~ ${
          rows[rows.length - 1].month
        }），其中 ${dup} 筆與現有月份重複、將被覆蓋。執行前會自動下載一份當前備份。`,
        onConfirm: () => {
          downloadPreActionBackup("csv-import");
          setRecords((p) => {
            const m = new Map(p.map((r) => [r.month, r]));
            rows.forEach((r) => m.set(r.month, r));
            return normalizeRecords([...m.values()]);
          });
          setToast(`已匯入 ${rows.length} 筆`);
        },
      });
    };
    reader.readAsText(file, "utf-8");
  };
  const downloadBackup = () => {
    let allocation = null;
    try {
      if (localStorage.getItem(AW_STORAGE_KEY)) allocation = loadFromLocalStorage();
    } catch {}
    const payload = {
      app: "asset-growth-war-room",
      version: 2,
      exportedAt: new Date().toISOString(),
      goalValue: goalValue || 0,
      fireExpense: fireExpense || 0,
      firePassiveIncome: firePassive || 0,
      records: normalizeRecords(records),
      allocation,
    };
    const b = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const u = URL.createObjectURL(b);
    const a = document.createElement("a");
    a.href = u;
    a.download = `asset-growth-backup-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(u);
    setToast("備份已下載");
    // 記錄備份時間供提醒橫幅判斷
    try {
      localStorage.setItem("agwr_last_backup", String(Date.now()));
    } catch {}
    setBackupPromptTick((t) => t + 1);
  };
  const handleRestoreJSON = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const p = JSON.parse(String(reader.result || ""));
        const recs = Array.isArray(p.records)
          ? normalizeRecords(p.records)
          : null;
        if (!recs || !recs.length) {
          setToast("備份檔無有效資料");
          return;
        }
        setShowDataModal(false);
        setConfirmDlg({
          title: "還原備份",
          message: `備份含 ${recs.length} 筆（${recs[0].month} ~ ${
            recs[recs.length - 1].month
          }），將完全取代現有 ${records.length} 筆資料。${
            p.allocation && Array.isArray(p.allocation.assets)
              ? `資產配置（${p.allocation.assets.length} 項）也會一併還原。`
              : ""
          }執行前會自動下載一份當前備份。`,
          onConfirm: async () => {
            downloadPreActionBackup("restore");
            setRecords(recs);
            if (p.goalValue) {
              setGoalValue(Number(p.goalValue));
              setGoalInput(String(p.goalValue));
            }
            if (p.fireExpense) {
              setFireInput(String(p.fireExpense));
              setFireExpense(Number(p.fireExpense));
            }
            if (p.firePassiveIncome) {
              setFirePassiveInput(String(p.firePassiveIncome));
              setFirePassive(Number(p.firePassiveIncome));
            }
            // 資產配置：直接寫回其雲端文件，分頁的 onSnapshot 會即時同步
            if (p.allocation && Array.isArray(p.allocation.assets)) {
              try {
                const { db } = getFirebaseServices();
                await setDoc(
                  doc(db, AW_CLOUD_DOC.collection, AW_CLOUD_DOC.doc),
                  {
                    assets: p.allocation.assets,
                    refData: p.allocation.refData || INITIAL_REF_DATA,
                    snapshots: Array.isArray(p.allocation.snapshots)
                      ? p.allocation.snapshots
                      : [],
                    categoryOrder: Array.isArray(p.allocation.categoryOrder)
                      ? p.allocation.categoryOrder
                      : DEFAULT_CATEGORY_ORDER,
                    updatedAt: new Date().toISOString(),
                  }
                );
              } catch {}
            }
            setToast("已還原備份");
          },
        });
      } catch {
        setToast("備份檔無法解析");
      }
    };
    reader.readAsText(file, "utf-8");
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
      liabilities: String(row.liabilities ?? 0),
      note: row.note || "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: REDUCED_MOTION ? "auto" : "smooth" });
  };
  const resetForm = () => {
    setEditingMonth("");
    setHasSubmitted(false);
    const m = getCurrentMonth();
    // 預設帶上月的現金／其它／淨投入，每月記帳只需改總資產
    setFormData({
      month: m,
      totalAssets: "",
      cashAssets: latest
        ? String(latest.cashAssets)
        : String(defaultCashByMonth(m)),
      otherAssets: latest ? String(latest.otherAssets) : "0",
      netIn: latest ? String(latest.netIn) : "0",
      netOut: "0",
      liabilities: latest ? String(latest.liabilities || 0) : "0",
      note: "",
    });
  };
  // 從「資產配置」分頁帶入目前總資產與現金（同一份 localStorage，資料即時）
  const importFromAllocation = () => {
    try {
      const raw = localStorage.getItem(AW_STORAGE_KEY);
      if (!raw) {
        setToast("資產配置尚無資料");
        return;
      }
      const d = loadFromLocalStorage();
      if (!d.assets || !d.assets.length) {
        setToast("資產配置尚無資料");
        return;
      }
      const fx = Number(d.refData && d.refData.usdToTwd) || 32;
      const total = Math.round(
        d.assets.reduce((sum, a) => sum + convertAssetToTwd(a, fx), 0)
      );
      // 現金＝「現金」＋「緊急備用金」：備用金本質是現金部位，月度紀錄的現金占比才不會失真
      const cash = Math.round(
        d.assets
          .filter(
            (a) => a.category === "現金" || a.category === EMERGENCY_CATEGORY
          )
          .reduce((sum, a) => sum + convertAssetToTwd(a, fx), 0)
      );
      setFormData((prev) => ({
        ...prev,
        totalAssets: String(total),
        cashAssets: String(cash),
      }));
      setToast(
        privacy
          ? "已帶入資產配置數值（現金＝現金＋緊急備用金）"
          : `已帶入：總資產 ${fmtN(total)}／現金 ${fmtN(cash)}（現金＝現金＋緊急備用金）`
      );
    } catch {
      setToast("帶入失敗");
    }
  };
  const handleSort = (col) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortCol(col);
      setSortDir("desc");
    }
  };
  // 只有第一次進入某個 tab 才播進場動畫，之後切換直接顯示
  const switchTab = (t) => {
    try {
      localStorage.setItem("agwr_tab", t);
    } catch {}
    if (!visitedTabsRef.current[t]) {
      visitedTabsRef.current[t] = true;
      setAnimTab(t);
    } else {
      setAnimTab(null);
    }
    setActiveTab(t);
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
      <style>{css}</style>
      <div className="toast-host">
        {toast && (
          <div className="toast">
            {toast}
            <button
              className="toast-close"
              onClick={() => setToast("")}
              aria-label="關閉通知"
            >
              <X size={12} />
            </button>
          </div>
        )}
        {undoDels.map((u) => (
          <div className="toast" key={u.id}>
            已刪除 {u.record.month}
            <button className="btn-undo" onClick={() => handleUndoDel(u.id)}>
              復原
            </button>
            <button
              className="toast-close"
              onClick={() =>
                setUndoDels((p) => p.filter((x) => x.id !== u.id))
              }
              aria-label="關閉"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
      {confirmDlg && (
        <ConfirmModal
          title={confirmDlg.title}
          message={confirmDlg.message}
          confirmLabel={confirmDlg.confirmLabel}
          secondaryLabel={confirmDlg.secondaryLabel}
          onSecondary={confirmDlg.onSecondary}
          onConfirm={confirmDlg.onConfirm}
          onCancel={() => setConfirmDlg(null)}
        />
      )}
      {showDataModal && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="資料管理"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDataModal(false);
          }}
        >
          <div className="modal" style={{ maxWidth: 460, textAlign: "left" }}>
            <div
              className="modal-title"
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <Download size={18} />
              資料管理
            </div>
            <div className="modal-text">
              CSV 適合在 Excel 編輯後匯回；JSON 備份包含目標與 FIRE
              設定，適合完整搬移或災難復原（含「資產配置」分頁全部資料）。
            </div>
            <div className="data-actions">
              <button
                className="btn-ghost data-action"
                onClick={() => {
                  downloadCSV(records);
                  setToast("CSV 已匯出");
                }}
              >
                <Download size={15} />
                匯出 CSV
                <span className="data-hint">{records.length} 筆</span>
              </button>
              <button
                className="btn-ghost data-action"
                onClick={() => csvInputRef.current && csvInputRef.current.click()}
              >
                <Upload size={15} />
                匯入 CSV
                <span className="data-hint">同月份覆蓋、其餘保留</span>
              </button>
              <button className="btn-ghost data-action" onClick={downloadBackup}>
                <Save size={15} />
                下載 JSON 完整備份
                <span className="data-hint">含目標、FIRE、資產配置</span>
              </button>
              <button
                className="btn-ghost data-action"
                onClick={() =>
                  jsonInputRef.current && jsonInputRef.current.click()
                }
              >
                <Upload size={15} />
                還原 JSON 備份
                <span className="data-hint">完全取代現有資料</span>
              </button>
            </div>
            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button
                className="modal-cancel"
                onClick={() => setShowDataModal(false)}
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
      <input
        type="file"
        accept=".csv,text/csv"
        ref={csvInputRef}
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files && e.target.files[0];
          e.target.value = "";
          if (f) handleImportCSV(f);
        }}
      />
      <input
        type="file"
        accept=".json,application/json"
        ref={jsonInputRef}
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files && e.target.files[0];
          e.target.value = "";
          if (f) handleRestoreJSON(f);
        }}
      />
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
            className="btn-ghost"
            onClick={() => setPrivacy((p) => !p)}
            title={privacy ? "顯示金額" : "隱藏金額（隱私模式）"}
            aria-pressed={privacy}
            style={{ padding: "8px 12px" }}
          >
            {privacy ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          <button
            className="btn-ghost theme-toggle"
            onClick={() => setIsDark((d) => !d)}
            title={isDark ? "切換淺色" : "切換深色"}
            style={{ padding: "8px 12px" }}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button className="btn-ghost" onClick={() => setShowDataModal(true)}>
            <Download size={14} />
            資料
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
          { key: "allocation", label: "資產配置", icon: <Wallet size={15} /> },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`nav-tab ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => switchTab(tab.key)}
            title={tab.label}
            aria-current={activeTab === tab.key ? "page" : undefined}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      <ErrorBoundary resetKey={activeTab}>
      {showForm && (
        <section className="card form-card stagger-in" key="form">
          <div className="form-header">
            <div>
              <h3 className="card-title mono">
                {editingMonth ? `編輯 ${editingMonth}` : "新增月度紀錄"}
              </h3>
              <p className="card-desc">
                上次：{latest?.month || "—"} ／{" "}
                {mask(`NT$ ${fmtN(latest?.totalAssets || 0)}`)}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button
                className="btn-ghost"
                onClick={importFromAllocation}
                title="讀取「資產配置」分頁目前的總資產與現金（現金＝「現金」＋「緊急備用金」合計）"
              >
                <Wallet size={14} />
                從資產配置帶入
              </button>
              {editingMonth && (
                <span className="badge badge-blue">
                  <Pencil size={12} />
                  編輯中
                </span>
              )}
            </div>
          </div>
          {gapWarning && (
            <div className="alert alert-warn">
              距上次 {gapWarning} 個月（{latest?.month}），是否漏填？
            </div>
          )}
          <div
            className="form-body"
            onKeyDown={(e) => {
              // Enter 直接送出（備註等單行輸入皆適用），每月記帳不必移滑鼠按儲存
              if (
                e.key === "Enter" &&
                e.target.tagName === "INPUT" &&
                !e.nativeEvent.isComposing
              ) {
                e.preventDefault();
                handleSave();
              }
            }}
          >
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
              <FF
                label="負債(選填)"
                type="number"
                value={formData.liabilities}
                onChange={(v) => setFormData((p) => ({ ...p, liabilities: v }))}
              />
              <div className="form-field">
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
                    v={mask(`NT$ ${fmtN(formPreview.prevAssets)}`)}
                  />
                  <PRow
                    l="投資資產"
                    v={mask(`NT$ ${fmtN(formPreview.investedAssets)}`)}
                  />
                  <PRow
                    l="推估報酬"
                    v={mask(`NT$ ${fmtD(formPreview.netGain)}`)}
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
        <div
          className={`tab-enter ${animTab === "overview" ? "" : "no-anim"}`}
        >
          {gapWarning && (
            <div className="stale-banner si si-0" role="status">
              <AlertTriangle size={15} />
              <span>
                資料已 {gapWarning} 個月未更新（最新 {latest?.month}
                ），以下所有數據截至該月。
              </span>
              <button
                className="btn-ghost"
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                  window.scrollTo({
                    top: 0,
                    behavior: REDUCED_MOTION ? "auto" : "smooth",
                  });
                }}
              >
                立即補登
              </button>
            </div>
          )}
          {backupDue && (
            <div className="stale-banner si si-0" role="status">
              <Save size={15} />
              <span>
                {backupDue.never
                  ? "尚未下載過 JSON 完整備份——雲端不等於備份，手上留一份才安全。"
                  : `距上次完整備份已 ${backupDue.days} 天，建議更新一份。`}
              </span>
              <button className="btn-ghost" onClick={downloadBackup}>
                立即備份
              </button>
              <button
                className="btn-ghost"
                style={{ marginLeft: 0 }}
                onClick={() => {
                  try {
                    localStorage.setItem(
                      "agwr_backup_snooze",
                      String(Date.now())
                    );
                  } catch {}
                  setBackupPromptTick((t) => t + 1);
                }}
              >
                30 天後再提醒
              </button>
            </div>
          )}
          <section className="hero-kpi si si-0">
            <div className="hero-label">當前總資產</div>
            <div className="hero-value mono">
              <AnimV
                value={stats.totalAssets}
                fmt={(v) =>
                  privacy ? "NT$ ＊＊＊＊＊" : `NT$ ${fmtN(Math.round(v))}`
                }
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
                  fmt={(v) =>
                    privacy ? "＊＊＊" : `${v >= 0 ? "+" : ""}${fmtS(v)}`
                  }
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
                  fmt={(v) =>
                    privacy ? "＊＊＊" : `${v >= 0 ? "+" : ""}${fmtS(v)}`
                  }
                />{" "}
                YTD
              </span>
              <span className="hero-sep">|</span>
              <span className="hero-date">截至 {stats.lastMonth}</span>
              {stats.liabilities > 0 && (
                <>
                  <span className="hero-sep">|</span>
                  <span className="hero-date">
                    負債 {mask(fmtS(stats.liabilities))}｜淨值{" "}
                    {mask(fmtS(stats.netWorth))}
                  </span>
                </>
              )}
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
                <AnimV
                  value={stats.latestNetGain}
                  fmt={(v) => (privacy ? "＊＊＊" : fmtS(v))}
                />
              </div>
            </div>
            <div className="kpi-item">
              <div className="kpi-label">現金資產</div>
              <div className="kpi-value mono" style={{ color: T.emerald }}>
                <AnimV
                  value={stats.cashAssets}
                  fmt={(v) => (privacy ? "＊＊＊＊" : fmtS(v))}
                />
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
                <AnimV
                  value={stats.investedAssets}
                  fmt={(v) => (privacy ? "＊＊＊＊" : fmtS(v))}
                />
              </div>
              <div className="kpi-sub">
                {privacy ? "＊＊＊" : fmtD(stats.investedMonthlyChange)} 本月
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
                ATH{" "}
                <AnimV
                  value={stats.ath}
                  fmt={(v) => (privacy ? "＊＊＊" : fmtS(v))}
                />
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
              <div className="kpi-label">年化報酬（TWR）</div>
              <div
                className="kpi-value mono"
                style={{
                  color: twrStats.ann >= 0 ? T.positive : T.negative,
                }}
              >
                <AnimV value={twrStats.ann} fmt={(v) => fmtP(v)} />
              </div>
              <div className="kpi-sub">
                累計 {fmtP(twrStats.cum)}｜{stats.totalMonths} 個月
              </div>
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
                        fmt={(v) =>
                          privacy ? "＊＊＊" : `${v >= 0 ? "+" : ""}${fmtS(v)}`
                        }
                      />
                    </span>
                  </div>
                  <div className="annual-rows">
                    <ARow
                      l="淨增值"
                      v={mask(
                        `${yr.wealthNetGain >= 0 ? "+" : ""}${fmtS(
                          yr.wealthNetGain
                        )}`
                      )}
                    />
                    <ARow
                      l="外部淨投入"
                      v={mask(
                        `${yr.totalNetInflow >= 0 ? "+" : ""}${fmtS(
                          yr.totalNetInflow
                        )}`
                      )}
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
                <MaskedNumInput
                  privacy={privacy}
                  value={goalInput}
                  placeholder="目標金額"
                  ariaLabel="目標金額"
                  onChange={(v) => {
                    setGoalInput(v);
                    setGoalValue(Number(v) || 0);
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
                      差 {mask(fmtS(goalStats.remaining))}
                    </span>
                  </div>
                  <div className="goal-rows">
                    <PRow
                      l="近6月均增"
                      v={mask(fmtS(goalStats.avgMonthlyGrowth))}
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
                <span
                  className="dist-count"
                  title={
                    pd.length !== basisPd.length
                      ? `已排除 ${pd.length - basisPd.length} 個未更新月份`
                      : undefined
                  }
                >
                  {basisPd.length} 月
                </span>
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
        <div
          className={`tab-enter ${animTab === "analysis" ? "" : "no-anim"}`}
        >
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
                    { key: "twr", label: "累積報酬" },
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
                      content={
                        <CTip
                          mode="return"
                          onHover={setHoveredMonth}
                          privacy={privacy}
                        />
                      }
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
                      tickFormatter={(v) =>
                        privacy ? "•" : `${(v / 1e4).toFixed(0)}萬`
                      }
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
                        <CTip
                          mode="composite"
                          onHover={setHoveredMonth}
                          privacy={privacy}
                        />
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
                ) : chartType === "twr" ? (
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="tG" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor={T.purple}
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor={T.purple}
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
                      unit="%"
                    />
                    <Tooltip
                      content={
                        <CTip
                          mode="twr"
                          onHover={setHoveredMonth}
                          privacy={privacy}
                        />
                      }
                      cursor={<ChartCursor height={340} />}
                    />
                    <ReferenceLine y={0} stroke={T.border} />
                    <Area
                      type="monotone"
                      dataKey="cumulativeTwrRate"
                      stroke={T.purple}
                      fill="url(#tG)"
                      strokeWidth={2.5}
                      dot={false}
                    />
                  </AreaChart>
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
                      tickFormatter={(v) =>
                        privacy ? "•" : `${(v / 1e4).toFixed(0)}萬`
                      }
                    />
                    <Tooltip
                      content={
                        <CTip
                          mode={chartType}
                          onHover={setHoveredMonth}
                          privacy={privacy}
                        />
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
                    {chartType === "assets" && hasLiab && (
                      <Area
                        type="monotone"
                        dataKey="netWorth"
                        stroke={T.purple}
                        fill="none"
                        strokeWidth={2}
                        strokeDasharray="5 3"
                        dot={false}
                      />
                    )}
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
                  總資產{" "}
                  <b className="mono">{mask(fmtS(hoveredData.totalAssets))}</b>
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
                    {mask(fmtS(hoveredData.netGain))}
                  </b>
                </span>
                <span className="hover-kpi-item">
                  現金{" "}
                  <b className="mono">{mask(fmtS(hoveredData.cashAssets))}</b>
                </span>
              </div>
            )}
          </section>
          <section className="card si si-1">
            <div className="chart-header">
              <div>
                <h3 className="card-title">
                  <TrendingUp size={18} className="icon-gold" />
                  成長貢獻分解
                </h3>
                <p className="card-desc">
                  總資產＝起始資產＋累計投入＋累計報酬，看清成長來自存錢還是市場
                </p>
              </div>
              {contribData && (
                <div className="contrib-stats mono">
                  投入{" "}
                  <b style={{ color: T.cyan }}>
                    {mask(fmtS(contribData.totalInflow))}
                  </b>
                  {contribData.growth > 0 &&
                    !privacy &&
                    ` (${(
                      (contribData.totalInflow / contribData.growth) *
                      100
                    ).toFixed(0)}%)`}
                  ｜報酬{" "}
                  <b
                    style={{
                      color:
                        contribData.totalGain >= 0 ? T.positive : T.negative,
                    }}
                  >
                    {mask(fmtS(contribData.totalGain))}
                  </b>
                  {contribData.growth > 0 &&
                    !privacy &&
                    ` (${(
                      (contribData.totalGain / contribData.growth) *
                      100
                    ).toFixed(0)}%)`}
                </div>
              )}
            </div>
            {contribData ? (
              <>
                <div className="chart-wrap">
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={contribData.rows}>
                      <defs>
                        <linearGradient id="ciG" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="5%"
                            stopColor={T.cyan}
                            stopOpacity={0.35}
                          />
                          <stop
                            offset="95%"
                            stopColor={T.cyan}
                            stopOpacity={0.08}
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
                        tickFormatter={(v) =>
                          privacy ? "•" : `${(v / 1e4).toFixed(0)}萬`
                        }
                      />
                      <Tooltip
                        content={<ContribTip privacy={privacy} />}
                        cursor={<ChartCursor height={300} />}
                      />
                      <Area
                        type="monotone"
                        dataKey="base"
                        name="起始資產"
                        stackId="c"
                        stroke="none"
                        fill={
                          isDark
                            ? "rgba(255,255,255,0.08)"
                            : "rgba(28,28,30,0.08)"
                        }
                      />
                      <Area
                        type="monotone"
                        dataKey="cumInflow"
                        name="累計投入"
                        stackId="c"
                        stroke={T.cyan}
                        strokeWidth={1.5}
                        fill="url(#ciG)"
                      />
                      <Line
                        type="monotone"
                        dataKey="total"
                        name="總資產"
                        stroke={T.gold}
                        strokeWidth={2.5}
                        dot={false}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div className="contrib-legend">
                  <span>
                    <i
                      style={{
                        background: isDark
                          ? "rgba(255,255,255,0.2)"
                          : "rgba(28,28,30,0.2)",
                      }}
                    />
                    起始資產
                  </span>
                  <span>
                    <i style={{ background: T.cyan }} />
                    累計投入
                  </span>
                  <span>
                    <i style={{ background: T.gold }} />
                    總資產（與堆疊頂的落差＝累計報酬）
                  </span>
                </div>
              </>
            ) : (
              <div className="preview-empty">至少需要 2 個月資料</div>
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
                <Activity size={18} className="icon-gold" />
                回撤分析
              </h3>
              <div className="dist-header">
                <div>
                  <span
                    className="dist-rate mono"
                    style={{ color: T.negative }}
                  >
                    {fmtPP(stats.maxDrawdown)}
                  </span>
                  <span className="dist-label">最大回撤</span>
                </div>
                <span className="dist-count">{pd.length} 月</span>
              </div>
              <div style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={pd}>
                    <defs>
                      <linearGradient id="ddG" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor={T.negative}
                          stopOpacity={0}
                        />
                        <stop
                          offset="95%"
                          stopColor={T.negative}
                          stopOpacity={0.25}
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
                      minTickGap={24}
                      interval="preserveStartEnd"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: T.textTertiary, fontSize: 10 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: T.textTertiary, fontSize: 10 }}
                      unit="%"
                    />
                    <Tooltip
                      content={<CTip mode="drawdown" privacy={privacy} />}
                      cursor={<ChartCursor height={180} />}
                    />
                    <ReferenceLine y={0} stroke={T.border} />
                    <Area
                      type="monotone"
                      dataKey="drawdown"
                      stroke={T.negative}
                      fill="url(#ddG)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>
          <section className="card si si-2">
            <h3 className="card-title">
              <CalendarDays size={18} className="icon-gold" />
              月報酬熱力圖
            </h3>
            <p className="card-desc">
              綠＝正報酬、紅＝負報酬，越深幅度越大；斜線＝該月未更新總資產。點擊任一格查看明細。
            </p>
            <div className="heatmap-wrap">
              <div className="heatmap-grid">
                <div />
                {Array.from({ length: 12 }, (_, i) => (
                  <div key={`h${i}`} className="hm-head mono">
                    {i + 1}月
                  </div>
                ))}
                {heatmapYears.map((y) => (
                  <React.Fragment key={y.year}>
                    <div className="hm-year mono">{y.year}</div>
                    {Array.from({ length: 12 }, (_, i) => {
                      const r = y.months[i + 1];
                      if (!r)
                        return (
                          <div
                            key={`${y.year}-${i}`}
                            className="hm-cell hm-empty"
                          />
                        );
                      const flat =
                        Number(r.prevAssets) !== 0 &&
                        Number(r.totalAssets) === Number(r.prevAssets);
                      const alpha =
                        Math.min(Math.abs(r.returnRate) / 6, 1) * 0.6 + 0.15;
                      return (
                        <div
                          key={`${y.year}-${i}`}
                          className={`hm-cell mono ${flat ? "hm-flat" : ""} ${
                            hmSel === r.month ? "hm-selected" : ""
                          }`}
                          role="button"
                          tabIndex={0}
                          aria-pressed={hmSel === r.month}
                          onClick={() =>
                            setHmSel((s) => (s === r.month ? null : r.month))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setHmSel((s) =>
                                s === r.month ? null : r.month
                              );
                            }
                          }}
                          style={
                            flat
                              ? undefined
                              : {
                                  background: hexA(
                                    r.returnRate >= 0
                                      ? T.positive
                                      : T.negative,
                                    alpha
                                  ),
                                  color: alpha > 0.45 ? "#fff" : T.text,
                                }
                          }
                          title={`${r.month}　${fmtP(r.returnRate)}${
                            flat ? "（未更新）" : ""
                          }`}
                        >
                          {flat
                            ? "—"
                            : `${
                                r.returnRate >= 0 ? "+" : ""
                              }${r.returnRate.toFixed(1)}`}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
            {hmSelData && (
              <div className="hover-kpi-strip" style={{ marginTop: 12 }}>
                <span className="hover-kpi-label mono">{hmSelData.month}</span>
                <span className="hover-kpi-item">
                  報酬{" "}
                  <b
                    className="mono"
                    style={{
                      color:
                        hmSelData.returnRate >= 0 ? T.positive : T.negative,
                    }}
                  >
                    {fmtP(hmSelData.returnRate)}
                  </b>
                </span>
                <span className="hover-kpi-item">
                  總資產{" "}
                  <b className="mono">{mask(fmtS(hmSelData.totalAssets))}</b>
                </span>
                <span className="hover-kpi-item">
                  淨增值{" "}
                  <b
                    className="mono"
                    style={{
                      color: hmSelData.netGain >= 0 ? T.positive : T.negative,
                    }}
                  >
                    {mask(fmtS(hmSelData.netGain))}
                  </b>
                </span>
                <span className="hover-kpi-item">
                  現金 <b className="mono">{mask(fmtS(hmSelData.cashAssets))}</b>
                </span>
                {Number(hmSelData.prevAssets) !== 0 &&
                  Number(hmSelData.totalAssets) ===
                    Number(hmSelData.prevAssets) && (
                    <span
                      className="hover-kpi-item"
                      style={{ color: T.textTertiary }}
                    >
                      （該月未更新）
                    </span>
                  )}
                <button
                  className="toast-close"
                  onClick={() => setHmSel(null)}
                  aria-label="關閉月份明細"
                  style={{ marginLeft: "auto" }}
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </section>
        </div>
      )}

      {activeTab === "records" && (
        <div
          className={`tab-enter ${animTab === "records" ? "" : "no-anim"}`}
        >
          <section className="card si si-0">
            <div className="table-header">
              <h3 className="card-title">每月明細</h3>
              <div className="table-controls">
                <div className="search-box">
                  <Search size={14} color={T.textTertiary} />
                  <input
                    className="search-input"
                    placeholder="搜尋..."
                    aria-label="搜尋月份或備註"
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
                    {hasLiab && <th className="th-r">負債</th>}
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
                        <td className="td-r mono">
                          {mask(fmtN(row.totalAssets))}
                        </td>
                        <td className="td-r mono">
                          {mask(fmtN(row.cashAssets))}
                        </td>
                        <td className="td-r mono">
                          {mask(fmtN(row.investedAssets))}
                        </td>
                        <td
                          className="td-r mono"
                          style={{
                            color: row.netIn > 0 ? T.positive : T.textTertiary,
                          }}
                        >
                          {row.netIn > 0 ? mask(fmtN(row.netIn)) : "—"}
                        </td>
                        <td
                          className="td-r mono"
                          style={{
                            color: row.netOut > 0 ? T.negative : T.textTertiary,
                          }}
                        >
                          {row.netOut > 0 ? mask(fmtN(row.netOut)) : "—"}
                        </td>
                        {hasLiab && (
                          <td
                            className="td-r mono"
                            style={{ color: T.textTertiary }}
                          >
                            {row.liabilities > 0
                              ? mask(fmtN(row.liabilities))
                              : "—"}
                          </td>
                        )}
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
                              title="編輯"
                              aria-label={`編輯 ${row.month}`}
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              className="icon-btn"
                              onClick={() => handleDel(row.month)}
                              title="刪除"
                              aria-label={`刪除 ${row.month}`}
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
                      <td colSpan={hasLiab ? 10 : 9} className="empty-cell">
                        查無資料
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* 手機版卡片視圖：≤768px 隱藏表格、改用卡片，與資產配置分頁行為一致 */}
            <div className="rec-mobile-list">
              {tableData.map((row) => (
                <div className="rec-mobile-card" key={`m-${row.month}`}>
                  <div className="rec-mobile-head">
                    <span className="mono rec-mobile-month">{row.month}</span>
                    <span
                      className={`return-chip ${
                        row.returnRate >= 0 ? "pos" : "neg"
                      }`}
                    >
                      {fmtP(row.returnRate)}
                    </span>
                  </div>
                  <div className="rec-mobile-grid">
                    <div className="rec-mobile-field">
                      <span className="rec-mobile-label">總資產</span>
                      <span className="rec-mobile-value mono">
                        {mask(fmtN(row.totalAssets))}
                      </span>
                    </div>
                    <div className="rec-mobile-field">
                      <span className="rec-mobile-label">投資</span>
                      <span className="rec-mobile-value mono">
                        {mask(fmtN(row.investedAssets))}
                      </span>
                    </div>
                    <div className="rec-mobile-field">
                      <span className="rec-mobile-label">現金</span>
                      <span className="rec-mobile-value mono">
                        {mask(fmtN(row.cashAssets))}
                      </span>
                    </div>
                    <div className="rec-mobile-field">
                      <span className="rec-mobile-label">淨投入</span>
                      <span
                        className="rec-mobile-value mono"
                        style={{
                          color: row.netIn > 0 ? T.positive : T.textTertiary,
                        }}
                      >
                        {row.netIn > 0 ? mask(fmtN(row.netIn)) : "—"}
                      </span>
                    </div>
                    <div className="rec-mobile-field">
                      <span className="rec-mobile-label">淨提領</span>
                      <span
                        className="rec-mobile-value mono"
                        style={{
                          color: row.netOut > 0 ? T.negative : T.textTertiary,
                        }}
                      >
                        {row.netOut > 0 ? mask(fmtN(row.netOut)) : "—"}
                      </span>
                    </div>
                    {hasLiab && (
                      <div className="rec-mobile-field">
                        <span className="rec-mobile-label">負債</span>
                        <span className="rec-mobile-value mono">
                          {row.liabilities > 0
                            ? mask(fmtN(row.liabilities))
                            : "—"}
                        </span>
                      </div>
                    )}
                  </div>
                  {row.note && row.note !== "歷史資料導入" && (
                    <div className="rec-mobile-note">{row.note}</div>
                  )}
                  <div className="rec-mobile-actions">
                    <button
                      className="icon-btn"
                      onClick={() => handleEdit(row)}
                      title="編輯"
                      aria-label={`編輯 ${row.month}`}
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      className="icon-btn"
                      onClick={() => handleDel(row.month)}
                      title="刪除"
                      aria-label={`刪除 ${row.month}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
              {!tableData.length && (
                <div className="empty-cell">查無資料</div>
              )}
            </div>
          </section>
        </div>
      )}

      {activeTab === "scenario" && (
        <div
          className={`tab-enter ${animTab === "scenario" ? "" : "no-anim"}`}
        >
          <section className="card si si-0">
            <div className="chart-header">
              <div>
                <h3 className="card-title">
                  <Crosshair size={18} className="icon-gold" />
                  情境模擬
                </h3>
                <p className="card-desc">
                  Monte Carlo 隨機模擬 500 條路徑，取 P10／P50／P90 呈現三種情境
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
                <option value={60}>60M（5年）</option>
                <option value={120}>120M（10年）</option>
                <option value={180}>180M（15年）</option>
                <option value={240}>240M（20年）</option>
              </select>
            </div>
            <div className="assumption-bar si si-1">
              <Zap size={13} />
              <span>
                統計基礎：近 {scenarioDefaults.sampleMonths} 個月
                {scenarioDefaults.excludedMonths > 0
                  ? `（已排除 ${scenarioDefaults.excludedMonths} 個未更新月份）`
                  : ""}
                ｜月報酬 μ {scenarioDefaults.avgReturn.toFixed(1)}%（年化{" "}
                {annualizePct(scenarioDefaults.avgReturn).toFixed(1)}%）・σ{" "}
                {scenarioDefaults.sigma.toFixed(1)}%｜月均投入{" "}
                {mask(`NT$ ${fmtN(Math.round(scenarioDefaults.avgInflow))}`)}
                {scenarioDefaults.excludedFlowMonths > 0
                  ? `（已剔除 ${scenarioDefaults.excludedFlowMonths} 個大額單月）`
                  : ""}
                ・年增{" "}
                {scenarioDefaults.inflowGrowthEstimated
                  ? `${scenarioDefaults.inflowGrowth.toFixed(1)}%`
                  : "0%（資料未滿 24 個月）"}
                ｜樂觀＝P90、保守＝P10（非固定報酬率外推）
              </span>
            </div>
            {scenarioMonths >= 60 && fireMuWarn && (
              <div
                className="alert alert-warn si si-1"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <span style={{ flex: 1 }}>
                  目前 μ {fireMuWarn.mu.toFixed(1)}%（年化約{" "}
                  {fireMuWarn.annual.toFixed(0)}%）拉到 {scenarioMonths / 12}{" "}
                  年外推會過度樂觀，建議改用長期合理值。
                </span>
                <button
                  className="btn-ghost"
                  style={{ padding: "6px 12px", fontSize: 12, flexShrink: 0 }}
                  onClick={() => setScenarioRate(0.6)}
                >
                  套用長期建議值 0.6%
                </button>
              </div>
            )}
            <div className="scenario-controls si si-1">
              <div className="slider-group">
                <label className="slider-label">
                  <SlidersHorizontal size={13} />
                  月均報酬假設 μ{" "}
                  <span className="mono slider-val">
                    {scenarioRate === null ? (
                      <>
                        自動{" "}
                        <span className="slider-auto-hint">
                          ({scenarioDefaults.avgReturn.toFixed(1)}%・年化{" "}
                          {annualizePct(scenarioDefaults.avgReturn).toFixed(1)}
                          %)
                        </span>
                      </>
                    ) : (
                      <>
                        {scenarioRate.toFixed(1)}%{" "}
                        <span className="slider-auto-hint">
                          (年化 {annualizePct(scenarioRate).toFixed(1)}%)
                        </span>
                      </>
                    )}
                  </span>
                </label>
                <input
                  type="range"
                  className="range-input"
                  min={-5}
                  max={10}
                  step={0.1}
                  aria-label="月均報酬假設（%）"
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
                  月波動假設 σ{" "}
                  <span className="mono slider-val">
                    {scenarioSigma === null ? (
                      <>
                        自動{" "}
                        <span className="slider-auto-hint">
                          ({scenarioDefaults.sigma.toFixed(1)}%)
                        </span>
                      </>
                    ) : (
                      `${scenarioSigma.toFixed(1)}%`
                    )}
                  </span>
                </label>
                <input
                  type="range"
                  className="range-input"
                  min={0}
                  max={15}
                  step={0.1}
                  aria-label="月波動假設 σ（%）"
                  value={scenarioSigma ?? (scenarioDefaults.sigma || 0)}
                  onChange={(e) => setScenarioSigma(Number(e.target.value))}
                />
                {scenarioSigma !== null && (
                  <button
                    className="btn-reset-sm"
                    onClick={() => setScenarioSigma(null)}
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
                          ({mask(`NT$ ${fmtN(Math.round(scenarioDefaults.avgInflow))}`)})
                        </span>
                      </>
                    ) : (
                      mask(`NT$ ${fmtN(Math.round(scenarioInflow))}`)
                    )}
                  </span>
                </label>
                <input
                  type="range"
                  className="range-input"
                  min={-100000}
                  max={300000}
                  step={5000}
                  aria-label="月均投入（可負值代表淨提領）"
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
              <div className="slider-group">
                <label className="slider-label">
                  <SlidersHorizontal size={13} />
                  投入年增率{" "}
                  <span className="mono slider-val">
                    {scenarioInflowGrowth === null ? (
                      <>
                        自動{" "}
                        <span className="slider-auto-hint">
                          (
                          {scenarioDefaults.inflowGrowthEstimated
                            ? `${scenarioDefaults.inflowGrowth.toFixed(1)}%`
                            : "0%・資料未滿 24 個月"}
                          )
                        </span>
                      </>
                    ) : (
                      `${scenarioInflowGrowth.toFixed(1)}%／年`
                    )}
                  </span>
                </label>
                <input
                  type="range"
                  className="range-input"
                  min={0}
                  max={10}
                  step={0.5}
                  aria-label="投入年增率（%，模擬薪資成長）"
                  value={scenarioInflowGrowth ?? scenarioDefaults.inflowGrowth}
                  onChange={(e) =>
                    setScenarioInflowGrowth(Number(e.target.value))
                  }
                />
                {scenarioInflowGrowth !== null && (
                  <button
                    className="btn-reset-sm"
                    onClick={() => setScenarioInflowGrowth(null)}
                  >
                    重置
                  </button>
                )}
              </div>
            </div>
            <div
              className="si si-2"
              style={{
                background: T.surfaceInset,
                border: `1px solid ${T.border}`,
                borderRadius: 12,
                padding: "14px 16px",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: T.textSecondary,
                  }}
                >
                  一次性事件（正＝入金：信貸、獎金／負＝支出：頭期款）
                </span>
                <button
                  className="btn-reset-sm"
                  style={{ marginLeft: "auto" }}
                  disabled={scenarioEvents.length >= 5}
                  onClick={() =>
                    setScenarioEvents((p) =>
                      p.length >= 5
                        ? p
                        : [...p, { id: generateId(), month: "12", amount: "" }]
                    )
                  }
                >
                  ＋ 新增事件
                </button>
              </div>
              {scenarioEvents.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    marginTop: 10,
                  }}
                >
                  {scenarioEvents.map((ev) => (
                    <div
                      key={ev.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <span style={{ fontSize: 12, color: T.textTertiary }}>
                        第
                      </span>
                      <input
                        className="field-input mono"
                        type="number"
                        min="1"
                        max="600"
                        style={{ width: 76, padding: "6px 10px" }}
                        value={ev.month}
                        aria-label="事件發生於第幾個月"
                        onChange={(e) =>
                          setScenarioEvents((p) =>
                            p.map((x) =>
                              x.id === ev.id
                                ? { ...x, month: e.target.value }
                                : x
                            )
                          )
                        }
                      />
                      <span style={{ fontSize: 12, color: T.textTertiary }}>
                        個月
                        {latest && Number(ev.month) >= 1
                          ? `（${addMonths(
                              latest.month,
                              Math.round(Number(ev.month))
                            )}）`
                          : ""}
                        ，金額
                      </span>
                      <input
                        className="field-input mono"
                        type="number"
                        placeholder="+入金 / -支出"
                        style={{ width: 150, padding: "6px 10px" }}
                        value={ev.amount}
                        aria-label="事件金額，正為入金、負為支出"
                        onChange={(e) =>
                          setScenarioEvents((p) =>
                            p.map((x) =>
                              x.id === ev.id
                                ? { ...x, amount: e.target.value }
                                : x
                            )
                          )
                        }
                      />
                      {Number(ev.amount) ? (
                        <span
                          className="mono"
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color:
                              Number(ev.amount) >= 0 ? T.positive : T.negative,
                          }}
                        >
                          {Number(ev.amount) >= 0 ? "入金 " : "支出 "}
                          {mask(fmtS(Math.abs(Number(ev.amount))))}
                        </span>
                      ) : null}
                      <button
                        className="icon-btn"
                        title="移除事件"
                        aria-label="移除此事件"
                        onClick={() =>
                          setScenarioEvents((p) =>
                            p.filter((x) => x.id !== ev.id)
                          )
                        }
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  <div style={{ fontSize: 11, color: T.textTertiary }}>
                    事件同時套用到下方情境模擬與 FIRE
                    推算。貸款入金後記得把「月均投入」滑桿調低對應的月還款額。
                  </div>
                </div>
              )}
            </div>
            <div className="scenario-summary si si-2">
              {scenarios.map((s) => {
                const delta = s.finalValue - stats.totalAssets;
                const pct =
                  stats.totalAssets > 0 ? (delta / stats.totalAssets) * 100 : 0;
                // 顏色在 render 時取當前主題，切換深淺色即時生效
                const scColor = {
                  bull: T.positive,
                  base: T.gold,
                  bear: T.negative,
                }[s.key];
                const reach = scenarioGoalReach ? scenarioGoalReach[s.key] : null;
                return (
                  <div
                    key={s.key}
                    className="scenario-sum-card"
                    style={{ borderTopColor: scColor }}
                  >
                    <div className="sc-sum-label" style={{ color: scColor }}>
                      {s.label}
                    </div>
                    <div className="sc-sum-value mono">
                      NT${" "}
                      <AnimV
                        value={s.finalValue}
                        fmt={(v) => (privacy ? "＊＊＊＊＊" : fmtS(v))}
                      />
                    </div>
                    <div
                      className="sc-sum-delta mono"
                      style={{ color: delta >= 0 ? T.positive : T.negative }}
                    >
                      <AnimV
                        value={delta}
                        fmt={(v) =>
                          privacy ? "＊＊＊" : `${v >= 0 ? "+" : ""}${fmtS(v)}`
                        }
                      />{" "}
                      (
                      <AnimV
                        value={pct}
                        fmt={(v) => `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`}
                      />
                      )
                    </div>
                    <div className="sc-sum-period">
                      {scenarioMonths >= 60
                        ? `${scenarioMonths / 12} 年後`
                        : `${scenarioMonths} 個月後`}
                    </div>
                    {goalValue > 0 && latest && reach !== null && (
                      <div className="sc-sum-goal">
                        {reach === 0
                          ? "已達標 ✦"
                          : reach > 0
                          ? `達標於 ${addMonths(
                              latest.month,
                              reach
                            )}（${reach} 個月後）`
                          : "模擬期間內未達標"}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {goalValue > 0 && goalProb && (
              <div className="assumption-bar si si-2">
                <Target size={13} />
                <span>
                  依目前假設，
                  {scenarioMonths >= 60
                    ? `${scenarioMonths / 12} 年`
                    : `${scenarioMonths} 個月`}
                  內達成目標的機率約{" "}
                  <b className="mono">{goalProb.pct.toFixed(0)}%</b>（
                  {goalProb.total} 條模擬路徑中 {goalProb.hit} 條曾達標）
                </span>
              </div>
            )}
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
                    dataKey="label"
                    minTickGap={24}
                    interval="preserveStartEnd"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: T.textTertiary, fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: T.textTertiary, fontSize: 11 }}
                    tickFormatter={(v) =>
                      privacy ? "•" : `${(v / 1e4).toFixed(0)}萬`
                    }
                  />
                  <Tooltip
                    content={<ScTip privacy={privacy} />}
                    cursor={<ChartCursor height={360} />}
                  />
                  <Area
                    type="monotone"
                    dataKey="bull"
                    name="樂觀 P90"
                    stroke={T.positive}
                    fill="url(#bG)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="base"
                    name="基準 P50"
                    stroke={T.gold}
                    fill="url(#bsG)"
                    strokeWidth={2.5}
                    dot={false}
                    strokeDasharray="6 3"
                  />
                  <Area
                    type="monotone"
                    dataKey="bear"
                    name="保守 P10"
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
                  {goalValue > 0 && (
                    <ReferenceLine
                      y={goalValue}
                      stroke={T.gold}
                      strokeDasharray="6 3"
                      label={{
                        value: "目標",
                        fill: T.gold,
                        fontSize: 11,
                      }}
                    />
                  )}
                  {latest &&
                    activeEvents
                      .filter((ev) => ev.month <= scenarioMonths)
                      .map((ev, i) => (
                        <ReferenceLine
                          key={`ev-${i}`}
                          x={fmtMS(addMonths(latest.month, ev.month))}
                          stroke={ev.amount >= 0 ? T.positive : T.negative}
                          strokeDasharray="4 3"
                          label={{
                            value: mask(
                              `${ev.amount >= 0 ? "+" : "-"}${fmtS(
                                Math.abs(ev.amount)
                              )}`
                            ),
                            fill: ev.amount >= 0 ? T.positive : T.negative,
                            fontSize: 10,
                          }}
                        />
                      ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="scenario-note">
              <AlertTriangle size={14} />
              <span>
                模擬以歷史月報酬的平均與波動做常態分布抽樣（Monte
                Carlo），P90／P10 代表 500 條路徑中前後 10%
                的結果，僅供參考，不構成投資建議。
              </span>
            </div>
          </section>
          <section className="card si si-4">
            <div className="chart-header" style={{ marginBottom: 2 }}>
              <div>
                <h3 className="card-title">
                  <Banknote size={18} className="icon-gold" />
                  財務自由（FIRE）
                </h3>
                <p className="card-desc">
                  自由數字＝（年支出 − 退休後年收）×{" "}
                  {Number.isInteger(100 / fireSwr)
                    ? 100 / fireSwr
                    : (100 / fireSwr).toFixed(1)}
                  ；達標門檻隨每年 2% 通膨成長。沿用上方模擬假設（μ／σ／投入）推算至
                  50 年，有負債時以淨值計算。
                </p>
              </div>
              <div className="seg-group">
                {[
                  { v: 4, label: "4% 經典" },
                  { v: 3.5, label: "3.5%" },
                  { v: 3.25, label: "3.25% 保守" },
                ].map((o) => (
                  <button
                    key={o.v}
                    className={`seg-btn ${fireSwr === o.v ? "active" : ""}`}
                    onClick={() => setFireSwr(o.v)}
                    title={`提領率 ${o.v}%＝年支出 × ${(100 / o.v).toFixed(1)}`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div
                className="goal-input-wrap"
                style={{ flex: "0 1 calc(50% - 12px)", minWidth: 240 }}
              >
                <span className="goal-prefix mono">年支出 NT$</span>
                <MaskedNumInput
                  privacy={privacy}
                  value={fireInput}
                  placeholder="例如 600000"
                  ariaLabel="年支出"
                  onChange={(v) => {
                    setFireInput(v);
                    setFireExpense(Number(v) || 0);
                  }}
                />
              </div>
              <div className="seg-group">
                {[
                  { v: 6000000, label: "低 600萬" },
                  { v: 10000000, label: "中 1000萬" },
                  { v: 15000000, label: "高 1500萬" },
                ].map((o) => (
                  <button
                    key={o.v}
                    className={`seg-btn ${
                      fireExpense === o.v ? "active" : ""
                    }`}
                    onClick={() => {
                      setFireInput(String(o.v));
                      setFireExpense(o.v);
                    }}
                    title={`年支出 NT$ ${fmtN(o.v)}（月支出約 ${fmtS(
                      o.v / 12
                    )}）`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
            {fireStats && fireMuWarn && (
              <div
                className="alert alert-warn"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <span style={{ flex: 1 }}>
                  模擬使用的月報酬 μ {fireMuWarn.mu.toFixed(1)}%（年化約{" "}
                  {fireMuWarn.annual.toFixed(0)}
                  %）高於長期市場合理水準，長期外推會過度樂觀。
                </span>
                <button
                  className="btn-ghost"
                  style={{ padding: "6px 12px", fontSize: 12, flexShrink: 0 }}
                  onClick={() => setScenarioRate(0.6)}
                >
                  套用長期建議值 0.6%
                </button>
              </div>
            )}
            <div className="fire-grid" style={{ marginTop: 0 }}>
              <div>
                <div className="goal-input-wrap">
                  <span className="goal-prefix mono">退休後年收 NT$</span>
                  <MaskedNumInput
                    privacy={privacy}
                    value={firePassiveInput}
                    placeholder="分紅、退休金等（選填）"
                    ariaLabel="退休後年收入（退休後仍持續的被動收入）"
                    onChange={(v) => {
                      setFirePassiveInput(v);
                      setFirePassive(Number(v) || 0);
                    }}
                  />
                </div>
                {fireStats ? (
                  <div className="goal-body">
                    {fireStats.covered && (
                      <div className="new-high-badge">
                        退休後年收已覆蓋年支出，無需依賴投資組合 ✦
                      </div>
                    )}
                    {fireStats.passive > 0 && !fireStats.covered && (
                      <PRow
                        l="組合需支應年支出"
                        v={mask(`NT$ ${fmtN(fireStats.netExpense)}`)}
                      />
                    )}
                    <PRow
                      l={`自由數字（×${
                        Number.isInteger(fireStats.multiple)
                          ? fireStats.multiple
                          : fireStats.multiple.toFixed(1)
                      }）`}
                      v={mask(`NT$ ${fmtN(fireStats.fireNumber)}`)}
                      c={T.gold}
                    />
                    {fireStats.usesNetWorth && (
                      <PRow
                        l="計算基準（淨值）"
                        v={mask(`NT$ ${fmtN(fireStats.base)}`)}
                      />
                    )}
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${fireStats.progress}%`,
                          background:
                            fireStats.progress >= 100 ? T.positive : T.gold,
                        }}
                      />
                    </div>
                    <div className="goal-meta">
                      <span
                        className="mono"
                        style={{ color: T.gold, fontWeight: 700 }}
                      >
                        {fireStats.progress.toFixed(1)}%
                      </span>
                      <span style={{ color: T.textTertiary }}>
                        差{" "}
                        {mask(
                          fmtS(Math.max(0, fireStats.fireNumber - fireStats.base))
                        )}
                      </span>
                    </div>
                    <div className="goal-rows">
                      <PRow
                        l="10 年內達成機率"
                        v={`${fireStats.prob10y.toFixed(0)}%`}
                        c={fireStats.prob10y >= 50 ? T.positive : T.amber}
                      />
                      <PRow
                        l="20 年內達成機率"
                        v={`${fireStats.prob20y.toFixed(0)}%`}
                        c={fireStats.prob20y >= 50 ? T.positive : T.amber}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="preview-empty">
                    輸入年支出，推算財務自由時程
                  </div>
                )}
              </div>
              <div className="fire-reach">
                {fireStats && latest ? (
                  <>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: T.textTertiary,
                        marginBottom: 10,
                      }}
                    >
                      三情境達成時間
                    </div>
                    {!fireStats.covered && (
                      <div
                        style={{
                          position: "relative",
                          height: 32,
                          marginBottom: 12,
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            fontSize: 9,
                            color: T.textTertiary,
                          }}
                        >
                          今
                        </span>
                        <span
                          style={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                            fontSize: 9,
                            color: T.textTertiary,
                          }}
                        >
                          50 年
                        </span>
                        <div
                          style={{
                            position: "absolute",
                            top: 16,
                            left: 0,
                            right: 0,
                            height: 4,
                            borderRadius: 999,
                            background: T.surfaceInset,
                            border: `1px solid ${T.border}`,
                          }}
                        />
                        {fireStats.reach.map((r) => {
                          const dotC = {
                            bull: T.positive,
                            base: T.gold,
                            bear: T.negative,
                          }[r.key];
                          const pos =
                            r.idx === 0
                              ? 0
                              : r.idx < 0
                              ? 100
                              : Math.min(100, (r.idx / 600) * 100);
                          return (
                            <span
                              key={r.key}
                              title={`${r.label}：${
                                r.idx < 0
                                  ? "超過 50 年"
                                  : r.idx === 0
                                  ? "已達成"
                                  : `約 ${(r.idx / 12).toFixed(1)} 年`
                              }`}
                              style={{
                                position: "absolute",
                                top: 12,
                                left: `${pos}%`,
                                transform: "translateX(-50%)",
                                width: 12,
                                height: 12,
                                borderRadius: "50%",
                                background: dotC,
                                border: `2px solid ${T.surface}`,
                                boxShadow: `0 0 0 1px ${T.border}`,
                                opacity: r.idx < 0 ? 0.35 : 1,
                              }}
                            />
                          );
                        })}
                      </div>
                    )}
                    {fireStats.reach.map((r) => {
                      const c = {
                        bull: T.positive,
                        base: T.gold,
                        bear: T.negative,
                      }[r.key];
                      let label;
                      if (r.idx === 0) label = "已達成 ✦";
                      else if (r.idx < 0) label = "超過 50 年（模擬上限）";
                      else {
                        const yy = Math.floor(r.idx / 12),
                          mm = r.idx % 12,
                          parts = [];
                        if (yy) parts.push(`${yy} 年`);
                        if (mm) parts.push(`${mm} 個月`);
                        label = `${parts.join(" ")}後（${addMonths(
                          latest.month,
                          r.idx
                        )}）`;
                      }
                      return (
                        <div key={r.key} className="a-row">
                          <span className="a-row-l">
                            <span
                              className="ct-dot"
                              style={{ background: c }}
                            />
                            {r.label}
                          </span>
                          <span className="a-row-v mono">{label}</span>
                        </div>
                      );
                    })}
                    {(() => {
                      const b = fireStats.reach.find((r) => r.key === "base");
                      if (!b || b.idx <= 0 || fireStats.covered) return null;
                      const factor = Math.pow(1.02, b.idx / 12);
                      return (
                        <div
                          style={{
                            marginTop: 12,
                            fontSize: 11,
                            color: T.textTertiary,
                            lineHeight: 1.7,
                          }}
                        >
                          基準情境抵達時，自由數字已隨 2% 通膨長成約{" "}
                          {mask(
                            `NT$ ${fmtN(
                              Math.round(fireStats.fireNumber * factor)
                            )}`
                          )}
                          （較今日 +{((factor - 1) * 100).toFixed(0)}
                          %）——達成時間已把這個成長算進去。
                        </div>
                      );
                    })()}
                  </>
                ) : (
                  <div className="preview-empty">—</div>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
      </ErrorBoundary>
      {/* 資產配置分頁：常駐掛載（display 切換），Firebase 同步不中斷 */}
      <div style={{ display: activeTab === "allocation" ? "block" : "none" }}>
        <ErrorBoundary>
          <AssetWarroomTab
            isDark={isDark}
            privacy={privacy}
            active={activeTab === "allocation"}
          />
        </ErrorBoundary>
      </div>
    </div>
  );
}

/* ═══════════ SUB-COMPONENTS ═══════════ */
/* 錯誤邊界：單一區塊（圖表等）出錯時顯示重試卡片，避免整頁白屏；
   resetKey 變動（切換分頁）時自動清除錯誤狀態重新渲染 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info);
  }
  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error)
      this.setState({ error: null });
  }
  render() {
    if (this.state.error)
      return (
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <AlertTriangle
            size={28}
            style={{ color: T.negative, marginBottom: 12 }}
          />
          <div style={{ fontWeight: 700, marginBottom: 6, color: T.text }}>
            此區塊發生錯誤
          </div>
          <div
            style={{ fontSize: 13, color: T.textSecondary, marginBottom: 16 }}
          >
            {String(
              (this.state.error && this.state.error.message) ||
                this.state.error
            )}
          </div>
          <button
            className="btn-ghost"
            onClick={() => this.setState({ error: null })}
            style={{ margin: "0 auto" }}
          >
            <RefreshCw size={14} />
            重試
          </button>
        </div>
      );
    return this.props.children;
  }
}
/* 隱私模式下可遮罩的數字輸入：有值時顯示＊＊＊＊＊，點擊暫時解鎖編輯、失焦恢復遮罩。
   目標金額與 FIRE 年支出跟總資產一樣敏感，不能在隱私模式下裸奔 */
function MaskedNumInput({ privacy, value, placeholder, ariaLabel, onChange }) {
  const [reveal, setReveal] = useState(false);
  useEffect(() => {
    if (!privacy) setReveal(false);
  }, [privacy]);
  if (privacy && !reveal && value !== "" && value != null) {
    return (
      <button
        type="button"
        className="goal-input mono goal-masked"
        onClick={() => setReveal(true)}
        title="隱私模式中，點擊以編輯"
        aria-label={`${ariaLabel}（已遮罩，點擊編輯）`}
      >
        ＊＊＊＊＊
      </button>
    );
  }
  return (
    <input
      className="goal-input mono"
      type="number"
      placeholder={placeholder}
      aria-label={ariaLabel}
      value={value}
      autoFocus={privacy && reveal}
      onChange={(e) => onChange(e.target.value)}
      onBlur={() => setReveal(false)}
    />
  );
}
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
      aria-sort={a ? (dir === "asc" ? "ascending" : "descending") : "none"}
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
function CTip({ active, payload, label, mode, onHover, privacy }) {
  const hasData = !!(active && payload && payload.length);
  // setState 必須放 useEffect：在 render 期間呼叫父層 setState 會觸發 React 警告
  useEffect(() => {
    if (onHover) onHover(hasData ? label : null);
  }, [hasData, label, onHover]);
  if (!hasData) return null;
  const mm = (s) => (privacy ? "＊＊＊＊＊" : s);
  const v = payload[0]?.value;
  let t, s;
  if (mode === "return") {
    t = fmtP(v);
    s = "月報酬率";
  } else if (mode === "invested") {
    t = mm(`NT$ ${fmtN(v)}`);
    s = "投資資產";
  } else if (mode === "composite") {
    t = mm(`NT$ ${fmtN(payload[0]?.value)}`);
    s = `報酬 ${payload[1] ? fmtP(payload[1].value) : ""}`;
  } else if (mode === "drawdown") {
    t = fmtPP(v);
    s = "距歷史高點";
  } else if (mode === "twr") {
    t = fmtP(v);
    s = "累積報酬（TWR）";
  } else {
    t = mm(`NT$ ${fmtN(v)}`);
    s = payload[1]
      ? `總資產｜淨值 ${mm(`NT$ ${fmtN(payload[1].value)}`)}`
      : "總資產";
  }
  return (
    <div className="chart-tooltip">
      <div className="ct-label mono">{label}</div>
      <div className="ct-value mono">{t}</div>
      <div className="ct-sub">{s}</div>
    </div>
  );
}
function ScTip({ active, payload, label, privacy }) {
  if (!active || !payload?.length) return null;
  const monthIdx = payload[0]?.payload?.month;
  return (
    <div className="chart-tooltip">
      <div className="ct-label mono">
        {label}
        {monthIdx != null ? `（第 ${monthIdx} 月）` : ""}
      </div>
      {payload.map((p, i) => (
        <div key={i} className="ct-row">
          <span
            className="ct-dot"
            style={{ background: p.color || p.stroke }}
          />
          <span style={{ minWidth: 64 }}>{p.name}</span>
          <span className="mono">
            {privacy ? "＊＊＊＊＊" : `NT$ ${fmtS(p.value)}`}
          </span>
        </div>
      ))}
    </div>
  );
}
function ContribTip({ active, payload, label, privacy }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  const mm = (v) => (privacy ? "＊＊＊＊＊" : fmtS(v));
  const rows = [
    { l: "起始資產", v: d.base, c: T.textTertiary },
    { l: "累計投入", v: d.cumInflow, c: T.cyan },
    { l: "累計報酬", v: d.cumGain, c: d.cumGain >= 0 ? T.positive : T.negative },
    { l: "總資產", v: d.total, c: T.gold },
  ];
  return (
    <div className="chart-tooltip">
      <div className="ct-label mono">{label}</div>
      {rows.map((r) => (
        <div key={r.l} className="ct-row">
          <span className="ct-dot" style={{ background: r.c }} />
          <span style={{ minWidth: 60 }}>{r.l}</span>
          <span className="mono">{mm(r.v)}</span>
        </div>
      ))}
    </div>
  );
}
function ConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "確認",
  secondaryLabel,
  onSecondary,
}) {
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
      <div className="modal">
        <div className="modal-icon">
          <AlertTriangle size={22} />
        </div>
        <div className="modal-title">{title}</div>
        <div className="modal-text">{message}</div>
        <div className="modal-actions">
          <button className="modal-cancel" onClick={onCancel}>
            取消
          </button>
          {secondaryLabel && onSecondary && (
            <button
              className="modal-secondary"
              onClick={() => {
                onSecondary();
                onCancel();
              }}
            >
              {secondaryLabel}
            </button>
          )}
          <button
            className="modal-confirm"
            autoFocus
            onClick={() => {
              onConfirm();
              onCancel();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
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

@media (prefers-reduced-motion: reduce){
  *,*::before,*::after{animation-duration:0.01ms!important;animation-iteration-count:1!important;transition-duration:0.01ms!important;scroll-behavior:auto!important}
}

.app-root{max-width:1400px;margin:0 auto;padding:24px 24px 80px}
@media(max-width:768px){.app-root{padding:16px 16px 64px}}

.toast-host{position:fixed;top:20px;right:20px;z-index:999;display:flex;flex-direction:column;gap:8px;align-items:flex-end;pointer-events:none}
.toast{pointer-events:auto;background:${T.surfaceAlt};color:${T.text};border:1px solid ${T.border};padding:12px 20px;border-radius:10px;display:flex;align-items:center;gap:8px;font-size:13px;font-weight:500;box-shadow:${T.shadow3};animation:staggerIn 0.3s ease-out}
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
.goal-masked{cursor:pointer;text-align:left;letter-spacing:0.1em;color:${T.textTertiary}}
.goal-masked:hover{color:${T.textSecondary}}
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

.rec-mobile-list{display:none;flex-direction:column;gap:10px}
.rec-mobile-card{background:${T.surfaceAlt};border:1px solid ${T.border};border-radius:12px;padding:14px}
.rec-mobile-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
.rec-mobile-month{font-weight:700;font-size:15px;color:${T.text}}
.rec-mobile-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 12px}
.rec-mobile-field{display:flex;flex-direction:column;gap:2px}
.rec-mobile-label{font-size:10px;color:${T.textTertiary};font-weight:700;letter-spacing:0.05em;text-transform:uppercase}
.rec-mobile-value{font-size:13px;font-weight:600;color:${T.text}}
.rec-mobile-note{margin-top:10px;font-size:12px;color:${T.textTertiary};line-height:1.5}
.rec-mobile-actions{display:flex;gap:6px;justify-content:flex-end;margin-top:10px;padding-top:10px;border-top:1px solid ${T.border}}
@media(max-width:768px){
  .table-scroll{display:none}
  .rec-mobile-list{display:flex}
}

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
.sc-sum-goal{font-size:11px;font-weight:600;margin-top:8px;padding-top:8px;border-top:1px dashed ${T.border};color:${T.textSecondary}}

.assumption-bar{display:flex;align-items:flex-start;gap:8px;padding:12px 16px;margin-bottom:14px;background:${T.goldLight};border:1px solid ${T.borderAccent};border-radius:10px;font-size:12px;color:${T.textSecondary};line-height:1.7}
.assumption-bar svg{flex-shrink:0;margin-top:3px;color:${T.gold}}

.stale-banner{display:flex;align-items:center;gap:10px;padding:12px 18px;margin-bottom:16px;background:rgba(138,106,46,0.08);border:1px solid rgba(138,106,46,0.25);border-radius:12px;font-size:13px;font-weight:500;color:${T.amber};flex-wrap:wrap}
.stale-banner svg{flex-shrink:0}
.stale-banner .btn-ghost{margin-left:auto;padding:6px 12px;font-size:12px}

.btn-undo{background:${T.goldLight};border:none;color:${T.gold};border-radius:6px;padding:5px 12px;cursor:pointer;font-size:12px;font-weight:700}
.btn-undo:hover{filter:brightness(1.15)}

.modal-overlay{position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,0.55);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:24px;animation:staggerIn 0.2s ease-out}
.modal{width:100%;max-width:400px;background:${T.surface};border:1px solid ${T.borderStrong};border-radius:16px;padding:28px;box-shadow:${T.shadow3};text-align:center}
.modal-icon{width:48px;height:48px;border-radius:999px;margin:0 auto 14px;display:flex;align-items:center;justify-content:center;background:${T.negativeLight};color:${T.negative}}
.modal-title{font-size:17px;font-weight:700;margin-bottom:6px;color:${T.text}}
.modal-text{font-size:13px;color:${T.textSecondary};line-height:1.6;margin-bottom:20px}
.modal-actions{display:flex;gap:10px}
.modal-actions button{flex:1;height:42px;border-radius:9px;border:none;cursor:pointer;font-size:13px;font-weight:700;transition:all 0.15s}
.modal-cancel{background:${T.surfaceAlt};color:${T.textSecondary};border:1px solid ${T.border}}
.modal-cancel:hover{color:${T.text}}
.modal-secondary{background:${T.goldLight};color:${T.gold};border:1px solid ${T.borderAccent}}
.modal-secondary:hover{filter:brightness(1.1)}
.modal-confirm{background:${T.negative};color:#fff}
.modal-confirm:hover{box-shadow:0 4px 14px rgba(0,0,0,0.25)}

.no-anim,.no-anim .si,.no-anim .stagger-in{animation:none!important}

.data-actions{display:flex;flex-direction:column;gap:8px}
.data-action{width:100%;justify-content:flex-start}
.data-hint{margin-left:auto;font-size:11px;color:${T.textTertiary};font-weight:500}

.contrib-stats{font-size:12px;color:${T.textSecondary};white-space:nowrap}
.contrib-stats b{font-weight:600}
.contrib-legend{display:flex;gap:16px;justify-content:center;margin-top:10px;font-size:11px;color:${T.textTertiary};flex-wrap:wrap}
.contrib-legend span{display:inline-flex;align-items:center;gap:5px}
.contrib-legend i{width:10px;height:10px;border-radius:3px;display:inline-block}

.fire-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:12px}
@media(max-width:768px){.fire-grid{grid-template-columns:1fr}}
.fire-reach{display:flex;flex-direction:column;gap:12px;justify-content:center}

.heatmap-wrap{overflow-x:auto;margin-top:12px}
.heatmap-grid{display:grid;grid-template-columns:44px repeat(12,minmax(44px,1fr));gap:4px;min-width:660px}
.hm-head{font-size:10px;color:${T.textTertiary};text-align:center;font-weight:600;padding:2px 0}
.hm-year{font-size:11px;color:${T.textSecondary};font-weight:600;display:flex;align-items:center}
.hm-cell{height:34px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:10px;border:1px solid ${T.border};color:${T.text}}
.hm-cell:not(.hm-empty){cursor:pointer}
.hm-cell.hm-selected{outline:2px solid ${T.gold};outline-offset:1px}
.hm-empty{border-style:dashed;opacity:0.35}
.hm-flat{color:${T.textTertiary};background:repeating-linear-gradient(45deg,transparent,transparent 4px,${T.border} 4px,${T.border} 5px)}

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


/* ═══════════════════════════════════════════════════════
   INTEGRATED TAB — 資產戰情室（資產配置分頁）
   與獨立版共用同一 Firebase 文件與 localStorage key，資料互通。
   CSS 以 .awr 命名空間隔離；主題/隱私由宿主 props 控制。
   ═══════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════
   CONSTANTS & CONFIG
   ═══════════════════════════════════════════════════════ */

const AW_STORAGE_KEY = "asset_warroom_pro_v104_currency_final";
const AW_CLOUD_DOC = { collection: "warrooms", doc: "shared_asset_warroom" };

// Firebase 與宿主共用 getFirebaseServices()（同一專案，不同文件）
const RechartsTooltip = Tooltip;

const DEFAULT_CATEGORY_ORDER = [
  "美股ETF",
  "美股",
  "基金",
  "台股",
  "現金",
  "緊急備用金",
  "虛擬貨幣",
  "其他",
];

const CATEGORY_COLORS = {
  美股ETF: "#4A7FA5",
  美股: "#6B5B8A",
  基金: "#8A6A2E",
  台股: "#2D6A4F",
  現金: "#52B788",
  緊急備用金: "#3D6E6B",
  虛擬貨幣: "#A63228",
  其他: "#A8A8AD",
};

/* 深色模式專用類別色票：淺色版的深藍系在深色背景上對比不足 */
const CATEGORY_COLORS_DARK = {
  美股ETF: "#3B82F6",
  美股: "#A78BFA",
  基金: "#FBBF24",
  台股: "#10B981",
  現金: "#38BDF8",
  緊急備用金: "#14B8A6",
  虛擬貨幣: "#EF4444",
  其他: "#8FA3BE",
};

const DEFAULT_COLOR = "#94A3B8";

/* 緊急備用金：算入總資產與資產分佈，但不參與目標配置——
   偏離度、再平衡建議、達標圖表、目標總占比都排除；
   其餘類別的占比對比一律以「可投資資產＝總資產−備用金」為分母 */
const EMERGENCY_CATEGORY = "緊急備用金";
function isEmergencyAsset(a) {
  return (a && a.category) === EMERGENCY_CATEGORY;
}

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
   AW_STYLES
   ═══════════════════════════════════════════════════════ */
const AW_STYLES = `

.awr {
  --c-bg:#F7F6F3; --c-surface:#FFFFFF; --c-surface-2:#F2F1EE; --c-surface-3:#EDECE9;
  --c-border:rgba(28,28,30,0.08); --c-border-2:rgba(28,28,30,0.14);
  --c-text:#1C1C1E; --c-text-2:#5C5C60; --c-text-3:#77777D;
  --c-accent:#1C1C1E; --c-accent-2:#5C5C60;
  --c-green:#2D6A4F; --c-green-dim:rgba(45,106,79,0.07);
  --c-red:#A63228; --c-red-dim:rgba(166,50,40,0.07);
  --c-yellow:#8A6A2E; --c-yellow-dim:rgba(138,106,46,0.08);
  --c-topbar-bg:rgba(255,255,255,0.88);
  --c-modal-overlay:rgba(28,28,30,0.35);
  --c-hero-total-bg:linear-gradient(160deg,#FFFFFF 0%,#FBFAF7 100%);
  --c-hero-total-border:rgba(28,28,30,0.14);
  --c-hero-total-shadow:0 0 0 1px rgba(28,28,30,0.05),0 8px 24px rgba(28,28,30,0.06);
  --c-hero-total-topline:linear-gradient(90deg,#1C1C1E 0%,#5C5C60 50%,transparent 100%);
  --c-hero-total-label:#77777D;
  --c-hero-total-value:#1C1C1E;
  --c-hero-total-sub:#77777D;
  --c-hero-total-mini-bg:#F2F1EE;
  --c-hero-total-mini-border:rgba(28,28,30,0.08);
  --c-hero-total-mini-label:#77777D;
  --c-hero-total-mini-value:#1C1C1E;
  --c-chart-grid:rgba(28,28,30,0.05); --c-row-hover:rgba(28,28,30,0.02);
  --c-cat-header-hover:rgba(28,28,30,0.02);
  --c-detail-bg:rgba(242,241,238,0.7); --c-empty-bg:rgba(242,241,238,0.8);
  --c-tooltip-bg:rgba(255,255,255,0.97); --c-tooltip-text:#1C1C1E;
  --c-tooltip-shadow:0 12px 32px rgba(28,28,30,0.1); --c-tooltip-border:rgba(28,28,30,0.08);
  --c-pie-center-text:#1C1C1E; --c-pie-center-sub:#77777D;
  --radius-sm:8px; --radius-md:12px; --radius-lg:16px; --radius-xl:16px;
  --shadow-sm:0 1px 0 rgba(28,28,30,0.06),0 1px 3px rgba(28,28,30,0.03); --shadow-md:0 0 0 1px rgba(28,28,30,0.06),0 4px 12px rgba(28,28,30,0.04);
  --shadow-lg:0 0 0 1px rgba(28,28,30,0.08),0 8px 24px rgba(28,28,30,0.06); --shadow-glow:0 0 0 rgba(0,0,0,0);
  --font:'DM Sans',-apple-system,'Segoe UI','Noto Sans TC',sans-serif;
  --mono:'DM Mono','SF Mono',Menlo,Consolas,monospace;
}

.awr.awr-dark {
  --c-bg:#0D1520; --c-surface:#131F2E; --c-surface-2:#1A2840; --c-surface-3:#0F1A28;
  --c-border:rgba(255,255,255,0.06); --c-border-2:rgba(255,255,255,0.12);
  --c-text:#E8EFF8; --c-text-2:#8FA3BE; --c-text-3:#6B7F9E;
  --c-accent:#3B82F6; --c-accent-2:#60A5FA;
  --c-green:#10B981; --c-green-dim:rgba(16,185,129,0.12);
  --c-red:#EF4444; --c-red-dim:rgba(239,68,68,0.12);
  --c-yellow:#FBBF24; --c-yellow-dim:rgba(251,191,36,0.1);
  --c-topbar-bg:rgba(13,21,32,0.88);
  --c-modal-overlay:rgba(0,0,0,0.6);
  --c-hero-total-bg:linear-gradient(160deg,#0F1A28 0%,#1A2840 55%,#14213A 100%);
  --c-hero-total-border:rgba(59,130,246,0.25);
  --c-hero-total-shadow:inset 0 1px 0 rgba(255,255,255,0.06),0 16px 40px rgba(0,0,0,0.3);
  --c-hero-total-topline:linear-gradient(90deg,transparent,rgba(59,130,246,0.4),rgba(96,165,250,0.6),rgba(59,130,246,0.4),transparent);
  --c-hero-total-label:rgba(255,255,255,0.5);
  --c-hero-total-value:#FFFFFF;
  --c-hero-total-sub:rgba(255,255,255,0.5);
  --c-hero-total-mini-bg:rgba(59,130,246,0.06);
  --c-hero-total-mini-border:rgba(255,255,255,0.08);
  --c-hero-total-mini-label:rgba(255,255,255,0.4);
  --c-hero-total-mini-value:rgba(255,255,255,0.9);
  --c-chart-grid:rgba(255,255,255,0.05); --c-row-hover:rgba(255,255,255,0.02);
  --c-cat-header-hover:rgba(255,255,255,0.02);
  --c-detail-bg:rgba(15,26,40,0.5); --c-empty-bg:rgba(15,26,40,0.4);
  --c-tooltip-bg:rgba(26,40,64,0.96); --c-tooltip-text:#E8EFF8;
  --c-tooltip-shadow:0 16px 40px rgba(0,0,0,0.5); --c-tooltip-border:rgba(255,255,255,0.12);
  --c-pie-center-text:#E8EFF8; --c-pie-center-sub:#6B7F9E;
  --shadow-sm:0 1px 3px rgba(0,0,0,0.3),0 1px 2px rgba(0,0,0,0.2); --shadow-md:0 4px 16px rgba(0,0,0,0.4),0 1px 4px rgba(0,0,0,0.3);
  --shadow-lg:0 12px 40px rgba(0,0,0,0.5),0 4px 12px rgba(0,0,0,0.3); --shadow-glow:0 0 0 rgba(0,0,0,0);
}

*{box-sizing:border-box;margin:0;padding:0;}
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

@media (prefers-reduced-motion: reduce){
  .awr *,.awr *::before,.awr *::after{animation-duration:0.01ms!important;animation-iteration-count:1!important;transition-duration:0.01ms!important;}
  .awr .animate-in{opacity:1;}
}

.app{padding-bottom:32px;color:var(--c-text);font-family:var(--font);}
.shell{max-width:100%;margin:0;padding:0;}

.topbar{position:sticky;top:0;z-index:100;background:var(--c-topbar-bg);backdrop-filter:blur(24px) saturate(180%);border-bottom:1px solid var(--c-border);}
.topbar-inner{max-width:1520px;margin:0 auto;padding:16px 24px;display:flex;align-items:center;justify-content:space-between;gap:16px;}
.brand{display:flex;align-items:center;gap:16px;}
.brand-badge{width:46px;height:46px;border-radius:14px;display:flex;align-items:center;justify-content:center;color:white;background:linear-gradient(135deg,var(--c-accent) 0%,var(--c-accent-2) 100%);box-shadow:0 6px 20px rgba(28,28,30,0.25),inset 0 1px 0 rgba(255,255,255,0.15);transition:transform 0.2s cubic-bezier(0.16,1,0.3,1),box-shadow 0.2s ease;cursor:pointer;flex-shrink:0;}
.brand-badge:hover{transform:scale(1.08) translateY(-1px);box-shadow:0 10px 28px rgba(28,28,30,0.38),inset 0 1px 0 rgba(255,255,255,0.2);}
.brand-title{font-size:22px;font-weight:800;letter-spacing:-0.04em;color:var(--c-text);}
.brand-title span{color:var(--c-accent);}
.brand-sub{margin-top:3px;font-size:10px;letter-spacing:0.2em;color:var(--c-text-3);font-weight:700;text-transform:uppercase;}
.top-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}

.aw-toolbar{display:flex;justify-content:flex-end;align-items:center;gap:8px;flex-wrap:wrap;padding:16px 0 4px;}
.status-pill{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:7px 14px;background:var(--c-surface-2);border:1px solid var(--c-border);font-size:11px;font-weight:700;}
.status-pill.saved{color:var(--c-green);} .status-pill.saving{color:var(--c-accent);} .status-pill.error{color:var(--c-red);}

.btn{border:1px solid var(--c-border-2);background:var(--c-surface-2);border-radius:var(--radius-sm);padding:9px 16px;color:var(--c-text-2);cursor:pointer;transition:all 0.2s cubic-bezier(0.16,1,0.3,1);display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:700;white-space:nowrap;}
.btn:hover{background:var(--c-surface-3);color:var(--c-text);transform:translateY(-1px);box-shadow:var(--shadow-sm);}
.btn.primary{color:white;background:linear-gradient(135deg,var(--c-accent),var(--c-accent-2));border-color:transparent;font-weight:700;box-shadow:0 4px 16px rgba(28,28,30,0.22);}
.btn.primary:hover{box-shadow:0 8px 24px rgba(28,28,30,0.30);}
.btn.icon{width:40px;height:40px;justify-content:center;padding:0;}
.btn:disabled{opacity:0.4;cursor:not-allowed;transform:none;}

.hero{padding:12px 0 0;}
.hero-card{position:relative;overflow:hidden;border-radius:var(--radius-xl);background:var(--c-surface);border:1px solid var(--c-border-2);box-shadow:var(--shadow-lg),var(--shadow-glow);padding:40px;}
.hero-card::before{content:"";position:absolute;top:-120px;right:-120px;width:400px;height:400px;background:radial-gradient(circle,rgba(28,28,30,0.05),transparent 65%);pointer-events:none;}
.hero-card::after{content:"";position:absolute;inset:0;border-radius:var(--radius-xl);background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");pointer-events:none;opacity:0.4;mix-blend-mode:multiply;}
.awr-dark .hero-card::after{mix-blend-mode:overlay;opacity:0.7;}
.hero-grid{display:grid;grid-template-columns:1fr 1.15fr;gap:32px;align-items:stretch;position:relative;z-index:1;}
.hero-title{font-size:62px;line-height:0.92;letter-spacing:-0.06em;font-weight:900;color:var(--c-text);}
.hero-desc{margin-top:16px;max-width:480px;color:var(--c-text-3);font-size:15px;line-height:1.7;font-weight:500;}
.hero-tags{margin-top:32px;display:flex;gap:10px;flex-wrap:wrap;}
.hero-tag{display:inline-flex;align-items:center;gap:7px;padding:8px 14px;border-radius:999px;background:var(--c-surface-2);border:1px solid var(--c-border);font-size:12px;font-weight:700;color:var(--c-text-2);}
.hero-right{display:flex;flex-direction:column;justify-content:space-between;gap:16px;}

.hero-total-box{border-radius:var(--radius-lg);padding:28px 32px;background:var(--c-hero-total-bg);border:1px solid var(--c-hero-total-border);box-shadow:var(--c-hero-total-shadow);flex:1;display:flex;flex-direction:column;justify-content:center;position:relative;overflow:hidden;}
.hero-total-box::before{content:"";position:absolute;top:0;left:0;right:0;height:3px;background:var(--c-hero-total-topline);pointer-events:none;}
.hero-total-label{font-size:11px;font-weight:700;letter-spacing:0.15em;color:var(--c-hero-total-label);margin-bottom:12px;text-transform:uppercase;}
.hero-total-value{font-size:48px;line-height:1;letter-spacing:-0.03em;font-weight:700;color:var(--c-hero-total-value);font-family:var(--mono);}
.hero-total-sub{margin-top:16px;font-size:13px;color:var(--c-hero-total-sub);font-weight:500;line-height:1.6;}
.hero-total-mini-grid{margin-top:16px;display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.hero-total-mini{padding:12px 14px;border-radius:var(--radius-sm);background:var(--c-hero-total-mini-bg);border:1px solid var(--c-hero-total-mini-border);}
.hero-total-mini-label{font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:var(--c-hero-total-mini-label);font-weight:700;}
.hero-total-mini-value{margin-top:6px;font-size:22px;font-weight:700;color:var(--c-hero-total-mini-value);letter-spacing:-0.03em;font-family:var(--mono);}

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
.aw-search-box{flex:1;min-width:220px;position:relative;}
.aw-search-box input{width:100%;height:44px;border-radius:var(--radius-sm);border:1px solid var(--c-border-2);background:var(--c-surface-2);padding:0 14px 0 42px;outline:none;font-size:13px;font-weight:600;color:var(--c-text);transition:border-color 0.2s;}
.aw-search-box input:focus{border-color:var(--c-accent);}
.aw-search-box input::placeholder{color:var(--c-text-3);}
.aw-search-box svg{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--c-text-3);}
.select-box select{height:44px;min-width:160px;border-radius:var(--radius-sm);border:1px solid var(--c-border-2);background:var(--c-surface-2);padding:0 14px;outline:none;font-size:13px;font-weight:700;color:var(--c-text-2);cursor:pointer;}
.fx-box{display:inline-flex;align-items:center;gap:8px;}
.fx-box input{height:44px;width:88px;border-radius:var(--radius-sm);border:1px solid var(--c-border-2);background:var(--c-surface-2);padding:0 12px;outline:none;font-size:14px;font-weight:700;font-family:var(--mono);color:var(--c-text);text-align:right;}
.fx-box input:focus{border-color:var(--c-accent);}
.fx-label{display:inline-flex;align-items:center;gap:7px;color:var(--c-text-2);font-size:13px;font-weight:800;}
.fx-status{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:700;padding:5px 10px;border-radius:999px;}
.fx-status.loading{color:var(--c-accent);background:rgba(59,130,246,0.1);}
.fx-status.success{color:var(--c-green);background:var(--c-green-dim);}
.fx-status.error{color:var(--c-red);background:var(--c-red-dim);}
.category-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;}
.category-chip{border:1px solid var(--c-border-2);background:var(--c-surface-2);border-radius:999px;padding:8px 14px;cursor:pointer;display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:700;color:var(--c-text-2);transition:all 0.2s ease;}
.category-chip:hover{border-color:var(--c-text-3);color:var(--c-text);}
.category-chip.active{background:var(--c-accent);color:white;border-color:var(--c-accent);box-shadow:0 4px 12px rgba(59,130,246,0.25);}
.category-dot{width:8px;height:8px;border-radius:999px;flex-shrink:0;}

.kpi-grid{margin-top:24px;display:grid;grid-template-columns:1.3fr 1fr 1fr 1fr;gap:16px;}
.aw-card{border-radius:var(--radius-lg);background:var(--c-surface);border:1px solid var(--c-border);transition:all 0.25s cubic-bezier(0.16,1,0.3,1);}
.kpi-card{padding:24px;min-height:150px;position:relative;overflow:hidden;}
.kpi-card.featured{background:var(--c-surface);border:1px solid var(--c-border-2);box-shadow:var(--shadow-md);border-left:3px solid var(--c-accent);}
.kpi-card.featured .aw-kpi-label{color:var(--c-text-3);}
.kpi-card.featured .aw-kpi-value{color:var(--c-accent)!important;}
.kpi-card.featured .aw-kpi-sub{color:var(--c-text-3);}
.kpi-card:hover{border-color:var(--c-border-2);transform:translateY(-2px);box-shadow:var(--shadow-md);}
.aw-kpi-label{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:12px;color:var(--c-text-3);font-weight:700;margin-bottom:16px;}
.aw-kpi-value{font-size:34px;line-height:1;letter-spacing:-0.02em;font-weight:700;color:var(--c-text);font-family:var(--mono);}
.aw-kpi-value.positive{color:var(--c-green);} .aw-kpi-value.negative{color:var(--c-red);}
.aw-kpi-sub{margin-top:10px;font-size:12px;color:var(--c-text-3);font-weight:600;}
.inline-tooltip{position:relative;display:inline-flex;align-items:center;cursor:help;}
.inline-tooltip-bubble{position:absolute;top:calc(100% + 8px);left:0;width:220px;padding:10px 12px;border-radius:var(--radius-sm);background:var(--c-surface-3);color:var(--c-text-2);font-size:12px;line-height:1.6;box-shadow:var(--shadow-lg);opacity:0;pointer-events:none;transition:opacity 0.2s;z-index:10;border:1px solid var(--c-border-2);}
.inline-tooltip:hover .inline-tooltip-bubble{opacity:1;}
.kpi-badge{display:inline-flex;align-items:center;padding:4px 10px;border-radius:999px;font-size:10px;font-weight:800;white-space:nowrap;letter-spacing:0.03em;}

.section-toggle-bar{display:flex;align-items:center;gap:12px;padding:14px 0 10px;cursor:pointer;user-select:none;}
.section-toggle-label{font-size:14px;font-weight:800;color:var(--c-text-2);letter-spacing:0.02em;text-transform:uppercase;flex:1;}
.section-toggle-line{flex:1;height:1px;background:var(--c-border-2);}

.analytics-grid{margin-top:16px;display:grid;grid-template-columns:1.1fr 1fr 1.05fr;gap:16px;}
.chart-card{padding:24px;min-height:460px;display:flex;flex-direction:column;}
.aw-card-title{display:flex;align-items:center;gap:9px;font-size:15px;font-weight:800;color:var(--c-text);margin-bottom:6px;}
.aw-card-desc{margin-bottom:18px;color:var(--c-text-3);font-size:13px;font-weight:500;line-height:1.6;}
.aw-chart-wrap{flex:1;min-height:290px;}
.legend-row{display:flex;justify-content:center;gap:18px;margin-top:16px;flex-wrap:wrap;}
.legend-item{display:inline-flex;align-items:center;gap:6px;font-size:11px;color:var(--c-text-3);font-weight:700;}
.legend-dot{width:8px;height:8px;border-radius:999px;}

.hint-list{flex:1;display:flex;flex-direction:column;gap:10px;overflow-y:auto;padding-right:4px;}
.hint-list::-webkit-scrollbar{width:4px;}
.hint-list::-webkit-scrollbar-track{background:transparent;}
.hint-list::-webkit-scrollbar-thumb{background:var(--c-surface-3);border-radius:4px;}
.hint{border-radius:var(--radius-md);overflow:hidden;display:flex;transition:all 0.2s ease;border:1px solid transparent;}
.hint:hover{transform:translateY(-1px);}
.hint.sell{background:linear-gradient(135deg,rgba(239,68,68,0.06),rgba(239,68,68,0.02));border-color:rgba(239,68,68,0.12);}
.hint.buy{background:linear-gradient(135deg,rgba(16,185,129,0.06),rgba(16,185,129,0.02));border-color:rgba(16,185,129,0.12);}
.hint-side{width:64px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.hint.sell .hint-side{color:var(--c-red);border-right:1px solid rgba(239,68,68,0.12);}
.hint.buy .hint-side{color:var(--c-green);border-right:1px solid rgba(16,185,129,0.12);}
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
.mini-btn.add{background:linear-gradient(135deg,var(--c-accent),var(--c-accent-2));color:white;box-shadow:0 4px 12px rgba(28,28,30,0.18);}
.mini-btn.add:hover{box-shadow:0 6px 18px rgba(28,28,30,0.28);}
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
.gap-badge.neutral{color:var(--c-text-3);background:var(--c-surface-3);}
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

.settings-title{display:flex;align-items:center;gap:8px;font-size:18px;font-weight:800;color:var(--c-text);margin-bottom:20px;}
.form-group+.form-group{margin-top:18px;}
.form-label{display:block;margin-bottom:8px;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:var(--c-text-3);font-weight:700;}
.form-input{width:100%;height:48px;border-radius:var(--radius-sm);border:1px solid var(--c-border-2);background:var(--c-surface-2);padding:0 14px;text-align:right;font-size:18px;font-family:var(--mono);font-weight:700;color:var(--c-text);outline:none;}
.form-input:focus{border-color:var(--c-accent);box-shadow:0 0 0 3px rgba(59,130,246,0.15);}
.settings-actions{display:flex;justify-content:flex-end;margin-top:24px;}
.settings-done{height:44px;border-radius:var(--radius-sm);border:none;padding:0 20px;background:linear-gradient(135deg,var(--c-accent),var(--c-accent-2));color:white;font-weight:700;cursor:pointer;box-shadow:0 4px 12px rgba(28,28,30,0.18);}

.onboard-modal{max-width:560px;animation:onboardIn 0.4s cubic-bezier(0.16,1,0.3,1);}
.onboard-badge{display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;background:var(--c-yellow-dim);border:1px solid rgba(138,106,46,0.15);color:var(--c-yellow);font-size:11px;font-weight:800;letter-spacing:0.08em;margin-bottom:20px;}
.onboard-title{font-size:26px;font-weight:900;letter-spacing:-0.03em;color:var(--c-text);margin-bottom:10px;}
.onboard-sub{font-size:14px;color:var(--c-text-3);line-height:1.7;margin-bottom:24px;}
.onboard-steps{display:flex;flex-direction:column;gap:12px;margin-bottom:24px;}
.onboard-step{display:flex;align-items:flex-start;gap:14px;padding:14px 16px;border-radius:var(--radius-md);background:var(--c-surface-2);border:1px solid var(--c-border);}
.onboard-step-num{width:28px;height:28px;border-radius:999px;display:flex;align-items:center;justify-content:center;background:var(--c-accent);color:white;font-size:12px;font-weight:800;flex-shrink:0;margin-top:1px;}
.onboard-step-body{flex:1;}
.onboard-step-title{font-size:14px;font-weight:800;color:var(--c-text);margin-bottom:3px;}
.onboard-step-desc{font-size:12px;color:var(--c-text-3);line-height:1.5;}
.onboard-cta{width:100%;height:52px;border-radius:var(--radius-md);border:none;cursor:pointer;font-size:15px;font-weight:800;color:white;background:linear-gradient(135deg,var(--c-accent),var(--c-accent-2));box-shadow:0 6px 20px rgba(28,28,30,0.25);transition:all 0.2s;}
.onboard-cta:hover{box-shadow:0 10px 28px rgba(28,28,30,0.35);transform:translateY(-1px);}

.toast-stack{position:fixed;bottom:28px;left:50%;transform:translateX(-50%);z-index:300;display:flex;flex-direction:column;gap:10px;pointer-events:none;}
.aw-toast{display:flex;align-items:center;gap:14px;padding:14px 18px;border-radius:var(--radius-lg);background:var(--c-text);color:var(--c-bg);box-shadow:0 12px 32px rgba(0,0,0,0.25);font-size:13px;font-weight:700;pointer-events:all;min-width:300px;animation:slideUp 0.3s cubic-bezier(0.16,1,0.3,1);}
.toast-undo-btn{background:rgba(255,255,255,0.18);border:none;color:inherit;border-radius:6px;padding:6px 12px;cursor:pointer;font-size:12px;font-weight:800;display:flex;align-items:center;gap:5px;transition:background 0.2s;white-space:nowrap;}
.toast-undo-btn:hover{background:rgba(255,255,255,0.28);}
.toast-bar{height:3px;background:rgba(255,255,255,0.25);border-radius:999px;overflow:hidden;flex:1;}
.toast-bar-fill{height:100%;background:rgba(255,255,255,0.6);border-radius:999px;}

.nudge-banner{margin-top:16px;border-radius:var(--radius-lg);padding:16px 20px;background:var(--c-yellow-dim);border:1px solid rgba(138,106,46,0.15);display:flex;align-items:center;gap:14px;}
.nudge-icon{width:36px;height:36px;border-radius:999px;display:flex;align-items:center;justify-content:center;background:rgba(138,106,46,0.12);color:var(--c-yellow);flex-shrink:0;}
.nudge-body{flex:1;}
.nudge-title{font-size:13px;font-weight:800;color:var(--c-yellow);margin-bottom:2px;}
.nudge-sub{font-size:12px;color:var(--c-text-3);line-height:1.5;}
.nudge-dismiss{background:transparent;border:none;color:var(--c-text-3);cursor:pointer;padding:4px;border-radius:4px;display:flex;transition:color 0.2s;}
.nudge-dismiss:hover{color:var(--c-text);}

.example-banner{margin-top:16px;border-radius:var(--radius-lg);padding:14px 20px;background:rgba(28,28,30,0.06);border:1px solid rgba(28,28,30,0.12);display:flex;align-items:center;gap:12px;}
.example-banner-text{flex:1;font-size:12px;color:var(--c-text-2);font-weight:600;line-height:1.5;}
.example-banner-text strong{color:var(--c-accent);font-weight:800;}

.insight-box{margin-bottom:16px;padding:16px 18px;border-radius:var(--radius-md);background:var(--c-surface-2);border:1px solid var(--c-border);}
.insight-label{font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:var(--c-text-3);font-weight:700;margin-bottom:8px;}
.insight-text{font-size:13px;line-height:1.8;color:var(--c-text-2);font-weight:500;}

.t-up{transform:none;} .t-down{transform:rotate(180deg);}

.mobile-add-sheet{display:none;}
#mobile-add-trigger{display:none;}
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
  .mobile-add-form-cta{height:52px;border-radius:var(--radius-md);border:none;cursor:pointer;font-size:15px;font-weight:800;color:white;background:linear-gradient(135deg,var(--c-accent),var(--c-accent-2));box-shadow:0 4px 16px rgba(28,28,30,0.22);}
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
    const raw = localStorage.getItem(AW_STORAGE_KEY);
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

/* 解析資產配置 CSV（與 exportCSV 同格式、欄位以標頭名對應），回傳資產陣列或 null */
function parseAssetsCSV(text) {
  const clean = String(text || "").replace(/^﻿/, "");
  const lines = clean.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return null;
  const parseLine = (line) => {
    const out = [];
    let cur = "",
      inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQ) {
        if (ch === '"') {
          if (line[i + 1] === '"') {
            cur += '"';
            i++;
          } else inQ = false;
        } else cur += ch;
      } else if (ch === '"') inQ = true;
      else if (ch === ",") {
        out.push(cur);
        cur = "";
      } else cur += ch;
    }
    out.push(cur);
    return out;
  };
  const header = parseLine(lines[0]).map((h) => h.trim());
  const iCat = header.indexOf("類別"),
    iName = header.indexOf("項目"),
    iCur = header.indexOf("輸入幣別"),
    iVal = header.indexOf("輸入市值"),
    iTgt = header.indexOf("目標占比");
  if (iCat === -1 || iName === -1 || iVal === -1) return null;
  const out = [];
  for (let i = 1; i < lines.length; i++) {
    const c = parseLine(lines[i]);
    const name = String(c[iName] || "").trim();
    if (!name) continue;
    const category = String(c[iCat] || "其他").trim() || "其他";
    const currency =
      iCur >= 0 && String(c[iCur] || "").trim().toUpperCase() === "USD"
        ? "USD"
        : "TWD";
    const value = Math.max(0, Number(c[iVal]) || 0);
    const tgtRaw =
      iTgt >= 0 ? String(c[iTgt] || "").replace("%", "").trim() : "0";
    const targetPercent =
      category === EMERGENCY_CATEGORY
        ? 0
        : Math.min(100, Math.max(0, Number(tgtRaw) || 0));
    out.push({
      id: generateId(),
      category,
      name,
      value,
      currency,
      targetPercent,
    });
  }
  return out.length ? out : null;
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
  if (category.includes("備用")) return <Shield {...props} />;
  if (category.includes("現金")) return <Banknote {...props} />;
  if (category.includes("虛擬")) return <Bitcoin {...props} />;
  if (category.includes("房產")) return <LandPlot {...props} />;
  return <LayoutDashboard {...props} />;
}

function KPIValue({ label, value, subValue, isPositive, tooltip, badge }) {
  return (
    <>
      <div className="aw-kpi-label">
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
        className={`aw-kpi-value ${
          isPositive === undefined ? "" : isPositive ? "positive" : "negative"
        }`}
      >
        {value}
      </div>
      {subValue && <div className="aw-kpi-sub">{subValue}</div>}
    </>
  );
}

/* ── Undo Toast Component ── */
function UndoToast({ toasts, onUndo, onDismiss }) {
  return (
    <div className="toast-stack" aria-live="polite" aria-atomic="false">
      {toasts.map((t) => (
        <div key={t.id} className="aw-toast">
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

/* ═══════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════ */

/* ── Settings Modal Component (proper Esc via useEffect) ── */
function SettingsModal({ refData, setRefData, onClose }) {
  // 編輯中保留原始字串（可清空、可輸入小數點），失焦或關閉時才寫回數字。
  // 原本 onChange 直接 Number(v)||0：欄位一清空立刻變 0、小數點會被吃掉。
  const [draft, setDraft] = useState({
    lastMonthValue: String(refData.lastMonthValue ?? ""),
    startYearValue: String(refData.startYearValue ?? ""),
    usdToTwd: String(refData.usdToTwd ?? ""),
  });
  const commit = useCallback(() => {
    setRefData((p) => {
      const lm = Number(draft.lastMonthValue);
      const sy = Number(draft.startYearValue);
      const fx = Number(draft.usdToTwd);
      return {
        ...p,
        lastMonthValue:
          draft.lastMonthValue.trim() !== "" && Number.isFinite(lm) && lm >= 0
            ? lm
            : p.lastMonthValue,
        startYearValue:
          draft.startYearValue.trim() !== "" && Number.isFinite(sy) && sy >= 0
            ? sy
            : p.startYearValue,
        // 匯率必須 > 0：0 會把所有美元資產換算成 0，空白或無效輸入一律保留原值
        usdToTwd:
          draft.usdToTwd.trim() !== "" && Number.isFinite(fx) && fx > 0
            ? fx
            : p.usdToTwd,
      };
    });
  }, [draft, setRefData]);
  const commitAndClose = useCallback(() => {
    commit();
    onClose();
  }, [commit, onClose]);
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") commitAndClose();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [commitAndClose]);
  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="基準與匯率設定"
      onClick={(e) => {
        if (e.target === e.currentTarget) commitAndClose();
      }}
    >
      <div className="modal" style={{ maxWidth: 440, textAlign: "left" }}>
        <div className="settings-title">
          <Settings size={18} />
          基準與匯率設定
        </div>
        <div className="form-group">
          <label className="form-label">上個月底總資產（台幣）</label>
          <input
            className="form-input"
            type="number"
            value={draft.lastMonthValue}
            onChange={(e) =>
              setDraft((p) => ({ ...p, lastMonthValue: e.target.value }))
            }
            onBlur={commit}
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
            value={draft.startYearValue}
            onChange={(e) =>
              setDraft((p) => ({ ...p, startYearValue: e.target.value }))
            }
            onBlur={commit}
          />
        </div>
        <div className="form-group">
          <label className="form-label">美元匯率 USD/TWD</label>
          <input
            className="form-input"
            type="number"
            step="0.01"
            value={draft.usdToTwd}
            onChange={(e) =>
              setDraft((p) => ({ ...p, usdToTwd: e.target.value }))
            }
            onBlur={commit}
          />
        </div>
        <div className="settings-actions">
          <button className="settings-done" autoFocus onClick={commitAndClose}>
            完成設定
          </button>
        </div>
      </div>
    </div>
  );
}

function AssetWarroomTab({ isDark, privacy, active }) {
  // 只在首次 render 解析 localStorage（原本每次 render 都重新 JSON.parse 整份資料）
  const initialDataRef = useRef(null);
  if (initialDataRef.current === null)
    initialDataRef.current = loadFromLocalStorage();
  const initialData = initialDataRef.current;

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
  const [fxDraft, setFxDraft] = useState(null); // 匯率輸入編輯中的原始字串；null＝未編輯，顯示 refData 值
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
  const [showAnalytics, setShowAnalytics] = useState(true);

  // ── NEW STATE ──
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
  // 本月尚未快照提醒：自動快照只在每月 1 號開啟頁面才觸發，錯過就靠這條補
  const currentMonthKey = getMonthKey(new Date());
  const hasThisMonthSnap = useMemo(
    () => snapshots.some((s) => s.monthKey === currentMonthKey),
    [snapshots, currentMonthKey]
  );
  const [snapNudgeDismissedKey, setSnapNudgeDismissedKey] = useState(() => {
    try {
      return localStorage.getItem("asset_warroom_snap_nudge") || "";
    } catch {
      return "";
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
  // 圖表重掛計數：本分頁常駐掛載在 display:none 容器裡，recharts 的
  // ResponsiveContainer 在隱藏時量到 0×0 後不會自己恢復，每次切入分頁
  // bump epoch 強制重掛圖表容器，讓它在可見狀態下重新量測
  const [chartEpoch, setChartEpoch] = useState(0);
  const prevActiveRef = useRef(active);
  useEffect(() => {
    if (active && !prevActiveRef.current) setChartEpoch((e) => e + 1);
    prevActiveRef.current = active;
  }, [active]);


  // 主題與隱私模式由宿主 App 以 props 傳入
  const privacyMode = privacy;
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
    const { auth, db } = getFirebaseServices();
    let unsubDoc = null;
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          await ensureAnonSignIn(auth);
          return;
        }
        const docRef = doc(db, AW_CLOUD_DOC.collection, AW_CLOUD_DOC.doc);
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
                localStorage.setItem(AW_STORAGE_KEY, JSON.stringify(incoming));
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
    // localStorage 立即寫入：宿主的「JSON 完整備份」直接讀這份，
    // 不能有 debounce 空窗（原本延遲 500ms 才寫，備份可能拿到慢半拍的資料）；雲端寫入才防抖
    const pureData = buildCloudPureData();
    const pureJson = JSON.stringify(pureData);
    try {
      localStorage.setItem(AW_STORAGE_KEY, pureJson);
    } catch {}
    setSaveStatus("saving");
    const timer = setTimeout(async () => {
      try {
        if (skipNextCloudSaveRef.current) {
          skipNextCloudSaveRef.current = false;
          lastSyncedJsonRef.current = pureJson;
          setSaveStatus("saved");
          return;
        }
        if (isCloudReady && cloudHydratedRef.current) {
          const { db } = getFirebaseServices();
          const docRef = doc(db, AW_CLOUD_DOC.collection, AW_CLOUD_DOC.doc);
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
    // 合併預設清單：既有使用者的 categoryOrder 沒有新類別（如緊急備用金）時，下拉選單也選得到
    return Array.from(
      new Set([...categoryOrder, ...DEFAULT_CATEGORY_ORDER, ...dynamic])
    );
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

  // 緊急備用金合計與可投資資產：目標相關計算一律用 investableValue 當分母
  const emergencyValue = useMemo(
    () =>
      assets
        .filter(isEmergencyAsset)
        .reduce((s, i) => s + convertAssetToTwd(i, refData.usdToTwd), 0),
    [assets, refData.usdToTwd]
  );
  const investableValue = totalValue - emergencyValue;

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
        .filter((cat) => cat !== EMERGENCY_CATEGORY)
        .map((cat) => {
          const d = globalCategoryStats[cat];
          if (!d) return null;
          const currentPct =
            investableValue > 0
              ? parseFloat(
                  ((d.currentVal / investableValue) * 100).toFixed(1)
                )
              : 0;
          return {
            name: cat,
            目前占比: currentPct,
            目標占比: d.targetPct,
            gapPct: parseFloat((currentPct - d.targetPct).toFixed(1)),
          };
        })
        .filter(Boolean),
    [globalCategoryStats, investableValue, orderedCategories]
  );

  const deviationScore = useMemo(() => {
    if (investableValue === 0) return "0.0";
    let totalDiff = 0;
    Object.entries(globalCategoryStats).forEach(([cat, d]) => {
      if (cat === EMERGENCY_CATEGORY) return;
      totalDiff += Math.abs(
        (d.currentVal / investableValue) * 100 - d.targetPct
      );
    });
    return (totalDiff / 2).toFixed(1);
  }, [globalCategoryStats, investableValue]);

  const rebalanceHints = useMemo(() => {
    const hints = [];
    assets.forEach((a) => {
      if (isEmergencyAsset(a)) return;
      const targetPct = Number(a.targetPercent) || 0;
      // 未設定目標的資產不進建議清單，避免整排「賣出」噪音
      if (targetPct <= 0) return;
      const twdVal = convertAssetToTwd(a, refData.usdToTwd);
      const curPct =
        investableValue > 0 ? (twdVal / investableValue) * 100 : 0;
      const diffPct = curPct - targetPct;
      const targetVal = investableValue * (targetPct / 100);
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
  }, [assets, investableValue, refData.usdToTwd]);

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
    const pool = assets.filter((i) => !isEmergencyAsset(i));
    if (!pool.length || investableValue === 0) return null;
    return pool
      .map((i) => {
        const t = convertAssetToTwd(i, refData.usdToTwd);
        return {
          ...i,
          diffAbs: Math.abs((t / investableValue) * 100 - i.targetPercent),
        };
      })
      .sort((a, b) => b.diffAbs - a.diffAbs)[0];
  }, [assets, investableValue, refData.usdToTwd]);

  const totalTargetPercent = useMemo(
    () =>
      assets.reduce(
        (s, i) => s + (isEmergencyAsset(i) ? 0 : Number(i.targetPercent) || 0),
        0
      ),
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
        if (i.category === EMERGENCY_CATEGORY) return;
        totalDiff += Math.abs(i.percent - (targetMap[i.category] || 0));
      });
      Object.keys(targetMap).forEach((cat) => {
        if (cat === EMERGENCY_CATEGORY) return;
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
      "確定要重置成預設資料嗎？目前資料、排序與快照都會被清除，執行前會自動下載一份當前備份。",
      async () => {
        downloadPreActionBackup("reset");
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
        localStorage.removeItem(AW_STORAGE_KEY);
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
          const { db } = getFirebaseServices();
          await setDoc(doc(db, AW_CLOUD_DOC.collection, AW_CLOUD_DOC.doc), {
            ...r,
            updatedAt: new Date().toISOString(),
          });
          lastSyncedJsonRef.current = JSON.stringify(r);
        } catch {}
      }
    );
  };

  // ── 匯入資產配置 CSV：與匯出同格式，完全取代現有清單（同還原備份的語意）──
  const awCsvInputRef = useRef(null);
  const handleImportAssetsCSV = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      const rows = parseAssetsCSV(String(reader.result || ""));
      if (!rows) {
        openConfirm(
          "匯入失敗",
          "CSV 格式無法解析，請使用與「匯出 CSV」相同的欄位格式（類別、項目、輸入幣別、輸入市值、目標占比）。",
          () => {}
        );
        return;
      }
      openConfirm(
        "匯入 CSV",
        `將以 CSV 內容（${rows.length} 項）完全取代現有 ${assets.length} 項資產，執行前會自動下載一份當前備份。確定匯入？`,
        () => {
          downloadPreActionBackup("aw-csv-import");
          setAssets(rows);
        }
      );
    };
    reader.readAsText(file, "utf-8");
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
      // 緊急備用金不參與配置，目標一律 0
      targetPercent:
        newAsset.category === EMERGENCY_CATEGORY
          ? 0
          : Math.min(100, Math.max(0, Number(newAsset.targetPercent) || 0)),
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
    openConfirm(
      "清空紀錄",
      "確定要清空所有月度紀錄嗎？執行前會自動下載一份當前備份。",
      () => {
        downloadPreActionBackup("clear-snapshots");
        setSnapshots([]);
      }
    );


  const openConfirm = useCallback(
    (title, message, onConfirm) =>
      setConfirmDialog({ title, message, onConfirm }),
    []
  );
  const closeConfirm = useCallback(() => setConfirmDialog(null), []);

  const manualMode = sortMode === "manual";

  /* ─ Chart theme ─ */
  const chartTooltipStyle = {
    borderRadius: "8px",
    border: `1px solid ${
      isDark ? "rgba(255,255,255,0.12)" : "rgba(28,28,30,0.1)"
    }`,
    boxShadow: isDark
      ? "0 12px 32px rgba(0,0,0,0.5)"
      : "0 12px 32px rgba(28,28,30,0.1)",
    fontSize: "12px",
    fontFamily: "'DM Mono',monospace",
    background: isDark ? "rgba(26,40,64,0.96)" : "rgba(255,255,255,0.97)",
    color: isDark ? "#E8EFF8" : "#1C1C1E",
    backdropFilter: "blur(12px)",
  };
  const chartGridColor = isDark
    ? "rgba(255,255,255,0.05)"
    : "rgba(28,28,30,0.05)";
  const chartCursorFill = isDark
    ? "rgba(255,255,255,0.03)"
    : "rgba(28,28,30,0.03)";
  const pieCenterColor = isDark ? "#E8EFF8" : "#1C1C1E";
  const pieCenterSubColor = isDark ? "#6B7F9E" : "#77777D";
  const chartAccent1 = isDark ? "#3B82F6" : "#1C1C1E";
  const chartAccent2 = isDark ? "#60A5FA" : "#5C5C60";
  const chartRed = isDark ? "#EF4444" : "#A63228";
  const chartGreen = isDark ? "#10B981" : "#2D6A4F";

  /* ═══════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════ */
  return (
    <div className={`awr app ${isDark ? "awr-dark" : ""}`}>
      <style>{AW_STYLES}</style>


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
            placeholder={
              newAsset.category === EMERGENCY_CATEGORY
                ? "不列入配置"
                : "目標占比 % (選填)"
            }
            min="0"
            max="100"
            disabled={newAsset.category === EMERGENCY_CATEGORY}
            className={newAssetErrors.targetPercent ? "invalid" : ""}
            value={
              newAsset.category === EMERGENCY_CATEGORY
                ? ""
                : newAsset.targetPercent
            }
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

      <input
        type="file"
        accept=".csv,text/csv"
        ref={awCsvInputRef}
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files && e.target.files[0];
          e.target.value = "";
          if (f) handleImportAssetsCSV(f);
        }}
      />
      {/* ── Toolbar（狀態＋操作；主題/隱私由宿主控制）── */}
      <div className="aw-toolbar">
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
        <button className="btn" onClick={() => setShowSettings(true)}>
          <Settings size={15} />
          基準設定
        </button>
        <button className="btn icon" onClick={handleReset} title="重置">
          <RotateCcw size={16} />
        </button>
        <button
          className="btn"
          onClick={() => awCsvInputRef.current && awCsvInputRef.current.click()}
          title="與匯出相同格式；匯入後完全取代現有資產清單"
        >
          <Upload size={15} />
          匯入 CSV
        </button>
        <button className="btn primary" onClick={exportCSV}>
          <Download size={15} />
          匯出 CSV
        </button>
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

              {/* ── Snapshot Nudge Banner：本月尚未快照 ── */}
              {!hasThisMonthSnap &&
                snapNudgeDismissedKey !== currentMonthKey && (
                  <div className="nudge-banner animate-in">
                    <div className="nudge-icon">
                      <Camera size={18} />
                    </div>
                    <div className="nudge-body">
                      <div className="nudge-title">
                        {currentMonthKey} 尚未建立快照
                      </div>
                      <div className="nudge-sub">
                        自動快照只在每月 1
                        號開啟頁面時觸發。建立本月快照後，月度變化與偏離度比較才會準確。
                      </div>
                    </div>
                    <button
                      className="btn"
                      style={{ flexShrink: 0 }}
                      onClick={createSnapshot}
                    >
                      <Camera size={14} />
                      立即快照
                    </button>
                    <button
                      className="nudge-dismiss"
                      onClick={() => {
                        setSnapNudgeDismissedKey(currentMonthKey);
                        try {
                          localStorage.setItem(
                            "asset_warroom_snap_nudge",
                            currentMonthKey
                          );
                        } catch {}
                      }}
                      aria-label="本月不再提醒"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

              {/* ── Hero（瘦身版：拿掉獨立 App 大標題與文案，與宿主分頁的卡片語言一致）── */}
              <div
                className="hero-card animate-in"
                style={{ marginTop: 16, padding: 24 }}
              >
                <div className="hero-grid">
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
                      {emergencyValue > 0 && (
                        <>
                          ｜緊急備用金{" "}
                          {maskMoney(formatCompact(emergencyValue))}
                        </>
                      )}
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
                  <div className="hero-right">
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
                    <div className="hero-tags" style={{ marginTop: 0 }}>
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
                                  borderColor: "rgba(166,50,40,0.2)",
                                  background: "var(--c-red-dim)",
                                }
                              : item.soft
                              ? {
                                  color: "var(--c-yellow)",
                                  borderColor: "rgba(138,106,46,0.2)",
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
                </div>
              </div>

              {/* ── Filters ── */}
              <div className="filters animate-in delay-1">
                <div className="filters-row">
                  <div className="filter-card">
                    <div className="filter-row">
                      <div className="aw-search-box">
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
                            value={fxDraft ?? String(refData.usdToTwd)}
                            aria-label="美元匯率 USD/TWD"
                            onChange={(e) => {
                              // 編輯中顯示原始字串（可清空、打小數點不被吃字）；
                              // 有效正數即時套用，維持原本邊打邊算的行為
                              const raw = e.target.value;
                              setFxDraft(raw);
                              const n = Number(raw);
                              if (
                                raw.trim() !== "" &&
                                Number.isFinite(n) &&
                                n > 0
                              )
                                setRefData((p) => ({ ...p, usdToTwd: n }));
                            }}
                            onBlur={() => setFxDraft(null)}
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
                <div className="aw-card kpi-card featured animate-in delay-2">
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
                  <div key={i} className={`aw-card kpi-card animate-in ${item.d}`}>
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
                    <div className="aw-card chart-card animate-in delay-4">
                      <div className="aw-card-title">
                        <PieChartIcon size={17} />
                        資產分佈
                      </div>
                      <div className="aw-card-desc">
                        所有資產先換算成台幣後，檢視目前整體配置結構（不受搜尋篩選影響）。
                      </div>
                      <div className="aw-chart-wrap" key={`pie-${chartEpoch}`}>
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
                                        fontFamily="DM Mono,monospace"
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
                    <div className="aw-card chart-card animate-in delay-5">
                      <div className="aw-card-title">
                        <Zap size={17} />
                        再平衡建議
                      </div>
                      <div className="aw-card-desc">
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
                    <div className="aw-card chart-card animate-in delay-6">
                      <div className="aw-card-title">
                        <BarChart3 size={17} />
                        類別達標狀況
                      </div>
                      <div className="aw-card-desc">
                        比較各類別目前占比與目標占比的距離（以可投資資產為分母，緊急備用金不列入）。
                      </div>
                      <div
                        className="aw-chart-wrap"
                        style={{ height: 320 }}
                        key={`bar-${chartEpoch}`}
                      >
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
                    <div className="aw-card monthly-card animate-in delay-5">
                      <div className="aw-card-title">
                        <History size={17} />
                        月度資產變化
                      </div>
                      <div className="aw-card-desc">
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
                      <div
                        className="aw-chart-wrap"
                        style={{ height: 320 }}
                        key={`snap-${chartEpoch}`}
                      >
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
                    <div className="aw-card monthly-card animate-in delay-6">
                      <div className="aw-card-title">
                        <Sparkles size={17} />
                        本月變化摘要
                      </div>
                      <div className="aw-card-desc">
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
              <div className="aw-card table-card animate-in delay-7">
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
                          placeholder={
                            newAsset.category === EMERGENCY_CATEGORY
                              ? "不列入配置"
                              : "目標占比 %"
                          }
                          min="0"
                          max="100"
                          disabled={newAsset.category === EMERGENCY_CATEGORY}
                          className={
                            newAssetErrors.targetPercent ? "invalid" : ""
                          }
                          value={
                            newAsset.category === EMERGENCY_CATEGORY
                              ? ""
                              : newAsset.targetPercent
                          }
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
                    const isEmergencyCat = cat === EMERGENCY_CATEGORY;
                    // 備用金顯示佔總資產比例；其餘類別以可投資資產為分母對比目標
                    const catDenom = isEmergencyCat
                      ? totalValue
                      : investableValue;
                    const catCurrentPct =
                      catDenom > 0
                        ? ((gstat.currentVal / catDenom) * 100).toFixed(1)
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
                              <div className="cat-label">
                                {isEmergencyCat ? "佔總資產" : "目前 / 目標"}
                              </div>
                              <div className="cat-value">
                                <strong>{catCurrentPct}%</strong>
                                {!isEmergencyCat && <> / {gstat.targetPct}%</>}
                              </div>
                            </div>
                            <div className="cat-box">
                              <div className="cat-label">差距</div>
                              {isEmergencyCat ? (
                                <div className="gap-badge neutral">
                                  不列入配置
                                </div>
                              ) : (
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
                              )}
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
                                    const rowDenom = isEmergencyCat
                                      ? totalValue
                                      : investableValue;
                                    const currentPct =
                                      rowDenom > 0
                                        ? (
                                            (twdValue / rowDenom) *
                                            100
                                          ).toFixed(1)
                                        : "0.0";
                                    const diff =
                                      twdValue -
                                      investableValue *
                                        (item.targetPercent / 100);
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
                                                : cat.includes("備用")
                                                ? "RESERVE"
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
                                          {isEmergencyCat ? (
                                            <span
                                              className="current-pct"
                                              title="緊急備用金不列入目標配置"
                                            >
                                              — / {currentPct}%
                                            </span>
                                          ) : (
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
                                          )}
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                          {isEmergencyCat ? (
                                            <span className="current-pct">
                                              —
                                            </span>
                                          ) : (
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
                                          )}
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
                              const rowDenom = isEmergencyCat
                                ? totalValue
                                : investableValue;
                              const currentPct =
                                rowDenom > 0
                                  ? ((twdValue / rowDenom) * 100).toFixed(1)
                                  : "0.0";
                              const diff =
                                twdValue -
                                investableValue * (item.targetPercent / 100);
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
                                        {isEmergencyCat
                                          ? "佔總資產"
                                          : "目標 / 目前"}
                                      </div>
                                      <div
                                        className="mobile-asset-card-field-value"
                                        style={{ color: "var(--c-accent)" }}
                                      >
                                        {isEmergencyCat
                                          ? `${currentPct}%`
                                          : `${item.targetPercent}% / ${currentPct}%`}
                                      </div>
                                    </div>
                                    <div className="mobile-asset-card-field">
                                      <div className="mobile-asset-card-field-label">
                                        差距
                                      </div>
                                      {isEmergencyCat ? (
                                        <div className="mobile-asset-card-field-value">
                                          —
                                        </div>
                                      ) : (
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
                                      )}
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
