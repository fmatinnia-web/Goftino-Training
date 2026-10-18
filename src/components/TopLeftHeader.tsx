/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertCircle, UserCheck, Users, HelpCircle } from 'lucide-react';

interface TopLeftHeaderProps {
  isAgentOnline: boolean;
  onToggleAgentOnline: () => void;
  onOpenHelp: () => void;
  onOpenScenarioModal: () => void;
}

export const TopLeftHeader: React.FC<TopLeftHeaderProps> = ({
  isAgentOnline,
  onToggleAgentOnline,
  onOpenHelp,
  onOpenScenarioModal,
}) => {
  return (
    <div className="flex items-center gap-4 text-gray-300">
      {/* Alert / Info Icon */}
      <button
        onClick={onOpenHelp}
        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
        title="راهنمای سناریوی آموزشی"
      >
        <AlertCircle className="w-5 h-5 stroke-[1.7]" />
      </button>

      {/* Profile / Chat Icon */}
      <button
        onClick={onOpenScenarioModal}
        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
        title="سناریوهای بارگذاری‌شده"
      >
        <UserCheck className="w-5 h-5 stroke-[1.7]" />
      </button>

      {/* Cyan Toggle Switch (from reference image) */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleAgentOnline}
          className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
            isAgentOnline ? 'bg-[#00bcd4]' : 'bg-[#555555]'
          }`}
          title={isAgentOnline ? 'وضعیت: آنلاین و آماده پاسخگویی' : 'وضعیت: غیرفعال'}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out mt-0.5 ${
              isAgentOnline ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* Group / Team Icon */}
      <button
        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
        title="تیم پشتیبانی و اپراتورها"
      >
        <Users className="w-5 h-5 stroke-[1.7]" />
      </button>
    </div>
  );
};
