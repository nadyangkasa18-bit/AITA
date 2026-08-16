"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfileCalibrateRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/calibrate");
  }, [router]);
  return <div className="mx-auto mt-24 h-8 w-40 rounded-lg shimmer" />;
}
