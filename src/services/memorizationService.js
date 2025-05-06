import { quranAPI } from './quranAPI';
import { memorizationAPI } from './api';

// Memorization study types
export const STUDY_TYPES = {
  MEMORIZE: 'memorize',
  READ: 'read',
  LISTEN: 'listen'
};

// Time commitment per day options
export const TIME_COMMITMENTS = {
  SHORT: { value: 15, label: '15 minuten', pages: 0.25 },
  MEDIUM: { value: 30, label: '30 minuten', pages: 0.5 },
  LONG: { value: 60, label: '60 minuten', pages: 0.75 },
};

// Create a class to handle memorization plans and progress
export class MemorizationPlan {
  constructor(surahNumber, timeCommitment, includeRevision) {
    this.id = ""; // Empty string instead of null to satisfy model validation
    this.userId = ""; // Will be set by server from token
    this.surahNumber = surahNumber;
    this.timeCommitment = timeCommitment; // One of TIME_COMMITMENTS
    this.includeRevision = includeRevision;
    this.startDate = new Date();
    this.currentPageIndex = 0;
    this.pagesPerDay = timeCommitment.pages;
    this.totalPages = 0;
    this.pageBreakdown = [];
    this.progress = {
      memorized: [],
      revised: []
    };
    this.completionDate = null;
    this.surahDetails = null;
  }

  // Initialize the plan with surah data and page calculations
  async initialize() {
    try {
      // Fetch metadata to understand page distribution
      const metadata = await quranAPI.getQuranMetadata();
      const surah = await quranAPI.getSurah(this.surahNumber);
      this.surahDetails = surah;

      // Get page references from metadata
      const pageReferences = metadata.pages.references;

      // Find which pages contain this surah
      const surahPages = this._getSurahPages(pageReferences, this.surahNumber);
      this.totalPages = surahPages.length;
      this.pageBreakdown = surahPages;

      // Calculate completion date based on pages per day
      const totalDays = Math.ceil(this.totalPages / this.pagesPerDay);
      this.completionDate = new Date();
      this.completionDate.setDate(this.startDate.getDate() + totalDays);

      return {
        surahDetails: this.surahDetails,
        totalPages: this.totalPages,
        pageBreakdown: this.pageBreakdown,
        pagesPerDay: this.pagesPerDay,
        completionDate: this.completionDate,
        totalDays
      };
    } catch (error) {
      console.error('Error initializing memorization plan:', error);
      throw error;
    }
  }

  // Extract relevant pages for a specific surah
  _getSurahPages(pageReferences, surahNumber) {
    const surahPages = [];
    let startIndex = -1;
    let endIndex = -1;

    // Find the range of pages that contain this surah
    for (let i = 0; i < pageReferences.length; i++) {
      const ref = pageReferences[i];
      
      // Mark the start if we find the first page of our surah
      if (ref.surah === surahNumber && startIndex === -1) {
        startIndex = i;
      }
      
      // Mark the end when we find the first page of the next surah
      if (startIndex !== -1 && ref.surah > surahNumber) {
        endIndex = i - 1;
        break;
      }
    }

    // If we found the start but not an end, it means our surah goes to the end of the Quran
    if (startIndex !== -1 && endIndex === -1) {
      endIndex = pageReferences.length - 1;
    }

    // Extract the actual page information
    for (let i = startIndex; i <= endIndex; i++) {
      const pageNumber = i + 1; // Page numbers are 1-indexed
      const startReference = pageReferences[i];
      const endReference = pageReferences[i + 1] || { surah: 115, ayah: 1 }; // Use a non-existent surah as a marker for the end

      surahPages.push({
        pageNumber,
        startSurah: startReference.surah,
        startAyah: startReference.ayah,
        endSurah: endReference.surah === surahNumber ? surahNumber : endReference.surah,
        endAyah: endReference.ayah - 1 || 0,
        completed: false,
        revised: false,
        unlocked: i === startIndex // Only first page is initially unlocked
      });
    }

    return surahPages;
  }

