"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const isDateAvailable = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return !sessions.some((s) => s.date === dateStr);
  };

  return (
    <div className="mt-3 p-3 border border-foreground/10 rounded-xl bg-background space-y-3">
      <DatePicker
        selected={selectedDate}
        onChange={(date: Date | null) => setSelectedDate(date)}
        minDate={new Date()}
        filterDate={isDateAvailable}
        inline
        calendarClassName="!bg-transparent !border-0 !font-sans"
        dayClassName={() => "!text-foreground !hover:bg-primary/10"}
      />
      <div className="flex gap-2">
        <button
          onClick={() => selectedDate && onConfirm(sessionId, selectedDate)}
          disabled={!selectedDate}
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
