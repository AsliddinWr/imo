"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import UserBadge from "@/components/UserBadge";
import { supabase } from "@/lib/supabase";
import {
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Download,
  FileQuestion,
  FileText,
  Filter,
  GraduationCap,
  Headphones,
  Home,
  Layers,
  LockKeyhole,
  Mail,
  Mic,
  MoreHorizontal,
  Pencil,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  X,
} from "lucide-react";

type SkillKey = "listening" | "reading" | "writing" | "speaking" | "fullmock";

type TestResultRow = {
  id: string;
  user_id: string;
  test_id: string;
  skill: SkillKey;
  score: number;
  total: number;
  band: string;
  status: string;
  created_at: string;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
};

type ResultItem = {
  id: string;
  userId: string;
  student: string;
  email: string;
  test: string;
  skill: string;
  score: string;
  band: string;
  status: string;
  date: string;
  rawDate: string;
  time: string;
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

function titleFromTestId(testId: string, skill: string) {
  return `${formatSkill(skill)} test — ${testId}`;
}

function skillBadge(skill: string) {
  if (skill === "Listening") return "bg-indigo-50 text-indigo-600";
  if (skill === "Reading") return "bg-blue-50 text-blue-600";
  if (skill === "Writing") return "bg-rose-50 text-rose-600";
  if (skill === "Speaking") return "bg-emerald-50 text-emerald-600";
  if (skill === "Full Mock") return "bg-purple-50 text-purple-600";
  return "bg-amber-50 text-amber-600";
}

function statusBadge(status: string) {
  if (status === "Completed") return "bg-emerald-50 text-emerald-600";
  if (status === "Reviewed") return "bg-blue-50 text-blue-600";
  if (status === "Submitted") return "bg-purple-50 text-purple-600";
  return "bg-amber-50 text-amber-600";
}

function skillIcon(skill: string) {
  if (skill === "Listening") return Headphones;
  if (skill === "Reading") return BookOpen;
  if (skill === "Writing") return Pencil;
  if (skill === "Speaking") return Mic;
  return Trophy;
}

function mapResult(item: TestResultRow, profile?: ProfileRow): ResultItem {
  return {
    id: item.id,
    userId: item.user_id,
    student: profile?.full_name || profile?.email || "Unknown student",
    email: profile?.email || "No email",
    test: titleFromTestId(item.test_id, item.skill),
    skill: formatSkill(item.skill),
    score: `${item.score}/${item.total}`,
    band: item.band,
    status: item.status || "Submitted",
    date: formatDate(item.created_at),
    rawDate: item.created_at,
    time: "Saved",
  };
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

function escapeCsv(value: string | number) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function downloadCsv(results: ResultItem[]) {
  const headers = [
    "Student",
    "Email",
    "Test",
    "Skill",
    "Score",
    "Band",
    "Status",
    "Date",
  ];

  const rows = results.map((item) => [
    item.student,
    item.email,
    item.test,
    item.skill,
    item.score,
    item.band,
    item.status,
    item.date,
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
  link.download = `englishpeak-results-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function AdminResultsPage() {
  const [pageMounted, setPageMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState<DateFilter>("All time");
  const [showDateMenu, setShowDateMenu] = useState(false);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setPageMounted(true);
  }, []);

  useEffect(() => {
    if (!pageMounted) return;

    let mounted = true;

    async function loadAdminResults() {
      setLoading(true);
      setErrorMessage("");

      const { data: resultRows, error: resultsError } = await supabase
        .from("test_results")
        .select("id, user_id, test_id, skill, score, total, band, status, created_at")
        .order("created_at", { ascending: false });

      if (!mounted) return;

      if (resultsError) {
        setErrorMessage(resultsError.message);
        setLoading(false);
        return;
      }

      const rows = (resultRows || []) as TestResultRow[];
      const userIds = Array.from(new Set(rows.map((item) => item.user_id)));

      let profileMap = new Map<string, ProfileRow>();

      if (userIds.length > 0) {
        const { data: profileRows, error: profilesError } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", userIds);

        if (!mounted) return;

        if (profilesError) {
          setErrorMessage(profilesError.message);
          setLoading(false);
          return;
        }

        profileMap = new Map(
          ((profileRows || []) as ProfileRow[]).map((profile) => [
            profile.id,
            profile,
          ])
        );
      }

      setResults(rows.map((item) => mapResult(item, profileMap.get(item.user_id))));
      setLoading(false);
    }

    loadAdminResults();

    return () => {
      mounted = false;
    };
  }, [pageMounted]);

  const filteredResults = useMemo(() => {
    return results.filter((item) => {
      const searchText = `${item.student} ${item.email} ${item.test} ${item.skill} ${item.status}`.toLowerCase();
      const matchesQuery = searchText.includes(query.toLowerCase());

      const matchesFilter =
        filter === "All" || item.skill === filter || item.status === filter;

      const matchesDate = isInsideDateFilter(item.rawDate, dateFilter);

      return matchesQuery && matchesFilter && matchesDate;
    });
  }, [query, filter, dateFilter, results]);

  const submittedCount = filteredResults.length;

  const averageBand =
    filteredResults.length > 0
      ? (
          filteredResults.reduce(
            (total, item) => total + (Number(item.band) || 0),
            0
          ) / filteredResults.length
        ).toFixed(1)
      : "0";

  const needReview = filteredResults.filter(
    (item) => item.skill === "Writing" || item.skill === "Speaking"
  ).length;

  const activeStudents = new Set(filteredResults.map((item) => item.userId)).size;

  const skillAverages = useMemo(() => {
    const skills = [
      { skill: "Listening", icon: Headphones, color: "#071A52", bg: "#FFF0EC" },
      { skill: "Reading", icon: BookOpen, color: "#378ADD", bg: "#EBF5FF" },
      { skill: "Writing", icon: Pencil, color: "#E24B4A", bg: "#FFF0EE" },
      { skill: "Speaking", icon: Mic, color: "#1D9E75", bg: "#E1F5EE" },
    ];

    return skills.map((skill) => {
      const items = filteredResults.filter((item) => item.skill === skill.skill);

      const average =
        items.length > 0
          ? items.reduce((sum, item) => sum + (Number(item.band) || 0), 0) /
            items.length
          : 0;

      return {
        ...skill,
        band: average ? average.toFixed(1) : "0",
        progress: Math.min(100, Math.round((average / 9) * 100)),
      };
    });
  }, [filteredResults]);

  function showNotice(message: string) {
    setNotice(message);

    window.setTimeout(() => {
      setNotice("");
    }, 2800);
  }

  function handleExport() {
    if (filteredResults.length === 0) {
      showNotice("Export qilish uchun natija topilmadi.");
      return;
    }

    downloadCsv(filteredResults);
    showNotice("Results CSV formatda yuklab olindi.");
  }

  function handleMail(item: ResultItem) {
    if (!item.email || item.email === "No email") {
      showNotice("Bu student uchun email topilmadi.");
      return;
    }

    const subject = encodeURIComponent("Your EnglishPeak result");
    const body = encodeURIComponent(
      `Hi ${item.student},\n\nYour result has been recorded.\n\nTest: ${item.test}\nScore: ${item.score}\nBand: ${item.band}\nStatus: ${item.status}\n\nBest regards,\nEnglishPeak`
    );

    window.location.href = `mailto:${item.email}?subject=${subject}&body=${body}`;
  }

  if (!pageMounted) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#F5F7FC] text-[#1A1729]">
      <nav className="sticky top-0 z-50 flex h-[62px] items-center justify-between border-b border-[#DDE4F3] bg-white px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-[34px] w-[34px] flex-col items-center justify-center gap-[3px] rounded-[9px] bg-[#071A52]">
            <div className="h-[2.5px] w-[17px] rounded bg-white" />
            <div className="h-[11px] w-1 rounded bg-white" />
          </div>
          <span className="text-lg font-extrabold tracking-[2px] text-[#13102B]">
            ENGLISH<span className="text-[#071A52]">PEAK</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          <Link
            href="/dashboard"
            className="rounded-[10px] px-4 py-2 text-sm font-semibold text-[#6B6880] transition hover:bg-[#FFF0EC] hover:text-[#071A52]"
          >
            Student Panel
          </Link>
          <Link
            href="/practice"
            className="rounded-[10px] px-4 py-2 text-sm font-semibold text-[#6B6880] transition hover:bg-[#FFF0EC] hover:text-[#071A52]"
          >
            Practice
          </Link>
          <Link
            href="/studytools"
            className="rounded-[10px] px-4 py-2 text-sm font-semibold text-[#6B6880] transition hover:bg-[#FFF0EC] hover:text-[#071A52]"
          >
            Study tools
          </Link>
          <Link
            href="/admin"
            className="rounded-[10px] bg-[#071A52] px-4 py-2 text-sm font-semibold text-white"
          >
            Admin
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              showNotice(
                "Upgrade Plan bo‘limi tayyorlanmoqda. Admin hozir barcha resultlarni ko‘ra oladi."
              )
            }
            className="hidden items-center gap-2 rounded-full bg-[#071A52] px-5 py-2 text-sm font-bold text-white shadow-[0_8px_24px_rgba(7,26,82,.22)] transition hover:-translate-y-0.5 hover:bg-[#0D2A6B] md:flex"
          >
            <Sparkles size={16} /> Upgrade Plan
          </button>

          <button
            type="button"
            onClick={() =>
              showNotice("Hozircha yangi admin notification yo‘q.")
            }
            className="grid h-10 w-10 place-items-center rounded-full border border-[#DDE4F3] bg-white text-[#6B6880] transition hover:-translate-y-0.5 hover:bg-[#FFF0EC] hover:text-[#071A52]"
          >
            <Bell size={18} />
          </button>

          <UserBadge />
        </div>
      </nav>

      {notice && (
        <div className="fixed right-5 top-20 z-[999] flex max-w-[360px] items-start gap-3 rounded-2xl border border-[#DDE4F3] bg-white p-4 shadow-[0_16px_40px_rgba(7,26,82,.18)]">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#FFF0EC] text-[#071A52]">
            <Sparkles size={18} />
          </div>

          <div className="flex-1">
            <p className="text-sm font-extrabold text-[#13102B]">EnglishPeak</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-[#6B6880]">
              {notice}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setNotice("")}
            className="grid h-8 w-8 place-items-center rounded-full text-[#6B6880] transition hover:bg-[#FFF0EC] hover:text-[#071A52]"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex">
        <aside className="hidden min-h-[calc(100vh-62px)] w-[240px] shrink-0 flex-col gap-1 border-r border-[#DDE4F3] bg-white p-3 lg:flex">
          <p className="mt-2 px-3 py-1 text-[10px] font-bold tracking-wider text-[#6B6880]">
            ADMIN MAIN
          </p>

          {[
            { label: "Overview", icon: Home, href: "/admin" },
            { label: "Students", icon: Users, href: "/admin/students" },
            { label: "Teachers", icon: GraduationCap, href: "/admin/teachers" },
            { label: "Courses", icon: Layers, href: "/admin/courses" },
            { label: "Tests", icon: FileText, href: "/admin/tests" },
            { label: "Questions", icon: FileQuestion, href: "/admin/questions" },
            { label: "Results", icon: BarChart3, href: "/admin/results", active: true },
            { label: "Payments", icon: CreditCard, href: "/admin/payments" },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition hover:bg-[#FFF0EC] hover:text-[#071A52] ${
                  item.active
                    ? "border border-[#DDE4F3] bg-[#FFF0EC] font-bold text-[#071A52]"
                    : "font-semibold text-[#6B6880]"
                }`}
              >
                <Icon size={18} /> {item.label}
              </Link>
            );
          })}

          <div className="my-3 h-px bg-[#DDE4F3]" />

          <p className="px-3 py-1 text-[10px] font-bold tracking-wider text-[#6B6880]">
            SYSTEM
          </p>

          <Link
            href="/admin/settings"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#6B6880] transition hover:bg-[#FFF0EC] hover:text-[#071A52]"
          >
            <Settings size={18} /> Settings
          </Link>

          <button
            type="button"
            onClick={() =>
              showNotice(
                "Roles & Access hozir admin layout orqali ishlayapti. To‘liq role management keyingi update’da qo‘shiladi."
              )
            }
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#6B6880] transition hover:bg-[#FFF0EC] hover:text-[#071A52]"
          >
            <LockKeyhole size={18} /> Roles & Access
          </button>

          <div className="mt-auto rounded-2xl border border-[#DDE4F3] bg-[#F8FAFE] p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-extrabold text-[#13102B]">
              <ShieldCheck size={17} className="text-[#071A52]" /> Admin Status
            </div>
            <p className="text-2xl font-extrabold text-[#071A52]">Owner</p>
            <p className="mt-1 text-xs text-[#6B6880]">Full platform access</p>
          </div>
        </aside>

        <section className="flex-1 p-5 md:p-8">
          <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
            <div>
              <p className="mb-2 text-xs font-extrabold tracking-[0.18em] text-[#071A52]">
                ADMIN RESULTS
              </p>
              <h1 className="text-3xl font-extrabold text-[#13102B]">
                Student results overview
              </h1>
              <p className="mt-2 text-sm text-[#6B6880]">
                Real student test results from Supabase test_results table.
              </p>
            </div>

            <div className="relative flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setShowDateMenu((value) => !value)}
                className="flex items-center gap-2 rounded-xl border border-[#DDE4F3] bg-white px-4 py-3 text-sm font-bold text-[#6B6880] transition hover:-translate-y-0.5 hover:border-[#071A52] hover:text-[#071A52]"
              >
                <CalendarDays size={17} /> {dateFilter}
              </button>

              {showDateMenu && (
                <div className="absolute right-40 top-14 z-50 w-[180px] rounded-2xl border border-[#DDE4F3] bg-white p-2 shadow-[0_16px_40px_rgba(7,26,82,.18)]">
                  {(["All time", "Today", "Last 7 days", "Last 30 days"] as DateFilter[]).map(
                    (item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          setDateFilter(item);
                          setShowDateMenu(false);
                        }}
                        className={`w-full rounded-xl px-4 py-3 text-left text-sm font-bold transition hover:bg-[#FFF0EC] hover:text-[#071A52] ${
                          dateFilter === item
                            ? "bg-[#FFF0EC] text-[#071A52]"
                            : "text-[#6B6880]"
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={handleExport}
                className="flex items-center gap-2 rounded-xl bg-[#071A52] px-4 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(7,26,82,.22)] transition hover:-translate-y-0.5 hover:bg-[#0D2A6B]"
              >
                <Download size={17} /> Export results
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-5 rounded-2xl border border-[#E24B4A] bg-[#FFF0EE] p-5">
              <p className="font-extrabold text-[#E24B4A]">
                Could not load admin results
              </p>
              <p className="mt-1 text-sm font-semibold text-[#6B6880]">
                {errorMessage}
              </p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Submitted tests",
                value: loading ? "..." : String(submittedCount),
                sub: "Filtered results",
                icon: CheckCircle2,
                bg: "#FFF0EC",
                color: "#071A52",
              },
              {
                label: "Average band",
                value: loading ? "..." : averageBand,
                sub: "Filtered learners",
                icon: Trophy,
                bg: "#E1F5EE",
                color: "#1D9E75",
              },
              {
                label: "Need review",
                value: loading ? "..." : String(needReview),
                sub: "Writing/Speaking",
                icon: Pencil,
                bg: "#FAEEDA",
                color: "#F5A623",
              },
              {
                label: "Active students",
                value: loading ? "..." : String(activeStudents),
                sub: "With filtered results",
                icon: Users,
                bg: "#FFF0EE",
                color: "#E24B4A",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="rounded-2xl border border-[#DDE4F3] bg-white p-5 transition hover:-translate-y-1 hover:border-[#071A52] hover:shadow-[0_10px_30px_rgba(7,26,82,.10)]"
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

          <div className="mt-5 grid gap-5 xl:grid-cols-[0.75fr_1.25fr]">
            <div className="rounded-2xl border border-[#DDE4F3] bg-white p-5">
              <p className="text-[10px] font-extrabold tracking-widest text-[#6B6880]">
                SKILL AVERAGES
              </p>
              <h2 className="mt-1 text-lg font-extrabold text-[#13102B]">
                Overall performance
              </h2>

              <div className="mt-5 space-y-4">
                {skillAverages.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.skill}
                      className="rounded-2xl border border-[#DDE4F3] p-4 transition hover:-translate-y-1 hover:border-[#071A52]"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="grid h-10 w-10 place-items-center rounded-xl"
                            style={{ background: item.bg }}
                          >
                            <Icon size={19} color={item.color} />
                          </div>
                          <p className="font-extrabold text-[#13102B]">
                            {item.skill}
                          </p>
                        </div>
                        <p
                          className="text-xl font-extrabold"
                          style={{ color: item.color }}
                        >
                          {item.band}
                        </p>
                      </div>

                      <div className="h-2 rounded-full bg-[#DDE4F3]">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${item.progress}%`,
                            background: item.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-[#DDE4F3] bg-white p-5">
              <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-[10px] font-extrabold tracking-widest text-[#6B6880]">
                    RESULT LIST
                  </p>
                  <h2 className="mt-1 text-lg font-extrabold text-[#13102B]">
                    All submitted results
                  </h2>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="flex items-center gap-2 rounded-xl border border-[#DDE4F3] bg-[#F8FAFE] px-3 py-2">
                    <Search size={16} className="text-[#6B6880]" />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      className="w-56 bg-transparent text-sm outline-none placeholder:text-[#6B6880]"
                      placeholder="Search student, test, skill"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setFilter("All");
                      setDateFilter("All time");
                      showNotice("Filters reset qilindi.");
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl border border-[#DDE4F3] bg-white px-4 py-2 text-sm font-bold text-[#6B6880] transition hover:border-[#071A52] hover:text-[#071A52]"
                  >
                    <Filter size={16} /> Reset
                  </button>
                </div>
              </div>

              <div className="mb-5 flex flex-wrap gap-2">
                {[
                  "All",
                  "Listening",
                  "Reading",
                  "Writing",
                  "Speaking",
                  "Full Mock",
                  "Submitted",
                  "Completed",
                  "Reviewed",
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFilter(item)}
                    className={`rounded-full border px-4 py-2 text-xs font-bold transition hover:-translate-y-0.5 ${
                      filter === item
                        ? "border-[#071A52] bg-[#071A52] text-white"
                        : "border-[#DDE4F3] bg-white text-[#6B6880] hover:border-[#071A52] hover:text-[#071A52]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="rounded-2xl border border-dashed border-[#DDE4F3] p-8 text-center">
                  <BarChart3 className="mx-auto mb-3 text-[#6B6880]" />
                  <p className="font-bold text-[#13102B]">
                    Loading admin results...
                  </p>
                  <p className="text-sm text-[#6B6880]">
                    Reading all saved results from Supabase.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredResults.map((item) => {
                    const Icon = skillIcon(item.skill);

                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-[#DDE4F3] bg-white p-4 transition hover:-translate-y-1 hover:border-[#071A52] hover:bg-[#F8FAFE]"
                      >
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                          <div className="flex flex-1 gap-4">
                            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#FFF0EC] text-[#071A52]">
                              <Icon size={21} />
                            </div>

                            <div className="flex-1">
                              <div className="mb-2 flex flex-wrap items-center gap-2">
                                <h3 className="font-extrabold text-[#13102B]">
                                  {item.student}
                                </h3>
                                <span
                                  className={`rounded-full px-3 py-1 text-[10px] font-extrabold ${skillBadge(item.skill)}`}
                                >
                                  {item.skill}
                                </span>
                                <span
                                  className={`rounded-full px-3 py-1 text-[10px] font-extrabold ${statusBadge(item.status)}`}
                                >
                                  {item.status}
                                </span>
                              </div>

                              <p className="text-xs font-semibold text-[#6B6880]">
                                {item.email}
                              </p>
                              <p className="mt-1 text-sm font-bold text-[#13102B]">
                                {item.test}
                              </p>

                              <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold text-[#6B6880]">
                                <span>{item.date}</span>
                                <span>·</span>
                                <span>{item.time}</span>
                                <span>·</span>
                                <span>Score {item.score}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 xl:flex-col xl:items-end">
                            <div className="rounded-2xl bg-[#FFF0EC] px-5 py-3 text-center">
                              <p className="text-[10px] font-extrabold tracking-wider text-[#6B6880]">
                                BAND
                              </p>
                              <p className="text-2xl font-extrabold text-[#071A52]">
                                {item.band}
                              </p>
                            </div>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleMail(item)}
                                className="grid h-9 w-9 place-items-center rounded-xl border border-[#DDE4F3] text-[#6B6880] transition hover:border-[#071A52] hover:text-[#071A52]"
                              >
                                <Mail size={16} />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  showNotice(
                                    `${item.student}: ${item.skill} result — Band ${item.band}, Score ${item.score}`
                                  )
                                }
                                className="grid h-9 w-9 place-items-center rounded-xl border border-[#DDE4F3] text-[#6B6880] transition hover:border-[#071A52] hover:text-[#071A52]"
                              >
                                <MoreHorizontal size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {!loading && filteredResults.length === 0 && (
                <div className="mt-5 rounded-2xl border border-dashed border-[#DDE4F3] p-8 text-center">
                  <BarChart3 className="mx-auto mb-3 text-[#6B6880]" />
                  <p className="font-bold text-[#13102B]">No results found</p>
                  <p className="text-sm text-[#6B6880]">
                    Try another search keyword or complete more student tests.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
