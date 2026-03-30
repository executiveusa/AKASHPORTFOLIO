/**
 * EL MENSAJERO™ — Notification Delivery Ghost Agent
 * Kupuri Media · Fantasmas Ghost Agents
 *
 * Routes alerts from La Vigilante™ and other spheres
 * to the configured notification channels (email, webhook, log).
 *
 * Priority levels: low → info → warn → critical
 * Channels: email (Resend), webhook (custom URL), console (always)
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AlertPriority = "low" | "info" | "warn" | "critical";
export type AlertChannel = "email" | "webhook" | "console";

export interface Alert {
  id: string;
  priority: AlertPriority;
  title: string;
  body: string;
  source: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface DeliveryResult {
  alertId: string;
  channel: AlertChannel;
  success: boolean;
  error?: string;
  sentAt: string;
}

// ---------------------------------------------------------------------------
// Priority thresholds — channels activated per priority
// ---------------------------------------------------------------------------

const CHANNEL_MAP: Record<AlertPriority, AlertChannel[]> = {
  low:      ["console"],
  info:     ["console"],
  warn:     ["console", "webhook"],
  critical: ["console", "webhook", "email"],
};

// ---------------------------------------------------------------------------
// Core
// ---------------------------------------------------------------------------

export async function deliverAlert(alert: Alert): Promise<DeliveryResult[]> {
  const channels = CHANNEL_MAP[alert.priority];
  const results: DeliveryResult[] = [];

  for (const channel of channels) {
    const result = await deliverToChannel(alert, channel);
    results.push(result);
  }

  return results;
}

async function deliverToChannel(alert: Alert, channel: AlertChannel): Promise<DeliveryResult> {
  const sentAt = new Date().toISOString();

  switch (channel) {
    case "console": {
      const prefix = alert.priority === "critical" ? "🚨" : alert.priority === "warn" ? "⚠️" : "ℹ️";
      console.log(`[EL_MENSAJERO] ${prefix} [${alert.source}] ${alert.title}: ${alert.body}`);
      return { alertId: alert.id, channel, success: true, sentAt };
    }

    case "webhook": {
      const webhookUrl = process.env.ALERT_WEBHOOK_URL;
      if (!webhookUrl) {
        return { alertId: alert.id, channel, success: false, error: "ALERT_WEBHOOK_URL not set", sentAt };
      }

      try {
        const res = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ alert }),
          signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return { alertId: alert.id, channel, success: true, sentAt };
      } catch (err) {
        return { alertId: alert.id, channel, success: false, error: String(err), sentAt };
      }
    }

    case "email": {
      const resendKey = process.env.RESEND_API_KEY;
      const alertEmail = process.env.ALERT_EMAIL ?? "kupurimedia@gmail.com";
      if (!resendKey) {
        return { alertId: alert.id, channel, success: false, error: "RESEND_API_KEY not set", sentAt };
      }

      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendKey}`,
          },
          body: JSON.stringify({
            from: "SYNTHIA™ <alerts@kupurimedia.com>",
            to: [alertEmail],
            subject: `[${alert.priority.toUpperCase()}] ${alert.title}`,
            html: `<h2>${alert.title}</h2><p>${alert.body}</p><pre>${JSON.stringify(alert.metadata, null, 2)}</pre>`,
          }),
          signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) throw new Error(`Resend HTTP ${res.status}`);
        return { alertId: alert.id, channel, success: true, sentAt };
      } catch (err) {
        return { alertId: alert.id, channel, success: false, error: String(err), sentAt };
      }
    }

    default:
      return { alertId: alert.id, channel, success: false, error: "Unknown channel", sentAt };
  }
}

// ---------------------------------------------------------------------------
// Factory helpers
// ---------------------------------------------------------------------------

export function makeAlert(
  priority: AlertPriority,
  title: string,
  body: string,
  source: string,
  metadata?: Record<string, unknown>
): Alert {
  return {
    id: crypto.randomUUID(),
    priority,
    title,
    body,
    source,
    timestamp: new Date().toISOString(),
    metadata,
  };
}
