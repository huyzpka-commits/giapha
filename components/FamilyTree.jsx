'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Search, Eye, Users, GitBranch, X } from 'lucide-react';
import { familyTree, FAMILY_TITLE } from '@/data/familyData';

// ── Layout constants ──────────────────────────────────────────────────────────
const NW = 152;  // node width
const NH = 80;   // node height
const HG = 50;   // horizontal gap between siblings
const VG = 80;   // vertical gap between generations

// ── Tree layout: bottom-up width measurement ──────────────────────────────────
function measure(node) {
  if (!node.children?.length) return { ...node, _w: NW };
  const children = node.children.map(measure);
  const tw = children.reduce((s, c) => s + c._w, 0) + HG * (children.length - 1);
  return { ...node, children, _w: Math.max(NW, tw) };
}

// ── Tree layout: top-down position assignment ─────────────────────────────────
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

// ── Flatten tree to arrays ────────────────────────────────────────────────────
function flatten(node, nodes = [], edges = []) {
  nodes.push(node);
  (node.children || []).forEach(c => {
    edges.push({ px: node._x, py: node._y, cx: c._x, cy: c._y });
    flatten(c, nodes, edges);
  });
  return { nodes, edges };
}

// ── Bounding box ──────────────────────────────────────────────────────────────
function bounds(nodes) {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  nodes.forEach(n => {
    x0 = Math.min(x0, n._x - NW / 2);
    x1 = Math.max(x1, n._x + NW / 2);
    y0 = Math.min(y0, n._y);
    y1 = Math.max(y1, n._y + NH);
  });
  return { x0, x1, y0, y1, w: x1 - x0, h: y1 - y0 };
}

// ── Node fill color ───────────────────────────────────────────────────────────
function nodeColor(n) {
  if (n.type === 'inlaw') return n.gender === 'female' ? '#1a3a5c' : '#1e3a7a';
  if (n.gender === 'female') return n.status === 'alive' ? '#8b2252' : '#5a1535';
  return n.status === 'alive' ? '#9b1c1c' : '#6b0000';
}

// ── Single tree node (SVG) ────────────────────────────────────────────────────
function TreeNodeSVG({ node, isSelected, isHighlighted, onClick }) {
  const x = node._x - NW / 2;
  const y = node._y;
  const fill = nodeColor(node);
  const stroke = isSelected ? '#fff' : isHighlighted ? '#00e676' : '#c9a227';
  const sw = isSelected ? 3 : isHighlighted ? 2.5 : 1.5;
  const life = node.death ? `${node.birth}–${node.death}` : `${node.birth} – nay`;

  return (
    <g onClick={() => onClick(node)} style={{ cursor: 'pointer' }}>
      {/* Drop shadow */}
      <rect x={x + 3} y={y + 3} width={NW} height={NH} rx={8} fill="rgba(0,0,0,0.28)" />
      {/* Body */}
      <rect x={x} y={y} width={NW} height={NH} rx={8} fill={fill} stroke={stroke} strokeWidth={sw} />
      {/* Gold top accent */}
      <rect x={x + 12} y={y + 4} width={NW - 24} height={3} rx={1.5} fill="#c9a227" opacity={0.65} />
      {/* Gold bottom accent */}
      <rect x={x + 12} y={y + NH - 7} width={NW - 24} height={3} rx={1.5} fill="#c9a227" opacity={0.35} />
      {/* Name */}
      <text
        x={node._x} y={y + 26}
        textAnchor="middle" fill="#FFD700"
        fontSize={13.5} fontWeight="bold"
        fontFamily="'Times New Roman', 'Palatino Linotype', serif"
      >{node.name}</text>
      {/* Lifespan */}
      <text
        x={node._x} y={y + 44}
        textAnchor="middle" fill="#F5DEB3"
        fontSize={11} fontFamily="Arial, sans-serif"
      >{life}</text>
      {/* Generation badge */}
      <text
        x={node._x} y={y + 62}
        textAnchor="middle" fill="#FFDAB9"
        fontSize={10} fontStyle="italic" fontFamily="serif"
      >{`Đời ${node.generation}${node.type === 'inlaw' ? ' · Ngoại tộc' : ''}`}</text>
      {/* Status indicator */}
      <circle cx={x + NW - 11} cy={y + 12} r={5}
        fill={node.status === 'alive' ? '#22c55e' : '#6b7280'} />
      {node.status === 'alive' &&
        <circle cx={x + NW - 11} cy={y + 12} r={2.5} fill="#16a34a" />}
    </g>
  );
}

