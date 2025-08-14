import React, { useState, useEffect } from 'react';
import { diagnoseS3Issues, secureS3Service } from '../services/bulletproofS3Service';

interface DiagnosticResult {
  status: 'healthy' | 'warning' | 'critical';
  issues: string[];
  recommendations: string[];
  details: any;
}

const S3DiagnosticPanel: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const runDiagnosis = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Running S3 diagnosis...');
      
      // Run console diagnosis
      await diagnoseS3Issues();
      
      // Get detailed results
      const service = secureS3Service as any; // Type assertion to access private method
      const result = await service.diagnoseConfiguration();
      setDiagnostics(result);
      
    } catch (error) {
      console.error('Diagnosis failed:', error);
      setDiagnostics({
        status: 'critical',
        issues: [`Diagnosis failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        recommendations: ['Check console for detailed error logs'],
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runDiagnosis();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '✅';
      case 'warning': return '⚠️';
      case 'critical': return '🚨';
      default: return '❓';
    }
  };

  if (import.meta.env.VITE_APP_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-800">S3 Diagnostics</h3>
          <button
            onClick={runDiagnosis}
            disabled={isLoading}
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? '🔄' : '🔍'} {isLoading ? 'Checking...' : 'Refresh'}
          </button>
        </div>

        {diagnostics && (
          <div className={`border rounded-lg p-3 mb-2 ${getStatusColor(diagnostics.status)}`}>
            <div className="flex items-center gap-2 mb-2">
              <span>{getStatusIcon(diagnostics.status)}</span>
              <span className="text-sm font-medium capitalize">{diagnostics.status}</span>
            </div>

            {diagnostics.issues.length > 0 && (
              <div className="mb-2">
                <div className="text-xs font-medium mb-1">Issues:</div>
                {diagnostics.issues.map((issue, index) => (
                  <div key={`issue-${issue.slice(0, 20)}-${index}`} className="text-xs opacity-90">{issue}</div>
                ))}
              </div>
            )}

            {diagnostics.recommendations.length > 0 && (
              <div className="mb-2">
                <div className="text-xs font-medium mb-1">Recommendations:</div>
                {diagnostics.recommendations.map((rec, index) => (
                  <div key={`rec-${rec.slice(0, 20)}-${index}`} className="text-xs opacity-90">• {rec}</div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs underline opacity-75 hover:opacity-100"
            >
              {showDetails ? 'Hide' : 'Show'} Details
            </button>

            {showDetails && diagnostics.details && (
              <div className="mt-2 text-xs">
                <pre className="bg-black/10 p-2 rounded text-xs overflow-auto max-h-32">
                  {JSON.stringify(diagnostics.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-gray-500 text-center">
          Check browser console for detailed logs
        </div>
      </div>
    </div>
  );
};

export default S3DiagnosticPanel;
