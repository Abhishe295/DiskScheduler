import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";

const RequestInput = forwardRef(({ onSubmit }, ref) => {
  const [requests, setRequests] = useState("");
  const [head, setHead] = useState("");
  const [diskSize, setDiskSize] = useState(200);
  const [direction, setDirection] = useState("right");
  const [errors, setErrors] = useState({});
  const [firing, setFiring] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [shake, setShake] = useState(false);
  const timeoutRefs = useRef([]);

  const presets = [
    { label: "PRESET A", value: "98,183,37,122,14,124,65,67" },
    { label: "PRESET B", value: "55,58,60,70,18,90,150,160,184" },
    { label: "PRESET C", value: "176,79,34,60,92,11,41,114" },
  ];

  const scheduleTimeout = (fn, delay) => {
    const id = setTimeout(fn, delay);
    timeoutRefs.current.push(id);
    return id;
  };

  const parseInputs = () => {
    const parsedRequests = requests
      .split(",")
      .map((n) => n.trim())
      .filter((n) => n !== "")
      .map((n) => Number(n));

    return {
      parsedRequests,
      parsedHead: Number(head),
      parsedDiskSize: Number(diskSize),
    };
  };

  const validate = () => {
    const newErrors = {};

    const { parsedRequests, parsedHead, parsedDiskSize } = parseInputs();

    if (!requests.trim()) {
      newErrors.requests = "Queue required";
    } else {
      const rawParts = requests.split(",").map((n) => n.trim());
      if (rawParts.some((n) => n === "")) {
        newErrors.requests = "Use comma-separated numbers only";
      } else if (parsedRequests.some((n) => Number.isNaN(n) || !Number.isInteger(n))) {
        newErrors.requests = "Use integer cylinder values only";
      }
    }

    if (head === "") {
      newErrors.head = "Head position required";
    } else if (Number.isNaN(parsedHead) || !Number.isInteger(parsedHead)) {
      newErrors.head = "Must be an integer";
    }

    if (diskSize === "") {
      newErrors.diskSize = "Disk size required";
    } else if (Number.isNaN(parsedDiskSize) || !Number.isInteger(parsedDiskSize)) {
      newErrors.diskSize = "Must be an integer";
    } else if (parsedDiskSize <= 0) {
      newErrors.diskSize = "Must be greater than 0";
    }

    if (!newErrors.diskSize) {
      if (!newErrors.head && (parsedHead < 0 || parsedHead >= parsedDiskSize)) {
        newErrors.head = `Must be between 0 and ${parsedDiskSize - 1}`;
      }

      if (
        !newErrors.requests &&
        parsedRequests.some((value) => value < 0 || value >= parsedDiskSize)
      ) {
        newErrors.requests = `Requests must be between 0 and ${parsedDiskSize - 1}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitParsedInput = () => {
    const { parsedRequests, parsedHead, parsedDiskSize } = parseInputs();
    onSubmit(parsedRequests, parsedHead, parsedDiskSize, direction);
  };

  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach((id) => clearTimeout(id));
      timeoutRefs.current = [];
    };
  }, []);

  const handleSubmit = () => {
    if (!validate()) {
      setShake(true);
      scheduleTimeout(() => setShake(false), 500);
      return;
    }

    setFiring(true);
    scheduleTimeout(() => {
      submitParsedInput();
      setFiring(false);
    }, 600);
  };

  useImperativeHandle(ref, () => ({
    submitIfValid: () => {
      if (validate()) {
        setFiring(true);
        scheduleTimeout(() => {
          submitParsedInput();
          setFiring(false);
        }, 600);
      }
    }
  }));

  const parsedCount = requests
    ? requests.split(",").filter((n) => n.trim() !== "" && !isNaN(Number(n.trim()))).length
    : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;600;700&display=swap');

        .ri-root {
          font-family: 'Rajdhani', sans-serif;
          width: 100%;
          max-width: 680px;
          margin: 0 auto;
          padding: 8px;
        }

        .ri-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }

        .ri-label {
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          letter-spacing: 3px;
          color: rgba(255,255,255,0.81);
          text-transform: uppercase;
          padding: 4px 10px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 3px;
        }

        .ri-req-count {
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          color: rgba(0,245,255,1.0);
          letter-spacing: 2px;
          transition: color 0.3s;
        }

        /* Field group */
        .ri-field-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
        }

        .ri-field-wrap {
          position: relative;
        }

        .ri-field-label {
          font-family: 'Share Tech Mono', monospace;
          font-size: 9px;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.75);
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: color 0.2s;
        }

        .ri-field-label.focused {
          color: rgba(0,245,255,1.0);
        }

        .ri-field-label.errored {
          color: rgba(255,80,80,0.8);
        }

        .ri-field-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          transition: background 0.2s, box-shadow 0.2s;
        }
        .ri-field-dot.focused {
          background: #00f5ff;
          box-shadow: 0 0 6px #00f5ff;
        }
        .ri-field-dot.errored {
          background: rgba(255,80,80,0.8);
          box-shadow: 0 0 6px rgba(255,80,80,0.5);
        }

        .ri-input {
          width: 100%;
          box-sizing: border-box;
          padding: 12px 16px;
          background: rgba(5, 8, 15, 0.9);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 6px;
          color: #fff;
          font-family: 'Share Tech Mono', monospace;
          font-size: 14px;
          letter-spacing: 1px;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          appearance: none;
          -webkit-appearance: none;
        }

        .ri-input::placeholder {
          color: rgba(255,255,255,0.58);
          font-size: 12px;
          letter-spacing: 1px;
        }

        .ri-input:focus {
          border-color: rgba(0,245,255,0.97);
          box-shadow: 0 0 0 1px rgba(0,245,255,0.15), 0 0 20px rgba(0,245,255,0.07);
        }

        .ri-input.errored {
          border-color: rgba(255,80,80,0.5);
          box-shadow: 0 0 0 1px rgba(255,80,80,0.1);
        }

        .ri-error-msg {
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px;
          color: rgba(255,80,80,0.8);
          letter-spacing: 1px;
          margin-top: 5px;
          padding-left: 4px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* Two-col row */
        .ri-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        /* Presets */
        .ri-presets-wrap {
          margin-bottom: 14px;
        }
        .ri-presets-label {
          font-family: 'Share Tech Mono', monospace;
          font-size: 9px;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.6);
          text-transform: uppercase;
          margin-bottom: 8px;
          display: block;
        }
        .ri-presets-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .ri-preset-btn {
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px;
          letter-spacing: 1.5px;
          padding: 5px 12px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 3px;
          background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.81);
          cursor: pointer;
          transition: all 0.2s ease;
          user-select: none;
        }
        .ri-preset-btn:hover {
          border-color: rgba(0,245,255,0.81);
          color: rgba(0,245,255,1.0);
          background: rgba(0,245,255,0.05);
          box-shadow: 0 0 10px rgba(0,245,255,0.08);
        }

        /* Direction toggle */
        .ri-dir-wrap {
          display: flex;
          gap: 8px;
        }

        .ri-dir-btn {
          flex: 1;
          padding: 11px 0;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(5, 8, 15, 0.9);
          color: rgba(255,255,255,0.75);
          font-family: 'Share Tech Mono', monospace;
          font-size: 12px;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.22s ease;
          user-select: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .ri-dir-btn:hover {
          border-color: rgba(131,56,236,0.35);
          color: rgba(131,56,236,0.7);
          background: rgba(131,56,236,0.05);
        }

        .ri-dir-btn.active {
          border-color: #8338ec;
          color: #8338ec;
          background: rgba(131,56,236,0.1);
          box-shadow: 0 0 0 1px rgba(131,56,236,0.2), 0 0 18px rgba(131,56,236,0.12);
        }

        .ri-dir-arrow {
          font-size: 16px;
          transition: transform 0.3s ease;
        }

        .ri-dir-btn.active .ri-dir-arrow {
          transform: scale(1.2);
        }

        /* Submit button */
        .ri-submit {
          position: relative;
          width: 100%;
          padding: 14px 0;
          border-radius: 7px;
          border: 1px solid rgba(0,245,255,0.35);
          background: rgba(0,245,255,0.06);
          color: #00f5ff;
          font-family: 'Share Tech Mono', monospace;
          font-size: 13px;
          letter-spacing: 4px;
          text-transform: uppercase;
          cursor: pointer;
          overflow: hidden;
          transition: all 0.25s ease;
          margin-top: 18px;
          user-select: none;
          outline: none;
        }

        .ri-submit:hover:not(:disabled) {
          background: rgba(0,245,255,0.12);
          border-color: rgba(0,245,255,1.0);
          box-shadow: 0 0 24px rgba(0,245,255,0.18), 0 0 48px rgba(0,245,255,0.08);
          color: #fff;
          text-shadow: 0 0 10px rgba(0,245,255,0.8);
        }

        .ri-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .ri-submit-shine {
          position: absolute;
          top: 0; left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(0,245,255,0.12),
            transparent
          );
          transition: left 0s;
        }

        .ri-submit:hover .ri-submit-shine {
          left: 160%;
          transition: left 0.5s ease;
        }

        .ri-submit.firing {
          animation: ri-fire-pulse 0.6s ease forwards;
        }

        @keyframes ri-fire-pulse {
          0%   { box-shadow: 0 0 0 rgba(0,245,255,0); }
          40%  { box-shadow: 0 0 40px rgba(0,245,255,0.5), 0 0 80px rgba(0,245,255,0.25); }
          100% { box-shadow: 0 0 0 rgba(0,245,255,0); }
        }

        .ri-submit-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          position: relative;
          z-index: 1;
        }

        .ri-submit-icon {
          font-size: 16px;
          transition: transform 0.3s ease;
        }
        .ri-submit:hover .ri-submit-icon {
          transform: translateX(4px);
        }
        .ri-submit.firing .ri-submit-icon {
          animation: ri-icon-launch 0.6s ease forwards;
        }
        @keyframes ri-icon-launch {
          0%   { transform: translateX(0); opacity: 1; }
          60%  { transform: translateX(30px); opacity: 0; }
          61%  { transform: translateX(-30px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }

        /* Shake animation */
        .ri-panel.shake {
          animation: ri-shake 0.45s ease;
        }
        @keyframes ri-shake {
          0%, 100% { transform: translateX(0); }
          15%  { transform: translateX(-6px); }
          35%  { transform: translateX(6px); }
          55%  { transform: translateX(-4px); }
          75%  { transform: translateX(4px); }
        }

        /* Panel */
        .ri-panel {
          background: rgba(5, 8, 15, 0.88);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          padding: 22px 22px;
        }

        /* Queue preview */
        .ri-queue-preview {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-top: 8px;
          min-height: 0;
          overflow: hidden;
          transition: min-height 0.3s;
        }

        .ri-queue-chip {
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          padding: 3px 8px;
          border-radius: 3px;
          background: rgba(0,245,255,0.07);
          border: 1px solid rgba(0,245,255,0.2);
          color: rgba(0,245,255,1.0);
          letter-spacing: 1px;
          animation: chip-pop 0.2s ease;
        }
        @keyframes chip-pop {
          0% { transform: scale(0.7); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

        select.ri-input {
          cursor: pointer;
          background-image: none;
        }
        select.ri-input option {
          background: #080c18;
          color: #fff;
        }
      `}</style>

      <div className="ri-root">
        {/* Header */}
        <div className="ri-header">
          <span className="ri-label">// SIMULATION INPUT</span>
          <span className="ri-req-count">
            {parsedCount > 0 ? `${parsedCount} REQUESTS QUEUED` : "AWAITING INPUT"}
          </span>
        </div>

        <div className={`ri-panel ${shake ? "shake" : ""}`}>
          <div className="ri-field-group">

            {/* Request queue */}
            <div className="ri-field-wrap">
              <div className={`ri-field-label ${focusedField === "requests" ? "focused" : ""} ${errors.requests ? "errored" : ""}`}>
                <div className={`ri-field-dot ${focusedField === "requests" ? "focused" : ""} ${errors.requests ? "errored" : ""}`} />
                REQUEST QUEUE
              </div>
              <input
                type="text"
                className={`ri-input ${errors.requests ? "errored" : ""}`}
                placeholder="e.g. 98, 183, 37, 122, 14, 124"
                value={requests}
                onChange={(e) => {
                  setRequests(e.target.value);
                  if (errors.requests) setErrors((err) => ({ ...err, requests: null }));
                }}
                onFocus={() => setFocusedField("requests")}
                onBlur={() => setFocusedField(null)}
              />
              {errors.requests && (
                <div className="ri-error-msg">⚠ {errors.requests}</div>
              )}

              {/* Chip preview */}
              {parsedCount > 0 && (
                <div className="ri-queue-preview">
                  {requests.split(",").filter((n) => n.trim() !== "" && !isNaN(Number(n.trim()))).map((n, i) => (
                    <span key={i} className="ri-queue-chip">{n.trim()}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Presets */}
            <div className="ri-presets-wrap">
              <span className="ri-presets-label">Quick Presets</span>
              <div className="ri-presets-row">
                {presets.map((p) => (
                  <button
                    key={p.label}
                    className="ri-preset-btn"
                    onClick={() => {
                      setRequests(p.value);
                      if (errors.requests) setErrors((err) => ({ ...err, requests: null }));
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Head + Disk row */}
            <div className="ri-row-2">
              <div className="ri-field-wrap">
                <div className={`ri-field-label ${focusedField === "head" ? "focused" : ""} ${errors.head ? "errored" : ""}`}>
                  <div className={`ri-field-dot ${focusedField === "head" ? "focused" : ""} ${errors.head ? "errored" : ""}`} />
                  HEAD POSITION
                </div>
                <input
                  type="number"
                  className={`ri-input ${errors.head ? "errored" : ""}`}
                  placeholder="e.g. 53"
                  value={head}
                  onChange={(e) => {
                    setHead(e.target.value);
                    if (errors.head) setErrors((err) => ({ ...err, head: null }));
                  }}
                  onFocus={() => setFocusedField("head")}
                  onBlur={() => setFocusedField(null)}
                />
                {errors.head && <div className="ri-error-msg">⚠ {errors.head}</div>}
              </div>

              <div className="ri-field-wrap">
                <div className={`ri-field-label ${focusedField === "disk" ? "focused" : ""} ${errors.diskSize ? "errored" : ""}`}>
                  <div className={`ri-field-dot ${focusedField === "disk" ? "focused" : ""} ${errors.diskSize ? "errored" : ""}`} />
                  DISK SIZE
                </div>
                <input
                  type="number"
                  className={`ri-input ${errors.diskSize ? "errored" : ""}`}
                  placeholder="200"
                  value={diskSize}
                  onChange={(e) => {
                    setDiskSize(e.target.value);
                    if (errors.diskSize) setErrors((err) => ({ ...err, diskSize: null }));
                  }}
                  onFocus={() => setFocusedField("disk")}
                  onBlur={() => setFocusedField(null)}
                />
                {errors.diskSize && <div className="ri-error-msg">⚠ {errors.diskSize}</div>}
              </div>
            </div>

            {/* Direction toggle */}
            <div className="ri-field-wrap">
              <div className="ri-field-label">
                <div className="ri-field-dot" />
                HEAD DIRECTION
              </div>
              <div className="ri-dir-wrap">
                {[
                  { val: "left",  icon: "←", label: "LEFT" },
                  { val: "right", icon: "→", label: "RIGHT" },
                ].map((d) => (
                  <button
                    key={d.val}
                    className={`ri-dir-btn ${direction === d.val ? "active" : ""}`}
                    onClick={() => setDirection(d.val)}
                  >
                    <span className="ri-dir-arrow">{d.icon}</span>
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            className={`ri-submit ${firing ? "firing" : ""}`}
            onClick={handleSubmit}
            disabled={firing}
          >
            <div className="ri-submit-shine" />
            <div className="ri-submit-inner">
              <span className="ri-submit-icon">▶</span>
              {firing ? "INITIALIZING..." : "RUN SIMULATION"}
            </div>
          </button>
        </div>
      </div>
    </>
  );
});

export default RequestInput;
