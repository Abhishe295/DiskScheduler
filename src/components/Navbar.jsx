import { useState, useEffect } from "react";

export default function Navbar() {
  const [time, setTime] = useState("");
  const [tick, setTick] = useState(true);
  const [bootDone, setBootDone] = useState(false);
  const [charIndex, setCharIndex] = useState(0);

  const title = "DISK SCHEDULING SIMULATOR";

  useEffect(() => {
    // Typewriter boot effect
    if (charIndex < title.length) {
      const t = setTimeout(() => setCharIndex((c) => c + 1), 48);
      return () => clearTimeout(t);
    } else {
      setBootDone(true);
    }
  }, [charIndex]);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      const s = String(now.getSeconds()).padStart(2, "0");
      setTime(`${h}:${m}:${s}`);
      setTick((t) => !t);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@500;700&display=swap');

        .nb-root {
          font-family: 'Rajdhani', sans-serif;
          position: relative;
          width: 100%;
          background: rgba(4, 6, 14, 0.97);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          overflow: hidden;
          z-index: 100;
        }

        /* Animated top accent line */
        .nb-top-line {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            #00f5ff 20%,
            #8338ec 50%,
            #ff006e 80%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: nb-line-slide 4s linear infinite;
        }

        @keyframes nb-line-slide {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Scanline texture */
        .nb-scanlines {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 3px,
            rgba(0,0,0,0.18) 3px,
            rgba(0,0,0,0.18) 4px
          );
          pointer-events: none;
        }

        .nb-inner {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          height: 58px;
        }

        /* Left: system tag */
        .nb-left {
          display: flex;
          align-items: center;
          gap: 14px;
          flex: 1;
        }

        .nb-os-badge {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 4px 10px;
          border: 1px solid rgba(0,245,255,0.2);
          border-radius: 3px;
          background: rgba(0,245,255,0.05);
        }

        .nb-os-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #00f5ff;
          box-shadow: 0 0 6px #00f5ff, 0 0 12px #00f5ff;
          animation: nb-dot-blink 2s ease-in-out infinite;
        }

        @keyframes nb-dot-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.25; }
        }

        .nb-os-text {
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px;
          letter-spacing: 2px;
          color: rgba(0,245,255,0.7);
          text-transform: uppercase;
        }

        .nb-divider {
          width: 1px;
          height: 20px;
          background: rgba(255,255,255,0.08);
        }

        .nb-version {
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px;
          letter-spacing: 1px;
          color: rgba(255,255,255,0.18);
        }

        /* Center: title */
        .nb-center {
          flex: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
        }

        .nb-title-wrap {
          position: relative;
          display: flex;
          align-items: center;
          gap: 0;
        }

        .nb-title {
          font-family: 'Share Tech Mono', monospace;
          font-size: 17px;
          font-weight: 700;
          letter-spacing: 4px;
          color: #fff;
          text-shadow:
            0 0 20px rgba(0,245,255,0.25),
            0 0 40px rgba(131,56,236,0.15);
          white-space: nowrap;
        }

        .nb-title-cursor {
          display: inline-block;
          width: 2px;
          height: 17px;
          background: #00f5ff;
          box-shadow: 0 0 6px #00f5ff;
          margin-left: 3px;
          vertical-align: middle;
          animation: nb-cursor-blink 0.9s step-end infinite;
        }

        @keyframes nb-cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .nb-subtitle {
          font-family: 'Share Tech Mono', monospace;
          font-size: 9px;
          letter-spacing: 3px;
          color: rgba(255,255,255,0.2);
          text-transform: uppercase;
          opacity: 0;
          transition: opacity 0.6s ease 0.2s;
        }
        .nb-subtitle.show { opacity: 1; }

        /* Right: status cluster */
        .nb-right {
          display: flex;
          align-items: center;
          gap: 14px;
          flex: 1;
          justify-content: flex-end;
        }

        .nb-status-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nb-status-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
        }

        .nb-status-dot.green {
          background: #00ff88;
          box-shadow: 0 0 5px #00ff88, 0 0 10px rgba(0,255,136,0.5);
          animation: nb-dot-blink 2.4s ease-in-out infinite;
        }

        .nb-status-label {
          font-family: 'Share Tech Mono', monospace;
          font-size: 9px;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.2);
          text-transform: uppercase;
        }

        .nb-clock-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 5px 12px;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 4px;
          background: rgba(255,255,255,0.02);
        }

        .nb-clock-icon {
          font-size: 11px;
          opacity: 0.3;
        }

        .nb-clock {
          font-family: 'Share Tech Mono', monospace;
          font-size: 13px;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.55);
          min-width: 68px;
        }

        /* Corner bracket decorations */
        .nb-corner {
          position: absolute;
          width: 10px;
          height: 10px;
        }
        .nb-corner.tl {
          top: 6px; left: 8px;
          border-top: 1px solid rgba(0,245,255,0.3);
          border-left: 1px solid rgba(0,245,255,0.3);
        }
        .nb-corner.tr {
          top: 6px; right: 8px;
          border-top: 1px solid rgba(0,245,255,0.3);
          border-right: 1px solid rgba(0,245,255,0.3);
        }
        .nb-corner.bl {
          bottom: 6px; left: 8px;
          border-bottom: 1px solid rgba(0,245,255,0.3);
          border-left: 1px solid rgba(0,245,255,0.3);
        }
        .nb-corner.br {
          bottom: 6px; right: 8px;
          border-bottom: 1px solid rgba(0,245,255,0.3);
          border-right: 1px solid rgba(0,245,255,0.3);
        }

        /* Bottom micro-bar */
        .nb-bottom-bar {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(131,56,236,0.4) 30%,
            rgba(0,245,255,0.4) 70%,
            transparent
          );
        }

        @media (max-width: 600px) {
          .nb-left, .nb-right { display: none; }
          .nb-title { font-size: 12px; letter-spacing: 2px; }
        }
      `}</style>

      <nav className="nb-root">
        <div className="nb-top-line" />
        <div className="nb-scanlines" />

        {/* Corner brackets */}
        <div className="nb-corner tl" />
        <div className="nb-corner tr" />
        <div className="nb-corner bl" />
        <div className="nb-corner br" />

        <div className="nb-inner">
          {/* Left */}
          <div className="nb-left">
            <div className="nb-os-badge">
              <div className="nb-os-dot" />
              <span className="nb-os-text">OS-SIM</span>
            </div>
            <div className="nb-divider" />
            <span className="nb-version">v2.4.1</span>
          </div>

          {/* Center */}
          <div className="nb-center">
            <div className="nb-title-wrap">
              <span className="nb-title">
                {title.slice(0, charIndex)}
              </span>
              {!bootDone && <span className="nb-title-cursor" />}
              {bootDone && <span className="nb-title-cursor" />}
            </div>
            <span className={`nb-subtitle ${bootDone ? "show" : ""}`}>
              FCFS · SSTF · SCAN · C-SCAN
            </span>
          </div>

          {/* Right */}
          <div className="nb-right">
            <div className="nb-status-group">
              <div className="nb-status-dot green" />
              <span className="nb-status-label">ONLINE</span>
            </div>
            <div className="nb-divider" />
            <div className="nb-clock-wrap">
              <span className="nb-clock-icon">⏱</span>
              <span className="nb-clock">{time}</span>
            </div>
          </div>
        </div>

        <div className="nb-bottom-bar" />
      </nav>
    </>
  );
}