/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'agent';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  department?: string;
}

export interface ScenarioMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  text: string;
  timestamp: string;
  expectedTopic?: string;
  hintForAgent?: string;
}

export interface ChatScenario {
  id: string;
  customerName: string;
  customerAvatar?: string;
  previewMessage: string;
  userMessages: string[]; // Sequential user messages in the scenario
  hints?: string[]; // Helpful hints for the trainee at each step
  category: string;
  tags?: string[];
  unreadCount: number;
  assignedAgentId?: string | null;
  assignedAgentName?: string | null;
  createdAt?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  text: string;
  timestamp: string;
  isDelivered?: boolean;
  isRead?: boolean;
}

export interface ChatSession {
  scenarioId: string;
  customerName: string;
  customerAvatar?: string;
  assignedAgentId: string | null;
  assignedAgentName: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  messages: ChatMessage[];
  currentStepIndex: number; // Next user message index in scenario
  isUserTyping: boolean;
  startedAt?: number;
  completedAt?: number;
  agentResponseTimes: number[]; // in seconds
  adminReview?: {
    score?: number; // 1-5
    feedback?: string;
    reviewedBy?: string;
    reviewedAt?: string;
  };
}
