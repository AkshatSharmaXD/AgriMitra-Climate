"use client";

import * as React from "react";

/**
 * Which farm this device is looking at.
 *
 * Deliberately a device-local preference rather than an account: PRD §9 puts
 * "complex authentication" out of scope, and a farmer on a shared handset should
 * not be forced through a sign-up to see their own field.
 */
const KEY = "agrimitra.activeFarmId";

export function readActiveFarmId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null; // private mode, or site data blocked
  }
}

export function writeActiveFarmId(id: string): void {
  try {
    window.localStorage.setItem(KEY, id);
  } catch {
    /* non-fatal: the farm is still reachable by URL */
  }
}

export function useActiveFarmId(): { farmId: string | null; ready: boolean } {
  const [farmId, setFarmId] = React.useState<string | null>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    setFarmId(readActiveFarmId());
    setReady(true);
  }, []);

  return { farmId, ready };
}
