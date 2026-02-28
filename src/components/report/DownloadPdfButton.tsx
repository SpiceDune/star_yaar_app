import { useState, useEffect, useCallback } from 'react';

type Stage = 'idle' | 'configure' | 'generating' | 'done' | 'error';

const STEPS = [
  'Preparing chart data...',
  'Rendering birth chart...',
  'Computing dasha timeline...',
  'Building yoga analysis...',
  'Generating transit chart...',
  'Assembling PDF...',
  'Finalizing report...',
];

interface SectionOption {
  id: string;
  label: string;
  description: string;
  locked?: boolean;
}

const SECTIONS: SectionOption[] = [
  { id: 'basic',      label: 'Basic Information',   description: 'Cover page, Lagna chart, Panchang, Planetary positions & Current Dasha', locked: true },
  { id: 'yogas',      label: 'Yogas',               description: 'Planetary combinations with effects and descriptions' },
  { id: 'dasha',      label: 'Vimshottari Dasha',   description: 'Maha, Antar & Pratyantar Dasha timelines' },
  { id: 'divisional', label: 'Divisional Charts',    description: 'Navamsa (D9) & Transit (Gochar) charts' },
];

export default function DownloadPdfButton({ userName }: { userName?: string }) {
  const [stage, setStage] = useState<Stage>('idle');
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Record<string, boolean>>({
    basic: true,
    yogas: true,
    dasha: true,
    divisional: true,
  });

  useEffect(() => {
    if (stage !== 'generating') return;
    if (step >= STEPS.length - 1) return;
    const timer = setTimeout(() => setStep(s => Math.min(s + 1, STEPS.length - 1)), 1200 + Math.random() * 800);
    return () => clearTimeout(timer);
  }, [stage, step]);

  const toggleSection = useCallback((id: string) => {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleGenerate = useCallback(async () => {
    setStage('generating');
    setStep(0);
    setError('');

    try {
      const nameParam = encodeURIComponent(userName ?? 'StarYaar');
      const sections = Object.entries(selected)
        .filter(([, v]) => v)
        .map(([k]) => k)
        .join(',');
      const res = await fetch(`/api/report-pdf?name=${nameParam}&sections=${sections}`);
      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || `Server returned ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(userName ?? 'StarYaar').replace(/[^a-zA-Z0-9]/g, '_')}_Kundli_Report.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStage('done');
      setTimeout(() => setStage('idle'), 2000);
    } catch (err) {
      console.error('PDF download failed:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStage('error');
    }
  }, [userName, selected]);

  const close = useCallback(() => {
    setStage('idle');
    setError('');
  }, []);

  const progress = Math.round(((step + 1) / STEPS.length) * 100);
  const selectedCount = Object.values(selected).filter(Boolean).length;

  return (
    <>
      <button
        onClick={() => setStage('configure')}
        disabled={stage === 'generating'}
        className="inline-flex items-center gap-2 rounded-lg bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-semibold text-xs px-4 py-2.5 transition-colors cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Download PDF
      </button>

      {stage !== 'idle' && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={stage === 'error' || stage === 'done' || stage === 'configure' ? close : undefined}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-[420px] max-w-[92vw] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header bar */}
            <div className="bg-slate-950 px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md bg-white/15 flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">SY</span>
                </div>
                <span className="text-white/90 text-sm font-semibold">
                  {stage === 'configure' ? 'Customize Report' : 'StarYaar Report'}
                </span>
              </div>
              {(stage === 'error' || stage === 'done' || stage === 'configure') && (
                <button onClick={close} className="text-white/50 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <div className="p-5">
              {/* ── Section Selection ── */}
              {stage === 'configure' && (
                <>
                  <p className="text-sm text-slate-600 mb-4">Select sections to include in your PDF report:</p>
                  <div className="space-y-2 mb-5">
                    {SECTIONS.map(sec => (
                      <label
                        key={sec.id}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                          sec.locked
                            ? 'bg-slate-50 border-slate-200 cursor-default'
                            : selected[sec.id]
                              ? 'bg-slate-50 border-slate-300 shadow-sm'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selected[sec.id]}
                          disabled={sec.locked}
                          onChange={() => !sec.locked && toggleSection(sec.id)}
                          className="mt-0.5 w-4 h-4 rounded border-slate-300 text-slate-800 focus:ring-slate-500 accent-slate-800"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-800">{sec.label}</span>
                            {sec.locked && (
                              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide bg-slate-100 px-1.5 py-0.5 rounded">Always included</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{sec.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">{selectedCount} of {SECTIONS.length} sections</span>
                    <button
                      onClick={handleGenerate}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Generate PDF
                    </button>
                  </div>
                </>
              )}

              {/* ── Generating ── */}
              {stage === 'generating' && (
                <>
                  <div className="flex justify-center mb-4">
                    <div className="relative w-16 h-16">
                      <svg className="w-16 h-16 animate-spin" viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="28" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                        <circle cx="32" cy="32" r="28" fill="none" stroke="#0f172a" strokeWidth="4" strokeLinecap="round"
                          strokeDasharray={`${progress * 1.76} 176`} className="transition-all duration-500" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-700">
                        {progress}%
                      </span>
                    </div>
                  </div>
                  <p className="text-center text-sm font-semibold text-slate-800 mb-1">Generating PDF Report</p>
                  <p className="text-center text-xs text-slate-500 mb-3">{STEPS[step]}</p>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-800 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </>
              )}

              {/* ── Done ── */}
              {stage === 'done' && (
                <div className="text-center py-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">Report Downloaded</p>
                  <p className="text-xs text-slate-500 mt-1">Check your downloads folder</p>
                </div>
              )}

              {/* ── Error ── */}
              {stage === 'error' && (
                <div className="text-center py-3">
                  <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">Generation Failed</p>
                  <p className="text-xs text-red-500 mt-1 max-w-[280px] mx-auto truncate">{error}</p>
                  <div className="flex gap-2 justify-center mt-4">
                    <button onClick={handleGenerate} className="px-4 py-2 text-xs font-semibold bg-slate-800 text-white rounded-lg hover:bg-slate-900">
                      Try Again
                    </button>
                    <a href="/kundli/report" target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-xs font-semibold bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 no-underline">
                      Open HTML Report
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
