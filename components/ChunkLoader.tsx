import React, { useEffect, useMemo, useState } from 'react';

type LoaderFn = () => Promise<{ default: React.ComponentType<any> } | React.ComponentType<any>>;

type Props = {
  loader: LoaderFn;
  componentProps?: Record<string, any>;
  fallback?: React.ReactNode;
  errorFallback?: (error: any, onRetry: () => void) => React.ReactNode;
  maxRetries?: number;
  retryDelayMs?: number | ((attempt: number) => number);
  metricKey?: string;
};

export const ChunkLoader: React.FC<Props> = ({
  loader,
  componentProps,
  fallback = null,
  errorFallback,
  maxRetries = 3,
  retryDelayMs = (i: number) => 300 * Math.pow(2, i),
  metricKey,
}) => {
  const [Comp, setComp] = useState<React.ComponentType<any> | null>(null);
  const [error, setError] = useState<any>(null);
  const [attempt, setAttempt] = useState(0);

  const key = useMemo(() => `${attempt}`, [attempt]);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setComp(null);

    const load = async () => {
      for (let i = 0; i <= maxRetries; i++) {
        try {
          const mod = await loader();
          if (cancelled) return;
          const C = (mod as any).default ? (mod as any).default : (mod as any);
          setComp(() => C);
          return;
        } catch (err: any) {
          if (cancelled) return;
          // Record last error for quick diagnostics and potential UI display
          try { (window as any).__LAST_CHUNK_ERROR__ = String(err && (err.message || err)); } catch {}
          // Simple metrics/telemetry for retries
          try {
            const w: any = window as any;
            w.__E2E_CHUNK_RETRY_COUNT__ = (w.__E2E_CHUNK_RETRY_COUNT__ || 0) + 1;
            if (metricKey) {
              w.__E2E_CHUNK_RETRY_KEYS__ = w.__E2E_CHUNK_RETRY_KEYS__ || {};
              w.__E2E_CHUNK_RETRY_KEYS__[metricKey] = (w.__E2E_CHUNK_RETRY_KEYS__[metricKey] || 0) + 1;
            }
            // Optional telemetry stub: if consumer provided a function/array, push an event
            if (typeof w.__E2E_TELEMETRY__ === 'function') {
              try { w.__E2E_TELEMETRY__({ type: 'chunk-retry', key: metricKey || 'unknown', attempt: i + 1, ts: Date.now(), error: String(err && (err.message || err)) }); } catch {}
            } else if (Array.isArray(w.__E2E_TELEMETRY__)) {
              try { w.__E2E_TELEMETRY__.push({ type: 'chunk-retry', key: metricKey || 'unknown', attempt: i + 1, ts: Date.now(), error: String(err && (err.message || err)) }); } catch {}
            }
          } catch {}
          if (i === maxRetries) {
            setError(err);
            // eslint-disable-next-line no-console
            try { console.error('[Admin] ChunkLoader failed after retries:', err); } catch {}
            return;
          }
          const delay = typeof retryDelayMs === 'function' ? retryDelayMs(i) : retryDelayMs;
          await new Promise(r => setTimeout(r, delay));
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, [loader, maxRetries, retryDelayMs, key]);

  const onRetry = () => setAttempt(a => a + 1);

  if (error) {
    if (errorFallback) return errorFallback(error, onRetry);
    return (
      <div style={{ position: 'relative', padding: 16, border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, background: 'rgba(16,20,26,0.8)', color: '#fff' }}>
        {/* small banner with last error and report link */}
        <div style={{ position: 'absolute', top: -10, right: 8, background: 'rgba(220,38,38,0.9)', color: '#fff', padding: '2px 8px', borderRadius: 6, fontSize: 11 }}>
          {(() => {
            try { return (window as any).__LAST_CHUNK_ERROR__ ? String((window as any).__LAST_CHUNK_ERROR__) : 'Load error'; } catch { return 'Load error'; }
          })()}
          {' '}
          <a
            href={(() => {
              try {
                const w: any = window as any;
                const lastErr = w.__LAST_CHUNK_ERROR__ ? String(w.__LAST_CHUNK_ERROR__) : String(error);
                const now = new Date().toISOString();
                const href = (w && w.location && w.location.href) ? w.location.href : 'unknown';
                const hash = (w && w.location && w.location.hash) ? w.location.hash : '';
                const ua = (w && w.navigator && w.navigator.userAgent) ? w.navigator.userAgent : 'unknown';
                let uid = 'unknown';
                try {
                  const sessRaw = w.localStorage && w.localStorage.getItem('biostack_session_v1');
                  if (sessRaw) { const sess = JSON.parse(sessRaw); if (sess && sess.uid) uid = String(sess.uid); }
                } catch {}
                const totalRetries = w.__E2E_CHUNK_RETRY_COUNT__ || 0;
                const keyRetries = (w.__E2E_CHUNK_RETRY_KEYS__ && w.__E2E_CHUNK_RETRY_KEYS__['admin-panel']) || 0;
                const flags = {
                  __E2E__: !!w.__E2E__,
                  __ADMIN_PANEL_MODULE_LOADED__: !!w.__ADMIN_PANEL_MODULE_LOADED__,
                  __ADMIN_PANEL_LOADED__: !!w.__ADMIN_PANEL_LOADED__,
                };
                const body = [
                  'Admin UI load error report',
                  `time: ${now}`,
                  `url: ${href}`,
                  `hash: ${hash}`,
                  `userId: ${uid}`,
                  `userAgent: ${ua}`,
                  `lastError: ${lastErr}`,
                  `retry.total: ${totalRetries}`,
                  `retry.admin-panel: ${keyRetries}`,
                  `flags: ${JSON.stringify(flags)}`,
                ].join('\n');
                return `mailto:support@biostack.app?subject=Admin%20UI%20load%20error&body=${encodeURIComponent(body)}`;
              } catch { return '#'; }
            })()}
            style={{ color: '#fff', textDecoration: 'underline', marginLeft: 6 }}
          >Report</a>
        </div>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Failed to load Admin UI</div>
        <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 12 }}>{String(error)}</div>
        <button onClick={onRetry} style={{ padding: '6px 10px', borderRadius: 6, background: '#2563EB', color: '#fff', border: 'none' }}>Retry</button>
      </div>
    );
  }
  if (!Comp) return <>{fallback}</>;
  return <Comp {...(componentProps || {})} />;
};

export default ChunkLoader;
