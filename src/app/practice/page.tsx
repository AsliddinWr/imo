"use client";

import Image from "next/image";
import Link from "next/link";
import ProtectedPage from "@/components/ProtectedPage";
import UserBadge from "@/components/UserBadge";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  ArrowRight,
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock,
  FileText,
  Headphones,
  Lock,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";

type SectionKey = "listening" | "reading" | "writing" | "speaking" | "fullmock";

type TestRow = {
  id: string;
  title: string;
  skill: SectionKey;
  level: string | null;
  duration_minutes: number | null;
  description: string | null;
  is_active: boolean;
};

type QuestionCountRow = {
  test_id: string;
};

type ResultRow = {
  id?: string;
  test_id: string;
  band: string;
  score?: number | null;
  total?: number | null;
  status?: string | null;
  spent_time_seconds?: number | null;
  created_at: string;
};

type TestItem = {
  id: string;
  title: string;
  parts: string;
  free: boolean;
  time: string;
  durationMinutes: number;
  questions: string;
  attempts: string;
  completed: boolean;
  skill: SectionKey;
};

type Section = {
  key: SectionKey;
  label: string;
  icon: string;
  title: string;
  desc: string;
  tabs: string[];
};

const sectionMeta: Section[] = [
  {
    key: "listening",
    label: "Listening",
    icon: "/pr-listening.png",
    title: "Listening Practice",
    desc: "Improve your listening skills with real IELTS-style listening tasks.",
    tabs: ["All parts", "Part 1", "Part 2", "Part 3", "Part 4", "Full tests"],
  },
  {
    key: "reading",
    label: "Reading",
    icon: "/pr-reading.png",
    title: "Reading Practice",
    desc: "Improve your reading skills with real IELTS-style academic passages.",
    tabs: ["All parts", "Passage 1", "Passage 2", "Passage 3", "Full tests"],
  },
  {
    key: "writing",
    label: "Writing",
    icon: "/pr-writing.png",
    title: "Writing Practice",
    desc: "Practise Task 1 and Task 2 writing with real band descriptor feedback.",
    tabs: ["All tasks", "Task 1", "Task 2"],
  },
  {
    key: "speaking",
    label: "Speaking",
    icon: "/pr-speaking.png",
    title: "Speaking Practice",
    desc: "Practise all three parts of the IELTS Speaking test with examiner-style questions.",
    tabs: ["All parts", "Part 1", "Part 2", "Part 3"],
  },
  {
    key: "fullmock",
    label: "Full Mock",
    icon: "/pr-fullmock.png",
    title: "Full Mock Tests",
    desc: "Complete full IELTS mock tests covering all four skills in one sitting.",
    tabs: ["All tests", "Academic", "General"],
  },
];

function isSectionKey(value: string | null): value is SectionKey {
  return (
    value === "listening" ||
    value === "reading" ||
    value === "writing" ||
    value === "speaking" ||
    value === "fullmock"
  );
}

function getPartsLabel(test: TestRow) {
  if (test.skill === "reading") {
    return test.description?.toLowerCase().includes("passage")
      ? "Parts: 1"
      : "IELTS Reading";
  }

  if (test.skill === "listening") return "Parts: 1";
  if (test.skill === "writing") return "Task practice";
  if (test.skill === "speaking") return "Speaking practice";

  return "All 4 skills";
}

function formatDuration(minutes: number | null) {
  if (!minutes) return "No limit";

  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return mins ? `${hours}h ${mins}m` : `${hours}h`;
  }

  return `${minutes} min`;
}

function formatTimeSpent(seconds: number) {
  const safeSeconds = Math.max(0, Math.round(Number(seconds) || 0));
  if (!safeSeconds) return "0 min";

  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return mins ? `${hours}h ${mins}m` : `${hours}h`;
  }

  if (minutes <= 0) return `${remainingSeconds}s`;

  return remainingSeconds
    ? `${minutes}m ${remainingSeconds}s`
    : `${minutes} min`;
}

