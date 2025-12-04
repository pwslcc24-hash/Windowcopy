import React from 'react';
import { format } from 'date-fns';
import { MessageSquare, Mail, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ConversationList({ conversations, selectedId, onSelect }) {
  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <MessageSquare className="w-12 h-12 mb-3 opacity-50" />
        <p className="text-sm">No conversations yet</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {conversations.map((conv) => (
        <button
          key={conv.customer_id}
          onClick={() => onSelect(conv)}
          className={`w-full text-left p-4 hover:bg-slate-50 transition-all duration-200 ${
            selectedId === conv.customer_id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900 truncate">
                  {conv.customer_name}
                </h3>
                {conv.unread_count > 0 && (
                  <Badge className="bg-blue-600 text-white text-xs px-2">
                    {conv.unread_count}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-500 truncate mt-1">
                {conv.last_message}
              </p>
              <div className="flex items-center gap-2 mt-2">
                {conv.channel === 'text' ? (
                  <MessageSquare className="w-3 h-3 text-slate-400" />
                ) : (
                  <Mail className="w-3 h-3 text-slate-400" />
                )}
                <span className="text-xs text-slate-400">
                  {conv.last_message_time ? format(new Date(conv.last_message_time), 'MMM d, h:mm a') : ''}
                </span>
                {conv.job_status && (
                  <Badge variant="outline" className="text-xs capitalize">
                    {conv.job_status.replace('_', ' ')}
                  </Badge>
                )}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 flex-shrink-0" />
          </div>
        </button>
      ))}
    </div>
  );
}