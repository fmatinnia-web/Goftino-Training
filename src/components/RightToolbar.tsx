/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Settings, Shield, LogOut, Volume2, VolumeX, Moon, Sun } from 'lucide-react';
import { AppUser } from '../types/chat';

export type MainTabType = 'chat' | 'monitor' | 'archive' | 'settings';

interface RightToolbarProps {
  currentUser: AppUser | null;
  activeTab: MainTabType;
  setActiveTab: (tab: MainTabType) => void;
  onOpenSettings: () => void;
  onOpenAdminPanel?: () => void;
  onLogout: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const RightToolbar: React.FC<RightToolbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenSettings,
  onOpenAdminPanel,
  onLogout,
  soundEnabled,
  onToggleSound,
  theme,
  onToggleTheme,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const isAdmin = currentUser?.role === 'admin';
  const isDark = theme === 'dark';

  return (
    <aside
      className={`w-[62px] border-l flex flex-col items-center pt-3 pb-6 justify-between select-none z-30 shrink-0 relative font-['Vazirmatn',sans-serif] transition-colors duration-200 ${
        isDark
          ? 'bg-[#2a2a2a] border-[#363636] text-gray-100'
          : 'bg-[#ffffff] border-[#e2e4e8] text-gray-800 shadow-sm'
      }`}
    >
      {/* Top Section: "گفتینو" + Divider 1 + Avatar + Divider 2 */}
      <div className="flex flex-col items-center w-full">
        {/* Platform Brand Name */}
        <span
          className={`font-bold text-sm tracking-wide pb-0.5 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}
        >
          گفتینو
        </span>

        {/* Thin Divider 1 */}
        <div
          className={`w-8 h-[1px] my-2.5 ${
            isDark ? 'bg-[#3e3e3e]' : 'bg-[#e5e7eb]'
          }`}
        />

        {/* Circular Agent Avatar */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-11 h-11 rounded-full overflow-hidden bg-[#1f2937] focus:outline-none transition-transform hover:scale-105 active:scale-95 block"
            title={`${currentUser?.name || 'کاربر'} (${isAdmin ? 'مدیریت آموزش' : 'کارشناس پشتیبانی'}) - کلیک برای منو`}
          >
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
              alt={currentUser?.name || 'اپراتور'}
              className="w-full h-full object-cover"
            />
          </button>

          {/* User Popover Menu when clicking avatar */}
          {showUserMenu && (
            <div
              className={`absolute top-0 right-14 border rounded-xl shadow-2xl p-2.5 w-48 z-50 text-right text-xs animate-in fade-in slide-in-from-right-2 ${
                isDark
                  ? 'bg-[#222222] border-[#444444] text-gray-100'
                  : 'bg-white border-gray-200 text-gray-800'
              }`}
            >
              <div
                className={`pb-2 border-b mb-1.5 px-1 ${
                  isDark ? 'border-[#333333]' : 'border-gray-200'
                }`}
              >
                <span className="font-bold block truncate">
                  {currentUser?.name || 'کاربر سیستم'}
                </span>
                <span className="text-[10px] text-cyan-500 block mt-0.5">
                  {isAdmin ? 'مدیر آموزش و نظارت' : 'کارشناس پشتیبانی'}
                </span>
              </div>

              {isAdmin && onOpenAdminPanel && (
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onOpenAdminPanel();
                  }}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors ${
                    isDark
                      ? 'text-purple-300 hover:bg-purple-950/50 hover:text-white'
                      : 'text-purple-700 hover:bg-purple-50'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>ورود به پنل ادمین</span>
                </button>
              )}

              <button
                onClick={() => {
                  onToggleSound();
                }}
                className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                  isDark
                    ? 'text-gray-300 hover:bg-[#333333] hover:text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  {soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-[#00acc1]" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-gray-400" />
                  )}
                  <span>صدای اعلان</span>
                </div>
                <span className="text-[10px] text-gray-400">
                  {soundEnabled ? 'روشن' : 'خاموش'}
                </span>
              </button>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onLogout();
                }}
                className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors mt-1 border-t ${
                  isDark
                    ? 'text-red-400 hover:bg-red-950/40 hover:text-red-300 border-[#333333]'
                    : 'text-red-600 hover:bg-red-50 border-gray-200'
                }`}
              >
                <LogOut className="w-4 h-4" />
                <span>خروج از حساب</span>
              </button>
            </div>
          )}
        </div>

        {/* Thin Divider 2 */}
        <div
          className={`w-8 h-[1px] my-2.5 ${
            isDark ? 'bg-[#3e3e3e]' : 'bg-[#e5e7eb]'
          }`}
        />

        {/* Middle Navigation Icons (4 options from top) */}
        <nav className="flex flex-col items-center gap-3 w-full px-1.5 mt-0.5">
          {/* 1. گفتگوها (Active Chats View) */}
          <button
            onClick={() => setActiveTab('chat')}
            className={`w-[42px] h-[42px] rounded-xl flex items-center justify-center transition-all ${
              activeTab === 'chat'
                ? 'bg-[#00acc1] text-white shadow-md shadow-cyan-900/30'
                : isDark
                ? 'text-gray-300 hover:text-white hover:bg-[#383838]'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            title="گزینه ۱: گفتگوها (میز کار پاسخگویی)"
          >
            {/* Custom SVG: Chat bubble with 3 dots and back bubble matching reference image */}
            <svg
              className={`w-5 h-5 ${activeTab === 'chat' ? 'text-white' : 'currentColor'}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 8a2 2 0 0 0-2-2h-1V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v8l3-2h1" />
              <path d="M15 8H8a2 2 0 0 0-2 2v8l3.5-2.5H15a2 2 0 0 0 2-2v-3.5a2 2 0 0 0-2-2Z" />
              <circle cx="9.5" cy="13" r="0.75" fill="currentColor" />
              <circle cx="11.5" cy="13" r="0.75" fill="currentColor" />
              <circle cx="13.5" cy="13" r="0.75" fill="currentColor" />
            </svg>
          </button>

          {/* 2. بازدیدکنندگان آنلاین (Live Online Visitors View) */}
          <button
            onClick={() => setActiveTab('monitor')}
            className={`w-[42px] h-[42px] rounded-xl flex items-center justify-center transition-colors ${
              activeTab === 'monitor'
                ? 'bg-[#00acc1] text-white shadow-md shadow-cyan-900/30'
                : isDark
                ? 'text-gray-300 hover:text-white hover:bg-[#343434]'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            title="گزینه ۲: بازدیدکنندگان آنلاین وب‌سایت"
          >
            {/* Eye with concentric iris circle matching screenshot */}
            <svg
              className="w-6 h-6 stroke-[1.7]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3.2" />
              <circle cx="12" cy="12" r="1.1" fill="currentColor" />
            </svg>
          </button>

          {/* 3. آرشیو گفتگوها (Chat Archive View) */}
          <button
            onClick={() => setActiveTab('archive')}
            className={`w-[42px] h-[42px] rounded-xl flex items-center justify-center transition-colors ${
              activeTab === 'archive'
                ? 'bg-[#00acc1] text-white shadow-md shadow-cyan-900/30'
                : isDark
                ? 'text-gray-300 hover:text-white hover:bg-[#343434]'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            title="گزینه ۳: آرشیو گفتگوها"
          >
            {/* Document card with bookmark ribbon and lines matching screenshot */}
            <svg
              className="w-6 h-6 stroke-[1.7]"
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
          </button>

          {/* 4. تنظیمات سامانه (System Settings) */}
          <button
            onClick={onOpenSettings}
            className={`w-[42px] h-[42px] rounded-xl flex items-center justify-center transition-colors ${
              activeTab === 'settings'
                ? 'text-[#00acc1] bg-[#353535]'
                : isDark
                ? 'text-gray-300 hover:text-white hover:bg-[#343434]'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            title="گزینه ۴: تنظیمات سامانه (پیام‌های آماده، نوتیفیکیشن، صداها)"
          >
            <Settings className="w-5 h-5 stroke-[1.7]" />
          </button>
        </nav>
      </div>

      {/* Bottom Section: Exit to Admin Panel + Theme Toggle */}
      <div className="flex flex-col items-center gap-2.5 w-full">
        {/* Exit & Go to Landing Page Button */}
        <div className="relative group flex items-center justify-center">
          <button
            onClick={onLogout}
            className={`w-[42px] h-[42px] rounded-xl flex items-center justify-center transition-all ${
              isDark
                ? 'text-red-400 hover:text-white hover:bg-red-600/30 active:scale-95'
                : 'text-red-600 hover:text-white hover:bg-red-500 active:scale-95'
            }`}
            title="خروج و ورود به صفحه لندینگ"
            aria-label="خروج و ورود به صفحه لندینگ"
          >
            <LogOut className="w-5 h-5 stroke-[1.8] rotate-180" />
          </button>

          {/* Hover Tooltip (in RTL pops to left of toolbar) */}
          <div className="absolute right-14 px-2.5 py-1 bg-gray-900/95 text-white text-[11px] rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-gray-700 font-medium">
            خروج و ورود به صفحه لندینگ
          </div>
        </div>

        {/* Thin Divider */}
        <div
          className={`w-7 h-[1px] ${
            isDark ? 'bg-[#3e3e3e]' : 'bg-[#e5e7eb]'
          }`}
        />

        {/* Theme Toggle Button (Light & Dark Mode) */}
        <button
          onClick={onToggleTheme}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            isDark
              ? 'text-gray-400 hover:text-yellow-300 hover:bg-[#333333]'
              : 'text-gray-600 hover:text-amber-500 hover:bg-gray-100'
          }`}
          title={isDark ? 'تغییر به تم سفید (Light Mode)' : 'تغییر به تم تاریک (Dark Mode)'}
        >
          {isDark ? (
            /* Sun Icon in Dark Mode */
            <svg
              className="w-5 h-5 stroke-[1.8]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2.5v2" />
              <path d="M12 19.5v2" />
              <path d="m5.28 5.28 1.42 1.42" />
              <path d="m17.3 17.3 1.42 1.42" />
              <path d="M2.5 12h2" />
              <path d="M19.5 12h2" />
              <path d="m6.7 17.3-1.42 1.42" />
              <path d="m18.72 5.28-1.42 1.42" />
            </svg>
          ) : (
            /* Moon Icon in Light Mode */
            <Moon className="w-5 h-5 stroke-[1.8] text-indigo-600" />
          )}
        </button>
      </div>
    </aside>
  );
};
