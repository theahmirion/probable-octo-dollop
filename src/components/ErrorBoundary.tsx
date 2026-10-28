import React from 'react';

interface State {
  error: Error | null;
}

// Without this, any render error unmounts the whole tree and the user sees a blank page.
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Moonfall render error:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#111013] text-[#F0E8DC] px-6">
        <div className="max-w-md text-center space-y-4">
          <div className="text-[#6D293B] text-3xl">☾</div>
          <h1 className="text-2xl" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
            The archive stumbled in the dark.
          </h1>
          <p className="text-sm text-[#A9A0A5]">Something went wrong while loading this page.</p>
          <pre className="text-xs text-left text-rose-300/80 bg-[#161219] border border-[#393039] p-3 rounded-sm overflow-auto max-h-40">
            {this.state.error.message}
          </pre>
          <button
            onClick={() => window.location.assign('/')}
            className="px-5 py-2.5 text-xs uppercase tracking-wider font-semibold text-[#111013] bg-[#F0E8DC] hover:bg-white rounded-sm"
          >
            Return home
          </button>
        </div>
      </div>
    );
  }
}
