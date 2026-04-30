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
        className="mt-3 rounded-xl bg-gradient-to-r from-primary via-primary/80 to-secondary p-3 text-center"
      >
        <p className="text-sm font-bold text-primary-foreground animate-pulse">
          ¡ES HOY! {EVENT_NAME}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-2"
    >
      <div className="flex justify-center gap-1.5">
        {[
          { label: "D", value: timeLeft.days },
          { label: "H", value: timeLeft.hours },
          { label: "M", value: timeLeft.minutes },
          { label: "S", value: timeLeft.seconds },
        ].map((item, index) => (
            <motion.div
             key={item.label}
             initial={{ scale: 0 }}
             animate={{ scale: 1 }}
             transition={{ delay: index * 0.05, type: "spring", stiffness: 200 }}
             className="text-center"
           >
             <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center" aria-label={`${item.value} ${item.label}`}>
               <span className="text-sm font-bold text-primary" style={{ fontFamily: "var(--font-syne)" }}>
                 {String(item.value).padStart(2, '0')}
               </span>
             </div>
             <span className="text-[8px] text-muted-foreground mt-0.5 block">
               {item.label}
             </span>
           </motion.div>
        ))}
      </div>
    </motion.div>
  );
}