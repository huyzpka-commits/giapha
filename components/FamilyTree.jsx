'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  ZoomIn, ZoomOut, Maximize2, Search,
  Eye, Users, GitBranch, X, Edit2, Trash2,
  UserPlus, Save, ChevronDown, AlertCircle,
} from 'lucide-react';
import { familyTree, FAMILY_TITLE } from '@/data/familyData';

// ─────────────────────────── constants ───────────────────────────────────────
const STORAGE_KEY = 'gia-pha-v2';
const NW = 160;   // node width
const NH = 84;    // node height
const HG = 55;    // horizontal gap
const VG = 90;    // vertical gap

// ─────────────────────────── tree helpers ────────────────────────────────────
const genId = () => `n${Date.now().toString(36)}${Math.random().toString(36).slice(2,5)}`;

function addChild(tree, parentId, node) {
  if (tree.id === parentId)
    return { ...tree, children: [...(tree.children||[]), {...node, children:[]}] };
  return { ...tree, children: (tree.children||[]).map(c => addChild(c, parentId, node)) };
}

function updateNode(tree, id, patch) {
  if (tree.id === id) return { ...tree, ...patch };
  return { ...tree, children: (tree.children||[]).map(c => updateNode(c, id, patch)) };
}

function removeNode(tree, id) {
  return {
    ...tree,
    children: (tree.children||[]).filter(c=>c.id!==id).map(c=>removeNode(c,id)),
  };
}

function flatList(node, out=[]) {
  out.push(node);
  (node.children||[]).forEach(c => flatList(c, out));
  return out;
}

// ─────────────────────────── layout ──────────────────────────────────────────
function measure(node) {
  if (!node.children?.length) return { ...node, _w: NW };
  const kids = node.children.map(measure);
  const tw = kids.reduce((s,c)=>s+c._w,0) + HG*(kids.length-1);
  return { ...node, children: kids, _w: Math.max(NW, tw) };
}

function place(node, cx, cy) {
  const n = { ...node, _x:cx, _y:cy };
  if (!node.children?.length) return n;
  const tw = node.children.reduce((s,c)=>s+c._w,0) + HG*(node.children.length-1);
  let lx = cx - tw/2;
  n.children = node.children.map(c => {
    const p = place(c, lx + c._w/2, cy + NH + VG);
    lx += c._w + HG;
    return p;
  });
  return n;
}

function flattenTree(node, nodes=[], edges=[]) {
  nodes.push(node);
  (node.children||[]).forEach(c => {
    edges.push({ px:node._x, py:node._y, cx:c._x, cy:c._y });
    flattenTree(c, nodes, edges);
  });
  return { nodes, edges };
}

function bbox(nodes) {
  let x0=Infinity, x1=-Infinity, y0=Infinity, y1=-Infinity;
  nodes.forEach(n => {
    x0=Math.min(x0,n._x-NW/2); x1=Math.max(x1,n._x+NW/2);
    y0=Math.min(y0,n._y);       y1=Math.max(y1,n._y+NH);
  });
  return {x0,x1,y0,y1,w:x1-x0,h:y1-y0};
}

// ─────────────────────────── node fill ───────────────────────────────────────
function fillOf(n) {
  if (n.type==='inlaw') return n.gender==='female' ? '#1e3a5f' : '#1e3d7a';
  if (n.gender==='female') return n.status==='alive' ? '#8B2252' : '#5A1535';
  return n.status==='alive' ? '#9B1C1C' : '#6B0000';
}

// ─────────────────────────── Person Modal ────────────────────────────────────
function Field({ label, error, required, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-amber-800 mb-1">
        {label}{required && <span className="text-red-600 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 mt-1 text-red-500 text-xs">
          <AlertCircle size={11}/>{error}
        </p>
      )}
    </div>
  );
}

const inp = 'w-full px-3 py-2 rounded-lg border bg-white text-amber-900 text-sm focus:outline-none focus:ring-2 transition-colors';
const inpOk  = `${inp} border-amber-300 focus:ring-amber-400`;
const inpErr = `${inp} border-red-400 focus:ring-red-400 bg-red-50`;

