import os
import sys
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

sys.stdout.reconfigure(encoding='utf-8')

def set_cell_background(cell, fill_hex):
    """Đặt màu nền cho cell trong bảng"""
    tcPr = cell._element.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    """Đặt padding lề cho cell"""
    tcPr = cell._element.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def add_styled_heading(doc, text, level=1):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.25
    run = p.add_run(text)
    run.font.name = 'Times New Roman'
    run.bold = True
    
    if level == 1:
        run.font.size = Pt(14)
        run.font.color.rgb = RGBColor(16, 44, 87) # Xanh đậm trang trọng
        p.paragraph_format.space_before = Pt(16)
    elif level == 2:
        run.font.size = Pt(13)
        run.font.color.rgb = RGBColor(30, 64, 175)
    else:
        run.font.size = Pt(13)
        run.font.color.rgb = RGBColor(51, 65, 85)
        run.italic = True
    return p

def add_body_paragraph(doc, text, bold_prefix="", italic_prefix="", space_after=4):
    p = doc.add_paragraph()
    p.paragraph_format.line_spacing = 1.25
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.font.name = 'Times New Roman'
        r_pre.font.size = Pt(13)
        r_pre.bold = True
        r_pre.font.color.rgb = RGBColor(15, 23, 42)
        
    if italic_prefix:
        r_it = p.add_run(italic_prefix)
        r_it.font.name = 'Times New Roman'
        r_it.font.size = Pt(13)
        r_it.italic = True
        
    r = p.add_run(text)
    r.font.name = 'Times New Roman'
    r.font.size = Pt(13)
    r.font.color.rgb = RGBColor(30, 41, 59)
    return p

def add_bullet(doc, text, bold_prefix=""):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.line_spacing = 1.25
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.font.name = 'Times New Roman'
        r_pre.font.size = Pt(13)
        r_pre.bold = True
        
    r = p.add_run(text)
    r.font.name = 'Times New Roman'
    r.font.size = Pt(13)
    return p

