import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { format, isToday, isTomorrow, startOfWeek, endOfWeek, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import SearchBar from '@/components/common/SearchBar';
import FilterTabs from '@/components/common/FilterTabs';
import JobCard from '@/components/jobs/JobCard';

const { Job, Customer } = base44.entities;

export default function Jobs() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  // Get filter from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlFilter = params.get('filter');
    if (urlFilter) setFilter(urlFilter);
  }, []);

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => Job.list('-created_date', 500)
  });

  const today = format(new Date(), 'yyyy-MM-dd');
  const tomorrow = format(new Date(Date.now() + 86400000), 'yyyy-MM-dd');
  const weekStart = format(startOfWeek(new Date()), 'yyyy-MM-dd');
  const weekEnd = format(endOfWeek(new Date()), 'yyyy-MM-dd');

  const filters = [
    { value: 'all', label: 'All Jobs', icon: Calendar },
    { value: 'today', label: 'Today', count: jobs.filter(j => j.scheduled_date === today).length },
    { value: 'tomorrow', label: 'Tomorrow', count: jobs.filter(j => j.scheduled_date === tomorrow).length },
    { value: 'week', label: 'This Week' },
    { value: 'lead', label: 'Leads', icon: Users, count: jobs.filter(j => j.status === 'lead').length },
    { value: 'quoted', label: 'Quoted', icon: DollarSign, count: jobs.filter(j => j.status === 'quoted').length },
    { value: 'scheduled', label: 'Scheduled', icon: Clock },
    { value: 'unconfirmed', label: 'Unconfirmed', icon: AlertCircle },
    { value: 'completed', label: 'Completed', icon: CheckCircle2 },
  ];

  const filteredJobs = jobs.filter(job => {
    // Search filter
    const searchMatch = !search || 
      job.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      job.customer_address?.toLowerCase().includes(search.toLowerCase()) ||
      job.assigned_tech?.toLowerCase().includes(search.toLowerCase());

    if (!searchMatch) return false;

    // Status/date filter
    switch (filter) {
      case 'today':
        return job.scheduled_date === today;
      case 'tomorrow':
        return job.scheduled_date === tomorrow;
      case 'week':
        return job.scheduled_date >= weekStart && job.scheduled_date <= weekEnd;
      case 'lead':
        return job.status === 'lead';
      case 'quoted':
        return job.status === 'quoted';
      case 'scheduled':
        return job.status === 'scheduled';
      case 'unconfirmed':
        return job.status === 'scheduled' && !job.customer_confirmed;
      case 'completed':
        return job.status === 'completed';
      default:
        return true;
    }
  });

  const handleQuickAction = (action, job) => {
    if (action === 'message') {
      window.location.href = createPageUrl('Inbox') + `?customer=${job.customer_id}`;
    } else if (action === 'quote' || action === 'schedule') {
      window.location.href = createPageUrl('JobDetail') + `?id=${job.id}`;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Jobs</h1>
            <p className="text-slate-500 mt-1">{filteredJobs.length} jobs</p>
          </div>
          <Link to={createPageUrl('NewCustomer')}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Lead
            </Button>
          </Link>
        </div>

        {/* Search & Filters */}
        <div className="space-y-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by customer, address, or tech..."
          />
          <FilterTabs
            filters={filters}
            activeFilter={filter}
            onChange={setFilter}
          />
        </div>

        {/* Jobs Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-48 bg-white rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No jobs found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredJobs.map(job => (
              <JobCard 
                key={job.id} 
                job={job} 
                onQuickAction={handleQuickAction}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}