import { useState } from "react";
import Navbar from "./components/Navbar";
import RequestInput from "./components/RequestInput";
import AlgorithmSelector from "./components/AlgorithmSelector";
import ResultDisplay from "./components/ResultDisplay";
import ComparisonTable from "./components/ComparisonTable";
import VisualizationChart from "./components/VisualizationChart";

import { fcfs } from "./algorithms/fcfs";
import { sstf } from "./algorithms/sstf";
import { scan } from "./algorithms/scan";
import { cscan } from "./algorithms/cscan";

function ParticleField() {
  return (
    <svg style={{ position:"fixed",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:0,opacity:0.35 }}>
      <defs>
        <radialGradient id="pg1" cx="20%" cy="20%" r="50%">
          <stop offset="0%" stopColor="#00f5ff" stopOpacity="0.12"/>
          <stop offset="100%" stopColor="transparent" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="pg2" cx="80%" cy="70%" r="50%">
          <stop offset="0%" stopColor="#8338ec" stopOpacity="0.1"/>
          <stop offset="100%" stopColor="transparent" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="pg3" cx="60%" cy="10%" r="35%">
          <stop offset="0%" stopColor="#ff006e" stopOpacity="0.07"/>
          <stop offset="100%" stopColor="transparent" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#pg1)"/>
      <rect width="100%" height="100%" fill="url(#pg2)"/>
      <rect width="100%" height="100%" fill="url(#pg3)"/>
    </svg>
  );
}

function GridOverlay() {
  return (
    <div style={{
      position:"fixed",inset:0,
      backgroundImage:`linear-gradient(rgba(0,245,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,255,0.025) 1px,transparent 1px)`,
      backgroundSize:"48px 48px",
      pointerEvents:"none",zIndex:0,
    }}/>
  );
}

function SectionDivider({ label }) {
  return (
    <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:16 }}>
      <div style={{ width:5,height:5,borderRadius:"50%",background:"rgba(0,245,255,0.6)",boxShadow:"0 0 6px #00f5ff",flexShrink:0 }}/>
      <span style={{ fontFamily:"'Share Tech Mono',monospace",fontSize:9,letterSpacing:"3px",color: "rgba(255,255,255,0.68)",textTransform:"uppercase",whiteSpace:"nowrap" }}>
        {label}
      </span>
      <div style={{ flex:1,height:1,background:"linear-gradient(90deg,rgba(255,255,255,0.07),transparent)" }}/>
    </div>
  );
}

const ALGO_COLORS = { FCFS:"#00f5ff", SSTF:"#ff006e", SCAN:"#8338ec", CSCAN:"#fb5607" };

