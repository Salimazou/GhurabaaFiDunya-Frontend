import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../auth/AuthContext';
import { todoAPI } from '../../services/api';
import { toast, Toaster } from 'react-hot-toast';
import Sidebar from './Sidebar';
import QuranPlanner from './QuranPlanner';
import EnhancedTodoList from './EnhancedTodoList';
import QuranContent from '../quran/QuranContent';

const arabicPatternBg = {
  backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'80\' height=\'80\' viewBox=\'0 0 80 80\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23166534\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M0 0h40v40H0V0zm40 40h40v40H40V40zm0-40h2l-2 2V0zm0 4l4-4h2l-6 6V4zm0 4l8-8h2L40 10V8zm0 4L52 0h2L40 14v-2zm0 4L56 0h2L40 18v-2zm0 4L60 0h2L40 22v-2zm0 4L64 0h2L40 26v-2zm0 4L68 0h2L40 30v-2zm0 4L72 0h2L40 34v-2zm0 4L76 0h2L40 38v-2zm0 4L80 0v2L42 40h-2zm4 0L80 4v2L46 40h-2zm4 0L80 8v2L50 40h-2zm4 0l28-28v2L54 40h-2zm4 0l24-24v2L58 40h-2zm4 0l20-20v2L62 40h-2zm4 0l16-16v2L66 40h-2zm4 0l12-12v2L70 40h-2zm4 0l8-8v2l-6 6h-2zm4 0l4-4v2l-2 2h-2z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [activeContent, setActiveContent] = useState('Dashboard');

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
    <div style={arabicPatternBg} className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <Sidebar user={user} onLogout={logout} onNavigate={handleNavigation} />
        
        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="pt-12 md:pt-0" // Add padding-top on mobile for the hamburger menu
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
                  <div className="bg-emerald-700 text-white p-4">
                    <h2 className="text-lg font-bold">Gebedstijden</h2>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium">Fajr</span>
                      <span className="text-gray-600">05:34</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium">Dhuhr</span>
                      <span className="text-gray-600">13:15</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium">Asr</span>
                      <span className="text-gray-600">16:45</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium">Maghrib</span>
                      <span className="text-gray-600">19:53</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="font-medium">Isha</span>
                      <span className="text-gray-600">21:23</span>
                    </div>
                  </div>
                </section>
                
                {/* Islamic quote of the day */}
                <section className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="bg-amber-600 text-white p-4">
                    <h2 className="text-lg font-bold">Koran Wijsheid</h2>
                  </div>
                  <div className="p-4">
                    <blockquote className="italic text-gray-600 border-l-4 border-amber-500 pl-4 py-2">
                      "Voorwaar, met de ontberingen komt de verlichting. Voorwaar, met de ontberingen komt de verlichting."
                    </blockquote>
                    <p className="text-right text-sm text-gray-500 mt-2">— Surah Ash-Sharh (94:5-6)</p>
                  </div>
                </section>
                
                {/* Islamic calendar */}
                <section className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="bg-indigo-600 text-white p-4">
                    <h2 className="text-lg font-bold">Islamitische Kalender</h2>
                  </div>
                  <div className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-indigo-700">12 Ramadan</p>
                      <p className="text-gray-600">1445 AH</p>
                    </div>
                    <p className="mt-3 text-sm text-gray-600">
                      Nog 18 dagen tot Eid al-Fitr
                    </p>
                  </div>
                </section>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
} 