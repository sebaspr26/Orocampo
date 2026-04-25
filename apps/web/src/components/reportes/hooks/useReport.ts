"use client";
import { useState, useCallback } from "react";

interface ReportState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useReport<T>() {
  const [state, setState] = useState<ReportState<T>>({ data: null, loading: false, error: null });

  const fetchReport = useCallback(async (tipo: string, params: Record<string, string> = {}) => {
    setState({ data: null, loading: true, error: null });
    const search = new URLSearchParams(params).toString();
    try {
      const res = await fetch(`/api/reportes/${tipo}${search ? `?${search}` : ""}`);
      const json = await res.json();
      if (!res.ok) {
        setState({ data: null, loading: false, error: json.error ?? "Error al cargar el reporte" });
        return;
      }
      setState({ data: json, loading: false, error: null });
    } catch {
      setState({ data: null, loading: false, error: "No se pudo conectar con el servidor." });
    }
  }, []);

  return { ...state, fetchReport };
}
