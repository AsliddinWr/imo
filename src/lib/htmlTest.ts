export const HTML_TEST_PREFIX = "__TESTORA_HTML_TEST_V1__";
export const HTML_WATCHER_SOURCE = "testora-html-watcher";

export type HtmlTestPayload = {
  mode: "html";
  fileName: string;
  html: string;
  note?: string;
  uploadedAt?: string;
};

export type HtmlWatcherMeta = {
  testId: string;
  testTitle: string;
  skill: string;
  durationMinutes?: number | null;
  fileName?: string;
};

export type HtmlWatcherResult = {
  attempt_id?: string;
  event_source?: string;
  status?: string;
  student_name?: string;
  candidate_id?: string;
  score?: number;
  total?: number;
  raw_40?: number;
  band?: string;
  answered_count?: number;
  answers?: Record<string, unknown>;
  analysis_rows?: unknown[];
  analysis_text?: string;
  report_for_docs?: string;
  started_at?: string;
  completed_at?: string;
  spent_time_seconds?: number;
  remaining_time_seconds?: number;
  duration_seconds?: number;
  security_reason?: string;
  blocked_reason?: string;
  note?: string;
  url?: string;
  title?: string;
  file_name?: string;
};

export type HtmlWatcherMessage = {
  source: typeof HTML_WATCHER_SOURCE;
  event: "started" | "progress" | "result" | "blocked" | "security" | "error";
  testId: string;
  payload: HtmlWatcherResult;
};

export function isHtmlTestDescription(description?: string | null) {
  return String(description || "").startsWith(HTML_TEST_PREFIX);
}

export function parseHtmlTestDescription(
  description?: string | null
): HtmlTestPayload | null {
  const text = String(description || "");
  if (!text.startsWith(HTML_TEST_PREFIX)) return null;

  try {
    const raw = text.slice(HTML_TEST_PREFIX.length);
    const parsed = JSON.parse(raw) as Partial<HtmlTestPayload>;

    if (parsed.mode !== "html" || typeof parsed.html !== "string") {
      return null;
    }

    return {
      mode: "html",
      fileName:
        typeof parsed.fileName === "string" && parsed.fileName.trim()
          ? parsed.fileName.trim()
          : "uploaded-test.html",
      html: parsed.html,
      note: typeof parsed.note === "string" ? parsed.note : "",
      uploadedAt:
        typeof parsed.uploadedAt === "string" ? parsed.uploadedAt : undefined,
    };
  } catch {
    return null;
  }
}

export function createHtmlTestDescription(params: {
  fileName: string;
  html: string;
  note?: string;
}) {
  const payload: HtmlTestPayload = {
    mode: "html",
    fileName: params.fileName || "uploaded-test.html",
    html: params.html,
    note: params.note || "",
    uploadedAt: new Date().toISOString(),
  };

  return `${HTML_TEST_PREFIX}${JSON.stringify(payload)}`;
}

export function getVisibleTestDescription(description?: string | null) {
  const htmlTest = parseHtmlTestDescription(description);
  if (htmlTest) {
    return htmlTest.note || `Uploaded HTML file: ${htmlTest.fileName}`;
  }

  return description || "";
}

export function getHtmlTestFileName(description?: string | null) {
  return parseHtmlTestDescription(description)?.fileName || "";
}

export function estimateAcademicReadingBand(score?: number, total?: number) {
  const safeScore = Number(score) || 0;
  const safeTotal = Number(total) || 0;

  if (safeTotal <= 0) return { raw40: 0, band: "0" };

  const raw40 = Math.max(
    0,
    Math.min(40, Math.round((safeScore / safeTotal) * 40))
  );

  let band = "2.0";
  if (raw40 >= 39) band = "9.0";
  else if (raw40 >= 37) band = "8.5";
  else if (raw40 >= 35) band = "8.0";
  else if (raw40 >= 33) band = "7.5";
  else if (raw40 >= 30) band = "7.0";
  else if (raw40 >= 27) band = "6.5";
  else if (raw40 >= 23) band = "6.0";
  else if (raw40 >= 19) band = "5.5";
  else if (raw40 >= 15) band = "5.0";
  else if (raw40 >= 13) band = "4.5";
  else if (raw40 >= 10) band = "4.0";
  else if (raw40 >= 8) band = "3.5";
  else if (raw40 >= 6) band = "3.0";
  else if (raw40 >= 4) band = "2.5";

  return { raw40, band };
}

