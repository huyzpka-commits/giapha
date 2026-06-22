import './globals.css';

export const metadata = {
  title: 'Gia Phả – Họ Nguyễn Văn',
  description: 'Ứng dụng quản lý dữ liệu gia phả dòng họ',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className="bg-amber-50 h-screen overflow-hidden">{children}</body>
    </html>
  );
}
