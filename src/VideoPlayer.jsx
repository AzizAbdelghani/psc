import { useState, useRef, useEffect, useCallback } from "react";

const playerStyles = `
  .vp-outer {
    position: relative; border-radius: 20px; overflow: hidden;
    background: #000; border: 1px solid rgba(26,127,255,0.2);
    box-shadow: 0 0 0 1px rgba(26,127,255,0.06), 0 32px 80px rgba(0,0,0,0.7), 0 0 120px rgba(26,127,255,0.07);
    aspect-ratio: 16/9; cursor: pointer;
  }
  .vp-outer video { width:100%; height:100%; display:block; object-fit:contain; background:#000; }
  .vp-overlay {
    position:absolute; inset:0;
    background: linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.08) 45%, rgba(0,0,0,0.0) 65%, rgba(0,0,0,0.35) 100%);
    display:flex; flex-direction:column; justify-content:space-between;
    transition: opacity 0.35s ease;
  }
  .vp-overlay.hidden { opacity:0; pointer-events:none; }

  .vp-top { display:flex; justify-content:space-between; align-items:center; padding:18px 22px 0; }
  .vp-badge {
    display:inline-flex; align-items:center; gap:7px;
    background:rgba(232,25,125,0.85); backdrop-filter:blur(8px);
    color:#fff; font-size:12px; font-weight:700;
    padding:5px 14px; border-radius:100px;
  }
  .vp-badge-dot {
    width:6px; height:6px; border-radius:50%; background:#fff;
    animation: vp-blink 1.2s ease-in-out infinite;
  }
  @keyframes vp-blink { 0%,100%{opacity:.9} 50%{opacity:.3} }

  .vp-center { display:flex; align-items:center; justify-content:center; flex:1; }
  .vp-playbtn-wrap { position:relative; width:80px; height:80px; display:flex; align-items:center; justify-content:center; }
  .vp-ring {
    position:absolute; inset:0; border-radius:50%;
    border:2px solid rgba(232,25,125,0.5);
    animation: vp-ring 1.8s ease-out infinite;
  }
  .vp-ring-2 { animation-delay:0.7s; }
  @keyframes vp-ring { 0%{transform:scale(1);opacity:.7} 100%{transform:scale(1.65);opacity:0} }

  .vp-playbtn {
    width:80px; height:80px; border-radius:50%;
    background:linear-gradient(135deg,#e8197d,#ff4fa3);
    border:none; cursor:pointer; color:#fff;
    display:flex; align-items:center; justify-content:center;
    box-shadow:0 8px 32px rgba(232,25,125,0.6);
    transition:transform 0.2s, box-shadow 0.2s;
    position:relative; z-index:1; font-size:28px; line-height:1;
  }
  .vp-playbtn:hover { transform:scale(1.1); box-shadow:0 12px 48px rgba(232,25,125,0.75); }

  .vp-controls { padding:0 18px 16px; display:flex; flex-direction:column; gap:10px; }

  .vp-progress-wrap {
    position:relative; height:4px; background:rgba(255,255,255,0.18);
    border-radius:4px; cursor:pointer; transition:height 0.15s;
  }
  .vp-progress-wrap:hover { height:7px; }
  .vp-buffered { position:absolute; top:0; left:0; height:100%; background:rgba(255,255,255,0.22); border-radius:4px; pointer-events:none; }
  .vp-progress-fill { height:100%; background:linear-gradient(90deg,#e8197d,#ff4fa3); border-radius:4px; position:relative; }
  .vp-progress-thumb {
    position:absolute; right:-7px; top:50%; transform:translateY(-50%);
    width:14px; height:14px; border-radius:50%; background:#fff;
    box-shadow:0 0 8px rgba(232,25,125,0.8); opacity:0; transition:opacity 0.15s;
  }
  .vp-progress-wrap:hover .vp-progress-thumb { opacity:1; }

  .vp-ctrl-row { display:flex; align-items:center; justify-content:space-between; }
  .vp-left { display:flex; align-items:center; gap:4px; }
  .vp-right { display:flex; align-items:center; gap:8px; }

  .vp-btn {
    min-width:36px; height:36px; padding:0 8px;
    border-radius:10px; background:rgba(255,255,255,0.13); border:none;
    color:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center;
    gap:3px; font-size:15px; font-weight:700; transition:background 0.2s;
    backdrop-filter:blur(4px); font-family:'Cairo',sans-serif; white-space:nowrap;
  }
  .vp-btn:hover { background:rgba(255,255,255,0.25); }

  .vp-time { font-size:12px; font-weight:600; color:rgba(255,255,255,0.85); font-family:'Cairo',sans-serif; white-space:nowrap; padding:0 6px; }
  .vp-time .sep { opacity:0.4; margin:0 2px; }

  .vp-vol-group { display:flex; align-items:center; }
  .vp-vol-bar {
    width:0; overflow:hidden; transition:width 0.3s, opacity 0.3s; opacity:0;
  }
  .vp-vol-group:hover .vp-vol-bar { width:72px; opacity:1; }
  .vp-vol-track { width:68px; height:4px; background:rgba(255,255,255,0.2); border-radius:4px; cursor:pointer; margin-right:4px; }
  .vp-vol-fill { height:100%; background:#fff; border-radius:4px; }

  .vp-quality { font-size:11px; font-weight:700; color:rgba(255,255,255,0.75); background:rgba(255,255,255,0.1); padding:3px 9px; border-radius:6px; border:1px solid rgba(255,255,255,0.15); }

  .vp-glow-bar {
    position:absolute; bottom:0; left:0; right:0; height:2px;
    background:linear-gradient(90deg,#e8197d,#1a7fff,#ffc94d,#e8197d);
    background-size:400px 2px; animation:vp-shimmer 3s linear infinite;
  }
  @keyframes vp-shimmer { 0%{background-position:0 0} 100%{background-position:400px 0} }
`;

