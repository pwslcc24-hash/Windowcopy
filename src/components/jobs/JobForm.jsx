import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save } from 'lucide-react';

const serviceTypes = [
  { id: 'inside_windows', label: 'Inside Windows' },
  { id: 'outside_windows', label: 'Outside Windows' },
  { id: 'gutters', label: 'Gutters' },
  { id: 'screens', label: 'Screens' },
  { id: 'other', label: 'Other' }
];

const statusOptions = [
  { value: 'lead', label: 'Lead' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no_show', label: 'No Show' }
];

export default function JobForm({ job, onSave, saving = false, techs = [] }) {
  const [formData, setFormData] = useState({
    status: 'lead',
    service_type: [],
    price_estimate: '',
    final_price: '',
    estimated_duration: '',
    scheduled_date: '',
    scheduled_start_time: '',
    scheduled_end_time: '',
    assigned_tech: '',
    notes: '',
    ...job
  });

  useEffect(() => {
    if (job) {
      setFormData(prev => ({
        ...prev,
        ...job,
        price_estimate: job.price_estimate || '',
        final_price: job.final_price || '',
        estimated_duration: job.estimated_duration || ''
      }));
    }
  }, [job]);

  const handleServiceToggle = (serviceId) => {
    setFormData(prev => ({
      ...prev,
      service_type: prev.service_type?.includes(serviceId)
        ? prev.service_type.filter(s => s !== serviceId)
        : [...(prev.service_type || []), serviceId]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      price_estimate: formData.price_estimate ? parseFloat(formData.price_estimate) : null,
      final_price: formData.final_price ? parseFloat(formData.final_price) : null,
      estimated_duration: formData.estimated_duration ? parseFloat(formData.estimated_duration) : null
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Service Types */}
          <div className="space-y-2">
            <Label>Services</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {serviceTypes.map(service => (
                <div 
                  key={service.id}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={service.id}
                    checked={formData.service_type?.includes(service.id)}
                    onCheckedChange={() => handleServiceToggle(service.id)}
                  />
                  <label 
                    htmlFor={service.id} 
                    className="text-sm cursor-pointer"
                  >
                    {service.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price_estimate">Price Estimate ($)</Label>
              <Input
                id="price_estimate"
                type="number"
                step="0.01"
                value={formData.price_estimate}
                onChange={(e) => setFormData(prev => ({ ...prev, price_estimate: e.target.value }))}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="final_price">Final Price ($)</Label>
              <Input
                id="final_price"
                type="number"
                step="0.01"
                value={formData.final_price}
                onChange={(e) => setFormData(prev => ({ ...prev, final_price: e.target.value }))}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="estimated_duration">Estimated Duration (hours)</Label>
            <Input
              id="estimated_duration"
              type="number"
              step="0.5"
              value={formData.estimated_duration}
              onChange={(e) => setFormData(prev => ({ ...prev, estimated_duration: e.target.value }))}
              placeholder="2"
            />
          </div>

          {/* Scheduling */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduled_date">Date</Label>
              <Input
                id="scheduled_date"
                type="date"
                value={formData.scheduled_date}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduled_start_time">Start Time</Label>
              <Input
                id="scheduled_start_time"
                type="time"
                value={formData.scheduled_start_time}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduled_start_time: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduled_end_time">End Time</Label>
              <Input
                id="scheduled_end_time"
                type="time"
                value={formData.scheduled_end_time}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduled_end_time: e.target.value }))}
              />
            </div>
          </div>

          {/* Assigned Tech */}
          <div className="space-y-2">
            <Label htmlFor="assigned_tech">Assigned Tech/Crew</Label>
            <Input
              id="assigned_tech"
              value={formData.assigned_tech}
              onChange={(e) => setFormData(prev => ({ ...prev, assigned_tech: e.target.value }))}
              placeholder="Tech name or crew"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes & Access Instructions</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Gate code, parking instructions, special requests..."
              rows={4}
            />
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Job
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}