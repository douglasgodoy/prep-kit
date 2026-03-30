// Diagrams.jsx — Inline SVG diagram components for interview prep questions
// Each diagram is a self-contained React element (pure JSX, no state).

const DS_COLOR = "#f97316";
const SD_COLOR = "#a855f7";

const NODE_FILL = "rgba(255,255,255,0.06)";
const NODE_STROKE = "rgba(255,255,255,0.15)";
const TEXT_PRIMARY = "#f0ece4";
const TEXT_SECONDARY = "#9a9590";
const FONT = "'Sora', sans-serif";

// ─── Shared helpers ────────────────────────────────────────────────────────────

function Defs({ id, color }) {
  return (
    <defs>
      <marker
        id={`arrow-${id}`}
        markerWidth="8"
        markerHeight="8"
        refX="6"
        refY="3"
        orient="auto"
      >
        <path d="M0,0 L0,6 L8,3 z" fill={color} />
      </marker>
      <marker
        id={`arrow-gray-${id}`}
        markerWidth="8"
        markerHeight="8"
        refX="6"
        refY="3"
        orient="auto"
      >
        <path d="M0,0 L0,6 L8,3 z" fill={NODE_STROKE} />
      </marker>
    </defs>
  );
}

function Box({ x, y, w, h, label, sub, color, textColor }) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={6}
        fill={NODE_FILL}
        stroke={color || NODE_STROKE}
        strokeWidth={color ? 1.5 : 1}
      />
      <text
        x={x + w / 2}
        y={sub ? y + h / 2 - 6 : y + h / 2 + 5}
        textAnchor="middle"
        fill={textColor || TEXT_PRIMARY}
        fontFamily={FONT}
        fontSize={12}
        fontWeight="600"
      >
        {label}
      </text>
      {sub && (
        <text
          x={x + w / 2}
          y={y + h / 2 + 10}
          textAnchor="middle"
          fill={TEXT_SECONDARY}
          fontFamily={FONT}
          fontSize={10}
        >
          {sub}
        </text>
      )}
    </g>
  );
}

function Arrow({ x1, y1, x2, y2, label, diagId, color, dashed }) {
  const arrowId = color ? `arrow-${diagId}` : `arrow-gray-${diagId}`;
  const stroke = color || NODE_STROKE;
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={stroke}
        strokeWidth={1.5}
        strokeDasharray={dashed ? "5,3" : undefined}
        markerEnd={`url(#${arrowId})`}
      />
      {label && (
        <text
          x={midX}
          y={midY - 5}
          textAnchor="middle"
          fill={TEXT_SECONDARY}
          fontFamily={FONT}
          fontSize={10}
        >
          {label}
        </text>
      )}
    </g>
  );
}

function SectionLabel({ x, y, text, color }) {
  return (
    <text
      x={x}
      y={y}
      fill={color || TEXT_SECONDARY}
      fontFamily={FONT}
      fontSize={11}
      fontWeight="700"
      letterSpacing="0.08em"
    >
      {text}
    </text>
  );
}

// ─── DS1: Two Sum hash map lookup flow ────────────────────────────────────────

function DiagramDS1() {
  const id = "ds1";
  const c = DS_COLOR;
  return (
    <svg viewBox="0 0 680 340" width="100%" style={{ display: "block" }}>
      <Defs id={id} color={c} />

      {/* Title */}
      <text x={340} y={22} textAnchor="middle" fill={c} fontFamily={FONT} fontSize={13} fontWeight="700">
        Two Sum — Hash Map O(n) Approach
      </text>

      {/* Array input */}
      <SectionLabel x={20} y={50} text="INPUT ARRAY" color={TEXT_SECONDARY} />
      {[2, 7, 11, 15].map((v, i) => (
        <g key={i}>
          <rect x={20 + i * 52} y={58} width={44} height={36} rx={6} fill={NODE_FILL} stroke={NODE_STROKE} />
          <text x={42 + i * 52} y={82} textAnchor="middle" fill={TEXT_PRIMARY} fontFamily={FONT} fontSize={15} fontWeight="700">{v}</text>
          <text x={42 + i * 52} y={106} textAnchor="middle" fill={TEXT_SECONDARY} fontFamily={FONT} fontSize={10}>i={i}</text>
        </g>
      ))}
      <text x={238} y={82} fill={c} fontFamily={FONT} fontSize={13} fontWeight="700">  target = 9</text>

      {/* Steps */}
      <SectionLabel x={20} y={130} text="ITERATION STEPS" color={TEXT_SECONDARY} />

      {/* Step rows */}
      {[
        { idx: 0, val: 2, comp: 7, mapBefore: "{}", action: "Store complement", mapAfter: "{ 2: 0 }", found: false },
        { idx: 1, val: 7, comp: 2, mapBefore: "{ 2: 0 }", action: "Check: 2 in map? ✓ FOUND!", mapAfter: "{ 2: 0 }", found: true },
      ].map((row, ri) => {
        const y = 140 + ri * 72;
        const highlight = row.found ? c : NODE_STROKE;
        return (
          <g key={ri}>
            <rect x={20} y={y} width={636} height={58} rx={6} fill={row.found ? "rgba(248,115,22,0.08)" : NODE_FILL} stroke={highlight} strokeWidth={row.found ? 1.5 : 1} />
            {/* idx */}
            <text x={50} y={y + 20} textAnchor="middle" fill={TEXT_SECONDARY} fontFamily={FONT} fontSize={10}>index</text>
            <text x={50} y={y + 38} textAnchor="middle" fill={TEXT_PRIMARY} fontFamily={FONT} fontSize={14} fontWeight="700">{row.idx}</text>
            {/* val */}
            <rect x={80} y={y + 14} width={32} height={28} rx={5} fill={row.found ? "rgba(248,115,22,0.2)" : "rgba(255,255,255,0.08)"} stroke={highlight} />
            <text x={96} y={y + 33} textAnchor="middle" fill={TEXT_PRIMARY} fontFamily={FONT} fontSize={14} fontWeight="700">{row.val}</text>
            {/* complement label */}
            <text x={132} y={y + 20} fill={TEXT_SECONDARY} fontFamily={FONT} fontSize={10}>complement</text>
            <text x={132} y={y + 38} fill={c} fontFamily={FONT} fontSize={13} fontWeight="700">9 − {row.val} = {row.comp}</text>
            {/* map state */}
            <text x={290} y={y + 20} fill={TEXT_SECONDARY} fontFamily={FONT} fontSize={10}>map state</text>
            <text x={290} y={y + 38} fill={TEXT_PRIMARY} fontFamily={FONT} fontSize={11}>{row.mapBefore}</text>
            {/* action */}
            <text x={450} y={y + 20} fill={TEXT_SECONDARY} fontFamily={FONT} fontSize={10}>action</text>
            <text x={450} y={y + 38} fill={row.found ? c : TEXT_PRIMARY} fontFamily={FONT} fontSize={11} fontWeight={row.found ? "700" : "400"}>{row.action}</text>
          </g>
        );
      })}

      {/* Result */}
      <rect x={20} y={294} width={636} height={36} rx={6} fill="rgba(248,115,22,0.12)" stroke={c} strokeWidth={1.5} />
      <text x={340} y={317} textAnchor="middle" fill={c} fontFamily={FONT} fontSize={13} fontWeight="700">
        RESULT: indices [0, 1] — O(n) time, O(n) space
      </text>
    </svg>
  );
}

// ─── DS2: Linked list reversal ─────────────────────────────────────────────────

