/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Eye,
  Search,
  MessageSquare,
  Globe,
  Monitor,
  Smartphone,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  UserCheck
} from 'lucide-react';
import { ChatScenario } from '../types/chat';

export interface OnlineVisitor {
  id: string;
  name: string;
  location: string;
  ip: string;
  device: 'desktop' | 'mobile';
  browser: string;
  currentPage: string;
  pageTitle: string;
  duration: string;
  status: 'active' | 'idle' | 'typing';
  suggestedPrompt: string;
}

// Empty by default: visitors appear only when active or simulated
const INITIAL_VISITORS: OnlineVisitor[] = [];

interface OnlineVisitorsViewProps {
  onStartChatWithVisitor: (visitor: OnlineVisitor) => void;
  theme?: 'dark' | 'light';
}

export const OnlineVisitorsView: React.FC<OnlineVisitorsViewProps> = ({
  onStartChatWithVisitor,
  theme = 'dark',
}) => {
  const [visitors, setVisitors] = useState<OnlineVisitor[]>(INITIAL_VISITORS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDevice, setFilterDevice] = useState<'all' | 'desktop' | 'mobile'>('all');

  const filtered = visitors.filter((v) => {
    const matchesSearch =
      v.name.includes(searchQuery) ||
      v.location.includes(searchQuery) ||
      v.currentPage.includes(searchQuery) ||
      v.pageTitle.includes(searchQuery);
    const matchesDevice = filterDevice === 'all' || v.device === filterDevice;
    return matchesSearch && matchesDevice;
  });

  const isDark = theme === 'dark';

  return (
    <div
      className={`flex-1 flex flex-col h-full overflow-hidden select-none ${
        isDark ? 'bg-[#333333] text-gray-100' : 'bg-[#f4f5f7] text-gray-800'
      }`}
    >
      {/* Header Bar */}
      <div
        className={`h-16 px-6 border-b flex items-center justify-between shrink-0 ${
          isDark ? 'bg-[#2b2b2b] border-[#3d3d3d]' : 'bg-white border-gray-200 shadow-xs'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00acc1]/15 text-[#00acc1] border border-[#00acc1]/30 flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm sm:text-base flex items-center gap-2">
              <span>رصد آنلاین بازدیدکنندگان وب‌سایت</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1 font-normal">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {visitors.length} کاربر آنلاین
              </span>
            </h2>
            <p className="text-xs text-gray-400">
              مشاهده صفحات در حال مرور و امکان شروع گفتگوی پیش‌دستانه (Proactive Chat) با کاربران
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            // refresh list animation
            setVisitors([...INITIAL_VISITORS]);
          }}
          className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
            isDark
              ? 'bg-[#353535] border-[#444444] text-gray-300 hover:text-white'
              : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
          }`}
          title="بروزرسانی زنده"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">بروزرسانی</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        className={`px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 text-xs ${
          isDark ? 'bg-[#252525] border-[#383838]' : 'bg-gray-50 border-gray-200'
        }`}
      >
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border w-full ${
              isDark ? 'bg-[#1e1e1e] border-[#3d3d3d]' : 'bg-white border-gray-300'
            }`}
          >
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو بر اساس نام، صفحه، شهر یا آی‌پی..."
              className="bg-transparent focus:outline-none w-full text-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-gray-400">دستگاه:</span>
          {(['all', 'desktop', 'mobile'] as const).map((dev) => (
            <button
              key={dev}
              onClick={() => setFilterDevice(dev)}
              className={`px-3 py-1 rounded-md transition-colors ${
                filterDevice === dev
                  ? 'bg-[#00acc1] text-white font-medium shadow-xs'
                  : isDark
                  ? 'bg-[#303030] text-gray-300 hover:text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {dev === 'all' ? 'همه' : dev === 'desktop' ? 'کامپیوتر' : 'موبایل'}
            </button>
          ))}
        </div>
      </div>

      {/* Visitors List Cards */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {filtered.map((visitor) => (
          <div
            key={visitor.id}
            className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              isDark
                ? 'bg-[#282828] border-[#3a3a3a] hover:border-[#00acc1]/50 hover:bg-[#2d2d2d]'
                : 'bg-white border-gray-200 hover:border-[#00acc1]/60 shadow-xs hover:shadow-md'
            }`}
          >
            {/* Right: Visitor details */}
            <div className="flex items-start gap-3.5">
              <div className="relative shrink-0 mt-1">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                    visitor.device === 'desktop'
                      ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                      : 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                  }`}
                >
                  {visitor.device === 'desktop' ? (
                    <Monitor className="w-5 h-5" />
                  ) : (
                    <Smartphone className="w-5 h-5" />
                  )}
                </div>
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#282828]" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">{visitor.name}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      visitor.status === 'typing'
                        ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-800/40 animate-pulse'
                        : visitor.status === 'active'
                        ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/40'
                        : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {visitor.status === 'typing'
                      ? 'در حال تایپ'
                      : visitor.status === 'active'
                      ? 'فعال در صفحه'
                      : 'غیرفعال'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-gray-400" />
                    <span>{visitor.location} ({visitor.ip})</span>
                  </span>
                  <span>•</span>
                  <span>{visitor.browser}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-amber-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>حضور: {visitor.duration}</span>
                  </span>
                </div>

                <div className="mt-1 text-xs">
                  <span className="text-gray-400">صفحه فعلی: </span>
                  <span className="text-[#00acc1] font-semibold">{visitor.pageTitle}</span>
                  <span className="text-[11px] text-gray-400 mr-2 font-mono">({visitor.currentPage})</span>
                </div>
              </div>
            </div>

            {/* Left: Action button */}
            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <button
                onClick={() => onStartChatWithVisitor(visitor)}
                className="px-4 py-2.5 rounded-xl bg-[#00acc1] hover:bg-[#0097a7] text-white text-xs font-bold transition-all shadow-md shadow-cyan-950/30 flex items-center gap-2 group"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>شروع گفتگو با این کاربر</span>
                <ArrowRight className="w-4 h-4 group-hover:-translate-x-1 transition-transform rotate-180" />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="p-16 text-center text-gray-400 text-xs flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-[#282828] border border-[#383838] flex items-center justify-center mb-3 text-gray-500">
              <Eye className="w-8 h-8 stroke-[1.5]" />
            </div>
            <p className="text-sm font-bold text-gray-300">در حال حاضر هیچ بازدیدکننده‌ای آنلاین نیست</p>
            <p className="text-xs text-gray-400 mt-1 max-w-sm leading-relaxed">
              با مراجعه کاربران به وب‌سایت یا آغاز سناریوی تعاملی، بازدیدکنندگان به صورت زنده در این صفحه رصد خواهند شد.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
