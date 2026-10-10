import React, { useState, useRef } from 'react';
import { Student, Classroom } from '../types/marble';
import { 
  Users, Upload, Plus, Trash2, Check, Sparkles, X, Dices, 
  Image as ImageIcon, FileSpreadsheet, Edit3, School, AlertCircle 
} from 'lucide-react';
import { CUTE_AVATARS, getRandomAvatar, assignRandomAvatarsToStudents, CuteAvatarItem } from '../utils/avatars';
import { parseStudentExcel } from '../utils/excel';

interface StudentManagerModalProps {
  classrooms: Classroom[];
  activeClassroomId: string;
  onSelectClassroom: (classId: string) => void;
  onCreateClassroom: (name: string) => void;
  onRenameClassroom: (classId: string, newName: string) => void;
  onDeleteClassroom: (classId: string) => void;
  onSaveStudentsOfClass: (classId: string, students: Student[]) => void;
  onClose: () => void;
}

const COLOR_PALETTE = [
  '#EF4444', '#F97316', '#F59E0B', '#10B981', '#06B6D4',
  '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#14B8A6',
  '#E11D48', '#84CC16'
];

export const StudentManagerModal: React.FC<StudentManagerModalProps> = ({
  classrooms,
  activeClassroomId,
  onSelectClassroom,
  onCreateClassroom,
  onRenameClassroom,
  onDeleteClassroom,
  onSaveStudentsOfClass,
  onClose
}) => {
  // Tìm lớp đang hoạt động
  const currentClass = classrooms.find(c => c.id === activeClassroomId) || classrooms[0] || {
    id: 'default',
    name: 'Lớp 12A1',
    students: []
  };

  const [list, setList] = useState<Student[]>(currentClass.students || []);
  const [bulkText, setBulkText] = useState('');
  const [showBulkPaste, setShowBulkPaste] = useState(false);
  const [newName, setNewName] = useState('');
  
  // State quản lý lớp
  const [showNewClassInput, setShowNewClassInput] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [isEditingClassName, setIsEditingClassName] = useState(false);
  const [editingNameValue, setEditingNameValue] = useState(currentClass.name);

  // Thông báo Toast thành công hoặc lỗi
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // State chọn avatar cho 1 học sinh cụ thể
  const [pickingStudentId, setPickingStudentId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Chuyển sang lớp khác
  const handleSwitchClass = (classId: string) => {
    // Lưu lớp hiện tại trước khi chuyển
    onSaveStudentsOfClass(currentClass.id, list);
    
    onSelectClassroom(classId);
    const targetClass = classrooms.find(c => c.id === classId);
    if (targetClass) {
      setList(targetClass.students || []);
      setEditingNameValue(targetClass.name);
      setIsEditingClassName(false);
    }
  };

  // Tạo lớp mới
  const handleCreateNewClass = () => {
    if (!newClassName.trim()) return;
    onCreateClassroom(newClassName.trim());
    setNewClassName('');
    setShowNewClassInput(false);
    showToast(`Đã tạo thành công lớp "${newClassName.trim()}"!`);
  };

  // Đổi tên lớp
  const handleSaveClassName = () => {
    if (!editingNameValue.trim()) return;
    onRenameClassroom(currentClass.id, editingNameValue.trim());
    setIsEditingClassName(false);
    showToast(`Đã đổi tên lớp thành "${editingNameValue.trim()}"!`);
  };

  // Xóa lớp
  const handleDeleteCurrentClass = () => {
    if (classrooms.length <= 1) {
      showToast('Cần giữ lại ít nhất 1 lớp học trong danh sách!', 'error');
      return;
    }
    if (window.confirm(`Bạn có chắc chắn muốn xóa lớp "${currentClass.name}" cùng toàn bộ học sinh?`)) {
      onDeleteClassroom(currentClass.id);
      showToast(`Đã xóa lớp "${currentClass.name}"!`);
    }
  };

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
    showToast('Đã xáo trộn và gán ngẫu nhiên 55 icon cho cả lớp!');
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
    showToast(`Đã nạp ${Math.min(files.length, list.length)} ảnh đại diện từ máy tính!`);
  };

  // TẢI FILE EXCEL (.xlsx / .xls / .csv)
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const studentNames = await parseStudentExcel(file);
      
      const newStudents: Student[] = studentNames.map((name, idx) => ({
        id: `s_excel_${Date.now()}_${idx}`,
        name,
        number: idx + 1,
        color: COLOR_PALETTE[idx % COLOR_PALETTE.length]
      }));

      // Gán ngẫu nhiên 55 avatar icon
      const withAvatars = assignRandomAvatarsToStudents(newStudents);
      setList(withAvatars);
      
      showToast(`🎉 Đã nạp thành công ${withAvatars.length} học sinh từ file "${file.name}" vào ${currentClass.name}!`);
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  // Phân tích văn bản paste từ Excel
  const handleApplyBulkText = () => {
    const lines = bulkText.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    const newStudents: Student[] = lines.map((name, idx) => ({
      id: `s_bulk_${Date.now()}_${idx}`,
      name: name,
      number: idx + 1,
      color: COLOR_PALETTE[idx % COLOR_PALETTE.length]
    }));

    const withAvatars = assignRandomAvatarsToStudents(newStudents);
    setList(withAvatars);
    setShowBulkPaste(false);
    setBulkText('');
    showToast(`Đã nạp ${withAvatars.length} học sinh từ nội dung dán!`);
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
    showToast('Đã nạp danh sách mẫu 30 học sinh kèm icon ngộ nghĩnh!');
  };

  const handleSaveAndClose = () => {
    onSaveStudentsOfClass(currentClass.id, list);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl p-5 md:p-8 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-left">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Thông báo Toast */}
        {notification && (
          <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 shadow-xl animate-bounce ${
            notification.type === 'success' 
              ? 'bg-emerald-600 text-white shadow-emerald-600/30' 
              : 'bg-rose-600 text-white shadow-rose-600/30'
          }`}>
            {notification.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Header Modal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 flex-shrink-0 gap-2">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400">
              <Users className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg md:text-xl font-black text-white flex items-center gap-2">
                <span>Quản Lý Học Sinh & Lớp Học</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  Kho 55 Icon
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Thêm nhiều lớp giảng dạy, tải danh sách từ file Excel (.xlsx) và gán icon ngộ nghĩnh
              </p>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* THANH TAB DANH SÁCH CÁC LỚP HỌC (CLASSROOM TABS) */}
        {/* ======================================================== */}
        <div className="py-2.5 border-b border-slate-800 flex-shrink-0 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
              <School className="w-3.5 h-3.5 text-indigo-400" />
              <span>Lớp:</span>
            </span>

            {/* Các lớp học hiện có */}
            {classrooms.map(c => {
              const isActive = c.id === currentClass.id;
              const count = isActive ? list.length : (c.students?.length || 0);
              return (
                <button
                  key={c.id}
                  onClick={() => handleSwitchClass(c.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400/40'
                      : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60'
                  }`}
                >
                  <span>{c.name}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive ? 'bg-indigo-950/80 text-indigo-200' : 'bg-slate-900 text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}

            {/* Nút thêm lớp mới */}
            {!showNewClassInput ? (
              <button
                onClick={() => setShowNewClassInput(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 border border-dashed border-slate-600 text-xs font-semibold text-slate-300 hover:text-white"
                title="Tạo thêm lớp học mới"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Thêm Lớp</span>
              </button>
            ) : (
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-indigo-500/50 animate-fade-in">
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateNewClass()}
                  placeholder="Tên lớp (ví dụ: 11B2)..."
                  autoFocus
                  className="px-2 py-1 bg-transparent text-xs text-white focus:outline-none w-32"
                />
                <button
                  onClick={handleCreateNewClass}
                  className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
                  title="Tạo lớp"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setShowNewClassInput(false)}
                  className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                  title="Hủy"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Công cụ sửa / xóa lớp đang chọn */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {isEditingClassName ? (
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-amber-500/50">
                <input
                  type="text"
                  value={editingNameValue}
                  onChange={(e) => setEditingNameValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveClassName()}
                  autoFocus
                  className="px-2 py-0.5 bg-transparent text-xs text-white focus:outline-none w-28 font-bold"
                />
                <button
                  onClick={handleSaveClassName}
                  className="p-1 rounded bg-amber-600 text-white"
                  title="Lưu tên lớp"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setIsEditingClassName(false)}
                  className="p-1 rounded bg-slate-800 text-slate-400"
                  title="Hủy"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setEditingNameValue(currentClass.name);
                  setIsEditingClassName(true);
                }}
                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1"
                title="Đổi tên lớp này"
              >
                <Edit3 className="w-3 h-3 text-amber-400" />
                <span className="hidden sm:inline">Đổi tên</span>
              </button>
            )}

            <button
              onClick={handleDeleteCurrentClass}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 text-xs flex items-center gap-1"
              title="Xóa lớp này"
            >
              <Trash2 className="w-3 h-3" />
              <span className="hidden sm:inline">Xóa lớp</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* THANH CÔNG CỤ: EXCEL, DÁN, NGẪU NHIÊN, TẢI ẢNH */}
        {/* ======================================================== */}
        <div className="flex flex-wrap items-center gap-2 py-3 border-b border-slate-800/80 flex-shrink-0 text-xs">
          {/* NÚT TẢI FILE EXCEL (.xlsx / .xls) */}
          <label className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold shadow-md shadow-emerald-600/25 active:scale-95 transition-all cursor-pointer">
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            <span>📁 Tải Lên File Excel (.xlsx / .xls)</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              className="hidden"
              onChange={handleExcelUpload}
            />
          </label>

          {/* Dán từ Excel dạng văn bản */}
          <button
            onClick={() => setShowBulkPaste(!showBulkPaste)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 font-bold"
          >
            <span>📋 Dán Chữ từ Excel</span>
          </button>

          {/* Nút Gán ngẫu nhiên lại toàn bộ 55 icon */}
          <button
            onClick={handleRandomizeAllAvatars}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-bold active:scale-95 transition-all"
            title="Xáo trộn và gán lại ngẫu nhiên 55 icon cho cả lớp"
          >
            <Dices className="w-3.5 h-3.5 text-amber-400" />
            <span>🎲 Đổi Ngẫu Nhiên Icon</span>
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
            <span>Tải Ảnh Hàng Loạt</span>
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
              Dán danh sách tên học sinh (mỗi học sinh 1 dòng — tự động gán ngẫu nhiên 55 icon ngộ nghĩnh):
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
                Áp Dụng Danh Sách
              </button>
            </div>
          </div>
        )}

        {/* Thêm 1 học sinh mới */}
        <div className="flex gap-2 py-2.5 flex-shrink-0">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddSingle()}
            placeholder={`Thêm học sinh mới vào ${currentClass.name} (tự động gán 1 trong 55 icon)...`}
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
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 my-2 min-h-[240px]">
          {list.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500 border border-dashed border-slate-800 rounded-2xl">
              <FileSpreadsheet className="w-12 h-12 mb-2 text-emerald-500 opacity-60" />
              <p className="text-sm font-bold text-slate-300">Chưa có học sinh nào trong {currentClass.name}</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm text-center">
                Bấm nút <strong>"📁 Tải Lên File Excel"</strong> để nạp danh sách lớp hoặc bấm <strong>"Mẫu Lớp 30 Em"</strong> để thử nghiệm ngay.
              </p>
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
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 flex-shrink-0">
          <button
            onClick={() => {
              if (window.confirm(`Xóa toàn bộ học sinh của ${currentClass.name}?`)) {
                setList([]);
              }
            }}
            className="text-xs text-red-400 hover:text-red-300 font-semibold px-2 py-1"
          >
            Xóa danh sách lớp này
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs md:text-sm font-semibold transition-colors"
            >
              Đóng
            </button>
            <button
              onClick={handleSaveAndClose}
              className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs md:text-sm font-extrabold shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Lưu Lớp & Vào Đua Ngay</span>
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
