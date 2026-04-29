"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function NotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscribed, setSubscribed] = useState(false);

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
      // Register for push
      if ("serviceWorker" in navigator && "PushManager" in window) {
        try {
          const registration = await navigator.serviceWorker.ready;
          
          // Get VAPID public key
          const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
          const convertedKey = urlBase64ToUint8Array(vapidPublicKey);
          
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedKey,
          });
          
          // Send subscription to server
          await fetch("/api/push/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(subscription),
          });
          
          setSubscribed(true);
        } catch (e) {
          console.error("Push subscription failed", e);
        }
      }
    }
  };

  // Helper to convert VAPID key
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  if (!isSupported) return null;
  if (permission === "granted" && subscribed) return null;
  if (permission === "denied") return null;

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
