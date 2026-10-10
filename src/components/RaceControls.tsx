import React from 'react';
import { Play, Pause, RotateCcw, Zap, Trophy } from 'lucide-react';
import { RaceState } from '../types/marble';

interface RaceControlsProps {
  raceState: RaceState;
  onStartRace: () => void;
  onPauseRace: () => void;
  onResumeRace: () => void;
  onResetRace: () => void;
  onBoostAll: () => void;
  winnerCount: number;
  onChangeWinnerCount: (count: number) => void;
}

export const RaceControls: React.FC<RaceControlsProps> = ({
  raceState,
  onStartRace,
  onPauseRace,
  onResumeRace,
  onResetRace,
  onBoostAll,
  winnerCount,
  onChangeWinnerCount
}) => {
  const isRacing = raceState.status === 'racing';
  const isPaused = raceState.status === 'paused';
  const isCountdown = raceState.status === 'countdown';
  const isFinished = raceState.status === 'finished';

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl flex flex-wrap items-center justify-between gap-4">
      {/* Chọn số lượng giải thưởng (Top 1, 3, 5) */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Chọn giải:</span>
        </span>
        <div className="flex items-center p-0.5 bg-slate-950 rounded-lg border border-slate-800">
          {[1, 3, 5].map(count => (
            <button
              key={count}
              disabled={isRacing || isCountdown}
              onClick={() => onChangeWinnerCount(count)}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                winnerCount === count
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 disabled:opacity-50'
              }`}
            >
              Top {count}
            </button>
          ))}
        </div>
      </div>

      {/* Cụm nút điều khiển chính */}
      <div className="flex items-center gap-2.5">
        {/* Nút Bắt đầu / Tạm dừng */}
        {!isRacing && !isPaused && (
          <button
            onClick={onStartRace}
            disabled={isCountdown}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-sm md:text-base shadow-lg shadow-emerald-500/30 active:scale-95 transition-all"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>{isFinished ? 'ĐUA LƯỢT MỚI' : 'BẮT ĐẦU ĐUA'}</span>
          </button>
        )}

        {isRacing && (
          <button
            onClick={onPauseRace}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            <Pause className="w-4 h-4 fill-current" />
            <span>TẠM DỪNG</span>
          </button>
        )}

        {isPaused && (
          <button
            onClick={onResumeRace}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>TIẾP TỤC</span>
          </button>
        )}

        {/* Nút Phóng Nitro Tăng Tốc (Cho không khí lớp học sôi nổi) */}
        {isRacing && (
          <button
            onClick={onBoostAll}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-500/30 active:scale-90 transition-transform animate-pulse"
            title="Kích hoạt tăng tốc toàn bộ bi"
          >
            <Zap className="w-4 h-4 fill-current text-amber-300" />
            <span>NITRO!</span>
          </button>
        )}

        {/* Nút Đặt lại (Reset) */}
        <button
          onClick={onResetRace}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-sm font-semibold transition-colors"
          title="Đặt lại các viên bi về vị trí xuất phát"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="hidden sm:inline">Đặt lại</span>
        </button>
      </div>
    </div>
  );
};
