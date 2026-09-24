import { AlertOctagon, RefreshCw } from 'lucide-react';

export default function ErrorState({
  title = 'Something went wrong',
  message = 'Failed to load products. Please check your network connection or try again.',
  onRetry,
  isRetrying = false,
}) {
  return (
    <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-8 sm:p-12 text-center shadow-xs">
      <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <AlertOctagon className="w-8 h-8" />
      </div>

      <h3 className="text-lg font-bold text-rose-950 mb-1">{title}</h3>
      <p className="text-sm text-rose-700 max-w-md mx-auto mb-6 leading-relaxed">
        {message}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl transition-all shadow-sm shadow-rose-600/30"
        >
          <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
          {isRetrying ? 'Retrying...' : 'Retry'}
        </button>
      )}
    </div>
  );
}
