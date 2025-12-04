import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CloudRain, Plus } from 'lucide-react';
import CalendarView from '@/components/calendar/CalendarView';
import DaySchedule from '@/components/calendar/DaySchedule';
import WeatherManager from '@/components/weather/WeatherManager';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const { Job, Message, BadWeatherDay } = base44.entities;

export default function CalendarPage() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showWeatherManager, setShowWeatherManager] = useState(false);
  const [view, setView] = useState('month');

  const { data: jobs = [] } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => Job.list('-scheduled_date', 500)
  });

  const { data: badWeatherDays = [] } = useQuery({
    queryKey: ['badWeatherDays'],
    queryFn: () => BadWeatherDay.list()
  });

  const updateJobMutation = useMutation({
    mutationFn: ({ id, data }) => Job.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jobs'] })
  });

  const badWeatherMutation = useMutation({
    mutationFn: (date) => BadWeatherDay.create({ date: format(date, 'yyyy-MM-dd') }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['badWeatherDays'] })
  });

  const removeBadWeatherMutation = useMutation({
    mutationFn: async (date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const badDay = badWeatherDays.find(d => d.date === dateStr);
      if (badDay) await BadWeatherDay.delete(badDay.id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['badWeatherDays'] })
  });

  const sendMessageMutation = useMutation({
    mutationFn: (messageData) => Message.create(messageData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['messages'] })
  });

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const selectedDayJobs = jobs.filter(j => j.scheduled_date === selectedDateStr);
  const isBadWeather = badWeatherDays.some(d => d.date === selectedDateStr);

  const handleJobClick = (job) => {
    window.location.href = createPageUrl('JobDetail') + `?id=${job.id}`;
  };

  const handleMarkComplete = async (job) => {
    await updateJobMutation.mutateAsync({ 
      id: job.id, 
      data: { status: 'completed' }
    });
    
    // Send follow-up message
    await sendMessageMutation.mutateAsync({
      customer_id: job.customer_id,
      job_id: job.id,
      direction: 'outbound',
      channel: 'text',
      body: `Thanks for choosing Deseret Peak Window Cleaning! We hope your windows are sparkling! ✨\n\nIf everything looks great, we'd really appreciate a Google review. Thank you!`,
      is_auto: true
    });
  };

  const handleMarkNoShow = async (job) => {
    await updateJobMutation.mutateAsync({ 
      id: job.id, 
      data: { status: 'no_show' }
    });
  };

  const handleSendRescheduleMessage = async (job, note) => {
    const message = `Hi ${job.customer_name?.split(' ')[0] || ''},\n\nDue to weather conditions, we need to reschedule your window cleaning appointment on ${format(parseISO(job.scheduled_date), 'MMMM d')}.\n\n${note ? note + '\n\n' : ''}What dates work best for you? We'll get you on the schedule as soon as the weather clears!\n\n- Deseret Peak Window Cleaning`;
    
    await sendMessageMutation.mutateAsync({
      customer_id: job.customer_id,
      job_id: job.id,
      direction: 'outbound',
      channel: 'text',
      body: message,
      is_auto: false
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Calendar</h1>
            <p className="text-slate-500 mt-1">Manage your schedule</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={() => setShowWeatherManager(true)}
            >
              <CloudRain className="w-4 h-4 mr-2" />
              Weather
            </Button>
            <Tabs value={view} onValueChange={setView}>
              <TabsList>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <CalendarView
              jobs={jobs}
              badWeatherDays={badWeatherDays}
              selectedDate={selectedDate}
              onDateClick={setSelectedDate}
              onJobClick={handleJobClick}
              view={view}
            />
          </div>

          {/* Day Schedule */}
          <div>
            <DaySchedule
              date={selectedDate}
              jobs={selectedDayJobs}
              isBadWeather={isBadWeather}
              onJobClick={handleJobClick}
              onMarkComplete={handleMarkComplete}
              onMarkNoShow={handleMarkNoShow}
            />
          </div>
        </div>
      </div>

      {/* Weather Manager Dialog */}
      <Dialog open={showWeatherManager} onOpenChange={setShowWeatherManager}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Weather Manager</DialogTitle>
          </DialogHeader>
          <WeatherManager
            date={selectedDate}
            jobs={selectedDayJobs}
            isBadWeather={isBadWeather}
            onMarkBadWeather={() => badWeatherMutation.mutate(selectedDate)}
            onRemoveBadWeather={() => removeBadWeatherMutation.mutate(selectedDate)}
            onSendRescheduleMessage={handleSendRescheduleMessage}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}