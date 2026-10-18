/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Settings,
  X,
  Volume2,
  VolumeX,
  Plus,
  Trash2,
  Edit2,
  Check,
  Play,
  Bell,
  MessageSquare,
  Sparkles,
  Sliders
} from 'lucide-react';
import { soundManager, SOUND_OPTIONS, SoundType } from '../utils/sound';

export interface CannedResponseItem {
  id: string;
  title: string;
  text: string;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cannedResponses: CannedResponseItem[];
  onAddCannedResponse: (title: string, text: string) => void;
  onDeleteCannedResponse: (id: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  currentSoundType: SoundType;
  onChangeSoundType: (type: SoundType) => void;
  userTypingDelay: number;
  setUserTypingDelay: (delay: number) => void;
  theme?: 'dark' | 'light';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  cannedResponses,
  onAddCannedResponse,
  onDeleteCannedResponse,
  soundEnabled,
  onToggleSound,
  currentSoundType,
  onChangeSoundType,
  userTypingDelay,
  setUserTypingDelay,
  theme = 'dark',
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'canned' | 'sound_notifications' | 'simulation'>('canned');
  
  // New canned response form
  const [newTitle, setNewTitle] = useState('');
  const [newText, setNewText] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const isDark = theme === 'dark';

  const handleCreateCanned = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newText.trim()) {
      setFormError('لطفاً عنوان و متن پیام آماده را وارد نمایید.');
      return;
    }
    onAddCannedResponse(newTitle.trim(), newText.trim());
    setNewTitle('');
    setNewText('');
    setFormError(null);
    setSuccessToast('پیام آماده با موفقیت ذخیره شد.');
    setTimeout(() => setSuccessToast(null), 2500);
  };

  const handleTestSound = (type: SoundType) => {
    soundManager.playIncomingNotification(type);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 select-none font-['Vazirmatn',sans-serif]">
      <div
        className={`w-full max-w-2xl max-h-[90vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
          isDark
            ? 'bg-[#242424] border-[#3e3e3e] text-gray-100'
            : 'bg-white border-gray-200 text-gray-800'
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isDark ? 'bg-[#2a2a2a] border-[#383838]' : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00acc1]/15 text-[#00acc1] border border-[#00acc1]/30 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">تنظیمات سامانه گفتینو</h3>
              <p className="text-[11px] text-gray-400">
                مدیریت پیام‌های آماده، اعلان‌ها، صداها و پارامترهای شبیه‌ساز
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div
          className={`flex border-b px-6 pt-2 gap-4 text-xs font-medium ${
            isDark ? 'bg-[#202020] border-[#333333]' : 'bg-gray-100 border-gray-200'
          }`}
        >
          <button
            onClick={() => setActiveTab('canned')}
            className={`pb-3 px-2 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'canned'
                ? 'border-[#00acc1] text-[#00acc1] font-bold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>پیام‌های آماده (Canned Responses)</span>
          </button>

          <button
            onClick={() => setActiveTab('sound_notifications')}
            className={`pb-3 px-2 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'sound_notifications'
                ? 'border-[#00acc1] text-[#00acc1] font-bold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>نوتیفیکیشن و صداها</span>
          </button>

          <button
            onClick={() => setActiveTab('simulation')}
            className={`pb-3 px-2 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'simulation'
                ? 'border-[#00acc1] text-[#00acc1] font-bold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>سرعت شبیه‌ساز</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {successToast && (
            <div className="bg-emerald-950/70 border border-emerald-700 text-emerald-200 p-3 rounded-xl flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{successToast}</span>
            </div>
          )}

          {/* TAB 1: Canned Responses */}
          {activeTab === 'canned' && (
            <div className="space-y-5">
              {/* Add New Canned Form */}
              <form
                onSubmit={handleCreateCanned}
                className={`p-4 rounded-xl border space-y-3 ${
                  isDark ? 'bg-[#1e1e1e] border-[#383838]' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm text-[#00acc1]">
                  <Plus className="w-4 h-4" />
                  <span>افزودن پاسخ آماده جدید:</span>
                </div>

                {formError && (
                  <p className="text-red-400 text-[11px]">{formError}</p>
                )}

                <div className="space-y-1">
                  <label className="text-[11px] text-gray-300 font-medium">عنوان پاسخ (برای دسترسی سریع):</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="مثال: پیگیری شماره شبا و حواله پایا"
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:border-[#00acc1] text-xs ${
                      isDark ? 'bg-[#181818] border-[#3d3d3d] text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-gray-300 font-medium">متن کامل پیام پاسخ:</label>
                  <textarea
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    rows={2}
                    placeholder="متنی که با کلیک روی این پاسخ آماده در کادر چت کارشناس درج می‌شود..."
                    className={`w-full p-2.5 rounded-lg border focus:outline-none focus:border-[#00acc1] text-xs resize-none ${
                      isDark ? 'bg-[#181818] border-[#3d3d3d] text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#00acc1] hover:bg-[#0097a7] text-white font-bold rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>افزودن به لیست پاسخ‌ها</span>
                  </button>
                </div>
              </form>

              {/* Existing Canned Responses List */}
              <div className="space-y-2">
                <span className="font-bold text-gray-300 block">
                  لیست پاسخ‌های آماده فعال ({cannedResponses.length}):
                </span>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {cannedResponses.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border flex items-start justify-between gap-3 ${
                        isDark ? 'bg-[#292929] border-[#3a3a3a]' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="space-y-1 flex-1">
                        <span className="font-bold text-[#00acc1] block text-xs">
                          {item.title}
                        </span>
                        <p className="text-gray-300 text-[11px] leading-relaxed">
                          {item.text}
                        </p>
                      </div>

                      <button
                        onClick={() => onDeleteCannedResponse(item.id)}
                        className="text-gray-400 hover:text-red-400 p-1.5 rounded transition-colors shrink-0"
                        title="حذف این پاسخ آماده"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Sound & Notifications */}
          {activeTab === 'sound_notifications' && (
            <div className="space-y-5">
              {/* Master Sound Switch */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  isDark ? 'bg-[#1e1e1e] border-[#383838]' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div>
                  <span className="font-bold text-sm block">صدای اعلان پیام جدید</span>
                  <span className="text-[11px] text-gray-400">
                    پخش صدای ملایم هنگام دریافت پیام جدید از کاربر مجازی
                  </span>
                </div>

                <button
                  onClick={onToggleSound}
                  className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${
                    soundEnabled
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {soundEnabled ? (
                    <>
                      <Volume2 className="w-4 h-4" />
                      <span>فعال است</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-4 h-4" />
                      <span>قطع است</span>
                    </>
                  )}
                </button>
              </div>

              {/* Select Sound Theme */}
              <div className="space-y-2.5">
                <span className="font-bold text-gray-300 block">
                  انتخاب صدای پیام‌های دریافتی:
                </span>

                <div className="grid gap-2.5">
                  {SOUND_OPTIONS.map((opt) => {
                    const isSelected = currentSoundType === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => onChangeSoundType(opt.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#00acc1]/15 border-[#00acc1] text-white shadow-xs'
                            : isDark
                            ? 'bg-[#292929] border-[#3a3a3a] hover:bg-[#303030]'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isSelected
                                ? 'border-[#00acc1] bg-[#00acc1]'
                                : 'border-gray-500'
                            }`}
                          >
                            {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                          </div>

                          <div>
                            <span className="font-bold text-xs block">{opt.name}</span>
                            <span className="text-[11px] text-gray-400 block mt-0.5">
                              {opt.description}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTestSound(opt.id);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#383838] hover:bg-[#484848] text-white text-[11px] font-medium flex items-center gap-1.5 transition-colors border border-[#484848]"
                          title="تست و پخش نمونه این صدا"
                        >
                          <Play className="w-3.5 h-3.5 fill-current text-[#00acc1]" />
                          <span>تست صدا</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Simulation Speed */}
          {activeTab === 'simulation' && (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-xl border space-y-4 ${
                  isDark ? 'bg-[#1e1e1e] border-[#383838]' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div>
                  <span className="font-bold text-sm block">
                    تأخیر پاسخگویی کاربر مجازی (Typing Simulation Delay)
                  </span>
                  <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                    مدت زمانی که پس از ارسال پیام توسط کارشناس، نشانگر تایپ کاربر نمایش داده شده و سپس پیام بعدی ارسال می‌گردد.
                  </p>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.5"
                    value={userTypingDelay}
                    onChange={(e) => setUserTypingDelay(parseFloat(e.target.value))}
                    className="flex-1 accent-[#00acc1]"
                  />
                  <span className="text-base font-bold text-[#00acc1] w-16 text-center">
                    {userTypingDelay} ثانیه
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-3.5 border-t flex items-center justify-end ${
            isDark ? 'bg-[#202020] border-[#333333]' : 'bg-gray-50 border-gray-200'
          }`}
        >
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#00acc1] hover:bg-[#0097a7] text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
          >
            تأیید و بستن
          </button>
        </div>
      </div>
    </div>
  );
};
