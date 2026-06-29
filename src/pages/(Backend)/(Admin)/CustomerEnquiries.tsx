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

  return (
    <div className="space-y-8 py-8">
      <div className="rounded-3xl border border-border bg-background/80 p-8 shadow-xl shadow-primary/10">
        <h1 className="text-4xl font-bold text-foreground">Customer Enquiries</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Review support conversations and reply directly from this dashboard.
        </p>
      </div>

      {threads.length === 0 ? (
        <div className="rounded-3xl border border-border bg-background/90 p-10 text-center text-muted-foreground shadow-lg shadow-primary/5">
          <p className="text-xl font-semibold text-foreground">No customer conversations yet.</p>
          <p className="mt-3">Once a customer sends a message, it will appear here for an admin reply.</p>
        </div>
      ) : (
        <div className="grid gap-8">
          {threads.map((thread) => (
            <div key={thread.id} className="rounded-3xl border border-border bg-background/90 p-8 shadow-lg shadow-primary/5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Last updated:</p>
                  <p className="text-sm text-foreground">{new Date(thread.updatedAt).toLocaleString()}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">Support chat</span>
              </div>

              <div className="mt-6 space-y-3 rounded-3xl border border-border/60 bg-[#f9fafb]/80 p-4 dark:bg-slate-900/70">
                {thread.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm shadow-sm ${
                      message.sender === 'admin'
                        ? 'ml-auto bg-primary text-white'
                        : 'mr-auto border border-border bg-white text-foreground dark:bg-slate-800'
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
                  <p className="mb-2 text-sm font-semibold text-foreground">Admin reply</p>
                  <textarea
                    value={replyDrafts[thread.id] ?? ''}
                    onChange={(e) => handleReplyChange(thread.id, e.target.value)}
                    className="min-h-[160px] w-full rounded-3xl border border-input bg-[#f7f7f8] px-4 py-4 text-base text-slate-900 outline-none transition focus:border-primary/80 focus:ring-2 focus:ring-primary/20 dark:bg-slate-900 dark:text-white"
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
