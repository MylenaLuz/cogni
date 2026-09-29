interface Props {
  title: string;
  subtitle: string;
  leftStat?: { label: string; value: string | number };
  rightStat?: { label: string; value: string | number };
  progress?: number;
  progressColor?: string;
  onBack: () => void;
}

export default function GameHeader({
  title,
  subtitle,
  leftStat,
  rightStat,
  progress,
  progressColor = "bg-accent",
  onBack,
}: Props) {
  return (
    <div className="bg-primary px-5 pt-10 pb-4 flex-shrink-0">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors flex-shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-white text-base font-800 truncate">{title}</h1>
            <p className="text-white/60 text-xs truncate">{subtitle}</p>
          </div>
          {leftStat && (
            <div className="text-center flex-shrink-0">
              <div className="text-white text-xl font-800 leading-none">{leftStat.value}</div>
              <div className="text-white/60 text-[10px] font-600 mt-0.5">{leftStat.label}</div>
            </div>
          )}
          {rightStat && (
            <div className="text-center flex-shrink-0 ml-3 pl-3 border-l border-white/20">
              <div className="text-white text-xl font-800 leading-none">{rightStat.value}</div>
              <div className="text-white/60 text-[10px] font-600 mt-0.5">{rightStat.label}</div>
            </div>
          )}
        </div>
        {progress !== undefined && (
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
              style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
