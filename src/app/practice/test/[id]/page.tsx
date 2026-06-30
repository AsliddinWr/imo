"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Clock,
  Flag,
  Home,
  ListChecks,
  RotateCcw,
  Send,
  ShieldCheck,
  TimerReset,
  X,
  XCircle,
} from "lucide-react";
import ProtectedPage from "@/components/ProtectedPage";
import { supabase } from "@/lib/supabase";
import {
  HTML_WATCHER_SOURCE,
  estimateAcademicReadingBand,
  injectHtmlTestWatcher,
  parseHtmlTestDescription,
  type HtmlWatcherResult,
} from "@/lib/htmlTest";

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
  options: string[] | string | null;
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

type HtmlProgressState = HtmlWatcherResult | null;

type ResultSummary = {
  source: "html" | "builder";
  title: string;
  skill: Skill;
  score: number;
  total: number;
  band: string;
  raw40?: number;
  status: string;
  spentTimeSeconds: number;
  answeredCount: number;
  analysisRows?: unknown[];
  analysisText?: string;
  completedAt?: string;
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

function formatSeconds(seconds: number | null | undefined) {
  if (seconds === null || seconds === undefined) return "No limit";

  const safe = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safe / 60);
  const remaining = safe % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(
    2,
    "0",
  )}`;
}

function bandFromScore(score: number, total: number) {
  return estimateAcademicReadingBand(score, total).band;
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

function safeNumber(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function statusLabel(status?: string) {
  const clean = String(status || "").toLowerCase();
  if (clean.includes("block")) return "Blocked";
  if (clean.includes("auto")) return "Auto submitted";
  if (clean.includes("submit") || clean.includes("complete"))
    return "Submitted";
  return "Submitted";
}

function formatSpentTime(seconds: number | null | undefined) {
  const safe = Math.max(0, Number(seconds) || 0);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const remaining = safe % 60;

  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, "0")}m ${String(
      remaining,
    ).padStart(2, "0")}s`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(
    2,
    "0",
  )}`;
}

function getResultStatusClass(status: string) {
  const clean = status.toLowerCase();
  if (clean.includes("block")) {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (clean.includes("auto")) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function analysisRowsToDisplayRows(rows?: unknown[]) {
  if (!Array.isArray(rows)) return [];

  return rows.slice(0, 12).map((row, index) => {
    if (!row || typeof row !== "object") {
      return {
        question: index + 1,
        userAnswer: "-",
        correctAnswer: "-",
        isCorrect: false,
        explanation: String(row || ""),
      };
    }

    const data = row as Record<string, unknown>;
    return {
      question: String(data.question ?? data.number ?? index + 1),
      userAnswer: String(data.user_answer ?? data.userAnswer ?? "-"),
      correctAnswer: String(data.correct_answer ?? data.correctAnswer ?? "-"),
      isCorrect: Boolean(data.is_correct ?? data.isCorrect),
      explanation: String(data.explanation ?? data.note ?? ""),
    };
  });
}

function ResultSummaryModal({
  result,
  onClose,
  onDashboard,
  onResults,
}: {
  result: ResultSummary;
  onClose: () => void;
  onDashboard: () => void;
  onResults: () => void;
}) {
  const rows = analysisRowsToDisplayRows(result.analysisRows);
  const statusClass = getResultStatusClass(result.status);

  return (
    <div className="fixed inset-0 z-[10080] flex items-center justify-center bg-[rgba(15,23,42,0.72)] px-4 py-6 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-[980px] overflow-auto rounded-[30px] border border-white/25 bg-white p-5 shadow-[0_30px_90px_rgba(15,23,42,0.35)] md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#ECEAFD] pb-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#5B4FCF]">
              Test result
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-[#13102B] md:text-3xl">
              {result.title}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border px-3 py-1 text-xs font-black ${statusClass}`}
              >
                {result.status}
              </span>
              <span className="rounded-full border border-[#E2DEFF] bg-[#F7F6FF] px-3 py-1 text-xs font-black text-[#5B4FCF]">
                {result.source === "html" ? "HTML test" : "Builder test"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close result"
            className="grid h-10 w-10 place-items-center rounded-2xl border border-[#E2DEFF] text-[#6B6880] transition hover:bg-[#F7F6FF] hover:text-[#5B4FCF]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[24px] border border-[#E2DEFF] bg-gradient-to-br from-[#F7F6FF] to-white p-5">
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-2xl bg-[#EDE9FF] text-[#5B4FCF]">
              <BarChart3 size={18} />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#6B6880]">
              Score
            </p>
            <p className="mt-1 text-3xl font-black text-[#13102B]">
              {result.score}/{result.total}
            </p>
          </div>

          <div className="rounded-[24px] border border-[#E2DEFF] bg-gradient-to-br from-[#FFF8E8] to-white p-5">
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-2xl bg-[#FFF0C2] text-[#B7791F]">
              <ShieldCheck size={18} />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#6B6880]">
              Band
            </p>
            <p className="mt-1 text-3xl font-black text-[#13102B]">
              {result.band}
            </p>
          </div>

          <div className="rounded-[24px] border border-[#E2DEFF] bg-gradient-to-br from-[#EFFFF8] to-white p-5">
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-2xl bg-[#DDFBEF] text-emerald-600">
              <Clock size={18} />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#6B6880]">
              Spent time
            </p>
            <p className="mt-1 text-3xl font-black text-[#13102B]">
              {formatSpentTime(result.spentTimeSeconds)}
            </p>
          </div>

          <div className="rounded-[24px] border border-[#E2DEFF] bg-gradient-to-br from-[#F0F7FF] to-white p-5">
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-2xl bg-[#E1F0FF] text-[#2F80ED]">
              <ListChecks size={18} />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#6B6880]">
              Answered
            </p>
            <p className="mt-1 text-3xl font-black text-[#13102B]">
              {result.answeredCount}/{result.total}
            </p>
          </div>
        </div>

        {rows.length > 0 && (
          <div className="mt-5 rounded-[24px] border border-[#E2DEFF] bg-white p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-black text-[#13102B]">
                Answer review
              </h3>
              {rows.length < (result.analysisRows?.length || 0) && (
                <p className="text-xs font-bold text-[#6B6880]">
                  Showing first {rows.length} answers
                </p>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-[#F7F6FF] text-xs uppercase tracking-[0.12em] text-[#5B4FCF]">
                    <th className="border border-[#E2DEFF] px-3 py-2">Q</th>
                    <th className="border border-[#E2DEFF] px-3 py-2">
                      Your answer
                    </th>
                    <th className="border border-[#E2DEFF] px-3 py-2">
                      Correct answer
                    </th>
                    <th className="border border-[#E2DEFF] px-3 py-2">
                      Status
                    </th>
                    <th className="border border-[#E2DEFF] px-3 py-2">
                      Explanation
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={`${row.question}-${index}`}>
                      <td className="border border-[#E2DEFF] px-3 py-2 font-black">
                        {row.question}
                      </td>
                      <td className="border border-[#E2DEFF] px-3 py-2 font-semibold text-[#3F3A58]">
                        {row.userAnswer}
                      </td>
                      <td className="border border-[#E2DEFF] px-3 py-2 font-black text-[#13102B]">
                        {row.correctAnswer}
                      </td>
                      <td className="border border-[#E2DEFF] px-3 py-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-black ${
                            row.isCorrect
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {row.isCorrect ? "Correct" : "Incorrect"}
                        </span>
                      </td>
                      <td className="border border-[#E2DEFF] px-3 py-2 text-[#6B6880]">
                        {row.explanation || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onDashboard}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#13102B] px-5 py-3 text-sm font-black text-white transition hover:bg-[#262044]"
          >
            <Home size={16} /> Dashboard
          </button>
          <button
            type="button"
            onClick={onResults}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#5B4FCF] px-5 py-3 text-sm font-black text-white transition hover:bg-[#4740B8]"
          >
            <BarChart3 size={16} /> My Results
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-2xl border border-[#E2DEFF] bg-white px-5 py-3 text-sm font-black text-[#5B4FCF] transition hover:bg-[#F7F6FF]"
          >
            Back to Practice
          </button>
        </div>
      </div>
    </div>
  );
}

function BackConfirmModal({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[10090] flex items-center justify-center bg-[rgba(15,23,42,0.70)] px-4 backdrop-blur-sm">
      <div className="w-full max-w-[440px] rounded-[28px] border border-white/25 bg-white p-6 text-center shadow-[0_30px_90px_rgba(15,23,42,0.35)]">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#FFF3E5] text-[#D97706]">
          <ArrowLeft size={24} />
        </div>
        <h2 className="mt-4 text-2xl font-black text-[#13102B]">
          Dashboardga qaytasizmi?
        </h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-[#6B6880]">
          Test sahifasidan chiqmoqchisiz. Saqlanmagan javoblar yo‘qolishi
          mumkin.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-[#E2DEFF] bg-white px-5 py-3 text-sm font-black text-[#5B4FCF] transition hover:bg-[#F7F6FF]"
          >
            Yo‘q, qolaman
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-2xl bg-[#5B4FCF] px-5 py-3 text-sm font-black text-white transition hover:bg-[#4740B8]"
          >
            Ha, dashboardga qaytish
          </button>
        </div>
      </div>
    </div>
  );
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
  const [htmlProgress, setHtmlProgress] = useState<HtmlProgressState>(null);
  const [htmlResult, setHtmlResult] = useState<HtmlProgressState>(null);
  const [builderResult, setBuilderResult] = useState<ResultSummary | null>(
    null,
  );
  const [backConfirmOpen, setBackConfirmOpen] = useState(false);
  const savedHtmlAttemptsRef = useRef<Set<string>>(new Set());
  const builderStartedAtRef = useRef<number>(Date.now());

  const htmlTest = useMemo(
    () => parseHtmlTestDescription(test?.description),
    [test?.description],
  );

  const watchedHtml = useMemo(() => {
    if (!htmlTest || !test) return "";

    return injectHtmlTestWatcher(htmlTest.html, {
      testId,
      testTitle: test.title,
      skill: test.skill,
      durationMinutes: test.duration_minutes,
      fileName: htmlTest.fileName,
    });
  }, [htmlTest, test, testId]);

  const score = useMemo(() => {
    return questions.reduce((total, question) => {
      const userAnswer = answers[question.id] || "";
      if (
        normalizeAnswer(userAnswer) === normalizeAnswer(question.answer || "")
      ) {
        return total + 1;
      }
      return total;
    }, 0);
  }, [answers, questions]);

  const answeredCount = useMemo(
    () => questions.filter((item) => answers[item.id]?.trim()).length,
    [answers, questions],
  );

  const htmlResultSummary = useMemo<ResultSummary | null>(() => {
    if (!htmlResult || !test) return null;

    const scoreValue = safeNumber(htmlResult.score, 0);
    const totalValue = safeNumber(htmlResult.total, 0);
    const estimated = estimateAcademicReadingBand(scoreValue, totalValue);

    return {
      source: "html",
      title: test.title,
      skill: test.skill,
      score: scoreValue,
      total: totalValue,
      band: String(htmlResult.band || estimated.band),
      raw40: safeNumber(htmlResult.raw_40, estimated.raw40),
      status: statusLabel(htmlResult.status),
      spentTimeSeconds: safeNumber(htmlResult.spent_time_seconds, 0),
      answeredCount: safeNumber(htmlResult.answered_count, 0),
      analysisRows: htmlResult.analysis_rows,
      analysisText:
        htmlResult.analysis_text || htmlResult.report_for_docs || "",
      completedAt: htmlResult.completed_at,
    };
  }, [htmlResult, test]);

  function goToDashboard() {
    router.push("/dashboard");
  }

  function goToPractice() {
    router.push("/practice");
  }

  function goToResults() {
    router.push("/results");
  }

  useEffect(() => {
    let mounted = true;

    async function loadTest() {
      setLoading(true);
      setLoadError("");
      setSubmitError("");
      setHtmlProgress(null);
      setHtmlResult(null);
      setBuilderResult(null);
      setBackConfirmOpen(false);
      savedHtmlAttemptsRef.current.clear();
      builderStartedAtRef.current = Date.now();

      const { data: testData, error: testError } = await supabase
        .from("tests")
        .select(
          "id, title, skill, level, duration_minutes, description, passage_text, part",
        )
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
          "id, number, type, question, options, answer, explanation, part, group_label, group_instruction",
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
        }),
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

  useEffect(() => {
    if (!htmlTest || !test) return;

    const currentHtmlTest = htmlTest;
    const currentTest = test;

    async function saveHtmlResult(payload: HtmlWatcherResult) {
      const attemptId = String(
        payload.attempt_id || `html-${testId}-${Date.now()}`,
      );
      const saveKey = `${attemptId}:${payload.status || "completed"}`;
      if (savedHtmlAttemptsRef.current.has(saveKey)) return;
      savedHtmlAttemptsRef.current.add(saveKey);

      const scoreValue = safeNumber(payload.score, 0);
      const totalValue = safeNumber(payload.total, 0);
      const estimated = estimateAcademicReadingBand(scoreValue, totalValue);
      const bandValue = String(payload.band || estimated.band);
      const raw40Value = safeNumber(payload.raw_40, estimated.raw40);
      const statusValue = statusLabel(payload.status);

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) return;

        const minimalResult = {
          user_id: user.id,
          test_id: testId,
          skill: currentTest.skill,
          score: scoreValue,
          total: totalValue,
          band: bandValue,
          status: statusValue,
        };

        const extendedResult = {
          ...minimalResult,
          spent_time_seconds: safeNumber(payload.spent_time_seconds, 0),
          remaining_time_seconds: safeNumber(payload.remaining_time_seconds, 0),
          duration_seconds: safeNumber(payload.duration_seconds, 0),
          raw_40: raw40Value,
          answers: payload.answers || {},
          analysis_rows: payload.analysis_rows || [],
          analysis_text: payload.analysis_text || payload.report_for_docs || "",
          student_name: payload.student_name || "",
          candidate_id: payload.candidate_id || "",
          test_title: currentTest.title,
          html_file_name: currentHtmlTest.fileName,
          source: "html_watcher",
          completed_at: payload.completed_at || new Date().toISOString(),
        };

        const { error: detailedError } = await supabase
          .from("test_results")
          .insert(extendedResult);

        if (detailedError) {
          const { error: minimalError } = await supabase
            .from("test_results")
            .insert(minimalResult);

          if (minimalError) return;
        }

        await supabase.from("html_test_attempts").insert({
          user_id: user.id,
          test_id: testId,
          attempt_id: attemptId,
          skill: currentTest.skill,
          test_title: currentTest.title,
          html_file_name: currentHtmlTest.fileName,
          student_name: payload.student_name || "",
          candidate_id: payload.candidate_id || "",
          score: scoreValue,
          total: totalValue,
          raw_40: raw40Value,
          band: bandValue,
          status: statusValue,
          answers: payload.answers || {},
          analysis_rows: payload.analysis_rows || [],
          analysis_text: payload.analysis_text || payload.report_for_docs || "",
          started_at: payload.started_at || null,
          completed_at: payload.completed_at || new Date().toISOString(),
          spent_time_seconds: safeNumber(payload.spent_time_seconds, 0),
          security_reason:
            payload.security_reason || payload.blocked_reason || "",
          event_source: payload.event_source || "watcher",
        });

        router.refresh();
      } catch {
        // HTML test natijasi student UI'ni buzmasligi uchun xatoni jim ushlaymiz.
      }
    }

    function handleMessage(event: MessageEvent) {
      const data = event.data;
      if (!data || data.source !== HTML_WATCHER_SOURCE) return;
      if (data.testId !== testId) return;

      if (data.event === "back_to_dashboard") {
        router.push("/dashboard");
        return;
      }

      if (
        data.event === "started" ||
        data.event === "progress" ||
        data.event === "security"
      ) {
        setHtmlProgress(data.payload);
      }

      if (data.event === "result" || data.event === "blocked") {
        setHtmlProgress(data.payload);
        setHtmlResult(data.payload);
        saveHtmlResult(data.payload);
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [htmlTest, router, test, testId]);

  function setAnswer(questionId: string, value: string) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function resetTest() {
    setAnswers({});
    setFlagged({});
    setSubmitted(false);
    setSubmitError("");
    setBuilderResult(null);
    builderStartedAtRef.current = Date.now();
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
      const durationSeconds = Math.max(
        0,
        Number(test.duration_minutes || 0) * 60,
      );
      const elapsedSeconds = Math.max(
        0,
        Math.round((Date.now() - builderStartedAtRef.current) / 1000),
      );
      const spentTimeSeconds =
        durationSeconds > 0 && timeLeft !== null
          ? Math.max(0, durationSeconds - timeLeft)
          : elapsedSeconds;

      const { error } = await supabase.from("test_results").insert({
        user_id: user.id,
        test_id: testId,
        skill: test.skill,
        score,
        total: questions.length,
        band: finalBand,
        status: "Submitted",
        spent_time_seconds: spentTimeSeconds,
        remaining_time_seconds: timeLeft || 0,
        duration_seconds: durationSeconds,
        source: "builder",
        test_title: test.title,
        completed_at: new Date().toISOString(),
      });

      if (error) {
        setSubmitError(error.message);
        return;
      }

      setSubmitted(true);
      setBuilderResult({
        source: "builder",
        title: test.title,
        skill: test.skill,
        score,
        total: questions.length,
        band: finalBand,
        status: "Submitted",
        spentTimeSeconds,
        answeredCount,
        analysisRows: questions.map((question) => {
          const userAnswer = answers[question.id] || "";
          const isCorrect =
            normalizeAnswer(userAnswer) ===
            normalizeAnswer(question.answer || "");

          return {
            question: question.number,
            user_answer: userAnswer || "No answer",
            correct_answer: question.answer || "Not set",
            is_correct: isCorrect,
            explanation: question.explanation || "",
          };
        }),
        completedAt: new Date().toISOString(),
      });
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
        <main className="grid min-h-screen place-items-center bg-[#F0EEFF] px-6 text-[#13102B]">
          <div className="rounded-[24px] border border-[#E2DEFF] bg-white p-8 text-center shadow-[0_16px_40px_rgba(91,79,207,0.10)]">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#5B4FCF]">
              Loading test
            </p>
            <h1 className="mt-3 text-2xl font-black">Please wait...</h1>
          </div>
        </main>
      </ProtectedPage>
    );
  }

  if (loadError || !test) {
    return (
      <ProtectedPage>
        <main className="grid min-h-screen place-items-center bg-[#F0EEFF] px-6 text-[#13102B]">
          <div className="max-w-[520px] rounded-[24px] border border-[#E2DEFF] bg-white p-8 text-center shadow-[0_16px_40px_rgba(91,79,207,0.10)]">
            <h1 className="text-2xl font-black">Test ochilmadi</h1>
            <p className="mt-3 text-sm font-semibold text-[#6B6880]">
              {loadError || "Test not found."}
            </p>
            <Link
              href="/practice"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#5B4FCF] px-5 py-3 text-sm font-black text-white"
            >
              <ArrowLeft size={16} /> Back to practice
            </Link>
          </div>
        </main>
      </ProtectedPage>
    );
  }

  if (htmlTest) {
    return (
      <ProtectedPage>
        <main className="fixed inset-0 z-[9999] bg-white">
          <button
            type="button"
            onClick={() => setBackConfirmOpen(true)}
            className="fixed left-4 top-4 z-[10020] inline-flex items-center gap-2 rounded-2xl border border-white/70 bg-white/95 px-4 py-2.5 text-sm font-black text-[#13102B] shadow-[0_10px_30px_rgba(15,23,42,0.18)] backdrop-blur transition hover:bg-[#F7F6FF] hover:text-[#5B4FCF]"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <iframe
            title={test.title}
            srcDoc={watchedHtml}
            className="h-screen w-screen border-0 bg-white"
            allow="fullscreen; clipboard-read; clipboard-write"
            allowFullScreen
          />

          <span className="sr-only">
            {htmlResult
              ? `Saved ${htmlResult.score}/${htmlResult.total} band ${htmlResult.band}`
              : `${safeNumber(htmlProgress?.answered_count, 0)} answers watched`}
          </span>

          {htmlResultSummary && (
            <ResultSummaryModal
              result={htmlResultSummary}
              onClose={goToPractice}
              onDashboard={goToDashboard}
              onResults={goToResults}
            />
          )}

          {backConfirmOpen && (
            <BackConfirmModal
              onCancel={() => setBackConfirmOpen(false)}
              onConfirm={goToDashboard}
            />
          )}
        </main>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage>
      <main className="min-h-screen bg-[#F0EEFF] p-5 text-[#13102B] md:p-8">
        <div className="mx-auto max-w-[1380px]">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-[#E2DEFF] bg-white p-5 shadow-[0_16px_40px_rgba(91,79,207,0.08)]">
            <div>
              <button
                type="button"
                onClick={() => setBackConfirmOpen(true)}
                className="mb-3 inline-flex items-center gap-2 text-sm font-black text-[#5B4FCF]"
              >
                <ArrowLeft size={16} /> Back
              </button>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#5B4FCF]">
                {skillLabel(test.skill)} Practice
              </p>
              <h1 className="mt-2 text-2xl font-black md:text-3xl">
                {test.title}
              </h1>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="rounded-2xl border border-[#E2DEFF] bg-[#F7F6FF] px-4 py-3 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#5B4FCF]">
                  Time
                </p>
                <p className="mt-1 text-sm font-black">
                  {formatSeconds(timeLeft)}
                </p>
              </div>
              <div className="rounded-2xl border border-[#E2DEFF] bg-[#F7F6FF] px-4 py-3 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#5B4FCF]">
                  Answered
                </p>
                <p className="mt-1 text-sm font-black">
                  {answeredCount}/{questions.length}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            <section className="rounded-[28px] border border-[#E2DEFF] bg-white p-6 shadow-[0_16px_40px_rgba(91,79,207,0.08)]">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-[#5B4FCF]">
                Passage / Prompt
              </p>
              <h2 className="mb-4 text-xl font-black">{test.title}</h2>
              <div className="space-y-4 text-sm font-medium leading-7 text-[#3F3A58]">
                {getPassageText(test)
                  .split("\n")
                  .map((paragraph, index) => {
                    const clean = paragraph.trim();
                    if (!clean) return null;
                    return <p key={index}>{clean}</p>;
                  })}
              </div>
            </section>

            <section className="rounded-[28px] border border-[#E2DEFF] bg-white p-6 shadow-[0_16px_40px_rgba(91,79,207,0.08)]">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#5B4FCF]">
                    Questions
                  </p>
                  <h2 className="mt-1 text-xl font-black">IELTS test player</h2>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={resetTest}
                    className="inline-flex items-center gap-2 rounded-2xl border border-[#E2DEFF] bg-white px-4 py-2 text-sm font-black text-[#5B4FCF] transition hover:bg-[#F7F6FF]"
                  >
                    <RotateCcw size={15} /> Reset
                  </button>
                  <button
                    type="button"
                    onClick={submitResult}
                    disabled={saving || submitted}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#5B4FCF] px-4 py-2 text-sm font-black text-white transition hover:bg-[#4740B8] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Send size={15} /> {saving ? "Saving..." : "Submit"}
                  </button>
                </div>
              </div>

              {questions.length === 0 ? (
                <div className="rounded-[22px] border border-dashed border-[#E2DEFF] bg-[#F7F6FF] p-8 text-center">
                  <TimerReset className="mx-auto text-[#5B4FCF]" size={30} />
                  <p className="mt-3 text-sm font-black">No questions found</p>
                  <p className="mt-2 text-sm font-medium text-[#6B6880]">
                    Bu builder test. Savollarni Admin Questions yoki Supabase
                    questions jadvalidan qo‘shing.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((question) => {
                    const selected = answers[question.id] || "";
                    const isFlagged = flagged[question.id];
                    const correct =
                      submitted &&
                      normalizeAnswer(selected) ===
                        normalizeAnswer(question.answer || "");
                    const wrong = submitted && selected && !correct;

                    return (
                      <article
                        key={question.id}
                        className="rounded-[24px] border border-[#E2DEFF] bg-[#FBFAFF] p-5"
                      >
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#5B4FCF]">
                              Q{question.number} · {question.type}
                            </p>
                            <h3 className="mt-2 text-base font-black leading-7">
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
                            <Flag size={16} />
                          </button>
                        </div>

                        {question.options.length > 0 ? (
                          <div className="grid gap-2">
                            {question.options.map((option, index) => {
                              const value = getOptionValue(
                                question,
                                option,
                                index,
                              );
                              const active = selected === value;
                              return (
                                <button
                                  key={`${question.id}-${option}-${index}`}
                                  type="button"
                                  disabled={submitted}
                                  onClick={() => setAnswer(question.id, value)}
                                  className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-bold transition disabled:cursor-not-allowed ${
                                    active
                                      ? "border-[#5B4FCF] bg-[#EEF0FF] text-[#13102B]"
                                      : "border-[#E2DEFF] bg-white text-[#3F3A58] hover:border-[#5B4FCF] hover:bg-[#F7F6FF]"
                                  }`}
                                >
                                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-[#F0EEFF] text-xs font-black text-[#5B4FCF]">
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
                            className={`mt-4 rounded-2xl border p-4 text-sm font-bold ${
                              correct
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-rose-200 bg-rose-50 text-rose-700"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {correct ? (
                                <CheckCircle2 size={16} />
                              ) : (
                                <XCircle size={16} />
                              )}
                              {correct
                                ? "Correct"
                                : wrong
                                  ? "Incorrect"
                                  : "No answer"}
                            </div>
                            <p className="mt-2">
                              Correct answer: {question.answer || "Not set"}
                            </p>
                            {question.explanation && (
                              <p className="mt-2 font-semibold opacity-80">
                                Proof: {question.explanation}
                              </p>
                            )}
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}

              {submitError && (
                <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">
                  <p>Result was not saved</p>
                  <p className="mt-1 font-semibold">{submitError}</p>
                </div>
              )}
            </section>
          </div>
        </div>
        {builderResult && (
          <ResultSummaryModal
            result={builderResult}
            onClose={goToPractice}
            onDashboard={goToDashboard}
            onResults={goToResults}
          />
        )}

        {backConfirmOpen && (
          <BackConfirmModal
            onCancel={() => setBackConfirmOpen(false)}
            onConfirm={goToDashboard}
          />
        )}
      </main>
    </ProtectedPage>
  );
}
