/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppUser, UserRole } from '../types/chat';
import { ThreeGoftinoSimulator } from './ThreeGoftinoSimulator';

interface LandingLoginPageProps {
  onLogin: (user: AppUser) => void;
}

export const LandingLoginPage: React.FC<LandingLoginPageProps> = ({ onLogin }) => {
  const handleDirectRoleLogin = (role: UserRole) => {
    const user: AppUser = {
      id: role === 'admin' ? 'admin-user' : 'agent-user',
      name: role === 'admin' ? 'مدیریت آموزش' : 'کارشناس پشتیبانی',
      email: role === 'admin' ? 'admin@goftino.com' : 'agent@goftino.com',
      role,
      avatar:
        role === 'admin'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
          : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      department: role === 'admin' ? 'مدیریت و نظارت' : 'تیم پشتیبانی مشتریان',
    };
    onLogin(user);
  };

  return (
    <div
      dir="rtl"
      className="h-screen w-screen overflow-hidden bg-[#161618] text-gray-100 flex flex-col justify-between select-none font-['Vazirmatn',sans-serif] relative"
    >
      {/* Top Navbar */}
      <header className="border-b border-[#2d2d30] bg-[#1a1a1d]/90 backdrop-blur-md px-6 py-3 flex items-center justify-between z-20 shrink-0">
        <h1 className="text-white font-bold text-sm sm:text-base flex items-center gap-2">
          <span>سامانه شبیه‌ساز گفتینو</span>
          <span className="text-[10px] bg-cyan-950/80 text-cyan-300 border border-cyan-800/40 px-2 py-0.5 rounded-full font-medium">
            نمای سه‌بعدی تعاملی
          </span>
        </h1>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>سرور شبیه‌ساز فعال است</span>
        </div>
      </header>

      {/* 3D Interactive Goftino Simulator Viewport */}
      <main className="flex-1 w-full h-full relative overflow-hidden">
        <ThreeGoftinoSimulator
          onEnterAgent={() => handleDirectRoleLogin('agent')}
          onEnterAdmin={() => handleDirectRoleLogin('admin')}
        />
      </main>
    </div>
  );
};
