import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ULTRON UI ERROR]", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px 24px',
          margin: '30px auto',
          maxWidth: '650px',
          backgroundColor: '#0a1528',
          border: '1px solid rgba(0, 210, 255, 0.4)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          color: '#e2e8f0',
          textAlign: 'center'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 170, 0, 0.15)',
            border: '1px solid rgba(255, 170, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            color: '#ffaa00'
          }}>
            <AlertTriangle size={32} />
          </div>

          <h2 style={{ color: '#ffffff', marginBottom: '10px', fontSize: '22px' }}>
            System Interface Recovered
          </h2>

          <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>
            An unexpected error was intercepted in this view. ULTRON has contained the error to maintain system stability.
          </p>

          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '12px 16px',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#ffaa00',
            textAlign: 'left',
            marginBottom: '24px',
            overflowX: 'auto',
            border: '1px solid rgba(255, 170, 0, 0.2)'
          }}>
            {this.state.error?.toString() || 'Unknown UI Exception'}
          </div>

          <button
            onClick={this.handleReload}
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #00d2ff 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '20px',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(0, 210, 255, 0.4)'
            }}
          >
            <RefreshCw size={16} /> Reload Interface
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
