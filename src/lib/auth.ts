import { supabase } from "@/lib/supabase";

export type CurrentUserProfileResult = {
  user: any | null;
  profile: any | null;
  error?: string;
};

export type EnsureProfileInput = {
  full_name?: string;
  role?: "student" | "teacher" | "admin";
  exam_type?: string;
  target_score?: string;
  current_level?: string;
  exam_date?: string;
};

let cachedUser: any | null = null;
let cachedProfile: any | null = null;
let cacheTime = 0;

const CACHE_TTL = 60 * 1000;
const PROFILE_CACHE_KEY = "testora_profile_cache";
const ACCESS_OK_KEY = "testora_access_ok";
const ADMIN_OK_KEY = "testora_admin_ok";

function canUseStorage() {
  return typeof window !== "undefined";
}

function setSafeStorage(storage: Storage | undefined, key: string, value: string) {
  if (!storage) return;

  try {
    storage.setItem(key, value);
  } catch {
    // Browser storage blocked bo'lsa ham app ishlashda davom etadi.
  }
}

function removeSafeStorage(storage: Storage | undefined, key: string) {
  if (!storage) return;

  try {
    storage.removeItem(key);
  } catch {
    // Browser storage blocked bo'lsa ham app ishlashda davom etadi.
  }
}

export function clearAuthCache() {
  cachedUser = null;
  cachedProfile = null;
  cacheTime = 0;

  if (!canUseStorage()) return;

  removeSafeStorage(window.sessionStorage, ACCESS_OK_KEY);
  removeSafeStorage(window.sessionStorage, ADMIN_OK_KEY);
  removeSafeStorage(window.localStorage, PROFILE_CACHE_KEY);
}

export function getCachedProfile() {
  if (cachedProfile) return cachedProfile;

  if (!canUseStorage()) return null;

  try {
    const raw = window.localStorage.getItem(PROFILE_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function cacheAuth(user: any | null, profile: any | null) {
  cachedUser = user;
  cachedProfile = profile;
  cacheTime = Date.now();

  if (!canUseStorage()) return;

  if (user && profile) {
    setSafeStorage(window.sessionStorage, ACCESS_OK_KEY, "true");

    if (profile.role === "admin" || profile.role === "teacher") {
      setSafeStorage(window.sessionStorage, ADMIN_OK_KEY, "true");
    } else {
      removeSafeStorage(window.sessionStorage, ADMIN_OK_KEY);
    }

    setSafeStorage(window.localStorage, PROFILE_CACHE_KEY, JSON.stringify(profile));
    return;
  }

  clearAuthCache();
}

export async function ensureUserProfile(
  user: any,
  input: EnsureProfileInput = {}
): Promise<any | null> {
  if (!user?.id) return null;

  const metadata = user.user_metadata || {};

  const profilePayload = {
    id: user.id,
    email: user.email || "",
    full_name:
      input.full_name || metadata.full_name || metadata.name || "",
    role: input.role || "student",
    exam_type: input.exam_type || metadata.exam_type || "IELTS",
    target_score: input.target_score || metadata.target_score || "8.0",
    current_level: input.current_level || metadata.current_level || "B2",
    exam_date: input.exam_date || "2026-06-14",
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("profiles")
    .upsert(profilePayload, { onConflict: "id" })
    .select("*")
    .single();

  if (error) {
    console.error("Profile upsert error:", error.message);
    return null;
  }

  cacheAuth(user, data);
  return data;
}

export async function getCurrentUserProfile(options?: {
  force?: boolean;
  createIfMissing?: boolean;
}): Promise<CurrentUserProfileResult> {
  const force = options?.force === true;
  const createIfMissing = options?.createIfMissing === true;

  if (!force && cachedUser && cachedProfile && Date.now() - cacheTime < CACHE_TTL) {
    return {
      user: cachedUser,
      profile: cachedProfile,
    };
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    clearAuthCache();
    return {
      user: null,
      profile: null,
      error: sessionError.message,
    };
  }

  const user = session?.user || null;

  if (!user) {
    clearAuthCache();
    return {
      user: null,
      profile: null,
      error: "No active session",
    };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Profile read error:", error.message);

    return {
      user,
      profile: null,
      error: error.message,
    };
  }

  if (!profile && createIfMissing) {
    const createdProfile = await ensureUserProfile(user);

    return {
      user,
      profile: createdProfile,
      error: createdProfile ? undefined : "Profile row not found",
    };
  }

  if (!profile) {
    return {
      user,
      profile: null,
      error: "Profile row not found",
    };
  }

  cacheAuth(user, profile);

  return {
    user,
    profile,
  };
}
