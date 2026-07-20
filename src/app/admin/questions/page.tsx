"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import UserBadge from "@/components/UserBadge";
import { supabase } from "@/lib/supabase";
import {
  BarChart3,
  Bell,
  BookOpen,
  CheckCircle2,
  Copy,
  CreditCard,
  FileQuestion,
  FileText,
  Filter,
  GraduationCap,
  Headphones,
  Home,
  Layers,
  LockKeyhole,
  Mic,
  MoreHorizontal,
  Pencil,
  Plus,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";

type SkillKey = "listening" | "reading" | "writing" | "speaking" | "fullmock";

type TestRow = {
  id: string;
  title: string;
  skill: SkillKey;
  is_active: boolean;
};

type QuestionRow = {
  id: string;
  test_id: string;
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

type QuestionItem = {
  id: string;
  testId: string;
  test: string;
  type: string;
  skill: string;
  rawSkill: SkillKey;
  number: number;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  part: string;
  groupLabel: string;
  groupInstruction: string;
  status: string;
};

type QuestionForm = {
  test_id: string;
  number: string;
  type: string;
  part: string;
  groupLabel: string;
  groupInstruction: string;
  question: string;
  optionsText: string;
  answer: string;
  explanation: string;
};

const readingQuestionTypes = [
  "MCQ",
  "TFNG",
  "YNG",
  "Gap Fill",
  "Short Answer",
  "Matching Heading",
  "Matching Information",
  "Matching Features",
  "Sentence Completion",
  "Summary Completion",
];

const allQuestionTypes = [
  ...readingQuestionTypes,
  "Writing Prompt",
  "Speaking Cue Card",
];

const emptyForm: QuestionForm = {
  test_id: "",
  number: "1",
  type: "MCQ",
  part: "part1",
  groupLabel: "",
  groupInstruction: "",
  question: "",
  optionsText: "",
  answer: "",
  explanation: "",
};

function formatSkill(value: string) {
  if (value === "fullmock") return "Full Mock";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatPart(value: string) {
  if (value === "full") return "Full Test";
  if (value === "part1") return "Part 1";
  if (value === "part2") return "Part 2";
  if (value === "part3") return "Part 3";
  if (value === "part4") return "Part 4";
  return value;
}

function skillBadge(skill: string) {
  if (skill === "Listening") return "bg-indigo-50 text-indigo-600";
  if (skill === "Reading") return "bg-blue-50 text-blue-600";
  if (skill === "Writing") return "bg-rose-50 text-rose-600";
  if (skill === "Speaking") return "bg-emerald-50 text-emerald-600";
  return "bg-purple-50 text-purple-600";
}

function statusBadge(status: string) {
  if (status === "Ready") return "bg-emerald-50 text-emerald-600";
  return "bg-amber-50 text-amber-600";
}

function partBadge(part: string) {
  if (part === "part1") return "bg-[#FFF0EC] text-[#071A52]";
  if (part === "part2") return "bg-blue-50 text-blue-600";
  if (part === "part3") return "bg-purple-50 text-purple-600";
  if (part === "part4") return "bg-indigo-50 text-indigo-600";
  return "bg-slate-50 text-slate-600";
}

function typeIcon(type: string) {
  const clean = type.toLowerCase();

  if (clean.includes("mcq") || clean.includes("multiple")) return FileQuestion;
  if (clean.includes("tfng") || clean.includes("true")) return CheckCircle2;
  if (clean.includes("yng") || clean.includes("yes")) return CheckCircle2;
  if (clean.includes("gap") || clean.includes("fill")) return Pencil;
  if (clean.includes("summary")) return FileText;
  if (clean.includes("matching")) return Layers;
  if (clean.includes("sentence")) return FileText;
  if (clean.includes("writing")) return FileText;
  if (clean.includes("speaking") || clean.includes("cue")) return Mic;

  return FileQuestion;
}

function parseOptions(text: string) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[A-Za-z0-9]+\)\s*/, "").trim())
    .filter(Boolean);
}

function optionsToText(options: string[]) {
  return options
    .map((option, index) => `${String.fromCharCode(65 + index)}) ${option}`)
    .join("\n");
}

