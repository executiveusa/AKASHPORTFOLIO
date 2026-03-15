/**
 * Agent Mail System — KUPURI MEDIA™
 *
 * Agent-to-agent messaging backbone for Synthia 3.0.
 * Provides inbox/outbox, threading, CC support, and persistent storage.
 * Agents communicate using structured mail objects with accountability tracking.
 */

import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';

export type MailPriority = 'urgent' | 'high' | 'normal' | 'low';
export type MailStatus = 'unread' | 'read' | 'replied' | 'archived' | 'flagged';
export type MailType = 'task' | 'report' | 'alert' | 'council_vote' | 'coaching' | 'broadcast' | 'reply';

export interface AgentMail {
  id: string;
  threadId: string;
  from: string;           // Agent name (e.g. "synthia-prime")
  to: string[];           // Primary recipients
  cc?: string[];          // CC — Synthia always sees critical mails
  subject: string;
  body: string;
  type: MailType;
  priority: MailPriority;
  status: MailStatus;
  timestamp: string;      // ISO 8601
  metadata?: {
    taskId?: string;
    goalId?: string;
    eta?: string;
    requiresReply?: boolean;
    replyDeadline?: string;
    actionItems?: string[];
    meetingId?: string;
  };
  replyTo?: string;       // ID of parent mail if this is a reply
  attachments?: {
    name: string;
    content: string;
    type: 'text' | 'json' | 'markdown';
  }[];
}

export interface AgentInbox {
  agentId: string;
  unreadCount: number;
  mails: AgentMail[];
}

const MAIL_STORE_PATH = path.join(process.cwd(), '.mail-store');

class AgentMailSystem extends EventEmitter {
  private mailStore: Map<string, AgentMail[]> = new Map(); // keyed by agentId
  private allMails: Map<string, AgentMail> = new Map();    // keyed by mailId

  constructor() {
    super();
    this.ensureStorePath();
    this.loadFromDisk();
  }

  private ensureStorePath() {
    if (!fs.existsSync(MAIL_STORE_PATH)) {
      fs.mkdirSync(MAIL_STORE_PATH, { recursive: true });
    }
  }

  private loadFromDisk() {
    const indexPath = path.join(MAIL_STORE_PATH, 'index.json');
    if (fs.existsSync(indexPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
        for (const mail of data.mails || []) {
          this.allMails.set(mail.id, mail);
          for (const recipient of [...mail.to, ...(mail.cc || [])]) {
            const inbox = this.mailStore.get(recipient) || [];
            inbox.push(mail);
            this.mailStore.set(recipient, inbox);
          }
          // Sender also gets a copy in their sent
          const sentKey = `${mail.from}:sent`;
          const sent = this.mailStore.get(sentKey) || [];
          sent.push(mail);
          this.mailStore.set(sentKey, sent);
        }
      } catch {
        // Start fresh if file is corrupted
      }
    }
  }

  private persistToDisk() {
    const indexPath = path.join(MAIL_STORE_PATH, 'index.json');
    const mails = Array.from(this.allMails.values());
    fs.writeFileSync(indexPath, JSON.stringify({ mails, updated: new Date().toISOString() }, null, 2));
  }

