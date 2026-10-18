/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface EmptyChatStateProps {
  onOpenUploadModal?: () => void;
  hasScenarios?: boolean;
}

export const EmptyChatState: React.FC<EmptyChatStateProps> = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center select-none text-center p-6">
      {/* Icon: Pixel-perfect replica of the reference screenshot chat bubble with 3 dots */}
      <div className="relative mb-4 group">
        <svg
          className="w-16 h-16 text-[#626262]"
          viewBox="0 0 64 64"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Smooth speech bubble body */}
          <path
            d="M32 8C18.745 8 8 18.297 8 31c0 5.253 1.867 10.094 5.035 14.02L10 56l12.443-3.66C25.32 53.47 28.56 54 32 54c13.255 0 24-10.297 24-23S45.255 8 32 8z"
            fill="#626262"
          />
          {/* 3 circular dots */}
          <circle cx="23" cy="31" r="3" fill="#383838" />
          <circle cx="32" cy="31" r="3" fill="#383838" />
          <circle cx="41" cy="31" r="3" fill="#383838" />
        </svg>
      </div>

      {/* Main Text from reference image */}
      <p className="text-[#a3a3a3] text-sm font-medium tracking-wide">
        یک گفتگو انتخاب کنید
      </p>
    </div>
  );
};

