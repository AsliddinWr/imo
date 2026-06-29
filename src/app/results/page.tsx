"use client";

import { useEffect, useMemo, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import UserBadge from "@/components/UserBadge";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Headphones,
  Home,
  LineChart,
  Lock,
  Mic,
  Pencil,
  Search,
  Settings,
  Sparkles,
  Target,
  Trophy,
  User,
  X,
} from "lucide-react";

type SkillKey = "listening" | "reading" | "writing" | "speaking" | "fullmock";

type TestResultRow = {
  id: string;
  test_id: string;
  skill: SkillKey;
  score: number;
  total: number;
  band: string;
  status: string;
  created_at: string;
};

type ProfileRow = {
  full_name?: string | null;
  target_score?: string | null;
};

type ResultItem = {
  id: string;
  testId: string;
  title: string;
  type: string;
  rawType: SkillKey;
  date: string;
  rawDate: string;
  band: string;
  score: string;
  numericScore: number;
  numericTotal: number;
  time: string;
  status: string;
};

type SkillCard = {
  name: string;
  band: string;
  icon: typeof Headphones;
  color: string;
  bg: string;
  note: string;
  progress: number;
};

type DateFilter = "All time" | "Today" | "Last 7 days" | "Last 30 days";

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Invalid date";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatSkill(value: string) {
  if (value === "fullmock") return "Full Mock";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function titleFromResult(item: TestResultRow) {
  return `${formatSkill(item.skill)} test — ${item.test_id}`;
}

function mapResult(item: TestResultRow): ResultItem {
  return {
    id: item.id,
    testId: item.test_id,
    title: titleFromResult(item),
    type: formatSkill(item.skill),
    rawType: item.skill,
    date: formatDate(item.created_at),
    rawDate: item.created_at,
    band: item.band,
    score: `${item.score}/${item.total}`,
    numericScore: Number(item.score) || 0,
    numericTotal: Number(item.total) || 0,
    time: "Saved",
    status: item.status || "Submitted",
  };
}

function getTypeStyle(type: string) {
  switch (type) {
    case "Listening":
      return "bg-indigo-50 text-indigo-600";
    case "Reading":
      return "bg-blue-50 text-blue-600";
    case "Writing":
      return "bg-rose-50 text-rose-600";
    case "Speaking":
      return "bg-emerald-50 text-emerald-600";
    default:
      return "bg-purple-50 text-purple-600";
  }
}

function skillIcon(type: string) {
  if (type === "Listening") return Headphones;
  if (type === "Reading") return BookOpen;
  if (type === "Writing") return Pencil;
  if (type === "Speaking") return Mic;
  return Trophy;
}

