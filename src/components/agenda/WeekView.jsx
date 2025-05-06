import { useState } from 'react';
import { 
  format, 
  addDays, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  parseISO,
  isToday
} from 'date-fns';
import { nl } from 'date-fns/locale';
import AgendaItem from './AgendaItem';
import { motion } from 'framer-motion';

const WeekView = ({ currentDate, agendaItems = [], onUpdateEvent, onDeleteEvent }) => {
  // Bereken de dagen van de huidige week
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Maandag als eerste dag
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  // Tijdslots voor een dag (24 uur)
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);
  
  // Filter agenda items voor de dagen in deze week
  const getItemsForDay = (day) => {
    return (agendaItems || []).filter(item => 
      item && item.startTime && isSameDay(parseISO(item.startTime), day)
    );
  };
  
  // Functie om te bepalen in welke tijdslot een item valt
  const getItemTimeSlot = (item) => {
    if (!item || !item.startTime) return 0;
    try {
      const startHour = parseISO(item.startTime).getHours();
      return startHour;
    } catch (error) {
      console.error('Error parsing startTime:', error);
      return 0;
    }
  };
  
  // Functie om de duur van een item in uren te berekenen
  const getItemDuration = (item) => {
    if (!item || !item.startTime || !item.endTime) return 1;
    
    try {
      const startTime = parseISO(item.startTime);
      const endTime = parseISO(item.endTime);
      
      // Bereken het verschil in milliseconden en converteer naar uren
      const durationInHours = (endTime - startTime) / (1000 * 60 * 60);
      
      // Rond naar beneden en zorg voor minimum duur van 1 uur
      return Math.max(1, Math.floor(durationInHours));
    } catch (error) {
      console.error('Error calculating duration:', error);
      return 1;
    }
  };
  
  return (
    <div className="h-[calc(100vh-12rem)] overflow-auto">
      <div className="min-h-full relative flex">
        {/* Verticale tijdlijn */}
        <div className="sticky left-0 w-16 bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-10">
          <div className="h-10 border-b border-slate-200 dark:border-slate-700"></div>
          {timeSlots.map(hour => (
            <div 
              key={hour} 
              className="h-24 flex items-start justify-center pt-1 text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700"
            >
              {hour}:00
            </div>
          ))}
        </div>
        
        {/* Week grid */}
        <div className="flex-1 min-w-0 overflow-x-auto">
          {/* Dagen header */}
          <div className="flex border-b border-slate-200 dark:border-slate-700">
            {daysOfWeek.map(day => (
              <div 
                key={day.toString()} 
                className={`flex-1 h-10 min-w-[150px] flex flex-col items-center justify-center text-xs font-medium
                  ${isToday(day) ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' : ''}`}
              >
                <div>{format(day, 'EEEE', { locale: nl })}</div>
                <div className={`mt-0.5 ${isToday(day) ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-500 dark:text-slate-400'}`}>
                  {format(day, 'd MMM', { locale: nl })}
                </div>
              </div>
            ))}
          </div>
          
          {/* Uurvakken */}
          <div className="relative">
            {timeSlots.map(hour => (
              <div key={hour} className="flex h-24 border-b border-slate-200 dark:border-slate-700">
                {/* Uurvakken per dag */}
                {daysOfWeek.map(day => {
                  const dayItems = getItemsForDay(day).filter(item => getItemTimeSlot(item) === hour);
                  
                  return (
                    <div 
                      key={day.toString()} 
                      className={`flex-1 min-w-[150px] relative border-r border-slate-200 dark:border-slate-700
                        ${isToday(day) ? 'bg-emerald-50/30 dark:bg-emerald-900/10' : ''}`}
                    >
                      {/* Huidige tijd indicator */}
                      {new Date().getHours() === hour && isToday(day) && (
                        <div className="absolute left-0 right-0 h-0.5 bg-red-500 z-10">
                          <div className="absolute -left-1 -top-1.5 h-3 w-3 rounded-full bg-red-500" />
                        </div>
                      )}
                      
                      {/* Agenda items */}
                      {dayItems.map(item => (
                        <AgendaItem 
                          key={item.id}
                          item={item}
                          duration={getItemDuration(item)}
                          onUpdate={onUpdateEvent}
                          onDelete={onDeleteEvent}
                          view="week"
                        />
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* "Scroll naar nu" knop */}
      {daysOfWeek.some(day => isToday(day)) && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          className="fixed bottom-24 right-8 bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100 px-4 py-2 rounded-lg shadow-md"
          onClick={() => {
            const currentHour = new Date().getHours();
            const hourElement = document.getElementById(`hour-${currentHour}`);
            if (hourElement) {
              hourElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}
        >
          Scroll naar nu
        </motion.button>
      )}
    </div>
  );
};

export default WeekView; 