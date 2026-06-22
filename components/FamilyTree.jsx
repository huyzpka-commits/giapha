'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  ZoomIn, ZoomOut, Maximize2, Search,
  Eye, Users, GitBranch,
  X, Plus, Edit2, Trash2, UserPlus, Save,
} from 'lucide-react';
import { familyTree, FAMILY_TITLE } from '@/data/familyData';

// ── Storage key ───────────────────────────────────────────────────────────────
const STORAGE_KEY = 'gia-pha-v1';

// ── Layout constants ──────────────────────────────────────────────────────────
const NW = 152;
const NH = 80;
const HG = 50;
const VG = 80;

// ── Tree helpers ──────────────────────────────────────────────────────────────
function genId() {
  return `n-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function addChild(tree, parentId, newNode) {
  if (tree.id === parentId) {
    return { ...tree, children: [...(tree.children || []), { ...newNode, children: [] }] };
  }
  return { ...tree, children: (tree.children || []).map(c => addChild(c, parentId, newNode)) };
}

function updateNode(tree, nodeId, updates) {
  if (tree.id === nodeId) return { ...tree, ...updates };
  return { ...tree, children: (tree.children || []).map(c => updateNode(c, nodeId, updates)) };
}

function deleteNode(tree, nodeId) {
  return {
    ...tree,
    children: (tree.children || [])
      .filter(c => c.id !== nodeId)
      .map(c => deleteNode(c, nodeId)),
  };
}

function allNodes(node, acc = []) {
  acc.push(node);
  (node.children || []).forEach(c => allNodes(c, acc));
  return acc;
}

// ── Layout ────────────────────────────────────────────────────────────────────
function measure(node) {
  if (!node.children?.length) return { ...node, _w: NW };
  const children = node.children.map(measure);
  const tw = children.reduce((s, c) => s + c._w, 0) + HG * (children.length - 1);
  return { ...node, children, _w: Math.max(NW, tw) };
}

function place(node, cx, cy) {
  const n = { ...node, _x: cx, _y: cy };
  if (!node.children?.length) return n;
  const tw = node.children.reduce((s, c) => s + c._w, 0) + HG * (node.children.length - 1);
  let lx = cx - tw / 2;
  n.children = node.children.map(c => {
    const p = place(c, lx + c._w / 2, cy + NH + VG);
    lx += c._w + HG;
    return p;
  });
  return n;
}

function flatten(node, nodes = [], edges = []) {
  nodes.push(node);
  (node.children || []).forEach(c => {
    edges.push({ px: node._x, py: node._y, cx: c._x, cy: c._y });
    flatten(c, nodes, edges);
  });
  return { nodes, edges };
}

function getBounds(nodes) {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  nodes.forEach(n => {
    x0 = Math.min(x0, n._x - NW / 2);
    x1 = Math.max(x1, n._x + NW / 2);
    y0 = Math.min(y0, n._y);
    y1 = Math.max(y1, n._y + NH);
  });
  return { x0, x1, y0, y1, w: x1 - x0, h: y1 - y0 };
}

// ── Node color ────────────────────────────────────────────────────────────────
function nodeColor(n) {
  if (n.type === 'inlaw') return n.gender === 'female' ? '#1a3a5c' : '#1e3a7a';
  if (n.gender === 'female') return n.status === 'alive' ? '#8b2252' : '#5a1535';
  return n.status === 'alive' ? '#9b1c1c' : '#6b0000';
}

// ── Person form modal ─────────────────────────────────────────────────────────
const EMPTY_FORM = {
  name: '', birth: '', death: '', status: 'alive',
  gender: 'male', type: 'main', generation: 1, note: '', parentId: '',
};

function PersonModal({ mode, initialData, parentGen, existingNodes, onSave, onClose }) {
  const [form, setForm] = useState(() => {
    if (mode === 'edit' && initialData) {
      return {
        name:       initialData.name       || '',
        birth:      initialData.birth      || '',
        death:      initialData.death      || '',
        status:     initialData.status     || 'alive',
        gender:     initialData.gender     || 'male',
        type:       initialData.type       || 'main',
        generation: initialData.generation || 1,
        note:       initialData.note       || '',
        parentId:   '',
      };
    }
    return {
      ...EMPTY_FORM,
      generation: parentGen ? Math.min(parentGen + 1, 8) : 1,
      parentId:   initialData?.id || '',
    };
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.birth) return;
    onSave({
      ...form,
      birth:      parseInt(form.birth),
      death:      form.death ? parseInt(form.death) : null,
      generation: parseInt(form.generation),
      status:     form.death ? 'deceased' : form.status,
    });
  };

  const inputCls = 'w-full px-3 py-2 rounded-lg border border-amber-300 bg-white text-amber-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-400';
  const labelCls = 'block text-amber-800 text-xs font-semibold mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Card */}
      <div className="relative z-10 bg-amber-50 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border-2 border-yellow-600">
        {/* Header */}
        <div className="bg-red-900 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-yellow-300">
            {mode === 'add' ? <UserPlus size={18} /> : <Edit2 size={18} />}
            <h2 className="font-bold font-serif text-base">
              {mode === 'add' ? 'Thêm thành viên mới' : 'Sửa thông tin thành viên'}
            </h2>
          </div>
          <button onClick={onClose} className="text-yellow-500 hover:text-white"><X size={18} /></button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Name */}
          <div>
            <label className={labelCls}>Họ và tên <span className="text-red-600">*</span></label>
            <input className={inputCls} value={form.name}
              onChange={e => set('name', e.target.value)} placeholder="Nguyễn Văn A" required />
          </div>

          {/* Birth / Death */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Năm sinh <span className="text-red-600">*</span></label>
              <input className={inputCls} type="number" value={form.birth}
                onChange={e => set('birth', e.target.value)} placeholder="1990" required min={1600} max={2100} />
            </div>
            <div>
              <label className={labelCls}>Năm mất <span className="text-amber-500">(để trống nếu còn sống)</span></label>
              <input className={inputCls} type="number" value={form.death}
                onChange={e => set('death', e.target.value)} placeholder="—" min={1600} max={2100} />
            </div>
          </div>

          {/* Generation */}
          <div>
            <label className={labelCls}>Đời <span className="text-red-600">*</span></label>
            <select className={inputCls} value={form.generation} onChange={e => set('generation', e.target.value)}>
              {[1,2,3,4,5,6,7,8].map(g => (
                <option key={g} value={g}>Đời {g}</option>
              ))}
            </select>
          </div>

          {/* Gender + Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Giới tính</label>
              <div className="flex gap-2">
                {[['male','Nam'],['female','Nữ']].map(([v,l]) => (
                  <button key={v} type="button"
                    onClick={() => set('gender', v)}
                    className={`flex-1 py-2 text-sm rounded-lg border font-medium transition-colors
                      ${form.gender === v ? 'bg-red-800 text-yellow-300 border-red-700' : 'bg-white text-amber-800 border-amber-300 hover:bg-amber-50'}`}
                  >{l}</button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>Quan hệ</label>
              <div className="flex gap-2">
                {[['main','Chính tộc'],['inlaw','Ngoại tộc']].map(([v,l]) => (
                  <button key={v} type="button"
                    onClick={() => set('type', v)}
                    className={`flex-1 py-2 text-xs rounded-lg border font-medium transition-colors
                      ${form.type === v ? 'bg-red-800 text-yellow-300 border-red-700' : 'bg-white text-amber-800 border-amber-300 hover:bg-amber-50'}`}
                  >{l}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Parent selector (add mode only) */}
          {mode === 'add' && (
            <div>
              <label className={labelCls}>Con của <span className="text-amber-500">(chọn cha/mẹ)</span></label>
              <select className={inputCls} value={form.parentId}
                onChange={e => {
                  const parent = existingNodes.find(n => n.id === e.target.value);
                  set('parentId', e.target.value);
                  if (parent) set('generation', Math.min(parent.generation + 1, 8));
                }}
                required>
                <option value="">— Chọn cha/mẹ —</option>
                {existingNodes.map(n => (
                  <option key={n.id} value={n.id}>
                    {n.name} (Đời {n.generation})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Note */}
          <div>
            <label className={labelCls}>Ghi chú</label>
            <textarea className={inputCls} rows={2} value={form.note}
              onChange={e => set('note', e.target.value)}
              placeholder="Thông tin thêm..." />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-amber-300 text-amber-800 text-sm font-medium hover:bg-amber-100 transition-colors">
              Hủy
            </button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-lg bg-red-800 text-yellow-300 text-sm font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
              <Save size={14} /> {mode === 'add' ? 'Thêm mới' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete confirm dialog ─────────────────────────────────────────────────────
function DeleteConfirm({ node, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-80 mx-4 overflow-hidden border-2 border-red-300">
        <div className="bg-red-700 px-4 py-3 flex items-center gap-2 text-white">
          <Trash2 size={16} /> <span className="font-bold text-sm">Xác nhận xóa</span>
        </div>
        <div className="p-5">
          <p className="text-gray-700 text-sm mb-1">Bạn có chắc muốn xóa:</p>
          <p className="font-bold text-red-900 text-base mb-1">{node.name}</p>
          <p className="text-amber-600 text-xs mb-4">Đời {node.generation} · Tất cả con cháu bên dưới cũng sẽ bị xóa.</p>
          <div className="flex gap-3">
            <button onClick={onCancel}
              className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50">
              Hủy
            </button>
            <button onClick={onConfirm}
              className="flex-1 py-2 rounded-lg bg-red-700 text-white text-sm font-semibold hover:bg-red-600">
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Detail + action panel ─────────────────────────────────────────────────────
function DetailPanel({ node, onClose, onEdit, onAddChild, onDelete }) {
  if (!node) return null;
  return (
    <div className="absolute bottom-16 right-4 w-72 bg-red-900 border-2 border-yellow-600 rounded-2xl shadow-2xl z-30">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-red-700 flex items-start justify-between">
        <div>
          <h3 className="text-yellow-400 font-bold text-base font-serif">{node.name}</h3>
          <p className="text-yellow-600 text-xs mt-0.5">Đời {node.generation}</p>
        </div>
        <button onClick={onClose} className="text-yellow-600 hover:text-white p-0.5 rounded-full hover:bg-red-700">
          <X size={15} />
        </button>
      </div>

      {/* Info */}
      <div className="px-4 py-3 space-y-1.5 text-sm border-b border-red-700">
        {[
          ['Năm sinh',  node.birth],
          ['Năm mất',   node.death || '—'],
          ['Trạng thái', node.status === 'alive' ? '● Còn sống' : '● Đã mất'],
          ['Giới tính', node.gender === 'male' ? 'Nam' : 'Nữ'],
          ['Quan hệ',   node.type === 'main' ? 'Chính tộc' : 'Ngoại tộc'],
        ].map(([label, val]) => (
          <div key={label} className="flex gap-2">
            <span className="text-yellow-500 w-24 shrink-0">{label}:</span>
            <span className={val === '● Còn sống' ? 'text-green-400' : val === '● Đã mất' ? 'text-gray-400' : 'text-yellow-100'}>
              {val}
            </span>
          </div>
        ))}
        {node.note && (
          <div className="flex gap-2">
            <span className="text-yellow-500 w-24 shrink-0">Ghi chú:</span>
            <span className="text-yellow-300 italic text-xs leading-relaxed">{node.note}</span>
          </div>
        )}
        {node.spouse && (
          <div className="mt-1 pt-2 border-t border-red-700">
            <p className="text-yellow-500 text-xs mb-1 font-semibold">Phối ngẫu:</p>
            <p className="text-yellow-200">{node.spouse.name}</p>
            <p className="text-yellow-500 text-xs">{node.spouse.birth}–{node.spouse.death || 'nay'}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 flex gap-2">
        <button onClick={() => onAddChild(node)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg
            bg-yellow-500 text-red-900 text-xs font-bold hover:bg-yellow-400 transition-colors">
          <Plus size={13} /> Thêm con
        </button>
        <button onClick={() => onEdit(node)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg
            bg-amber-200 text-amber-900 text-xs font-bold hover:bg-amber-300 transition-colors">
          <Edit2 size={13} /> Sửa
        </button>
        <button onClick={() => onDelete(node)}
          className="flex items-center justify-center gap-1 py-2 px-3 rounded-lg
            bg-red-700 text-white text-xs font-bold hover:bg-red-600 transition-colors">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

// ── Calligraphy ───────────────────────────────────────────────────────────────
const LEFT_CH  = ['飲','水','思','源','，','慎','終','追','遠'];
const RIGHT_CH = ['子','孫','昌','盛','，','家','道','興','隆'];

function Calligraphy({ side, x, startY }) {
  const chars = side === 'left' ? LEFT_CH : RIGHT_CH;
  return (
    <g>
      <rect x={x - 18} y={startY - 10} width={36} height={chars.length * 46 + 20}
        rx={4} fill="#8B0000" opacity={0.07} />
      {chars.map((ch, i) => (
        <text key={i} x={x} y={startY + i * 46}
          textAnchor="middle" fill="#8B0000"
          fontSize={26} fontFamily="serif" fontWeight="bold" opacity={0.32}>{ch}</text>
      ))}
    </g>
  );
}

// ── Legend ────────────────────────────────────────────────────────────────────
const LEGEND = [
  { color: '#9b1c1c', label: 'Nam · sống'  },
  { color: '#6b0000', label: 'Nam · mất'   },
  { color: '#8b2252', label: 'Nữ · sống'   },
  { color: '#5a1535', label: 'Nữ · mất'    },
  { color: '#1e3a7a', label: 'Ngoại tộc'   },
];

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function FamilyTree() {
  const containerRef = useRef(null);

  // ── Tree data state (persisted to localStorage) ──────────────────────────
  const [treeData, setTreeData] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return familyTree;
  });

  // Persist on change
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(treeData)); } catch {}
  }, [treeData]);

  // ── UI state ─────────────────────────────────────────────────────────────
  const [selected,   setSelected]   = useState(null);
  const [viewMode,   setViewMode]   = useState('all');
  const [query,      setQuery]      = useState('');
  const [zoom,       setZoom]       = useState(0.72);
  const [pan,        setPan]        = useState({ x: 0, y: 60 });
  const [modal,      setModal]      = useState(null);   // { mode:'add'|'edit', node }
  const [delTarget,  setDelTarget]  = useState(null);   // node to delete
  const dragRef = useRef(null);

  // ── Layout ───────────────────────────────────────────────────────────────
  const laidOut = useMemo(() => {
    const m = measure(treeData);
    return place(m, 0, 0);
  }, [treeData]);

  const { nodes, edges } = useMemo(() => flatten(laidOut), [laidOut]);
  const bb = useMemo(() => getBounds(nodes), [nodes]);

  // ── Auto-fit on mount ─────────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const cw = el.clientWidth, ch = el.clientHeight;
    const fz = Math.min(cw / (bb.w + 260), ch / (bb.h + 220), 1.2);
    const z  = Math.max(0.25, fz);
    setZoom(z);
    setPan({ x: cw / 2 - (bb.x0 + bb.w / 2) * z, y: 80 });
  }, []); // only on mount

  // ── Pan ───────────────────────────────────────────────────────────────────
  const onMouseDown = (e) => {
    if (e.button !== 0 || modal) return;
    dragRef.current = { sx: e.clientX - pan.x, sy: e.clientY - pan.y };
  };
  const onMouseMove = useCallback((e) => {
    if (!dragRef.current) return;
    setPan({ x: e.clientX - dragRef.current.sx, y: e.clientY - dragRef.current.sy });
  }, []);
  const onMouseUp = () => { dragRef.current = null; };

  // ── Wheel zoom ────────────────────────────────────────────────────────────
  const onWheel = useCallback((e) => {
    e.preventDefault();
    setZoom(z => Math.min(Math.max(z * (e.deltaY > 0 ? 0.9 : 1.1), 0.15), 4));
  }, []);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  // ── Zoom buttons ──────────────────────────────────────────────────────────
  const zoomIn  = () => setZoom(z => Math.min(z * 1.2, 4));
  const zoomOut = () => setZoom(z => Math.max(z / 1.2, 0.15));
  const fitView = () => {
    const el = containerRef.current;
    if (!el) return;
    const cw = el.clientWidth, ch = el.clientHeight;
    const z  = Math.max(0.2, Math.min(cw / (bb.w + 260), ch / (bb.h + 220)));
    setZoom(z);
    setPan({ x: cw / 2 - (bb.x0 + bb.w / 2) * z, y: 80 });
  };

  // ── Search ────────────────────────────────────────────────────────────────
  const hits = query
    ? nodes.filter(n => n.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  // ── CRUD handlers ─────────────────────────────────────────────────────────
  const openAddRoot = () => setModal({ mode: 'add', node: null });
  const openAddChild = (parentNode) => { setSelected(null); setModal({ mode: 'add', node: parentNode }); };
  const openEdit    = (node)        => { setSelected(null); setModal({ mode: 'edit', node }); };
  const openDelete  = (node)        => { setSelected(null); setDelTarget(node); };

  const handleSave = (formData) => {
    if (modal.mode === 'add') {
      const newNode = {
        id:         genId(),
        name:       formData.name,
        birth:      formData.birth,
        death:      formData.death,
        status:     formData.status,
        gender:     formData.gender,
        type:       formData.type,
        generation: formData.generation,
        note:       formData.note,
        children:   [],
      };
      setTreeData(prev => addChild(prev, formData.parentId, newNode));
    } else {
      setTreeData(prev => updateNode(prev, modal.node.id, {
        name:       formData.name,
        birth:      formData.birth,
        death:      formData.death,
        status:     formData.status,
        gender:     formData.gender,
        type:       formData.type,
        generation: formData.generation,
        note:       formData.note,
      }));
    }
    setModal(null);
  };

  const handleDelete = () => {
    if (!delTarget) return;
    // Cannot delete root
    if (delTarget.id === treeData.id) {
      alert('Không thể xóa tổ tiên gốc của cây gia phả.');
      setDelTarget(null);
      return;
    }
    setTreeData(prev => deleteNode(prev, delTarget.id));
    setDelTarget(null);
    setSelected(null);
  };

  const resetData = () => {
    if (confirm('Reset về dữ liệu mẫu ban đầu? Mọi thay đổi sẽ mất.')) {
      setTreeData(familyTree);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // ── Generation Y map ──────────────────────────────────────────────────────
  const genYMap = {};
  nodes.forEach(n => { if (genYMap[n.generation] === undefined) genYMap[n.generation] = n._y; });

  const flatNodes = useMemo(() => allNodes(treeData), [treeData]);

  return (
    <div className="flex flex-col h-full bg-amber-50">

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 border-b border-amber-300 flex-shrink-0 flex-wrap">
        {/* View mode */}
        <div className="flex rounded-lg overflow-hidden border border-amber-400 text-sm">
          {[
            { key: 'all',        label: 'Toàn cảnh', Icon: Eye       },
            { key: 'ancestor',   label: 'Tổ tiên',   Icon: Users     },
            { key: 'descendant', label: 'Hậu duệ',   Icon: GitBranch },
          ].map(({ key, label, Icon }) => (
            <button key={key} onClick={() => setViewMode(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-medium transition-colors
                ${viewMode === key ? 'bg-red-800 text-yellow-300' : 'bg-white text-amber-900 hover:bg-amber-50'}`}>
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>

        {/* Add member button */}
        <button onClick={openAddRoot}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-800 text-yellow-300
            text-sm font-semibold hover:bg-red-700 transition-colors border border-red-700">
          <UserPlus size={14} /> Thêm thành viên
        </button>

        {/* Search */}
        <div className="relative w-52">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-amber-600" />
          <input type="text" placeholder="Tìm thành viên..." value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-white border border-amber-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900 placeholder-amber-400" />
          {hits.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-amber-200
              rounded-lg shadow-xl z-50 max-h-44 overflow-y-auto">
              {hits.map(n => (
                <button key={n.id}
                  onClick={() => { setSelected(n); setQuery(''); }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-amber-50 text-amber-900 border-b border-amber-100 last:border-0">
                  <span className="font-semibold">{n.name}</span>
                  <span className="ml-2 text-amber-500 text-xs">Đời {n.generation}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={zoomOut} className="p-1.5 rounded hover:bg-amber-200 text-amber-800"><ZoomOut size={15} /></button>
          <span className="text-sm font-mono text-amber-700 w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={zoomIn}  className="p-1.5 rounded hover:bg-amber-200 text-amber-800"><ZoomIn  size={15} /></button>
          <button onClick={fitView} className="p-1.5 rounded hover:bg-amber-200 text-amber-800 ml-1"><Maximize2 size={15} /></button>
          <button onClick={resetData}
            className="ml-2 px-2 py-1 text-xs rounded border border-amber-300 text-amber-600 hover:bg-amber-200">
            Reset
          </button>
        </div>
      </div>

      {/* ── Tree canvas ──────────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing"
        style={{ background: 'linear-gradient(160deg, #fffbeb 0%, #fef9c3 100%)' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {/* Title banner */}
        <div className="absolute top-0 left-0 right-0 pointer-events-none z-10 text-center pt-3 pb-2
          bg-gradient-to-b from-amber-100/80 to-transparent">
          <p className="text-red-900 font-serif font-bold text-base tracking-widest drop-shadow">
            ❖ {FAMILY_TITLE} ❖
          </p>
          <p className="text-amber-600 text-xs font-serif mt-0.5 opacity-60">
            ～ ～ ～ ～ ～ ～ ～ ～ ～ ～ ～ ～ ～ ～ ～ ～ ～ ～
          </p>
        </div>

        <svg style={{ width: '100%', height: '100%' }} className="select-none">
          <defs>
            <pattern id="grid" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <circle cx="40" cy="40" r="1" fill="#d97706" opacity="0.1" />
              <line x1="0" y1="80" x2="80" y2="0" stroke="#d97706" strokeWidth="0.3" opacity="0.06" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* Dragon header */}
            <text x={(bb.x0 + bb.x1) / 2} y={bb.y0 - 14}
              textAnchor="middle" fontSize={30} fill="#8B0000" opacity={0.18}
              fontFamily="serif" fontWeight="bold">❧ 龍 鳳 呈 祥 ❧</text>
            <text x={(bb.x0 + bb.x1) / 2} y={bb.y0 + 10}
              textAnchor="middle" fontSize={12} fill="#8B0000" opacity={0.22}
              fontFamily="serif" letterSpacing="8">
              ～ ～ ～ ～ ～ ～ ～ ～ ～ ～ ～ ～ ～ ～
            </text>

            {/* Generation labels */}
            {Object.entries(genYMap).map(([gen, gy]) => (
              <text key={gen} x={bb.x0 - 18} y={gy + NH / 2 + 5}
                textAnchor="end" fill="#92400e"
                fontSize={12} fontWeight="bold" fontFamily="serif" opacity={0.8}>
                Đời {gen}
              </text>
            ))}

            {/* Guide lines */}
            {Object.entries(genYMap).map(([gen, gy]) => (
              <line key={`g${gen}`} x1={bb.x0 - 8} y1={gy + NH / 2} x2={bb.x1 + 8} y2={gy + NH / 2}
                stroke="#d97706" strokeWidth={0.5} strokeDasharray="4 8" opacity={0.18} />
            ))}

            {/* Calligraphy */}
            <Calligraphy side="left"  x={bb.x0 - 70} startY={bb.y0 + 30} />
            <Calligraphy side="right" x={bb.x1 + 70} startY={bb.y0 + 30} />

            {/* Edges */}
            {edges.map((e, i) => {
              const midY = e.py + NH + VG / 2;
              return (
                <path key={i}
                  d={`M ${e.px} ${e.py + NH} V ${midY} H ${e.cx} V ${e.cy}`}
                  fill="none" stroke="#8B0000" strokeWidth={1.8} strokeOpacity={0.55} />
              );
            })}

            {/* Nodes */}
            {nodes.map(node => {
              const x = node._x - NW / 2;
              const y = node._y;
              const isSel  = selected?.id === node.id;
              const isHit  = hits.some(h => h.id === node.id);
              const fill   = nodeColor(node);
              const stroke = isSel ? '#fff' : isHit ? '#00e676' : '#c9a227';
              const sw     = isSel ? 3 : isHit ? 2.5 : 1.5;
              const life   = node.death ? `${node.birth}–${node.death}` : `${node.birth} – nay`;

              return (
                <g key={node.id} onClick={() => setSelected(node)} style={{ cursor: 'pointer' }}>
                  {/* Shadow */}
                  <rect x={x + 3} y={y + 3} width={NW} height={NH} rx={8} fill="rgba(0,0,0,0.25)" />
                  {/* Body */}
                  <rect x={x} y={y} width={NW} height={NH} rx={8}
                    fill={fill} stroke={stroke} strokeWidth={sw} />
                  {/* Gold accent top */}
                  <rect x={x + 12} y={y + 4} width={NW - 24} height={3} rx={1.5} fill="#c9a227" opacity={0.6} />
                  {/* Name */}
                  <text x={node._x} y={y + 26} textAnchor="middle" fill="#FFD700"
                    fontSize={13.5} fontWeight="bold" fontFamily="'Times New Roman', serif">
                    {node.name}
                  </text>
                  {/* Lifespan */}
                  <text x={node._x} y={y + 44} textAnchor="middle" fill="#F5DEB3" fontSize={11}>
                    {life}
                  </text>
                  {/* Generation */}
                  <text x={node._x} y={y + 62} textAnchor="middle"
                    fill="#FFDAB9" fontSize={10} fontStyle="italic" fontFamily="serif">
                    {`Đời ${node.generation}${node.type === 'inlaw' ? ' · Ngoại tộc' : ''}`}
                  </text>
                  {/* Status dot */}
                  <circle cx={x + NW - 11} cy={y + 12} r={5}
                    fill={node.status === 'alive' ? '#22c55e' : '#6b7280'} />
                  {node.status === 'alive' &&
                    <circle cx={x + NW - 11} cy={y + 12} r={2.5} fill="#16a34a" />}

                  {/* Quick edit badge (top-left, always visible) */}
                  <g onClick={(e) => { e.stopPropagation(); openEdit(node); }}
                    style={{ cursor: 'pointer' }}>
                    <circle cx={x + 12} cy={y + 12} r={9} fill="#c9a227" opacity={0.85} />
                    <text x={x + 12} y={y + 16} textAnchor="middle"
                      fill="#7b2d00" fontSize={10} fontWeight="bold">✎</text>
                  </g>

                  {/* Quick add-child badge (bottom-center) */}
                  <g onClick={(e) => { e.stopPropagation(); openAddChild(node); }}
                    style={{ cursor: 'pointer' }}>
                    <circle cx={node._x} cy={y + NH - 10} r={9} fill="#22c55e" opacity={0.85} />
                    <text x={node._x} y={y + NH - 6} textAnchor="middle"
                      fill="#fff" fontSize={12} fontWeight="bold">+</text>
                  </g>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Detail panel */}
        {selected && (
          <DetailPanel
            node={selected}
            onClose={() => setSelected(null)}
            onEdit={openEdit}
            onAddChild={openAddChild}
            onDelete={openDelete}
          />
        )}
      </div>

      {/* ── Legend footer ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 px-4 py-2 bg-amber-100 border-t border-amber-300 flex-shrink-0 text-xs flex-wrap">
        <span className="text-amber-800 font-semibold">Chú thích:</span>
        {LEGEND.map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded border border-yellow-600" style={{ backgroundColor: color }} />
            <span className="text-amber-800">{label}</span>
          </div>
        ))}
        <div className="flex items-center gap-3 ml-auto text-amber-600">
          <span>✎ = sửa nhanh</span>
          <span>+ = thêm con</span>
          <span className="font-mono">Zoom: {Math.round(zoom * 100)}%</span>
        </div>
      </div>

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      {modal && (
        <PersonModal
          mode={modal.mode}
          initialData={modal.node}
          parentGen={modal.mode === 'add' ? modal.node?.generation : undefined}
          existingNodes={flatNodes}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {delTarget && (
        <DeleteConfirm
          node={delTarget}
          onConfirm={handleDelete}
          onCancel={() => setDelTarget(null)}
        />
      )}
    </div>
  );
}
