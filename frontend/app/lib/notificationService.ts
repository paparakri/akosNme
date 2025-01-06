// notificationService.ts

import axios from 'axios';

interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  reminderDays: number[];
}

interface NotificationPayload {
  userId: string;
  type: 'reservation_confirmation' | 'reservation_rejection' | 'reservation_reminder' | 'reservation_modification' | 'reservation_cancellation';
  data: {
    reservationId: string;
    clubName: string;
    date: string;
    time: string;
    modifications?: {
      field: string;
      oldValue: any;
      newValue: any;
    }[];
  };
}

interface Reservation {
  numOfGuests: number;
  date: string;
  time: string;
}

interface BatchedClubNotification {
  clubId: string;
  notifications: {
    type: 'new_reservation' | 'cancellation';
    reservation: Reservation;
    timestamp: Date;
  }[];
}

class NotificationService {
  private batchedClubNotifications: Map<string, BatchedClubNotification> = new Map();

  constructor() {
    // Schedule daily batch notifications for clubs at 5 PM
    this.scheduleDailyBatchNotifications();
  }

  private scheduleDailyBatchNotifications() {
    const now = new Date();
    const scheduledTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      17, // 5 PM
      0,
      0
    );

    if (now > scheduledTime) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeUntilSchedule = scheduledTime.getTime() - now.getTime();
    
    setTimeout(async () => {
      await this.sendBatchedClubNotifications();
      this.scheduleDailyBatchNotifications(); // Schedule next day's batch
    }, timeUntilSchedule);
  }

  private async sendBatchedClubNotifications() {
    // Convert Map entries to array for iteration
    const entries = Array.from(this.batchedClubNotifications.entries());
    
    for (const [clubId, batchData] of entries) {
      try {
        const notifications = batchData.notifications;
        if (notifications.length === 0) continue;

        // Group notifications by type
        const newReservations = notifications.filter((n): n is typeof n => n.type === 'new_reservation');
        const cancellations = notifications.filter((n): n is typeof n => n.type === 'cancellation');

        // Compose email content
        const emailContent = this.composeBatchEmailContent(newReservations, cancellations);

        // Send batch notification email to club
        await this.sendEmail({
          to: clubId,
          subject: 'Daily Reservation Summary',
          content: emailContent
        });

        // Clear processed notifications
        this.batchedClubNotifications.delete(clubId);
      } catch (error) {
        console.error(`Failed to send batch notifications to club ${clubId}:`, error);
      }
    }
  }

  private composeBatchEmailContent(newReservations: { reservation: Reservation }[], cancellations: { reservation: Reservation }[]): string {
    let content = 'Daily Reservation Summary\n\n';

    if (newReservations.length > 0) {
      content += 'New Reservations:\n';
      newReservations.forEach(res => {
        content += `- ${res.reservation.numOfGuests} guests on ${res.reservation.date} at ${res.reservation.time}\n`;
      });
      content += '\n';
    }

    if (cancellations.length > 0) {
      content += 'Cancellations:\n';
      cancellations.forEach(res => {
        content += `- Reservation for ${res.reservation.date} at ${res.reservation.time} has been cancelled\n`;
      });
    }

    return content;
  }

  public async addClubNotification(clubId: string, type: 'new_reservation' | 'cancellation', reservation: Reservation) {
    const batchData = this.batchedClubNotifications.get(clubId) || {
      clubId,
      notifications: []
    };

    batchData.notifications.push({
      type,
      reservation,
      timestamp: new Date()
    });

    this.batchedClubNotifications.set(clubId, batchData);
  }

  public async sendUserNotification(payload: NotificationPayload, preferences: NotificationPreferences) {
    try {
      const promises = [];

      if (preferences.email) {
        promises.push(this.sendEmail({
          to: payload.userId,
          subject: this.getEmailSubject(payload.type),
          content: this.getEmailContent(payload)
        }));
      }

      if (preferences.sms) {
        promises.push(this.sendSMS({
          to: payload.userId,
          content: this.getSMSContent(payload)
        }));
      }

      await Promise.all(promises);
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  }

  private getEmailSubject(type: NotificationPayload['type']): string {
    const subjects = {
      reservation_confirmation: 'Your reservation has been confirmed!',
      reservation_rejection: 'Reservation Update: Not Available',
      reservation_reminder: 'Upcoming Reservation Reminder',
      reservation_modification: 'Your reservation has been modified',
      reservation_cancellation: 'Reservation Cancellation Confirmation'
    };
    return subjects[type];
  }

  private getEmailContent(payload: NotificationPayload): string {
    switch (payload.type) {
      case 'reservation_confirmation':
        return `Your reservation at ${payload.data.clubName} for ${payload.data.date} at ${payload.data.time} has been confirmed.`;
      case 'reservation_rejection':
        return `Unfortunately, your reservation at ${payload.data.clubName} for ${payload.data.date} at ${payload.data.time} could not be accommodated.`;
      case 'reservation_reminder':
        return `Reminder: Your reservation at ${payload.data.clubName} is coming up on ${payload.data.date} at ${payload.data.time}.`;
      case 'reservation_modification':
        return this.getModificationEmailContent(payload);
      case 'reservation_cancellation':
        return `Your reservation at ${payload.data.clubName} for ${payload.data.date} at ${payload.data.time} has been cancelled.`;
      default:
        return '';
    }
  }

  private getModificationEmailContent(payload: NotificationPayload): string {
    let content = `Your reservation at ${payload.data.clubName} has been modified:\n\n`;
    payload.data.modifications?.forEach(mod => {
      content += `${mod.field}: ${mod.oldValue} → ${mod.newValue}\n`;
    });
    return content;
  }

  private getSMSContent(payload: NotificationPayload): string {
    // Shorter versions of the email content for SMS
    const contents = {
      reservation_confirmation: `Confirmed: ${payload.data.clubName} ${payload.data.date} ${payload.data.time}`,
      reservation_rejection: `Not available: ${payload.data.clubName} ${payload.data.date}`,
      reservation_reminder: `Reminder: ${payload.data.clubName} ${payload.data.date} ${payload.data.time}`,
      reservation_modification: `Reservation modified: ${payload.data.clubName}. Check email for details.`,
      reservation_cancellation: `Cancelled: ${payload.data.clubName} ${payload.data.date}`
    };
    return contents[payload.type];
  }

  private async sendEmail({ to, subject, content }: { to: string; subject: string; content: string }) {
    // Implementation for sending emails (e.g., using a service like SendGrid)
    try {
      await axios.post('/api/email', { to, subject, content });
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  private async sendSMS({ to, content }: { to: string; content: string }) {
    // Implementation for sending SMS (e.g., using a service like Twilio)
    try {
      await axios.post('/api/sms', { to, content });
    } catch (error) {
      console.error('Failed to send SMS:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();