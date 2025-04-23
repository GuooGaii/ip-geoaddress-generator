import { useState, useEffect } from "react";
import type { HistoryRecord, User, Address } from "@/app/types";

const generateId = () =>
  `history-${Date.now()}-${Math.random().toString(36).substring(2)}`;

interface UseHistoryReturn {
  history: HistoryRecord[];
  selectedHistory: string;
  setSelectedHistory: (id: string) => void;
  addHistoryRecord: (params: {
    user: User;
    address: Address;
    ip: string;
  }) => void;
  deleteHistoryRecord: (id: string) => void;
  deleteAllHistory: () => void;
  toggleStarred: (id: string) => void;
}

export default function useHistory(): UseHistoryReturn {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<string>("");

  // 从 localStorage 加载历史记录
  useEffect(() => {
    const savedHistory = localStorage.getItem("addressHistory");
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        // 确保所有记录都有有效的 id
        const validHistory = parsedHistory.map((record: HistoryRecord) => ({
          ...record,
          id:
            record.id && record.id.startsWith("history-")
              ? record.id
              : generateId(),
        }));
        // 对历史记录进行排序，收藏的记录置顶
        const sortedHistory = validHistory.sort(
          (a: HistoryRecord, b: HistoryRecord) => {
            if (a.isStarred === b.isStarred) {
              return b.timestamp - a.timestamp;
            }
            return (b.isStarred ? 1 : 0) - (a.isStarred ? 1 : 0);
          }
        );
        setHistory(sortedHistory);
      } catch (e) {
        console.error("Failed to parse history:", e);
        setHistory([]);
      }
    }
  }, []);

  // 保存历史记录到 localStorage
  useEffect(() => {
    localStorage.setItem("addressHistory", JSON.stringify(history));
  }, [history]);

  const addHistoryRecord = ({
    user,
    address,
    ip,
  }: {
    user: User;
    address: Address;
    ip: string;
  }) => {
    const timestamp = Date.now();
    const newRecord: HistoryRecord = {
      id: `history-${timestamp}-${Math.random().toString(36).substring(2)}`,
      user,
      address,
      ip,
      timestamp,
      isStarred: false,
    };

    setHistory((prev) => {
      const isDuplicate = prev.some((record) => record.id === newRecord.id);
      if (isDuplicate) {
        newRecord.id = `history-${timestamp}-${Math.random()
          .toString(36)
          .substring(2)}`;
      }
      // 对历史记录进行排序，收藏的记录置顶
      const newHistory = [newRecord, ...prev.slice(0, 19)];
      return newHistory.sort((a: HistoryRecord, b: HistoryRecord) => {
        if (a.isStarred === b.isStarred) {
          return b.timestamp - a.timestamp;
        }
        return (b.isStarred ? 1 : 0) - (a.isStarred ? 1 : 0);
      });
    });
    setSelectedHistory(newRecord.id);
  };

  const toggleStarred = (id: string) => {
    setHistory((prev) => {
      const newHistory = prev.map((record) =>
        record.id === id ? { ...record, isStarred: !record.isStarred } : record
      );
      // 对历史记录进行排序，收藏的记录置顶
      return newHistory.sort((a: HistoryRecord, b: HistoryRecord) => {
        if (a.isStarred === b.isStarred) {
          return b.timestamp - a.timestamp;
        }
        return (b.isStarred ? 1 : 0) - (a.isStarred ? 1 : 0);
      });
    });
  };

  const deleteHistoryRecord = (id: string) => {
    setHistory((prev) => prev.filter((record) => record.id !== id));
    if (selectedHistory === id) {
      setSelectedHistory("");
    }
  };

  const deleteAllHistory = () => {
    setHistory([]);
    setSelectedHistory("");
  };

  return {
    history,
    selectedHistory,
    setSelectedHistory,
    addHistoryRecord,
    deleteHistoryRecord,
    deleteAllHistory,
    toggleStarred,
  };
}
