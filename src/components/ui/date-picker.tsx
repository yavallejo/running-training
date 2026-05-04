"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isBefore, isAfter, startOfWeek, endOfWeek, isToday, isSameMonth } from "date-fns"
import { es } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface DatePickerProps {
  date?: Date
  onSelect?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
  className?: string
}

export function DatePicker({
  date,
  onSelect,
  placeholder = "Seleccionar fecha",
  disabled = false,
  minDate,
  maxDate,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [currentMonth, setCurrentMonth] = React.useState(date || new Date())
  const [position, setPosition] = React.useState({ top: 0, left: 0 })
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  const calendarRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX
      })
    }
  }, [open])

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current && 
        !calendarRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  const getDaysInMonth = () => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }

  const isDateDisabled = (day: Date) => {
    if (minDate && isBefore(day, minDate) && !isSameDay(day, minDate)) return true
    if (maxDate && isAfter(day, maxDate) && !isSameDay(day, maxDate)) return true
    return false
  }

  const handleSelect = (day: Date) => {
    if (isDateDisabled(day)) return
    onSelect?.(day)
    setOpen(false)
  }

  const days = getDaysInMonth()
  const weekDays = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"]

  const calendarContent = open ? (
    <div 
      ref={calendarRef}
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        zIndex: 99999,
        backgroundColor: "hsl(0 0% 100%)",
        borderColor: "hsl(0 0% 89.8%)"
      }}
      className="rounded-md border p-3 shadow-lg animate-in fade-in-0 zoom-in-95 dark:bg-[#1a1a1a] dark:border-[#333]"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground h-7 w-7"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-sm font-medium capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: es })}
        </div>
        <button
          type="button"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground h-7 w-7"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Week days */}
      <div className="grid grid-cols-7 mb-1">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-normal text-muted-foreground py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const isSelected = date && isSameDay(day, date)
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isDisabled = isDateDisabled(day)
          const isTodayDate = isToday(day)

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(day)}
              disabled={isDisabled}
              className={cn(
                "inline-flex items-center justify-center rounded-md text-sm font-medium h-9 w-9 p-0 transition-colors",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary/90",
                !isSelected && isTodayDate && "bg-accent text-accent-foreground",
                !isSelected && !isTodayDate && "hover:bg-accent hover:text-accent-foreground",
                !isCurrentMonth && "text-muted-foreground opacity-50",
                isDisabled && "text-muted-foreground opacity-30 cursor-not-allowed",
                !isDisabled && !isSelected && "cursor-pointer"
              )}
            >
              {format(day, "d")}
            </button>
          )
        })}
      </div>
    </div>
  ) : null

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={cn(
          "w-full flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          !date && "text-muted-foreground",
          className
        )}
      >
        <CalendarIcon className="h-4 w-4 shrink-0 opacity-50" />
        {date ? format(date, "PPP", { locale: es }) : <span>{placeholder}</span>}
      </button>
      {typeof window !== "undefined" && createPortal(calendarContent, document.body)}
    </>
  )
}
