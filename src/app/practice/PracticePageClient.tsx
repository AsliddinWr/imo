"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
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

type SkillKey = "listening" | "reading" | "writing" | "speaking" | "fullmock";
type TabKey = SkillKey | "all";

type TestRow = {
  id: string;
  title: string;
  skill: SkillKey;
  level: string | null;
  duration_minutes: number | null;
  description: string | null;
  part?: string | null;
  is_active?: boolean | null;
};

const tabs: { key: TabKey; label: string; icon: typeof BookOpen }[] = [
  { key: "all", label: "All", icon: BookOpen },
  { key: "reading", label: "Reading", icon: BookOpen },
  { key: "listening", label: "Listening", icon: Headphones },
  { key: "writing", label: "Writing", icon: Pencil },
  { key: "speaking", label: "Speaking", icon: Mic },
  { key: "fullmock", label: "Full Mock", icon: Trophy },
];

function isTabKey(value: string | null): value is TabKey {
  return tabs.some((tab) => tab.key === value);
}

function formatSkill(skill: SkillKey) {
  if (skill === "fullmock") return "Full Mock";
  return skill.charAt(0).toUpperCase() + skill.slice(1);
}

function skillCardStyle(skill: SkillKey) {
  if (skill === "listening") return "bg-indigo-50 text-indigo-600";
  if (skill === "reading") return "bg-blue-50 text-blue-600";
  if (skill === "writing") return "bg-rose-50 text-rose-600";
  if (skill === "speaking") return "bg-emerald-50 text-emerald-600";
  return "bg-purple-50 text-purple-600";
}

function testTypeLabel(test: TestRow) {
  const htmlTest = parseHtmlTestDescription(test.description);
  return htmlTest ? "Uploaded HTML" : "Builder test";
}

function testTypeIcon(test: TestRow) {
  const htmlTest = parseHtmlTestDescription(test.description);
  return htmlTest ? FileCode2 : BookOpen;
}

function testShortDescription(test: TestRow) {
  const htmlTest = parseHtmlTestDescription(test.description);
  if (htmlTest) return htmlTest.fileName || "Uploaded HTML test";
  if (test.part) return test.part;
  if (test.description?.trim()) return test.description.trim().slice(0, 120);
  return "IELTS practice test";
}

function durationLabel(minutes: number | null | undefined) {
  const value = Number(minutes) || 0;
  if (value <= 0) return "No limit";
  return `${value} min`;
}

