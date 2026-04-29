import webpush from "web-push";

// Configure web-push (only if keys are available)
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:your-email@example.com", // Change to your email
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// This would be called by Vercel Cron
export async function GET() {
  try {
    // Skip if VAPID keys not configured
    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      return new Response(JSON.stringify({ success: true, message: "VAPID not configured" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const today = new Date().toISOString().split("T")[0];
    
    const payload = JSON.stringify({
      title: "🏃‍♀️ ¡Hora de entrenar!",
      body: "Tienes una sesión de running programada para hoy",
      icon: "/icon-192x192.png",
      badge: "/icon-192x192.png",
      data: {
        url: "/plan",
      },
    });

    // In production: loop through subscriptions and send
    // await webpush.sendNotification(subscription, payload);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Cron notify error:", error);
    return new Response(JSON.stringify({ error: "Failed to send notifications" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
