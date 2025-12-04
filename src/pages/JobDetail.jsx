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
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Send,
  MessageSquare,
  Calendar,
  DollarSign,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import JobForm from '@/components/jobs/JobForm';
import MessageThread from '@/components/inbox/MessageThread';
import QuickReplyTemplates from '@/components/inbox/QuickReplyTemplates';

const { Job, Customer, Message } = base44.entities;

export default function JobDetail() {
  const queryClient = useQueryClient();
  const [jobId, setJobId] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setJobId(params.get('id'));
  }, []);

  const { data: job, isLoading: jobLoading } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => Job.filter({ id: jobId }),
    enabled: !!jobId,
    select: (data) => data[0]
  });

  const { data: customer } = useQuery({
    queryKey: ['customer', job?.customer_id],
    queryFn: () => Customer.filter({ id: job.customer_id }),
    enabled: !!job?.customer_id,
    select: (data) => data[0]
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', job?.customer_id],
    queryFn: () => Message.filter({ customer_id: job.customer_id }, '-created_date', 100),
    enabled: !!job?.customer_id
  });

  const updateJobMutation = useMutation({
    mutationFn: (data) => Job.update(jobId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', jobId] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    }
  });

  const updateCustomerMutation = useMutation({
    mutationFn: (data) => Customer.update(job.customer_id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customer', job?.customer_id] })
  });

  const sendMessageMutation = useMutation({
    mutationFn: (messageData) => Message.create(messageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', job?.customer_id] });
      setMessageText('');
    }
  });

  const handleSaveJob = async (data) => {
    const previousStatus = job.status;
    await updateJobMutation.mutateAsync(data);

    // Auto-send messages based on status changes
    if (previousStatus === 'lead' && data.status === 'quoted' && data.price_estimate) {
      const serviceTypes = data.service_type?.map(s => s.replace('_', ' ')).join(', ') || 'window cleaning';
      const message = `Great news! Here's your quote:\n\n🪟 Service: ${serviceTypes}\n💰 Price: $${data.price_estimate}\n⏱️ Duration: Approx. ${data.estimated_duration || 2} hours\n\nReply YES to schedule, or let me know if you have any questions!`;
      
      await sendMessageMutation.mutateAsync({
        customer_id: job.customer_id,
        job_id: jobId,
        direction: 'outbound',
        channel: 'text',
        body: message,
        is_auto: true
      });
    }

    if (data.status === 'scheduled' && data.scheduled_date && previousStatus !== 'scheduled') {
      const message = `You're all set! ✅\n\n📅 Date: ${format(new Date(data.scheduled_date), 'EEEE, MMMM d')}\n🕐 Arrival: ${data.scheduled_start_time} - ${data.scheduled_end_time}\n💰 Estimated: $${data.price_estimate}\n\nWe'll send a reminder the day before. See you then!`;
      
      await sendMessageMutation.mutateAsync({
        customer_id: job.customer_id,
        job_id: jobId,
        direction: 'outbound',
        channel: 'text',
        body: message,
        is_auto: true
      });
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    await sendMessageMutation.mutateAsync({
      customer_id: job.customer_id,
      job_id: jobId,
      direction: 'outbound',
      channel: 'text',
      body: messageText,
      is_auto: false
    });
  };

  if (jobLoading || !job) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const statusColors = {
    lead: 'bg-yellow-100 text-yellow-800',
    quoted: 'bg-orange-100 text-orange-800',
    scheduled: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-slate-100 text-slate-500',
    no_show: 'bg-red-100 text-red-800'
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to={createPageUrl('Jobs')}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{job.customer_name}</h1>
              <Badge className={statusColors[job.status]}>
                {job.status.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-slate-500">{job.customer_address}</p>
          </div>
        </div>

        {/* Customer Quick Info */}
        {customer && (
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-6">
                <Link 
                  to={createPageUrl('CustomerDetail') + `?id=${customer.id}`}
                  className="flex items-center gap-2 text-slate-900 hover:text-blue-600"
                >
                  <User className="w-4 h-4" />
                  {customer.full_name}
                </Link>
                {customer.mobile_number && (
                  <a href={`tel:${customer.mobile_number}`} className="flex items-center gap-2 text-slate-600 hover:text-blue-600">
                    <Phone className="w-4 h-4" />
                    {customer.mobile_number}
                  </a>
                )}
                {customer.email && (
                  <a href={`mailto:${customer.email}`} className="flex items-center gap-2 text-slate-600 hover:text-blue-600">
                    <Mail className="w-4 h-4" />
                    {customer.email}
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border">
            <TabsTrigger value="details">Job Details</TabsTrigger>
            <TabsTrigger value="messages">
              Messages
              {messages.length > 0 && (
                <Badge className="ml-2 bg-blue-100 text-blue-800">{messages.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4">
            <JobForm
              job={job}
              onSave={handleSaveJob}
              saving={updateJobMutation.isPending}
            />
          </TabsContent>

          <TabsContent value="messages" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Conversation</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-96 overflow-y-auto">
                  <MessageThread messages={[...messages].reverse()} />
                </div>
                <QuickReplyTemplates onSelect={(text) => setMessageText(text)} />
                <div className="p-4 border-t flex gap-2">
                  <Textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message..."
                    rows={2}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || sendMessageMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {sendMessageMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}