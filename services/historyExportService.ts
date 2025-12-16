import type { HistoryRecord } from "@/app/types";

export function exportHistory(
  history: HistoryRecord[]
): Blob {
  return new Blob([JSON.stringify(history, null, 2)], {
    type: "application/json",
  });
}

export function getExportFileName(): string {
  const date = new Date().toISOString().split("T")[0];
  return `address-history-${date}.json`;
}
