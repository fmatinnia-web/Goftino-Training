/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LandingLoginPage } from './components/LandingLoginPage';
import { AdminPanel } from './components/AdminPanel';
import { RightToolbar, MainTabType } from './components/RightToolbar';
import { ChatListPanel } from './components/ChatListPanel';
import { TopLeftHeader } from './components/TopLeftHeader';
import { EmptyChatState } from './components/EmptyChatState';
import { ActiveChatView } from './components/ActiveChatView';
import { OnlineVisitorsView, OnlineVisitor } from './components/OnlineVisitorsView';
import { ChatArchiveView } from './components/ChatArchiveView';
import { SettingsModal, CannedResponseItem } from './components/SettingsModal';
import { ScenarioModal } from './components/ScenarioModal';
import { TrainingCompleteModal } from './components/TrainingCompleteModal';
import { HelpModal } from './components/HelpModal';
import { DEFAULT_SCENARIOS, CANNED_RESPONSES } from './data/defaultScenarios';
import { INITIAL_USERS } from './data/mockUsers';
import { AppUser, ChatScenario, ChatSession, ChatMessage } from './types/chat';
import { soundManager, SoundType } from './utils/sound';

export default function App() {
  // Current logged in user (null means showing landing/login page)
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    try {
      const saved = localStorage.getItem('goftino_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Theme: 'dark' | 'light'
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('goftino_theme');
      return saved === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  // Current view mode for Admin: 'admin_panel' or 'chat_view'
  const [adminViewMode, setAdminViewMode] = useState<'admin_panel' | 'chat_view'>('admin_panel');

  // Toolbar active tab: 1: chat, 2: monitor (visitors), 3: archive, 4: settings
  const [activeToolbarTab, setActiveToolbarTab] = useState<MainTabType>('chat');

  // Scenarios state: Starts completely EMPTY until user uploads data
  const [scenarios, setScenarios] = useState<ChatScenario[]>(() => {
    try {
      // Clear legacy storage keys containing mock default chats
      const cleanedFlag = localStorage.getItem('goftino_cleaned_mock_defaults_v3');
      if (!cleanedFlag) {
        localStorage.removeItem('goftino_scenarios');
        localStorage.removeItem('goftino_sessions');
        localStorage.removeItem('goftino_scenarios_v2');
        localStorage.removeItem('goftino_sessions_v2');
        localStorage.setItem('goftino_cleaned_mock_defaults_v3', 'true');
        return [];
      }
      const saved = localStorage.getItem('goftino_scenarios_v3');
      if (saved) {
        const parsed: ChatScenario[] = JSON.parse(saved);
        // Exclude any default mock scenarios that may have lingered
        return parsed.filter(
          (s) => s.id !== 'asal-salimi' && s.id !== 'rostami-login' && s.id !== 'farsimadan-otp'
        );
      }
      return [];
    } catch {
      return [];
    }
  });

  // Sessions state (per scenario)
  const [sessions, setSessions] = useState<Record<string, ChatSession>>(() => {
    try {
      const saved = localStorage.getItem('goftino_sessions_v3');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Canned responses state
  const [cannedResponses, setCannedResponses] = useState<CannedResponseItem[]>(() => {
    try {
      const saved = localStorage.getItem('goftino_canned_responses');
      return saved
        ? JSON.parse(saved)
        : CANNED_RESPONSES.map((c, i) => ({ id: `canned-${i}`, ...c }));
    } catch {
      return CANNED_RESPONSES.map((c, i) => ({ id: `canned-${i}`, ...c }));
    }
  });

  // Notification sound settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentSoundType, setCurrentSoundType] = useState<SoundType>(() => {
    try {
      const saved = localStorage.getItem('goftino_sound_type') as SoundType;
      return saved || 'classic';
    } catch {
      return 'classic';
    }
  });

  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [completedScenarioIds, setCompletedScenarioIds] = useState<string[]>([]);

  // Chat list tab: waiting, my_chats, other_chats
  const [activeFilterTab, setActiveFilterTab] = useState<'waiting' | 'my_chats' | 'other_chats'>('waiting');
  const [isAgentOnline, setIsAgentOnline] = useState(true);

  // Simulation settings: typing delay before customer responds to agent message
  const [userTypingDelay, setUserTypingDelay] = useState(2.0);
  const [lastMessageSentTime, setLastMessageSentTime] = useState<number>(Date.now());

  // Modals
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  const [isTrainingCompleteModalOpen, setIsTrainingCompleteModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Save theme to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('goftino_theme', theme);
    } catch {}
  }, [theme]);

  // Save canned responses to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('goftino_canned_responses', JSON.stringify(cannedResponses));
    } catch {}
  }, [cannedResponses]);

  // Save current user to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('goftino_current_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('goftino_current_user');
      }
    } catch {}
  }, [currentUser]);

  // Save scenarios and sessions
  useEffect(() => {
    try {
      localStorage.setItem('goftino_scenarios_v3', JSON.stringify(scenarios));
    } catch {}
  }, [scenarios]);

  useEffect(() => {
    try {
      localStorage.setItem('goftino_sessions_v3', JSON.stringify(sessions));
    } catch {}
  }, [sessions]);

  // Sync sound manager settings
  useEffect(() => {
    soundManager.enabled = soundEnabled;
    soundManager.currentSound = currentSoundType;
  }, [soundEnabled, currentSoundType]);

  // Format Persian time
  const getCurrentTimeStr = () => {
    const d = new Date();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleLogin = (user: AppUser) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setAdminViewMode('admin_panel');
    } else {
      setAdminViewMode('chat_view');
      setActiveFilterTab('waiting');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveScenarioId(null);
    localStorage.removeItem('goftino_current_user');
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Add / Delete Canned Responses
  const handleAddCannedResponse = (title: string, text: string) => {
    const newItem: CannedResponseItem = {
      id: `canned-${Date.now()}`,
      title,
      text,
    };
    setCannedResponses((prev) => [newItem, ...prev]);
  };

  const handleDeleteCannedResponse = (id: string) => {
    setCannedResponses((prev) => prev.filter((item) => item.id !== id));
  };

  // Change sound type
  const handleChangeSoundType = (type: SoundType) => {
    setCurrentSoundType(type);
    try {
      localStorage.setItem('goftino_sound_type', type);
    } catch {}
  };

  // Trainee or Admin claims a chat and assigns it to themselves
  const handleClaimChat = (scenarioId: string) => {
    if (!currentUser) return;
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (!scenario) return;

    let existingSession = sessions[scenarioId];
    if (!existingSession) {
      const firstUserMessage = scenario.userMessages[0] || 'سلام، نیاز به راهنمایی دارم.';
      const initialMessage: ChatMessage = {
        id: `msg-${Date.now()}-0`,
        sender: 'user',
        text: firstUserMessage,
        timestamp: getCurrentTimeStr(),
        isDelivered: true,
        isRead: true,
      };

      existingSession = {
        scenarioId: scenario.id,
        customerName: scenario.customerName,
        customerAvatar: scenario.customerAvatar,
        assignedAgentId: currentUser.id,
        assignedAgentName: currentUser.name,
        status: 'in_progress',
        messages: [initialMessage],
        currentStepIndex: 1,
        isUserTyping: false,
        startedAt: Date.now(),
        agentResponseTimes: [],
      };
    } else {
      existingSession = {
        ...existingSession,
        assignedAgentId: currentUser.id,
        assignedAgentName: currentUser.name,
        status: 'in_progress',
      };
    }

    setSessions((prev) => ({
      ...prev,
      [scenarioId]: existingSession,
    }));

    setActiveFilterTab('my_chats');
    setActiveScenarioId(scenarioId);
    soundManager.playIncomingNotification();
  };

  // Select a scenario from list
  const handleSelectScenario = (scenario: ChatScenario) => {
    setActiveScenarioId(scenario.id);

    if (!sessions[scenario.id]) {
      const firstUserMessage = scenario.userMessages[0] || 'سلام، نیاز به راهنمایی دارم.';
      const initialMessage: ChatMessage = {
        id: `msg-${Date.now()}-0`,
        sender: 'user',
        text: firstUserMessage,
        timestamp: getCurrentTimeStr(),
        isDelivered: true,
        isRead: true,
      };

      const newSession: ChatSession = {
        scenarioId: scenario.id,
        customerName: scenario.customerName,
        customerAvatar: scenario.customerAvatar,
        assignedAgentId: null,
        assignedAgentName: null,
        status: 'pending',
        messages: [initialMessage],
        currentStepIndex: 1,
        isUserTyping: false,
        startedAt: Date.now(),
        agentResponseTimes: [],
      };

      setSessions((prev) => ({ ...prev, [scenario.id]: newSession }));
      setLastMessageSentTime(Date.now());
      soundManager.playIncomingNotification();
    }
  };

  // Start chat with an online visitor (Option 2)
  const handleStartChatWithVisitor = (visitor: OnlineVisitor) => {
    const newScenarioId = `visitor-${Date.now()}`;
    const newScenario: ChatScenario = {
      id: newScenarioId,
      customerName: visitor.name,
      previewMessage: visitor.suggestedPrompt,
      unreadCount: 1,
      category: `کاربر وب‌سایت (${visitor.pageTitle})`,
      userMessages: [
        visitor.suggestedPrompt,
        'بله ممنون، می‌خواستم بدونم چقدر زمان می‌بره تا درخواست من تایید بشه؟',
        'بسیار عالی، توضیحاتتون کامل بود. تشکر از همراهی شما.',
      ],
      createdAt: new Date().toLocaleDateString('fa-IR'),
      assignedAgentId: currentUser?.id || null,
      assignedAgentName: currentUser?.name || null,
    };

    handleAddNewScenario(newScenario);
    setActiveToolbarTab('chat');
    setActiveFilterTab('my_chats');
    handleClaimChat(newScenarioId);
  };

  // Reopen an archived chat (Option 3)
  const handleReopenChat = (scenarioId: string) => {
    setActiveToolbarTab('chat');
    const sc = scenarios.find((s) => s.id === scenarioId);
    if (sc) {
      handleSelectScenario(sc);
    }
  };

  // Trainee sends a response: customer replies strictly in response to this
  const handleSendMessage = (text: string) => {
    if (!activeScenarioId || !currentUser) return;
    const currentScenario = scenarios.find((s) => s.id === activeScenarioId);
    let currentSession = sessions[activeScenarioId];
    if (!currentScenario || !currentSession || currentSession.isUserTyping) return;

    if (!currentSession.assignedAgentId) {
      currentSession = {
        ...currentSession,
        assignedAgentId: currentUser.id,
        assignedAgentName: currentUser.name,
        status: 'in_progress',
      };
      setActiveFilterTab('my_chats');
    }

    const now = Date.now();
    const responseTimeSec = Math.max(1, Math.round((now - lastMessageSentTime) / 1000));
    setLastMessageSentTime(now);

    const agentMessage: ChatMessage = {
      id: `msg-${Date.now()}-agent`,
      sender: 'agent',
      text,
      timestamp: getCurrentTimeStr(),
      isDelivered: true,
      isRead: true,
    };

    const updatedMessages = [...currentSession.messages, agentMessage];
    const updatedResponseTimes = [...currentSession.agentResponseTimes, responseTimeSec];

    const nextStepIndex = currentSession.currentStepIndex;
    const hasMoreUserMessages = nextStepIndex < currentScenario.userMessages.length;

    if (hasMoreUserMessages) {
      setSessions((prev) => ({
        ...prev,
        [activeScenarioId]: {
          ...currentSession,
          messages: updatedMessages,
          agentResponseTimes: updatedResponseTimes,
          isUserTyping: true,
        },
      }));
      soundManager.playSentPop();

      // Triggered strictly upon agent reply
      const delayMs = userTypingDelay * 1000;
      setTimeout(() => {
        const nextUserMessageText = currentScenario.userMessages[nextStepIndex];
        const nextUserMsg: ChatMessage = {
          id: `msg-${Date.now()}-user`,
          sender: 'user',
          text: nextUserMessageText,
          timestamp: getCurrentTimeStr(),
          isDelivered: true,
          isRead: true,
        };

        setSessions((prev) => {
          const sess = prev[activeScenarioId];
          if (!sess) return prev;
          return {
            ...prev,
            [activeScenarioId]: {
              ...sess,
              messages: [...sess.messages, nextUserMsg],
              currentStepIndex: nextStepIndex + 1,
              isUserTyping: false,
            },
          };
        });

        setLastMessageSentTime(Date.now());
        soundManager.playIncomingNotification();
      }, delayMs);
    } else {
      soundManager.playSentPop();
      const completedSession: ChatSession = {
        ...currentSession,
        messages: updatedMessages,
        agentResponseTimes: updatedResponseTimes,
        status: 'completed',
        completedAt: Date.now(),
        isUserTyping: false,
      };

      setSessions((prev) => ({
        ...prev,
        [activeScenarioId]: completedSession,
      }));

      if (!completedScenarioIds.includes(activeScenarioId)) {
        setCompletedScenarioIds((prev) => [...prev, activeScenarioId]);
      }

      setTimeout(() => {
        setIsTrainingCompleteModalOpen(true);
      }, 700);
    }
  };

  // Reset current session
  const handleResetSession = () => {
    if (!activeScenarioId || !currentUser) return;
    const scenario = scenarios.find((s) => s.id === activeScenarioId);
    if (!scenario) return;

    const firstUserMessage = scenario.userMessages[0] || 'سلام، نیاز به راهنمایی دارم.';
    const initialMessage: ChatMessage = {
      id: `msg-${Date.now()}-0`,
      sender: 'user',
      text: firstUserMessage,
      timestamp: getCurrentTimeStr(),
      isDelivered: true,
      isRead: true,
    };

    const newSession: ChatSession = {
      scenarioId: scenario.id,
      customerName: scenario.customerName,
      customerAvatar: scenario.customerAvatar,
      assignedAgentId: currentUser.id,
      assignedAgentName: currentUser.name,
      status: 'in_progress',
      messages: [initialMessage],
      currentStepIndex: 1,
      isUserTyping: false,
      startedAt: Date.now(),
      agentResponseTimes: [],
    };

    setSessions((prev) => ({ ...prev, [scenario.id]: newSession }));
    setLastMessageSentTime(Date.now());
    soundManager.playIncomingNotification();
  };

  // Add new scenario into the waiting queue
  const handleAddNewScenario = (newScenario: ChatScenario) => {
    const firstUserMessage = newScenario.userMessages[0] || 'سلام، نیاز به راهنمایی دارم.';
    const initialMessage: ChatMessage = {
      id: `msg-${Date.now()}-0`,
      sender: 'user',
      text: firstUserMessage,
      timestamp: getCurrentTimeStr(),
      isDelivered: true,
      isRead: false,
    };

    const newSession: ChatSession = {
      scenarioId: newScenario.id,
      customerName: newScenario.customerName,
      customerAvatar: newScenario.customerAvatar,
      assignedAgentId: null,
      assignedAgentName: null,
      status: 'pending',
      messages: [initialMessage],
      currentStepIndex: 1,
      isUserTyping: false,
      startedAt: Date.now(),
      agentResponseTimes: [],
    };

    setScenarios((prev) => [newScenario, ...prev]);
    setSessions((prev) => ({
      ...prev,
      [newScenario.id]: newSession,
    }));
  };

  // Delete scenario
  const handleDeleteScenario = (scenarioId: string) => {
    setScenarios((prev) => prev.filter((s) => s.id !== scenarioId));
    if (activeScenarioId === scenarioId) {
      setActiveScenarioId(null);
    }
  };

  // Clear all scenarios and sessions completely
  const handleClearAllScenarios = () => {
    setScenarios([]);
    setSessions({});
    setActiveScenarioId(null);
    setCompletedScenarioIds([]);
    try {
      localStorage.removeItem('goftino_scenarios_v3');
      localStorage.removeItem('goftino_sessions_v3');
      localStorage.removeItem('goftino_scenarios');
      localStorage.removeItem('goftino_sessions');
    } catch {}
  };

  // Update session review by Admin
  const handleUpdateSessionReview = (scenarioId: string, score: number, feedback: string) => {
    setSessions((prev) => {
      const sess = prev[scenarioId];
      if (!sess) return prev;
      return {
        ...prev,
        [scenarioId]: {
          ...sess,
          adminReview: {
            score,
            feedback,
            reviewedBy: currentUser?.name || 'مدیر آموزش',
            reviewedAt: new Date().toLocaleDateString('fa-IR'),
          },
        },
      };
    });
  };

  const handleJumpToChat = (scenarioId: string) => {
    setAdminViewMode('chat_view');
    setActiveToolbarTab('chat');
    setActiveFilterTab('waiting');
    setActiveScenarioId(scenarioId);
  };

  // If not logged in, render the Landing & Login Page
  if (!currentUser) {
    return <LandingLoginPage onLogin={handleLogin} />;
  }

  // If logged in as Admin and in 'admin_panel' mode
  if (currentUser.role === 'admin' && adminViewMode === 'admin_panel') {
    return (
      <AdminPanel
        currentUser={currentUser}
        scenarios={scenarios}
        sessions={sessions}
        onAddNewScenario={handleAddNewScenario}
        onDeleteScenario={handleDeleteScenario}
        onClearAllScenarios={handleClearAllScenarios}
        onUpdateSessionReview={handleUpdateSessionReview}
        onSwitchToAgentView={() => setAdminViewMode('chat_view')}
        onJumpToChat={handleJumpToChat}
        onLogout={handleLogout}
      />
    );
  }

  const isDark = theme === 'dark';
  const activeScenario = scenarios.find((s) => s.id === activeScenarioId) || null;
  const activeSession = activeScenarioId ? sessions[activeScenarioId] : null;

  return (
    <div
      dir="rtl"
      className={`flex h-screen w-screen overflow-hidden font-['Vazirmatn',sans-serif] antialiased select-none transition-colors duration-200 ${
        isDark ? 'bg-[#383838] text-gray-100' : 'bg-[#eef0f3] text-gray-800'
      }`}
    >
      {/* 1. Rightmost Vertical Toolbar (Option 1: Chat, Option 2: Monitor, Option 3: Archive, Option 4: Settings, Bottom: Theme toggle) */}
      <RightToolbar
        currentUser={currentUser}
        activeTab={activeToolbarTab}
        setActiveTab={(tab) => {
          if (tab === 'settings') {
            setIsSettingsModalOpen(true);
          } else {
            setActiveToolbarTab(tab);
          }
        }}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenAdminPanel={() => {
          if (currentUser?.role !== 'admin') {
            setCurrentUser((prev) =>
              prev
                ? { ...prev, role: 'admin' }
                : {
                    id: 'admin-1',
                    name: 'مدیر سیستم',
                    email: 'admin@goftino.com',
                    role: 'admin',
                    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
                    department: 'مدیریت آموزش',
                  }
            );
          }
          setAdminViewMode('admin_panel');
        }}
        onLogout={handleLogout}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Container dependent on activeToolbarTab */}
      {activeToolbarTab === 'chat' && (
        <>
          {/* Chat List Panel ("گفتگوها", 3 tabs) */}
          <ChatListPanel
            currentUser={currentUser}
            scenarios={scenarios}
            sessions={sessions}
            activeScenarioId={activeScenarioId}
            onSelectScenario={handleSelectScenario}
            activeFilterTab={activeFilterTab}
            setActiveFilterTab={setActiveFilterTab}
            completedScenarioIds={completedScenarioIds}
            theme={theme}
          />

          {/* Main Chat Workspace */}
          <main
            className={`flex-1 flex flex-col h-full relative overflow-hidden transition-colors duration-200 ${
              isDark ? 'bg-[#383838]' : 'bg-[#f4f5f7]'
            }`}
          >
            {/* Top Left Header Bar */}
            <header className="h-12 bg-transparent px-5 flex items-center justify-between select-none z-10 shrink-0">
              {currentUser.role === 'admin' ? (
                <button
                  onClick={() => setAdminViewMode('admin_panel')}
                  className="text-xs text-purple-400 bg-purple-950/70 border border-purple-800/40 px-3 py-1 rounded-lg hover:bg-purple-900/60 transition-colors font-medium flex items-center gap-1.5"
                >
                  <span>← بازگشت به پنل مدیریت آموزش</span>
                </button>
              ) : (
                <div className="text-xs text-gray-400">
                  کارشناس: <span className="font-semibold">{currentUser.name}</span>
                </div>
              )}

              <div className="mr-auto">
                <TopLeftHeader
                  isAgentOnline={isAgentOnline}
                  onToggleAgentOnline={() => setIsAgentOnline(!isAgentOnline)}
                  onOpenHelp={() => setIsHelpModalOpen(true)}
                  onOpenScenarioModal={() => setIsScenarioModalOpen(true)}
                />
              </div>
            </header>

            {/* Content Body: Empty State OR Active Chat Simulator */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {activeScenario && activeSession ? (
                <ActiveChatView
                  currentUser={currentUser}
                  scenario={activeScenario}
                  session={activeSession}
                  onSendMessage={handleSendMessage}
                  onResetSession={handleResetSession}
                  onOpenScenarioModal={() => setIsScenarioModalOpen(true)}
                  onClaimChat={handleClaimChat}
                  userTypingDelay={userTypingDelay}
                  cannedResponses={cannedResponses}
                  theme={theme}
                  onCloseChat={() => setActiveScenarioId(null)}
                />
              ) : (
                <EmptyChatState />
              )}
            </div>
          </main>
        </>
      )}

      {/* Option 2: بازدیدکنندگان آنلاین (Live Online Visitors View) */}
      {activeToolbarTab === 'monitor' && (
        <OnlineVisitorsView
          onStartChatWithVisitor={handleStartChatWithVisitor}
          theme={theme}
        />
      )}

      {/* Option 3: آرشیو گفتگوها (Chat Archive View) */}
      {activeToolbarTab === 'archive' && (
        <ChatArchiveView
          scenarios={scenarios}
          sessions={sessions}
          onReopenChat={handleReopenChat}
          theme={theme}
        />
      )}

      {/* Option 4 Modal: تنظیمات سامانه (System Settings Modal) */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        cannedResponses={cannedResponses}
        onAddCannedResponse={handleAddCannedResponse}
        onDeleteCannedResponse={handleDeleteCannedResponse}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        currentSoundType={currentSoundType}
        onChangeSoundType={handleChangeSoundType}
        userTypingDelay={userTypingDelay}
        setUserTypingDelay={setUserTypingDelay}
        theme={theme}
      />

      {/* Scenario Upload / Edit Modal */}
      <ScenarioModal
        isOpen={isScenarioModalOpen}
        onClose={() => setIsScenarioModalOpen(false)}
        scenarios={scenarios}
        activeScenarioId={activeScenarioId}
        onSelectAndApplyScenario={handleSelectScenario}
        onAddNewScenario={handleAddNewScenario}
        userTypingDelay={userTypingDelay}
        setUserTypingDelay={setUserTypingDelay}
      />

      {activeScenario && activeSession && (
        <TrainingCompleteModal
          isOpen={isTrainingCompleteModalOpen}
          onClose={() => setIsTrainingCompleteModalOpen(false)}
          scenario={activeScenario}
          session={activeSession}
          onReplay={handleResetSession}
          onNextScenario={() => {
            const currentIndex = scenarios.findIndex((s) => s.id === activeScenarioId);
            if (currentIndex >= 0 && currentIndex < scenarios.length - 1) {
              handleSelectScenario(scenarios[currentIndex + 1]);
            }
          }}
          hasNextScenario={
            scenarios.findIndex((s) => s.id === activeScenarioId) < scenarios.length - 1
          }
        />
      )}

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  );
}
