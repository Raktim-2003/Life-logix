/**
 * Notification System for LifeLogix
 * Handles system notifications, health alerts, and admin notifications
 */

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'health' | 'medication' | 'system';
  title: string;
  message: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  isRead: boolean;
  actionRequired: boolean;
  category: 'health' | 'medication' | 'system' | 'security' | 'appointment' | 'general';
}

export class NotificationManager {
  private static readonly NOTIFICATIONS_KEY = 'lifelogix_notifications';
  private static readonly MAX_NOTIFICATIONS = 100;

  static generateNotifications(): Notification[] {
    const now = new Date();
    const notifications: Notification[] = [
      {
        id: 'notif_001',
        type: 'health',
        title: 'Blood Pressure Alert',
        message: 'John Doe recorded high blood pressure (150/95). Medical attention may be required.',
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        priority: 'high',
        userId: 'user_003',
        isRead: false,
        actionRequired: true,
        category: 'health'
      },
      {
        id: 'notif_002',
        type: 'medication',
        title: 'Medication Reminder Missed',
        message: 'Sarah Wilson missed her Albuterol dose scheduled for 2:00 PM.',
        timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        priority: 'medium',
        userId: 'user_004',
        isRead: false,
        actionRequired: true,
        category: 'medication'
      },
      {
        id: 'notif_003',
        type: 'system',
        title: 'New User Registration',
        message: 'New user "Demo User" has registered and completed their health profile.',
        timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        priority: 'low',
        isRead: true,
        actionRequired: false,
        category: 'system'
      },
      {
        id: 'notif_004',
        type: 'security',
        title: 'Multiple Login Attempts',
        message: 'Unusual login activity detected for admin@lifelogix.com from new IP address.',
        timestamp: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
        priority: 'high',
        isRead: false,
        actionRequired: true,
        category: 'security'
      },
      {
        id: 'notif_005',
        type: 'health',
        title: 'Health Goal Achievement',
        message: 'Test User has achieved their weekly exercise goal of 150 minutes!',
        timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        priority: 'low',
        isRead: true,
        actionRequired: false,
        category: 'health'
      },
      {
        id: 'notif_006',
        type: 'appointment',
        title: 'Upcoming Appointment',
        message: 'John Doe has an appointment with Dr. Smith tomorrow at 10:00 AM.',
        timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        priority: 'medium',
        userId: 'user_003',
        isRead: false,
        actionRequired: false,
        category: 'appointment'
      },
      {
        id: 'notif_007',
        type: 'system',
        title: 'System Maintenance',
        message: 'Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM EST.',
        timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        priority: 'medium',
        isRead: true,
        actionRequired: false,
        category: 'system'
      },
      {
        id: 'notif_008',
        type: 'medication',
        title: 'Prescription Refill Needed',
        message: 'Demo User\'s Metformin prescription expires in 3 days. Refill reminder sent.',
        timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        priority: 'medium',
        userId: 'user_001',
        isRead: false,
        actionRequired: true,
        category: 'medication'
      }
    ];

    return notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  static getNotificationStats() {
    const notifications = this.generateNotifications();
    const unread = notifications.filter(n => !n.isRead);
    const critical = notifications.filter(n => n.priority === 'critical');
    const actionRequired = notifications.filter(n => n.actionRequired && !n.isRead);
    
    return {
      total: notifications.length,
      unread: unread.length,
      critical: critical.length,
      actionRequired: actionRequired.length,
      byCategory: {
        health: notifications.filter(n => n.category === 'health').length,
        medication: notifications.filter(n => n.category === 'medication').length,
        system: notifications.filter(n => n.category === 'system').length,
        security: notifications.filter(n => n.category === 'security').length,
        appointment: notifications.filter(n => n.category === 'appointment').length,
        general: notifications.filter(n => n.category === 'general').length
      }
    };
  }

  static getRecentNotifications(limit: number = 10): Notification[] {
    return this.generateNotifications().slice(0, limit);
  }

  static getNotificationsByCategory(category: string): Notification[] {
    return this.generateNotifications().filter(n => n.category === category);
  }

  static getNotificationsByPriority(priority: string): Notification[] {
    return this.generateNotifications().filter(n => n.priority === priority);
  }

  static markAsRead(notificationId: string): void {
    // In a real implementation, this would update the database
    console.log(`Marked notification ${notificationId} as read`);
  }

  static markAllAsRead(): void {
    // In a real implementation, this would update all notifications
    console.log('Marked all notifications as read');
  }

  static getGreetingBasedOnTime(): { greeting: string; period: string; icon: string } {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return {
        greeting: 'Good morning',
        period: 'morning',
        icon: '🌅'
      };
    } else if (hour >= 12 && hour < 17) {
      return {
        greeting: 'Good afternoon', 
        period: 'afternoon',
        icon: '☀️'
      };
    } else if (hour >= 17 && hour < 20) {
      return {
        greeting: 'Good evening',
        period: 'evening', 
        icon: '🌇'
      };
    } else if (hour >= 20 && hour < 24) {
      return {
        greeting: 'Good night',
        period: 'night',
        icon: '🌙'
      };
    } else {
      return {
        greeting: 'Welcome back',
        period: 'late-night',
        icon: '🌙'
      };
    }
  }
}