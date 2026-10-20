/* STAR FATE · 12 Zodiac Daily Analysis
 * 12 signs × 20 daily themes = 240 deterministic analysis combinations.
 * The copy is original and uses broad astrology/生活觀察 themes, not text copied
 * from any individual astrologer.
 */
(function(){
'use strict';
const TZ='Asia/Taipei', SALT='STAR-FATE-ZODIAC-DAILY-2026-V2', KEY='starFateZodiacDaily';
const signs=[
 ['牡羊座','Aries','♈','3/21–4/19'],['金牛座','Taurus','♉','4/20–5/20'],['雙子座','Gemini','♊','5/21–6/20'],['巨蟹座','Cancer','♋','6/21–7/22'],
 ['獅子座','Leo','♌','7/23–8/22'],['處女座','Virgo','♍','8/23–9/22'],['天秤座','Libra','♎','9/23–10/22'],['天蠍座','Scorpio','♏','10/23–11/21'],
 ['射手座','Sagittarius','♐','11/22–12/21'],['魔羯座','Capricorn','♑','12/22–1/19'],['水瓶座','Aquarius','♒','1/20–2/18'],['雙魚座','Pisces','♓','2/19–3/20']
];
const profiles=[
 {focus:'主動與速度',work:'適合把卡住的事情直接拆開處理',love:'感情上先說清楚需求，少用試探',money:'避免因一時興奮而超出預算',social:'留意直來直往的語氣',health:'行程緊湊時更要留出緩衝'},
 {focus:'穩定與價值',work:'把資源與時間重新排序會更有效率',love:'安全感來自一致的行動而不是承諾',money:'適合檢查固定支出與長期規劃',social:'別因為顧全大局而一直退讓',health:'規律飲食與睡眠比硬撐重要'},
 {focus:'資訊與交流',work:'適合溝通、整理資料與交換想法',love:'一句說清楚的話勝過反覆猜測',money:'小額支出容易累積，購物前先停一下',social:'消息很多，先確認來源再回應',health:'注意用腦過度與作息失衡'},
 {focus:'情緒與安全感',work:'先處理最需要照顧的事情，再擴張戰線',love:'敏感並不是弱點，但需要界線',money:'家庭或生活支出值得多留一層預備',social:'別把別人的情緒全部扛到自己身上',health:'情緒緊繃時，休息與獨處很重要'},
 {focus:'表現與主導',work:'適合把成果公開、簡報或爭取資源',love:'被看見很重要，也要留空間給對方發光',money:'避免為了面子或氣氛而增加不必要花費',social:'注意強勢表達可能讓人誤會',health:'活動量高時留意疲勞累積'},
 {focus:'細節與效率',work:'適合修正流程、補漏洞、整理優先級',love:'別把完美標準變成對關係的壓力',money:'適合盤點帳目、訂閱與零碎支出',social:'提醒別人時留意語氣與時機',health:'小問題早點處理比拖到累積更省力'},
 {focus:'平衡與關係',work:'合作協調比單打獨鬥更能推進事情',love:'關係需要公平，也需要坦白表達',money:'涉及共同支出時把規則說在前面',social:'避免為了維持和平而壓住真實感受',health:'別讓社交排程擠掉休息時間'},
 {focus:'洞察與界線',work:'適合處理敏感資訊與需要判斷力的事',love:'信任需要證據，也需要給彼此呼吸空間',money:'涉及借貸、投資或合約時務必看細節',social:'留意話中有話，但不要過度解讀',health:'壓力高時容易緊繃，安排放鬆時間'},
 {focus:'拓展與機會',work:'適合接觸新市場、新合作或不同做法',love:'直接談未來方向，比曖昧拖延更有建設性',money:'機會多時更要控制衝動消費',social:'新圈子可能帶來資訊，但先觀察再投入',health:'奔波增加時要顧好休息與交通安全'},
 {focus:'責任與長線',work:'今天的關鍵是把責任分配與期限講清楚',love:'務實的承諾比漂亮話更能建立信任',money:'適合做長期預算與風險盤點',social:'別把所有事情都自己扛',health:'長期疲勞需要被正視，不要只靠意志力'},
 {focus:'創新與距離',work:'換一個方法可能比更用力更有效',love:'需要空間不等於冷淡，先講清楚彼此節奏',money:'科技、工具與訂閱服務值得重新檢視',social:'保持獨立思考，不必跟著群體起舞',health:'長時間使用螢幕時記得休息'},
 {focus:'直覺與收斂',work:'先整理內在方向，再決定要往哪裡投入',love:'感受很強時更要確認事實與對方的原話',money:'避免情緒性購物與替別人過度承擔',social:'同理心很強，但界線同樣重要',health:'睡眠與情緒恢復是今天的重要資產'}
];
const themes=[
 ['重新啟動','今天適合把拖延的第一步做掉。不要一次解決全部，只要讓事情開始移動。','小心急著證明自己而忽略細節；速度可以快，決定最好留一個確認點。'],
 ['人際辨識','今天的人際互動資訊量偏高，真正重要的是誰願意把話說完整、把事情做完整。','留意表面客氣卻沒有實際配合的人；所謂小人不必預設是敵人，先看行動再下結論。'],
 ['工作轉折','工作上可能出現臨時變動，但變動不一定等於壞消息。先確認優先順序，再調整資源。','避免在資訊不足時立刻回覆或承諾，尤其是合約、交期與責任歸屬。'],
 ['感情溫度','感情需要的是可被理解的訊息。今天適合把在意的事說得具體，不必用冷淡或試探測量對方。','如果對方反應慢，先確認對方是否真的忙，而不是直接把沉默解讀成拒絕。'],
 ['財務整理','今天適合整理帳目、付款、訂閱與近期支出。看清楚錢流向，會比追求一個快速答案更有價值。','不宜因為情緒或他人推薦就做大額決定；先留一晚再確認通常更穩。'],
 ['交通警覺','外出時把注意力放回路況與周遭環境，尤其在趕時間、使用手機或情緒浮動時。','傳統運勢語境常把這類提醒說成「防血光」，實際生活中更適合理解為：今天降低急躁與碰撞風險。'],
 ['貴人訊號','今天可能遇到願意提供資訊、介紹資源或提醒盲點的人。重點不是誰替你解決，而是你能不能接住有效資訊。','接受幫助時把權責說清楚，避免人情變成日後的壓力。'],
 ['情緒清場','今天適合把累積很久的雜訊清掉：未回訊息、未完成的小事、桌面與腦中的待辦都可以逐一整理。','不要在情緒最高點做關係上的重大決定；先睡一覺，很多事情會更清楚。'],
 ['合作談判','合作上適合先談規則再談感情。把時間、分工、預算與期待寫下來，後續會少很多誤會。','注意有人只談願景卻不談責任；合作前把細節問清楚。'],
 ['曝光表現','今天適合讓成果被看見。簡報、作品、提案、面試或公開表達都有機會帶來新的回應。','別因為得到掌聲就立刻答應所有邀請，先判斷它是否符合你的長期方向。'],
 ['舊事回頭','過去的人、舊工作或曾經擱置的想法可能重新出現。它不一定要被重新拾起，但值得理解它為什麼再次出現。','不要只因懷舊就重複舊模式，先比較現在的自己與當時有什麼不同。'],
 ['界線建立','今天很適合練習一句簡單的「我需要再確認」。界線不是拒絕所有人，而是讓自己的時間有秩序。','小心過度配合造成後續反彈；現在說清楚，比之後爆發更省力。'],
 ['機會擴張','新的邀請、學習或合作訊息值得觀察。今天適合收集資訊，不必急著把所有機會都變成承諾。','機會越多，越要避免分散；選一到兩件最有長期價值的事即可。'],
 ['秘密揭露','今天容易發現某些原本忽略的細節。與其猜測，不如把資料攤開來看。','涉及金錢、帳號、合約或私密資訊時，多一步核對就是多一層保護。'],
 ['關係修復','如果最近有人與你有距離，今天適合從一件小事重新建立信任。先談現在，不必急著清算全部過去。','道歉與和好不是同一件事；可以修復溝通，也可以保留合理界線。'],
 ['節奏放慢','今天不是每一件事都需要立刻得到答案。留白反而能讓你看見真正重要的問題。','如果身體已經明顯疲累，別把休息當成浪費時間。'],
 ['決策窗口','有一件事可能需要你表態。把「我真正要什麼」寫成一句話，再比較選項會更清楚。','不要只因害怕失去就答應，也不要只因害怕改變就拒絕。'],
 ['創意流動','今天適合寫、拍、做、研究或重新設計。靈感可能從很普通的對話與生活細節出現。','創意很多時更要收斂成一個可完成的版本，避免每個方向都只做到一半。'],
 ['家庭議題','家人、居住空間或生活安排可能需要你多花一點注意力。把實際問題拆開處理，情緒自然會下降。','不要把工作壓力帶進家庭對話；先處理事，再處理情緒。'],
 ['夜間反思','今天適合在晚上回看一次自己的選擇：什麼讓你變得更有力量？什麼讓你一直消耗？','不要因一件小插曲否定整天。把事件與自我價值分開，你會更穩。']
];
const icons=['✦','☾','◇','♢','✧','☼','⌁','◈','✹','△','⊙','✧'];
const hash=s=>{let h=2166136261>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
const pick=(seed,n)=>seed%n;
function dateKey(d=new Date()){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d);const p=Object.fromEntries(parts.map(x=>[x.type,x.value]));return `${p.year}-${p.month}-${p.day}`}
function esc(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function zodiacIndex(name){return signs.findIndex(x=>x[0]===name)}
function build(signIndex,date=dateKey()){
 const sign=signs[signIndex], profile=profiles[signIndex], themeIndex=pick(hash(`${date}|${sign[0]}|${SALT}`),themes.length), theme=themes[themeIndex];
 const seed=hash(`${sign[0]}|${date}|${SALT}`), n=(o,min,max)=>min+((seed>>>o)%((max-min)+1));
 const scores={work:n(3,62,94),wealth:n(7,58,91),love:n(11,60,95),social:n(15,61,93),health:n(19,57,90)};
 const overall=Math.round((scores.work+scores.wealth+scores.love+scores.social+scores.health)/5);
 const opening=`${sign[0]}今天的核心在「${profile.focus}」。${theme[1]} 對你而言，這一天比較適合把注意力放在可驗證的行動，而不是反覆猜測結果。`;
 const work=`${profile.work}。${themeIndex%3===0?'若有人提出新的做法，先聽完再決定，不必急著否定。':themeIndex%3===1?'工作上的訊息最好留下文字紀錄，尤其是期限、價格與分工。':'今天適合完成一個看得見的成果，讓別人知道你真正做到什麼。'}`;
 const love=`${profile.love}。${theme[0]}也提醒你，關係裡最有價值的不是猜中對方，而是讓彼此知道你在乎什麼、需要什麼。`;
 const wealth=`${profile.money}。今天適合把「想要」與「需要」分開；如果涉及投資、借貸或重大支出，先確認資訊與風險，不要只靠當下感覺。`;
 const social=`${profile.social}。${theme[0]}在人際面尤其明顯，遇到話說得漂亮的人，先觀察後續行動；真正可靠的關係通常經得起時間與細節。`;
 const health=`${profile.health}。${themeIndex===5?'外出尤其留意交通、腳步與周遭環境，避免趕路與分心。':themeIndex===7?'情緒累積時先離開高壓場景，讓自己恢復再處理問題。':'今天適合安排一段不被打擾的休息時間，讓身體把節奏調回來。'}`;
 const warning=`今日提醒：${theme[2]} ${themeIndex===1||themeIndex===13?'若出現讓你不舒服的人際訊號，先保留界線、核對事實，不需要急著貼標籤。':''}`;
 const action=`今日行動：挑一件最重要的事，在今天完成一個可以被確認的進度。晚上再回頭看一次，你會更容易知道明天該把力氣放在哪裡。`;
 const luckyColors=['月光銀','霧紫','深藍','香檳白','琥珀金','星霧灰'];
 return {version:2,sign:sign[0],english:sign[1],icon:sign[2],dateKey:date,themeIndex,theme:theme[0],scores,overall,opening,work,love,wealth,social,health,warning,action,luckyColor:luckyColors[(seed>>>23)%luckyColors.length],luckyNumber:1+(seed%9),keywords:[theme[0],profile.focus,'觀察','行動'],analysisId:`${signIndex+1}-${String(themeIndex+1).padStart(2,'0')}`,generatedAt:new Date().toISOString()};
}
function getSelected(){return localStorage.getItem(KEY)||'牡羊座'}
function setSelected(v){localStorage.setItem(KEY,v)}
function render(result){
 const root=document.getElementById('dailyFortuneRoot');if(!root)return; const today=dateKey()===result.dateKey;
 document.getElementById('todayDate').textContent=`${result.dateKey.replaceAll('-','/')} · ${today?'今日':'歷史'} · ${result.sign}`;
 const idx=zodiacIndex(result.sign);
 root.innerHTML=`<div class="fortune-main daily-fortune-main">
 <div class="daily-result-kicker">12 ZODIAC · DAILY ANALYSIS</div><h2>${esc(result.sign)} <span style="font-size:20px;opacity:.45">${esc(result.english)}</span></h2>
 <div class="daily-overall"><strong>${result.overall}</strong><span>/ 100</span></div><p class="section-description">${esc(result.opening)}</p>
 <div class="daily-score-row"><div class="daily-score-mini">工作<strong>${result.scores.work}</strong></div><div class="daily-score-mini">財運<strong>${result.scores.wealth}</strong></div><div class="daily-score-mini">感情<strong>${result.scores.love}</strong></div><div class="daily-score-mini">人際<strong>${result.scores.social}</strong></div><div class="daily-score-mini">生活<strong>${result.scores.health}</strong></div></div>
 <div class="daily-analysis"><div class="daily-analysis-grid"><article class="daily-analysis-card"><span>WORK · CAREER</span><h3>工作／學業</h3><p>${esc(result.work)}</p></article><article class="daily-analysis-card"><span>LOVE · RELATIONSHIP</span><h3>感情／關係</h3><p>${esc(result.love)}</p></article><article class="daily-analysis-card"><span>MONEY · RESOURCES</span><h3>財運／資源</h3><p>${esc(result.wealth)}</p></article><article class="daily-analysis-card"><span>SOCIAL · NETWORK</span><h3>人際／合作</h3><p>${esc(result.social)}</p></article><article class="daily-analysis-card"><span>BODY · RHYTHM</span><h3>健康／生活節奏</h3><p>${esc(result.health)}</p></article><article class="daily-analysis-card daily-warning"><span>NOTICE · RISK AWARENESS</span><h3>今日注意</h3><p>${esc(result.warning)}</p></article></div></div>
 <div class="daily-utility"><span class="daily-tag">幸運色：${esc(result.luckyColor)}</span><span class="daily-tag">幸運數字：${result.luckyNumber}</span>${result.keywords.map(x=>`<span class="daily-tag">${esc(x)}</span>`).join('')}</div>
 <div class="daily-analysis-card" style="margin-top:15px"><span>ACTION · NEXT STEP</span><h3>今天可以怎麼做</h3><p>${esc(result.action)}</p></div>
 <div class="daily-count">ANALYSIS ID ${esc(result.analysisId)} · 今日內容池：12 星座 × 20 主題 = 240 組</div>
 </div>`;
 document.querySelectorAll('.daily-zodiac-option').forEach(b=>b.classList.toggle('active',b.dataset.sign===result.sign));
}
function playStarDrop(done){
 const old=document.getElementById('dailyStarDrop'); if(old) old.remove();
 const el=document.createElement('div'); el.id='dailyStarDrop'; el.innerHTML='<div class="daily-drop-star">✦</div><div class="daily-drop-ground"></div>';
 document.body.appendChild(el); document.body.classList.add('daily-animation-lock');
 setTimeout(()=>{el.classList.add('active')},20);
 setTimeout(()=>{el.classList.add('landed')},900);
 setTimeout(()=>{el.classList.add('fade-out');document.body.classList.remove('daily-animation-lock');setTimeout(()=>{el.remove();done?.()},280)},1450);
}
function renderPicker(){
 const picker=document.getElementById('zodiacPicker'); if(!picker)return;
 picker.innerHTML=signs.map((s,i)=>`<button class="daily-zodiac-option" data-sign="${esc(s[0])}" type="button"><span class="z-icon">${s[2]}</span>${s[0]}<small>${s[3]}</small></button>`).join('');
 picker.addEventListener('click',e=>{const b=e.target.closest('.daily-zodiac-option');if(!b)return;setSelected(b.dataset.sign);playStarDrop(()=>render(build(zodiacIndex(b.dataset.sign),dateKey())))});
}
function init(){renderPicker();const idx=zodiacIndex(getSelected());playStarDrop(()=>render(build(idx<0?0:idx,dateKey())));let last=dateKey();setInterval(()=>{const now=dateKey();if(now!==last){last=now;const i=zodiacIndex(getSelected());render(build(i<0?0:i,now))}},15000)}
window.STAR_FATE_DAILY={build,dateKey,signs};document.addEventListener('DOMContentLoaded',init);
})();
