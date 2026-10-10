import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Marble, GameMode } from '../types/marble';
import { Trophy, Award, Sparkles, HelpCircle, RotateCcw, X } from 'lucide-react';
import { sound } from '../utils/audio';

interface PodiumModalProps {
  winners: Marble[];
  gameMode: GameMode;
  onClose: () => void;
  onReplay: () => void;
  onStartQuizForWinner: (winner: Marble) => void;
}

export const PodiumModal: React.FC<PodiumModalProps> = ({
  winners,
  gameMode,
  onClose,
  onReplay,
  onStartQuizForWinner
}) => {
  useEffect(() => {
    // Bắn pháo hoa ăn mừng khi mở modal
    sound.playFinishChime();

    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#6366F1', '#F59E0B', '#10B981', '#EC4899']
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#6366F1', '#F59E0B', '#10B981', '#EC4899']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const first = winners[0];
  const second = winners[1];
  const third = winners[2];
  const others = winners.slice(3);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-2xl shadow-indigo-500/10 text-center overflow-hidden">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tiêu đề chiến thắng */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold text-sm mb-4">
          <Trophy className="w-4 h-4 text-amber-400 fill-current" />
          <span>VINH DANH NHÀ VÔ ĐỊCH</span>
          <Sparkles className="w-4 h-4 text-amber-400" />
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-6">
          KẾT QUẢ ĐUA BI
        </h2>

        {/* Bục Podium (Hạng 2 - Hạng 1 - Hạng 3) */}
        <div className="flex items-end justify-center gap-3 md:gap-6 mb-8 pt-6">
          {/* Hạng 2 (Bạc) */}
          {second && (
            <div className="flex flex-col items-center w-28 md:w-36">
              <div className="relative mb-2">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border-4 border-slate-400 overflow-hidden shadow-lg bg-slate-800 flex items-center justify-center">
                  {second.avatarUrl ? (
                    <img src={second.avatarUrl} alt={second.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl font-black text-white" style={{ backgroundColor: second.color }}>
                      {second.number}
                    </div>
                  )}
                </div>
                <span className="absolute -bottom-2 -right-1 text-xl">🥈</span>
              </div>
              <p className="font-bold text-xs md:text-sm text-slate-200 truncate w-full">{second.name}</p>
              <div className="w-full h-24 md:h-28 bg-gradient-to-t from-slate-800 to-slate-700 rounded-t-xl flex items-center justify-center border-t-2 border-slate-400 mt-2 shadow-inner">
                <span className="text-2xl font-black text-slate-300">2</span>
              </div>
            </div>
          )}

          {/* Hạng 1 (Vàng - Cao nhất) */}
          {first && (
            <div className="flex flex-col items-center w-32 md:w-44 -mt-4">
              <span className="text-3xl animate-bounce mb-1">👑</span>
              <div className="relative mb-2">
                <div className="w-18 h-18 md:w-22 md:h-22 rounded-full border-4 border-amber-400 overflow-hidden shadow-2xl shadow-amber-500/30 bg-slate-800 flex items-center justify-center">
                  {first.avatarUrl ? (
                    <img src={first.avatarUrl} alt={first.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-black text-white" style={{ backgroundColor: first.color }}>
                      {first.number}
                    </div>
                  )}
                </div>
                <span className="absolute -bottom-2 -right-1 text-2xl">🥇</span>
              </div>
              <p className="font-extrabold text-sm md:text-base text-amber-300 truncate w-full">{first.name}</p>
              <div className="w-full h-32 md:h-38 bg-gradient-to-t from-amber-600/40 via-amber-500/30 to-amber-500/50 rounded-t-2xl flex flex-col items-center justify-center border-t-4 border-amber-400 mt-2 shadow-2xl">
                <span className="text-4xl font-black text-amber-300">1</span>
                <span className="text-[10px] font-bold text-amber-200 tracking-wider uppercase">Vô Địch</span>
              </div>
            </div>
          )}

          {/* Hạng 3 (Đồng) */}
          {third && (
            <div className="flex flex-col items-center w-28 md:w-36">
              <div className="relative mb-2">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border-4 border-amber-700 overflow-hidden shadow-lg bg-slate-800 flex items-center justify-center">
                  {third.avatarUrl ? (
                    <img src={third.avatarUrl} alt={third.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl font-black text-white" style={{ backgroundColor: third.color }}>
                      {third.number}
                    </div>
                  )}
                </div>
                <span className="absolute -bottom-2 -right-1 text-xl">🥉</span>
              </div>
              <p className="font-bold text-xs md:text-sm text-slate-200 truncate w-full">{third.name}</p>
              <div className="w-full h-18 md:h-20 bg-gradient-to-t from-amber-950/60 to-amber-900/60 rounded-t-xl flex items-center justify-center border-t-2 border-amber-700 mt-2 shadow-inner">
                <span className="text-2xl font-black text-amber-600">3</span>
              </div>
            </div>
          )}
        </div>

        {/* Các vị trí tiếp theo (Top 4, Top 5) */}
        {others.length > 0 && (
          <div className="flex items-center justify-center gap-3 mb-6 p-2 rounded-xl bg-slate-800/40 border border-slate-800">
            {others.map((m, idx) => (
              <div key={m.id} className="flex items-center gap-1.5 text-xs text-slate-300">
                <span className="font-bold text-indigo-400">#{idx + 4}</span>
                <span>{m.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {/* Nút Kiểm tra đánh giá (Chế độ Quiz) */}
          {gameMode === 'quiz' && first && (
            <button
              onClick={() => onStartQuizForWinner(first)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/30 transition-all active:scale-95"
            >
              <HelpCircle className="w-4 h-4" />
              <span>KIỂM TRA BÀI CŨ ({first.name})</span>
            </button>
          )}

          {/* Đua tiếp */}
          <button
            onClick={onReplay}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>ĐUA LƯỢT TIẾP THEO</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
