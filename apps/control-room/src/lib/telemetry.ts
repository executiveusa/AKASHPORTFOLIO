/**
 * Telemetry & Analytics System
 * Tracks user behavior, council decisions, sentiment, and platform metrics
 */

interface TelemetryEvent {
  id: string;
  eventType: string;
  userId?: string;
  platform: 'whatsapp' | 'tiktok' | 'web';
  data: Record<string, any>;
  timestamp: string;
}

interface CommunityMetrics {
  totalEvents: number;
  uniqueUsers: number;
  sentimentAverage: number;
  topicDistribution: Record<string, number>;
  participationRate: number;
  decisionConsensus: number;
}

export class Telemetry {
  private events: TelemetryEvent[] = [];
  private userEvents: Map<string, TelemetryEvent[]> = new Map();
  private sentimentScores: number[] = [];

  /**
   * Track event
   */
  trackEvent(
    eventType: string,
    userId: string | undefined,
    platform: 'whatsapp' | 'tiktok' | 'web',
    data: Record<string, any>
  ): TelemetryEvent {
    const event: TelemetryEvent = {
      id: `event-${Date.now()}`,
      eventType,
      userId,
      platform,
      data,
      timestamp: new Date().toISOString(),
    };

    this.events.push(event);

    if (userId) {
      const userEventList = this.userEvents.get(userId) || [];
      userEventList.push(event);
      this.userEvents.set(userId, userEventList);
    }

    return event;
  }

  /**
   * Track council meeting
   */
  trackMeeting(meetingId: string, topic: string, participantCount: number): void {
    this.trackEvent(
      'council_meeting',
      undefined,
      'web',
      { meetingId, topic, participantCount, duration: 0 }
    );
  }

  /**
   * Track decision
   */
  trackDecision(
    agentId: string,
    decision: string,
    confidence: number,
    consensus: boolean
  ): void {
    this.trackEvent(
      'agent_decision',
      undefined,
      'web',
      { agentId, decision, confidence, consensus }
    );
  }

  /**
   * Track sentiment
   */
  trackSentiment(score: number): void {
    this.sentimentScores.push(score);
    this.trackEvent('sentiment_score', undefined, 'web', { score });
  }

  /**
   * Track user engagement
   */
  trackEngagement(userId: string, platform: 'whatsapp' | 'tiktok' | 'web'): void {
    this.trackEvent('user_engagement', userId, platform, { platform });
  }

  /**
   * Get community metrics
   */
  getMetrics(): CommunityMetrics {
    const uniqueUsers = new Set(
      Array.from(this.userEvents.keys()).concat(
        this.events.filter(e => e.userId).map(e => e.userId!)
      )
    );

    const topicDist: Record<string, number> = {};
    this.events
      .filter(e => e.eventType === 'council_meeting')
      .forEach(e => {
        const topic = e.data.topic || 'unknown';
        topicDist[topic] = (topicDist[topic] || 0) + 1;
      });

    const sentimentAverage =
      this.sentimentScores.length > 0
        ? this.sentimentScores.reduce((a, b) => a + b, 0) / this.sentimentScores.length
        : 0;

    const consensusDecisions = this.events.filter(
      e => e.eventType === 'agent_decision' && e.data.consensus
    ).length;
    const totalDecisions = this.events.filter(e => e.eventType === 'agent_decision').length;

    return {
      totalEvents: this.events.length,
      uniqueUsers: uniqueUsers.size,
      sentimentAverage,
      topicDistribution: topicDist,
      participationRate: uniqueUsers.size > 0 ? (this.events.length / uniqueUsers.size) * 10 : 0,
      decisionConsensus:
        totalDecisions > 0 ? (consensusDecisions / totalDecisions) * 100 : 0,
    };
  }

  /**
   * Get user timeline
   */
  getUserTimeline(userId: string, limit: number = 50): TelemetryEvent[] {
    return (this.userEvents.get(userId) || []).slice(-limit);
  }

  /**
   * Get events by type
   */
  getEventsByType(eventType: string, limit: number = 100): TelemetryEvent[] {
    return this.events.filter(e => e.eventType === eventType).slice(-limit);
  }

  /**
   * Get events by platform
   */
  getEventsByPlatform(platform: 'whatsapp' | 'tiktok' | 'web'): TelemetryEvent[] {
    return this.events.filter(e => e.platform === platform);
  }

  /**
   * Export telemetry for analysis
   */
  exportData(startTime?: string, endTime?: string): TelemetryEvent[] {
    let filtered = this.events;

    if (startTime) {
      const start = new Date(startTime);
      filtered = filtered.filter(e => new Date(e.timestamp) >= start);
    }

    if (endTime) {
      const end = new Date(endTime);
      filtered = filtered.filter(e => new Date(e.timestamp) <= end);
    }

    return filtered;
  }

  /**
   * Clear old events (retention: 30 days)
   */
  pruneOldEvents(retentionDays: number = 30): number {
    const cutoffTime = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    const beforeLength = this.events.length;

    this.events = this.events.filter(e => new Date(e.timestamp) > cutoffTime);

    // Also prune user events
    this.userEvents.forEach((events, userId) => {
      const filtered = events.filter(e => new Date(e.timestamp) > cutoffTime);
      if (filtered.length === 0) {
        this.userEvents.delete(userId);
      } else {
        this.userEvents.set(userId, filtered);
      }
    });

    return beforeLength - this.events.length;
  }
}

export default new Telemetry();
