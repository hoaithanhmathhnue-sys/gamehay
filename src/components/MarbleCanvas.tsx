import React, { useRef, useEffect, useState } from 'react';
import { Marble, TrackConfig, GameMode, RaceState } from '../types/marble';
import { Eye, Flag, ArrowUp } from 'lucide-react';

interface MarbleCanvasProps {
  marbles: Marble[];
  track: TrackConfig;
  gameMode: GameMode;
  winnerCount: number;
  raceStatus?: RaceState['status'];
}

export const MarbleCanvas: React.FC<MarbleCanvasProps> = ({
  marbles,
  track,
  gameMode,
  winnerCount,
  raceStatus = 'ready'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Vị trí camera lưu trong useRef để không bị reset khi component re-render
  const cameraYRef = useRef<number>(0);
  const marblesRef = useRef<Marble[]>(marbles);
  marblesRef.current = marbles;

  // Chế độ camera: 'auto' (bám bi dẫn đầu), 'top' (vạch xuất phát), 'finish' (vạch đích)
  const [cameraMode, setCameraMode] = useState<'auto' | 'top' | 'finish'>('auto');

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

  // Khi bắt đầu hoặc đặt lại cuộc đua, đưa camera về vạch xuất phát
  useEffect(() => {
    if (raceStatus === 'ready' || raceStatus === 'countdown') {
      cameraYRef.current = 0;
      setCameraMode('auto');
    }
  }, [raceStatus]);

  // Vòng lặp Render 60fps liên tục, tính toán camera theo thời gian thực
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      const currentMarbles = marblesRef.current;
      const canvasH = canvas.height;
      const trackH = track.height;
      const maxCamY = Math.max(0, trackH - canvasH + 20);

      // ==========================================
      // 1. TÍNH TOÁN VỊ TRÍ CAMERA BÁM THEO BI
      // ==========================================
      let targetCamY = 0;

      if (cameraMode === 'top') {
        targetCamY = 0;
      } else if (cameraMode === 'finish') {
        targetCamY = Math.max(0, track.finishY - canvasH * 0.6);
      } else {
        // Chế độ 'auto': bám theo viên bi dẫn đầu
        const activeMarbles = currentMarbles.filter(m => !m.finished);
        const finishedMarbles = currentMarbles.filter(m => m.finished);

        if (activeMarbles.length > 0) {
          // Lấy vị trí Y lớn nhất trong các bi còn đang lăn
          const leadingY = Math.max(...activeMarbles.map(m => m.y));
          // Giữ viên bi dẫn đầu ở khoảng 38% - 42% chiều cao canvas
          targetCamY = leadingY - canvasH * 0.4;
        } else if (finishedMarbles.length > 0) {
          // Khi tất cả đã về đích, chuyển camera nhẹ nhàng về vạch đích
          targetCamY = track.finishY - canvasH * 0.55;
        } else {
          targetCamY = 0;
        }
      }

      // Giới hạn camera trong phạm vi đường đua
      targetCamY = Math.max(0, Math.min(maxCamY, targetCamY));

      // Di chuyển camera mượt mà (Lerp) không bị khựng
      const lerpSpeed = 0.1;
      cameraYRef.current += (targetCamY - cameraYRef.current) * lerpSpeed;
      const currentCamY = cameraYRef.current;

      // Xóa toàn màn hình
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      // Áp dụng biến đổi camera theo trục Y
      ctx.translate(0, -currentCamY);

      // ==========================================
      // A. VẼ NỀN ĐƯỜNG ĐUA & LƯỚI TỌA ĐỘ
      // ==========================================
      const bgGrad = ctx.createLinearGradient(0, 0, 0, trackH);
      bgGrad.addColorStop(0, '#090d16');
      bgGrad.addColorStop(0.3, '#0f172a');
      bgGrad.addColorStop(0.7, '#111827');
      bgGrad.addColorStop(1, '#090d16');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, track.width, trackH);

      // Đường kẻ lưới neon trang trí
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < track.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, trackH);
        ctx.stroke();
      }
      for (let y = 0; y < trackH; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(track.width, y);
        ctx.stroke();
      }

      // Các mốc khoảng cách dọc đường đua (25%, 50%, 75%)
      const markers = [
        { y: 450, text: '🏁 25% ĐƯỜNG ĐUA' },
        { y: 900, text: '⚡ 50% NỬA CHẶNG ĐƯỜNG' },
        { y: 1350, text: '🔥 75% TĂNG TỐC VỀ ĐÍCH' }
      ];
      ctx.font = 'bold 11px "JetBrains Mono", sans-serif';
      ctx.textAlign = 'right';
      for (const marker of markers) {
        ctx.fillStyle = 'rgba(148, 163, 184, 0.25)';
        ctx.fillText(marker.text, track.width - 25, marker.y);
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(30, marker.y);
        ctx.lineTo(track.width - 30, marker.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Viền tường 2 bên đường đua
      const leftWallGrad = ctx.createLinearGradient(0, 0, 16, 0);
      leftWallGrad.addColorStop(0, '#6366F1');
      leftWallGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = leftWallGrad;
      ctx.fillRect(0, 0, 16, trackH);

      const rightWallGrad = ctx.createLinearGradient(track.width, 0, track.width - 16, 0);
      rightWallGrad.addColorStop(0, '#6366F1');
      rightWallGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = rightWallGrad;
      ctx.fillRect(track.width - 16, 0, 16, trackH);

      // ==========================================
      // B. VẼ VẠCH XUẤT PHÁT & VẠCH ĐÍCH
      // ==========================================
      // Vạch xuất phát
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
          ctx.beginPath();
          ctx.arc(obs.x, obs.y, r + 4, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
          ctx.fill();

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

          ctx.fillStyle = 'rgba(0,0,0,0.4)';
          ctx.fillRect(-w / 2, 4, w, 12);

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

          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('⚡', obs.x, obs.y + 4);
          ctx.restore();
        } else if (obs.type === 'booster') {
          // Vùng tăng tốc
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
      for (const m of currentMarbles) {
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
          // Vẽ avatar xoay lăn theo bi
          ctx.beginPath();
          ctx.arc(0, 0, m.radius, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(img, -m.radius, -m.radius, m.radius * 2, m.radius * 2);

          ctx.restore();
          ctx.save();
          ctx.translate(m.x, m.y);
          ctx.beginPath();
          ctx.arc(0, 0, m.radius, 0, Math.PI * 2);
          ctx.strokeStyle = m.color || '#FFFFFF';
          ctx.lineWidth = 3;
          ctx.stroke();
        } else {
          // Bi ve 3D nổi bật
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

          ctx.beginPath();
          ctx.arc(-m.radius * 0.35, -m.radius * 0.35, m.radius * 0.3, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.fill();

          ctx.fillStyle = '#FFFFFF';
          ctx.font = `bold ${Math.floor(m.radius * 0.8)}px "JetBrains Mono", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(m.number), 0, 0);
        }

        ctx.restore();

        // 3. Nhãn tên học sinh tiếng Việt
        const tagY = m.y - m.radius - 14;
        ctx.font = 'bold 11px "Be Vietnam Pro", sans-serif';
        const textWidth = ctx.measureText(m.name).width;
        const pillWidth = Math.max(textWidth + 14, 38);
        const pillHeight = 18;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.beginPath();
        ctx.roundRect(m.x - pillWidth / 2, tagY - pillHeight / 2, pillWidth, pillHeight, 9);
        ctx.fill();

        ctx.strokeStyle = m.color || '#6366F1';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(m.name, m.x, tagY);

        // Thứ hạng nếu đã về đích
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

      ctx.restore(); // Khôi phục translate camera

      // ==========================================
      // E. VẼ THANH TIẾN ĐỘ THU NHỎ (MINI-MAP) Ở GÓC TRÁI
      // ==========================================
      const mapX = 18;
      const mapY = 18;
      const mapW = 20;
      const mapH = canvasH - 36;
      const scaleY = mapH / trackH;

      ctx.save();
      // Nền Mini-map
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.beginPath();
      ctx.roundRect(mapX, mapY, mapW, mapH, 10);
      ctx.fill();
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Vạch xuất phát trên mini-map
      ctx.fillStyle = '#38BDF8';
      ctx.fillRect(mapX + 2, mapY + 6, mapW - 4, 3);

      // Vạch đích trên mini-map
      const mapFinishY = mapY + track.finishY * scaleY;
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(mapX + 2, mapFinishY, mapW - 4, 3);

      // Vẽ vị trí các viên bi trên mini-map
      for (const m of currentMarbles) {
        const dotY = mapY + m.y * scaleY;
        ctx.beginPath();
        ctx.arc(mapX + mapW / 2, Math.min(mapY + mapH - 5, Math.max(mapY + 5, dotY)), 3.5, 0, Math.PI * 2);
        ctx.fillStyle = m.color || '#38BDF8';
        ctx.fill();
      }

      // Khung chữ nhật hiển thị tầm nhìn Camera hiện tại trên mini-map
      const viewY = mapY + currentCamY * scaleY;
      const viewH = canvasH * scaleY;
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(mapX - 2, viewY, mapW + 4, viewH, 4);
      ctx.stroke();

      ctx.restore();

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, [track, gameMode, cameraMode]);

  // Sắp xếp danh sách top đang dẫn đầu thời gian thực
  const sortedMarbles = [...marbles].sort((a, b) => {
    if (a.finished && b.finished) return (a.rank || 999) - (b.rank || 999);
    if (a.finished) return -1;
    if (b.finished) return 1;
    return b.y - a.y; // Y lớn nhất là đang dẫn đầu
  });

  return (
    <div ref={containerRef} className="relative w-full flex flex-col items-center select-none">
      {/* Thanh điều khiển góc nhìn Camera */}
      <div className="w-full flex items-center justify-between px-3 py-1.5 mb-2 bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
          <Eye className="w-3.5 h-3.5 text-indigo-400" />
          <span>Góc nhìn Camera:</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCameraMode('auto')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all ${
              cameraMode === 'auto'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span>Tự Động Bám Đuôi</span>
          </button>

          <button
            onClick={() => setCameraMode('top')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all ${
              cameraMode === 'top'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowUp className="w-3 h-3" />
            <span>Vạch Xuất Phát</span>
          </button>

          <button
            onClick={() => setCameraMode('finish')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all ${
              cameraMode === 'finish'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flag className="w-3 h-3" />
            <span>Vạch Đích</span>
          </button>
        </div>
      </div>

      {/* Canvas chính */}
      <div className="relative w-full flex justify-center bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
        <canvas
          ref={canvasRef}
          width={track.width}
          height={760}
          className="block bg-slate-950 max-w-full"
        />

        {/* Bảng xếp hạng dẫn đầu Real-time (Góc trên bên phải) */}
        <div className="absolute top-3 right-3 md:top-4 md:right-4 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-2.5 shadow-xl max-w-[190px] w-full hidden sm:block">
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
                  <span className="truncate max-w-[85px]">{m.name}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {m.finished ? 'ĐÍCH' : `${Math.floor((m.y / track.finishY) * 100)}%`}
                </span>
              </div>
            ))}
          </div>
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
