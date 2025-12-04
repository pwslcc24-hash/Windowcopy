import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import CustomerForm from '@/components/customers/CustomerForm';

const { Customer, Job, Message } = base44.entities;

export default function NewCustomer() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const createCustomerMutation = useMutation({
    mutationFn: async (data) => {
      const customer = await Customer.create(data);

      // Create a lead job for this customer
      const job = await Job.create({
        customer_id: customer.id,
        customer_name: data.full_name,
        customer_address: data.address,
        status: 'lead'
      });

      // Send welcome message
      await Message.create({
        customer_id: customer.id,
        job_id: job.id,
        direction: 'outbound',
        channel: 'text',
        body: `Thanks for reaching out to Deseret Peak Window Cleaning! 🏔️ We'd love to help you get crystal clear windows.\n\nCould you please share:\n1. Your address\n2. Approximately how many windows or the size of your home\n3. Do you prefer mornings or afternoons? What days work best?\n\nWe'll get back to you with a quote right away!`,
        is_auto: true
      });

      return { customer, job };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    }
  });

  const handleSave = async (data) => {
    setError('');
    setSaving(true);
    try {
      const { job } = await createCustomerMutation.mutateAsync(data);
      window.location.href = createPageUrl('JobDetail') + `?id=${job.id}`;
    } catch (err) {
      console.error('Failed to create customer', err);
      setError('Could not create customer. Please check the details and try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to={createPageUrl('Customers')}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">New Customer</h1>
            <p className="text-slate-500">Create a new lead and send welcome message</p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        )}

        <CustomerForm
          onSave={handleSave}
          saving={saving}
          isNew={true}
        />
      </div>
    </div>
  );
}