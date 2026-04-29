"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function NotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) return;
    
    const result = await Notification.requestPermission();
    setPermission(result);
    
    if (result === "granted") {
      // Register for push (simplified - in production you'd use VAPID)
      if ("serviceWorker" in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          console.log("Ready for push notifications", registration);
        } catch (e) {
          console.error("SW not ready", e);
        }
      }
    }
  };

  if (!isSupported) return null;
  if (permission === "granted") return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <button
        onClick={requestPermission}
        className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-lg hover:bg-primary/90 transition-all"
      >
        🔔 Activar recordatorios
      </button>
    </motion.div>
  );
}
