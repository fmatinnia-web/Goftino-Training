/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Shield,
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Star,
  Clock,
  User,
  Users,
  Eye,
  Trash2,
  Plus,
  MessageSquare,
  LogOut,
  Send,
  Sparkles,
  ChevronRight,
  FolderOpen,
  Check,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { AppUser, ChatScenario, ChatSession } from '../types/chat';
import { parseRawChatInput } from '../utils/rawChatParser';

interface AdminPanelProps {
  currentUser: AppUser;
  scenarios: ChatScenario[];
  sessions: Record<string, ChatSession>;
  onAddNewScenario: (scenario: ChatScenario) => void;
  onDeleteScenario: (scenarioId: string) => void;
  onClearAllScenarios?: () => void;
  onUpdateSessionReview: (scenarioId: string, score: number, feedback: string) => void;
  onSwitchToAgentView: () => void;
  onJumpToChat: (scenarioId: string) => void;
  onLogout: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  scenarios,
  sessions,
  onAddNewScenario,
  onDeleteScenario,
  onClearAllScenarios,
  onUpdateSessionReview,
  onSwitchToAgentView,
  onJumpToChat,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'upload_raw' | 'review_chats' | 'scenarios_list'>('upload_raw');
  
  // Raw chat ingestion state
  const [rawText, setRawText] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [category, setCategory] = useState('');
  const [hintsText, setHintsText] = useState('');
  const [parsedPreview, setParsedPreview] = useState<string[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<{ name: string; id: string } | null>(null);

  // Inspection drawer for reviewing a specific chat
  const [selectedReviewSessionId, setSelectedReviewSessionId] = useState<string | null>(null);
  const [reviewScore, setReviewScore] = useState<number>(5);
  const [reviewFeedback, setReviewFeedback] = useState<string>('');

  // Handle parsing raw text on changes
  const handleParseRaw = () => {
    setParseError(null);
    setUploadSuccess(null);
    try {
      if (!rawText.trim()) {
        setParsedPreview([]);
        return;
      }
      const res = parseRawChatInput(rawText, customerName || 'کاربر جدید');
      setParsedPreview(res.userMessages);
      if (!customerName && res.customerName && res.customerName !== 'کاربر جدید') {
        setCustomerName(res.customerName);
      }
      if (!category && res.category) {
        setCategory(res.category);
      }
    } catch (err: unknown) {
      setParseError((err as Error).message || 'خطا در پردازش متن خام');
      setParsedPreview([]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawText(content);
      // Auto trigger parse
      try {
        const fallback = file.name.replace(/\.[^/.]+$/, '');
        const res = parseRawChatInput(content, customerName || fallback);
        setParsedPreview(res.userMessages);
        setCustomerName(res.customerName);
        setCategory('فایل چت: ' + file.name);
        setUploadSuccess(null);
      } catch (err: unknown) {
        setParseError((err as Error).message);
      }
    };
    reader.readAsText(file);
  };

  // Submit and create new scenario into the WAITING queue
  const handlePublishScenario = () => {
    if (parsedPreview.length === 0) {
      setParseError('ابتدا متن چت خام را وارد یا فایل را بارگذاری کنید.');
      return;
    }

    const hints = hintsText
      .split('\n')
      .map((h) => h.trim())
      .filter(Boolean);

    const scenarioId = `scenario-${Date.now()}`;
    const finalCustomerName = customerName.trim() || 'کاربر شبیه‌ساز';

    const newScenario: ChatScenario = {
      id: scenarioId,
      customerName: finalCustomerName,
      previewMessage: parsedPreview[0].slice(0, 34) + '...',
      unreadCount: 1,
      category: category.trim() || 'پشتیبانی امور کاربران',
      userMessages: parsedPreview,
      hints: hints.length > 0 ? hints : undefined,
      createdAt: new Date().toLocaleDateString('fa-IR'),
      assignedAgentId: null,
      assignedAgentName: null,
    };

    onAddNewScenario(newScenario);
    setUploadSuccess({ name: finalCustomerName, id: scenarioId });

    // Clear inputs for next upload
    setRawText('');
    setCustomerName('');
    setCategory('');
    setHintsText('');
    setParsedPreview([]);
  };

  // Quick preset sample raw texts
  const loadSampleRaw = (type: 'transcript' | 'plain') => {
    setUploadSuccess(null);
    if (type === 'transcript') {
      const sample = `کاربر: سلام وقت بخیر، رمز دو مرحله‌ای حسابم غیرفعال شده و نمی‌تونم وارد پنل بشم.
پشتیبان: سلام، وقت شما هم بخیر. لطفاً شماره موبایل ثبت‌نامی را بفرمایید.
کاربر: شماره‌ام ۰۹۱۲۹۸۷۶۵۴۳ هست.
پشتیبان: کد تایید پیامک شد، لطفاً بفرمایید.
کاربر: کد ۱۲۳۴۵۶ برام اومد، ممنون می‌شم سریعتر رفع مسدودی بشه چون عجله دارم.
کاربر: حل شد خیلی ممنون از شما!`;
      setRawText(sample);
      setCustomerName('سعید مرادی');
      setCategory('مشکل احراز هویت دومرحله‌ای');
      setHintsText('احوالپرسی و درخواست شماره موبایل\nارسال کد ریست و راهنمایی ورود\nآرزوی موفقیت و پایان محترمانه');
      try {
        const res = parseRawChatInput(sample, 'سعید مرادی');
        setParsedPreview(res.userMessages);
      } catch {}
    } else {
      const sample = `سلام من واریز تتر انجام دادم ولی موجودی کیف پولم شارژ نشده.
شبکه انتقال TRC20 بوده و هش تراکنش هم دارم.
لطفا چک کنید آیا مشکلی در درگاه بوده؟
خیلی ممنون خیالم راحت شد.`;
      setRawText(sample);
      setCustomerName('فرزاد نادری');
      setCategory('پیگیری تراکنش رمزارز');
      try {
        const res = parseRawChatInput(sample, 'فرزاد نادری');
        setParsedPreview(res.userMessages);
      } catch {}
    }
  };

  const allSessionList = Object.values(sessions);
  const activeReviewSession = selectedReviewSessionId ? sessions[selectedReviewSessionId] : null;

  return (
    <div dir="rtl" className="min-h-screen bg-[#1c1c1c] text-gray-100 flex flex-col font-['Vazirmatn',sans-serif] select-none">
      {/* Top Navbar */}
      <header className="h-16 bg-[#242424] border-b border-[#333333] px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-900/40">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm sm:text-base flex items-center gap-2">
              پنل مدیریت آموزش و نظارت گفتینو
              <span className="text-[10px] bg-purple-950/80 text-purple-300 border border-purple-800/50 px-2 py-0.5 rounded-full">
                سطح دسترسی: مدیر (Manager)
              </span>
            </h1>
            <p className="text-xs text-gray-400">
              بارگذاری چت‌های خام، استخراج خودکار پیام‌ها و انتقال به صف «در حال انتظار»
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Switch to Agent Chat Interface */}
          <button
            onClick={onSwitchToAgentView}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00bcd4]/15 hover:bg-[#00bcd4]/25 text-[#00bcd4] border border-[#00bcd4]/40 text-xs font-semibold transition-colors"
            title="ورود به صفحه چت برای مشاهده صف در انتظار و پاسخگویی"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">مشاهده میز کار چت کارشناس</span>
          </button>

          {/* User info & Logout */}
          <div className="flex items-center gap-2 border-r border-[#3a3a3a] pr-3 mr-1">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-[#444444]"
            />
            <div className="text-right hidden md:block">
              <span className="text-xs font-semibold text-white block">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-gray-400 block">
                {currentUser.department || 'مدیر سیستم'}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-[#333333] rounded-lg transition-colors mr-1"
              title="خروج از حساب"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Tabs Navigation */}
      <div className="bg-[#212121] border-b border-[#333333] px-6 flex items-center gap-4 text-xs font-medium">
        <button
          onClick={() => setActiveTab('upload_raw')}
          className={`py-3.5 px-3 border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'upload_raw'
              ? 'border-purple-500 text-purple-400 font-bold'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>تبدیل فایل و متن خام به چت در انتظار</span>
        </button>

        <button
          onClick={() => setActiveTab('review_chats')}
          className={`py-3.5 px-3 border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'review_chats'
              ? 'border-purple-500 text-purple-400 font-bold'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>بررسی و ارزیابی مکالمات کارشناسان ({allSessionList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('scenarios_list')}
          className={`py-3.5 px-3 border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'scenarios_list'
              ? 'border-purple-500 text-purple-400 font-bold'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          <span>بانک گفتگوهای صف ({scenarios.length})</span>
        </button>
      </div>

      {/* Content Area */}
      <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto">
        {/* TAB 1: Upload Raw Chats */}
        {activeTab === 'upload_raw' && (
          <div className="space-y-6">
            <div className="bg-[#242424] border border-[#383838] rounded-2xl p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#333333] mb-6">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    تبدیل فایل یا متن مکالمه خام به چت جدید در بخش «در حال انتظار»
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    فایل یا ترانسکریپت مکالمه را وارد کنید تا به‌صورت یک چت زنده در صف «در حال انتظار» قرار گیرد؛ کارشناس می‌تواند آن را به خود تخصیص داده و با کاربر مکالمه کند.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">تست سریع با نمونه:</span>
                  <button
                    onClick={() => loadSampleRaw('transcript')}
                    className="px-2.5 py-1 rounded bg-[#333333] hover:bg-[#3d3d3d] text-gray-200 text-xs border border-[#444444]"
                  >
                    مکالمه ترانسکریپت
                  </button>
                  <button
                    onClick={() => loadSampleRaw('plain')}
                    className="px-2.5 py-1 rounded bg-[#333333] hover:bg-[#3d3d3d] text-gray-200 text-xs border border-[#444444]"
                  >
                    پیام‌های پیوسته
                  </button>
                </div>
              </div>

              {parseError && (
                <div className="bg-red-950/60 border border-red-800 text-red-200 p-3 rounded-xl flex items-center gap-2 text-xs mb-4">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="bg-emerald-950/70 border border-emerald-700 text-emerald-200 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs mb-4 animate-in fade-in">
                  <div className="flex items-center gap-2.5">
                    <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold text-white text-sm block">
                        چت «{uploadSuccess.name}» با موفقیت در بخش «در حال انتظار» قرار گرفت!
                      </span>
                      <span className="text-emerald-300 text-xs mt-0.5 block">
                        کارشناسان اکنون می‌توانند این گفتگو را مشاهده کرده، به خود تخصیص دهند و به محض ارسال پاسخ، پیام‌های بعدی کاربر را دریافت کنند.
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onJumpToChat(uploadSuccess.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-1.5 transition-all shadow-md shrink-0"
                  >
                    <span>ورود به چت و شروع مکالمه</span>
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Right side: Input text & File */}
                <div className="space-y-4">
                  {/* File Upload drag-drop area */}
                  <label className="border-2 border-dashed border-[#444444] hover:border-purple-500 rounded-xl p-4 flex items-center justify-center gap-3 cursor-pointer bg-[#1c1c1c]/50 transition-colors group">
                    <Upload className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
                    <div className="text-right">
                      <span className="text-xs font-semibold text-gray-200 block">
                        بارگذاری فایل چت خام (TXT / JSON / LOG / CSV)
                      </span>
                      <span className="text-[11px] text-gray-400">
                        کلیک کنید یا فایل را در این کادر رها کنید
                      </span>
                    </div>
                    <input
                      type="file"
                      accept=".txt,.json,.log,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Raw Textarea */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-gray-300">
                        یا پیست کردن متن مکالمه:
                      </label>
                      <button
                        onClick={handleParseRaw}
                        className="text-xs text-purple-400 hover:underline"
                      >
                        پردازش مجدد متن
                      </button>
                    </div>
                    <textarea
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                      onBlur={handleParseRaw}
                      rows={8}
                      placeholder="متن گفتگو یا پیام‌های کاربر را در اینجا پیست کنید...&#10;مثال:&#10;کاربر: سلام میخواستم برداشت بزنم کی به حسابم میاد؟&#10;پشتیبان: سلام، پایا پردازش میشه.&#10;کاربر: من با شبا زدم و بانک صادرات هستم."
                      className="w-full bg-[#1c1c1c] border border-[#3e3e3e] focus:border-purple-500 rounded-xl p-3 text-xs text-gray-100 placeholder-gray-400 focus:outline-none resize-none leading-relaxed"
                    />
                  </div>

                  {/* Metadata fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-gray-300 font-medium">نام کاربر / مشتری:</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="مثال: عسل سلیمی یا نام کاربر"
                        className="w-full bg-[#1c1c1c] border border-[#3e3e3e] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-300 font-medium">دسته‌بندی موضوع:</label>
                      <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="مثال: برداشت وجه و پایا"
                        className="w-full bg-[#1c1c1c] border border-[#3e3e3e] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  {/* Trainee Hints */}
                  <div className="space-y-1">
                    <label className="text-xs text-gray-300 font-medium">
                      راهنمای پاسخ کارشناس در هر مرحله (اختیاری):
                    </label>
                    <textarea
                      value={hintsText}
                      onChange={(e) => setHintsText(e.target.value)}
                      rows={2}
                      placeholder="راهنمای مرحله ۱&#10;راهنمای مرحله ۲..."
                      className="w-full bg-[#1c1c1c] border border-[#3e3e3e] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
                    />
                  </div>
                </div>

                {/* Left side: Extracted Live Scenario Preview */}
                <div className="bg-[#1c1c1c] border border-[#383838] rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-[#303030] mb-3">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        توالی پیام‌های کاربر مجازی ({parsedPreview.length} پیام استخراج شد)
                      </span>
                      <span className="text-[11px] text-gray-400">
                        مشتری: {customerName || 'کاربر جدید'}
                      </span>
                    </div>

                    <div className="bg-[#242424] p-2.5 rounded-lg border border-[#333333] mb-3 text-[11px] text-cyan-300 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>قانون زمان‌بندی: پیام بعدی کاربر دقیقاً پس از ارسال پاسخ کارشناس ارسال خواهد شد.</span>
                    </div>

                    {parsedPreview.length > 0 ? (
                      <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                        {parsedPreview.map((msg, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-lg bg-[#272727] border border-[#3a3a3a] text-xs text-gray-200"
                          >
                            <span className="text-[10px] text-purple-400 font-bold block mb-1">
                              {idx === 0
                                ? 'پیام آغازین در صف در حال انتظار:'
                                : `پیام کاربر پس از پاسخ کارشناس به مرحله ${idx}:`}
                            </span>
                            <p className="leading-relaxed">{msg}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-60 flex flex-col items-center justify-center text-center text-gray-400 text-xs">
                        <FileText className="w-8 h-8 text-gray-400 mb-2" />
                        <p>فایل را بارگذاری کنید یا متن مکالمه را وارد نمایید.</p>
                        <p className="text-[11px] text-gray-400 mt-1">
                          سیستم پیام‌های مشتری را جدا کرده و یک چت آماده در صف «در حال انتظار» می‌سازد.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[#303030] mt-4">
                    <button
                      onClick={handlePublishScenario}
                      disabled={parsedPreview.length === 0}
                      className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                        parsedPreview.length > 0
                          ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-950/40 cursor-pointer'
                          : 'bg-[#333333] text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      <span>تبدیل به چت و قرار دادن در بخش «در حال انتظار»</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Review & Evaluation */}
        {activeTab === 'review_chats' && (
          <div className="space-y-6">
            <div className="bg-[#242424] border border-[#383838] rounded-2xl p-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#333333] mb-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-400" />
                    بررسی و نمره‌دهی به مکالمات کارشناسان
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    متن کامل گفتگوهای تخصیص‌یافته به کارآموزان را مشاهده کرده و برای بهبود عملکرد بازخورد ثبت کنید.
                  </p>
                </div>
              </div>

              {allSessionList.length === 0 ? (
                <div className="p-12 text-center text-gray-400 text-xs space-y-2">
                  <MessageSquare className="w-10 h-10 text-gray-400 mx-auto" />
                  <p className="text-sm font-medium text-gray-300">
                    هنوز گفتگویی توسط کارشناسان آغاز نشده است.
                  </p>
                  <p className="text-gray-400 max-w-sm mx-auto">
                    کارشناس با ورود به بخش چت و تخصیص مکالمات به خود، گفتگوها را در اینجا ثبت خواهد کرد.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allSessionList.map((session) => {
                    const agentMsgCount = session.messages.filter((m) => m.sender === 'agent').length;
                    const isCompleted = session.status === 'completed';
                    const isSelected = selectedReviewSessionId === session.scenarioId;

                    return (
                      <div
                        key={session.scenarioId}
                        onClick={() => {
                          setSelectedReviewSessionId(session.scenarioId);
                          setReviewScore(session.adminReview?.score || 5);
                          setReviewFeedback(session.adminReview?.feedback || '');
                        }}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-purple-950/30 border-purple-500 shadow-md ring-1 ring-purple-500/50'
                            : 'bg-[#292929] border-[#383838] hover:bg-[#303030]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-white text-sm">
                            {session.customerName}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              isCompleted
                                ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/40'
                                : 'bg-amber-950/70 text-amber-300 border border-amber-800/40'
                            }`}
                          >
                            {isCompleted ? 'تکمیل شده' : 'در حال انجام'}
                          </span>
                        </div>

                        <div className="text-xs text-gray-400 space-y-1 mb-3">
                          <div className="flex items-center justify-between">
                            <span>کارشناس پاسخگو:</span>
                            <span className="text-gray-200 font-medium">
                              {session.assignedAgentName || 'هنوز تخصیص نیافته'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>پیام‌های کارشناس:</span>
                            <span className="text-purple-300 font-medium">{agentMsgCount} پیام</span>
                          </div>
                          {session.adminReview?.score && (
                            <div className="flex items-center justify-between">
                              <span>نمره ارزیابی:</span>
                              <div className="flex items-center gap-0.5 text-amber-400">
                                <Star className="w-3.5 h-3.5 fill-amber-400" />
                                <span>{session.adminReview.score} از ۵</span>
                              </div>
                            </div>
                          )}
                        </div>

                        <button className="w-full py-1.5 rounded-lg bg-[#383838] hover:bg-purple-600 hover:text-white text-xs font-semibold text-gray-300 transition-colors">
                          بررسی متن مکالمه و ثبت نمره
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Conversation Transcript Modal / Review Card */}
            {activeReviewSession && (
              <div className="bg-[#242424] border border-[#3e3e3e] rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#363636]">
                  <div>
                    <h3 className="font-bold text-white text-base">
                      بررسی ترانسکریپت گفتگو با «{activeReviewSession.customerName}»
                    </h3>
                    <p className="text-xs text-gray-400">
                      کارشناس: {activeReviewSession.assignedAgentName || 'تخصیص نیافته'}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedReviewSessionId(null)}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    بستن بررسی
                  </button>
                </div>

                {/* Messages stream */}
                <div className="max-h-72 overflow-y-auto space-y-3 p-3 bg-[#1c1c1c] rounded-xl border border-[#333333]">
                  {activeReviewSession.messages.map((m) => {
                    const isUser = m.sender === 'user';
                    return (
                      <div
                        key={m.id}
                        className={`p-3 rounded-xl text-xs max-w-[80%] ${
                          isUser
                            ? 'bg-[#292929] text-gray-200 border border-[#3d3d3d] mr-auto'
                            : 'bg-[#00acc1] text-white ml-auto'
                        }`}
                      >
                        <span className="font-bold text-[10px] block mb-1 opacity-80">
                          {isUser ? activeReviewSession.customerName : 'کارشناس پشتیبانی'}:
                        </span>
                        <p className="whitespace-pre-wrap">{m.text}</p>
                        <span className="text-[9px] opacity-70 block text-left mt-1">
                          {m.timestamp}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Evaluation Form */}
                <div className="bg-[#202020] p-4 rounded-xl border border-[#333333] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">
                      ثبت نمره و بازخورد مدیریت:
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setReviewScore(s)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              s <= reviewScore
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-gray-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    value={reviewFeedback}
                    onChange={(e) => setReviewFeedback(e.target.value)}
                    rows={2}
                    placeholder="نکات قوت، اشکالات نگارشی، میزان رعایت لحن برند و نکات آموزشی کارشناس..."
                    className="w-full bg-[#171717] border border-[#3d3d3d] rounded-lg p-2.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
                  />

                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        onUpdateSessionReview(activeReviewSession.scenarioId, reviewScore, reviewFeedback);
                        alert('ارزیابی مدیر با موفقیت ذخیره شد.');
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                    >
                      ذخیره ارزیابی کارشناس
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Scenario Library */}
        {activeTab === 'scenarios_list' && (
          <div className="space-y-4">
            <div className="bg-[#242424] border border-[#383838] rounded-2xl p-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#333333] mb-4">
                <div>
                  <h2 className="text-base font-bold text-white mb-0.5">
                    بانک گفتگوهای صف در حال انتظار ({scenarios.length} گفتگو)
                  </h2>
                  <p className="text-xs text-gray-400">
                    لیست گفتگوهایی که برای کارشناسان در بخش «در حال انتظار» فعال هستند.
                  </p>
                </div>

                {scenarios.length > 0 && onClearAllScenarios && (
                  <button
                    onClick={() => {
                      if (confirm('آیا از حذف تمام گفتگوها اطمینان دارید؟ تمامی سناریوهای جاری پاک خواهند شد.')) {
                        onClearAllScenarios();
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/40 text-xs font-semibold transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف همه گفتگوها</span>
                  </button>
                )}
              </div>

              {scenarios.length === 0 ? (
                <div className="p-12 text-center text-gray-400 text-xs space-y-2 border border-dashed border-[#383838] rounded-xl flex flex-col items-center justify-center">
                  <MessageSquare className="w-10 h-10 text-gray-500 mb-1" />
                  <p className="text-sm font-bold text-gray-300">
                    هنوز هیچ گفتگویی در سامانه بارگذاری نشده است.
                  </p>
                  <p className="text-gray-400 max-w-sm">
                    شما می‌توانید از تب «بارگذاری چت خام» فایل یا متن مکالمات را اضافه کنید تا بلافاصله به صف انتظار کارشناسان منتقل شوند.
                  </p>
                  <button
                    onClick={() => setActiveTab('upload_raw')}
                    className="mt-2 px-3.5 py-1.5 rounded-lg bg-[#00bcd4] hover:bg-[#00acc1] text-white text-xs font-bold transition-colors"
                  >
                    ورود به بخش بارگذاری چت خام
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-[#333333]">
                  {scenarios.map((sc) => {
                    const assignedSession = sessions[sc.id];
                    const isAssigned = !!assignedSession?.assignedAgentName;

                    return (
                      <div key={sc.id} className="py-3.5 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">
                              {sc.customerName}
                            </span>
                            <span className="text-[10px] bg-[#333333] text-gray-300 px-2 py-0.5 rounded-full">
                              {sc.category}
                            </span>
                            {isAssigned ? (
                              <span className="text-[10px] bg-cyan-950/70 text-cyan-300 border border-cyan-800/40 px-2 py-0.5 rounded-full">
                                اختصاص یافته به: {assignedSession.assignedAgentName}
                              </span>
                            ) : (
                              <span className="text-[10px] bg-amber-950/70 text-amber-300 border border-amber-800/40 px-2 py-0.5 rounded-full">
                                در صف انتظار (بدون اپراتور)
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-1 max-w-xl truncate">
                            پیام شروع: «{sc.userMessages[0]}»
                          </p>
                          <span className="text-[11px] text-gray-400 mt-0.5 block">
                            تعداد گام‌های مکالمه: {sc.userMessages.length} مرحله
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onJumpToChat(sc.id)}
                            className="px-2.5 py-1 rounded bg-[#00bcd4]/15 hover:bg-[#00bcd4]/25 text-[#00bcd4] border border-[#00bcd4]/40 text-xs font-semibold transition-colors flex items-center gap-1"
                            title="ورود به این چت"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>مشاهده چت</span>
                          </button>
                          <button
                            onClick={() => onDeleteScenario(sc.id)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-[#333333] rounded-lg transition-colors"
                            title="حذف چت"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
