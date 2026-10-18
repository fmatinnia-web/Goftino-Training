/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Info, Check, ShieldCheck, Sparkles, MessageSquare } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-[#242424] border border-[#3e3e3e] rounded-2xl w-full max-w-md p-5 shadow-2xl text-right animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-[#363636] mb-4">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-cyan-400" />
            <h3 className="text-white font-bold text-sm">
              راهنمای شبیه‌ساز آموزش اپراتور گفتینو
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-gray-300 leading-relaxed">
          <div className="flex items-start gap-2.5 bg-[#2c2c2c] p-2.5 rounded-xl border border-[#383838]">
            <span className="w-5 h-5 rounded-full bg-cyan-900/60 text-cyan-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
              ۱
            </span>
            <p>
              از پنل سمت راست، گفتگوی «عسل سلیمی» یا هر گفتگوی دلخواه دیگری را انتخاب کنید.
            </p>
          </div>

          <div className="flex items-start gap-2.5 bg-[#2c2c2c] p-2.5 rounded-xl border border-[#383838]">
            <span className="w-5 h-5 rounded-full bg-cyan-900/60 text-cyan-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
              ۲
            </span>
            <p>
              سیستم به عنوان «کاربر» اولین پیام سناریو را ارسال می‌کند. پیام را با دقت بخوانید و پاسخ دهید.
            </p>
          </div>

          <div className="flex items-start gap-2.5 bg-[#2c2c2c] p-2.5 rounded-xl border border-[#383838]">
            <span className="w-5 h-5 rounded-full bg-cyan-900/60 text-cyan-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
              ۳
            </span>
            <p>
              پس از ارسال پاسخ توسط شما، کاربر مجازی ۲ تا ۳ ثانیه صبر کرده (همراه با انیمیشن تایپ) و پیام بعدی سناریو را ارسال می‌نماید.
            </p>
          </div>

          <div className="flex items-start gap-2.5 bg-[#2c2c2c] p-2.5 rounded-xl border border-[#383838]">
            <span className="w-5 h-5 rounded-full bg-cyan-900/60 text-cyan-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
              ۴
            </span>
            <p>
              با کلیک روی دکمه سند/یادداشت در نوار ابزار راست یا دکمه سناریو، می‌توانید آرایه دلخواه از پیام‌های JSON بارگذاری کنید.
            </p>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-[#363636] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#00bcd4] hover:bg-[#00acc1] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
          >
            متوجه شدم
          </button>
        </div>
      </div>
    </div>
  );
};
