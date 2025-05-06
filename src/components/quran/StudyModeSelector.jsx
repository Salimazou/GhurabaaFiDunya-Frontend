import React from 'react';
import { motion } from 'framer-motion';
import { useMemorization } from '../../context/MemorizationContext';
import { 
  BookOpenIcon, 
  MusicalNoteIcon, 
  BookmarkIcon 
} from '@heroicons/react/24/outline';

const StudyModeSelector = () => {
  const { 
    studyType, 
    setStudyType, 
    STUDY_TYPES, 
    nextSetupStep 
  } = useMemorization();

  const handleSelect = (type) => {
    setStudyType(type);
    nextSetupStep();
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 }
    },
  };

  const studyOptions = [
    {
      type: STUDY_TYPES.MEMORIZE,
      title: 'Memoriseren',
      description: 'Memoriseer de Quran met een gepersonaliseerd leerplan',
      icon: BookmarkIcon,
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/30',
      hoverColor: 'hover:bg-emerald-100 dark:hover:bg-emerald-900/50',
      textColor: 'text-emerald-700 dark:text-emerald-300',
      borderColor: 'border-emerald-200 dark:border-emerald-800'
    },
    {
      type: STUDY_TYPES.READ,
      title: 'Lezen',
      description: 'Lees de Quran met vertalingen en tafseers',
      icon: BookOpenIcon,
      bgColor: 'bg-blue-50 dark:bg-blue-900/30',
      hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-900/50',
      textColor: 'text-blue-700 dark:text-blue-300',
      borderColor: 'border-blue-200 dark:border-blue-800'
    },
    {
      type: STUDY_TYPES.LISTEN,
      title: 'Luisteren',
      description: 'Luister naar recitaties van de Quran',
      icon: MusicalNoteIcon,
      bgColor: 'bg-purple-50 dark:bg-purple-900/30',
      hoverColor: 'hover:bg-purple-100 dark:hover:bg-purple-900/50',
      textColor: 'text-purple-700 dark:text-purple-300',
      borderColor: 'border-purple-200 dark:border-purple-800'
    }
  ];

  return (
    <motion.div
      className="mx-auto max-w-4xl px-4 py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h1 className="text-3xl font-bold text-center mb-2 text-gray-800 dark:text-white">
        Quran Studie Platform
      </h1>
      <p className="text-center text-gray-600 dark:text-gray-300 mb-10">
        Kies hoe je met de Quran wilt werken
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {studyOptions.map((option) => (
          <motion.div
            key={option.type}
            variants={itemVariants}
            className={`${option.bgColor} ${option.borderColor} ${option.hoverColor} border rounded-lg shadow-sm transition-all duration-200 cursor-pointer transform hover:scale-105 hover:shadow-md`}
            onClick={() => handleSelect(option.type)}
          >
            <div className="p-6 flex flex-col items-center text-center">
              <div className={`p-4 rounded-full ${option.bgColor} ${option.textColor} mb-4`}>
                <option.icon className="h-10 w-10" />
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${option.textColor}`}>
                {option.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {option.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default StudyModeSelector; 