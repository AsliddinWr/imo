export type SkillKey =
  | "listening"
  | "reading"
  | "writing"
  | "speaking"
  | "fullmock";

export type AdminTestStatus = "Published" | "Draft";

export type AdminTestAccess = "Free" | "Pro";

export type TestRow = {
  id: string;
  title: string;
  skill: SkillKey;
  level: string | null;
  duration_minutes: number | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
};

export type QuestionRow = {
  test_id: string;
};

export type ResultRow = {
  test_id: string;
};

export type TestItem = {
  id: string;
  title: string;
  type: string;
  skill: SkillKey;
  exam: string;
  level: string;
  questions: number;
  duration: string;
  durationMinutes: number;
  access: AdminTestAccess;
  status: AdminTestStatus;
  attempts: number;
  created: string;
  description: string;
  isActive: boolean;
};

export type TestForm = {
  title: string;
  skill: SkillKey;
  level: string;
  duration_minutes: string;
  description: string;
  is_active: boolean;
};

export type TestStats = {
  total: number;
  published: number;
  drafts: number;
  attempts: number;
};

export type CreateTestPayload = {
  id: string;
  title: string;
  skill: SkillKey;
  level: string;
  duration_minutes: number;
  description: string;
  is_active: boolean;
};

export type UpdateTestPayload = {
  title: string;
  skill: SkillKey;
  level: string;
  duration_minutes: number;
  description: string;
  is_active: boolean;
};