function buildTestItems(
  tests: TestRow[],
  questionCounts: Record<string, number>,
  attempts: Record<string, number>,
  completedTests: Set<string>,
): TestItem[] {
  return tests.map((test) => {
    const count = questionCounts[test.id] || 0;
    const attemptCount = attempts[test.id] || 0;
    const durationMinutes = test.duration_minutes || 0;

    return {
      id: test.id,
      title: test.title,
      skill: test.skill,
      parts: getPartsLabel(test),
      free: true,
      time: formatDuration(test.duration_minutes),
      durationMinutes,
      questions:
        test.skill === "writing"
          ? "1 task"
          : test.skill === "speaking"
            ? "Speaking tasks"
            : `${count} questions`,
      attempts: `${attemptCount} attempts`,
      completed: completedTests.has(test.id),
    };
  });
}

function averageBand(results: ResultRow[]) {
  const values = results
    .map((result) => Number(result.band))
    .filter((value) => Number.isFinite(value));

  if (values.length === 0) return "0 Band";

  return `${(
    values.reduce((sum, value) => sum + value, 0) / values.length
  ).toFixed(1)} Band`;
}

function highestBand(results: ResultRow[]) {
  const values = results
    .map((result) => Number(result.band))
    .filter((value) => Number.isFinite(value));

  if (values.length === 0) return "0 Band";

  return `${Math.max(...values).toFixed(1)} Band`;
}

function isCompletedResult(result: ResultRow) {
  const status = String(result.status || "submitted").toLowerCase();
  return !status.includes("draft") && !status.includes("progress");
}

