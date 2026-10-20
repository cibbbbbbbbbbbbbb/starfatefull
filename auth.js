/* STAR FATE authentication bridge.
 * Production mode: PostgreSQL-backed API session in an HttpOnly cookie.
 * Gradual migration: legacy localStorage account/history remains only as an offline fallback.
 * No production password or session token is written to localStorage.
 */
const AUTH_KEY='starFateUsers';
const SESSION_KEY='starFateSession';
const HISTORY_KEY='starFateFortuneHistory';
let apiMode=null;
let apiUser=null;
let apiReady=Promise.resolve();

function loadUsers(){try{return JSON.parse(localStorage.getItem(AUTH_KEY)||'{}')}catch{return {}}}
function saveUsers(users){localStorage.setItem(AUTH_KEY,JSON.stringify(users))}
function loadHistory(){try{return JSON.parse(localStorage.getItem(HISTORY_KEY)||'[]')}catch{return []}}
function saveHistory(items){localStorage.setItem(HISTORY_KEY,JSON.stringify(items))}
function legacyUser(){const email=localStorage.getItem(SESSION_KEY);if(!email)return null;const u=loadUsers()[email];return u?{...u,email}:null}
function currentUser(){if(apiMode===true)return apiUser;return legacyUser()}
function setSession(email){localStorage.setItem(SESSION_KEY,email)}
function clearSession(){localStorage.removeItem(SESSION_KEY)}
function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
async function apiFetch(url,options={}){return fetch(url,{credentials:'same-origin',headers:{'Content-Type':'application/json',...(options.headers||{})},...options})}
async function apiJson(url,options={}){const r=await apiFetch(url,options);let data=null;try{data=await r.json()}catch{}if(!r.ok){const e=new Error(data?.message||`API ${r.status}`);e.status=r.status;throw e}return data}

function renderAuthNav(){
  const nav=document.querySelector('.navbar');if(!nav)return;let box=nav.querySelector('.auth-nav');if(!box){box=document.createElement('div');box.className='auth-nav';nav.appendChild(box)}
  const u=currentUser();box.innerHTML=u?`<a href="account.html">MY FATE</a><button type="button" data-sf-auth-action="logout">登出</button>`:`<a href="login.html">登入</a>`;
  const welcome=document.getElementById('memberWelcome');if(welcome)welcome.innerHTML=u?`<span>WELCOME BACK</span>　${escapeHtml(u.name||u.displayName||'星辰旅人')} · <a href="account.html">繼續探索你的命運</a>`:'';
}
async function initializeAuth(){
  apiReady=(async()=>{try{const r=await apiFetch('/api/me');apiMode=true;if(r.ok){const d=await r.json();apiUser=d.user||null;await syncFortuneHistoryFromServer()}else{apiUser=null}renderAuthNav();if(window.renderAccountPage)window.renderAccountPage();if(window.renderOrders)window.renderOrders()}catch(e){apiMode=false;renderAuthNav();}})();return apiReady}
async function logout(){
  await apiReady.catch(()=>{});
  if(apiMode===true){try{await apiFetch('/api/auth/logout',{method:'POST',body:'{}'})}catch(e){}apiUser=null;renderAuthNav();window.location.href='index.html';return}
  clearSession();renderAuthNav();window.location.href='index.html';
}
function showAuthMessage(text,type='info'){const el=document.getElementById('authMessage');if(!el)return;el.textContent=text;el.className='auth-message '+type}
async function authSubmit(mode){
  const name=(document.getElementById('displayName')?.value||'').trim();const email=(document.getElementById('authEmail')?.value||'').trim().toLowerCase();const password=document.getElementById('authPassword')?.value||'';const confirm=document.getElementById('authConfirm')?.value||'';
  if(mode==='register'&&!name){showAuthMessage('請輸入姓名。','error');return}
  if(!/^\S+@\S+\.\S+$/.test(email)){showAuthMessage('請輸入有效的 Email。','error');return}
  if(password.length<8){showAuthMessage('密碼至少需要 8 個字元。','error');return}
  if(mode==='register'&&!document.getElementById('privacyConsent')?.checked){showAuthMessage('請先閱讀並同意隱私權政策與使用條款。','error');return}
  if(mode==='register'&&password!==confirm){showAuthMessage('兩次密碼不一致。','error');return}
  try{
    await apiReady;
    if(apiMode!==false){
      const d=await apiJson(`/api/auth/${mode}`,{method:'POST',body:JSON.stringify({email,password,name:(document.getElementById('displayName')?.value||'').trim()||undefined,privacyConsent:mode==='register'?true:undefined})});
      apiMode=true;apiUser=d.user;clearSession();if(mode==='register')localStorage.setItem('starFatePrivacyConsent',new Date().toISOString());renderAuthNav();window.location.href='account.html';return;
    }
  }catch(e){
    if(e.status===409){showAuthMessage(e.message,'error');return}
    if(e.status===401){showAuthMessage('Email 或密碼不正確。','error');return}
    if(e.status===400){showAuthMessage(e.message||'登入資料無效。','error');return}
    // Network/server unavailable: continue with the legacy prototype only so the current static UI remains usable.
  }
  const users=loadUsers();
  if(mode==='register'){showAuthMessage('目前無法連線後端，為避免把新密碼寫入瀏覽器，請先啟動 PostgreSQL + Backend 後再註冊。','error');return}
  if(!users[email]||!users[email].password||users[email].password!==password){showAuthMessage('目前無法連線後端，且找不到可用的舊版離線示範帳號。','error');return}setSession(email);window.location.href='account.html';
}
function requestReset(){showAuthMessage('正式密碼重設流程尚未在第一階段啟用；目前不會修改 PostgreSQL 帳號密碼。','info')}
function updateAccountNav(){renderAuthNav()}

