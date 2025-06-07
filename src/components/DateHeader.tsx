
import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface DateHeaderProps {
  selectedDate: Date;
  isExpanded: boolean;
  onToggle: () => void;
}

const DateHeader: React.FC<DateHeaderProps> = ({ selectedDate, isExpanded, onToggle }) => {
  const formatDay = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <button
      onClick={onToggle}
      className="w-full bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h2 className="text-xl font-bold text-gray-800 mb-1">
            {formatDay(selectedDate)}
          </h2>
          <p className="text-gray-600 text-sm">
            {formatDate(selectedDate)}
          </p>
        </div>
        <div className="text-gray-400">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>
    </button>
  );
};

export default DateHeader;
