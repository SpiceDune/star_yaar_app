import { useState, useCallback } from 'react';

interface Props {
  chartId: string;
  userName?: string;
}

export default function ShareButton({ chartId, userName }: Props) {
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const shareUrl = typeof window !== 'undefined'
    ? (chartId ? `${window.location.origin}/kundli/${chartId}` : window.location.href)
    : (chartId ? `/kundli/${chartId}` : '/');

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareUrl]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${userName ?? 'StarYaar'} — Birth Chart`,
          text: `Check out ${userName ?? 'this'} birth chart on StarYaar`,
          url: shareUrl,
        });
      } catch { /* user cancelled */ }
    } else {
      setShowModal(true);
    }
  }, [shareUrl, userName]);

  return (
    <>
      <button
        onClick={handleNativeShare}
        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-3.5 py-2 transition-colors cursor-pointer"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Share
      </button>

      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-[420px] max-w-[92vw] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-slate-950 px-5 py-3.5 flex items-center justify-between">
              <span className="text-white/90 text-sm font-semibold">Share Birth Chart</span>
              <button onClick={() => setShowModal(false)} className="text-white/50 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm text-slate-600 mb-3">Anyone with this link can view {userName ? `${userName}'s` : 'this'} birth chart:</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-700 select-all outline-none focus:border-slate-400"
                  onClick={e => (e.target as HTMLInputElement).select()}
                />
                <button
                  onClick={handleCopy}
                  className={`shrink-0 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                    copied
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