function DiagramDS2() {
  const id = "ds2";
  const c = DS_COLOR;

  function Node({ x, y, val, color }) {
    return (
      <g>
        <rect x={x} y={y} width={44} height={36} rx={6} fill={NODE_FILL} stroke={color || NODE_STROKE} strokeWidth={color ? 1.5 : 1} />
        <text x={x + 22} y={y + 24} textAnchor="middle" fill={TEXT_PRIMARY} fontFamily={FONT} fontSize={15} fontWeight="700">{val}</text>
      </g>
    );
  }

  return (
    <svg viewBox="0 0 680 320" width="100%" style={{ display: "block" }}>
      <Defs id={id} color={c} />
      <text x={340} y={22} textAnchor="middle" fill={c} fontFamily={FONT} fontSize={13} fontWeight="700">
        Linked List Reversal — Iterative (O(n) time, O(1) space)
      </text>

      {/* BEFORE */}
      <SectionLabel x={20} y={50} text="BEFORE" color={TEXT_SECONDARY} />
      {[1, 2, 3, 4, 5].map((v, i) => (
        <g key={i}>
          <Node x={20 + i * 80} y={58} val={v} />
          {i < 4 && <Arrow x1={64 + i * 80} y1={76} x2={98 + i * 80} y2={76} diagId={id} />}
        </g>
      ))}
      {/* NULL */}
      <text x={446} y={82} fill={TEXT_SECONDARY} fontFamily={FONT} fontSize={12}>→ NULL</text>

      {/* Pointer labels before */}
      <text x={42} y={108} textAnchor="middle" fill={c} fontFamily={FONT} fontSize={10}>head</text>

      {/* DURING */}
      <SectionLabel x={20} y={135} text="DURING — Three-pointer technique" color={TEXT_SECONDARY} />
      <rect x={20} y={143} width={636} height={80} rx={6} fill={NODE_FILL} stroke={NODE_STROKE} />

      {/* pointer row */}
      {[
        { label: "prev", x: 70, color: "#9a9590" },
        { label: "curr", x: 200, color: c },
        { label: "next", x: 330, color: "#a855f7" },
      ].map(({ label, x, color }) => (
        <g key={label}>
          <rect x={x - 24} y={155} width={48} height={28} rx={5} fill="rgba(255,255,255,0.04)" stroke={color} strokeWidth={1.5} />
          <text x={x} y={174} textAnchor="middle" fill={color} fontFamily={FONT} fontSize={12} fontWeight="700">{label}</text>
        </g>
      ))}
      <text x={500} y={174} fill={TEXT_SECONDARY} fontFamily={FONT} fontSize={12}>→ remaining list</text>

      {/* Step description */}
      {[
        "1. next = curr.next  (save next node)",
        "2. curr.next = prev  (reverse the pointer)",
        "3. prev = curr       (advance prev)",
        "4. curr = next       (advance curr)",
      ].map((step, i) => (
        <text key={i} x={36} y={196 + i * 14} fill={TEXT_SECONDARY} fontFamily={FONT} fontSize={11}>{step}</text>
      ))}
      <text x={450} y={196} fill={c} fontFamily={FONT} fontSize={11} fontWeight="600">repeat until curr = null</text>

      {/* AFTER */}
      <SectionLabel x={20} y={242} text="AFTER" color={TEXT_SECONDARY} />
      {[5, 4, 3, 2, 1].map((v, i) => (
        <g key={i}>
          <Node x={20 + i * 80} y={250} val={v} color={i === 0 ? c : undefined} />
          {i < 4 && <Arrow x1={64 + i * 80} y1={268} x2={98 + i * 80} y2={268} diagId={id} color={i === 0 ? c : undefined} />}
        </g>
      ))}
      <text x={446} y={274} fill={TEXT_SECONDARY} fontFamily={FONT} fontSize={12}>→ NULL</text>
      <text x={42} y={300} textAnchor="middle" fill={c} fontFamily={FONT} fontSize={10}>new head</text>
    </svg>
  );
}

// ─── DS3: BST validation ───────────────────────────────────────────────────────

function DiagramDS3() {
  const id = "ds3";
  const c = DS_COLOR;
  const VALID_GREEN = "#22c55e";
  const INVALID_RED = "#ef4444";

  function TreeNode({ cx, cy, val, valid, invalid }) {
    const stroke = invalid ? INVALID_RED : valid ? VALID_GREEN : NODE_STROKE;
    const fill = invalid ? "rgba(239,68,68,0.12)" : valid ? "rgba(34,197,94,0.08)" : NODE_FILL;
    return (
      <g>
        <circle cx={cx} cy={cy} r={18} fill={fill} stroke={stroke} strokeWidth={1.5} />
        <text x={cx} y={cy + 5} textAnchor="middle" fill={TEXT_PRIMARY} fontFamily={FONT} fontSize={13} fontWeight="700">{val}</text>
      </g>
    );
  }

  function Edge({ x1, y1, x2, y2, invalid }) {
    return (
      <line x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={invalid ? INVALID_RED : NODE_STROKE}
        strokeWidth={invalid ? 2 : 1}
        strokeDasharray={invalid ? "4,2" : undefined}
      />
    );
  }

  return (
    <svg viewBox="0 0 680 320" width="100%" style={{ display: "block" }}>
      <Defs id={id} color={c} />
      <text x={340} y={22} textAnchor="middle" fill={c} fontFamily={FONT} fontSize={13} fontWeight="700">
        BST Validation — Recursive Range Check
      </text>

      {/* VALID TREE (left half) */}
      <SectionLabel x={60} y={50} text="VALID BST" color={VALID_GREEN} />
      <text x={60} y={64} fill={TEXT_SECONDARY} fontFamily={FONT} fontSize={10}>all constraints satisfied</text>

      {/* level 0 */}
      <TreeNode cx={150} cy={90} val={8} valid />
      {/* level 1 */}
      <Edge x1={135} y1={106} x2={105} y2={136} />
      <Edge x1={165} y1={106} x2={205} y2={136} />
      <TreeNode cx={95} cy={150} val={4} valid />
      <TreeNode cx={215} cy={150} val={10} valid />
      {/* level 2 */}
      <Edge x1={80} y1={166} x2={58} y2={196} />
      <Edge x1={110} y1={166} x2={130} y2={196} />
      <Edge x1={228} y1={166} x2={248} y2={196} />
      <TreeNode cx={48} cy={210} val={2} valid />
      <TreeNode cx={140} cy={210} val={6} valid />
      <TreeNode cx={258} cy={210} val={12} valid />

      {/* Range labels */}
      <text x={48} y={240} textAnchor="middle" fill={TEXT_SECONDARY} fontFamily={FONT} fontSize={9}>(−∞, 4)</text>
      <text x={140} y={240} textAnchor="middle" fill={TEXT_SECONDARY} fontFamily={FONT} fontSize={9}>(4, 8)</text>
      <text x={258} y={240} textAnchor="middle" fill={TEXT_SECONDARY} fontFamily={FONT} fontSize={9}>(10, +∞)</text>

      <rect x={30} y={258} width={270} height={48} rx={5} fill="rgba(34,197,94,0.06)" stroke={VALID_GREEN} strokeWidth={1} />
      <text x={165} y={275} textAnchor="middle" fill={VALID_GREEN} fontFamily={FONT} fontSize={11} fontWeight="700">✓ VALID</text>
      <text x={165} y={292} textAnchor="middle" fill={TEXT_SECONDARY} fontFamily={FONT} fontSize={10}>every node within (min, max) bounds</text>

      {/* Divider */}
      <line x1={340} y1={40} x2={340} y2={315} stroke={NODE_STROKE} strokeWidth={1} strokeDasharray="4,3" />

      {/* INVALID TREE (right half) */}
      <SectionLabel x={380} y={50} text="INVALID BST" color={INVALID_RED} />
      <text x={380} y={64} fill={TEXT_SECONDARY} fontFamily={FONT} fontSize={10}>12 violates left subtree constraint</text>

      <TreeNode cx={480} cy={90} val={8} />
      <Edge x1={465} y1={106} x2={435} y2={136} />
      <Edge x1={495} y1={106} x2={535} y2={136} />
      <TreeNode cx={425} cy={150} val={4} />
      <TreeNode cx={545} cy={150} val={10} />
      <Edge x1={410} y1={166} x2={388} y2={196} />
      <Edge x1={440} y1={166} x2={460} y2={196} invalid />
      <Edge x1={558} y1={166} x2={578} y2={196} />
      <TreeNode cx={378} cy={210} val={2} />
      <TreeNode cx={470} cy={210} val={12} invalid />
      <TreeNode cx={588} cy={210} val={9} />

      {/* Invalid annotation */}
      <text x={470} y={240} textAnchor="middle" fill={INVALID_RED} fontFamily={FONT} fontSize={9}>12 &gt; 8 but in</text>
      <text x={470} y={252} textAnchor="middle" fill={INVALID_RED} fontFamily={FONT} fontSize={9}>left subtree!</text>

      <rect x={360} y={258} width={270} height={48} rx={5} fill="rgba(239,68,68,0.06)" stroke={INVALID_RED} strokeWidth={1} />
      <text x={495} y={275} textAnchor="middle" fill={INVALID_RED} fontFamily={FONT} fontSize={11} fontWeight="700">✗ INVALID</text>
      <text x={495} y={292} textAnchor="middle" fill={TEXT_SECONDARY} fontFamily={FONT} fontSize={10}>node 12 exceeds max bound (8) for left subtree</text>
    </svg>
  );
}

// ─── DS4: Number of Islands ────────────────────────────────────────────────────

