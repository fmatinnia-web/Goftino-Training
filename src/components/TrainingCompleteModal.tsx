/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Award, CheckCircle, RotateCcw, ArrowRight, Star, Clock, MessageSquare, Sparkles } from 'lucide-react';
import { ChatScenario, ChatSession } from '../types/chat';

interface TrainingCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: ChatScenario;
  session: ChatSession;
  onReplay: () => void;
  onNextScenario: () => void;
  hasNextScenario: boolean;
}

export const TrainingCompleteModal: React.FC<TrainingCompleteModalProps> = ({
  isOpen,
  onClose,
  scenario,
  session,
  onReplay,
  onNextScenario,
  hasNextScenario,
}) => {
  if (!isOpen) return null;

  const agentMessagesCount = session.messages.filter((m) => m.sender === 'agent').length;
  const userMessagesCount = session.messages.filter((m) => m.sender === 'user').length;

  const avgResponseTime =
    session.agentResponseTimes.length > 0
      ? (
          session.agentResponseTimes.reduce((a, b) => a + b, 0) /
          session.agentResponseTimes.length
        ).toFixed(1)
      : '3.4';

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-[#242424] border border-[#3e3e3e] rounded-3xl w-full max-w-lg p-6 flex flex-col items-center text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200 relative overflow-hidden">
        {/* Glow backdrop decoration */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#00bcd4]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Success Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#00bcd4] to-emerald-400 p-0.5 shadow-lg shadow-cyan-900/30 mb-4">
          <div className="w-full h-full bg-[#1e1e1e] rounded-[14px] flex items-center justify-center">
            <Award className="w-8 h-8 text-[#00bcd4]" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-1">
          پایان گفتگو - آموزش تکمیل شد
        </h3>
        <p className="text-xs text-gray-400 mb-6">
          Chat Ended - Training Complete • سناریوی «{scenario.customerName}» با موفقیت به پایان رسید.
        </p>

        {/* Performance Metrics Cards */}
        <div className="grid grid-cols-3 gap-3 w-full mb-6">
          <div className="bg-[#2b2b2b] border border-[#383838] p-3 rounded-xl flex flex-col items-center">
            <MessageSquare className="w-4 h-4 text-cyan-400 mb-1" />
            <span className="text-base font-bold text-white">
              {agentMessagesCount}
            </span>
            <span className="text-[10px] text-gray-400">پیام‌های ارسال‌شده</span>
          </div>

          <div className="bg-[#2b2b2b] border border-[#383838] p-3 rounded-xl flex flex-col items-center">
            <Clock className="w-4 h-4 text-amber-400 mb-1" />
            <span className="text-base font-bold text-white">
              {avgResponseTime} ثانیه
            </span>
            <span className="text-[10px] text-gray-400">میانگین زمان پاسخ</span>
          </div>

          <div className="bg-[#2b2b2b] border border-[#383838] p-3 rounded-xl flex flex-col items-center">
            <Star className="w-4 h-4 text-emerald-400 fill-emerald-400 mb-1" />
            <span className="text-base font-bold text-white">۵ از ۵</span>
            <span className="text-[10px] text-gray-400">رضایت کاربر مجازی</span>
          </div>
        </div>

        {/* Evaluation Checklist */}
        <div className="w-full bg-[#1e1e1e] border border-[#333333] rounded-xl p-3.5 mb-6 text-right space-y-2 text-xs">
          <div className="text-gray-300 font-semibold mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>ارزیابی عملکرد اپراتور کارآموز:</span>
          </div>

          <div className="flex items-center gap-2 text-gray-300">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>رعایت اصول احترام و آغاز مکالمه با سلام و لحن حرفه‌ای</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>پاسخگویی به تمام دغدغه‌های مطرح شده در سناریو ({userMessagesCount} پیام)</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>پایان‌بندی استاندارد گفتگو و راهنمایی شفاف برای مراحل بعد</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={() => {
              onClose();
              onReplay();
            }}
            className="flex-1 py-2.5 px-3 rounded-xl bg-[#333333] hover:bg-[#3d3d3d] text-gray-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-[#444444]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>تکرار سناریو</span>
          </button>

          {hasNextScenario ? (
            <button
              onClick={() => {
                onClose();
                onNextScenario();
              }}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#00bcd4] hover:bg-[#00acc1] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-cyan-900/30"
            >
              <span>سناریوی بعدی</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#00bcd4] hover:bg-[#00acc1] text-white text-xs font-semibold flex items-center justify-center transition-colors shadow-md shadow-cyan-900/30"
            >
              متوجه شدم
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
