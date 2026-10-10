import React, { useState } from 'react';
import { Student } from '../types/marble';
import { Users, Upload, Plus, Trash2, Check, Sparkles, X, Dices, Image as ImageIcon } from 'lucide-react';
import { CUTE_AVATARS, getRandomAvatar, assignRandomAvatarsToStudents, CuteAvatarItem } from '../utils/avatars';

interface StudentManagerModalProps {
  students: Student[];
  onSaveStudents: (newStudents: Student[]) => void;
  onClose: () => void;
}

const COLOR_PALETTE = [
  '#EF4444', '#F97316', '#F59E0B', '#10B981', '#06B6D4',
  '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#14B8A6',
  '#E11D48', '#84CC16'
];

export const StudentManagerModal: React.FC<StudentManagerModalProps> = ({
  students,
  onSaveStudents,
  onClose
}) => {
  const [list, setList] = useState<Student[]>(students);
  const [bulkText, setBulkText] = useState('');
  const [showBulkPaste, setShowBulkPaste] = useState(false);
  const [newName, setNewName] = useState('');
  
  // State chọn avatar cho 1 học sinh cụ thể
  const [pickingStudentId, setPickingStudentId] = useState<string | null>(null);

  // Thêm 1 học sinh mới (tự động gán ngẫu nhiên 1 trong 55 icon)
  const handleAddSingle = () => {
    if (!newName.trim()) return;
    const randomAvatar = getRandomAvatar();
    const newStudent: Student = {
      id: `s_${Date.now()}_${Math.random()}`,
      name: newName.trim(),
      number: list.length + 1,
      color: COLOR_PALETTE[list.length % COLOR_PALETTE.length],
      avatarUrl: randomAvatar.dataUrl
    };
    setList([...list, newStudent]);
    setNewName('');
  };

  // Xóa 1 học sinh
  const handleDelete = (id: string) => {
    const updated = list.filter(s => s.id !== id).map((s, idx) => ({
      ...s,
      number: idx + 1
    }));
    setList(updated);
  };

  // Gán ngẫu nhiên lại toàn bộ 55 icon cho tất cả học sinh trong danh sách
  const handleRandomizeAllAvatars = () => {
    const updated = assignRandomAvatarsToStudents(list);
    setList(updated);
  };

  // Chọn 1 avatar cụ thể từ danh sách 55 icon cho học sinh đang chọn
  const handleSelectSpecificAvatar = (avatar: CuteAvatarItem) => {
    if (!pickingStudentId) return;
    setList(prev => prev.map(s => s.id === pickingStudentId ? { ...s, avatarUrl: avatar.dataUrl } : s));
    setPickingStudentId(null);
  };

  // Tải ảnh tùy chọn từ máy tính cho 1 học sinh
  const handleUploadAvatar = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setList(prev => prev.map(s => s.id === id ? { ...s, avatarUrl: dataUrl } : s));
      setPickingStudentId(null);
    };
    reader.readAsDataURL(file);
  };

  // Tải ảnh hàng loạt từ máy tính
  const handleBulkUploadAvatars = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file, index) => {
      if (index >= list.length) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setList(prev => prev.map((s, idx) => idx === index ? { ...s, avatarUrl: dataUrl } : s));
      };
      reader.readAsDataURL(file);
    });
  };

  // Phân tích văn bản paste từ Excel -> Tự động gán ngẫu nhiên 55 avatar ngộ nghĩnh
  const handleApplyBulkText = () => {
    const lines = bulkText.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    const newStudents: Student[] = lines.map((name, idx) => ({
      id: `s_bulk_${Date.now()}_${idx}`,
      name: name,
      number: idx + 1,
      color: COLOR_PALETTE[idx % COLOR_PALETTE.length]
    }));

    // Gán ngẫu nhiên không trùng lặp từ kho 55 avatar
    const withAvatars = assignRandomAvatarsToStudents(newStudents);

    setList(withAvatars);
    setShowBulkPaste(false);
    setBulkText('');
  };

  // Nạp mẫu lớp 30 em kèm 30 icon ngẫu nhiên từ kho 55 avatar
  const handleLoadPreset30 = () => {
    const names = [
      'Nguyễn An', 'Trần Bình', 'Lê Cường', 'Phạm Dũng', 'Hoàng Em',
      'Đặng Giang', 'Bùi Hải', 'Vũ Hùng', 'Đỗ Khánh', 'Hồ Linh',
      'Ngô Minh', 'Dương Nam', 'Lý Oanh', 'Mai Phúc', 'Đào Quân',
      'Vương Sơn', 'Tạ Tuấn', 'Trịnh Uy', 'Lương Vy', 'Hà Xuân',
      'Chu Yến', 'Cao Bảo', 'Đoàn Duy', 'Trương Gia', 'Đinh Khang',
      'Lâm Long', 'Thái Nghĩa', 'Phan Phong', 'Võ Quang', 'Thạch Sang'
    ];
    const generated: Student[] = names.map((name, idx) => ({
      id: `preset_${idx}`,
      name,
      number: idx + 1,
      color: COLOR_PALETTE[idx % COLOR_PALETTE.length]
    }));
    const withRandomAvatars = assignRandomAvatarsToStudents(generated);
    setList(withRandomAvatars);
  };

  const handleSaveAndClose = () => {
    onSaveStudents(list);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl p-5 md:p-8 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-left">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tiêu đề Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400">
              <Users className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg md:text-xl font-black text-white flex items-center gap-2">
                <span>Quản Lý Danh Sách Học Sinh ({list.length})</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  Kho 55 Icon Ngộ Nghĩnh
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Tự động gán ngẫu nhiên các icon động vật, siêu nhân, nhân vật đáng yêu khi tải danh sách
              </p>
            </div>
          </div>
        </div>

        {/* Thanh công cụ nhanh */}
        <div className="flex flex-wrap items-center gap-2 py-3 border-b border-slate-800/80 flex-shrink-0 text-xs">
          {/* Nút Gán ngẫu nhiên lại toàn bộ 55 icon */}
          <button
            onClick={handleRandomizeAllAvatars}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20 active:scale-95 transition-all"
            title="Xáo trộn và gán lại ngẫu nhiên 55 icon cho cả lớp"
          >
            <Dices className="w-4 h-4" />
            <span>🎲 Đổi Ngẫu Nhiên Icon Cho Cả Lớp</span>
          </button>

          {/* Dán từ Excel */}
          <button
            onClick={() => setShowBulkPaste(!showBulkPaste)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 font-bold"
          >
            <span>📋 Dán từ Excel</span>
          </button>

          {/* Mẫu lớp 30 em */}
          <button
            onClick={handleLoadPreset30}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-medium"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Mẫu Lớp 30 Em</span>
          </button>

          {/* Tải ảnh máy tính nếu muốn */}
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 font-medium cursor-pointer ml-auto">
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <span>Tải Ảnh Từ Máy</span>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleBulkUploadAvatars}
            />
          </label>
        </div>

        {/* Khung dán văn bản hàng loạt từ Excel */}
        {showBulkPaste && (
          <div className="p-3 bg-slate-950 rounded-2xl border border-indigo-500/40 my-2 animate-fade-in flex-shrink-0">
            <p className="text-xs text-slate-300 mb-1.5 font-medium">
              Dán danh sách tên học sinh (mỗi học sinh 1 dòng — hệ thống sẽ tự động gán ngẫu nhiên các icon ngộ nghĩnh):
            </p>
            <textarea
              rows={4}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder="Nguyễn Văn A&#10;Trần Thị B&#10;Lê Văn C..."
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setShowBulkPaste(false)}
                className="px-3 py-1 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Hủy
              </button>
              <button
                onClick={handleApplyBulkText}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30"
              >
                Áp Dụng Danh Sách & Gán Icon
              </button>
            </div>
          </div>
        )}

        {/* Thêm 1 học sinh mới */}
        <div className="flex gap-2 py-3 flex-shrink-0">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddSingle()}
            placeholder="Nhập tên học sinh mới (tự động gán ngẫu nhiên 1 trong 55 icon)..."
            className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs md:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <button
            onClick={handleAddSingle}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs md:text-sm shadow-md shadow-emerald-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm</span>
          </button>
        </div>

        {/* Danh sách học sinh dạng lưới cuộn */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 my-2 min-h-[260px]">
          {list.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <Users className="w-12 h-12 mb-2 opacity-40" />
              <p className="text-sm font-semibold">Chưa có học sinh nào trong danh sách.</p>
              <p className="text-xs text-slate-600">Bấm "Mẫu Lớp 30 Em" hoặc "Dán từ Excel" để tự động gán icon ngộ nghĩnh.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {list.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 text-xs transition-all shadow-sm"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {/* Avatar Icon ngộ nghĩnh */}
                    <div
                      onClick={() => setPickingStudentId(student.id)}
                      className="relative group w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 cursor-pointer transition-transform hover:scale-110 shadow-md"
                      style={{ borderColor: student.color }}
                      title="Bấm để đổi icon khác trong 55 icon"
                    >
                      {student.avatarUrl ? (
                        <img src={student.avatarUrl} alt={student.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-black text-white" style={{ backgroundColor: student.color }}>
                          {student.number}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-bold transition-opacity">
                        Đổi
                      </div>
                    </div>

                    <div className="truncate">
                      <span className="font-bold text-slate-100 text-sm truncate block">
                        #{student.number}. {student.name}
                      </span>
                      <span className="text-[10px] text-indigo-400">
                        Bấm vào hình để đổi icon
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Nút đổi icon ngẫu nhiên riêng cho em này */}
                    <button
                      onClick={() => {
                        const newAv = getRandomAvatar();
                        setList(prev => prev.map(s => s.id === student.id ? { ...s, avatarUrl: newAv.dataUrl } : s));
                      }}
                      className="p-1.5 text-slate-400 hover:text-amber-300 rounded-lg hover:bg-slate-800 transition-colors"
                      title="Đổi ngẫu nhiên icon cho học sinh này"
                    >
                      <Dices className="w-3.5 h-3.5" />
                    </button>

                    {/* Nút xóa */}
                    <button
                      onClick={() => handleDelete(student.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                      title="Xóa học sinh này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 flex-shrink-0">
          <button
            onClick={() => setList([])}
            className="text-xs text-red-400 hover:text-red-300 font-semibold px-2 py-1"
          >
            Xóa toàn bộ
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs md:text-sm font-semibold transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveAndClose}
              className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs md:text-sm font-extrabold shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Lưu Danh Sách</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MODAL CON: BẢNG CHỌN TRONG 55 ICON NGỘ NGHĨNH */}
        {/* ========================================================= */}
        {pickingStudentId && (
          <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md p-5 flex flex-col animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 flex-shrink-0">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <span>Chọn Icon Cho:</span>
                  <span className="text-amber-400">
                    {list.find(s => s.id === pickingStudentId)?.name}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Bấm vào bất kỳ icon nào dưới đây để chọn</p>
              </div>
              <button
                onClick={() => setPickingStudentId(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lưới 55 icon */}
            <div className="flex-1 overflow-y-auto grid grid-cols-5 sm:grid-cols-8 md:grid-cols-11 gap-3 p-1">
              {CUTE_AVATARS.map(avatar => (
                <button
                  key={avatar.id}
                  onClick={() => handleSelectSpecificAvatar(avatar)}
                  className="flex flex-col items-center gap-1 p-1.5 rounded-xl hover:bg-indigo-950/60 border border-transparent hover:border-indigo-500/50 transition-all group"
                >
                  <img
                    src={avatar.dataUrl}
                    alt={avatar.name}
                    className="w-12 h-12 object-contain rounded-full shadow-md group-hover:scale-110 transition-transform"
                  />
                  <span className="text-[10px] text-slate-300 truncate max-w-full text-center">
                    {avatar.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Tùy chọn tải ảnh riêng từ máy */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between flex-shrink-0">
              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer">
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                <span>Hoặc Tải Ảnh Từ Máy Tính</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleUploadAvatar(pickingStudentId, e)}
                />
              </label>

              <button
                onClick={() => setPickingStudentId(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
