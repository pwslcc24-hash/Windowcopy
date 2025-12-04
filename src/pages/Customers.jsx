import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Plus, Users, Building2, Home, Star } from 'lucide-react';
import SearchBar from '@/components/common/SearchBar';
import FilterTabs from '@/components/common/FilterTabs';
import CustomerCard from '@/components/customers/CustomerCard';

const { Customer, Job } = base44.entities;

export default function Customers() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => Customer.list('-created_date', 500)
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => Job.list('-created_date', 1000)
  });

  // Calculate job counts per customer
  const customerJobCounts = React.useMemo(() => {
    const counts = {};
    jobs.forEach(job => {
      counts[job.customer_id] = (counts[job.customer_id] || 0) + 1;
    });
    return counts;
  }, [jobs]);

  const filters = [
    { value: 'all', label: 'All', icon: Users },
    { value: 'residential', label: 'Residential', icon: Home },
    { value: 'commercial', label: 'Commercial', icon: Building2 },
    { value: 'reviewed', label: 'Left Review', icon: Star }
  ];

  const filteredCustomers = customers.filter(customer => {
    // Search filter
    const searchMatch = !search ||
      customer.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      customer.mobile_number?.includes(search) ||
      customer.address?.toLowerCase().includes(search.toLowerCase()) ||
      customer.email?.toLowerCase().includes(search.toLowerCase());

    if (!searchMatch) return false;

    // Type filter
    switch (filter) {
      case 'residential':
        return customer.customer_type === 'residential' || !customer.customer_type;
      case 'commercial':
        return customer.customer_type === 'commercial';
      case 'reviewed':
        return customer.left_review;
      default:
        return true;
    }
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Customers</h1>
            <p className="text-slate-500 mt-1">{customers.length} total customers</p>
          </div>
          <Link to={createPageUrl('NewCustomer')}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Customer
            </Button>
          </Link>
        </div>

        {/* Search & Filters */}
        <div className="space-y-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by name, phone, or address..."
          />
          <FilterTabs
            filters={filters}
            activeFilter={filter}
            onChange={setFilter}
          />
        </div>

        {/* Customers Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-48 bg-white rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No customers found</p>
            <p className="text-sm">Try adjusting your search</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map(customer => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                jobCount={customerJobCounts[customer.id] || 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}