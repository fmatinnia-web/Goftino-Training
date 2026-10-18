/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  User,
  CheckCheck,
  FileText,
  Sparkles,
  X,
  CheckCircle2,
  UserPlus
} from 'lucide-react';
import { AppUser, ChatScenario, ChatSession, ChatMessage } from '../types/chat';
import { CANNED_RESPONSES } from '../data/defaultScenarios';
import { soundManager } from '../utils/sound';
import { CannedResponseItem } from './SettingsModal';

interface ActiveChatViewProps {
  currentUser: AppUser | null;
  scenario: ChatScenario;
  session: ChatSession;
  onSendMessage: (text: string) => void;
  onResetSession: () => void;
  onOpenScenarioModal: () => void;
  onClaimChat: (scenarioId: string) => void;
  userTypingDelay: number;
  cannedResponses?: CannedResponseItem[];
  theme?: 'dark' | 'light';
  onCloseChat?: () => void;
}

export const ActiveChatView: React.FC<ActiveChatViewProps> = ({
  currentUser,
  scenario,
  session,
  onSendMessage,
  onResetSession,
  onOpenScenarioModal,
  onClaimChat,
  userTypingDelay,
  cannedResponses,
  theme = 'dark',
  onCloseChat,
}) => {
  const [inputText, setInputText] = useState('');
  const [showCannedResponses, setShowCannedResponses] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isDark = theme === 'dark';
  const effectiveCanned = cannedResponses && cannedResponses.length > 0 ? cannedResponses : CANNED_RESPONSES.map((c, i) => ({ id: `c-${i}`, ...c }));

  const isAssignedToOther = !!(session.assignedAgentId && session.assignedAgentId !== currentUser?.id);
  const isUnassigned = !session.assignedAgentId;

  // Auto scroll on new messages or typing state change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages, session.isUserTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (!isAssignedToOther) {
      inputRef.current?.focus();
    }
  }, [scenario.id, isAssignedToOther]);

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed || session.isUserTyping || isAssignedToOther) return;
    
    // Auto-claim if not claimed yet
    if (isUnassigned) {
      onClaimChat(scenario.id);
    }
    
    onSendMessage(trimmed);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const insertCannedResponse = (text: string) => {
    setInputText(text);
    setShowCannedResponses(false);
    inputRef.current?.focus();
  };

  return (
    <div
      className={`flex-1 flex flex-col h-full select-text relative transition-colors duration-200 ${
        isDark ? 'bg-[#333333] text-gray-100' : 'bg-[#f4f5f7] text-gray-800'
      }`}
    >
      {/* Top Header of Active Chat */}
      <div
        className={`h-14 px-4 flex items-center justify-between select-none shrink-0 z-10 border-b ${
          isDark
            ? 'bg-[#2b2b2b] border-[#3d3d3d] text-gray-100'
            : 'bg-white border-gray-200 text-gray-800 shadow-xs'
        }`}
      >
        {/* Right side: User info */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-[#424242] border border-[#525252] flex items-center justify-center overflow-hidden">
              {scenario.customerAvatar ? (
                <img
                  src={scenario.customerAvatar}
                  alt={scenario.customerName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-gray-300" />
              )}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#2b2b2b]" />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">
              {scenario.customerName}
            </span>
            <span className="text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
              آنلاین
            </span>
          </div>
        </div>

        {/* Left side: Close Chat Button */}
        <div className="flex items-center gap-2">
          {onCloseChat && (
            <button
              onClick={onCloseChat}
              className={`p-1.5 rounded-lg border transition-all flex items-center justify-center ${
                isDark
                  ? 'border-[#444444] text-gray-400 hover:text-white hover:bg-[#3d3d3d]'
                  : 'border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
              title="بستن گفتگو"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Thread Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* System Welcome Notice */}
        <div className="flex justify-center my-2 select-none">
          <div
            className={`text-xs px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-xs border ${
              isDark
                ? 'bg-[#262626]/80 border-[#3e3e3e] text-gray-400'
                : 'bg-white border-gray-200 text-gray-600'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00bcd4]" />
            <span>گفتگوی آموزشی با کاربر «{scenario.customerName}» آغاز شد</span>
          </div>
        </div>

        {/* Message Items */}
        {session.messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isSystem = msg.sender === 'system';

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-1 select-none">
                <span
                  className={`text-[11px] px-3 py-1 rounded-md border ${
                    isDark
                      ? 'bg-[#252525] text-gray-400 border-[#383838]'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                >
                  {msg.text}
                </span>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2.5 ${
                isUser ? 'justify-start' : 'justify-end'
              }`}
            >
              {/* If User message: show user avatar */}
              {isUser && (
                <div className="w-7 h-7 rounded-full bg-[#444444] border border-[#525252] overflow-hidden shrink-0 select-none">
                  {scenario.customerAvatar ? (
                    <img
                      src={scenario.customerAvatar}
                      alt={scenario.customerName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-gray-300 m-auto mt-1" />
                  )}
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-[75%] sm:max-w-[65%] rounded-2xl p-3.5 shadow-sm text-sm leading-relaxed transition-all ${
                  isUser
                    ? isDark
                      ? 'bg-[#262626] text-gray-100 rounded-br-none border border-[#3d3d3d]'
                      : 'bg-white text-gray-800 rounded-br-none border border-gray-200 shadow-xs'
                    : 'bg-[#00acc1] text-white rounded-bl-none shadow-md shadow-cyan-950/20 font-normal'
                }`}
              >
                {/* Sender Title in Bubble */}
                <div
                  className={`text-[11px] mb-1 font-semibold select-none ${
                    isUser
                      ? isDark
                        ? 'text-cyan-400'
                        : 'text-cyan-600'
                      : 'text-cyan-100'
                  }`}
                >
                  {isUser
                    ? scenario.customerName
                    : session.assignedAgentName
                    ? `${session.assignedAgentName} (کارشناس پشتیبانی)`
                    : 'شما (اپراتور پشتیبانی)'}
                </div>

                {/* Message Body */}
                <p className="whitespace-pre-wrap select-text">{msg.text}</p>

                {/* Time & Delivery Checkmark */}
                <div
                  className={`flex items-center justify-end gap-1 mt-1 text-[10px] select-none ${
                    isUser ? 'text-gray-400' : 'text-cyan-100/90'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {!isUser && (
                    <CheckCheck className="w-3.5 h-3.5 text-white/90" />
                  )}
                </div>
              </div>

              {/* If Agent message: show agent avatar */}
              {!isUser && (
                <div className="w-7 h-7 rounded-full bg-cyan-700 border border-cyan-500/50 overflow-hidden shrink-0 select-none flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">پشتیبان</span>
                </div>
              )}
            </div>
          );
        })}

        {/* Animated AI Customer Typing Indicator (Triggered strictly when agent responds) */}
        {session.isUserTyping && (
          <div className="flex items-end gap-2.5 justify-start select-none animate-in fade-in duration-200">
            <div className="w-7 h-7 rounded-full bg-[#444444] border border-[#525252] overflow-hidden shrink-0">
              {scenario.customerAvatar ? (
                <img
                  src={scenario.customerAvatar}
                  alt={scenario.customerName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-gray-300 m-auto mt-1" />
              )}
            </div>

            <div
              className={`rounded-2xl rounded-br-none px-4 py-2.5 flex items-center gap-2 shadow-sm border ${
                isDark
                  ? 'bg-[#262626] border-[#3d3d3d]'
                  : 'bg-white border-gray-200 text-gray-800'
              }`}
            >
              <span className="text-xs text-[#00acc1] font-medium">
                {scenario.customerName} در حال نوشتن است...
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 bg-[#00acc1] rounded-full animate-typing-dot-1" />
                <span className="w-1.5 h-1.5 bg-[#00acc1] rounded-full animate-typing-dot-2" />
                <span className="w-1.5 h-1.5 bg-[#00acc1] rounded-full animate-typing-dot-3" />
              </div>
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Canned Responses Popover */}
      {showCannedResponses && (
        <div
          className={`absolute bottom-24 right-6 left-6 max-w-xl mx-auto border rounded-xl shadow-2xl p-3 z-30 select-none animate-in fade-in slide-in-from-bottom-2 ${
            isDark
              ? 'bg-[#242424] border-[#444444] text-gray-100'
              : 'bg-white border-gray-300 text-gray-800'
          }`}
        >
          <div
            className={`flex items-center justify-between pb-2 border-b mb-2 ${
              isDark ? 'border-[#363636]' : 'border-gray-200'
            }`}
          >
            <span className="text-xs font-bold flex items-center gap-1.5 text-[#00acc1]">
              <FileText className="w-3.5 h-3.5" />
              پاسخ‌های آماده (Canned Responses)
            </span>
            <button
              onClick={() => setShowCannedResponses(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1.5 max-h-56 overflow-y-auto">
            {effectiveCanned.map((item) => (
              <button
                key={item.id}
                onClick={() => insertCannedResponse(item.text)}
                className={`w-full text-right p-2.5 rounded-lg text-xs transition-colors flex flex-col gap-0.5 border ${
                  isDark
                    ? 'bg-[#2d2d2d] hover:bg-[#363636] border-transparent hover:border-[#00bcd4]/30 text-gray-200'
                    : 'bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-[#00bcd4]/40 text-gray-700'
                }`}
              >
                <span className="font-semibold text-[#00acc1] text-[11px]">
                  {item.title}
                </span>
                <span className="line-clamp-2 text-gray-400">{item.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Input Area */}
      <div
        className={`border-t p-3 select-none shrink-0 ${
          isDark
            ? 'bg-[#282828] border-[#3d3d3d]'
            : 'bg-white border-gray-200 shadow-sm'
        }`}
      >
        {/* Quick Toolbar above input */}
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCannedResponses(!showCannedResponses)}
              disabled={isAssignedToOther}
              className={`px-2.5 py-1 rounded-md text-xs flex items-center gap-1.5 transition-colors border ${
                showCannedResponses
                  ? 'bg-[#00bcd4] text-white border-[#00bcd4]'
                  : isDark
                  ? 'bg-[#333333] text-gray-300 border-[#444444] hover:text-white hover:bg-[#3d3d3d]'
                  : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>پاسخ‌های آماده</span>
            </button>

            <button
              onClick={onOpenScenarioModal}
              className={`px-2.5 py-1 rounded-md text-xs flex items-center gap-1.5 border transition-colors ${
                isDark
                  ? 'bg-[#333333] text-gray-300 border-[#444444] hover:text-cyan-300 hover:bg-[#3d3d3d]'
                  : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>سناریوهای آموزشی</span>
            </button>
          </div>

          <div className="text-[11px] text-gray-400">
            {session.isUserTyping ? (
              <span className="text-[#00acc1] animate-pulse">کاربر در حال تایپ پاسخ...</span>
            ) : isUnassigned ? (
              <span className="text-[#00acc1]">با نوشتن و ارسال پاسخ، چت به شما تخصیص یافته و کاربر پاسخ بعدی را ارسال می‌کند</span>
            ) : (
              <span>پیام بعدی کاربر پس از ارسال پاسخ شما فرستاده خواهد شد • Enter برای ارسال</span>
            )}
          </div>
        </div>

        {/* Input box and Send Button */}
        <div
          className={`flex items-end gap-2 rounded-xl border p-2 transition-colors ${
            isDark
              ? 'bg-[#1f1f1f] border-[#3e3e3e] focus-within:border-[#00bcd4]'
              : 'bg-gray-50 border-gray-300 focus-within:border-[#00bcd4]'
          }`}
        >
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={session.isUserTyping || isAssignedToOther}
            placeholder={
              isAssignedToOther
                ? 'این گفتگو توسط کارشناس دیگری در حال پاسخگویی است.'
                : session.isUserTyping
                ? 'لطفاً صبر کنید، کاربر در حال پاسخ به پیام شما است...'
                : isUnassigned
                ? 'پاسخ حرفه‌ای خود را به کاربر بنویسید (ارسال پیام = تخصیص و شروع چت)...'
                : 'پاسخ حرفه‌ای خود را به عنوان پشتیبان بنویسید...'
            }
            rows={2}
            className={`flex-1 bg-transparent text-sm resize-none focus:outline-none px-2 py-1 select-text disabled:opacity-50 ${
              isDark ? 'text-gray-100 placeholder-gray-400' : 'text-gray-800 placeholder-gray-400'
            }`}
          />

          <div className="flex items-center gap-1 shrink-0 pb-1">
            {isUnassigned && !inputText.trim() ? (
              <button
                onClick={() => onClaimChat(scenario.id)}
                className="px-3 py-2 rounded-lg bg-[#00bcd4] hover:bg-[#00acc1] text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                title="تخصیص این گفتگو به خودم"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>تخصیص به من</span>
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || session.isUserTyping || isAssignedToOther}
                className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                  inputText.trim() && !session.isUserTyping && !isAssignedToOther
                    ? 'bg-[#00bcd4] text-white hover:bg-[#00acc1] shadow-md shadow-cyan-900/30 cursor-pointer'
                    : 'bg-[#333333] text-gray-500 cursor-not-allowed'
                }`}
                title="ارسال پیام (Enter) - پیام بعدی کاربر پس از این ارسال خواهد شد"
              >
                <Send className="w-4 h-4 rotate-180" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
