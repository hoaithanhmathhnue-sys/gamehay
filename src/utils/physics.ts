// Core Physics Engine cho Đua Bi (Canvas 2D)
// Mô phỏng đàn hồi chân thực: Va chạm Bi-Bi, Bi-Chốt, Bi-Máng, Bi-Cánh quạt

import { Marble, Obstacle, TrackConfig } from '../types/marble';
import { sound } from './audio';

// Helper tính khoảng cách điểm đến đoạn thẳng (cho Ramp/Máng)
function distToSegment(
  px: number, py: number,
  x1: number, y1: number,
  x2: number, y2: number
): { distance: number; closestX: number; closestY: number } {
  const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  if (l2 === 0) return { distance: Math.hypot(px - x1, py - y1), closestX: x1, closestY: y1 };
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  const closestX = x1 + t * (x2 - x1);
  const closestY = y1 + t * (y2 - y1);
  return { distance: Math.hypot(px - closestX, py - closestY), closestX, closestY };
}

export function updatePhysics(
  marbles: Marble[],
  track: TrackConfig,
  onFinishMarble: (marble: Marble) => void
) {
  const { gravity, friction, restitution, obstacles, width, finishY } = track;

  // 1. Cập nhật vị trí và lực cơ bản cho từng viên bi
  for (let i = 0; i < marbles.length; i++) {
    const m = marbles[i];
    if (m.finished) continue;

    // Trọng lực & ma sát
    m.vy += gravity;
    m.vx *= (1 - friction);
    m.vy *= (1 - friction);

    // Di chuyển
    m.x += m.vx;
    m.y += m.vy;

    // Góc xoay theo vận tốc di chuyển
    m.angle += m.vx / m.radius;

    // Cập nhật vệt sáng (trail)
    if (Math.hypot(m.vx, m.vy) > 1.5) {
      m.trail.push({ x: m.x, y: m.y, alpha: 0.6 });
    }
    for (let t = m.trail.length - 1; t >= 0; t--) {
      m.trail[t].alpha -= 0.05;
      if (m.trail[t].alpha <= 0) m.trail.splice(t, 1);
    }
    if (m.trail.length > 8) m.trail.shift();

    // Giới hạn tường trái & tường phải
    const wallMargin = m.radius + 6;
    if (m.x < wallMargin) {
      m.x = wallMargin;
      m.vx = -m.vx * restitution;
      sound.playMarbleClack(0.2);
    } else if (m.x > width - wallMargin) {
      m.x = width - wallMargin;
      m.vx = -m.vx * restitution;
      sound.playMarbleClack(0.2);
    }

    // Kiểm tra vạch đích
    if (m.y >= finishY) {
      m.finished = true;
      m.finishTime = Date.now();
      m.vy *= 0.2; // giảm tốc khi qua vạch
      sound.playFinishChime();
      onFinishMarble(m);
    }
  }

  // 2. Va chạm giữa các viên bi với nhau (Marble-Marble Elastic Collision)
  for (let i = 0; i < marbles.length; i++) {
    const m1 = marbles[i];
    if (m1.finished) continue;

    for (let j = i + 1; j < marbles.length; j++) {
      const m2 = marbles[j];
      if (m2.finished) continue;

      const dx = m2.x - m1.x;
      const dy = m2.y - m1.y;
      const dist = Math.hypot(dx, dy);
      const minDist = m1.radius + m2.radius;

      if (dist < minDist && dist > 0) {
        // Tách 2 bi ra để tránh dính nhau
        const overlap = (minDist - dist) / 2;
        const nx = dx / dist;
        const ny = dy / dist;

        m1.x -= nx * overlap;
        m1.y -= ny * overlap;
        m2.x += nx * overlap;
        m2.y += ny * overlap;

        // Vận tốc tương đối dọc theo pháp tuyến
        const kx = m1.vx - m2.vx;
        const ky = m1.vy - m2.vy;
        const p = 2 * (nx * kx + ny * ky) / (m1.mass + m2.mass);

        const impulse = p * restitution;
        m1.vx -= impulse * m2.mass * nx;
        m1.vy -= impulse * m2.mass * ny;
        m2.vx += impulse * m1.mass * nx;
        m2.vy += impulse * m1.mass * ny;

        const relSpeed = Math.hypot(kx, ky);
        if (relSpeed > 1) {
          sound.playMarbleClack(Math.min(1, relSpeed / 8));
        }
      }
    }
  }

  // 3. Va chạm với chướng ngại vật trên đường đua
  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];

    // Cập nhật chuyển động xoay cho Spinner
    if (obs.type === 'spinner' && obs.rotationSpeed) {
      obs.currentAngle = (obs.currentAngle || 0) + obs.rotationSpeed;
    }

    for (let j = 0; j < marbles.length; j++) {
      const m = marbles[j];
      if (m.finished) continue;

      if (obs.type === 'peg') {
        // Chốt tròn Plinko
        const rPeg = obs.radius || 10;
        const dx = m.x - obs.x;
        const dy = m.y - obs.y;
        const dist = Math.hypot(dx, dy);
        const minDist = m.radius + rPeg;

        if (dist < minDist && dist > 0) {
          const nx = dx / dist;
          const ny = dy / dist;
          m.x = obs.x + nx * minDist;
          m.y = obs.y + ny * minDist;

          // Phản xạ vận tốc
          const dot = m.vx * nx + m.vy * ny;
          if (dot < 0) {
            m.vx = (m.vx - 2 * dot * nx) * (obs.restitution || restitution);
            m.vy = (m.vy - 2 * dot * ny) * (obs.restitution || restitution);
            // Thêm chút ngẫu nhiên để bi không rơi đối xứng
            m.vx += (Math.random() - 0.5) * 1.5;
            sound.playMarbleClack(0.4);
          }
        }
      } else if (obs.type === 'bouncer') {
        // Đệm nảy Bouncer (bật lò xo mạnh)
        const rBouncer = obs.radius || 18;
        const dx = m.x - obs.x;
        const dy = m.y - obs.y;
        const dist = Math.hypot(dx, dy);
        const minDist = m.radius + rBouncer;

        if (dist < minDist && dist > 0) {
          const nx = dx / dist;
          const ny = dy / dist;
          m.x = obs.x + nx * minDist;
          m.y = obs.y + ny * minDist;

          // Bật ngược với lực đẩy lớn
          m.vx = nx * 14 + (Math.random() - 0.5) * 4;
          m.vy = ny * 14 - 3;
          sound.playBoing();
        }
      } else if (obs.type === 'booster') {
        // Vùng tăng tốc (Booster Zone)
        const bw = obs.width || 80;
        const bh = obs.height || 50;
        if (
          m.x >= obs.x - bw / 2 &&
          m.x <= obs.x + bw / 2 &&
          m.y >= obs.y - bh / 2 &&
          m.y <= obs.y + bh / 2
        ) {
          if (!m.boostCooldown || Date.now() - m.boostCooldown > 800) {
            m.vy += 12; // Phóng tốc độ xuống
            m.boostCooldown = Date.now();
            sound.playBoost();
          }
        }
      } else if (obs.type === 'ramp') {
        // Máng nghiêng (Ramp)
        const w = obs.width || 120;
        const angle = obs.angle || 0;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);

        const x1 = obs.x - (w / 2) * cosA;
        const y1 = obs.y - (w / 2) * sinA;
        const x2 = obs.x + (w / 2) * cosA;
        const y2 = obs.y + (w / 2) * sinA;

        const { distance, closestX, closestY } = distToSegment(m.x, m.y, x1, y1, x2, y2);
        if (distance < m.radius + 3) {
          const dx = m.x - closestX;
          const dy = m.y - closestY;
          const len = Math.hypot(dx, dy) || 1;
          const nx = dx / len;
          const ny = dy / len;

          m.x = closestX + nx * (m.radius + 3);
          m.y = closestY + ny * (m.radius + 3);

          const dot = m.vx * nx + m.vy * ny;
          if (dot < 0) {
            m.vx = (m.vx - 1.8 * dot * nx) * 0.85;
            m.vy = (m.vy - 1.8 * dot * ny) * 0.85;
            // Cho bi trượt dọc theo máng
            const tangentX = -sinA;
            const tangentY = cosA;
            m.vx += tangentX * 0.8;
            m.vy += tangentY * 0.8;
            sound.playMarbleClack(0.25);
          }
        }
      } else if (obs.type === 'spinner') {
        // Cánh quạt quay (Spinner)
        const curAngle = obs.currentAngle || 0;
        const bladeCount = 4;
        const bladeLength = obs.radius || 45;

        for (let b = 0; b < bladeCount; b++) {
          const a = curAngle + (b * Math.PI * 2) / bladeCount;
          const x2 = obs.x + Math.cos(a) * bladeLength;
          const y2 = obs.y + Math.sin(a) * bladeLength;

          const { distance, closestX, closestY } = distToSegment(m.x, m.y, obs.x, obs.y, x2, y2);
          if (distance < m.radius + 4) {
            const dx = m.x - closestX;
            const dy = m.y - closestY;
            const len = Math.hypot(dx, dy) || 1;
            const nx = dx / len;
            const ny = dy / len;

            m.x = closestX + nx * (m.radius + 4);
            m.y = closestY + ny * (m.radius + 4);

            // Cánh quạt đập vào bi thêm lực tiếp tuyến
            const rotSpeed = obs.rotationSpeed || 0.05;
            const bladeVx = -Math.sin(a) * rotSpeed * bladeLength * 1.5;
            const bladeVy = Math.cos(a) * rotSpeed * bladeLength * 1.5;

            m.vx = bladeVx * 1.2 + nx * 5;
            m.vy = bladeVy * 1.2 + ny * 5;
            sound.playMarbleClack(0.5);
          }
        }
      }
    }
  }
}

