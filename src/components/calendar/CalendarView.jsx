import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CloudRain } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const statusColors = {
  lead: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  quoted: 'bg-orange-100 text-orange-800 border-orange-200',
  scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
  no_show: 'bg-red-100 text-red-800 border-red-200'
};

export default function CalendarView({ 
  jobs, 
  badWeatherDays = [],
  onJobClick, 
  onDateClick,
  selectedDate,
  view = 'month'
}) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getJobsForDay = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return jobs.filter(job => job.scheduled_date === dateStr);
  };

  const isBadWeatherDay = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return badWeatherDays.some(bwd => bwd.date === dateStr);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentDate(subMonths(currentDate, 1))}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-lg font-semibold text-slate-900">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentDate(addMonths(currentDate, 1))}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Days header */}
      <div className="grid grid-cols-7 border-b border-slate-100">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          const dayJobs = getJobsForDay(day);
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isBadWeather = isBadWeatherDay(day);

          return (
            <div
              key={idx}
              onClick={() => onDateClick && onDateClick(day)}
              className={`min-h-[100px] p-2 border-b border-r border-slate-100 cursor-pointer transition-all hover:bg-slate-50 ${
                !isCurrentMonth ? 'bg-slate-50/50' : ''
              } ${isSelected ? 'bg-blue-50 ring-2 ring-inset ring-blue-500' : ''} ${
                isBadWeather ? 'bg-red-50/50' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-medium ${
                  isToday 
                    ? 'bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center' 
                    : isCurrentMonth ? 'text-slate-900' : 'text-slate-400'
                }`}>
                  {format(day, 'd')}
                </span>
                {isBadWeather && (
                  <CloudRain className="w-4 h-4 text-red-500" />
                )}
              </div>
              <div className="space-y-1">
                {dayJobs.slice(0, 3).map(job => (
                  <div
                    key={job.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onJobClick && onJobClick(job);
                    }}
                    className={`text-xs p-1.5 rounded truncate border cursor-pointer hover:opacity-80 transition-opacity ${statusColors[job.status]}`}
                  >
                    <span className="font-medium">{job.scheduled_start_time}</span>
                    <span className="ml-1">{job.customer_name}</span>
                  </div>
                ))}
                {dayJobs.length > 3 && (
                  <div className="text-xs text-slate-500 pl-1">
                    +{dayJobs.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}