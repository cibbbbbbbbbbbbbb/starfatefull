/* Real Google OAuth architecture. No client-side fake login. Configure GOOGLE_CLIENT_ID and backend /api/auth/google. */
(function(){
async function googleLogin(){const msg=document.getElementById('authMessage');const set=t=>{if(msg){msg.textContent=t;msg.className='auth-message info'}};set('正在連線 Google…');try{const cfg=await fetch('/api/auth/config').then(r=>r.ok?r.json():Promise.reject());if(!cfg.googleClientId){set('Google 登入尚未設定。請在後端設定 Google OAuth Client ID、Authorized Origin 與 Redirect URI。');return}location.href='/api/auth/google/start?returnTo='+encodeURIComponent(location.href)}catch(e){set('目前網站尚未啟用後端 Google 登入，請先完成 OAuth 設定。')}}
window.googleLogin=googleLogin;
})();
