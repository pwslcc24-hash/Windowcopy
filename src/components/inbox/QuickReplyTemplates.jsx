import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Send, 
  Calendar, 
  Clock, 
  RefreshCw, 
  Star,
  MessageSquare
} from 'lucide-react';

const defaultTemplates = [
  {
    id: 'welcome',
    label: 'Welcome',
    icon: Sparkles,
    text: "Thanks for reaching out to Deseret Peak Window Cleaning! 🏔️ We'd love to help you get crystal clear windows.\n\nCould you please share:\n1. Your address\n2. Approximately how many windows or the size of your home\n3. Do you prefer mornings or afternoons? What days work best?\n\nWe'll get back to you with a quote right away!"
  },
  {
    id: 'quote',
    label: 'Quote',
    icon: Send,
    text: "Great news! Here's your quote:\n\n🪟 Service: [SERVICE_TYPE]\n💰 Price: $[PRICE]\n⏱️ Duration: Approx. [DURATION] hours\n\nReply YES to schedule, or let me know if you have any questions!"
  },
  {
    id: 'confirm',
    label: 'Confirm',
    icon: Calendar,
    text: "You're all set! ✅\n\n📅 Date: [DATE]\n🕐 Arrival: [TIME_WINDOW]\n💰 Estimated: $[PRICE]\n\nWe'll send a reminder the day before. See you then!"
  },
  {
    id: 'reminder',
    label: 'Reminder',
    icon: Clock,
    text: "Hi! Just a friendly reminder that we're scheduled to clean your windows tomorrow.\n\n📅 [DATE]\n🕐 [TIME_WINDOW]\n\nPlease reply to confirm, or let us know if you need to reschedule. Thanks!"
  },
  {
    id: 'reschedule',
    label: 'Reschedule',
    icon: RefreshCw,
    text: "No problem! We can reschedule your appointment.\n\nWhat dates and times work better for you? We have availability this week and next."
  },
  {
    id: 'review',
    label: 'Review',
    icon: Star,
    text: "Thanks for choosing Deseret Peak Window Cleaning! We hope your windows are sparkling! ✨\n\nIf you have a moment, we'd really appreciate a Google review. It helps other homeowners find us!\n\n[REVIEW_LINK]\n\nThank you so much!"
  }
];

export default function QuickReplyTemplates({ onSelect, customTemplates = [] }) {
  const templates = [...defaultTemplates, ...customTemplates];

  return (
    <div className="p-3 bg-slate-50 border-t border-slate-100">
      <p className="text-xs text-slate-500 mb-2 font-medium">Quick Replies</p>
      <div className="flex flex-wrap gap-2">
        {templates.map((template) => {
          const Icon = template.icon || MessageSquare;
          return (
            <Button
              key={template.id}
              variant="outline"
              size="sm"
              onClick={() => onSelect(template.text)}
              className="text-xs bg-white hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all"
            >
              <Icon className="w-3 h-3 mr-1.5" />
              {template.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}