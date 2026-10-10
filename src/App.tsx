import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameMode, Marble, Student, TrackConfig, RaceState } from './types/marble';
import { QuizQuestion } from './types/quiz';
import { DEFAULT_TRACKS, updatePhysics } from './utils/physics';
import { sound } from './utils/audio';
import { Header } from './components/Header';
import { MarbleCanvas } from './components/MarbleCanvas';
import { RaceControls } from './components/RaceControls';
import { PodiumModal } from './components/PodiumModal';
import { QuizModal } from './components/QuizModal';
import { StudentManagerModal } from './components/StudentManagerModal';
import { GeminiModal } from './components/GeminiModal';
import { TrackSelectorModal } from './components/TrackSelectorModal';
import { QuizBankModal } from './components/QuizBankModal';
import { VisitCounter } from './components/VisitCounter';
import { assignRandomAvatarsToStudents } from './utils/avatars';
import { AuthorModal } from './components/AuthorModal';

const STORAGE_STUDENTS = 'duabi_classroom_students_v2';
const STORAGE_QUESTIONS = 'duabi_classroom_questions';

const DEFAULT_NAMES = [
  'Nguyễn An', 'Trần Bình', 'Lê Cường', 'Phạm Dũng', 'Hoàng Em',
  'Đặng Giang', 'Bùi Hải', 'Vũ Hùng', 'Đỗ Khánh', 'Hồ Linh',
  'Ngô Minh', 'Dương Nam', 'Lý Oanh', 'Mai Phúc', 'Đào Quân',
  'Vương Sơn', 'Tạ Tuấn', 'Trịnh Uy', 'Lương Vy', 'Hà Xuân',
  'Chu Yến', 'Cao Bảo', 'Đoàn Duy', 'Trương Gia', 'Đinh Khang',
  'Lâm Long', 'Thái Nghĩa', 'Phan Phong', 'Võ Quang', 'Thạch Sang'
];

const COLOR_PALETTE = [
  '#EF4444', '#F97316', '#F59E0B', '#10B981', '#06B6D4',
  '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#14B8A6',
  '#E11D48', '#84CC16'
];