function fmtTime(s) {
  if (!s || isNaN(s)) return "0:00";
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

export default function VideoPlayer({ src = "/video.mp4" }) {
  const videoRef   = useRef(null);
  const progressRef = useRef(null);
  const hideTimer  = useRef(null);

  const [playing, setPlaying]         = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration]       = useState(0);
  const [buffered, setBuffered]       = useState(0);
  const [volume, setVolume]           = useState(1);
  const [muted, setMuted]             = useState(false);
  const [visible, setVisible]         = useState(true);

  const resetHide = useCallback((isPlaying) => {
    clearTimeout(hideTimer.current);
    setVisible(true);
    if (isPlaying) hideTimer.current = setTimeout(() => setVisible(false), 2800);
  }, []);

  useEffect(() => { resetHide(playing); return () => clearTimeout(hideTimer.current); }, [playing, resetHide]);

  const togglePlay = () => {
    const v = videoRef.current;
    v.paused ? v.play() : v.pause();
    resetHide(!v.paused);
  };

  const onTimeUpdate = () => {
    const v = videoRef.current;
    setCurrentTime(v.currentTime);
    if (v.buffered.length) setBuffered((v.buffered.end(v.buffered.length - 1) / v.duration) * 100);
  };

  const onProgressClick = (e) => {
    const r = progressRef.current.getBoundingClientRect();
    videoRef.current.currentTime = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * duration;
    resetHide(playing);
  };

  const toggleMute = () => { videoRef.current.muted = !videoRef.current.muted; setMuted(m => !m); };

  const onVolClick = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const v = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    videoRef.current.volume = v;
    setVolume(v);
    if (v === 0) setMuted(true); else { videoRef.current.muted = false; setMuted(false); }
  };

  const toggleFS = () => {
    const el = videoRef.current?.closest(".vp-outer");
    document.fullscreenElement ? document.exitFullscreen() : el?.requestFullscreen();
  };

  const skip = (s) => {
    videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + s));
    resetHide(playing);
  };

  const pct    = duration ? (currentTime / duration) * 100 : 0;
  const volPct = muted ? 0 : volume * 100;

  return (
    <>
      <style>{playerStyles}</style>
      <div className="vp-outer" onMouseMove={() => resetHide(playing)} onClick={togglePlay}>
        <video
          ref={videoRef}
          src={src}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={() => setDuration(videoRef.current.duration)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
        />

        <div className={`vp-overlay${visible ? "" : " hidden"}`}>

          {/* ── TOP ── */}
          <div className="vp-top">
            <div className="vp-badge">
              <span className="vp-badge-dot" />
              {playing ? "يتم التشغيل الآن" : "فيديو المهمة"}
            </div>
            <button className="vp-btn" onClick={e => { e.stopPropagation(); toggleFS(); }}>
              ⛶
            </button>
          </div>

          {/* ── CENTER ── */}
          <div className="vp-center" onClick={e => e.stopPropagation()}>
            <div className="vp-playbtn-wrap" onClick={togglePlay}>
              {!playing && <><div className="vp-ring"/><div className="vp-ring vp-ring-2"/></>}
              <button className="vp-playbtn">
                {playing ? "⏸" : "▶"}
              </button>
            </div>
          </div>

          {/* ── CONTROLS ── */}
          <div className="vp-controls" onClick={e => e.stopPropagation()}>

            {/* Progress */}
            <div className="vp-progress-wrap" ref={progressRef} onClick={onProgressClick}>
              <div className="vp-buffered" style={{ width: `${buffered}%` }} />
              <div className="vp-progress-fill" style={{ width: `${pct}%` }}>
                <div className="vp-progress-thumb" />
              </div>
            </div>

            {/* Row */}
            <div className="vp-ctrl-row">
              <div className="vp-left">

                {/* Play */}
                <button className="vp-btn" onClick={togglePlay}>
                  {playing ? "⏸" : "▶"}
                </button>

                {/* Skip -10 */}
                <button className="vp-btn" onClick={() => skip(-10)} title="رجوع 10 ثواني">
                  ↺ 10
                </button>

                {/* Skip +10 */}
                <button className="vp-btn" onClick={() => skip(10)} title="تقديم 10 ثواني">
                  10 ↻
                </button>

                {/* Volume */}
                <div className="vp-vol-group">
                  <button className="vp-btn" onClick={toggleMute}>
                    {muted || volPct === 0 ? "🔇" : volPct < 50 ? "🔉" : "🔊"}
                  </button>
                  <div className="vp-vol-bar">
                    <div className="vp-vol-track" onClick={onVolClick}>
                      <div className="vp-vol-fill" style={{ width: `${volPct}%` }} />
                    </div>
                  </div>
                </div>

                {/* Time */}
                <span className="vp-time">
                  {fmtTime(currentTime)}<span className="sep">/</span>{fmtTime(duration)}
                </span>
              </div>

              <div className="vp-right">
                <span className="vp-quality">HD</span>
                <button className="vp-btn" onClick={toggleFS}>⛶</button>
              </div>
            </div>
          </div>
        </div>

        <div className="vp-glow-bar" />
      </div>
    </>
  );
}