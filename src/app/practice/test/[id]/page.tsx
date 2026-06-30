"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileCode2,
  Flag,
  RotateCcw,
  Send,
  XCircle,
} from "lucide-react";
import ProtectedPage from "@/components/ProtectedPage";
import { supabase } from "@/lib/supabase";
import { parseHtmlTestDescription } from "@/lib/htmlTest";

type Skill = "listening" | "reading" | "writing" | "speaking" | "fullmock";

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

type QuestionRow = {
  id: string;
  number: number;
  type: string;
  question: string;
  options: string[] | null;
  answer: string | null;
  explanation: string | null;
  part: string | null;
  group_label: string | null;
  group_instruction: string | null;
};

type Question = {
  id: string;
  number: number;
  type: string;
  question: string;
  options: string[];
  answer: string;
  explanation?: string | null;
  part: string;
  groupLabel: string;
  groupInstruction: string;
};

function optionsFromJson(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item));
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map((item) => String(item));
    } catch {
      return value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }
  return [];
}

function normalizeAnswer(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function answerLetterFromIndex(index: number) {
  return String.fromCharCode(65 + index);
}

function isMcq(question: Question) {
  const type = question.type.toLowerCase();
  return type.includes("mcq") || type.includes("multiple");
}

function getOptionValue(question: Question, option: string, index: number) {
  if (isMcq(question)) return answerLetterFromIndex(index);
  return option.replace(/^[A-Da-d][).]\s*/, "").trim();
}