async function syncFortuneHistoryFromServer(){
  if(apiMode!==true||!apiUser)return;
  try{const d=await apiJson('/api/fortune-results');const serverItems=(d.results||[]).map(x=>({...(x.resultData||{}),userEmail:apiUser.email,historyId:x.id,serverId:x.id,date:(x.resultData?.date||x.createdAt),serverCreatedAt:x.createdAt}));if(serverItems.length){const local=loadHistory().filter(x=>x.userEmail!==apiUser.email);saveHistory([...serverItems,...local].slice(0,200));}}catch(e){}
}
function saveFortuneHistory(record){
  const u=currentUser();if(!u)return false;
  const local=loadHistory();const item={...record,userEmail:u.email,historyId:record.historyId||'FH-'+Date.now()};saveHistory([item,...local.filter(x=>!(x.userEmail===u.email&&x.historyId===item.historyId))].slice(0,200));
  if(apiMode===true){
    const b=record.birth||{};apiJson('/api/fortune-results',{method:'POST',body:JSON.stringify({type:record.type||'personal',question:record.question,birthDate:String(b.date||'').replaceAll('/','-'),birthTime:b.time,gender:b.gender,bloodType:b.blood,zodiac:b.zodiac,resultData:record})}).then(syncFortuneHistoryFromServer).catch(()=>{});
  }else{const users=loadUsers();if(users[u.email]){users[u.email].fortuneCount=(users[u.email].fortuneCount||0)+1;users[u.email].lastFortuneAt=item.date;saveUsers(users)}}
  return true;
}
function userHistory(){const u=currentUser();return u?loadHistory().filter(x=>x.userEmail===u.email):[]}
function deleteHistoryItem(id){const u=currentUser();if(!u)return;saveHistory(loadHistory().filter(x=>!(x.historyId===id&&x.userEmail===u.email)));if(apiMode===true){}renderAccountPage()}

