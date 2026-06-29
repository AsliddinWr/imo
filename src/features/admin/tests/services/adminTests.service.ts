import { supabase } from "@/lib/supabase";
import type {
  CreateTestPayload,
  QuestionRow,
  ResultRow,
  TestRow,
  UpdateTestPayload,
} from "../types/adminTests.types";

export async function fetchAdminTestRows() {
  const { data, error } = await supabase
    .from("tests")
    .select(
      "id, title, skill, level, duration_minutes, description, is_active, created_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as TestRow[];
}

export async function fetchQuestionRowsByTestIds(testIds: string[]) {
  if (testIds.length === 0) return [];

  const { data, error } = await supabase
    .from("questions")
    .select("test_id")
    .in("test_id", testIds);

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as QuestionRow[];
}

export async function fetchResultRowsByTestIds(testIds: string[]) {
  if (testIds.length === 0) return [];

  const { data, error } = await supabase
    .from("test_results")
    .select("test_id")
    .in("test_id", testIds);

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as ResultRow[];
}

export async function createAdminTest(payload: CreateTestPayload) {
  const { error } = await supabase.from("tests").insert(payload);

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateAdminTest(testId: string, payload: UpdateTestPayload) {
  const { error } = await supabase
    .from("tests")
    .update(payload)
    .eq("id", testId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function duplicateAdminTest(payload: CreateTestPayload) {
  const { error } = await supabase.from("tests").insert(payload);

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateAdminTestStatus(testId: string, isActive: boolean) {
  const { error } = await supabase
    .from("tests")
    .update({
      is_active: isActive,
    })
    .eq("id", testId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function moveAdminTestToDraft(testId: string) {
  const { error } = await supabase
    .from("tests")
    .update({
      is_active: false,
    })
    .eq("id", testId);

  if (error) {
    throw new Error(error.message);
  }
}