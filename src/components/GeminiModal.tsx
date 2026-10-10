import React, { useState, useEffect } from 'react';
import { Sparkles, Key, Check, Loader2, AlertCircle, X } from 'lucide-react';
import { QuizQuestion } from '../types/quiz';
import { generateQuizWithGemini, isValidGoogleAiApiKey } from '../utils/gemini';

interface GeminiModalProps {
  onAddQuestions: (questions: QuizQuestion[]) => void;
  onClose: () => void;
}

const STORAGE_API_KEY = 'duabi_gemini_api_key';

export const GeminiModal: React.FC<GeminiModalProps> = ({
  onAddQuestions,
  onClose
}) => {
  const [apiKey, setApiKey] = useState('');
  const [topic, setTopic] = useState('Toán 6: Phép tính phân số');
  const [count, setCount] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_API_KEY) || '';
    if (saved) setApiKey(saved);
  }, []);

  const handleGenerate = async () => {
    setErrorMsg(null);
    setSuccessCount(null);

    if (!isValidGoogleAiApiKey(apiKey)) {
      setErrorMsg('API Key không hợp lệ! Vui lòng nhập khóa API bắt đầu bằng AIzaSy... hoặc AQ...');
      return;
    }

    if (!topic.trim()) {
      setErrorMsg('Vui lòng nhập chủ đề câu hỏi.');
      return;
    }

    setIsLoading(true);
    try {
      localStorage.setItem(STORAGE_API_KEY, apiKey.trim());
      const questions = await generateQuizWithGemini(apiKey, topic.trim(), count);
      setSuccessCount(questions.length);
      onAddQuestions(questions);
      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi tạo câu hỏi với AI. Vui lòng kiểm tra lại API Key hoặc thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-purple-500/40 rounded-3xl p-6 md:p-8 shadow-2xl shadow-purple-500/10 text-left">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tiêu đề Modal */}
        <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-800">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/30">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-black text-white">
              Tạo Câu Hỏi Bằng AI Gemini
            </h2>
            <p className="text-xs text-purple-300/80">
              Sinh ngân hàng câu hỏi trắc nghiệm tự động theo mọi chủ đề
            </p>
          </div>
        </div>

        {/* Nhập API Key */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>Google AI Studio API Key:</span>
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIzaSy... hoặc AQ..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Hỗ trợ API Key bắt đầu bằng <code className="text-purple-300 font-mono">AIzaSy...</code> hoặc <code className="text-purple-300 font-mono">AQ...</code> (Miễn phí từ Google AI Studio).
          </p>
        </div>

        {/* Chủ đề câu hỏi */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-300 mb-1.5">
            Chủ đề bài học / Môn học:
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ví dụ: Lịch sử 8: Cách mạng tháng Tám, Toán 7: Tam giác đều..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs md:text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>

        {/* Số lượng câu hỏi */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-slate-300 mb-1.5">
            Số lượng câu hỏi:
          </label>
          <div className="flex items-center gap-3">
            {[3, 5, 10].map(n => (
              <button
                key={n}
                onClick={() => setCount(n)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                  count === n
                    ? 'bg-purple-600/30 border-purple-500 text-purple-200 shadow-md shadow-purple-500/20'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {n} Câu
              </button>
            ))}
          </div>
        </div>

        {/* Thông báo lỗi */}
        {errorMsg && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs mb-4">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Thông báo thành công */}
        {successCount && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs mb-4 animate-fade-in">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Đã tạo thành công {successCount} câu hỏi mới! Đang thêm vào ngân hàng...</span>
          </div>
        )}

        {/* Nút hành động */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs md:text-sm font-semibold transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs md:text-sm font-extrabold shadow-lg shadow-purple-500/30 active:scale-95 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI ĐANG SUY NGHĨ...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>BẮT ĐẦU TẠO CÂU HỎI</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
