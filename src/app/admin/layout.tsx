"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/auth";

type Status = "checking" | "allowed";

function setSafeSessionValue(key: string, value: string) {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(key, value);
  } catch {}
}

function removeSafeSessionValue(key: string) {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.removeItem(key);
  } catch {}
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    let active = true;

    async function checkAdminAccess() {
      const { user, profile } = await getCurrentUserProfile();

      if (!active) return;

      if (!user) {
        removeSafeSessionValue("testora_access_ok");
        removeSafeSessionValue("testora_admin_ok");

        window.location.replace(
          `/login?next=${encodeURIComponent(pathname || "/admin")}`
        );
        return;
      }

      if (!profile) {
        removeSafeSessionValue("testora_admin_ok");
        window.location.replace("/dashboard");
        return;
      }

      if (profile.role !== "admin" && profile.role !== "teacher") {
        removeSafeSessionValue("testora_admin_ok");
        window.location.replace("/dashboard");
        return;
      }

      setSafeSessionValue("testora_access_ok", "true");
      setSafeSessionValue("testora_admin_ok", "true");
      setStatus("allowed");
    }

    checkAdminAccess();

    return () => {
      active = false;
    };
  }, [mounted, pathname]);

  if (!mounted) return null;
  if (status === "checking") return null;

  return <>{children}</>;
}