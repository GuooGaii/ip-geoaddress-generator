import type { HistoryRecord } from "@/app/types";

export type ExportFormat = "json";

export function exportHistory(
  history: HistoryRecord[],
  format: ExportFormat = "json"
): Blob {
  switch (format) {
    case "json":
      return new Blob([JSON.stringify(history, null, 2)], {
        type: "application/json",
      });
    default: {
      const exhaustiveCheck: never = format;
      throw new Error(`不支持的导出格式: ${exhaustiveCheck}`);
    }
  }
}

export function getExportFileName(format: ExportFormat = "json"): string {
  const date = new Date().toISOString().split("T")[0];
  return `address-history-${date}.${format}`;
}

