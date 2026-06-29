"use client";

import { useEffect, useMemo, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import UserBadge from "@/components/UserBadge";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  GripVertical,
  Headphones,
  HelpCircle,
  Lock,
  Mic,
  Pencil,
  RotateCcw,
  Send,
  Timer,
  Trophy,
  Volume2,
  X,
} from "lucide-react";

type Skill = "listening" | "reading" | "writing" | "speaking" | "fullmock";

type TestRow = {
  id: string;
  title: string;
  skill: Skill;
  level: string | null;
  duration_minutes: number | null;
  description: string | null;
  passage_text: string | null;
  part: string | null;
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

type QuestionGroup = {
  key: string;
  part: string;
  label: string;
  instruction: string;
  questions: Question[];
};

function skillMeta(skill: Skill, duration?: number | null) {
  const time = duration ? `${duration} min` : "No limit";

  if (skill === "listening") {
    return {
      title: "Listening Practice",
      icon: Headphones,
      color: "#5B4FCF",
      time,
    };
  }

  if (skill === "writing") {
    return {
      title: "Writing Practice",
      icon: Pencil,
      color: "#E24B4A",
      time,
    };
  }

  if (skill === "speaking") {
    return {
      title: "Speaking Practice",
      icon: Mic,
      color: "#1D9E75",
      time,
    };
  }

  if (skill === "fullmock") {
    return {
      title: "Full Mock Test",
      icon: Trophy,
      color: "#7B6FE8",
      time,
    };
  }

  return {
    title: "Reading Practice",
    icon: BookOpen,
    color: "#378ADD",
    time,
  };
}

function bandFromScore(score: number, total: number) {
  const percent = total === 0 ? 0 : score / total;

  if (percent >= 0.9) return "8.5";
  if (percent >= 0.8) return "7.5";
  if (percent >= 0.65) return "6.5";
  if (percent >= 0.5) return "5.5";

  return "4.5";
}

function demoBandForWriting(wordCount: number) {
  if (wordCount >= 250) return "7.0";
  if (wordCount >= 180) return "6.5";
  if (wordCount >= 120) return "5.5";
  return "4.5";
}

function demoBandForSpeaking(noteLength: number) {
  if (noteLength >= 80) return "7.0";
  if (noteLength >= 40) return "6.5";
  if (noteLength >= 15) return "5.5";
  return "4.5";
}

function normalizeAnswer(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function optionsFromJson(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }

  return [];
}

function answerLetterFromIndex(index: number) {
  return String.fromCharCode(65 + index);
}

function isMcq(question: Question) {
  const type = question.type.toLowerCase();
  return type.includes("mcq") || type.includes("multiple");
}

function isTfng(question: Question) {
  const type = question.type.toLowerCase();
  return (
    type.includes("tfng") ||
    type.includes("true") ||
    type.includes("false") ||
    type.includes("not given")
  );
}

function isMatchingQuestion(question: Question) {
  const type = question.type.toLowerCase();
  return (
    type.includes("matching") ||
    type.includes("heading") ||
    type.includes("information") ||
    type.includes("features") ||
    type.includes("sentence ending")
  );
}

function isTextAnswerQuestion(question: Question) {
  const type = question.type.toLowerCase();

  return (
    question.options.length === 0 ||
    type.includes("gap") ||
    type.includes("short") ||
    type.includes("fill") ||
    type.includes("summary") ||
    type.includes("completion") ||
    type.includes("sentence completion")
  );
}

function getOptionValue(question: Question, option: string, index: number) {
  if (isMcq(question)) {
    return answerLetterFromIndex(index);
  }

  if (isTfng(question)) {
    const clean = option.replace(/^[A-Da-d]\)\s*/, "").trim();
    return clean;
  }

  return option;
}

function formatSeconds(seconds: number | null) {
  if (seconds === null) return "No limit";

  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

function formatPartLabel(value?: string | null) {
  if (!value || value === "full") return "Full test";

  return value
    .replace("part", "Part ")
    .replace("passage", "Passage ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function buildQuestionGroups(questions: Question[]): QuestionGroup[] {
  const groups = new Map<string, QuestionGroup>();

  questions.forEach((question) => {
    const key = `${question.part || "part1"}::${
      question.groupLabel || question.groupInstruction || question.type
    }`;

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        part: question.part || "part1",
        label: question.groupLabel || `${question.type} Questions`,
        instruction:
          question.groupInstruction ||
          "Choose the correct answer according to the passage.",
        questions: [],
      });
    }

    groups.get(key)?.questions.push(question);
  });

  return Array.from(groups.values()).map((group) => ({
    ...group,
    questions: group.questions.sort((a, b) => a.number - b.number),
  }));
}

function getPassageText(test: TestRow | null) {
  const passage = test?.passage_text?.trim();
  const description = test?.description?.trim();

  if (passage) return passage;
  if (description) return description;

  return `No passage text has been added yet.

Go to Supabase or Admin Tests and add passage_text for this Reading test. After that, the full passage will appear here in IELTS split-screen format.`;
}

