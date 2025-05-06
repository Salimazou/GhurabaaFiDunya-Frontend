/**
 * Service for managing event notifications
 * Handles scheduled notifications, permission requests, and notification displays
 */

class NotificationService {
  constructor() {
    this.scheduledNotifications = {};
    this.hasPermission = false;
    this.isNotificationSupported = typeof Notification !== 'undefined';
    if (this.isNotificationSupported) {
      this.initPermission();
    }
  }

  /**
   * Initialize and check notification permission
   */
  async initPermission() {
    if (!this.isNotificationSupported) {
      console.log('This browser does not support notifications');
      return;
    }

    if (Notification.permission === 'granted') {
      this.hasPermission = true;
    } else if (Notification.permission !== 'denied') {
      try {
        const permission = await Notification.requestPermission();
        this.hasPermission = permission === 'granted';
      } catch (error) {
        console.error('Error requesting notification permission:', error);
      }
    }
  }

  /**
   * Request notification permission if not already granted
   * @returns {Promise<boolean>} - Whether permission is granted
   */
  async requestPermission() {
    if (!this.isNotificationSupported) {
      return false;
    }

    if (Notification.permission === 'granted') {
      this.hasPermission = true;
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      this.hasPermission = permission === 'granted';
      return this.hasPermission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Schedule a notification for an event
   * 
   * @param {Object} event - The event to schedule notification for
   * @param {number} minutesBefore - Minutes before event to show notification
   * @returns {string} - Notification ID
   */
  scheduleNotification(event, minutesBefore = 15) {
    if (!this.isNotificationSupported || !this.hasPermission) return null;
    
    try {
      const eventTime = new Date(event.startTime);
      const notificationTime = new Date(eventTime.getTime() - (minutesBefore * 60 * 1000));
      
      // Don't schedule if notification time is in the past
      if (notificationTime < new Date()) return null;
      
      // Calculate delay in milliseconds
      const delay = notificationTime.getTime() - Date.now();
      
      // Generate a unique ID for this notification
      const notificationId = `notification-${event.id}-${Date.now()}`;
      
      // Schedule the notification
      this.scheduledNotifications[notificationId] = setTimeout(() => {
        try {
          this.showNotification(event);
        } catch (error) {
          console.error('Error showing notification:', error);
        }
        delete this.scheduledNotifications[notificationId];
      }, delay);
      
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }
  
  /**
   * Persist scheduled notification to localStorage
   */
  persistScheduledNotification(notificationId, event, notificationTime) {
    try {
      // Get existing persisted notifications
      const persistedNotifications = JSON.parse(
        localStorage.getItem('scheduledNotifications') || '{}'
      );
      
      // Add this notification
      persistedNotifications[notificationId] = {
        eventId: event.id,
        eventTitle: event.title,
        eventStartTime: event.startTime,
        notificationTime: notificationTime.toISOString(),
      };
      
      // Save back to localStorage
      localStorage.setItem(
        'scheduledNotifications', 
        JSON.stringify(persistedNotifications)
      );
    } catch (error) {
      console.error('Error persisting notification:', error);
    }
  }
  
  /**
   * Load and reschedule persisted notifications
   */
  loadPersistedNotifications() {
    try {
      const persistedNotifications = JSON.parse(
        localStorage.getItem('scheduledNotifications') || '{}'
      );
      
      const now = Date.now();
      const updatedNotifications = {};
      
      // Process each notification
      Object.entries(persistedNotifications).forEach(([notificationId, notification]) => {
        const notificationTime = new Date(notification.notificationTime);
        
        // Only reschedule if it's in the future
        if (notificationTime > now) {
          const delay = notificationTime.getTime() - now;
          
          // Recreate the event object
          const event = {
            id: notification.eventId,
            title: notification.eventTitle,
            startTime: notification.eventStartTime,
          };
          
          // Reschedule
          this.scheduledNotifications[notificationId] = setTimeout(() => {
            this.showNotification(event);
            delete this.scheduledNotifications[notificationId];
            
            // Update localStorage
            const updated = JSON.parse(
              localStorage.getItem('scheduledNotifications') || '{}'
            );
            delete updated[notificationId];
            localStorage.setItem('scheduledNotifications', JSON.stringify(updated));
          }, delay);
          
          // Keep this notification in our persisted storage
          updatedNotifications[notificationId] = notification;
        }
      });
      
      // Update localStorage with only future notifications
      localStorage.setItem(
        'scheduledNotifications', 
        JSON.stringify(updatedNotifications)
      );
    } catch (error) {
      console.error('Error loading persisted notifications:', error);
    }
  }
  
  /**
   * Cancel a scheduled notification
   * 
   * @param {string} notificationId - ID of the notification to cancel
   */
  cancelNotification(notificationId) {
    if (this.scheduledNotifications[notificationId]) {
      clearTimeout(this.scheduledNotifications[notificationId]);
      delete this.scheduledNotifications[notificationId];
      
      // Remove from localStorage
      try {
        const persistedNotifications = JSON.parse(
          localStorage.getItem('scheduledNotifications') || '{}'
        );
        
        delete persistedNotifications[notificationId];
        
        localStorage.setItem(
          'scheduledNotifications',
          JSON.stringify(persistedNotifications)
        );
      } catch (error) {
        console.error('Error removing persisted notification:', error);
      }
    }
  }
  
  /**
   * Cancel all notifications for an event
   * 
   * @param {string} eventId - ID of the event
   */
  cancelEventNotifications(eventId) {
    // Cancel timeouts
    Object.entries(this.scheduledNotifications).forEach(([notificationId, timeout]) => {
      if (notificationId.includes(`-${eventId}-`)) {
        clearTimeout(timeout);
        delete this.scheduledNotifications[notificationId];
      }
    });
    
    // Remove from localStorage
    try {
      const persistedNotifications = JSON.parse(
        localStorage.getItem('scheduledNotifications') || '{}'
      );
      
      const updatedNotifications = Object.entries(persistedNotifications)
        .filter(([id, notification]) => notification.eventId !== eventId)
        .reduce((obj, [id, notification]) => {
          obj[id] = notification;
          return obj;
        }, {});
      
      localStorage.setItem(
        'scheduledNotifications',
        JSON.stringify(updatedNotifications)
      );
    } catch (error) {
      console.error('Error removing persisted event notifications:', error);
    }
  }
  
  /**
   * Show a notification for an event
   * 
   * @param {Object} event - The event to show notification for
   */
  showNotification(event) {
    if (!this.isNotificationSupported || !this.hasPermission) return;
    
    try {
      const title = event.title;
      const options = {
        body: `Starting ${this.getRelativeTimeString(new Date(event.startTime))}`,
        icon: '/favicon.ico'
      };
      
      // Create basic notification without actions (which can cause errors)
      const notification = new Notification(title, options);
      
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }
  
  /**
   * Get a human-readable relative time string
   * 
   * @param {Date} date - The date to format
   * @returns {string} - Formatted time string
   */
  getRelativeTimeString(date) {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins <= 0) {
      return 'now';
    } else if (diffMins === 1) {
      return 'in 1 minute';
    } else if (diffMins < 60) {
      return `in ${diffMins} minutes`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      
      if (hours === 1) {
        return mins > 0 ? `in 1 hour ${mins} minutes` : 'in 1 hour';
      } else {
        return mins > 0 ? `in ${hours} hours ${mins} minutes` : `in ${hours} hours`;
      }
    }
  }
  
  /**
   * Schedule notifications for multiple events
   * 
   * @param {Array} events - Array of events to schedule notifications for
   * @returns {Object} - Map of event IDs to notification IDs
   */
  scheduleEventNotifications(events) {
    const notificationMap = {};
    
    if (!this.isNotificationSupported) return notificationMap;
    
    events.forEach(event => {
      if (event.enableNotification) {
        const notificationId = this.scheduleNotification(event, event.notifyBefore);
        if (notificationId) {
          notificationMap[event.id] = notificationId;
        }
      }
    });
    
    return notificationMap;
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService; 