import { apiClient } from '@/lib/api/client';

type PollingCallback<T> = (data: T) => void;

interface ActivePoll {
  intervalId: ReturnType<typeof setInterval>;
  url: string;
}

let nextPollId = 1;
const activePolls = new Map<number, ActivePoll>();

export function startPolling<T>(
  url: string,
  intervalMs: number,
  callback: PollingCallback<T>
): number {
  const id = nextPollId++;

  // Execute immediately on start
  apiClient.get<T>(url).then(callback).catch(console.error);

  const intervalId = setInterval(async () => {
    try {
      const data = await apiClient.get<T>(url);
      callback(data);
    } catch (error) {
      console.error(`Polling error for ${url}:`, error);
    }
  }, intervalMs);

  activePolls.set(id, { intervalId, url });

  return id;
}

export function stopPolling(id: number): void {
  const poll = activePolls.get(id);
  if (poll) {
    clearInterval(poll.intervalId);
    activePolls.delete(id);
  }
}

export function stopAllPolling(): void {
  for (const [id, poll] of activePolls) {
    clearInterval(poll.intervalId);
    activePolls.delete(id);
  }
}