function DiagramDS4() {
  const id = "ds4";
  const c = DS_COLOR;
  const ISLAND_COLORS = [DS_COLOR, "#22c55e", "#a855f7"];
  const WATER = "#1e3a5f";

  const grid = [
    [1, 1, 0, 0, 0],
    [1, 1, 0, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 0, 1, 1],
  ];
  // island membership
  const islands = [
    [0, 0, -1, -1, -1],
    [0, 0, -1, -1, -1],
    [-1, -1, 1, -1, -1],
    [-1, -1, -1, 2, 2],
  ];

  const CELL = 46;
  const GRID_X = 30;
  const GRID_Y = 55;

  return (
    <svg viewBox="0 0 680 310" width="100%" style={{ display: "block" }}>
      <Defs id={id} color={c} />
      <text x={340} y={22} textAnchor="middle" fill={c} fontFamily={FONT} fontSize={13} fontWeight="700">
        Number of Islands — BFS/DFS Connected Components
      </text>

      {/* INPUT label */}
      <SectionLabel x={GRID_X} y={48} text="INPUT GRID" color={TEXT_SECONDARY} />

      {/* Draw input grid */}
      {grid.map((row, r) =>
        row.map((cell, col) => {
          const x = GRID_X + col * CELL;
          const y = GRID_Y + r * CELL;
          const islandIdx = islands[r][col];
          const fill = cell === 0 ? "rgba(30,58,95,0.6)" : islandIdx >= 0 ? `${ISLAND_COLORS[islandIdx]}22` : NODE_FILL;
          const stroke = cell === 0 ? "rgba(30,58,95,0.9)" : islandIdx >= 0 ? ISLAND_COLORS[islandIdx] : NODE_STROKE;
          return (
            <g key={`${r}-${col}`}>
              <rect x={x + 2} y={y + 2} width={CELL - 4} height={CELL - 4} rx={5} fill={fill} stroke={stroke} strokeWidth={cell === 1 ? 1.5 : 1} />
              <text x={x + CELL / 2} y={y + CELL / 2 + 5} textAnchor="middle" fill={cell === 1 ? TEXT_PRIMARY : TEXT_SECONDARY} fontFamily={FONT} fontSize={13} fontWeight={cell === 1 ? "700" : "400"}>
                {cell}
              </text>
            </g>
          );
        })
      )}

      {/* Island labels on grid */}
      <text x={GRID_X + CELL} y={GRID_Y + CELL + 28} textAnchor="middle" fill={ISLAND_COLORS[0]} fontFamily={FONT} fontSize={10} fontWeight="700">Island 1</text>
      <text x={GRID_X + 2 * CELL + CELL / 2} y={GRID_Y + 2 * CELL + 28} textAnchor="middle" fill={ISLAND_COLORS[1]} fontFamily={FONT} fontSize={10} fontWeight="700">Island 2</text>
      <text x={GRID_X + 3 * CELL + CELL} y={GRID_Y + 3 * CELL + 28} textAnchor="middle" fill={ISLAND_COLORS[2]} fontFamily={FONT} fontSize={10} fontWeight="700">Island 3</text>

      {/* BFS Algorithm box */}
      <rect x={290} y={48} width={368} height={230} rx={6} fill={NODE_FILL} stroke={NODE_STROKE} />
      <text x={474} y={68} textAnchor="middle" fill={c} fontFamily={FONT} fontSize={12} fontWeight="700">BFS ALGORITHM</text>

      {[
        { step: "1", text: "Scan grid cell by cell", sub: "" },
        { step: "2", text: "Find unvisited '1' → new island!", sub: "increment counter" },
        { step: "3", text: "BFS: push cell to queue", sub: "mark as visited" },
        { step: "4", text: "Pop cell, explore 4 neighbors", sub: "up, down, left, right" },
        { step: "5", text: "Add unvisited land neighbors to queue", sub: "mark each visited" },
        { step: "6", text: "Repeat until queue empty", sub: "entire island consumed" },
        { step: "7", text: "Continue scan for next island", sub: "" },
      ].map(({ step, text, sub }, i) => (
        <g key={i}>
          <circle cx={316} cy={88 + i * 26} r={9} fill={`${c}22`} stroke={c} strokeWidth={1} />
          <text x={316} y={92 + i * 26} textAnchor="middle" fill={c} fontFamily={FONT} fontSize={10} fontWeight="700">{step}</text>
          <text x={334} y={92 + i * 26} fill={TEXT_PRIMARY} fontFamily={FONT} fontSize={11}>{text}</text>
          {sub && <text x={334} y={104 + i * 26} fill={TEXT_SECONDARY} fontFamily={FONT} fontSize={10}>{sub}</text>}
        </g>
      ))}

      {/* Result */}
      <rect x={290} y={265} width={368} height={36} rx={5} fill={`${c}15`} stroke={c} strokeWidth={1.5} />
      <text x={474} y={288} textAnchor="middle" fill={c} fontFamily={FONT} fontSize={13} fontWeight="700">
        Result: 3 islands — O(m×n) time and space
      </text>
    </svg>
  );
}

// ─── DS5: Big O complexity chart ──────────────────────────────────────────────

