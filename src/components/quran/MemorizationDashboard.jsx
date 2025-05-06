import React from 'react';
import { motion } from 'framer-motion';
import { useMemorization } from '../../context/MemorizationContext';
import { 
  BookOpenIcon, 
  CalendarIcon, 
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon } from '@heroicons/react/24/solid';

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('nl-NL', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
};

// Error Boundary Component
class MemorizationErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error in Memorization component:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Er is een fout opgetreden</h2>
            <p className="text-gray-600 mb-6">
              Probeer de pagina te vernieuwen of neem contact op met de beheerder.
            </p>
            <button 
              className="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
              onClick={() => window.location.reload()}
            >
              Vernieuwen
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const MemorizationDashboard = () => {
  const memorizationContext = useMemorization();
  
  // Check if context is undefined
  if (!memorizationContext) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="text-center">
          <BookmarkIcon className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Memorisatie context niet gevonden</h2>
          <p className="text-gray-600 mb-6">
            Zorg ervoor dat je de applicatie in de juiste context gebruikt.
          </p>
          <button 
            className="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
            onClick={() => window.location.reload()}
          >
            Vernieuwen
          </button>
        </div>
      </div>
    );
  }
  
  const { 
    currentPlan,
    todaysAssignment,
    loading,
    updateProgress,
    resetPlan,
    setupComplete
  } = memorizationContext;

  // If still loading, show loading spinner
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-emerald-500"></div>
      </div>
    );
  }

  // If no plan exists yet
  if (!setupComplete || !currentPlan) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="text-center">
          <BookmarkIcon className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Geen memorisatieplan actief</h2>
          <p className="text-gray-600 mb-6">
            Maak een nieuw memorisatieplan om te beginnen met het memoriseren van de Quran.
          </p>
          <button 
            className="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
            onClick={() => window.location.href = '/quran/memorize'}
          >
            Plan opstellen
          </button>
        </div>
      </div>
    );
  }

  // Safely destructure currentPlan
  const surahDetails = currentPlan?.surahDetails || {};
  const startDate = currentPlan?.startDate;
  const completionDate = currentPlan?.completionDate;
  const pageBreakdown = currentPlan?.pageBreakdown || [];
  const progress = currentPlan?.progress || { memorized: [], revised: [] };
  const timeCommitment = currentPlan?.timeCommitment || { value: 0 };

  // Handle marking current page as memorized
  const handleMarkMemorized = () => {
    updateProgress('memorize');
  };

  // Handle marking page as revised
  const handleMarkRevised = (pageNumber) => {
    updateProgress('revise', pageNumber);
  };

  // Calculate general progress
  const overallProgress = todaysAssignment?.progress?.percentage || 0;
  
  // Calculate statistics
  const totalPages = pageBreakdown.length;
  const completedPages = pageBreakdown.filter(page => page.completed).length;
  const revisedPages = pageBreakdown.filter(page => page.revised).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="bg-emerald-50 border-b border-emerald-100 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-emerald-800">
            Quran Memorisatie
          </h2>
          <button 
            onClick={resetPlan}
            className="text-sm px-3 py-1 bg-white border border-red-200 text-red-600 rounded hover:bg-red-50 transition-colors"
            title="Reset Plan"
          >
            <span className="hidden sm:inline">Reset</span> Plan
          </button>
        </div>
        <p className="text-emerald-600 mt-1">
          Surah {surahDetails?.name} ({surahDetails?.englishName})
        </p>
      </div>

      {/* Progress Overview */}
      <div className="p-6 border-b border-gray-100">
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Voortgang</span>
            <span className="text-sm font-medium text-emerald-600">{overallProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-emerald-600 h-2.5 rounded-full" 
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-gray-400 text-xs mb-1">Start Datum</div>
            <div className="font-medium">{formatDate(startDate)}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-gray-400 text-xs mb-1">Voltooiingsdatum</div>
            <div className="font-medium">{formatDate(completionDate)}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-gray-400 text-xs mb-1">Pagina's voltooid</div>
            <div className="font-medium">{completedPages} / {totalPages}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-gray-400 text-xs mb-1">Pagina's herhaald</div>
            <div className="font-medium">{revisedPages} / {completedPages}</div>
          </div>
        </div>
      </div>

      {/* Today's Assignment */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Vandaag te memoriseren
        </h3>

        {todaysAssignment?.completed ? (
          <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-center">
            <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <p className="text-green-700 font-medium">{todaysAssignment.message}</p>
          </div>
        ) : todaysAssignment?.revisionNeeded ? (
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
            <h4 className="font-medium text-amber-800 mb-2">Eerst herhalen:</h4>
            <div className="border border-amber-200 rounded-lg p-4 mb-4 bg-white">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">
                  Pagina {todaysAssignment.revisionPage.pageNumber}
                </span>
                <span className="text-amber-600 text-sm">
                  {todaysAssignment.revisionPage.startSurah}:{todaysAssignment.revisionPage.startAyah} - 
                  {todaysAssignment.revisionPage.endSurah}:{todaysAssignment.revisionPage.endAyah}
                </span>
              </div>
              <button
                onClick={() => handleMarkRevised(todaysAssignment.revisionPage.pageNumber)}
                className="w-full mt-2 py-2 bg-amber-100 text-amber-700 rounded-md hover:bg-amber-200 transition-colors"
              >
                Markeer als herhaald
              </button>
            </div>
            <p className="text-gray-600 text-sm">
              Na het herhalen kun je verdergaan met de volgende pagina om te memoriseren.
            </p>
          </div>
        ) : (
          <div>
            {todaysAssignment?.currentPage && (
              <div className="border border-emerald-100 rounded-lg p-4 bg-emerald-50">
                <div className="flex justify-between mb-4">
                  <div>
                    <span className="text-emerald-700 font-medium">
                      Pagina {todaysAssignment.currentPage.pageNumber}
                    </span>
                    <div className="text-gray-600 text-sm mt-1">
                      <span className="inline-flex items-center">
                        <BookOpenIcon className="h-4 w-4 mr-1" />
                        Surah {todaysAssignment.currentPage.startSurah}:{todaysAssignment.currentPage.startAyah} - 
                        {todaysAssignment.currentPage.endSurah}:{todaysAssignment.currentPage.endAyah}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="inline-flex items-center text-gray-500 text-sm">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      ~{timeCommitment.value} min
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleMarkMemorized}
                  className="w-full py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                >
                  Markeer als gememoriseerd
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="p-6 border-t border-gray-100 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">
          Recente activiteit
        </h3>
        
        {progress.memorized.length > 0 || progress.revised.length > 0 ? (
          <div className="space-y-3">
            {progress.memorized.slice(-3).reverse().map((item, index) => (
              <div key={`memorized-${index}`} className="flex items-center text-sm">
                <BookmarkIcon className="h-4 w-4 text-emerald-500 mr-2" />
                <span className="text-gray-700">
                  Pagina {item.pageNumber} gememoriseerd
                </span>
                <span className="ml-auto text-gray-500 text-xs">
                  {new Date(item.dateCompleted).toLocaleDateString()}
                </span>
              </div>
            ))}
            
            {progress.revised.slice(-3).reverse().map((item, index) => (
              <div key={`revised-${index}`} className="flex items-center text-sm">
                <ArrowPathIcon className="h-4 w-4 text-amber-500 mr-2" />
                <span className="text-gray-700">
                  Pagina {item.pageNumber} herhaald
                </span>
                <span className="ml-auto text-gray-500 text-xs">
                  {new Date(item.dateRevised).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm italic">Nog geen activiteit geregistreerd.</p>
        )}
      </div>
    </motion.div>
  );
};

// Wrap the component with the error boundary
const MemorizationDashboardWithErrorBoundary = () => (
  <MemorizationErrorBoundary>
    <MemorizationDashboard />
  </MemorizationErrorBoundary>
);

export default MemorizationDashboardWithErrorBoundary; 