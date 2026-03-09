/**
 * CDMX Beta Onboarding System
 * WhatsApp signup flow + TikTok auto-discovery
 */

interface BetaUser {
  id: string;
  platform: 'whatsapp' | 'tiktok';
  identifier: string; // phone or username
  joinedAt: string;
  inviteCode?: string;
  status: 'pending' | 'active' | 'inactive';
  preferences: UserPreferences;
}

interface UserPreferences {
  language: 'en' | 'es';
  notificationsEnabled: boolean;
  communityRole: 'observer' | 'participant' | 'advisor';
}

export class BetaOnboarding {
  private users: Map<string, BetaUser> = new Map();
  private inviteCodes: Map<string, string> = new Map(); // code -> userId
  private stats = {
    totalSignups: 0,
    activeUsers: 0,
    languagePrefs: { en: 0, es: 0 },
    platformDistribution: { whatsapp: 0, tiktok: 0 },
  };

  /**
   * Create new beta user from WhatsApp
   */
  async signupWhatsApp(phoneNumber: string): Promise<BetaUser> {
    const user: BetaUser = {
      id: `user-${Date.now()}`,
      platform: 'whatsapp',
      identifier: phoneNumber,
      joinedAt: new Date().toISOString(),
      status: 'active',
      preferences: {
        language: 'es',
        notificationsEnabled: true,
        communityRole: 'observer',
      },
    };

    this.users.set(user.id, user);
    this.stats.totalSignups++;
    this.stats.activeUsers++;
    this.stats.platformDistribution.whatsapp++;

    // Send welcome message via WhatsApp
    await this.sendWelcomeMessage(user);

    return user;
  }

  /**
   * Register from TikTok live stream
   */
  async discoverFromTikTok(username: string, videoId: string): Promise<BetaUser> {
    const existingUser = Array.from(this.users.values()).find(
      u => u.platform === 'tiktok' && u.identifier === username
    );

    if (existingUser) {
      existingUser.status = 'active';
      return existingUser;
    }

    const user: BetaUser = {
      id: `user-${Date.now()}`,
      platform: 'tiktok',
      identifier: username,
      joinedAt: new Date().toISOString(),
      status: 'active',
      preferences: {
        language: 'es',
        notificationsEnabled: true,
        communityRole: 'observer',
      },
    };

    this.users.set(user.id, user);
    this.stats.totalSignups++;
    this.stats.activeUsers++;
    this.stats.platformDistribution.tiktok++;

    return user;
  }

  /**
   * Validate and redeem invite code
   */
  redeemInviteCode(code: string): BetaUser | null {
    const userId = this.inviteCodes.get(code);
    if (!userId) return null;

    const user = this.users.get(userId);
    if (user) {
      user.inviteCode = code;
      user.status = 'active';
    }

    return user || null;
  }

  /**
   * Generate invite code for referral
   */
  generateInviteCode(userId: string): string {
    const code = `SYNTHIA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    this.inviteCodes.set(code, userId);
    return code;
  }

  /**
   * Send welcome message to new user
   */
  private async sendWelcomeMessage(user: BetaUser): Promise<void> {
    const welcomeText =
      user.preferences.language === 'es'
        ? `¡Bienvenido a Synthia 3.0! 🤖\n\nEres parte de la comunidad beta de CDMX. Aquí, los agentes IA toman decisiones observables sobre temas de la ciudad.\n\nEscribe "consejo" para participar en una reunión del consejo.`
        : `Welcome to Synthia 3.0! 🤖\n\nYou're part of the CDMX beta community. Here, AI agents make observable decisions about city topics.\n\nType "council" to join a council meeting.`;

    console.log(`[Onboarding] Sending welcome to ${user.identifier}: ${welcomeText}`);
  }

  /**
   * Get beta program statistics
   */
  getStatistics() {
    return {
      ...this.stats,
      averageRole: this.calculateAverageRole(),
      retentionRate: this.calculateRetention(),
      topLanguage: this.stats.languagePrefs.es > this.stats.languagePrefs.en ? 'es' : 'en',
    };
  }

  /**
   * Get all active users
   */
  getActiveUsers(): BetaUser[] {
    return Array.from(this.users.values()).filter(u => u.status === 'active');
  }

  /**
   * Update user preferences
   */
  updateUserPreferences(userId: string, prefs: Partial<UserPreferences>): BetaUser | null {
    const user = this.users.get(userId);
    if (!user) return null;

    user.preferences = { ...user.preferences, ...prefs };
    return user;
  }

  /**
   * Calculate average community role
   */
  private calculateAverageRole(): string {
    const roles = Array.from(this.users.values()).map(u => u.preferences.communityRole);
    const advisors = roles.filter(r => r === 'advisor').length;
    const participants = roles.filter(r => r === 'participant').length;

    if (advisors > participants) return 'advisor-heavy';
    if (participants > advisors) return 'participant-focused';
    return 'balanced';
  }

  /**
   * Calculate retention rate
   */
  private calculateRetention(): number {
    const active = this.getActiveUsers().length;
    return this.stats.totalSignups > 0 ? (active / this.stats.totalSignups) * 100 : 0;
  }
}

export default new BetaOnboarding();
