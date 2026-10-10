/**
 * Hệ thống xác thực và mã hóa bảo mật phiên đăng nhập Giáo Viên
 * Sử dụng giải thuật băm mật mã SHA-256 qua Web Crypto API.
 * KHÔNG lưu trữ mật khẩu hoặc tên tài khoản dạng văn bản thô (plaintext)
 * nhằm tránh lộ thông tin khi kiểm tra mã nguồn hoặc giao diện ứng dụng.
 */

// Danh sách mã băm SHA-256 hợp lệ của tên tài khoản (hỗ trợ có dấu, không dấu, viết hoa, viết thường)
const VALID_USER_HASHES = new Set([
  // Chuẩn hóa NFC lowercase (VD: "trần thị kim thoa")
  'b2c70599fa4aedb222012f21619b66e7538b52835230f26bad25ec0f5fdabbde',
  // Không dấu lowercase (VD: "tran thi kim thoa")
  '45f6eec5940d6f9201ed0ee66c006f463243818394533370fb201c46e8cf1102',
  // Không dấu viết liền (VD: "tranthikimthoa")
  'e5b751fcba314d80659c870048d7abdf85b121c233001829a82ab6d5e67401f6',
  // Giữ nguyên hoa thường
  '831c569f41e72030cc67880184fee7d5fda249e9d4563cc3667a43d03d872092'
]);

// Mã băm SHA-256 của mật khẩu bảo mật
const VALID_PASS_HASH = '5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5';

const STORAGE_AUTH_TOKEN = 'duabi_teacher_auth_token_v4';
const STORAGE_REMEMBER_FLAG = 'duabi_teacher_remember_v4';
const STORAGE_TEACHER_NAME = 'duabi_teacher_display_name_v4';

/**
 * Tính mã băm SHA-256 an toàn từ chuỗi ký tự
 */
async function computeSha256(text: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Loại bỏ dấu tiếng Việt để đối chiếu linh hoạt
 */
function removeVietnameseAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd');
}

/**
 * Xác thực thông tin đăng nhập mà không lộ dữ liệu gốc
 */
export async function verifyTeacherCredentials(user: string, pass: string): Promise<boolean> {
  const rawUser = (user || '').trim();
  const rawPass = (pass || '').trim();

  if (!rawUser || !rawPass) return false;

  // Kiểm tra mã băm mật khẩu trước
  const passHash = await computeSha256(rawPass);
  if (passHash !== VALID_PASS_HASH) {
    return false;
  }

  // Kiểm tra mã băm tên người dùng
  const userNfcLower = rawUser.normalize('NFC').toLowerCase();
  const userNoAccent = removeVietnameseAccents(rawUser).toLowerCase();
  const userCompact = userNoAccent.replace(/\s+/g, '');

  const [hashNfcLower, hashNoAccent, hashCompact, hashRaw] = await Promise.all([
    computeSha256(userNfcLower),
    computeSha256(userNoAccent),
    computeSha256(userCompact),
    computeSha256(rawUser)
  ]);

  const isValid =
    VALID_USER_HASHES.has(hashNfcLower) ||
    VALID_USER_HASHES.has(hashNoAccent) ||
    VALID_USER_HASHES.has(hashCompact) ||
    VALID_USER_HASHES.has(hashRaw);

  return isValid;
}

/**
 * Lưu phiên làm việc sau khi xác thực thành công
 */
export function saveTeacherSession(userDisplayName: string, remember: boolean): void {
  const sessionToken = `auth_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const cleanDisplayName = userDisplayName.trim();

  if (remember) {
    localStorage.setItem(STORAGE_AUTH_TOKEN, sessionToken);
    localStorage.setItem(STORAGE_REMEMBER_FLAG, 'true');
    localStorage.setItem(STORAGE_TEACHER_NAME, cleanDisplayName);
  } else {
    sessionStorage.setItem(STORAGE_AUTH_TOKEN, sessionToken);
    sessionStorage.setItem(STORAGE_TEACHER_NAME, cleanDisplayName);
    localStorage.removeItem(STORAGE_REMEMBER_FLAG);
  }
}

/**
 * Kiểm tra xem giáo viên đã đăng nhập hay chưa
 */
export function checkIsAuthenticated(): boolean {
  try {
    const localToken = localStorage.getItem(STORAGE_AUTH_TOKEN);
    const sessionToken = sessionStorage.getItem(STORAGE_AUTH_TOKEN);
    return Boolean(localToken || sessionToken);
  } catch {
    return false;
  }
}

/**
 * Lấy tên giáo viên đã đăng nhập để hiển thị lời chào
 */
export function getLoggedInTeacherName(): string {
  try {
    return (
      localStorage.getItem(STORAGE_TEACHER_NAME) ||
      sessionStorage.getItem(STORAGE_TEACHER_NAME) ||
      'Giáo Viên'
    );
  } catch {
    return 'Giáo Viên';
  }
}

/**
 * Đăng xuất khỏi hệ thống
 */
export function logoutTeacher(): void {
  try {
    localStorage.removeItem(STORAGE_AUTH_TOKEN);
    localStorage.removeItem(STORAGE_REMEMBER_FLAG);
    localStorage.removeItem(STORAGE_TEACHER_NAME);
    sessionStorage.removeItem(STORAGE_AUTH_TOKEN);
    sessionStorage.removeItem(STORAGE_TEACHER_NAME);
  } catch {}
}
