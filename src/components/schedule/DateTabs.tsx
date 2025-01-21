import React from 'react';

interface DateTabsProps {
  dates: string[];
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
}

function DateTabs({ dates, selectedDate, onDateSelect }: DateTabsProps) {
  return (
    <div className="mb-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {dates.map((date) => (
            <button
              key={date}
              onClick={() => onDateSelect(date)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${selectedDate === date
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {date}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

export default DateTabs;