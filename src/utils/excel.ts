import * as XLSX from 'xlsx';

/**
 * Phân tích file Excel (.xlsx, .xls, .csv) trích xuất danh sách tên học sinh
 * Hỗ trợ tự động nhận diện các định dạng:
 * 1. Cột "Họ và tên" / "Họ tên" / "Tên"
 * 2. Tách 2 cột: "Họ và tên lót" + "Tên"
 * 3. Danh sách văn bản thuần không có tiêu đề
 */
export function parseStudentExcel(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: 'binary' });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          reject(new Error('File Excel rỗng hoặc không có sheet nào!'));
          return;
        }

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        if (!rawRows || rawRows.length === 0) {
          reject(new Error('Không tìm thấy dữ liệu trong file Excel!'));
          return;
        }

        // 1. Quét tìm hàng tiêu đề và các cột liên quan
        let nameColIdx = -1;
        let lastNameColIdx = -1; // Họ và đệm
        let firstNameColIdx = -1; // Tên
        let headerRowIdx = -1;

        for (let r = 0; r < Math.min(rawRows.length, 15); r++) {
          const row = rawRows[r];
          if (!Array.isArray(row)) continue;

          for (let c = 0; c < row.length; c++) {
            const cellVal = String(row[c] || '').trim().toLowerCase();

            if (
              cellVal === 'họ và tên' ||
              cellVal === 'họ tên' ||
              cellVal === 'họ & tên' ||
              cellVal === 'họ và tên học sinh' ||
              cellVal === 'tên học sinh' ||
              cellVal === 'fullname' ||
              cellVal === 'full name' ||
              cellVal === 'student name'
            ) {
              nameColIdx = c;
              headerRowIdx = r;
              break;
            } else if (
              cellVal === 'họ lót' ||
              cellVal === 'họ và chữ lót' ||
              cellVal === 'họ và đệm' ||
              cellVal === 'họ' ||
              cellVal === 'last name'
            ) {
              lastNameColIdx = c;
              headerRowIdx = r;
            } else if (
              cellVal === 'tên' ||
              cellVal === 'first name'
            ) {
              firstNameColIdx = c;
              headerRowIdx = r;
            }
          }

          if (nameColIdx !== -1 || (lastNameColIdx !== -1 && firstNameColIdx !== -1)) {
            break;
          }
        }

        const studentNames: string[] = [];
        const startRow = headerRowIdx !== -1 ? headerRowIdx + 1 : 0;

        for (let r = startRow; r < rawRows.length; r++) {
          const row = rawRows[r];
          if (!Array.isArray(row) || row.length === 0) continue;

          let fullName = '';

          if (nameColIdx !== -1) {
            fullName = String(row[nameColIdx] || '').trim();
          } else if (lastNameColIdx !== -1 && firstNameColIdx !== -1) {
            const last = String(row[lastNameColIdx] || '').trim();
            const first = String(row[firstNameColIdx] || '').trim();
            fullName = `${last} ${first}`.trim();
          } else {
            // Không tìm thấy tiêu đề cụ thể: Tìm ô văn bản hợp lệ dài nhất trong hàng (thường là cột họ tên)
            const textCandidates = row
              .map(v => String(v || '').trim())
              .filter(v => v.length > 2 && !/^\d+$/.test(v) && !/^(nam|nữ|ngày sinh|stt|năm sinh)/i.test(v));

            if (textCandidates.length > 0) {
              fullName = textCandidates[0];
            }
          }

          // Lọc các giá trị rác hoặc tiêu đề trùng lặp
          if (
            fullName.length >= 2 &&
            !/^(stt|số thứ tự|họ và tên|tên|ghi chú|tổng số|kết quả)$/i.test(fullName) &&
            !/^\d+$/.test(fullName)
          ) {
            studentNames.push(fullName);
          }
        }

        if (studentNames.length === 0) {
          reject(new Error('Không tìm thấy danh sách tên học sinh trong file. Vui lòng kiểm tra lại cột Họ và Tên!'));
          return;
        }

        resolve(studentNames);
      } catch (err) {
        reject(new Error('Lỗi khi đọc file Excel: ' + (err as Error).message));
      }
    };

    reader.onerror = () => reject(new Error('Không thể đọc tệp tin!'));
    reader.readAsBinaryString(file);
  });
}
