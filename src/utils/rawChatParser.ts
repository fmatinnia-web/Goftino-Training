/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ParseResult {
  customerName: string;
  category: string;
  userMessages: string[];
  rawCount: number;
}

export function parseRawChatInput(rawText: string, fallbackName = 'کاربر جدید'): ParseResult {
  const trimmed = rawText.trim();
  if (!trimmed) {
    throw new Error('متن چت خام خالی است. لطفاً متن یا فایل معتبری انتخاب کنید.');
  }

  // 1. Detect customer name if present in headers like "نام کاربر: ...", "مشتری: ...", "نام: ..."
  let detectedName = fallbackName;
  const nameHeaderRegex = /^(?:نام\s*کاربر|نام\s*مشتری|نام\s*مخاطب|نام|Customer\s*Name|User\s*Name)\s*[:=]\s*(.+)$/im;
  const nameMatch = trimmed.match(nameHeaderRegex);
  if (nameMatch && nameMatch[1]) {
    const candidateName = nameMatch[1].trim();
    if (candidateName.length > 1 && candidateName.length < 40) {
      detectedName = candidateName;
    }
  }

  // 2. Check if it's a valid JSON
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        const msgs = parsed
          .map((item) => {
            if (typeof item === 'string') return item.trim();
            if (item && typeof item === 'object') {
              return (item.message || item.text || item.userMessage || item.content || '').trim();
            }
            return '';
          })
          .filter(Boolean);

        if (msgs.length > 0) {
          return {
            customerName: detectedName,
            category: 'سناریوی استخراج‌شده از JSON',
            userMessages: msgs,
            rawCount: msgs.length,
          };
        }
      } else if (typeof parsed === 'object' && parsed !== null) {
        const messages = parsed.userMessages || parsed.messages || parsed.dialogue || [];
        const msgs = (Array.isArray(messages) ? messages : [])
          .map((item) => (typeof item === 'string' ? item : item.text || item.message || item.content || '').trim())
          .filter(Boolean);

        return {
          customerName: parsed.customerName || detectedName,
          category: parsed.category || 'سناریوی فایل JSON',
          userMessages: msgs.length > 0 ? msgs : ['سلام، نیاز به بررسی حساب دارم.'],
          rawCount: msgs.length,
        };
      }
    } catch {
      // Fallback to text parsing
    }
  }

  // 3. Parse conversational transcript lines
  const lines = trimmed.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const userMessages: string[] = [];

  // Patterns indicating customer message in Persian or English transcripts
  const customerPrefixRegex = /^(?:\[[\d:\sAPMapm]+\]\s*)?(?:کاربر|مشتری|مخاطب|خریدار|ارسال‌کننده|User|Customer|Client|Sender)(?:\s*\(.*?\))?\s*[:\-]\s*(.+)$/i;
  // Patterns indicating agent/support message to omit (since trainee will formulate answers)
  const agentPrefixRegex = /^(?:\[[\d:\sAPMapm]+\]\s*)?(?:پشتیبان|اپراتور|پشتیبانی|کارشناس|ادمین|پاسخگو|Agent|Support|Operator|Admin)\s*(?:\(.*?\))?\s*[:\-]\s*(.+)$/i;

  let hasPrefixMatches = false;

  for (const line of lines) {
    // Skip name headers
    if (nameHeaderRegex.test(line)) continue;

    const custMatch = line.match(customerPrefixRegex);
    if (custMatch && custMatch[1]) {
      hasPrefixMatches = true;
      const cleanMsg = custMatch[1].trim();
      if (cleanMsg) {
        userMessages.push(cleanMsg);
      }
      continue;
    }

    const agentMatch = line.match(agentPrefixRegex);
    if (agentMatch) {
      hasPrefixMatches = true;
      // Skip agent line, agent trainee will answer in simulation
      continue;
    }
  }

  // 4. If no conversational prefixes detected, treat distinct non-empty paragraphs as sequential customer messages
  if (!hasPrefixMatches || userMessages.length === 0) {
    for (const line of lines) {
      if (nameHeaderRegex.test(line)) continue;

      // Strip numbering like "1-", "1.", "- ", "• "
      const cleanLine = line
        .replace(/^\d+[\.\-\)]\s*/, '')
        .replace(/^[\-\*\•\>\#]\s*/, '')
        .trim();

      if (cleanLine.length > 2) {
        userMessages.push(cleanLine);
      }
    }
  }

  if (userMessages.length === 0) {
    throw new Error('پیامی در متن یا فایل یافت نشد. لطفاً چند خط پیام وارد کنید.');
  }

  return {
    customerName: detectedName,
    category: 'مکالمه تبدیل‌شده از فایل/متن',
    userMessages,
    rawCount: userMessages.length,
  };
}
