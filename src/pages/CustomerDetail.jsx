import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  MessageSquare,
  Plus,
  Star,
  Loader2
} from 'lucide-react';
import CustomerForm from '@/components/customers/CustomerForm';
import JobCard from '@/components/jobs/JobCard';
import MessageThread from '@/components/inbox/MessageThread';

const { Customer, Job, Message } = base44.entities;

export default function CustomerDetail() {
  const queryClient = useQueryClient();
  const [customerId, setCustomerId] = useState(null);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCustomerId(params.get('id'));
  }, []);

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => Customer.filter({ id: customerId }),
    enabled: !!customerId,
    select: (data) => data[0]
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['customerJobs', customerId],
    queryFn: () => Job.filter({ customer_id: customerId }, '-created_date', 100),
    enabled: !!customerId
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['customerMessages', customerId],
    queryFn: () => Message.filter({ customer_id: customerId }, '-created_date', 200),
    enabled: !!customerId
  });

  const updateCustomerMutation = useMutation({
    mutationFn: (data) => Customer.update(customerId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customer', customerId] })
  });

  const createJobMutation = useMutation({
    mutationFn: (data) => Job.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customerJobs', customerId] })
  });

  if (isLoading || !customer) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const totalRevenue = jobs
    .filter(j => j.status === 'completed')
    .reduce((sum, j) => sum + (j.final_price || j.price_estimate || 0), 0);

  const completedJobs = jobs.filter(j => j.status === 'completed').length;

  const handleCreateJob = async () => {
    const newJob = await createJobMutation.mutateAsync({
      customer_id: customerId,
      customer_name: customer.full_name,
      customer_address: customer.address,
      status: 'lead'
    });
    window.location.href = createPageUrl('JobDetail') + `?id=${newJob.id}`;
  };

  const handleToggleReview = async () => {
    await updateCustomerMutation.mutateAsync({
      left_review: !customer.left_review
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to={createPageUrl('Customers')}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{customer.full_name}</h1>
              <Badge variant="outline" className="capitalize">
                {customer.customer_type || 'residential'}
              </Badge>
              {customer.left_review && (
                <Badge className="bg-yellow-100 text-yellow-800">
                  <Star className="w-3 h-3 mr-1" />
                  Reviewed
                </Badge>
              )}
            </div>
            <p className="text-slate-500">{customer.address}</p>
          </div>
          <Button onClick={handleCreateJob} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Job
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Revenue</p>
                <p className="text-xl font-bold text-slate-900">${totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Completed Jobs</p>
                <p className="text-xl font-bold text-slate-900">{completedJobs}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <MessageSquare className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Messages</p>
                <p className="text-xl font-bold text-slate-900">{messages.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="jobs">
              Jobs
              <Badge className="ml-2 bg-slate-100 text-slate-800">{jobs.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="messages">
              Messages
              <Badge className="ml-2 bg-slate-100 text-slate-800">{messages.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4 space-y-4">
            <CustomerForm
              customer={customer}
              onSave={(data) => updateCustomerMutation.mutateAsync(data)}
              saving={updateCustomerMutation.isPending}
            />

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className={`w-5 h-5 ${customer.left_review ? 'text-yellow-500 fill-yellow-500' : 'text-slate-400'}`} />
                    <span className="font-medium">Google Review Status</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={customer.left_review}
                      onCheckedChange={handleToggleReview}
                    />
                    <span className="text-sm text-slate-600">Customer left a review</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs" className="mt-4">
            {jobs.length === 0 ? (
              <Card className="p-8 text-center text-slate-400">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No jobs yet</p>
                <Button onClick={handleCreateJob} className="mt-4 bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Job
                </Button>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {jobs.map(job => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="messages" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Message History</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[600px] overflow-y-auto">
                  <MessageThread messages={[...messages].reverse()} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}