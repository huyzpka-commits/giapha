'use client';

import { familyStats, sampleNews, sampleContacts } from '@/data/familyData';
import { Phone, MapPin, Calendar, Users, BookOpen, Images, Newspaper } from 'lucide-react';

// ── Shared placeholder wrapper ────────────────────────────────────────────────
function Placeholder({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="flex flex-col h-full bg-amber-50 overflow-y-auto">
      <div className="flex items-center gap-3 px-6 py-4 bg-red-900 text-yellow-100 flex-shrink-0">
        <Icon size={20} className="text-yellow-400" />
        <h2 className="font-bold text-lg font-serif">{title}</h2>
      </div>
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}

// ── Trang chủ ─────────────────────────────────────────────────────────────────
export function HomeView() {
  return (
    <Placeholder icon={BookOpen} title="Trang chủ – Gia Phả Họ Nguyễn Văn">
      {/* Hero banner */}
      <div className="rounded-2xl overflow-hidden mb-6 bg-gradient-to-br from-red-900 to-red-800 p-8 text-center shadow-lg border border-yellow-700">
        <p className="text-yellow-500 font-serif text-sm tracking-widest mb-2">❖ ❖ ❖</p>
        <h1 className="text-yellow-400 font-serif font-bold text-2xl mb-1">
          GIA PHẢ BẾP TRƯỞNG CHI GIÁP
        </h1>
        <h2 className="text-yellow-300 font-serif text-lg mb-4">HỌ NGUYỄN VĂN</h2>
        <p className="text-yellow-200 text-sm opacity-80 font-serif italic">
          "Uống nước nhớ nguồn – Con cháu thịnh vượng, gia đạo hưng long"
        </p>
        <p className="text-yellow-500 font-serif text-sm tracking-widest mt-2">❖ ❖ ❖</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Tổng thành viên', value: familyStats.totalMembers, unit: 'người' },
          { label: 'Số đời',          value: familyStats.generations,  unit: 'đời'   },
          { label: 'Nam (sống)',       value: familyStats.aliveMale,    unit: 'người' },
          { label: 'Thành lập',        value: familyStats.established,  unit: ''      },
        ].map(({ label, value, unit }) => (
          <div key={label} className="bg-white rounded-xl p-4 border border-amber-200 shadow-sm text-center">
            <p className="text-red-800 font-bold text-2xl">{value}<span className="text-base ml-1 font-normal text-amber-600">{unit}</span></p>
            <p className="text-amber-700 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent news */}
      <h3 className="text-red-900 font-serif font-bold mb-3">Tin tức mới nhất</h3>
      <div className="space-y-3">
        {sampleNews.map(n => (
          <div key={n.id} className="bg-white rounded-xl p-4 border border-amber-200 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-red-700 mt-2 shrink-0" />
              <div>
                <p className="font-semibold text-red-900 text-sm">{n.title}</p>
                <p className="text-amber-600 text-xs mt-0.5">{n.date}</p>
                <p className="text-gray-600 text-sm mt-1">{n.summary}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Placeholder>
  );
}

// ── Bảng tin ──────────────────────────────────────────────────────────────────
export function NewsView() {
  return (
    <Placeholder icon={Newspaper} title="Bảng tin – Thông báo dòng họ">
      <div className="space-y-4">
        {sampleNews.map(n => (
          <div key={n.id} className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-red-700" />
              <span className="text-amber-600 text-xs">{n.date}</span>
            </div>
            <h3 className="text-red-900 font-semibold text-base mb-2">{n.title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{n.summary}</p>
            <button className="mt-3 text-red-700 text-sm font-medium hover:underline">Xem chi tiết →</button>
          </div>
        ))}
      </div>
    </Placeholder>
  );
}

// ── Danh bạ ───────────────────────────────────────────────────────────────────
export function ContactsView() {
  return (
    <Placeholder icon={Phone} title="Danh bạ – Liên hệ thành viên">
      <div className="grid gap-3">
        {sampleContacts.map(c => (
          <div key={c.id} className="bg-white rounded-xl p-4 border border-amber-200 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-red-800 flex items-center justify-center text-yellow-400 font-bold font-serif shrink-0">
              {c.name.charAt(c.name.lastIndexOf(' ') + 1)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-red-900">{c.name}</p>
              <p className="text-amber-600 text-xs">{c.role} · Đời {c.gen}</p>
            </div>
            <div className="text-right text-sm">
              <div className="flex items-center gap-1 text-amber-700 justify-end">
                <Phone size={12} /><span>{c.phone}</span>
              </div>
              <div className="flex items-center gap-1 text-amber-500 text-xs justify-end mt-0.5">
                <MapPin size={11} /><span>{c.address}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Placeholder>
  );
}

// ── Sự kiện ───────────────────────────────────────────────────────────────────
export function EventsView() {
  const events = [
    { date: '2024-01-30', title: 'Lễ giỗ tổ hàng năm',         location: 'Nhà thờ họ', type: 'Lễ giỗ'   },
    { date: '2024-02-10', title: 'Họp mặt đầu năm Giáp Thìn',  location: 'Hà Nội',     type: 'Họp mặt'  },
    { date: '2024-06-15', title: 'Tu bổ mộ tổ tiên',            location: 'Quê hương',  type: 'Hoạt động' },
    { date: '2024-12-25', title: 'Tổng kết cuối năm',           location: 'TP.HCM',    type: 'Họp mặt'  },
  ];
  return (
    <Placeholder icon={Calendar} title="Sự kiện – Lịch hoạt động dòng họ">
      <div className="space-y-3">
        {events.map((e, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-amber-200 shadow-sm flex gap-4 items-center">
            <div className="text-center bg-red-800 text-yellow-400 rounded-lg p-2 w-14 shrink-0">
              <p className="text-xs">{e.date.slice(5, 7)}</p>
              <p className="font-bold text-lg leading-tight">{e.date.slice(8)}</p>
              <p className="text-xs">{e.date.slice(0, 4)}</p>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-red-900">{e.title}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-amber-600">
                <span className="flex items-center gap-1"><MapPin size={11} />{e.location}</span>
                <span className="bg-amber-100 px-2 py-0.5 rounded-full">{e.type}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Placeholder>
  );
}

// ── Sách gia phả ──────────────────────────────────────────────────────────────
export function BookView() {
  return (
    <Placeholder icon={BookOpen} title="Sách gia phả – Lịch sử dòng họ">
      <div className="max-w-2xl">
        <div className="bg-white rounded-2xl p-6 border border-amber-200 shadow prose prose-amber">
          <h2 className="text-red-900 font-serif text-xl font-bold mb-3">Lời tựa</h2>
          <p className="text-gray-700 text-sm leading-relaxed mb-4">
            Dòng họ Nguyễn Văn Chi Giáp được hình thành từ năm 1700 do cụ Nguyễn Văn Thủy Tổ khai sáng.
            Trải qua hơn 300 năm lịch sử với 8 đời con cháu, dòng họ đã phát triển và trưởng thành,
            đóng góp cho sự phát triển của quê hương đất nước.
          </p>
          <p className="text-gray-700 text-sm leading-relaxed mb-4">
            Cuốn sách gia phả này được biên soạn nhằm ghi lại lịch sử, công đức của tiền nhân,
            để con cháu đời sau ghi nhớ và phát huy truyền thống tốt đẹp của dòng họ.
          </p>
          <div className="bg-amber-50 border-l-4 border-red-800 p-4 rounded-r-lg mt-4">
            <p className="text-red-900 font-serif italic text-sm">
              "Chim có tổ, người có tông. Con cháu nối dõi, tổ tiên rạng danh."
            </p>
          </div>
        </div>
      </div>
    </Placeholder>
  );
}

// ── Thành viên ────────────────────────────────────────────────────────────────
export function MembersView() {
  return (
    <Placeholder icon={Users} title="Thành viên – Danh sách con cháu">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sampleContacts.map(c => (
          <div key={c.id} className="bg-white rounded-xl p-4 border border-amber-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-700 to-red-900
                flex items-center justify-center text-yellow-400 font-bold text-lg font-serif">
                {c.name.charAt(c.name.lastIndexOf(' ') + 1)}
              </div>
              <div>
                <p className="font-semibold text-red-900">{c.name}</p>
                <p className="text-amber-600 text-xs">{c.role} · Đời {c.gen}</p>
                <p className="text-amber-500 text-xs">{c.address}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Placeholder>
  );
}

// ── Thư viện ──────────────────────────────────────────────────────────────────
export function LibraryView() {
  const items = [
    { title: 'Ảnh giỗ tổ 2023',     type: 'Hình ảnh', count: 24 },
    { title: 'Nhà thờ họ',          type: 'Hình ảnh', count: 12 },
    { title: 'Văn bản cổ',          type: 'Tài liệu', count:  5 },
    { title: 'Họp mặt đại gia đình', type: 'Hình ảnh', count: 38 },
  ];
  return (
    <Placeholder icon={Images} title="Thư viện – Hình ảnh & Tài liệu">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item, i) => (
          <div key={i} className="bg-white rounded-xl overflow-hidden border border-amber-200 shadow-sm
            hover:shadow-md transition-shadow cursor-pointer">
            <div className="h-28 bg-gradient-to-br from-red-800 to-amber-700
              flex items-center justify-center text-4xl">
              {item.type === 'Hình ảnh' ? '🖼️' : '📄'}
            </div>
            <div className="p-3">
              <p className="font-semibold text-red-900 text-sm truncate">{item.title}</p>
              <p className="text-amber-500 text-xs mt-1">{item.type} · {item.count} mục</p>
            </div>
          </div>
        ))}
      </div>
    </Placeholder>
  );
}
