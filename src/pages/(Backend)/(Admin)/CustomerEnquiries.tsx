import { useEffect, useState } from 'react';

const STORAGE_KEY = 'customerSupportEnquiries';

type Enquiry = {
  id: string;
  message: string;
  createdAt: string;
  response?: string;
  respondedAt?: string;
};

const CustomerEnquiries = () => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setEnquiries(JSON.parse(stored));
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

    const updated = enquiries.map((item) =>
      item.id === id ? { ...item, response: reply, respondedAt: new Date().toISOString() } : item,
    );

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setEnquiries(updated);
    setReplyDrafts((prev) => ({ ...prev, [id]: '' }));
  };

  return (
    <div className="space-y-8 py-8">
      <div className="rounded-3xl border border-border bg-background/80 p-8 shadow-xl shadow-primary/10">
        <h1 className="text-4xl font-bold text-foreground">Customer Enquiries</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Review enquiries sent by customers and answer them directly from this page.
        </p>
      </div>

      {enquiries.length === 0 ? (
        <div className="rounded-3xl border border-border bg-background/90 p-10 text-center text-muted-foreground shadow-lg shadow-primary/5">
          <p className="text-xl font-semibold text-foreground">No customer enquiries yet.</p>
          <p className="mt-3">Once a customer sends an enquiry, it will appear here for admin response.</p>
        </div>
      ) : (
        <div className="grid gap-8">
          {enquiries.map((item) => (
            <div key={item.id} className="rounded-3xl border border-border bg-background/90 p-8 shadow-lg shadow-primary/5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sent:</p>
                  <p className="text-sm text-foreground">{new Date(item.createdAt).toLocaleString()}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">Customer enquiry</span>
              </div>

              <div className="mt-6 rounded-3xl bg-primary/5 p-6 text-foreground">
                <p>{item.message}</p>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <p className="mb-2 text-sm font-semibold text-foreground">Admin response</p>
                  <textarea
                    value={replyDrafts[item.id] ?? item.response ?? ''}
                    onChange={(e) => handleReplyChange(item.id, e.target.value)}
                    className="min-h-[160px] w-full rounded-3xl border border-input bg-[#f7f7f8] px-4 py-4 text-base text-slate-900 outline-none transition focus:border-primary/80 focus:ring-2 focus:ring-primary/20 dark:bg-slate-900 dark:text-white"
                    placeholder="Write your answer here..."
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleSaveReply(item.id)}
                  className="inline-flex items-center justify-center rounded-full bg-button-gradient px-6 py-3 text-white transition hover:opacity-90"
                >
                  Save Answer
                </button>
                {item.response && (
                  <div className="rounded-3xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">
                    <p className="font-semibold">Saved answer:</p>
                    <p>{item.response}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerEnquiries;
