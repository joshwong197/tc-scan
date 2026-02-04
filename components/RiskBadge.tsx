import React from 'react';
import { AlertTriangle, CheckCircle, AlertOctagon } from 'lucide-react';

interface RiskBadgeProps {
  level: 'Low' | 'Medium' | 'High';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level }) => {
  if (level === 'High') {
    return (
      <div className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold border border-red-200">
        <AlertOctagon size={16} />
        <span>High Risk</span>
      </div>
    );
  }
  if (level === 'Medium') {
    return (
      <div className="flex items-center gap-2 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-semibold border border-amber-200">
        <AlertTriangle size={16} />
        <span>Medium Risk</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-semibold border border-emerald-200">
      <CheckCircle size={16} />
      <span>Low Risk</span>
    </div>
  );
};
