export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface QuizState {
  currentQuestionIndex: number;
  score: number;
  totalAnswered: number;
  selectedAnswer: number | null;
  isAnswerSubmitted: boolean;
  isCorrect: boolean | null;
  targetMarble: string | null; // Student/Marble being questioned
}
