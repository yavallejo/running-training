"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { EVENT_DATE, EVENT_NAME } from "@/lib/training-plan";

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const eventDate = new Date(EVENT_DATE);
      const now = new Date();
      const difference = eventDate.getTime() - now.getTime();

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

       return {
         days: Math.floor(difference / (1000 * 60 * 60 * 24)),
         hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
         minutes: Math.floor((difference / (1000 * 60)) % 60),
         seconds: Math.floor((difference / 1000) % 60),
       };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!timeLeft) return null;

  const isEventDay = timeLeft.days === 0 && timeLeft.hours === 0 && 
                     timeLeft.minutes === 0 && timeLeft.seconds === 0;

  if (isEventDay) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl bg-gradient-to-r from-primary via-primary/80 to-secondary p-4 text-center shadow-lg"
      >
        <p className="text-sm font-bold text-primary-foreground animate-pulse">
          🎉 ¡ES HOY! {EVENT_NAME} 🎉
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-primary/20 bg-primary/[0.05] p-3 sm:p-4"
    >
      <p className="text-center text-[10px] sm:text-xs text-foreground/50 mb-2">
        ⏱️ Cuenta regresiva para {EVENT_NAME}
      </p>
      <div className="flex justify-center gap-2 sm:gap-3">
        {[
          { label: "Días", value: timeLeft.days },
          { label: "Horas", value: timeLeft.hours },
          { label: "Min", value: timeLeft.minutes },
          { label: "Seg", value: timeLeft.seconds },
        ].map((item, index) => (
            <motion.div
             key={item.label}
             initial={{ scale: 0 }}
             animate={{ scale: 1 }}
             transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
             className="text-center"
           >
             <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-background border border-primary/20 flex items-center justify-center shadow-sm" aria-label={`${item.value} ${item.label}`}>
               <span className="text-base sm:text-lg font-bold text-primary">
                 {String(item.value).padStart(2, '0')}
               </span>
             </div>
             <span className="text-[9px] sm:text-[10px] text-foreground/40 mt-0.5 block">
               {item.label}
             </span>
           </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
