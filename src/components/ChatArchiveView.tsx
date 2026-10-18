/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileText,
  Search,
  Calendar,
  User,
  Star,
  CheckCircle2,
  Clock,
  MessageSquare,
  Download,
  RotateCcw,
  ChevronLeft,
  X
} from 'lucide-react';
import { ChatScenario, ChatSession } from '../types/chat';

interface ChatArchiveViewProps {
  scenarios: ChatScenario[];
  sessions: Record<string, ChatSession>;
  onReopenChat: (scenarioId: string) => void;
  theme?: 'dark' | 'light';
}

export const ChatArchiveView: React.FC<ChatArchiveViewProps> = ({
  scenarios,
  sessions,
  onReopenChat,
  theme = 'dark',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const isDark = theme === 'dark';

  // Include completed sessions or all stored conversations in archive
  const archiveItems = scenarios.map((sc) => {
    const session = sessions[sc.id];
    return {
      scenario: sc,
      session,
      isCompleted: session?.status === 'completed',
      agentName: session?.assignedAgentName || 'ناشناس / بدون اپراتور',
      messagesCount: session?.messages?.length || sc.userMessages.length,
      lastMsg:
        session?.messages?.[session.messages.length - 1]?.text || sc.previewMessage,
      score: session?.adminReview?.score || 5,
      date: sc.createdAt || '۱۴۰۳/۰۷/۲۷',
    };
  });

  const filtered = archiveItems.filter((item) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      item.scenario.customerName.toLowerCase().includes(query) ||
      item.agentName.toLowerCase().includes(query) ||
      item.scenario.category.toLowerCase().includes(query) ||
      item.lastMsg.toLowerCase().includes(query)
    );
  });

  const selectedItem = selectedSessionId
    ? archiveItems.find((i) => i.scenario.id === selectedSessionId)
    : null;

  const exportAsTxt = (item: (typeof archiveItems)[0]) => {
    const msgs = item.session?.messages || [];
    const text = msgs
      .map(
        (m) =>
          `[${m.timestamp}] ${m.sender === 'user' ? item.scenario.customerName : 'پشتیبان'}: ${m.text}`
      )
      .join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-archive-${item.scenario.customerName}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`flex-1 flex flex-col h-full overflow-hidden select-none ${
        isDark ? 'bg-[#333333] text-gray-100' : 'bg-[#f4f5f7] text-gray-800'
      }`}
    >
      {/* Header */}
      <div
        className={`h-16 px-6 border-b flex items-center justify-between shrink-0 ${
          isDark ? 'bg-[#2b2b2b] border-[#3d3d3d]' : 'bg-white border-gray-200 shadow-xs'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            {/* Archive Bookmark Card SVG */}
            <svg
              className="w-5 h-5 stroke-[1.8]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="5" y="3.5" width="14" height="17" rx="3.5" />
              <path d="M9 3.5v5.5l2.5-1.5 2.5 1.5V3.5" />
              <line x1="9" y1="14.5" x2="14.5" y2="14.5" />
              <line x1="9" y1="17.5" x2="12" y2="17.5" />
            </svg>
          </div>
          <div>
            <h2 className="font-bold text-sm sm:text-base flex items-center gap-2">
              <span>آرشیو و تاریخچه گفتگوها</span>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded-full font-normal">
                {archiveItems.length} گفتگو در بایگانی
              </span>
            </h2>
            <p className="text-xs text-gray-400">
              جستجو در سوابق مکالمات، بازخوانی ترانسکریپت و بازگشایی مجدد چت‌های گذشته
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div
        className={`px-6 py-3 border-b flex items-center justify-between gap-3 text-xs ${
          isDark ? 'bg-[#252525] border-[#383838]' : 'bg-gray-50 border-gray-200'
        }`}
      >
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border w-full max-w-md ${
            isDark ? 'bg-[#1e1e1e] border-[#3d3d3d]' : 'bg-white border-gray-300'
          }`}
        >
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو بر اساس نام کاربر، کارشناس، کلمات کلیدی یا موضوع..."
            className="bg-transparent focus:outline-none w-full text-xs"
          />
        </div>
      </div>

      {/* Main Content Area: Archive list + Transcript Drawer */}
      <div className="flex-1 overflow-hidden flex flex-row">
        {/* Table / Cards List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filtered.map((item) => {
            const isSelected = selectedSessionId === item.scenario.id;
            return (
              <div
                key={item.scenario.id}
                onClick={() => setSelectedSessionId(item.scenario.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-[#00acc1] bg-[#00acc1]/10 shadow-sm'
                    : isDark
                    ? 'bg-[#282828] border-[#3a3a3a] hover:bg-[#2d2d2d]'
                    : 'bg-white border-gray-200 hover:bg-gray-50 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-[#3d3d3d] border border-[#4a4a4a] flex items-center justify-center overflow-hidden shrink-0">
                    {item.scenario.customerAvatar ? (
                      <img
                        src={item.scenario.customerAvatar}
                        alt={item.scenario.customerName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-gray-300" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{item.scenario.customerName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-700/60 text-gray-300">
                        {item.scenario.category}
                      </span>
                      {item.isCompleted ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-800/40">
                          پایان یافته
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/70 text-amber-300 border border-amber-800/40">
                          در جریان
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-400 mt-1 line-clamp-1 max-w-xl">
                      {item.lastMsg}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-gray-400 mt-1.5">
                      <span>کارشناس: {item.agentName}</span>
                      <span>•</span>
                      <span>تعداد پیام‌ها: {item.messagesCount}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-amber-400">
                        <Star className="w-3 h-3 fill-current" />
                        <span>امتیاز: {item.score} از ۵</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReopenChat(item.scenario.id);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#00acc1]/15 hover:bg-[#00acc1]/25 text-[#00acc1] border border-[#00acc1]/30 text-xs font-semibold flex items-center gap-1 transition-colors"
                    title="بازگشایی مجدد چت برای تمرین یا پاسخگویی"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>بازگشایی چت</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      exportAsTxt(item);
                    }}
                    className={`p-2 rounded-lg border text-gray-400 hover:text-white transition-colors ${
                      isDark ? 'bg-[#333333] border-[#444444]' : 'bg-gray-100 border-gray-300'
                    }`}
                    title="دانلود فایل متن مکالمه"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="p-12 text-center text-gray-400 text-xs">
              <FileText className="w-10 h-10 mx-auto text-gray-400 mb-2" />
              <p>موردی در آرشیو یافت نشد.</p>
            </div>
          )}
        </div>

        {/* Selected Transcript Inspector Panel */}
        {selectedItem && (
          <div
            className={`w-96 border-r flex flex-col h-full animate-in fade-in slide-in-from-left-2 shrink-0 ${
              isDark ? 'bg-[#272727] border-[#383838]' : 'bg-white border-gray-200'
            }`}
          >
            <div
              className={`p-4 border-b flex items-center justify-between ${
                isDark ? 'border-[#333333]' : 'border-gray-200'
              }`}
            >
              <div>
                <h3 className="font-bold text-sm">
                  ترانسکریپت: {selectedItem.scenario.customerName}
                </h3>
                <span className="text-[11px] text-gray-400">
                  اپراتور: {selectedItem.agentName}
                </span>
              </div>
              <button
                onClick={() => setSelectedSessionId(null)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {(selectedItem.session?.messages || []).map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-xl text-xs max-w-[85%] ${
                      isUser
                        ? isDark
                          ? 'bg-[#303030] text-gray-200 border border-[#404040] mr-auto'
                          : 'bg-gray-100 text-gray-800 mr-auto'
                        : 'bg-[#00acc1] text-white ml-auto'
                    }`}
                  >
                    <span className="font-bold text-[10px] block mb-1 opacity-80">
                      {isUser ? selectedItem.scenario.customerName : 'کارشناس'}:
                    </span>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span className="text-[9px] opacity-75 block text-left mt-1">
                      {msg.timestamp}
                    </span>
                  </div>
                );
              })}
            </div>

            <div
              className={`p-3 border-t flex items-center justify-between ${
                isDark ? 'border-[#333333] bg-[#222222]' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <button
                onClick={() => onReopenChat(selectedItem.scenario.id)}
                className="w-full py-2 bg-[#00acc1] hover:bg-[#0097a7] text-white rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>شروع مجدد این گفتگو در میز کار</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