  // Get today's assignment
  getTodaysAssignment() {
    // Find the first incomplete page
    const incompleteIndex = this.pageBreakdown.findIndex(page => !page.completed);
    
    // If all pages are complete, the plan is finished
    if (incompleteIndex === -1) {
      return { 
        completed: true, 
        message: "Je hebt je memorisatiedoel bereikt! Gefeliciteerd!" 
      };
    }

    this.currentPageIndex = incompleteIndex;
    const currentPage = this.pageBreakdown[incompleteIndex];
    
    // Determine if revision is needed before this page
    let revisionNeeded = false;
    let revisionPage = null;
    
    if (this.includeRevision && incompleteIndex > 0) {
      // Find the most recent page that needs revision
      for (let i = incompleteIndex - 1; i >= 0; i--) {
        if (!this.pageBreakdown[i].revised) {
          revisionNeeded = true;
          revisionPage = this.pageBreakdown[i];
          break;
        }
      }
    }

    // If revision is needed and not done, that's the next task
    if (revisionNeeded && revisionPage) {
      return {
        revisionNeeded: true,
        revisionPage,
        nextNewPage: currentPage,
        message: "Herhaal eerst de vorige pagina voordat je verdergaat met memoriseren.",
        progress: {
          current: incompleteIndex,
          total: this.totalPages,
          percentage: Math.round((incompleteIndex / this.totalPages) * 100)
        }
      };
    }

    // Otherwise, proceed with memorizing the current page
    return {
      currentPage,
      progress: {
        current: incompleteIndex,
        total: this.totalPages,
        percentage: Math.round((incompleteIndex / this.totalPages) * 100)
      },
      message: "Memoriseer deze pagina voor vandaag."
    };
  }

  // Mark the current page as memorized
  async markCurrentPageAsMemorized() {
    if (this.currentPageIndex < this.pageBreakdown.length) {
      const currentPage = this.pageBreakdown[this.currentPageIndex];
      currentPage.completed = true;
      
      // Unlock the next page if it exists
      if (this.currentPageIndex + 1 < this.pageBreakdown.length) {
        this.pageBreakdown[this.currentPageIndex + 1].unlocked = true;
      }

      this.progress.memorized.push({
        pageNumber: currentPage.pageNumber,
        dateCompleted: new Date()
      });
      
      // Save changes to database
      await this.save();

      return {
        success: true,
        message: "Pagina gemarkeerd als gememoriseerd! Goed gedaan!",
        nextAssignment: this.getTodaysAssignment()
      };
    }
    
    return {
      success: false,
      message: "Er is geen huidige pagina om te markeren als gememoriseerd."
    };
  }

  // Mark a revision page as revised
  async markPageAsRevised(pageNumber) {
    const pageIndex = this.pageBreakdown.findIndex(p => p.pageNumber === pageNumber);
    
    if (pageIndex !== -1) {
      this.pageBreakdown[pageIndex].revised = true;
      
      this.progress.revised.push({
        pageNumber,
        dateCompleted: new Date() // Changed from dateRevised to match model
      });
      
      // Save changes to database
      await this.save();

      return {
        success: true,
        message: "Pagina succesvol gemarkeerd als herhaald!",
        nextAssignment: this.getTodaysAssignment()
      };
    }
    
    return {
      success: false,
      message: "Pagina niet gevonden om te markeren als herhaald."
    };
  }

  // Save the plan to database
  async save() {
    try {
      // Make sure we have required fields
      const planToSave = {
        ...this,
        id: this.id || "", // Ensure we have an ID (empty string for new plans)
        userId: this.userId || "" // Server will replace this with actual user ID from JWT token
      };
      
      if (this.id) {
        // Update existing plan
        await memorizationAPI.updatePlan(this.id, planToSave);
      } else {
        // Create new plan
        const savedPlan = await memorizationAPI.createPlan(planToSave);
        this.id = savedPlan.id;
        this.userId = savedPlan.userId;
      }
      return true;
    } catch (error) {
      console.error('Error saving memorization plan:', error);
      return false;
    }
  }