function DiagramDS5() {
  const id = "ds5";
  const c = DS_COLOR;

  const W = 640, H = 280;
  const PAD = { top: 40, right: 20, bottom: 50, left: 60 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const N = 40; // number of x points
  const maxY = 60;

  function xPx(n) { return PAD.left + (n / N) * chartW; }
  function yPx(val) { return PAD.top + chartH - Math.min(val, maxY) / maxY * chartH; }

  function makePath(fn) {
    return Array.from({ length: N + 1 }, (_, i) => {
      const val = fn(i === 0 ? 0.01 : i);
      const x = xPx(i);
      const y = yPx(val);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
  }

  const curves = [
    { label: "O(1)", fn: () => 1, color: "#22c55e" },
    { label: "O(log n)", fn: n => Math.log2(n + 1), color: "#3b82f6" },
    { label: "O(n)", fn: n => n * 1.5, color: c },
    { label: "O(n log n)", fn: n => n * Math.log2(n + 1) * 0.4, color: "#eab308" },
    { label: "O(n²)", fn: n => n * n * 0.06, color: "#ef4444" },
  ];

  // X axis labels
  const xLabels = [0, 10, 20, 30, 40];
  // Y axis labels
  const yLabels = [0, 20, 40, 60];

  return (
    <svg viewBox={`0 0 ${W + 20} ${H + 20}`} width="100%" style={{ display: "block" }}>
      <Defs id={id} color={c} />
      <text x={(W + 20) / 2} y={18} textAnchor="middle" fill={c} fontFamily={FONT} fontSize={13} fontWeight="700">
        Big O Complexity — Growth Rate Comparison
      </text>

      {/* Grid lines */}
      {yLabels.map(val => (
        <g key={val}>
          <line x1={PAD.left} y1={yPx(val)} x2={PAD.left + chartW} y2={yPx(val)} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
          <text x={PAD.left - 6} y={yPx(val) + 4} textAnchor="end" fill={TEXT_SECONDARY} fontFamily={FONT} fontSize={10}>{val}</text>
        </g>
      ))}
      {xLabels.map(val => (
        <g key={val}>
          <line x1={xPx(val)} y1={PAD.top} x2={xPx(val)} y2={PAD.top + chartH} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
          <text x={xPx(val)} y={PAD.top + chartH + 16} textAnchor="middle" fill={TEXT_SECONDARY} fontFamily={FONT} fontSize={10}>{val}</text>
        </g>
      ))}

      {/* Axes */}
      <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + chartH} stroke={NODE_STROKE} strokeWidth={1.5} />
      <line x1={PAD.left} y1={PAD.top + chartH} x2={PAD.left + chartW} y2={PAD.top + chartH} stroke={NODE_STROKE} strokeWidth={1.5} />

      {/* Axis labels */}
      <text x={PAD.left + chartW / 2} y={H + 12} textAnchor="middle" fill={TEXT_SECONDARY} fontFamily={FONT} fontSize={11}>n (input size)</text>
      <text x={16} y={PAD.top + chartH / 2} textAnchor="middle" fill={TEXT_SECONDARY} fontFamily={FONT} fontSize={11} transform={`rotate(-90, 16, ${PAD.top + chartH / 2})`}>operations</text>

      {/* Curves */}
      {curves.map(({ label, fn, color }) => (
        <path key={label} d={makePath(fn)} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      ))}

      {/* Curve labels (right side) */}
      {curves.map(({ label, fn, color }) => {
        const val = fn(N);
        const clampedVal = Math.min(val, maxY);
        const y = yPx(clampedVal);
        return (
          <text key={label} x={PAD.left + chartW + 4} y={Math.max(PAD.top + 8, Math.min(y + 4, PAD.top + chartH))} fill={color} fontFamily={FONT} fontSize={11} fontWeight="700">{label}</text>
        );
      })}

      {/* DS operations table */}
      <rect x={20} y={H - 8} width={W - 20} height={28} rx={5} fill={NODE_FILL} stroke={NODE_STROKE} />
      <text x={30} y={H + 10} fill={TEXT_SECONDARY} fontFamily={FONT} fontSize={10}>
        Array: Access O(1) | Hash Table: Search O(1) | BST: O(log n) | Sort: O(n log n) | Naive search: O(n²)
      </text>
    </svg>
  );
}

// ─── DS7: Floyd's cycle detection ─────────────────────────────────────────────

function DiagramDS7() {
  const id = "ds7";
  const c = DS_COLOR;
  const HARE_COLOR = "#a855f7";
  const TORTOISE_COLOR = "#22c55e";
  const MEET_COLOR = "#ef4444";

  function LLNode({ x, y, val, label, labelColor }) {
    return (
      <g>
        <rect x={x} y={y} width={40} height={34} rx={6} fill={NODE_FILL} stroke={NODE_STROKE} />
        <text x={x + 20} y={y + 22} textAnchor="middle" fill={TEXT_PRIMARY} fontFamily={FONT} fontSize={13} fontWeight="700">{val}</text>
        {label && (
          <text x={x + 20} y={y - 6} textAnchor="middle" fill={labelColor || TEXT_SECONDARY} fontFamily={FONT} fontSize={10} fontWeight="700">{label}</text>
        )}
      </g>
    );
  }

  // Nodes: 1→2→3→4→5→6→7→8 (cycle: 8→4)
  const linearNodes = [
    { val: 1, x: 20 }, { val: 2, x: 80 }, { val: 3, x: 140 },
    { val: 4, x: 200 }, { val: 5, x: 260 }, { val: 6, x: 320 },
  ];
  const cycleNodes = [
    { val: 7, x: 500, y: 80 },
    { val: 8, x: 500, y: 148 },
    { val: 9, x: 380, y: 148 },
  ];

  const nodeY = 80;

  return (
    <svg viewBox="0 0 660 310" width="100%" style={{ display: "block" }}>
      <Defs id={id} color={c} />
      <text x={330} y={22} textAnchor="middle" fill={c} fontFamily={FONT} fontSize={13} fontWeight="700">
        Floyd's Cycle Detection — Tortoise & Hare
      </text>

      {/* Linear part */}
      {linearNodes.map(({ val, x }, i) => (
        <g key={val}>
          <LLNode x={x} y={nodeY} val={val} />
          {i < linearNodes.length - 1 && (
            <Arrow x1={x + 40} y1={nodeY + 17} x2={x + 78} y2={nodeY + 17} diagId={id} />
          )}
        </g>
      ))}

      {/* Arrow from node 6 to node 7 (entering cycle) */}
      <Arrow x1={360} y1={nodeY + 17} x2={498} y2={nodeY + 17} diagId={id} />

      {/* Cycle nodes */}
      <LLNode x={cycleNodes[0].x} y={cycleNodes[0].y} val={cycleNodes[0].val} />
      <LLNode x={cycleNodes[1].x} y={cycleNodes[1].y} val={cycleNodes[1].val} />
      <LLNode x={cycleNodes[2].x} y={cycleNodes[2].y} val={cycleNodes[2].val} />

      {/* Cycle arrows: 7→8→9→4 */}
      <Arrow x1={520} y1={nodeY + 34} x2={520} y2={146} diagId={id} />
      <Arrow x1={500} y1={165} x2={422} y2={165} diagId={id} />
      {/* 9→4 (back to linear node 4) */}
      <path d="M380,148 Q350,128 260,97" fill="none" stroke={NODE_STROKE} strokeWidth={1.5} markerEnd={`url(#arrow-gray-${id})`} />
      <text x={345} y={125} fill={TEXT_SECONDARY} fontFamily={FONT} fontSize={9}>cycle back to 4</text>

      {/* Pointer tracking table */}
      <rect x={20} y={198} width={620} height={96} rx={6} fill={NODE_FILL} stroke={NODE_STROKE} />
      <text x={330} y={216} textAnchor="middle" fill={c} fontFamily={FONT} fontSize={11} fontWeight="700">POINTER POSITIONS (each step: slow+1, fast+2)</text>

      {/* Table header */}
      {["Step", "Tortoise (slow)", "Hare (fast)", "Status"].map((h, i) => (
        <text key={i} x={[36, 130, 300, 470][i]} y={232} fill={TEXT_SECONDARY} fontFamily={FONT} fontSize={10} fontWeight="700">{h}</text>
      ))}
      <line x1={24} y1={235} x2={636} y2={235} stroke={NODE_STROKE} />

      {[
        { step: 0, slow: "1", fast: "1", status: "Start" },
        { step: 1, slow: "2", fast: "3", status: "Moving..." },
        { step: 2, slow: "3", fast: "5", status: "Moving..." },
        { step: 3, slow: "4", fast: "7", status: "Moving..." },
        { step: 4, slow: "5", fast: "9", status: "Moving..." },
        { step: 5, slow: "6", fast: "6", status: "MEET — cycle detected!" },
      ].map(({ step, slow, fast, status }, i) => {
        const y = 248 + i * 13;
        const isMeet = status.includes("MEET");
        return (
          <g key={step}>
            <text x={36} y={y} fill={TEXT_SECONDARY} fontFamily={FONT} fontSize={10}>{step}</text>
            <text x={130} y={y} fill={TORTOISE_COLOR} fontFamily={FONT} fontSize={10} fontWeight="600">{slow}</text>
            <text x={300} y={y} fill={HARE_COLOR} fontFamily={FONT} fontSize={10} fontWeight="600">{fast}</text>
            <text x={470} y={y} fill={isMeet ? MEET_COLOR : TEXT_SECONDARY} fontFamily={FONT} fontSize={10} fontWeight={isMeet ? "700" : "400"}>{status}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── DS9: Topological sort (DAG) ──────────────────────────────────────────────

function DiagramDS9() {
  const id = "ds9";
  const c = DS_COLOR;

  // Nodes: 0, 1, 2, 3 with coords
  // Edges: 1→0, 2→0, 3→1, 3→2
  const nodes = [
    { id: 0, label: "0", sub: "no prereqs", x: 160, y: 120 },
    { id: 1, label: "1", sub: "needs 0", x: 320, y: 60 },
    { id: 2, label: "2", sub: "needs 0", x: 320, y: 180 },
    { id: 3, label: "3", sub: "needs 1, 2", x: 490, y: 120 },
  ];
  const edges = [
    { from: 1, to: 0 }, { from: 2, to: 0 }, { from: 3, to: 1 }, { from: 3, to: 2 },
  ];

  const ORDER_COLORS = [c, "#22c55e", "#3b82f6", "#a855f7"];

  return (
    <svg viewBox="0 0 680 310" width="100%" style={{ display: "block" }}>
      <Defs id={id} color={c} />
      <text x={340} y={22} textAnchor="middle" fill={c} fontFamily={FONT} fontSize={13} fontWeight="700">
        Topological Sort (Kahn's Algorithm) — Course Schedule
      </text>

      {/* DAG */}
      <SectionLabel x={30} y={48} text="DIRECTED ACYCLIC GRAPH" color={TEXT_SECONDARY} />

      {/* Edges */}
      {edges.map(({ from, to }) => {
        const f = nodes.find(n => n.id === from);
        const t = nodes.find(n => n.id === to);
        const dx = t.x - f.x, dy = t.y - f.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const r = 22;
        return (
          <Arrow
            key={`${from}-${to}`}
            x1={f.x + (dx / len) * r} y1={f.y + (dy / len) * r}
            x2={t.x - (dx / len) * r} y2={t.y - (dy / len) * r}
            diagId={id}
          />
        );
      })}

      {/* Nodes */}
      {nodes.map(n => (
        <g key={n.id}>
          <circle cx={n.x} cy={n.y} r={22} fill={`${ORDER_COLORS[n.id]}18`} stroke={ORDER_COLORS[n.id]} strokeWidth={1.5} />
          <text x={n.x} y={n.y + 5} textAnchor="middle" fill={TEXT_PRIMARY} fontFamily={FONT} fontSize={14} fontWeight="700">{n.label}</text>
          <text x={n.x} y={n.y + 36} textAnchor="middle" fill={TEXT_SECONDARY} fontFamily={FONT} fontSize={10}>{n.sub}</text>
        </g>
      ))}

      {/* In-degree labels */}
      {[
        { id: 0, label: "in: 2", x: 118, y: 106 },
        { id: 1, label: "in: 1", x: 340, y: 48 },
        { id: 2, label: "in: 1", x: 340, y: 196 },
        { id: 3, label: "in: 0", x: 490, y: 90 },
      ].map(({ label, x, y, id: nid }) => (
        <text key={nid} x={x} y={y} fill={ORDER_COLORS[nid]} fontFamily={FONT} fontSize={10} fontWeight="700">{label}</text>
      ))}

      {/* Algorithm steps table */}
      <rect x={20} y={220} width={636} height={78} rx={6} fill={NODE_FILL} stroke={NODE_STROKE} />
      <text x={338} y={237} textAnchor="middle" fill={c} fontFamily={FONT} fontSize={11} fontWeight="700">KAHN'S ALGORITHM — BFS with in-degree queue</text>

      {/* Step headers */}
      {["Step", "Process", "Queue after", "Output order", "In-degrees updated"].map((h, i) => (
        <text key={i} x={[30, 90, 210, 340, 480][i]} y={252} fill={TEXT_SECONDARY} fontFamily={FONT} fontSize={10} fontWeight="700">{h}</text>
      ))}
      <line x1={24} y1={255} x2={652} y2={255} stroke={NODE_STROKE} />

      {[
        { step: "Init", proc: "—", queue: "[0, 3]", out: "[ ]", delta: "start with in-degree=0 nodes" },
        { step: "Pop 0", proc: "node 0", queue: "[ 3 ]", out: "[0]", delta: "node 1→0, node 2→0" },
        { step: "Pop 3", proc: "node 3", queue: "[1, 2]", out: "[0, 3]", delta: "node 1−1=0, node 2−1=0" },
        { step: "Pop 1,2", proc: "nodes 1,2", queue: "[ ]", out: "[0,3,1,2]", delta: "all done ✓" },
      ].map(({ step, proc, queue, out, delta }, i) => {
        const y = 268 + i * 11;
        return (
          <g key={i}>
            <text x={30} y={y} fill={TEXT_SECONDARY} fontFamily={FONT} fontSize={9}>{step}</text>
            <text x={90} y={y} fill={ORDER_COLORS[i % 4]} fontFamily={FONT} fontSize={9} fontWeight="600">{proc}</text>
            <text x={210} y={y} fill={TEXT_PRIMARY} fontFamily={FONT} fontSize={9}>{queue}</text>
            <text x={340} y={y} fill={c} fontFamily={FONT} fontSize={9} fontWeight="600">{out}</text>
            <text x={480} y={y} fill={TEXT_SECONDARY} fontFamily={FONT} fontSize={9}>{delta}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── DS10: Trie structure ─────────────────────────────────────────────────────

function DiagramDS10() {
  const id = "ds10";
  const c = DS_COLOR;

  function TrieNode({ x, y, char, isEnd, highlight }) {
    const r = 16;
    const stroke = highlight ? c : isEnd ? "#22c55e" : NODE_STROKE;
    const fill = highlight ? `${c}22` : isEnd ? "rgba(34,197,94,0.1)" : NODE_FILL;
    return (
      <g>
        <circle cx={x} cy={y} r={r} fill={fill} stroke={stroke} strokeWidth={isEnd || highlight ? 2 : 1} />
        <text x={x} y={y + 5} textAnchor="middle" fill={TEXT_PRIMARY} fontFamily={FONT} fontSize={12} fontWeight="700">{char}</text>
        {isEnd && <circle cx={x} cy={y} r={r + 3} fill="none" stroke="#22c55e" strokeWidth={1} strokeDasharray="3,2" />}
      </g>
    );
  }

  function Edge({ x1, y1, x2, y2, highlight }) {
    return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={highlight ? c : NODE_STROKE} strokeWidth={highlight ? 2 : 1} />;
  }

  // Trie for: cat, car, card, care, dog
  // root → c → a → t(end)
  //                → r(end) → d(end)
  //                          → e(end)
  //      → d → o → g(end)
  const nodes = [
    { id: "root", char: "·", x: 340, y: 55 },
    { id: "c", char: "c", x: 220, y: 115 },
    { id: "d", char: "d", x: 460, y: 115 },
    { id: "a", char: "a", x: 220, y: 175 },
    { id: "o", char: "o", x: 460, y: 175 },
    { id: "t", char: "t", x: 140, y: 240, isEnd: true },
    { id: "r", char: "r", x: 280, y: 240 },
    { id: "g", char: "g", x: 460, y: 240, isEnd: true },
    { id: "rd", char: "d", x: 220, y: 305, isEnd: true },
    { id: "re", char: "e", x: 340, y: 305, isEnd: true },
  ];

  const edges = [
    ["root", "c"], ["root", "d"],
    ["c", "a"], ["d", "o"],
    ["a", "t"], ["a", "r"], ["o", "g"],
    ["r", "rd"], ["r", "re"],
  ];

  const byId = Object.fromEntries(nodes.map(n => [n.id, n]));

  // Highlight path for "car"
  const highlightPath = new Set(["root", "c", "a", "r"]);
  const highlightEdges = new Set(["root-c", "c-a", "a-r"]);

  return (
    <svg viewBox="0 0 680 360" width="100%" style={{ display: "block" }}>
      <Defs id={id} color={c} />
      <text x={340} y={22} textAnchor="middle" fill={c} fontFamily={FONT} fontSize={13} fontWeight="700">
        Trie (Prefix Tree) — Autocomplete Structure
      </text>
      <text x={340} y={38} textAnchor="middle" fill={TEXT_SECONDARY} fontFamily={FONT} fontSize={10}>
        words: cat, car, card, care, dog — highlighted: autocomplete("car")
      </text>

      {/* Edges */}
      {edges.map(([fromId, toId]) => {
        const f = byId[fromId], t = byId[toId];
        const key = `${fromId}-${toId}`;
        return <Edge key={key} x1={f.x} y1={f.y} x2={t.x} y2={t.y} highlight={highlightEdges.has(key)} />;
      })}

      {/* Nodes */}
      {nodes.map(n => (
        <TrieNode key={n.id} x={n.x} y={n.y} char={n.char} isEnd={n.isEnd} highlight={highlightPath.has(n.id)} />
      ))}

      {/* Word labels at leaf/end nodes */}
      <text x={140} y={270} textAnchor="middle" fill="#22c55e" fontFamily={FONT} fontSize={10}>"cat"</text>
      <text x={220} y={328} textAnchor="middle" fill="#22c55e" fontFamily={FONT} fontSize={10}>"card"</text>
      <text x={340} y={328} textAnchor="middle" fill="#22c55e" fontFamily={FONT} fontSize={10}>"care"</text>
      <text x={460} y={268} textAnchor="middle" fill="#22c55e" fontFamily={FONT} fontSize={10}>"dog"</text>
      <text x={280} y={268} textAnchor="middle" fill={c} fontFamily={FONT} fontSize={10}>"car" ✓</text>

      {/* Legend */}
      <g>
        <circle cx={30} cy={345} r={8} fill="rgba(34,197,94,0.1)" stroke="#22c55e" strokeWidth={1.5} />
        <text x={44} y={349} fill="#22c55e" fontFamily={FONT} fontSize={10}>word end node</text>
        <circle cx={150} cy={345} r={8} fill={`${c}22`} stroke={c} strokeWidth={2} />
        <text x={164} y={349} fill={c} fontFamily={FONT} fontSize={10}>autocomplete("car") path</text>
        <text x={340} y={349} fill={TEXT_SECONDARY} fontFamily={FONT} fontSize={10}>Insert/Search: O(m) — m = word length</text>
      </g>
    </svg>
  );
}

// ─── SD1: URL Shortener architecture ─────────────────────────────────────────

function DiagramSD1() {
  const id = "sd1";
  const c = SD_COLOR;

  return (
    <svg viewBox="0 0 680 340" width="100%" style={{ display: "block" }}>
      <Defs id={id} color={c} />
      <text x={340} y={22} textAnchor="middle" fill={c} fontFamily={FONT} fontSize={13} fontWeight="700">
        URL Shortener — System Architecture
      </text>

      {/* Write path label */}
      <SectionLabel x={20} y={48} text="WRITE PATH (shorten URL)" color={TEXT_SECONDARY} />

      {/* Write path components */}
      <Box x={20} y={56} w={80} h={36} label="Client" color={c} />
      <Arrow x1={100} y1={74} x2={138} y2={74} diagId={id} color={c} label="POST /shorten" />
      <Box x={138} y={56} w={90} h={36} label="Load Balancer" sub="L7/Nginx" />
      <Arrow x1={228} y1={74} x2={266} y2={74} diagId={id} color={c} />
      <Box x={266} y={56} w={90} h={36} label="API Server" sub="REST" />
      <Arrow x1={356} y1={74} x2={394} y2={74} diagId={id} color={c} />
      <Box x={394} y={56} w={100} h={36} label="Key Gen Svc" sub="Base62 encode" color={c} />
      <Arrow x1={494} y1={74} x2={532} y2={74} diagId={id} color={c} />
      <Box x={532} y={56} w={108} h={36} label="Database (KV)" sub="Cassandra/DynamoDB" />

      {/* Write return */}
      <Arrow x1={311} y1={92} x2={311} y2={116} diagId={id} color={c} label="short URL" />

      {/* Read path label */}
      <SectionLabel x={20} y={118} text="READ PATH (redirect) — ~100× more traffic" color={TEXT_SECONDARY} />

      {/* Read path */}
      <Box x={20} y={126} w={80} h={36} label="Client" color={c} />
      <Arrow x1={100} y1={144} x2={138} y2={144} diagId={id} color={c} label="GET /abc123" />
      <Box x={138} y={126} w={90} h={36} label="Load Balancer" />
      <Arrow x1={228} y1={144} x2={266} y2={144} diagId={id} color={c} />
      <Box x={266} y={126} w={90} h={36} label="API Server" />

      {/* Cache branch */}
      <Arrow x1={356} y1={144} x2={410} y2={144} diagId={id} color={c} />
      <Box x={410} y={126} w={90} h={36} label="Redis Cache" sub="~1ms lookup" color={c} />

      {/* Cache hit */}
      <Arrow x1={455} y1={126} x2={455} y2={92} diagId={id} color={c} label="HIT → 301" />
      <text x={492} y={108} fill={c} fontFamily={FONT} fontSize={10} fontWeight="700">Cache HIT</text>

      {/* Cache miss → DB */}
      <Arrow x1={500} y1={144} x2={536} y2={144} diagId={id} label="MISS" />
      <Box x={536} y={126} w={108} h={36} label="Database (KV)" sub="persistent store" />
      <Arrow x1={590} y1={162} x2={590} y2={184} diagId={id} label="populate cache" />
      <Arrow x1={500} y1={184} x2={410} y2={184} diagId={id} />

      {/* Key gen detail */}
      <rect x={20} y={200} width={636} height={126} rx={6} fill={NODE_FILL} stroke={NODE_STROKE} />
      <text x={338} y={218} textAnchor="middle" fill={c} fontFamily={FONT} fontSize={11} fontWeight="700">KEY GENERATION STRATEGIES</text>

      {[
        { label: "Base62 Hash", desc: "MD5/SHA1 of long URL → take first 6-8 chars. Fast but collision-prone for huge scale.", col: 0 },
        { label: "Counter + Base62", desc: "Global atomic counter (Snowflake ID) encoded to Base62. Guaranteed unique, sequential.", col: 1 },
        { label: "Pre-generated Keys", desc: "Key Gen Svc pre-creates millions of unused keys, stored in DB. No collision risk at request time.", col: 2 },
      ].map(({ label, desc, col }) => (
        <g key={label}>
          <rect x={30 + col * 212} y={226} width={200} height={88} rx={5} fill="rgba(255,255,255,0.03)" stroke={NODE_STROKE} />
          <text x={130 + col * 212} y={244} textAnchor="middle" fill={TEXT_PRIMARY} fontFamily={FONT} fontSize={11} fontWeight="700">{label}</text>
          <foreignObject x={38 + col * 212} y={252} width={184} height={56}>
            <div xmlns="http://www.w3.org/1999/xhtml" style={{ fontFamily: FONT, fontSize: "10px", color: TEXT_SECONDARY, lineHeight: "1.5" }}>
              {desc}
            </div>
          </foreignObject>
        </g>
      ))}
    </svg>
  );
}

// ─── SD2: Chat system ─────────────────────────────────────────────────────────

function DiagramSD2() {
  const id = "sd2";
  const c = SD_COLOR;

  return (
    <svg viewBox="0 0 680 340" width="100%" style={{ display: "block" }}>
      <Defs id={id} color={c} />
      <text x={340} y={22} textAnchor="middle" fill={c} fontFamily={FONT} fontSize={13} fontWeight="700">
        Chat System Architecture — Real-time Messaging
      </text>

      {/* Users */}
      <Box x={20} y={56} w={64} h={38} label="User A" sub="online" color={c} />
      <Box x={20} y={136} w={64} h={38} label="User B" sub="online" color={c} />
      <Box x={20} y={216} w={64} h={38} label="User C" sub="offline" />

      {/* WebSocket connections */}
      <Arrow x1={84} y1={75} x2={130} y2={90} diagId={id} color={c} label="WebSocket" />
      <Arrow x1={84} y1={155} x2={130} y2={140} diagId={id} color={c} label="WebSocket" />
      <Arrow x1={84} y1={235} x2={130} y2={235} diagId={id} label="HTTP long-poll" />

      {/* Chat servers */}
      <Box x={130} y={56} w={100} h={38} label="Chat Server 1" sub="ws:// persistent" color={c} />
      <Box x={130} y={120} w={100} h={38} label="Chat Server 2" sub="ws:// persistent" color={c} />
      <Box x={130} y={216} w={100} h={38} label="Chat Server N" sub="horizontal scale" />

      {/* Arrows to Kafka */}
      <Arrow x1={230} y1={75} x2={278} y2={110} diagId={id} color={c} />
      <Arrow x1={230} y1={139} x2={278} y2={125} diagId={id} color={c} />
      <Arrow x1={230} y1={235} x2={278} y2={175} diagId={id} />

      {/* Kafka */}
      <Box x={278} y={96} w={100} h={60} label="Kafka" sub="message bus" color={c} />
      <text x={328} y={172} textAnchor="middle" fill={TEXT_SECONDARY} fontFamily={FONT} fontSize={10}>partitioned by</text>
      <text x={328} y={184} textAnchor="middle" fill={TEXT_SECONDARY} fontFamily={FONT} fontSize={10}>conversation ID</text>

      {/* Kafka to services */}
      <Arrow x1={378} y1={126} x2={420} y2={86} diagId={id} color={c} />
      <Arrow x1={378} y1={126} x2={420} y2={126} diagId={id} color={c} />
      <Arrow x1={378} y1={126} x2={420} y2={166} diagId={id} color={c} />
      <Arrow x1={378} y1={126} x2={420} y2={206} diagId={id} color={c} />

      {/* Services */}
      <Box x={420} y={66} w={110} h={36} label="Msg Store" sub="Cassandra/HBase" />
      <Box x={420} y={108} w={110} h={36} label="Presence Svc" sub="Redis TTL" />
      <Box x={420} y={150} w={110} h={36} label="Chat Server →" sub="deliver via WS" color={c} />
      <Box x={420} y={192} w={110} h={36} label="Push Notif Svc" sub="APNs / FCM" />

      {/* Push to offline user */}
      <Arrow x1={530} y1={210} x2={580} y2={235} diagId={id} label="push" />
      <Box x={580} y={216} w={80} h={38} label="User C" sub="push notif" />

      {/* Online delivery */}
      <Arrow x1={530} y1={168} x2={600} y2={155} diagId={id} color={c} label="WebSocket" />
      <Box x={600} y={136} w={60} h={38} label="User B" sub="receive" color={c} />

      {/* Flow summary */}
      <rect x={20} y={268} width={636} height={58} rx={6} fill={NODE_FILL} stroke={NODE_STROKE} />
      <text x={28} y={284} fill={c} fontFamily={FONT} fontSize={11} fontWeight="700">ONLINE FLOW:</text>
      <text x={28} y={298} fill={TEXT_SECONDARY} fontFamily={FONT} fontSize={10}>A sends message → Chat Server 1 → Kafka → Chat Server 2 (holds B's WS) → delivered to B in ~50ms</text>
      <text x={28} y={312} fill={TEXT_SECONDARY} fontFamily={FONT} fontSize={10}>OFFLINE FLOW: A sends → Kafka → Push Notif Svc → APNs/FCM → C's device wakes up</text>
    </svg>
  );
}

// ─── SD3: Rate limiter (token bucket) ─────────────────────────────────────────

function DiagramSD3() {
  const id = "sd3";
  const c = SD_COLOR;
  const ALLOW_COLOR = "#22c55e";
  const DENY_COLOR = "#ef4444";

  return (
    <svg viewBox="0 0 680 340" width="100%" style={{ display: "block" }}>
      <Defs id={id} color={c} />
      <text x={340} y={22} textAnchor="middle" fill={c} fontFamily={FONT} fontSize={13} fontWeight="700">
        Rate Limiter — Token Bucket Algorithm
      </text>

      {/* High-level flow */}
      <SectionLabel x={20} y={48} text="REQUEST FLOW" color={TEXT_SECONDARY} />
      <Box x={20} y={56} w={70} h={36} label="Client" color={c} />
      <Arrow x1={90} y1={74} x2={128} y2={74} diagId={id} color={c} />
      <Box x={128} y={56} w={110} h={36} label="API Gateway" sub="rate limiter middleware" color={c} />
      <Arrow x1={238} y1={74} x2={276} y2={74} diagId={id} color={c} />
      <Box x={276} y={56} w={90} h={36} label="Redis Cluster" sub="atomic counters" />

      {/* Rules engine */}
      <Arrow x1={366} y1={74} x2={404} y2={74} diagId={id} />
      <Box x={404} y={56} w={100} h={36} label="Rules Engine" sub="limits config" />

      {/* Decision */}
      <Arrow x1={183} y1={92} x2={183} y2={126} diagId={id} color={c} label="check limit" />

      {/* Decision diamond */}
      <polygon points="183,130 230,158 183,186 136,158" fill={NODE_FILL} stroke={c} strokeWidth={1.5} />
      <text x={183} y={155} textAnchor="middle" fill={TEXT_PRIMARY} fontFamily={FONT} fontSize={11} fontWeight="700">within</text>
      <text x={183} y={168} textAnchor="middle" fill={TEXT_PRIMARY} fontFamily={FONT} fontSize={11} fontWeight="700">limit?</text>

      {/* YES → App server */}
      <Arrow x1={183} y1={186} x2={183} y2={216} diagId={id} color={ALLOW_COLOR} label="YES" />
      <Box x={130} y={216} w={106} h={36} label="App Server" sub="process request" color={ALLOW_COLOR} />
      <Arrow x1={236} y1={234} x2={280} y2={234} diagId={id} color={ALLOW_COLOR} />
      <Box x={280} y={216} w={80} h={36} label="200 OK" color={ALLOW_COLOR} />

      {/* NO → 429 */}
      <Arrow x1={230} y1={158} x2={310} y2={158} diagId={id} color={DENY_COLOR} label="NO" />
      <Box x={310} y={140} w={100} h={36} label="HTTP 429" sub="Too Many Requests" color={DENY_COLOR} />
      <text x={360} y={194} textAnchor="middle" fill={TEXT_SECONDARY} fontFamily={FONT} fontSize={10}>Retry-After header</text>
      <text x={360} y={206} textAnchor="middle" fill={TEXT_SECONDARY} fontFamily={FONT} fontSize={10}>X-RateLimit-* headers</text>

      {/* Token Bucket visual */}
      <SectionLabel x={430} y={120} text="TOKEN BUCKET" color={TEXT_SECONDARY} />
      <rect x={430} y={128} width={220} height={196} rx={6} fill={NODE_FILL} stroke={NODE_STROKE} />

      {/* Bucket graphic */}
      <rect x={490} y={148} width={100} height={80} rx={4} fill="rgba(168,85,247,0.1)" stroke={c} strokeWidth={1.5} />

      {/* Tokens inside bucket */}
      {[0, 1, 2, 3, 4, 5, 6].map(i => (
        <circle key={i} cx={510 + (i % 4) * 22} cy={165 + Math.floor(i / 4) * 22} r={7} fill={`${c}55`} stroke={c} strokeWidth={1} />
      ))}
      <text x={540} y={242} textAnchor="middle" fill={TEXT_SECONDARY} fontFamily={FONT} fontSize={10}>7/10 tokens</text>

      {/* Refill arrow */}
      <text x={455} y={178} fill={ALLOW_COLOR} fontFamily={FONT} fontSize={10}>+1 token/sec</text>
      <Arrow x1={487} y1={180} x2={490} y2={180} diagId={id} color={ALLOW_COLOR} />

      {/* Consume arrow */}
      <text x={455} y={210} fill={DENY_COLOR} fontFamily={FONT} fontSize={10}>−1 per request</text>
      <Arrow x1={487} y1={208} x2={490} y2={208} diagId={id} color={DENY_COLOR} />

      {[
        { algo: "Token Bucket", desc: "Allows bursts up to capacity. Smooth average rate." },
        { algo: "Leaky Bucket", desc: "Fixed output rate. Queues excess, drops if full." },
        { algo: "Fixed Window", desc: "Count resets at window boundary. Edge-case bursts." },
        { algo: "Sliding Window", desc: "Precise, no edge bursts. Redis sorted sets." },
      ].map(({ algo, desc }, i) => (
        <g key={algo}>
          <text x={440} y={260 + i * 16} fill={i === 0 ? c : TEXT_PRIMARY} fontFamily={FONT} fontSize={10} fontWeight={i === 0 ? "700" : "400"}>{algo}:</text>
          <text x={540} y={260 + i * 16} fill={TEXT_SECONDARY} fontFamily={FONT} fontSize={10}>{desc}</text>
        </g>
      ))}
    </svg>
  );
}

// ─── SD4: News feed (fan-out) ─────────────────────────────────────────────────

function DiagramSD4() {
  const id = "sd4";
  const c = SD_COLOR;
  const WRITE_COLOR = "#f97316";
  const READ_COLOR = "#22c55e";

  return (
    <svg viewBox="0 0 680 350" width="100%" style={{ display: "block" }}>
      <Defs id={id} color={c} />

      {/* Separate arrowhead for write/read */}
      <defs>
        <marker id="arrow-write" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill={WRITE_COLOR} />
        </marker>
        <marker id="arrow-read" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill={READ_COLOR} />
        </marker>
        <marker id={`arrow-${id}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill={c} />
        </marker>
        <marker id={`arrow-gray-${id}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill={NODE_STROKE} />
        </marker>
      </defs>

      <text x={340} y={22} textAnchor="middle" fill={c} fontFamily={FONT} fontSize={13} fontWeight="700">
        News Feed — Fan-out Write vs. Fan-out Read (Hybrid)
      </text>

      {/* WRITE PATH */}
      <rect x={16} y={35} width={310} height={148} rx={6} fill="rgba(249,115,22,0.04)" stroke={`${WRITE_COLOR}44`} strokeWidth={1} />
      <text x={26} y={50} fill={WRITE_COLOR} fontFamily={FONT} fontSize={11} fontWeight="700">WRITE PATH (Fan-out on Write)</text>

      <Box x={26} y={56} w={70} h={34} label="User posts" color={WRITE_COLOR} />
      <line x1={96} y1={73} x2={116} y2={73} stroke={WRITE_COLOR} strokeWidth={1.5} markerEnd="url(#arrow-write)" />
      <Box x={116} y={56} w={90} h={34} label="Post Service" sub="validate, store" />
      <line x1={206} y1={73} x2={220} y2={73} stroke={WRITE_COLOR} strokeWidth={1.5} markerEnd="url(#arrow-write)" />
      <Box x={220} y={56} w={90} h={34} label="Post DB" sub="Cassandra" />

      {/* Fan-out service */}
      <line x1={160} y1={90} x2={160} y2={112} stroke={WRITE_COLOR} strokeWidth={1.5} markerEnd="url(#arrow-write)" />
      <Box x={96} y={112} w={120} h={34} label="Fan-out Service" color={WRITE_COLOR} />

      {/* Regular vs celebrity */}
      <line x1={156} y1={146} x2={70} y2={160} stroke={WRITE_COLOR} strokeWidth={1.5} markerEnd="url(#arrow-write)" />
      <line x1={216} y1={146} x2={290} y2={160} stroke={NODE_STROKE} strokeWidth={1.5} markerEnd={`url(#arrow-gray-${id})`} />

      <Box x={20} y={160} w={100} h={30} label="Regular users" sub="push to cache" color={WRITE_COLOR} />
      <Box x={250} y={160} w={76} h={30} label="Celebrities" sub="skip — pull" />

      <text x={70} y={204} textAnchor="middle" fill={WRITE_COLOR} fontFamily={FONT} fontSize={10}>Feed Cache (Redis)</text>
      <text x={70} y={216} textAnchor="middle" fill={TEXT_SECONDARY} fontFamily={FONT} fontSize={10}>pre-computed per user</text>

      {/* READ PATH */}
      <rect x={340} y={35} width={326} height={220} rx={6} fill="rgba(34,197,94,0.04)" stroke={`${READ_COLOR}44`} strokeWidth={1} />
      <text x={350} y={50} fill={READ_COLOR} fontFamily={FONT} fontSize={11} fontWeight="700">READ PATH (request time)</text>

      <Box x={350} y={56} w={80} h={34} label="User opens" sub="feed request" color={READ_COLOR} />
      <line x1={430} y1={73} x2={450} y2={73} stroke={READ_COLOR} strokeWidth={1.5} markerEnd="url(#arrow-read)" />
      <Box x={450} y={56} w={96} h={34} label="Feed Service" color={READ_COLOR} />

      {/* Merge two sources */}
      <line x1={498} y1={90} x2={440} y2={116} stroke={READ_COLOR} strokeWidth={1.5} markerEnd="url(#arrow-read)" />
      <line x1={498} y1={90} x2={554} y2={116} stroke={READ_COLOR} strokeWidth={1.5} markerEnd="url(#arrow-read)" />

      <Box x={356} y={116} w={100} h={34} label="Redis Cache" sub="user's pre-built feed" />
      <Box x={490} y={116} w={100} h={34} label="Celebrity Posts" sub="pull on read" />

      {/* Merge → ranking */}
      <line x1={456} y1={150} x2={456} y2={168} stroke={READ_COLOR} strokeWidth={1.5} markerEnd="url(#arrow-read)" />
      <line x1={540} y1={150} x2={540} y2={168} stroke={READ_COLOR} strokeWidth={1.5} />
      <line x1={456} y1={168} x2={540} y2={168} stroke={READ_COLOR} strokeWidth={1.5} />
      <line x1={498} y1={168} x2={498} y2={184} stroke={READ_COLOR} strokeWidth={1.5} markerEnd="url(#arrow-read)" />

      <Box x={418} y={184} w={160} h={36} label="Ranking Service" sub="ML score, relevance, recency" color={c} />

      <line x1={498} y1={220} x2={498} y2={240} stroke={READ_COLOR} strokeWidth={1.5} markerEnd="url(#arrow-read)" />
      <Box x={430} y={240} w={136} h={34} label="Ranked Feed → Client" color={READ_COLOR} />

      {/* Bottom summary */}
      <rect x={16} y={268} width={650} height={66} rx={6} fill={NODE_FILL} stroke={NODE_STROKE} />
      <text x={341} y={284} textAnchor="middle" fill={c} fontFamily={FONT} fontSize={11} fontWeight="700">HYBRID STRATEGY</text>
      <text x={341} y={300} textAnchor="middle" fill={TEXT_SECONDARY} fontFamily={FONT} fontSize={10}>Regular users (&lt;500 followers): fan-out on write — pre-build feed cache, reads are instant O(1)</text>
      <text x={341} y={316} textAnchor="middle" fill={TEXT_SECONDARY} fontFamily={FONT} fontSize={10}>Celebrities (&gt;500 followers): fan-out on read — skip write-time fan-out, merge at read time to avoid millions of writes</text>
      <text x={341} y={330} textAnchor="middle" fill={TEXT_SECONDARY} fontFamily={FONT} fontSize={10}>Ranking layer applies ML-based relevance, engagement signals, and freshness decay</text>
    </svg>
  );
}

// ─── SD5: Notification system ─────────────────────────────────────────────────

function DiagramSD5() {
  const id = "sd5";
  const c = SD_COLOR;

  return (
    <svg viewBox="0 0 680 340" width="100%" style={{ display: "block" }}>
      <Defs id={id} color={c} />
      <text x={340} y={22} textAnchor="middle" fill={c} fontFamily={FONT} fontSize={13} fontWeight="700">
        Notification System — Decoupled Delivery Pipeline
      </text>

      {/* Triggering services */}
      <SectionLabel x={20} y={44} text="TRIGGERING SOURCES" color={TEXT_SECONDARY} />
      {["Order Svc", "Social Svc", "Marketing", "Alert Svc"].map((svc, i) => (
        <g key={svc}>
          <Box x={20 + i * 92} y={52} w={80} h={32} label={svc} />
          <Arrow x1={60 + i * 92} y1={84} x2={60 + i * 92} y2={108} diagId={id} color={c} />
        </g>
      ))}

      {/* Converge arrow */}
      <Box x={110} y={108} w={230} h={38} label="Notification Service" sub="validate · enrich · deduplicate · prioritize" color={c} />

      {/* User prefs & templates */}
      <Arrow x1={225} y1={146} x2={225} y2={170} diagId={id} color={c} />

      <Box x={30} y={170} w={100} h={34} label="User Prefs DB" sub="opt-in/out per channel" />
      <Box x={145} y={170} w={100} h={34} label="Template Engine" sub="personalized content" />
      <Box x={260} y={170} w={100} h={34} label="Rate Limiter" sub="dedup & throttle" />

      <Arrow x1={80} y1={204} x2={160} y2={222} diagId={id} />
      <Arrow x1={195} y1={204} x2={225} y2={222} diagId={id} />
      <Arrow x1={310} y1={204} x2={285} y2={222} diagId={id} />

      {/* Kafka */}
      <Box x={130} y={222} w={180} h={40} label="Kafka Message Queue" sub="[HIGH] [MEDIUM] [LOW] priority topics" color={c} />

      {/* Workers */}
      <Arrow x1={180} y1={262} x2={80} y2={286} diagId={id} color={c} />
      <Arrow x1={220} y1={262} x2={220} y2={286} diagId={id} color={c} />
      <Arrow x1={270} y1={262} x2={360} y2={286} diagId={id} color={c} />

      <Box x={20} y={286} w={110} h={34} label="Push Worker" sub="APNs · FCM" color={c} />
      <Box x={160} y={286} w={100} h={34} label="Email Worker" sub="AWS SES" color={c} />
      <Box x={300} y={286} w={100} h={34} label="SMS Worker" sub="Twilio" color={c} />

      {/* DLQ */}
      <Arrow x1={75} y1={320} x2={75} y2={338} diagId={id} />
      <Arrow x1={210} y1={320} x2={210} y2={338} diagId={id} />
      <Arrow x1={350} y1={320} x2={350} y2={338} diagId={id} />

      {/* DLQ box */}
      <Box x={20} y={322} w={390} h={12} label="" />
      <rect x={20} y={322} width={390} height={14} rx={4} fill="rgba(239,68,68,0.1)" stroke="#ef4444" strokeWidth={1} />
      <text x={215} y={332} textAnchor="middle" fill="#ef4444" fontFamily={FONT} fontSize={9} fontWeight="700">Dead Letter Queue — failed messages → retry with backoff → alert</text>

      {/* Right side: delivery channels */}
      <rect x={430} y={44} width={230} height={292} rx={6} fill={NODE_FILL} stroke={NODE_STROKE} />
      <text x={545} y={62} textAnchor="middle" fill={c} fontFamily={FONT} fontSize={11} fontWeight="700">DELIVERY CHANNELS</text>

      {[
        { channel: "Push Notification", detail: "APNs (iOS) / FCM (Android)", note: "device token lookup", color: c },
        { channel: "Email", detail: "AWS SES / SendGrid", note: "HTML + plain text fallback", color: "#3b82f6" },
        { channel: "SMS", detail: "Twilio / AWS SNS", note: "E.164 phone number", color: "#22c55e" },
        { channel: "In-App Badge", detail: "WebSocket / SSE", note: "real-time if online", color: "#eab308" },
      ].map(({ channel, detail, note, color }, i) => (
        <g key={channel}>
          <rect x={440} y={74 + i * 62} width={210} height={52} rx={5} fill="rgba(255,255,255,0.03)" stroke={color} strokeWidth={1} />
          <text x={545} y={93 + i * 62} textAnchor="middle" fill={color} fontFamily={FONT} fontSize={11} fontWeight="700">{channel}</text>
          <text x={545} y={108 + i * 62} textAnchor="middle" fill={TEXT_PRIMARY} fontFamily={FONT} fontSize={10}>{detail}</text>
          <text x={545} y={120 + i * 62} textAnchor="middle" fill={TEXT_SECONDARY} fontFamily={FONT} fontSize={9}>{note}</text>
        </g>
      ))}

      <text x={545} y={326} textAnchor="middle" fill={TEXT_SECONDARY} fontFamily={FONT} fontSize={10}>Each channel: exponential backoff</text>
      <text x={545} y={338} textAnchor="middle" fill={TEXT_SECONDARY} fontFamily={FONT} fontSize={10}>+ idempotency key to prevent duplicates</text>
    </svg>
  );
}

// ─── Registry ─────────────────────────────────────────────────────────────────

const DIAGRAM_MAP = {
  ds1: DiagramDS1,
  ds2: DiagramDS2,
  ds3: DiagramDS3,
  ds4: DiagramDS4,
  ds5: DiagramDS5,
  ds7: DiagramDS7,
  ds9: DiagramDS9,
  ds10: DiagramDS10,
  sd1: DiagramSD1,
  sd2: DiagramSD2,
  sd3: DiagramSD3,
  sd4: DiagramSD4,
  sd5: DiagramSD5,
};

export function getDiagram(questionId) {
  const Component = DIAGRAM_MAP[questionId];
  if (!Component) return null;
  return <Component />;
}
