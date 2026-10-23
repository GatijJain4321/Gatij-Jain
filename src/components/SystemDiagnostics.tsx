import React, { useState } from 'react';
import {
  ShieldCheck,
  Play,
  RotateCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  Server
} from 'lucide-react';
import { runHotelProTestSuite, TestResult } from '../services/testRunner';

export const SystemDiagnostics: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>(() => runHotelProTestSuite());
  const [lastRunTime, setLastRunTime] = useState<string>(new Date().toLocaleTimeString());

  const handleRunTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = runHotelProTestSuite();
      setResults(res);
      setLastRunTime(new Date().toLocaleTimeString());
      setIsRunning(false);
    }, 400);
  };

  const passedCount = results.filter((r) => r.status === 'passed').length;
  const failedCount = results.filter((r) => r.status === 'failed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-amber-600">
            Automated Quality Assurance & Verification
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-900">
            System Integrity & Business Logic Tests
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time test suite verifying room collision detection, check-in gates, pricing formulas, and role boundaries.
          </p>
        </div>

        <button
          onClick={handleRunTests}
          disabled={isRunning}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
        >
          {isRunning ? (
            <>
              <RotateCw className="w-4 h-4 animate-spin text-amber-400" />
              <span>Executing Test Assertions...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Run Automated Test Suite</span>
            </>
          )}
        </button>
      </div>

      {/* Test Status Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 uppercase font-semibold">Total Tests</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{results.length}</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-emerald-600 uppercase font-semibold">Passed</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">{passedCount}</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-rose-600 uppercase font-semibold">Failed</div>
          <div className="text-2xl font-bold font-mono text-rose-600 mt-1">{failedCount}</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 uppercase font-semibold">Last Execution</div>
          <div className="text-sm font-bold font-mono text-slate-700 mt-2">{lastRunTime}</div>
        </div>
      </div>

      {/* Test Results Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-700 font-semibold">
          <span>Test Suite Specification</span>
          <span className="font-mono text-slate-500">100% Client & Storage Runtime Parity</span>
        </div>

        <div className="divide-y divide-slate-100">
          {results.map((test) => (
            <div key={test.id} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50/50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {test.status === 'passed' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{test.name}</span>
                    <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                      {test.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{test.assertion}</p>
                  {test.error && (
                    <div className="mt-2 p-2 bg-rose-50 border border-rose-200 rounded text-xs text-rose-700 font-mono">
                      Assertion Failure: {test.error}
                    </div>
                  )}
                </div>
              </div>

              <div className="shrink-0 text-right">
                <span className="font-mono text-xs text-slate-400 tabular-nums">
                  {test.durationMs}ms
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
