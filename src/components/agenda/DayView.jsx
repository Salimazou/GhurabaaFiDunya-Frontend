import { useState, useEffect } from 'react';
import { format, addHours, isSameDay, parseISO } from 'date-fns';
import { nl } from 'date-fns/locale';
import AgendaItem from './AgendaItem';
import { motion } from 'framer-motion';

const DayView = ({ currentDate, agendaItems = [], onUpdateEvent, onDeleteEvent }) => {
  // Genereer tijdslots voor een volledige dag (24 uur)
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);
  
  // Filter agenda items voor de huidige dag
  const itemsForDay = (agendaItems || []).filter(item => 
    item && item.startTime && isSameDay(parseISO(item.startTime), currentDate)
  );
  
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
    <div className="h-[calc(100vh-12rem)] overflow-y-auto">
      <div className="min-h-full relative">
        {/* Verticale tijdlijn */}
        <div className="absolute top-0 left-0 bottom-0 w-16 bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
          {timeSlots.map(hour => (
            <div 
              key={hour} 
              className="h-24 flex items-start justify-center pt-1 text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700"
            >
              {hour}:00
            </div>
          ))}
        </div>
        
        {/* Horizontale lijnen voor de uren */}
        <div className="ml-16">
          {timeSlots.map(hour => (
            <div 
              key={hour} 
              className="h-24 border-b border-slate-200 dark:border-slate-700 relative"
            >
              {/* Huidige tijd indicator */}
              {new Date().getHours() === hour && isSameDay(currentDate, new Date()) && (
                <div className="absolute left-0 right-0 h-0.5 bg-red-500 z-10">
                  <div className="absolute -left-1 -top-1.5 h-3 w-3 rounded-full bg-red-500" />
                </div>
              )}
              
              {/* Agenda items in dit tijdslot */}
              <div className="relative h-full">
                {itemsForDay
                  .filter(item => getItemTimeSlot(item) === hour)
                  .map(item => (
                    <AgendaItem 
                      key={item.id}
                      item={item}
                      duration={getItemDuration(item)}
                      onUpdate={onUpdateEvent}
                      onDelete={onDeleteEvent}
                      view="day"
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* "Geen items" indicator als er geen afspraken zijn */}
        {itemsForDay.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-0 flex items-center justify-center ml-16"
          >
            <div className="text-center p-8 max-w-md">
              <p className="text-slate-500 dark:text-slate-400 text-lg italic">
                Vandaag is open — een mooi moment om iets spiritueels toe te voegen 🌙
              </p>
            </div>
          </motion.div>
        )}
        
        {/* "Scroll naar nu" knop */}
        {isSameDay(currentDate, new Date()) && (
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
    </div>
  );
};

export default DayView; 