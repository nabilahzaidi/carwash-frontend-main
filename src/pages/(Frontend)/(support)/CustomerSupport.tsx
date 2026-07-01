import { useEffect, useState } from 'react';

const STORAGE_KEY = 'customerSupportEnquiries';

type SupportMessage = {
  id: string;
  sender: 'customer' | 'admin';
  content: string;
  createdAt: string;
};

type SupportThread = {
  id: string;
  createdAt: string;
  updatedAt: string;
  messages: SupportMessage[];
};

const normalizeThreads = (value: unknown): SupportThread[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.reduce<SupportThread[]>((threads, item) => {
    if (!item || typeof item !== 'object') {
      return threads;
    }

    const candidate = item as Record<string, unknown>;
    const legacyMessage = typeof candidate.message === 'string' ? candidate.message.trim() : '';
    const existingMessages = Array.isArray(candidate.messages) ? (candidate.messages as SupportMessage[]) : [];

    if (existingMessages.length > 0) {
      threads.push({
        id: typeof candidate.id === 'string' ? candidate.id : `${Date.now()}-${threads.length}`,
        createdAt: typeof candidate.createdAt === 'string' ? candidate.createdAt : new Date().toISOString(),
        updatedAt: typeof candidate.updatedAt === 'string' ? candidate.updatedAt : new Date().toISOString(),
        messages: existingMessages,
      });
      return threads;
    }

    if (legacyMessage) {
      threads.push({
        id: typeof candidate.id === 'string' ? candidate.id : `${Date.now()}-${threads.length}`,
        createdAt: typeof candidate.createdAt === 'string' ? candidate.createdAt : new Date().toISOString(),
        updatedAt: typeof candidate.updatedAt === 'string' ? candidate.updatedAt : new Date().toISOString(),
        messages: [
          {
            id: `${Date.now()}-customer`,
            sender: 'customer',
            content: legacyMessage,
            createdAt: typeof candidate.createdAt === 'string' ? candidate.createdAt : new Date().toISOString(),
          },
        ],
      });
    }

    return threads;
  }, []);
};

const CustomerSupport = () => {
  const [threads, setThreads] = useState<SupportThread[]>([]);
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      setThreads(normalizeThreads(parsed));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const activeThread = threads[threads.length - 1] ?? null;

  const handleSendMessage = () => {
    const content = draft.trim();
    if (!content) {
      setStatus('Please enter a message before sending.');
      return;
    }

    const now = new Date().toISOString();
    const newMessage: SupportMessage = {
      id: `${Date.now()}`,
      sender: 'customer',
      content,
      createdAt: now,
    };

    const nextThreads = activeThread
      ? threads.map((thread) =>
          thread.id === activeThread.id
            ? { ...thread, updatedAt: now, messages: [...thread.messages, newMessage] }
            : thread,
        )
      : [
          {
            id: `${Date.now()}`,
            createdAt: now,
            updatedAt: now,
            messages: [newMessage],
          },
        ];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextThreads));
    setThreads(nextThreads);
    setDraft('');
    setStatus('Your message has been sent. An admin will reply here as soon as available.');
  };

  return (
    <div className="space-y-8 py-8">
      <div className="rounded-3xl border border-border bg-background/80 p-8 shadow-xl shadow-primary/10">
        <h1 className="text-4xl font-bold text-foreground">Customer Support</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Start a conversation with our support team. Admin replies appear here in real time.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-border bg-background/90 p-6 shadow-lg shadow-primary/5 sm:p-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Live support chat</h2>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">Online</span>
          </div>

          <div className="min-h-[360px] rounded-3xl border border-blue-200/50 bg-blue-50/40 p-4 dark:bg-slate-900/30 dark:border-blue-900/30">
            {activeThread && activeThread.messages.length > 0 ? (
              <div className="flex h-full flex-col gap-3">
                {activeThread.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm shadow-sm ${
                      message.sender === 'customer'
                        ? 'ml-auto bg-blue-400 text-white'
                        : 'mr-auto bg-blue-100 text-slate-900 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-100 dark:border-blue-700/50'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className={`mt-2 text-[11px] ${message.sender === 'customer' ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                      {new Date(message.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-blue-300 bg-blue-50/50 p-6 text-center text-sm text-blue-600 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300">
                No messages yet. Start the conversation and the admin reply will appear here.
              </div>
            )}
          </div>

          <div className="mt-4 space-y-3">
            <textarea
              id="support-message"
              className="min-h-[130px] w-full rounded-3xl border border-blue-200 bg-blue-50/60 px-4 py-4 text-base text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200/50 dark:bg-slate-900 dark:text-white dark:border-blue-800 dark:focus:border-blue-600 dark:focus:ring-blue-900/50"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type your question or issue here..."
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={handleSendMessage}
                className="inline-flex items-center justify-center rounded-full bg-button-gradient px-6 py-3 text-white transition hover:opacity-90"
              >
                Send Message
              </button>
              {status && <p className="text-sm text-success">{status}</p>}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-background/90 p-8 shadow-lg shadow-primary/5">
          <h2 className="text-2xl font-semibold text-foreground">Need help?</h2>
          <p className="mt-3 text-muted-foreground">
            Ask about bookings, services, pricing, or account issues. A support reply from the admin will appear in the chat above.
          </p>
          <div className="mt-8 rounded-3xl border border-dashed border-primary/40 bg-primary/5 px-6 py-8">
            <p className="text-sm text-muted-foreground">Messages are saved locally in this browser so your conversation stays available on this device.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSupport;