function questionTypeNeedsOptions(type: string) {
  const clean = type.toLowerCase();

  return (
    clean.includes("mcq") ||
    clean.includes("tfng") ||
    clean.includes("yng") ||
    clean.includes("matching")
  );
}

function buildQuestionStatus(question: QuestionRow) {
  if (!question.question?.trim()) return "Draft";
  if (!question.answer?.trim()) return "Draft";

  if (
    questionTypeNeedsOptions(question.type) &&
    (!question.options || question.options.length === 0)
  ) {
    return "Draft";
  }

  return "Ready";
}

function mapQuestion(row: QuestionRow, test?: TestRow): QuestionItem {
  return {
    id: row.id,
    testId: row.test_id,
    test: test?.title || "Unknown test",
    type: row.type || "MCQ",
    skill: formatSkill(test?.skill || "reading"),
    rawSkill: test?.skill || "reading",
    number: Number(row.number) || 1,
    question: row.question || "",
    options: row.options || [],
    answer: row.answer || "",
    explanation: row.explanation || "",
    part: row.part || "part1",
    groupLabel: row.group_label || "",
    groupInstruction: row.group_instruction || "",
    status: buildQuestionStatus(row),
  };
}

function getTemplate(type: string) {
  if (type === "TFNG") {
    return {
      optionsText: "A) True\nB) False\nC) Not Given",
      answer: "Not Given",
      groupLabel: "Questions 1-7",
      groupInstruction:
        "Do the following statements agree with the information given in the passage? Write TRUE, FALSE or NOT GIVEN.",
    };
  }

  if (type === "YNG") {
    return {
      optionsText: "A) Yes\nB) No\nC) Not Given",
      answer: "Not Given",
      groupLabel: "Questions 1-7",
      groupInstruction:
        "Do the following statements agree with the views of the writer? Write YES, NO or NOT GIVEN.",
    };
  }

  if (type === "MCQ") {
    return {
      optionsText: "A) \nB) \nC) \nD) ",
      answer: "A",
      groupLabel: "Questions 1-4",
      groupInstruction: "Choose the correct letter, A, B, C or D.",
    };
  }

  if (type === "Gap Fill") {
    return {
      optionsText: "",
      answer: "",
      groupLabel: "Questions 8-13",
      groupInstruction:
        "Complete the notes below. Choose ONE WORD ONLY from the passage for each answer.",
    };
  }

  if (type === "Short Answer") {
    return {
      optionsText: "",
      answer: "",
      groupLabel: "Questions 8-13",
      groupInstruction:
        "Answer the questions below. Choose NO MORE THAN THREE WORDS from the passage for each answer.",
    };
  }

  if (type === "Matching Heading") {
    return {
      optionsText:
        "i) \nii) \niii) \niv) \nv) \nvi) \nvii) \nviii) ",
      answer: "i",
      groupLabel: "Questions 14-20",
      groupInstruction:
        "Choose the correct heading for each paragraph from the list of headings below.",
    };
  }

  if (type === "Matching Information") {
    return {
      optionsText: "A) Paragraph A\nB) Paragraph B\nC) Paragraph C\nD) Paragraph D",
      answer: "A",
      groupLabel: "Questions 14-20",
      groupInstruction:
        "Which paragraph contains the following information? Write the correct letter, A-D.",
    };
  }

  if (type === "Matching Features") {
    return {
      optionsText: "A) Person A\nB) Person B\nC) Person C\nD) Person D",
      answer: "A",
      groupLabel: "Questions 21-26",
      groupInstruction:
        "Match each statement with the correct person, place or feature.",
    };
  }

  if (type === "Sentence Completion") {
    return {
      optionsText: "",
      answer: "",
      groupLabel: "Questions 21-26",
      groupInstruction:
        "Complete the sentences below. Choose ONE WORD ONLY from the passage for each answer.",
    };
  }

  if (type === "Summary Completion") {
    return {
      optionsText: "",
      answer: "",
      groupLabel: "Questions 21-26",
      groupInstruction:
        "Complete the summary below. Choose ONE WORD ONLY from the passage for each answer.",
    };
  }

  if (type === "Writing Prompt") {
    return {
      optionsText: "",
      answer: "Writing response",
      groupLabel: "Writing Task",
      groupInstruction: "Write your answer in the box provided.",
    };
  }

  if (type === "Speaking Cue Card") {
    return {
      optionsText: "",
      answer: "Speaking response",
      groupLabel: "Speaking Part 2",
      groupInstruction: "Prepare your answer and speak for 1-2 minutes.",
    };
  }

  return {
    optionsText: "",
    answer: "",
    groupLabel: "",
    groupInstruction: "",
  };
}