// ── Edge connector (elbow) ────────────────────────────────────────────────────
function EdgeSVG({ px, py, cx, cy }) {
  const midY = py + NH + VG / 2;
  return (
    <path
      d={`M ${px} ${py + NH} V ${midY} H ${cx} V ${cy}`}
      fill="none" stroke="#8B0000" strokeWidth={1.8} strokeOpacity={0.55}
    />
  );
}

// ── Dragon / decorative header (SVG) ─────────────────────────────────────────
function DragonHeader({ cx, y }) {
  return (
    <g>
      <text x={cx} y={y - 10} textAnchor="middle" fontSize={32}
        fill="#8B0000" opacity={0.18} fontFamily="serif" fontWeight="bold">
        ❧ 龍 鳳 呈 祥 ❧
      </text>
      <text x={cx} y={y + 14} textAnchor="middle" fontSize={12}
        fill="#8B0000" opacity={0.25} fontFamily="serif" letterSpacing="8">
        ～ ～ ～ ～ ～ ～ ～ ～ ～ ～ ～ ～ ～ ～
      </text>
    </g>
  );
}

// ── Vertical calligraphy couplets ─────────────────────────────────────────────
const LEFT_CHARS  = ['飲','水','思','源','，','慎','終','追','遠'];
const RIGHT_CHARS = ['子','孫','昌','盛','，','家','道','興','隆'];

function Calligraphy({ side, x, startY }) {
  const chars = side === 'left' ? LEFT_CHARS : RIGHT_CHARS;
  return (
    <g>
      <rect x={x - 18} y={startY - 10} width={36} height={chars.length * 46 + 20}
        rx={4} fill="#8B0000" opacity={0.07} />
      {chars.map((ch, i) => (
        <text key={i}
          x={x} y={startY + i * 46}
          textAnchor="middle" fill="#8B0000"
          fontSize={26} fontFamily="serif" fontWeight="bold" opacity={0.32}
        >{ch}</text>
      ))}
    </g>
  );
}

