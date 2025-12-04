import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  MapPin, 
  User,
  ChevronRight,
  Phone,
  MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const statusConfig = {
  lead: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Lead' },
  quoted: { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Quoted' },
  scheduled: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Scheduled' },
  completed: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Completed' },
  cancelled: { color: 'bg-slate-100 text-slate-500 border-slate-200', label: 'Cancelled' },
  no_show: { color: 'bg-red-100 text-red-800 border-red-200', label: 'No Show' }
};

const serviceLabels = {
  inside_windows: 'Inside Windows',
  outside_windows: 'Outside Windows',
  gutters: 'Gutters',
  screens: 'Screens',
  other: 'Other'
};

export default function JobCard({ job, onQuickAction, compact = false }) {
  const status = statusConfig[job.status] || statusConfig.lead;

  if (compact) {
    return (
      <Card className="p-3 hover:shadow-md transition-shadow cursor-pointer">
        <Link to={createPageUrl('JobDetail') + `?id=${job.id}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className={`${status.color} border`}>{status.label}</Badge>
              <span className="font-medium text-slate-900">{job.customer_name}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </div>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <Badge className={`${status.color} border mb-2`}>{status.label}</Badge>
            <Link 
              to={createPageUrl('CustomerDetail') + `?id=${job.customer_id}`}
              className="block"
            >
              <h3 className="text-lg font-semibold text-slate-900 hover:text-blue-600 transition-colors">
                {job.customer_name}
              </h3>
            </Link>
          </div>
          <Link to={createPageUrl('JobDetail') + `?id=${job.id}`}>
            <Button variant="ghost" size="icon">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        {job.service_type && job.service_type.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {job.service_type.map(service => (
              <Badge key={service} variant="outline" className="text-xs">
                {serviceLabels[service] || service}
              </Badge>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm">
          {job.scheduled_date && (
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400" />
              {format(new Date(job.scheduled_date), 'MMM d, yyyy')}
            </div>
          )}
          {job.scheduled_start_time && (
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="w-4 h-4 text-slate-400" />
              {job.scheduled_start_time} - {job.scheduled_end_time}
            </div>
          )}
          {(job.price_estimate || job.final_price) && (
            <div className="flex items-center gap-2 text-slate-600">
              <DollarSign className="w-4 h-4 text-slate-400" />
              ${job.final_price || job.price_estimate}
            </div>
          )}
          {job.assigned_tech && (
            <div className="flex items-center gap-2 text-slate-600">
              <User className="w-4 h-4 text-slate-400" />
              {job.assigned_tech}
            </div>
          )}
        </div>

        {job.customer_address && (
          <div className="flex items-center gap-2 text-sm text-slate-600 mt-3 pt-3 border-t border-slate-100">
            <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="truncate">{job.customer_address}</span>
          </div>
        )}
      </div>

      {onQuickAction && (
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => onQuickAction('message', job)}
          >
            <MessageSquare className="w-4 h-4 mr-1.5" />
            Message
          </Button>
          {job.status === 'lead' && (
            <Button
              size="sm"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={() => onQuickAction('quote', job)}
            >
              <DollarSign className="w-4 h-4 mr-1.5" />
              Send Quote
            </Button>
          )}
          {job.status === 'quoted' && (
            <Button
              size="sm"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={() => onQuickAction('schedule', job)}
            >
              <Calendar className="w-4 h-4 mr-1.5" />
              Schedule
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}