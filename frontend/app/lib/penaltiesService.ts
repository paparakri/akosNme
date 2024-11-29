// penaltiesService.ts

interface PenaltyRecord {
    userId: string;
    type: 'no_show' | 'late_cancellation';
    reservationId: string;
    timestamp: Date;
    expiryDate: Date | null;  // null for permanent bans
    status: 'active' | 'expired';
  }
  
  interface UserMetrics {
    noShowCount: number;
    lateCancellations: number;
    totalReservations: number;
    reliabilityScore: number;  // 0-100
  }
  
  class PenaltiesService {
    // Thresholds for penalties
    private readonly LATE_CANCELLATION_HOURS = 24;  // Hours before reservation
    private readonly PENALTY_THRESHOLDS = {
      WARNING: { noShows: 1, lateCancellations: 2 },
      TEMP_BAN: { noShows: 2, lateCancellations: 3 },
      PERMANENT_BAN: { noShows: 3, lateCancellations: 5 }
    };
    private readonly TEMP_BAN_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
  
    /**
     * Check if a cancellation should trigger a penalty
     */
    public async checkLateCancellation(reservationDate: Date): Promise<boolean> {
      const now = new Date();
      const hoursUntilReservation = (reservationDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      return hoursUntilReservation < this.LATE_CANCELLATION_HOURS;
    }
  
    /**
     * Record a penalty for a user
     */
    public async recordPenalty(
      userId: string,
      type: 'no_show' | 'late_cancellation',
      reservationId: string
    ): Promise<void> {
      const metrics = await this.getUserMetrics(userId);
      const penalty: PenaltyRecord = {
        userId,
        type,
        reservationId,
        timestamp: new Date(),
        expiryDate: null,
        status: 'active'
      };
  
      // Determine penalty severity
      const totalNoShows = type === 'no_show' ? metrics.noShowCount + 1 : metrics.noShowCount;
      const totalLateCancellations = type === 'late_cancellation' ? 
        metrics.lateCancellations + 1 : metrics.lateCancellations;
  
      if (totalNoShows >= this.PENALTY_THRESHOLDS.PERMANENT_BAN.noShows ||
          totalLateCancellations >= this.PENALTY_THRESHOLDS.PERMANENT_BAN.lateCancellations) {
        await this.permanentBanUser(userId);
      } else if (totalNoShows >= this.PENALTY_THRESHOLDS.TEMP_BAN.noShows ||
                 totalLateCancellations >= this.PENALTY_THRESHOLDS.TEMP_BAN.lateCancellations) {
        penalty.expiryDate = new Date(Date.now() + this.TEMP_BAN_DURATION);
        await this.temporaryBanUser(userId, penalty.expiryDate);
      } else if (totalNoShows >= this.PENALTY_THRESHOLDS.WARNING.noShows ||
                 totalLateCancellations >= this.PENALTY_THRESHOLDS.WARNING.lateCancellations) {
        await this.warnUser(userId);
      }
  
      await this.savePenaltyRecord(penalty);
    }
  
    /**
     * Check if a user is banned
     */
    public async checkUserStatus(userId: string): Promise<{
      canBook: boolean;
      banExpiryDate?: Date;
      isPermanentBan: boolean;
    }> {
      const activePenalties = await this.getActivePenalties(userId);
      const permanentBan = activePenalties.find(p => p.expiryDate === null);
      
      if (permanentBan) {
        return { canBook: false, isPermanentBan: true };
      }
  
      const temporaryBan = activePenalties
        .filter(p => p.expiryDate !== null)
        .sort((a, b) => b.expiryDate!.getTime() - a.expiryDate!.getTime())[0];
  
      if (temporaryBan && temporaryBan.expiryDate! > new Date()) {
        return {
          canBook: false,
          banExpiryDate: temporaryBan.expiryDate!,
          isPermanentBan: false
        };
      }
  
      return { canBook: true, isPermanentBan: false };
    }
  
    /**
     * Calculate user's reliability score
     */
    private async calculateReliabilityScore(metrics: UserMetrics): Promise<number> {
      if (metrics.totalReservations === 0) return 100;
  
      const noShowPenalty = (metrics.noShowCount / metrics.totalReservations) * 60;
      const lateCancellationPenalty = (metrics.lateCancellations / metrics.totalReservations) * 40;
      const score = 100 - noShowPenalty - lateCancellationPenalty;
  
      return Math.max(0, Math.min(100, score));
    }
  
    /**
     * Private helper methods for ban actions
     */
    private async permanentBanUser(userId: string): Promise<void> {
      await this.notifyUser(userId, 'permanent_ban');
      // Update user record with permanent ban status
    }
  
    private async temporaryBanUser(userId: string, expiryDate: Date): Promise<void> {
      await this.notifyUser(userId, 'temporary_ban', { expiryDate });
      // Update user record with temporary ban status
    }
  
    private async warnUser(userId: string): Promise<void> {
      await this.notifyUser(userId, 'warning');
      // Record warning in user history
    }
  
    private async notifyUser(userId: string, notificationType: string, data?: any): Promise<void> {
      // Implementation for sending notifications to users about penalties
    }
  
    // Database interaction methods (to be implemented based on your DB choice)
    private async savePenaltyRecord(penalty: PenaltyRecord): Promise<void> {
      // Save penalty record to database
    }
  
    private async getActivePenalties(userId: string): Promise<PenaltyRecord[]> {
      // Fetch active penalties from database
      return [];
    }
  
    private async getUserMetrics(userId: string): Promise<UserMetrics> {
      // Fetch user metrics from database
      return {
        noShowCount: 0,
        lateCancellations: 0,
        totalReservations: 0,
        reliabilityScore: 100
      };
    }
  }
  
  export const penaltiesService = new PenaltiesService();