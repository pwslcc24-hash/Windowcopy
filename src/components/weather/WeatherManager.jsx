import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CloudRain, Calendar, Send, Check, X } from 'lucide-react';
import { format } from 'date-fns';

export default function WeatherManager({ 
  date, 
  jobs, 
  isBadWeather, 
  onMarkBadWeather, 
  onRemoveBadWeather,
  onSendRescheduleMessage 
}) {
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [rescheduleNote, setRescheduleNote] = useState('');

  const toggleJobSelection = (jobId) => {
    setSelectedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const handleSendBulk = () => {
    selectedJobs.forEach(jobId => {
      const job = jobs.find(j => j.id === jobId);
      if (job) {
        onSendRescheduleMessage(job, rescheduleNote);
      }
    });
    setSelectedJobs([]);
    setRescheduleNote('');
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
        <CardTitle className="flex items-center gap-2">
          <CloudRain className="w-5 h-5" />
          Weather Reschedule Manager
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-slate-900">
              {format(date, 'EEEE, MMMM d, yyyy')}
            </p>
            <p className="text-sm text-slate-500">
              {jobs.length} job{jobs.length !== 1 ? 's' : ''} scheduled
            </p>
          </div>
          {isBadWeather ? (
            <Button
              variant="outline"
              onClick={onRemoveBadWeather}
              className="text-green-600 border-green-200 hover:bg-green-50"
            >
              <Check className="w-4 h-4 mr-2" />
              Clear Weather Alert
            </Button>
          ) : (
            <Button
              onClick={onMarkBadWeather}
              className="bg-red-600 hover:bg-red-700"
            >
              <CloudRain className="w-4 h-4 mr-2" />
              Mark as Bad Weather
            </Button>
          )}
        </div>

        {isBadWeather && jobs.length > 0 && (
          <>
            <div className="border rounded-lg divide-y divide-slate-100">
              {jobs.map(job => (
                <div 
                  key={job.id}
                  className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors ${
                    selectedJobs.includes(job.id) ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => toggleJobSelection(job.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedJobs.includes(job.id)}
                    onChange={() => {}}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{job.customer_name}</p>
                    <p className="text-sm text-slate-500">
                      {job.scheduled_start_time} - {job.scheduled_end_time}
                    </p>
                  </div>
                  <Badge variant="outline">${job.price_estimate}</Badge>
                </div>
              ))}
            </div>

            {selectedJobs.length > 0 && (
              <div className="space-y-3">
                <Textarea
                  value={rescheduleNote}
                  onChange={(e) => setRescheduleNote(e.target.value)}
                  placeholder="Add a personal note to the reschedule message..."
                  rows={3}
                />
                <Button
                  onClick={handleSendBulk}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Reschedule Message to {selectedJobs.length} Customer{selectedJobs.length !== 1 ? 's' : ''}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}