// 3 Bản đồ đường đua mặc định siêu hấp dẫn
export const DEFAULT_TRACKS: TrackConfig[] = [
  {
    id: 'classic-pegs',
    name: 'Trường Đua Cổ Điển',
    description: 'Bàn đinh zíc zắc Plinko, máng trượt so le và phễu hẹp về đích',
    icon: '🎯',
    width: 800,
    height: 1800,
    gravity: 0.28,
    restitution: 0.65,
    friction: 0.008,
    spawnArea: { x: 100, y: 40, width: 600, height: 120 },
    finishY: 1700,
    obstacles: [
      // Hàng đinh Plinko zíc zắc trên cao (y: 200 -> 550)
      ...Array.from({ length: 7 }).flatMap((_, row) => {
        const count = row % 2 === 0 ? 8 : 7;
        const startX = row % 2 === 0 ? 110 : 155;
        const spacingX = 90;
        return Array.from({ length: count }).map((__, col) => ({
          id: `peg_${row}_${col}`,
          type: 'peg' as const,
          x: startX + col * spacingX,
          y: 200 + row * 55,
          radius: 8,
          restitution: 0.75,
          color: '#38BDF8',
        }));
      }),

      // Máng dốc trượt uốn lượn so le (y: 620 -> 1050)
      { id: 'ramp_1', type: 'ramp', x: 260, y: 650, width: 340, angle: 0.22, color: '#F59E0B' },
      { id: 'ramp_2', type: 'ramp', x: 540, y: 780, width: 340, angle: -0.22, color: '#F59E0B' },
      { id: 'ramp_3', type: 'ramp', x: 260, y: 920, width: 340, angle: 0.22, color: '#F59E0B' },
      { id: 'ramp_4', type: 'ramp', x: 540, y: 1060, width: 340, angle: -0.22, color: '#F59E0B' },

      // Đệm nảy ở góc
      { id: 'bouncer_left', type: 'bouncer', x: 80, y: 760, radius: 22, color: '#EC4899' },
      { id: 'bouncer_right', type: 'bouncer', x: 720, y: 900, radius: 22, color: '#EC4899' },

      // Cánh quạt xoay ở giữa (y: 1220)
      { id: 'spinner_1', type: 'spinner', x: 260, y: 1220, radius: 55, rotationSpeed: 0.045, color: '#10B981' },
      { id: 'spinner_2', type: 'spinner', x: 540, y: 1220, radius: 55, rotationSpeed: -0.045, color: '#10B981' },
      
      // Đệm nảy Neon lò xo ở tâm giữa 2 cánh quạt và 2 bên sườn tường
      { id: 'bouncer_mid_spinners', type: 'bouncer', x: 400, y: 1220, radius: 24, color: '#F43F5E' },
      { id: 'bouncer_wall_left', type: 'bouncer', x: 60, y: 1220, radius: 24, color: '#EC4899' },
      { id: 'bouncer_wall_right', type: 'bouncer', x: 740, y: 1220, radius: 24, color: '#EC4899' },

      // Cánh quạt mini xoay tốc độ cao ở trung tâm tầng dưới (y: 1320)
      { id: 'spinner_center_fast', type: 'spinner', x: 400, y: 1325, radius: 46, rotationSpeed: 0.07, color: '#06B6D4' },

      // Bẫy máng nghiêng phân làn so le trái - phải (y: 1320)
      { id: 'deflector_left', type: 'ramp', x: 190, y: 1325, width: 150, angle: 0.32, color: '#F59E0B' },
      { id: 'deflector_right', type: 'ramp', x: 610, y: 1325, width: 150, angle: -0.32, color: '#F59E0B' },

      // Hai đường hầm gia tốc Nitro đôi ở 2 bên làn (y: 1410)
      { id: 'booster_left', type: 'booster', x: 180, y: 1415, width: 90, height: 50, color: '#6366F1' },
      { id: 'booster_right', type: 'booster', x: 620, y: 1415, width: 90, height: 50, color: '#6366F1' },

      // Ma trận 7 chốt đinh Plinko phát sáng hình kim cương ở trung tâm (y: 1390 -> 1470)
      { id: 'peg_diamond_1', type: 'peg', x: 350, y: 1390, radius: 9, color: '#38BDF8', restitution: 0.8 },
      { id: 'peg_diamond_2', type: 'peg', x: 450, y: 1390, radius: 9, color: '#38BDF8', restitution: 0.8 },
      { id: 'peg_diamond_3', type: 'peg', x: 300, y: 1430, radius: 9, color: '#F472B6', restitution: 0.8 },
      { id: 'peg_diamond_mid', type: 'peg', x: 400, y: 1430, radius: 11, color: '#F59E0B', restitution: 0.85 },
      { id: 'peg_diamond_4', type: 'peg', x: 500, y: 1430, radius: 9, color: '#F472B6', restitution: 0.8 },
      { id: 'peg_diamond_5', type: 'peg', x: 350, y: 1470, radius: 9, color: '#38BDF8', restitution: 0.8 },
      { id: 'peg_diamond_6', type: 'peg', x: 450, y: 1470, radius: 9, color: '#38BDF8', restitution: 0.8 },

      // Đệm nảy lò xo bảo vệ 2 đầu phễu gom bi (y: 1510)
      { id: 'bouncer_funnel_l', type: 'bouncer', x: 100, y: 1500, radius: 22, color: '#10B981' },
      { id: 'bouncer_funnel_r', type: 'bouncer', x: 700, y: 1500, radius: 22, color: '#10B981' },

      // Hàng máng gom về phễu hẹp trước vạch đích (y: 1540)
      { id: 'funnel_left', type: 'ramp', x: 220, y: 1540, width: 300, angle: 0.5, color: '#8B5CF6' },
      { id: 'funnel_right', type: 'ramp', x: 580, y: 1540, width: 300, angle: -0.5, color: '#8B5CF6' },

      // Chốt chẻ đôi dòng bi (Splitter Peg) ngay cổ chai phễu đích (y: 1610)
      { id: 'splitter_peg', type: 'peg', x: 400, y: 1610, radius: 12, color: '#EF4444', restitution: 0.9 },
    ]
  },
  {
    id: 'speed-spinners',
    name: 'Vòng Xoáy Gia Tốc',
    description: 'Nhiều quạt xoay ma trận, đệm nhún phóng cao và bệ tăng tốc',
    icon: '⚡',
    width: 800,
    height: 1800,
    gravity: 0.32,
    restitution: 0.72,
    friction: 0.007,
    spawnArea: { x: 120, y: 40, width: 560, height: 120 },
    finishY: 1700,
    obstacles: [
      // 3 Cánh quạt quay tầng 1
      { id: 'sp_1', type: 'spinner', x: 200, y: 280, radius: 60, rotationSpeed: 0.06, color: '#06B6D4' },
      { id: 'sp_2', type: 'spinner', x: 400, y: 280, radius: 60, rotationSpeed: -0.06, color: '#06B6D4' },
      { id: 'sp_3', type: 'spinner', x: 600, y: 280, radius: 60, rotationSpeed: 0.06, color: '#06B6D4' },

      // Đệm nảy phản hồi
      { id: 'bn_1', type: 'bouncer', x: 140, y: 450, radius: 26, color: '#F43F5E' },
      { id: 'bn_2', type: 'bouncer', x: 660, y: 450, radius: 26, color: '#F43F5E' },
      { id: 'bn_mid', type: 'bouncer', x: 400, y: 550, radius: 30, color: '#E11D48' },

      // Booster tăng tốc đôi
      { id: 'bst_1', type: 'booster', x: 250, y: 680, width: 100, height: 60, color: '#8B5CF6' },
      { id: 'bst_2', type: 'booster', x: 550, y: 680, width: 100, height: 60, color: '#8B5CF6' },

      // Máng chữ X đan chéo
      { id: 'x_ramp1', type: 'ramp', x: 300, y: 880, width: 280, angle: 0.35, color: '#F59E0B' },
      { id: 'x_ramp2', type: 'ramp', x: 500, y: 880, width: 280, angle: -0.35, color: '#F59E0B' },

      // Tầng quạt kép quay ngược chiều
      { id: 'sp_big1', type: 'spinner', x: 280, y: 1120, radius: 75, rotationSpeed: -0.05, color: '#10B981' },
      { id: 'sp_big2', type: 'spinner', x: 520, y: 1120, radius: 75, rotationSpeed: 0.05, color: '#10B981' },

      // Chốt đinh tổ ong tầng dưới (y: 1300 -> 1500)
      ...Array.from({ length: 4 }).flatMap((_, row) => {
        const count = 6;
        return Array.from({ length: count }).map((__, col) => ({
          id: `sp_peg_${row}_${col}`,
          type: 'peg' as const,
          x: 180 + col * 90 + (row % 2) * 45,
          y: 1300 + row * 60,
          radius: 10,
          color: '#38BDF8',
        }));
      }),

      // Cổng về đích
      { id: 'fin_left', type: 'ramp', x: 200, y: 1600, width: 260, angle: 0.45, color: '#6366F1' },
      { id: 'fin_right', type: 'ramp', x: 600, y: 1600, width: 260, angle: -0.45, color: '#6366F1' },
    ]
  },
  {
    id: 'cascade-drop',
    name: 'Thác Bi Thử Thách',
    description: 'Độ dốc cao, phân nhánh bất ngờ và cổng thu hẹp kịch tính',
    icon: '🏔️',
    width: 800,
    height: 1800,
    gravity: 0.35,
    restitution: 0.60,
    friction: 0.009,
    spawnArea: { x: 150, y: 40, width: 500, height: 100 },
    finishY: 1700,
    obstacles: [
      // 5 tầng máng bậc thang dốc
      { id: 'casc_1', type: 'ramp', x: 300, y: 220, width: 380, angle: 0.28, color: '#3B82F6' },
      { id: 'casc_2', type: 'ramp', x: 500, y: 380, width: 380, angle: -0.28, color: '#3B82F6' },
      { id: 'casc_3', type: 'ramp', x: 300, y: 540, width: 380, angle: 0.28, color: '#3B82F6' },
      { id: 'casc_4', type: 'ramp', x: 500, y: 700, width: 380, angle: -0.28, color: '#3B82F6' },
      { id: 'casc_5', type: 'ramp', x: 300, y: 860, width: 380, angle: 0.28, color: '#3B82F6' },

      // Đệm nảy các góc đổi hướng
      { id: 'casc_bn1', type: 'bouncer', x: 710, y: 350, radius: 24, color: '#EC4899' },
      { id: 'casc_bn2', type: 'bouncer', x: 90, y: 670, radius: 24, color: '#EC4899' },
      { id: 'casc_bn3', type: 'bouncer', x: 710, y: 830, radius: 24, color: '#EC4899' },

      // Bẫy phân làn chia 3 hướng
      { id: 'split_1', type: 'ramp', x: 260, y: 1040, width: 180, angle: -0.4, color: '#F59E0B' },
      { id: 'split_2', type: 'ramp', x: 540, y: 1040, width: 180, angle: 0.4, color: '#F59E0B' },
      { id: 'split_peg', type: 'peg', x: 400, y: 1000, radius: 14, color: '#EF4444' },

      // 3 Quạt quay ở 3 làn
      { id: 'lane_sp1', type: 'spinner', x: 200, y: 1220, radius: 45, rotationSpeed: 0.05, color: '#10B981' },
      { id: 'lane_sp2', type: 'spinner', x: 400, y: 1220, radius: 45, rotationSpeed: -0.05, color: '#10B981' },
      { id: 'lane_sp3', type: 'spinner', x: 600, y: 1220, radius: 45, rotationSpeed: 0.05, color: '#10B981' },

      // 3 Booster
      { id: 'lane_bst1', type: 'booster', x: 200, y: 1360, width: 70, height: 50, color: '#8B5CF6' },
      { id: 'lane_bst2', type: 'booster', x: 400, y: 1360, width: 70, height: 50, color: '#8B5CF6' },
      { id: 'lane_bst3', type: 'booster', x: 600, y: 1360, width: 70, height: 50, color: '#8B5CF6' },

      // Phễu gom tốc độ cao cuối cùng
      { id: 'end_f1', type: 'ramp', x: 220, y: 1540, width: 280, angle: 0.55, color: '#06B6D4' },
      { id: 'end_f2', type: 'ramp', x: 580, y: 1540, width: 280, angle: -0.55, color: '#06B6D4' },
    ]
  }
];
