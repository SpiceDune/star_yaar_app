import { useState, type FormEvent } from 'react';

const ACCESS_KEY = 'fe542697-0051-4b79-a9c6-cdd0c6a4dfd9';

const TOPICS = [
  'Celebrity chart removal',
  'Celebrity suggestion',
  'Data deletion request',
  'Bug report',
  'Feature request',
  'General inquiry',
] as const;

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = e.currentTarget;
    const data = new FormData(form);
    data.append('access_key', ACCESS_KEY);

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: data,
      });
      const json = await res.json();

      if (json.success) {
        setSubmitted(true);
        form.reset();
      } else {
        setError(json.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-border bg-card px-5 py-10 text-center">
        <svg className="w-10 h-10 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-foreground font-semibold text-base mb-1">Message sent!</p>
        <p className="text-muted-foreground text-sm mb-4">We'll get back to you as soon as possible.</p>
        <button
          onClick={() => setSubmitted(false)}
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-5 md:p-6 space-y-4">
      {/* Honeypot spam prevention */}
      <input type="checkbox" name="botcheck" className="hidden" />

      <input type="hidden" name="from_name" value="StarYaar Contact" />
      <input type="hidden" name="subject" value="New contact form submission — StarYaar" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="cf-name" className="block text-xs font-semibold text-foreground mb-1.5">
            Name
          </label>
          <input
            id="cf-name"
            name="name"
            type="text"
            required
            placeholder="Your name"
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all"
          />
        </div>
        <div>
          <label htmlFor="cf-email" className="block text-xs font-semibold text-foreground mb-1.5">
            Email
          </label>
          <input
            id="cf-email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all"
          />
        </div>
      </div>

      <div>
        <label htmlFor="cf-topic" className="block text-xs font-semibold text-foreground mb-1.5">
          Topic
        </label>
        <select
          id="cf-topic"
          name="topic"
          required
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all"
        >
          <option value="">Select a topic</option>
          {TOPICS.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="cf-url" className="block text-xs font-semibold text-foreground mb-1.5">
          Page URL <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <input
          id="cf-url"
          name="page_url"
          type="url"
          placeholder="https://staryaar.com/kundli/celebrity/..."
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all"
        />
      </div>

      <div>
        <label htmlFor="cf-message" className="block text-xs font-semibold text-foreground mb-1.5">
          Message
        </label>
        <textarea
          id="cf-message"
          name="message"
          required
          rows={4}
          placeholder="Tell us how we can help..."
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all resize-y"
        />
      </div>

      {error && (
        <p className="text-sm text-red-500 font-medium">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto bg-primary text-primary-foreground font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