  /**
   * Send a mail from one agent to one or more agents.
   */
  send(mail: Omit<AgentMail, 'id' | 'threadId' | 'status' | 'timestamp'>): AgentMail {
    const id = `mail-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const threadId = mail.replyTo
      ? (this.allMails.get(mail.replyTo)?.threadId || id)
      : id;

    const fullMail: AgentMail = {
      ...mail,
      id,
      threadId,
      status: 'unread',
      timestamp: new Date().toISOString(),
    };

    this.allMails.set(id, fullMail);

    // Deliver to each recipient's inbox
    const allRecipients = [...fullMail.to, ...(fullMail.cc || [])];
    for (const recipient of allRecipients) {
      const inbox = this.mailStore.get(recipient) || [];
      inbox.push(fullMail);
      this.mailStore.set(recipient, inbox);
    }

    // File in sender's sent box
    const sentKey = `${fullMail.from}:sent`;
    const sent = this.mailStore.get(sentKey) || [];
    sent.push(fullMail);
    this.mailStore.set(sentKey, sent);

    this.persistToDisk();
    this.emit('mail:new', fullMail);

    // Emit to specific recipient channels
    for (const recipient of allRecipients) {
      this.emit(`mail:${recipient}`, fullMail);
    }

    return fullMail;
  }

  /**
   * Get inbox for an agent (unread first, then by timestamp desc).
   */
  getInbox(agentId: string, options?: { unreadOnly?: boolean; limit?: number; type?: MailType }): AgentMail[] {
    const mails = this.mailStore.get(agentId) || [];
    let filtered = mails.filter(m => m.to.includes(agentId) || (m.cc || []).includes(agentId));

    if (options?.unreadOnly) {
      filtered = filtered.filter(m => m.status === 'unread');
    }
    if (options?.type) {
      filtered = filtered.filter(m => m.type === options.type);
    }

    filtered.sort((a, b) => {
      if (a.status === 'unread' && b.status !== 'unread') return -1;
      if (b.status === 'unread' && a.status !== 'unread') return 1;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return options?.limit ? filtered.slice(0, options.limit) : filtered;
  }

  /**
   * Get sent mails for an agent.
   */
  getSent(agentId: string, limit = 50): AgentMail[] {
    const sentKey = `${agentId}:sent`;
    const mails = this.mailStore.get(sentKey) || [];
    return mails
      .slice(-limit)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Get a full thread by threadId.
   */
  getThread(threadId: string): AgentMail[] {
    return Array.from(this.allMails.values())
      .filter(m => m.threadId === threadId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  /**
   * Mark a mail as read.
   */
  markRead(mailId: string, agentId: string): void {
    const mail = this.allMails.get(mailId);
    if (mail && mail.status === 'unread') {
      mail.status = 'read';
      this.allMails.set(mailId, mail);
      this.persistToDisk();
    }
  }

  /**
   * Get unread count for an agent.
   */
  getUnreadCount(agentId: string): number {
    const inbox = this.getInbox(agentId, { unreadOnly: true });
    return inbox.length;
  }

  /**
   * Get all unread urgent/high priority mails across all agents (for Synthia monitoring).
   */
  getUrgentMails(): AgentMail[] {
    return Array.from(this.allMails.values())
      .filter(m => (m.priority === 'urgent' || m.priority === 'high') && m.status === 'unread')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Broadcast a mail to all agents.
   */
  broadcast(from: string, subject: string, body: string, type: MailType = 'broadcast'): AgentMail {
    const allAgents = ['synthia-prime', 'ralphy', 'indigo', 'lapina', 'clandestino', 'merlina', 'morpho', 'ivette-voice'];
    const recipients = allAgents.filter(a => a !== from);
    return this.send({ from, to: recipients, subject, body, type, priority: 'normal' });
  }

  /**
   * Get mail summary for a standup report.
   */
  getStandupSummary(): {
    totalUnread: number;
    urgentUnread: number;
    pendingReplies: number;
    byAgent: Record<string, number>;
  } {
    const allAgents = ['synthia-prime', 'ralphy', 'indigo', 'lapina', 'clandestino', 'merlina', 'morpho', 'ivette-voice'];
    const byAgent: Record<string, number> = {};
    let totalUnread = 0;

    for (const agent of allAgents) {
      const count = this.getUnreadCount(agent);
      byAgent[agent] = count;
      totalUnread += count;
    }

    const urgentUnread = this.getUrgentMails().length;
    const pendingReplies = Array.from(this.allMails.values())
      .filter(m => m.metadata?.requiresReply && m.status !== 'replied').length;

    return { totalUnread, urgentUnread, pendingReplies, byAgent };
  }
}

export const agentMail = new AgentMailSystem();

/**
 * Helper: Send a task assignment mail.
 */
export function assignTask(
  from: string,
  to: string,
  taskTitle: string,
  taskDescription: string,
  eta: string,
  priority: MailPriority = 'normal'
): AgentMail {
  return agentMail.send({
    from,
    to: [to],
    cc: ['synthia-prime'],
    subject: `[TAREA] ${taskTitle}`,
    body: `**Tarea Asignada**\n\n${taskDescription}\n\n**ETA**: ${eta}\n**Prioridad**: ${priority.toUpperCase()}\n\nConfirma recepción y responde con tu plan de ejecución.`,
    type: 'task',
    priority,
    metadata: {
      requiresReply: true,
      replyDeadline: eta,
      eta,
    },
  });
}

/**
 * Helper: Send a report mail.
 */
export function sendReport(
  from: string,
  to: string,
  reportTitle: string,
  reportContent: string
): AgentMail {
  return agentMail.send({
    from,
    to: [to],
    cc: ['synthia-prime'],
    subject: `[REPORTE] ${reportTitle}`,
    body: reportContent,
    type: 'report',
    priority: 'normal',
  });
}

/**
 * Helper: Send an alert mail (urgent, always CC Synthia).
 */
export function sendAlert(
  from: string,
  subject: string,
  alertBody: string,
  recipients: string[] = ['synthia-prime']
): AgentMail {
  return agentMail.send({
    from,
    to: recipients,
    cc: ['synthia-prime'],
    subject: `🚨 [ALERTA] ${subject}`,
    body: alertBody,
    type: 'alert',
    priority: 'urgent',
    metadata: { requiresReply: true },
  });
}
