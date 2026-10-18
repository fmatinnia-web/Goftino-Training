/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppUser } from '../types/chat';

export const INITIAL_USERS: AppUser[] = [
  {
    id: 'user-admin-1',
    name: 'مهندس حسینی',
    email: 'admin@goftino.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    department: 'مدیریت و آموزش پشتیبانی'
  },
  {
    id: 'user-agent-1',
    name: 'سارا محمدی',
    email: 'sara@goftino.com',
    role: 'agent',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    department: 'کارشناس پشتیبانی سطح ۱'
  },
  {
    id: 'user-agent-2',
    name: 'امیر رضایی',
    email: 'amir@goftino.com',
    role: 'agent',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    department: 'کارشناس پشتیبانی امور مالی'
  }
];
