"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { supabase } from "@/lib/supabase";

const pageStyles = `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
@import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css');

*{margin:0;padding:0;box-sizing:border-box;}
:root{--p:#5B4FCF;--p2:#7B6FE8;--p3:#EEF0FF;--dark:#13102B;--text:#1A1729;--muted:#6B6880;--border:#E2DEFF;--white:#fff;--green:#1D9E75;--gold:#F5A623;--red:#E24B4A;--bg:#F7F6FF;}
html{scroll-behavior:smooth;}
body{font-family:'Plus Jakarta Sans',system-ui,sans-serif;color:var(--text);background:var(--white);overflow-x:hidden;}

/* NAV */
nav{background:var(--bg);padding:16px 40px;position:sticky;top:0;z-index:100;}
.nav-wrapper{background:var(--white);border:1px solid var(--border);border-radius:50px;padding:8px 10px 8px 16px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 2px 20px rgba(91,79,207,0.07);}
.logo{display:flex;align-items:center;gap:9px;text-decoration:none;}
.logo-mark{width:32px;height:32px;background:var(--p);border-radius:9px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;}
.lm-h{width:16px;height:2.5px;background:#fff;border-radius:2px;}
.lm-v{width:4px;height:10px;background:#fff;border-radius:2px;}
.logo-text{font-size:17px;font-weight:800;letter-spacing:2px;color:var(--dark);}
.logo-text span{color:var(--p);}
.nav-links{display:flex;align-items:center;gap:2px;}
.nav-link{font-size:14px;color:var(--muted);text-decoration:none;font-weight:500;padding:8px 18px;border-radius:50px;transition:all .2s;}
.nav-link:hover{color:var(--dark);}
.nav-right{display:flex;align-items:center;gap:8px;}
.btn-si{padding:9px 20px;border:none;background:transparent;color:var(--dark);border-radius:50px;font-size:14px;font-weight:500;cursor:pointer;font-family:inherit;}
.btn-si:hover{color:var(--p);}
.btn-su{background:var(--dark);color:#fff;border:none;padding:10px 22px;border-radius:50px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;}
.btn-su:hover{background:#2d2860;}

/* HERO */
.hero{background:var(--white);padding:70px 48px 0;position:relative;overflow:hidden;}
.hero-bg{position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 80% 50%, rgba(91,79,207,0.05) 0%, transparent 70%);}
.hero-dots{position:absolute;right:0;top:0;width:55%;height:100%;background-image:radial-gradient(circle, rgba(91,79,207,0.10) 1px, transparent 1px);background-size:24px 24px;opacity:0.6;}
.hero-inner{position:relative;z-index:1;display:grid;grid-template-columns:1fr 1.4fr;gap:52px;align-items:flex-start;}
.hero-left{padding-top:20px;}
.hero h1{font-size:58px;font-weight:800;color:var(--dark);line-height:1.1;margin-bottom:20px;}
.hero h1 .purple{color:var(--p);}
.hero p{font-size:16px;color:var(--muted);line-height:1.75;margin-bottom:18px;}
.hero-chips{display:flex;align-items:center;gap:12px;margin-bottom:32px;font-size:15px;color:var(--muted);font-weight:500;}
.hero-chip-dot{width:5px;height:5px;border-radius:50%;background:var(--p);}
.btn-hero{display:inline-flex;align-items:center;gap:10px;padding:15px 28px;background:var(--p);color:#fff;border:none;border-radius:50px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;box-shadow:0 4px 20px rgba(91,79,207,0.35);transition:all .2s;}
.btn-hero:hover{background:#4740b8;transform:translateY(-2px);}
.btn-hero-arrow{width:28px;height:28px;background:rgba(255,255,255,0.2);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;}

/* HERO DASHBOARD MOCKUP */
.hero-right{position:relative;padding-top:20px;}
.mockups-wrap{position:relative;width:100%;padding-bottom:200px;}
.hero-mockup{background:var(--white);border:1px solid var(--border);border-radius:16px;box-shadow:0 8px 40px rgba(91,79,207,0.12);overflow:hidden;position:relative;z-index:2;margin-left:20px;}
.hero-mockup2{background:var(--white);border:1px solid var(--border);border-radius:16px;box-shadow:0 12px 48px rgba(91,79,207,0.14);overflow:hidden;position:absolute;top:130px;left:0;right:10px;z-index:3;}
.mock-topbar{background:var(--white);border-bottom:1px solid var(--border);padding:10px 16px;display:flex;align-items:center;justify-content:space-between;}
.mock-logo{display:flex;align-items:center;gap:6px;}
.ml-mark{width:20px;height:20px;background:var(--p);border-radius:5px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.5px;}
.ml-h{width:10px;height:2px;background:#fff;border-radius:1px;}
.ml-v{width:3px;height:7px;background:#fff;border-radius:1px;}
.ml-name{font-size:11px;font-weight:800;letter-spacing:1.5px;color:var(--dark);}
.ml-name span{color:var(--p);}
.mock-nav{display:flex;align-items:center;background:var(--p3);border-radius:20px;padding:3px;gap:1px;}
.mn-item{font-size:10px;font-weight:600;color:var(--muted);padding:4px 10px;border-radius:16px;}
.mn-item.active{background:var(--p);color:#fff;}
.mock-user{display:flex;align-items:center;gap:6px;border:1px solid var(--border);border-radius:16px;padding:3px 10px 3px 3px;}
.mu-av{width:20px;height:20px;border-radius:50%;background:var(--p);display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;color:#fff;}
.mu-name{font-size:10px;font-weight:600;color:var(--dark);}
.mock-body{display:grid;grid-template-columns:100px 1fr;min-height:220px;}
.mock-sb{background:#fafafe;border-right:1px solid var(--border);padding:10px 7px;}
.msb-item{display:flex;align-items:center;gap:6px;padding:6px 8px;border-radius:8px;font-size:10px;font-weight:500;color:var(--muted);margin-bottom:2px;}
.msb-item.active{background:var(--p3);color:var(--p);}
.mock-main{padding:12px 16px;}
.mock-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px;}
.ms-card{background:#fafafe;border:1px solid var(--border);border-radius:10px;padding:9px 10px;}
.ms-lbl{font-size:8px;color:var(--muted);margin-bottom:3px;}
.ms-val{font-size:14px;font-weight:800;color:var(--dark);}
.ms-sub{font-size:8px;color:var(--muted);margin-top:1px;}
.mock-perf-title{font-size:11px;font-weight:700;color:var(--dark);margin-bottom:8px;display:flex;align-items:center;gap:4px;}
.mock-perf-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;}
.mp-item{background:#fafafe;border:1px solid var(--border);border-radius:9px;padding:9px;}
.mp-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;font-size:10px;font-weight:600;color:var(--dark);}
.mp-band{font-size:9px;font-weight:700;color:var(--muted);}
.mock-bars{display:flex;gap:2px;align-items:flex-end;height:18px;}
.mb{width:5px;border-radius:1px 1px 0 0;}
.mock-continue{display:flex;align-items:center;justify-content:space-between;background:#fafafe;border:1px solid var(--border);border-radius:9px;padding:8px 12px;}
.mc-text{font-size:10px;font-weight:600;color:var(--dark);}
.mc-btn{padding:4px 10px;background:var(--p);color:#fff;border:none;border-radius:6px;font-size:9px;font-weight:700;cursor:pointer;}

/* STATS BAR */
.stats-bar{background:var(--white);padding:52px 40px;display:flex;justify-content:center;gap:80px;border-bottom:1px solid var(--border);}
.sb-item{text-align:center;}
.sb-icon{width:52px;height:52px;background:var(--p3);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;}
.sb-num{font-size:26px;font-weight:800;color:var(--dark);margin-bottom:4px;}
.sb-lbl{font-size:14px;color:var(--muted);}

/* SECTIONS */
.sec{padding:80px 40px;}
.sec-center{text-align:center;}
.sec-tag{display:inline-block;background:var(--p);color:#fff;font-size:12px;font-weight:700;padding:5px 16px;border-radius:20px;margin-bottom:14px;}
.sec-title{font-size:36px;font-weight:800;color:var(--dark);margin-bottom:14px;line-height:1.2;}
.sec-desc{font-size:16px;color:var(--muted);line-height:1.75;max-width:640px;margin:0 auto 52px;}

/* WHY CHOOSE */
.why-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;max-width:1000px;margin:0 auto;}
.why-card{background:var(--white);border:1px solid var(--border);border-radius:20px;padding:36px 28px;text-align:center;transition:all .25s;position:relative;overflow:hidden;}
.why-card::before{content:'';position:absolute;inset:0;background:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%235B4FCF' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");opacity:.5;}
.why-card:hover{border-color:var(--p);transform:translateY(-4px);box-shadow:0 8px 32px rgba(91,79,207,0.10);}
.why-icon{width:56px;height:56px;background:var(--p3);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 18px;position:relative;}
.why-card h3{font-size:17px;font-weight:700;color:var(--dark);margin-bottom:10px;}
.why-card p{font-size:14px;color:var(--muted);line-height:1.7;}

/* EXAM SKILLS */
.skills-bg{background:var(--bg);}
.skill-row{display:grid;grid-template-columns:1fr 2fr;gap:20px;margin-bottom:20px;max-width:1000px;margin-left:auto;margin-right:auto;}
.skill-row.reverse{grid-template-columns:2fr 1fr;}
.skill-img{border-radius:20px;display:flex;align-items:center;justify-content:center;padding:32px;min-height:200px;}
.skill-card{background:var(--white);border:1px solid var(--border);border-radius:20px;padding:36px;display:flex;flex-direction:column;justify-content:center;position:relative;overflow:hidden;}
.skill-card::after{content:'';position:absolute;right:-20px;bottom:-20px;width:140px;height:140px;background:url("data:image/svg+xml,%3Csvg width='140' height='140' viewBox='0 0 140 140' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='70' cy='70' r='60' fill='none' stroke='%23E2DEFF' stroke-width='1'/%3E%3Ccircle cx='70' cy='70' r='40' fill='none' stroke='%23E2DEFF' stroke-width='1'/%3E%3C/svg%3E");opacity:.5;}
.skill-badge{display:inline-flex;align-items:center;gap:6px;background:var(--p3);border-radius:20px;padding:5px 14px;margin-bottom:14px;width:fit-content;}
.skill-badge i{font-size:16px;}
.skill-badge span{font-size:13px;font-weight:700;color:var(--dark);}
.skill-card h3{font-size:20px;font-weight:800;color:var(--dark);margin-bottom:10px;}
.skill-card p{font-size:14px;color:var(--muted);line-height:1.75;margin-bottom:20px;}
.btn-journey{display:inline-flex;align-items:center;gap:8px;padding:10px 22px;border-radius:50px;font-size:13px;font-weight:700;cursor:pointer;border:none;font-family:inherit;transition:all .2s;}

/* HOW IT WORKS */
.steps-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;max-width:1000px;margin:0 auto;}
.step-card{text-align:center;padding:20px;}
.step-num{width:56px;height:56px;border-radius:50%;border:2px dashed var(--border);display:flex;align-items:center;justify-content:center;margin:0 auto 18px;font-size:18px;font-weight:700;color:var(--p);}
.step-card h3{font-size:16px;font-weight:700;color:var(--dark);margin-bottom:10px;}
.step-card p{font-size:13px;color:var(--muted);line-height:1.7;}

/* MOBILE APP */
.mob-sec{padding:0 40px 0;background:var(--white);}
.mob-inner{background:var(--p);border-radius:24px;padding:56px 64px;display:flex;align-items:center;gap:48px;overflow:hidden;position:relative;max-width:1100px;margin:0 auto;}
.mob-inner::before{content:'';position:absolute;right:340px;top:-60px;width:300px;height:300px;border-radius:50%;background:rgba(255,255,255,0.05);}
.mob-inner::after{content:'';position:absolute;right:300px;bottom:-80px;width:200px;height:200px;border-radius:50%;background:rgba(255,255,255,0.05);}
.mob-left{flex:1;position:relative;z-index:1;}
.mob-title{font-size:34px;font-weight:800;color:#fff;line-height:1.2;margin-bottom:14px;}
.mob-desc{font-size:15px;color:rgba(255,255,255,0.8);line-height:1.75;margin-bottom:28px;}
.mob-btns{display:flex;gap:12px;}
.mob-btn{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.25);color:#fff;padding:12px 22px;border-radius:14px;cursor:pointer;font-family:inherit;transition:all .2s;}
.mob-btn:hover{background:rgba(255,255,255,0.25);}
.mob-btn-label{font-size:10px;color:rgba(255,255,255,0.7);display:block;}
.mob-btn-name{font-size:14px;font-weight:700;display:block;}
.mob-right{flex:0 0 320px;position:relative;z-index:1;}
.phone-mock{background:var(--white);border-radius:24px;padding:20px;box-shadow:0 20px 60px rgba(0,0,0,0.2);}
.pm-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
.pm-greeting{font-size:11px;color:var(--muted);}
.pm-name{font-size:13px;font-weight:700;color:var(--dark);}
.pm-target{background:var(--p3);border-radius:12px;padding:12px 14px;margin-bottom:10px;}
.pm-t-lbl{font-size:10px;color:var(--muted);margin-bottom:4px;}
.pm-t-val{font-size:18px;font-weight:800;color:var(--dark);float:right;margin-top:-18px;}
.pm-t-bar{background:#E2DEFF;border-radius:3px;height:5px;margin-top:6px;}
.pm-t-fill{background:var(--p);height:5px;border-radius:3px;width:75%;}
.pm-t-sub{font-size:9px;color:var(--muted);margin-top:4px;}
.pm-skills{font-size:11px;font-weight:700;color:var(--dark);margin-bottom:8px;}
.pm-skills-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;}
.pm-skill{background:var(--bg);border-radius:9px;padding:8px;}
.pm-sk-lbl{font-size:9px;color:var(--muted);margin-bottom:2px;}
.pm-sk-val{font-size:14px;font-weight:800;color:var(--dark);}
.pm-sk-sub{font-size:8px;color:var(--muted);}
.pm-sk-bar{height:3px;border-radius:2px;margin-top:4px;}

/* EXPERTS */
.experts-sec{background:var(--white);padding:80px 40px;}
.expert-layout{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;max-width:1000px;margin:0 auto 48px;}
.expert-img{width:100%;height:380px;border-radius:20px;background:var(--p3);display:flex;align-items:flex-end;justify-content:flex-start;padding:20px;position:relative;overflow:hidden;}
.expert-img-bg{position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,rgba(91,79,207,0.15) 100%);}
.expert-info{position:relative;z-index:1;}
.expert-name{font-size:22px;font-weight:800;color:var(--dark);margin-bottom:4px;}
.expert-role{font-size:14px;color:var(--p);font-weight:600;margin-bottom:10px;}
.expert-tg{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;background:var(--p3);border-radius:50%;color:var(--p);cursor:pointer;}
.expert-desc{font-size:15px;color:var(--muted);line-height:1.8;margin-bottom:24px;}
.expert-mini{background:var(--white);border:1px solid var(--border);border-radius:14px;padding:14px 16px;display:flex;align-items:center;gap:12px;margin-top:12px;max-width:320px;}
.em-av{width:40px;height:40px;border-radius:50%;background:var(--p3);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:var(--p);flex-shrink:0;}
.em-name{font-size:14px;font-weight:700;color:var(--dark);}
.em-role{font-size:12px;color:var(--p);}

/* PARTNERS */
.partners-sec{padding:48px 40px;border-top:1px solid var(--border);border-bottom:1px solid var(--border);}
.partners-label{text-align:center;font-size:13px;font-weight:600;color:var(--muted);letter-spacing:1px;margin-bottom:24px;}
.partners-row{display:flex;align-items:center;justify-content:center;gap:40px;flex-wrap:wrap;}
.partner-item{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:600;color:var(--muted);}
.partner-logo{width:32px;height:32px;border-radius:8px;background:var(--p3);display:flex;align-items:center;justify-content:center;}
.partner-box{background:var(--white);border:1px solid var(--border);border-radius:20px;padding:48px;text-align:center;max-width:700px;margin:48px auto 0;}
.pb-title{font-size:24px;font-weight:800;color:var(--dark);margin-bottom:10px;}
.pb-desc{font-size:15px;color:var(--muted);margin-bottom:24px;line-height:1.7;}
.btn-partner{padding:12px 28px;background:var(--p);color:#fff;border:none;border-radius:50px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;}

/* REVIEWS */
.reviews-sec{background:var(--bg);padding:80px 40px;}
.reviews-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;max-width:1100px;margin:0 auto;}
.rv-card{background:var(--white);border:1px solid var(--border);border-radius:16px;padding:20px;}
.rv-text{font-size:13px;color:var(--text);line-height:1.7;margin-bottom:16px;}
.rv-user{display:flex;align-items:center;gap:10px;}
.rv-av{width:32px;height:32px;border-radius:50%;background:var(--p3);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.rv-av i{font-size:16px;color:var(--p);}
.rv-name{font-size:13px;font-weight:700;color:var(--dark);}

/* FAQ */
.faq-sec{background:var(--white);padding:80px 40px;}
.faq-list{max-width:720px;margin:0 auto;}
.faq-item{background:var(--white);border:1px solid var(--border);border-radius:14px;margin-bottom:12px;overflow:hidden;}
.faq-q{padding:18px 22px;font-size:15px;font-weight:500;color:var(--dark);cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:12px;transition:all .2s;}
.faq-q:hover{background:var(--bg);}
.faq-q.open{background:var(--white);}
.faq-icon{font-size:20px;color:var(--muted);transition:transform .3s;flex-shrink:0;}
.faq-icon.open{transform:rotate(45deg);}
.faq-a{font-size:14px;color:var(--muted);line-height:1.75;max-height:0;overflow:hidden;transition:all .35s;padding:0 22px;}
.faq-a.open{max-height:120px;padding:14px 22px 20px;}

/* CTA */
.cta-sec{padding:80px 40px;background:var(--bg);text-align:center;position:relative;overflow:hidden;}
.cta-dots{position:absolute;inset:0;background-image:radial-gradient(circle, rgba(91,79,207,0.1) 1px, transparent 1px);background-size:24px 24px;}
.cta-content{position:relative;z-index:1;}
.cta-title{font-size:38px;font-weight:800;color:var(--dark);margin-bottom:14px;}
.cta-desc{font-size:16px;color:var(--muted);max-width:600px;margin:0 auto 32px;line-height:1.75;}
.btn-cta{padding:16px 44px;background:var(--p);color:#fff;border:none;border-radius:50px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;box-shadow:0 4px 20px rgba(91,79,207,0.3);}
.btn-cta:hover{background:#4740b8;}

/* CONTACT */
.contact-sec{background:var(--white);padding:80px 40px;}
.contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:52px;max-width:860px;margin:0 auto;}
.c-item{display:flex;align-items:center;gap:14px;margin-bottom:20px;}
.c-icon{width:44px;height:44px;background:var(--p3);border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.c-label{font-size:11px;color:var(--muted);margin-bottom:2px;font-weight:600;}
.c-val{font-size:14px;font-weight:700;color:var(--dark);}
.cf-input{width:100%;padding:12px 15px;border:1px solid var(--border);border-radius:12px;font-size:14px;color:var(--dark);background:var(--white);margin-bottom:12px;outline:none;font-family:inherit;transition:border .2s;}
.cf-input:focus{border-color:var(--p);}
.cf-ta{height:100px;resize:none;}
.btn-send{width:100%;padding:13px;background:var(--p);color:#fff;border:none;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;}
.btn-send:hover{background:#4740b8;}

/* FOOTER */
footer{background:var(--white);border-top:1px solid var(--border);padding:48px 40px 28px;}
.footer-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;}
.footer-logo{display:flex;align-items:center;gap:9px;margin-bottom:12px;}
.fl-mark{width:30px;height:30px;background:var(--p);border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;}
.fl-h{width:14px;height:2px;background:#fff;border-radius:1px;}
.fl-v{width:3px;height:9px;background:#fff;border-radius:1px;}
.fl-name{font-size:15px;font-weight:800;letter-spacing:2px;color:var(--dark);}
.fl-name span{color:var(--p);}
.footer-desc{font-size:13px;color:var(--muted);line-height:1.7;max-width:220px;margin-bottom:0;}
.footer-links h4{font-size:13px;font-weight:700;color:var(--dark);margin-bottom:14px;}
.footer-links a{display:block;font-size:13px;color:var(--muted);text-decoration:none;margin-bottom:9px;transition:color .2s;}
.footer-links a:hover{color:var(--p);}
.footer-bottom{border-top:1px solid var(--border);padding-top:22px;display:flex;justify-content:space-between;align-items:center;}
.footer-bottom p{font-size:12px;color:var(--muted);}
.footer-socials{display:flex;gap:10px;}
.soc{width:34px;height:34px;border-radius:50%;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;color:var(--p);font-size:16px;cursor:pointer;transition:all .2s;}
.soc:hover{background:var(--p);color:#fff;border-color:var(--p);}

/* RESPONSIVE */
@media (max-width: 1024px){
  nav{padding:14px 24px;}
  .nav-links{display:none;}
  .hero{padding:52px 28px 0;}
  .hero-inner{grid-template-columns:minmax(0,1fr) minmax(420px,1.15fr);gap:28px;}
  .hero h1{font-size:46px;}
  .mockups-wrap{padding-bottom:170px;}
  .stats-bar{gap:48px;padding:44px 28px;}
  .sec,.experts-sec,.reviews-sec,.faq-sec,.contact-sec,.cta-sec{padding:68px 28px;}
  .reviews-grid{grid-template-columns:repeat(2,1fr);}
  .mob-sec{padding-left:28px!important;padding-right:28px!important;}
  .mob-inner{padding:48px 42px;gap:32px;}
  .mob-right{flex-basis:290px;}
  footer{padding-left:28px;padding-right:28px;}
}

@media (max-width: 768px){
  nav{padding:10px 16px;}
  .nav-wrapper{padding:7px 8px 7px 12px;}
  .logo-text{font-size:15px;letter-spacing:1.5px;}
  .btn-si{display:none;}
  .btn-su{padding:9px 14px;font-size:12px;white-space:nowrap;}
  .hero{padding:42px 20px 0;text-align:center;}
  .hero-inner{display:flex;flex-direction:column;gap:28px;align-items:stretch;}
  .hero-left{padding-top:0;}
  .hero h1{font-size:clamp(36px,10vw,48px);}
  .hero p{max-width:600px;margin-left:auto;margin-right:auto;}
  .hero-chips{justify-content:center;flex-wrap:wrap;row-gap:6px;}
  .hero-right{padding-top:0;text-align:left;}
  .mockups-wrap{max-width:620px;margin:0 auto;padding-bottom:145px;}
  .hero-mockup{margin-left:12px;}
  .hero-mockup2{top:105px;right:0;}
  .mock-body{grid-template-columns:82px minmax(0,1fr);}
  .mock-stats{grid-template-columns:repeat(2,1fr);}
  .stats-bar{display:grid;grid-template-columns:repeat(2,1fr);gap:34px 20px;padding:44px 20px;}
  .sec,.experts-sec,.reviews-sec,.faq-sec,.contact-sec,.cta-sec{padding:58px 20px;}
  .sec-title,.cta-title{font-size:30px;}
  .sec-desc{margin-bottom:38px;}
  .why-grid{grid-template-columns:1fr;max-width:560px;}
  .why-card{padding:28px 22px;}
  .skill-row,.skill-row.reverse{grid-template-columns:1fr;max-width:620px;}
  .skill-row.reverse .skill-card{order:2;}
  .skill-row.reverse .skill-img{order:1;}
  .skill-img{min-height:170px;padding:24px;}
  .skill-card{padding:28px;}
  .steps-grid{grid-template-columns:repeat(2,1fr);gap:12px;}
  .mob-sec{padding:0 20px 58px!important;}
  .mob-inner{padding:42px 28px;flex-direction:column;text-align:center;}
  .mob-btns{justify-content:center;flex-wrap:wrap;}
  .mob-right{flex:0 1 auto;width:min(100%,340px);}
  .expert-layout{grid-template-columns:1fr;gap:30px;max-width:620px;text-align:left;}
  .expert-img{height:320px;min-height:320px!important;}
  .reviews-grid{grid-template-columns:1fr;max-width:620px;}
  .partners-sec{padding:42px 20px;}
  .partner-box{padding:36px 24px;}
  .contact-grid{grid-template-columns:1fr;gap:28px;max-width:620px;}
  footer{padding:42px 20px 24px;}
  .footer-top{display:grid;grid-template-columns:repeat(2,1fr);gap:30px;}
  .footer-top>div:first-child{grid-column:1/-1;}
}

@media (max-width: 480px){
  .logo-mark{width:30px;height:30px;}
  .btn-su{max-width:150px;overflow:hidden;text-overflow:ellipsis;}
  .hero{padding-left:16px;padding-right:16px;}
  .hero h1{font-size:36px;}
  .hero p{font-size:14px;line-height:1.65;}
  .btn-hero{width:100%;justify-content:center;padding:14px 20px;}
  .mockups-wrap{padding-bottom:115px;}
  .hero-mockup{margin-left:0;}
  .hero-mockup2{top:86px;right:0;}
  .mock-topbar{padding:8px;}
  .mock-nav,.mu-name,.mock-sb{display:none;}
  .mock-body{display:block;min-height:190px;}
  .mock-main{padding:10px;}
  .mock-perf-grid{grid-template-columns:1fr;}
  .mock-perf-grid .mp-item:nth-child(2){display:none;}
  .stats-bar{padding-left:16px;padding-right:16px;}
  .sb-icon{width:46px;height:46px;}
  .sb-num{font-size:22px;}
  .sb-lbl{font-size:12px;}
  .sec,.experts-sec,.reviews-sec,.faq-sec,.contact-sec,.cta-sec{padding:48px 16px;}
  .sec-title,.cta-title{font-size:27px;}
  .sec-desc,.cta-desc{font-size:14px;}
  .skill-card{padding:24px 20px;}
  .steps-grid{grid-template-columns:1fr;}
  .step-card{padding:14px 12px;}
  .mob-sec{padding-left:16px!important;padding-right:16px!important;}
  .mob-inner{padding:34px 16px;border-radius:20px;}
  .mob-title{font-size:27px;}
  .mob-btn{width:100%;justify-content:center;}
  .phone-mock{padding:16px;}
  .expert-img{height:280px;min-height:280px!important;}
  .partners-row{align-items:flex-start;flex-direction:column;gap:16px;}
  .partner-box{padding:30px 18px;}
  .pb-title{font-size:21px;}
  .faq-q{padding:16px;font-size:14px;text-align:left;}
  .faq-a,.faq-a.open{padding-left:16px;padding-right:16px;}
  .footer-top{grid-template-columns:1fr;}
  .footer-top>div:first-child{grid-column:auto;}
  .footer-bottom{align-items:flex-start;flex-direction:column;gap:18px;}
}

::-webkit-scrollbar{width:5px;}
::-webkit-scrollbar-thumb{background:var(--p2);border-radius:3px;}
`;

