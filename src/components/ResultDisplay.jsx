import { useState, useEffect, useRef } from "react";

function AnimatedNumber({ target, duration = 1400 }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    let start = null;
    cancelAnimationFrame(raf.current);
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplay(Math.round(target * eased));
      if (progress < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target]);

  return <>{display}</>;
}

export default function ResultDisplay({ result }) {
  const [visible, setVisible] = useState(false);
  const [seqVisible, setSeqVisible] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!result) return;
    setVisible(false);
    setSeqVisible([]);
    const t1 = setTimeout(() => setVisible(true), 60);
    result.sequence.forEach((_, i) => {
      setTimeout(() => setSeqVisible((prev) => [...prev, i]), 120 + i * 80);
    });
    return () => clearTimeout(t1);
  }, [result]);

  if (!result) return null;

  const { sequence, seekTime } = result;

  const handleCopy = () => {
    navigator.clipboard.writeText(sequence.join(" → "));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Compute per-step distances
  const steps = [];
  for (let i = 1; i < sequence.length; i++) {
    steps.push(Math.abs(sequence[i] - sequence[i - 1]));
  }
  const maxStep = Math.max(...steps, 1);
  const avgStep = steps.length ? Math.round(steps.reduce((a, b) => a + b, 0) / steps.length) : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;600;700&display=swap');

        .rd-root {
          font-family: 'Rajdhani', sans-serif;
          width: 100%;
          max-width: 680px;
          margin: 0 auto;
          padding: 8px;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.45s ease, transform 0.45s ease;
        }
        .rd-root.visible { opacity: 1; transform: translateY(0); }

        .rd-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }

        .rd-label {
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          letter-spacing: 3px;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase;
          padding: 4px 10px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 3px;
        }

        .rd-copy-btn {
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px;
          letter-spacing: 2px;
          padding: 5px 12px;
          border-radius: 3px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.02);
          color: rgba(255,255,255,0.3);
          cursor: pointer;
          transition: all 0.2s ease;
          user-select: none;
          text-transform: uppercase;
        }
        .rd-copy-btn:hover {
          border-color: rgba(0,245,255,0.4);
          color: rgba(0,245,255,0.7);
          background: rgba(0,245,255,0.05);
        }
        .rd-copy-btn.copied {
          border-color: rgba(0,255,136,0.5);
          color: rgba(0,255,136,0.8);
          background: rgba(0,255,136,0.06);
        }

        /* Seek time hero */
        .rd-hero {
          background: rgba(5,8,15,0.92);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          padding: 22px 24px;
          margin-bottom: 12px;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .rd-hero-glow {
          position: absolute;
          top: -40px; right: -40px;
          width: 180px; height: 180px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0,245,255,0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .rd-seek-block {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .rd-seek-label {
          font-family: 'Share Tech Mono', monospace;
          font-size: 9px;
          letter-spacing: 3px;
          color: rgba(255,255,255,0.25);
          text-transform: uppercase;
        }

        .rd-seek-num {
          font-family: 'Share Tech Mono', monospace;
          font-size: 52px;
          font-weight: 700;
          line-height: 1;
          color: #00f5ff;
          text-shadow: 0 0 20px rgba(0,245,255,0.5), 0 0 60px rgba(0,245,255,0.2);
          letter-spacing: -1px;
        }

        .rd-seek-unit {
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          color: rgba(255,255,255,0.25);
          letter-spacing: 2px;
          margin-top: 2px;
        }

        /* Mini stats */
        .rd-mini-stats {
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex-shrink: 0;
        }

        .rd-mini-stat {
          text-align: right;
        }

        .rd-mini-stat-label {
          font-family: 'Share Tech Mono', monospace;
          font-size: 9px;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.2);
          text-transform: uppercase;
          display: block;
          margin-bottom: 2px;
        }

        .rd-mini-stat-val {
          font-family: 'Share Tech Mono', monospace;
          font-size: 20px;
          font-weight: 700;
          color: rgba(255,255,255,0.7);
          letter-spacing: 1px;
        }

        /* Sequence section */
        .rd-seq-panel {
          background: rgba(5,8,15,0.92);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          padding: 18px 20px;
          margin-bottom: 12px;
        }

        .rd-seq-title {
          font-family: 'Share Tech Mono', monospace;
          font-size: 9px;
          letter-spacing: 3px;
          color: rgba(255,255,255,0.25);
          text-transform: uppercase;
          margin-bottom: 14px;
          display: block;
        }

        .rd-seq-flow {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 4px;
          row-gap: 8px;
        }

        .rd-seq-step {
          display: flex;
          align-items: center;
          gap: 4px;
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .rd-seq-step.step-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .rd-seq-node {
          font-family: 'Share Tech Mono', monospace;
          font-size: 13px;
          padding: 5px 10px;
          border-radius: 4px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.7);
          letter-spacing: 1px;
          transition: border-color 0.2s, box-shadow 0.2s, color 0.2s;
          white-space: nowrap;
        }

        .rd-seq-node.head-node {
          border-color: rgba(251,86,7,0.6);
          color: #fb5607;
          background: rgba(251,86,7,0.08);
          box-shadow: 0 0 10px rgba(251,86,7,0.2);
        }

        .rd-seq-node.last-node {
          border-color: rgba(0,255,136,0.5);
          color: #00ff88;
          background: rgba(0,255,136,0.06);
          box-shadow: 0 0 10px rgba(0,255,136,0.15);
        }

        .rd-seq-arrow-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1px;
        }

        .rd-seq-arrow {
          font-family: 'Share Tech Mono', monospace;
          font-size: 12px;
          color: rgba(255,255,255,0.18);
        }

        .rd-seq-dist {
          font-family: 'Share Tech Mono', monospace;
          font-size: 9px;
          color: rgba(255,255,255,0.2);
          letter-spacing: 0.5px;
          white-space: nowrap;
        }

        /* Step distance heat bar */
        .rd-heat-panel {
          background: rgba(5,8,15,0.92);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          padding: 18px 20px;
        }

        .rd-heat-title {
          font-family: 'Share Tech Mono', monospace;
          font-size: 9px;
          letter-spacing: 3px;
          color: rgba(255,255,255,0.25);
          text-transform: uppercase;
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .rd-heat-sub {
          color: rgba(255,255,255,0.15);
          font-size: 9px;
          letter-spacing: 1px;
        }

        .rd-heat-bars {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .rd-heat-row {
          display: grid;
          grid-template-columns: 28px 1fr 38px;
          align-items: center;
          gap: 10px;
          opacity: 0;
          transform: translateX(-8px);
          transition: opacity 0.3s ease, transform 0.3s ease;
        }

        .rd-heat-row.bar-visible {
          opacity: 1;
          transform: translateX(0);
        }

        .rd-heat-idx {
          font-family: 'Share Tech Mono', monospace;
          font-size: 9px;
          color: rgba(255,255,255,0.2);
          text-align: right;
          letter-spacing: 1px;
        }

        .rd-heat-track {
          height: 5px;
          background: rgba(255,255,255,0.05);
          border-radius: 3px;
          overflow: hidden;
        }

        .rd-heat-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.8s cubic-bezier(0.23,1,0.32,1);
        }

        .rd-heat-val {
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px;
          color: rgba(255,255,255,0.35);
          text-align: right;
          letter-spacing: 1px;
        }

        .rd-heat-val.max-val {
          color: rgba(255,80,80,0.8);
        }
      `}</style>

      <div className={`rd-root ${visible ? "visible" : ""}`}>

        {/* Header */}
        <div className="rd-header">
          <span className="rd-label">// RESULT OUTPUT</span>
          <button
            className={`rd-copy-btn ${copied ? "copied" : ""}`}
            onClick={handleCopy}
          >
            {copied ? "✓ COPIED" : "⎘ COPY SEQ"}
          </button>
        </div>

        {/* Hero — seek time */}
        <div className="rd-hero">
          <div className="rd-hero-glow" />
          <div className="rd-seek-block">
            <span className="rd-seek-label">TOTAL SEEK TIME</span>
            <span className="rd-seek-num">
              <AnimatedNumber target={seekTime} />
            </span>
            <span className="rd-seek-unit">CYLINDER MOVEMENTS</span>
          </div>

          <div className="rd-mini-stats">
            <div className="rd-mini-stat">
              <span className="rd-mini-stat-label">Steps</span>
              <span className="rd-mini-stat-val">{steps.length}</span>
            </div>
            <div className="rd-mini-stat">
              <span className="rd-mini-stat-label">Avg Move</span>
              <span className="rd-mini-stat-val">{avgStep}</span>
            </div>
            <div className="rd-mini-stat">
              <span className="rd-mini-stat-label">Max Move</span>
              <span className="rd-mini-stat-val" style={{ color: "rgba(255,100,100,0.85)" }}>{maxStep}</span>
            </div>
          </div>
        </div>

        {/* Sequence flow */}
        <div className="rd-seq-panel">
          <span className="rd-seq-title">ACCESS SEQUENCE — {sequence.length} POSITIONS</span>
          <div className="rd-seq-flow">
            {sequence.map((pos, i) => {
              const isHead = i === 0;
              const isLast = i === sequence.length - 1;
              const dist = i > 0 ? steps[i - 1] : null;
              return (
                <div
                  key={i}
                  className={`rd-seq-step ${seqVisible.includes(i) ? "step-visible" : ""}`}
                  style={{ transitionDelay: `${i * 40}ms` }}
                >
                  {/* Arrow with distance (before node, after first) */}
                  {i > 0 && (
                    <div className="rd-seq-arrow-wrap">
                      <span className="rd-seq-arrow">→</span>
                      <span className="rd-seq-dist">{dist}</span>
                    </div>
                  )}
                  <span
                    className={`rd-seq-node ${isHead ? "head-node" : ""} ${isLast && !isHead ? "last-node" : ""}`}
                  >
                    {pos}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Heat bar — per-step distances */}
        {steps.length > 0 && (
          <div className="rd-heat-panel">
            <div className="rd-heat-title">
              <span>SEEK DISTANCE PER STEP</span>
              <span className="rd-heat-sub">RED = MAX JUMP</span>
            </div>
            <div className="rd-heat-bars">
              {steps.map((dist, i) => {
                const pct = Math.round((dist / maxStep) * 100);
                const isMax = dist === maxStep;
                // Color: cool blue → hot red based on magnitude
                const r = Math.round(80 + (175 * pct) / 100);
                const g = Math.round(120 - (120 * pct) / 100);
                const b = Math.round(255 - (200 * pct) / 100);
                const color = `rgb(${r},${g},${b})`;

                return (
                  <div
                    key={i}
                    className={`rd-heat-row ${seqVisible.includes(i + 1) ? "bar-visible" : ""}`}
                    style={{ transitionDelay: `${i * 35}ms` }}
                  >
                    <span className="rd-heat-idx">{String(i + 1).padStart(2, "0")}</span>
                    <div className="rd-heat-track">
                      <div
                        className="rd-heat-fill"
                        style={{
                          width: seqVisible.includes(i + 1) ? `${pct}%` : "0%",
                          background: color,
                          boxShadow: isMax ? `0 0 6px ${color}` : "none",
                        }}
                      />
                    </div>
                    <span className={`rd-heat-val ${isMax ? "max-val" : ""}`}>{dist}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}