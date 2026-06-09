import { useEffect, useState } from 'react';

const STORAGE_KEY = 'customerSupportEnquiries';

type Enquiry = {
  id: string;
  message: string;
  createdAt: string;
};

const CustomerSupport = () => {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    setStatus('');
  }, []);

  const handleSubmit = () => {
    if (!message.trim()) {
      setStatus('Please enter a message before sending.');
      return;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    const enquiries: Enquiry[] = stored ? JSON.parse(stored) : [];
    const newEnquiry: Enquiry = {
      id: `${Date.now()}`,
      message: message.trim(),
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify([...enquiries, newEnquiry]));
    setMessage('');
    setStatus('Your enquiry has been sent. An admin can reply on the dashboard page.');
  };

  return (
    <div className="space-y-8 py-8">
      <div className="rounded-3xl border border-border bg-background/80 p-8 shadow-xl shadow-primary/10">
        <h1 className="text-4xl font-bold text-foreground">Customer Support</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Send your enquiry to our support team. Your message is stored for admin review and answers.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-border bg-background/90 p-8 shadow-lg shadow-primary/5">
          <label className="mb-3 block text-lg font-semibold text-foreground" htmlFor="support-message">
            Write your enquiry
          </label>
          <textarea
            id="support-message"
            className="min-h-[260px] w-full rounded-3xl border border-input bg-[#f9fafb]/80 px-4 py-4 text-base text-slate-900 outline-none transition focus:border-primary/80 focus:ring-2 focus:ring-primary/20 dark:bg-slate-900 dark:text-white dark:border-slate-700"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your issue, question or request here..."
          />
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center justify-center rounded-full bg-button-gradient px-6 py-3 text-white transition hover:opacity-90"
            >
              Send Enquiry
            </button>
            {status && <p className="text-sm text-success">{status}</p>}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-background/90 p-8 shadow-lg shadow-primary/5">
          <h2 className="text-2xl font-semibold text-foreground">Need help?</h2>
          <p className="mt-3 text-muted-foreground">
            You can ask anything about booking, services, pricing, or account issues. The admin team will review your enquiry and reply from the dashboard.
          </p>
          <div className="mt-8 rounded-3xl border border-dashed border-primary/40 bg-primary/5 px-6 py-8">
            <p className="text-sm text-muted-foreground">Your enquiry box is empty until you type a message above.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSupport;