function safeBandValue(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function getPrimaryResultsByTest(results: ResultRow[]) {
  const map = new Map<string, ResultRow>();

  results.filter(isCompletedResult).forEach((result) => {
    const previous = map.get(result.test_id);
    if (!previous) {
      map.set(result.test_id, result);
      return;
    }

    const currentBand = safeBandValue(result.band);
    const previousBand = safeBandValue(previous.band);
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
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

function calculateTimeSpent(results: ResultRow[]) {
  return results.reduce((total, result) => {
    return total + Math.max(0, Number(result.spent_time_seconds) || 0);
  }, 0);
}

export default function PracticePage() {
  const [pageMounted, setPageMounted] = useState(false);
  const [activeKey, setActiveKey] = useState<SectionKey>("listening");
  const [activeTab, setActiveTab] = useState("All parts");
  const [tests, setTests] = useState<TestItem[]>([]);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setPageMounted(true);
  }, []);

  useEffect(() => {
    if (!pageMounted) return;

    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");

    if (isSectionKey(tab)) {
      const selectedSection =
        sectionMeta.find((section) => section.key === tab) ?? sectionMeta[0];

      setActiveKey(selectedSection.key);
      setActiveTab(selectedSection.tabs[0]);
    }
  }, [pageMounted]);

  const activeSection = useMemo(
    () =>
      sectionMeta.find((section) => section.key === activeKey) ??
      sectionMeta[0],
    [activeKey],
  );

  const activeTests = useMemo(
    () => tests.filter((test) => test.skill === activeKey),
    [tests, activeKey],
  );

  const activeResults = useMemo(() => {
    const ids = new Set(activeTests.map((test) => test.id));
    return results.filter((result) => ids.has(result.test_id));
  }, [results, activeTests]);

  const activePrimaryResults = useMemo(
    () => getPrimaryResultsByTest(activeResults),
    [activeResults],
  );

  const timeSpent = useMemo(
    () => calculateTimeSpent(activeResults),
    [activeResults],
  );

  useEffect(() => {
    if (!pageMounted) return;

    let mounted = true;

    async function loadPracticeData() {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: testRows, error: testsError } = await supabase
        .from("tests")
        .select(
          "id, title, skill, level, duration_minutes, description, is_active",
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (!mounted) return;

      if (testsError) {
        setErrorMessage(testsError.message);
        setLoading(false);
        return;
      }

      const rows = (testRows || []) as TestRow[];
      const testIds = rows.map((item) => item.id);

      const questionCounts: Record<string, number> = {};
      const attemptCounts: Record<string, number> = {};
      let userResults: ResultRow[] = [];
      let completedTestIds = new Set<string>();

      if (testIds.length > 0) {
        const { data: questionRows, error: questionsError } = await supabase
          .from("questions")
          .select("test_id")
          .in("test_id", testIds);

        if (questionsError) {
          setErrorMessage(questionsError.message);
        }

        ((questionRows || []) as QuestionCountRow[]).forEach((item) => {
          questionCounts[item.test_id] =
            (questionCounts[item.test_id] || 0) + 1;
        });
      }

      if (user?.id) {
        const { data: resultRows, error: resultsError } = await supabase
          .from("test_results")
          .select(
            "id, test_id, band, score, total, status, spent_time_seconds, created_at",
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (resultsError) {
          setErrorMessage(resultsError.message);
        }

        userResults = (resultRows || []) as ResultRow[];

        userResults.forEach((item) => {
          attemptCounts[item.test_id] = (attemptCounts[item.test_id] || 0) + 1;
        });

        completedTestIds = new Set(
          userResults.filter(isCompletedResult).map((item) => item.test_id),
        );
      }

      if (!mounted) return;

      setTests(
        buildTestItems(rows, questionCounts, attemptCounts, completedTestIds),
      );
      setResults(userResults);
      setLoading(false);
    }

    loadPracticeData();

    return () => {
      mounted = false;
    };
  }, [pageMounted]);

  function changeSection(key: SectionKey) {
    const next =
      sectionMeta.find((section) => section.key === key) ?? sectionMeta[0];

    setActiveKey(key);
    setActiveTab(next.tabs[0]);

    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `/practice?tab=${key}`);
    }
  }

  function showNotice(message: string) {
    setNotice(message);

    window.setTimeout(() => {
      setNotice("");
    }, 2800);
  }

  if (!pageMounted) {
    return null;
  }

  const stats = [
    {
      label: "Total tests",
      value: loading ? "..." : activeTests.length,
      icon: FileText,
      bg: "#FFF0EC",
      color: "#071A52",
    },
    {
      label: "Completed",
      value: loading ? "..." : activePrimaryResults.length,
      icon: CheckCircle2,
      bg: "#E0F7F0",
      color: "#00B894",
    },
    {
      label: "Average score",
      value: loading ? "..." : averageBand(activePrimaryResults),
      icon: BarChart3,
      bg: "#FFF8E0",
      color: "#FDCB6E",
    },
    {
      label: "Highest score",
      value: loading ? "..." : highestBand(activePrimaryResults),
      icon: Trophy,
      bg: "#FFE8E0",
      color: "#E17055",
    },
    {
      label: "Time spent",
      value: loading ? "..." : formatTimeSpent(timeSpent),
      icon: Clock,
      bg: "#E8F4FD",
      color: "#74B9FF",
    },
  ];

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
              { href: "/dashboard", label: "Dashboard" },
              { href: "/practice", label: "Practice", active: true },
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
                  "Upgrade Plan bo‘limi tayyorlanmoqda. Hozircha barcha practice testlar Free holatda ishlaydi.",
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
                  "Hozircha yangi notification yo‘q. Test natijalari va admin xabarlari keyin shu yerda chiqadi.",
                )
              }
              className="grid h-10 w-10 place-items-center rounded-xl border border-[rgba(7,26,82,0.15)] text-[#4A4A4A] outline-none transition-colors duration-150 hover:bg-[#F5F7FC] hover:text-[#071A52] focus:ring-2 focus:ring-[#071A52]/25"
            >
              <Bell size={18} />
            </button>

            <button
              type="button"
              aria-label="Open support"
              onClick={() =>
                showNotice("Support markazi keyingi update’da ulanadi.")
              }
              className="grid h-10 w-10 place-items-center rounded-xl border border-[rgba(7,26,82,0.15)] text-[#4A4A4A] outline-none transition-colors duration-150 hover:bg-[#F5F7FC] hover:text-[#071A52] focus:ring-2 focus:ring-[#071A52]/25"
            >
              <Headphones size={18} />
            </button>

            <UserBadge />
          </div>
        </nav>

        <div className="flex">
          <aside className="hidden min-h-[calc(100vh-60px)] w-[220px] shrink-0 flex-col gap-1 border-r border-[rgba(7,26,82,0.15)] bg-white p-3 lg:flex">
            {sectionMeta.map((section) => (
              <button
                key={section.key}
                type="button"
                aria-label={`Open ${section.label} practice`}
                onClick={() => changeSection(section.key)}
                className={`relative flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm outline-none transition-all duration-150 focus:ring-2 focus:ring-[#071A52]/25 ${
                  activeKey === section.key
                    ? "border-[rgba(7,26,82,0.25)] bg-gradient-to-br from-[#FFF0EC] to-[#FFE2DB] font-bold text-[#071A52] shadow-[0_2px_8px_rgba(7,26,82,0.08)]"
                    : "border-transparent font-semibold text-[#4A4A4A] hover:bg-[#F5F7FC] hover:text-[#071A52]"
                }`}
              >
                {activeKey === section.key && (
                  <div className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[#071A52]" />
                )}

                <Image
                  src={section.icon}
                  alt=""
                  width={32}
                  height={32}
                  loading="lazy"
                  className="h-8 w-8 shrink-0 object-contain"
                />

                {section.label}
              </button>
            ))}

            <button
              type="button"
              aria-label="Change exam type"
              onClick={() =>
                showNotice(
                  "Exam type hozir IELTS. CEFR/IELTS almashtirish Profile sahifasida qo‘shiladi.",
                )
              }
              className="mt-auto rounded-2xl border border-[rgba(7,26,82,0.15)] bg-gradient-to-br from-[#FFF0EC] to-[#FFE2DB] p-4 text-left outline-none transition-all duration-150 hover:border-[rgba(7,26,82,0.35)] focus:ring-2 focus:ring-[#071A52]/25"
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#8A8A8A]">
                EXAM TYPE
              </p>

              <div className="mt-2 flex items-center justify-between">
                <p className="font-black text-[#0A0A0A]">IELTS</p>
                <ChevronDown size={15} className="text-[#8A8A8A]" />
              </div>
            </button>
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

            <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {stats.map((item, index) => {
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
                  </div>
                );
              })}
            </div>

            <div
              className="mb-5 animate-fade-up"
              style={{ animationDelay: "0.18s" }}
            >
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#071A52]">
                PRACTICE CENTER
              </p>

              <h1 className="text-xl font-black tracking-[-0.02em] text-[#0A0A0A]">
                {activeSection.title}
              </h1>

              <p className="mt-1 text-xs font-medium text-[#4A4A4A]">
                {activeSection.desc}
              </p>
            </div>

            {errorMessage && (
              <div className="mb-6 rounded-2xl border border-[#FDE2DA] bg-[#FFF5F2] p-5">
                <p className="font-black text-[#E17055]">
                  Could not load practice tests
                </p>

                <p className="mt-1 text-sm font-medium text-[#9A4A35]">
                  {errorMessage}
                </p>
              </div>
            )}

            <div className="mb-6 flex flex-wrap gap-1.5">
              {activeSection.tabs.map((tab) => {
                const isActive = activeTab === tab;

                return (
                  <button
                    key={tab}
                    type="button"
                    aria-label={`Filter by ${tab}`}
                    onClick={() => {
                      setActiveTab(tab);
                      showNotice(`${tab} selected.`);
                    }}
                    className={`rounded-2xl px-4 py-1.5 text-xs outline-none transition-all duration-150 focus:ring-2 focus:ring-[#071A52]/25 ${
                      isActive
                        ? "border-0 bg-[#071A52] font-bold text-white shadow-[0_4px_10px_rgba(7,26,82,0.25)]"
                        : "border border-[rgba(7,26,82,0.18)] bg-white font-semibold text-[#4A4A4A] hover:border-[#071A52] hover:bg-[#F8FAFE] hover:text-[#071A52]"
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {loading ? (
              <div className="grid gap-4 xl:grid-cols-2">
                {[0, 1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="rounded-[20px] border border-[rgba(7,26,82,0.15)] bg-white px-6 py-5"
                  >
                    <div className="mb-3 h-4 w-2/3 rounded-full skeleton-shimmer" />
                    <div className="mb-5 h-3 w-24 rounded-full skeleton-shimmer" />
                    <div className="mb-5 h-8 w-36 rounded-full skeleton-shimmer" />
                    <div className="flex items-center justify-between gap-4">
                      <div className="h-3 w-52 rounded-full skeleton-shimmer" />
                      <div className="h-10 w-32 rounded-xl skeleton-shimmer" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {activeTests.map((test, index) => (
                  <div
                    key={test.id}
                    className="animate-fade-up rounded-[20px] border border-[rgba(7,26,82,0.15)] bg-white p-5 transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-[3px] hover:border-[rgba(7,26,82,0.35)] hover:shadow-[0_12px_32px_rgba(7,26,82,0.12)] hover:will-change-transform"
                    style={{ animationDelay: `${index * 0.08}s` }}
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-[#0A0A0A]">
                          {test.title}
                        </h3>

                        <p className="mt-0.5 text-xs font-medium text-[#8A8A8A]">
                          {test.parts}
                        </p>
                      </div>

                      {test.free ? (
                        <span className="rounded-lg bg-gradient-to-br from-[#E0F7F0] to-[#C8F0E0] px-2.5 py-0.5 text-xs font-bold text-[#00A878]">
                          Free
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 rounded-lg bg-[#F5F7FC] px-2.5 py-0.5 text-xs font-bold text-[#071A52]">
                          <Lock size={12} /> Pro
                        </span>
                      )}
                    </div>

                    <div className="mb-4 border-y border-[rgba(7,26,82,0.10)] py-3">
                      <UserBadge variant="simple" showMenu={false} />
                    </div>

                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-[#4A4A4A]">
                        <span className="flex items-center gap-1">
                          <Clock size={13} /> {test.time}
                        </span>

                        <span className="flex items-center gap-1">
                          <ClipboardList size={13} /> {test.attempts}
                        </span>

                        {test.completed && (
                          <span className="flex items-center gap-1 rounded-full bg-[#E0F7F0] px-2.5 py-1 text-xs font-bold text-[#00A878]">
                            <CheckCircle2 size={13} /> Completed
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/practice/test/${test.id}`}
                        aria-label={`Start practice: ${test.title}`}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#071A52] px-4 py-2.5 text-xs font-bold text-white shadow-[0_4px_12px_rgba(7,26,82,0.30)] outline-none transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-px hover:bg-[#071A52] hover:shadow-[0_8px_20px_rgba(7,26,82,0.40)] hover:will-change-transform focus:ring-2 focus:ring-[#071A52]/25"
                      >
                        Start practice <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && activeTests.length === 0 && (
              <div className="rounded-[20px] border border-dashed border-[rgba(7,26,82,0.20)] bg-white p-10 text-center">
                <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-[#F5F7FC] text-[#071A52]">
                  <Lock size={22} />
                </div>

                <p className="text-sm font-bold text-[#0A0A0A]">
                  No active tests found
                </p>

                <p className="mx-auto mt-2 max-w-[420px] text-sm font-medium text-[#4A4A4A]">
                  There are no active tests in this section yet. Add tests from
                  the admin panel or check another skill.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </ProtectedPage>
  );
}
