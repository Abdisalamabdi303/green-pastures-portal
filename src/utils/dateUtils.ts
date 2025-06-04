import { isSameDay as dateFnsIsSameDay } from 'date-fns';

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return dateFnsIsSameDay(date1, date2);
}; 