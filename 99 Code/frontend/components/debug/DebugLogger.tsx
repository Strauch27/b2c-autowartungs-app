'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// --- Types ---

type LogLevel = 'click' | 'nav' | 'input' | 'form' | 'api' | 'error' | 'info';

interface LogEntry {
  id: number;
  timestamp: string;
  level: LogLevel;
  message: string;
  details?: Record<string, unknown>;
}

const LEVEL_COLORS: Record<LogLevel, string> = {
  click: '#3b82f6',  // blue
  nav: '#8b5cf6',    // purple
  input: '#06b6d4',  // cyan
  form: '#f59e0b',   // amber
  api: '#10b981',    // green
  error: '#ef4444',  // red
  info: '#6b7280',   // gray
};

const LEVEL_LABELS: Record<LogLevel, string> = {
  click: 'CLICK',
  nav: 'NAV',
  input: 'INPUT',
  form: 'FORM',
  api: 'API',
  error: 'ERROR',
  info: 'INFO',
};

// --- Helper: describe a DOM element ---

function describeElement(el: HTMLElement): string {
  const tag = el.tagName.toLowerCase();
  const text = el.textContent?.trim().slice(0, 60) || '';
  const id = el.id ? `#${el.id}` : '';
  const classes = el.className && typeof el.className === 'string'
    ? '.' + el.className.split(' ').slice(0, 3).join('.')
    : '';
  const href = el.getAttribute('href') || el.closest('a')?.getAttribute('href') || '';
  const role = el.getAttribute('role') || '';
  const testId = el.getAttribute('data-testid') || '';

  let desc = `<${tag}${id}>`;
  if (testId) desc += ` [data-testid="${testId}"]`;
  if (role) desc += ` [role="${role}"]`;
  if (href) desc += ` href="${href}"`;
  if (text) desc += ` "${text.slice(0, 40)}${text.length > 40 ? '...' : ''}"`;
  return desc;
}

// --- Component ---

