import { useEffect, useState, useRef } from "react";

const ALGO_META = {
  FCFS:  { color: "#00f5ff", glow: "rgba(0,245,255,0.4)",   icon: "⟶", short: "First Come First Serve" },
  SSTF:  { color: "#ff006e", glow: "rgba(255,0,110,0.4)",   icon: "◎", short: "Shortest Seek Time First" },
  SCAN:  { color: "#8338ec", glow: "rgba(131,56,236,0.4)",  icon: "⇄", short: "Elevator Algorithm" },
  CSCAN: { color: "#fb5607", glow: "rgba(251,86,7,0.4)",    icon: "↻", short: "Circular SCAN" },
};

function AnimatedNumber({ target, duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    let start = null;
    const from = 0;
    const to = target;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target]);

  return <span>{display}</span>;
}

export default function ComparisonTable({ data }) {
  const [visible, setVisible] = useState(false);
  const [rowsVisible, setRowsVisible] = useState([]);

  useEffect(() => {
    if (!data || Object.keys(data).length === 0) return;
    setVisible(false);
    setRowsVisible([]);
    const t1 = setTimeout(() => setVisible(true), 50);
    const entries = Object.entries(data);
    entries.forEach((_, i) => {
      setTimeout(() => {
        setRowsVisible((prev) => [...prev, i]);
      }, 200 + i * 130);
    });
    return () => clearTimeout(t1);
  }, [data]);

  if (!data || Object.keys(data).length === 0) return null;

  const entries = Object.entries(data);
  const maxSeek = Math.max(...entries.map(([, v]) => v.seekTime));
  const minSeek = Math.min(...entries.map(([, v]) => v.seekTime));
  const sorted = [...entries].sort((a, b) => a[1].seekTime - b[1].seekTime);
  const winner = sorted[0][0];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;600;700&display=swap');

        .ct-root {
          font-family: 'Rajdhani', sans-serif;
          width: 100%;
          max-width: 680px;
          margin: 0 auto;
          padding: 8px;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.4s ease, transform 0.4s ease;
        }
        .ct-root.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .ct-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .ct-title-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .ct-label {
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          letter-spacing: 3px;
          color: rgba(255,255,255,0.81);
          text-transform: uppercase;
          padding: 4px 10px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 3px;
        }

        .ct-count {
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          color: rgba(255,255,255,0.6);
          letter-spacing: 1px;
        }

        .ct-winner-badge {
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px;
          letter-spacing: 2px;
          padding: 4px 10px;
          border-radius: 3px;
          border: 1px solid;
          animation: badge-pulse 2s ease-in-out infinite;
          text-transform: uppercase;
        }

        @keyframes badge-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        /* Table wrapper */
        .ct-table-wrap {
          background: rgba(5, 8, 15, 0.9);
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.06);
          overflow: hidden;
        }

        .ct-thead {
          display: grid;
          grid-template-columns: 40px 1fr 1fr 100px 60px;
          gap: 0;
          padding: 10px 18px;
          background: rgba(255,255,255,0.03);
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }

        .ct-th {
          font-family: 'Share Tech Mono', monospace;
          font-size: 9px;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.67);
          text-transform: uppercase;
          align-self: center;
        }

        .ct-row {
          display: grid;
          grid-template-columns: 40px 1fr 1fr 100px 60px;
          gap: 0;
          padding: 14px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          align-items: center;
          position: relative;
          opacity: 0;
          transform: translateX(-12px);
          transition: opacity 0.35s ease, transform 0.35s ease, background 0.2s ease;
          cursor: default;
        }

        .ct-row.row-visible {
          opacity: 1;
          transform: translateX(0);
        }

        .ct-row:hover {
          background: rgba(255,255,255,0.03);
        }

        .ct-row:last-child {
          border-bottom: none;
        }

        .ct-row-glow {
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          border-radius: 3px 0 0 3px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .ct-row:hover .ct-row-glow,
        .ct-row.winner-row .ct-row-glow {
          opacity: 1;
        }
        .ct-row.winner-row .ct-row-glow {
          animation: glow-bar-pulse 1.8s ease-in-out infinite;
        }
        @keyframes glow-bar-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .ct-rank {
          font-family: 'Share Tech Mono', monospace;
          font-size: 12px;
          color: rgba(255,255,255,0.6);
        }
        .ct-rank.rank-1 {
          font-size: 14px;
          font-weight: 700;
        }

        .ct-algo-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .ct-algo-icon {
          font-size: 16px;
          width: 20px;
          text-align: center;
          flex-shrink: 0;
        }

        .ct-algo-name {
          font-family: 'Share Tech Mono', monospace;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 2px;
        }

        .ct-algo-short {
          font-size: 11px;
          color: rgba(255,255,255,0.75);
          letter-spacing: 0.5px;
          font-weight: 400;
        }

        .ct-seek-cell {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .ct-seek-num {
          font-family: 'Share Tech Mono', monospace;
          font-size: 20px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .ct-seek-unit {
          font-family: 'Share Tech Mono', monospace;
          font-size: 9px;
          color: rgba(255,255,255,0.6);
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        /* Bar column */
        .ct-bar-wrap {
          height: 6px;
          background: rgba(255,255,255,0.06);
          border-radius: 3px;
          overflow: hidden;
          width: 100%;
        }

        .ct-bar-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 1s cubic-bezier(0.23, 1, 0.32, 1);
          width: 0%;
        }

        .ct-bar-fill.bar-animated {
          /* width set inline */
        }

        /* Delta badge */
        .ct-delta {
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px;
          letter-spacing: 1px;
          text-align: right;
          color: rgba(255,255,255,0.67);
        }

        .ct-delta.best {
          color: #00ff88;
          text-shadow: 0 0 6px rgba(0,255,136,0.5);
          font-size: 11px;
        }

        .ct-delta.worst {
          color: rgba(255,80,80,0.7);
        }

        /* Footer summary */
        .ct-footer {
          margin-top: 12px;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 8px;
        }

        .ct-stat-box {
          background: rgba(5, 8, 15, 0.9);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 7px;
          padding: 12px 14px;
        }

        .ct-stat-label {
          font-family: 'Share Tech Mono', monospace;
          font-size: 9px;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.67);
          text-transform: uppercase;
          display: block;
          margin-bottom: 6px;
        }

        .ct-stat-val {
          font-family: 'Share Tech Mono', monospace;
          font-size: 18px;
          font-weight: 700;
          color: #fff;
          display: block;
        }

        .ct-stat-sub {
          font-size: 11px;
          color: rgba(255,255,255,0.75);
          margin-top: 2px;
          display: block;
        }
      `}</style>

      <div className={`ct-root ${visible ? "visible" : ""}`}>
        {/* Header */}
        <div className="ct-header">
          <div className="ct-title-group">
            <span className="ct-label">// COMPARISON</span>
            <span className="ct-count">{entries.length} ALGORITHMS</span>
          </div>
          {winner && ALGO_META[winner] && (
            <span
              className="ct-winner-badge"
              style={{
                color: ALGO_META[winner].color,
                borderColor: ALGO_META[winner].color,
                boxShadow: `0 0 10px ${ALGO_META[winner].glow}`,
                background: `${ALGO_META[winner].glow}18`,
              }}
            >
              ★ {winner} WINS
            </span>
          )}
        </div>

        {/* Table */}
        <div className="ct-table-wrap">
          {/* Head */}
          <div className="ct-thead">
            <span className="ct-th">#</span>
            <span className="ct-th">Algorithm</span>
            <span className="ct-th">Seek Time</span>
            <span className="ct-th">Relative</span>
            <span className="ct-th" style={{ textAlign: "right" }}>Delta</span>
          </div>

          {/* Rows — sorted best to worst */}
          {sorted.map(([algo, value], i) => {
            const meta = ALGO_META[algo] || { color: "#888", glow: "rgba(136,136,136,0.3)", icon: "·", short: algo };
            const isWinner = algo === winner;
            const isWorst = value.seekTime === maxSeek && entries.length > 1;
            const barPct = maxSeek === 0 ? 0 : Math.round((value.seekTime / maxSeek) * 100);
            const delta = value.seekTime - minSeek;
            const rowIdx = entries.findIndex(([a]) => a === algo); // stable index for animation

            return (
              <div
                key={algo}
                className={`ct-row ${rowsVisible.includes(rowIdx) ? "row-visible" : ""} ${isWinner ? "winner-row" : ""}`}
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                {/* Glow bar */}
                <div
                  className="ct-row-glow"
                  style={{
                    background: meta.color,
                    boxShadow: `0 0 8px ${meta.glow}`,
                  }}
                />

                {/* Rank */}
                <span
                  className={`ct-rank ${i === 0 ? "rank-1" : ""}`}
                  style={i === 0 ? { color: meta.color, textShadow: `0 0 8px ${meta.glow}` } : {}}
                >
                  {i === 0 ? "01" : `0${i + 1}`}
                </span>

                {/* Algo name */}
                <div className="ct-algo-cell">
                  <span className="ct-algo-icon" style={{ color: meta.color }}>{meta.icon}</span>
                  <div>
                    <div
                      className="ct-algo-name"
                      style={isWinner ? { color: meta.color, textShadow: `0 0 10px ${meta.glow}` } : { color: "#fff" }}
                    >
                      {algo}
                    </div>
                    <div className="ct-algo-short">{meta.short}</div>
                  </div>
                </div>

                {/* Seek time */}
                <div className="ct-seek-cell">
                  <span
                    className="ct-seek-num"
                    style={{ color: isWinner ? meta.color : isWorst ? "rgba(255,120,120,0.85)" : "#fff" }}
                  >
                    {rowsVisible.includes(rowIdx)
                      ? <AnimatedNumber target={value.seekTime} duration={1000 + i * 200} />
                      : 0}
                  </span>
                  <span className="ct-seek-unit">cylinders</span>
                </div>

                {/* Bar */}
                <div className="ct-bar-wrap">
                  <div
                    className="ct-bar-fill"
                    style={{
                      width: rowsVisible.includes(rowIdx) ? `${barPct}%` : "0%",
                      background: `linear-gradient(90deg, ${meta.color}88, ${meta.color})`,
                      boxShadow: isWinner ? `0 0 6px ${meta.glow}` : "none",
                      transition: "width 1s cubic-bezier(0.23,1,0.32,1)",
                    }}
                  />
                </div>

                {/* Delta */}
                <span
                  className={`ct-delta ${isWinner ? "best" : isWorst ? "worst" : ""}`}
                >
                  {isWinner ? "BEST" : `+${delta}`}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer stats */}
        <div className="ct-footer">
          <div className="ct-stat-box">
            <span className="ct-stat-label">Best Seek</span>
            <span className="ct-stat-val" style={{ color: "#00ff88", textShadow: "0 0 8px rgba(0,255,136,0.4)" }}>
              {minSeek}
            </span>
            <span className="ct-stat-sub">{winner} algorithm</span>
          </div>
          <div className="ct-stat-box">
            <span className="ct-stat-label">Worst Seek</span>
            <span className="ct-stat-val" style={{ color: "rgba(255,100,100,0.9)" }}>
              {maxSeek}
            </span>
            <span className="ct-stat-sub">{sorted[sorted.length - 1][0]} algorithm</span>
          </div>
          <div className="ct-stat-box">
            <span className="ct-stat-label">Improvement</span>
            <span className="ct-stat-val" style={{ color: "#00f5ff", textShadow: "0 0 8px rgba(0,245,255,0.3)" }}>
              {maxSeek === 0 ? "0" : Math.round(((maxSeek - minSeek) / maxSeek) * 100)}%
            </span>
            <span className="ct-stat-sub">best vs worst</span>
          </div>
        </div>
      </div>
    </>
  );
}