const pageHtml = `<!-- NAV -->
<nav>
  <div class="nav-wrapper">
    <a class="logo" href="/">
      <div class="logo-mark"><div class="lm-h"></div><div class="lm-v"></div></div>
      <span class="logo-text">TEST<span>ORA</span></span>
    </a>
    <div class="nav-links">
      <a class="nav-link" href="#exam">Exam section</a>
      <a class="nav-link" href="#experts">Experts</a>
      <a class="nav-link" href="#reviews">Reviews</a>
      <a class="nav-link" href="#faq">FAQ</a>
      <a class="nav-link" href="#contact">Contacts</a>
    </div>
    <div class="nav-right">
      __AUTH_NAV__
    </div>
  </div>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="hero-bg"></div>
  <div class="hero-dots"></div>
  <div class="hero-inner">
    <div class="hero-left">
      <h1>Experience the real<br><span class="purple">IELTS & CEFR</span><br>exam atmosphere<br>with us!</h1>
      <p>Train with authentic IELTS & CEFR tests and achieve your target score with confidence.</p>
      <div class="hero-chips">
        <span>Fast</span>
        <div class="hero-chip-dot"></div>
        <span>Accurate</span>
        <div class="hero-chip-dot"></div>
        <span>Exam-style</span>
      </div>
      <button class="btn-hero" data-route="/practice" onclick="location.href='/practice'">Start mock test <div class="btn-hero-arrow"><i class="ti ti-arrow-right"></i></div></button>
    </div>
    <div class="hero-right">
    <div class="mockups-wrap">
    <!-- Back mockup (practice page) -->
    <div class="hero-mockup">
      <div class="mock-topbar">
        <div class="mock-logo">
          <div class="ml-mark"><div class="ml-h"></div><div class="ml-v"></div></div>
          <span class="ml-name">TEST<span>ORA</span></span>
        </div>
        <div class="mock-nav">
          <div class="mn-item active">Dashboard</div>
          <div class="mn-item">Practice</div>
          <div class="mn-item">Billing</div>
          <div class="mn-item">Settings</div>
        </div>
        <div class="mock-user">
          <div class="mu-av">RU</div>
          <span class="mu-name">Rustam Usmonov</span>
        </div>
      </div>
      <div class="mock-body">
        <div class="mock-sb">
          <div class="msb-item active"><i class="ti ti-headphones" style="font-size:12px;"></i> Reading</div>
          <div class="msb-item"><i class="ti ti-headphones" style="font-size:12px;"></i> Listening</div>
          <div class="msb-item"><i class="ti ti-pencil" style="font-size:12px;"></i> Writing</div>
          <div class="msb-item"><i class="ti ti-microphone" style="font-size:12px;"></i> Speaking</div>
          <div class="msb-item"><i class="ti ti-file-text" style="font-size:12px;"></i> Full Mock</div>
        </div>
        <div class="mock-main">
          <div class="mock-stats">
            <div class="ms-card"><div class="ms-lbl">Total tests</div><div class="ms-val">200</div><div class="ms-sub">This month</div></div>
            <div class="ms-card"><div class="ms-lbl">Completed</div><div class="ms-val">100</div><div class="ms-sub">This month</div></div>
            <div class="ms-card"><div class="ms-lbl">Progress</div><div class="ms-val">50%</div><div class="ms-sub">This month</div></div>
            <div class="ms-card"><div class="ms-lbl">Skill score</div><div class="ms-val">6.5</div><div class="ms-sub">Band score</div></div>
          </div>
          <div class="mock-perf-title"><i class="ti ti-activity" style="font-size:13px;color:var(--p);"></i> Your skill performance</div>
          <div class="mock-perf-grid">
            <div class="mp-item">
              <div class="mp-head"><span><i class="ti ti-book" style="font-size:12px;color:#378ADD;"></i> Reading</span><span class="mp-band">Band 6.5</span></div>
              <div class="mock-bars">
                <div class="mb" style="height:14px;background:#378ADD;"></div><div class="mb" style="height:16px;background:#378ADD;"></div><div class="mb" style="height:12px;background:#378ADD;"></div><div class="mb" style="height:16px;background:#378ADD;"></div><div class="mb" style="height:14px;background:#378ADD;"></div><div class="mb" style="height:16px;background:#378ADD;"></div><div class="mb" style="height:14px;background:#378ADD;"></div><div class="mb" style="height:12px;background:#378ADD;"></div><div class="mb" style="height:16px;background:#378ADD;"></div><div class="mb" style="height:6px;background:#E2DEFF;"></div><div class="mb" style="height:6px;background:#E2DEFF;"></div><div class="mb" style="height:6px;background:#E2DEFF;"></div>
              </div>
            </div>
            <div class="mp-item">
              <div class="mp-head"><span><i class="ti ti-headphones" style="font-size:12px;color:var(--p);"></i> Listening</span><span class="mp-band">Band 6.5</span></div>
              <div class="mock-bars">
                <div class="mb" style="height:14px;background:var(--p);"></div><div class="mb" style="height:16px;background:var(--p);"></div><div class="mb" style="height:14px;background:var(--p);"></div><div class="mb" style="height:16px;background:var(--p);"></div><div class="mb" style="height:14px;background:var(--p);"></div><div class="mb" style="height:16px;background:var(--p);"></div><div class="mb" style="height:14px;background:var(--p);"></div><div class="mb" style="height:16px;background:var(--p);"></div><div class="mb" style="height:6px;background:#E2DEFF;"></div><div class="mb" style="height:6px;background:#E2DEFF;"></div><div class="mb" style="height:6px;background:#E2DEFF;"></div>
              </div>
            </div>
            <div class="mp-item">
              <div class="mp-head"><span><i class="ti ti-microphone" style="font-size:12px;color:var(--green);"></i> Speaking</span><span class="mp-band">Band 6.5</span></div>
              <div class="mock-bars">
                <div class="mb" style="height:14px;background:var(--green);"></div><div class="mb" style="height:16px;background:var(--green);"></div><div class="mb" style="height:12px;background:var(--green);"></div><div class="mb" style="height:14px;background:var(--green);"></div><div class="mb" style="height:16px;background:var(--green);"></div><div class="mb" style="height:14px;background:var(--green);"></div><div class="mb" style="height:6px;background:#c5f0de;"></div><div class="mb" style="height:6px;background:#c5f0de;"></div><div class="mb" style="height:6px;background:#c5f0de;"></div>
              </div>
            </div>
            <div class="mp-item">
              <div class="mp-head"><span><i class="ti ti-pencil" style="font-size:12px;color:var(--red);"></i> Writing</span><span class="mp-band">Band 6.0</span></div>
              <div class="mock-bars">
                <div class="mb" style="height:12px;background:var(--red);"></div><div class="mb" style="height:14px;background:var(--red);"></div><div class="mb" style="height:12px;background:var(--red);"></div><div class="mb" style="height:14px;background:var(--red);"></div><div class="mb" style="height:12px;background:var(--red);"></div><div class="mb" style="height:6px;background:#fdd;"></div><div class="mb" style="height:6px;background:#fdd;"></div><div class="mb" style="height:6px;background:#fdd;"></div><div class="mb" style="height:6px;background:#fdd;"></div>
              </div>
            </div>
          </div>
          <div class="mock-continue">
            <span class="mc-text">Continue last exam</span>
            <button class="mc-btn">Start new mock exam</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Front mockup (dashboard) -->
    <div class="hero-mockup2">
      <div class="mock-topbar">
        <div class="mock-logo">
          <div class="ml-mark"><div class="ml-h"></div><div class="ml-v"></div></div>
          <span class="ml-name">TEST<span>ORA</span></span>
        </div>
        <div class="mock-nav">
          <div class="mn-item active">Dashboard</div>
          <div class="mn-item">Practice</div>
          <div class="mn-item">Billing</div>
          <div class="mn-item">Settings</div>
        </div>
        <div class="mock-user">
          <div class="mu-av">RU</div>
          <span class="mu-name">Rustam Usmonov</span>
          <i class="ti ti-chevron-down" style="font-size:10px;color:var(--muted);"></i>
        </div>
      </div>
      <div style="padding:14px 16px;">
        <div style="font-size:14px;font-weight:800;color:var(--dark);margin-bottom:12px;">Welcome Back, Rustam U. 👋</div>
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-bottom:12px;">
          <div class="ms-card"><div class="ms-lbl">Total tests</div><div class="ms-val" style="font-size:13px;">200</div><div class="ms-sub" style="color:var(--p);">+10%</div></div>
          <div class="ms-card"><div class="ms-lbl">Improvement</div><div class="ms-val" style="font-size:13px;">+20%</div><div class="ms-sub">30 days</div></div>
          <div class="ms-card"><div class="ms-lbl">Best score</div><div class="ms-val" style="font-size:13px;">6.5</div><div class="ms-sub">Current</div></div>
          <div class="ms-card"><div class="ms-lbl">Your target</div><div class="ms-val" style="font-size:13px;">7.5</div><div class="ms-sub">Target</div></div>
          <div class="ms-card"><div class="ms-lbl">Strong skill</div><div class="ms-val" style="font-size:11px;">Listening</div><div class="ms-sub">7.5</div></div>
        </div>
        <div style="font-size:11px;font-weight:700;color:var(--dark);margin-bottom:8px;display:flex;align-items:center;gap:4px;"><i class="ti ti-activity" style="color:var(--p);font-size:12px;"></i> Your skill performance</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
          <div class="mp-item">
            <div class="mp-head"><span><i class="ti ti-book" style="font-size:11px;color:#378ADD;"></i> Reading</span><span class="mp-band">Band 6.5</span></div>
            <div class="mock-bars"><div class="mb" style="height:14px;background:#378ADD;"></div><div class="mb" style="height:16px;background:#378ADD;"></div><div class="mb" style="height:12px;background:#378ADD;"></div><div class="mb" style="height:16px;background:#378ADD;"></div><div class="mb" style="height:14px;background:#378ADD;"></div><div class="mb" style="height:16px;background:#378ADD;"></div><div class="mb" style="height:14px;background:#378ADD;"></div><div class="mb" style="height:12px;background:#378ADD;"></div><div class="mb" style="height:16px;background:#378ADD;"></div><div class="mb" style="height:6px;background:#E2DEFF;"></div><div class="mb" style="height:6px;background:#E2DEFF;"></div><div class="mb" style="height:6px;background:#E2DEFF;"></div></div>
          </div>
          <div class="mp-item">
            <div class="mp-head"><span><i class="ti ti-headphones" style="font-size:11px;color:var(--p);"></i> Listening</span><span class="mp-band">Band 6.5</span></div>
            <div class="mock-bars"><div class="mb" style="height:14px;background:var(--p);"></div><div class="mb" style="height:16px;background:var(--p);"></div><div class="mb" style="height:14px;background:var(--p);"></div><div class="mb" style="height:16px;background:var(--p);"></div><div class="mb" style="height:14px;background:var(--p);"></div><div class="mb" style="height:16px;background:var(--p);"></div><div class="mb" style="height:14px;background:var(--p);"></div><div class="mb" style="height:16px;background:var(--p);"></div><div class="mb" style="height:6px;background:#E2DEFF;"></div><div class="mb" style="height:6px;background:#E2DEFF;"></div><div class="mb" style="height:6px;background:#E2DEFF;"></div></div>
          </div>
          <div class="mp-item">
            <div class="mp-head"><span><i class="ti ti-microphone" style="font-size:11px;color:var(--green);"></i> Speaking</span><span class="mp-band">Band 6.5</span></div>
            <div class="mock-bars"><div class="mb" style="height:14px;background:var(--green);"></div><div class="mb" style="height:16px;background:var(--green);"></div><div class="mb" style="height:12px;background:var(--green);"></div><div class="mb" style="height:14px;background:var(--green);"></div><div class="mb" style="height:16px;background:var(--green);"></div><div class="mb" style="height:14px;background:var(--green);"></div><div class="mb" style="height:6px;background:#c5f0de;"></div><div class="mb" style="height:6px;background:#c5f0de;"></div><div class="mb" style="height:6px;background:#c5f0de;"></div></div>
          </div>
          <div class="mp-item">
            <div class="mp-head"><span><i class="ti ti-pencil" style="font-size:11px;color:var(--red);"></i> Writing</span><span class="mp-band">Band 6.5</span></div>
            <div class="mock-bars"><div class="mb" style="height:14px;background:var(--red);"></div><div class="mb" style="height:16px;background:var(--red);"></div><div class="mb" style="height:14px;background:var(--red);"></div><div class="mb" style="height:16px;background:var(--red);"></div><div class="mb" style="height:14px;background:var(--red);"></div><div class="mb" style="height:16px;background:var(--red);"></div><div class="mb" style="height:14px;background:var(--red);"></div><div class="mb" style="height:6px;background:#fdd;"></div><div class="mb" style="height:6px;background:#fdd;"></div></div>
          </div>
        </div>
        <div class="mock-continue">
          <span class="mc-text">Continue last exam</span>
          <button class="mc-btn">Start new mock exam</button>
        </div>
      </div>
    </div>
    </div><!-- end mockups-wrap -->
    </div><!-- end hero-right -->
  </div><!-- end hero-inner -->
</section>

<!-- STATS BAR -->
<div class="stats-bar">
  <div class="sb-item">
    <div class="sb-icon"><i class="ti ti-file-text" style="color:var(--p);font-size:22px;"></i></div>
    <div class="sb-num">120+</div>
    <div class="sb-lbl">Upcoming exam materials</div>
  </div>
  <div class="sb-item">
    <div class="sb-icon"><i class="ti ti-clock" style="color:var(--p);font-size:22px;"></i></div>
    <div class="sb-num">24/7</div>
    <div class="sb-lbl">Access Anywhere</div>
  </div>
  <div class="sb-item">
    <div class="sb-icon"><i class="ti ti-school" style="color:var(--p);font-size:22px;"></i></div>
    <div class="sb-num">IELTS & CEFR</div>
    <div class="sb-lbl">The choice is yours!</div>
  </div>
</div>

<!-- WHY CHOOSE -->
<section class="sec sec-center" id="exam">
  <div class="sec-tag">Why Choose Us?</div>
  <div class="sec-title">Why Choose Our Platform?</div>
  <div class="sec-desc">Get the authentic computer-based IELTS & CEFR experience with advanced features built to help you succeed.</div>
  <div class="why-grid">
    <div class="why-card">
      <div class="why-icon"><i class="ti ti-layout-grid" style="color:var(--p);font-size:24px;"></i></div>
      <h3>Authentic Interface</h3>
      <p>Practice on the same interface as the real computer-delivered exams.</p>
    </div>
    <div class="why-card">
      <div class="why-icon"><i class="ti ti-clock" style="color:var(--p);font-size:24px;"></i></div>
      <h3>Real Exam Timing</h3>
      <p>Accurate test timing with countdowns and smooth section changes.</p>
    </div>
    <div class="why-card">
      <div class="why-icon"><i class="ti ti-book" style="color:var(--p);font-size:24px;"></i></div>
      <h3>Skill-based lessons</h3>
      <p>Access to targeted lessons to improve each IELTS skill.</p>
    </div>
  </div>
</section>

<!-- EXAM SKILLS -->
<section class="sec skills-bg sec-center">
  <div class="sec-tag">Exam section</div>
  <div class="sec-title">Practise and Improve All Four Core English Skills</div>
  <div class="sec-desc">Practise Listening, Reading, Speaking, and Writing in a real exam-style environment with accurate scoring and clear feedback.</div>

  <div class="skill-row">
    <div class="skill-img" style="background:#EEF0FF;">
      <img src="/pr-listening.png" style="width:140px;object-fit:contain;" onerror="this.style.display='none'">
    </div>
    <div class="skill-card">
      <div class="skill-badge"><i class="ti ti-headphones" style="color:var(--p);"></i><span>Listening</span></div>
      <h3>Listening</h3>
      <p>Exam recordings, all four parts and strict timing just like the real test!</p>
      <button class="btn-journey" style="background:var(--p);color:#fff;" data-route="/practice?tab=listening" onclick="location.href='/practice?tab=listening'">Start Journey <i class="ti ti-arrow-right"></i></button>
    </div>
  </div>

  <div class="skill-row reverse" style="margin-top:20px;">
    <div class="skill-card">
      <div class="skill-badge"><i class="ti ti-book" style="color:#378ADD;"></i><span>Reading</span></div>
      <h3>Reading</h3>
      <p>Academic and exam-style passages with timed questions and detailed answer explanations.</p>
      <button class="btn-journey" style="background:#378ADD;color:#fff;" data-route="/practice?tab=reading" onclick="location.href='/practice?tab=reading'">Start Journey <i class="ti ti-arrow-right"></i></button>
    </div>
    <div class="skill-img" style="background:#EBF5FF;">
      <img src="/pr-reading.png" style="width:140px;object-fit:contain;" onerror="this.style.display='none'">
    </div>
  </div>

  <div class="skill-row" style="margin-top:20px;">
    <div class="skill-img" style="background:#FCEBEB;">
      <img src="/pr-writing.png" style="width:140px;object-fit:contain;" onerror="this.style.display='none'">
    </div>
    <div class="skill-card">
      <div class="skill-badge"><i class="ti ti-pencil" style="color:var(--red);"></i><span>Writing</span></div>
      <h3>Writing</h3>
      <p>Task-based writing assessed using real band descriptors and actionable improvement tips.</p>
      <button class="btn-journey" style="background:var(--red);color:#fff;" data-route="/practice?tab=writing" onclick="location.href='/practice?tab=writing'">Start Journey <i class="ti ti-arrow-right"></i></button>
    </div>
  </div>

  <div class="skill-row reverse" style="margin-top:20px;">
    <div class="skill-card">
      <div class="skill-badge"><i class="ti ti-microphone" style="color:var(--green);"></i><span>Speaking</span></div>
      <h3>Speaking</h3>
      <p>Examiner-style questions with performance-based feedback to boost your confidence.</p>
      <button class="btn-journey" style="background:var(--green);color:#fff;" data-route="/practice?tab=speaking" onclick="location.href='/practice?tab=speaking'">Start Journey <i class="ti ti-arrow-right"></i></button>
    </div>
    <div class="skill-img" style="background:#E1F5EE;">
      <img src="/pr-speaking.png" style="width:140px;object-fit:contain;" onerror="this.style.display='none'">
    </div>
  </div>
</section>

<!-- HOW IT WORKS -->
<section class="sec sec-center" style="background:var(--white);">
  <div class="sec-tag">How it works</div>
  <div class="sec-title">Your Path to Success in 4 Simple Steps</div>
  <div class="sec-desc">Select your exam, practice in real-time, and get expert insights to boost your score.</div>
  <div class="steps-grid">
    <div class="step-card"><div class="step-num">1</div><h3>Select an exam</h3><p>Choose IELTS or CEFR based on your goal.</p></div>
    <div class="step-card"><div class="step-num">2</div><h3>Take the mock test</h3><p>Complete the test in real exam-style, timed conditions.</p></div>
    <div class="step-card"><div class="step-num">3</div><h3>Get your results</h3><p>Score estimates and detailed performance insights.</p></div>
    <div class="step-card"><div class="step-num">4</div><h3>Improve weak areas</h3><p>Follow clear, personalized recommendations to score higher.</p></div>
  </div>
</section>

<!-- MOBILE APP -->
<section class="mob-sec" style="padding:0 40px 80px;background:var(--white);">
  <div class="mob-inner">
    <div class="mob-left">
      <div class="mob-title">Full practice tests in your pocket.</div>
      <div class="mob-desc">Take full-length English practice tests and improve your skills directly on your mobile device.</div>
      <div class="mob-btns">
        <button class="mob-btn"><i class="ti ti-brand-google-play" style="font-size:20px;"></i><span><span class="mob-btn-label">Download</span><span class="mob-btn-name">Google Play</span></span></button>
        <button class="mob-btn"><i class="ti ti-brand-apple" style="font-size:20px;"></i><span><span class="mob-btn-label">Download</span><span class="mob-btn-name">App Store</span></span></button>
      </div>
    </div>
    <div class="mob-right">
      <div class="phone-mock">
        <div class="pm-header">
          <div><div class="pm-greeting">Good morning ☀️</div><div class="pm-name">Rustam Usmonov</div></div>
          <div style="display:flex;align-items:center;gap:6px;background:var(--p3);border-radius:10px;padding:4px 10px;font-size:11px;font-weight:700;color:var(--p);"><i class="ti ti-coin" style="font-size:13px;"></i> 120</div>
        </div>
        <div class="pm-target">
          <div class="pm-t-lbl">Target Score</div>
          <div class="pm-t-val">8.5</div>
          <div class="pm-t-bar"><div class="pm-t-fill"></div></div>
          <div class="pm-t-sub">Best score: 6.5 &nbsp;&nbsp; 87% there</div>
        </div>
        <div class="pm-skills">Quick Practice</div>
        <div class="pm-skills-grid">
          <div class="pm-skill"><div class="pm-sk-lbl">🎧 Listening</div><div class="pm-sk-val">6.5<span style="font-size:9px;color:var(--muted);">/9.0</span></div><div class="pm-sk-bar" style="background:var(--p);width:72%;"></div></div>
          <div class="pm-skill"><div class="pm-sk-lbl">📖 Reading</div><div class="pm-sk-val">7<span style="font-size:9px;color:var(--muted);">/9.0</span></div><div class="pm-sk-bar" style="background:#378ADD;width:77%;"></div></div>
          <div class="pm-skill"><div class="pm-sk-lbl">✍️ Writing</div><div class="pm-sk-val">6<span style="font-size:9px;color:var(--muted);">/9.0</span></div><div class="pm-sk-bar" style="background:var(--red);width:66%;"></div></div>
          <div class="pm-skill"><div class="pm-sk-lbl">🎤 Speaking</div><div class="pm-sk-val">7.5<span style="font-size:9px;color:var(--muted);">/9.0</span></div><div class="pm-sk-bar" style="background:var(--green);width:83%;"></div></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- EXPERTS -->
<section class="experts-sec sec-center" id="experts">
  <div class="sec-tag">Meet our team</div>
  <div class="sec-title">The Experts Behind Your Success</div>
  <div class="sec-desc">A passionate group of educators and developers working together to help you achieve your dream score.</div>
  <div class="expert-layout">
    <div class="expert-img" style="background:linear-gradient(160deg,#f0eeff 0%,#ddd8ff 100%);align-items:center;justify-content:center;min-height:380px;">
      <div style="text-align:center;">
        <div style="width:180px;height:180px;border-radius:50%;background:var(--p3);border:4px solid var(--border);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:56px;font-weight:800;color:var(--p);">RU</div>
        <div class="expert-name">Rustam Usmonov</div>
        <div class="expert-role">IELTS expert</div>
        <div style="margin-top:10px;">
          <div class="expert-tg"><i class="ti ti-brand-telegram" style="font-size:16px;"></i></div>
        </div>
      </div>
    </div>
    <div style="text-align:left;">
      <p class="expert-desc">Multi-Level 74 & IELTS 8.5 holder, original content creator and the most popular teacher in the field.</p>
      <div class="expert-mini">
        <div class="em-av">ZR</div>
        <div>
          <div class="em-name">Zuhriddin Rajabov</div>
          <div class="em-role">IELTS Expert</div>
        </div>
        <div class="expert-tg" style="margin-left:auto;"><i class="ti ti-brand-telegram" style="font-size:16px;"></i></div>
      </div>
    </div>
  </div>
</section>

<!-- PARTNERS -->
<section class="partners-sec">
  <div class="partners-label">Collaborating Organizations</div>
  <div class="partners-row">
    <div class="partner-item"><div class="partner-logo"><i class="ti ti-building" style="color:var(--p);font-size:16px;"></i></div>Cambridge Innovation School</div>
    <div class="partner-item"><div class="partner-logo"><i class="ti ti-star" style="color:var(--p);font-size:16px;"></i></div>Dream school</div>
    <div class="partner-item"><div class="partner-logo"><i class="ti ti-school" style="color:var(--p);font-size:16px;"></i></div>4K English Academy</div>
    <div class="partner-item"><div class="partner-logo"><i class="ti ti-award" style="color:var(--p);font-size:16px;"></i></div>Admire</div>
  </div>
  <div class="partner-box">
    <div class="pb-title">Become a Testora Partner</div>
    <div class="pb-desc">Looking to offer high-quality mock exams to your community? Let's join forces and help students reach their target scores.</div>
    <button class="btn-partner">Partner With Us</button>
  </div>
</section>

<!-- REVIEWS -->
<section class="reviews-sec sec-center" id="reviews">
  <div class="sec-tag">Reviews</div>
  <div class="sec-title">Trusted by Thousands of Students</div>
  <div class="sec-desc">See how our realistic mock tests have helped learners worldwide achieve their dream.</div>
  <div class="reviews-grid">
    <div class="rv-card"><p class="rv-text">Platforma zo'r ekan, faqat jump qilmasdan har bir testni alohida ishlash imkoni bo'lsa yangi bo'lardi.</p><div class="rv-user"><div class="rv-av"><i class="ti ti-user"></i></div><div><div class="rv-name">Anonym</div></div></div></div>
    <div class="rv-card"><p class="rv-text">Assalomu aleykum teacher yaxshimisiz. intensive reading 5 dagi o'quvchiman. zo'r chiqibdi teacher xuddi imtixondagidek. dizayni ham zo'r logosi undanam zo'r 🤩</p><div class="rv-user"><div class="rv-av"><i class="ti ti-user"></i></div><div><div class="rv-name">Anonym</div></div></div></div>
    <div class="rv-card"><p class="rv-text">Platformaga omad zor ishlayapti. Chiqqan javoblarga qarab ozi score ham berarkan imtihonga tayyorlanwga zor platforma bopti</p><div class="rv-user"><div class="rv-av"><i class="ti ti-user"></i></div><div><div class="rv-name">Shag'zoda</div></div></div></div>
    <div class="rv-card"><p class="rv-text">score up platformasi juda ham zo'r, qulayliklari tomonidan har qanaqa passgaeni alohida ishlash imkoni bor. Manga juda ham yoqdi</p><div class="rv-user"><div class="rv-av"><i class="ti ti-user"></i></div><div><div class="rv-name">Anonym</div></div></div></div>
  </div>
</section>

<!-- FAQ -->
<section class="faq-sec sec-center" id="faq">
  <div class="sec-tag">FAQ</div>
  <div class="sec-title">Frequently Asked Questions</div>
  <div class="sec-desc">Everything you need to know about our platform and how we help you succeed.</div>
  <div class="faq-list">
    <div class="faq-item"><div class="faq-q" onclick="tog(this)"><span>1. Which exams can I practise on this platform?</span><i class="ti ti-plus faq-icon"></i></div><div class="faq-a">You can practise IELTS Academic, IELTS General Training, and CEFR (B1, B2, C1, C2) exams on Testora.</div></div>
    <div class="faq-item"><div class="faq-q" onclick="tog(this)"><span>2. What kind of materials are used?</span><i class="ti ti-plus faq-icon"></i></div><div class="faq-a">We use authentic, exam-style materials developed by certified IELTS instructors to closely mirror real test conditions.</div></div>
    <div class="faq-item"><div class="faq-q" onclick="tog(this)"><span>3. Are the mock tests timed?</span><i class="ti ti-plus faq-icon"></i></div><div class="faq-a">Yes, all mock tests are fully timed with accurate countdowns matching real exam durations for each section.</div></div>
    <div class="faq-item"><div class="faq-q" onclick="tog(this)"><span>4. How soon will I get my results?</span><i class="ti ti-plus faq-icon"></i></div><div class="faq-a">Results are available immediately after you complete the test, including band score estimates and skill breakdowns.</div></div>
    <div class="faq-item"><div class="faq-q" onclick="tog(this)"><span>5. Can I retake the tests to improve my score?</span><i class="ti ti-plus faq-icon"></i></div><div class="faq-a">Absolutely! You can retake any test as many times as you like and track your improvement over time.</div></div>
  </div>
</section>

<!-- CTA -->
<section class="cta-sec">
  <div class="cta-dots"></div>
  <div class="cta-content">
    <div class="cta-title">Ready to Ace Your Exam?</div>
    <div class="cta-desc">Don't leave your results to chance. Start practising with the most realistic IELTS & CEFR simulation today and hit your target score.</div>
    <button class="btn-cta" data-route="/practice" onclick="location.href='/practice'">Start Free Mock Test</button>
  </div>
</section>

<!-- CONTACT -->
<section class="contact-sec" id="contact">
  <div class="sec-tag sec-center" style="display:block;text-align:center;margin-bottom:12px;">Contacts</div>
  <div class="sec-title sec-center" style="text-align:center;margin-bottom:48px;">Get in Touch</div>
  <div class="contact-grid">
    <div>
      <h3 style="font-size:18px;font-weight:700;color:var(--dark);margin-bottom:22px;">We're Here to Support You</h3>
      <div class="c-item"><div class="c-icon"><i class="ti ti-mail" style="color:var(--p);font-size:20px;"></i></div><div><div class="c-label">Email</div><div class="c-val">hello@testora.com</div></div></div>
      <div class="c-item"><div class="c-icon"><i class="ti ti-phone" style="color:var(--p);font-size:20px;"></i></div><div><div class="c-label">Phone</div><div class="c-val">+998 99 000 0000</div></div></div>
      <div class="c-item"><div class="c-icon"><i class="ti ti-map-pin" style="color:var(--p);font-size:20px;"></i></div><div><div class="c-label">Address</div><div class="c-val">Tashkent, Uzbekistan</div></div></div>
      <div class="c-item"><div class="c-icon"><i class="ti ti-brand-telegram" style="color:var(--p);font-size:20px;"></i></div><div><div class="c-label">Telegram</div><div class="c-val">@testora_uz</div></div></div>
    </div>
    <div>
      <h3 style="font-size:18px;font-weight:700;color:var(--dark);margin-bottom:22px;">Send us a message</h3>
      <input class="cf-input" type="text" placeholder="Your name">
      <input class="cf-input" type="email" placeholder="Your email">
      <textarea class="cf-input cf-ta" placeholder="Your message"></textarea>
      <button class="btn-send">Send Message</button>
    </div>
  </div>
</section>

<!-- FOOTER -->
<footer>
  <div class="footer-top">
    <div>
      <div class="footer-logo">
        <div class="fl-mark"><div class="fl-h"></div><div class="fl-v"></div></div>
        <span class="fl-name">TEST<span>ORA</span></span>
      </div>
      <p class="footer-desc">The most accurate way to prepare for IELTS, CEFR. Simple. Fast. Reliable.</p>
    </div>
    <div class="footer-links">
      <h4>Navigation</h4>
      <a href="#exam">Exam section</a>
      <a href="#">How it works</a>
      <a href="#reviews">Reviews</a>
      <a href="#faq">FAQ</a>
      <a href="#contact">Contacts</a>
    </div>
    <div class="footer-links">
      <h4>Exams</h4>
      <a href="#">IELTS Academic</a>
      <a href="#">IELTS General</a>
      <a href="#">CEFR B2</a>
      <a href="#">CEFR C1</a>
    </div>
    <div class="footer-links">
      <h4>Support</h4>
      <a href="#">Help Center</a>
      <a href="#">Privacy Policy</a>
      <a href="#">Terms of Use</a>
      <a href="#">Partner with us</a>
    </div>
  </div>
  <div class="footer-bottom">
    <div>
      <p>2026 TESTORA. All rights reserved. Designed to help you succeed.</p>
      <p style="margin-top:4px;">Made with passion for IELTS learners worldwide.</p>
    </div>
    <div class="footer-socials">
      <div class="soc"><i class="ti ti-brand-instagram"></i></div>
      <div class="soc"><i class="ti ti-brand-telegram"></i></div>
      <div class="soc"><i class="ti ti-headphones"></i></div>
      <div class="soc"><i class="ti ti-brand-facebook"></i></div>
    </div>
  </div>
</footer>`;

