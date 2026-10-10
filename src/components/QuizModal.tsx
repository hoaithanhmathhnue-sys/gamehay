import React, { useState } from 'react';
import { QuizQuestion } from '../types/quiz';
import { Marble } from '../types/marble';
import { sound } from '../utils/audio';
import { CheckCircle2, XCircle, Award, ArrowRight, X } from 'lucide-react';

interface QuizModalProps {
  question: QuizQuestion;
  targetStudent?: Marble | null;
  onAnswer: (isCorrect: boolean) => void;
  onClose: () => void;
  onNextQuestion?: () => void;
  currentScore: number;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  question,
  targetStudent,
  onAnswer,
  onClose,
  onNextQuestion,
  currentScore
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedIdx(idx);
    setIsAnswered(true);

    const isCorrect = idx === question.correctIndex;
    if (isCorrect) {
      sound.playCorrect();
    } else {
      sound.playWrong();
    }
    onAnswer(isCorrect);
  };

  const optionLetters = ['A', 'B', 'C', 'D'];
  const optionColors = [
    'hover:border-blue-500 hover:bg-blue-500/10',
    'hover:border-emerald-500 hover:bg-emerald-500/10',
    'hover:border-amber-500 hover:bg-amber-500/10',
    'hover:border-rose-500 hover:bg-rose-500/10'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-2xl shadow-indigo-500/10 text-left overflow-hidden">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Banner học sinh trả lời */}
        <div className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 text-lg">
              📝
            </span>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                Kiểm tra đánh giá
              </span>
              <h3 className="text-base font-extrabold text-white flex items-center gap-1.5">
                {targetStudent ? (
                  <>
                    <span className="text-amber-400">Học sinh:</span>
                    <span>{targetStudent.name}</span>
                  </>
                ) : (
                  'Câu hỏi trắc nghiệm'
                )}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-xs font-bold text-indigo-300">
            <Award className="w-3.5 h-3.5 text-indigo-400" />
            <span>Điểm: {currentScore} XP</span>
          </div>
        </div>

        {/* Nội dung câu hỏi */}
        <div className="mb-6">
          <p className="text-lg md:text-xl font-bold text-slate-100 leading-relaxed">
            {question.text}
          </p>
        </div>

        {/* Danh sách 4 đáp án A, B, C, D */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6" role="radiogroup">
          {question.options.map((opt, idx) => {
            const isSelected = selectedIdx === idx;
            const isCorrectAnswer = idx === question.correctIndex;

            let buttonStyle = 'bg-slate-800/70 border-slate-700/80 text-slate-200 ' + optionColors[idx];

            if (isAnswered) {
              if (isCorrectAnswer) {
                buttonStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-100 shadow-md shadow-emerald-500/20 font-bold';
              } else if (isSelected && !isCorrectAnswer) {
                buttonStyle = 'bg-rose-950/80 border-rose-500 text-rose-100 shadow-md shadow-rose-500/20 line-through opacity-90';
              } else {
                buttonStyle = 'bg-slate-900/60 border-slate-800 text-slate-500 opacity-60';
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleSelect(idx)}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 text-left transition-all active:scale-[0.98] ${buttonStyle}`}
              >
                <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-slate-950/60 border border-slate-700/50 flex items-center justify-center text-xs font-black text-white">
                  {optionLetters[idx]}
                </span>
                <span className="text-sm font-medium pt-0.5 leading-snug flex-1">
                  {opt}
                </span>
                {isAnswered && isCorrectAnswer && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                )}
                {isAnswered && isSelected && !isCorrectAnswer && (
                  <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Lời giải thích hiển thị sau khi trả lời */}
        {isAnswered && (
          <div
            className={`p-4 rounded-2xl border mb-6 animate-fade-in ${
              selectedIdx === question.correctIndex
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
            }`}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-1.5 font-extrabold text-sm mb-1">
              <span>{selectedIdx === question.correctIndex ? '🎉 CHÍNH XÁC! (+10 XP)' : '💡 LỜI GIẢI THÍCH:'}</span>
            </div>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              {question.explanation}
            </p>
          </div>
        )}

        {/* Nút hành động */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {isAnswered && onNextQuestion && (
            <button
              onClick={onNextQuestion}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-extrabold text-sm shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
            >
              <span>CÂU HỎI TIẾP THEO</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

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
