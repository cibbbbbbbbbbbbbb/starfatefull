function updateFavoriteButton(){
  const btn=document.querySelector('[data-sf-result-action="favorite"]');
  const cur=window.__starFateCurrent;
  if(!btn||!cur||!cur.star)return;
  const fav=window.isFavoriteStar?.(cur.star);
  btn.textContent=fav?'★ 已收藏':'☆ 收藏這顆星';
  btn.classList.toggle('is-favorited',!!fav);
}
function handleFavoriteClick(){
  const cur=window.__starFateCurrent;
  if(!cur||!cur.star){return}
  if(!window.toggleFavorite){return}
  const wasFav=!!window.isFavoriteStar?.(cur.star);
  window.toggleFavorite(cur.star);
  updateFavoriteButton();
}
function renderSaved(){
 const root=document.getElementById('savedResultRoot'),qs=new URLSearchParams(location.search),id=qs.get('history'),share=qs.get('share');let data=null;
 if(share){try{data=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(atob(share),c=>c.charCodeAt(0))))}catch(e){}}
 if(!data){try{const item=JSON.parse(sessionStorage.getItem('starFateViewedHistory')||'null');data=item&&(!id||item.historyId===id)?item:null}catch(e){console.warn('歷史資料讀取失敗',e);sessionStorage.removeItem('starFateViewedHistory')}}
 if(!data){root.innerHTML='<div class="history-empty">找不到這筆占卜紀錄。<br><br><a class="cta-button" href="index.html#oracle">探索你的命運星</a></div>';return}
 const s=data.star||{},i=data.interpretation||{};window.__starFateCurrent={star:s,data:data.data||data.birth||{},seed:data.seed||0,interpretation:i};
 root.innerHTML=`<div class="destiny-star-panel"><div class="star-result-kicker">YOUR DESTINY STAR</div><div class="star-orb"><span>✦</span></div><div class="star-id">${s.id||'—'}</div><h2>${s.name||'命運星'}</h2><div class="star-english">${s.english||''}</div><div class="star-meta"><div><span>星座</span><strong>${s.constellation||'—'}</strong></div><div><span>天文分類</span><strong>${s.classification||'—'}</strong></div><div><span>距離</span><strong>${s.distance||'—'}</strong></div><div><span>亮度</span><strong>${s.magnitude||'—'}</strong></div></div><div class="star-detail"><h3>名稱來源與命名原因</h3><p>${s.namingReason||s.origin||''}</p><h3>發現／記錄故事</h3><p>${s.discoveryStory||'這顆星沒有單一現代發現者，後來由天文學家透過星表與觀測資料整理成現代天文記錄。'}</p><h3>這顆星的故事</h3><p>${s.starStory||s.culture||''}</p><h3>代表意義</h3><p>${s.symbol||''}</p><h3>完整判讀</h3><p>${i.personality||''}</p><h3>❤️ 感情</h3><p>${i.love||''}</p><h3>💰 財運</h3><p>${i.money||i.career||''}</p><h3>🪞 自我探索</h3><p>${i.self||i.social||''}</p><h3>🎯 直接建議</h3><p>${i.notice||i.message||''}</p></div><div id="sharePanel" class="share-panel"></div><div class="destiny-actions"><button type="button" data-sf-result-action="favorite">☆ 收藏這顆星</button><a href="index.html#oracle">再次探索</a><a href="account.html">MY FATE</a></div><p class="legal-notice">星命籤提供的是自我探索與娛樂性質的內容，不構成醫療、法律、財務或其他專業建議。</p></div>`;
 if(window.renderSharePanel)window.renderSharePanel();
 updateFavoriteButton();
}
document.addEventListener('DOMContentLoaded',()=>{
  renderSaved();
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-sf-result-action="favorite"]');
    if(b)handleFavoriteClick();
  });
});