  // Helper method to create a MemorizationPlan from API data
  static fromApiData(data) {
    if (!data) return null;
    
    // Map C# PascalCase properties to JavaScript camelCase
    const mappedData = {
      id: data.id || data.Id,
      userId: data.userId || data.UserId,
      surahNumber: data.surahNumber || data.SurahNumber,
      timeCommitment: data.timeCommitment || data.TimeCommitment,
      includeRevision: data.includeRevision || data.IncludeRevision,
      startDate: data.startDate || data.StartDate,
      currentPageIndex: data.currentPageIndex || data.CurrentPageIndex,
      pagesPerDay: data.pagesPerDay || data.PagesPerDay,
      totalPages: data.totalPages || data.TotalPages,
      pageBreakdown: data.pageBreakdown || data.PageBreakdown,
      progress: data.progress || data.Progress,
      completionDate: data.completionDate || data.CompletionDate,
      surahDetails: data.surahDetails || data.SurahDetails
    };
    
    const plan = new MemorizationPlan(
      mappedData.surahNumber,
      mappedData.timeCommitment,
      mappedData.includeRevision
    );
    
    // Copy all properties
    plan.id = mappedData.id;
    plan.userId = mappedData.userId;
    plan.startDate = new Date(mappedData.startDate);
    plan.currentPageIndex = mappedData.currentPageIndex;
    plan.pagesPerDay = mappedData.pagesPerDay;
    plan.totalPages = mappedData.totalPages;
    plan.pageBreakdown = mappedData.pageBreakdown;
    plan.progress = mappedData.progress;
    plan.completionDate = mappedData.completionDate ? new Date(mappedData.completionDate) : null;
    plan.surahDetails = mappedData.surahDetails;
    
    return plan;
  }
}

// Helper function to handle API calls with better error management
const silentApiCall = async (apiFunction, fallbackValue = null) => {
  try {
    return await apiFunction();
  } catch (error) {
    console.warn('API call failed silently:', error.message);
    return fallbackValue;
  }
};

// Create a service object to interface with the MemorizationPlan
export const memorizationService = {
  // Create a new memorization plan
  createPlan: async (surahNumber, timeCommitmentKey, includeRevision) => {
    try {
      // Find the time commitment object from the key
      const timeCommitment = TIME_COMMITMENTS[timeCommitmentKey] || TIME_COMMITMENTS.MEDIUM;
      
      // Create a new plan
      const plan = new MemorizationPlan(surahNumber, timeCommitment, includeRevision);
      
      // Initialize with surah data
      await plan.initialize();
      
      // Save to backend
      const saved = await plan.save();
      
      if (!saved) {
        throw new Error('Failed to save plan to server');
      }
      
      return plan;
    } catch (error) {
      console.error('Error creating memorization plan:', error);
      // Return a local plan that's not tied to the backend if we're having API issues
      const fallbackPlan = new MemorizationPlan(surahNumber, TIME_COMMITMENTS[timeCommitmentKey] || TIME_COMMITMENTS.MEDIUM, includeRevision);
      await fallbackPlan.initialize();
      return fallbackPlan;
    }
  },
  
  // Get the current memorization plan
  getCurrentPlan: async () => {
    try {
      // Try to get plan from API
      const planData = await silentApiCall(async () => {
        const response = await memorizationAPI.getCurrentPlan();
        return response;
      });
      
      // If we got data back, convert it to a MemorizationPlan object
      if (planData && planData.id) {
        return MemorizationPlan.fromApiData(planData);
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching memorization plan:', error);
      return null;
    }
  },
  
  // Update progress for a specific action
  updateProgress: async (action, pageNumber = null) => {
    try {
      // First get the current plan
      const currentPlan = await memorizationService.getCurrentPlan();
      
      if (!currentPlan) {
        return {
          success: false,
          message: 'Geen memorisatieplan gevonden'
        };
      }
      
      let result;
      
      if (action === 'memorize') {
        // Mark current page as memorized
        result = await currentPlan.markCurrentPageAsMemorized();
      } else if (action === 'revise' && pageNumber) {
        // Mark specific page as revised
        result = await currentPlan.markPageAsRevised(pageNumber);
      } else {
        return {
          success: false,
          message: 'Ongeldige actie'
        };
      }
      
      return result;
    } catch (error) {
      console.error('Error updating progress:', error);
      
      // Return a graceful fallback
      return {
        success: false,
        message: 'Fout bij het bijwerken van de voortgang. Probeer het later opnieuw.'
      };
    }
  },
  
  // Reset the current plan
  resetPlan: async () => {
    try {
      await silentApiCall(async () => {
        await memorizationAPI.resetPlan();
      });
      
      return true;
    } catch (error) {
      console.error('Error resetting plan:', error);
      return false;
    }
  }
};