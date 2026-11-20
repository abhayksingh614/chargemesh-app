'use client';

import React, { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected errors for operational tracking
    console.error('Admin Portal Runtime Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-900 px-4 text-center">
      <div className="max-w-md w-full p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-red-200 dark:border-red-900/50">
        <h1 className="text-6xl font-bold text-red-600 mb-4">500</h1>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Portal Error</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          An unexpected error occurred while rendering the operations console.
        </p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
