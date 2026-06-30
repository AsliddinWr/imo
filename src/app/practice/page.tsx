"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  FileCode2,
  Headphones,
  Loader2,
  Mic,
  Pencil,
  Search,
  Sparkles,
  Trophy,
} from "lucide-react";
import ProtectedPage from "@/components/ProtectedPage";
import { supabase } from "@/lib/supabase";
import { parseHtmlTestDescription } from "@/lib/htmlTest";

type Skill = "listening" | "reading" | "writing" | "speaking" | "fullmock";
type SkillFilter = Skill | "all";

type TestRow = {
  id: string;
  title: string;
  skill: Skill;
  level: string | null;
  duration_minutes: number | null;
  description: string | null;
  passage_text?: string | null;
  part?: string | null;
};

type ResultRow = {
  id: string;
  test_id: string;
  score: number | null;
  total: number | null;
  band: string | null;
  status: string | null;
  created_at: string | null;
};

type TestStats = {
  attempts: number;
  bestBand: number;
  bestScoreText: string;
  lastCompletedAt: string;
};

const skillTabs: { key: SkillFilter; label: string; desc: string }[] = [
  { key: "all", label: "All", desc: "Barcha testlar" },
  { key: "reading", label: "Reading", desc: "Passage + questions" },
  { key: "listening", label: "Listening", desc: "Audio practice" },
  { key: "writing", label: "Writing", desc: "Task 1 / Task 2" },
  { key: "speaking", label: "Speaking", desc: "Cue cards" },
  { key: "fullmock", label: "Full Mock", desc: "Complete test" },
];

const skillStyles: Record<Skill, { icon: typeof BookOpen; bg: string; color: string; soft: string }> = {
  reading: {
    icon: BookOpen,
    bg: "bg-[#FFF0EE]",
    color: "text-[#E17055]",
    soft: "bg-[#FFF7F5] border-[#FFD8D0]",
  },
  listening: {
    icon: Headphones,
    bg: "bg-[#FFFBEE]",
    color: "text-[#F5A623]",
    soft: "bg-[#FFF9E8] border-[#FBE7A7]",
  },
  writing: {
    icon: Pencil,
    bg: "bg-[#EEF0FF]",
    color: "text-[#5B4FCF]",
    soft: "bg-[#F7F6FF] border-[#E2DEFF]",
  },
  speaking: {
    icon: Mic,
    bg: "bg-[#E8FFF5]",
    color: "text-[#00B894]",
    soft: "bg-[#F0FFF8] border-[#B8F3D8]",
  },
  fullmock: {
    icon: Trophy,
    bg: "bg-[#F0EEFF]",
    color: "text-[#6C5CE7]",
    soft: "bg-[#F8F7FF] border-[#DCD8FF]",
  },
};

function normalizeSkill(value: string | null): SkillFilter {
  if (
    value === "reading" ||
    value === "listening" ||
    value === "writing" ||
    value === "speaking" ||
    value === "fullmock"
  ) {
    return value;
  }
  return "all";
}

function skillLabel(skill: Skill) {
  if (skill === "fullmock") return "Full Mock";
  return skill.charAt(0).toUpperCase() + skill.slice(1);
}

function formatDuration(minutes: number | null | undefined) {
  const safe = Number(minutes) || 0;
  if (!safe) return "No limit";
  return `${safe} min`;
}

