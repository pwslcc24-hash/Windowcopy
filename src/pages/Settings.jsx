import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Save, 
  Clock, 
  MessageSquare, 
  Star, 
  Loader2,
  Check
} from 'lucide-react';

const { Settings } = base44.entities;

const defaultTemplates = {
  welcome: `Thanks for reaching out to Deseret Peak Window Cleaning! 🏔️ We'd love to help you get crystal clear windows.

Could you please share:
1. Your address
2. Approximately how many windows or the size of your home
3. Do you prefer mornings or afternoons? What days work best?

We'll get back to you with a quote right away!`,
  
  quote: `Great news! Here's your quote:

🪟 Service: [SERVICE_TYPE]
💰 Price: $[PRICE]
⏱️ Duration: Approx. [DURATION] hours

Reply YES to schedule, or let me know if you have any questions!`,
  
  confirmation: `You're all set! ✅

📅 Date: [DATE]
🕐 Arrival: [TIME_WINDOW]
💰 Estimated: $[PRICE]

We'll send a reminder the day before. See you then!`,
  
  reminder: `Hi! Just a friendly reminder that we're scheduled to clean your windows tomorrow.

📅 [DATE]
🕐 [TIME_WINDOW]

Please reply to confirm, or let us know if you need to reschedule. Thanks!`,
  
  reschedule: `No problem! We can reschedule your appointment.

What dates and times work better for you? We have availability this week and next.`,
  
  review: `Thanks for choosing Deseret Peak Window Cleaning! We hope your windows are sparkling! ✨

If you have a moment, we'd really appreciate a Google review. It helps other homeowners find us!

[REVIEW_LINK]

Thank you so much!`,
  
  followup: `Hi! We wanted to follow up on our quote. Are you still interested in getting your windows cleaned? Just reply and we'll get you on the schedule!`
};

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  const [saved, setSaved] = useState(false);
  
  const [generalSettings, setGeneralSettings] = useState({
    business_hours_start: '08:00',
    business_hours_end: '18:00',
    slot_duration: '2',
    reminder_day_before: '18:00',
    reminder_morning: '07:00',
    google_review_link: ''
  });

  const [templates, setTemplates] = useState(defaultTemplates);

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => Settings.list()
  });

  useEffect(() => {
    if (settings.length > 0) {
      const settingsMap = {};
      settings.forEach(s => {
        settingsMap[s.setting_key] = s.setting_value;
      });

      setGeneralSettings(prev => ({
        ...prev,
        business_hours_start: settingsMap.business_hours_start || prev.business_hours_start,
        business_hours_end: settingsMap.business_hours_end || prev.business_hours_end,
        slot_duration: settingsMap.slot_duration || prev.slot_duration,
        reminder_day_before: settingsMap.reminder_day_before || prev.reminder_day_before,
        reminder_morning: settingsMap.reminder_morning || prev.reminder_morning,
        google_review_link: settingsMap.google_review_link || prev.google_review_link
      }));

      setTemplates(prev => ({
        ...prev,
        welcome: settingsMap.template_welcome || prev.welcome,
        quote: settingsMap.template_quote || prev.quote,
        confirmation: settingsMap.template_confirmation || prev.confirmation,
        reminder: settingsMap.template_reminder || prev.reminder,
        reschedule: settingsMap.template_reschedule || prev.reschedule,
        review: settingsMap.template_review || prev.review,
        followup: settingsMap.template_followup || prev.followup
      }));
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (allSettings) => {
      // Delete existing and recreate
      for (const existing of settings) {
        await Settings.delete(existing.id);
      }
      
      // Save all settings
      for (const [key, value] of Object.entries(allSettings)) {
        await Settings.create({
          setting_key: key,
          setting_value: value,
          setting_type: key.startsWith('template_') ? 'template' : 'config'
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  });

  const handleSave = () => {
    const allSettings = {
      ...generalSettings,
      template_welcome: templates.welcome,
      template_quote: templates.quote,
      template_confirmation: templates.confirmation,
      template_reminder: templates.reminder,
      template_reschedule: templates.reschedule,
      template_review: templates.review,
      template_followup: templates.followup
    };
    saveMutation.mutate(allSettings);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
            <p className="text-slate-500 mt-1">Configure your business preferences</p>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={saveMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saveMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : saved ? (
              <Check className="w-4 h-4 mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {saved ? 'Saved!' : 'Save Settings'}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="templates">Message Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-4 space-y-4">
            {/* Business Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Business Hours
                </CardTitle>
                <CardDescription>Set your standard working hours</CardDescription>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={generalSettings.business_hours_start}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, business_hours_start: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={generalSettings.business_hours_end}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, business_hours_end: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Default Job Duration (hours)</Label>
                  <Input
                    type="number"
                    value={generalSettings.slot_duration}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, slot_duration: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Reminders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Reminder Times
                </CardTitle>
                <CardDescription>When to send automatic reminders</CardDescription>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Day Before Reminder</Label>
                  <Input
                    type="time"
                    value={generalSettings.reminder_day_before}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, reminder_day_before: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Morning-of Reminder</Label>
                  <Input
                    type="time"
                    value={generalSettings.reminder_morning}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, reminder_morning: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Google Review */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Google Review Link
                </CardTitle>
                <CardDescription>Your Google Business review link for follow-up messages</CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  type="url"
                  value={generalSettings.google_review_link}
                  onChange={(e) => setGeneralSettings(prev => ({ ...prev, google_review_link: e.target.value }))}
                  placeholder="https://g.page/r/..."
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="mt-4 space-y-4">
            {Object.entries({
              welcome: 'New Lead Welcome',
              quote: 'Quote Message',
              confirmation: 'Appointment Confirmation',
              reminder: 'Day Before Reminder',
              reschedule: 'Reschedule Request',
              review: 'Review Request',
              followup: 'Cold Lead Follow-up'
            }).map(([key, label]) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="text-base">{label}</CardTitle>
                  <CardDescription>
                    Variables: [SERVICE_TYPE], [PRICE], [DURATION], [DATE], [TIME_WINDOW], [REVIEW_LINK]
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={templates[key]}
                    onChange={(e) => setTemplates(prev => ({ ...prev, [key]: e.target.value }))}
                    rows={6}
                    className="font-mono text-sm"
                  />
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}