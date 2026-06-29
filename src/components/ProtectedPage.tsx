"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { clearAuthCache, getCurrentUserProfile } from "@/lib/auth";

type ProtectedPageProps = {
  children: ReactNode;
  allowAdmin?: boolean;
};

const PUBLIC_ROUTES = ["/", "/login", "/register"];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some((route) => {
    if (route === "/") return pathname === "/";
    return pathname === route || pathname.startsWith(`${route}/`);
  });
}

function readSessionFlag(key: string) {
  if (typeof window === "undefined") return false;

  try {
    return window.sessionStorage.getItem(key) === "true";
  } catch {
    return false;
  }
}

function writeSessionFlag(key: string, value: string) {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Storage blocked bo'lsa ham guard ishlashda davom etadi.
  }
}

function removeSessionFlag(key: string) {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // Storage blocked bo'lsa ham guard ishlashda davom etadi.
  }
}

export default function ProtectedPage({
  children,
  allowAdmin = true,
}: ProtectedPageProps) {
  const pathname = usePathname();
  const redirectingRef = useRef(false);

  const [checking, setChecking] = useState(() => {
    if (typeof window === "undefined") return true;
    if (isPublicRoute(window.location.pathname)) return false;
    return !readSessionFlag("testora_access_ok");
  });

  useEffect(() => {
    if (isPublicRoute(pathname)) {
      setChecking(false);
      return;
    }

    let active = true;

    async function checkAccess() {
      const { user, profile } = await getCurrentUserProfile({
        force: true,
        createIfMissing: true,
      });

      if (!active || redirectingRef.current) return;

      if (!user || !profile) {
        redirectingRef.current = true;
        clearAuthCache();
        removeSessionFlag("testora_access_ok");
        removeSessionFlag("testora_admin_ok");

        window.location.replace(
          `/login?next=${encodeURIComponent(pathname || "/dashboard")}`
        );
        return;
      }

      if (!allowAdmin && profile.role === "admin") {
        redirectingRef.current = true;
        window.location.replace("/admin");
        return;
      }

      writeSessionFlag("testora_access_ok", "true");

      if (profile.role === "admin" || profile.role === "teacher") {
        writeSessionFlag("testora_admin_ok", "true");
      } else {
        removeSessionFlag("testora_admin_ok");
      }

      setChecking(false);
    }

    checkAccess();

    return () => {
      active = false;
    };
  }, [pathname, allowAdmin]);

  if (checking) {
    return (
      <main className="min-h-screen bg-[#F4F3FF] text-[#13102B]">
        <div className="flex min-h-screen items-center justify-center p-6">
          <div className="rounded-3xl border border-[#E2DEFF] bg-white px-8 py-7 text-center shadow-[0_20px_60px_rgba(91,79,207,.10)]">
            <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-2xl bg-[#5B4FCF]" />
            <p className="text-sm font-extrabold text-[#13102B]">Opening Testora...</p>
            <p className="mt-1 text-xs font-semibold text-[#6B6880]">
              Checking your secure session.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
