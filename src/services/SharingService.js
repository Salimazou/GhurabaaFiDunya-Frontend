/**
 * Service for handling event sharing functionality
 * Manages sharing events with other users and generating shareable links
 */

class SharingService {
  /**
   * Share an event with other users via email
   * 
   * @param {Object} event - Event to share
   * @param {Array<string>} recipients - List of email addresses to share with
   * @returns {Promise<Object>} - Status of sharing operation
   */
  async shareEvent(event, recipients) {
    try {
      // In a real app, this would call an API to send emails
      // For demonstration, we'll simulate a successful sharing operation
      
      console.log(`Sharing event "${event.title}" with: ${recipients.join(', ')}`);
      
      // Generate a shareable link
      const shareableLink = this.generateShareableLink(event);
      
      return {
        success: true,
        message: `Event shared with ${recipients.length} recipient(s)`,
        shareableLink,
      };
    } catch (error) {
      console.error('Error sharing event:', error);
      return {
        success: false,
        message: 'Failed to share event',
        error: error.message,
      };
    }
  }
  
  /**
   * Generate a shareable link for an event
   * 
   * @param {Object} event - Event to generate link for
   * @returns {string} - Shareable link
   */
  generateShareableLink(event) {
    // Create a simplified event data
    const eventData = {
      id: event.id,
      title: event.title,
      startTime: event.startTime,
      endTime: event.endTime,
      category: event.category || 'other'
    };
    
    // Basic encoding to create a shareable link
    const encodedData = btoa(JSON.stringify(eventData));
    
    return `${window.location.origin}/agenda?share=${encodedData}`;
  }
  
  /**
   * Import a shared event from a shareable link
   * 
   * @param {string} shareCode - Code from the shareable link
   * @returns {Object|null} - Decoded event or null if invalid
   */
  importSharedEvent(shareCode) {
    try {
      // Decode the event data
      const decodedEvent = JSON.parse(atob(shareCode));
      
      return {
        ...decodedEvent,
        imported: true,
        importedAt: new Date().toISOString(),
        id: `imported-${Date.now()}`
      };
    } catch (error) {
      console.error('Error importing shared event:', error);
      return null;
    }
  }
  
  /**
   * Download an event as iCal file
   * 
   * @param {Object} event - Event to download
   */
  downloadEventAsIcal(event) {
    // Simplified stub implementation
    console.log('Downloading event as iCal:', event.title);
    alert('iCal download functionality is not available in this demo');
  }
  
  /**
   * Share event via native share API (if available)
   * 
   * @param {Object} event - Event to share
   * @returns {Promise<boolean>} - Whether sharing was successful
   */
  async shareEventNatively(event) {
    if (!navigator.share) {
      console.log('Web Share API not supported');
      return false;
    }
    
    try {
      const shareData = {
        title: event.title,
        text: event.description || 'Check out this event',
        url: this.generateShareableLink(event),
      };
      
      await navigator.share(shareData);
      return true;
    } catch (error) {
      console.error('Error sharing event:', error);
      return false;
    }
  }
}

// Create singleton instance
const sharingService = new SharingService();

export default sharingService; 