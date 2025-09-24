// @ts-nocheck
import React from 'react';

export default class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any): void {
    try {
      // eslint-disable-next-line no-console
      console.error('[Admin] ErrorBoundary caught error:', error, errorInfo);
    } catch {}
  try { (window as any).__LAST_CHUNK_ERROR__ = String(error && (error.message || error)); } catch {}
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render(): React.ReactNode {
    if ((this.state as any).hasError) {
      const propsAny = this.props as any;
      const F = propsAny && propsAny.fallback;
      if (typeof F === 'function') return F((this.state as any).error, this.handleRetry);
      if (F) return F;
      return (
        <div style={{ position: 'relative', padding: 16, border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, background: 'rgba(16,20,26,0.8)', color: '#fff' }}>
          <div style={{ position: 'absolute', top: -10, right: 8, background: 'rgba(220,38,38,0.9)', color: '#fff', padding: '2px 8px', borderRadius: 6, fontSize: 11 }}>
            {(() => { try { return (window as any).__LAST_CHUNK_ERROR__ ? String((window as any).__LAST_CHUNK_ERROR__) : 'Render error'; } catch { return 'Render error'; }})()}
            {' '}
            <a
              href={(() => {
                try {
                  const w: any = window as any;
                  const lastErr = w.__LAST_CHUNK_ERROR__ ? String(w.__LAST_CHUNK_ERROR__) : String((this.state as any).error);
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
                    'Admin UI render error report',
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
                  return `mailto:support@biostack.app?subject=Admin%20UI%20error&body=${encodeURIComponent(body)}`;
                } catch { return '#'; }
              })()}
              style={{ color: '#fff', textDecoration: 'underline', marginLeft: 6 }}
            >Report</a>
          </div>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Something went wrong</div>
          <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 12 }}>{String((this.state as any).error)}</div>
          <button onClick={this.handleRetry} style={{ padding: '6px 10px', borderRadius: 6, background: '#2563EB', color: '#fff', border: 'none' }}>Try again</button>
        </div>
      );
    }
    return this.props.children as any;
  }
}
