import React from 'react';
import { TrackConfig } from '../types/marble';
import { DEFAULT_TRACKS } from '../utils/physics';
import { MapPin, Check, X } from 'lucide-react';

interface TrackSelectorModalProps {
  currentTrackId: string;
  onSelectTrack: (track: TrackConfig) => void;
  onClose: () => void;
}

export const TrackSelectorModal: React.FC<TrackSelectorModalProps> = ({
  currentTrackId,
  onSelectTrack,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-2xl text-left">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tiêu đề */}
        <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-800">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-black text-white">
              Chọn Bản Đồ Đường Đua
            </h2>
            <p className="text-xs text-slate-400">
              Mỗi bản đồ có cấu trúc chướng ngại vật và trải nghiệm vật lý độc đáo
            </p>
          </div>
        </div>

        {/* Danh sách 3 bản đồ */}
        <div className="space-y-3 mb-6">
          {DEFAULT_TRACKS.map(track => {
            const isSelected = track.id === currentTrackId;
            return (
              <div
                key={track.id}
                onClick={() => {
                  onSelectTrack(track);
                  onClose();
                }}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between gap-3 active:scale-[0.99] ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-500/20'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center text-2xl flex-shrink-0">
                    {track.icon}
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base font-extrabold text-white flex items-center gap-2">
                      <span>{track.name}</span>
                      {isSelected && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500 text-white font-bold">
                          Đang chọn
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {track.description}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1 font-mono">
                      <span>Trọng lực: {track.gravity}</span>
                      <span>•</span>
                      <span>Chướng ngại vật: {track.obstacles.length}</span>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-700'
                  }`}>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs md:text-sm font-semibold transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
