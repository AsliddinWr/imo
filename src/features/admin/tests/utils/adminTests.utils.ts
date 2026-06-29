import type {
  AdminTestAccess,
  AdminTestStatus,
  QuestionRow,
  ResultRow,
  TestItem,
  TestRow,
} from "../types/adminTests.types";

export function formatSkill(value: string) {
  if (value === "fullmock") return "Full Mock";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Unknown date";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatDuration(minutes: number | null) {
  const safeMinutes = Number(minutes) || 0;

  if (!safeMinutes) return "No limit";

  if (safeMinutes >= 60) {
    const hours = Math.floor(safeMinutes / 60);
    const mins = safeMinutes % 60;

    return mins ? `${hours}h ${mins}m` : `${hours}h`;
  }

  return `${safeMinutes} min`;
}

export function getTestStatus(isActive: boolean): AdminTestStatus {
  return isActive ? "Published" : "Draft";
}

export function getTestAccess(): AdminTestAccess {
  return "Free";
}

export function mapTestRow(
  test: TestRow,
  questionCounts: Record<string, number>,
  attemptCounts: Record<string, number>
): TestItem {
  return {
    id: test.id,
    title: test.title,
    type: formatSkill(test.skill),
    skill: test.skill,
    exam: "IELTS",
    level: test.level || "B2",
    questions: questionCounts[test.id] || 0,
    duration: formatDuration(test.duration_minutes),
    durationMinutes: Number(test.duration_minutes) || 0,
    access: getTestAccess(),
    status: getTestStatus(test.is_active),
    attempts: attemptCounts[test.id] || 0,
    created: formatDate(test.created_at),
    description: test.description || "",
    isActive: test.is_active,
  };
}

export function buildQuestionCounts(questionRows: QuestionRow[]) {
  return questionRows.reduce<Record<string, number>>((acc, item) => {
    acc[item.test_id] = (acc[item.test_id] || 0) + 1;
    return acc;
  }, {});
}

export function buildAttemptCounts(resultRows: ResultRow[]) {
  return resultRows.reduce<Record<string, number>>((acc, item) => {
    acc[item.test_id] = (acc[item.test_id] || 0) + 1;
    return acc;
  }, {});
}

export function getAdminTestStats(tests: TestItem[]) {
  return {
    total: tests.length,
    published: tests.filter((item) => item.status === "Published").length,
    drafts: tests.filter((item) => item.status === "Draft").length,
    attempts: tests.reduce((sum, item) => sum + item.attempts, 0),
  };
}

export function filterAdminTests(
  tests: TestItem[],
  query: string,
  filter: string
) {
  const normalizedQuery = query.toLowerCase().trim();

  return tests.filter((test) => {
    const matchesQuery =
      !normalizedQuery ||
      test.title.toLowerCase().includes(normalizedQuery) ||
      test.type.toLowerCase().includes(normalizedQuery) ||
      test.level.toLowerCase().includes(normalizedQuery);

    const matchesFilter =
      filter === "All" ||
      test.type === filter ||
      test.status === filter ||
      test.access === filter ||
      test.exam === filter;

    return matchesQuery && matchesFilter;
  });
}

export function escapeCsv(value: string | number) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

export function buildTestsCsv(tests: TestItem[]) {
  const headers = [
    "Title",
    "Type",
    "Level",
    "Questions",
    "Duration",
    "Status",
    "Attempts",
    "Created",
  ];

  const rows = tests.map((test) => [
    test.title,
    test.type,
    test.level,
    test.questions,
    test.duration,
    test.status,
    test.attempts,
    test.created,
  ]);

  return [headers, ...rows]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\n");
}

export function downloadTestsCsv(tests: TestItem[]) {
  const csv = buildTestsCsv(tests);

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `testora-tests-${new Date().toISOString().slice(0, 10)}.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export function typeStyle(type: string) {
  if (type === "Listening") {
    return {
      badge: "bg-indigo-50 text-indigo-600",
      iconName: "Headphones",
    };
  }

  if (type === "Reading") {
    return {
      badge: "bg-blue-50 text-blue-600",
      iconName: "BookOpen",
    };
  }

  if (type === "Writing") {
    return {
      badge: "bg-rose-50 text-rose-600",
      iconName: "Pencil",
    };
  }

  if (type === "Speaking") {
    return {
      badge: "bg-emerald-50 text-emerald-600",
      iconName: "Mic",
    };
  }

  if (type === "Full Mock") {
    return {
      badge: "bg-purple-50 text-purple-600",
      iconName: "Layers",
    };
  }

  return {
    badge: "bg-amber-50 text-amber-600",
    iconName: "FileQuestion",
  };
}

export function statusClass(status: string) {
  if (status === "Published") return "bg-emerald-50 text-emerald-600";
  if (status === "Draft") return "bg-amber-50 text-amber-600";
  return "bg-slate-50 text-slate-600";
}

export function accessClass(access: string) {
  if (access === "Free") return "bg-emerald-50 text-emerald-600";
  return "bg-purple-50 text-purple-600";
}