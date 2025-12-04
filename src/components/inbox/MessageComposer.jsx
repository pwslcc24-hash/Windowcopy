import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, MessageSquare, Mail, Loader2 } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export default function MessageComposer({ 
  onSend, 
  channel = 'text', 
  onChannelChange,
  defaultMessage = '',
  sending = false 
}) {
  const [message, setMessage] = useState(defaultMessage);

  React.useEffect(() => {
    if (defaultMessage) {
      setMessage(defaultMessage);
    }
  }, [defaultMessage]);

  const handleSend = () => {
    if (message.trim() && !sending) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 bg-white border-t border-slate-200">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-slate-500">Send via:</span>
        <ToggleGroup 
          type="single" 
          value={channel} 
          onValueChange={(v) => v && onChannelChange(v)}
          className="bg-slate-100 rounded-lg p-1"
        >
          <ToggleGroupItem 
            value="text" 
            className="text-xs px-3 py-1 data-[state=on]:bg-white data-[state=on]:shadow-sm"
          >
            <MessageSquare className="w-3 h-3 mr-1.5" />
            Text
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="email" 
            className="text-xs px-3 py-1 data-[state=on]:bg-white data-[state=on]:shadow-sm"
          >
            <Mail className="w-3 h-3 mr-1.5" />
            Email
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="resize-none min-h-[80px] flex-1"
          disabled={sending}
        />
        <Button
          onClick={handleSend}
          disabled={!message.trim() || sending}
          className="bg-blue-600 hover:bg-blue-700 h-auto"
        >
          {sending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>
    </div>
  );
}