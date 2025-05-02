import Calendar from 'react-calendar';
import { Dispatch, SetStateAction } from 'react';

interface CalendarSectionProps {
  selectedDate: Date;
  setSelectedDate: Dispatch<SetStateAction<Date>>;
  darkMode: boolean;
}

export default function CalendarSection({ selectedDate, setSelectedDate, darkMode }: CalendarSectionProps) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 transition-all duration-200 hover:shadow-xl">
      <Calendar
        onChange={(value) => value instanceof Date && setSelectedDate(value)}
        value={selectedDate}
        className={`custom-calendar w-full rounded-lg shadow-md ${darkMode ? 'dark-calendar' : ''}`}
        tileClassName={({ date }) => {
          const isToday = new Date().toDateString() === date.toDateString();
          const isSelected = selectedDate.toDateString() === date.toDateString();
          return `
            ${isToday ? 'bg-green-100 dark:bg-green-900' : ''}
            ${isSelected ? 'bg-blue-100 dark:bg-blue-900' : ''}
            hover:bg-gray-100 dark:hover:bg-gray-700
            transition-colors duration-200
            text-sm sm:text-base
            p-1 sm:p-2
          `;
        }}
        navigationLabel={({ date }) => (
          <span className="text-sm sm:text-base font-medium">
            {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
        )}
        prevLabel={<span className="text-sm sm:text-base">←</span>}
        nextLabel={<span className="text-sm sm:text-base">→</span>}
        formatShortWeekday={(locale, date) => {
          return date.toLocaleDateString(locale, { weekday: 'short' }).charAt(0);
        }}
      />
    </div>
  );
} 