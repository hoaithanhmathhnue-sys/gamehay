import React, { useState } from 'react';
import { QuizQuestion } from '../types/quiz';
import { HelpCircle, Plus, Trash2, BookOpen, Sparkles, X } from 'lucide-react';

interface QuizBankModalProps {
  questions: QuizQuestion[];
  onSaveQuestions: (newQuestions: QuizQuestion[]) => void;
  onOpenGeminiAI: () => void;
  onClose: () => void;
}

// Bộ câu hỏi mẫu phong phú
const SAMPLE_QUESTIONS: QuizQuestion[] = [
  {
    id: 'sample_1',
    text: 'Thủ đô của Việt Nam là thành phố nào?',
    options: ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Huế'],
    correctIndex: 0,
    explanation: 'Hà Nội là thủ đô ngàn năm văn hiến và là trung tâm chính trị, văn hóa của Việt Nam.',
    topic: 'Địa lý'
  },
  {
    id: 'sample_2',
    text: 'Kết quả của phép tính: $2^3 + 3^2$ bằng bao nhiêu?',
    options: ['17', '15', '25', '12'],
    correctIndex: 0,
    explanation: '$2^3 = 8$ và $3^2 = 9$. Do đó $8 + 9 = 17$.',
    topic: 'Toán học'
  },
  {
    id: 'sample_3',
    text: 'Chiến thắng Điện Biên Phủ "lừng lẫy năm châu, chấn động địa cầu" diễn ra vào năm nào?',
    options: ['1945', '1954', '1975', '1968'],
    correctIndex: 1,
    explanation: 'Chiến dịch Điện Biên Phủ toàn thắng vào ngày 07/05/1954.',
    topic: 'Lịch sử'
  },
  {
    id: 'sample_4',
    text: 'Công thức hóa học của nước là gì?',
    options: ['CO2', 'NaCl', 'H2O', 'O2'],
    correctIndex: 2,
    explanation: 'Nước gồm 2 nguyên tử Hydro và 1 nguyên tử Oxy liên kết với nhau (H2O).',
    topic: 'Hóa học'
  },
  {
    id: 'sample_5',
    text: 'Từ nào sau đây là danh từ trong tiếng Anh?',
    options: ['Quickly', 'Happiness', 'Beautiful', 'Run'],
    correctIndex: 1,
    explanation: '"Happiness" (hạnh phúc) là danh từ có hậu tố -ness.',
    topic: 'Tiếng Anh'
  }
];

export const QuizBankModal: React.FC<QuizBankModalProps> = ({
  questions,
  onSaveQuestions,
  onOpenGeminiAI,
  onClose
}) => {
  const [list, setList] = useState<QuizQuestion[]>(questions);
  const [isAdding, setIsAdding] = useState(false);
  const [newText, setNewText] = useState('');
  const [newOptions, setNewOptions] = useState(['', '', '', '']);
  const [newCorrect, setNewCorrect] = useState(0);
  const [newExpl, setNewExpl] = useState('');

  const handleAddNew = () => {
    if (!newText.trim() || newOptions.some(o => !o.trim())) return;

    const q: QuizQuestion = {
      id: `q_custom_${Date.now()}`,
      text: newText.trim(),
      options: newOptions.map(o => o.trim()),
      correctIndex: newCorrect,
      explanation: newExpl.trim() || 'Chính xác!',
      topic: 'Tự tạo'
    };

    setList([...list, q]);
    setIsAdding(false);
    setNewText('');
    setNewOptions(['', '', '', '']);
    setNewCorrect(0);
    setNewExpl('');
  };

  const handleDelete = (id: string) => {
    setList(list.filter(q => q.id !== id));
  };

  const handleLoadSamples = () => {
    setList([...SAMPLE_QUESTIONS]);
  };

  const handleSaveAndClose = () => {
    onSaveQuestions(list);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl p-5 md:p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-left">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tiêu đề */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <HelpCircle className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg md:text-xl font-black text-white">
                Ngân Hàng Câu Hỏi Kiểm Tra ({list.length})
              </h2>
              <p className="text-xs text-slate-400">
                Quản lý câu hỏi trắc nghiệm dùng cho chế độ Đua Bi Kiểm Tra Đánh Giá
              </p>
            </div>
          </div>
        </div>

        {/* Thanh công cụ */}
        <div className="flex flex-wrap items-center gap-2 py-3 border-b border-slate-800/80 flex-shrink-0 text-xs">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Câu Hỏi</span>
          </button>

          <button
            onClick={handleLoadSamples}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-medium"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span>Nạp Mẫu 5 Môn</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenGeminiAI();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/50 hover:to-indigo-600/50 border border-purple-500/40 text-purple-200 font-bold ml-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Sinh Bằng AI Gemini</span>
          </button>
        </div>

        {/* Form thêm câu hỏi mới */}
        {isAdding && (
          <div className="p-4 bg-slate-950 rounded-2xl border border-emerald-500/40 my-2 animate-fade-in flex-shrink-0 space-y-3">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Tạo câu hỏi mới
            </h4>
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Nhập nội dung câu hỏi (hỗ trợ công thức $x^2$)..."
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {['A', 'B', 'C', 'D'].map((letter, idx) => (
                <div key={letter} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctOption"
                    checked={newCorrect === idx}
                    onChange={() => setNewCorrect(idx)}
                    className="accent-emerald-500 w-4 h-4"
                    title={`Chọn ${letter} làm đáp án đúng`}
                  />
                  <input
                    type="text"
                    value={newOptions[idx]}
                    onChange={(e) => {
                      const updated = [...newOptions];
                      updated[idx] = e.target.value;
                      setNewOptions(updated);
                    }}
                    placeholder={`Đáp án ${letter}...`}
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none"
                  />
                </div>
              ))}
            </div>

            <input
              type="text"
              value={newExpl}
              onChange={(e) => setNewExpl(e.target.value)}
              placeholder="Lời giải thích ngắn gọn khi học sinh trả lời xong..."
              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs focus:outline-none"
            />

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setIsAdding(false)}
                className="px-3 py-1 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Hủy
              </button>
              <button
                onClick={handleAddNew}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30"
              >
                Lưu Câu Hỏi
              </button>
            </div>
          </div>
        )}

        {/* Danh sách câu hỏi cuộn */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 my-2 min-h-[220px]">
          {list.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <HelpCircle className="w-10 h-10 mb-2 opacity-40" />
              <p className="text-sm">Chưa có câu hỏi nào trong ngân hàng.</p>
              <p className="text-xs text-slate-600">Bấm "Nạp Mẫu 5 Môn" hoặc "Sinh Bằng AI Gemini" để tạo ngay.</p>
            </div>
          ) : (
            list.map((q, qIdx) => (
              <div
                key={q.id}
                className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <span className="font-extrabold text-indigo-400 flex-shrink-0">
                      Câu {qIdx + 1}:
                    </span>
                    <p className="font-bold text-slate-100 text-sm leading-snug">
                      {q.text}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors flex-shrink-0"
                    title="Xóa câu này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 4 đáp án */}
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {q.options.map((opt, oIdx) => (
                    <div
                      key={oIdx}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] truncate ${
                        oIdx === q.correctIndex
                          ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <span className="font-mono mr-1">
                        {String.fromCharCode(65 + oIdx)}.
                      </span>
                      <span>{opt}</span>
                    </div>
                  ))}
                </div>

                {q.explanation && (
                  <p className="text-[11px] text-slate-400 italic pt-0.5">
                    💡 {q.explanation}
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
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
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs md:text-sm font-extrabold shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
            >
              Lưu Ngân Hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