export const App: React.FC = () => {
  // 1. Chế độ chơi & Cài đặt
  const [gameMode, setGameMode] = useState<GameMode>('fun');
  const [currentTrack, setCurrentTrack] = useState<TrackConfig>(DEFAULT_TRACKS[0]);
  const [winnerCount, setWinnerCount] = useState<number>(3);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // 2. Modals state
  const [showStudentsModal, setShowStudentsModal] = useState<boolean>(false);
  const [showQuizBankModal, setShowQuizBankModal] = useState<boolean>(false);
  const [showTrackModal, setShowTrackModal] = useState<boolean>(false);
  const [showGeminiModal, setShowGeminiModal] = useState<boolean>(false);
  const [showPodiumModal, setShowPodiumModal] = useState<boolean>(false);
  const [showQuizModal, setShowQuizModal] = useState<boolean>(false);
  const [showAuthorModal, setShowAuthorModal] = useState<boolean>(false);
  const [targetStudentForQuiz, setTargetStudentForQuiz] = useState<Marble | null>(null);

  // 3. Dữ liệu học sinh & câu hỏi (tự động gán ngẫu nhiên kho 55 avatar)
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_STUDENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    const initialList: Student[] = DEFAULT_NAMES.map((name, idx) => ({
      id: `std_${idx}`,
      name,
      number: idx + 1,
      color: COLOR_PALETTE[idx % COLOR_PALETTE.length]
    }));
    return assignRandomAvatarsToStudents(initialList);
  });

  const [questions, setQuestions] = useState<QuizQuestion[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_QUESTIONS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'q1',
        text: 'Thủ đô của nước Việt Nam là gì?',
        options: ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Huế'],
        correctIndex: 0,
        explanation: 'Hà Nội là thủ đô của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.'
      },
      {
        id: 'q2',
        text: 'Phép tính $5 \\times 6 + 10$ có kết quả là bao nhiêu?',
        options: ['30', '40', '50', '60'],
        correctIndex: 1,
        explanation: '$5 \\times 6 = 30$, cộng thêm 10 được kết quả là 40.'
      }
    ];
  });

  const [currentQuizQuestionIndex, setCurrentQuizQuestionIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);

  // 4. Trạng thái cuộc đua & Viên bi
  const [raceState, setRaceState] = useState<RaceState>({
    status: 'ready',
    countdown: 3,
    elapsedTime: 0,
    rankedWinners: [],
    targetRankCount: 3
  });

  const [marbles, setMarbles] = useState<Marble[]>([]);
  const marblesRef = useRef<Marble[]>([]);
  const nextRankRef = useRef<number>(1);
  const animationFrameRef = useRef<number | null>(null);

  // Khởi tạo các viên bi tại vạch xuất phát
  const initMarbles = useCallback((studList: Student[], track: TrackConfig, _mode: GameMode) => {
    const { spawnArea } = track;
    const cols = 8;
    const spacingX = spawnArea.width / cols;
    const spacingY = 38;
    // Bán kính 18 để hiển thị icon ngộ nghĩnh sắc nét
    const radius = 18;

    const newMarbles: Marble[] = studList.map((s, idx) => {
      const row = Math.floor(idx / cols);
      const col = idx % cols;
      // Thêm chút ngẫu nhiên vị trí ban đầu
      const x = spawnArea.x + col * spacingX + (row % 2 === 0 ? 10 : 25) + (Math.random() - 0.5) * 6;
      const y = spawnArea.y + row * spacingY + (Math.random() - 0.5) * 6;

      return {
        id: `m_${s.id}`,
        studentId: s.id,
        name: s.name,
        number: s.number || idx + 1,
        avatarUrl: s.avatarUrl,
        color: s.color,
        x,
        y,
        vx: (Math.random() - 0.5) * 0.5,
        vy: 0,
        radius,
        mass: 1,
        angle: 0,
        angularVelocity: 0,
        finished: false,
        trail: [],
        score: 0
      };
    });

    marblesRef.current = newMarbles;
    setMarbles(newMarbles);
    nextRankRef.current = 1;
  }, []);

  // Cập nhật khi đổi danh sách học sinh, đường đua hoặc chế độ chơi
  useEffect(() => {
    initMarbles(students, currentTrack, gameMode);
  }, [students, currentTrack, gameMode, initMarbles]);

  // Lưu danh sách học sinh vào localStorage
  const handleSaveStudents = (newStudents: Student[]) => {
    setStudents(newStudents);
    try {
      localStorage.setItem(STORAGE_STUDENTS, JSON.stringify(newStudents));
    } catch {}
    initMarbles(newStudents, currentTrack, gameMode);
  };

  // Lưu ngân hàng câu hỏi vào localStorage
  const handleSaveQuestions = (newQuestions: QuizQuestion[]) => {
    setQuestions(newQuestions);
    try {
      localStorage.setItem(STORAGE_QUESTIONS, JSON.stringify(newQuestions));
    } catch {}
  };

  // Bật/tắt âm thanh
  const handleToggleMute = () => {
    sound.isMuted = !sound.isMuted;
    setIsMuted(sound.isMuted);
  };

  // Khi có 1 viên bi cán vạch đích
  const handleMarbleFinish = useCallback((marble: Marble) => {
    if (marble.rank) return;
    const rank = nextRankRef.current;
    marble.rank = rank;
    nextRankRef.current += 1;

    setRaceState(prev => {
      const updatedWinners = [...prev.rankedWinners, marble];
      // Nếu đã đủ số lượng người thắng yêu cầu
      if (updatedWinners.length >= winnerCount && prev.status === 'racing') {
        setTimeout(() => {
          setRaceState(s => ({ ...s, status: 'finished' }));
          setShowPodiumModal(true);
        }, 1200);
      }
      return {
        ...prev,
        rankedWinners: updatedWinners
      };
    });
  }, [winnerCount]);

  // Vòng lặp vật lý chính (Physics Animation Loop)
  useEffect(() => {
    if (raceState.status !== 'racing') {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const loop = () => {
      updatePhysics(marblesRef.current, currentTrack, handleMarbleFinish);
      setMarbles([...marblesRef.current]);
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [raceState.status, currentTrack, handleMarbleFinish]);

  // Bắt đầu đếm ngược 3, 2, 1 xuất phát
  const handleStartRace = () => {
    // Reset trước nếu đã đua xong
    if (raceState.status === 'finished') {
      initMarbles(students, currentTrack, gameMode);
    }

    setRaceState({
      status: 'countdown',
      countdown: 3,
      elapsedTime: 0,
      rankedWinners: [],
      targetRankCount: winnerCount
    });

    nextRankRef.current = 1;
    sound.playCountdownBeep(false);

    let count = 3;
    const timer = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setRaceState(prev => ({ ...prev, countdown: count }));
        sound.playCountdownBeep(false);
      } else if (count === 0) {
        setRaceState(prev => ({ ...prev, countdown: 0 }));
        sound.playCountdownBeep(true);
      } else {
        clearInterval(timer);
        sound.playWhistle();
        setRaceState(prev => ({ ...prev, status: 'racing' }));

        // Cú huých nhẹ ban đầu để các viên bi lăn
        marblesRef.current.forEach(m => {
          m.vy = 1 + Math.random() * 2;
          m.vx = (Math.random() - 0.5) * 2;
        });
      }
    }, 900);
  };

  const handlePauseRace = () => {
    setRaceState(prev => ({ ...prev, status: 'paused' }));
  };

  const handleResumeRace = () => {
    setRaceState(prev => ({ ...prev, status: 'racing' }));
  };

  const handleResetRace = () => {
    setRaceState({
      status: 'ready',
      countdown: 3,
      elapsedTime: 0,
      rankedWinners: [],
      targetRankCount: winnerCount
    });
    initMarbles(students, currentTrack, gameMode);
    setShowPodiumModal(false);
  };

  // Tăng tốc toàn bộ viên bi (Nitro Boost All)
  const handleBoostAll = () => {
    sound.playBoost();
    marblesRef.current.forEach(m => {
      if (!m.finished) {
        m.vy += 8;
        m.vx += (Math.random() - 0.5) * 5;
      }
    });
  };

  // Khởi động Quiz kiểm tra bài cũ cho người chiến thắng
  const handleStartQuizForWinner = (winner: Marble) => {
    setTargetStudentForQuiz(winner);
    setShowPodiumModal(false);
    setShowQuizModal(true);
  };

  // Trả lời câu hỏi Quiz
  const handleQuizAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setQuizScore(prev => prev + 10);
    }
  };

  const handleNextQuizQuestion = () => {
    if (questions.length > 0) {
      setCurrentQuizQuestionIndex((currentQuizQuestionIndex + 1) % questions.length);
    }
  };

  // Lắng nghe phím tắt bàn phím
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Tránh ăn phím khi đang gõ text input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (raceState.status === 'ready' || raceState.status === 'finished') {
          handleStartRace();
        } else if (raceState.status === 'racing') {
          handlePauseRace();
        } else if (raceState.status === 'paused') {
          handleResumeRace();
        }
      } else if (e.code === 'KeyR') {
        handleResetRace();
      } else if (e.code === 'KeyB' && raceState.status === 'racing') {
        handleBoostAll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [raceState.status]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100">
      {/* Header chính */}
      <Header
        currentMode={gameMode}
        onSelectMode={(mode) => {
          setGameMode(mode);
          handleResetRace();
        }}
        onOpenStudents={() => setShowStudentsModal(true)}
        onOpenQuizBank={() => setShowQuizBankModal(true)}
        onOpenTrackSelect={() => setShowTrackModal(true)}
        onOpenGeminiAI={() => setShowGeminiModal(true)}
        onOpenAuthor={() => setShowAuthorModal(true)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        currentTrackName={currentTrack.name}
      />

      {/* Khu vực đường đua chính */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 md:p-4 relative">
        {/* Banner đếm ngược xuất phát to giữa màn hình */}
        {raceState.status === 'countdown' && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm pointer-events-none">
            <div className="flex flex-col items-center animate-bounce">
              <span className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-amber-400 via-amber-200 to-white drop-shadow-[0_10px_20px_rgba(245,158,11,0.5)]">
                {raceState.countdown > 0 ? raceState.countdown : 'GO!'}
              </span>
              <p className="text-lg md:text-2xl font-extrabold text-amber-300 mt-4 tracking-wider uppercase">
                {raceState.countdown > 0 ? 'Chuẩn bị...' : '🚀 XUẤT PHÁT!'}
              </p>
            </div>
          </div>
        )}

        {/* Khung Canvas đường đua */}
        <div className="w-full max-w-4xl flex flex-col items-center">
          <MarbleCanvas
            marbles={marbles}
            track={currentTrack}
            gameMode={gameMode}
            winnerCount={winnerCount}
          />

          {/* Bảng điều khiển cuộc đua */}
          <div className="w-full mt-3">
            <RaceControls
              raceState={raceState}
              onStartRace={handleStartRace}
              onPauseRace={handlePauseRace}
              onResumeRace={handleResumeRace}
              onResetRace={handleResetRace}
              onBoostAll={handleBoostAll}
              winnerCount={winnerCount}
              onChangeWinnerCount={(count) => setWinnerCount(count)}
            />
          </div>
        </div>
      </main>

      {/* Footer chứa VisitCounter theo visit.md & Thông tin Tác giả */}
      <footer className="w-full py-4 border-t border-slate-900 bg-slate-950/80 backdrop-blur-md flex flex-col items-center gap-2.5 px-4 text-center">
        <VisitCounter />
        
        {/* Badge Tác giả trang trọng */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <button
            onClick={() => setShowAuthorModal(true)}
            className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-white transition-all shadow-sm active:scale-95"
            title="Nhấp để xem thông tin chi tiết tác giả ứng dụng"
          >
            <div className="w-5 h-5 rounded-full overflow-hidden border border-indigo-400 shrink-0">
              <img src="/avatar.jpg" alt="" className="w-full h-full object-cover" />
            </div>
            <span>Tác giả: <strong className="text-indigo-300 font-bold group-hover:underline">Cô Trần Thị Kim Thoa</strong></span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Trường THPT Hoàng Diệu</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Chi tiết</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-500 font-medium">
          Dành cho giáo viên sáng tạo & lớp học tích cực • Phím tắt: [Space] Bắt đầu/Tạm dừng • [B] Tăng tốc Nitro • [R] Đặt lại
        </p>
      </footer>

      {/* Modals */}
      {showStudentsModal && (
        <StudentManagerModal
          students={students}
          onSaveStudents={handleSaveStudents}
          onClose={() => setShowStudentsModal(false)}
        />
      )}

      {showTrackModal && (
        <TrackSelectorModal
          currentTrackId={currentTrack.id}
          onSelectTrack={(track) => {
            setCurrentTrack(track);
            handleResetRace();
          }}
          onClose={() => setShowTrackModal(false)}
        />
      )}

      {showQuizBankModal && (
        <QuizBankModal
          questions={questions}
          onSaveQuestions={handleSaveQuestions}
          onOpenGeminiAI={() => setShowGeminiModal(true)}
          onClose={() => setShowQuizBankModal(false)}
        />
      )}

      {showGeminiModal && (
        <GeminiModal
          onAddQuestions={(newQs) => {
            const updated = [...questions, ...newQs];
            handleSaveQuestions(updated);
          }}
          onClose={() => setShowGeminiModal(false)}
        />
      )}

      {showPodiumModal && (
        <PodiumModal
          winners={raceState.rankedWinners}
          gameMode={gameMode}
          onClose={() => setShowPodiumModal(false)}
          onReplay={handleStartRace}
          onStartQuizForWinner={handleStartQuizForWinner}
        />
      )}

      {showQuizModal && questions.length > 0 && (
        <QuizModal
          question={questions[currentQuizQuestionIndex]}
          targetStudent={targetStudentForQuiz}
          onAnswer={handleQuizAnswer}
          onClose={() => setShowQuizModal(false)}
          onNextQuestion={handleNextQuizQuestion}
          currentScore={quizScore}
        />
      )}

      {/* Modal Tác giả ứng dụng */}
      {showAuthorModal && (
        <AuthorModal onClose={() => setShowAuthorModal(false)} />
      )}
    </div>
  );
};

export default App;
