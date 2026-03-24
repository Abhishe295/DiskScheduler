import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const PADDING = { top: 32, right: 28, bottom: 48, left: 56 };
const CHART_H = 300;

const ALGO_COLORS = {
  FCFS:  { stroke: "#00f5ff", glow: "rgba(0,245,255,0.5)",   fill: "rgba(0,245,255,0.08)"  },
  SSTF:  { stroke: "#ff006e", glow: "rgba(255,0,110,0.5)",   fill: "rgba(255,0,110,0.08)"  },
  SCAN:  { stroke: "#8338ec", glow: "rgba(131,56,236,0.5)",  fill: "rgba(131,56,236,0.08)" },
  CSCAN: { stroke: "#fb5607", glow: "rgba(251,86,7,0.5)",    fill: "rgba(251,86,7,0.08)"   },
};
const DEFAULT_COLOR = { stroke: "#00f5ff", glow: "rgba(0,245,255,0.5)", fill: "rgba(0,245,255,0.08)" };

export default function VisualizationChart({ sequence, algorithm }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [width, setWidth] = useState(620);
  const [progress, setProgress] = useState(0);
  const [hovered, setHovered] = useState(null);
  const [visible, setVisible] = useState(false);
  const rafRef = useRef(null);
  const pathRef = useRef(null);
  const [pathLen, setPathLen] = useState(0);

  const color = ALGO_COLORS[algorithm] || DEFAULT_COLOR;

  // Responsive width
  useEffect(() => {
    const obs = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      if (w > 0) setWidth(w);
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // Animate line draw on new sequence
  useEffect(() => {
    if (!sequence) return;
    setVisible(false);
    setProgress(0);
    setHovered(null);
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, [sequence]);

  useEffect(() => {
    if (!visible) return;
    let start = null;
    const dur = 1000 + sequence.length * 30;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setProgress(eased);
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [visible, sequence]);

  useEffect(() => {
    if (pathRef.current) setPathLen(pathRef.current.getTotalLength());
  }, [sequence, width, progress]);

  if (!sequence) return null;

  const innerW = width - PADDING.left - PADDING.right;
  const innerH = CHART_H - PADDING.top - PADDING.bottom;

  const minVal = Math.min(...sequence);
  const maxVal = Math.max(...sequence);
  const valRange = maxVal - minVal || 1;

  const toX = (i) => PADDING.left + (i / Math.max(sequence.length - 1, 1)) * innerW;
  const toY = (v) => PADDING.top + innerH - ((v - minVal) / valRange) * innerH;

  // Build SVG path
  const points = sequence.map((v, i) => ({ x: toX(i), y: toY(v), v, i }));
  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");

  // Area fill path
  const areaD =
    pathD +
    ` L ${points[points.length - 1].x.toFixed(2)} ${(PADDING.top + innerH).toFixed(2)}` +
    ` L ${points[0].x.toFixed(2)} ${(PADDING.top + innerH).toFixed(2)} Z`;

  // Y grid lines
  const yTicks = 5;
  const yGridLines = Array.from({ length: yTicks + 1 }, (_, i) => {
    const val = Math.round(minVal + (valRange * i) / yTicks);
    const y = toY(val);
    return { val, y };
  });

  // X ticks (show every nth)
  const maxXTicks = Math.min(sequence.length, Math.floor(innerW / 48));
  const xStep = Math.max(1, Math.round(sequence.length / maxXTicks));
  const xTicks = sequence
    .map((_, i) => i)
    .filter((i) => i % xStep === 0 || i === sequence.length - 1);

  // Path length for dash animation
  const dashLen = pathLen || 9999;
  const dashOffset = dashLen * (1 - progress);

  // Hovered point
  const hoveredPt = hovered !== null ? points[hovered] : null;

  // Steps
  const steps = [];
  for (let i = 1; i < sequence.length; i++) {
    steps.push(Math.abs(sequence[i] - sequence[i - 1]));
  }
  const totalSeek = steps.reduce((a, b) => a + b, 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;600;700&display=swap');

        .vc-root {
          font-family: 'Rajdhani', sans-serif;
          width: 100%;
          max-width: 680px;
          margin: 0 auto;
          padding: 8px;
        }

        .vc-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }

        .vc-label {
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          letter-spacing: 3px;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase;
          padding: 4px 10px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 3px;
        }

        .vc-algo-tag {
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          letter-spacing: 2px;
          padding: 4px 12px;
          border-radius: 3px;
          border: 1px solid;
          text-transform: uppercase;
          animation: vc-tag-glow 2s ease-in-out infinite;
        }

        @keyframes vc-tag-glow {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.65; }
        }

        .vc-panel {
          background: rgba(5,8,15,0.92);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          padding: 4px 0 0 0;
          overflow: hidden;
          margin-bottom: 12px;
          position: relative;
        }

        .vc-top-accent {
          height: 2px;
          width: 100%;
        }

        .vc-svg {
          display: block;
          width: 100%;
          overflow: visible;
          cursor: crosshair;
        }

        /* Tooltip */
        .vc-tooltip {
          position: absolute;
          pointer-events: none;
          background: rgba(4,6,14,0.96);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 6px;
          padding: 8px 12px;
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          letter-spacing: 1px;
          transform: translate(-50%, -115%);
          white-space: nowrap;
          transition: opacity 0.15s;
        }

        .vc-tt-step { color: rgba(255,255,255,0.35); margin-bottom: 2px; }
        .vc-tt-val  { font-size: 16px; font-weight: 700; }

        /* Footer stats */
        .vc-footer {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }

        .vc-stat {
          background: rgba(5,8,15,0.92);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 7px;
          padding: 12px 14px;
        }

        .vc-stat-label {
          font-family: 'Share Tech Mono', monospace;
          font-size: 9px;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.22);
          text-transform: uppercase;
          display: block;
          margin-bottom: 5px;
        }

        .vc-stat-val {
          font-family: 'Share Tech Mono', monospace;
          font-size: 19px;
          font-weight: 700;
          color: #fff;
          display: block;
          letter-spacing: 1px;
        }

        /* Progress bar */
        .vc-progress-wrap {
          height: 2px;
          background: rgba(255,255,255,0.05);
          border-radius: 1px;
          overflow: hidden;
          margin: 0 20px 16px;
        }
        .vc-progress-fill {
          height: 100%;
          border-radius: 1px;
          transition: width 0.05s linear;
        }
      `}</style>

      <motion.div
        className="vc-root"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
      >
        {/* Header */}
        <div className="vc-header">
          <span className="vc-label">// HEAD MOVEMENT</span>
          {algorithm && (
            <span
              className="vc-algo-tag"
              style={{
                color: color.stroke,
                borderColor: color.stroke,
                background: color.fill,
                boxShadow: `0 0 10px ${color.glow}`,
              }}
            >
              {algorithm}
            </span>
          )}
        </div>

        {/* Chart panel */}
        <div className="vc-panel" ref={containerRef}>
          {/* Top accent line */}
          <div
            className="vc-top-accent"
            style={{ background: `linear-gradient(90deg, transparent, ${color.stroke}, transparent)` }}
          />

          {/* Progress bar */}
          <div style={{ height: 2, background: "rgba(255,255,255,0.03)", margin: "12px 20px 0" }}>
            <div
              style={{
                height: "100%",
                width: `${progress * 100}%`,
                background: color.stroke,
                boxShadow: `0 0 6px ${color.glow}`,
                borderRadius: 1,
                transition: "width 0.05s linear",
              }}
            />
          </div>

          <svg
            ref={svgRef}
            className="vc-svg"
            viewBox={`0 0 ${width} ${CHART_H}`}
            height={CHART_H}
            onMouseLeave={() => setHovered(null)}
          >
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color.stroke} stopOpacity="0.18" />
                <stop offset="100%" stopColor={color.stroke} stopOpacity="0.01" />
              </linearGradient>
              <filter id="lineGlow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="dotGlow">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Y grid lines */}
            {yGridLines.map(({ val, y }, i) => (
              <g key={i}>
                <line
                  x1={PADDING.left} y1={y}
                  x2={PADDING.left + innerW} y2={y}
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth={1}
                  strokeDasharray="4 6"
                />
                <text
                  x={PADDING.left - 10} y={y + 4}
                  fill="rgba(255,255,255,0.25)"
                  fontSize={10}
                  fontFamily="Share Tech Mono, monospace"
                  textAnchor="end"
                  letterSpacing={0}
                >
                  {val}
                </text>
              </g>
            ))}

            {/* X axis ticks */}
            {xTicks.map((i) => (
              <g key={i}>
                <line
                  x1={toX(i)} y1={PADDING.top + innerH}
                  x2={toX(i)} y2={PADDING.top + innerH + 5}
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth={1}
                />
                <text
                  x={toX(i)} y={PADDING.top + innerH + 18}
                  fill="rgba(255,255,255,0.25)"
                  fontSize={10}
                  fontFamily="Share Tech Mono, monospace"
                  textAnchor="middle"
                >
                  {i}
                </text>
              </g>
            ))}

            {/* Axis labels */}
            <text
              x={PADDING.left + innerW / 2}
              y={CHART_H - 4}
              fill="rgba(255,255,255,0.18)"
              fontSize={9}
              fontFamily="Share Tech Mono, monospace"
              textAnchor="middle"
              letterSpacing={2}
            >
              STEP
            </text>
            <text
              x={12}
              y={PADDING.top + innerH / 2}
              fill="rgba(255,255,255,0.18)"
              fontSize={9}
              fontFamily="Share Tech Mono, monospace"
              textAnchor="middle"
              letterSpacing={2}
              transform={`rotate(-90, 12, ${PADDING.top + innerH / 2})`}
            >
              CYLINDER
            </text>

            {/* X axis line */}
            <line
              x1={PADDING.left} y1={PADDING.top + innerH}
              x2={PADDING.left + innerW} y2={PADDING.top + innerH}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth={1}
            />
            {/* Y axis line */}
            <line
              x1={PADDING.left} y1={PADDING.top}
              x2={PADDING.left} y2={PADDING.top + innerH}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth={1}
            />

            {/* Area fill — masked by progress */}
            <clipPath id="progressClip">
              <rect
                x={PADDING.left}
                y={0}
                width={innerW * progress}
                height={CHART_H}
              />
            </clipPath>
            <path
              d={areaD}
              fill="url(#areaGrad)"
              clipPath="url(#progressClip)"
            />

            {/* Glow line (blurred copy) */}
            <path
              d={pathD}
              fill="none"
              stroke={color.stroke}
              strokeWidth={4}
              strokeOpacity={0.25}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#lineGlow)"
              strokeDasharray={dashLen}
              strokeDashoffset={dashOffset}
            />

            {/* Main line */}
            <path
              ref={pathRef}
              d={pathD}
              fill="none"
              stroke={color.stroke}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={dashLen}
              strokeDashoffset={dashOffset}
            />

            {/* Dots — only show revealed ones */}
            {points.map((pt, i) => {
              const revealed = i / Math.max(points.length - 1, 1) <= progress + 0.05;
              if (!revealed) return null;
              const isFirst = i === 0;
              const isLast = i === sequence.length - 1;
              const isHov = hovered === i;
              const r = isFirst || isLast ? 5 : isHov ? 5 : 3.5;
              const dotColor = isFirst ? "#fb5607" : isLast ? "#00ff88" : color.stroke;

              return (
                <g key={i} filter={isHov || isFirst || isLast ? "url(#dotGlow)" : undefined}>
                  <circle
                    cx={pt.x} cy={pt.y} r={r}
                    fill={dotColor}
                    stroke="rgba(5,8,15,0.8)"
                    strokeWidth={1.5}
                    style={{ transition: "r 0.15s ease" }}
                  />
                  {(isFirst || isLast) && (
                    <circle
                      cx={pt.x} cy={pt.y} r={r + 4}
                      fill="none"
                      stroke={dotColor}
                      strokeWidth={1}
                      strokeOpacity={0.3}
                    />
                  )}
                </g>
              );
            })}

            {/* Invisible hover zones */}
            {points.map((pt, i) => (
              <rect
                key={i}
                x={pt.x - (innerW / (sequence.length * 2))}
                y={PADDING.top}
                width={innerW / sequence.length}
                height={innerH}
                fill="transparent"
                onMouseEnter={() => setHovered(i)}
              />
            ))}

            {/* Hover vertical line */}
            {hoveredPt && (
              <g>
                <line
                  x1={hoveredPt.x} y1={PADDING.top}
                  x2={hoveredPt.x} y2={PADDING.top + innerH}
                  stroke={color.stroke}
                  strokeWidth={1}
                  strokeOpacity={0.3}
                  strokeDasharray="4 4"
                />
                <circle
                  cx={hoveredPt.x} cy={hoveredPt.y} r={7}
                  fill="none"
                  stroke={color.stroke}
                  strokeWidth={1.5}
                  strokeOpacity={0.6}
                />
              </g>
            )}

            {/* Traveling glow dot at draw head */}
            {progress < 1 && progress > 0 && (() => {
              const idx = Math.min(
                Math.floor(progress * (points.length - 1)),
                points.length - 1
              );
              const pt = points[idx];
              return (
                <g>
                  <circle cx={pt.x} cy={pt.y} r={8} fill={color.stroke} fillOpacity={0.15} />
                  <circle cx={pt.x} cy={pt.y} r={4} fill={color.stroke} filter="url(#dotGlow)" />
                </g>
              );
            })()}
          </svg>

          {/* SVG tooltip overlay */}
          {hoveredPt && (
            <div
              className="vc-tooltip"
              style={{
                left: hoveredPt.x,
                top: hoveredPt.y + PADDING.top / 2 - 10,
                borderColor: color.stroke,
                boxShadow: `0 0 12px ${color.glow}`,
                opacity: hovered !== null ? 1 : 0,
              }}
            >
              <div className="vc-tt-step">STEP {hoveredPt.i}</div>
              <div className="vc-tt-val" style={{ color: color.stroke }}>
                CYL {hoveredPt.v}
              </div>
              {hoveredPt.i > 0 && (
                <div className="vc-tt-step" style={{ marginTop: 2 }}>
                  Δ {steps[hoveredPt.i - 1]} moves
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer stats */}
        <div className="vc-footer">
          {[
            { label: "Total Seek", val: totalSeek, color: color.stroke },
            { label: "Positions",  val: sequence.length, color: "#fff" },
            { label: "Min Cyl",    val: Math.min(...sequence), color: "#00ff88" },
            { label: "Max Cyl",    val: Math.max(...sequence), color: "rgba(255,100,100,0.9)" },
          ].map(({ label, val, color: c }) => (
            <div className="vc-stat" key={label}>
              <span className="vc-stat-label">{label}</span>
              <span className="vc-stat-val" style={{ color: c }}>{val}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
}