function safeBand(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function isInsideDateFilter(rawDate: string, filter: DateFilter) {
  if (filter === "All time") return true;

  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const itemStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffDays = Math.floor(
    (todayStart.getTime() - itemStart.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (filter === "Today") return diffDays === 0;
  if (filter === "Last 7 days") return diffDays >= 0 && diffDays <= 7;
  if (filter === "Last 30 days") return diffDays >= 0 && diffDays <= 30;

  return true;
}

function buildSkillCards(results: ResultItem[]): SkillCard[] {
  const skills = [
    {
      name: "Listening",
      icon: Headphones,
      color: "#5B4FCF",
      bg: "#EEF0FF",
    },
    {
      name: "Reading",
      icon: BookOpen,
      color: "#378ADD",
      bg: "#EBF5FF",
    },
    {
      name: "Writing",
      icon: Pencil,
      color: "#E24B4A",
      bg: "#FFF0EE",
    },
    {
      name: "Speaking",
      icon: Mic,
      color: "#1D9E75",
      bg: "#E1F5EE",
    },
  ];

  return skills.map((skill) => {
    const skillResults = results.filter((item) => item.type === skill.name);
    const bands = skillResults.map((item) => safeBand(item.band)).filter(Boolean);
    const band = average(bands);
    const progress = Math.min(100, Math.round((band / 9) * 100));

    let note = "No data yet";

    if (band >= 7.5) note = "Strong skill";
    else if (band >= 6.5) note = "Good progress";
    else if (band > 0) note = "Needs practice";

    return {
      ...skill,
      band: band ? band.toFixed(1) : "0",
      note,
      progress,
    };
  });
}

function buildBandTrend(results: ResultItem[]) {
  const sorted = [...results].sort(
    (a, b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime()
  );

  const lastSeven = sorted.slice(-7).map((item, index) => ({
    week: `T${index + 1}`,
    band: safeBand(item.band),
  }));

  while (lastSeven.length < 7) {
    lastSeven.unshift({
      week: `T${lastSeven.length + 1}`,
      band: 0,
    });
  }

  return lastSeven;
}

function getWeakAreas(skillCards: SkillCard[]) {
  const sorted = [...skillCards].sort(
    (a, b) => safeBand(a.band) - safeBand(b.band)
  );

  const templates: Record<string, { title: string; desc: string; icon: typeof Pencil; color: string; href: string }> = {
    Listening: {
      title: "Listening accuracy",
      desc: "Practise sections and focus on keywords, numbers and spelling.",
      icon: Headphones,
      color: "#5B4FCF",
      href: "/practice?tab=listening",
    },
    Reading: {
      title: "Reading proof finding",
      desc: "Practise TFNG, headings and synonym traps with exact evidence.",
      icon: BookOpen,
      color: "#378ADD",
      href: "/practice?tab=reading",
    },
    Writing: {
      title: "Writing structure",
      desc: "Improve paragraphing, thesis clarity and lexical range.",
      icon: Pencil,
      color: "#E24B4A",
      href: "/practice?tab=writing",
    },
    Speaking: {
      title: "Speaking fluency",
      desc: "Extend answers with reasons, examples and natural linking.",
      icon: Mic,
      color: "#1D9E75",
      href: "/practice?tab=speaking",
    },
  };

  return sorted.slice(0, 3).map((skill) => templates[skill.name]);
}

function formatStudyTime(results: ResultItem[]) {
  if (!results.length) return "0 min";

  const estimatedMinutes = results.reduce((total, item) => {
    if (item.type === "Listening") return total + 30;
    if (item.type === "Reading") return total + 60;
    if (item.type === "Writing") return total + 40;
    if (item.type === "Speaking") return total + 15;
    return total + 120;
  }, 0);

  if (estimatedMinutes >= 60) {
    const hours = Math.floor(estimatedMinutes / 60);
    const minutes = estimatedMinutes % 60;

    return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  return `${estimatedMinutes} min`;
}

function escapeCsv(value: string | number) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function downloadCsv(results: ResultItem[]) {
  const headers = ["Test", "Skill", "Date", "Score", "Band", "Status"];

  const rows = results.map((item) => [
    item.title,
    item.type,
    item.date,
    item.score,
    item.band,
    item.status,
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `testora-my-results-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function ResultsPage() {
  const [pageMounted, setPageMounted] = useState(false);
  const [filter, setFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState<DateFilter>("Last 30 days");
  const [showDateMenu, setShowDateMenu] = useState(false);
  const [search, setSearch] = useState("");
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [dbResults, setDbResults] = useState<ResultItem[]>([]);
  const [loadingResults, setLoadingResults] = useState(true);
  const [resultsError, setResultsError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setPageMounted(true);
  }, []);

  useEffect(() => {
    if (!pageMounted) return;

    let mounted = true;

    async function loadResults() {
      setLoadingResults(true);
      setResultsError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (userError || !user) {
        setResultsError("Please sign in again to view your results.");
        setLoadingResults(false);
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, target_score")
        .eq("id", user.id)
        .maybeSingle();

      if (!mounted) return;

      setProfile((profileData || null) as ProfileRow | null);

      const { data, error } = await supabase
        .from("test_results")
        .select("id, test_id, skill, score, total, band, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!mounted) return;

      if (error) {
        setResultsError(error.message);
        setLoadingResults(false);
        return;
      }

      setDbResults(((data || []) as TestResultRow[]).map(mapResult));
      setLoadingResults(false);
    }

    loadResults();

    return () => {
      mounted = false;
    };
  }, [pageMounted]);

  const allResults = dbResults;

  const filteredResults = useMemo(() => {
    return allResults.filter((item) => {
      const matchesType = filter === "All" || item.type === filter;
      const matchesDate = isInsideDateFilter(item.rawDate, dateFilter);
      const text = `${item.title} ${item.type} ${item.status} ${item.score} ${item.band}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());

      return matchesType && matchesDate && matchesSearch;
    });
  }, [allResults, filter, dateFilter, search]);

  const latestResult = allResults[0] || null;
  const testsCompleted = filteredResults.length;
  const overallBand = latestResult?.band || "0";

  const bestBand = filteredResults.length
    ? filteredResults
        .reduce((best, item) => Math.max(best, safeBand(item.band)), 0)
        .toFixed(1)
    : "0";

  const bestSkill =
    filteredResults.find((item) => safeBand(item.band) === safeBand(bestBand))?.type ||
    "No data";

  const skillCards = useMemo(() => buildSkillCards(filteredResults), [filteredResults]);
  const weeklyBands = useMemo(() => buildBandTrend(filteredResults), [filteredResults]);
  const weakAreas = useMemo(() => getWeakAreas(skillCards), [skillCards]);

  const targetBand = Number(profile?.target_score) || 8;
  const latestBand = safeBand(latestResult?.band);
  const bandsToClose = Math.max(0, targetBand - latestBand).toFixed(1);
  const studyTime = formatStudyTime(filteredResults);

  function showNotice(message: string) {
    setNotice(message);

    window.setTimeout(() => {
      setNotice("");
    }, 2800);
  }

  function handleExport() {
    if (!filteredResults.length) {
      showNotice("Export qilish uchun result topilmadi.");
      return;
    }

    downloadCsv(filteredResults);
    showNotice("Result report CSV formatda yuklab olindi.");
  }

  if (!pageMounted) {
    return null;
  }

  return (
    <ProtectedPage>
      <main className="min-h-screen bg-[#F4F3FF] text-[#1A1729]">
        <nav className="sticky top-0 z-50 flex h-[62px] items-center justify-between border-b border-[#E2DEFF] bg-white px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-[34px] w-[34px] flex-col items-center justify-center gap-[3px] rounded-[9px] bg-[#5B4FCF]">
              <div className="h-[2.5px] w-[17px] rounded bg-white" />
              <div className="h-[11px] w-1 rounded bg-white" />
            </div>
            <span className="text-lg font-extrabold tracking-[2px] text-[#13102B]">
              TEST<span className="text-[#5B4FCF]">ORA</span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            <Link
              href="/dashboard"
              className="rounded-[10px] px-4 py-2 text-sm font-semibold text-[#6B6880] transition hover:bg-[#EEF0FF] hover:text-[#5B4FCF]"
            >
              Dashboard
            </Link>
            <Link
              href="/practice"
              className="rounded-[10px] px-4 py-2 text-sm font-semibold text-[#6B6880] transition hover:bg-[#EEF0FF] hover:text-[#5B4FCF]"
            >
              Practice
            </Link>
            <Link
              href="/studytools"
              className="rounded-[10px] px-4 py-2 text-sm font-semibold text-[#6B6880] transition hover:bg-[#EEF0FF] hover:text-[#5B4FCF]"
            >
              Study tools
            </Link>
            <Link
              href="/results"
              className="rounded-[10px] bg-[#5B4FCF] px-4 py-2 text-sm font-semibold text-white"
            >
              Results
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                showNotice(
                  "Upgrade Plan bo‘limi tayyorlanmoqda. Hozircha barcha resultlar Free holatda ko‘rinadi."
                )
              }
              className="hidden items-center gap-2 rounded-full bg-[#5B4FCF] px-5 py-2 text-sm font-bold text-white shadow-[0_8px_24px_rgba(91,79,207,.22)] transition hover:-translate-y-0.5 hover:bg-[#4740b8] md:flex"
            >
              <Sparkles size={16} /> Upgrade Plan
            </button>

            <button
              type="button"
              onClick={() => showNotice("Hozircha yangi notification yo‘q.")}
              className="grid h-10 w-10 place-items-center rounded-full border border-[#E2DEFF] bg-white text-[#6B6880] transition hover:-translate-y-0.5 hover:bg-[#EEF0FF] hover:text-[#5B4FCF]"
            >
              <Bell size={18} />
            </button>

            <UserBadge />
          </div>
        </nav>

        {notice && (
          <div className="fixed right-5 top-20 z-[999] flex max-w-[360px] items-start gap-3 rounded-2xl border border-[#E2DEFF] bg-white p-4 shadow-[0_16px_40px_rgba(91,79,207,.18)]">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#EEF0FF] text-[#5B4FCF]">
              <Sparkles size={18} />
            </div>

            <div className="flex-1">
              <p className="text-sm font-extrabold text-[#13102B]">Testora</p>
              <p className="mt-1 text-sm font-semibold leading-6 text-[#6B6880]">
                {notice}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setNotice("")}
              className="grid h-8 w-8 place-items-center rounded-full text-[#6B6880] transition hover:bg-[#EEF0FF] hover:text-[#5B4FCF]"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="flex">
          <aside className="hidden min-h-[calc(100vh-62px)] w-[220px] shrink-0 flex-col gap-1 border-r border-[#E2DEFF] bg-white p-3 lg:flex">
            <p className="mt-2 px-3 py-1 text-[10px] font-bold tracking-wider text-[#6B6880]">
              MAIN
            </p>

            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#6B6880] transition hover:bg-[#EEF0FF] hover:text-[#5B4FCF]"
            >
              <Home size={18} /> Dashboard
            </Link>

            <Link
              href="/practice"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#6B6880] transition hover:bg-[#EEF0FF] hover:text-[#5B4FCF]"
            >
              <Target size={18} /> Practice
            </Link>

            <Link
              href="/results"
              className="flex items-center gap-3 rounded-xl border border-[#E2DEFF] bg-[#EEF0FF] px-4 py-3 text-sm font-bold text-[#5B4FCF]"
            >
              <BarChart3 size={18} /> Results
            </Link>

            <div className="my-3 h-px bg-[#E2DEFF]" />

            <p className="px-3 py-1 text-[10px] font-bold tracking-wider text-[#6B6880]">
              ACCOUNT
            </p>

            <Link
              href="/profile"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#6B6880] transition hover:bg-[#EEF0FF] hover:text-[#5B4FCF]"
            >
              <User size={18} /> Profile
            </Link>

            <Link
              href="/profile"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#6B6880] transition hover:bg-[#EEF0FF] hover:text-[#5B4FCF]"
            >
              <Settings size={18} /> Settings
            </Link>

            <div className="mt-auto rounded-2xl border border-[#E2DEFF] bg-[#F7F6FF] p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-extrabold text-[#13102B]">
                <Trophy size={17} className="text-[#5B4FCF]" /> Target Band
              </div>
              <p className="text-3xl font-extrabold text-[#5B4FCF]">
                {targetBand.toFixed(1)}
              </p>
              <p className="mt-1 text-xs text-[#6B6880]">
                {bandsToClose} bands to close
              </p>
            </div>
          </aside>

          <section className="flex-1 p-5 md:p-8">
            <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
              <div>
                <p className="mb-2 text-xs font-extrabold tracking-[0.18em] text-[#5B4FCF]">
                  RESULTS CENTER
                </p>
                <h1 className="text-3xl font-extrabold text-[#13102B]">
                  Your IELTS progress report
                </h1>
                <p className="mt-2 text-sm text-[#6B6880]">
                  Track your bands, weak areas and recent test performance in one clean dashboard.
                </p>
              </div>

              <div className="relative flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setShowDateMenu((value) => !value)}
                  className="flex items-center gap-2 rounded-xl border border-[#E2DEFF] bg-white px-4 py-3 text-sm font-bold text-[#6B6880] transition hover:-translate-y-0.5 hover:border-[#5B4FCF] hover:text-[#5B4FCF]"
                >
                  <CalendarDays size={17} /> {dateFilter}
                </button>

                {showDateMenu && (
                  <div className="absolute right-40 top-14 z-50 w-[180px] rounded-2xl border border-[#E2DEFF] bg-white p-2 shadow-[0_16px_40px_rgba(91,79,207,.18)]">
                    {(["All time", "Today", "Last 7 days", "Last 30 days"] as DateFilter[]).map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          setDateFilter(item);
                          setShowDateMenu(false);
                        }}
                        className={`w-full rounded-xl px-4 py-3 text-left text-sm font-bold transition hover:bg-[#EEF0FF] hover:text-[#5B4FCF] ${
                          dateFilter === item
                            ? "bg-[#EEF0FF] text-[#5B4FCF]"
                            : "text-[#6B6880]"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleExport}
                  className="flex items-center gap-2 rounded-xl bg-[#5B4FCF] px-4 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(91,79,207,.22)] transition hover:-translate-y-0.5 hover:bg-[#4740b8]"
                >
                  <Download size={17} /> Export report
                </button>
              </div>
            </div>

            {latestResult && (
              <div className="mb-5 rounded-2xl border border-[#5B4FCF] bg-white p-5 shadow-[0_10px_30px_rgba(91,79,207,.10)]">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#5B4FCF] text-white">
                      <Trophy size={25} />
                    </div>
                    <div>
                      <p className="text-[10px] font-extrabold tracking-widest text-[#6B6880]">
                        LATEST SAVED RESULT
                      </p>
                      <h2 className="text-xl font-extrabold text-[#13102B]">
                        {latestResult.title}
                      </h2>
                      <p className="mt-1 text-sm text-[#6B6880]">
                        {latestResult.type} · Score {latestResult.score}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[#EEF0FF] px-6 py-4 text-center">
                    <p className="text-[10px] font-extrabold tracking-wider text-[#6B6880]">
                      BAND
                    </p>
                    <p className="text-3xl font-extrabold text-[#5B4FCF]">
                      {latestResult.band}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {resultsError && (
              <div className="mb-5 rounded-2xl border border-[#E24B4A] bg-[#FFF0EE] p-5">
                <p className="font-extrabold text-[#E24B4A]">Could not load results</p>
                <p className="mt-1 text-sm font-semibold text-[#6B6880]">
                  {resultsError}
                </p>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "Overall band",
                  value: loadingResults ? "..." : overallBand,
                  sub: latestResult ? "Latest saved" : "No results yet",
                  icon: Award,
                  bg: "#EEF0FF",
                  color: "#5B4FCF",
                },
                {
                  label: "Tests completed",
                  value: loadingResults ? "..." : String(testsCompleted),
                  sub: "Filtered results",
                  icon: CheckCircle2,
                  bg: "#E1F5EE",
                  color: "#1D9E75",
                },
                {
                  label: "Best score",
                  value: loadingResults ? "..." : bestBand,
                  sub: bestSkill,
                  icon: Trophy,
                  bg: "#FAEEDA",
                  color: "#F5A623",
                },
                {
                  label: "Study time",
                  value: loadingResults ? "..." : studyTime,
                  sub: "Estimated from tests",
                  icon: Clock,
                  bg: "#FFF0EE",
                  color: "#E24B4A",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-[#E2DEFF] bg-white p-5 transition hover:-translate-y-1 hover:border-[#5B4FCF] hover:shadow-[0_10px_30px_rgba(91,79,207,.10)]"
                  >
                    <div
                      className="mb-4 grid h-11 w-11 place-items-center rounded-xl"
                      style={{ background: item.bg }}
                    >
                      <Icon size={20} color={item.color} />
                    </div>
                    <p className="text-xs font-semibold text-[#6B6880]">
                      {item.label}
                    </p>
                    <h3 className="mt-1 text-3xl font-extrabold text-[#13102B]">
                      {item.value}
                    </h3>
                    <p className="mt-1 text-xs text-[#6B6880]">{item.sub}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-2xl border border-[#E2DEFF] bg-white p-5 transition hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(91,79,207,.08)]">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-extrabold tracking-widest text-[#6B6880]">
                      BAND TREND
                    </p>
                    <h2 className="mt-1 text-lg font-extrabold text-[#13102B]">
                      Recent band growth
                    </h2>
                  </div>
                  <LineChart size={21} className="text-[#5B4FCF]" />
                </div>

                <div className="flex h-[260px] items-end gap-4 rounded-2xl bg-[#EEF0FF] p-5">
                  {weeklyBands.map((item) => (
                    <div
                      key={item.week}
                      className="flex flex-1 flex-col items-center justify-end gap-2"
                    >
                      <div className="text-xs font-extrabold text-[#5B4FCF]">
                        {item.band ? item.band.toFixed(1) : "0"}
                      </div>
                      <div
                        className="w-full rounded-t-xl bg-[#5B4FCF] shadow-[0_8px_18px_rgba(91,79,207,.18)] transition hover:bg-[#4740b8]"
                        style={{
                          height: `${Math.max(6, (item.band / 9) * 190)}px`,
                          opacity: item.band > 0 ? 1 : 0.25,
                        }}
                      />
                      <div className="text-xs font-bold text-[#6B6880]">
                        {item.week}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[#E2DEFF] bg-white p-5 transition hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(91,79,207,.08)]">
                <p className="text-[10px] font-extrabold tracking-widest text-[#6B6880]">
                  WEAK AREA
                </p>
                <h2 className="mt-1 text-lg font-extrabold text-[#13102B]">
                  What to improve next
                </h2>

                <div className="mt-5 space-y-3">
                  {weakAreas.map((item) => {
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.title}
                        href={item.href}
                        className="flex items-center gap-4 rounded-2xl border border-[#E2DEFF] bg-[#F7F6FF] p-4 transition hover:-translate-y-0.5 hover:border-[#5B4FCF] hover:bg-[#EEF0FF]"
                      >
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white">
                          <Icon size={20} color={item.color} />
                        </div>

                        <div className="flex-1">
                          <p className="font-bold text-[#13102B]">
                            {item.title}
                          </p>
                          <p className="text-sm text-[#6B6880]">{item.desc}</p>
                        </div>

                        <ArrowRight size={18} className="text-[#6B6880]" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-2xl border border-[#E2DEFF] bg-white p-5">
                <div className="mb-5">
                  <p className="text-[10px] font-extrabold tracking-widest text-[#6B6880]">
                    SKILL BREAKDOWN
                  </p>
                  <h2 className="mt-1 text-lg font-extrabold text-[#13102B]">
                    Current bands
                  </h2>
                </div>

                <div className="space-y-4">
                  {skillCards.map((skill) => {
                    const Icon = skill.icon;

                    return (
                      <div
                        key={skill.name}
                        className="rounded-2xl border border-[#E2DEFF] p-4 transition hover:-translate-y-1 hover:border-[#5B4FCF] hover:shadow-[0_8px_24px_rgba(91,79,207,.08)]"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="grid h-10 w-10 place-items-center rounded-xl"
                              style={{ background: skill.bg }}
                            >
                              <Icon size={19} color={skill.color} />
                            </div>

                            <div>
                              <p className="font-extrabold text-[#13102B]">
                                {skill.name}
                              </p>
                              <p className="text-xs text-[#6B6880]">
                                {skill.note}
                              </p>
                            </div>
                          </div>

                          <span
                            className="text-xl font-extrabold"
                            style={{ color: skill.color }}
                          >
                            {skill.band}
                          </span>
                        </div>

                        <div className="h-2 rounded-full bg-[#E2DEFF]">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${skill.progress}%`,
                              background: skill.color,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-[#E2DEFF] bg-white p-5">
                <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-[10px] font-extrabold tracking-widest text-[#6B6880]">
                      TEST HISTORY
                    </p>
                    <h2 className="mt-1 text-lg font-extrabold text-[#13102B]">
                      Recent results
                    </h2>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl border border-[#E2DEFF] bg-[#F7F6FF] px-3 py-2">
                    <Search size={16} className="text-[#6B6880]" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      className="w-36 bg-transparent text-sm outline-none placeholder:text-[#6B6880]"
                      placeholder="Search result"
                    />
                  </div>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                  {["All", "Full Mock", "Listening", "Reading", "Writing", "Speaking"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setFilter(item)}
                      className={`rounded-full border px-4 py-2 text-xs font-bold transition hover:-translate-y-0.5 ${
                        filter === item
                          ? "border-[#5B4FCF] bg-[#5B4FCF] text-white"
                          : "border-[#E2DEFF] bg-white text-[#6B6880] hover:border-[#5B4FCF] hover:text-[#5B4FCF]"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>

                {loadingResults ? (
                  <div className="rounded-2xl border border-dashed border-[#E2DEFF] p-8 text-center">
                    <Clock className="mx-auto mb-3 text-[#6B6880]" />
                    <p className="font-bold text-[#13102B]">
                      Loading real results...
                    </p>
                    <p className="text-sm text-[#6B6880]">
                      Reading from Supabase test_results table.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredResults.map((item) => {
                      const Icon = skillIcon(item.type);

                      return (
                        <div
                          key={item.id}
                          className="flex flex-col gap-3 rounded-2xl border border-[#E2DEFF] bg-white p-4 transition hover:-translate-y-1 hover:border-[#5B4FCF] hover:bg-[#F7F6FF] md:flex-row md:items-center"
                        >
                          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#EEF0FF] text-[#5B4FCF]">
                            <Icon size={20} />
                          </div>

                          <div className="flex-1">
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <h3 className="font-extrabold text-[#13102B]">
                                {item.title}
                              </h3>
                              <span
                                className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${getTypeStyle(item.type)}`}
                              >
                                {item.type}
                              </span>
                            </div>

                            <p className="text-xs text-[#6B6880]">
                              {item.date} · {item.time} · {item.score}
                            </p>
                          </div>

                          <div className="flex items-center justify-between gap-4 md:block md:text-right">
                            <p className="text-2xl font-extrabold text-[#5B4FCF]">
                              {item.band}
                            </p>
                            <p className="text-xs font-semibold text-[#6B6880]">
                              {item.status}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {!loadingResults && filteredResults.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-[#E2DEFF] p-8 text-center">
                    <Lock className="mx-auto mb-3 text-[#6B6880]" />
                    <p className="font-bold text-[#13102B]">No results found</p>
                    <p className="text-sm text-[#6B6880]">
                      Complete a practice test and submit it to save a real result.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </ProtectedPage>
  );
}