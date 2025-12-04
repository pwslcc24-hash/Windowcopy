import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  MessageSquare, 
  User, 
  Calendar, 
  DollarSign, 
  MapPin,
  Phone,
  Mail,
  ChevronLeft,
  ExternalLink
} from 'lucide-react';
import ConversationList from '@/components/inbox/ConversationList';
import MessageThread from '@/components/inbox/MessageThread';
import MessageComposer from '@/components/inbox/MessageComposer';
import QuickReplyTemplates from '@/components/inbox/QuickReplyTemplates';

const { Customer, Job, Message } = base44.entities;

export default function Inbox() {
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [channel, setChannel] = useState('text');
  const [composerMessage, setComposerMessage] = useState('');
  const [mobileShowThread, setMobileShowThread] = useState(false);

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['messages'],
    queryFn: () => Message.list('-created_date', 500)
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => Customer.list('-created_date', 200)
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => Job.list('-created_date', 200)
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData) => {
      await Message.create(messageData);
      // Mark conversation as read
      const unreadMessages = messages.filter(
        m => m.customer_id === messageData.customer_id && !m.is_read && m.direction === 'inbound'
      );
      await Promise.all(unreadMessages.map(m => Message.update(m.id, { is_read: true })));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    }
  });

  // Group messages into conversations
  const conversations = React.useMemo(() => {
    const convMap = new Map();
    
    messages.forEach(msg => {
      if (!convMap.has(msg.customer_id)) {
        const customer = customers.find(c => c.id === msg.customer_id);
        const customerJobs = jobs.filter(j => j.customer_id === msg.customer_id);
        const latestJob = customerJobs[0];
        
        convMap.set(msg.customer_id, {
          customer_id: msg.customer_id,
          customer_name: customer?.full_name || 'Unknown',
          customer: customer,
          jobs: customerJobs,
          latest_job: latestJob,
          job_status: latestJob?.status,
          last_message: msg.body,
          last_message_time: msg.created_date,
          channel: msg.channel,
          unread_count: 0,
          messages: []
        });
      }
      
      const conv = convMap.get(msg.customer_id);
      conv.messages.push(msg);
      if (msg.direction === 'inbound' && !msg.is_read) {
        conv.unread_count++;
      }
    });

    return Array.from(convMap.values()).sort((a, b) => 
      new Date(b.last_message_time) - new Date(a.last_message_time)
    );
  }, [messages, customers, jobs]);

  const selectedThread = selectedConversation 
    ? conversations.find(c => c.customer_id === selectedConversation.customer_id)
    : null;

  const handleSelectConversation = async (conv) => {
    setSelectedConversation(conv);
    setMobileShowThread(true);
    
    // Mark messages as read
    const unreadMessages = messages.filter(
      m => m.customer_id === conv.customer_id && !m.is_read && m.direction === 'inbound'
    );
    if (unreadMessages.length > 0) {
      await Promise.all(unreadMessages.map(m => Message.update(m.id, { is_read: true })));
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    }
  };

  const handleSendMessage = (body) => {
    if (!selectedConversation) return;
    
    sendMessageMutation.mutate({
      customer_id: selectedConversation.customer_id,
      job_id: selectedConversation.latest_job?.id,
      direction: 'outbound',
      channel: channel,
      body: body,
      is_read: true,
      is_auto: false
    });
    setComposerMessage('');
  };

  const handleQuickReply = (template) => {
    setComposerMessage(template);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {mobileShowThread && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden"
                onClick={() => setMobileShowThread(false)}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            )}
            <h1 className="text-2xl font-bold text-slate-900">Inbox</h1>
            <Badge className="bg-blue-100 text-blue-800">
              {conversations.reduce((sum, c) => sum + c.unread_count, 0)} unread
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Conversation List */}
        <div className={`w-full lg:w-96 border-r border-slate-200 bg-white overflow-y-auto ${
          mobileShowThread ? 'hidden lg:block' : ''
        }`}>
          {messagesLoading ? (
            <div className="p-6 text-center text-slate-400">Loading...</div>
          ) : (
            <ConversationList
              conversations={conversations}
              selectedId={selectedConversation?.customer_id}
              onSelect={handleSelectConversation}
            />
          )}
        </div>

        {/* Message Thread */}
        <div className={`flex-1 flex flex-col bg-white ${
          !mobileShowThread ? 'hidden lg:flex' : ''
        }`}>
          {selectedThread ? (
            <>
              {/* Customer Info Header */}
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      {selectedThread.customer?.full_name}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                      {selectedThread.customer?.mobile_number && (
                        <a href={`tel:${selectedThread.customer.mobile_number}`} className="flex items-center gap-1 hover:text-blue-600">
                          <Phone className="w-3 h-3" />
                          {selectedThread.customer.mobile_number}
                        </a>
                      )}
                      {selectedThread.customer?.email && (
                        <a href={`mailto:${selectedThread.customer.email}`} className="flex items-center gap-1 hover:text-blue-600">
                          <Mail className="w-3 h-3" />
                          {selectedThread.customer.email}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link to={createPageUrl('CustomerDetail') + `?id=${selectedThread.customer_id}`}>
                      <Button variant="outline" size="sm">
                        <User className="w-4 h-4 mr-1.5" />
                        Profile
                      </Button>
                    </Link>
                    {selectedThread.latest_job && (
                      <Link to={createPageUrl('JobDetail') + `?id=${selectedThread.latest_job.id}`}>
                        <Button variant="outline" size="sm">
                          <Calendar className="w-4 h-4 mr-1.5" />
                          Job
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
                {selectedThread.latest_job && (
                  <div className="mt-3 flex items-center gap-3">
                    <Badge className="capitalize">{selectedThread.latest_job.status.replace('_', ' ')}</Badge>
                    {selectedThread.latest_job.price_estimate && (
                      <span className="text-sm text-slate-500">
                        ${selectedThread.latest_job.price_estimate}
                      </span>
                    )}
                    {selectedThread.latest_job.scheduled_date && (
                      <span className="text-sm text-slate-500">
                        {selectedThread.latest_job.scheduled_date}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto">
                <MessageThread messages={[...selectedThread.messages].reverse()} />
              </div>

              {/* Quick Replies */}
              <QuickReplyTemplates onSelect={handleQuickReply} />

              {/* Composer */}
              <MessageComposer
                onSend={handleSendMessage}
                channel={channel}
                onChannelChange={setChannel}
                defaultMessage={composerMessage}
                sending={sendMessageMutation.isPending}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">Select a conversation</p>
                <p className="text-sm">Choose a customer to view messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}