function renderAccountPage(){
  const root=document.getElementById('accountRoot');if(!root)return;const u=currentUser();
  if(!u){root.innerHTML=`<div class="account-empty"><div class="subpage-symbol">✦</div><h2>尚未登入</h2><p>登入後，你可以保存命運之星、建立 Destiny Archive、收藏星星與管理自己的資料。</p><a class="cta-button" href="login.html">前往登入</a></div>`;return}
  const h=userHistory(),fav=window.favoriteStars?.()||[];const displayName=u.name||u.displayName||'星辰旅人';
  root.innerHTML=`<div class="fate-dashboard"><div class="dashboard-top"><div><span class="dashboard-kicker">WELCOME BACK</span><h2>${escapeHtml(displayName)}</h2><p>${escapeHtml(u.email)}</p></div><a class="cta-button" href="index.html#oracle">繼續探索你的命運</a></div>
  <div class="fate-stats"><div><span>DESTINY STAR</span><strong>${escapeHtml(h[0]?.star?.name||'尚未探索')}</strong><small>${escapeHtml(h[0]?.star?.id||'—')}</small></div><div><span>占卜次數</span><strong>${h.length}</strong><small>FATE READINGS</small></div><div><span>最近一次</span><strong>${h[0]?.date?new Date(h[0].date).toLocaleDateString('zh-TW'):'—'}</strong><small>${h[0]?.date?new Date(h[0].date).toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit'}):'RETURN WHEN READY'}</small></div><div><span>收藏星星</span><strong>${fav.length}</strong><small>FAVORITES</small></div></div>
  <div class="birth-profile"><span>MY BIRTH DATA</span><h3>我的出生資料</h3><p>${escapeHtml(h[0]?.birth?.date||'尚未保存')} · ${escapeHtml(h[0]?.birth?.time||'—')}</p><p>${escapeHtml(h[0]?.birth?.zodiac||'—')} · ${escapeHtml(h[0]?.birth?.animal||'—')} · ${escapeHtml(h[0]?.birth?.blood||'—')}</p><small>僅用於你的命運紀錄與個人化分析。</small></div><div class="fate-columns"><section class="fate-feature">${h[0]?`<div class="feature-label">MY DESTINY STAR</div><div class="feature-orb">✦</div><div class="feature-id">${escapeHtml(h[0].star.id)}</div><h2>${escapeHtml(h[0].star.name)}</h2><p>${escapeHtml(h[0].star.symbol||'')}</p><div class="feature-meta"><span>${escapeHtml(h[0].star.origin||'')}</span><span>${escapeHtml(h[0].star.constellation||'')}</span></div><a class="text-link" href="history.html">查看完整命運歷史 →</a>`:`<div class="feature-label">YOUR SKY IS WAITING</div><div class="feature-orb">✦</div><h2>還沒有命運之星</h2><p>完成第一次占卜，找到屬於你的星。</p><a class="cta-button" href="index.html#oracle">探索你的命運星</a>`}</section>
  <section class="fate-side"><div class="side-card"><span>DAILY FORTUNE</span><h3>今天，也留一點時間給自己。</h3><p>你的命運正在持續變化。明天，再來看看你的星。</p><a class="text-link" href="daily-fortune.html">查看今日運勢 →</a></div><div class="side-card"><span>OUR FATE</span><h3>探索你們的關係</h3><p>輸入兩個人的出生資料，看看彼此如何靠近與理解。</p><a class="text-link" href="our-fate.html">探索你們的命運 →</a></div></div></section>
  <section class="fate-section"><div class="section-line-title"><span>FAVORITES</span><h2>收藏的命運之星</h2></div>${fav.length?`<div class="favorite-grid">${fav.map(s=>`<div class="favorite-card"><span>${escapeHtml(s.id)}</span><h3>${escapeHtml(s.name)}</h3><p>${escapeHtml(s.symbol||'')}</p></div>`).join('')}</div>`:'<div class="soft-empty">你收藏的星星會出現在這裡。</div>'}</section>
  <section class="fate-section"><div class="section-line-title"><span>DESTINY ARCHIVE</span><h2>最近的命運紀錄</h2></div>${h.length?`<div class="recent-history">${h.slice(0,5).map(renderHistoryItem).join('')}</div>`:'<div class="soft-empty">完成占卜並保存後，這裡會成為你的宇宙檔案。</div>'}<a class="archive-link" href="history.html">進入完整命運歷史 →</a></section>
  <section class="fate-section"><div class="section-line-title"><span>MY ORDERS</span><h2>我的解析與購買紀錄</h2></div><div id="accountOrdersRemote"><div class="soft-empty">載入訂單中…</div></div></section>
  <section class="deep-fate-card"><div><span>DEEP FATE</span><h2>深入探索你的命運</h2><p>深度人格、愛情、職涯、財運、人際、長期運勢與完整命運之星解析。</p></div><div class="coming-soon">COMING SOON</div></section>
  <section class="fate-section data-management"><div class="section-line-title"><span>ACCOUNT & DATA</span><h2>帳號與資料管理</h2></div><div class="manage-actions"><button type="button" data-sf-auth-action="export">匯出我的資料</button><button type="button" data-sf-auth-action="toggle-edit">帳號設定</button><button type="button" data-sf-auth-action="delete-history">刪除全部歷史</button><button type="button" data-sf-auth-action="logout">登出</button></div><div id="editAccount" class="account-edit"><label>顯示名稱<input id="displayName" value="${escapeHtml(displayName)}" placeholder="例如：星辰旅人"></label><button type="button" class="fortune-button" data-sf-auth-action="save-display-name">儲存</button></div><p class="data-note">正式會員帳號與登入 Session 已改由後端資料庫管理；部分舊版歷史、收藏與訂單資料仍在本機，會逐步遷移。</p></section></div>`;
  loadRemoteOrdersIntoAccount();
}
function renderHistoryItem(item){const star=item.star||{};return `<article class="history-item"><div class="history-head"><span>${new Date(item.date).toLocaleString('zh-TW')}</span><strong>${escapeHtml(star.id||'—')} · ${escapeHtml(star.name||'命運星')}</strong></div><div class="history-grid"><div><span>出生資料</span><p>${escapeHtml(item.birth?.date||'—')} ${escapeHtml(item.birth?.time||'')} · ${escapeHtml(item.birth?.zodiac||'')} · ${escapeHtml(item.birth?.animal||'')}</p></div><div><span>命運摘要</span><p>${escapeHtml(item.interpretation?.personality||'')}</p></div></div><div class="history-actions"><button type="button" data-sf-auth-action="view-history" data-history-id="${escapeHtml(item.historyId)}">查看結果</button><button type="button" data-sf-auth-action="delete-history-item" data-history-id="${escapeHtml(item.historyId)}">刪除紀錄</button></div></article>`}
async function loadRemoteOrdersIntoAccount(){
  const root=document.getElementById('accountOrdersRemote');
  if(!root||apiMode!==true)return;
  try{
    const d=await apiJson('/api/orders');
    const os=d.orders||[];
    if(!os.length){root.innerHTML='<div class="soft-empty">目前還沒有購買紀錄。</div>';return}
    root.innerHTML='<div class="recent-history">'+os.slice(0,5).map(o=>'<article class="history-item"><div class="history-head"><span>'+new Date(o.createdAt).toLocaleDateString('zh-TW')+'</span><strong>'+escapeHtml(o.product?.name||'命運服務')+'</strong></div><div class="history-grid"><div><span>狀態</span><p>'+escapeHtml(o.status)+'</p></div><div><span>金額</span><p>'+escapeHtml(o.currency)+' '+Number(o.amount)+'</p></div></div></article>').join('')+'</div>';
  }catch(e){root.innerHTML='<div class="soft-empty">目前無法載入後端訂單。</div>'}
}

