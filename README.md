# Gia Phả – Họ Nguyễn Văn

Ứng dụng web quản lý và trình bày **cây gia phả dòng họ Nguyễn Văn – Bếp trưởng Chi Giáp**, gồm 8 đời con cháu. Giao diện được thiết kế theo phong cách truyền thống với tông màu đỏ–vàng, phù hợp với không gian văn hóa gia tộc Việt Nam.

---

## Tính năng chính

- **Cây gia phả tương tác** (module chính): hiển thị cây gia phả dạng SVG, hỗ trợ zoom, pan, kéo thả, tìm kiếm thành viên và xem thông tin chi tiết.
- **Các module bổ sung**: Trang chủ, Bảng tin, Danh bạ, Sự kiện, Sách gia phả, Thành viên, Thư viện.
- **Sidebar điều hướng** với biểu tượng rõ ràng.
- **Dữ liệu mẫu** 8 đời họ Nguyễn Văn, có thể dễ dàng thay thế bằng dữ liệu thực tế của dòng họ.

---

## Công nghệ sử dụng

- [Next.js](https://nextjs.org/) 14 (App Router)
- [React](https://react.dev/) 18
- [Tailwind CSS](https://tailwindcss.com/) 3
- [Lucide React](https://lucide.dev/) (icon)

---

## Cài đặt và chạy

### Yêu cầu

- Node.js 18+
- npm

### Các bước

```bash
# 1. Clone repo
git clone https://github.com/huyzpka-commits/giapha.git
cd giapha

# 2. Cài đặt dependencies
npm install

# 3. Chạy môi trường phát triển
npm run dev
```

Mở trình duyệt tại: [http://localhost:3000](http://localhost:3000)

---

## Triển khai GitHub Pages

Ứng dụng được cấu hình để tự động deploy lên GitHub Pages qua GitHub Actions.

Sau khi bật GitHub Pages trong repo, trang sẽ chạy tại:  
**https://huyzpka-commits.github.io/giapha/**

### Bước 1: Bật GitHub Pages

1. Vào repo trên GitHub: https://github.com/huyzpka-commits/giapha
2. Vào **Settings → Pages**
3. Ở mục **Build and deployment**, chọn **Source: GitHub Actions**

### Bước 2: Chạy workflow

Workflow `.github/workflows/deploy.yml` đã được thêm vào repo. Mỗi lần push lên nhánh `master`, GitHub Actions sẽ tự động build và deploy.

Để kiểm tra tiến trình:

1. Vào repo → tab **Actions**
2. Chọn workflow **Deploy to GitHub Pages**
3. Đợi job `build` và `deploy` chạy xanh

### Bước 3: Truy cập trang

Sau khi deploy thành công, mở: https://huyzpka-commits.github.io/giapha/

---

## Scripts

| Script | Mô tả |
|--------|-------|
| `npm run dev`   | Chạy server phát triển với hot-reload |
| `npm run build` | Build ứng dụng cho production |
| `npm run start` | Chạy ứng dụng production đã build |

---

## Cấu trúc thư mục

```
gia-pha-app/
├── app/                    # App Router của Next.js
│   ├── globals.css         # CSS toàn cục
│   ├── layout.js           # Root layout
│   └── page.js             # Trang chính (điều hướng module)
├── components/
│   ├── FamilyTree.jsx      # Cây gia phả SVG tương tác
│   ├── ModuleViews.jsx     # Các view: Home, News, Contacts, Events, Book, Members, Library
│   └── Sidebar.jsx         # Thanh điều hướng
├── data/
│   └── familyData.js       # Dữ liệu gia phả và dữ liệu mẫu
├── .gitignore
├── jsconfig.json
├── next.config.mjs
├── package.json
├── postcss.config.js
└── tailwind.config.js
```

---

## Dữ liệu gia phả

Dữ liệu gia phả được lưu trong `data/familyData.js` dưới dạng cây JSON. Mỗi thành viên bao gồm các thông tin:

- `id`: mã định danh
- `name`: họ tên
- `birth` / `death`: năm sinh / năm mất
- `status`: `'alive'` | `'deceased'`
- `gender`: `'male'` | `'female'`
- `type`: `'main'` (chính tộc) | `'inlaw'` (ngoại tộc)
- `generation`: số đời (1–8)
- `spouse`: thông tin phối ngẫu (tùy chọn)
- `note`: ghi chú (tùy chọn)
- `children`: mảng các con

Để cập nhật gia phả, chỉ cần sửa file `data/familyData.js` theo cấu trúc trên.

---

## Giấy phép

Dự án nguồn mở cho mục đích cá nhân và cộng đồng dòng họ.

---

> *“Uống nước nhớ nguồn – Con cháu thịnh vượng, gia đạo hưng long.”*