function TabBar({ tabs, active, onChange, algo }) {
  const accent = ALGO_COLORS[algo] || "#00f5ff";
  return (
    <div style={{
      display:"flex", gap:2, marginBottom:16,
      background:"rgba(5,8,15,0.85)", borderRadius:7, padding:3,
      border:"1px solid rgba(255,255,255,0.06)", flexShrink:0,
    }}>
      {tabs.map(tab => {
        const isActive = active === tab.id;
        return (
          <button key={tab.id} onClick={() => onChange(tab.id)} style={{
            flex:1, padding:"8px 0", borderRadius:5, border:"none",
            background: isActive ? "rgba(255,255,255,0.06)" : "transparent",
            color: isActive ? "#fff" : "rgba(255,255,255,0.28)",
            fontFamily:"'Share Tech Mono',monospace", fontSize:10, letterSpacing:"2px",
            textTransform:"uppercase", cursor:"pointer", transition:"all 0.2s ease",
            borderBottom: isActive ? `2px solid ${accent}` : "2px solid transparent",
            boxShadow: isActive ? `0 2px 12px ${accent}25` : "none",
          }}>
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function StatusStrip({ result, selectedAlgo, hasRun }) {
  const [tick, setTick] = useState(true);
  // Simple interval without useEffect to keep component small
  setTimeout(() => {}, 0); // no-op
  useState(() => {
    const id = setInterval(() => setTick(t => !t), 1000);
    return () => clearInterval(id);
  });
  return (
    <div style={{
      position:"fixed", bottom:0, left:0, right:0, height:26,
      background:"rgba(4,6,14,0.98)", borderTop:"1px solid rgba(255,255,255,0.05)",
      display:"flex", alignItems:"center", padding:"0 18px", gap:18, zIndex:200,
      fontFamily:"'Share Tech Mono',monospace", fontSize:10, letterSpacing:"1.5px",
      color: "rgba(255,255,255,0.63)",
    }}>
      <span style={{ color: ALGO_COLORS[selectedAlgo] || "#00f5ff" }}>● {selectedAlgo}</span>
      <span>|</span>
      {hasRun && result
        ? <><span>SEEK <span style={{color:"#fff",marginLeft:6}}>{result.seekTime}</span></span><span>|</span><span>STEPS <span style={{color:"#fff",marginLeft:6}}>{result.sequence.length - 1}</span></span></>
        : <span>AWAITING SIMULATION</span>
      }
      <span style={{marginLeft:"auto"}}>OS-SIM v2.4.1</span>
      <span>|</span>
      <span style={{color: "rgba(0,245,255,0.91)"}}>{tick ? "■" : "□"} LIVE</span>
    </div>
  );
}

const TABS = [
  { id:"result",     label:"Result"   },
  { id:"chart",      label:"Chart"    },
  { id:"comparison", label:"Compare"  },
];

export default function App() {
  const [selectedAlgo, setSelectedAlgo] = useState("FCFS");
  const [result, setResult]             = useState(null);
  const [comparison, setComparison]     = useState({});
  const [hasRun, setHasRun]             = useState(false);
  const [activeTab, setActiveTab]       = useState("result");
  const [runKey, setRunKey]             = useState(0);

  const handleRun = (reqs, headPos, diskSize, direction) => {
    let res;
    switch (selectedAlgo) {
      case "FCFS":  res = fcfs(reqs, headPos); break;
      case "SSTF":  res = sstf(reqs, headPos); break;
      case "SCAN":  res = scan(reqs, headPos, diskSize, direction); break;
      case "CSCAN": res = cscan(reqs, headPos, diskSize, direction); break;
      default:      res = null;
    }
    setResult(res);
    setHasRun(true);
    setActiveTab("result");
    setRunKey(k => k + 1);
    setComparison({
      FCFS:  fcfs(reqs, headPos),
      SSTF:  sstf(reqs, headPos),
      SCAN:  scan(reqs, headPos, diskSize, direction),
      CSCAN: cscan(reqs, headPos, diskSize, direction),
    });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; background: #04060e; color: #fff; overflow: hidden; }
        #root { height: 100%; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,245,255,0.18); border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(0,245,255,0.35); }

        .app-shell {
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: relative;
          z-index: 1;
        }

        .app-body {
          display: grid;
          grid-template-columns: 400px 1fr;
          flex: 1;
          min-height: 0; /* critical for overflow to work in grid */
        }

        /* ── LEFT PANEL ── */
        .app-left {
          overflow-y: auto;
          overflow-x: hidden;
          padding: 20px 18px 50px 20px;
          border-right: 1px solid rgba(255,255,255,0.055);
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        /* ── RIGHT PANEL ── */
        .app-right {
          display: flex;
          flex-direction: column;
          padding: 20px 20px 50px 18px;
          min-height: 0;
          overflow: hidden;
        }

        .right-scroll {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          min-height: 0;
        }

        /* Vertical divider glow */
        .vdivider {
          position: absolute;
          left: 399px;
          top: 0; bottom: 0;
          width: 1px;
          background: linear-gradient(to bottom, transparent, rgba(0,245,255,0.12) 30%, rgba(131,56,236,0.12) 70%, transparent);
          pointer-events: none;
          z-index: 10;
        }

        /* Empty state */
        .empty-state {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 18px;
          font-family: 'Share Tech Mono', monospace;
          text-align: center;
          padding: 40px;
          opacity: 0.85; /* Increased base brightness */
        }
        .empty-icon {
          font-size: 60px;
          animation: idle-pulse 3.5s ease-in-out infinite;
        }
        @keyframes idle-pulse {
          0%,100% { opacity:0.4; transform:scale(1) rotate(0deg); }
          50%      { opacity:0.65; transform:scale(1.06) rotate(3deg); }
        }
        .empty-title {
          font-size: 14px; letter-spacing:4px;
          color: rgba(255,255,255,0.9); text-transform:uppercase;
        }
        .empty-sub {
          font-size: 12px; letter-spacing:2px;
          color: rgba(255,255,255,0.7); line-height:2;
        }
        .empty-hint {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 16px;
          border: 1px solid rgba(0,245,255,0.12);
          border-radius: 4px;
          background: rgba(0,245,255,0.04);
          font-size: 11px; letter-spacing:2px;
          color: rgba(0,245,255,0.95);
          margin-top: 8px;
          animation: hint-blink 2s ease-in-out infinite;
        }
        @keyframes hint-blink {
          0%,100% { opacity:1; } 50% { opacity:0.5; }
        }

        /* Results animate in */
        @keyframes results-in {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .results-in {
          animation: results-in 0.38s cubic-bezier(0.23,1,0.32,1) forwards;
        }

        @media (max-width: 820px) {
          .app-body { grid-template-columns: 1fr; }
          .app-left {
            border-right: none;
            border-bottom: 1px solid rgba(255,255,255,0.055);
            max-height: 50vh;
          }
          .vdivider { display: none; }
        }
      `}</style>

      <ParticleField />
      <GridOverlay />

      <div className="app-shell">
        <Navbar />

        <div className="app-body" style={{ position:"relative" }}>
          <div className="vdivider" />

          {/* ── LEFT: Config ── */}
          <aside className="app-left">
            <SectionDivider label="01 · Parameters" />
            <RequestInput onSubmit={handleRun} />

            <div style={{ marginTop:20 }}>
              <SectionDivider label="02 · Algorithm" />
              <AlgorithmSelector onSelect={setSelectedAlgo} />
            </div>
          </aside>

          {/* ── RIGHT: Results ── */}
          <section className="app-right">
            {!hasRun ? (
              <div className="empty-state">
                <div className="empty-icon">◎</div>
                <div className="empty-title">No Simulation Running</div>
                <div className="empty-sub">
                  Set your disk queue and head position<br/>
                  Choose an algorithm · Hit RUN
                </div>
                <div className="empty-hint">
                  ← Configure on the left panel
                </div>
              </div>
            ) : (
              <div key={runKey} className="results-in" style={{ height:"100%", display:"flex", flexDirection:"column" }}>
                <SectionDivider label={`03 · Output — ${selectedAlgo}`} />

                <TabBar
                  tabs={TABS}
                  active={activeTab}
                  onChange={setActiveTab}
                  algo={selectedAlgo}
                />

                <div className="right-scroll">
                  {activeTab === "result" && (
                    <div key={`r-${runKey}`} className="results-in">
                      <ResultDisplay result={result} />
                    </div>
                  )}
                  {activeTab === "chart" && (
                    <div key={`c-${runKey}`} className="results-in">
                      <VisualizationChart sequence={result?.sequence} algorithm={selectedAlgo} />
                    </div>
                  )}
                  {activeTab === "comparison" && (
                    <div key={`k-${runKey}`} className="results-in">
                      <ComparisonTable data={comparison} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      <StatusStrip result={result} selectedAlgo={selectedAlgo} hasRun={hasRun} />
    </>
  );
}