export function DebugLogger() {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<LogLevel | 'all'>('all');
  const logIdRef = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const addLog = useCallback((level: LogLevel, message: string, details?: Record<string, unknown>) => {
    const entry: LogEntry = {
      id: logIdRef.current++,
      timestamp: new Date().toISOString().slice(11, 23),
      level,
      message,
      details,
    };
    setLogs(prev => [...prev.slice(-500), entry]); // keep last 500

    // Also log to console with color
    const style = `color: ${LEVEL_COLORS[level]}; font-weight: bold;`;
    console.log(`%c[${LEVEL_LABELS[level]}] ${entry.timestamp}`, style, message, details || '');
  }, []);

  // --- 1. Click tracking ---
  useEffect(() => {
    if (!isDemoMode) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      // Skip clicks inside the debug panel
      if (panelRef.current?.contains(target)) return;

      const clickable = target.closest('a, button, [role="button"], [role="menuitem"], [role="tab"], input[type="submit"], select') as HTMLElement | null;
      const el = clickable || target;

      const desc = describeElement(el);
      const rect = el.getBoundingClientRect();

      addLog('click', desc, {
        x: Math.round(rect.left + rect.width / 2),
        y: Math.round(rect.top + rect.height / 2),
        tagName: el.tagName.toLowerCase(),
        id: el.id || undefined,
        href: el.getAttribute('href') || el.closest('a')?.getAttribute('href') || undefined,
        text: el.textContent?.trim().slice(0, 80) || undefined,
      });
    };

    document.addEventListener('click', handleClick, { capture: true });
    return () => document.removeEventListener('click', handleClick, { capture: true });
  }, [isDemoMode, addLog]);

  // --- 2. Route/Navigation tracking ---
  useEffect(() => {
    if (!isDemoMode) return;
    const params = searchParams?.toString();
    const fullPath = params ? `${pathname}?${params}` : pathname;
    addLog('nav', `Navigated to ${fullPath}`, { pathname, searchParams: params || undefined });
  }, [pathname, searchParams, isDemoMode, addLog]);

  // --- 3. Input/Change tracking ---
  useEffect(() => {
    if (!isDemoMode) return;

    const handleInput = (e: Event) => {
      const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
      if (!target || !('value' in target)) return;
      if (panelRef.current?.contains(target)) return;

      const tag = target.tagName.toLowerCase();
      const type = (target as HTMLInputElement).type || '';
      const name = target.name || target.id || '';
      const isPassword = type === 'password';
      const value = isPassword ? '***' : target.value?.slice(0, 50);

      addLog('input', `${tag}[${type || 'text'}] "${name}" = "${value}"`, {
        element: tag,
        type,
        name,
        value: isPassword ? '***' : value,
      });
    };

    document.addEventListener('change', handleInput, { capture: true });
    return () => document.removeEventListener('change', handleInput, { capture: true });
  }, [isDemoMode, addLog]);

  // --- 4. Form submission tracking ---
  useEffect(() => {
    if (!isDemoMode) return;

    const handleSubmit = (e: Event) => {
      const form = e.target as HTMLFormElement;
      if (!form || form.tagName !== 'FORM') return;

      const action = form.action || '(no action)';
      const method = form.method || 'GET';
      addLog('form', `Form submitted: ${method.toUpperCase()} ${action}`, {
        method,
        action,
        id: form.id || undefined,
      });
    };

    document.addEventListener('submit', handleSubmit, { capture: true });
    return () => document.removeEventListener('submit', handleSubmit, { capture: true });
  }, [isDemoMode, addLog]);

  // --- 5. Fetch/API interceptor ---
  useEffect(() => {
    if (!isDemoMode) return;

    const originalFetch = window.fetch;
    window.fetch = async function (...args: Parameters<typeof fetch>) {
      const [input, init] = args;
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url;
      const method = init?.method || 'GET';

      // Only log API calls, not static assets
      const isApi = url.includes('/api/') || url.includes('localhost:5001');
      if (!isApi) return originalFetch.apply(this, args);

      const startTime = performance.now();
      addLog('api', `>> ${method.toUpperCase()} ${url}`);

      try {
        const response = await originalFetch.apply(this, args);
        const duration = Math.round(performance.now() - startTime);
        const statusEmoji = response.ok ? '' : ' !!';
        addLog('api', `<< ${response.status} ${method.toUpperCase()} ${url} (${duration}ms)${statusEmoji}`, {
          status: response.status,
          duration,
          ok: response.ok,
        });
        return response;
      } catch (err) {
        const duration = Math.round(performance.now() - startTime);
        addLog('error', `!! FETCH FAILED: ${method.toUpperCase()} ${url} (${duration}ms) - ${err}`, {
          url,
          method,
          error: String(err),
        });
        throw err;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [isDemoMode, addLog]);

  // --- 6. Error tracking ---
  useEffect(() => {
    if (!isDemoMode) return;

    const handleError = (e: ErrorEvent) => {
      addLog('error', `JS Error: ${e.message}`, {
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
      });
    };

    const handleUnhandledRejection = (e: PromiseRejectionEvent) => {
      addLog('error', `Unhandled Promise Rejection: ${e.reason}`, {
        reason: String(e.reason),
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [isDemoMode, addLog]);

  // --- 7. Keyboard shortcut (Ctrl+Shift+D) ---
  useEffect(() => {
    if (!isDemoMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDemoMode]);

  // --- Auto-scroll ---
  useEffect(() => {
    if (isOpen && panelRef.current) {
      const scrollArea = panelRef.current.querySelector('[data-log-scroll]');
      if (scrollArea) scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [logs, isOpen]);

  // --- Export logs ---
  const exportLogs = useCallback(() => {
    const data = logs.map(l => ({
      time: l.timestamp,
      level: l.level,
      message: l.message,
      ...l.details,
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-log-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [logs]);

  if (!isDemoMode) return null;

  const filteredLogs = filter === 'all' ? logs : logs.filter(l => l.level === filter);

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-4 right-4 z-[9998] bg-gray-900 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-gray-700 transition-colors text-sm font-mono"
        title="Debug Logger (Ctrl+Shift+D)"
      >
        {isOpen ? 'X' : 'D'}
      </button>

      {/* Log count badge */}
      {!isOpen && logs.length > 0 && (
        <span className="fixed bottom-12 right-4 z-[9998] bg-red-500 text-white rounded-full px-1.5 py-0.5 text-[10px] font-bold min-w-[18px] text-center pointer-events-none">
          {logs.length}
        </span>
      )}

      {/* Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          className="fixed bottom-16 right-4 z-[9998] w-[520px] max-h-[60vh] bg-gray-950 text-gray-100 rounded-lg shadow-2xl border border-gray-700 flex flex-col overflow-hidden"
          style={{ fontSize: '12px', fontFamily: 'ui-monospace, monospace' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-gray-900 border-b border-gray-700 shrink-0">
            <span className="font-bold text-xs tracking-wide">DEBUG LOG ({filteredLogs.length})</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setLogs([])} className="px-2 py-0.5 text-[10px] bg-gray-700 rounded hover:bg-gray-600">Clear</button>
              <button onClick={exportLogs} className="px-2 py-0.5 text-[10px] bg-blue-700 rounded hover:bg-blue-600">Export</button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-900/50 border-b border-gray-800 shrink-0 flex-wrap">
            {(['all', 'click', 'nav', 'input', 'form', 'api', 'error'] as const).map(level => (
              <button
                key={level}
                onClick={() => setFilter(level)}
                className={`px-2 py-0.5 text-[10px] rounded transition-colors ${
                  filter === level
                    ? 'bg-white/20 text-white font-bold'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
                style={filter === level && level !== 'all' ? { color: LEVEL_COLORS[level] } : undefined}
              >
                {level === 'all' ? 'ALL' : LEVEL_LABELS[level]}
              </button>
            ))}
          </div>

          {/* Log entries */}
          <div data-log-scroll className="overflow-y-auto flex-1 min-h-0">
            {filteredLogs.length === 0 ? (
              <div className="px-3 py-8 text-center text-gray-500 text-xs">
                Waiting for events... Click, navigate, or interact with the app.
              </div>
            ) : (
              filteredLogs.map(entry => (
                <div
                  key={entry.id}
                  className="px-3 py-1 border-b border-gray-800/50 hover:bg-gray-800/30 leading-tight"
                >
                  <span className="text-gray-500">{entry.timestamp}</span>
                  {' '}
                  <span
                    className="font-bold text-[10px] inline-block w-[40px]"
                    style={{ color: LEVEL_COLORS[entry.level] }}
                  >
                    {LEVEL_LABELS[entry.level]}
                  </span>
                  {' '}
                  <span className="text-gray-200 break-all">{entry.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}
