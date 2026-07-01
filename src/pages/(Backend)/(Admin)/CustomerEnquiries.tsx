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

const CustomerEnquiries = () => {
  const [threads, setThreads] = useState<SupportThread[]>([]);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

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

  const handleReplyChange = (id: string, value: string) => {
    setReplyDrafts((prev) => ({ ...prev, [id]: value }));
  };

  const handleSaveReply = (id: string) => {
    const reply = replyDrafts[id]?.trim();
    if (!reply) {
      return;
    }

    const now = new Date().toISOString();
    const updated: SupportThread[] = threads.map((thread) =>
      thread.id === id
        ? {
            ...thread,
            updatedAt: now,
            messages: [
              ...thread.messages,
              {
                id: `${Date.now()}`,
                sender: 'admin' as const,
                content: reply,
                createdAt: now,
              },
            ],
          }
        : thread,
    );

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setThreads(updated);
    setReplyDrafts((prev) => ({ ...prev, [id]: '' }));
  };

  const handleDeleteThread = (id: string) => {
    const updated = threads.filter((thread) => thread.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setThreads(updated);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all customer enquiries? This action cannot be undone.')) {
      localStorage.removeItem(STORAGE_KEY);
      setThreads([]);
      setReplyDrafts({});
    }
  };

  return (
    <div className="space-y-8 py-8">
      <div className="rounded-3xl border border-blue-200 bg-blue-50/50 p-8 shadow-xl shadow-blue-200/20 dark:bg-blue-900/10 dark:border-blue-800">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Customer Enquiries</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
              Review support conversations and reply directly from this dashboard.
            </p>
          </div>
          {threads.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center justify-center rounded-full bg-red-500 px-6 py-3 text-white transition hover:bg-red-600"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {threads.length === 0 ? (
        <div className="rounded-3xl border border-blue-200 bg-blue-50/40 p-10 text-center text-blue-600 shadow-lg shadow-blue-200/20 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
          <p className="text-xl font-semibold">No customer conversations yet.</p>
          <p className="mt-3">Once a customer sends a message, it will appear here for an admin reply.</p>
        </div>
      ) : (
        <div className="grid gap-8">
          {threads.map((thread) => (
            <div key={thread.id} className="rounded-3xl border border-blue-200 bg-white/60 p-8 shadow-lg shadow-blue-200/20 dark:bg-slate-900/50 dark:border-blue-800">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Last updated:</p>
                  <p className="text-sm text-slate-900 dark:text-white">{new Date(thread.updatedAt).toLocaleString()}</p>
                </div>
                <div className="flex gap-3">
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">Support chat</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteThread(thread.id)}
                    className="inline-flex items-center justify-center rounded-full bg-red-100 px-3 py-1 text-sm text-red-600 transition hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                    title="Delete this enquiry"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="mt-6 space-y-3 rounded-3xl border border-blue-200/60 bg-blue-50/50 p-4 dark:bg-slate-900/30 dark:border-blue-800/40">
                {thread.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm shadow-sm ${
                      message.sender === 'admin'
                        ? 'ml-auto bg-blue-400 text-white'
                        : 'mr-auto bg-blue-100 text-slate-900 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-100 dark:border-blue-700/50'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className={`mt-2 text-[11px] ${message.sender === 'admin' ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                      {new Date(message.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">Admin reply</p>
                  <textarea
                    value={replyDrafts[thread.id] ?? ''}
                    onChange={(e) => handleReplyChange(thread.id, e.target.value)}
                    className="min-h-[160px] w-full rounded-3xl border border-blue-200 bg-blue-50/60 px-4 py-4 text-base text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200/50 dark:bg-slate-900 dark:text-white dark:border-blue-800 dark:focus:border-blue-600 dark:focus:ring-blue-900/50"
                    placeholder="Write your answer here..."
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleSaveReply(thread.id)}
                  className="inline-flex items-center justify-center rounded-full bg-button-gradient px-6 py-3 text-white transition hover:opacity-90"
                >
                  Send Reply
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerEnquiries;
