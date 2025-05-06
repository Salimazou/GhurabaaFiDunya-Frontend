import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combine and merge Tailwind CSS classes without style conflicts
 * 
 * @param  {...any} inputs - CSS classes to combine
 * @returns {string} - Combined classes string
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
} 