function saveDisplayName(){const u=currentUser();if(!u)return;const name=(document.getElementById('displayName')?.value||'').trim();if(apiMode===true){apiJson('/api/me',{method:'PATCH',body:JSON.stringify({name})}).catch(()=>{});apiUser={...apiUser,name};renderAccountPage();return}const users=loadUsers();if(users[u.email]){users[u.email].displayName=name;saveUsers(users)}renderAccountPage()}
function viewSavedFortune(id){const item=userHistory().find(x=>x.historyId===id);if(!item)return;sessionStorage.setItem('starFateViewedHistory',JSON.stringify(item));window.location.href='fortune-result.html?history='+encodeURIComponent(id)}

document.addEventListener('DOMContentLoaded',()=>{renderAuthNav();renderAccountPage();if(new URLSearchParams(location.search).get('google')==='error')showAuthMessage('Google 登入未完成，請稍後再試。','error');initializeAuth()});
window.currentUser=currentUser;window.logout=logout;window.authSubmit=authSubmit;window.requestReset=requestReset;window.saveFortuneHistory=saveFortuneHistory;window.userHistory=userHistory;window.renderAccountPage=renderAccountPage;window.deleteHistoryItem=deleteHistoryItem;window.viewSavedFortune=viewSavedFortune;window.saveDisplayName=saveDisplayName;window.updateAccountNav=updateAccountNav;window.SF_API={fetch:apiFetch,json:apiJson,ready:()=>apiReady,mode:()=>apiMode,user:()=>apiUser};
window.deleteAccount=function(){if(apiMode===true){showAuthMessage('正式帳號刪除 API 尚未在第一階段啟用，為避免誤刪資料，目前未執行。','info');return}const u=currentUser();if(!u)return;if(!confirm('確定刪除示範帳號與此帳號的所有命運資料？'))return;const users=loadUsers();delete users[u.email];saveUsers(users);saveHistory(loadHistory().filter(x=>x.userEmail!==u.email));['starFateOrders','starFateCoupleHistory','starFateShares','starFateReferrals','starFateNotifications'].forEach(k=>{try{localStorage.setItem(k,JSON.stringify(JSON.parse(localStorage.getItem(k)||'[]').filter(x=>x.userEmail!==u.email)))}catch(e){}});try{const favs=JSON.parse(localStorage.getItem('starFateFavoriteStars')||'{}');delete favs[u.email];localStorage.setItem('starFateFavoriteStars',JSON.stringify(favs))}catch(e){}clearSession();location.href='index.html'};


(function bindAuthActions(){
  const handle=(e)=>{
    const el=e.target.closest('[data-sf-auth-action]');if(!el)return;
    const action=el.dataset.sfAuthAction;
    if(action==='logout')return window.logout?.();
    if(action==='export')return window.exportMyData?.();
    if(action==='toggle-edit'){document.getElementById('editAccount')?.classList.toggle('active');return}
    if(action==='delete-history')return window.deleteAllHistory?.();
    if(action==='save-display-name')return window.saveDisplayName?.();
    if(action==='view-history')return window.viewSavedFortune?.(el.dataset.historyId);
    if(action==='delete-history-item')return window.deleteHistoryItem?.(el.dataset.historyId);
  };
  document.addEventListener('click',handle);
})();
