import { useEffect, useState } from "react";

const algorithms = [
  {
    value: "FCFS",
    label: "FCFS",
    full: "First Come First Serve",
    desc: "Serves requests in arrival order",
    color: "#00f5ff",
    glow: "rgba(0,245,255,0.4)",
    icon: "⟶",
  },
  {
    value: "SSTF",
    label: "SSTF",
    full: "Shortest Seek Time First",
    desc: "Always jumps to nearest request",
    color: "#ff006e",
    glow: "rgba(255,0,110,0.4)",
    icon: "◎",
  },
  {
    value: "SCAN",
    label: "SCAN",
    full: "SCAN (Elevator)",
    desc: "Sweeps to disk end, then reverses",
    color: "#8338ec",
    glow: "rgba(131,56,236,0.4)",
    icon: "⇄",
  },
  {
    value: "CSCAN",
    label: "C-SCAN",
    full: "Circular SCAN",
    desc: "One-way sweep, jumps back to zero",
    color: "#fb5607",
    glow: "rgba(251,86,7,0.4)",
    icon: "↻",
  },
];

export default function AlgorithmSelector({ onSelect }) {
  const [selected, setSelected] = useState("FCFS");
  const [hovered, setHovered] = useState(null);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    onSelect(selected);
  }, []);

  const handleSelect = (value) => {
    if (value === selected) return;
    setAnimating(true);
    setTimeout(() => {
      setSelected(value);
      onSelect(value);
      setAnimating(false);
    }, 180);
  };

  const activeAlgo = algorithms.find((a) => a.value === selected);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;600;700&display=swap');

        .algo-selector-root {
          font-family: 'Rajdhani', sans-serif;
          width: 100%;
          max-width: 680px;
          margin: 0 auto;
          padding: 8px;
        }

        .algo-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .algo-header-label {
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          letter-spacing: 3px;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase;
          padding: 4px 10px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 3px;
        }

        .algo-header-pulse {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #00f5ff;
          box-shadow: 0 0 8px #00f5ff, 0 0 16px #00f5ff;
          animation: pulse-blink 1.8s ease-in-out infinite;
          margin-left: auto;
        }

        @keyframes pulse-blink {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.7); }
        }

        .algo-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .algo-card {
          position: relative;
          cursor: pointer;
          border-radius: 8px;
          padding: 16px 18px;
          background: rgba(10, 12, 20, 0.85);
          border: 1px solid rgba(255,255,255,0.08);
          transition: all 0.25s cubic-bezier(0.23, 1, 0.32, 1);
          overflow: hidden;
          user-select: none;
          outline: none;
        }

        .algo-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 8px;
          opacity: 0;
          transition: opacity 0.25s ease;
          pointer-events: none;
        }

        .algo-card:hover::before,
        .algo-card.hovered::before {
          opacity: 1;
        }

        .algo-card::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          border-radius: 8px 8px 0 0;
          transition: opacity 0.25s ease, box-shadow 0.25s ease;
          opacity: 0;
        }

        .algo-card.active::after,
        .algo-card.hovered::after {
          opacity: 1;
        }

        .algo-card.active {
          border-color: var(--card-color);
          background: rgba(10, 12, 20, 0.95);
          transform: translateY(-2px);
        }

        .algo-card:hover:not(.active) {
          border-color: rgba(255,255,255,0.18);
          transform: translateY(-1px);
        }

        .algo-card-corner {
          position: absolute;
          top: 6px; right: 6px;
          width: 14px; height: 14px;
          border-top: 2px solid var(--card-color);
          border-right: 2px solid var(--card-color);
          border-radius: 0 3px 0 0;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .algo-card-corner-bl {
          position: absolute;
          bottom: 6px; left: 6px;
          width: 14px; height: 14px;
          border-bottom: 2px solid var(--card-color);
          border-left: 2px solid var(--card-color);
          border-radius: 0 0 0 3px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .algo-card.active .algo-card-corner,
        .algo-card.active .algo-card-corner-bl,
        .algo-card:hover .algo-card-corner,
        .algo-card:hover .algo-card-corner-bl {
          opacity: 1;
        }

        .algo-icon {
          font-size: 22px;
          line-height: 1;
          margin-bottom: 10px;
          display: block;
          transition: transform 0.3s ease;
        }

        .algo-card.active .algo-icon {
          animation: icon-spin-once 0.4s ease forwards;
        }

        @keyframes icon-spin-once {
          0% { transform: scale(0.7) rotate(-10deg); opacity: 0.5; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }

        .algo-name {
          font-family: 'Share Tech Mono', monospace;
          font-size: 20px;
          font-weight: 700;
          letter-spacing: 2px;
          color: #fff;
          display: block;
          margin-bottom: 2px;
          transition: color 0.2s ease;
        }

        .algo-card.active .algo-name {
          color: var(--card-color);
          text-shadow: 0 0 12px var(--card-glow);
        }

        .algo-full {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1px;
          color: rgba(255,255,255,0.35);
          display: block;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .algo-desc {
          font-size: 13px;
          color: rgba(255,255,255,0.5);
          line-height: 1.4;
          font-weight: 400;
        }

        .algo-card.active .algo-desc {
          color: rgba(255,255,255,0.7);
        }

        .algo-active-dot {
          position: absolute;
          top: 14px; right: 14px;
          width: 7px; height: 7px;
          border-radius: 50%;
          background: var(--card-color);
          box-shadow: 0 0 6px var(--card-glow), 0 0 14px var(--card-glow);
          animation: active-dot-pulse 1.5s ease-in-out infinite;
        }

        @keyframes active-dot-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.6; }
        }

        .algo-status-bar {
          margin-top: 16px;
          padding: 12px 16px;
          background: rgba(5, 8, 15, 0.9);
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.3s ease;
          opacity: ${animating ? 0 : 1};
        }

        .algo-status-indicator {
          width: 3px;
          height: 36px;
          border-radius: 3px;
          flex-shrink: 0;
          transition: background 0.3s ease, box-shadow 0.3s ease;
        }

        .algo-status-text {
          flex: 1;
        }

        .algo-status-mode {
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.3);
          text-transform: uppercase;
          display: block;
          margin-bottom: 3px;
        }

        .algo-status-active-name {
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 1px;
          transition: color 0.3s ease;
        }

        .algo-status-arrow {
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          color: rgba(255,255,255,0.2);
          letter-spacing: 1px;
        }

        .scan-line {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 100%;
          background: linear-gradient(transparent 40%, rgba(255,255,255,0.015) 50%, transparent 60%);
          animation: scanline-move 4s linear infinite;
          pointer-events: none;
          border-radius: 8px;
        }

        @keyframes scanline-move {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>

      <div className="algo-selector-root">
        <div className="algo-header">
          <span className="algo-header-label">// DISK SCHEDULER</span>
          <div className="algo-header-pulse" />
        </div>

        <div className="algo-grid">
          {algorithms.map((algo) => {
            const isActive = selected === algo.value;
            const isHov = hovered === algo.value;
            return (
              <div
                key={algo.value}
                className={`algo-card ${isActive ? "active" : ""} ${isHov ? "hovered" : ""}`}
                style={{
                  "--card-color": algo.color,
                  "--card-glow": algo.glow,
                  boxShadow: isActive
                    ? `0 0 0 1px ${algo.color}55, 0 8px 32px ${algo.glow}, inset 0 0 20px ${algo.glow}18`
                    : isHov
                    ? `0 4px 16px rgba(0,0,0,0.4)`
                    : "none",
                }}
                onClick={() => handleSelect(algo.value)}
                onMouseEnter={() => setHovered(algo.value)}
                onMouseLeave={() => setHovered(null)}
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && handleSelect(algo.value)}
              >
                <div className="scan-line" />
                <div className="algo-card-corner" />
                <div className="algo-card-corner-bl" />

                {isActive && <div className="algo-active-dot" />}

                <span className="algo-icon" style={{ color: algo.color }}>
                  {algo.icon}
                </span>
                <span className="algo-name">{algo.label}</span>
                <span className="algo-full">{algo.full}</span>
                <span className="algo-desc">{algo.desc}</span>
              </div>
            );
          })}
        </div>

        {/* Status bar */}
        <div
          className="algo-status-bar"
          style={{
            opacity: animating ? 0 : 1,
            transition: "opacity 0.2s ease",
          }}
        >
          <div
            className="algo-status-indicator"
            style={{
              background: activeAlgo?.color,
              boxShadow: `0 0 8px ${activeAlgo?.glow}, 0 0 20px ${activeAlgo?.glow}`,
            }}
          />
          <div className="algo-status-text">
            <span className="algo-status-mode">ACTIVE MODE</span>
            <span
              className="algo-status-active-name"
              style={{
                color: activeAlgo?.color,
                textShadow: `0 0 10px ${activeAlgo?.glow}`,
              }}
            >
              {activeAlgo?.full}
            </span>
          </div>
          <span className="algo-status-arrow">[ SELECTED ]</span>
        </div>
      </div>
    </>
  );
}