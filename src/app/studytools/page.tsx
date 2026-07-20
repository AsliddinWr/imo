"use client";

import { useEffect, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import { getCurrentUserProfile } from "@/lib/auth";
import Script from "next/script";
import { useRouter } from "next/navigation";

type ProfileData = {
  full_name?: string | null;
  email?: string | null;
  role?: string | null;
  exam_type?: string | null;
};

function initialsFrom(profile: ProfileData | null) {
  const name = profile?.full_name?.trim();
  const email = profile?.email?.trim();

  if (name) {
    const parts = name.split(" ").filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }

  return email ? email.slice(0, 2).toUpperCase() : "ST";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const pageStyles = `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
@import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css');

*{margin:0;padding:0;box-sizing:border-box;}

:root{
  --p:#071A52;
  --p2:#FF6B52;
  --p3:#FFF0EC;
  --dark:#0A0A0A;
  --text:#0A0A0A;
  --muted:#4A4A4A;
  --muted2:#8A8A8A;
  --border:rgba(7,26,82,0.15);
  --white:#fff;
  --bg:#F5F7FC;
  --green:#00B894;
  --gold:#FDCB6E;
  --red:#E17055;
}

html{
  height:100%;
  scroll-behavior:smooth;
}

body{
  font-family:'Plus Jakarta Sans',system-ui,sans-serif;
  color:var(--text);
  background:var(--bg);
  height:100%;
  overflow-x:hidden;
}

/* NAVBAR */
nav{
  background:#fff;
  border-bottom:1px solid rgba(7,26,82,0.15);
  padding:0 32px;
  height:60px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  position:sticky;
  top:0;
  z-index:100;
}

.logo{
  display:flex;
  align-items:center;
  gap:9px;
  text-decoration:none;
}

.logo-mark{
  width:34px;
  height:34px;
  background:var(--p);
  border-radius:10px;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:2.5px;
  box-shadow:0 4px 12px rgba(7,26,82,0.25);
}

.lm-h{
  width:17px;
  height:2.5px;
  background:#fff;
  border-radius:2px;
}

.lm-v{
  width:4px;
  height:11px;
  background:#fff;
  border-radius:2px;
}

.logo-text{
  font-size:18px;
  font-weight:800;
  letter-spacing:2px;
  color:#0A0A0A;
}

.logo-text span{
  color:#071A52;
}

.nav-center{
  display:flex;
  align-items:center;
  gap:6px;
}

.nav-item{
  font-size:14px;
  color:#4A4A4A;
  text-decoration:none;
  font-weight:600;
  padding:7px 16px;
  border-radius:10px;
  transition:all .15s ease;
  cursor:pointer;
  border:none;
  background:none;
  font-family:inherit;
}

.nav-item:hover{
  color:#0A0A0A;
  background:#F5F7FC;
}

.nav-item.active{
  background:#071A52;
  color:#fff;
  border-radius:16px;
  font-weight:700;
  box-shadow:0 4px 12px rgba(7,26,82,0.30);
}

.nav-right{
  display:flex;
  align-items:center;
  gap:10px;
}

.upgrade-btn{
  display:flex;
  align-items:center;
  gap:7px;
  background:linear-gradient(135deg,#071A52,#FF6B52);
  color:#fff;
  border:none;
  padding:9px 20px;
  border-radius:16px;
  font-size:13px;
  font-weight:700;
  cursor:pointer;
  box-shadow:0 4px 14px rgba(7,26,82,0.30);
  transition:transform .2s ease, box-shadow .2s ease;
  font-family:inherit;
}

.upgrade-btn:hover{
  transform:translateY(-1px);
  box-shadow:0 8px 20px rgba(7,26,82,0.38);
}

.icon-btn{
  width:38px;
  height:38px;
  border-radius:12px;
  border:1px solid rgba(7,26,82,0.15);
  background:#fff;
  display:flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
  color:#4A4A4A;
  font-size:18px;
  transition:background .15s ease,color .15s ease,border-color .15s ease;
}

.icon-btn:hover{
  background:#F5F7FC;
  color:#071A52;
  border-color:rgba(7,26,82,0.28);
}

.user-pill{
  display:flex;
  align-items:center;
  gap:8px;
  border:1px solid rgba(7,26,82,0.18);
  border-radius:20px;
  padding:5px 14px 5px 6px;
  background:#fff;
  cursor:pointer;
  transition:border-color .15s ease, box-shadow .15s ease;
}

.user-pill:hover{
  border-color:#071A52;
  box-shadow:0 4px 12px rgba(7,26,82,0.12);
}

.user-av{
  width:30px;
  height:30px;
  border-radius:50%;
  background:linear-gradient(135deg,#071A52,#FF6B52);
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:11px;
  font-weight:900;
  color:#fff;
}

.user-pname{
  font-size:13px;
  font-weight:700;
  color:#0A0A0A;
}

/* LAYOUT */
.layout{
  display:flex;
  height:calc(100vh - 60px);
  background:#F5F7FC;
}

/* SIDEBAR */
.sidebar{
  width:220px;
  background:#fff;
  border-right:1px solid rgba(7,26,82,0.15);
  padding:16px 12px;
  flex-shrink:0;
  display:flex;
  flex-direction:column;
  gap:4px;
}

.sb-item{
  display:flex;
  align-items:center;
  gap:10px;
  padding:10px 14px;
  border-radius:12px;
  font-size:14px;
  font-weight:600;
  color:#4A4A4A;
  cursor:pointer;
  transition:all .15s ease;
  border:1.5px solid transparent;
  position:relative;
}

.sb-item:hover{
  background:#F5F7FC;
  color:#071A52;
}

.sb-item.active{
  background:linear-gradient(135deg,#FFF0EC,#FFE2DB);
  color:#071A52;
  font-weight:700;
  border-color:rgba(7,26,82,0.25);
  box-shadow:0 2px 8px rgba(7,26,82,0.08);
}

.sb-item.active::before{
  content:'';
  position:absolute;
  left:0;
  top:50%;
  transform:translateY(-50%);
  width:3px;
  height:20px;
  background:#071A52;
  border-radius:0 4px 4px 0;
}

.sb-item i{
  font-size:18px;
}

.sb-item img{
  width:36px;
  height:36px;
  flex-shrink:0;
  object-fit:contain;
}

/* MAIN */
.main{
  flex:1;
  overflow-y:auto;
  padding:28px 32px;
  background:#F5F7FC;
}

/* SECTION HEADER */
.section-header{
  margin-bottom:24px;
}

.section-title{
  font-size:20px;
  font-weight:800;
  color:#0A0A0A;
  letter-spacing:-0.02em;
  margin-bottom:4px;
}

.section-desc{
  font-size:13px;
  color:#4A4A4A;
  font-weight:500;
}

/* ARTICLES */
.articles-grid{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:20px;
}

.article-card{
  background:#fff;
  border:1px solid rgba(7,26,82,0.15);
  border-radius:20px;
  overflow:hidden;
  transition:all .2s ease;
  cursor:pointer;
}

.article-card:hover{
  border-color:rgba(7,26,82,0.40);
  transform:translateY(-3px);
  box-shadow:0 12px 32px rgba(7,26,82,0.12);
}

.article-img{
  width:100%;
  height:160px;
  object-fit:cover;
  position:relative;
  overflow:hidden;
}

.article-img-bg{
  width:100%;
  height:160px;
  display:flex;
  align-items:center;
  justify-content:center;
  position:relative;
}

.lock-overlay{
  position:absolute;
  inset:0;
  background:rgba(0,0,0,0.40);
  backdrop-filter:blur(2px);
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:8px;
}

.lock-overlay i{
  font-size:28px;
  color:#fff;
}

.lock-overlay span{
  font-size:13px;
  font-weight:700;
  color:#fff;
}

.article-body{
  padding:16px;
}

.article-title{
  font-size:13px;
  font-weight:700;
  color:#0A0A0A;
  margin-bottom:6px;
  line-height:1.45;
}

.article-desc{
  font-size:12px;
  color:#4A4A4A;
  line-height:1.6;
  font-weight:500;
}

/* SHADOWING */
.shadowing-grid{
  display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:18px;
}

.shadow-card{
  background:#fff;
  border:1px solid rgba(7,26,82,0.15);
  border-radius:20px;
  padding:20px;
  display:flex;
  gap:14px;
  align-items:flex-start;
  transition:all .2s ease;
  cursor:pointer;
}

.shadow-card:hover{
  border-color:rgba(7,26,82,0.35);
  box-shadow:0 8px 24px rgba(7,26,82,0.10);
  transform:translateY(-2px);
}

.shadow-img{
  width:80px;
  height:80px;
  border-radius:14px;
  flex-shrink:0;
  display:flex;
  align-items:center;
  justify-content:center;
  position:relative;
  overflow:hidden;
}

.shadow-lock{
  position:absolute;
  inset:0;
  background:rgba(0,0,0,.40);
  backdrop-filter:blur(2px);
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:4px;
}

.shadow-info h3{
  font-size:14px;
  font-weight:700;
  color:#0A0A0A;
  margin-bottom:5px;
}

.shadow-info p{
  font-size:12px;
  color:#4A4A4A;
  line-height:1.6;
  margin-bottom:10px;
  font-weight:500;
}

.shadow-meta{
  display:flex;
  gap:10px;
  align-items:center;
}

.shadow-badge{
  font-size:11px;
  font-weight:700;
  padding:3px 9px;
  border-radius:8px;
}

.sb-free{
  background:#E0F7F0;
  color:#00A878;
  font-weight:700;
}

.sb-pro{
  background:#FFF0EC;
  color:#071A52;
  font-weight:700;
}

/* TYPING */
.typing-grid{
  display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:18px;
}

.typing-card{
  background:#fff;
  border:1px solid rgba(7,26,82,0.15);
  border-radius:20px;
  padding:22px;
  transition:all .2s ease;
  cursor:pointer;
}

.typing-card:hover{
  border-color:rgba(7,26,82,0.35);
  box-shadow:0 8px 24px rgba(7,26,82,0.10);
  transform:translateY(-2px);
}

.typing-icon{
  width:44px;
  height:44px;
  border-radius:14px;
  background:#FFF0EC;
  display:flex;
  align-items:center;
  justify-content:center;
  margin-bottom:14px;
}

.typing-card h3{
  font-size:14px;
  font-weight:700;
  color:#0A0A0A;
  margin-bottom:6px;
}

.typing-card p{
  font-size:12px;
  color:#4A4A4A;
  line-height:1.65;
  margin-bottom:14px;
  font-weight:500;
}

.typing-meta{
  display:flex;
  align-items:center;
  justify-content:space-between;
}

.typing-level{
  font-size:11px;
  font-weight:700;
  padding:3px 10px;
  border-radius:8px;
  background:#FFF0EC;
  color:#071A52;
}

.btn-try{
  padding:7px 16px;
  background:#071A52;
  color:#fff;
  border:none;
  border-radius:10px;
  font-size:12px;
  font-weight:700;
  cursor:pointer;
  font-family:inherit;
  box-shadow:0 4px 10px rgba(7,26,82,0.25);
  transition:all .2s ease;
}

.btn-try:hover{
  background:#071A52;
  transform:translateY(-1px);
}

/* WRITING */
.writing-grid{
  display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:18px;
}

.writing-card{
  background:#fff;
  border:1px solid rgba(7,26,82,0.15);
  border-radius:20px;
  padding:22px;
  transition:all .2s ease;
  cursor:pointer;
}

.writing-card:hover{
  border-color:rgba(7,26,82,0.35);
  box-shadow:0 8px 24px rgba(7,26,82,0.10);
  transform:translateY(-2px);
}

.wc-top{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  margin-bottom:10px;
}

.wc-badge{
  font-size:11px;
  font-weight:700;
  padding:3px 10px;
  border-radius:8px;
}

.wc-task1{
  background:#E0F7F0;
  color:#00A878;
  font-weight:700;
}

.wc-task2{
  background:#FFF3E0;
  color:#E17055;
  font-weight:700;
}

.writing-card h3{
  font-size:14px;
  font-weight:700;
  color:#0A0A0A;
  margin-bottom:6px;
  line-height:1.4;
}

.writing-card p{
  font-size:12px;
  color:#4A4A4A;
  line-height:1.65;
  margin-bottom:14px;
  font-weight:500;
}

.wc-bottom{
  display:flex;
  align-items:center;
  justify-content:space-between;
}

.wc-band{
  font-size:13px;
  font-weight:800;
  color:#071A52;
}

/* PODCASTS */
.podcasts-grid{
  display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:18px;
}

.podcast-card{
  background:#fff;
  border:1px solid rgba(7,26,82,0.15);
  border-radius:20px;
  padding:20px;
  display:flex;
  gap:14px;
  align-items:center;
  transition:all .2s ease;
  cursor:pointer;
}

.podcast-card:hover{
  border-color:rgba(7,26,82,0.35);
  box-shadow:0 8px 24px rgba(7,26,82,0.10);
  transform:translateY(-2px);
}

.podcast-thumb{
  width:72px;
  height:72px;
  border-radius:14px;
  flex-shrink:0;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:28px;
}

.podcast-info h3{
  font-size:14px;
  font-weight:700;
  color:#0A0A0A;
  margin-bottom:4px;
}

.podcast-info p{
  font-size:12px;
  color:#4A4A4A;
  margin-bottom:8px;
  font-weight:500;
}

.podcast-meta{
  display:flex;
  gap:10px;
  align-items:center;
}

.podcast-duration{
  font-size:11px;
  color:#4A4A4A;
  display:flex;
  align-items:center;
  gap:4px;
}

.play-btn{
  width:36px;
  height:36px;
  border-radius:50%;
  background:linear-gradient(135deg,#071A52,#FF6B52);
  display:flex;
  align-items:center;
  justify-content:center;
  border:none;
  cursor:pointer;
  transition:all .2s ease;
  margin-left:auto;
  box-shadow:0 4px 10px rgba(7,26,82,0.30);
}

.play-btn:hover{
  transform:scale(1.1);
  box-shadow:0 6px 16px rgba(7,26,82,0.40);
}

/* LIVE CHAT */
.livechat-wrap{
  max-width:680px;
}

.chat-card{
  background:#fff;
  border:1px solid rgba(7,26,82,0.15);
  border-radius:20px;
  overflow:hidden;
}

.chat-header{
  background:linear-gradient(135deg,#071A52,#FF6B52);
  padding:16px 20px;
  display:flex;
  align-items:center;
  gap:12px;
}

.chat-av{
  width:38px;
  height:38px;
  border-radius:50%;
  background:rgba(255,255,255,.20);
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:16px;
  font-weight:700;
  color:#fff;
}

.chat-hname{
  font-size:14px;
  font-weight:700;
  color:#fff;
}

.chat-hstatus{
  font-size:12px;
  color:#D4CFFF;
  display:flex;
  align-items:center;
  gap:5px;
}

.online-dot{
  width:7px;
  height:7px;
  border-radius:50%;
  background:#4ade80;
}

.chat-messages{
  padding:20px;
  display:flex;
  flex-direction:column;
  gap:14px;
  min-height:280px;
  background:#F8FAFE;
}

.msg{
  display:flex;
  gap:10px;
  align-items:flex-end;
}

.msg-av{
  width:30px;
  height:30px;
  border-radius:50%;
  background:linear-gradient(135deg,#071A52,#FF6B52);
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:10px;
  font-weight:700;
  color:#fff;
  flex-shrink:0;
}

.msg-bubble{
  background:#fff;
  border:1px solid rgba(7,26,82,0.15);
  border-radius:14px 14px 14px 4px;
  padding:10px 14px;
  max-width:72%;
  font-size:13px;
  color:#0A0A0A;
  line-height:1.6;
  font-weight:500;
}

.msg-time{
  font-size:10px;
  color:#8A8A8A;
  margin-top:4px;
}

.msg-right{
  flex-direction:row-reverse;
}

.msg-right .msg-bubble{
  background:linear-gradient(135deg,#071A52,#FF6B52);
  color:#fff;
  border-radius:14px 14px 4px 14px;
  border-color:transparent;
}

.msg-right .msg-av{
  background:#00B894;
}

.chat-input-row{
  padding:14px 16px;
  border-top:1px solid rgba(7,26,82,0.15);
  display:flex;
  gap:10px;
  align-items:center;
}

.chat-input{
  flex:1;
  padding:10px 14px;
  border:1.5px solid rgba(7,26,82,0.18);
  border-radius:12px;
  font-size:13px;
  color:#0A0A0A;
  outline:none;
  font-family:inherit;
  transition:border .2s ease;
}

.chat-input:focus{
  border-color:#071A52;
}

.btn-send-chat{
  padding:10px 18px;
  background:linear-gradient(135deg,#071A52,#FF6B52);
  color:#fff;
  border:none;
  border-radius:12px;
  font-size:13px;
  font-weight:700;
  cursor:pointer;
  font-family:inherit;
  box-shadow:0 4px 10px rgba(7,26,82,0.25);
  transition:all .2s ease;
}

.btn-send-chat:hover{
  transform:translateY(-1px);
  box-shadow:0 8px 18px rgba(7,26,82,0.35);
}

/* GRADIENT BACKGROUNDS */
.bg1{background:linear-gradient(135deg,#667eea,#764ba2);}
.bg2{background:linear-gradient(135deg,#f093fb,#f5576c);}
.bg3{background:linear-gradient(135deg,#4facfe,#00f2fe);}
.bg4{background:linear-gradient(135deg,#43e97b,#38f9d7);}
.bg5{background:linear-gradient(135deg,#fa709a,#fee140);}
.bg6{background:linear-gradient(135deg,#a18cd1,#fbc2eb);}
.bg7{background:linear-gradient(135deg,#fda085,#f6d365);}
.bg8{background:linear-gradient(135deg,#96fbc4,#f9f586);}
.bg9{background:linear-gradient(135deg,#89f7fe,#66a6ff);}

/* RESPONSIVE */
@media(max-width:1180px){
  .articles-grid{grid-template-columns:repeat(2,1fr);}
}

@media(max-width:960px){
  .nav-center{display:none;}
  .sidebar{display:none;}
  .layout{
    display:block;
    height:auto;
    min-height:calc(100vh - 60px);
  }
  .main{padding:22px;}
  .articles-grid,
  .shadowing-grid,
  .typing-grid,
  .writing-grid,
  .podcasts-grid{
    grid-template-columns:1fr;
  }
}

@media(max-width:640px){
  nav{padding:0 16px;}
  .upgrade-btn{display:none;}
  .user-pname{display:none;}
  .main{padding:18px;}
}

/* TAB ANIMATION */
@keyframes tabFadeUp {
  from { opacity:0; transform:translateY(12px); }
  to   { opacity:1; transform:translateY(0); }
}

.tab-content {
  animation: tabFadeUp 0.35s ease forwards;
}

/* CARD ACTIVE STATE */
.article-card:active,
.shadow-card:active,
.typing-card:active,
.writing-card:active,
.podcast-card:active {
  transform: scale(0.97);
  transition: transform 0.1s ease;
}

/* SIDEBAR TRANSITION */
.sb-item {
  transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1) !important;
}`;

const pageHtml = `<!-- NAVBAR -->
<nav>
  <a class="logo" href="/">
    <div class="logo-mark"><div class="lm-h"></div><div class="lm-v"></div></div>
    <span class="logo-text">ENGLISH<span>PEAK</span></span>
  </a>
  <div class="nav-center app-main-nav">
    <a class="nav-item" href="/dashboard">Dashboard</a>
    <a class="nav-item" href="/practice">Practice</a>
    <a class="nav-item active" href="/studytools">Study tools</a>
    <a class="nav-item" href="/results">Results</a>
  </div>
  <div class="nav-right">
    <button class="upgrade-btn"><i class="ti ti-sparkles" style="font-size:16px;"></i> Upgrade Plan</button>
    <div class="icon-btn"><i class="ti ti-bell"></i></div>
    <div class="icon-btn"><i class="ti ti-headphones"></i></div>
    <div class="user-pill">
      <div class="user-av">RU</div>
      <span class="user-pname">Rustam Usmonov</span>
      <i class="ti ti-chevron-down" style="font-size:14px;color:var(--muted);"></i>
    </div>
  </div>
</nav>

<div class="layout">
  <aside class="sidebar">
    <div class="sb-item active" onclick="switchTab('articles',this)">
      <img src="/ic-articles.png" width="36" height="36" style="flex-shrink:0;object-fit:contain;"> Articles
    </div>
    <div class="sb-item" onclick="switchTab('shadowing',this)">
      <img src="/ic-shadowing.png" width="36" height="36" style="flex-shrink:0;object-fit:contain;"> Shadowing
    </div>
    <div class="sb-item" onclick="switchTab('typing',this)">
      <img src="/ic-typing.png" width="36" height="36" style="flex-shrink:0;object-fit:contain;"> Typing
    </div>
    <div class="sb-item" onclick="switchTab('writing',this)">
      <img src="/ic-writing.png" width="36" height="36" style="flex-shrink:0;object-fit:contain;"> Writing Samples
    </div>
    <div class="sb-item" onclick="switchTab('podcasts',this)">
      <img src="/ic-podcasts.png" width="36" height="36" style="flex-shrink:0;object-fit:contain;"> Podcasts
    </div>
    <div class="sb-item" onclick="switchTab('livechat',this)">
      <img src="/ic-livechat.png" width="36" height="36" style="flex-shrink:0;object-fit:contain;"> Live Chat
    </div>
  </aside>

  <main class="main">
    <div id="tab-articles" class="tab-content">
      <div class="section-header">
        <div class="section-title">Articles</div>
        <div class="section-desc">Read real-world articles to improve your vocabulary and reading comprehension.</div>
      </div>
      <div class="articles-grid">
        <div class="article-card">
          <div class="article-img-bg bg1"><div class="lock-overlay"><i class="ti ti-lock"></i><span>Upgrade Plan</span></div></div>
          <div class="article-body">
            <div class="article-title">Article 1. Are you ADDICTED to your PHONE?</div>
            <div class="article-desc">Ever pick up your phone, maybe to check the time or answer a message, only to find ...</div>
          </div>
        </div>
        <div class="article-card">
          <div class="article-img-bg bg2"><div class="lock-overlay"><i class="ti ti-lock"></i><span>Upgrade Plan</span></div></div>
          <div class="article-body">
            <div class="article-title">Article 2. Are you healthy?</div>
            <div class="article-desc">It is a surprisingly difficult question to answer. But a new generation ...</div>
          </div>
        </div>
        <div class="article-card">
          <div class="article-img-bg bg3"><div class="lock-overlay"><i class="ti ti-lock"></i><span>Upgrade Plan</span></div></div>
          <div class="article-body">
            <div class="article-title">Article 3. How are you thinking?</div>
            <div class="article-desc">A new understanding of the nature of thought is helping answer existential problems about ...</div>
          </div>
        </div>
        <div class="article-card">
          <div class="article-img-bg bg4"><div class="lock-overlay"><i class="ti ti-lock"></i><span>Upgrade Plan</span></div></div>
          <div class="article-body">
            <div class="article-title">Article 4. Is doom scrolling really rotting our brains?</div>
            <div class="article-desc">If you want to witness the last vestiges of human intellect swirling down the drain ...</div>
          </div>
        </div>
        <div class="article-card">
          <div class="article-img-bg bg5"><div class="lock-overlay"><i class="ti ti-lock"></i><span>Upgrade Plan</span></div></div>
          <div class="article-body">
            <div class="article-title">Article 5. Why the double standards on ultra-processed foods?</div>
            <div class="article-desc">If you want to witness the last vestiges of human intellect swirling down the drain ...</div>
          </div>
        </div>
        <div class="article-card">
          <div class="article-img-bg bg6"><div class="lock-overlay"><i class="ti ti-lock"></i><span>Upgrade Plan</span></div></div>
          <div class="article-body">
            <div class="article-title">Article 6. Are you stressed out?</div>
            <div class="article-desc">Stress may be getting to your skin, but it's not a one-way street ...</div>
          </div>
        </div>
        <div class="article-card">
          <div class="article-img-bg bg7"><div class="lock-overlay"><i class="ti ti-lock"></i><span>Upgrade Plan</span></div></div>
          <div class="article-body">
            <div class="article-title">Article 7. The future of remote work</div>
            <div class="article-desc">Companies around the world are rethinking their approach to flexible working arrangements ...</div>
          </div>
        </div>
        <div class="article-card">
          <div class="article-img-bg bg8"><div class="lock-overlay"><i class="ti ti-lock"></i><span>Upgrade Plan</span></div></div>
          <div class="article-body">
            <div class="article-title">Article 8. Climate change and daily life</div>
            <div class="article-desc">The effects of climate change are no longer a distant threat — they are reshaping our everyday ...</div>
          </div>
        </div>
        <div class="article-card">
          <div class="article-img-bg bg9"><div class="lock-overlay"><i class="ti ti-lock"></i><span>Upgrade Plan</span></div></div>
          <div class="article-body">
            <div class="article-title">Article 9. The rise of artificial intelligence</div>
            <div class="article-desc">AI is no longer science fiction. It's transforming industries, jobs, and the way we live ...</div>
          </div>
        </div>
      </div>
    </div>

    <div id="tab-shadowing" class="tab-content" style="display:none;">
      <div class="section-header">
        <div class="section-title">Shadowing</div>
        <div class="section-desc">Improve your pronunciation and fluency by shadowing native English speakers.</div>
      </div>
      <div class="shadowing-grid">
        <div class="shadow-card"><div class="shadow-img bg1"><div class="shadow-lock"><i class="ti ti-lock" style="font-size:18px;color:#fff;"></i></div></div><div class="shadow-info"><h3>Daily Conversations — Beginner</h3><p>Practice everyday English conversations with native speakers in natural settings.</p><div class="shadow-meta"><span class="shadow-badge sb-free">Free</span><span style="font-size:11px;color:var(--muted);display:flex;align-items:center;gap:4px;"><i class="ti ti-clock" style="font-size:13px;"></i> 5 min</span></div></div></div>
        <div class="shadow-card"><div class="shadow-img bg3"><div class="shadow-lock"><i class="ti ti-lock" style="font-size:18px;color:#fff;"></i></div></div><div class="shadow-info"><h3>Academic Lectures — Intermediate</h3><p>Shadow university-level academic discussions to improve your listening and speaking.</p><div class="shadow-meta"><span class="shadow-badge sb-pro">Pro</span><span style="font-size:11px;color:var(--muted);display:flex;align-items:center;gap:4px;"><i class="ti ti-clock" style="font-size:13px;"></i> 8 min</span></div></div></div>
        <div class="shadow-card"><div class="shadow-img bg5"><div class="shadow-lock"><i class="ti ti-lock" style="font-size:18px;color:#fff;"></i></div></div><div class="shadow-info"><h3>IELTS Speaking Samples — Band 8</h3><p>Listen and shadow Band 8 speaking responses to elevate your own performance.</p><div class="shadow-meta"><span class="shadow-badge sb-pro">Pro</span><span style="font-size:11px;color:var(--muted);display:flex;align-items:center;gap:4px;"><i class="ti ti-clock" style="font-size:13px;"></i> 6 min</span></div></div></div>
        <div class="shadow-card"><div class="shadow-img bg7"><div class="shadow-lock"><i class="ti ti-lock" style="font-size:18px;color:#fff;"></i></div></div><div class="shadow-info"><h3>News Broadcasting — Advanced</h3><p>Shadow professional news anchors to develop natural intonation and rhythm.</p><div class="shadow-meta"><span class="shadow-badge sb-pro">Pro</span><span style="font-size:11px;color:var(--muted);display:flex;align-items:center;gap:4px;"><i class="ti ti-clock" style="font-size:13px;"></i> 10 min</span></div></div></div>
      </div>
    </div>

    <div id="tab-typing" class="tab-content" style="display:none;">
      <div class="section-header">
        <div class="section-title">Typing</div>
        <div class="section-desc">Improve your typing speed and accuracy with IELTS-style texts.</div>
      </div>
      <div class="typing-grid">
        <div class="typing-card"><div class="typing-icon"><i class="ti ti-keyboard" style="color:var(--p);font-size:22px;"></i></div><h3>Academic Word List — Set 1</h3><p>Type frequently used academic words to build muscle memory for IELTS writing tasks.</p><div class="typing-meta"><span class="typing-level">Beginner</span><button class="btn-try">Try now</button></div></div>
        <div class="typing-card"><div class="typing-icon"><i class="ti ti-keyboard" style="color:var(--p2);font-size:22px;"></i></div><h3>IELTS Task 2 Sentences</h3><p>Practice typing complex academic sentences to improve your speed and reduce errors.</p><div class="typing-meta"><span class="typing-level">Intermediate</span><button class="btn-try">Try now</button></div></div>
        <div class="typing-card"><div class="typing-icon"><i class="ti ti-keyboard" style="color:var(--green);font-size:22px;"></i></div><h3>Full Paragraph Typing</h3><p>Type full academic paragraphs under timed conditions to simulate the real exam.</p><div class="typing-meta"><span class="typing-level" style="background:#E1F5EE;color:#0F6E56;">Advanced</span><button class="btn-try">Try now</button></div></div>
        <div class="typing-card"><div class="typing-icon"><i class="ti ti-keyboard" style="color:var(--gold);font-size:22px;"></i></div><h3>Speed Challenge — 5 minutes</h3><p>How many words can you type in 5 minutes? Test your speed with academic text.</p><div class="typing-meta"><span class="typing-level" style="background:#FAEEDA;color:#633806;">Challenge</span><button class="btn-try">Try now</button></div></div>
      </div>
    </div>

    <div id="tab-writing" class="tab-content" style="display:none;">
      <div class="section-header">
        <div class="section-title">Writing Samples</div>
        <div class="section-desc">Study high-scoring IELTS writing samples to understand what Band 7+ looks like.</div>
      </div>
      <div class="writing-grid">
        <div class="writing-card"><div class="wc-top"><span class="wc-badge wc-task1">Task 1</span><span style="font-size:11px;color:var(--muted);">Academic</span></div><h3>Bar Chart — Energy consumption by country</h3><p>A model Band 8 response describing a bar chart comparing energy use across five countries.</p><div class="wc-bottom"><span class="wc-band">Band 8.0</span><button class="btn-try">Read sample</button></div></div>
        <div class="writing-card"><div class="wc-top"><span class="wc-badge wc-task2">Task 2</span><span style="font-size:11px;color:var(--muted);">Academic</span></div><h3>Technology and its impact on social relationships</h3><p>A Band 7.5 essay discussing the positive and negative effects of technology on human connection.</p><div class="wc-bottom"><span class="wc-band">Band 7.5</span><button class="btn-try">Read sample</button></div></div>
        <div class="writing-card"><div class="wc-top"><span class="wc-badge wc-task1">Task 1</span><span style="font-size:11px;color:var(--muted);">Academic</span></div><h3>Line Graph — Population growth in urban areas</h3><p>A Band 8.5 response with excellent coherence and precise data referencing.</p><div class="wc-bottom"><span class="wc-band">Band 8.5</span><button class="btn-try">Read sample</button></div></div>
        <div class="writing-card"><div class="wc-top"><span class="wc-badge wc-task2">Task 2</span><span style="font-size:11px;color:var(--muted);">Academic</span></div><h3>Should university education be free for all students?</h3><p>A Band 7.0 discursive essay with strong arguments on both sides of the debate.</p><div class="wc-bottom"><span class="wc-band">Band 7.0</span><button class="btn-try">Read sample</button></div></div>
      </div>
    </div>

    <div id="tab-podcasts" class="tab-content" style="display:none;">
      <div class="section-header">
        <div class="section-title">Podcasts</div>
        <div class="section-desc">Listen to English podcasts to naturally improve your listening skills and vocabulary.</div>
      </div>
      <div class="podcasts-grid">
        <div class="podcast-card"><div class="podcast-thumb bg1" style="font-size:32px;">🎙️</div><div class="podcast-info" style="flex:1;"><h3>IELTS Energy — Episode 214</h3><p>Tips for Band 7+ in Writing Task 2 from certified IELTS coaches.</p><div class="podcast-meta"><span class="podcast-duration"><i class="ti ti-clock" style="font-size:13px;"></i> 24 min</span><span class="shadow-badge sb-free" style="margin-left:8px;">Free</span></div></div><button class="play-btn"><i class="ti ti-player-play" style="color:#fff;font-size:16px;"></i></button></div>
        <div class="podcast-card"><div class="podcast-thumb bg3" style="font-size:32px;">🎧</div><div class="podcast-info" style="flex:1;"><h3>6 Minute English — BBC</h3><p>Short, engaging episodes on current affairs with transcripts and vocabulary.</p><div class="podcast-meta"><span class="podcast-duration"><i class="ti ti-clock" style="font-size:13px;"></i> 6 min</span><span class="shadow-badge sb-free" style="margin-left:8px;">Free</span></div></div><button class="play-btn"><i class="ti ti-player-play" style="color:#fff;font-size:16px;"></i></button></div>
        <div class="podcast-card"><div class="podcast-thumb bg5" style="font-size:32px;">📻</div><div class="podcast-info" style="flex:1;"><h3>The English We Speak — Episode 312</h3><p>Everyday idioms and phrases explained in natural, conversational English.</p><div class="podcast-meta"><span class="podcast-duration"><i class="ti ti-clock" style="font-size:13px;"></i> 10 min</span><span class="shadow-badge sb-pro" style="margin-left:8px;">Pro</span></div></div><button class="play-btn"><i class="ti ti-player-play" style="color:#fff;font-size:16px;"></i></button></div>
        <div class="podcast-card"><div class="podcast-thumb bg7" style="font-size:32px;">🎤</div><div class="podcast-info" style="flex:1;"><h3>IELTS Speaking Success — Part 3 Deep Dives</h3><p>Master abstract thinking and complex language for IELTS Speaking Part 3.</p><div class="podcast-meta"><span class="podcast-duration"><i class="ti ti-clock" style="font-size:13px;"></i> 18 min</span><span class="shadow-badge sb-pro" style="margin-left:8px;">Pro</span></div></div><button class="play-btn"><i class="ti ti-player-play" style="color:#fff;font-size:16px;"></i></button></div>
      </div>
    </div>

    <div id="tab-livechat" class="tab-content" style="display:none;">
      <div class="section-header">
        <div class="section-title">Live Chat</div>
        <div class="section-desc">Chat with our IELTS experts and get instant help with your questions.</div>
      </div>
      <div class="livechat-wrap">
        <div class="chat-card">
          <div class="chat-header">
            <div class="chat-av">RU</div>
            <div>
              <div class="chat-hname">Rustam Usmonov — IELTS Expert</div>
              <div class="chat-hstatus"><span class="online-dot"></span> Online now</div>
            </div>
          </div>
          <div class="chat-messages" id="chatMessages">
            <div class="msg"><div class="msg-av">RU</div><div><div class="msg-bubble">Hello! 👋 Welcome to EnglishPeak Live Chat. How can I help you today?</div><div class="msg-time">10:00 AM</div></div></div>
            <div class="msg"><div class="msg-av">RU</div><div><div class="msg-bubble">Feel free to ask about IELTS tips, your band score, or any exam strategy!</div><div class="msg-time">10:01 AM</div></div></div>
          </div>
          <div class="chat-input-row">
            <input class="chat-input" id="chatInput" type="text" placeholder="Type your message..." onkeydown="if(event.key==='Enter')sendMsg()">
            <button class="btn-send-chat" onclick="sendMsg()">Send</button>
          </div>
        </div>
      </div>
    </div>
  </main>
</div>`;

const pageScript = `function switchTab(tab, el) {
  document.querySelectorAll('.sb-item').forEach(function(i){
    i.classList.remove('active');
  });
  el.classList.add('active');

  var tabs = ['articles','shadowing','typing','writing','podcasts','livechat'];
  tabs.forEach(function(t){
    var tabEl = document.getElementById('tab-'+t);
    if(t === tab) {
      tabEl.style.display = 'block';
      tabEl.classList.remove('tab-content');
      void tabEl.offsetWidth;
      tabEl.classList.add('tab-content');
    } else {
      tabEl.style.display = 'none';
      tabEl.classList.remove('tab-content');
    }
  });
}

function sendMsg() {
  var input = document.getElementById('chatInput');
  var msg = input.value.trim();
  if(!msg) return;
  var messages = document.getElementById('chatMessages');
  var now = new Date();
  var time = now.getHours()+':'+String(now.getMinutes()).padStart(2,'0');
  var userMsg = '<div class="msg msg-right"><div class="msg-av">ME</div><div><div class="msg-bubble">'+msg+'</div><div class="msg-time" style="text-align:right;">'+time+'</div></div></div>';
  messages.innerHTML += userMsg;
  input.value = '';
  messages.scrollTop = messages.scrollHeight;
  setTimeout(function(){
    var replies = [
      "Great question! For IELTS Writing Task 2, always start with a clear thesis statement.",
      "To improve your band score, focus on vocabulary range and grammatical accuracy.",
      "Practice speaking for 30 minutes daily — consistency is key to Band 7+!",
      "For Listening, try to predict answers before the audio starts playing.",
      "In Reading, skim the questions first, then scan the passage for answers."
    ];
    var reply = replies[Math.floor(Math.random()*replies.length)];
    var now2 = new Date();
    var time2 = now2.getHours()+':'+String(now2.getMinutes()).padStart(2,'0');
    messages.innerHTML += '<div class="msg"><div class="msg-av">RU</div><div><div class="msg-bubble">'+reply+'</div><div class="msg-time">'+time2+'</div></div></div>';
    messages.scrollTop = messages.scrollHeight;
  }, 1000);
}`;

export default function StudyToolsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleInternalNavigation(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest<HTMLAnchorElement>(".app-main-nav a[href]");
      const href = anchor?.getAttribute("href");

      if (!href || !href.startsWith("/")) return;

      event.preventDefault();
      router.push(href);
    }

    document.addEventListener("click", handleInternalNavigation);
    return () => document.removeEventListener("click", handleInternalNavigation);
  }, [router]);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      const { profile } = await getCurrentUserProfile();

      if (isMounted) {
        setProfile(profile);
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const displayName = escapeHtml(
    profile?.full_name?.trim() || profile?.email || "Student"
  );
  const initials = escapeHtml(initialsFrom(profile));

  const renderedHtml = pageHtml
    .replaceAll("Rustam Usmonov", displayName)
    .replaceAll(">RU<", `>${initials}<`);

  return (
    <ProtectedPage>
      <style jsx global>
        {pageStyles}
      </style>

      <div
        suppressHydrationWarning={mounted}
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />

      <Script id="testora-studytools-script" strategy="afterInteractive">
        {pageScript}
      </Script>
    </ProtectedPage>
  );
}
