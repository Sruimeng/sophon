interface LoadingDialogProps {
  progress?: number;
  message?: string;
}

export function LoadingDialog({ progress = 0, message = 'Loading model...' }: LoadingDialogProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="p-6 bg-slate-950/90 backdrop-blur-lg rounded-lg min-w-[320px] border border-white/10">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">{message}</h2>
        <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
          <div
            className="bg-blue-500 h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-slate-400 mt-2">{progress.toFixed(0)}%</p>
      </div>
    </div>
  );
}
