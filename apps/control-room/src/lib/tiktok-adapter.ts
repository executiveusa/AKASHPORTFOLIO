/**
 * TikTok Community Bridge Adapter
 * Handles live stream comments and sentiment analysis
 */

interface TikTokComment {
  commentId: string;
  videoId: string;
  authorId: string;
  authorName: string;
  text: string;
  timestamp: string;
  likes: number;
  isLive: boolean;
}

interface SentimentScore {
  score: number; // -1 to 1
  label: 'positive' | 'negative' | 'neutral';
  confidence: number;
}

export class TikTokAdapter {
  private accessToken: string;
  private openAiKey: string;
  private cachedComments: Map<string, TikTokComment> = new Map();

  constructor() {
    this.accessToken = process.env.TIKTOK_ACCESS_TOKEN || '';
    this.openAiKey = process.env.OPENAI_API_KEY || '';
  }

  /**
   * Fetch live stream comments
   */
  async fetchLiveComments(videoId: string): Promise<TikTokComment[]> {
    try {
      // TikTok API endpoint for live comments
      const response = await fetch(
        `https://open.tiktokapis.com/v1/live/comment/search/?video_id=${videoId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.warn('TikTok API fetch failed, using cache');
        return Array.from(this.cachedComments.values());
      }

      const data = await response.json() as any;
      const comments: TikTokComment[] = (data.data || []).map((comment: any) => ({
        commentId: comment.id,
        videoId,
        authorId: comment.author_id,
        authorName: comment.author_name,
        text: comment.text,
        timestamp: new Date(comment.create_time * 1000).toISOString(),
        likes: comment.like_count || 0,
        isLive: true,
      }));

      // Cache comments
      comments.forEach(c => this.cachedComments.set(c.commentId, c));

      return comments;
    } catch (error) {
      console.error('TikTok fetch error:', error);
      return Array.from(this.cachedComments.values());
    }
  }

  /**
   * Post reply to TikTok comment
   */
  async replyToComment(videoId: string, commentId: string, text: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://open.tiktokapis.com/v1/live/comment/reply/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            video_id: videoId,
            reply_to_comment_id: commentId,
            content: text,
          }),
        }
      );

      return response.ok;
    } catch (error) {
      console.error('TikTok reply error:', error);
      return false;
    }
  }

  /**
   * Analyze comment sentiment using simple heuristics
   */
  async analyzeSentiment(text: string): Promise<SentimentScore> {
    const positiveKeywords = [
      '🔥', 'fire', 'amazing', 'increíble', 'amooo', 'love', 'best', 'perfect',
      'genius', 'brilliant', '💯', '🙌', 'excelente', 'bueno',
    ];

    const negativeKeywords = [
      'bad', 'hate', 'terrible', 'awful', 'horrible', 'waste', 'cringe',
      'malo', 'odio', 'pésimo', '😡', '❌', 'fail',
    ];

    const lowerText = text.toLowerCase();
    let score = 0;
    let matchCount = 0;

    positiveKeywords.forEach(kw => {
      if (lowerText.includes(kw)) {
        score += 1;
        matchCount++;
      }
    });

    negativeKeywords.forEach(kw => {
      if (lowerText.includes(kw)) {
        score -= 1;
        matchCount++;
      }
    });

    // Normalize score to -1 to 1
    const normalizedScore = matchCount > 0 ? score / matchCount : 0;

    return {
      score: Math.max(-1, Math.min(1, normalizedScore)),
      label:
        normalizedScore > 0.3
          ? 'positive'
          : normalizedScore < -0.3
            ? 'negative'
            : 'neutral',
      confidence: Math.min(matchCount / 5, 1), // Confidence based on keyword matches
    };
  }

  /**
   * Check if comment should trigger council meeting
   */
  shouldTriggerCouncil(text: string): boolean {
    const triggerKeywords = [
      '?',
      'what',
      'how',
      'why',
      'which',
      'qué',
      'cómo',
      'cuál',
      'por qué',
      'pregunta',
    ];

    return triggerKeywords.some(kw => text.toLowerCase().includes(kw));
  }

  /**
   * Filter comments by sentiment (remove spam/negative if needed)
   */
  async filterByQuality(comments: TikTokComment[], minSentimentScore: number = -0.5): Promise<TikTokComment[]> {
    const results: TikTokComment[] = [];
    for (const c of comments) {
      const sentiment = await this.analyzeSentiment(c.text);
      if (sentiment.score >= minSentimentScore) {
        results.push(c);
      }
    }
    return results;
  }
}

export default new TikTokAdapter();