function PersonModal({ mode, initialData, allNodesArr, onSave, onClose }) {
  const isAdd = mode === 'add';

  // Default parent: if triggered from a node use it, else use root
  const defaultParent = isAdd
    ? (initialData ?? allNodesArr[0] ?? null)
    : null;

  const [form, setForm] = useState(() => ({
    name:       isAdd ? '' : (initialData?.name       ?? ''),
    birth:      isAdd ? '' : String(initialData?.birth ?? ''),
    death:      isAdd ? '' : (initialData?.death ? String(initialData.death) : ''),
    gender:     isAdd ? 'male'  : (initialData?.gender     ?? 'male'),
    type:       isAdd ? 'main'  : (initialData?.type       ?? 'main'),
    generation: isAdd
      ? (defaultParent ? Math.min((defaultParent.generation||1)+1, 8) : 1)
      : (initialData?.generation ?? 1),
    note:       isAdd ? '' : (initialData?.note ?? ''),
    parentId:   isAdd ? (defaultParent?.id ?? '') : '',
  }));

  const [errs, setErrs] = useState({});

  const set = useCallback((k,v) => setForm(f=>({...f,[k]:v})), []);

  const changeParent = (pid) => {
    set('parentId', pid);
    const p = allNodesArr.find(n=>n.id===pid);
    if (p) set('generation', Math.min((p.generation||1)+1, 8));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = 'Vui lòng nhập họ tên';
    if (!form.birth)        e.birth = 'Vui lòng nhập năm sinh';
    else if (+form.birth < 1600 || +form.birth > 2100) e.birth = 'Năm sinh 1600–2100';
    if (form.death && +form.death <= +form.birth) e.death = 'Phải lớn hơn năm sinh';
    if (isAdd && !form.parentId) e.parentId = 'Vui lòng chọn cha/mẹ';
    setErrs(e);
    return !Object.keys(e).length;
  };

  const submit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      ...form,
      birth:      +form.birth,
      death:      form.death ? +form.death : null,
      generation: +form.generation,
      status:     form.death ? 'deceased' : 'alive',
    });
  };

  const Toggle = ({ field, opts }) => (
    <div className="flex rounded-lg overflow-hidden border border-amber-200">
      {opts.map(([v,l]) => (
        <button key={v} type="button" onClick={()=>set(field,v)}
          className={`flex-1 py-2 text-xs font-semibold transition-colors
            ${form[field]===v
              ? 'bg-red-800 text-yellow-300'
              : 'bg-white text-amber-700 hover:bg-amber-50'}`}>
          {l}
        </button>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative z-10 w-full max-w-md bg-amber-50 rounded-2xl shadow-2xl
        border-2 border-yellow-600 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-900 to-red-800 px-5 py-4
          flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
              {isAdd ? <UserPlus size={16} className="text-yellow-400"/> : <Edit2 size={16} className="text-yellow-400"/>}
            </div>
            <div>
              <h2 className="text-yellow-300 font-bold font-serif text-sm">
                {isAdd ? 'Thêm thành viên mới' : `Sửa: ${initialData?.name}`}
              </h2>
              {isAdd && <p className="text-yellow-600 text-xs">Điền đầy đủ thông tin bên dưới</p>}
            </div>
          </div>
          <button onClick={onClose}
            className="text-yellow-600 hover:text-white hover:bg-red-700/50 rounded-full p-1 transition-colors">
            <X size={17}/>
          </button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Parent selector – add mode */}
          {isAdd && (
            <Field label="Con của (cha/mẹ)" error={errs.parentId} required>
              <div className="relative">
                <select
                  value={form.parentId}
                  onChange={e=>changeParent(e.target.value)}
                  className={`${errs.parentId ? inpErr : inpOk} appearance-none pr-8`}
                >
                  <option value="">— Chọn cha/mẹ —</option>
                  {allNodesArr.map(n=>(
                    <option key={n.id} value={n.id}>
                      {n.name}  (Đời {n.generation})
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-amber-500 pointer-events-none"/>
              </div>
            </Field>
          )}

          {/* Name */}
          <Field label="Họ và tên" error={errs.name} required>
            <input type="text" value={form.name}
              onChange={e=>set('name',e.target.value)}
              placeholder="Nguyễn Văn A"
              className={errs.name ? inpErr : inpOk}/>
          </Field>

          {/* Birth / Death */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Năm sinh" error={errs.birth} required>
              <input type="number" value={form.birth}
                onChange={e=>set('birth',e.target.value)}
                placeholder="1990" min={1600} max={2100}
                className={errs.birth ? inpErr : inpOk}/>
            </Field>
            <Field label="Năm mất" error={errs.death}>
              <input type="number" value={form.death}
                onChange={e=>set('death',e.target.value)}
                placeholder="Trống = còn sống" min={1600} max={2100}
                className={errs.death ? inpErr : inpOk}/>
            </Field>
          </div>

          {/* Generation */}
          <Field label="Đời">
            <select value={form.generation} onChange={e=>set('generation',e.target.value)}
              className={inpOk}>
              {[1,2,3,4,5,6,7,8].map(g=>(
                <option key={g} value={g}>Đời {g}</option>
              ))}
            </select>
          </Field>

          {/* Gender + Type */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Giới tính">
              <Toggle field="gender" opts={[['male','Nam'],['female','Nữ']]}/>
            </Field>
            <Field label="Quan hệ">
              <Toggle field="type" opts={[['main','Chính'],['inlaw','Ngoại']]}/>
            </Field>
          </div>

          {/* Note */}
          <Field label="Ghi chú">
            <textarea rows={2} value={form.note}
              onChange={e=>set('note',e.target.value)}
              placeholder="Thông tin thêm..."
              className={`${inpOk} resize-none`}/>
          </Field>

          {/* Footer buttons */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-amber-300 text-amber-800
                text-sm font-medium hover:bg-amber-100 transition-colors">
              Hủy bỏ
            </button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-xl bg-red-800 text-yellow-300
                text-sm font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
              <Save size={14}/>
              {isAdd ? 'Thêm mới' : 'Lưu lại'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────── Delete confirm ───────────────────────────────────
function DeleteConfirm({ node, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel}/>
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-80 border-2 border-red-300 overflow-hidden">
        <div className="bg-red-700 px-4 py-3 flex items-center gap-2 text-white">
          <Trash2 size={15}/><span className="font-bold text-sm">Xác nhận xóa</span>
        </div>
        <div className="p-5">
          <p className="text-gray-600 text-sm mb-1">Xóa thành viên:</p>
          <p className="font-bold text-red-900 text-lg mb-1">{node.name}</p>
          <p className="text-amber-600 text-xs mb-4">
            Đời {node.generation} — toàn bộ con cháu bên dưới cũng sẽ bị xóa.
          </p>
          <div className="flex gap-3">
            <button onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 transition-colors">
              Hủy
            </button>
            <button onClick={onConfirm}
              className="flex-1 py-2.5 rounded-xl bg-red-700 text-white text-sm font-bold hover:bg-red-600 transition-colors">
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────── Detail Panel ────────────────────────────────────
function DetailPanel({ node, onClose, onEdit, onAddChild, onDelete }) {
  if (!node) return null;
  const life = node.death ? `${node.birth} – ${node.death}` : `${node.birth} – nay`;
  return (
    <div className="absolute bottom-16 right-4 w-68 bg-red-900 rounded-2xl shadow-2xl
      border-2 border-yellow-600 overflow-hidden z-30" style={{width:268}}>
      {/* Title */}
      <div className="bg-gradient-to-r from-red-950 to-red-900 px-4 py-3
        flex items-start justify-between">
        <div>
          <h3 className="text-yellow-400 font-bold font-serif text-base leading-tight">
            {node.name}
          </h3>
          <p className="text-yellow-600 text-xs mt-0.5">
            Đời {node.generation} · {node.gender==='male' ? 'Nam' : 'Nữ'} ·{' '}
            {node.type==='main' ? 'Chính tộc' : 'Ngoại tộc'}
          </p>
        </div>
        <button onClick={onClose}
          className="text-yellow-700 hover:text-white hover:bg-red-700/60 rounded-full p-0.5 transition-colors">
          <X size={15}/>
        </button>
      </div>

      {/* Info rows */}
      <div className="px-4 py-3 space-y-2 text-sm border-b border-red-800">
        <InfoRow icon="📅" label={life}/>
        <InfoRow
          icon={node.status==='alive' ? '🟢' : '⚫'}
          label={node.status==='alive' ? 'Còn sống' : 'Đã mất'}
          valueClass={node.status==='alive' ? 'text-green-400' : 'text-gray-400'}
        />
        {node.spouse && (
          <InfoRow icon="💑" label={`${node.spouse.name} (${node.spouse.birth}–${node.spouse.death||'nay'})`}/>
        )}
        {node.note && (
          <p className="text-yellow-300/70 italic text-xs leading-relaxed pl-1">{node.note}</p>
        )}
      </div>

      {/* Action buttons */}
      <div className="px-4 py-3 flex gap-2">
        <button onClick={()=>onAddChild(node)}
          className="flex-1 py-2 rounded-xl bg-yellow-500 text-red-900 text-xs font-bold
            hover:bg-yellow-400 transition-colors flex items-center justify-center gap-1.5">
          <UserPlus size={13}/> Thêm con
        </button>
        <button onClick={()=>onEdit(node)}
          className="flex-1 py-2 rounded-xl bg-amber-200 text-amber-900 text-xs font-bold
            hover:bg-amber-300 transition-colors flex items-center justify-center gap-1.5">
          <Edit2 size={13}/> Sửa
        </button>
        <button onClick={()=>onDelete(node)}
          className="py-2 px-3 rounded-xl bg-red-700/70 text-white text-xs font-bold
            hover:bg-red-600 transition-colors">
          <Trash2 size={13}/>
        </button>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, valueClass='' }) {
  return (
    <div className={`flex items-center gap-2 ${valueClass || 'text-yellow-200'}`}>
      <span className="text-base leading-none">{icon}</span>
      <span className="text-xs">{label}</span>
    </div>
  );
}

// ─────────────────────────── Decorative SVG ──────────────────────────────────
const LEFT_C  = ['飲','水','思','源','，','慎','終','追','遠'];
const RIGHT_C = ['子','孫','昌','盛','，','家','道','興','隆'];

function Calligraphy({ x, chars }) {
  return (
    <g>
      <rect x={x-20} y={-5} width={40} height={chars.length*48+10} rx={5}
        fill="#8B0000" opacity={0.06}/>
      {chars.map((ch,i)=>(
        <text key={i} x={x} y={i*48+34} textAnchor="middle"
          fill="#8B0000" fontSize={28} fontFamily="serif" fontWeight="bold" opacity={0.28}>
          {ch}
        </text>
      ))}
    </g>
  );
}

// ─────────────────────────── Legend ──────────────────────────────────────────
const LEGEND = [
  {c:'#9B1C1C',l:'Nam · sống'}, {c:'#6B0000',l:'Nam · mất'},
  {c:'#8B2252',l:'Nữ · sống'}, {c:'#5A1535',l:'Nữ · mất'},
  {c:'#1e3d7a',l:'Ngoại tộc'},
];

// ─────────────────────────── MAIN ────────────────────────────────────────────
export default function FamilyTree() {
  const canvasRef = useRef(null);

  // ── Persistent tree data ─────────────────────────────────────────────────
  const [tree, setTree] = useState(() => {
    if (typeof window === 'undefined') return familyTree;
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      return s ? JSON.parse(s) : familyTree;
    } catch { return familyTree; }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tree)); } catch {}
  }, [tree]);

  // ── UI state ─────────────────────────────────────────────────────────────
  const [selected,  setSelected]  = useState(null);
  const [viewMode,  setViewMode]  = useState('all');
  const [query,     setQuery]     = useState('');
  const [zoom,      setZoom]      = useState(0.72);
  const [pan,       setPan]       = useState({ x:0, y:80 });
  const [modal,     setModal]     = useState(null);   // {mode,node} or null
  const [delNode,   setDelNode]   = useState(null);
  const drag = useRef(null);

  // ── Layout (recomputed when tree changes) ────────────────────────────────
  const laid = useMemo(() => place(measure(tree), 0, 0), [tree]);
  const { nodes, edges } = useMemo(() => flattenTree(laid), [laid]);
  const bb = useMemo(() => bbox(nodes), [nodes]);

  // ── Auto-fit once ────────────────────────────────────────────────────────
  useEffect(() => {
    const el = canvasRef.current; if(!el) return;
    const cw=el.clientWidth, ch=el.clientHeight;
    const z = Math.max(0.2, Math.min(cw/(bb.w+300), ch/(bb.h+200), 1.2));
    setZoom(z);
    setPan({ x: cw/2 - (bb.x0+bb.w/2)*z, y: 90 });
  }, []); // eslint-disable-line

  // ── Pan ──────────────────────────────────────────────────────────────────
  const onMD = e => { if(e.button||modal) return; drag.current={sx:e.clientX-pan.x, sy:e.clientY-pan.y}; };
  const onMM = useCallback(e => { if(!drag.current) return; setPan({x:e.clientX-drag.current.sx, y:e.clientY-drag.current.sy}); },[]);
  const onMU = () => { drag.current=null; };

  // ── Wheel zoom ───────────────────────────────────────────────────────────
  const onWheel = useCallback(e => {
    e.preventDefault();
    setZoom(z=>Math.min(Math.max(z*(e.deltaY>0?.9:1.1),.15),4));
  },[]);
  useEffect(() => {
    const el=canvasRef.current; if(!el) return;
    el.addEventListener('wheel',onWheel,{passive:false});
    return ()=>el.removeEventListener('wheel',onWheel);
  },[onWheel]);

  const fitView = () => {
    const el=canvasRef.current; if(!el) return;
    const cw=el.clientWidth, ch=el.clientHeight;
    const z=Math.max(.2,Math.min(cw/(bb.w+300),ch/(bb.h+200)));
    setZoom(z); setPan({x:cw/2-(bb.x0+bb.w/2)*z, y:90});
  };

  // ── Search ───────────────────────────────────────────────────────────────
  const hits = query ? nodes.filter(n=>n.name.toLowerCase().includes(query.toLowerCase())) : [];

  // ── CRUD ─────────────────────────────────────────────────────────────────
  const openAdd  = (parentNode=null) => { setSelected(null); setModal({mode:'add',  node:parentNode}); };
  const openEdit = node => { setSelected(null); setModal({mode:'edit', node}); };
  const openDel  = node => { setSelected(null); setDelNode(node); };

  const handleSave = formData => {
    if (modal.mode==='add') {
      const newNode = { id:genId(), ...formData, children:[] };
      setTree(prev => addChild(prev, formData.parentId, newNode));
    } else {
      const { parentId, ...patch } = formData;
      setTree(prev => updateNode(prev, modal.node.id, patch));
    }
    setModal(null);
  };

  const handleDelete = () => {
    if (delNode.id===tree.id) { alert('Không thể xóa tổ tiên gốc.'); setDelNode(null); return; }
    setTree(prev => removeNode(prev, delNode.id));
    setDelNode(null); setSelected(null);
  };

  const resetData = () => {
    if(!confirm('Reset về dữ liệu mẫu? Mọi chỉnh sửa sẽ mất.')) return;
    setTree(familyTree); localStorage.removeItem(STORAGE_KEY);
  };

  // ── Generation y-map ─────────────────────────────────────────────────────
  const genY = {};
  nodes.forEach(n => { if(genY[n.generation]===undefined) genY[n.generation]=n._y; });

  const allNodesArr = useMemo(() => flatList(tree), [tree]);

  // ────────────────────────────── RENDER ──────────────────────────────────
  return (
    <div className="flex flex-col h-full" style={{background:'#fffbeb'}}>

      {/* ── Top toolbar ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-3 py-2
        bg-red-900 border-b-2 border-yellow-700 flex-shrink-0 flex-wrap">
        
        {/* Title chip */}
        <div className="hidden md:flex items-center gap-1.5 text-yellow-400 mr-2">
          <span className="text-lg">🏮</span>
          <span className="font-serif font-bold text-sm whitespace-nowrap">Cây Gia Phả</span>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-6 bg-red-700 mx-1"/>

        {/* View mode */}
        <div className="flex rounded-lg overflow-hidden border border-red-700 text-xs">
          {[
            {k:'all',      l:'Toàn cảnh', I:Eye},
            {k:'ancestor', l:'Tổ tiên',   I:Users},
            {k:'descendant',l:'Hậu duệ',  I:GitBranch},
          ].map(({k,l,I})=>(
            <button key={k} onClick={()=>setViewMode(k)}
              className={`flex items-center gap-1 px-2.5 py-1.5 font-semibold transition-colors
                ${viewMode===k ? 'bg-yellow-500 text-red-900' : 'text-yellow-300 hover:bg-red-800'}`}>
              <I size={12}/>{l}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-44">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-yellow-500"/>
          <input type="text" placeholder="Tìm thành viên..." value={query}
            onChange={e=>setQuery(e.target.value)}
            className="w-full pl-7 pr-2 py-1.5 text-xs bg-red-800 border border-red-700 rounded-lg
              text-yellow-200 placeholder-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"/>
          {hits.length>0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-amber-200
              rounded-xl shadow-2xl z-50 max-h-40 overflow-y-auto">
              {hits.map(n=>(
                <button key={n.id} onClick={()=>{setSelected(n);setQuery('');}}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-amber-50
                    text-amber-900 border-b border-amber-100 last:border-0">
                  <span className="font-bold">{n.name}</span>
                  <span className="ml-1.5 text-amber-500">Đời {n.generation}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Add button */}
        <button onClick={()=>openAdd(null)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
            bg-yellow-500 text-red-900 text-xs font-bold
            hover:bg-yellow-400 active:scale-95 transition-all shadow-md">
          <UserPlus size={13}/> Thêm thành viên
        </button>

        {/* Zoom controls */}
        <div className="flex items-center gap-0.5 ml-auto">
          <button onClick={()=>setZoom(z=>Math.max(z/1.2,.15))}
            className="p-1.5 rounded-lg hover:bg-red-800 text-yellow-400 transition-colors">
            <ZoomOut size={14}/>
          </button>
          <span className="text-yellow-300 text-xs font-mono w-10 text-center">
            {Math.round(zoom*100)}%
          </span>
          <button onClick={()=>setZoom(z=>Math.min(z*1.2,4))}
            className="p-1.5 rounded-lg hover:bg-red-800 text-yellow-400 transition-colors">
            <ZoomIn size={14}/>
          </button>
          <button onClick={fitView}
            className="p-1.5 rounded-lg hover:bg-red-800 text-yellow-400 transition-colors ml-0.5">
            <Maximize2 size={14}/>
          </button>
          <button onClick={resetData}
            className="ml-2 px-2 py-1 text-xs rounded-lg border border-red-700
              text-yellow-600 hover:bg-red-800 transition-colors">
            Reset
          </button>
        </div>
      </div>

      {/* ── Canvas ───────────────────────────────────────────────────── */}
      <div ref={canvasRef}
        className="flex-1 relative overflow-hidden"
        style={{
          cursor: drag.current ? 'grabbing' : 'grab',
          background: 'radial-gradient(ellipse at 50% 20%, #fffde7 0%, #fef3c7 60%, #fde68a 100%)',
        }}
        onMouseDown={onMD} onMouseMove={onMM} onMouseUp={onMU} onMouseLeave={onMU}>

        {/* Parchment texture overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20"
          style={{backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 39px,#d97706 39px,#d97706 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,#d97706 39px,#d97706 40px)'}}/>

        {/* Title overlay */}
        <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
          <div className="text-center py-2.5 bg-gradient-to-b from-amber-200/70 to-transparent">
            <p className="text-red-900 font-serif font-bold tracking-widest text-sm drop-shadow">
              ❖ {FAMILY_TITLE} ❖
            </p>
            <p className="text-amber-600 text-xs opacity-50 font-serif mt-0.5">
              ～ ～ ～ ～ ～ ～ ～ ～ ～ ～ ～ ～ ～ ～ ～ ～ ～
            </p>
          </div>
        </div>

        <svg style={{width:'100%',height:'100%'}} className="select-none">
          <defs>
            {/* Node gradient */}
            <linearGradient id="ng-male-alive"   x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#B91C1C"/>
              <stop offset="100%" stopColor="#7F1D1D"/>
            </linearGradient>
            <linearGradient id="ng-male-dead" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#7F1D1D"/>
              <stop offset="100%" stopColor="#450A0A"/>
            </linearGradient>
            <linearGradient id="ng-female-alive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#9D174D"/>
              <stop offset="100%" stopColor="#6B1A3A"/>
            </linearGradient>
            <linearGradient id="ng-female-dead" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#6B1A3A"/>
              <stop offset="100%" stopColor="#3D0C21"/>
            </linearGradient>
            <linearGradient id="ng-inlaw" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#1E40AF"/>
              <stop offset="100%" stopColor="#1E3A8A"/>
            </linearGradient>
            {/* Drop shadow filter */}
            <filter id="nshadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="3" stdDeviation="3" floodOpacity="0.3"/>
            </filter>
          </defs>

          <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
            {/* Dragon header */}
            <text x={(bb.x0+bb.x1)/2} y={bb.y0-32}
              textAnchor="middle" fontSize={34} fill="#8B0000" opacity={0.15}
              fontFamily="serif" fontWeight="bold">❧ 龍 鳳 呈 祥 ❧</text>

            {/* Calligraphy couplets */}
            <Calligraphy x={bb.x0-85} chars={LEFT_C}/>
            <Calligraphy x={bb.x1+85} chars={RIGHT_C}/>

            {/* Generation labels + guide lines */}
            {Object.entries(genY).map(([g,gy])=>(
              <g key={g}>
                <line x1={bb.x0-10} y1={gy+NH/2} x2={bb.x1+10} y2={gy+NH/2}
                  stroke="#D97706" strokeWidth={0.6} strokeDasharray="5 10" opacity={0.2}/>
                <text x={bb.x0-14} y={gy+NH/2+5} textAnchor="end"
                  fill="#92400E" fontSize={13} fontWeight="bold" fontFamily="serif" opacity={0.8}>
                  Đời {g}
                </text>
              </g>
            ))}

            {/* Bezier edges */}
            {edges.map((e,i)=>{
              const midY = (e.py+NH+e.cy)/2;
              return (
                <path key={i}
                  d={`M ${e.px} ${e.py+NH} C ${e.px} ${midY}, ${e.cx} ${midY}, ${e.cx} ${e.cy}`}
                  fill="none" stroke="#8B0000" strokeWidth={1.8} strokeOpacity={0.45}/>
              );
            })}

            {/* Nodes */}
            {nodes.map(node=>{
              const x=node._x-NW/2, y=node._y;
              const isSel = selected?.id===node.id;
              const isHit = hits.some(h=>h.id===node.id);
              const gId   = node.type==='inlaw' ? 'ng-inlaw'
                          : node.gender==='female'
                            ? (node.status==='alive' ? 'ng-female-alive' : 'ng-female-dead')
                            : (node.status==='alive' ? 'ng-male-alive'   : 'ng-male-dead');
              const stroke= isSel?'#FFFFFF':isHit?'#00E676':'#C9A227';
              const sw    = isSel?3:isHit?2.5:1.5;
              const life  = node.death ? `${node.birth}–${node.death}` : `${node.birth} – nay`;

              return (
                <g key={node.id} onClick={()=>setSelected(node)} style={{cursor:'pointer'}}
                  filter="url(#nshadow)">
                  {/* Body */}
                  <rect x={x} y={y} width={NW} height={NH} rx={9}
                    fill={`url(#${gId})`} stroke={stroke} strokeWidth={sw}/>
                  {/* Gold top stripe */}
                  <rect x={x+10} y={y+4} width={NW-20} height={3} rx={1.5}
                    fill="#C9A227" opacity={0.7}/>
                  {/* Gold bottom stripe */}
                  <rect x={x+10} y={y+NH-7} width={NW-20} height={3} rx={1.5}
                    fill="#C9A227" opacity={0.4}/>
                  {/* Name */}
                  <text x={node._x} y={y+28} textAnchor="middle" fill="#FFD700"
                    fontSize={13.5} fontWeight="bold" fontFamily="'Times New Roman',serif">
                    {node.name}
                  </text>
                  {/* Life */}
                  <text x={node._x} y={y+47} textAnchor="middle" fill="#F5DEB3" fontSize={11}>
                    {life}
                  </text>
                  {/* Generation + relation */}
                  <text x={node._x} y={y+64} textAnchor="middle"
                    fill="#FFDAB9" fontSize={10} fontStyle="italic" fontFamily="serif">
                    {`Đời ${node.generation}${node.type==='inlaw'?' · Ngoại':''}`}
                  </text>
                  {/* Status dot */}
                  <circle cx={x+NW-11} cy={y+13} r={5.5}
                    fill={node.status==='alive'?'#22C55E':'#6B7280'}/>
                  {node.status==='alive' &&
                    <circle cx={x+NW-11} cy={y+13} r={2.5} fill="#16A34A"/>}

                  {/* ── Inline action badges ── */}
                  {/* Edit (top-left) */}
                  <g onClick={ev=>{ev.stopPropagation();openEdit(node)}} style={{cursor:'pointer'}}>
                    <circle cx={x+13} cy={y+14} r={10} fill="#c9a227" opacity={0.82}/>
                    <text x={x+13} y={y+18} textAnchor="middle"
                      fill="#7b2d00" fontSize={11} fontWeight="bold">✎</text>
                  </g>
                  {/* Add child (bottom-center) */}
                  <g onClick={ev=>{ev.stopPropagation();openAdd(node)}} style={{cursor:'pointer'}}>
                    <circle cx={node._x} cy={y+NH-11} r={11} fill="#16a34a" opacity={0.85}/>
                    <text x={node._x} y={y+NH-7} textAnchor="middle"
                      fill="#fff" fontSize={15} fontWeight="bold">+</text>
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
            onClose={()=>setSelected(null)}
            onEdit={openEdit}
            onAddChild={openAdd}
            onDelete={openDel}
          />
        )}
      </div>

      {/* ── Legend bar ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 px-4 py-1.5
        bg-amber-100 border-t border-amber-300 flex-shrink-0 text-xs flex-wrap">
        <span className="text-amber-800 font-bold">Chú thích:</span>
        {LEGEND.map(({c,l})=>(
          <div key={l} className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-sm border border-yellow-600 shrink-0"
              style={{backgroundColor:c}}/>
            <span className="text-amber-700">{l}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-3 text-amber-600">
          <span>✎ sửa · + thêm con</span>
          <span className="font-mono font-bold">Zoom {Math.round(zoom*100)}%</span>
        </div>
      </div>

      {/* ── Modals ───────────────────────────────────────────────────── */}
      {modal && (
        <PersonModal
          mode={modal.mode}
          initialData={modal.node}
          allNodesArr={allNodesArr}
          onSave={handleSave}
          onClose={()=>setModal(null)}
        />
      )}
      {delNode && (
        <DeleteConfirm node={delNode} onConfirm={handleDelete} onCancel={()=>setDelNode(null)}/>
      )}
    </div>
  );
}