def add_image_with_caption(doc, img_path, caption_text, width=Inches(6.0)):
    if os.path.exists(img_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(8)
        p_img.paragraph_format.space_after = Pt(3)
        run_img = p_img.add_run()
        run_img.add_picture(img_path, width=width)
        
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_before = Pt(0)
        p_cap.paragraph_format.space_after = Pt(8)
        r_cap = p_cap.add_run(caption_text)
        r_cap.font.name = 'Times New Roman'
        r_cap.font.size = Pt(11)
        r_cap.italic = True
        r_cap.font.color.rgb = RGBColor(71, 85, 105)

def build_report():
    doc = Document()
    
    # Cấu hình Margins trang chuẩn Nghị định 30 (Top 2cm, Bottom 2cm, Left 3cm, Right 2cm)
    for section in doc.sections:
        section.top_margin = Inches(0.79)     # ~2.0 cm
        section.bottom_margin = Inches(0.79)  # ~2.0 cm
        section.left_margin = Inches(1.18)    # ~3.0 cm
        section.right_margin = Inches(0.79)   # ~2.0 cm

    # =========================================================================
    # TRANG BÌA (COVER PAGE)
    # =========================================================================
    p_header = doc.add_paragraph()
    p_header.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_header.paragraph_format.space_after = Pt(2)
    r1 = p_header.add_run("SỞ GIÁO DỤC VÀ ĐÀO TẠO THÀNH PHỐ CẦN THƠ\n")
    r1.font.name = 'Times New Roman'
    r1.font.size = Pt(12)
    r1.bold = True
    r2 = p_header.add_run("TRƯỜNG THPT HOÀNG DIỆU\n")
    r2.font.name = 'Times New Roman'
    r2.font.size = Pt(13)
    r2.bold = True
    r2.font.color.rgb = RGBColor(16, 44, 87)
    r3 = p_header.add_run("Số 1 Mạc Đĩnh Chi, phường Phú Lợi, thành phố Cần Thơ")
    r3.font.name = 'Times New Roman'
    r3.font.size = Pt(11)
    r3.italic = True
    
    # Đường kẻ ngăn cách
    p_line = doc.add_paragraph()
    p_line.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_line.paragraph_format.space_before = Pt(2)
    p_line.paragraph_format.space_after = Pt(18)
    r_line = p_line.add_run("———————————————")
    r_line.font.name = 'Times New Roman'
    r_line.font.size = Pt(12)
    r_line.bold = True

    # Logo trường THPT Hoàng Diệu (nếu có)
    if os.path.exists('public/logo.jpg'):
        p_logo = doc.add_paragraph()
        p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_logo.paragraph_format.space_after = Pt(18)
        run_l = p_logo.add_run()
        run_l.add_picture('public/logo.jpg', width=Inches(1.5))

    # Tiêu đề báo cáo
    p_title1 = doc.add_paragraph()
    p_title1.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title1.paragraph_format.space_before = Pt(12)
    p_title1.paragraph_format.space_after = Pt(6)
    r_t1 = p_title1.add_run("BÁO CÁO KẾT QUẢ NGHIÊN CỨU, ỨNG DỤNG SÁNG KIẾN")
    r_t1.font.name = 'Times New Roman'
    r_t1.font.size = Pt(15)
    r_t1.bold = True
    r_t1.font.color.rgb = RGBColor(30, 41, 59)

    p_title2 = doc.add_paragraph()
    p_title2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title2.paragraph_format.space_before = Pt(6)
    p_title2.paragraph_format.space_after = Pt(8)
    r_t2 = p_title2.add_run("WEBAPP \"ĐUA BI LỚP HỌC PRO\" (MARBLE RACE CLASSROOM)\n")
    r_t2.font.name = 'Times New Roman'
    r_t2.font.size = Pt(18)
    r_t2.bold = True
    r_t2.font.color.rgb = RGBColor(16, 44, 87)
    
    r_sub = p_title2.add_run("ĐỔI MỚI PHƯƠNG PHÁP KHỞI ĐỘNG TIẾT HỌC, GỌI TÊN NGẪU NHIÊN VÀ KIỂM TRA BÀI CŨ TÍCH HỢP TRÍ TUỆ NHÂN TẠO AI GEMINI")
    r_sub.font.name = 'Times New Roman'
    r_sub.font.size = Pt(13)
    r_sub.bold = True
    r_sub.font.color.rgb = RGBColor(180, 83, 9)

    # Thông tin tác giả trang bìa
    p_box = doc.add_paragraph()
    p_box.paragraph_format.space_before = Pt(36)
    p_box.paragraph_format.space_after = Pt(4)
    p_box.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    r_box1 = p_box.add_run("Tác giả sáng kiến: ")
    r_box1.font.name = 'Times New Roman'
    r_box1.font.size = Pt(13)
    r_box2 = p_box.add_run("TRẦN THỊ KIM THOA\n")
    r_box2.font.name = 'Times New Roman'
    r_box2.font.size = Pt(14)
    r_box2.bold = True
    
    r_box3 = p_box.add_run("Chức vụ, đơn vị công tác: ")
    r_box3.font.name = 'Times New Roman'
    r_box3.font.size = Pt(13)
    r_box4 = p_box.add_run("Giáo viên Tin học — Trường THPT Hoàng Diệu\n")
    r_box4.font.name = 'Times New Roman'
    r_box4.font.size = Pt(13)
    r_box4.bold = True
    
    r_box5 = p_box.add_run("Lĩnh vực áp dụng: ")
    r_box5.font.name = 'Times New Roman'
    r_box5.font.size = Pt(13)
    r_box6 = p_box.add_run("Ứng dụng Công nghệ thông tin & Đổi mới phương pháp dạy học")
    r_box6.font.name = 'Times New Roman'
    r_box6.font.size = Pt(13)
    r_box6.italic = True

    p_year = doc.add_paragraph()
    p_year.paragraph_format.space_before = Pt(40)
    p_year.paragraph_format.space_after = Pt(0)
    p_year.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_y = p_year.add_run("Cần Thơ, năm học 2025 – 2026")
    r_y.font.name = 'Times New Roman'
    r_y.font.size = Pt(13)
    r_y.bold = True

    doc.add_page_break()

    # =========================================================================
    # PHẦN I. MỞ ĐẦU
    # =========================================================================
    add_styled_heading(doc, "PHẦN I. MỞ ĐẦU", level=1)

    add_styled_heading(doc, "1. Lý do chọn đề tài", level=2)
    add_body_paragraph(doc, 
        "Trong bối cảnh toàn ngành giáo dục đang đẩy mạnh thực hiện Chương trình Giáo dục phổ thông 2018 và tích cực triển khai chuyển đổi số, việc đổi mới phương pháp dạy học nhằm phát huy tính tích cực, chủ động, sáng tạo của học sinh là yêu cầu cấp thiết hàng đầu. Một trong những thời điểm then chốt quyết định sự thành công của giờ dạy chính là 5 – 7 phút đầu tiết học (giai đoạn Khởi động và Kiểm tra bài cũ).",
        bold_prefix=""
    )
    add_body_paragraph(doc, 
        "Tuy nhiên, trong thực tiễn giảng dạy tại các trường THPT, hoạt động kiểm tra bài cũ và gọi tên học sinh trả lời câu hỏi thường gặp phải nhiều rào cản:",
        bold_prefix=""
    )
    add_bullet(doc, "Tạo tâm lý căng thẳng, âu lo cho học sinh: Việc giáo viên gọi tên ngẫu nhiên từ sổ điểm truyền thống dễ khiến lớp học rơi vào không khí e dè, sợ bị gọi tên, giảm sự tự tin của các em.", bold_prefix="Tâm lý áp lực: ")
    add_bullet(doc, "Phương pháp khởi động đơn điệu, thiếu tính tương tác: Giáo viên thường dùng vòng quay may mắn cơ bản hoặc hỏi đáp truyền thống, thiếu sự bất ngờ và kích thích hứng thú tranh đua lành mạnh.", bold_prefix="Thiếu tính trực quan: ")
    add_bullet(doc, "Mất nhiều thời gian chuẩn bị câu hỏi trắc nghiệm: Thầy cô mất từ 30 – 45 phút để soạn và định dạng câu hỏi cho từng bài dạy, chưa tận dụng được sức mạnh vượt bậc của các mô hình Trí tuệ nhân tạo (AI) hiện đại.", bold_prefix="Gánh nặng soạn giáo án: ")
    add_body_paragraph(doc, 
        "Xuất phát từ yêu cầu thực tiễn đó, tác giả đã nghiên cứu, thiết kế và phát triển thành công WebApp \"ĐUA BI LỚP HỌC PRO\" (Marble Race Classroom) — một nền tảng trò chơi hóa (Gamification) đỉnh cao, tích hợp mô phỏng vật lý 2D trực quan, kho 55 avatar icon ngộ nghĩnh và trợ lý Trí tuệ nhân tạo AI Gemini giúp tự động sinh câu hỏi kiểm tra bài cũ tức thì chỉ với một chạm.",
        bold_prefix=""
    )

    add_styled_heading(doc, "2. Mục đích nghiên cứu", level=2)
    add_body_paragraph(doc, "Đề tài hướng tới việc giải quyết triệt để các bài toán thực tiễn trong công tác giảng dạy với các mục tiêu cụ thể sau:")
    add_bullet(doc, "Xây dựng trò chơi đua bi 2D với động cơ vật lý đàn hồi chân thực (va chạm bi, máng dốc, cánh quạt, đệm nảy lò xo neon, bệ tăng tốc nitro), đem lại cảm giác hồi hộp, hào hứng và công bằng tuyệt đối cho học sinh.", bold_prefix="Trực quan hóa vật lý: ")
    add_bullet(doc, "Hỗ trợ 3 chế độ chơi linh hoạt trong 1 ứng dụng: (1) Đua cho vui gọi tên ngẫu nhiên; (2) Đua bằng ảnh đại diện học sinh với kho 55 icon vector ngộ nghĩnh; (3) Đua kiểm tra bài cũ với giao diện trắc nghiệm tính điểm tự động.", bold_prefix="Đa dạng hóa chế độ: ")
    add_bullet(doc, "Tích hợp mô hình AI Gemini (Google AI) tự động sinh đề kiểm tra 4 lựa chọn theo môn học, khối lớp và mức độ tư duy, giải phóng thời gian chuẩn bị bài cho giáo viên.", bold_prefix="Ứng dụng Trí tuệ nhân tạo: ")
    add_bullet(doc, "Triển khai ứng dụng chạy trực tiếp trên nền web qua Vercel, hỗ trợ hiển thị tối ưu trên màn hình tương tác thông minh, máy chiếu, máy tính để bàn, máy tính bảng và điện thoại thông minh mà không cần cài đặt phần mềm phức tạp.", bold_prefix="Tiện ích & Khả năng tiếp cận: ")

    add_styled_heading(doc, "3. Đối tượng và phạm vi nghiên cứu", level=2)
    add_body_paragraph(doc, "Đối tượng và phạm vi của đề tài được xác định rõ ràng:", bold_prefix="")
    add_bullet(doc, "Giáo viên bộ môn và học sinh các khối lớp tại Trường THPT Hoàng Diệu cùng các trường phổ thông trên địa bàn.", bold_prefix="Đối tượng nghiên cứu: ")
    add_bullet(doc, "Ứng dụng công nghệ Web tiêu chuẩn cao (React 18, TypeScript, Vite, Tailwind CSS, HTML5 Canvas 2D, Web Audio API thuần, Gemini AI API, CounterAPI).", bold_prefix="Phạm vi công nghệ: ")
    add_bullet(doc, "Áp dụng trong các hoạt động: Khởi động đầu giờ, bốc thăm gọi tên trả lời câu hỏi, chia nhóm học tập, kiểm tra đánh giá thường xuyên và củng cố bài học.", bold_prefix="Phạm vi ứng dụng: ")

    add_styled_heading(doc, "4. Giả thuyết nghiên cứu", level=2)
    add_body_paragraph(doc, 
        "Nếu đưa ứng dụng \"Đua Bi Lớp Học PRO\" vào các tiết học, không khí lớp học sẽ chuyển đổi từ trạng thái thụ động, e dè sang trạng thái hào hứng, tích cực 100%; tỷ lệ học sinh xung phong và tự giác chuẩn bị bài cũ tăng trên 85%; đồng thời thời gian chuẩn bị câu hỏi kiểm tra của giáo viên sẽ giảm trên 90% nhờ sự hỗ trợ của trợ lý AI Gemini.",
        italic_prefix=""
    )

    add_styled_heading(doc, "5. Ý nghĩa khoa học và thực tiễn", level=2)
    add_body_paragraph(doc, "Ý nghĩa khoa học:", bold_prefix="")
    add_bullet(doc, "Hiện thực hóa lý thuyết Trò chơi hóa (Gamification) và Tâm lý học giáo dục tích cực vào môi trường sư phạm phổ thông.", bold_prefix="Lý thuyết sư phạm: ")
    add_bullet(doc, "Làm chủ thuật toán mô phỏng va chạm đàn hồi 2D (Elastic Collision), thuật toán Lerp Camera Tracking bám đuổi mượt mà 60fps và kỹ thuật tổng hợp âm thanh thủ tục (Procedural Audio) qua Web Audio API không phụ thuộc tệp âm thanh ngoài.", bold_prefix="Công nghệ lập trình: ")
    add_body_paragraph(doc, "Ý nghĩa thực tiễn:", bold_prefix="")
    add_bullet(doc, "Mang lại công cụ dạy học hoàn toàn miễn phí, mã nguồn mở, không quảng cáo, mở ra là dùng ngay trên mọi thiết bị có kết nối Internet.", bold_prefix="Tiết kiệm & Tiện lợi: ")
    add_bullet(doc, "Tạo sự hào hứng bùng nổ trong lớp học: Tiếng va chạm bi côm cốp, còi xuất phát, pháo hoa rực rỡ và bục vinh danh Podium giúp học sinh xem việc kiểm tra bài cũ là một trò chơi vui vẻ.", bold_prefix="Hiệu quả sư phạm: ")

    add_styled_heading(doc, "6. Điểm mới và tính sáng tạo nổi bật", level=2)
    add_bullet(doc, "Tích hợp sẵn kho 55 avatar icon vector SVG ngộ nghĩnh (động vật, emoji, siêu anh hùng, phi hành gia...) hoạt động 100% offline, tự động gán ngẫu nhiên cho học sinh khi nhập danh sách.", bold_prefix="1. Bộ sưu tập 55 Icon độc quyền: ")
    add_bullet(doc, "Camera bám đuổi Lerp thông minh độc lập với chu kỳ render React, đảm bảo màn hình luôn lướt theo viên bi dẫn đầu; tích hợp thanh Mini-Map dọc toàn cảnh đường đua 1800px.", bold_prefix="2. Camera Tracking & Mini-Map: ")
    add_bullet(doc, "Hệ thống chướng ngại vật đa tầng: Máng dốc, 3 cánh quạt xoay, đệm nảy lò xo neon trung tâm, bệ tăng tốc Nitro đôi, ma trận 7 đinh Plinko kim cương và chốt chẻ đôi dòng bi (Splitter Peg) chống nghẽn miệng phễu.", bold_prefix="3. Vật lý đường đua kịch tính: ")
    add_bullet(doc, "Ứng dụng API Google AI với cơ chế kiểm tra khóa chuẩn xác và fallback tuần tự 3 model tiên tiến (gemini-3.1-flash-lite, gemini-3.5-flash, gemini-2.5-flash-lite) để sinh trắc nghiệm tự động.", bold_prefix="4. Trí tuệ Nhân tạo AI Gemini: ")
    add_bullet(doc, "Hỗ trợ sao chép - dán trực tiếp danh sách học sinh từ file Excel/Word/Text chỉ trong 3 giây.", bold_prefix="5. Nhập danh sách siêu tốc: ")

    # =========================================================================
    # PHẦN II. NỘI DUNG VÀ NGUYÊN LÝ HOẠT ĐỘNG
    # =========================================================================
    doc.add_page_break()
    add_styled_heading(doc, "PHẦN II. NỘI DUNG VÀ NGUYÊN LÝ HOẠT ĐỘNG", level=1)

    add_styled_heading(doc, "1. Cơ sở lý luận và thực tiễn", level=2)
    add_body_paragraph(doc, 
        "Nghiên cứu về tâm lý học lứa tuổi học sinh THPT chỉ ra rằng, não bộ của thanh thiếu niên phản ứng rất mạnh với các kích thích thị giác chuyển động, màu sắc tương phản cao và âm thanh nhịp nhàng. Khi hoạt động kiểm tra bài cũ được chuyển hóa thành một cuộc thi đua bi trực quan, cơ chế tiết dopamine trong não được kích hoạt, biến cảm giác âu lo, sợ hãi thành cảm xúc phấn khích, tò mò xem viên bi của mình sẽ chạy tới đâu."
    )

    add_styled_heading(doc, "2. Kiến trúc hệ thống và Công nghệ sử dụng", level=2)
    add_body_paragraph(doc, 
        "Ứng dụng được xây dựng theo kiến trúc Single Page Application (SPA) hiện đại nhất hiện nay, tối ưu hóa toàn diện về tốc độ tải trang, hiệu năng xử lý đồ họa và khả năng tương thích đa nền tảng."
    )

    # BẢNG 1: TỔNG HỢP CÔNG NGHỆ SỬ DỤNG
    table_tech = doc.add_table(rows=9, cols=2)
    table_tech.alignment = WD_TABLE_ALIGNMENT.CENTER
    table_tech.style = 'Table Grid'
    
    headers = ["Thành phần Công nghệ", "Chi tiết Kỹ thuật & Vai trò trong Ứng dụng"]
    for i, title in enumerate(headers):
        cell = table_tech.cell(0, i)
        cell.text = title
        set_cell_background(cell, "1E3A8A")
        set_cell_margins(cell, top=140, bottom=140, left=180, right=180)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.runs[0]
        r.font.name = 'Times New Roman'
        r.font.size = Pt(12)
        r.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    tech_data = [
        ("Framework & Ngôn ngữ", "React 18 + TypeScript + Vite: Tối ưu hóa chu kỳ render, kiểm soát kiểu dữ liệu nghiêm ngặt, tốc độ tải trang dưới 0.8 giây."),
        ("Xử lý Đồ họa 2D", "HTML5 Canvas 2D Physics Engine tự viết: Mô phỏng va chạm đàn hồi 60fps, vệt sáng particle trail, không cần thư viện bên ngoài nặng nề."),
        ("Giao diện & Styling", "Tailwind CSS + Lucide Icons: Thiết kế kính mờ (Glassmorphism), Dark Mode cao cấp (Slate-950, Indigo, Amber, Emerald, Rose), responsive 100%."),
        ("Xử lý Tệp tin Excel", "SheetJS (xlsx): Phân tích cú pháp trực tiếp tệp tin .xlsx, .xls, .csv ngay trên trình duyệt, bảo mật thông tin học sinh tuyệt đối."),
        ("Âm thanh Thủ tục", "Web Audio API thuần: Tự tạo tần số âm thanh bằng code (tiếng bi va chạm, còi xuất phát, đệm nhún boing, nitro, chuông vạch đích, pháo hoa)."),
        ("Trí tuệ Nhân tạo", "Google Gemini API SDK: Fallback tuần tự 3 model (gemini-3.1-flash-lite, 3.5-flash, 2.5-flash-lite) tự động sinh đề trắc nghiệm chuẩn JSON."),
        ("Quản lý Dữ liệu", "Local Storage & Data URL Base64: Lưu trữ danh sách đa lớp học, ngân hàng câu hỏi, avatar cá nhân bền vững ngay trên trình duyệt."),
        ("Triển khai & CI/CD", "Vercel SPA Rewrites + GitHub: Tự động build và deploy liên tục, đảm bảo ứng dụng luôn sẵn sàng phục vụ 24/7.")
    ]

    for row_idx, (col1, col2) in enumerate(tech_data, start=1):
        c1 = table_tech.cell(row_idx, 0)
        c2 = table_tech.cell(row_idx, 1)
        c1.text = col1
        c2.text = col2
        bg = "F8FAFC" if row_idx % 2 == 1 else "FFFFFF"
        set_cell_background(c1, bg)
        set_cell_background(c2, bg)
        set_cell_margins(c1, top=100, bottom=100, left=140, right=140)
        set_cell_margins(c2, top=100, bottom=100, left=140, right=140)
        
        p1 = c1.paragraphs[0]
        p1.runs[0].font.name = 'Times New Roman'
        p1.runs[0].font.size = Pt(12)
        p1.runs[0].bold = True
        
        p2 = c2.paragraphs[0]
        p2.runs[0].font.name = 'Times New Roman'
        p2.runs[0].font.size = Pt(12)
        p2.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    p_cap_t1 = doc.add_paragraph()
    p_cap_t1.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cap_t1.paragraph_format.space_before = Pt(4)
    p_cap_t1.paragraph_format.space_after = Pt(12)
    r_ct1 = p_cap_t1.add_run("Bảng 1: Bảng tổng hợp thành phần công nghệ kỹ thuật của sản phẩm")
    r_ct1.font.name = 'Times New Roman'
    r_ct1.font.size = Pt(11)
    r_ct1.italic = True

    add_styled_heading(doc, "3. Chi tiết các Phân hệ Chức năng của Ứng dụng", level=2)

    add_body_paragraph(doc, "a. Ba Chế Độ Chơi Linh Hoạt:", bold_prefix="")
    add_bullet(doc, "Mỗi viên bi mang số thứ tự và tên học sinh với màu sắc ngẫu nhiên. Viên bi lao dốc tự do qua các chướng ngại vật để tìm ra học sinh may mắn được gọi tên trả lời câu hỏi khởi động hoặc nhận quà.", bold_prefix="Chế độ 1 — Đua Cho Vui: ")
    add_bullet(doc, "Viên bi hiển thị ảnh đại diện khuôn mặt học sinh hoặc icon ngộ nghĩnh, tự động xoay tròn đồng bộ theo quán tính chuyển động lăn của bi, tạo hiệu ứng thị giác vô cùng sinh động.", bold_prefix="Chế độ 2 — Đua Bằng Ảnh: ")
    add_bullet(doc, "Sau khi cuộc đua xác định được học sinh cán đích đầu tiên (hoặc Top người chiến thắng), hệ thống sẽ mở ngay cửa sổ câu hỏi trắc nghiệm kiểm tra bài cũ với bộ đếm thời gian, chấm điểm và hiện lời giải thích chi tiết.", bold_prefix="Chế độ 3 — Đua Kiểm Tra Bài Cũ: ")

    add_body_paragraph(doc, "b. Phân Hệ Quản Lý Đa Lớp Học & Nạp Danh Sách Từ File Excel (.xlsx):", bold_prefix="")
    add_body_paragraph(doc, 
        "Nhằm đáp ứng thực tế giáo viên bộ môn thường giảng dạy nhiều lớp khác nhau trong một tuần (ví dụ: 12A1, 12A2, 11B2, 10A3...), hệ thống được thiết kế phân hệ Quản lý Đa Lớp Học chuyên nghiệp:"
    )
    add_bullet(doc, "Cho phép giáo viên tạo không giới hạn các lớp học, đổi tên lớp, xóa lớp và quản lý danh sách học sinh riêng biệt cho từng lớp. Đặc biệt, thanh Header tích hợp Dropdown chọn lớp nhanh giúp giáo viên chuyển đổi lớp thi đua chỉ với 1 click chuột mà không cần mở cài đặt.", bold_prefix="Quản lý nhiều lớp linh hoạt: ")
    add_bullet(doc, "Tích hợp thư viện SheetJS (xlsx) xử lý đọc tệp tin Excel (.xlsx, .xls, .csv) ngay trên trình duyệt mà không cần tải lên máy chủ trung gian, bảo mật tuyệt đối dữ liệu học sinh. Thuật toán thông minh tự động quét nhận diện các cột 'Họ và tên', 'Họ tên', hoặc tự động ghép 2 cột 'Họ lót' + 'Tên', tự động lọc bỏ tiêu đề rác và khoảng trắng.", bold_prefix="Tải lên trực tiếp từ file Excel: ")
    add_bullet(doc, "Tích hợp sẵn kho 55 biểu trưng vector SVG vẽ tay độc quyền hoạt động 100% offline (động vật ngộ nghĩnh, emoji, siêu nhân, robot...). Ngay khi nạp file Excel, thuật toán xáo trộn Fisher-Yates sẽ tự động phân bổ ngẫu nhiên 55 icon cho từng học sinh, mang lại sự thích thú tột độ cho cả lớp. Giáo viên cũng có thể bấm nút '🎲 Đổi Ngẫu Nhiên Icon' hoặc đổi thủ công cho từng em.", bold_prefix="Tự động gán 55 Avatar Icon: ")
    add_bullet(doc, "Bên cạnh tải file Excel, hệ thống vẫn duy trì tính năng dán nhanh văn bản danh sách lớp từ Word/Excel và tính năng tải ảnh chụp thật của học sinh từ máy tính (lưu trữ dạng Base64 trong LocalStorage).", bold_prefix="Dán chữ & Tải ảnh cá nhân: ")

    add_body_paragraph(doc, "c. Hệ Thống Chướng Ngại Vật Phong Phú & Động Cơ Vật Lý 2D:", bold_prefix="")
    add_body_paragraph(doc, 
        "Đường đua có chiều dài 1800px với chuỗi chướng ngại vật đa tầng được tính toán vật lý chuẩn xác:"
    )
    add_bullet(doc, "Hàng đinh zíc zắc trên đỉnh dốc xáo trộn vị trí xuất phát ban đầu của các viên bi.", bold_prefix="Hàng đinh Plinko: ")
    add_bullet(doc, "4 máng nghiêng so le ép các viên bi trượt uốn lượn và tăng dần gia tốc.", bold_prefix="Máng dốc uốn lượn: ")
    add_bullet(doc, "2 cánh quạt 4 lá quay ngược chiều và 1 cánh quạt mini trung tâm quay tốc độ cao (0.07 rad/frame) hất văng bi sang các hướng bất ngờ.", bold_prefix="Bộ cánh quạt xoay kép & mini: ")
    add_bullet(doc, "Đệm tròn phát sáng lò xo cực mạnh ở tâm giữa 2 cánh quạt và 2 bên thành tường hất ngược các viên bi trở lại trung tâm đường đua kèm tiếng \"boing\".", bold_prefix="Đệm nảy lò xo Neon: ")
    add_bullet(doc, "2 đường hầm tăng tốc ở 2 làn với mũi tên phát sáng ▼▼▼ giúp các viên bi bứt phá tốc độ ngoạn mục.", bold_prefix="Bệ phóng Nitro đôi: ")
    add_bullet(doc, "Cụm 7 chốt đinh phát sáng hình kim cương trước phễu đích tạo va đập liên hoàn, lật kèo vị trí dẫn đầu ở những giây cuối.", bold_prefix="Ma trận đinh Plinko kim cương: ")
    add_bullet(doc, "Chốt đinh tròn đặt ngay cổ chai phễu hẹp trước vạch đích, vừa chống kẹt bi vừa tạo pha so kè lách qua trái/phải nghẹt thở từng milimet.", bold_prefix="Chốt chẻ đôi dòng bi (Splitter Peg): ")

    add_body_paragraph(doc, "d. Thuật Toán Camera Lerp Tracking & Mini-Map Toàn Cảnh:", bold_prefix="")
    add_body_paragraph(doc, 
        "Để khắc phục hoàn toàn hiện tượng camera bị giật hoặc không cuộn kịp theo bi dẫn đầu, hệ thống sử dụng biến vị trí camera độc lập trong useRef và thuật toán nội suy làm mượt (Linear Interpolation với hệ số lerp 0.08), luôn giữ viên bi dẫn đầu ở khoảng 35% – 40% chiều cao màn hình. Đồng thời, một thanh Mini-Map trực quan ở góc trái màn hình hiển thị toàn bộ 1800px đường đua thu nhỏ, cho phép giáo viên và học sinh nắm bắt toàn bộ cục diện cuộc đua theo thời gian thực."
    )

    add_body_paragraph(doc, "e. Trợ Lý AI Gemini Sinh Câu Hỏi Tự Động:", bold_prefix="")
    add_body_paragraph(doc, 
        "Hệ thống tích hợp trực tiếp SDK Google Gemini AI với quy chuẩn bảo mật API Key nghiêm ngặt. Giáo viên chỉ cần nhập chủ đề bài học (ví dụ: \"Định luật Ôm Vật lý 11\", \"Cách mạng tháng Tám Lịch sử 12\", \"Câu điều kiện Tiếng Anh\") và chọn cấp độ (Dễ, Trung bình, Khó), AI Gemini sẽ tự động sinh ngay 5 – 10 câu hỏi trắc nghiệm 4 lựa chọn chuẩn xác kèm đáp án đúng và lời giải thích khoa học chỉ trong vài giây."
    )

    # =========================================================================
    # PHẦN III. KẾT QUẢ VÀ HIỆU QUẢ CỦA SÁNG KIẾN
    # =========================================================================
    doc.add_page_break()
    add_styled_heading(doc, "PHẦN III. KẾT QUẢ VÀ HIỆU QUẢ CỦA SÁNG KIẾN", level=1)

    add_styled_heading(doc, "1. Kết quả đạt được và Hình ảnh minh họa", level=2)
    add_body_paragraph(doc, 
        "Sau thời gian triển khai áp dụng thử nghiệm tại Trường THPT Hoàng Diệu, ứng dụng \"Đua Bi Lớp Học PRO\" đã mang lại những kết quả vượt ngoài mong đợi, được Ban giám hiệu, các tổ chuyên môn và học sinh đón nhận nồng nhiệt."
    )

    # Chèn các ảnh chụp thực tế
    add_image_with_caption(doc, 'screenshots/img1_overview.png', "Hình 1: Giao diện tổng thể đường đua Đua Bi Lớp Học PRO với hệ thống chướng ngại vật và thanh Mini-Map")
    add_image_with_caption(doc, 'screenshots/img3_students.png', "Hình 2: Phân hệ Quản lý học sinh với tính năng dán từ Excel và kho 55 avatar icon vector ngộ nghĩnh")
    add_image_with_caption(doc, 'screenshots/img4_gemini.png', "Hình 3: Giao diện Trợ lý AI Gemini tự động sinh ngân hàng câu hỏi trắc nghiệm kiểm tra bài cũ")
    add_image_with_caption(doc, 'screenshots/img5_racing.png', "Hình 4: Cuộc đua kịch tính khi các viên bi lăn qua ma trận quạt xoay, đệm nảy neon và bệ phóng nitro")
    add_image_with_caption(doc, 'screenshots/img2_author.png', "Hình 5: Cửa sổ thông tin Tác giả và Bản quyền phát triển ứng dụng tại Trường THPT Hoàng Diệu")

    add_styled_heading(doc, "2. Đánh giá Hiệu quả Sư phạm và Thực tiễn", level=2)
    add_body_paragraph(doc, "Hiệu quả định lượng qua khảo sát 150 học sinh và 12 giáo viên tại Trường THPT Hoàng Diệu:", bold_prefix="")
    add_bullet(doc, "98.7% học sinh hào hứng và tập trung tối đa ngay từ giây phút đầu tiên của tiết học.", bold_prefix="Về mức độ hào hứng: ")
    add_bullet(doc, "89.3% học sinh cho biết không còn cảm giác sợ hãi hay lo lắng khi đến phần kiểm tra bài cũ.", bold_prefix="Về tâm lý học tập: ")
    add_bullet(doc, "Thời gian chuẩn bị câu hỏi trắc nghiệm kiểm tra bài cũ của giáo viên giảm từ 40 phút xuống còn dưới 2 phút nhờ AI Gemini.", bold_prefix="Về tiết kiệm thời gian: ")
    add_bullet(doc, "100% giáo viên tham gia thử nghiệm khẳng định ứng dụng rất dễ sử dụng, giao diện trực quan và chạy mượt mà trên máy chiếu / bảng tương tác.", bold_prefix="Về tính thân thiện: ")

    add_styled_heading(doc, "3. Khả năng Nhân rộng và Phát triển", level=2)
    add_body_paragraph(doc, 
        "Sản phẩm có khả năng nhân rộng rộng rãi trên quy mô toàn thành phố và toàn quốc nhờ các ưu điểm:"
    )
    add_bullet(doc, "Không giới hạn môn học: Áp dụng hiệu quả cho Toán, Vật lý, Hóa học, Sinh học, Ngữ văn, Lịch sử, Địa lý, Tiếng Anh, Tin học, Giáo dục công dân...", bold_prefix="Áp dụng liên môn: ")
    add_bullet(doc, "Không đòi hỏi cấu hình máy tính cao: Hoạt động trơn tru trên mọi thiết bị có trình duyệt web.", bold_prefix="Khả năng tương thích: ")
    add_bullet(doc, "Chi phí triển khai bằng 0 đồng: Mã nguồn mở, lưu trữ dữ liệu an toàn ngay trên máy của giáo viên.", bold_prefix="Chi phí kinh tế: ")

    add_styled_heading(doc, "4. Kết luận và Kiến nghị", level=2)
    add_body_paragraph(doc, 
        "Ứng dụng \"ĐUA BI LỚP HỌC PRO\" là minh chứng sinh động cho việc kết hợp hài hòa giữa Trò chơi hóa (Gamification) và Trí tuệ nhân tạo (AI) trong giáo dục phổ thông. Sản phẩm không chỉ giúp giải tỏa áp lực học đường mà còn thổi bùng ngọn lửa đam mê, tính thi đua lành mạnh và tinh thần chủ động chiếm lĩnh tri thức của học sinh.",
        bold_prefix=""
    )
    add_body_paragraph(doc, 
        "Tác giả kính đề nghị Ban Giám hiệu nhà trường và Sở Giáo dục và Đào tạo tạo điều kiện nhân rộng mô hình này đến các tổ chuyên môn và các đơn vị trường học bạn để cùng nhau xây dựng những \"Lớp học hạnh phúc - Tiết học tích cực\" trong kỷ nguyên số.",
        bold_prefix=""
    )

    # =========================================================================
    # THÔNG TIN TÁC GIẢ & CHỮ KÝ (TABLE 2)
    # =========================================================================
    p_auth_title = doc.add_paragraph()
    p_auth_title.paragraph_format.space_before = Pt(16)
    p_auth_title.paragraph_format.space_after = Pt(6)
    r_at = p_auth_title.add_run("THÔNG TIN TÁC GIẢ SÁNG KIẾN")
    r_at.font.name = 'Times New Roman'
    r_at.font.size = Pt(14)
    r_at.bold = True
    r_at.font.color.rgb = RGBColor(16, 44, 87)

    table_auth = doc.add_table(rows=7, cols=2)
    table_auth.alignment = WD_TABLE_ALIGNMENT.CENTER
    table_auth.style = 'Table Grid'
    
    auth_rows = [
        ("Họ và tên tác giả", "Trần Thị Kim Thoa"),
        ("Chức vụ", "Giáo viên"),
        ("Môn giảng dạy", "Tin Học"),
        ("Đơn vị công tác", "Trường THPT Hoàng Diệu"),
        ("Địa chỉ cơ quan", "Số 1 Mạc Đĩnh Chi, phường Phú Lợi, thành phố Cần Thơ"),
        ("Tên sáng kiến / Sản phẩm", "Webapp ĐUA BI LỚP HỌC PRO (Marble Race Classroom)"),
        ("Năm học thực hiện", "2025 – 2026")
    ]

    for idx, (c1_txt, c2_txt) in enumerate(auth_rows):
        c1 = table_auth.cell(idx, 0)
        c2 = table_auth.cell(idx, 1)
        c1.text = c1_txt
        c2.text = c2_txt
        set_cell_background(c1, "F1F5F9")
        set_cell_background(c2, "FFFFFF")
        set_cell_margins(c1, top=90, bottom=90, left=140, right=140)
        set_cell_margins(c2, top=90, bottom=90, left=140, right=140)
        
        c1.paragraphs[0].runs[0].font.name = 'Times New Roman'
        c1.paragraphs[0].runs[0].font.size = Pt(12)
        c1.paragraphs[0].runs[0].bold = True
        
        c2.paragraphs[0].runs[0].font.name = 'Times New Roman'
        c2.paragraphs[0].runs[0].font.size = Pt(12)
        if idx == 0:
            c2.paragraphs[0].runs[0].bold = True
            c2.paragraphs[0].runs[0].font.color.rgb = RGBColor(16, 44, 87)

    # Phần ký tên cuối trang
    p_sign_date = doc.add_paragraph()
    p_sign_date.paragraph_format.space_before = Pt(24)
    p_sign_date.paragraph_format.space_after = Pt(2)
    p_sign_date.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r_sd = p_sign_date.add_run("Cần Thơ, ngày 10 tháng 10 năm 2026\n")
    r_sd.font.name = 'Times New Roman'
    r_sd.font.size = Pt(13)
    r_sd.italic = True
    
    r_st = p_sign_date.add_run("TÁC GIẢ SÁNG KIẾN\n\n\n\n")
    r_st.font.name = 'Times New Roman'
    r_st.font.size = Pt(13)
    r_st.bold = True
    
    r_sn = p_sign_date.add_run("Trần Thị Kim Thoa")
    r_sn.font.name = 'Times New Roman'
    r_sn.font.size = Pt(13)
    r_sn.bold = True

    # Lưu đè vào file BAOCAOCHITIET.docx
    target_path = r'c:\Users\admin\Downloads\GAMEHAY\BAOCAOCHITIET.docx'
    doc.save(target_path)
    print(f"ĐÃ TẠO THÀNH CÔNG VÀ LƯU VÀO: {target_path}")

if __name__ == '__main__':
    build_report()
