
import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface WeekViewProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onWeekChange: (direction: 'prev' | 'next') => void;
}

const WeekView: React.FC<WeekViewProps> = ({ selectedDate, onDateSelect, onWeekChange }) => {
  const getWeekDays = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day; // First day is Sunday
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const weekDays = getWeekDays(selectedDate);
  const today = new Date();

  const formatDay = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  return (
    <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onWeekChange('prev')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="font-medium text-gray-800">
          {weekDays[0].toLocaleDateString('en-US', { month: 'short' })} {weekDays[0].getDate()} - {weekDays[6].toLocaleDateString('en-US', { month: 'short' })} {weekDays[6].getDate()}
        </span>
        <button
          onClick={() => onWeekChange('next')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((date, index) => (
          <button
            key={index}
            onClick={() => onDateSelect(date)}
            className={`flex flex-col items-center p-3 rounded-xl transition-all duration-200 ${
              isSelected(date)
                ? 'bg-blue-600 text-white'
                : isToday(date)
                ? 'bg-blue-100 text-blue-600'
                : 'hover:bg-gray-100'
            }`}
          >
            <span className="text-xs font-medium mb-1">
              {formatDay(date)}
            </span>
            <span className="text-lg font-semibold">
              {date.getDate()}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WeekView;
