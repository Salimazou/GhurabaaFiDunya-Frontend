import { useState, useEffect } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  parseISO,
  isToday,
  getDay,
  addDays,
  subDays
} from 'date-fns';
import { nl } from 'date-fns/locale';
import { motion } from 'framer-motion';

const MonthView = ({ 
  currentDate, 
  agendaItems = [], 
  onUpdateEvent, 
  onDeleteEvent,
  onViewChange 
}) => {
  // Calculate dates for the month grid
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Calculate days from previous and next month to fill the grid
  const startWeekday = getDay(monthStart) || 7; // Convert Sunday (0) to 7
  const daysFromPrevMonth = startWeekday > 1 ? startWeekday - 1 : 0;
  
  const prevMonthDays = Array.from({ length: daysFromPrevMonth }, (_, i) => 
    subDays(monthStart, daysFromPrevMonth - i)
  );
  
  // Calculate how many days we need from next month (to make sure we have complete weeks)
  const totalDaysDisplayed = Math.ceil((monthDays.length + daysFromPrevMonth) / 7) * 7;
  const daysFromNextMonth = totalDaysDisplayed - (monthDays.length + daysFromPrevMonth);
  
  const nextMonthDays = Array.from({ length: daysFromNextMonth }, (_, i) => 
    addDays(monthEnd, i + 1)
  );
  
  // Combine all days
  const allDays = [...prevMonthDays, ...monthDays, ...nextMonthDays];
  
  // Group days into weeks for easier rendering
  const weeks = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }
  
  // Get events for a specific day
  const getEventsForDay = (day) => {
    try {
      return (agendaItems || []).filter(item => 
        item && item.startTime && isSameDay(parseISO(item.startTime), day)
      );
    } catch (error) {
      console.error('Error getting events for day:', error);
      return [];
    }
  };
  
  // Determine if a day has events
  const dayHasEvents = (day) => {
    return getEventsForDay(day).length > 0;
  };
  
  // Group events by category for a day
  const getEventCategories = (day) => {
    try {
      const events = getEventsForDay(day);
      return [...new Set(events.map(event => event.category || 'other'))];
    } catch (error) {
      console.error('Error getting event categories:', error);
      return [];
    }
  };
  
  // Handle day click - switch to day view
  const handleDayClick = (day) => {
    onViewChange(day);
  };
  
  return (
    <div className="h-[calc(100vh-12rem)] overflow-auto p-4">
      <div className="max-w-4xl mx-auto">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2 text-center">
          {['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'].map((day, index) => (
            <div key={index} className="py-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {weeks.flat().map((day, index) => {
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isCurrent = isToday(day);
            const eventCategories = getEventCategories(day);
            
            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  aspect-square p-1 rounded-lg cursor-pointer
                  ${isCurrentMonth 
                    ? 'bg-white dark:bg-slate-800' 
                    : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500'
                  }
                  ${isCurrent 
                    ? 'ring-2 ring-emerald-500 dark:ring-emerald-400' 
                    : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                  }
                `}
                onClick={() => handleDayClick(day)}
              >
                <div className="h-full flex flex-col">
                  <div className={`
                    text-right p-1 text-sm font-medium
                    ${isCurrent ? 'text-emerald-600 dark:text-emerald-400' : ''}
                  `}>
                    {format(day, 'd')}
                  </div>
                  
                  {/* Event indicators */}
                  <div className="flex-1 flex items-end justify-center">
                    <div className="flex space-x-1 mb-1">
                      {eventCategories.map(category => {
                        let dotColor = '';
                        switch(category) {
                          case 'quran':
                            dotColor = 'bg-emerald-500 dark:bg-emerald-400';
                            break;
                          case 'prayer':
                            dotColor = 'bg-blue-500 dark:bg-blue-400';
                            break;
                          case 'meeting':
                            dotColor = 'bg-purple-500 dark:bg-purple-400';
                            break;
                          case 'reminder':
                            dotColor = 'bg-amber-500 dark:bg-amber-400';
                            break;
                          default:
                            dotColor = 'bg-slate-500 dark:bg-slate-400';
                        }
                        
                        return (
                          <div 
                            key={category} 
                            className={`h-2 w-2 rounded-full ${dotColor}`}
                            title={category}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="mt-6 flex items-center justify-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 mr-2"></div>
            <span>Quran</span>
          </div>
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-400 mr-2"></div>
            <span>Prayer</span>
          </div>
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-purple-500 dark:bg-purple-400 mr-2"></div>
            <span>Meeting</span>
          </div>
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-amber-500 dark:bg-amber-400 mr-2"></div>
            <span>Reminder</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthView; 