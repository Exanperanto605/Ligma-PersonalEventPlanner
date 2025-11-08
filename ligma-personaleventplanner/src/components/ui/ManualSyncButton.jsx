"use client";
import { useState } from "react";

export default function ManualSyncButton() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [last, setLast] = useState(null);
  const [error, setError] = useState(null);

  async function manualSync() {
    setIsSyncing(true);
    setError(null);
    try {
      // TODO: ตรงนี้เดี๋ยวค่อยเชื่อม sync จริง
      await new Promise((r) => setTimeout(r, 1500));
      setLast(new Date());
    } catch (e) {
      setError(e?.message ?? "Sync failed");
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <button onClick={manualSync} disabled={isSyncing} style={{ padding: "8px 12px" }}>
        {isSyncing ? "Syncing…" : "Sync now"}
      </button>
      <span style={{ opacity: 0.7, fontSize: 12 }}>
        {last ? `Last synced: ${last.toLocaleString()}` : "Not synced yet"}
      </span>
      {error && <span style={{ color: "red", fontSize: 12 }}>{error}</span>}
    </div>
  );
}