function formatSeconds(seconds: number | null) {
  if (seconds === null) return "No limit";
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const remaining = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(
    2,
    "0"
  )}`;
}

function bandFromScore(score: number, total: number) {
  const percent = total === 0 ? 0 : score / total;
  if (percent >= 0.9) return "8.5";
  if (percent >= 0.8) return "7.5";
  if (percent >= 0.65) return "6.5";
  if (percent >= 0.5) return "5.5";
  return "4.5";
}

function getPassageText(test: TestRow | null) {
  if (!test) return "";
  const htmlTest = parseHtmlTestDescription(test.description);
  if (htmlTest) return htmlTest.note || "Uploaded HTML test.";
  if (test.passage_text?.trim()) return test.passage_text.trim();
  if (test.description?.trim()) return test.description.trim();
  return "No passage or prompt has been added yet.";
}

function skillLabel(skill?: Skill) {
  if (skill === "fullmock") return "Full Mock";
  if (!skill) return "Test";
  return skill.charAt(0).toUpperCase() + skill.slice(1);
}

export default function PracticeTestPage() {
  const params = useParams();
  const router = useRouter();
  const testId = String(params?.id || "");

  const [test, setTest] = useState<TestRow | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const htmlTest = useMemo(
    () => parseHtmlTestDescription(test?.description),
    [test?.description]
  );

  const score = useMemo(() => {
    return questions.reduce((total, question) => {
      const userAnswer = answers[question.id] || "";
      if (normalizeAnswer(userAnswer) === normalizeAnswer(question.answer || "")) {
        return total + 1;
      }
      return total;
    }, 0);
  }, [answers, questions]);

  const answeredCount = useMemo(
    () => questions.filter((item) => answers[item.id]?.trim()).length,
    [answers, questions]
  );

  useEffect(() => {
    let mounted = true;

    async function loadTest() {
      setLoading(true);
      setLoadError("");
      setSubmitError("");

      const { data: testData, error: testError } = await supabase
        .from("tests")
        .select("id, title, skill, level, duration_minutes, description, passage_text, part")
        .eq("id", testId)
        .eq("is_active", true)
        .maybeSingle();

      if (!mounted) return;

      if (testError) {
        setLoadError(testError.message);
        setLoading(false);
        return;
      }

      if (!testData) {
        setLoadError("Test not found or inactive.");
        setLoading(false);
        return;
      }

      const currentTest = testData as TestRow;
      setTest(currentTest);

      const uploadedHtml = parseHtmlTestDescription(currentTest.description);
      if (uploadedHtml) {
        setQuestions([]);
        setAnswers({});
        setFlagged({});
        setSubmitted(false);
        setTimeLeft(null);
        setLoading(false);
        return;
      }

      const { data: questionRows, error: questionError } = await supabase
        .from("questions")
        .select(
          "id, number, type, question, options, answer, explanation, part, group_label, group_instruction"
        )
        .eq("test_id", testId)
        .order("number", { ascending: true });

      if (!mounted) return;

      if (questionError) {
        setLoadError(questionError.message);
        setLoading(false);
        return;
      }

      const mappedQuestions = ((questionRows || []) as QuestionRow[]).map(
        (item) => ({
          id: item.id,
          number: item.number,
          type: item.type,
          question: item.question,
          options: optionsFromJson(item.options),
          answer: item.answer || "",
          explanation: item.explanation,
          part: item.part || "part1",
          groupLabel: item.group_label || "",
          groupInstruction: item.group_instruction || "",
        })
      );

      setQuestions(mappedQuestions);
      setAnswers({});
      setFlagged({});
      setSubmitted(false);
      const minutes = Number(currentTest.duration_minutes) || 0;
      setTimeLeft(minutes > 0 ? minutes * 60 : null);
      setLoading(false);
    }

    loadTest();
    return () => {
      mounted = false;
    };
  }, [testId]);

  useEffect(() => {
    if (timeLeft === null || loading || submitted || htmlTest) return;
    if (timeLeft <= 0) return;

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => (prev === null ? null : Math.max(0, prev - 1)));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [timeLeft, loading, submitted, htmlTest]);

  function setAnswer(questionId: string, value: string) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function resetTest() {
    setAnswers({});
    setFlagged({});
    setSubmitted(false);
    setSubmitError("");
    const minutes = Number(test?.duration_minutes) || 0;
    setTimeLeft(minutes > 0 ? minutes * 60 : null);
  }

  async function submitResult() {
    if (saving) return;
    setSubmitError("");

    if (!test) {
      setSubmitError("Test data is not loaded.");
      return;
    }

    if (questions.length === 0) {
      setSubmitError("This builder test has no questions yet.");
      return;
    }

    try {
      setSaving(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setSubmitError("Please sign in again before submitting the test.");
        return;
      }

      const finalBand = bandFromScore(score, questions.length);
      const { error } = await supabase.from("test_results").insert({
        user_id: user.id,
        test_id: testId,
        skill: test.skill,
        score,
        total: questions.length,
        band: finalBand,
        status: "Submitted",
      });

      if (error) {
        setSubmitError(error.message);
        return;
      }

      setSubmitted(true);
      router.push(
        `/results?${new URLSearchParams({
          test: testId,
          skill: test.skill,
          score: String(score),
          total: String(questions.length),
          band: finalBand,
          status: "Submitted",
        }).toString()}`
      );
      router.refresh();
    } catch {
      setSubmitError("Something went wrong while saving your result.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <ProtectedPage>
        <main className="grid min-h-screen place-items-center bg-[#F7F6FF] px-4">
          <div className="rounded-3xl border border-[#E2DEFF] bg-white p-8 text-center shadow-[0_20px_60px_rgba(19,16,43,.10)]">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#5B4FCF]">
              Loading test
            </p>
            <h1 className="mt-2 text-2xl font-black text-[#13102B]">Please wait...</h1>
          </div>
        </main>
      </ProtectedPage>
    );
  }

  if (loadError || !test) {
    return (
      <ProtectedPage>
        <main className="grid min-h-screen place-items-center bg-[#F7F6FF] px-4">
          <div className="max-w-lg rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-[0_20px_60px_rgba(19,16,43,.10)]">
            <XCircle className="mx-auto text-[#E24B4A]" size={42} />
            <h1 className="mt-4 text-2xl font-black text-[#13102B]">Test ochilmadi</h1>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#6B6880]">
              {loadError || "Test not found."}
            </p>
            <Link
              href="/practice"
              className="mt-6 inline-flex rounded-2xl bg-[#5B4FCF] px-5 py-3 text-sm font-black text-white"
            >
              Back to practice
            </Link>
          </div>
        </main>
      </ProtectedPage>
    );
  }

  if (htmlTest) {
    return (
      <ProtectedPage>
        <main className="flex h-screen flex-col overflow-hidden bg-[#0B1020]">
          <header className="flex h-[68px] shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-[#111827] px-4 text-white md:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <Link
                href="/practice"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
                aria-label="Back to practice"
              >
                <ArrowLeft size={18} />
              </Link>
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-violet-200">
                  <FileCode2 size={14} /> Uploaded HTML test
                </p>
                <h1 className="truncate text-base font-black md:text-xl">
                  {test.title}
                </h1>
              </div>
            </div>
            <div className="hidden rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-right md:block">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-200">
                File
              </p>
              <p className="max-w-[280px] truncate text-xs font-bold">
                {htmlTest.fileName}
              </p>
            </div>
          </header>

          <iframe
            title={test.title}
            srcDoc={htmlTest.html}
            sandbox="allow-scripts allow-forms allow-modals allow-downloads allow-popups allow-pointer-lock allow-presentation allow-same-origin allow-top-navigation-by-user-activation"
            allow="fullscreen; clipboard-write; autoplay"
            className="h-[calc(100vh-68px)] w-full flex-1 border-0 bg-white"
          />
        </main>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage>
      <main className="min-h-screen bg-[#F7F6FF] p-4 text-[#13102B] md:p-6">
        <div className="mx-auto max-w-7xl">
          <header className="mb-5 flex flex-col gap-4 rounded-[28px] border border-[#E2DEFF] bg-white p-4 shadow-[0_16px_50px_rgba(19,16,43,.08)] md:flex-row md:items-center md:justify-between md:p-5">
            <div className="flex min-w-0 items-center gap-3">
              <Link
                href="/practice"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-[#E2DEFF] text-[#6B6880] transition hover:border-[#5B4FCF] hover:text-[#5B4FCF]"
                aria-label="Back to practice"
              >
                <ArrowLeft size={18} />
              </Link>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5B4FCF]">
                  {skillLabel(test.skill)} Practice
                </p>
                <h1 className="truncate text-2xl font-black text-[#13102B]">
                  {test.title}
                </h1>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-2xl border border-[#E2DEFF] bg-[#F7F6FF] px-4 py-2">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#6B6880]">
                  Time
                </p>
                <p className="flex items-center gap-2 text-sm font-black text-[#13102B]">
                  <Clock size={15} /> {formatSeconds(timeLeft)}
                </p>
              </div>
              <div className="rounded-2xl border border-[#E2DEFF] bg-[#F7F6FF] px-4 py-2">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#6B6880]">
                  Answered
                </p>
                <p className="text-sm font-black text-[#13102B]">
                  {answeredCount}/{questions.length}
                </p>
              </div>
            </div>
          </header>

          <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
            <aside className="rounded-[28px] border border-[#E2DEFF] bg-white p-5 shadow-[0_16px_50px_rgba(19,16,43,.08)] lg:sticky lg:top-6 lg:max-h-[calc(100vh-150px)] lg:overflow-y-auto">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5B4FCF]">
                Passage / Prompt
              </p>
              <h2 className="mt-2 text-xl font-black text-[#13102B]">{test.title}</h2>
              <div className="mt-5 space-y-4 text-sm font-medium leading-7 text-[#3F3A58]">
                {getPassageText(test)
                  .split("\n")
                  .map((paragraph, index) => {
                    const clean = paragraph.trim();
                    if (!clean) return null;
                    return <p key={`${clean.slice(0, 20)}-${index}`}>{clean}</p>;
                  })}
              </div>
            </aside>

            <section className="rounded-[28px] border border-[#E2DEFF] bg-white p-5 shadow-[0_16px_50px_rgba(19,16,43,.08)]">
              <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5B4FCF]">
                    Questions
                  </p>
                  <h2 className="mt-1 text-xl font-black text-[#13102B]">
                    IELTS test player
                  </h2>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={resetTest}
                    className="inline-flex items-center gap-2 rounded-2xl border border-[#E2DEFF] px-4 py-2 text-xs font-black text-[#6B6880] transition hover:border-[#5B4FCF] hover:text-[#5B4FCF]"
                  >
                    <RotateCcw size={15} /> Reset
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={submitResult}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#5B4FCF] px-4 py-2 text-xs font-black text-white shadow-[0_8px_24px_rgba(91,79,207,.22)] transition hover:-translate-y-0.5 hover:bg-[#4740b8] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Send size={15} /> {saving ? "Saving..." : "Submit"}
                  </button>
                </div>
              </div>

              {questions.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-[#B8B0FF] bg-[#F7F6FF] p-8 text-center">
                  <p className="font-black text-[#13102B]">No questions found</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[#6B6880]">
                    Bu builder test. Savollarni Admin Questions yoki Supabase questions jadvalidan qo‘shing.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((question) => {
                    const selected = answers[question.id] || "";
                    const isFlagged = flagged[question.id];
                    const correct =
                      submitted &&
                      normalizeAnswer(selected) === normalizeAnswer(question.answer || "");
                    const wrong = submitted && selected && !correct;

                    return (
                      <article
                        key={question.id}
                        className="rounded-3xl border border-[#E2DEFF] bg-[#FBFAFF] p-5"
                      >
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#6B6880]">
                              Q{question.number} · {question.type}
                            </p>
                            <h3 className="mt-2 text-base font-black leading-7 text-[#13102B]">
                              {question.question}
                            </h3>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setFlagged((prev) => ({
                                ...prev,
                                [question.id]: !prev[question.id],
                              }))
                            }
                            className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl border transition ${
                              isFlagged
                                ? "border-[#F5A623] bg-amber-50 text-[#F5A623]"
                                : "border-[#E2DEFF] bg-white text-[#6B6880] hover:border-[#5B4FCF] hover:text-[#5B4FCF]"
                            }`}
                            aria-label="Flag question"
                          >
                            <Flag size={17} />
                          </button>
                        </div>

                        {question.options.length > 0 ? (
                          <div className="space-y-2">
                            {question.options.map((option, index) => {
                              const value = getOptionValue(question, option, index);
                              const active = selected === value;
                              return (
                                <button
                                  key={`${question.id}-${value}-${index}`}
                                  type="button"
                                  disabled={submitted}
                                  onClick={() => setAnswer(question.id, value)}
                                  className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-bold transition ${
                                    active
                                      ? "border-[#5B4FCF] bg-[#EEF0FF] text-[#13102B]"
                                      : "border-[#E2DEFF] bg-white text-[#3F3A58] hover:border-[#5B4FCF] hover:bg-[#F7F6FF]"
                                  } disabled:cursor-not-allowed`}
                                >
                                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#F0EEFF] text-xs font-black text-[#5B4FCF]">
                                    {answerLetterFromIndex(index)}
                                  </span>
                                  {option.replace(/^[A-Da-d][).]\s*/, "")}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <input
                            value={selected}
                            disabled={submitted}
                            onChange={(event) =>
                              setAnswer(question.id, event.target.value)
                            }
                            placeholder="Type your answer here..."
                            className="w-full rounded-2xl border border-[#E2DEFF] bg-white px-4 py-3 text-sm font-bold outline-none transition focus:border-[#5B4FCF] disabled:cursor-not-allowed disabled:opacity-70"
                          />
                        )}

                        {submitted && (
                          <div
                            className={`mt-4 rounded-2xl border p-4 text-sm font-semibold leading-6 ${
                              correct
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-rose-200 bg-rose-50 text-rose-700"
                            }`}
                          >
                            <p className="flex items-center gap-2 font-black">
                              {correct ? (
                                <CheckCircle2 size={17} />
                              ) : (
                                <XCircle size={17} />
                              )}
                              {correct ? "Correct" : wrong ? "Incorrect" : "No answer"}
                            </p>
                            <p className="mt-1">
                              Correct answer: <b>{question.answer || "Not set"}</b>
                            </p>
                            {question.explanation && (
                              <p className="mt-1">Proof: {question.explanation}</p>
                            )}
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}

              {submitError && (
                <div className="mt-5 rounded-3xl border border-rose-200 bg-rose-50 p-5">
                  <p className="font-black text-[#E24B4A]">Result was not saved</p>
                  <p className="mt-1 text-sm font-semibold text-rose-700">{submitError}</p>
                </div>
              )}
            </section>
          </section>
        </div>
      </main>
    </ProtectedPage>
  );
}
