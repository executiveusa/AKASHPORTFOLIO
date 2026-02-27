/**
 * Synthia 3.0 Observability Layer
 * Provides real-time telemetry and redaction for agent sessions.
 */

import { EventEmitter } from 'events';

export interface TelemetryEvent {
    id: string;
    sessionId: string;
    type: 'tool_call' | 'reasoning' | 'state_change' | 'error' | 'success' | 'info';
    summary: string;
    data: any;
    timestamp: string;
}

class ObservabilityManager extends EventEmitter {
    private events: TelemetryEvent[] = [];
    private redactionPatterns: RegExp[] = [
        /sk-[a-zA-Z0-9]{45,}/g, // API Keys
        /ghp_[a-zA-Z0-9]{36,}/g, // GitHub Tokens
        /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, // Emails
    ];

    /**
     * Records an event, redacts sensitive info, and broadcasts to listeners.
     */
    logEvent(event: Omit<TelemetryEvent, 'id' | 'timestamp'>) {
        const id = `evt-${Math.random().toString(36).substr(2, 9)}`;
        const timestamp = new Date().toISOString();

        const safeData = this.redact(event.data);
        const safeSummary = this.redact(event.summary);

        const fullEvent: TelemetryEvent = {
            ...event,
            id,
            timestamp,
            data: safeData,
            summary: safeSummary
        };

        this.events.push(fullEvent);
        this.emit('new_event', fullEvent);

        // Keep logs manageable (last 1000 events)
        if (this.events.length > 1000) {
            this.events.shift();
        }

        return fullEvent;
    }

    private redact(data: any): any {
        if (typeof data === 'string') {
            let redacted = data;
            this.redactionPatterns.forEach(pattern => {
                redacted = redacted.replace(pattern, '[REDACTED]');
            });
            return redacted;
        }
        if (Array.isArray(data)) {
            return data.map(item => this.redact(item));
        }
        if (typeof data === 'object' && data !== null) {
            const redactedObj: any = {};
            for (const key in data) {
                redactedObj[key] = this.redact(data[key]);
            }
            return redactedObj;
        }
        return data;
    }

    getRecentEvents(limit: number = 50) {
        return this.events.slice(-limit);
    }
}

export const synthiaObservability = new ObservabilityManager();
