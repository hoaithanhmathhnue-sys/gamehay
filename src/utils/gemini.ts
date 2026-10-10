// Tuân thủ nghiêm ngặt theo start/api.md
// Chấp nhận API Key bắt đầu bằng AIzaSy và AQ
// Xử lý fallback đa tầng cho 503 UNAVAILABLE / model overload

import { QuizQuestion } from '../types/quiz';

export const GOOGLE_AI_API_KEY_PATTERN = /^(?:AIzaSy|AQ)\S{8,}$/;

export const isValidGoogleAiApiKey = (key: string): boolean => {
  return GOOGLE_AI_API_KEY_PATTERN.test(key.trim());
};

export const FREE_GENERAL_GEMINI_MODELS = [
  'gemini-3.1-flash-lite', // Model ưu tiên: nhẹ, nhanh, chi phí thấp
  'gemini-3.5-flash',      // Model mạnh mẽ phân tích sâu
  'gemini-2.5-flash-lite', // Fallback ổn định khi Gemini 3 bận
  'gemini-2.5-flash',      // Fallback cân bằng
  'gemini-2.5-pro'         // Fallback cao cấp
];

export const parseApiError = (error: any): string => {
  const message = error?.message || error?.toString() || '';
  const serialized = JSON.stringify(error) || '';

  if (
    serialized.includes('429') ||
    message.includes('RESOURCE_EXHAUSTED') ||
    message.toLowerCase().includes('quota')
  ) {
    return 'QUOTA_EXCEEDED';
  }

  if (
    serialized.includes('503') ||
    message.includes('UNAVAILABLE') ||
    message.toLowerCase().includes('high demand') ||
    message.toLowerCase().includes('overloaded')
  ) {
    return 'MODEL_OVERLOADED';
  }

  if (
    message.includes('API_KEY_INVALID') ||
    message.includes('401') ||
    message.includes('403') ||
    message.includes('PERMISSION_DENIED')
  ) {
    return 'INVALID_API_KEY';
  }

  return 'UNKNOWN';
};

export async function generateQuizWithGemini(
  apiKey: string,
  topic: string,
  questionCount: number = 5
): Promise<QuizQuestion[]> {
  const trimmedKey = apiKey.trim();
  if (!isValidGoogleAiApiKey(trimmedKey)) {
    throw new Error('API Key không hợp lệ! Key phải bắt đầu bằng AIzaSy... hoặc AQ...');
  }

  const prompt = `Bạn là chuyên gia giáo dục. Hãy tạo ${questionCount} câu hỏi trắc nghiệm tiếng Việt theo chủ đề: "${topic}".
Mỗi câu hỏi có 4 lựa chọn (A, B, C, D) với 1 đáp án đúng và lời giải thích ngắn gọn, dễ hiểu cho học sinh.
Đặc biệt nếu là môn Toán/Khoa học, hãy viết công thức dưới dạng LaTeX kẹp trong dấu $...$ (ví dụ: $x^2 + 2x = 0$, $\\frac{1}{2}$).

Yêu cầu trả về DUY NHẤT một chuỗi JSON hợp lệ theo định dạng mảng (không dùng markdown code fence, không thêm lời chào):
[
  {
    "id": "q1",
    "text": "Nội dung câu hỏi...",
    "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
    "correctIndex": 0,
    "explanation": "Giải thích chi tiết vì sao đáp án này đúng..."
  }
]`;

  let lastError: any = null;

  // Lần lượt thử các model trong danh sách fallback
  for (const model of FREE_GENERAL_GEMINI_MODELS) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${trimmedKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errType = parseApiError(errorData);
        if (errType === 'MODEL_OVERLOADED' || response.status === 503) {
          console.warn(`Model ${model} đang quá tải, tự động chuyển sang model fallback tiếp theo...`);
          continue;
        }
        throw new Error(errorData?.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error('Không nhận được phản hồi từ AI');
      }

      // Làm sạch markdown nếu có
      let cleaned = rawText.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.substring(7);
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.substring(3);
      }
      if (cleaned.endsWith('```')) {
        cleaned = cleaned.substring(0, cleaned.length - 3);
      }
      cleaned = cleaned.trim();

      const parsed: QuizQuestion[] = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((q, idx) => ({
          id: q.id || `ai_q_${idx + 1}`,
          text: q.text || 'Câu hỏi',
          options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ['A', 'B', 'C', 'D'],
          correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
          explanation: q.explanation || 'Không có giải thích',
          topic: topic,
        }));
      }
    } catch (err: any) {
      lastError = err;
      const category = parseApiError(err);
      if (category === 'MODEL_OVERLOADED') {
        continue;
      }
      // Nếu là lỗi Auth/Quota thì dừng lại không cần thử model khác
      if (category === 'INVALID_API_KEY' || category === 'QUOTA_EXCEEDED') {
        throw err;
      }
    }
  }

  throw lastError || new Error('Không thể kết nối đến máy chủ Gemini, vui lòng thử lại sau.');
}
