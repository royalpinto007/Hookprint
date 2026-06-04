"use client";

import { useEffect } from "react";

export function HistorySync() {
  useEffect(() => {
    const handler = () => window.dispatchEvent(new Event("hookprint-storage-sync"));
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return null;
}
