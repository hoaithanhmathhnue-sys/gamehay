import React, { useRef, useEffect, useState } from 'react';
import { Marble, TrackConfig, GameMode } from '../types/marble';

interface MarbleCanvasProps {
  marbles: Marble[];
  track: TrackConfig;
  gameMode: GameMode;
  onCanvasClick?: (x: number, y: number) => void;
  winnerCount: number;
}

export const MarbleCanvas: React.FC<MarbleCanvasProps> = ({
  marbles,
  track,
  gameMode,
  winnerCount
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [cameraY, setCameraY] = useState(0);

  // Cache ảnh đại diện để tránh lag khi render 60fps
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

  // Tải trước ảnh avatar vào cache
  useEffect(() => {
    marbles.forEach(m => {
      if (m.avatarUrl && !imageCacheRef.current.has(m.avatarUrl)) {
        const img = new Image();
        img.src = m.avatarUrl;
        img.onload = () => {
          imageCacheRef.current.set(m.avatarUrl!, img);
        };
        if (img.complete) {
          imageCacheRef.current.set(m.avatarUrl, img);
        }
      }
    });
  }, [marbles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let currentCamY = 0;

    const render = () => {
      // 1. Tính toán vị trí camera bám theo nhóm dẫn đầu
      const activeMarbles = marbles.filter(m => !m.finished);
      let targetY = 0;

      if (activeMarbles.length > 0) {
        // Tìm vị trí của viên bi đang dẫn đầu (Y lớn nhất)
        const leadingY = Math.max(...activeMarbles.map(m => m.y));
        // Đặt camera để viên bi dẫn đầu nằm ở khoảng 40% màn hình
        targetY = leadingY - canvas.height * 0.4;
      } else if (marbles.length > 0) {
        // Nếu tất cả đã về đích, đưa camera về vạch đích
        targetY = track.finishY - canvas.height * 0.6;
      }

      // Giới hạn camera trong đường đua
      const maxCamY = Math.max(0, track.height - canvas.height);
      targetY = Math.max(0, Math.min(maxCamY, targetY));

      // Di chuyển camera mượt mà (Lerp)
      currentCamY += (targetY - currentCamY) * 0.08;
      setCameraY(currentCamY);

      // Reset màn hình
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      // Áp dụng offset camera
      ctx.translate(0, -currentCamY);

      // ==========================================
      // A. VẼ NỀN ĐƯỜNG ĐUA & LƯỚI TỌA ĐỘ
      // ==========================================
      const bgGrad = ctx.createLinearGradient(0, 0, 0, track.height);
      bgGrad.addColorStop(0, '#090d16');
      bgGrad.addColorStop(0.5, '#0f172a');
      bgGrad.addColorStop(1, '#0b0f19');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, track.width, track.height);

      // Đường kẻ lưới neon trang trí
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.06)';
      ctx.lineWidth = 1;
      for (let x = 0; x < track.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, track.height);
        ctx.stroke();
      }
      for (let y = 0; y < track.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(track.width, y);
        ctx.stroke();
      }

      // Viền tường 2 bên đường đua
      const leftWallGrad = ctx.createLinearGradient(0, 0, 16, 0);
      leftWallGrad.addColorStop(0, '#6366F1');
      leftWallGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = leftWallGrad;
      ctx.fillRect(0, 0, 16, track.height);

      const rightWallGrad = ctx.createLinearGradient(track.width, 0, track.width - 16, 0);
      rightWallGrad.addColorStop(0, '#6366F1');
      rightWallGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = rightWallGrad;
      ctx.fillRect(track.width - 16, 0, 16, track.height);

      // ==========================================
      // B. VẼ VẠCH XUẤT PHÁT & VẠCH ĐÍCH
      // ==========================================
      // Vạch xuất phát (Start Gate)
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 4;
      ctx.setLineDash([12, 8]);
      ctx.beginPath();
      ctx.moveTo(30, track.spawnArea.y + track.spawnArea.height + 15);
      ctx.lineTo(track.width - 30, track.spawnArea.y + track.spawnArea.height + 15);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🟢 VẠCH XUẤT PHÁT — START GATE', track.width / 2, track.spawnArea.y + track.spawnArea.height + 34);

      // Vạch đích (Checkered Finish Line)
      const finishY = track.finishY;
      const checkerSize = 20;
      const rows = 2;
      const cols = Math.ceil(track.width / checkerSize);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          ctx.fillStyle = (r + c) % 2 === 0 ? '#FFFFFF' : '#111827';
          ctx.fillRect(c * checkerSize, finishY + r * checkerSize, checkerSize, checkerSize);
        }
      }

      // Dải ruy băng vạch đích
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(0, finishY - 6, track.width, 6);
      ctx.fillStyle = '#F59E0B';
      ctx.font = '900 18px "Be Vietnam Pro", sans-serif';
      ctx.fillText('🏆 VẠCH ĐÍCH — FINISH LINE 🏆', track.width / 2, finishY + 68);

      // ==========================================
      // C. VẼ CHƯỚNG NGẠI VẬT (OBSTACLES)
      // ==========================================
      for (const obs of track.obstacles) {
        if (obs.type === 'peg') {
          // Chốt tròn Plinko
          const r = obs.radius || 10;
          ctx.save();
          // Vòng sáng ngoài
          ctx.beginPath();
          ctx.arc(obs.x, obs.y, r + 4, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
          ctx.fill();

          // Thân chốt
          const pegGrad = ctx.createRadialGradient(obs.x - 3, obs.y - 3, 2, obs.x, obs.y, r);
          pegGrad.addColorStop(0, '#FFFFFF');
          pegGrad.addColorStop(0.5, obs.color || '#38BDF8');
          pegGrad.addColorStop(1, '#0284C7');
          ctx.beginPath();
          ctx.arc(obs.x, obs.y, r, 0, Math.PI * 2);
          ctx.fillStyle = pegGrad;
          ctx.fill();
          ctx.strokeStyle = '#E0F2FE';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.restore();
        } else if (obs.type === 'ramp') {
          // Máng trượt dốc
          const w = obs.width || 120;
          const a = obs.angle || 0;
          ctx.save();
          ctx.translate(obs.x, obs.y);
          ctx.rotate(a);

          // Đổ bóng máng
          ctx.fillStyle = 'rgba(0,0,0,0.4)';
          ctx.fillRect(-w / 2, 4, w, 12);

          // Thân máng
          const rampGrad = ctx.createLinearGradient(0, -6, 0, 6);
          rampGrad.addColorStop(0, '#FBBF24');
          rampGrad.addColorStop(0.5, obs.color || '#F59E0B');
          rampGrad.addColorStop(1, '#B45309');

          ctx.fillStyle = rampGrad;
          ctx.beginPath();
          ctx.roundRect(-w / 2, -6, w, 12, 6);
          ctx.fill();

          ctx.strokeStyle = '#FEF3C7';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        } else if (obs.type === 'spinner') {
          // Cánh quạt quay
          const curA = obs.currentAngle || 0;
          const r = obs.radius || 50;
          ctx.save();
          ctx.translate(obs.x, obs.y);
          ctx.rotate(curA);

          const bladeCount = 4;
          for (let b = 0; b < bladeCount; b++) {
            const rot = (b * Math.PI * 2) / bladeCount;
            ctx.save();
            ctx.rotate(rot);

            const bladeGrad = ctx.createLinearGradient(0, -5, r, 5);
            bladeGrad.addColorStop(0, '#34D399');
            bladeGrad.addColorStop(1, obs.color || '#10B981');
            ctx.fillStyle = bladeGrad;
            ctx.beginPath();
            ctx.roundRect(0, -5, r, 10, 4);
            ctx.fill();
            ctx.restore();
          }

          // Trục giữa
          ctx.beginPath();
          ctx.arc(0, 0, 10, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
          ctx.strokeStyle = '#059669';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        } else if (obs.type === 'bouncer') {
          // Đệm nảy lò xo
          const r = obs.radius || 20;
          ctx.save();
          ctx.beginPath();
          ctx.arc(obs.x, obs.y, r + 6, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(236, 72, 153, 0.25)';
          ctx.fill();

          const bouncerGrad = ctx.createRadialGradient(obs.x, obs.y, 2, obs.x, obs.y, r);
          bouncerGrad.addColorStop(0, '#F472B6');
          bouncerGrad.addColorStop(1, obs.color || '#DB2777');
          ctx.beginPath();
          ctx.arc(obs.x, obs.y, r, 0, Math.PI * 2);
          ctx.fillStyle = bouncerGrad;
          ctx.fill();
          ctx.strokeStyle = '#FDF2F8';
          ctx.lineWidth = 3;
          ctx.stroke();

          // Icon lò xo
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('⚡', obs.x, obs.y + 4);
          ctx.restore();
        } else if (obs.type === 'booster') {
          // Vùng tăng tốc (Chevron arrows)
          const bw = obs.width || 80;
          const bh = obs.height || 50;
          ctx.save();
          ctx.fillStyle = 'rgba(99, 102, 241, 0.15)';
          ctx.beginPath();
          ctx.roundRect(obs.x - bw / 2, obs.y - bh / 2, bw, bh, 8);
          ctx.fill();
          ctx.strokeStyle = '#6366F1';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Vẽ mũi tên chỉ xuống
          ctx.fillStyle = '#A5B4FC';
          ctx.font = 'bold 18px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('▼ ▼ ▼', obs.x, obs.y + 6);
          ctx.restore();
        }
      }

      // ==========================================
      // D. VẼ CÁC VIÊN BI & TÊN HỌC SINH
      // ==========================================
      for (const m of marbles) {
        ctx.save();

        // 1. Vẽ vệt sáng (Trail)
        if (m.trail.length > 1) {
          for (let t = 0; t < m.trail.length; t++) {
            const tr = m.trail[t];
            ctx.beginPath();
            ctx.arc(tr.x, tr.y, m.radius * (0.3 + 0.5 * (t / m.trail.length)), 0, Math.PI * 2);
            ctx.fillStyle = `${m.color}${Math.floor(tr.alpha * 255).toString(16).padStart(2, '0')}`;
            ctx.fill();
          }
        }

        // 2. Vẽ viên bi
        ctx.save();
        ctx.translate(m.x, m.y);
        ctx.rotate(m.angle);

        const img = m.avatarUrl ? imageCacheRef.current.get(m.avatarUrl) : null;

        if (img && img.complete) {
          // --- Chế độ ĐUA BẰNG ẢNH: Vẽ ảnh đại diện xoay theo bi ---
          ctx.beginPath();
          ctx.arc(0, 0, m.radius, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(img, -m.radius, -m.radius, m.radius * 2, m.radius * 2);

          // Viền kim loại nổi
          ctx.restore();
          ctx.save();
          ctx.translate(m.x, m.y);
          ctx.beginPath();
          ctx.arc(0, 0, m.radius, 0, Math.PI * 2);
          ctx.strokeStyle = m.color || '#FFFFFF';
          ctx.lineWidth = 3;
          ctx.stroke();
        } else {
          // --- Chế độ ĐUA CHO VUI: Vẽ quả cầu bi ve 3D nổi bật ---
          const sphereGrad = ctx.createRadialGradient(
            -m.radius * 0.35, -m.radius * 0.35, m.radius * 0.1,
            0, 0, m.radius
          );
          sphereGrad.addColorStop(0, '#FFFFFF');
          sphereGrad.addColorStop(0.3, m.color || '#6366F1');
          sphereGrad.addColorStop(0.85, m.color ? adjustColorBrightness(m.color, -30) : '#312E81');
          sphereGrad.addColorStop(1, '#000000');

          ctx.beginPath();
          ctx.arc(0, 0, m.radius, 0, Math.PI * 2);
          ctx.fillStyle = sphereGrad;
          ctx.fill();

          // Vòng sáng highlight trên bề mặt
          ctx.beginPath();
          ctx.arc(-m.radius * 0.35, -m.radius * 0.35, m.radius * 0.3, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.fill();

          // Số báo danh của bi
          ctx.fillStyle = '#FFFFFF';
          ctx.font = `bold ${Math.floor(m.radius * 0.8)}px "JetBrains Mono", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(m.number), 0, 0);
        }

        ctx.restore();

        // 3. Vẽ nhãn tên học sinh tiếng Việt (Name Tag Pill)
        const tagY = m.y - m.radius - 14;
        ctx.font = 'bold 11px "Be Vietnam Pro", sans-serif';
        const textWidth = ctx.measureText(m.name).width;
        const pillWidth = Math.max(textWidth + 14, 38);
        const pillHeight = 18;

        // Nền pill nhãn tên
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.beginPath();
        ctx.roundRect(m.x - pillWidth / 2, tagY - pillHeight / 2, pillWidth, pillHeight, 9);
        ctx.fill();

        // Viền theo màu bi
        ctx.strokeStyle = m.color || '#6366F1';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Chữ tên học sinh
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(m.name, m.x, tagY);

        // Hiển thị huy hiệu thứ hạng nếu đã về đích
        if (m.finished && m.rank) {
          const rankBadge = m.rank === 1 ? '🥇 1' : m.rank === 2 ? '🥈 2' : m.rank === 3 ? '🥉 3' : `#${m.rank}`;
          ctx.fillStyle = m.rank === 1 ? '#F59E0B' : m.rank === 2 ? '#94A3B8' : m.rank === 3 ? '#B45309' : '#6366F1';
          ctx.beginPath();
          ctx.roundRect(m.x - 18, m.y + m.radius + 3, 36, 16, 8);
          ctx.fill();
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 10px sans-serif';
          ctx.fillText(rankBadge, m.x, m.y + m.radius + 11);
        }

        ctx.restore();
      }

      ctx.restore();

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, [marbles, track, gameMode]);

  // Sắp xếp danh sách top đang dẫn đầu thời gian thực
  const sortedMarbles = [...marbles].sort((a, b) => {
    if (a.finished && b.finished) return (a.rank || 999) - (b.rank || 999);
    if (a.finished) return -1;
    if (b.finished) return 1;
    return b.y - a.y; // Y lớn nhất là đang dẫn đầu
  });

  return (
    <div ref={containerRef} className="relative w-full flex justify-center bg-slate-950 overflow-hidden select-none">
      {/* Canvas chính */}
      <canvas
        ref={canvasRef}
        width={track.width}
        height={760}
        className="block bg-slate-950 max-w-full shadow-2xl rounded-2xl border border-slate-800"
      />

      {/* Bảng xếp hạng dẫn đầu Real-time (Góc trên bên phải) */}
      <div className="absolute top-3 right-3 md:top-5 md:right-5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-2.5 shadow-xl max-w-[200px] w-full hidden sm:block">
        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
            <span>⚡</span> Top Dẫn Đầu
          </span>
          <span className="text-[10px] text-indigo-400 font-semibold">
            Top {winnerCount}
          </span>
        </div>

        <div className="space-y-1">
          {sortedMarbles.slice(0, 5).map((m, idx) => (
            <div
              key={m.id}
              className={`flex items-center justify-between px-2 py-1 rounded text-xs transition-colors ${
                m.finished
                  ? 'bg-emerald-950/60 text-emerald-200 border border-emerald-500/30 font-bold'
                  : idx === 0
                  ? 'bg-amber-950/40 text-amber-200 border border-amber-500/20'
                  : 'bg-slate-800/40 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-extrabold text-[11px] w-4 text-center">
                  {m.finished && m.rank ? (m.rank === 1 ? '🥇' : m.rank === 2 ? '🥈' : m.rank === 3 ? '🥉' : `#${m.rank}`) : `#${idx + 1}`}
                </span>
                <span className="truncate max-w-[90px]">{m.name}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {m.finished ? 'VỀ ĐÍCH' : `${Math.floor((m.y / track.finishY) * 100)}%`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper làm tối/sáng màu hex
function adjustColorBrightness(hex: string, percent: number): string {
  let num = parseInt(hex.replace('#', ''), 16);
  if (isNaN(num)) return '#333333';
  let r = (num >> 16) + Math.round(255 * (percent / 100));
  let g = ((num >> 8) & 0x00FF) + Math.round(255 * (percent / 100));
  let b = (num & 0x0000FF) + Math.round(255 * (percent / 100));
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
