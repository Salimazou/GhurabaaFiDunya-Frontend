import React, { createContext, useContext, useState, useEffect } from 'react';
import { memorizationService, STUDY_TYPES, TIME_COMMITMENTS } from '../services/memorizationService';
import { toast } from 'react-hot-toast';

// Create memorization context
const MemorizationContext = createContext();

// Custom hook to use the memorization context
export const useMemorization = () => useContext(MemorizationContext);

// Provider component
export const MemorizationProvider = ({ children }) => {
  // State for study selection
  const [studyType, setStudyType] = useState(null);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [timeCommitment, setTimeCommitment] = useState(TIME_COMMITMENTS.MEDIUM);
  const [includeRevision, setIncludeRevision] = useState(true);
  
  // State for plans and progress
  const [currentPlan, setCurrentPlan] = useState(null);
  const [todaysAssignment, setTodaysAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State for setup wizard
  const [setupStep, setSetupStep] = useState(1);
  const [setupComplete, setSetupComplete] = useState(false);

  // Load any existing plan on component mount
  useEffect(() => {
    const loadExistingPlan = async () => {
      try {
        setLoading(true);
        
        // Check if the user is likely authenticated before making API calls
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return; // Don't try to load a plan if not authenticated
        }
        
        const savedPlan = await memorizationService.getCurrentPlan();
        
        if (savedPlan) {
          setCurrentPlan(savedPlan);
          setTodaysAssignment(savedPlan.getTodaysAssignment());
          setSetupComplete(true);
          
          // Set the form values from the saved plan
          setSelectedSurah(savedPlan.surahNumber);
          setTimeCommitment(savedPlan.timeCommitment);
          setIncludeRevision(savedPlan.includeRevision);
          setStudyType(STUDY_TYPES.MEMORIZE); // Assume memorize for existing plans
        }
      } catch (error) {
        console.error('Error loading plan:', error);
        // Don't show error toast on initial load to prevent annoying the user
        // toast.error('Fout bij het laden van het memorisatieplan.');
      } finally {
        setLoading(false);
      }
    };
    
    loadExistingPlan();
  }, []);

  // Create a new memorization plan
  const createPlan = async () => {
    if (!selectedSurah || !timeCommitment) {
      toast.error('Selecteer een surah en tijdsbesteding');
      return;
    }
    
    setLoading(true);
    
    try {
      // Convert timeCommitment string key to the actual object
      const timeKey = Object.keys(TIME_COMMITMENTS).find(
        key => TIME_COMMITMENTS[key].value === timeCommitment.value
      ) || 'MEDIUM';
      
      const plan = await memorizationService.createPlan(
        selectedSurah,
        timeKey,
        includeRevision
      );
      
      setCurrentPlan(plan);
      setTodaysAssignment(plan.getTodaysAssignment());
      setSetupComplete(true);
      
      toast.success('Memorisatieplan succesvol aangemaakt!');
    } catch (error) {
      console.error('Error creating plan:', error);
      toast.error('Fout bij het maken van het plan. Probeer het opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  // Update progress for memorization or revision
  const updateProgress = async (action, pageNumber = null) => {
    if (!currentPlan) {
      toast.error('Geen actief memorisatieplan gevonden');
      return;
    }
    
    try {
      const result = await memorizationService.updateProgress(action, pageNumber);
      
      if (result.success) {
        setTodaysAssignment(result.nextAssignment);
        toast.success(result.message);
        
        // Reload the plan to reflect changes
        const updatedPlan = await memorizationService.getCurrentPlan();
        setCurrentPlan(updatedPlan);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Fout bij het bijwerken van de voortgang.');
    }
  };

  // Reset the current plan
  const resetPlan = async () => {
    if (window.confirm('Weet je zeker dat je je huidige memorisatieplan wilt verwijderen?')) {
      try {
        await memorizationService.resetPlan();
        setCurrentPlan(null);
        setTodaysAssignment(null);
        setSetupComplete(false);
        setSetupStep(1);
        toast.success('Memorisatieplan gereset');
      } catch (error) {
        console.error('Error resetting plan:', error);
        toast.error('Fout bij het resetten van het plan.');
      }
    }
  };

  // Navigate through setup steps
  const nextSetupStep = () => {
    if (setupStep < 3) {
      setSetupStep(setupStep + 1);
    } else {
      createPlan();
    }
  };

  const prevSetupStep = () => {
    if (setupStep > 1) {
      setSetupStep(setupStep - 1);
    }
  };

  // Provide context value
  const value = {
    // Selection state
    studyType,
    setStudyType,
    selectedSurah,
    setSelectedSurah,
    timeCommitment,
    setTimeCommitment,
    includeRevision,
    setIncludeRevision,
    
    // Plan state
    currentPlan,
    todaysAssignment,
    loading,
    
    // Setup state
    setupStep,
    setupComplete,
    
    // Actions
    createPlan,
    updateProgress,
    resetPlan,
    nextSetupStep,
    prevSetupStep,
    
    // Constants
    STUDY_TYPES,
    TIME_COMMITMENTS
  };

  return (
    <MemorizationContext.Provider value={value}>
      {children}
    </MemorizationContext.Provider>
  );
}; 