import React from 'react';
import {
  Users2,
  Search,
  Sparkles,
  Coins,
  TrendingUp,
} from 'lucide-react';
import { StatMetric } from '@/lib/types';

interface StatCardProps {
  stat: StatMetric;
}

export function StatCard({ stat }: StatCardProps) {
  const getIcon = () => {
    switch (stat.iconName) {
      case 'leads':
        return <Users2 className="w-5 h-5 text-[#0b382c]" />;
      case 'searches':
        return <Search className="w-5 h-5 text-[#0b382c]" />;
      case 'messages':
        return <Sparkles className="w-5 h-5 text-[#0b382c]" />;
      case 'credits':
        return <Coins className="w-5 h-5 text-[#0b382c]" />;
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#0b382c]/8 shadow-[0_4px_20px_-4px_rgba(11,56,44,0.05)] hover:shadow-[0_12px_30px_-4px_rgba(11,56,44,0.08)] hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden group">
      {/* Top row: Icon in rounded lime box + Trend Badge */}
      <div className="flex items-center justify-between mb-5">
        <div className="w-12 h-12 rounded-2xl bg-[#c6f432] text-[#0b382c] flex items-center justify-center font-bold shadow-xs transition-transform duration-200 group-hover:scale-105">
          {getIcon()}
        </div>

        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#eef7f2] text-[#0b382c] border border-[#0b382c]/10">
          <TrendingUp className="w-3 h-3 text-emerald-600" />
          <span>{stat.change}</span>
        </span>
      </div>

      {/* Metric Label */}
      <div className="text-xs font-bold uppercase tracking-wider text-[#4f6b61] mb-1.5">
        {stat.title}
      </div>

      {/* Metric Big Value */}
      <div className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#0b382c] mb-2">
        {stat.value}
      </div>

      {/* Subtext info */}
      <div className="text-xs text-[#4f6b61] font-medium flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span>{stat.subtext}</span>
      </div>

      {/* Subtle background gradient glow on hover */}
      <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-[#c6f432]/10 rounded-full blur-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}