function safeBand(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function buildStats(results: ResultRow[]) {
  const map = new Map<string, TestStats>();

  for (const result of results) {
    const current =
      map.get(result.test_id) ||
      ({ attempts: 0, bestBand: 0, bestScoreText: "—", lastCompletedAt: "" } satisfies TestStats);

    const score = Number(result.score) || 0;
    const total = Number(result.total) || 0;
    const band = safeBand(result.band);

    current.attempts += 1;

    if (band >= current.bestBand) {
      current.bestBand = band;
      current.bestScoreText = total > 0 ? `${score}/${total}` : "—";
    }

    if (!current.lastCompletedAt) {
      current.lastCompletedAt = result.created_at || "";
    } else if (result.created_at) {
      const previous = new Date(current.lastCompletedAt).getTime();
      const next = new Date(result.created_at).getTime();
      if (next > previous) current.lastCompletedAt = result.created_at;
    }

    map.set(result.test_id, current);
  }

  return map;
}

export default function PracticePage() {
  const searchParams = useSearchParams();
  const selectedSkill = normalizeSkill(searchParams.get("tab"));

  const [tests, setTests] = useState<TestRow[]>([]);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadPractice() {
      setLoading(true);
      setError("");

      const { data: testData, error: testError } = await supabase
        .from("tests")
        .select("id, title, skill, level, duration_minutes, description, passage_text, part")
        .eq("is_active", true)
        .order("title", { ascending: true });

      if (!mounted) return;

      if (testError) {
        setError(testError.message);
        setTests([]);
        setResults([]);
        setLoading(false);
        return;
      }

      setTests((testData || []) as TestRow[]);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!user) {
        setResults([]);
        setLoading(false);
        return;
      }

      const { data: resultData, error: resultError } = await supabase
        .from("test_results")
        .select("id, test_id, score, total, band, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!mounted) return;

      if (resultError) {
        console.warn("Practice results error:", resultError.message);
        setResults([]);
      } else {
        setResults((resultData || []) as ResultRow[]);
      }

      setLoading(false);
    }

    loadPractice();

    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => buildStats(results), [results]);

  const filteredTests = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();

    return tests.filter((test) => {
      const skillMatch = selectedSkill === "all" || test.skill === selectedSkill;
      const queryMatch =
        !cleanQuery ||
        test.title.toLowerCase().includes(cleanQuery) ||
        skillLabel(test.skill).toLowerCase().includes(cleanQuery) ||
        String(test.level || "").toLowerCase().includes(cleanQuery);

      return skillMatch && queryMatch;
    });
  }, [query, selectedSkill, tests]);

  const totalAttempts = results.length;
  const htmlTestsCount = tests.filter((test) => parseHtmlTestDescription(test.description)).length;
  const averageBand = results.length
    ? results.reduce((sum, item) => sum + safeBand(item.band), 0) / results.length
    : 0;

  return (
    <ProtectedPage>
      <main className="min-h-screen bg-[#F8F7FF] px-4 py-6 text-[#17142A] sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <section className="rounded-[32px] bg-gradient-to-br from-[#6C5CE7] via-[#7668F0] to-[#A29BFE] p-6 text-white shadow-[0_18px_48px_rgba(108,92,231,0.25)] sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-black backdrop-blur">
                  <Sparkles className="h-4 w-4" />
                  HTML Watcher ready
                </div>
                <h1 className="max-w-3xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                  Practice tests
                </h1>
                <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/80 sm:text-base">
                  Reading, Listening, Writing, Speaking va tayyor HTML testlarni shu yerdan ochasiz. HTML testlar sayt ichida ochiladi va watcher natijani saqlaydi.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[520px]">
                <div className="rounded-3xl bg-white/14 p-4 backdrop-blur">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-white/65">Tests</p>
                  <p className="mt-2 text-3xl font-black">{loading ? "..." : tests.length}</p>
                </div>
                <div className="rounded-3xl bg-white/14 p-4 backdrop-blur">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-white/65">Attempts</p>
                  <p className="mt-2 text-3xl font-black">{loading ? "..." : totalAttempts}</p>
                </div>
                <div className="rounded-3xl bg-white/14 p-4 backdrop-blur">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-white/65">Avg band</p>
                  <p className="mt-2 text-3xl font-black">{loading ? "..." : averageBand.toFixed(1)}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-[260px_1fr]">
            <aside className="rounded-[28px] border border-[#E2DEFF] bg-white p-4 shadow-[0_12px_36px_rgba(108,92,231,0.08)]">
              <p className="px-2 pb-3 text-xs font-black uppercase tracking-[0.18em] text-[#8A84B8]">
                Skills
              </p>
              <div className="flex flex-col gap-2">
                {skillTabs.map((tab) => {
                  const active = selectedSkill === tab.key;
                  return (
                    <Link
                      key={tab.key}
                      href={tab.key === "all" ? "/practice" : `/practice?tab=${tab.key}`}
                      className={`rounded-2xl px-4 py-3 transition-all duration-150 ${
                        active
                          ? "bg-[#6C5CE7] text-white shadow-[0_10px_24px_rgba(108,92,231,0.25)]"
                          : "text-[#4B4668] hover:bg-[#F3F0FF] hover:text-[#6C5CE7]"
                      }`}
                    >
                      <span className="block text-sm font-black">{tab.label}</span>
                      <span className={`mt-0.5 block text-xs font-semibold ${active ? "text-white/70" : "text-[#9A94BC]"}`}>
                        {tab.desc}
                      </span>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-5 rounded-3xl border border-[#E2DEFF] bg-[#F8F7FF] p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8A84B8]">HTML tests</p>
                <p className="mt-2 text-2xl font-black text-[#17142A]">{htmlTestsCount}</p>
                <p className="mt-1 text-xs font-bold leading-5 text-[#7B749B]">
                  Yuklangan standalone HTML testlar iframe ichida ochiladi.
                </p>
              </div>
            </aside>

            <section className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 rounded-[28px] border border-[#E2DEFF] bg-white p-4 shadow-[0_12px_36px_rgba(108,92,231,0.08)] sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8A84B8]">
                    {selectedSkill === "all" ? "All tests" : `${skillLabel(selectedSkill)} tests`}
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-[#17142A]">
                    {filteredTests.length} available
                  </h2>
                </div>
                <label className="relative block w-full sm:w-[320px]">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A84B8]" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search tests..."
                    className="h-12 w-full rounded-2xl border border-[#E2DEFF] bg-[#F8F7FF] pl-11 pr-4 text-sm font-bold text-[#17142A] outline-none transition focus:border-[#6C5CE7] focus:bg-white focus:ring-4 focus:ring-[#6C5CE7]/10"
                  />
                </label>
              </div>

              {error && (
                <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm font-bold text-red-700">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="grid min-h-[360px] place-items-center rounded-[28px] border border-[#E2DEFF] bg-white">
                  <div className="flex items-center gap-3 text-sm font-black text-[#6C5CE7]">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading tests...
                  </div>
                </div>
              ) : filteredTests.length === 0 ? (
                <div className="grid min-h-[360px] place-items-center rounded-[28px] border border-dashed border-[#CFC8FF] bg-white p-8 text-center">
                  <div>
                    <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-[#F0EEFF] text-[#6C5CE7]">
                      <BookOpen className="h-8 w-8" />
                    </div>
                    <h3 className="mt-4 text-xl font-black text-[#17142A]">Test topilmadi</h3>
                    <p className="mt-2 max-w-md text-sm font-semibold leading-6 text-[#7B749B]">
                      Admin paneldan active test qo‘shing yoki boshqa skill filter tanlang.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 xl:grid-cols-2">
                  {filteredTests.map((test) => {
                    const htmlTest = parseHtmlTestDescription(test.description);
                    const style = skillStyles[test.skill] || skillStyles.reading;
                    const Icon = style.icon;
                    const testStats = stats.get(test.id);

                    return (
                      <Link
                        key={test.id}
                        href={`/practice/test/${test.id}`}
                        className="group rounded-[28px] border border-[#E2DEFF] bg-white p-5 shadow-[0_12px_36px_rgba(108,92,231,0.08)] transition-all duration-200 hover:-translate-y-1 hover:border-[#6C5CE7] hover:shadow-[0_18px_48px_rgba(108,92,231,0.15)]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${style.bg} ${style.color}`}>
                              <Icon className="h-7 w-7" />
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`rounded-full border px-3 py-1 text-xs font-black ${style.soft} ${style.color}`}>
                                  {skillLabel(test.skill)}
                                </span>
                                {htmlTest && (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-[#DCD8FF] bg-[#F8F7FF] px-3 py-1 text-xs font-black text-[#6C5CE7]">
                                    <FileCode2 className="h-3.5 w-3.5" /> HTML
                                  </span>
                                )}
                                {test.level && (
                                  <span className="rounded-full border border-[#E2DEFF] bg-white px-3 py-1 text-xs font-black text-[#8A84B8]">
                                    {test.level}
                                  </span>
                                )}
                              </div>
                              <h3 className="mt-3 text-xl font-black leading-snug text-[#17142A] transition group-hover:text-[#6C5CE7]">
                                {test.title}
                              </h3>
                              <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-[#7B749B]">
                                {htmlTest?.note || test.passage_text || test.description || "Open this test and start practice."}
                              </p>
                            </div>
                          </div>
                          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#F0EEFF] text-[#6C5CE7] transition group-hover:bg-[#6C5CE7] group-hover:text-white">
                            <ArrowRight className="h-5 w-5" />
                          </div>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                          <div className="rounded-2xl bg-[#F8F7FF] p-3">
                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-[#8A84B8]">
                              <Clock className="h-3.5 w-3.5" /> Time
                            </div>
                            <p className="mt-1 text-sm font-black text-[#17142A]">{formatDuration(test.duration_minutes)}</p>
                          </div>
                          <div className="rounded-2xl bg-[#F8F7FF] p-3">
                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-[#8A84B8]">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Attempts
                            </div>
                            <p className="mt-1 text-sm font-black text-[#17142A]">{testStats?.attempts || 0}</p>
                          </div>
                          <div className="rounded-2xl bg-[#F8F7FF] p-3">
                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-[#8A84B8]">
                              <Trophy className="h-3.5 w-3.5" /> Best
                            </div>
                            <p className="mt-1 text-sm font-black text-[#17142A]">
                              {testStats?.bestBand ? `Band ${testStats.bestBand.toFixed(1)}` : "—"}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-[#F8F7FF] p-3">
                            <div className="text-xs font-black uppercase tracking-wide text-[#8A84B8]">Last</div>
                            <p className="mt-1 text-sm font-black text-[#17142A]">
                              {formatDate(testStats?.lastCompletedAt)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          </section>
        </div>
      </main>
    </ProtectedPage>
  );
}
