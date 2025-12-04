import React, { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { User, Bot, MessageSquare, Mail } from 'lucide-react';

export default function MessageThread({ messages }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!messages || messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <MessageSquare className="w-16 h-16 mb-4 opacity-30" />
        <p>No messages yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex gap-3 ${msg.direction === 'outbound' ? 'flex-row-reverse' : ''}`}
        >
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            msg.direction === 'outbound' 
              ? msg.is_auto ? 'bg-purple-100' : 'bg-blue-100'
              : 'bg-slate-100'
          }`}>
            {msg.direction === 'outbound' ? (
              msg.is_auto ? <Bot className="w-4 h-4 text-purple-600" /> : <User className="w-4 h-4 text-blue-600" />
            ) : (
              <User className="w-4 h-4 text-slate-600" />
            )}
          </div>
          <div className={`max-w-[70%] ${msg.direction === 'outbound' ? 'text-right' : ''}`}>
            <div className={`inline-block rounded-2xl px-4 py-3 ${
              msg.direction === 'outbound'
                ? 'bg-blue-600 text-white rounded-tr-sm'
                : 'bg-slate-100 text-slate-900 rounded-tl-sm'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
            </div>
            <div className={`flex items-center gap-2 mt-1 text-xs text-slate-400 ${
              msg.direction === 'outbound' ? 'justify-end' : ''
            }`}>
              {msg.channel === 'text' ? (
                <MessageSquare className="w-3 h-3" />
              ) : (
                <Mail className="w-3 h-3" />
              )}
              <span>{format(new Date(msg.created_date), 'MMM d, h:mm a')}</span>
              {msg.is_auto && <span className="text-purple-500">• Auto</span>}
            </div>
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}