export default function PracticeTestPage() {
  const params = useParams();
  const router = useRouter();

  const testId = String(params?.id ?? "");

  const [test, setTest] = useState<TestRow | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const skill: Skill = test?.skill || "reading";
  const meta = skillMeta(skill, test?.duration_minutes);
  const MetaIcon = meta.icon;

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [essay, setEssay] = useState("");
  const [speakingNotes, setSpeakingNotes] = useState("");
  const [savingResult, setSavingResult] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [notice, setNotice] = useState("");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const [leftWidth, setLeftWidth] = useState(48);
  const [isDragging, setIsDragging] = useState(false);

  const currentQuestion = questions[current];
  const wordCount = essay.trim() ? essay.trim().split(/\s+/).length : 0;
  const speakingWordCount = speakingNotes.trim()
    ? speakingNotes.trim().split(/\s+/).length
    : 0;

  const passageText = getPassageText(test);
  const questionGroups = useMemo(() => buildQuestionGroups(questions), [questions]);

  useEffect(() => {
    let mounted = true;

    async function loadTest() {
      setLoading(true);
      setLoadError("");
      setSubmitError("");

      const { data: testData, error: testError } = await supabase
        .from("tests")
        .select(
          "id, title, skill, level, duration_minutes, description, passage_text, part"
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

      setTest(testData as TestRow);
      setQuestions(mappedQuestions);
      setCurrent(0);
      setAnswers({});
      setFlagged({});
      setSubmitted(false);
      setEssay("");
      setSpeakingNotes("");

      const minutes = Number((testData as TestRow).duration_minutes) || 0;
      setTimeLeft(minutes > 0 ? minutes * 60 : null);

      setLoading(false);
    }

    loadTest();

    return () => {
      mounted = false;
    };
  }, [testId]);

  useEffect(() => {
    if (timeLeft === null || submitted || loading || loadError) return;

    if (timeLeft <= 0) {
      setNotice("Time is over. Please submit your test.");
      return;
    }

    const interval = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return null;
        return Math.max(0, prev - 1);
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [timeLeft, submitted, loading, loadError]);

  useEffect(() => {
    if (!isDragging) return;

    function handleMove(event: MouseEvent) {
      const viewportWidth = window.innerWidth;
      const percent = (event.clientX / viewportWidth) * 100;
      const safePercent = Math.min(62, Math.max(34, percent));

      setLeftWidth(safePercent);
    }

    function handleUp() {
      setIsDragging(false);
    }

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [isDragging]);

  const score = useMemo(() => {
    return questions.reduce((total, question) => {
      const userAnswer = answers[question.id] || "";
      const correctAnswer = question.answer || "";

      if (normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer)) {
        return total + 1;
      }

      return total;
    }, 0);
  }, [answers, questions]);

  const answeredCount = useMemo(() => {
    return questions.filter((question) => answers[question.id]?.trim()).length;
  }, [answers, questions]);

  const finalBand =
    skill === "writing"
      ? demoBandForWriting(wordCount)
      : skill === "speaking"
      ? demoBandForSpeaking(speakingWordCount)
      : bandFromScore(score, questions.length);

  function showNotice(message: string) {
    setNotice(message);

    window.setTimeout(() => {
      setNotice("");
    }, 2800);
  }

  function setAnswer(questionId: string, value: string) {
    if (submitted) return;

    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  }

  async function submitAndGoResults() {
    setSubmitError("");

    if (savingResult) return;

    if (
      (skill === "reading" || skill === "listening" || skill === "fullmock") &&
      questions.length === 0
    ) {
      setSubmitError(
        "This test has no questions yet. Add questions in Supabase first."
      );
      return;
    }

    if (skill === "writing" && wordCount < 20) {
      setSubmitError("Please write your answer before submitting.");
      return;
    }

    if (skill === "speaking" && speakingNotes.trim().length < 5) {
      setSubmitError("Please add your speaking notes before submitting.");
      return;
    }

    const total = skill === "writing" || skill === "speaking" ? 1 : questions.length;

    const finalScore =
      skill === "writing"
        ? wordCount >= 250
          ? 1
          : 0
        : skill === "speaking"
        ? speakingNotes.trim().length >= 15
          ? 1
          : 0
        : score;

    try {
      setSavingResult(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setSubmitError("Please sign in again before submitting the test.");
        return;
      }

      const { error } = await supabase.from("test_results").insert({
        user_id: user.id,
        test_id: testId,
        skill,
        score: finalScore,
        total,
        band: finalBand,
        status: "Submitted",
      });

      if (error) {
        setSubmitError(error.message);
        return;
      }

      setSubmitted(true);

      const resultParams = new URLSearchParams({
        test: testId,
        skill,
        score: String(finalScore),
        total: String(total),
        band: finalBand,
        status: "Submitted",
      });

      router.push(`/results?${resultParams.toString()}`);
      router.refresh();
    } catch {
      setSubmitError("Something went wrong while saving your result.");
    } finally {
      setSavingResult(false);
    }
  }

  function resetTest() {
    setAnswers({});
    setFlagged({});
    setCurrent(0);
    setSubmitted(false);
    setEssay("");
    setSpeakingNotes("");
    setSubmitError("");

    const minutes = Number(test?.duration_minutes) || 0;
    setTimeLeft(minutes > 0 ? minutes * 60 : null);
  }

  function renderTextAnswer(question: Question) {
    return (
      <input
        value={answers[question.id] || ""}
        onChange={(event) => setAnswer(question.id, event.target.value)}
        disabled={submitted}
        placeholder="Type your answer here..."
        className="w-full rounded-xl border border-[#DAD6F8] bg-white px-4 py-3 text-sm font-semibold text-[#13102B] outline-none transition focus:border-[#5B4FCF] disabled:cursor-not-allowed disabled:opacity-70"
      />
    );
  }

  function renderOptionQuestion(question: Question) {
    return (
      <div className="space-y-2.5">
        {question.options.map((option, index) => {
          const answerValue = getOptionValue(question, option, index);
          const selected = answers[question.id] === answerValue;

          const correct =
            submitted &&
            normalizeAnswer(question.answer) === normalizeAnswer(answerValue);

          const wrong =
            submitted &&
            selected &&
            normalizeAnswer(question.answer) !== normalizeAnswer(answerValue);

          return (
            <button
              key={`${question.id}-${option}`}
              type="button"
              disabled={submitted}
              onClick={() => setAnswer(question.id, answerValue)}
              className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition hover:-translate-y-0.5 ${
                correct
                  ? "border-[#1D9E75] bg-emerald-50"
                  : wrong
                  ? "border-[#E24B4A] bg-rose-50"
                  : selected
                  ? "border-[#5B4FCF] bg-[#EEF0FF]"
                  : "border-[#E2DEFF] bg-white hover:border-[#5B4FCF] hover:bg-[#F7F6FF]"
              }`}
            >
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-extrabold ${
                  selected || correct
                    ? "bg-[#5B4FCF] text-white"
                    : "bg-[#EEF0FF] text-[#5B4FCF]"
                }`}
              >
                {isMcq(question) ? answerLetterFromIndex(index) : index + 1}
              </span>

              <span className="flex-1 text-sm font-semibold leading-6 text-[#13102B]">
                {option.replace(/^[A-Da-d]\)\s*/, "")}
              </span>

              {correct && <CheckCircle2 size={18} className="text-[#1D9E75]" />}
            </button>
          );
        })}
      </div>
    );
  }

  function renderReadingQuestion(question: Question) {
    const isCurrent = currentQuestion?.id === question.id;
    const answered = answers[question.id]?.trim();
    const isFlagged = flagged[question.id];

    return (
      <div
        id={`question-${question.number}`}
        key={question.id}
        className={`rounded-2xl border bg-white p-4 transition ${
          isCurrent
            ? "border-[#5B4FCF] shadow-[0_10px_28px_rgba(91,79,207,0.12)]"
            : "border-[#E2DEFF]"
        }`}
        onClick={() => {
          const index = questions.findIndex((item) => item.id === question.id);
          if (index >= 0) setCurrent(index);
        }}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#5B4FCF] px-3 py-1 text-[10px] font-extrabold text-white">
                Q{question.number}
              </span>

              <span className="rounded-full bg-[#EEF0FF] px-3 py-1 text-[10px] font-extrabold text-[#5B4FCF]">
                {question.type}
              </span>

              {answered && (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-extrabold text-[#1D9E75]">
                  Answered
                </span>
              )}
            </div>

            <p className="text-sm font-extrabold leading-7 text-[#13102B]">
              {question.question}
            </p>
          </div>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setFlagged((prev) => ({
                ...prev,
                [question.id]: !prev[question.id],
              }));
            }}
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border transition ${
              isFlagged
                ? "border-[#F5A623] bg-amber-50 text-[#F5A623]"
                : "border-[#E2DEFF] text-[#6B6880] hover:border-[#5B4FCF] hover:text-[#5B4FCF]"
            }`}
          >
            <Flag size={16} />
          </button>
        </div>

        {isTextAnswerQuestion(question) ? (
          renderTextAnswer(question)
        ) : (
          renderOptionQuestion(question)
        )}

        {submitted && (
          <div className="mt-3 rounded-xl bg-[#F7F6FF] p-3 text-xs leading-5 text-[#6B6880]">
            <span className="font-extrabold text-[#13102B]">Correct answer:</span>{" "}
            {question.answer || "Not set"}
            {question.explanation && (
              <p className="mt-1">
                <span className="font-extrabold text-[#13102B]">Proof:</span>{" "}
                {question.explanation}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  function renderReadingInterface() {
    return (
      <div className="overflow-hidden rounded-3xl border border-[#E2DEFF] bg-white shadow-[0_14px_40px_rgba(91,79,207,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2DEFF] bg-white px-5 py-4">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#5B4FCF]">
              IELTS READING INTERFACE
            </p>

            <h2 className="mt-1 text-lg font-extrabold text-[#13102B]">
              {formatPartLabel(test?.part)} · Split screen mode
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setLeftWidth((prev) => Math.max(34, prev - 4))}
              className="grid h-9 w-9 place-items-center rounded-xl border border-[#E2DEFF] bg-white text-[#6B6880] transition hover:border-[#5B4FCF] hover:text-[#5B4FCF]"
            >
              <ChevronLeft size={17} />
            </button>

            <button
              type="button"
              onClick={() => setLeftWidth(48)}
              className="rounded-xl border border-[#E2DEFF] bg-white px-3 py-2 text-xs font-bold text-[#6B6880] transition hover:border-[#5B4FCF] hover:text-[#5B4FCF]"
            >
              Reset split
            </button>

            <button
              type="button"
              onClick={() => setLeftWidth((prev) => Math.min(62, prev + 4))}
              className="grid h-9 w-9 place-items-center rounded-xl border border-[#E2DEFF] bg-white text-[#6B6880] transition hover:border-[#5B4FCF] hover:text-[#5B4FCF]"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>

        <div
          className={`relative flex min-h-[690px] ${
            isDragging ? "cursor-col-resize select-none" : ""
          }`}
        >
          <section
            className="min-w-0 border-r border-[#E2DEFF] bg-[#FCFBFF]"
            style={{ width: `${leftWidth}%` }}
          >
            <div className="sticky top-[62px] z-10 border-b border-[#E2DEFF] bg-white/95 px-5 py-3 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#6B6880]">
                    Passage
                  </p>
                  <p className="text-sm font-extrabold text-[#13102B]">
                    {test?.title}
                  </p>
                </div>

                <BookOpen size={20} className="text-[#378ADD]" />
              </div>
            </div>

            <div className="h-[640px] overflow-y-auto px-6 py-5">
              <article className="prose prose-sm max-w-none">
                {passageText.split("\n").map((paragraph, index) => {
                  const clean = paragraph.trim();

                  if (!clean) return <div key={index} className="h-4" />;

                  return (
                    <p
                      key={index}
                      className="mb-5 text-[15px] font-medium leading-8 text-[#1A1729]"
                    >
                      {clean}
                    </p>
                  );
                })}
              </article>
            </div>
          </section>

          <button
            type="button"
            aria-label="Resize reading split"
            onMouseDown={() => setIsDragging(true)}
            className="absolute top-0 z-20 grid h-full w-5 -translate-x-1/2 place-items-center text-[#A9A3D8] hover:text-[#5B4FCF]"
            style={{ left: `${leftWidth}%` }}
          >
            <span className="grid h-16 w-4 place-items-center rounded-full border border-[#E2DEFF] bg-white shadow-sm">
              <GripVertical size={16} />
            </span>
          </button>

          <section className="min-w-0 flex-1 bg-[#F7F6FF]">
            <div className="sticky top-[62px] z-10 border-b border-[#E2DEFF] bg-white/95 px-5 py-3 backdrop-blur-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#6B6880]">
                    Questions
                  </p>

                  <p className="text-sm font-extrabold text-[#13102B]">
                    {answeredCount}/{questions.length} answered
                  </p>
                </div>

                <button
                  type="button"
                  disabled={savingResult}
                  onClick={submitAndGoResults}
                  className="flex items-center gap-2 rounded-xl bg-[#5B4FCF] px-4 py-2.5 text-xs font-extrabold text-white shadow-[0_8px_22px_rgba(91,79,207,.22)] transition hover:-translate-y-0.5 hover:bg-[#4740b8] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Send size={15} /> {savingResult ? "Saving..." : "Submit"}
                </button>
              </div>
            </div>

            <div className="h-[640px] overflow-y-auto px-5 py-5">
              {questions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#DAD6F8] bg-white p-8 text-center">
                  <Lock className="mx-auto mb-3 text-[#6B6880]" />
                  <p className="font-extrabold text-[#13102B]">
                    No questions found
                  </p>
                  <p className="mt-2 text-sm text-[#6B6880]">
                    Add questions for this reading test from Admin Questions.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {questionGroups.map((group) => (
                    <section key={group.key} className="space-y-3">
                      <div className="rounded-2xl border border-[#E2DEFF] bg-white p-4">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-[#EEF0FF] px-3 py-1 text-[10px] font-extrabold text-[#5B4FCF]">
                            {formatPartLabel(group.part)}
                          </span>

                          <span className="rounded-full bg-[#F7F6FF] px-3 py-1 text-[10px] font-extrabold text-[#6B6880]">
                            {group.questions[0]?.number}-
                            {group.questions[group.questions.length - 1]?.number}
                          </span>
                        </div>

                        <h3 className="text-sm font-extrabold text-[#13102B]">
                          {group.label}
                        </h3>

                        <p className="mt-2 text-sm font-medium leading-6 text-[#6B6880]">
                          {group.instruction}
                        </p>
                      </div>

                      {group.questions.map((question) =>
                        renderReadingQuestion(question)
                      )}
                    </section>
                  ))}

                  {submitError && (
                    <div className="rounded-2xl border border-[#E24B4A] bg-[#FFF0EE] p-5">
                      <h3 className="text-lg font-extrabold text-[#E24B4A]">
                        Result was not saved
                      </h3>
                      <p className="mt-2 text-sm font-semibold text-[#6B6880]">
                        {submitError}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="border-t border-[#E2DEFF] bg-white px-5 py-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-2">
              {questions.map((question, index) => {
                const answered = answers[question.id];
                const isCurrent = current === index;
                const isFlagged = flagged[question.id];

                return (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => {
                      setCurrent(index);
                      document
                        .getElementById(`question-${question.number}`)
                        ?.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                    }}
                    className={`relative grid h-9 w-9 place-items-center rounded-xl border text-xs font-extrabold transition hover:-translate-y-0.5 ${
                      isCurrent
                        ? "border-[#5B4FCF] bg-[#5B4FCF] text-white shadow-[0_4px_12px_rgba(91,79,207,0.24)]"
                        : answered
                        ? "border-[#1D9E75] bg-emerald-50 text-[#1D9E75]"
                        : "border-[#E2DEFF] bg-white text-[#6B6880] hover:border-[#5B4FCF] hover:text-[#5B4FCF]"
                    }`}
                  >
                    {question.number}
                    {isFlagged && (
                      <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#F5A623]" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={resetTest}
                className="flex items-center gap-2 rounded-xl border border-[#E2DEFF] bg-white px-5 py-3 text-sm font-bold text-[#6B6880] transition hover:border-[#5B4FCF] hover:text-[#5B4FCF]"
              >
                <RotateCcw size={17} /> Reset
              </button>

              <button
                type="button"
                disabled={savingResult}
                onClick={submitAndGoResults}
                className="flex items-center gap-2 rounded-xl bg-[#5B4FCF] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(91,79,207,.22)] transition hover:-translate-y-0.5 hover:bg-[#4740b8] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send size={17} /> {savingResult ? "Saving..." : "Submit test"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderResourcePanel() {
    if (skill === "listening") {
      return (
        <div className="rounded-2xl border border-[#E2DEFF] bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold tracking-widest text-[#6B6880]">
                AUDIO PLAYER
              </p>
              <h2 className="mt-1 text-lg font-extrabold text-[#13102B]">
                {test?.title}
              </h2>
            </div>
            <Headphones className="text-[#5B4FCF]" />
          </div>

          <div className="rounded-2xl bg-[#EEF0FF] p-5">
            <div className="mb-5 flex items-center gap-4">
              <button
                type="button"
                onClick={() =>
                  showNotice(
                    "Audio player demo hozircha tayyor. Real audio Supabase Storage bilan keyingi update’da ulanadi."
                  )
                }
                className="grid h-14 w-14 place-items-center rounded-full bg-[#5B4FCF] text-white shadow-[0_8px_24px_rgba(91,79,207,.22)] transition hover:-translate-y-0.5 hover:bg-[#4740b8]"
              >
                <Volume2 size={24} />
              </button>

              <div className="flex-1">
                <p className="font-extrabold text-[#13102B]">Audio demo</p>
                <p className="text-sm text-[#6B6880]">
                  Real audio file will come from Supabase Storage later.
                </p>
              </div>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-white">
              <div className="h-full w-[38%] rounded-full bg-[#5B4FCF]" />
            </div>
          </div>
        </div>
      );
    }

    if (skill === "writing") {
      return (
        <div className="rounded-2xl border border-[#E2DEFF] bg-white p-5">
          <p className="text-[10px] font-extrabold tracking-widest text-[#6B6880]">
            WRITING TASK
          </p>

          <h2 className="mt-1 text-lg font-extrabold text-[#13102B]">
            {test?.title}
          </h2>

          <div className="mt-4 rounded-2xl bg-[#F7F6FF] p-5">
            <p className="text-sm leading-8 text-[#1A1729]">
              {questions[0]?.question ||
                "Write your response. The writing prompt will be loaded from the questions table."}
            </p>

            <p className="mt-4 text-sm font-bold text-[#6B6880]">
              Write at least 250 words. You should spend about{" "}
              {test?.duration_minutes || 40} minutes on this task.
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-[#E2DEFF] p-4">
              <p className="text-[10px] font-bold text-[#6B6880]">MIN WORDS</p>
              <p className="text-xl font-extrabold text-[#5B4FCF]">250</p>
            </div>

            <div className="rounded-2xl border border-[#E2DEFF] p-4">
              <p className="text-[10px] font-bold text-[#6B6880]">YOUR WORDS</p>
              <p
                className={`text-xl font-extrabold ${
                  wordCount >= 250 ? "text-[#1D9E75]" : "text-[#E24B4A]"
                }`}
              >
                {wordCount}
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (skill === "speaking") {
      return (
        <div className="rounded-2xl border border-[#E2DEFF] bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold tracking-widest text-[#6B6880]">
                SPEAKING SIMULATOR
              </p>
              <h2 className="mt-1 text-lg font-extrabold text-[#13102B]">
                {test?.title}
              </h2>
            </div>
            <Mic className="text-[#1D9E75]" />
          </div>

          <div className="space-y-3">
            {questions.length > 0 ? (
              questions.map((question) => (
                <div
                  key={question.id}
                  className="rounded-2xl border border-[#E2DEFF] bg-[#F7F6FF] p-4"
                >
                  <p className="text-xs font-extrabold text-[#5B4FCF]">
                    Question {question.number}
                  </p>
                  <p className="mt-1 font-bold text-[#13102B]">
                    {question.question}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-[#E2DEFF] bg-[#F7F6FF] p-4">
                <p className="font-bold text-[#13102B]">
                  No speaking questions added yet.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 rounded-2xl bg-[#EEF0FF] p-4 text-center">
            <button
              type="button"
              onClick={() =>
                showNotice(
                  "Recording demo keyingi update’da qo‘shiladi. Hozircha speaking notes yozib submit qil."
                )
              }
              className="rounded-full bg-[#1D9E75] px-6 py-3 text-sm font-extrabold text-white transition hover:-translate-y-0.5"
            >
              Start Recording Demo
            </button>
            <p className="mt-2 text-xs text-[#6B6880]">
              Real recording will be added later.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-[#E2DEFF] bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold tracking-widest text-[#6B6880]">
              PASSAGE
            </p>
            <h2 className="mt-1 text-lg font-extrabold text-[#13102B]">
              {test?.title}
            </h2>
          </div>
          <BookOpen className="text-[#378ADD]" />
        </div>

        <div className="max-h-[620px] overflow-y-auto rounded-2xl bg-[#F7F6FF] p-5 leading-8 text-[#1A1729]">
          {passageText.split("\n").map((paragraph, index) => (
            <p key={index} className="mb-5 text-sm">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    );
  }

  function renderMainWorkArea() {
    if (skill === "writing") {
      return (
        <div className="rounded-2xl border border-[#E2DEFF] bg-white p-5">
          <div className="mb-4">
            <p className="text-[10px] font-extrabold tracking-widest text-[#6B6880]">
              ANSWER BOX
            </p>
            <h2 className="mt-1 text-xl font-extrabold text-[#13102B]">
              Write your essay
            </h2>
          </div>

          <textarea
            value={essay}
            onChange={(event) => setEssay(event.target.value)}
            placeholder="Start writing your essay here..."
            className="min-h-[430px] w-full resize-none rounded-2xl border border-[#E2DEFF] bg-[#F7F6FF] p-5 text-sm leading-8 outline-none transition hover:border-[#5B4FCF] focus:border-[#5B4FCF]"
          />

          <div className="mt-5 flex flex-wrap justify-between gap-3">
            <button
              type="button"
              onClick={resetTest}
              className="flex items-center gap-2 rounded-xl border border-[#E2DEFF] bg-white px-5 py-3 text-sm font-bold text-[#6B6880] transition hover:border-[#5B4FCF] hover:text-[#5B4FCF]"
            >
              <RotateCcw size={17} /> Reset
            </button>

            <button
              type="button"
              disabled={savingResult}
              onClick={submitAndGoResults}
              className="flex items-center gap-2 rounded-xl bg-[#5B4FCF] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(91,79,207,.22)] transition hover:-translate-y-0.5 hover:bg-[#4740b8] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send size={17} /> {savingResult ? "Saving..." : "Submit writing"}
            </button>
          </div>

          {submitError && (
            <div className="mt-6 rounded-2xl border border-[#E24B4A] bg-[#FFF0EE] p-5">
              <h3 className="text-lg font-extrabold text-[#E24B4A]">
                Result was not saved
              </h3>
              <p className="mt-2 text-sm font-semibold text-[#6B6880]">
                {submitError}
              </p>
            </div>
          )}
        </div>
      );
    }

    if (skill === "speaking") {
      return (
        <div className="rounded-2xl border border-[#E2DEFF] bg-white p-5">
          <div className="mb-4">
            <p className="text-[10px] font-extrabold tracking-widest text-[#6B6880]">
              SPEAKING NOTES
            </p>
            <h2 className="mt-1 text-xl font-extrabold text-[#13102B]">
              Prepare your answer
            </h2>
          </div>

          <textarea
            value={speakingNotes}
            onChange={(event) => setSpeakingNotes(event.target.value)}
            placeholder="Write quick notes before speaking..."
            className="min-h-[360px] w-full resize-none rounded-2xl border border-[#E2DEFF] bg-[#F7F6FF] p-5 text-sm leading-8 outline-none transition hover:border-[#5B4FCF] focus:border-[#5B4FCF]"
          />

          <div className="mt-5 flex flex-wrap justify-between gap-3">
            <button
              type="button"
              onClick={resetTest}
              className="flex items-center gap-2 rounded-xl border border-[#E2DEFF] bg-white px-5 py-3 text-sm font-bold text-[#6B6880] transition hover:border-[#5B4FCF] hover:text-[#5B4FCF]"
            >
              <RotateCcw size={17} /> Reset
            </button>

            <button
              type="button"
              disabled={savingResult}
              onClick={submitAndGoResults}
              className="flex items-center gap-2 rounded-xl bg-[#5B4FCF] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(91,79,207,.22)] transition hover:-translate-y-0.5 hover:bg-[#4740b8] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send size={17} /> {savingResult ? "Saving..." : "Submit speaking"}
            </button>
          </div>

          {submitError && (
            <div className="mt-6 rounded-2xl border border-[#E24B4A] bg-[#FFF0EE] p-5">
              <h3 className="text-lg font-extrabold text-[#E24B4A]">
                Result was not saved
              </h3>
              <p className="mt-2 text-sm font-semibold text-[#6B6880]">
                {submitError}
              </p>
            </div>
          )}
        </div>
      );
    }

    if (!currentQuestion) {
      return (
        <div className="rounded-2xl border border-[#E2DEFF] bg-white p-8 text-center">
          <p className="font-extrabold text-[#13102B]">No questions found</p>
          <p className="mt-2 text-sm text-[#6B6880]">
            Add questions for this test in Supabase.
          </p>
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-[#E2DEFF] bg-white p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#5B4FCF] px-3 py-1 text-[10px] font-extrabold text-white">
                Question {currentQuestion.number}
              </span>
              <span className="rounded-full bg-[#EEF0FF] px-3 py-1 text-[10px] font-extrabold text-[#5B4FCF]">
                {currentQuestion.type}
              </span>
            </div>
            <h2 className="text-xl font-extrabold leading-8 text-[#13102B]">
              {currentQuestion.question}
            </h2>
          </div>

          <button
            type="button"
            onClick={() =>
              setFlagged((prev) => ({
                ...prev,
                [currentQuestion.id]: !prev[currentQuestion.id],
              }))
            }
            className={`grid h-11 w-11 place-items-center rounded-xl border transition hover:-translate-y-0.5 ${
              flagged[currentQuestion.id]
                ? "border-[#F5A623] bg-amber-50 text-[#F5A623]"
                : "border-[#E2DEFF] text-[#6B6880] hover:border-[#5B4FCF] hover:text-[#5B4FCF]"
            }`}
          >
            <Flag size={18} />
          </button>
        </div>

        {isTextAnswerQuestion(currentQuestion)
          ? renderTextAnswer(currentQuestion)
          : renderOptionQuestion(currentQuestion)}

        <div className="mt-6 flex flex-col justify-between gap-3 md:flex-row">
          <button
            type="button"
            disabled={current === 0}
            onClick={() => setCurrent((prev) => Math.max(prev - 1, 0))}
            className="flex items-center justify-center gap-2 rounded-xl border border-[#E2DEFF] bg-white px-5 py-3 text-sm font-bold text-[#6B6880] transition hover:-translate-y-0.5 hover:border-[#5B4FCF] hover:text-[#5B4FCF] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowLeft size={17} /> Previous
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={resetTest}
              className="flex items-center justify-center gap-2 rounded-xl border border-[#E2DEFF] bg-white px-5 py-3 text-sm font-bold text-[#6B6880] transition hover:-translate-y-0.5 hover:border-[#5B4FCF] hover:text-[#5B4FCF]"
            >
              <RotateCcw size={17} /> Reset
            </button>

            {current === questions.length - 1 ? (
              <button
                type="button"
                disabled={savingResult}
                onClick={submitAndGoResults}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#5B4FCF] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(91,79,207,.22)] transition hover:-translate-y-0.5 hover:bg-[#4740b8] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send size={17} /> {savingResult ? "Saving..." : "Submit test"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  setCurrent((prev) => Math.min(prev + 1, questions.length - 1))
                }
                className="flex items-center justify-center gap-2 rounded-xl bg-[#5B4FCF] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(91,79,207,.22)] transition hover:-translate-y-0.5 hover:bg-[#4740b8]"
              >
                Next <ArrowRight size={17} />
              </button>
            )}
          </div>
        </div>

        {submitError && (
          <div className="mt-6 rounded-2xl border border-[#E24B4A] bg-[#FFF0EE] p-5">
            <h3 className="text-lg font-extrabold text-[#E24B4A]">
              Result was not saved
            </h3>
            <p className="mt-2 text-sm font-semibold text-[#6B6880]">
              {submitError}
            </p>
          </div>
        )}
      </div>
    );
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

          <div className="hidden items-center gap-2 lg:flex">
            <Link
              href="/dashboard"
              className="rounded-[10px] px-4 py-2 text-sm font-semibold text-[#6B6880] transition hover:bg-[#EEF0FF] hover:text-[#5B4FCF]"
            >
              Dashboard
            </Link>
            <Link
              href="/practice"
              className="rounded-[10px] bg-[#5B4FCF] px-4 py-2 text-sm font-semibold text-white"
            >
              Practice
            </Link>
            <Link
              href="/results"
              className="rounded-[10px] px-4 py-2 text-sm font-semibold text-[#6B6880] transition hover:bg-[#EEF0FF] hover:text-[#5B4FCF]"
            >
              Results
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-[#E2DEFF] bg-[#F7F6FF] px-4 py-2 text-sm font-bold text-[#5B4FCF] md:flex">
              <Timer size={16} /> {formatSeconds(timeLeft)}
            </div>

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
              <HelpCircle size={18} />
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

        <section className="p-5 md:p-8">
          <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
            <div>
              <button
                type="button"
                onClick={() => router.push(`/practice?tab=${skill}`)}
                className="mb-4 flex items-center gap-2 rounded-xl border border-[#E2DEFF] bg-white px-4 py-2 text-sm font-bold text-[#6B6880] transition hover:-translate-y-0.5 hover:border-[#5B4FCF] hover:text-[#5B4FCF]"
              >
                <ArrowLeft size={16} /> Back to practice
              </button>

              <p className="mb-2 text-xs font-extrabold tracking-[0.18em] text-[#5B4FCF]">
                EXAM INTERFACE
              </p>

              <div className="flex items-center gap-3">
                <div
                  className="grid h-12 w-12 place-items-center rounded-2xl bg-white"
                  style={{ color: meta.color }}
                >
                  <MetaIcon size={24} />
                </div>

                <div>
                  <h1 className="text-3xl font-extrabold text-[#13102B]">
                    {test?.title || meta.title}
                  </h1>
                  <p className="mt-1 text-sm text-[#6B6880]">
                    {formatPartLabel(test?.part)} · Test ID: {testId}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:flex">
              <div className="rounded-2xl border border-[#E2DEFF] bg-white px-5 py-3">
                <p className="text-[10px] font-extrabold tracking-wider text-[#6B6880]">
                  STATUS
                </p>
                <p className="text-xl font-extrabold text-[#13102B]">
                  {submitted ? "Submitted" : "In progress"}
                </p>
              </div>

              <div className="rounded-2xl border border-[#E2DEFF] bg-white px-5 py-3">
                <p className="text-[10px] font-extrabold tracking-wider text-[#6B6880]">
                  ANSWERED
                </p>
                <p className="text-xl font-extrabold text-[#5B4FCF]">
                  {skill === "writing"
                    ? wordCount
                    : skill === "speaking"
                    ? speakingWordCount
                    : `${answeredCount}/${questions.length}`}
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-dashed border-[#E2DEFF] bg-white p-8 text-center">
              <Clock className="mx-auto mb-3 text-[#6B6880]" />
              <p className="font-bold text-[#13102B]">Loading test...</p>
              <p className="text-sm text-[#6B6880]">
                Reading questions from Supabase.
              </p>
            </div>
          ) : loadError ? (
            <div className="rounded-2xl border border-[#E24B4A] bg-[#FFF0EE] p-8 text-center">
              <p className="font-extrabold text-[#E24B4A]">Could not load test</p>
              <p className="mt-2 text-sm font-semibold text-[#6B6880]">
                {loadError}
              </p>
            </div>
          ) : skill === "reading" ? (
            renderReadingInterface()
          ) : (
            <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr_280px]">
              {renderResourcePanel()}
              {renderMainWorkArea()}

              <aside className="rounded-2xl border border-[#E2DEFF] bg-white p-5">
                <div className="mb-5">
                  <p className="text-[10px] font-extrabold tracking-widest text-[#6B6880]">
                    QUESTION MAP
                  </p>
                  <h2 className="mt-1 text-lg font-extrabold text-[#13102B]">
                    Navigation
                  </h2>
                </div>

                {skill === "writing" || skill === "speaking" ? (
                  <div className="rounded-2xl bg-[#F7F6FF] p-5">
                    <p className="text-sm leading-7 text-[#6B6880]">
                      This skill uses a free-response interface. Submit your
                      response to save the result.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-5 gap-2 xl:grid-cols-4">
                    {questions.map((question, index) => {
                      const answered = answers[question.id];
                      const isCurrent = current === index;
                      const isFlagged = flagged[question.id];

                      return (
                        <button
                          key={question.id}
                          type="button"
                          onClick={() => setCurrent(index)}
                          className={`relative grid h-11 place-items-center rounded-xl border text-sm font-extrabold transition hover:-translate-y-0.5 ${
                            isCurrent
                              ? "border-[#5B4FCF] bg-[#5B4FCF] text-white"
                              : answered
                              ? "border-[#1D9E75] bg-emerald-50 text-[#1D9E75]"
                              : "border-[#E2DEFF] bg-white text-[#6B6880] hover:border-[#5B4FCF] hover:text-[#5B4FCF]"
                          }`}
                        >
                          {question.number}
                          {isFlagged && (
                            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#F5A623]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="mt-5 rounded-2xl border border-[#E2DEFF] bg-white p-4">
                  <div className="mb-2 flex items-center gap-2 font-extrabold text-[#13102B]">
                    <HelpCircle size={18} className="text-[#5B4FCF]" /> Exam
                    Tips
                  </div>
                  <p className="text-sm leading-6 text-[#6B6880]">
                    {skill === "listening"
                      ? "Read the questions before the audio. Predict keywords and listen for synonyms."
                      : skill === "writing"
                      ? "Plan before writing. Keep your thesis clear and use paragraphing."
                      : skill === "speaking"
                      ? "Answer directly, extend with examples, and avoid memorised responses."
                      : "Read the question first, scan for keywords, then check synonyms in the passage."}
                  </p>
                </div>
              </aside>
            </div>
          )}
        </section>
      </main>
    </ProtectedPage>
  );
}