// 55 CUTE AVATAR ICONS FOR CLASSROOM MARBLE RACE
// 100% SVG Data URLs độc lập - Hoạt động Offline 100% không phụ thuộc internet bên ngoài

export interface CuteAvatarItem {
  id: string;
  name: string;
  emoji: string;
  dataUrl: string;
}

// Helper tạo SVG tròn chất lượng cao 120x120
function createSvgAvatar(
  bgGradStart: string,
  bgGradEnd: string,
  emoji: string,
  borderColor: string = '#FFFFFF'
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
    <defs>
      <linearGradient id="g_${emoji.codePointAt(0)}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgGradStart}"/>
        <stop offset="100%" stop-color="${bgGradEnd}"/>
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.25"/>
      </filter>
    </defs>
    <!-- Vòng tròn nền gradient -->
    <circle cx="60" cy="60" r="56" fill="url(#g_${emoji.codePointAt(0)})" stroke="${borderColor}" stroke-width="4"/>
    <!-- Vòng hào quang bóng bẩy -->
    <ellipse cx="45" cy="30" rx="28" ry="14" fill="white" opacity="0.32" transform="rotate(-20 45 30)"/>
    <!-- Biểu tượng Emoji ngộ nghĩnh to rõ ở trung tâm -->
    <text x="60" y="74" font-size="54" text-anchor="middle" dominant-baseline="central" filter="url(#shadow)" font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif">
      ${emoji}
    </text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Danh sách 55 Avatar ngộ nghĩnh đa dạng các chủ đề: Động vật, Siêu anh hùng, Nhân vật vui nhộn, Biểu tượng chiến thắng
export const CUTE_AVATARS: CuteAvatarItem[] = [
  // 1-15: Động vật siêu cute
  { id: 'av_cat', name: 'Mèo Con', emoji: '🐱', dataUrl: createSvgAvatar('#FB7185', '#E11D48', '🐱') },
  { id: 'av_dog', name: 'Cún Cưng', emoji: '🐶', dataUrl: createSvgAvatar('#FBBF24', '#D97706', '🐶') },
  { id: 'av_panda', name: 'Gấu Trúc', emoji: '🐼', dataUrl: createSvgAvatar('#38BDF8', '#0284C7', '🐼') },
  { id: 'av_bear', name: 'Gấu Nâu', emoji: '🐻', dataUrl: createSvgAvatar('#F59E0B', '#B45309', '🐻') },
  { id: 'av_rabbit', name: 'Thỏ Trắng', emoji: '🐰', dataUrl: createSvgAvatar('#F472B6', '#DB2777', '🐰') },
  { id: 'av_fox', name: 'Cáo Cam', emoji: '🦊', dataUrl: createSvgAvatar('#FB923C', '#EA580C', '🦊') },
  { id: 'av_tiger', name: 'Hổ Con', emoji: '🐯', dataUrl: createSvgAvatar('#F59E0B', '#C2410C', '🐯') },
  { id: 'av_lion', name: 'Sư Tử', emoji: '🦁', dataUrl: createSvgAvatar('#FBBF24', '#D97706', '🦁') },
  { id: 'av_monkey', name: 'Khỉ Vui Nhộn', emoji: '🐵', dataUrl: createSvgAvatar('#A3E635', '#65A30D', '🐵') },
  { id: 'av_penguin', name: 'Chim Cánh Cụt', emoji: '🐧', dataUrl: createSvgAvatar('#06B6D4', '#0891B2', '🐧') },
  { id: 'av_koala', name: 'Gấu Koala', emoji: '🐨', dataUrl: createSvgAvatar('#94A3B8', '#475569', '🐨') },
  { id: 'av_frog', name: 'Ếch Cốm', emoji: '🐸', dataUrl: createSvgAvatar('#4ADE80', '#16A34A', '🐸') },
  { id: 'av_pig', name: 'Heo Hồng', emoji: '🐷', dataUrl: createSvgAvatar('#F472B6', '#E11D48', '🐷') },
  { id: 'av_owl', name: 'Cú Thông Thái', emoji: '🦉', dataUrl: createSvgAvatar('#818CF8', '#4F46E5', '🦉') },
  { id: 'av_chick', name: 'Gà Con', emoji: '🐥', dataUrl: createSvgAvatar('#FACC15', '#CA8A04', '🐥') },

  // 16-25: Sinh vật biển & Thiên nhiên ngộ nghĩnh
  { id: 'av_duck', name: 'Vịt Vàng', emoji: '🦆', dataUrl: createSvgAvatar('#34D399', '#059669', '🦆') },
  { id: 'av_hamster', name: 'Chuột Hamster', emoji: '🐹', dataUrl: createSvgAvatar('#FCD34D', '#D97706', '🐹') },
  { id: 'av_unicorn', name: 'Kỳ Lân Mộng Mơ', emoji: '🦄', dataUrl: createSvgAvatar('#C084FC', '#9333EA', '🦄') },
  { id: 'av_dragon', name: 'Rồng Con', emoji: '🐲', dataUrl: createSvgAvatar('#10B981', '#047857', '🐲') },
  { id: 'av_whale', name: 'Cá Voi Xanh', emoji: '🐳', dataUrl: createSvgAvatar('#38BDF8', '#0369A1', '🐳') },
  { id: 'av_octopus', name: 'Bạch Tuộc', emoji: '🐙', dataUrl: createSvgAvatar('#F43F5E', '#BE123C', '🐙') },
  { id: 'av_crab', name: 'Cua Đỏ', emoji: '🦀', dataUrl: createSvgAvatar('#EF4444', '#B91C1C', '🦀') },
  { id: 'av_dolphin', name: 'Cá Heo', emoji: '🐬', dataUrl: createSvgAvatar('#0EA5E9', '#0284C7', '🐬') },
  { id: 'av_bee', name: 'Ong Chăm Chỉ', emoji: '🐝', dataUrl: createSvgAvatar('#FACC15', '#CA8A04', '🐝') },
  { id: 'av_butterfly', name: 'Bướm Xinh', emoji: '🦋', dataUrl: createSvgAvatar('#A78BFA', '#6D28D9', '🦋') },

  // 26-38: Nhân vật nghề nghiệp & Siêu anh hùng
  { id: 'av_superhero', name: 'Siêu Anh Hùng', emoji: '🦸', dataUrl: createSvgAvatar('#6366F1', '#4338CA', '🦸') },
  { id: 'av_ninja', name: 'Ninja Bí Ẩn', emoji: '🥷', dataUrl: createSvgAvatar('#475569', '#0F172A', '🥷') },
  { id: 'av_wizard', name: 'Phù Thủy', emoji: '🧙', dataUrl: createSvgAvatar('#8B5CF6', '#5B21B6', '🧙') },
  { id: 'av_astronaut', name: 'Phi Hành Gia', emoji: '👨‍🚀', dataUrl: createSvgAvatar('#38BDF8', '#1D4ED8', '👨‍🚀') },
  { id: 'av_robot', name: 'Người Máy Robot', emoji: '🤖', dataUrl: createSvgAvatar('#06B6D4', '#0E7490', '🤖') },
  { id: 'av_alien', name: 'Người Ngoài Hành Tinh', emoji: '👽', dataUrl: createSvgAvatar('#22C55E', '#15803D', '👽') },
  { id: 'av_detective', name: 'Thám Tử', emoji: '🕵️', dataUrl: createSvgAvatar('#D97706', '#78350F', '🕵️') },
  { id: 'av_pirate', name: 'Cướp Biển Vui Tính', emoji: '🏴‍☠️', dataUrl: createSvgAvatar('#64748B', '#1E293B', '🏴‍☠️') },
  { id: 'av_chef', name: 'Đầu Bếp Nhí', emoji: '👨‍🍳', dataUrl: createSvgAvatar('#F43F5E', '#9F1239', '👨‍🍳') },
  { id: 'av_gamer', name: 'Game Thủ Pro', emoji: '🎮', dataUrl: createSvgAvatar('#8B5CF6', '#4C1D95', '🎮') },
  { id: 'av_scientist', name: 'Nhà Bác Học', emoji: '🧪', dataUrl: createSvgAvatar('#14B8A6', '#0F766E', '🧪') },
  { id: 'av_artist', name: 'Họa Sĩ Tí Hon', emoji: '🎨', dataUrl: createSvgAvatar('#EC4899', '#9D174D', '🎨') },
  { id: 'av_monster', name: 'Quái Vật Dễ Thương', emoji: '👾', dataUrl: createSvgAvatar('#A855F7', '#6B21A8', '👾') },

  // 39-47: Biểu cảm Meme Lớp học
  { id: 'av_sunglasses', name: 'Ngầu Lòi', emoji: '😎', dataUrl: createSvgAvatar('#F59E0B', '#B45309', '😎') },
  { id: 'av_party', name: 'Tiệc Tùng', emoji: '🥳', dataUrl: createSvgAvatar('#EC4899', '#8B5CF6', '🥳') },
  { id: 'av_star_eyes', name: 'Mắt Sao Lung Linh', emoji: '🤩', dataUrl: createSvgAvatar('#FBBF24', '#D97706', '🤩') },
  { id: 'av_angel', name: 'Thiên Thần', emoji: '😇', dataUrl: createSvgAvatar('#67E8F9', '#0284C7', '😇') },
  { id: 'av_wink', name: 'Nháy Mắt Tự Tin', emoji: '😉', dataUrl: createSvgAvatar('#FDE047', '#EAB308', '😉') },
  { id: 'av_crown', name: 'Vương Miện Quán Quân', emoji: '👑', dataUrl: createSvgAvatar('#FACC15', '#A16207', '👑') },
  { id: 'av_fire', name: 'Cháy Hết Mình', emoji: '🔥', dataUrl: createSvgAvatar('#EF4444', '#B91C1C', '🔥') },
  { id: 'av_lightning', name: 'Tia Chớp Nhanh Nhẹn', emoji: '⚡', dataUrl: createSvgAvatar('#EAB308', '#CA8A04', '⚡') },
  { id: 'av_trophy', name: 'Cúp Vàng', emoji: '🏆', dataUrl: createSvgAvatar('#F59E0B', '#78350F', '🏆') },

  // 48-55: Đồ ăn & Vật phẩm may mắn
  { id: 'av_rocket', name: 'Tên Lửa Tốc Độ', emoji: '🚀', dataUrl: createSvgAvatar('#6366F1', '#3730A3', '🚀') },
  { id: 'av_diamond', name: 'Kim Cương Sáng Chói', emoji: '💎', dataUrl: createSvgAvatar('#38BDF8', '#1E40AF', '💎') },
  { id: 'av_pizza', name: 'Pizza Thơm Ngon', emoji: '🍕', dataUrl: createSvgAvatar('#F97316', '#C2410C', '🍕') },
  { id: 'av_donut', name: 'Bánh Donut Ngọt Ngào', emoji: '🍩', dataUrl: createSvgAvatar('#F472B6', '#BE185D', '🍩') },
  { id: 'av_icecream', name: 'Kem Mát Lạnh', emoji: '🍦', dataUrl: createSvgAvatar('#FB7185', '#E11D48', '🍦') },
  { id: 'av_strawberry', name: 'Dâu Tây Mọng Nước', emoji: '🍓', dataUrl: createSvgAvatar('#EF4444', '#991B1B', '🍓') },
  { id: 'av_clover', name: 'Cỏ 4 Lá May Mắn', emoji: '🍀', dataUrl: createSvgAvatar('#22C55E', '#166534', '🍀') },
  { id: 'av_rainbow', name: 'Cầu Vồng Hy Vọng', emoji: '🌈', dataUrl: createSvgAvatar('#38BDF8', '#9333EA', '🌈') }
];

// Hàm lấy ngẫu nhiên 1 avatar
export function getRandomAvatar(): CuteAvatarItem {
  const randomIndex = Math.floor(Math.random() * CUTE_AVATARS.length);
  return CUTE_AVATARS[randomIndex];
}

// Hàm gán ngẫu nhiên avatar cho cả danh sách học sinh (xáo trộn không trùng lặp nếu danh sách <= 55)
export function assignRandomAvatarsToStudents<T extends { avatarUrl?: string }>(students: T[]): T[] {
  // Tạo mảng chỉ số được xáo trộn ngẫu nhiên (Fisher-Yates shuffle)
  const shuffled = [...CUTE_AVATARS].sort(() => Math.random() - 0.5);

  return students.map((student, index) => {
    // Nếu học sinh nhiều hơn 55 thì dùng modulo để quay vòng nhưng vẫn xáo trộn
    const avatar = shuffled[index % shuffled.length];
    return {
      ...student,
      avatarUrl: avatar.dataUrl
    };
  });
}
