import { useState, useEffect, useRef } from "react";
import VideoPlayer from "./VideoPlayer";

const COLORS = {
  navy: "#050d1a",
  navyMid: "#0a1628",
  navyLight: "#0f2040",
  accent: "#e8197d",
  accentLight: "#ff4fa3",
  blue: "#1a7fff",
  blueLight: "#4fa8ff",
  gold: "#ffc94d",
  text: "#f0f4ff",
  muted: "#8899bb",
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&family=Readex+Pro:wght@300;400;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #050d1a;
    font-family: 'Cairo', sans-serif;
    color: #f0f4ff;
    direction: rtl;
    overflow-x: hidden;
  }

  :root {
    --accent: #e8197d;
    --blue: #1a7fff;
    --gold: #ffc94d;
    --navy: #050d1a;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(32px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes float {
    0%,100% { transform: translateY(0px); }
    50%      { transform: translateY(-12px); }
  }
  @keyframes pulse-ring {
    0%   { transform: scale(1);   opacity: 0.6; }
    100% { transform: scale(1.55); opacity: 0; }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes counter {
    from { opacity:0; transform: scale(0.5); }
    to   { opacity:1; transform: scale(1); }
  }
  @keyframes bar-grow {
    from { width: 0; }
  }
  @keyframes particle-drift {
    0%   { transform: translateY(0)   translateX(0)   opacity(1); }
    100% { transform: translateY(-80px) translateX(20px); opacity: 0; }
  }

  .hero-section {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    padding: 0 24px;
  }

  .mesh-bg {
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse 80% 60% at 20% 30%, rgba(26,127,255,0.18) 0%, transparent 60%),
      radial-gradient(ellipse 60% 50% at 80% 70%, rgba(232,25,125,0.16) 0%, transparent 55%),
      radial-gradient(ellipse 50% 40% at 50% 10%, rgba(255,201,77,0.08) 0%, transparent 50%),
      #050d1a;
    z-index: 0;
  }

  .grid-overlay {
    position: absolute; inset: 0; z-index: 0;
    background-image:
      linear-gradient(rgba(26,127,255,0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(26,127,255,0.05) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 80%);
  }

  .nav {
    position: fixed; top: 0; left: 0; right: 0;
    z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 48px;
    background: rgba(5,13,26,0.85);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(26,127,255,0.12);
  }

  .nav-logo {
    font-family: 'Cairo', sans-serif;
    font-weight: 900;
    font-size: 20px;
    background: linear-gradient(135deg, #1a7fff, #e8197d);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -0.5px;
  }

  .nav-links { display: flex; gap: 32px; }
  .nav-link {
    font-size: 14px; font-weight: 600; color: #8899bb;
    cursor: pointer; transition: color 0.2s;
    background: none; border: none; font-family: 'Cairo', sans-serif;
  }
  .nav-link:hover { color: #f0f4ff; }

  .badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(26,127,255,0.12);
    border: 1px solid rgba(26,127,255,0.3);
    border-radius: 100px;
    padding: 8px 20px;
    font-size: 13px; font-weight: 600; color: #4fa8ff;
    margin-bottom: 28px;
    animation: fadeUp 0.6s ease both;
  }
  .badge-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #1a7fff;
    box-shadow: 0 0 8px #1a7fff;
    animation: pulse-ring 1.5s ease-out infinite;
  }

  .hero-title {
    font-family: 'Cairo', sans-serif;
    font-size: clamp(42px, 7vw, 88px);
    font-weight: 900;
    line-height: 1.05;
    text-align: center;
    position: relative; z-index: 1;
    animation: fadeUp 0.7s ease 0.1s both;
    letter-spacing: -2px;
  }
  .hero-title .line-accent {
    display: block;
    background: linear-gradient(135deg, #e8197d 0%, #ff4fa3 50%, #ffc94d 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .hero-title .line-blue {
    display: block;
    background: linear-gradient(135deg, #1a7fff, #4fa8ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .hero-sub {
    max-width: 640px;
    text-align: center;
    font-size: 17px;
    line-height: 1.75;
    color: #8899bb;
    margin: 24px auto 0;
    position: relative; z-index: 1;
    animation: fadeUp 0.7s ease 0.2s both;
    font-weight: 400;
  }

  .hero-ctas {
    display: flex; gap: 16px; margin-top: 40px;
    position: relative; z-index: 1;
    animation: fadeUp 0.7s ease 0.3s both;
    flex-wrap: wrap; justify-content: center;
  }

  .btn-primary {
    padding: 14px 36px;
    background: linear-gradient(135deg, #e8197d, #ff4fa3);
    color: #fff; font-family: 'Cairo', sans-serif; font-weight: 700; font-size: 15px;
    border: none; border-radius: 100px; cursor: pointer;
    box-shadow: 0 8px 32px rgba(232,25,125,0.4);
    transition: all 0.25s;
  }
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(232,25,125,0.55);
  }

  .btn-outline {
    padding: 14px 36px;
    background: transparent;
    color: #f0f4ff; font-family: 'Cairo', sans-serif; font-weight: 700; font-size: 15px;
    border: 1px solid rgba(240,244,255,0.2); border-radius: 100px; cursor: pointer;
    transition: all 0.25s;
  }
  .btn-outline:hover {
    background: rgba(240,244,255,0.07);
    border-color: rgba(240,244,255,0.4);
  }

  .scroll-indicator {
    position: absolute; bottom: 36px;
    display: flex; flex-direction: column; align-items: center; gap: 6px;
    color: #8899bb; font-size: 12px;
    animation: float 2.5s ease-in-out infinite;
    z-index: 1;
  }
  .scroll-arrow {
    width: 20px; height: 20px;
    border-left: 2px solid #8899bb;
    border-bottom: 2px solid #8899bb;
    transform: rotate(-45deg);
  }

  /* ── STATS BAND ── */
  .stats-band {
    background: rgba(10,22,40,0.8);
    border-top: 1px solid rgba(26,127,255,0.1);
    border-bottom: 1px solid rgba(26,127,255,0.1);
    padding: 36px 48px;
    display: flex; justify-content: center; gap: 64px;
    flex-wrap: wrap;
  }
  .stat-item { text-align: center; }
  .stat-num {
    font-family: 'Cairo', sans-serif; font-size: 42px; font-weight: 900;
    background: linear-gradient(135deg, #1a7fff, #4fa8ff);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    line-height: 1;
  }
  .stat-label { font-size: 13px; color: #8899bb; margin-top: 6px; font-weight: 600; }

  /* ── VIDEO SECTION ── */
  .video-section {
    padding: 100px 48px;
    max-width: 1100px;
    margin: 0 auto;
  }
  .section-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 13px; font-weight: 700; letter-spacing: 2px;
    text-transform: uppercase; color: #e8197d;
    margin-bottom: 16px;
  }
  .section-eyebrow::before {
    content: ''; display: block;
    width: 32px; height: 2px; background: #e8197d;
    border-radius: 2px;
  }
  .section-title {
    font-family: 'Cairo', sans-serif; font-size: clamp(28px, 4vw, 48px);
    font-weight: 900; line-height: 1.15; margin-bottom: 20px;
    letter-spacing: -1px;
  }
  .section-title em {
    font-style: normal;
    background: linear-gradient(135deg, #1a7fff, #e8197d);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .section-desc {
    color: #8899bb; font-size: 16px; line-height: 1.8;
    max-width: 560px; margin-bottom: 48px;
  }

  .video-wrapper {
    position: relative;
    border-radius: 20px;
    overflow: hidden;
    background: #0a1628;
    border: 1px solid rgba(26,127,255,0.2);
    box-shadow:
      0 0 0 1px rgba(26,127,255,0.08),
      0 32px 80px rgba(0,0,0,0.6),
      0 0 100px rgba(26,127,255,0.08);
    aspect-ratio: 16/9;
  }

  .video-wrapper iframe, .video-wrapper video {
    width: 100%; height: 100%; display: block; border: none;
  }

  .video-placeholder {
    width: 100%; height: 100%;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    background: linear-gradient(135deg, #0a1628 0%, #0f2040 100%);
    gap: 20px; cursor: pointer;
    transition: background 0.3s;
    position: relative;
    overflow: hidden;
  }
  .video-placeholder::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 60% 60% at 50% 50%, rgba(26,127,255,0.08), transparent);
  }
  .video-placeholder:hover { background: linear-gradient(135deg, #0f1e38 0%, #142850 100%); }

  .play-btn-wrap {
    position: relative; width: 80px; height: 80px;
  }
  .play-ring {
    position: absolute; inset: 0; border-radius: 50%;
    border: 2px solid rgba(232,25,125,0.5);
    animation: pulse-ring 1.8s ease-out infinite;
  }
  .play-ring-2 {
    animation-delay: 0.6s;
  }
  .play-btn {
    width: 80px; height: 80px; border-radius: 50%;
    background: linear-gradient(135deg, #e8197d, #ff4fa3);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 8px 32px rgba(232,25,125,0.5);
    position: relative; z-index: 1;
    transition: transform 0.2s;
  }
  .play-btn:hover { transform: scale(1.1); }
  .play-triangle {
    width: 0; height: 0;
    border-top: 14px solid transparent;
    border-bottom: 14px solid transparent;
    border-left: 22px solid #fff;
    margin-right: -4px;
  }
  .video-upload-label {
    font-size: 16px; font-weight: 600; color: #8899bb;
    position: relative; z-index: 1;
  }
  .video-upload-label span { color: #4fa8ff; }

  .video-input { display: none; }

  .video-glow-bar {
    position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, #e8197d, #1a7fff, #ffc94d);
    background-size: 400px 3px;
    animation: shimmer 2.5s linear infinite;
  }

  /* ── MISSION SECTION ── */
  .mission-section {
    padding: 100px 48px;
    max-width: 1100px;
    margin: 0 auto;
  }
  .mission-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    align-items: center;
  }
  .mission-visual {
    position: relative;
    padding: 40px;
  }
  .mission-card {
    background: rgba(10,22,40,0.8);
    border: 1px solid rgba(26,127,255,0.15);
    border-radius: 20px;
    padding: 32px;
    position: relative;
    overflow: hidden;
  }
  .mission-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, #e8197d, #1a7fff);
  }
  .mission-icon-row {
    display: flex; gap: 16px; margin-bottom: 24px;
  }
  .m-icon {
    width: 48px; height: 48px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px;
    background: rgba(26,127,255,0.1);
    border: 1px solid rgba(26,127,255,0.2);
  }
  .m-icon.pink {
    background: rgba(232,25,125,0.1);
    border-color: rgba(232,25,125,0.2);
  }
  .mission-card-title {
    font-size: 18px; font-weight: 700; margin-bottom: 12px;
  }
  .mission-card-text {
    font-size: 14px; line-height: 1.8; color: #8899bb;
  }
  .floating-badge {
    position: absolute; top: -16px; right: -16px;
    background: linear-gradient(135deg, #ffc94d, #ff9500);
    color: #1a0a00; font-size: 12px; font-weight: 700;
    padding: 8px 16px; border-radius: 100px;
    box-shadow: 0 8px 24px rgba(255,201,77,0.4);
    animation: float 3s ease-in-out infinite;
  }

  /* ── STEPS SECTION ── */
  .steps-section {
    padding: 100px 48px;
    background: rgba(10,22,40,0.5);
    border-top: 1px solid rgba(26,127,255,0.08);
    border-bottom: 1px solid rgba(26,127,255,0.08);
  }
  .steps-inner { max-width: 1100px; margin: 0 auto; }
  .steps-header { text-align: center; margin-bottom: 64px; }
  .steps-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
    position: relative;
  }
  .steps-grid::before {
    content: '';
    position: absolute; top: 36px; left: 10%; right: 10%; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(26,127,255,0.3), rgba(232,25,125,0.3), transparent);
  }
  .step-card {
    background: rgba(5,13,26,0.8);
    border: 1px solid rgba(26,127,255,0.12);
    border-radius: 20px;
    padding: 32px 24px;
    text-align: center;
    transition: all 0.3s;
    position: relative;
    overflow: hidden;
  }
  .step-card::after {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(26,127,255,0.05), transparent);
    opacity: 0; transition: opacity 0.3s;
  }
  .step-card:hover {
    transform: translateY(-6px);
    border-color: rgba(26,127,255,0.35);
    box-shadow: 0 16px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(26,127,255,0.15);
  }
  .step-card:hover::after { opacity: 1; }
  .step-num {
    width: 64px; height: 64px; border-radius: 50%;
    margin: 0 auto 20px;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Cairo', sans-serif; font-size: 22px; font-weight: 900;
    position: relative;
  }
  .step-num.s1 { background: rgba(26,127,255,0.15); border: 2px solid rgba(26,127,255,0.4); color: #4fa8ff; }
  .step-num.s2 { background: rgba(232,25,125,0.15); border: 2px solid rgba(232,25,125,0.4); color: #ff4fa3; }
  .step-num.s3 { background: rgba(255,201,77,0.12); border: 2px solid rgba(255,201,77,0.4); color: #ffc94d; }
  .step-num.s4 { background: rgba(79,168,255,0.12); border: 2px solid rgba(79,168,255,0.4); color: #4fa8ff; }
  .step-emoji { font-size: 26px; margin-bottom: 16px; display: block; }
  .step-title {
    font-size: 16px; font-weight: 700; margin-bottom: 10px; color: #f0f4ff;
  }
  .step-desc {
    font-size: 13px; line-height: 1.75; color: #8899bb;
  }

  /* ── TEAM SECTION ── */
  .team-section {
    padding: 100px 48px;
    max-width: 1100px; margin: 0 auto;
    text-align: center;
  }
  .team-grid {
    display: flex; gap: 24px; justify-content: center; flex-wrap: wrap;
    margin-top: 48px;
  }
  .team-card {
    background: rgba(10,22,40,0.7);
    border: 1px solid rgba(26,127,255,0.12);
    border-radius: 20px;
    padding: 32px 24px;
    width: 200px;
    transition: all 0.3s;
  }
  .team-card:hover {
    transform: translateY(-4px);
    border-color: rgba(232,25,125,0.3);
    box-shadow: 0 16px 40px rgba(0,0,0,0.4);
  }
  .avatar {
    width: 72px; height: 72px; border-radius: 50%;
    margin: 0 auto 16px;
    display: flex; align-items: center; justify-content: center;
    font-size: 28px;
    border: 2px solid rgba(26,127,255,0.3);
  }
  .team-name { font-size: 14px; font-weight: 700; margin-bottom: 4px; }
  .team-role { font-size: 12px; color: #8899bb; }

  /* ── CTA SECTION ── */
  .cta-section {
    padding: 100px 48px;
    text-align: center;
    position: relative; overflow: hidden;
    background: rgba(10,22,40,0.5);
    border-top: 1px solid rgba(26,127,255,0.08);
  }
  .cta-section::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 70% 80% at 50% 50%, rgba(232,25,125,0.06), transparent);
  }
  .cta-title {
    font-family: 'Cairo', sans-serif; font-size: clamp(28px, 4vw, 52px);
    font-weight: 900; line-height: 1.15; letter-spacing: -1px;
    position: relative; z-index: 1;
  }
  .contact-row {
    display: flex; justify-content: center; gap: 32px; flex-wrap: wrap;
    margin-top: 40px; position: relative; z-index: 1;
  }
  .contact-item {
    display: flex; align-items: center; gap: 12px;
    background: rgba(10,22,40,0.8);
    border: 1px solid rgba(26,127,255,0.15);
    border-radius: 14px; padding: 16px 24px;
  }
  .contact-icon { font-size: 22px; }
  .contact-text { text-align: right; }
  .contact-label { font-size: 11px; color: #8899bb; font-weight: 600; }
  .contact-val { font-size: 14px; font-weight: 700; color: #f0f4ff; }

  /* ── FOOTER ── */
  .footer {
    padding: 32px 48px;
    border-top: 1px solid rgba(26,127,255,0.08);
    display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
  }
  .footer-text { font-size: 13px; color: #8899bb; }
  .footer-logo {
    font-family: 'Cairo', sans-serif; font-weight: 900; font-size: 18px;
    background: linear-gradient(135deg, #1a7fff, #e8197d);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  @media (max-width: 768px) {
    .nav { padding: 16px 20px; }
    .nav-links { gap: 16px; }
    .stats-band { gap: 32px; padding: 32px 24px; }
    .mission-grid { grid-template-columns: 1fr; }
    .steps-grid { grid-template-columns: 1fr 1fr; }
    .video-section, .mission-section, .team-section { padding: 64px 24px; }
    .steps-section { padding: 64px 24px; }
  }
`;

const STEPS = [
  { num: "01", cls: "s1", emoji: "💡", title: "اكتشاف الأفكار", desc: "نُعرّف التلاميذ بمفهوم ريادة الأعمال بأسلوب بسيط وممتع، ونساعدهم على اكتشاف أفكارهم الإبداعية." },
  { num: "02", cls: "s2", emoji: "🛠", title: "ورشات العمل", desc: "أنشطة تفاعلية عملية يصنع فيها التلاميذ نماذجهم الأولى ويتدربون على التخطيط والتنفيذ." },
  { num: "03", cls: "s3", emoji: "🚀", title: "بناء المشروع", desc: "كل فريق يطوّر مشروعه الصغير بإشراف الطلبة المرافقين، خطوة بخطوة حتى يصبح واقعاً." },
  { num: "04", cls: "s4", emoji: "🏆", title: "يوم العرض", desc: "التلاميذ يقدّمون مشاريعهم أمام الزملاء والأساتذة في حفل ختامي يُكلَّل بالتكريم." },
];

const TEAM = [
  { emoji: "👨‍💻", name: "مشرف المشروع", role: "طالب هندسة إعلامية" },
  { emoji: "👩‍💻", name: "المنسّقة التربوية", role: "طالبة هندسة إعلامية" },
  { emoji: "👨‍🎓", name: "مسؤول الأنشطة", role: "طالب هندسة إعلامية" },
  { emoji: "👩‍🎓", name: "مسؤولة التواصل", role: "طالبة هندسة إعلامية" },
];

function AnimatedCounter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const step = Math.ceil(target / 40);
        const t = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(t); }
          else setCount(start);
        }, 30);
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

export default function MissionPage() {
  const [videoSrc, setVideoSrc] = useState(null);
  const [videoType, setVideoType] = useState(null);
  const [youtubeInput, setYoutubeInput] = useState("");
  const [showYTInput, setShowYTInput] = useState(false);
  const fileRef = useRef(null);
  const videoSectionRef = useRef(null);

  function scrollToVideo() {
    videoSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  function handleFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    setVideoSrc(URL.createObjectURL(f));
    setVideoType("file");
  }

  function handleYoutube() {
    let url = youtubeInput.trim();
    const idMatch = url.match(/(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{11})/);
    if (idMatch) {
      setVideoSrc(`https://www.youtube.com/embed/${idMatch[1]}?autoplay=1&rel=0`);
      setVideoType("youtube");
      setShowYTInput(false);
    }
  }

  return (
    <>
      <style>{styles}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="nav-logo">الرائد الصغير 🚀</div>
        <div className="nav-links">
          <button className="nav-link" onClick={scrollToVideo}>الفيديو</button>
          <button className="nav-link" onClick={() => document.getElementById("mission")?.scrollIntoView({ behavior: "smooth" })}>مهمتنا</button>
          <button className="nav-link" onClick={() => document.getElementById("steps")?.scrollIntoView({ behavior: "smooth" })}>البرنامج</button>
          <button className="nav-link" onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}>تواصل</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero-section">
        <div className="mesh-bg" />
        <div className="grid-overlay" />

        <div className="badge" style={{ position: "relative", zIndex: 1 }}>
          <span className="badge-dot" />
          مشروع اجتماعي ثقافي تربوي · جامعة سوسة
        </div>

        <h1 className="hero-title" style={{ position: "relative", zIndex: 1 }}>
          <span className="line-accent">نصنع رواد</span>
          <span className="line-blue">الغد اليوم</span>
        </h1>

        <p className="hero-sub" style={{ position: "relative", zIndex: 1 }}>
          طلبة هندسة الإعلامية يُطلقون مبادرة تعليمية لتدريب تلاميذ المرحلة الابتدائية
          على أساسيات ريادة الأعمال والابتكار بطريقة تفاعلية وممتعة.
        </p>

        <div className="hero-ctas">
          <button className="btn-primary" onClick={scrollToVideo}>▶ شاهد الفيديو</button>
          <button className="btn-outline" onClick={() => document.getElementById("steps")?.scrollIntoView({ behavior: "smooth" })}>اكتشف البرنامج</button>
        </div>

        <div className="scroll-indicator">
          <span style={{ fontSize: 11 }}>اسحب للأسفل</span>
          <div className="scroll-arrow" />
        </div>
      </section>

      {/* STATS */}
      <div className="stats-band">
        {[
          { num: 4, suffix: "", label: "مدارس ابتدائية" },
          { num: 120, suffix: "+", label: "تلميذ مستفيد" },
          { num: 4, suffix: "", label: "مراحل في البرنامج" },
          { num: 10, suffix: "+", label: "طالب متطوّع" },
        ].map((s, i) => (
          <div className="stat-item" key={i}>
            <div className="stat-num"><AnimatedCounter target={s.num} suffix={s.suffix} /></div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* VIDEO */}
      <section className="video-section" ref={videoSectionRef}>
        <div className="section-eyebrow">فيديو المهمة</div>
        <h2 className="section-title">اكتشف ما نفعله<br /><em>بأعينك</em></h2>
        <p className="section-desc">
          شاهد كيف نحوّل الفصل الدراسي إلى مختبر للأفكار، وكيف يبني أطفال المدرسة
          الابتدائية مشاريعهم الأولى بمرافقة طلبة الهندسة.
        </p>

<VideoPlayer src="/video.mp4" />

    
      </section>

      {/* MISSION */}
      <section className="mission-section" id="mission">
        <div className="section-eyebrow">مهمتنا</div>
        <h2 className="section-title">لماذا <em>الرائد الصغير</em>؟</h2>
        <div className="mission-grid">
          <div>
            <p style={{ color: "#8899bb", fontSize: 16, lineHeight: 1.9, marginBottom: 28 }}>
              لأن كل طفل يحمل فكرة تستحق أن تُبنى. نحن مجموعة من طلبة هندسة الإعلامية
              آمنّا بأن التعليم المبكر لريادة الأعمال يصنع فارقاً حقيقياً في مسيرة الطفل.
            </p>
            <p style={{ color: "#8899bb", fontSize: 16, lineHeight: 1.9 }}>
              لذلك أطلقنا مشروع <strong style={{ color: "#f0f4ff" }}>الرائد الصغير</strong> —
              مبادرة تطوعية تُقدّم للتلاميذ تجربة تعليمية استثنائية تجمع بين الإبداع،
              العمل الجماعي، والتفكير الريادي.
            </p>
          </div>
          <div className="mission-visual">
            <div className="floating-badge">🌟 مبادرة طلابية</div>
            <div className="mission-card">
              <div className="mission-icon-row">
                <div className="m-icon">💡</div>
                <div className="m-icon pink">🚀</div>
                <div className="m-icon">🤝</div>
              </div>
              <div className="mission-card-title">ما نهدف إليه</div>
              <div className="mission-card-text">
                ✦ تنمية روح الإبداع والمبادرة<br />
                ✦ تعزيز العمل الجماعي والتعاون<br />
                ✦ تعريف الأطفال بمفهوم المشروع<br />
                ✦ بناء الثقة بالنفس والتعبير<br />
                ✦ ربط التعليم بالواقع العملي
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section className="steps-section" id="steps">
        <div className="steps-inner">
          <div className="steps-header">
            <div className="section-eyebrow" style={{ justifyContent: "center", margin: "0 auto 16px" }}>كيف يسير البرنامج</div>
            <h2 className="section-title">أربع مراحل نحو <em>المشروع الأول</em></h2>
          </div>
          <div className="steps-grid">
            {STEPS.map((s, i) => (
              <div className="step-card" key={i}>
                <div className={`step-num ${s.cls}`}>{s.num}</div>
                <span className="step-emoji">{s.emoji}</span>
                <div className="step-title">{s.title}</div>
                <div className="step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="team-section">
        <div className="section-eyebrow" style={{ justifyContent: "center", margin: "0 auto 16px" }}>الفريق</div>
        <h2 className="section-title">طلبة يصنعون <em>الفارق</em></h2>
        <p style={{ color: "#8899bb", fontSize: 15, marginTop: 8 }}>
          مجموعة متطوّعة من طلبة هندسة الإعلامية — النفيضة
        </p>
        <div className="team-grid">
          {TEAM.map((t, i) => (
            <div className="team-card" key={i}>
              <div className="avatar">{t.emoji}</div>
              <div className="team-name">{t.name}</div>
              <div className="team-role">{t.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" id="contact">
        <h2 className="cta-title">
          هل تريد أن تنضم<br />
          <span style={{ background: "linear-gradient(135deg,#e8197d,#ffc94d)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            إلى مغامرتنا؟
          </span>
        </h2>
        <p style={{ color: "#8899bb", fontSize: 16, marginTop: 20, position: "relative", zIndex: 1 }}>
          سواء كنت مدرسة، أستاذاً، أو شريكاً — تواصل معنا
        </p>
        <div className="contact-row">
          <div className="contact-item">
            <span className="contact-icon">📧</span>
            <div className="contact-text">
  <div className="contact-label">Instagram</div>
  <a 
    href="https://www.instagram.com/le_petit_entrepreneur" 
    target="_blank" 
    rel="noopener noreferrer"
    className="contact-val text-blue-500 hover:underline"
  >
    @le_petit_entrepreneur
  </a>
</div>
          </div>
          <div className="contact-item">
            <span className="contact-icon">📱</span>
            <div className="contact-text">
              <div className="contact-label">رقم الهاتف</div>
              <div className="contact-val"> 967 158 52 +216 </div>
            </div>
          </div>
          <div className="contact-item">
            <span className="contact-icon">🏫</span>
            <div className="contact-text">
              <div className="contact-label">الموقع</div>
              <div className="contact-val">النفيضة — ولاية سوسة</div>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 40, position: "relative", zIndex: 1 }}>
          <button className="btn-primary" style={{ fontSize: 16, padding: "16px 48px" }}>
            تواصل معنا الآن ✉
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-logo">الرائد الصغير</div>
        <div className="footer-text">© 2025 · مشروع اجتماعي ثقافي · طلبة هندسة الإعلامية</div>
        <div className="footer-text">النفيضة · ولاية سوسة · تونس 🇹🇳</div>
      </footer>
    </>
  );
}