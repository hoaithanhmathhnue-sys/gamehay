import React from 'react';
import { X, MapPin, School, GraduationCap, Sparkles, Heart } from 'lucide-react';

interface AuthorModalProps {
  onClose: () => void;
}

export const AuthorModal: React.FC<AuthorModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-indigo-500/30 rounded-3xl shadow-2xl shadow-indigo-500/20 overflow-hidden">
        {/* Nền trang trí lấp lánh */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          title="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Modal */}
        <div className="pt-8 pb-4 px-6 text-center border-b border-slate-800/80 bg-slate-900/60">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
            THÔNG TIN TÁC GIẢ & BẢN QUYỀN
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Tác Giả Ứng Dụng
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Dự án công nghệ giáo dục đổi mới sáng tạo trong dạy học
          </p>
        </div>

        {/* Thân Modal */}
        <div className="p-6 space-y-6">
          {/* Card thông tin cô giáo & logo trường */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 shadow-inner">
            {/* Ảnh chân dung cô giáo */}
            <div className="relative group shrink-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden ring-4 ring-indigo-500/40 shadow-xl shadow-indigo-500/20 bg-slate-800 flex items-center justify-center">
                <img
                  src="/avatar.jpg"
                  alt="Giáo viên Trần Thị Kim Thoa"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    // Fallback nếu ảnh không tải được
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="absolute -bottom-2 -right-2 p-1.5 bg-gradient-to-tr from-amber-500 to-amber-400 rounded-full text-slate-950 shadow-md">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>

            {/* Chi tiết thông tin giáo viên */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-indigo-400">Giáo viên phát triển</span>
                <h3 className="text-xl font-extrabold text-white flex items-center justify-center sm:justify-start gap-2">
                  Trần Thị Kim Thoa
                  <span className="text-sm">👩‍🏫</span>
                </h3>
              </div>

              {/* Tên trường & Logo */}
              <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-200 font-semibold text-sm">
                <div className="w-7 h-7 rounded-lg overflow-hidden bg-white/10 p-0.5 shrink-0 border border-slate-700">
                  <img
                    src="/logo.jpg"
                    alt="Logo Trường THPT Hoàng Diệu"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <School className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Trường THPT Hoàng Diệu</span>
                </div>
              </div>

              {/* Địa chỉ */}
              <div className="flex items-start justify-center sm:justify-start gap-1.5 text-xs text-slate-400">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Số 1 Mạc Đĩnh Chi, phường Phú Lợi, thành phố Cần Thơ</span>
              </div>
            </div>
          </div>

          {/* Hộp giới thiệu ý nghĩa giáo dục */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900/40 border border-indigo-500/20 text-xs text-slate-300 space-y-2 leading-relaxed">
            <div className="flex items-center gap-2 font-bold text-indigo-300">
              <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
              <span>Sứ mệnh ứng dụng:</span>
            </div>
            <p>
              Ứng dụng <strong>Đua Bi Lớp Học</strong> được phát triển nhằm hỗ trợ quý thầy cô giáo khuấy động không khí lớp học, kích thích sự hứng thú và tò mò của học sinh thông qua hoạt động gọi tên ngẫu nhiên, thi đua bằng avatar và kiểm tra bài cũ với trợ lý trí tuệ nhân tạo (AI Gemini).
            </p>
          </div>

          {/* Nút đóng */}
          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm shadow-lg shadow-indigo-500/30 transition-all active:scale-[0.98]"
            >
              Đóng Cửa Sổ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