const faqScript = `
function tog(el){
  var icon=el.querySelector('.faq-icon');
  var ans=el.nextElementSibling;
  var open=el.classList.contains('open');
  document.querySelectorAll('.faq-q').forEach(function(q){
    q.classList.remove('open');
    q.querySelector('.faq-icon').classList.remove('open');
    q.nextElementSibling.classList.remove('open');
  });
  if(!open){el.classList.add('open');icon.classList.add('open');ans.classList.add('open');}
}
`;

function readAccessFlag() {
  if (typeof window === "undefined") return false;

  try {
    return window.sessionStorage.getItem("testora_access_ok") === "true";
  } catch {
    return false;
  }
}

function hasStoredSupabaseSession() {
  if (typeof window === "undefined") return false;

  try {
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index) || "";
      if (!key.startsWith("sb-") || !key.endsWith("-auth-token")) continue;

      const raw = window.localStorage.getItem(key) || "";
      if (raw.includes("access_token") || raw.includes("currentSession")) {
        return true;
      }
    }
  } catch {
    return false;
  }

  return false;
}

function setAuthFlags(active: boolean) {
  if (typeof window === "undefined") return;

  try {
    if (active) {
      window.sessionStorage.setItem("testora_access_ok", "true");
      return;
    }

    window.sessionStorage.removeItem("testora_access_ok");
    window.sessionStorage.removeItem("testora_admin_ok");
  } catch {
    // Storage blocked bo'lsa ham landing ishlaydi.
  }
}

