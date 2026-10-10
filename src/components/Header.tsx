import React, { useState } from 'react';
import { GameMode, Classroom } from '../types/marble';
import { Users, HelpCircle, Volume2, VolumeX, Maximize2, Sparkles, MapPin, School, ChevronDown, Plus } from 'lucide-react';
import { sound } from '../utils/audio';

interface HeaderProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  classrooms: Classroom[];
  activeClassroomId: string;
  onSelectClassroom: (id: string) => void;
  onOpenStudents: () => void;
  onOpenQuizBank: () => void;
  onOpenTrackSelect: () => void;
  onOpenGeminiAI: () => void;
  onOpenAuthor: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  currentTrackName: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  classrooms,
  activeClassroomId,
  onSelectClassroom,
  onOpenStudents,
  onOpenQuizBank,
  onOpenTrackSelect,
  onOpenGeminiAI,
  onOpenAuthor,
  isMuted,
  onToggleMute,
  currentTrackName
}) => {
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const activeClass = classrooms.find(c => c.id === activeClassroomId) || classrooms[0];
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
            {/* Chọn Lớp mobile */}
            <button
              onClick={onOpenStudents}
              className="p-1.5 rounded-lg bg-indigo-950 text-indigo-300 hover:text-white flex items-center gap-1 text-xs border border-indigo-500/40 font-bold"
              title="Chuyển lớp học"
            >
              <School className="w-3.5 h-3.5 text-indigo-400" />
              <span className="max-w-[70px] truncate">{activeClass?.name || 'Lớp'}</span>
            </button>

            <button
              onClick={onOpenAuthor}
              className="p-1.5 rounded-lg bg-slate-800 text-indigo-300 hover:text-white flex items-center gap-1 text-xs border border-indigo-500/30"
              title="Thông tin tác giả"
            >
              <div className="w-4 h-4 rounded-full overflow-hidden border border-indigo-300 shrink-0">
                <img src="/avatar.jpg" alt="" className="w-full h-full object-cover" />
              </div>
              <span className="text-[11px] font-medium hidden sm:inline">Tác giả</span>
            </button>
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

          {/* Chọn Lớp Học Nhanh (Dropdown) */}
          <div className="relative">
            <button
              onClick={() => setShowClassDropdown(!showClassDropdown)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/90 hover:bg-indigo-900 border border-indigo-500/50 text-xs font-extrabold text-indigo-200 transition-all shadow-md shadow-indigo-950/50"
              title="Nhấp để chuyển nhanh giữa các lớp giảng dạy"
            >
              <School className="w-3.5 h-3.5 text-indigo-400" />
              <span className="max-w-[110px] truncate">{activeClass?.name || 'Chọn Lớp'}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/30 text-indigo-200 font-bold">
                {activeClass?.students?.length || 0} HS
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showClassDropdown && (
              <div className="absolute top-full left-0 mt-1.5 w-52 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl z-50 py-1.5 overflow-hidden animate-fade-in backdrop-blur-md">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 flex items-center justify-between">
                  <span>Chọn lớp đua</span>
                  <span className="text-indigo-400">{classrooms.length} lớp</span>
                </div>
                <div className="max-h-56 overflow-y-auto py-1">
                  {classrooms.map(c => {
                    const isSelected = c.id === activeClassroomId;
                    return (
                      <button
                        key={c.id}
                        onClick={() => {
                          onSelectClassroom(c.id);
                          setShowClassDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs font-bold flex items-center justify-between hover:bg-indigo-950/60 transition-colors ${
                          isSelected ? 'text-indigo-300 bg-indigo-500/15 border-l-2 border-indigo-400' : 'text-slate-200'
                        }`}
                      >
                        <span className="truncate">{c.name}</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {c.students?.length || 0} HS
                        </span>
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => {
                    setShowClassDropdown(false);
                    onOpenStudents();
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-indigo-300 hover:text-white hover:bg-indigo-900/40 border-t border-slate-800 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Quản lý & Thêm lớp mới...</span>
                </button>
              </div>
            )}
          </div>

          {/* Quản lý danh sách học sinh */}
          <button
            onClick={onOpenStudents}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-xs font-medium text-slate-200 transition-colors shadow-sm"
            title="Quản lý học sinh, lớp học và ảnh avatar"
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

          {/* Nút Tác giả của app */}
          <button
            onClick={onOpenAuthor}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500/20 via-pink-500/10 to-amber-500/20 hover:from-indigo-500/30 hover:to-amber-500/30 border border-indigo-400/40 text-xs font-semibold text-indigo-200 transition-all shadow-sm hover:scale-105 active:scale-95"
            title="Xem thông tin Giáo viên & Tác giả ứng dụng"
          >
            <div className="w-4 h-4 rounded-full overflow-hidden border border-indigo-300 shrink-0">
              <img src="/avatar.jpg" alt="" className="w-full h-full object-cover" />
            </div>
            <span>Tác Giả</span>
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
