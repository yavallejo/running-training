"use client";

import { useState } from "react";
import { TrainingSession } from "@/lib/training-plan";

interface DatePickerModalProps {
  sessionId: string;
  sessions: TrainingSession[];
  onConfirm: (id: string, newDate: Date) => void;
  onCancel: () => void;
}

export default function DatePickerModal({
  sessionId,
  sessions,
  onConfirm,
  onCancel,
}: DatePickerModalProps) {
  const [selectedDate, setSelectedDate] = useState<string>("");

  const isDateAvailable = (dateStr: string) => {
    return !sessions.some((s) => s.date === dateStr);
  };

  const handleConfirm = () => {
    if (selectedDate) {
      onConfirm(sessionId, new Date(selectedDate));
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="mt-3 p-3 border border-foreground/10 rounded-xl bg-background space-y-3">
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        min={today}
        className="w-full rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-sm font-mono focus:border-primary/50 focus:bg-background transition-all"
      />
      <div className="flex gap-2">
        <button
          onClick={handleConfirm}
          disabled={!selectedDate || !isDateAvailable(selectedDate)}
          className="flex-1 text-xs bg-secondary/10 text-secondary px-3 py-1.5 rounded-lg hover:bg-secondary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Confirmar
        </button>
        <button
          onClick={onCancel}
          className="text-xs text-foreground/50 hover:text-foreground transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
