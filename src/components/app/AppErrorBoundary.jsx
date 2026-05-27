import { Component } from 'react';

export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : 'Unknown rendering error',
    };
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta.env.DEV) {
      console.error('[jarvis] app render crash', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-jarvis-bg p-6">
          <div className="max-w-xl rounded-2xl border border-jarvis-border bg-jarvis-panel p-6 shadow-2xl text-jarvis-text">
            <h1 className="text-lg font-semibold flex items-center gap-2 text-red-400">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
              System Recovery Mode
            </h1>
            <p className="mt-4 text-sm text-jarvis-muted leading-relaxed">
              Jarvis encountered a critical rendering error. The system has been paused to prevent data corruption.
            </p>
            <div className="mt-4 rounded-lg bg-black/20 p-3 font-mono text-[11px] text-red-300/80 break-all">
              {this.state.message}
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <button 
                onClick={() => window.location.reload()}
                className="w-full rounded-xl bg-jarvis-text py-3 text-sm font-bold text-jarvis-bg hover:opacity-90 transition-all active:scale-[0.98]"
              >
                Attempt System Restart
              </button>
              <button 
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/';
                }}
                className="w-full rounded-xl border border-jarvis-border py-3 text-sm font-medium text-jarvis-muted hover:bg-white/5 transition-all"
              >
                Hard Reset (Clear All Local Cache)
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