export default function AdminQuestionsPage() {
  const [pageMounted, setPageMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  const [tests, setTests] = useState<TestRow[]>([]);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");

  const [form, setForm] = useState<QuestionForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPageMounted(true);
  }, []);

  async function loadData() {
    setLoading(true);
    setErrorMessage("");

    const { data: testRows, error: testsError } = await supabase
      .from("tests")
      .select("id, title, skill, is_active")
      .order("created_at", { ascending: false });

    if (testsError) {
      setErrorMessage(testsError.message);
      setLoading(false);
      return;
    }

    const safeTests = (testRows || []) as TestRow[];
    const testMap = new Map(safeTests.map((test) => [test.id, test]));

    const { data: questionRows, error: questionsError } = await supabase
      .from("questions")
      .select(
        "id, test_id, number, type, question, options, answer, explanation, part, group_label, group_instruction"
      )
      .order("number", { ascending: true });

    if (questionsError) {
      setErrorMessage(questionsError.message);
      setLoading(false);
      return;
    }

    const safeQuestions = ((questionRows || []) as QuestionRow[]).map((row) =>
      mapQuestion(row, testMap.get(row.test_id))
    );

    setTests(safeTests);
    setQuestions(safeQuestions);

    if (!form.test_id && safeTests.length > 0) {
      setForm((prev) => ({
        ...prev,
        test_id: safeTests[0].id,
      }));
    }

    setLoading(false);
  }

  useEffect(() => {
    if (!pageMounted) return;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageMounted]);

  const selectedTest = useMemo(() => {
    return tests.find((test) => test.id === form.test_id);
  }, [tests, form.test_id]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((item) => {
      const search = query.toLowerCase();

      const matchesQuery =
        item.test.toLowerCase().includes(search) ||
        item.question.toLowerCase().includes(search) ||
        item.type.toLowerCase().includes(search) ||
        item.answer.toLowerCase().includes(search) ||
        item.groupLabel.toLowerCase().includes(search) ||
        item.groupInstruction.toLowerCase().includes(search);

      const matchesFilter =
        filter === "All" ||
        item.skill === filter ||
        item.type === filter ||
        item.status === filter ||
        formatPart(item.part) === filter;

      return matchesQuery && matchesFilter;
    });
  }, [questions, query, filter]);

  const readingCount = questions.filter((item) => item.skill === "Reading").length;
  const listeningCount = questions.filter((item) => item.skill === "Listening").length;
  const draftCount = questions.filter((item) => item.status === "Draft").length;
  const groupedCount = questions.filter((item) => item.groupLabel.trim()).length;

  function showNotice(message: string) {
    setNotice(message);

    window.setTimeout(() => {
      setNotice("");
    }, 2800);
  }

  function resetForm() {
    setEditingId(null);
    setForm({
      ...emptyForm,
      test_id: tests[0]?.id || "",
    });
  }

  function startNewQuestion() {
    resetForm();
    showNotice("New question form tayyor.");
  }

  function editQuestion(item: QuestionItem) {
    setEditingId(item.id);
    setForm({
      test_id: item.testId,
      number: String(item.number),
      type: item.type,
      part: item.part || "part1",
      groupLabel: item.groupLabel,
      groupInstruction: item.groupInstruction,
      question: item.question,
      optionsText: optionsToText(item.options),
      answer: item.answer,
      explanation: item.explanation,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSaveQuestion() {
    if (!form.test_id) {
      showNotice("Avval test tanla.");
      return;
    }

    if (!form.question.trim()) {
      showNotice("Question text yozilishi kerak.");
      return;
    }

    if (!form.answer.trim()) {
      showNotice("Correct answer yozilishi kerak.");
      return;
    }

    const number = Number(form.number) || 1;
    const options = parseOptions(form.optionsText);

    try {
      setSaving(true);

      const payload = {
        test_id: form.test_id,
        number,
        type: form.type,
        part: form.part,
        group_label: form.groupLabel.trim(),
        group_instruction: form.groupInstruction.trim(),
        question: form.question.trim(),
        options,
        answer: form.answer.trim(),
        explanation: form.explanation.trim(),
      };

      if (editingId) {
        const { error } = await supabase
          .from("questions")
          .update(payload)
          .eq("id", editingId);

        if (error) {
          showNotice(error.message);
          return;
        }

        showNotice("Question updated successfully.");
      } else {
        const { error } = await supabase.from("questions").insert(payload);

        if (error) {
          showNotice(error.message);
          return;
        }

        showNotice("Question saved successfully.");
      }

      resetForm();
      await loadData();
    } catch {
      showNotice("Something went wrong while saving question.");
    } finally {
      setSaving(false);
    }
  }

  async function duplicateQuestion(item: QuestionItem) {
    const { error } = await supabase.from("questions").insert({
      test_id: item.testId,
      number: item.number + 1,
      type: item.type,
      part: item.part,
      group_label: item.groupLabel,
      group_instruction: item.groupInstruction,
      question: `${item.question} Copy`,
      options: item.options,
      answer: item.answer,
      explanation: item.explanation,
    });

    if (error) {
      showNotice(error.message);
      return;
    }

    showNotice("Question duplicated.");
    await loadData();
  }

  async function deleteQuestion(item: QuestionItem) {
    const ok = window.confirm(`Q${item.number} savolini o‘chirishni xohlaysanmi?`);

    if (!ok) return;

    const { error } = await supabase.from("questions").delete().eq("id", item.id);

    if (error) {
      showNotice(error.message);
      return;
    }

    showNotice("Question deleted.");
    await loadData();
  }

  function applyQuestionTemplate(type: string) {
    const template = getTemplate(type);

    setForm((prev) => ({
      ...prev,
      type,
      optionsText: template.optionsText,
      answer: template.answer,
      groupLabel: template.groupLabel,
      groupInstruction: template.groupInstruction,
    }));
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
              showNotice("Upgrade Plan bo‘limi keyingi update’da ulanadi.")
            }
            className="hidden items-center gap-2 rounded-full bg-[#071A52] px-5 py-2 text-sm font-bold text-white shadow-[0_8px_24px_rgba(7,26,82,.22)] transition hover:-translate-y-0.5 hover:bg-[#0D2A6B] md:flex"
          >
            <Sparkles size={16} /> Upgrade Plan
          </button>

          <button
            type="button"
            onClick={() => showNotice("Hozircha yangi admin notification yo‘q.")}
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
            {
              label: "Questions",
              icon: FileQuestion,
              href: "/admin/questions",
              active: true,
            },
            { label: "Results", icon: BarChart3, href: "/admin/results" },
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
              showNotice("Roles & Access keyingi update’da alohida ulanadi.")
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
                QUESTION BANK
              </p>

              <h1 className="text-3xl font-extrabold text-[#13102B]">
                Manage questions
              </h1>

              <p className="mt-2 text-sm text-[#6B6880]">
                Create IELTS Reading parts, question groups, instructions, MCQ,
                TFNG, YNG, matching and completion tasks.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  if (filteredQuestions[0]) {
                    duplicateQuestion(filteredQuestions[0]);
                  } else {
                    showNotice("Duplicate qilish uchun question topilmadi.");
                  }
                }}
                className="flex items-center gap-2 rounded-xl border border-[#DDE4F3] bg-white px-4 py-3 text-sm font-bold text-[#6B6880] transition hover:-translate-y-0.5 hover:border-[#071A52] hover:text-[#071A52]"
              >
                <Copy size={17} /> Duplicate
              </button>

              <button
                type="button"
                onClick={startNewQuestion}
                className="flex items-center gap-2 rounded-xl bg-[#071A52] px-4 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(7,26,82,.22)] transition hover:-translate-y-0.5 hover:bg-[#0D2A6B]"
              >
                <Plus size={17} /> New Question
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-5 rounded-2xl border border-[#E24B4A] bg-[#FFF0EE] p-5">
              <p className="font-extrabold text-[#E24B4A]">
                Could not load questions
              </p>

              <p className="mt-1 text-sm font-semibold text-[#6B6880]">
                {errorMessage}
              </p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Total questions",
                value: loading ? "..." : String(questions.length),
                sub: "All question types",
                icon: FileQuestion,
                bg: "#FFF0EC",
                color: "#071A52",
              },
              {
                label: "Reading bank",
                value: loading ? "..." : String(readingCount),
                sub: "Passage based",
                icon: BookOpen,
                bg: "#EBF5FF",
                color: "#378ADD",
              },
              {
                label: "Grouped items",
                value: loading ? "..." : String(groupedCount),
                sub: "IELTS group labels",
                icon: Layers,
                bg: "#F2EDFF",
                color: "#7B61FF",
              },
              {
                label: "Draft questions",
                value: loading ? "..." : String(draftCount),
                sub: "Need review",
                icon: Pencil,
                bg: "#FAEEDA",
                color: "#F5A623",
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

          <div className="mt-5 grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
            <div className="rounded-2xl border border-[#DDE4F3] bg-white p-5">
              <p className="text-[10px] font-extrabold tracking-widest text-[#6B6880]">
                QUESTION CREATOR
              </p>

              <h2 className="mt-1 text-lg font-extrabold text-[#13102B]">
                {editingId ? "Edit question" : "Add question"}
              </h2>

              <p className="mt-1 text-sm text-[#6B6880]">
                This form saves directly to Supabase questions table.
              </p>

              <div className="mt-5 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-xs font-bold text-[#6B6880]">
                    Select test
                  </span>

                  <select
                    value={form.test_id}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        test_id: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-[#DDE4F3] bg-[#F8FAFE] px-4 py-3 text-sm font-semibold outline-none transition hover:border-[#071A52] focus:border-[#071A52]"
                  >
                    {tests.length === 0 ? (
                      <option value="">No tests found</option>
                    ) : (
                      tests.map((test) => (
                        <option key={test.id} value={test.id}>
                          {test.title}
                        </option>
                      ))
                    )}
                  </select>
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-xs font-bold text-[#6B6880]">
                      Skill
                    </span>

                    <input
                      readOnly
                      value={formatSkill(selectedTest?.skill || "reading")}
                      className="w-full rounded-xl border border-[#DDE4F3] bg-[#F8FAFE] px-4 py-3 text-sm font-semibold text-[#6B6880] outline-none"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-bold text-[#6B6880]">
                      Reading part / section
                    </span>

                    <select
                      value={form.part}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          part: event.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-[#DDE4F3] bg-[#F8FAFE] px-4 py-3 text-sm font-semibold outline-none transition hover:border-[#071A52] focus:border-[#071A52]"
                    >
                      <option value="part1">Part 1</option>
                      <option value="part2">Part 2</option>
                      <option value="part3">Part 3</option>
                      <option value="part4">Part 4</option>
                      <option value="full">Full Test</option>
                    </select>
                  </label>
                </div>

                <label className="block">
                  <span className="mb-2 block text-xs font-bold text-[#6B6880]">
                    Question type
                  </span>

                  <select
                    value={form.type}
                    onChange={(event) => applyQuestionTemplate(event.target.value)}
                    className="w-full rounded-xl border border-[#DDE4F3] bg-[#F8FAFE] px-4 py-3 text-sm font-semibold outline-none transition hover:border-[#071A52] focus:border-[#071A52]"
                  >
                    {allQuestionTypes.map((type) => (
                      <option key={type}>{type}</option>
                    ))}
                  </select>
                </label>

                <div className="rounded-2xl border border-[#DDE4F3] bg-[#F8FAFE] p-4">
                  <p className="text-xs font-extrabold text-[#13102B]">
                    IELTS group settings
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#6B6880]">
                    These fields control the group header in the Reading split
                    screen: for example “Questions 1-7” and instruction text.
                  </p>

                  <div className="mt-4 grid gap-4">
                    <label className="block">
                      <span className="mb-2 block text-xs font-bold text-[#6B6880]">
                        Group label
                      </span>

                      <input
                        value={form.groupLabel}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            groupLabel: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-[#DDE4F3] bg-white px-4 py-3 text-sm font-semibold outline-none transition hover:border-[#071A52] focus:border-[#071A52]"
                        placeholder="Example: Questions 1-7"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-xs font-bold text-[#6B6880]">
                        Group instruction
                      </span>

                      <textarea
                        value={form.groupInstruction}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            groupInstruction: event.target.value,
                          }))
                        }
                        className="min-h-[80px] w-full resize-none rounded-xl border border-[#DDE4F3] bg-white px-4 py-3 text-sm font-semibold outline-none transition hover:border-[#071A52] focus:border-[#071A52]"
                        placeholder="Example: Choose ONE WORD ONLY from the passage for each answer."
                      />
                    </label>
                  </div>
                </div>

                <label className="block">
                  <span className="mb-2 block text-xs font-bold text-[#6B6880]">
                    Question number
                  </span>

                  <input
                    type="number"
                    value={form.number}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, number: event.target.value }))
                    }
                    className="w-full rounded-xl border border-[#DDE4F3] bg-[#F8FAFE] px-4 py-3 text-sm font-semibold outline-none transition hover:border-[#071A52] focus:border-[#071A52]"
                    placeholder="1"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-bold text-[#6B6880]">
                    Question text
                  </span>

                  <textarea
                    value={form.question}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, question: event.target.value }))
                    }
                    className="min-h-[110px] w-full resize-none rounded-xl border border-[#DDE4F3] bg-[#F8FAFE] px-4 py-3 text-sm font-semibold outline-none transition hover:border-[#071A52] focus:border-[#071A52]"
                    placeholder="Write question text here..."
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-bold text-[#6B6880]">
                    Options
                  </span>

                  <textarea
                    value={form.optionsText}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        optionsText: event.target.value,
                      }))
                    }
                    className="min-h-[90px] w-full resize-none rounded-xl border border-[#DDE4F3] bg-[#F8FAFE] px-4 py-3 text-sm font-semibold outline-none transition hover:border-[#071A52] focus:border-[#071A52]"
                    placeholder="A) Option one&#10;B) Option two&#10;C) Option three&#10;D) Option four"
                  />

                  <p className="mt-2 text-xs text-[#6B6880]">
                    MCQ, TFNG, YNG and matching types use options. Gap, short
                    answer and completion types can stay empty.
                  </p>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-bold text-[#6B6880]">
                    Correct answer
                  </span>

                  <input
                    value={form.answer}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, answer: event.target.value }))
                    }
                    className="w-full rounded-xl border border-[#DDE4F3] bg-[#F8FAFE] px-4 py-3 text-sm font-semibold outline-none transition hover:border-[#071A52] focus:border-[#071A52]"
                    placeholder="Example: B / True / Yes / rainforests / i"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-bold text-[#6B6880]">
                    Explanation / proof
                  </span>

                  <textarea
                    value={form.explanation}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        explanation: event.target.value,
                      }))
                    }
                    className="min-h-[90px] w-full resize-none rounded-xl border border-[#DDE4F3] bg-[#F8FAFE] px-4 py-3 text-sm font-semibold outline-none transition hover:border-[#071A52] focus:border-[#071A52]"
                    placeholder="Write explanation, proof, or synonym trap here..."
                  />
                </label>

                <div className="flex flex-col gap-3 md:flex-row">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#DDE4F3] bg-white px-4 py-3 text-sm font-bold text-[#6B6880] transition hover:border-[#071A52] hover:text-[#071A52]"
                  >
                    <X size={17} /> Clear
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleSaveQuestion}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#071A52] px-4 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(7,26,82,.22)] transition hover:-translate-y-0.5 hover:bg-[#0D2A6B] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save size={17} />{" "}
                    {saving
                      ? "Saving..."
                      : editingId
                      ? "Update question"
                      : "Save question"}
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#DDE4F3] bg-white p-5">
              <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-[10px] font-extrabold tracking-widest text-[#6B6880]">
                    QUESTION LIST
                  </p>

                  <h2 className="mt-1 text-lg font-extrabold text-[#13102B]">
                    Existing questions
                  </h2>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="flex items-center gap-2 rounded-xl border border-[#DDE4F3] bg-[#F8FAFE] px-3 py-2">
                    <Search size={16} className="text-[#6B6880]" />

                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      className="w-52 bg-transparent text-sm outline-none placeholder:text-[#6B6880]"
                      placeholder="Search question"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setFilter("All");
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
                  "Part 1",
                  "Part 2",
                  "Part 3",
                  "Part 4",
                  "MCQ",
                  "TFNG",
                  "YNG",
                  "Gap Fill",
                  "Short Answer",
                  "Matching Heading",
                  "Matching Information",
                  "Matching Features",
                  "Sentence Completion",
                  "Summary Completion",
                  "Ready",
                  "Draft",
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
                  <FileQuestion className="mx-auto mb-3 text-[#6B6880]" />

                  <p className="font-bold text-[#13102B]">Loading questions...</p>
                  <p className="text-sm text-[#6B6880]">
                    Reading questions from Supabase.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredQuestions.map((item) => {
                    const Icon = typeIcon(item.type);

                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-[#DDE4F3] bg-white p-4 transition hover:-translate-y-1 hover:border-[#071A52] hover:bg-[#F8FAFE]"
                      >
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
                          <div className="flex flex-1 gap-4">
                            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#FFF0EC] text-[#071A52]">
                              <Icon size={21} />
                            </div>

                            <div className="flex-1">
                              <div className="mb-2 flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-[#FFF0EC] px-3 py-1 text-[10px] font-extrabold text-[#071A52]">
                                  Q{item.number}
                                </span>

                                <span
                                  className={`rounded-full px-3 py-1 text-[10px] font-extrabold ${skillBadge(
                                    item.skill
                                  )}`}
                                >
                                  {item.skill}
                                </span>

                                <span
                                  className={`rounded-full px-3 py-1 text-[10px] font-extrabold ${partBadge(
                                    item.part
                                  )}`}
                                >
                                  {formatPart(item.part)}
                                </span>

                                <span className="rounded-full bg-purple-50 px-3 py-1 text-[10px] font-extrabold text-purple-600">
                                  {item.type}
                                </span>

                                <span
                                  className={`rounded-full px-3 py-1 text-[10px] font-extrabold ${statusBadge(
                                    item.status
                                  )}`}
                                >
                                  {item.status}
                                </span>
                              </div>

                              <p className="text-xs font-bold text-[#6B6880]">
                                {item.test}
                              </p>

                              {item.groupLabel && (
                                <p className="mt-1 text-xs font-extrabold text-[#071A52]">
                                  {item.groupLabel}
                                </p>
                              )}

                              <h3 className="mt-1 font-extrabold text-[#13102B]">
                                {item.question}
                              </h3>

                              {item.groupInstruction && (
                                <p className="mt-2 text-xs leading-5 text-[#6B6880]">
                                  <span className="font-bold text-[#13102B]">
                                    Instruction:
                                  </span>{" "}
                                  {item.groupInstruction}
                                </p>
                              )}

                              <p className="mt-2 text-sm text-[#6B6880]">
                                <span className="font-bold text-[#13102B]">
                                  Answer:
                                </span>{" "}
                                {item.answer}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2 xl:justify-end">
                            <button
                              type="button"
                              onClick={() => editQuestion(item)}
                              className="grid h-9 w-9 place-items-center rounded-xl border border-[#DDE4F3] text-[#6B6880] transition hover:border-[#071A52] hover:text-[#071A52]"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() => duplicateQuestion(item)}
                              className="grid h-9 w-9 place-items-center rounded-xl border border-[#DDE4F3] text-[#6B6880] transition hover:border-[#071A52] hover:text-[#071A52]"
                            >
                              <Copy size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() => deleteQuestion(item)}
                              className="grid h-9 w-9 place-items-center rounded-xl border border-[#DDE4F3] text-[#E24B4A] transition hover:border-[#E24B4A] hover:bg-rose-50"
                            >
                              <Trash2 size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                showNotice(
                                  `Q${item.number}: ${item.type}, ${formatPart(
                                    item.part
                                  )}, answer: ${item.answer}`
                                )
                              }
                              className="grid h-9 w-9 place-items-center rounded-xl border border-[#DDE4F3] text-[#6B6880] transition hover:border-[#071A52] hover:text-[#071A52]"
                            >
                              <MoreHorizontal size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {!loading && filteredQuestions.length === 0 && (
                <div className="mt-5 rounded-2xl border border-dashed border-[#DDE4F3] p-8 text-center">
                  <FileQuestion className="mx-auto mb-3 text-[#6B6880]" />

                  <p className="font-bold text-[#13102B]">No questions found</p>
                  <p className="text-sm text-[#6B6880]">
                    Save a new question or try another search keyword.
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
