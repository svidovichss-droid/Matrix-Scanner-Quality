import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type QualityGrade = "A" | "B" | "C" | "D" | "F";

export interface QualityMetric {
  key?: string;
  name: string;
  nameRu: string;
  value: number;
  grade: QualityGrade;
  description: string;
}

export interface ScanResult {
  id: string;
  timestamp: number;
  overallGrade: QualityGrade;
  overallScore: number;
  data: string;
  size: string;
  moduleSize: number;
  matrixSize: string;
  metrics: QualityMetric[];
  imageUri?: string;
}

interface ScanHistoryContextType {
  history: ScanResult[];
  addScan: (scan: ScanResult) => void;
  clearHistory: () => void;
  deleteScan: (id: string) => void;
}

const ScanHistoryContext = createContext<ScanHistoryContextType | null>(null);

const STORAGE_KEY = "@datamatrix_scan_history";

export function ScanHistoryProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<ScanResult[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) {
        try {
          setHistory(JSON.parse(data));
        } catch {}
      }
    });
  }, []);

  const persist = useCallback((items: ScanResult[]) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, []);

  const addScan = useCallback((scan: ScanResult) => {
    setHistory((prev) => {
      const updated = [scan, ...prev].slice(0, 100);
      persist(updated);
      return updated;
    });
  }, [persist]);

  const deleteScan = useCallback((id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      persist(updated);
      return updated;
    });
  }, [persist]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <ScanHistoryContext.Provider value={{ history, addScan, clearHistory, deleteScan }}>
      {children}
    </ScanHistoryContext.Provider>
  );
}

export function useScanHistory() {
  const ctx = useContext(ScanHistoryContext);
  if (!ctx) throw new Error("useScanHistory must be used inside ScanHistoryProvider");
  return ctx;
}
