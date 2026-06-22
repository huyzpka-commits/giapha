// ─────────────────────────────────────────────────────────────────────────────
// GIA PHẢ BẾP TRƯỞNG CHI GIÁP – HỌ NGUYỄN VĂN
// 8 đời · Cây gia phả mẫu
// ─────────────────────────────────────────────────────────────────────────────

export const FAMILY_TITLE = 'GIA PHẢ BẾP TRƯỞNG CHI GIÁP - HỌ NGUYỄN VĂN';

export const familyTree = {
  id: '1-1',
  name: 'Nguyễn Văn Thủy Tổ',
  birth: 1700, death: 1782,
  status: 'deceased', gender: 'male', type: 'main', generation: 1,
  note: 'Thủy tổ Chi Giáp – người lập nên dòng họ Nguyễn Văn tại vùng đất này',
  children: [
    // ── Đời 2: con trai cả ──────────────────────────────────────────
    {
      id: '2-1',
      name: 'Nguyễn Văn Hưng',
      birth: 1730, death: 1808,
      status: 'deceased', gender: 'male', type: 'main', generation: 2,
      spouse: { id: '2-1s', name: 'Lê Thị Tuyết', birth: 1734, death: 1812,
                status: 'deceased', gender: 'female', type: 'inlaw' },
      note: 'Trưởng Chi Giáp đời thứ hai',
      children: [
        // ── Đời 3 ─────────────────────────────────────────────────
        {
          id: '3-1',
          name: 'Nguyễn Văn Trí',
          birth: 1758, death: 1840,
          status: 'deceased', gender: 'male', type: 'main', generation: 3,
          spouse: { id: '3-1s', name: 'Trần Thị Bích', birth: 1762, death: 1843,
                    status: 'deceased', gender: 'female', type: 'inlaw' },
          children: [
            // ── Đời 4 ───────────────────────────────────────────
            {
              id: '4-1',
              name: 'Nguyễn Văn Sơn',
              birth: 1786, death: 1865,
              status: 'deceased', gender: 'male', type: 'main', generation: 4,
              children: [
                // ── Đời 5 ─────────────────────────────────────
                {
                  id: '5-1',
                  name: 'Nguyễn Văn Phú',
                  birth: 1815, death: 1892,
                  status: 'deceased', gender: 'male', type: 'main', generation: 5,
                  children: [
                    // ── Đời 6 ───────────────────────────────
                    {
                      id: '6-1',
                      name: 'Nguyễn Văn Trường',
                      birth: 1848, death: 1928,
                      status: 'deceased', gender: 'male', type: 'main', generation: 6,
                      children: [
                        // ── Đời 7 ─────────────────────────
                        {
                          id: '7-1',
                          name: 'Nguyễn Văn Khoa',
                          birth: 1882, death: 1965,
                          status: 'deceased', gender: 'male', type: 'main', generation: 7,
                          children: [
                            // ── Đời 8 ───────────────────
                            { id: '8-1', name: 'Nguyễn Văn Hào',   birth: 1918, death: null, status: 'alive',    gender: 'male',   type: 'main', generation: 8, children: [] },
                            { id: '8-2', name: 'Nguyễn Thị Thảo',  birth: 1921, death: null, status: 'alive',    gender: 'female', type: 'main', generation: 8, children: [] },
                          ],
                        },
                        {
                          id: '7-2',
                          name: 'Nguyễn Thị Bình',
                          birth: 1885, death: 1968,
                          status: 'deceased', gender: 'female', type: 'main', generation: 7,
                          children: [],
                        },
                      ],
                    },
                    {
                      id: '6-2',
                      name: 'Nguyễn Thị Duyên',
                      birth: 1852, death: 1932,
                      status: 'deceased', gender: 'female', type: 'main', generation: 6,
                      children: [],
                    },
                  ],
                },
                {
                  id: '5-2',
                  name: 'Nguyễn Thị Nhi',
                  birth: 1818, death: 1898,
                  status: 'deceased', gender: 'female', type: 'main', generation: 5,
                  children: [],
                },
              ],
            },
            {
              id: '4-2',
              name: 'Nguyễn Văn Toàn',
              birth: 1789, death: 1868,
              status: 'deceased', gender: 'male', type: 'main', generation: 4,
              children: [
                {
                  id: '5-3',
                  name: 'Nguyễn Văn Lân',
                  birth: 1820, death: 1900,
                  status: 'deceased', gender: 'male', type: 'main', generation: 5,
                  children: [
                    {
                      id: '6-3',
                      name: 'Nguyễn Văn Thắng',
                      birth: 1855, death: 1938,
                      status: 'deceased', gender: 'male', type: 'main', generation: 6,
                      children: [
                        {
                          id: '7-3',
                          name: 'Nguyễn Văn Hiếu',
                          birth: 1888, death: 1970,
                          status: 'deceased', gender: 'male', type: 'main', generation: 7,
                          children: [
                            { id: '8-3', name: 'Nguyễn Văn Tú', birth: 1925, death: null, status: 'alive', gender: 'male', type: 'main', generation: 8, children: [] },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              id: '4-3',
              name: 'Nguyễn Thị Liễu',
              birth: 1792, death: 1872,
              status: 'deceased', gender: 'female', type: 'main', generation: 4,
              children: [],
            },
          ],
        },
        // ── Đời 3 · con thứ ──────────────────────────────────────
        {
          id: '3-2',
          name: 'Nguyễn Văn Đức',
          birth: 1762, death: 1845,
          status: 'deceased', gender: 'male', type: 'main', generation: 3,
          children: [
            {
              id: '4-4',
              name: 'Nguyễn Văn Quang',
              birth: 1793, death: 1875,
              status: 'deceased', gender: 'male', type: 'main', generation: 4,
              children: [
                {
                  id: '5-4',
                  name: 'Nguyễn Thị Minh',
                  birth: 1825, death: 1908,
                  status: 'deceased', gender: 'female', type: 'main', generation: 5,
                  children: [],
                },
                {
                  id: '5-5',
                  name: 'Nguyễn Văn Bền',
                  birth: 1828, death: 1910,
                  status: 'deceased', gender: 'male', type: 'main', generation: 5,
                  children: [
                    {
                      id: '6-4',
                      name: 'Nguyễn Văn Tuấn',
                      birth: 1860, death: 1942,
                      status: 'deceased', gender: 'male', type: 'main', generation: 6,
                      children: [
                        {
                          id: '7-4',
                          name: 'Nguyễn Văn Thành',
                          birth: 1893, death: 1975,
                          status: 'deceased', gender: 'male', type: 'main', generation: 7,
                          children: [
                            { id: '8-4', name: 'Nguyễn Thị Loan', birth: 1930, death: null, status: 'alive', gender: 'female', type: 'main', generation: 8, children: [] },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    // ── Đời 2: con trai thứ ─────────────────────────────────────────
    {
      id: '2-2',
      name: 'Nguyễn Văn Đạo',
      birth: 1734, death: 1812,
      status: 'deceased', gender: 'male', type: 'main', generation: 2,
      spouse: { id: '2-2s', name: 'Phạm Thị Ngà', birth: 1738, death: 1815,
                status: 'deceased', gender: 'female', type: 'inlaw' },
      children: [
        {
          id: '3-3',
          name: 'Nguyễn Văn Lợi',
          birth: 1766, death: 1848,
          status: 'deceased', gender: 'male', type: 'main', generation: 3,
          children: [
            {
              id: '4-5',
              name: 'Nguyễn Văn Cát',
              birth: 1798, death: 1878,
              status: 'deceased', gender: 'male', type: 'main', generation: 4,
              children: [
                {
                  id: '5-6',
                  name: 'Nguyễn Văn Kiên',
                  birth: 1832, death: 1912,
                  status: 'deceased', gender: 'male', type: 'main', generation: 5,
                  children: [
                    {
                      id: '6-5',
                      name: 'Nguyễn Văn Dũng',
                      birth: 1866, death: 1946,
                      status: 'deceased', gender: 'male', type: 'main', generation: 6,
                      children: [
                        {
                          id: '7-5',
                          name: 'Nguyễn Thị Thu',
                          birth: 1900, death: null,
                          status: 'alive', gender: 'female', type: 'main', generation: 7,
                          children: [
                            { id: '8-5', name: 'Nguyễn Văn Nam', birth: 1935, death: null, status: 'alive', gender: 'male', type: 'main', generation: 8, children: [] },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              id: '4-6',
              name: 'Nguyễn Thị Yến',
              birth: 1800, death: 1880,
              status: 'deceased', gender: 'female', type: 'main', generation: 4,
              children: [],
            },
          ],
        },
      ],
    },
  ],
};

// ── Thống kê tổng quan ────────────────────────────────────────────────────────
export const familyStats = {
  totalMembers: 35,
  generations:  8,
  aliveMale:    4,
  aliveFemale:  3,
  established:  1700,
};

// ── Tin tức / Sự kiện mẫu ────────────────────────────────────────────────────
export const sampleNews = [
  { id: 1, date: '2024-01-15', title: 'Họp mặt đầu năm Giáp Thìn 2024', summary: 'Toàn bộ gia tộc họp mặt tại nhà thờ họ, tưởng nhớ tổ tiên và bàn kế hoạch tu bổ gia phả năm 2024.' },
  { id: 2, date: '2023-12-20', title: 'Hoàn thành phục dựng nhà thờ họ', summary: 'Sau 2 năm xây dựng, nhà thờ họ Nguyễn Văn chi Giáp đã được hoàn thành và khánh thành.' },
  { id: 3, date: '2023-08-10', title: 'Lễ giỗ tổ lần thứ 50', summary: 'Ngày giỗ tổ năm nay có sự tham dự của hơn 120 thành viên trong dòng tộc từ khắp nơi về.' },
];

// ── Danh bạ mẫu ──────────────────────────────────────────────────────────────
export const sampleContacts = [
  { id: 1, name: 'Nguyễn Văn Hào',  gen: 8, phone: '0912 345 678', address: 'Hà Nội',    role: 'Trưởng họ' },
  { id: 2, name: 'Nguyễn Văn Tú',   gen: 8, phone: '0923 456 789', address: 'TP.HCM',    role: 'Thành viên' },
  { id: 3, name: 'Nguyễn Thị Loan', gen: 8, phone: '0934 567 890', address: 'Đà Nẵng',   role: 'Thành viên' },
  { id: 4, name: 'Nguyễn Văn Nam',  gen: 8, phone: '0945 678 901', address: 'Cần Thơ',   role: 'Thành viên' },
  { id: 5, name: 'Nguyễn Thị Thảo', gen: 8, phone: '0956 789 012', address: 'Hải Phòng', role: 'Thành viên' },
];
