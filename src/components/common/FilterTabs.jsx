import React from 'react';
import { Button } from '@/components/ui/button';

export default function FilterTabs({ filters, activeFilter, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map(filter => (
        <Button
          key={filter.value}
          variant={activeFilter === filter.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(filter.value)}
          className={activeFilter === filter.value 
            ? 'bg-blue-600 hover:bg-blue-700' 
            : 'hover:bg-slate-100'
          }
        >
          {filter.icon && <filter.icon className="w-4 h-4 mr-1.5" />}
          {filter.label}
          {filter.count !== undefined && (
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
              activeFilter === filter.value 
                ? 'bg-white/20' 
                : 'bg-slate-100'
            }`}>
              {filter.count}
            </span>
          )}
        </Button>
      ))}
    </div>
  );
}