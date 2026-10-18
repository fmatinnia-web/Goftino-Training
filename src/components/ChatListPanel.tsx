/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, Users, ArrowUpDown, Circle, UserCheck, Clock, MessageSquare } from 'lucide-react';
import { AppUser, ChatScenario, ChatSession } from '../types/chat';

interface ChatListPanelProps {
  currentUser: AppUser | null;
  scenarios: ChatScenario[];
  sessions: Record<string, ChatSession>;
  activeScenarioId: string | null;
  onSelectScenario: (scenario: ChatScenario) => void;
  activeFilterTab: 'waiting' | 'my_chats' | 'other_chats';
  setActiveFilterTab: (tab: 'waiting' | 'my_chats' | 'other_chats') => void;
  completedScenarioIds: string[];
  theme?: 'dark' | 'light';
}

export const ChatListPanel: React.FC<ChatListPanelProps> = ({
  currentUser,
  scenarios,
  sessions,
  activeScenarioId,
  onSelectScenario,
  activeFilterTab,
  setActiveFilterTab,
  completedScenarioIds,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  // Filter scenarios based on tab & assignments
  const filteredScenarios = scenarios.filter((sc) => {
    const session = sessions[sc.id];
    const isAssignedToMe = session?.assignedAgentId === currentUser?.id;
    const isAssignedToOther = session?.assignedAgentId && session.assignedAgentId !== currentUser?.id;

    if (activeFilterTab === 'waiting') {
      // Waiting: either unassigned, or not yet completed
      return !isAssignedToMe && !isAssignedToOther;
    }
    if (activeFilterTab === 'my_chats') {
      // Assigned to current logged in agent
      return isAssignedToMe;
    }
    if (activeFilterTab === 'other_chats') {
      // Other agents or completed
      return isAssignedToOther || completedScenarioIds.includes(sc.id);
    }
    return true;
  });

  const waitingCount = scenarios.filter((s) => {
    const sess = sessions[s.id];
    return !sess?.assignedAgentId && !completedScenarioIds.includes(s.id);
  }).length;

  const myChatsCount = scenarios.filter((s) => {
    const sess = sessions[s.id];
    return sess?.assignedAgentId === currentUser?.id;
  }).length;

  return (
    <div
      className={`w-[310px] border-l flex flex-col h-full select-none shrink-0 transition-colors duration-200 ${
        isDark
          ? 'bg-[#272727] border-[#333333] text-gray-100'
          : 'bg-[#fafafa] border-[#e5e7eb] text-gray-800'
      }`}
    >
      {/* Header: Title */}
      <div className="px-5 pt-3.5 pb-2.5 flex items-center justify-between">
        <h2 className="text-base font-semibold">
          گفتگوها
        </h2>
        <span className="text-[11px] text-gray-400">
          {currentUser ? `کاربر: ${currentUser.name}` : ''}
        </span>
      </div>

      {/* 3 Segmented Tabs */}
      <div className="px-3 pb-3">
        <div className="bg-[#00acc1] rounded-lg p-0.5 grid grid-cols-3 gap-0.5 text-xs text-white">
          {/* Waiting Tab */}
          <button
            onClick={() => setActiveFilterTab('waiting')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-md transition-all ${
              activeFilterTab === 'waiting'
                ? 'bg-[#00bcd4] text-white font-medium shadow-sm'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <div className="relative mb-0.5 flex items-center justify-center">
              <User className="w-4 h-4" />
              {waitingCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#f43f5e] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                  {waitingCount}
                </span>
              )}
            </div>
            <span className="text-[11px] whitespace-nowrap">در حال انتظار</span>
          </button>

          {/* My Chats Tab */}
          <button
            onClick={() => setActiveFilterTab('my_chats')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-md transition-all ${
              activeFilterTab === 'my_chats'
                ? 'bg-[#00bcd4] text-white font-medium shadow-sm'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <div className="relative mb-0.5 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
              {myChatsCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-emerald-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                  {myChatsCount}
                </span>
              )}
            </div>
            <span className="text-[11px] whitespace-nowrap">گفتگوهای من</span>
          </button>

          {/* Other Chats Tab */}
          <button
            onClick={() => setActiveFilterTab('other_chats')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-md transition-all ${
              activeFilterTab === 'other_chats'
                ? 'bg-[#00bcd4] text-white font-medium shadow-sm'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Users className="w-4 h-4 mb-0.5" />
            <span className="text-[11px] whitespace-nowrap">گفتگوهای دیگر</span>
          </button>
        </div>
      </div>

      {/* Chat List Items */}
      <div
        className={`flex-1 overflow-y-auto divide-y px-1.5 ${
          isDark ? 'divide-[#323232]/70' : 'divide-gray-200'
        }`}
      >
        {filteredScenarios.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-xs flex flex-col items-center justify-center">
            <MessageSquare className="w-8 h-8 text-gray-500 mb-2 stroke-[1.5]" />
            <p className="font-semibold text-gray-300">هیچ گفتگویی موجود نیست</p>
            <p className="text-[11px] text-gray-400 mt-1 max-w-[200px] leading-relaxed">
              با بارگذاری فایل یا متن مکالمه از پنل مدیریت، گفتگوها در این بخش قرار می‌گیرند.
            </p>
          </div>
        ) : (
          filteredScenarios.map((scenario) => {
            const session = sessions[scenario.id];
            const isSelected = activeScenarioId === scenario.id;
            const isCompleted = completedScenarioIds.includes(scenario.id);
            const isAssignedToMe = session?.assignedAgentId === currentUser?.id;

            return (
              <div
                key={scenario.id}
                onClick={() => onSelectScenario(scenario)}
                className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-150 mb-0.5 ${
                  isSelected
                    ? isDark
                      ? 'bg-[#353535] text-white ring-1 ring-[#00bcd4]/30'
                      : 'bg-cyan-50 text-cyan-900 ring-1 ring-[#00bcd4]/40'
                    : isDark
                    ? 'hover:bg-[#2f2f2f] text-gray-200'
                    : 'hover:bg-gray-100 text-gray-800'
                }`}
              >
                {/* Right Side: Avatar + Details */}
                <div className="flex items-center gap-3 min-w-0 pr-1">
                  {/* Avatar with online dot */}
                  <div className="relative shrink-0">
                    <div
                      className={`w-11 h-11 rounded-full border flex items-center justify-center overflow-hidden ${
                        isDark ? 'bg-[#3d3d3d] border-[#4a4a4a]' : 'bg-gray-200 border-gray-300'
                      }`}
                    >
                      {scenario.customerAvatar ? (
                        <img
                          src={scenario.customerAvatar}
                          alt={scenario.customerName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#424242] text-gray-300">
                          <User className="w-6 h-6 stroke-[1.5]" />
                        </div>
                      )}
                    </div>
                    {/* Green online badge */}
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#10b981] border-2 border-[#272727] rounded-full" />
                  </div>

                  {/* Name & Last Message */}
                  <div className="min-w-0 flex flex-col justify-center">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm truncate">
                        {scenario.customerName}
                      </span>
                      {isCompleted ? (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                          تکمیل شد
                        </span>
                      ) : isAssignedToMe ? (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950/70 text-cyan-300 border border-cyan-800/40">
                          تخصیص به شما
                        </span>
                      ) : session?.assignedAgentName ? (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-950/70 text-purple-300 border border-purple-800/40">
                          {session.assignedAgentName}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5 max-w-[130px] text-right">
                      {session?.messages?.[session.messages.length - 1]?.text || scenario.previewMessage}
                    </p>
                  </div>
                </div>

                {/* Left Side: Unread Badge & Time */}
                <div className="flex flex-col items-end shrink-0 pl-1">
                  {!isCompleted && scenario.unreadCount > 0 ? (
                    <span className="bg-[#e91e63] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                      {scenario.unreadCount}
                    </span>
                  ) : (
                    <span className="h-5" />
                  )}
                  <span className="text-[10px] text-gray-400 mt-1">
                    لحظاتی پیش
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Filter/Sort Bar */}
      <div
        className={`p-3 border-t flex items-center justify-between text-xs ${
          isDark ? 'border-[#333333] text-gray-400' : 'border-gray-200 text-gray-500'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" />
          <span className="text-[11px]">محیط آموزش آنلاین گفتینو</span>
        </div>
        <button
          className={`p-1.5 rounded transition-colors ${
            isDark ? 'hover:bg-[#333333] hover:text-white' : 'hover:bg-gray-200 hover:text-gray-900'
          }`}
          title="مرتب‌سازی گفتگوها"
        >
          <ArrowUpDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