function escapeScriptJson(value: unknown) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function buildHtmlWatcherScript(meta: HtmlWatcherMeta) {
  const durationSeconds = Math.max(0, Number(meta.durationMinutes || 0) * 60);
  const safeMeta = escapeScriptJson({
    ...meta,
    durationSeconds,
    source: HTML_WATCHER_SOURCE,
  });

  return `<script data-testora-html-watcher="true">
(function(){
  'use strict';
  var META=${safeMeta};
  var SOURCE=META.source;
  var startedAt=new Date();
  var attemptId='html-'+META.testId+'-'+Date.now()+'-'+Math.random().toString(36).slice(2,8);
  var lastProgress=0;
  var resultSent=false;

  function numberValue(value,fallback){
    var n=Number(value);
    return Number.isFinite(n)?n:(fallback||0);
  }

  function parseTimer(text){
    var clean=String(text||'').trim();
    var parts=clean.split(':').map(function(item){return Number(item)||0});
    if(parts.length===3)return (parts[0]*3600)+(parts[1]*60)+parts[2];
    if(parts.length===2)return (parts[0]*60)+parts[1];
    return 0;
  }

  function getRemainingSeconds(){
    var timer=document.getElementById('timer')||document.querySelector('[data-timer], .timer');
    return timer?parseTimer(timer.textContent):0;
  }

  function inferDurationSeconds(){
    if(numberValue(META.durationSeconds,0)>0)return numberValue(META.durationSeconds,0);
    var remaining=getRemainingSeconds();
    if(remaining>0)return remaining;
    return 0;
  }

  function normalizeStatus(status){
    var clean=String(status||'completed').toLowerCase();
    if(clean.indexOf('block')>=0)return 'security_blocked';
    if(clean.indexOf('auto')>=0)return 'auto_submitted';
    if(clean.indexOf('submit')>=0||clean.indexOf('complete')>=0)return 'completed';
    return status||'completed';
  }

  function estimateBand(score,total){
    score=numberValue(score,0); total=numberValue(total,0);
    if(total<=0)return {raw_40:0,band:'0'};
    var raw40=Math.max(0,Math.min(40,Math.round((score/total)*40)));
    var band='2.0';
    if(raw40>=39)band='9.0'; else if(raw40>=37)band='8.5'; else if(raw40>=35)band='8.0'; else if(raw40>=33)band='7.5'; else if(raw40>=30)band='7.0'; else if(raw40>=27)band='6.5'; else if(raw40>=23)band='6.0'; else if(raw40>=19)band='5.5'; else if(raw40>=15)band='5.0'; else if(raw40>=13)band='4.5'; else if(raw40>=10)band='4.0'; else if(raw40>=8)band='3.5'; else if(raw40>=6)band='3.0'; else if(raw40>=4)band='2.5';
    return {raw_40:raw40,band:band};
  }

  function collectAnswers(){
    var answers={};
    var names={};
    Array.prototype.forEach.call(document.querySelectorAll('input[name], textarea[name], select[name]'),function(el){
      var name=el.name;
      if(!name)return;
      names[name]=true;
      if(el.type==='radio'){
        if(el.checked)answers[name]=el.value;
      }else if(el.type==='checkbox'){
        if(!Array.isArray(answers[name]))answers[name]=[];
        if(el.checked)answers[name].push(el.value);
      }else{
        answers[name]=String(el.value||'').trim();
      }
    });
    Object.keys(names).forEach(function(name){
      if(answers[name]===undefined)answers[name]='';
    });
    return answers;
  }

  function collectProgress(extra){
    var answers=collectAnswers();
    var answeredCount=Object.keys(answers).filter(function(key){
      var value=answers[key];
      if(Array.isArray(value))return value.length>0;
      return String(value||'').trim()!=='';
    }).length;
    var navCount=document.querySelectorAll('.q-nav').length;
    var total=numberValue(extra&&extra.total,0)||navCount||Object.keys(answers).length;
    var duration=inferDurationSeconds();
    var remaining=getRemainingSeconds();
    var elapsed=Math.max(0,Math.round((Date.now()-startedAt.getTime())/1000));
    var spent=duration>0?Math.max(0,duration-remaining):elapsed;
    return Object.assign({
      attempt_id:attemptId,
      event_source:'html_watcher',
      test_id:META.testId,
      test_title:META.testTitle,
      skill:META.skill,
      file_name:META.fileName||'',
      answers:answers,
      answered_count:answeredCount,
      total:total,
      started_at:startedAt.toISOString(),
      duration_seconds:duration,
      remaining_time_seconds:remaining,
      spent_time_seconds:spent,
      url:location.href,
      title:document.title||META.testTitle||''
    },extra||{});
  }

  function post(event,payload){
    try{
      window.parent.postMessage({source:SOURCE,event:event,testId:META.testId,payload:payload},'*');
    }catch(e){}
  }

  function sendProgress(force){
    var now=Date.now();
    if(!force && now-lastProgress<900)return;
    lastProgress=now;
    post('progress',collectProgress({status:'in_progress'}));
  }

  function sendResult(raw,eventName){
    var payload=raw&&typeof raw==='object'?Object.assign({},raw):{};
    var score=numberValue(payload.score,0);
    var total=numberValue(payload.total,0)||document.querySelectorAll('.q-nav').length||Object.keys(collectAnswers()).length;
    var estimated=estimateBand(score,total);
    var progress=collectProgress({
      status:normalizeStatus(payload.status),
      score:score,
      total:total,
      raw_40:numberValue(payload.raw_40,estimated.raw_40),
      band:String(payload.band||estimated.band),
      completed_at:payload.completed_at_iso||payload.completed_at||new Date().toISOString(),
      student_name:payload.student_name||payload.name||'',
      candidate_id:payload.candidate_id||payload.student_id||payload.id||'',
      analysis_rows:payload.analysis_rows||[],
      analysis_text:payload.analysis_text||payload.report_for_docs||'',
      report_for_docs:payload.report_for_docs||payload.analysis_text||'',
      security_reason:payload.security_reason||payload.blocked_reason||payload.note||''
    });
    progress.answers=payload.answers||progress.answers;
    if(resultSent && eventName!=='blocked')return;
    resultSent=true;
    post(eventName||((String(progress.status).indexOf('block')>=0)?'blocked':'result'),progress);
  }

  window.__TESTORA_SEND_RESULT__=function(payload){sendResult(payload,'result')};
  window.__TESTORA_SEND_PROGRESS__=function(payload){post('progress',collectProgress(payload||{}))};

  var originalFetch=window.fetch;
  if(typeof originalFetch==='function'){
    window.fetch=function(input,init){
      try{
        var body=init&&init.body;
        if(typeof body==='string'){
          var parsed=JSON.parse(body);
          if(parsed && typeof parsed==='object' && parsed.score!==undefined && parsed.total!==undefined){
            setTimeout(function(){sendResult(parsed,String(parsed.status||'').indexOf('block')>=0?'blocked':'result')},0);
          }
        }
      }catch(e){}
      return originalFetch.apply(this,arguments);
    };
  }

  document.addEventListener('input',function(){sendProgress(false)},true);
  document.addEventListener('change',function(){sendProgress(false)},true);
  window.addEventListener('beforeunload',function(){sendProgress(true)});
  window.addEventListener('load',function(){post('started',collectProgress({status:'started'}));sendProgress(true)});
  setInterval(function(){if(!resultSent)sendProgress(false)},2500);
})();
<\/script>`;
}

export function injectHtmlTestWatcher(html: string, meta: HtmlWatcherMeta) {
  const original = String(html || "");
  const script = buildHtmlWatcherScript(meta);

  if (original.includes("data-testora-html-watcher")) return original;

  if (/<\/body>/i.test(original)) {
    return original.replace(/<\/body>/i, `${script}</body>`);
  }

  return `${original}${script}`;
}
