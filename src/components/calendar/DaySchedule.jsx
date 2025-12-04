import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  MapPin, 
  DollarSign, 
  User, 
  Phone,
  CheckCircle2,
  AlertCircle,
  CloudRain
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const statusColors = {
  lead: 'bg-yellow-100 text-yellow-800',
  quoted: 'bg-orange-100 text-orange-800',
  scheduled: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-slate-100 text-slate-500',
  no_show: 'bg-red-100 text-red-800'
};

export default function DaySchedule({ 
  date, 
  jobs, 
  isBadWeather,
  onJobClick,
  onMarkComplete,
  onMarkNoShow
}) {
  const sortedJobs = [...jobs].sort((a, b) => {
    if (!a.scheduled_start_time) return 1;
    if (!b.scheduled_start_time) return -1;
    return a.scheduled_start_time.localeCompare(b.scheduled_start_time);
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900">
            {format(date, 'EEEE, MMMM d')}
          </h3>
          <p className="text-sm text-slate-500">{jobs.length} jobs scheduled</p>
        </div>
        {isBadWeather && (
          <Badge className="bg-red-100 text-red-800">
            <CloudRain className="w-3 h-3 mr-1" />
            Bad Weather
          </Badge>
        )}
      </div>

      <div className="divide-y divide-slate-100">
        {sortedJobs.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No jobs scheduled for this day</p>
          </div>
        ) : (
          sortedJobs.map(job => (
            <div 
              key={job.id}
              className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
              onClick={() => onJobClick && onJobClick(job)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={statusColors[job.status]}>
                      {job.status.replace('_', ' ')}
                    </Badge>
                    {!job.customer_confirmed && job.status === 'scheduled' && (
                      <Badge variant="outline" className="text-amber-600 border-amber-300">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Unconfirmed
                      </Badge>
                    )}
                  </div>
                  
                  <Link 
                    to={createPageUrl('CustomerDetail') + `?id=${job.customer_id}`}
                    className="font-semibold text-slate-900 hover:text-blue-600"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {job.customer_name}
                  </Link>

                  <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {job.scheduled_start_time} - {job.scheduled_end_time}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-slate-400" />
                      ${job.price_estimate || job.final_price || 0}
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="truncate">{job.customer_address}</span>
                    </div>
                    {job.assigned_tech && (
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4 text-slate-400" />
                        {job.assigned_tech}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {job.status === 'scheduled' && (
                    <>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkComplete(job);
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Complete
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkNoShow(job);
                        }}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        No Show
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}