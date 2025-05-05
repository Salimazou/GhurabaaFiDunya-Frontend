import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../auth/AuthContext';
import { todoAPI } from '../../services/api';
import { toast, Toaster } from 'react-hot-toast';
import { MoonIcon } from '@heroicons/react/24/outline';
import Sidebar from './Sidebar';
import QuranPlanner from './QuranPlanner';
import EnhancedTodoList from './EnhancedTodoList';
import QuranContent from '../quran/QuranContent';

// Subtle Islamic pattern background with lower opacity
const subtleIslamicPattern = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23166534' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
  backgroundSize: '60px 60px',
  backgroundAttachment: 'fixed'
};

// Soft gradient overlay
const gradientOverlay = {
  background: 'linear-gradient(135deg, rgba(240,250,245,0.97) 0%, rgba(245,245,250,0.93) 100%)'
};

// Add this constant with Quran quotes near the top of your file
const QURAN_QUOTES = [
  {
    text: "Voorwaar, met de ontberingen komt de verlichting. Voorwaar, met de ontberingen komt de verlichting.",
    source: "Surah Ash-Sharh (94:5-6)"
  },
  {
    text: "En Hij is met jullie waar jullie ook zijn. En Allah is Alziend over wat jullie doen.",
    source: "Surah Al-Hadid (57:4)"
  },
  {
    text: "Allah belast geen ziel boven haar vermogen.",
    source: "Surah Al-Baqarah (2:286)"
  },
  {
    text: "En voorwaar, de herinnering aan Allah is het grootste.",
    source: "Surah Al-Ankabut (29:45)"
  },
  {
    text: "Voorwaar, degenen die geloven en goede daden verrichten, voor hen zijn er Tuinen van gelukzaligheid.",
    source: "Surah Luqman (31:8)"
  }
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [activeContent, setActiveContent] = useState('Dashboard');
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  // Set the appropriate greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    let newGreeting = '';
    
    if (hour >= 5 && hour < 12) {
      newGreeting = 'Goedemorgen';
    } else if (hour >= 12 && hour < 18) {
      newGreeting = 'Goedemiddag';
    } else {
      newGreeting = 'Goedenavond';
    }
    
    setGreeting(newGreeting);
  }, []);

  // Load todos when the component mounts
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        if (user?.id) {
          const data = await todoAPI.getUserTodos(user.id);
          setTodos(data);
        }
      } catch (error) {
        toast.error('Kon taken niet laden');
        console.error('Error fetching todos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, [user]);

  // Add this effect in the Dashboard component
  useEffect(() => {
    // Rotate the quote every 12 seconds
    const quoteInterval = setInterval(() => {
      setCurrentQuoteIndex(prev => (prev + 1) % QURAN_QUOTES.length);
    }, 12000);
    
    return () => clearInterval(quoteInterval);
  }, []);

  const handleAddTodo = async (newTodo) => {
    try {
      const todoWithUserId = {
        ...newTodo,
        userId: user.id
      };
      
      const addedTodo = await todoAPI.createTodo(todoWithUserId);
      setTodos(prev => [...prev, addedTodo]);
      toast.success('Taak succesvol toegevoegd');
    } catch (error) {
      toast.error('Kon taak niet toevoegen');
      console.error('Error adding todo:', error);
    }
  };

  const handleUpdateTodo = async (id, updatedTodo) => {
    try {
      const result = await todoAPI.updateTodo(id, updatedTodo);
      setTodos(prev => prev.map(todo => todo.id === id ? result : todo));
      toast.success('Taak bijgewerkt');
    } catch (error) {
      toast.error('Kon taak niet bijwerken');
      console.error('Error updating todo:', error);
    }
  };

  const handleCompleteTodo = async (id) => {
    try {
      const result = await todoAPI.completeTodo(id);
      setTodos(prev => prev.map(todo => todo.id === id ? result : todo));
      toast.success('Taak gemarkeerd als voltooid');
    } catch (error) {
      toast.error('Kon taak niet voltooien');
      console.error('Error completing todo:', error);
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await todoAPI.deleteTodo(id);
      setTodos(prev => prev.filter(todo => todo.id !== id));
      toast.success('Taak verwijderd');
    } catch (error) {
      toast.error('Kon taak niet verwijderen');
      console.error('Error deleting todo:', error);
    }
  };

  // Handle navigation item change from sidebar
  const handleNavigation = (item) => {
    setActiveContent(item);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>U moet ingelogd zijn om deze pagina te bekijken.</p>
      </div>
    );
  }

  return (
    <div style={{...subtleIslamicPattern}} className="min-h-screen bg-slate-50">
      <div style={{...gradientOverlay}} className="min-h-screen">
        <Toaster position="top-right" />
        
        {/* Sticky header with date and moon icon */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm shadow-sm py-2 px-4 md:hidden">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600 font-medium">{new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            <MoonIcon className="h-4 w-4 text-amber-500" />
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <Sidebar user={user} onLogout={logout} onNavigate={handleNavigation} />
          
          {/* Main content */}
          <main className="flex-1 p-4 md:p-6 pb-24 md:pb-16">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="pt-12 md:pt-0 max-w-4xl mx-auto" // Center content and add max width
            >
              <header className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {greeting}, {user.firstName || user.username}
                </h1>
                <p className="text-gray-600 mt-1">
                  Hier is uw overzicht voor vandaag
                </p>
              </header>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Main content area - takes 2/3 on large screens */}
                <div className="xl:col-span-2 space-y-6">
                  {activeContent === 'Dashboard' && (
                    <>
                      {/* Quran Planner */}
                      <section>
                        <QuranPlanner />
                      </section>
                      
                      {/* Todo list */}
                      <section>
                        {loading ? (
                          <div className="flex justify-center p-8 bg-white rounded-xl shadow-sm">
                            <svg className="animate-spin h-8 w-8 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </div>
                        ) : (
                          <EnhancedTodoList 
                            todos={todos}
                            onUpdateTodo={handleUpdateTodo}
                            onCompleteTodo={handleCompleteTodo}
                            onDeleteTodo={handleDeleteTodo}
                            onAddTodo={handleAddTodo}
                          />
                        )}
                      </section>
                    </>
                  )}
                  
                  {activeContent === 'Koran' && (
                    <QuranContent />
                  )}
                  
                  {/* Add other content views here for Taken, Agenda, etc. */}
                </div>
                
                {/* Right sidebar */}
                <div className="space-y-6">
                  {/* Islamic prayer times */}
                  <section className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-emerald-100 text-emerald-700 p-4">
                      <h2 className="text-lg font-bold flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                        </svg>
                        Gebedstijden
                      </h2>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <span className="flex items-center">
                          <span className="w-2 h-2 bg-amber-400 rounded-full mr-2"></span>
                          <span className="font-medium text-slate-700">Fajr</span>
                        </span>
                        <span className="text-slate-600 font-medium">05:34</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <span className="flex items-center">
                          <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                          <span className="font-medium text-slate-700">Dhuhr</span>
                        </span>
                        <span className="text-slate-600 font-medium">13:15</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <span className="flex items-center">
                          <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></span>
                          <span className="font-medium text-slate-700">Asr</span>
                        </span>
                        <span className="text-slate-600 font-medium">16:45</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <span className="flex items-center">
                          <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                          <span className="font-medium text-slate-700">Maghrib</span>
                        </span>
                        <span className="text-slate-600 font-medium">19:53</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="flex items-center">
                          <span className="w-2 h-2 bg-indigo-400 rounded-full mr-2"></span>
                          <span className="font-medium text-slate-700">Isha</span>
                        </span>
                        <span className="text-slate-600 font-medium">21:23</span>
                      </div>
                    </div>
                  </section>
                  
                  {/* Islamic quote of the day */}
                  <section className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-amber-100 text-amber-700 p-4">
                      <h2 className="text-lg font-bold flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        Koran Wijsheid
                      </h2>
                    </div>
                    <div className="p-4 h-32 flex flex-col justify-between">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentQuoteIndex}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.6 }}
                          className="flex-1 flex flex-col"
                        >
                          <blockquote className="italic text-slate-600 border-l-4 border-amber-300 pl-4 py-2 flex-1">
                            "{QURAN_QUOTES[currentQuoteIndex].text}"
                          </blockquote>
                          <p className="text-right text-sm text-slate-500 mt-2">
                            — {QURAN_QUOTES[currentQuoteIndex].source}
                          </p>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </section>
                  
                  {/* Islamic calendar */}
                  <section className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-slate-100 text-slate-700 p-4">
                      <h2 className="text-lg font-bold flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Islamitische Kalender
                      </h2>
                    </div>
                    <div className="p-4 relative">
                      {/* Decorative crescent moon */}
                      <div className="absolute top-4 right-4 w-12 h-12 text-slate-100 opacity-50">
                        <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2a9 9 0 0 1 9 9c0 4.97-4.03 9-9 9a9 9 0 0 1 0-18zm0 2a7 7 0 0 0 0 14 7 7 0 0 0 0-14z"/>
                        </svg>
                      </div>
                      
                      <div className="text-center pt-2 pb-4">
                        <p className="text-2xl font-bold text-slate-700">12 Ramadan</p>
                        <p className="text-slate-500">1445 AH</p>
                      </div>
                      
                      <div className="mt-3 bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                        <p className="text-sm text-slate-600">
                          <span className="font-medium text-amber-600">18</span> dagen tot Eid al-Fitr
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
} 