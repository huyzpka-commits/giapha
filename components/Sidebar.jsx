'use client';

import {
  Home, Newspaper, BookUser, CalendarDays,
  GitFork, BookOpen, Users, Images, Phone,
} from 'lucide-react';

const MODULES = [
  { key: 'home',        label: 'Trang chủ',   icon: Home        },
  { key: 'news',        label: 'Bảng tin',     icon: Newspaper   },
  { key: 'contacts',   label: 'Danh bạ',      icon: BookUser    },
  { key: 'events',     label: 'Sự kiện',      icon: CalendarDays },
  { key: 'family-tree',label: 'Cây gia phả',  icon: GitFork     },
  { key: 'book',        label: 'Sách gia phả', icon: BookOpen    },
  { key: 'members',    label: 'Thành viên',   icon: Users       },
  { key: 'library',    label: 'Thư viện',     icon: Images      },
];

export default function Sidebar({ active, onSelect }) {
  return (
    <aside className="flex flex-col w-56 min-w-56 bg-red-900 text-yellow-100 h-screen shadow-2xl z-20">
      {/* Logo / Header */}
      <div className="px-4 py-5 border-b border-red-700">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏮</span>
          <div>
            <p className="text-yellow-400 font-bold text-sm leading-tight">GIA PHẢ</p>
            <p className="text-yellow-300 text-xs opacity-80">Họ Nguyễn Văn</p>
          </div>
        </div>
        <p className="text-yellow-500 text-xs mt-2 opacity-70 font-serif italic">Chi Giáp · 8 Đời</p>
      </div>

      {/* Decorative divider */}
      <div className="px-4 py-2">
        <p className="text-yellow-600 text-xs font-bold tracking-widest uppercase opacity-70">Danh mục</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
        {MODULES.map(({ key, label, icon: Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${isActive
                  ? 'bg-yellow-500 text-red-900 shadow-md'
                  : 'text-yellow-200 hover:bg-red-800 hover:text-yellow-300'
                }`}
            >
              <Icon size={16} className={isActive ? 'text-red-800' : 'text-yellow-400'} />
              {label}
              {key === 'family-tree' && (
                <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-full font-semibold
                  ${isActive ? 'bg-red-800 text-yellow-400' : 'bg-yellow-600 text-red-900'}`}>
                  ★
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom contact panel */}
      <div className="border-t border-red-700 px-4 py-4 bg-red-950">
        <p className="text-yellow-500 text-xs font-bold uppercase tracking-wider mb-2">Liên hệ</p>
        <div className="flex items-center gap-2 text-yellow-300 text-sm">
          <Phone size={14} className="text-yellow-500 shrink-0" />
          <div>
            <p className="font-semibold">039 681 8584</p>
            <p className="text-yellow-600 text-xs">Ban quản lý gia phả</p>
          </div>
        </div>
        <div className="mt-3 text-yellow-700 text-xs font-serif italic opacity-75 text-center">
          "Uống nước nhớ nguồn"
        </div>
      </div>
    </aside>
  );
}
