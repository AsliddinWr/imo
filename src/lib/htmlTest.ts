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
  answers?: Record<string, string>;
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

  const raw40 = Math.max(0, Math.min(40, Math.round((safeScore / safeTotal) * 40)));
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
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");
}

function buildHtmlWatcherScript(meta: HtmlWatcherMeta) {
  const durationSeconds = Math.max(0, Number(meta.durationMinutes || 0) * 60);
  const safeMeta = escapeScriptJson({
    ...meta,
    durationSeconds,
    source: HTML_WATCHER_SOURCE,
  });

  return `<script data-testora-html-watcher="1">
(function(){
  'use strict';
  var META=${safeMeta};
  var SOURCE='${HTML_WATCHER_SOURCE}';
  var startedAt=new Date().toISOString();
  var lastProgressAt=0;
  var resultSent=false;
  var blockedSent=false;
  var progressTimer=null;

  function uid(){
    try{
      var key='__testora_html_attempt_'+META.testId;
      var existing=sessionStorage.getItem(key);
      if(existing)return existing;
      var next='html_'+Date.now()+'_'+Math.random().toString(36).slice(2,10);
      sessionStorage.setItem(key,next);
      return next;
    }catch(e){return 'html_'+Date.now()+'_'+Math.random().toString(36).slice(2,10)}
  }
  var attemptId=uid();

  function toNumber(value){
    var num=Number(value);
    return Number.isFinite(num)?num:0;
  }
  function normText(value){return String(value==null?'':value).trim()}
  function parseJson(value){
    if(!value || typeof value!=='string')return null;
    try{return JSON.parse(value)}catch(e){return null}
  }
  function parseTimerText(text){
    var clean=normText(text);
    var match=clean.match(/(\\d{1,2}):(\\d{2})(?::(\\d{2}))?/);
    if(!match)return null;
    if(match[3])return (toNumber(match[1])*3600)+(toNumber(match[2])*60)+toNumber(match[3]);
    return (toNumber(match[1])*60)+toNumber(match[2]);
  }
  function getTimerText(){
    var el=document.getElementById('timer')||document.querySelector('[data-timer], .timer, .countdown');
    return el?normText(el.textContent):'';
  }
  function getRemainingSeconds(){
    var parsed=parseTimerText(getTimerText());
    return parsed==null?null:parsed;
  }
  function getDurationSeconds(){
    var metaDuration=toNumber(META.durationSeconds);
    if(metaDuration>0)return metaDuration;
    var remaining=getRemainingSeconds();
    if(remaining && remaining>0)return remaining;
    return 0;
  }
  function getSpentSeconds(){
    var remaining=getRemainingSeconds();
    var duration=getDurationSeconds();
    if(duration>0 && remaining!=null)return Math.max(0,duration-remaining);
    return Math.max(0,Math.round((Date.now()-Date.parse(startedAt))/1000));
  }
  function estimateBand(score,total){
    score=toNumber(score); total=toNumber(total);
    if(total<=0)return {raw40:0,band:'0'};
    var raw40=Math.max(0,Math.min(40,Math.round((score/total)*40)));
    var band='2.0';
    if(raw40>=39)band='9.0';
    else if(raw40>=37)band='8.5';
    else if(raw40>=35)band='8.0';
    else if(raw40>=33)band='7.5';
    else if(raw40>=30)band='7.0';
    else if(raw40>=27)band='6.5';
    else if(raw40>=23)band='6.0';
    else if(raw40>=19)band='5.5';
    else if(raw40>=15)band='5.0';
    else if(raw40>=13)band='4.5';
    else if(raw40>=10)band='4.0';
    else if(raw40>=8)band='3.5';
    else if(raw40>=6)band='3.0';
    else if(raw40>=4)band='2.5';
    return {raw40:raw40,band:band};
  }
  function studentInfo(){
    var nameEl=document.getElementById('studentName')||document.querySelector('input[autocomplete="name"]');
    var idEl=document.getElementById('studentId')||document.querySelector('input[name*="id" i], input[id*="student" i][id*="id" i]');
    return {student_name:nameEl?normText(nameEl.value):'',candidate_id:idEl?normText(idEl.value):''};
  }
  function isAnswerElement(el){
    if(!el || !el.matches)return false;
    var type=String(el.type||'').toLowerCase();
    if(['button','submit','reset','hidden','file','password'].indexOf(type)>=0)return false;
    var name=String(el.name||'');
    var id=String(el.id||'');
    if(id==='studentName'||id==='studentId')return false;
    if(name==='studentName'||name==='studentId')return false;
    if(/^q\\d+$/i.test(name)||/^q\\d+$/i.test(id))return true;
    if(el.closest && el.closest('.question'))return true;
    if(el.closest && el.closest('[data-question]'))return true;
    return false;
  }
  function collectAnswers(){
    var answers={};
    var nodes=document.querySelectorAll('input, textarea, select');
    Array.prototype.forEach.call(nodes,function(el){
      if(!isAnswerElement(el))return;
      var key=el.name||el.id||el.getAttribute('data-question')||el.getAttribute('placeholder')||'';
      key=normText(key);
      if(!key)return;
      var type=String(el.type||'').toLowerCase();
      if(type==='radio'){
        if(el.checked)answers[key]=normText(el.value);
      }else if(type==='checkbox'){
        if(!answers[key])answers[key]=[];
        if(el.checked)answers[key].push(normText(el.value));
      }else{
        var value=normText(el.value);
        if(value)answers[key]=value;
      }
    });
    Object.keys(answers).forEach(function(key){
      if(Array.isArray(answers[key]))answers[key]=answers[key].join(', ');
    });
    return answers;
  }
  function navTotal(){
    var navs=document.querySelectorAll('.q-nav,[data-nav],.question,[data-question]').length;
    var inputs=Object.keys(collectAnswers()).length;
    return Math.max(navs,inputs,0);
  }
  function scoreFromDom(){
    var scoreEl=document.getElementById('scoreBadge')||document.querySelector('[data-score], .score-badge, .score');
    var text=scoreEl?normText(scoreEl.textContent):'';
    if(!text && document.body)text=normText(document.body.innerText).slice(0,5000);
    var match=text.match(/(?:Natija|Score|Result)?[^0-9]*(\\d{1,3})\\s*\/\\s*(\\d{1,3})/i);
    if(!match)return null;
    return {score:toNumber(match[1]),total:toNumber(match[2])};
  }
  function buildProgress(extra){
    var answers=collectAnswers();
    var total=navTotal();
    var info=studentInfo();
    return Object.assign({
      attempt_id:attemptId,
      status:'in_progress',
      event_source:'watcher',
      title:META.testTitle,
      file_name:META.fileName||'',
      answers:answers,
      answered_count:Object.keys(answers).filter(function(key){return normText(answers[key])!==''}).length,
      total:total,
      started_at:startedAt,
      spent_time_seconds:getSpentSeconds(),
      remaining_time_seconds:getRemainingSeconds(),
      duration_seconds:getDurationSeconds(),
      url:location.href
    },info,extra||{});
  }
  function normalizeResult(payload,source){
    payload=payload||{};
    var domScore=scoreFromDom();
    var answers=payload.answers&&typeof payload.answers==='object'?payload.answers:collectAnswers();
    var score=payload.score!=null?toNumber(payload.score):(domScore?domScore.score:0);
    var total=payload.total!=null?toNumber(payload.total):(domScore?domScore.total:Math.max(navTotal(),Object.keys(answers).length));
    var est=estimateBand(score,total);
    var info=studentInfo();
    return Object.assign({
      attempt_id:attemptId,
      event_source:source||'watcher',
      status:payload.status||'completed',
      title:META.testTitle,
      file_name:META.fileName||'',
      student_name:payload.student_name||payload.name||info.student_name,
      candidate_id:payload.candidate_id||payload.student_id||payload.id||info.candidate_id,
      score:score,
      total:total,
      raw_40:payload.raw_40!=null?toNumber(payload.raw_40):est.raw40,
      band:String(payload.band||est.band),
      answered_count:Object.keys(answers).filter(function(key){return normText(answers[key])!==''}).length,
      answers:answers,
      analysis_rows:Array.isArray(payload.analysis_rows)?payload.analysis_rows:[],
      analysis_text:payload.analysis_text||payload.report_for_docs||'',
      report_for_docs:payload.report_for_docs||payload.analysis_text||'',
      started_at:payload.started_at||startedAt,
      completed_at:payload.completed_at||new Date().toISOString(),
      spent_time_seconds:payload.spent_time_seconds!=null?toNumber(payload.spent_time_seconds):getSpentSeconds(),
      remaining_time_seconds:getRemainingSeconds(),
      duration_seconds:getDurationSeconds(),
      security_reason:payload.security_reason||'',
      blocked_reason:payload.blocked_reason||'',
      url:location.href
    },payload);
  }
  function post(event,payload){
    try{
      window.parent.postMessage({source:SOURCE,event:event,testId:META.testId,payload:payload},'*');
    }catch(e){}
  }
  function sendProgress(force){
    var now=Date.now();
    if(!force && now-lastProgressAt<900)return;
    lastProgressAt=now;
    post('progress',buildProgress());
  }
  function sendResult(payload,source){
    if(resultSent)return;
    resultSent=true;
    post('result',normalizeResult(payload,source));
  }
  function sendBlocked(reason){
    if(blockedSent)return;
    blockedSent=true;
    post('blocked',normalizeResult({status:'blocked',security_reason:reason||'Security block detected',blocked_reason:reason||'Security block detected'},'security'));
  }
  function scanDom(){
    try{
      var text=document.body?normText(document.body.innerText).slice(0,3000):'';
      if(/Test bloklandi|bloklandi|blocked/i.test(text))sendBlocked('HTML test block screen detected');
      var overlay=document.getElementById('resultOverlay');
      var isOpen=overlay && (overlay.classList.contains('open') || getComputedStyle(overlay).display!=='none');
      if(isOpen || /Test yakunlandi|Natija:|Score:/i.test(text)){
        var found=scoreFromDom();
        if(found)sendResult({score:found.score,total:found.total,status:'completed'},'dom');
      }
    }catch(e){}
  }
  try{
    var originalFetch=window.fetch;
    window.fetch=function(input,init){
      try{
        var url=typeof input==='string'?input:(input&&input.url?input.url:'');
        var body=init&&init.body;
        var parsed=parseJson(body);
        if(parsed && (parsed.score!=null || parsed.answers || parsed.analysis_rows || parsed.report_for_docs || parsed.status)){
          sendResult(parsed,'fetch');
        }else if(/script\\.google\\.com|macros\/s\//i.test(url)){
          post('security',buildProgress({event_source:'fetch',status:'external_result_request',url:url}));
        }
      }catch(e){}
      return originalFetch.apply(this,arguments);
    };
  }catch(e){}

  document.addEventListener('input',function(e){if(isAnswerElement(e.target))sendProgress(false)},true);
  document.addEventListener('change',function(e){if(isAnswerElement(e.target))sendProgress(true)},true);
  document.addEventListener('click',function(e){
    var target=e.target&&e.target.closest?e.target.closest('button,input[type="button"],input[type="submit"],a'):null;
    if(!target)return;
    var label=normText((target.innerText||target.value||target.id||target.className||'')).slice(0,120);
    if(/finish|submit|yakun|yubor|confirm/i.test(label))setTimeout(scanDom,350);
    setTimeout(function(){sendProgress(false)},150);
  },true);

  try{
    var observer=new MutationObserver(function(){
      if(progressTimer)clearTimeout(progressTimer);
      progressTimer=setTimeout(function(){sendProgress(false);scanDom()},350);
    });
    observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,characterData:true});
  }catch(e){}

  window.addEventListener('message',function(event){
    if(event&&event.data&&event.data.type==='TESTORA_FORCE_PROGRESS')sendProgress(true);
  });

  post('started',buildProgress({status:'started'}));
  setInterval(function(){sendProgress(false);scanDom()},3000);
})();
</script>`;
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
