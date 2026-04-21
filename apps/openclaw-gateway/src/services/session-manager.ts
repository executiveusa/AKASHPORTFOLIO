import sqlite3 from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { Session, ConversationContext, Message, ChannelType } from '../types/index.js';
import { logger } from '../utils/logger.js';

export class SessionManager {
  private db: sqlite3.Database;

  constructor(dbPath: string = './sessions.db') {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        logger.error('Database connection error:', err);
      } else {
        logger.info('Connected to SQLite database');
      }
    });
    this.initializeSchema();
  }

  private initializeSchema() {
    this.db.serialize(() => {
      this.db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          channel TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL,
          context TEXT NOT NULL,
          metadata TEXT,
          UNIQUE(user_id, channel)
        )
      `);

      this.db.run(`
        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          session_id TEXT NOT NULL,
          role TEXT NOT NULL,
          content TEXT NOT NULL,
          intent TEXT,
          timestamp INTEGER NOT NULL,
          FOREIGN KEY(session_id) REFERENCES sessions(id)
        )
      `);

      this.db.run(`
        CREATE INDEX IF NOT EXISTS idx_session_user_channel
        ON sessions(user_id, channel)
      `);

      this.db.run(`
        CREATE INDEX IF NOT EXISTS idx_message_session
        ON messages(session_id)
      `);
    });
  }

  async createOrGetSession(
    userId: string,
    channel: ChannelType,
    metadata?: Record<string, any>
  ): Promise<Session> {
    return new Promise((resolve, reject) => {
      const now = Date.now();
      const sessionId = uuidv4();

      this.db.get(
        'SELECT * FROM sessions WHERE user_id = ? AND channel = ?',
        [userId, channel],
        (err, row: any) => {
          if (err) {
            reject(err);
            return;
          }

          if (row) {
            resolve(this.rowToSession(row));
          } else {
            const context: ConversationContext = {
              history: [],
            };

            this.db.run(
              `INSERT INTO sessions (id, user_id, channel, created_at, updated_at, context, metadata)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [sessionId, userId, channel, now, now, JSON.stringify(context), JSON.stringify(metadata || {})],
              (err) => {
                if (err) {
                  reject(err);
                } else {
                  resolve({
                    id: sessionId,
                    user_id: userId,
                    channel,
                    created_at: now,
                    updated_at: now,
                    context,
                    metadata: metadata || {},
                  });
                }
              }
            );
          }
        }
      );
    });
  }

  async getSession(sessionId: string): Promise<Session | null> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM sessions WHERE id = ?', [sessionId], (err, row: any) => {
        if (err) reject(err);
        else resolve(row ? this.rowToSession(row) : null);
      });
    });
  }

  async updateSession(sessionId: string, context: ConversationContext): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE sessions SET context = ?, updated_at = ? WHERE id = ?',
        [JSON.stringify(context), Date.now(), sessionId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async addMessage(
    sessionId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    intent?: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const messageId = uuidv4();
      const timestamp = Date.now();

      this.db.run(
        `INSERT INTO messages (id, session_id, role, content, intent, timestamp)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [messageId, sessionId, role, content, intent || null, timestamp],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async getConversationHistory(sessionId: string, limit: number = 20): Promise<ConversationContext> {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT role, content, intent, timestamp FROM messages
         WHERE session_id = ?
         ORDER BY timestamp DESC
         LIMIT ?`,
        [sessionId, limit],
        (err, rows: any[]) => {
          if (err) {
            reject(err);
          } else {
            const history = rows.reverse().map((row) => ({
              role: row.role as 'user' | 'assistant' | 'system',
              content: row.content,
              intent: row.intent,
              timestamp: row.timestamp,
            }));

            resolve({
              history,
            });
          }
        }
      );
    });
  }

  private rowToSession(row: any): Session {
    return {
      id: row.id,
      user_id: row.user_id,
      channel: row.channel,
      created_at: row.created_at,
      updated_at: row.updated_at,
      context: JSON.parse(row.context),
      metadata: row.metadata ? JSON.parse(row.metadata) : {},
    };
  }

  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}
