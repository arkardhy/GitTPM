import { sendDiscordEmbed, webhooks } from './client';
import { 
  createCheckInEmbed, 
  createCheckOutEmbed, 
  createLeaveRequestEmbed, 
  createResignationRequestEmbed 
} from './embeds';

export const discordNotifications = {
  async checkIn(name: string, position: string, date: Date) {
    try {
      const embed = createCheckInEmbed({
        employeeName: name,
        employeePosition: position,
        date,
      });
      await sendDiscordEmbed(embed, webhooks.default);
    } catch (error) {
      console.error('Failed to send check-in notification:', error);
    }
  },

  async checkOut(name: string, position: string, date: Date, totalHours: number) {
    try {
      const embed = createCheckOutEmbed({
        employeeName: name,
        employeePosition: position,
        date,
        totalHours,
      });
      await sendDiscordEmbed(embed, webhooks.default);
    } catch (error) {
      console.error('Failed to send check-out notification:', error);
    }
  },

  async leaveRequest(
    name: string, 
    position: string, 
    reason: string, 
    status: 'pending' | 'approved' | 'rejected',
    startDate?: string,
    endDate?: string,
  ) {
    try {
      const embed = createLeaveRequestEmbed({
        employeeName: name,
        employeePosition: position,
        reason,
        status,
        startDate,
        endDate,
      });
      await sendDiscordEmbed(embed, webhooks.leave);
    } catch (error) {
      console.error('Failed to send leave request notification:', error);
    }
  },

  async resignationRequest(
    name: string,
    position: string,
    status: 'pending' | 'approved' | 'rejected',
    requestDate: string,
    passport: string,
    reasonIC: string,
    reasonOOC: string,
  ) {
    try {
      const embed = createResignationRequestEmbed({
        employeeName: name,
        employeePosition: position,
        status,
        requestDate,
        passport,
        reasonIC,
        reasonOOC,
        submissionDate: new Date().toISOString(),
      });
      await sendDiscordEmbed(embed, webhooks.resignation);
    } catch (error) {
      console.error('Failed to send resignation request notification:', error);
    }
  },
};

export type { 
  BaseNotification,
  CheckInNotification,
  CheckOutNotification,
  LeaveNotification,
  ResignationNotification,
} from './types';