// ── Detail panel ──────────────────────────────────────────────────────────────
function DetailPanel({ node, onClose }) {
  if (!node) return null;
  return (
    <div className="absolute bottom-16 right-4 w-72 bg-red-900 border-2 border-yellow-600 rounded-2xl p-4 shadow-2xl z-30">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-yellow-400 font-bold text-lg font-serif leading-tight">{node.name}</h3>
          <p className="text-yellow-600 text-xs mt-0.5">Đời {node.generation}</p>
        </div>
        <button onClick={onClose}
          className="text-yellow-600 hover:text-white transition-colors p-0.5 rounded-full hover:bg-red-700">
          <X size={16} />
        </button>
      </div>
      <div className="space-y-1.5 text-sm">
        {[
          ['Năm sinh',  node.birth],
          ['Năm mất',   node.death || '—'],
          ['Trạng thái', node.status === 'alive' ? '● Còn sống' : '● Đã mất'],
          ['Giới tính', node.gender === 'male' ? 'Nam' : 'Nữ'],
          ['Quan hệ',   node.type === 'main' ? 'Chính tộc' : 'Ngoại tộc'],
        ].map(([label, val]) => (
          <div key={label} className="flex gap-2">
            <span className="text-yellow-500 w-24 shrink-0">{label}:</span>
            <span className={
              val === '● Còn sống' ? 'text-green-400' :
              val === '● Đã mất' ? 'text-gray-400' :
              'text-yellow-100'
            }>{val}</span>
          </div>
        ))}
        {node.note && (
          <div className="flex gap-2 mt-1">
            <span className="text-yellow-500 w-24 shrink-0">Ghi chú:</span>
            <span className="text-yellow-300 italic text-xs leading-relaxed">{node.note}</span>
          </div>
        )}
        {node.spouse && (
          <div className="mt-3 pt-2 border-t border-red-700">
            <p className="text-yellow-500 text-xs mb-1.5 font-semibold">Phối ngẫu:</p>
            <p className="text-yellow-200 font-medium">{node.spouse.name}</p>
            <p className="text-yellow-500 text-xs">
              {node.spouse.birth}–{node.spouse.death || 'nay'} · Ngoại tộc
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Legend footer ─────────────────────────────────────────────────────────────
const LEGEND = [
  { color: '#9b1c1c', label: 'Nam · sống' },
  { color: '#6b0000', label: 'Nam · mất' },
  { color: '#8b2252', label: 'Nữ · sống' },
  { color: '#5a1535', label: 'Nữ · mất' },
  { color: '#1e3a7a', label: 'Ngoại tộc' },
];

// ── Main component ────────────────────────────────────────────────────────────
export default function FamilyTree() {
  const containerRef = useRef(null);
  const [selected, setSelected]     = useState(null);
  const [viewMode, setViewMode]     = useState('all');
  const [query, setQuery]           = useState('');
  const [zoom, setZoom]             = useState(0.72);
  const [pan, setPan]               = useState({ x: 0, y: 60 });
  const dragRef = useRef(null);

  // ── Compute layout once ──────────────────────────────────────────────────
  const laidOut = useMemo(() => {
    const m = measure(familyTree);
    return place(m, 0, 0);
  }, []);

  const { nodes, edges } = useMemo(() => flatten(laidOut), [laidOut]);
  const bb = useMemo(() => bounds(nodes), [nodes]);

  // ── Auto-fit on mount ────────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const cw = el.clientWidth, ch = el.clientHeight;
    const fz = Math.min(cw / (bb.w + 260), ch / (bb.h + 220), 1.2);
    const z  = Math.max(0.25, fz);
    setZoom(z);
    setPan({
      x: cw / 2 - (bb.x0 + bb.w / 2) * z,
      y: 80,
    });
  }, [bb]);

  // ── Pan ──────────────────────────────────────────────────────────────────
  const onMouseDown = (e) => {
    if (e.button !== 0) return;
    dragRef.current = { sx: e.clientX - pan.x, sy: e.clientY - pan.y };
  };
  const onMouseMove = useCallback((e) => {
    if (!dragRef.current) return;
    setPan({ x: e.clientX - dragRef.current.sx, y: e.clientY - dragRef.current.sy });
  }, []);
  const onMouseUp = () => { dragRef.current = null; };

  // ── Wheel zoom ───────────────────────────────────────────────────────────
  const onWheel = useCallback((e) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.min(Math.max(z * factor, 0.15), 4));
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  // ── Zoom buttons ─────────────────────────────────────────────────────────
  const zoomIn   = () => setZoom(z => Math.min(z * 1.2, 4));
  const zoomOut  = () => setZoom(z => Math.max(z / 1.2, 0.15));
  const fitView  = () => {
    const el = containerRef.current;
    if (!el) return;
    const cw = el.clientWidth, ch = el.clientHeight;
    const fz = Math.min(cw / (bb.w + 260), ch / (bb.h + 220));
    const z  = Math.max(0.2, fz);
    setZoom(z);
    setPan({ x: cw / 2 - (bb.x0 + bb.w / 2) * z, y: 80 });
  };

  // ── Search ───────────────────────────────────────────────────────────────
  const hits = query
    ? nodes.filter(n => n.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  // ── Generation Y positions ───────────────────────────────────────────────
  const genYMap = {};
  nodes.forEach(n => {
    if (genYMap[n.generation] === undefined) genYMap[n.generation] = n._y;
  });

  // ── View mode filter (basic ancestor/descendant highlight) ───────────────
  function isVisible(node) {
    if (viewMode === 'all') return true;
    if (!selected) return true;
    if (viewMode === 'ancestor') {
      // show path from root to selected
      function onPath(n) {
        if (n.id === selected.id) return true;
        return (n.children || []).some(onPath);
      }
      return onPath(node); // simplified — shows ancestors only
    }
    if (viewMode === 'descendant') {
      // show selected and its descendants
      function isDescendant(root, target) {
        if (root.id === target.id) return true;
        return (root.children || []).some(c => isDescendant(c, target));
      }
      return selected ? isDescendant(selected, node) || isDescendant(node, selected) : true;
    }
    return true;
  }

  const calX_left  = bb.x0 - 70;
  const calX_right = bb.x1 + 70;
  const titleCX    = (bb.x0 + bb.x1) / 2;

  return (
    <div className="flex flex-col h-full bg-amber-50">

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 border-b border-amber-300 flex-shrink-0">
        {/* View mode */}
        <div className="flex rounded-lg overflow-hidden border border-amber-400 text-sm">
          {[
            { key: 'all',        label: 'Toàn cảnh', Icon: Eye        },
            { key: 'ancestor',   label: 'Tổ tiên',   Icon: Users      },
            { key: 'descendant', label: 'Hậu duệ',   Icon: GitBranch  },
          ].map(({ key, label, Icon }) => (
            <button key={key}
              onClick={() => setViewMode(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-medium transition-colors
                ${viewMode === key ? 'bg-red-800 text-yellow-300' : 'bg-white text-amber-900 hover:bg-amber-50'}`}
            >
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative ml-2 w-56">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-amber-600" />
          <input
            type="text"
            placeholder="Tìm thành viên..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-white border border-amber-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900 placeholder-amber-400"
          />
          {hits.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-amber-200
              rounded-lg shadow-xl z-50 max-h-44 overflow-y-auto">
              {hits.map(n => (
                <button key={n.id}
                  onClick={() => { setSelected(n); setQuery(''); }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-amber-50 text-amber-900 border-b border-amber-100 last:border-0"
                >
                  <span className="font-semibold">{n.name}</span>
                  <span className="ml-2 text-amber-500 text-xs">Đời {n.generation}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={zoomOut} className="p-1.5 rounded hover:bg-amber-200 text-amber-800 transition-colors"><ZoomOut size={15} /></button>
          <span className="text-sm font-mono text-amber-700 w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={zoomIn}  className="p-1.5 rounded hover:bg-amber-200 text-amber-800 transition-colors"><ZoomIn  size={15} /></button>
          <button onClick={fitView} className="p-1.5 rounded hover:bg-amber-200 text-amber-800 transition-colors ml-1"><Maximize2 size={15} /></button>
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
        {/* Title banner overlay */}
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

            {/* Dragon decorative header */}
            <DragonHeader cx={titleCX} y={bb.y0 - 30} />

            {/* Generation labels on left */}
            {Object.entries(genYMap).map(([gen, gy]) => (
              <text key={gen}
                x={bb.x0 - 18} y={gy + NH / 2 + 5}
                textAnchor="end" fill="#92400e"
                fontSize={12} fontWeight="bold" fontFamily="serif" opacity={0.8}
              >Đời {gen}</text>
            ))}

            {/* Generation horizontal guide lines */}
            {Object.entries(genYMap).map(([gen, gy]) => (
              <line key={`gl-${gen}`}
                x1={bb.x0 - 8} y1={gy + NH / 2}
                x2={bb.x1 + 8} y2={gy + NH / 2}
                stroke="#d97706" strokeWidth={0.5} strokeDasharray="4 8" opacity={0.18}
              />
            ))}

            {/* Calligraphy panels */}
            <Calligraphy side="left"  x={calX_left}  startY={bb.y0 + 30} />
            <Calligraphy side="right" x={calX_right} startY={bb.y0 + 30} />

            {/* Edges */}
            {edges.map((e, i) => (
              <EdgeSVG key={i} px={e.px} py={e.py} cx={e.cx} cy={e.cy} />
            ))}

            {/* Nodes */}
            {nodes.map(node => (
              <TreeNodeSVG
                key={node.id}
                node={node}
                isSelected={selected?.id === node.id}
                isHighlighted={hits.some(h => h.id === node.id)}
                onClick={setSelected}
              />
            ))}
          </g>
        </svg>

        {/* Detail panel */}
        <DetailPanel node={selected} onClose={() => setSelected(null)} />
      </div>

      {/* ── Legend footer ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-5 px-4 py-2 bg-amber-100 border-t border-amber-300 flex-shrink-0 text-xs flex-wrap">
        <span className="text-amber-800 font-semibold">Chú thích:</span>
        {LEGEND.map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded border border-yellow-600" style={{ backgroundColor: color }} />
            <span className="text-amber-800">{label}</span>
          </div>
        ))}
        <div className="flex items-center gap-3 ml-auto">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500" /><span className="text-amber-700">Còn sống</span></div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-gray-400" /><span className="text-amber-700">Đã mất</span></div>
          <span className="text-amber-500 font-mono">Zoom: {Math.round(zoom * 100)}%</span>
        </div>
      </div>
    </div>
  );
}
