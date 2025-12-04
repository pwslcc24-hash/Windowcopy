import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Phone, 
  Mail, 
  MapPin, 
  ChevronRight, 
  Star,
  DollarSign,
  Building2,
  Home
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CustomerCard({ customer, jobCount = 0, latestJobStatus }) {
  return (
    <Card className="p-5 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            customer.customer_type === 'commercial' ? 'bg-purple-100' : 'bg-blue-100'
          }`}>
            {customer.customer_type === 'commercial' ? (
              <Building2 className="w-6 h-6 text-purple-600" />
            ) : (
              <Home className="w-6 h-6 text-blue-600" />
            )}
          </div>
          <div>
            <Link 
              to={createPageUrl('CustomerDetail') + `?id=${customer.id}`}
              className="text-lg font-semibold text-slate-900 hover:text-blue-600 transition-colors"
            >
              {customer.full_name}
            </Link>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs capitalize">
                {customer.customer_type || 'residential'}
              </Badge>
              {customer.left_review && (
                <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Reviewed
                </Badge>
              )}
            </div>
          </div>
        </div>
        <Link to={createPageUrl('CustomerDetail') + `?id=${customer.id}`}>
          <Button variant="ghost" size="icon">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </Link>
      </div>

      <div className="space-y-2 text-sm text-slate-600">
        {customer.mobile_number && (
          <a 
            href={`tel:${customer.mobile_number}`}
            className="flex items-center gap-2 hover:text-blue-600 transition-colors"
          >
            <Phone className="w-4 h-4 text-slate-400" />
            {customer.mobile_number}
          </a>
        )}
        {customer.email && (
          <a 
            href={`mailto:${customer.email}`}
            className="flex items-center gap-2 hover:text-blue-600 transition-colors"
          >
            <Mail className="w-4 h-4 text-slate-400" />
            {customer.email}
          </a>
        )}
        {customer.address && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="truncate">{customer.address}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-1 text-sm text-slate-600">
          <DollarSign className="w-4 h-4 text-green-600" />
          <span className="font-medium text-green-600">
            ${customer.total_revenue?.toFixed(2) || '0.00'}
          </span>
          <span className="text-slate-400 ml-1">total</span>
        </div>
        <div className="text-sm text-slate-500">
          {jobCount} job{jobCount !== 1 ? 's' : ''}
        </div>
      </div>
    </Card>
  );
}