export default function Home() {
  const initialLoggedIn = readAccessFlag() || hasStoredSupabaseSession();

  const [isLoggedIn, setIsLoggedIn] = useState(initialLoggedIn);

  useEffect(() => {
    let mounted = true;

    function applyFastState() {
      const active = readAccessFlag() || hasStoredSupabaseSession();

      if (!mounted) return active;

      setIsLoggedIn(active);

      if (active) {
        setAuthFlags(true);
      }

      return active;
    }

    async function checkSession() {
      const fastActive = applyFastState();

      try {
        const sessionResult = await Promise.race([
          supabase.auth.getSession(),
          new Promise<null>((resolve) => {
            window.setTimeout(() => resolve(null), 1200);
          }),
        ]);

        if (!mounted || sessionResult === null) {
          return;
        }

        const active = Boolean(sessionResult.data.session?.user) || fastActive;
        setIsLoggedIn(active);
        setAuthFlags(active);
      } catch {
        if (!mounted) return;
        setIsLoggedIn(fastActive);
      }
    }

    checkSession();

    function handlePageShow() {
      checkSession();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        checkSession();
      }
    }

    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      const active = Boolean(session?.user) || hasStoredSupabaseSession();
      setIsLoggedIn(active);
      setAuthFlags(active);
    });

    return () => {
      mounted = false;
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleRouteClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement).closest<HTMLElement>("[data-route]");
      if (!target) return;

      const route = target.dataset.route;
      if (route) {
        window.location.href = route;
      }
    };

    document.addEventListener("click", handleRouteClick);

    return () => {
      document.removeEventListener("click", handleRouteClick);
    };
  }, []);

  const authNav = isLoggedIn
    ? `<button class="btn-su" data-route="/dashboard" onclick="location.href='/dashboard'">Go Dashboard</button>`
    : `<button class="btn-si" data-route="/login" onclick="location.href='/login'">Sign in</button><button class="btn-su" data-route="/register" onclick="location.href='/register'">Sign up for free</button>`;

  const renderedHtml = pageHtml.replace("__AUTH_NAV__", authNav);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <div
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />

      <Script id="testora-faq-script" strategy="afterInteractive">
        {faqScript}
      </Script>
    </>
  );
}
