"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createHtmlTestDescription,
  parseHtmlTestDescription,
} from "@/lib/htmlTest";
import type { SkillKey, TestForm, TestItem } from "../types/adminTests.types";
import {
  buildAttemptCounts,
  buildQuestionCounts,
  downloadTestsCsv,
  filterAdminTests,
  getAdminTestStats,
  mapTestRow,
} from "../utils/adminTests.utils";
import {
  createAdminTest,
  duplicateAdminTest,
  fetchAdminTestRows,
  fetchQuestionRowsByTestIds,
  fetchResultRowsByTestIds,
  moveAdminTestToDraft,
  updateAdminTest,
  updateAdminTestStatus,
} from "../services/adminTests.service";

const emptyForm: TestForm = {
  title: "",
  skill: "reading",
  level: "B2",
  duration_minutes: "20",
  description: "",
  is_active: true,
  test_mode: "builder",
  html_file_name: "",
  html_file_content: "",
};

function defaultDurationBySkill(skill?: SkillKey) {
  if (skill === "listening") return "30";
  if (skill === "writing") return "40";
  if (skill === "speaking") return "15";
  if (skill === "fullmock") return "165";
  return "20";
}

function descriptionFromForm(form: TestForm) {
  const note = form.description.trim();

  if (form.test_mode === "html") {
    const html = form.html_file_content.trim();
    if (!html) {
      throw new Error("HTML test faylini yuklang.");
    }

    return createHtmlTestDescription({
      fileName: form.html_file_name || "uploaded-test.html",
      html,
      note,
    });
  }

  return note;
}

export function useAdminTests() {
  const [pageMounted, setPageMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [tests, setTests] = useState<TestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TestForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPageMounted(true);
  }, []);

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => {
      setNotice("");
    }, 2800);
  }

  async function loadTests() {
    try {
      setLoading(true);
      setErrorMessage("");

      const testRows = await fetchAdminTestRows();
      const testIds = testRows.map((item) => item.id);
      const [questionRows, resultRows] = await Promise.all([
        fetchQuestionRowsByTestIds(testIds),
        fetchResultRowsByTestIds(testIds),
      ]);

      const questionCounts = buildQuestionCounts(questionRows);
      const attemptCounts = buildAttemptCounts(resultRows);

      setTests(
        testRows.map((item) => mapTestRow(item, questionCounts, attemptCounts))
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not load tests."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!pageMounted) return;
    loadTests();
  }, [pageMounted]);

  const filteredTests = useMemo(() => {
    return filterAdminTests(tests, query, filter);
  }, [tests, query, filter]);

  const stats = useMemo(() => {
    return getAdminTestStats(tests);
  }, [tests]);

  function openCreateForm(skill?: SkillKey) {
    setEditingId(null);
    setForm({
      ...emptyForm,
      skill: skill || "reading",
      duration_minutes: defaultDurationBySkill(skill),
    });
    setShowForm(true);
  }

  function openEditForm(test: TestItem) {
    const htmlTest = parseHtmlTestDescription(test.rawDescription);

    setEditingId(test.id);
    setForm({
      title: test.title,
      skill: test.skill,
      level: test.level,
      duration_minutes: String(test.durationMinutes || ""),
      description: htmlTest?.note || test.description,
      is_active: test.isActive,
      test_mode: htmlTest ? "html" : "builder",
      html_file_name: htmlTest?.fileName || "",
      html_file_content: htmlTest?.html || "",
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSaveTest() {
    const title = form.title.trim();
    if (!title) {
      showNotice("Test title yozilishi kerak.");
      return;
    }

    const duration = Number(form.duration_minutes) || 0;

    try {
      setSaving(true);
      const description = descriptionFromForm(form);

      if (editingId) {
        await updateAdminTest(editingId, {
          title,
          skill: form.skill,
          level: form.level,
          duration_minutes: duration,
          description,
          is_active: form.is_active,
        });
        showNotice("Test updated successfully.");
      } else {
        await createAdminTest({
          id: crypto.randomUUID(),
          title,
          skill: form.skill,
          level: form.level,
          duration_minutes: duration,
          description,
          is_active: form.is_active,
        });
        showNotice(
          form.test_mode === "html"
            ? "HTML test uploaded and created successfully."
            : "New test created successfully."
        );
      }

      closeForm();
      await loadTests();
    } catch (error) {
      showNotice(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving test."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDuplicateTest(test: TestItem) {
    try {
      await duplicateAdminTest({
        id: crypto.randomUUID(),
        title: `${test.title} Copy`,
        skill: test.skill,
        level: test.level,
        duration_minutes: test.durationMinutes,
        description: test.rawDescription || test.description,
        is_active: false,
      });
      showNotice("Test duplicated as draft.");
      await loadTests();
    } catch (error) {
      showNotice(
        error instanceof Error ? error.message : "Could not duplicate test."
      );
    }
  }

  async function handleToggleActive(test: TestItem) {
    try {
      await updateAdminTestStatus(test.id, !test.isActive);
      showNotice(test.isActive ? "Test moved to draft." : "Test published.");
      await loadTests();
    } catch (error) {
      showNotice(
        error instanceof Error ? error.message : "Could not update test status."
      );
    }
  }

  async function handleMoveToDraft(test: TestItem) {
    const confirmDelete = window.confirm(
      `"${test.title}" testini draft/inactive qilishni xohlaysanmi?`
    );
    if (!confirmDelete) return;

    try {
      await moveAdminTestToDraft(test.id);
      showNotice("Test inactive qilindi. Savollar o‘chmadi.");
      await loadTests();
    } catch (error) {
      showNotice(
        error instanceof Error ? error.message : "Could not move test to draft."
      );
    }
  }

  function handleExport() {
    if (filteredTests.length === 0) {
      showNotice("Export qilish uchun test topilmadi.");
      return;
    }

    downloadTestsCsv(filteredTests);
    showNotice("Tests CSV formatda yuklab olindi.");
  }

  function resetFilters() {
    setQuery("");
    setFilter("All");
    showNotice("Filters reset qilindi.");
  }

  return {
    pageMounted,
    query,
    setQuery,
    filter,
    setFilter,
    tests,
    filteredTests,
    stats,
    loading,
    errorMessage,
    notice,
    setNotice,
    showNotice,
    showForm,
    setShowForm,
    editingId,
    form,
    setForm,
    saving,
    openCreateForm,
    openEditForm,
    closeForm,
    handleSaveTest,
    handleDuplicateTest,
    handleToggleActive,
    handleMoveToDraft,
    handleExport,
    resetFilters,
    loadTests,
  };
}
