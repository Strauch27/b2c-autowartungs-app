'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface Message {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  isSystem?: boolean;
}

interface CommunicationSectionProps {
  messages: Message[];
  onSend: (text: string) => void;
}

export function CommunicationSection({ messages, onSend }: CommunicationSectionProps) {
  const t = useTranslations('workshopDashboard.detail');
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-card p-5 shadow-sm" data-testid="communication-section">
      <p className="text-overline mb-3 text-muted-foreground">{t('communication')}</p>

      <div className="mb-3 space-y-2">
        {messages.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">--</p>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              className={`rounded-lg p-2.5 text-xs ${
                msg.isSystem ? 'bg-primary/5' : 'bg-neutral-50'
              }`}
            >
              <div className="mb-1 flex items-center justify-between">
                <span className={`font-medium ${msg.isSystem ? 'text-primary' : 'text-foreground'}`}>
                  {msg.isSystem ? t('system') : msg.author}
                </span>
                <span className="text-muted-foreground">{msg.timestamp}</span>
              </div>
              <p className="text-neutral-600">{msg.content}</p>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-cta focus:outline-none focus:ring-2 focus:ring-cta/30"
          placeholder={t('addNote')}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="rounded-lg bg-foreground px-4 py-2 text-xs font-semibold text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
        >
          {t('send')}
        </button>
      </div>
    </div>
  );
}
