"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import ProtectedPage from "@/components/ProtectedPage";
import UserBadge from "@/components/UserBadge";
import { getCurrentUserProfile } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import {
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  Headphones,
  LineChart,
  Mic,
  Pencil,
  Settings,
  Sparkles,
  Target,
  Trophy,
  User,
  X,
} from "lucide-react";

type Skill = "listening" | "reading" | "writing" | "speaking" | "fullmock";

type Profile = {
  full_name?: string | null;
  email?: string | null;
  role?: string | null;
  exam_type?: string | null;
  target_score?: string | null;
  exam_date?: string | null;
};

type ResultRow = {
  id: string;
  test_id: string;
  skill: Skill;
  score: number;
  total: number;
  band: string;
  created_at: string;
};

type SkillBands = {
  listening: number;
  reading: number;
  writing: number;
  speaking: number;
};

type WeekDay = {
  key: string;
  label: string;
  dateKey: string;
  done: boolean;
  today: boolean;
};

function firstName(profile: Profile | null) {
  const name = profile?.full_name?.trim();
  if (!name) return "Student";
  return name.split(" ")[0] || "Student";
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function safeBand(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatBand(value: number) {
  if (!value) return "0";
  return value.toFixed(1);
}

function titleSkill(skill: string) {
  return skill.charAt(0).toUpperCase() + skill.slice(1);
}

const DEFAULT_EXAM_DATE = "2026-06-14";

function daysUntilExam(dateString: string) {
  if (!dateString) return 0;

  const today = new Date();
  const exam = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(exam.getTime())) return 0;

  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const examStart = new Date(
    exam.getFullYear(),
    exam.getMonth(),
    exam.getDate()
  );

  const diff = examStart.getTime() - todayStart.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function formatExamDate(dateString: string) {
  if (!dateString) return "Not set";

  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Invalid date";

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getResultDateKey(value: string) {
  return getDateKey(new Date(value));
}


function getPrimaryResultsByTest(results: ResultRow[]) {
  const map = new Map<string, ResultRow>();

  results.forEach((result) => {
    const previous = map.get(result.test_id);
    if (!previous) {
      map.set(result.test_id, result);
      return;
    }

    const currentBand = safeBand(result.band);
    const previousBand = safeBand(previous.band);
    const currentDate = new Date(result.created_at).getTime();
    const previousDate = new Date(previous.created_at).getTime();

    if (
      currentBand > previousBand ||
      (currentBand === previousBand && currentDate > previousDate)
    ) {
      map.set(result.test_id, result);
    }
  });

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

function getSkillBands(results: ResultRow[]): SkillBands {
  const skills: Skill[] = ["listening", "reading", "writing", "speaking"];

  return skills.reduce(
    (acc, skill) => {
      const bands = results
        .filter((item) => item.skill === skill)
        .map((item) => safeBand(item.band))
        .filter((value) => value > 0);

      acc[skill as keyof SkillBands] = average(bands);
      return acc;
    },
    {
      listening: 0,
      reading: 0,
      writing: 0,
      speaking: 0,
    } as SkillBands
  );
}

function buildHistory(results: ResultRow[]) {
  const sorted = [...results].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const lastSeven = sorted.slice(-7).map((item, index) => ({
    label: `T${index + 1}`,
    band: safeBand(item.band),
  }));

  while (lastSeven.length < 7) {
    lastSeven.unshift({
      label: `T${lastSeven.length + 1}`,
      band: 0,
    });
  }

  return lastSeven;
}

function calculateXP(results: ResultRow[]) {
  return results.reduce((totalXP, result) => {
    const score = Number(result.score) || 0;
    const total = Number(result.total) || 0;
    const band = safeBand(result.band);

    const submitXP = 20;
    const correctAnswerXP = score * 5;
    const fullScoreBonus = total > 0 && score === total ? 30 : 0;
    const bandBonus = Math.round(band * 10);

    return totalXP + submitXP + correctAnswerXP + fullScoreBonus + bandBonus;
  }, 0);
}

function calculateStreak(results: ResultRow[]) {
  if (!results.length) return 0;

  const completedDays = new Set(
    results.map((item) => getResultDateKey(item.created_at))
  );

  const today = new Date();
  const current = new Date(today);
  let streak = 0;

  const todayKey = getDateKey(current);

  if (!completedDays.has(todayKey)) {
    current.setDate(current.getDate() - 1);
  }

  while (completedDays.has(getDateKey(current))) {
    streak += 1;
    current.setDate(current.getDate() - 1);
  }

  return streak;
}

function buildWeekDays(results: ResultRow[]): WeekDay[] {
  const completedDays = new Set(
    results.map((item) => getResultDateKey(item.created_at))
  );

  const today = new Date();
  const dayIndex = today.getDay();
  const mondayOffset = dayIndex === 0 ? -6 : 1 - dayIndex;

  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  const labels = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const fullLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const todayKey = getDateKey(today);

  return labels.map((label, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);

    const dateKey = getDateKey(date);

    return {
      key: label,
      label: fullLabels[index],
      dateKey,
      done: completedDays.has(dateKey),
      today: dateKey === todayKey,
    };
  });
}

function RadarChart({
  labels,
  values,
}: {
  labels: string[];
  values: number[];
}) {
  const size = 240;
  const center = size / 2;
  const radius = 82;
  const max = 9;

  const points = values.map((value, index) => {
    const angle = (Math.PI * 2 * index) / values.length - Math.PI / 2;
    const ratio = Math.max(0, Math.min(max, value)) / max;

    return {
      x: center + Math.cos(angle) * radius * ratio,
      y: center + Math.sin(angle) * radius * ratio,
    };
  });

  const polygon = points.map((point) => `${point.x},${point.y}`).join(" ");
  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <div className="flex justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {gridLevels.map((level) => {
          const gridPoints = values.map((_, index) => {
            const angle = (Math.PI * 2 * index) / values.length - Math.PI / 2;
            return `${center + Math.cos(angle) * radius * level},${
              center + Math.sin(angle) * radius * level
            }`;
          });

          return (
            <polygon
              key={level}
              points={gridPoints.join(" ")}
              fill="none"
              stroke="#FFF0EC"
              strokeWidth="1"
            />
          );
        })}

        {values.map((_, index) => {
          const angle = (Math.PI * 2 * index) / values.length - Math.PI / 2;

          return (
            <line
              key={index}
              x1={center}
              y1={center}
              x2={center + Math.cos(angle) * radius}
              y2={center + Math.sin(angle) * radius}
              stroke="#FFF0EC"
              strokeWidth="1"
            />
          );
        })}

        <polygon
          points={polygon}
          fill="rgba(7,26,82,0.15)"
          stroke="#071A52"
          strokeWidth="2.5"
        />

        {points.map((point, index) => (
          <circle key={index} cx={point.x} cy={point.y} r="3.5" fill="#071A52" />
        ))}

        {labels.map((label, index) => {
          const angle = (Math.PI * 2 * index) / labels.length - Math.PI / 2;
          const labelRadius = radius + 28;
          const x = center + Math.cos(angle) * labelRadius;
          const y = center + Math.sin(angle) * labelRadius;

          return (
            <text
              key={label}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fontWeight="600"
              fill="#4A4A4A"
            >
              {label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

export default function DashboardPage() {
  const [pageMounted, setPageMounted] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [radarMode, setRadarMode] = useState<"lr" | "ws">("lr");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setPageMounted(true);
  }, []);

  useEffect(() => {
    if (!pageMounted) return;

    let mounted = true;

    async function loadDashboard() {
      setLoading(true);

      const { user, profile } = await getCurrentUserProfile();

      if (!mounted) return;

      setProfile(profile);

      if (!user) {
        setResults([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("test_results")
        .select("id, test_id, skill, score, total, band, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!mounted) return;

      if (error) {
        console.error("Dashboard results error:", error.message);
        setResults([]);
      } else {
        setResults((data || []) as ResultRow[]);
      }

      setLoading(false);
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, [pageMounted]);

  const scoreResults = useMemo(() => getPrimaryResultsByTest(results), [results]);
  const skillBands = useMemo(() => getSkillBands(scoreResults), [scoreResults]);
  const history = useMemo(() => buildHistory(scoreResults), [scoreResults]);
  const totalXP = useMemo(() => calculateXP(results), [results]);
  const streak = useMemo(() => calculateStreak(results), [results]);
  const weekDays = useMemo(() => buildWeekDays(results), [results]);

  const latest = scoreResults[0] || null;
  const latestBand = safeBand(latest?.band);
  const targetBand = safeBand(profile?.target_score || "8.0") || 8;
  const examDate = profile?.exam_date || DEFAULT_EXAM_DATE;
  const examDaysLeft = daysUntilExam(examDate);
  const bestBand = scoreResults.length
    ? Math.max(...scoreResults.map((item) => safeBand(item.band)))
    : 0;

  const strongest = Object.entries(skillBands)
    .map(([skill, band]) => ({ skill, band }))
    .sort((a, b) => b.band - a.band)[0];

  const strongSkill =
    strongest && strongest.band > 0 ? titleSkill(strongest.skill) : "No data";

  const firstBand = scoreResults.length
    ? safeBand(scoreResults[scoreResults.length - 1]?.band)
    : 0;

  const improvement =
    firstBand > 0
      ? Math.round(((latestBand - firstBand) / firstBand) * 100)
      : 0;

  const lrValues = [
    skillBands.reading,
    skillBands.listening,
    average([skillBands.reading, skillBands.listening]),
    latestBand,
    bestBand,
    targetBand,
  ];

  const wsValues = [
    skillBands.writing,
    skillBands.speaking,
    average([skillBands.writing, skillBands.speaking]),
    latestBand,
  ];

  const radarLabels =
    radarMode === "lr"
      ? ["Reading", "Listening", "Average", "Latest", "Best", "Target"]
      : ["Writing", "Speaking", "Average", "Latest"];

  const radarValues = radarMode === "lr" ? lrValues : wsValues;

  const statCards: {
    label: string;
    value: string | number;
    sub: string;
    icon: LucideIcon;
    bg: string;
    color: string;
  }[] = [
    {
      label: "Total tests",
      value: loading ? "..." : scoreResults.length,
      sub: "This month",
      icon: BookOpen,
      bg: "#FFF0EC",
      color: "#071A52",
    },
    {
      label: "Improvement rate",
      value: loading ? "..." : `${improvement >= 0 ? "+" : ""}${improvement}%`,
      sub: "Last 30 days",
      icon: LineChart,
      bg: "#E0F7F0",
      color: "#00B894",
    },
    {
      label: "Best score",
      value: loading ? "..." : formatBand(bestBand),
      sub: "This month",
      icon: Trophy,
      bg: "#FFF8E0",
      color: "#FDCB6E",
    },
    {
      label: "Your target",
      value: formatBand(targetBand),
      sub: "Target score",
      icon: Target,
      bg: "#FFF0EC",
      color: "#071A52",
    },
    {
      label: "Strong skill",
      value: loading ? "..." : strongSkill,
      sub: `Band ${formatBand(strongest?.band || 0)}`,
      icon: Trophy,
      bg: "#E0F7F0",
      color: "#00B894",
    },
  ];

  const routeItems: {
    href: string;
    title: string;
    desc: string;
    icon: LucideIcon;
    bg: string;
    color: string;
  }[] = [
    {
      href: "/practice?tab=reading",
      title: "Reading practice",
      desc: "Pick a passage",
      icon: BookOpen,
      bg: "#FFF0EE",
      color: "#E17055",
    },
    {
      href: "/practice?tab=listening",
      title: "Listening practice",
      desc: "Pick a section",
      icon: Headphones,
      bg: "#FFFBEE",
      color: "#FDCB6E",
    },
    {
      href: "/practice?tab=speaking",
      title: "Speaking practice",
      desc: "Cue cards + feedback",
      icon: Mic,
      bg: "#E8FFF5",
      color: "#00B894",
    },
  ];

  const skillPerformance: {
    label: string;
    value: number;
    icon: LucideIcon;
    color: string;
  }[] = [
    ["Listening", skillBands.listening, Headphones, "#071A52"],
    ["Reading", skillBands.reading, BookOpen, "#FF6B52"],
    ["Speaking", skillBands.speaking, Mic, "#00B894"],
    ["Writing", skillBands.writing, Pencil, "#E17055"],
  ].map(([label, value, icon, color]) => ({
    label: String(label),
    value: Number(value),
    icon: icon as LucideIcon,
    color: String(color),
  }));

  function showNotice(message: string) {
    setNotice(message);

    window.setTimeout(() => {
      setNotice("");
    }, 2800);
  }

  return (
    <ProtectedPage>
      <main className="min-h-screen bg-[#F5F7FC] text-[#0A0A0A]">
        <nav className="sticky top-0 z-50 flex h-[60px] items-center justify-between border-b border-[rgba(7,26,82,0.15)] bg-white px-8">
          <Link
            href="/"
            aria-label="Go to EnglishPeak home"
            className="flex items-center gap-3 rounded-2xl outline-none transition focus:ring-2 focus:ring-[#071A52]/25"
          >
            <div className="flex h-[34px] w-[34px] flex-col items-center justify-center gap-[3px] rounded-xl bg-[#071A52] shadow-[0_4px_12px_rgba(7,26,82,0.25)]">
              <div className="h-[2.5px] w-[17px] rounded bg-white" />
              <div className="h-[11px] w-1 rounded bg-white" />
            </div>

            <span className="text-lg font-black tracking-[2px] text-[#0A0A0A]">
              ENGLISH<span className="text-[#071A52]">PEAK</span>
            </span>
          </Link>

          <div className="app-main-nav hidden items-center gap-2 lg:flex">
            {[
              { href: "/dashboard", label: "Dashboard", active: true },
              { href: "/practice", label: "Practice" },
              { href: "/studytools", label: "Study tools" },
              { href: "/results", label: "Results" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-label={`Go to ${item.label}`}
                className={`rounded-2xl px-5 py-2 text-sm outline-none transition-colors duration-150 focus:ring-2 focus:ring-[#071A52]/25 ${
                  item.active
                    ? "bg-[#071A52] font-bold text-white shadow-[0_4px_12px_rgba(7,26,82,0.30)]"
                    : "font-semibold text-[#4A4A4A] hover:text-[#0A0A0A]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Upgrade plan"
              onClick={() =>
                showNotice(
                  "Upgrade Plan bo‘limi tayyorlanmoqda. Hozircha barcha practice testlar Free holatda ishlaydi."
                )
              }
              className="hidden items-center gap-2 rounded-2xl bg-gradient-to-br from-[#071A52] to-[#FF6B52] px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_16px_rgba(7,26,82,0.35)] outline-none transition-all duration-200 hover:-translate-y-px hover:shadow-[0_8px_22px_rgba(7,26,82,0.42)] hover:will-change-transform focus:ring-2 focus:ring-[#071A52]/25 md:flex"
            >
              <Sparkles size={16} /> Upgrade Plan
            </button>

            <button
              type="button"
              aria-label="Open notifications"
              onClick={() =>
                showNotice(
                  "Hozircha yangi notification yo‘q. Test natijalari va admin xabarlari keyin shu yerda chiqadi."
                )
              }
              className="grid h-10 w-10 place-items-center rounded-xl border border-[rgba(7,26,82,0.15)] text-[#4A4A4A] outline-none transition-colors duration-150 hover:bg-[#F5F7FC] hover:text-[#071A52] focus:ring-2 focus:ring-[#071A52]/25"
            >
              <Bell size={18} />
            </button>

            <UserBadge />
          </div>
        </nav>

        <div className="flex">
          <aside className="hidden min-h-[calc(100vh-60px)] w-[220px] shrink-0 flex-col gap-1 border-r border-[rgba(7,26,82,0.15)] bg-white p-3 lg:flex">
            <p className="mb-1 mt-3 px-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#8A8A8A]">
              MAIN
            </p>

            <Link
              href="/dashboard"
              className="relative flex items-center gap-3 rounded-xl border border-[rgba(7,26,82,0.25)] bg-gradient-to-br from-[#FFF0EC] to-[#FFE2DB] px-4 py-3 text-sm font-bold text-[#071A52] shadow-[0_2px_8px_rgba(7,26,82,0.08)]"
            >
              <div className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[#071A52]" />
              <BarChart3 size={18} /> Dashboard
            </Link>

            <Link
              href="/results"
              className="flex items-center gap-3 rounded-xl border border-transparent px-4 py-3 text-sm font-semibold text-[#4A4A4A] transition-all duration-150 hover:bg-[#F5F7FC] hover:text-[#071A52]"
            >
              <LineChart size={18} /> My Results
            </Link>

            <div className="my-2 h-px bg-[rgba(7,26,82,0.10)]" />

            <p className="mb-1 mt-3 px-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#8A8A8A]">
              ACCOUNT
            </p>

            <Link
              href="/profile"
              className="flex items-center gap-3 rounded-xl border border-transparent px-4 py-3 text-sm font-semibold text-[#4A4A4A] transition-all duration-150 hover:bg-[#F5F7FC] hover:text-[#071A52]"
            >
              <Settings size={18} /> Settings
            </Link>

            <Link
              href="/profile"
              className="flex items-center gap-3 rounded-xl border border-transparent px-4 py-3 text-sm font-semibold text-[#4A4A4A] transition-all duration-150 hover:bg-[#F5F7FC] hover:text-[#071A52]"
            >
              <User size={18} /> Profile
            </Link>

            <div className="mt-auto rounded-2xl border border-[rgba(7,26,82,0.15)] bg-gradient-to-br from-[#FFF0EC] to-[#FFE2DB] p-4">
              <UserBadge variant="simple" showMenu={false} />
            </div>
          </aside>

          <section className="flex-1 bg-[#F5F7FC] p-6 md:p-8">
            {notice && (
              <div className="animate-slide-in-right fixed right-5 top-20 z-[999] flex max-w-[380px] items-start gap-3 rounded-2xl border border-[rgba(7,26,82,0.15)] bg-white p-4 shadow-[0_14px_34px_rgba(30,27,58,0.10)]">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#FFF0EC] text-[#071A52]">
                  <Sparkles size={18} />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-black text-[#0A0A0A]">EnglishPeak</p>
                  <p className="mt-1 text-sm font-medium leading-6 text-[#4A4A4A]">
                    {notice}
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="Close notice"
                  onClick={() => setNotice("")}
                  className="grid h-8 w-8 place-items-center rounded-xl text-[#8A8A8A] transition-colors duration-150 hover:bg-[#F5F7FC] hover:text-[#071A52]"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="mb-6 animate-fade-up">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#071A52]">
                TODAY ROUTE
              </p>

              <h1 className="text-2xl font-black tracking-[-0.02em] text-[#0A0A0A]">
                {firstName(profile)}, here is today&apos;s route.
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <p className="text-sm font-medium text-[#4A4A4A]">
                  Target Band {formatBand(targetBand)} · IELTS date:{" "}
                  {formatExamDate(examDate)}
                </p>

                <span className="rounded-2xl border border-[rgba(7,26,82,0.20)] bg-white px-4 py-1.5 text-sm font-black text-[#071A52]">
                  XP {loading ? "..." : totalXP}
                </span>

                <span className="rounded-2xl border border-[rgba(226,113,85,0.25)] bg-gradient-to-r from-[#FFF5F5] to-[#FFE8E8] px-4 py-1.5 text-sm font-black text-[#E17055]">
                  🔥 STREAK {loading ? "..." : streak}
                </span>
              </div>
            </div>

            <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {statCards.map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="animate-fade-up rounded-[20px] border border-[rgba(7,26,82,0.15)] bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[rgba(7,26,82,0.35)] hover:shadow-[0_8px_24px_rgba(7,26,82,0.12)] hover:will-change-transform"
                    style={{ animationDelay: `${index * 0.06}s` }}
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <div
                        className="grid h-7 w-7 place-items-center rounded-xl"
                        style={{ background: item.bg }}
                      >
                        <Icon size={15} color={item.color} />
                      </div>

                      <span className="text-xs font-semibold text-[#8A8A8A]">
                        {item.label}
                      </span>
                    </div>

                    <p className="text-xl font-bold text-[#0A0A0A]">
                      {item.value}
                    </p>

                    <p className="mt-0.5 text-xs text-[#8A8A8A]">{item.sub}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid gap-5 xl:grid-cols-[1fr_1fr_0.72fr]">
              <section
                className="animate-fade-up rounded-[24px] border border-[rgba(7,26,82,0.15)] bg-white p-6"
                style={{ animationDelay: "0.1s" }}
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#8A8A8A]">
                  BAND HISTORY
                </p>

                <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[#0A0A0A]">
                  {formatBand(latestBand)}
                </h2>

                <p className="mt-2 text-sm font-medium text-[#4A4A4A]">
                  Goal Band {formatBand(targetBand)} ·{" "}
                  {Math.max(0, targetBand - latestBand).toFixed(1)} bands to
                  close
                </p>

                <div className="mt-4 flex h-[120px] items-end gap-3 rounded-2xl bg-gradient-to-b from-[#FFF0EC] to-[#F5F3FF] p-5">
                  {history.map((item, index) => (
                    <div
                      key={`${item.label}-${index}`}
                      className="flex flex-1 flex-col items-center gap-2"
                    >
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-b from-[#071A52] to-[#FF6B52] transition duration-150 hover:brightness-110"
                        style={{
                          height: `${Math.max(6, (item.band / 9) * 82)}px`,
                          opacity: item.band > 0 ? 1 : 0.2,
                        }}
                      />

                      <span className="text-[10px] font-bold text-[#8A8A8A]">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    ["LATEST", formatBand(latestBand)],
                    ["BEST", formatBand(bestBand)],
                    ["TARGET", formatBand(targetBand)],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl bg-[#F5F7FC] p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">
                        {label}
                      </p>

                      <p className="mt-1 text-xl font-black text-[#0A0A0A]">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section
                className="animate-fade-up rounded-[24px] border border-[rgba(7,26,82,0.15)] bg-white p-6"
                style={{ animationDelay: "0.2s" }}
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#8A8A8A]">
                  PROGRESS RADAR
                </p>

                <div className="mt-2 flex items-center justify-between gap-3">
                  <h2 className="text-xl font-black text-[#0A0A0A]">
                    Skill shape
                  </h2>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setRadarMode("lr")}
                      className={`rounded-2xl px-4 py-1.5 text-xs font-bold outline-none transition-all duration-150 focus:ring-2 focus:ring-[#071A52]/25 ${
                        radarMode === "lr"
                          ? "bg-[#071A52] text-white shadow-[0_4px_10px_rgba(7,26,82,0.25)]"
                          : "border border-[rgba(7,26,82,0.18)] bg-white text-[#4A4A4A] hover:border-[#071A52] hover:text-[#071A52]"
                      }`}
                    >
                      L & R
                    </button>

                    <button
                      type="button"
                      onClick={() => setRadarMode("ws")}
                      className={`rounded-2xl px-4 py-1.5 text-xs font-bold outline-none transition-all duration-150 focus:ring-2 focus:ring-[#071A52]/25 ${
                        radarMode === "ws"
                          ? "bg-[#071A52] text-white shadow-[0_4px_10px_rgba(7,26,82,0.25)]"
                          : "border border-[rgba(7,26,82,0.18)] bg-white text-[#4A4A4A] hover:border-[#071A52] hover:text-[#071A52]"
                      }`}
                    >
                      W & S
                    </button>
                  </div>
                </div>

                <div className="mt-3">
                  <RadarChart labels={radarLabels} values={radarValues} />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  {(radarMode === "lr"
                    ? [
                        ["Reading", skillBands.reading],
                        ["Listening", skillBands.listening],
                      ]
                    : [
                        ["Writing", skillBands.writing],
                        ["Speaking", skillBands.speaking],
                      ]
                  ).map(([label, value]) => (
                    <div
                      key={String(label)}
                      className="rounded-2xl bg-gradient-to-br from-[#FFF0EC] to-[#FFE2DB] p-4"
                    >
                      <p className="text-xs font-semibold text-[#4A4A4A]">
                        {label}
                      </p>

                      <p className="mt-1 text-2xl font-black text-[#071A52]">
                        {formatBand(Number(value))}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section
                className="animate-fade-up rounded-[24px] border border-[rgba(7,26,82,0.15)] bg-white p-6 text-center"
                style={{ animationDelay: "0.3s" }}
              >
                <div className="animate-pulse text-3xl">🔥</div>

                <h2 className="mt-2 text-3xl font-black text-[#071A52]">
                  {loading ? "..." : streak}
                </h2>

                <p className="mt-1 text-sm font-medium text-[#4A4A4A]">
                  Day streak
                </p>

                <div className="mt-6 flex justify-center gap-2">
                  {weekDays.map((day) => (
                    <button
                      key={day.dateKey}
                      type="button"
                      onClick={() =>
                        showNotice(
                          day.done
                            ? `${day.label}: test completed. Streak hisobiga qo‘shilgan.`
                            : `${day.label}: hali test topshirilmagan. Practice qilib streakni davom ettir.`
                        )
                      }
                      title={day.dateKey}
                      className={`grid h-9 w-9 place-items-center rounded-full text-xs font-black transition hover:-translate-y-0.5 ${
                        day.done
                          ? "bg-[#071A52] text-white shadow-[0_4px_10px_rgba(7,26,82,0.30)]"
                          : day.today
                          ? "border-2 border-[#071A52] bg-white text-[#071A52]"
                          : "border border-[rgba(7,26,82,0.15)] bg-[#F5F7FC] text-[#8A8A8A]"
                      }`}
                    >
                      {day.key}
                    </button>
                  ))}
                </div>

                <div className="mt-6 border-t border-[rgba(7,26,82,0.10)] pt-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#8A8A8A]">
                    ROUTE XP
                  </p>

                  <p className="mt-2 text-3xl font-black text-[#071A52]">
                    {loading ? "..." : totalXP}
                  </p>

                  <p className="mt-1 text-sm font-medium text-[#4A4A4A]">
                    Based on submitted tests
                  </p>
                </div>
              </section>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.8fr_1fr]">
              <section
                className="animate-fade-up rounded-[24px] border border-[rgba(7,26,82,0.15)] bg-white p-6"
                style={{ animationDelay: "0.1s" }}
              >
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#8A8A8A]">
                      TODAY ROUTE
                    </p>

                    <h2 className="mt-1 text-xl font-black text-[#0A0A0A]">
                      Continue your prep
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      showNotice(
                        "Live focus rejimi keyingi update’da qo‘shiladi. Hozircha Reading, Listening va Speaking practice bo‘limlari ishlaydi."
                      )
                    }
                    className="rounded-2xl bg-gradient-to-br from-[#FFF0EC] to-[#E0DEFF] px-4 py-2 text-xs font-bold text-[#071A52] transition-all duration-200 hover:-translate-y-px hover:bg-[#DDD9FF]"
                  >
                    Live focus
                  </button>
                </div>

                {routeItems.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="mb-3 flex items-center gap-4 rounded-2xl border border-[rgba(7,26,82,0.15)] bg-white p-4 transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-0.5 hover:border-[rgba(7,26,82,0.35)] hover:shadow-[0_8px_20px_rgba(7,26,82,0.10)]"
                    >
                      <span className="text-sm font-black text-[#8A8A8A]">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <div
                        className="grid h-12 w-12 place-items-center rounded-2xl"
                        style={{ background: item.bg, color: item.color }}
                      >
                        <Icon size={22} />
                      </div>

                      <div className="flex-1">
                        <p className="text-sm font-bold text-[#0A0A0A]">
                          {item.title}
                        </p>

                        <p className="text-xs font-medium text-[#4A4A4A]">
                          {item.desc}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </section>

              <section
                className="animate-fade-up rounded-[24px] border border-[rgba(7,26,82,0.15)] bg-white p-6"
                style={{ animationDelay: "0.2s" }}
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#8A8A8A]">
                  EXAM COUNTDOWN
                </p>

                <div className="mt-4 rounded-[20px] bg-gradient-to-br from-[#FFF0EC] to-[#FFE2DB] p-5">
                  <div className="flex items-center gap-4">
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-[#071A52] shadow-[0_4px_12px_rgba(7,26,82,0.15)]">
                      <CalendarDays size={26} />
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#4A4A4A]">
                        DAYS REMAINING
                      </p>

                      <p className="text-3xl font-black text-[#071A52]">
                        {examDaysLeft}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-[rgba(7,26,82,0.15)] pt-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#4A4A4A]">
                      EXAM DATE
                    </p>

                    <p className="mt-1 text-lg font-black text-[#0A0A0A]">
                      {formatExamDate(examDate)}
                    </p>
                  </div>

                  <Link
                    href="/profile"
                    className="mt-5 block rounded-xl bg-gradient-to-br from-[#071A52] to-[#FF6B52] px-5 py-3 text-center text-sm font-bold text-white shadow-[0_4px_14px_rgba(7,26,82,0.35)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_8px_20px_rgba(7,26,82,0.42)]"
                  >
                    Change date
                  </Link>
                </div>
              </section>

              <section
                className="animate-fade-up rounded-[24px] border border-[rgba(7,26,82,0.15)] bg-white p-6"
                style={{ animationDelay: "0.3s" }}
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#8A8A8A]">
                  SKILL PERFORMANCE
                </p>

                <h2 className="mt-1 text-xl font-black text-[#0A0A0A]">
                  Average bands
                </h2>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {skillPerformance.map((item, index) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.label}
                        className="rounded-2xl bg-[#F5F7FC] p-4"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon size={17} color={item.color} />

                            <p className="text-sm font-bold text-[#0A0A0A]">
                              {item.label}
                            </p>
                          </div>

                          <p
                            className="text-sm font-black"
                            style={{ color: item.color }}
                          >
                            {formatBand(item.value)}
                          </p>
                        </div>

                        <div className="h-1.5 rounded-full bg-[#DDD9FF]">
                          <div
                            className="h-1.5 rounded-full transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                            style={{
                              width: pageMounted
                                ? `${Math.min(100, (item.value / 9) * 100)}%`
                                : "0%",
                              background: item.color,
                              transitionDelay: `${index * 100}ms`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </section>
        </div>
      </main>
    </ProtectedPage>
  );
}
