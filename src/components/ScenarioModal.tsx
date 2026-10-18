/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Upload, Code, Check, AlertTriangle, FileText, Sparkles, RefreshCw } from 'lucide-react';
import { ChatScenario } from '../types/chat';
import { DEFAULT_SCENARIOS } from '../data/defaultScenarios';

interface ScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenarios: ChatScenario[];
  activeScenarioId: string | null;
  onSelectAndApplyScenario: (scenario: ChatScenario) => void;
  onAddNewScenario: (scenario: ChatScenario) => void;
  userTypingDelay: number;
  setUserTypingDelay: (delay: number) => void;
}

export const ScenarioModal: React.FC<ScenarioModalProps> = ({
  isOpen,
  onClose,
  scenarios,
  activeScenarioId,
  onSelectAndApplyScenario,
  onAddNewScenario,
  userTypingDelay,
  setUserTypingDelay,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'upload' | 'json_editor' | 'presets'>('upload');
  const [jsonText, setJsonText] = useState<string>(() => {
    return JSON.stringify(
      {
        customerName: 'نام کاربر',
        category: 'موضوع گفتگو',
        userMessages: [
          'سلام، پیام اول کاربر...',
          'پیام دوم کاربر پس از پاسخ کارشناس...'
        ]
      },
      null,
      2
    );
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        setJsonText(text);
        parseAndApplyJson(text);
      } catch (err: unknown) {
        setErrorMsg('خطا در خواندن فایل: فایل JSON نامعتبر است.');
      }
    };
    reader.readAsText(file);
  };

  const parseAndApplyJson = (rawText: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const parsed = JSON.parse(rawText);

      // Support array of strings: ["msg1", "msg2"]
      if (Array.isArray(parsed)) {
        if (parsed.length === 0) {
          throw new Error('آرایه پیام‌ها نباید خالی باشد.');
        }

        const messages: string[] = parsed.map((item) =>
          typeof item === 'string' ? item : item.text || item.message || JSON.stringify(item)
        );

        const newScenario: ChatScenario = {
          id: `custom-${Date.now()}`,
          customerName: 'کاربر سناریوی سفارشی',
          previewMessage: messages[0].slice(0, 32) + '...',
          unreadCount: 1,
          category: 'سناریوی بارگذاری‌شده',
          userMessages: messages,
          hints: ['پاسخ حرفه‌ای و دقیق ارائه دهید']
        };

        onAddNewScenario(newScenario);
        setSuccessMsg(`سناریو با موفقیت ایجاد شد (${messages.length} پیام).`);
        setTimeout(() => onClose(), 800);
        return;
      }

      // Support full scenario object: { customerName, userMessages, ... }
      if (typeof parsed === 'object' && parsed !== null) {
        const messages = parsed.userMessages || parsed.messages;
        if (!Array.isArray(messages) || messages.length === 0) {
          throw new Error('فیلد userMessages باید یک آرایه شامل حداقل یک پیام باشد.');
        }

        const stringMessages = messages.map((m: unknown) =>
          typeof m === 'string' ? m : (m as { text?: string; message?: string }).text || (m as { text?: string; message?: string }).message || String(m)
        );

        const newScenario: ChatScenario = {
          id: `custom-${Date.now()}`,
          customerName: parsed.customerName || 'کاربر شبیه‌ساز',
          previewMessage: stringMessages[0].slice(0, 32) + '...',
          unreadCount: 1,
          category: parsed.category || 'سناریوی دلخواه',
          userMessages: stringMessages,
          hints: Array.isArray(parsed.hints) ? parsed.hints : undefined
        };

        onAddNewScenario(newScenario);
        setSuccessMsg(`سناریوی «${newScenario.customerName}» با موفقیت بارگذاری شد.`);
        setTimeout(() => onClose(), 800);
        return;
      }

      throw new Error('فرمت داده باید یک آرایه از پیام‌ها یا یک آبجکت سناریو باشد.');
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'فرمت JSON نامعتبر است.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-[#242424] border border-[#3d3d3d] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#333333] flex items-center justify-between bg-[#2a2a2a]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#00bcd4]" />
            <h3 className="text-white font-bold text-base">
              مدیریت و بارگذاری سناریوهای آموزشی (Scenario Manager)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-[#333333] bg-[#202020] px-4 pt-2 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('presets')}
            className={`pb-2.5 px-3 font-medium transition-colors border-b-2 ${
              activeTab === 'presets'
                ? 'border-[#00bcd4] text-[#00bcd4]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            سناریوهای استاندارد
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 px-3 font-medium transition-colors border-b-2 ${
              activeTab === 'upload'
                ? 'border-[#00bcd4] text-[#00bcd4]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            بارگذاری فایل JSON
          </button>
          <button
            onClick={() => setActiveTab('json_editor')}
            className={`pb-2.5 px-3 font-medium transition-colors border-b-2 ${
              activeTab === 'json_editor'
                ? 'border-[#00bcd4] text-[#00bcd4]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            ویرایشگر مستقیم JSON
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-5 text-sm space-y-4">
          {errorMsg && (
            <div className="bg-red-950/60 border border-red-800 text-red-200 p-3 rounded-xl flex items-center gap-2 text-xs">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-200 p-3 rounded-xl flex items-center gap-2 text-xs">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 3: Presets / Stored Scenarios */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <p className="text-xs text-gray-400">
                یک سناریو از لیست گفتگوهای موجود انتخاب کنید تا در شبیه‌ساز بارگذاری شود:
              </p>

              {scenarios.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-xs border border-dashed border-[#383838] rounded-xl flex flex-col items-center justify-center">
                  <FileText className="w-8 h-8 text-gray-500 mb-2 stroke-[1.5]" />
                  <p className="font-semibold text-gray-300">هنوز هیچ سناریویی ثبت نشده است</p>
                  <p className="text-[11px] text-gray-400 mt-1 max-w-sm">
                    لطفاً از تب «بارگذاری فایل JSON» یا «ویرایشگر مستقیم JSON» فایل گفتگو را بارگذاری کنید.
                  </p>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="mt-3 px-3 py-1.5 rounded-lg bg-[#00bcd4] text-white text-xs font-semibold hover:bg-[#00acc1] transition-colors"
                  >
                    رفتن به بارگذاری فایل
                  </button>
                </div>
              ) : (
                <div className="grid gap-2.5">
                  {scenarios.map((s) => {
                    const isActive = activeScenarioId === s.id;
                    return (
                      <div
                        key={s.id}
                        onClick={() => {
                          onSelectAndApplyScenario(s);
                          onClose();
                        }}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isActive
                            ? 'bg-[#00bcd4]/10 border-[#00bcd4] text-white shadow-xs'
                            : 'bg-[#2b2b2b] border-[#383838] hover:bg-[#323232] text-gray-200'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm">{s.customerName}</span>
                            <span className="text-[11px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-800/40">
                              {s.category}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            تعداد پیام‌های کاربر: {s.userMessages.length} مرحله
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5 truncate max-w-md">
                            شروع با: «{s.userMessages[0]}»
                          </p>
                        </div>

                        <button
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                            isActive
                              ? 'bg-[#00bcd4] text-white'
                              : 'bg-[#3b3b3b] text-gray-300 hover:bg-[#474747]'
                          }`}
                        >
                          {isActive ? 'در حال اجرا' : 'اجرا'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Upload File */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-400">
                فایل JSON شامل آرایه پیام‌های کاربر گذشته را انتخاب و بارگذاری کنید:
              </p>

              <label className="border-2 border-dashed border-[#444444] hover:border-[#00bcd4] rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#202020]/50 group">
                <Upload className="w-8 h-8 text-gray-400 group-hover:text-[#00bcd4] transition-colors mb-2" />
                <span className="text-sm font-semibold text-gray-200">
                  انتخاب فایل JSON سناریو
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  فرمت‌های پشتیبانی‌شده: آرایه‌ای از رشته‌ها یا شیء سناریو
                </span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <div className="bg-[#1c1c1c] p-3 rounded-xl border border-[#333333] text-xs space-y-1">
                <span className="text-cyan-400 font-semibold block mb-1">
                  نمونه فرمت مورد قبول (JSON Array):
                </span>
                <pre className="text-gray-400 font-mono text-[11px] overflow-x-auto p-2 bg-[#171717] rounded">
{`[
  "سلام میخواستم برداشت بزنم کی به حسابم میاد؟",
  "من با شبا زدم و بانک صادرات هستم، الان ۲ ساعت گذشته.",
  "خیلی ممنون از راهنماییتون."
]`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: JSON Editor */}
          {activeTab === 'json_editor' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  متن JSON سناریو را وارد یا ویرایش نمایید:
                </span>
                <button
                  onClick={() => {
                    setJsonText(JSON.stringify(DEFAULT_SCENARIOS[0], null, 2));
                  }}
                  className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  بازیابی نمونه پیش‌فرض
                </button>
              </div>

              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                rows={9}
                dir="ltr"
                className="w-full bg-[#1c1c1c] text-emerald-400 font-mono text-xs p-3 rounded-xl border border-[#3a3a3a] focus:outline-none focus:border-[#00bcd4] resize-none"
                placeholder='["پیام اول", "پیام دوم"]'
              />

              <button
                onClick={() => parseAndApplyJson(jsonText)}
                className="w-full py-2.5 bg-[#00bcd4] hover:bg-[#00acc1] text-white font-semibold rounded-xl text-xs transition-colors shadow-md shadow-cyan-950/30 flex items-center justify-center gap-2"
              >
                <Code className="w-4 h-4" />
                اعمال و بارگذاری این سناریو در شبیه‌ساز
              </button>
            </div>
          )}

          {/* Simulation Timing Setting */}
          <div className="pt-3 border-t border-[#333333] flex items-center justify-between text-xs">
            <div>
              <span className="text-gray-300 font-medium block">
                تأخیر پاسخ کاربر مجازی (AI User Delay):
              </span>
              <span className="text-[11px] text-gray-400">
                مدت زمان شبیه‌سازی تایپ کاربر قبل از ارسال پیام بعدی (طبق مستندات: ۲ تا ۳ ثانیه)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={userTypingDelay}
                onChange={(e) => setUserTypingDelay(parseFloat(e.target.value))}
                className="w-24 accent-[#00bcd4]"
              />
              <span className="text-cyan-400 font-bold w-12 text-center">
                {userTypingDelay} ثانیه
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#202020] border-t border-[#333333] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#333333] hover:bg-[#3d3d3d] text-gray-200 text-xs font-medium rounded-lg transition-colors"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
