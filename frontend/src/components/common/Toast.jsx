import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { removeToast } from '../../store/slices/toastSlice';

export default function Toast() {
  const dispatch = useDispatch();
  const toasts = useSelector((state) => state.toast.toasts);

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        const isSuccess = t.type === 'success';
        const isError = t.type === 'error';
        const isInfo = t.type === 'info';

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md animate-fade-in transition-all ${
              isSuccess
                ? 'bg-emerald-950/90 text-emerald-100 border-emerald-700/50 shadow-emerald-900/30'
                : isError
                ? 'bg-rose-950/90 text-rose-100 border-rose-700/50 shadow-rose-900/30'
                : 'bg-slate-900/90 text-slate-100 border-slate-700/50 shadow-slate-900/30'
            }`}
          >
            {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {isError && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
            {isInfo && <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />}

            <div className="flex-1 text-sm font-medium leading-snug">{t.message}</div>

            <button
              onClick={() => dispatch(removeToast(t.id))}
              className="text-slate-400 hover:text-white transition p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
