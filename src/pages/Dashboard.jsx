import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { format, isToday, isTomorrow, startOfWeek, endOfWeek, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Inbox, 
  Calendar, 
  Users, 
  DollarSign, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  ChevronRight,
  Plus,
  CloudRain
} from 'lucide-react';
import StatsCard from '@/components/common/StatsCard';
import JobCard from '@/components/jobs/JobCard';

const { Customer, Job, Message, BadWeatherDay } = base44.entities;

export default function Dashboard() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const tomorrow = format(new Date(Date.now() + 86400000), 'yyyy-MM-dd');

  const { data: jobs = [] } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => Job.list('-created_date', 100)
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => Customer.list('-created_date', 100)
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['messages'],
    queryFn: () => Message.filter({ is_read: false }, '-created_date', 50)
  });

  const { data: badWeatherDays = [] } = useQuery({
    queryKey: ['badWeatherDays'],
    queryFn: () => BadWeatherDay.list()
  });

  // Stats calculations
  const todayJobs = jobs.filter(j => j.scheduled_date === today);
  const tomorrowJobs = jobs.filter(j => j.scheduled_date === tomorrow);
  const leadsCount = jobs.filter(j => j.status === 'lead').length;
  const quotedCount = jobs.filter(j => j.status === 'quoted').length;
  const unreadMessages = messages.filter(m => m.direction === 'inbound' && !m.is_read).length;
  
  const completedThisMonth = jobs.filter(j => {
    if (j.status !== 'completed') return false;
    const jobDate = parseISO(j.created_date);
    const now = new Date();
    return jobDate.getMonth() === now.getMonth() && jobDate.getFullYear() === now.getFullYear();
  });
  
  const monthlyRevenue = completedThisMonth.reduce((sum, j) => sum + (j.final_price || j.price_estimate || 0), 0);
  
  const unconfirmedJobs = jobs.filter(j => 
    j.status === 'scheduled' && 
    !j.customer_confirmed && 
    (j.scheduled_date === today || j.scheduled_date === tomorrow)
  );

  const isBadWeatherDay = (date) => badWeatherDays.some(bwd => bwd.date === date);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
          </div>
          <div className="flex gap-3">
            <Link to={createPageUrl('NewCustomer')}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                New Customer
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Today's Jobs"
            value={todayJobs.length}
            icon={Calendar}
            color="blue"
          />
          <StatsCard
            title="New Leads"
            value={leadsCount}
            icon={Users}
            color="yellow"
          />
          <StatsCard
            title="Unread Messages"
            value={unreadMessages}
            icon={Inbox}
            color="purple"
          />
          <StatsCard
            title="Monthly Revenue"
            value={`$${monthlyRevenue.toLocaleString()}`}
            icon={DollarSign}
            color="green"
          />
        </div>

        {/* Alerts Section */}
        {(unconfirmedJobs.length > 0 || isBadWeatherDay(today) || isBadWeatherDay(tomorrow)) && (
          <div className="space-y-3">
            {isBadWeatherDay(today) && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4 flex items-center gap-3">
                  <CloudRain className="w-5 h-5 text-red-600" />
                  <p className="text-red-800 font-medium">Today is marked as bad weather - check for reschedules</p>
                  <Link to={createPageUrl('Calendar')} className="ml-auto">
                    <Button size="sm" variant="outline" className="border-red-200 text-red-700 hover:bg-red-100">
                      View Calendar
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
            
            {unconfirmedJobs.length > 0 && (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <p className="text-amber-800 font-medium">
                    {unconfirmedJobs.length} unconfirmed job{unconfirmedJobs.length !== 1 ? 's' : ''} coming up
                  </p>
                  <Link to={createPageUrl('Jobs') + '?filter=unconfirmed'} className="ml-auto">
                    <Button size="sm" variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-100">
                      View Jobs
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Today's Schedule */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Today's Schedule</CardTitle>
              <Link to={createPageUrl('Calendar')}>
                <Button variant="ghost" size="sm">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {todayJobs.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No jobs scheduled for today</p>
                </div>
              ) : (
                todayJobs.slice(0, 5).map(job => (
                  <Link key={job.id} to={createPageUrl('JobDetail') + `?id=${job.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="w-14 text-center">
                        <p className="text-sm font-semibold text-slate-900">{job.scheduled_start_time}</p>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{job.customer_name}</p>
                        <p className="text-sm text-slate-500 truncate">{job.customer_address}</p>
                      </div>
                      <Badge className={job.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                        ${job.price_estimate || 0}
                      </Badge>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Leads */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Recent Leads</CardTitle>
              <Link to={createPageUrl('Jobs') + '?filter=lead'}>
                <Button variant="ghost" size="sm">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {jobs.filter(j => j.status === 'lead').length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No new leads</p>
                </div>
              ) : (
                jobs.filter(j => j.status === 'lead').slice(0, 5).map(job => (
                  <Link key={job.id} to={createPageUrl('JobDetail') + `?id=${job.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                        <Users className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{job.customer_name}</p>
                        <p className="text-sm text-slate-500">
                          {format(new Date(job.created_date), 'MMM d, h:mm a')}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to={createPageUrl('Inbox')}>
            <Card className="p-4 hover:shadow-lg transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-purple-100 group-hover:bg-purple-200 transition-colors">
                  <Inbox className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Inbox</p>
                  <p className="text-sm text-slate-500">{unreadMessages} unread</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to={createPageUrl('Calendar')}>
            <Card className="p-4 hover:shadow-lg transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-100 group-hover:bg-blue-200 transition-colors">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Calendar</p>
                  <p className="text-sm text-slate-500">{tomorrowJobs.length} tomorrow</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to={createPageUrl('Jobs') + '?filter=quoted'}>
            <Card className="p-4 hover:shadow-lg transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-orange-100 group-hover:bg-orange-200 transition-colors">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Awaiting Reply</p>
                  <p className="text-sm text-slate-500">{quotedCount} quoted</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to={createPageUrl('Customers')}>
            <Card className="p-4 hover:shadow-lg transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-green-100 group-hover:bg-green-200 transition-colors">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Customers</p>
                  <p className="text-sm text-slate-500">{customers.length} total</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}