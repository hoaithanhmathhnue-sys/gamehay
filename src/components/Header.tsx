import React from 'react';
import { GameMode } from '../types/marble';
import { Users, HelpCircle, Volume2, VolumeX, Maximize2, Sparkles, MapPin } from 'lucide-react';
import { sound } from '../utils/audio';

interface HeaderProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  onOpenStudents: () => void;
  onOpenQuizBank: () => void;
  onOpenTrackSelect: () => void;
  onOpenGeminiAI: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  currentTrackName: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  onOpenStudents,
  onOpenQuizBank,
  onOpenTrackSelect,
  onOpenGeminiAI,
  isMuted,
  onToggleMute,
  currentTrackName
}) => {
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-3 py-2.5 md:px-6 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Logo & Tên Game */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-400 flex items-center justify-center shadow-md shadow-indigo-500/20 text-xl font-black">
              🏁
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-extrabold text-white tracking-tight flex items-center gap-1.5">
                ĐUA BI LỚP HỌC
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  PRO
                </span>
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                Trò chơi gọi tên, đua ảnh & kiểm tra bài cũ vui nhộn
              </p>
            </div>
          </div>

          {/* Quick controls on mobile */}
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              onClick={onToggleMute}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              title="Toàn màn hình"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3 Chế độ chơi chính */}
        <div className="flex items-center p-1 bg-slate-950/80 rounded-xl border border-slate-800/80 w-full md:w-auto overflow-x-auto justify-center">
          <button
            onClick={() => { sound.playMarbleClack(); onSelectMode('fun'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all whitespace-nowrap ${
              currentMode === 'fun'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span>🎯</span>
            <span>Đua Cho Vui</span>
          </button>

          <button
            onClick={() => { sound.playMarbleClack(); onSelectMode('photo'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all whitespace-nowrap ${
              currentMode === 'photo'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span>📸</span>
            <span>Đua Bằng Ảnh</span>
          </button>

          <button
            onClick={() => { sound.playMarbleClack(); onSelectMode('quiz'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all whitespace-nowrap ${
              currentMode === 'quiz'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span>📝</span>
            <span>Đua Kiểm Tra</span>
          </button>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="hidden md:flex items-center gap-2">
          {/* Chọn Bản Đồ */}
          <button
            onClick={onOpenTrackSelect}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-xs font-medium text-slate-200 transition-colors shadow-sm"
            title="Đổi bản đồ đua"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span className="max-w-[100px] truncate">{currentTrackName}</span>
          </button>

          {/* Quản lý danh sách học sinh */}
          <button
            onClick={onOpenStudents}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-xs font-medium text-slate-200 transition-colors shadow-sm"
            title="Quản lý học sinh và ảnh avatar"
          >
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>Học Sinh</span>
          </button>

          {/* Ngân hàng câu hỏi & AI */}
          <button
            onClick={onOpenQuizBank}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-xs font-medium text-slate-200 transition-colors shadow-sm"
            title="Quản lý câu hỏi trắc nghiệm"
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Câu Hỏi</span>
          </button>

          {/* Gemini AI sinh câu hỏi */}
          <button
            onClick={onOpenGeminiAI}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/50 hover:to-indigo-600/50 border border-purple-500/40 text-xs font-medium text-purple-200 transition-all shadow-sm"
            title="Tạo câu hỏi nhanh với AI Gemini"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span>Tạo Bằng AI</span>
          </button>

          {/* Âm thanh */}
          <button
            onClick={onToggleMute}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white transition-colors"
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Toàn màn hình */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white transition-colors"
            title="Chế độ toàn màn hình"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
