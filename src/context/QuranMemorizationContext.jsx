import { createContext, useContext, useState, useEffect } from 'react';

const QuranMemorizationContext = createContext();

export function useQuranMemorization() {
  return useContext(QuranMemorizationContext);
}

export function QuranMemorizationProvider({ children }) {
  const [memorizationPlans, setMemorizationPlans] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [activeMemorizationPlan, setActiveMemorizationPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Sample memorization plans
  const predefinedPlans = [
    {
      id: 'plan-1',
      title: 'Complete Quran in 1 Year',
      description: 'Memorize the entire Quran in 1 year with daily assignments.',
      duration: 365, // days
      dailyPages: 1.5,
      totalPages: 604,
      schedule: generateSchedule(365, 604),
    },
    {
      id: 'plan-2',
      title: 'Juz Amma in 30 Days',
      description: 'Memorize Juz Amma (30th part) in one month.',
      duration: 30, // days
      dailyPages: 0.7,
      totalPages: 20,
      schedule: generateSchedule(30, 20),
    },
    {
      id: 'plan-3',
      title: 'Selected Surahs',
      description: 'Memorize commonly recited surahs over 3 months.',
      duration: 90, // days
      dailyPages: 0.5,
      totalPages: 45,
      schedule: generateSchedule(90, 45),
    },
  ];
  
  // Generate a memorization schedule
  function generateSchedule(days, totalPages) {
    const pagesPerDay = totalPages / days;
    const schedule = [];
    
    for (let day = 1; day <= days; day++) {
      const startPage = Math.ceil((day - 1) * pagesPerDay) + 1;
      const endPage = Math.min(Math.ceil(day * pagesPerDay), totalPages);
      
      const today = new Date();
      const assignmentDate = new Date();
      assignmentDate.setDate(today.getDate() + day - 1);
      
      schedule.push({
        day,
        date: assignmentDate.toISOString(),
        startPage,
        endPage,
        completed: false,
      });
    }
    
    return schedule;
  }
  
  // Load data from localStorage on component mount
  useEffect(() => {
    const loadData = () => {
      try {
        // Load memorization plans
        const savedPlans = localStorage.getItem('memorizationPlans');
        if (savedPlans) {
          setMemorizationPlans(JSON.parse(savedPlans));
        } else {
          // Use predefined plans if no saved plans exist
          setMemorizationPlans(predefinedPlans);
        }
        
        // Load user progress
        const savedProgress = localStorage.getItem('memorizationProgress');
        if (savedProgress) {
          setUserProgress(JSON.parse(savedProgress));
        }
        
        // Load active plan
        const activePlan = localStorage.getItem('activeMemorizationPlan');
        if (activePlan) {
          setActiveMemorizationPlan(JSON.parse(activePlan));
        }
      } catch (error) {
        console.error('Error loading memorization data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Save data to localStorage when it changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('memorizationPlans', JSON.stringify(memorizationPlans));
      localStorage.setItem('memorizationProgress', JSON.stringify(userProgress));
      if (activeMemorizationPlan) {
        localStorage.setItem('activeMemorizationPlan', JSON.stringify(activeMemorizationPlan));
      }
    }
  }, [memorizationPlans, userProgress, activeMemorizationPlan, loading]);
  
  // Start a new memorization plan
  const startPlan = (planId) => {
    const plan = memorizationPlans.find(p => p.id === planId);
    if (!plan) return;
    
    // Create a copy of the plan with today as start date
    const startDate = new Date();
    const updatedSchedule = plan.schedule.map((item, index) => {
      const assignmentDate = new Date(startDate);
      assignmentDate.setDate(startDate.getDate() + index);
      
      return {
        ...item,
        date: assignmentDate.toISOString(),
      };
    });
    
    const activePlan = {
      ...plan,
      startDate: startDate.toISOString(),
      currentDay: 1,
      schedule: updatedSchedule,
    };
    
    setActiveMemorizationPlan(activePlan);
    
    // Initialize progress for this plan
    setUserProgress(prev => ({
      ...prev,
      [planId]: {
        currentDay: 1,
        completedDays: [],
        lastUpdated: new Date().toISOString(),
      }
    }));
  };
  
  // Mark a day as completed
  const markDayCompleted = (planId, day) => {
    // Update user progress
    setUserProgress(prev => {
      const planProgress = prev[planId] || { completedDays: [], currentDay: 1 };
      const completedDays = planProgress.completedDays.includes(day)
        ? planProgress.completedDays
        : [...planProgress.completedDays, day];
      
      return {
        ...prev,
        [planId]: {
          ...planProgress,
          completedDays,
          currentDay: Math.max(planProgress.currentDay, day + 1),
          lastUpdated: new Date().toISOString(),
        }
      };
    });
    
    // Update active plan if this is the active plan
    if (activeMemorizationPlan && activeMemorizationPlan.id === planId) {
      setActiveMemorizationPlan(prev => {
        const updatedSchedule = prev.schedule.map(item => 
          item.day === day ? { ...item, completed: true } : item
        );
        
        return {
          ...prev,
          currentDay: Math.max(prev.currentDay, day + 1),
          schedule: updatedSchedule,
        };
      });
    }
  };
  
  // Create a custom memorization plan
  const createCustomPlan = (planData) => {
    const { title, description, duration, totalPages } = planData;
    
    const newPlan = {
      id: `plan-custom-${Date.now()}`,
      title,
      description,
      duration,
      dailyPages: totalPages / duration,
      totalPages,
      schedule: generateSchedule(duration, totalPages),
    };
    
    setMemorizationPlans(prev => [...prev, newPlan]);
    return newPlan.id;
  };
  
  // Get today's assignment from active plan
  const getTodayAssignment = () => {
    if (!activeMemorizationPlan) return null;
    
    const today = new Date().toISOString().split('T')[0];
    const assignment = activeMemorizationPlan.schedule.find(item => 
      new Date(item.date).toISOString().split('T')[0] === today
    );
    
    return assignment;
  };
  
  // Get all assignments as agenda items
  const getMemorizationAgendaItems = () => {
    if (!activeMemorizationPlan) return [];
    
    return activeMemorizationPlan.schedule.map(assignment => {
      const date = new Date(assignment.date);
      
      // Create start and end times (default to 9 AM, 1 hour duration)
      const startTime = new Date(date);
      startTime.setHours(9, 0, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 1);
      
      return {
        id: `memorization-${activeMemorizationPlan.id}-day-${assignment.day}`,
        title: `Quran Memorization: Pages ${assignment.startPage}-${assignment.endPage}`,
        description: `${activeMemorizationPlan.title} - Day ${assignment.day}`,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        category: 'quran',
        isReadOnly: false,
        completed: assignment.completed,
      };
    });
  };
  
  const value = {
    memorizationPlans,
    activeMemorizationPlan,
    userProgress,
    loading,
    startPlan,
    markDayCompleted,
    createCustomPlan,
    getTodayAssignment,
    getMemorizationAgendaItems,
  };
  
  return (
    <QuranMemorizationContext.Provider value={value}>
      {children}
    </QuranMemorizationContext.Provider>
  );
}

export default QuranMemorizationProvider; 