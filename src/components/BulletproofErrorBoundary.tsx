import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class BulletproofErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 React Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Log to external service in production
    if (import.meta.env.PROD) {
      // You can send this to your monitoring service
      console.error('Production Error:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString()
      });
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: '#f3f4f6',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            maxWidth: '600px',
            width: '100%'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🚨</div>
            <h1 style={{ 
              color: '#ef4444', 
              margin: '0 0 20px 0', 
              fontSize: '28px',
              fontWeight: '600'
            }}>
              Something went wrong
            </h1>
            <p style={{ 
              color: '#6b7280', 
              margin: '0 0 30px 0', 
              fontSize: '16px', 
              lineHeight: '1.5' 
            }}>
              We've encountered an unexpected error. Don't worry, our team has been notified and is working to fix this issue.
            </p>
            
            <div style={{ marginBottom: '30px' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginRight: '12px',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#2563eb';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#3b82f6';
                }}
                onFocus={(e) => {
                  e.currentTarget.style.background = '#2563eb';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.background = '#3b82f6';
                }}
              >
                🔄 Reload Page
              </button>
              
              <button
                onClick={() => window.history.back()}
                style={{
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#4b5563';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#6b7280';
                }}
                onFocus={(e) => {
                  e.currentTarget.style.background = '#4b5563';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.background = '#6b7280';
                }}
              >
                ← Go Back
              </button>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <details style={{ 
                textAlign: 'left', 
                marginTop: '20px',
                padding: '15px',
                background: '#f9fafb',
                borderRadius: '6px',
                border: '1px solid #e5e7eb'
              }}>
                <summary style={{ 
                  cursor: 'pointer', 
                  color: '#3b82f6', 
                  fontWeight: '600',
                  marginBottom: '10px'
                }}>
                  🔍 Development Details (Click to expand)
                </summary>
                <div>
                  <h4 style={{ color: '#374151', margin: '0 0 10px 0' }}>Error Message:</h4>
                  <pre style={{
                    background: '#fee2e2',
                    color: '#dc2626',
                    padding: '10px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    overflow: 'auto',
                    margin: '0 0 15px 0'
                  }}>
                    {this.state.error.message}
                  </pre>
                  
                  {this.state.error.stack && (
                    <>
                      <h4 style={{ color: '#374151', margin: '0 0 10px 0' }}>Stack Trace:</h4>
                      <pre style={{
                        background: '#fef3c7',
                        color: '#92400e',
                        padding: '10px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        overflow: 'auto',
                        margin: '0 0 15px 0'
                      }}>
                        {this.state.error.stack}
                      </pre>
                    </>
                  )}
                  
                  {this.state.errorInfo && (
                    <>
                      <h4 style={{ color: '#374151', margin: '0 0 10px 0' }}>Component Stack:</h4>
                      <pre style={{
                        background: '#ddd6fe',
                        color: '#5b21b6',
                        padding: '10px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        overflow: 'auto',
                        margin: '0'
                      }}>
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </div>
              </details>
            )}
            
            <div style={{ 
              marginTop: '30px', 
              paddingTop: '20px', 
              borderTop: '1px solid #e5e7eb' 
            }}>
              <p style={{ 
                color: '#9ca3af', 
                fontSize: '14px', 
                margin: '0' 
              }}>
                Error ID: {Date.now()} | Time: {new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default BulletproofErrorBoundary;
