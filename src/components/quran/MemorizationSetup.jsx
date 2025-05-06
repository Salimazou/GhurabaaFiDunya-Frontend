import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMemorization } from '../../context/MemorizationContext';
import { quranAPI } from '../../services/quranAPI';
import StudyModeSelector from './StudyModeSelector';
import { 
  BookOpenIcon, 
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

const MemorizationSetup = () => {
  const navigate = useNavigate();
  const { 
    setupStep, 
    setupComplete, 
    nextSetupStep, 
    prevSetupStep,
    selectedSurah,
    setSelectedSurah,
    timeCommitment, 
    setTimeCommitment,
    includeRevision, 
    setIncludeRevision,
    createPlan,
    TIME_COMMITMENTS,
    loading,
    studyType,
    STUDY_TYPES
  } = useMemorization();

  // State for surahs list
  const [surahs, setSurahs] = useState([]);
  const [loadingSurahs, setLoadingSurahs] = useState(true);
  
  // Load surahs from the API
  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        setLoadingSurahs(true);
        const data = await quranAPI.getAllSurahs();
        setSurahs(data);
      } catch (error) {
        console.error('Error fetching surahs:', error);
        // Fallback to placeholder data if the API fails
        const placeholderSurahs = Array.from({ length: 114 }, (_, i) => ({
          number: i + 1,
          name: `Surah ${i + 1}`,
          englishName: `Surah ${i + 1}`
        }));
        setSurahs(placeholderSurahs);
      } finally {
        setLoadingSurahs(false);
      }
    };
    
    if (setupStep === 2) {
      fetchSurahs();
    }
  }, [setupStep]);

  const handleCreatePlan = () => {
    if (studyType === STUDY_TYPES.MEMORIZE) {
      createPlan();
    } else {
      // For reading or listening, just navigate to the content page
      navigate('/dashboard');
    }
  };

  // Determine the maximum number of steps based on the study type
  const getMaxSteps = () => {
    if (!studyType) return 3; // Default
    
    switch (studyType) {
      case STUDY_TYPES.MEMORIZE:
        return 3; // Study mode -> Surah selection -> Time commitment
      case STUDY_TYPES.READ:
      case STUDY_TYPES.LISTEN:
        return 2; // Study mode -> Surah selection, then immediately to dashboard
      default:
        return 3;
    }
  };

  // Handle next step based on study type
  const handleNextStep = () => {
    if (studyType !== STUDY_TYPES.MEMORIZE && setupStep === 2) {
      // For reading or listening, skip to dashboard after surah selection
      navigate('/dashboard');
    } else {
      nextSetupStep();
    }
  };

  // Fix the navigation issue by using useEffect
  useEffect(() => {
    // If setup is already complete, redirect to dashboard
    if (setupComplete) {
      navigate('/dashboard');
    }
  }, [setupComplete, navigate]);

  // Render different step based on current setupStep
  const renderStep = () => {
    switch (setupStep) {
      case 1:
        return <StudyModeSelector />;
      
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-3xl mx-auto p-6"
          >
            <h2 className="text-2xl font-bold text-center mb-6">
              {studyType === STUDY_TYPES.MEMORIZE ? 'Kies een Surah om te memoriseren' : 
               studyType === STUDY_TYPES.READ ? 'Kies een Surah om te lezen' : 
               'Kies een Surah om te beluisteren'}
            </h2>
            
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              {loadingSurahs ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-emerald-500"></div>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto pr-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {surahs.map(surah => (
                      <button
                        key={surah.number}
                        onClick={() => setSelectedSurah(surah.number)}
                        className={`p-3 rounded-lg border transition-all ${
                          selectedSurah === surah.number 
                            ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-200'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                            selectedSurah === surah.number ? 'bg-emerald-100' : 'bg-gray-100'
                          }`}>
                            <span className={`text-sm font-medium ${
                              selectedSurah === surah.number ? 'text-emerald-700' : 'text-gray-700'
                            }`}>
                              {surah.number}
                            </span>
                          </div>
                          <div className="text-left">
                            <div className={`font-medium ${
                              selectedSurah === surah.number ? 'text-emerald-700' : 'text-gray-700'
                            }`}>
                              {surah.englishName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {surah.name}
                            </div>
                          </div>
                          {selectedSurah === surah.number && (
                            <CheckCircleIcon className="h-5 w-5 text-emerald-500 ml-auto" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );
      
      case 3:
        // Only show this step for memorization
        if (studyType !== STUDY_TYPES.MEMORIZE) {
          return null;
        }
        
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-2xl mx-auto p-6"
          >
            <h2 className="text-2xl font-bold text-center mb-6">
              Personaliseer je memorisatie plan
            </h2>
            
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-800 mb-3">
                  Dagelijkse tijdsbesteding
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {Object.keys(TIME_COMMITMENTS).map(key => (
                    <button
                      key={key}
                      onClick={() => setTimeCommitment(TIME_COMMITMENTS[key])}
                      className={`p-4 rounded-lg border transition-all ${
                        timeCommitment.value === TIME_COMMITMENTS[key].value
                          ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-200'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-lg font-bold text-center mb-1">
                        {TIME_COMMITMENTS[key].label}
                      </div>
                      <div className="text-sm text-gray-500 text-center">
                        ~{TIME_COMMITMENTS[key].pages * 100}% pagina per dag
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">
                  Herhalingsoptie
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 flex items-center border">
                  <div className="flex-1">
                    <div className="font-medium">Herhaling inschakelen</div>
                    <div className="text-sm text-gray-500">
                      Voordat je verdergaat met een nieuwe pagina, herhaal je eerst een eerdere pagina om beter te onthouden.
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input 
                      type="checkbox" 
                      checked={includeRevision} 
                      onChange={e => setIncludeRevision(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        );
      
      default:
        return null;
    }
  };

  const maxSteps = getMaxSteps();
  const isLastStep = setupStep === maxSteps;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Setup steps navigation */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between mb-8">
          <button
            onClick={() => setupStep > 1 ? prevSetupStep() : navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            {setupStep > 1 ? 'Vorige' : 'Terug'}
          </button>
          
          <div className="flex space-x-1">
            {Array.from({ length: maxSteps }, (_, i) => i + 1).map(step => (
              <div 
                key={step} 
                className={`w-8 h-2 rounded-full ${
                  step === setupStep 
                    ? 'bg-emerald-500' 
                    : step < setupStep 
                      ? 'bg-emerald-200' 
                      : 'bg-gray-200'
                }`}
              ></div>
            ))}
          </div>
          
          {!isLastStep ? (
            <button
              onClick={handleNextStep}
              disabled={setupStep === 2 && !selectedSurah}
              className={`flex items-center ${
                setupStep === 2 && !selectedSurah
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-emerald-600 hover:text-emerald-700'
              }`}
            >
              Volgende
              <ArrowRightIcon className="h-5 w-5 ml-1" />
            </button>
          ) : (
            <button
              onClick={handleCreatePlan}
              disabled={loading}
              className={`flex items-center ${
                loading
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-emerald-600 hover:text-emerald-700'
              }`}
            >
              {loading ? 'Bezig...' : studyType === STUDY_TYPES.MEMORIZE ? 'Plan maken' : 'Starten'}
              {!loading && <CheckCircleIcon className="h-5 w-5 ml-1" />}
            </button>
          )}
        </div>
        
        {/* Current step content */}
        {renderStep()}
      </div>
    </div>
  );
};

export default MemorizationSetup; 