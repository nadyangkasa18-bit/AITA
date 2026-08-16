"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PreferencesRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/profile");
  }, [router]);
  return <div className="mx-auto mt-24 h-8 w-40 rounded-lg shimmer" />;
}
