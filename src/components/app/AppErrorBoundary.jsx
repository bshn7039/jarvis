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
          <div className="max-w-xl rounded-lg border border-jarvis-border bg-jarvis-panel p-5 text-jarvis-text">
            <h1 className="text-base font-semibold">Render error recovered</h1>
            <p className="mt-2 text-sm text-jarvis-muted">{this.state.message}</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