export default function PracticePageClient() {
  const searchParams = useSearchParams();
  const activeTab = isTabKey(searchParams.get("tab"))
    ? searchParams.get("tab")
    : "all";

  const [tests, setTests] = useState<TestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadTests() {
      setLoading(true);
      setError("");

      const { data, error: testsError } = await supabase
        .from("tests")
        .select("id, title, skill, level, duration_minutes, description, part, is_active")
        .eq("is_active", true)
        .order("title", { ascending: true });

      if (!mounted) return;

      if (testsError) {
        setError(testsError.message);
        setTests([]);
        setLoading(false);
        return;
      }

      setTests(((data || []) as TestRow[]).filter((item) => item.id && item.title));
      setLoading(false);
    }

    loadTests();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredTests = useMemo(() => {
    const cleanSearch = search.trim().toLowerCase();

    return tests.filter((test) => {
      const matchesTab = activeTab === "all" || test.skill === activeTab;
      const htmlTest = parseHtmlTestDescription(test.description);
      const text = [
        test.title,
        test.skill,
        test.level,
        test.part,
        htmlTest?.fileName,
        htmlTest ? "html uploaded" : "builder",
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesTab && (!cleanSearch || text.includes(cleanSearch));
    });
  }, [activeTab, search, tests]);

  const htmlTestsCount = useMemo(
    () => tests.filter((test) => parseHtmlTestDescription(test.description)).length,
    [tests]
  );

  const builderTestsCount = Math.max(0, tests.length - htmlTestsCount);

  return (
    <ProtectedPage>
      <main className="min-h-screen bg-[#F7F6FF] px-4 py-6 text-[#13102B] md:px-8 md:py-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="overflow-hidden rounded-[32px] border border-[#E2DEFF] bg-white shadow-[0_22px_70px_rgba(91,79,207,.10)]">
            <div className="grid gap-6 p-6 md:grid-cols-[1.4fr_.8fr] md:p-8">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#EEF0FF] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#5B4FCF]">
                  <Sparkles className="h-4 w-4" />
                  Practice Center
                </div>
                <h1 className="mt-5 max-w-3xl text-3xl font-black leading-tight tracking-[-0.04em] md:text-5xl">
                  IELTS testlaringizni bitta joyda ishlang.
                </h1>
                <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-[#6B6880] md:text-base">
                  Admin qo‘shgan builder testlar va yuklangan HTML testlar shu yerda chiqadi.
                  HTML testlar ichida ochiladi va watcher natijani avtomatik kuzatadi.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
                <div className="rounded-3xl bg-[#EEF0FF] p-5">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#5B4FCF]">
                    Active tests
                  </p>
                  <p className="mt-2 text-3xl font-black">{tests.length}</p>
                </div>
                <div className="rounded-3xl bg-[#E1F5EE] p-5">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1D9E75]">
                    HTML tests
                  </p>
                  <p className="mt-2 text-3xl font-black">{htmlTestsCount}</p>
                </div>
                <div className="rounded-3xl bg-[#FFF0EE] p-5">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#E24B4A]">
                    Builder tests
                  </p>
                  <p className="mt-2 text-3xl font-black">{builderTestsCount}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-[#E2DEFF] bg-white p-4 shadow-[0_18px_50px_rgba(91,79,207,.08)] md:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.key;
                  const href = tab.key === "all" ? "/practice" : `/practice?tab=${tab.key}`;

                  return (
                    <Link
                      key={tab.key}
                      href={href}
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-black transition hover:-translate-y-0.5 ${
                        active
                          ? "border-[#5B4FCF] bg-[#5B4FCF] text-white shadow-[0_10px_28px_rgba(91,79,207,.24)]"
                          : "border-[#E2DEFF] bg-white text-[#6B6880] hover:border-[#5B4FCF] hover:text-[#5B4FCF]"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </Link>
                  );
                })}
              </div>

              <label className="flex min-h-12 w-full items-center gap-3 rounded-2xl border border-[#E2DEFF] bg-[#FAFAFF] px-4 text-[#6B6880] focus-within:border-[#5B4FCF] lg:w-80">
                <Search className="h-5 w-5" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full bg-transparent text-sm font-bold outline-none placeholder:text-[#9B98AE]"
                  placeholder="Search test..."
                />
              </label>
            </div>
          </section>

          {error && (
            <section className="rounded-[24px] border border-red-200 bg-red-50 p-5 text-sm font-bold text-red-700">
              Testlarni yuklashda xato: {error}
            </section>
          )}

          {loading ? (
            <section className="grid min-h-[260px] place-items-center rounded-[28px] border border-[#E2DEFF] bg-white p-8 text-center shadow-[0_18px_50px_rgba(91,79,207,.08)]">
              <div>
                <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#5B4FCF]" />
                <h2 className="mt-4 text-xl font-black">Loading tests...</h2>
                <p className="mt-2 text-sm font-semibold text-[#6B6880]">
                  Supabase tests jadvalidan ma’lumotlar olinmoqda.
                </p>
              </div>
            </section>
          ) : filteredTests.length === 0 ? (
            <section className="grid min-h-[260px] place-items-center rounded-[28px] border border-dashed border-[#C9C4F5] bg-white p-8 text-center shadow-[0_18px_50px_rgba(91,79,207,.08)]">
              <div>
                <BookOpen className="mx-auto h-12 w-12 text-[#5B4FCF]" />
                <h2 className="mt-4 text-2xl font-black">Test topilmadi</h2>
                <p className="mt-2 max-w-lg text-sm font-semibold leading-6 text-[#6B6880]">
                  Bu bo‘limda hozircha aktiv test yo‘q yoki qidiruv bo‘yicha natija chiqmayapti.
                </p>
              </div>
            </section>
          ) : (
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredTests.map((test) => {
                const TypeIcon = testTypeIcon(test);
                const htmlTest = parseHtmlTestDescription(test.description);

                return (
                  <Link
                    key={test.id}
                    href={`/practice/test/${test.id}`}
                    className="group flex min-h-[250px] flex-col justify-between rounded-[28px] border border-[#E2DEFF] bg-white p-5 shadow-[0_18px_50px_rgba(91,79,207,.08)] transition hover:-translate-y-1 hover:border-[#5B4FCF] hover:shadow-[0_26px_70px_rgba(91,79,207,.16)]"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-black ${skillCardStyle(
                            test.skill
                          )}`}
                        >
                          {formatSkill(test.skill)}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#FAFAFF] px-3 py-1 text-xs font-black text-[#6B6880]">
                          <Clock className="h-3.5 w-3.5" />
                          {durationLabel(test.duration_minutes)}
                        </span>
                      </div>

                      <h2 className="mt-5 text-2xl font-black leading-tight tracking-[-0.03em] text-[#13102B] transition group-hover:text-[#5B4FCF]">
                        {test.title}
                      </h2>

                      <p className="mt-3 line-clamp-2 text-sm font-semibold leading-6 text-[#6B6880]">
                        {testShortDescription(test)}
                      </p>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-[#F0EEFF] pt-4">
                      <div className="flex items-center gap-2 text-sm font-black text-[#6B6880]">
                        <TypeIcon className="h-5 w-5 text-[#5B4FCF]" />
                        {testTypeLabel(test)}
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-[#5B4FCF] px-4 py-2 text-sm font-black text-white transition group-hover:bg-[#4740B8]">
                        Start
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>

                    {htmlTest && (
                      <div className="mt-3 rounded-2xl bg-[#EEF0FF] px-4 py-3 text-xs font-bold text-[#5B4FCF]">
                        Watcher active · {htmlTest.fileName}
                      </div>
                    )}
                  </Link>
                );
              })}
            </section>
          )}
        </div>
      </main>
    </ProtectedPage>
  );
}
