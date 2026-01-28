"use client";

import { useEffect } from "react";

export default function SWRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const onLoad = () => {
      navigator.serviceWorker
        .register("/sw.js")
        .catch(() => {
          // Ignore registration errors in production; they are non-fatal.
        });
    };

    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
