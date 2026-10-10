import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ShieldCheck, Sparkles, School, GraduationCap, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { verifyTeacherCredentials, saveTeacherSession } from '../utils/auth';
import { sound } from '../utils/audio';

interface LoginScreenProps {
  onLoginSuccess: (teacherName: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || isSuccess) return;

    if (!username.trim()) {
      setErrorMessage('Vui lòng nhập tên tài khoản.');
      sound.playWrong();
      triggerShake();
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Vui lòng nhập mật khẩu.');
      sound.playWrong();
      triggerShake();
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      // Xác thực bảo mật thông qua mã băm SHA-256 (không lộ dữ liệu gốc)
      const isValid = await verifyTeacherCredentials(username, password);

      if (isValid) {
        setIsSuccess(true);
        sound.playFinishChime();
        saveTeacherSession(username.trim(), rememberMe);

        setTimeout(() => {
          onLoginSuccess(username.trim());
        }, 800);
      } else {
        sound.playWrong();
        setErrorMessage('Tài khoản hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!');
        triggerShake();
        setIsLoading(false);
      }
    } catch {
      setErrorMessage('Đã xảy ra lỗi trong quá trình xác thực. Vui lòng thử lại!');
      setIsLoading(false);
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-slate-950 overflow-hidden font-sans select-none">
      {/* Dynamic Background Glow Orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-amber-500/15 rounded-full blur-[128px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Decorative Grid Pattern */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0f_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0f_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" 
      />

      {/* Main Login Card */}
      <div 
        className={`relative w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/80 transition-all duration-300 ${
          shake ? 'animate-shake' : ''
        }`}
      >
        {/* Top Header Badge */}
        <div className="flex flex-col items-center text-center">
          {/* Logo & School Badge */}
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-400 p-0.5 shadow-xl shadow-indigo-500/25 flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center overflow-hidden">
                <img
                  src="/logo.jpg"
                  alt="Trường THPT Hoàng Diệu"
                  className="w-14 h-14 object-contain"
                  onError={(e) => {
                    // Fallback sang emoji cờ đích
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span className="text-3xl">🏁</span>
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 p-1 bg-amber-500 rounded-full text-slate-950 shadow-md">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>HỆ THỐNG ĐUA BI LỚP HỌC PRO</span>
          </div>

          <h1 className="text-2xl font-black text-white tracking-tight">
            Đăng Nhập Giảng Dạy
          </h1>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <School className="w-3.5 h-3.5 text-indigo-400" />
            <span>Trường THPT Hoàng Diệu • Xác thực giáo viên</span>
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mt-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Success Alert Box */}
        {isSuccess && (
          <div className="mt-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 animate-bounce" />
            <span className="font-semibold">Đăng nhập thành công! Đang chuyển hướng vào lớp học...</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Tên tài khoản */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Tên tài khoản / Họ tên
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên tài khoản..."
                autoComplete="off"
                disabled={isLoading || isSuccess}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Mật khẩu */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Mật khẩu bảo mật
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                autoComplete="current-password"
                disabled={isLoading || isSuccess}
                className="w-full pl-10 pr-11 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Ghi nhớ đăng nhập */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300 hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
              />
              <span>Ghi nhớ đăng nhập</span>
            </label>

            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              Bảo mật SHA-256
            </span>
          </div>

          {/* Nút Đăng nhập */}
          <button
            type="submit"
            disabled={isLoading || isSuccess}
            className={`w-full py-3 px-4 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all duration-200 active:scale-[0.98] ${
              isSuccess
                ? 'bg-emerald-600 shadow-emerald-500/30'
                : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-amber-500 hover:from-indigo-500 hover:to-amber-400 shadow-indigo-500/30 hover:shadow-indigo-500/40'
            } disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Đã Xác Thực</span>
              </>
            ) : (
              <>
                <span>Vào Ứng Dụng Đua Bi</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Chân trang Modal */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Phần mềm đổi mới phương pháp giảng dạy & tạo không khí học tập sôi nổi
          </p>
        </div>
      </div>
    </div>
  );
};
