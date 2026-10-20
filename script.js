/* =========================================================
 * STAR FATE 全域設定（集中化配置，便於未來調整）
 * 所有模組優先讀取此處設定，覆蓋各自的預設值
 * ========================================================= */
(function initStarFateConfig(){
  const today=new Date(),ty=today.getFullYear();
  const CONFIG={
    version:'2.1.0',
    siteTitle:'星命籤｜STAR FATE',
    minBirthYear:1900,
    maxBirthYear:ty,
    todayISO:`${ty}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`,
    luckyColors:['深藍','香檳白','月光銀','靛紫','星霧灰','琥珀金','午夜藍','霧玫瑰'],
    luckyKeywords:['轉機','聚焦','整理','靠近','突破','穩定','連結','開展'],
    luckyDirections:['東南','正東','西南','正北','東北','西北'],
    dailyFortuneSalt:'STAR-FATE-DAILY-2026-V1',
    quickQuestions:[
      {icon:'♡',label:'愛情',text:'他還在乎我嗎？'},
      {icon:'◇',label:'事業',text:'今年適合換工作嗎？'},
      {icon:'◎',label:'財運',text:'最近我的財運會變好嗎？'},
      {icon:'☾',label:'人生',text:'我現在走的路是對的嗎？'}
    ],
    theme:{
      bg:'#070914',
      bgElev:'#0c1020',
      gold:'#dec991',
      goldDim:'#c9b379',
      goldSoft:'#e3cf9b',
      text:'#eee9dc',
      muted:'#aaa7b5',
      dim:'#797685',
      borderSoft:'rgba(255,255,255,.08)',
      borderGoldSoft:'rgba(220,205,166,.16)',
      borderGold:'rgba(220,205,166,.38)'
    }
  };
  window.STAR_FATE_CONFIG=CONFIG;
  Object.freeze?Object.freeze(CONFIG):null;
})();

const zodiacData = [
  ["♈","牡羊座","3/21－4/19"],["♉","金牛座","4/20－5/20"],["♊","雙子座","5/21－6/20"],
  ["♋","巨蟹座","6/21－7/22"],["♌","獅子座","7/23－8/22"],["♍","處女座","8/23－9/22"],
  ["♎","天秤座","9/23－10/22"],["♏","天蠍座","10/23－11/21"],["♐","射手座","11/22－12/21"],
  ["♑","摩羯座","12/22－1/19"],["♒","水瓶座","1/20－2/18"],["♓","雙魚座","2/19－3/20"]
];
const animals=["鼠","牛","虎","兔","龍","蛇","馬","羊","猴","雞","狗","豬"];
const animalIcons=["🐀","🐂","🐅","🐇","🐉","🐍","🐎","🐑","🐒","🐓","🐕","🐖"];

const titles=["月下未明","舊夢新枝","逆風之燈","潮汐回聲","靜默之門","星火未熄","遠方來信","黎明之前"];
const subtitles=[
 "有些答案，不需要急著知道。",
 "你以為結束的事情，也許正在換一種方式開始。",
 "真正的方向，往往藏在最不舒服的選擇裡。",
 "有些人來去如潮，但留下的痕跡比你想像得久。",
 "你站在門前很久了，只差一次轉動把手。",
 "你沒有失去光，只是曾經把它藏得太深。",
 "有個答案正在靠近，只是它還沒有用你熟悉的方式出現。",
 "最黑的時候，不代表天亮不會來。"
];
const quotes=[
 "「你不是沒有答案，只是那個答案並不是你希望聽見的。」",
 "「有些人出現在生命裡，不是為了留下，而是讓你知道自己真正想留下的是什麼。」",
 "「你真正害怕的，往往不是失去，而是承認自己其實已經想改變。」",
 "「有些關係沒有壞掉，只是它已經完成了曾經的任務。」",
 "「你一直在等一個訊號，其實你的猶豫本身就是訊號。」",
 "「別急著證明自己。真正屬於你的東西，不需要你一直追趕。」",
 "「你以為自己走得太慢，也許只是這條路不適合用奔跑的方式走。」",
 "「如果一扇門讓你反覆懷疑自己，也許值得看看窗外。」"
];
const keywords=["選擇","坦白","勇氣","放下","等待","轉身","相信","重新開始"];

const baseTexts=[
`最近的你，心裡其實有一件事情反覆出現。
你可能沒有每天想它，但某些安靜的時刻，它總會自己回來。

你表面上看起來已經接受了現況，心裡卻仍保留著一個「如果當時……」。
這不是脆弱，而是你正在替過去尋找一個能夠被理解的位置。

命運給你的訊號並不強烈。
它比較像夜裡遠處的一盞燈——不會替你走路，卻讓你知道前方還有路。

接下來一段時間，真正重要的不是得到所有答案，而是停止對自己說謊。`,
`你最近可能比自己承認的更累。
不是身體上的疲憊，而是一直猜測、一直衡量、一直想著「這樣做是不是比較好」。

你習慣把事情想得很完整，所以別人常以為你很冷靜。
但只有你知道，有些選擇其實已經在心裡打了很多次仗。

命運提醒你：不要把「不做決定」誤認成「維持現狀」。
時間本身也是一種選擇。

有一個小小的行動，會比十個晚上反覆思考更接近答案。`,
`你正在進入一個重新整理自己的階段。
某些以前非常在意的事情，開始沒有那麼重要；某些曾經忽略的事情，反而慢慢浮上來。

這種變化可能讓你有點不習慣。
因為你熟悉的自己正在改變，而新的自己還沒有完全成形。

不要急著替這段變化命名。
人不是履歷表，不需要每一頁都馬上知道下一頁要寫什麼。

你現在需要的是空間，而不是更多噪音。`,
`有一件事情，你可能已經觀察很久。
你知道它有問題，也知道自己其實有能力處理，只是一直在等「最適合的時機」。

但命運很少把完美時機放在門口。
更多時候，它只給你一個普通的星期二、一個有點緊張的晚上，然後問你：「現在呢？」

如果最近有人或某件事情讓你反覆思考，那並不是毫無意義。
它正在提醒你，你真正重視的是什麼。`,
`你的路線正在出現分岔。
其中一條比較熟悉，另一條比較陌生。

熟悉的路不一定錯，陌生的路也不一定比較好。
真正的關鍵，是哪一條路上的你，比較像你自己。

最近不要只問「這樣會不會成功」。
也問一句：「就算沒有人稱讚我，我還願不願意做？」

答案會比任何漂亮的預言更有用。`,
`你身上有一種很容易被忽略的力量：你比自己想像中更能撐過事情。

只是長期撐著，也會讓人忘記自己其實可以停下來。

如果最近你感覺某段關係、某份工作或某種生活方式正在消耗你，不必立刻做出巨大改變。
先承認它存在，就已經是第一步。

真正的恢復，不是變回以前的自己，而是允許自己成為新的樣子。`,
`你可能正在等待一個人、一個機會，或者一個明確的答案。
但真正值得留意的，可能不是它什麼時候來，而是它來之前的你正在變成什麼樣子。

很多事情之所以沒有發生，不代表你被遺忘。
有時候只是條件還沒有成熟。

保持開放，但不要把人生暫停在等待裡。
你可以一邊等待，一邊繼續生活。`,
`最後這一籤談的不是幸運，而是清醒。

你可能會發現，某些事情並沒有像想像中那麼可怕。
真正讓你害怕的，是一旦承認自己的心意，就必須開始面對後果。

可人生就是這樣。
答案之所以珍貴，不是因為它永遠正確，而是它讓你終於可以往前走。

今晚如果只能記住一句話：不要為了維持一個熟悉的故事，而拒絕寫下一章。`
];

const advice=[
"今天適合把一件拖了很久的小事做完。不要追求完美，只要開始。",
"如果你正在等待某人的回應，先把自己的生活拿回來。你不需要把全部情緒交給一個通知。",
"最近適合整理房間、手機、工作清單或人際關係。外在變乾淨，心裡通常也會多一點空間。",
"遇到選擇時，先排除那個會讓你長期後悔的選項。剩下的路通常沒有想像中那麼可怕。",
"不要因為一次失敗就替自己下結論。你只是得到了一個「這條方法不行」的答案。",
"今天適合說一句真話。可以溫柔，但不要模糊。",
"如果有人讓你一直懷疑自己的價值，請記得：關係的存在不是用來證明你值得被愛。",
"給自己一個新的開始，不需要等到下個月、明年或某個漂亮的日期。"
];

function renderZodiac(){
  const grid=document.getElementById("zodiacGrid");
  if(!grid)return;
  grid.innerHTML=zodiacData.map((z,i)=>`<div class="zodiac-card" title="${z[1]}"><div class="zodiac-icon">${z[0]}</div><div class="zodiac-name">${z[1]}</div><div class="zodiac-date">${z[2]}</div></div>`).join("");
}
renderZodiac();

function getZodiac(month,day){
  const dates=[
    [3,21,4,19],[4,20,5,20],[5,21,6,20],[6,21,7,22],[7,23,8,22],[8,23,9,22],
    [9,23,10,22],[10,23,11,21],[11,22,12,21],[12,22,1,19],[1,20,2,18],[2,19,3,20]
  ];
  for(let i=0;i<dates.length;i++){
    const [sm,sd,em,ed]=dates[i];
    if((month===sm&&day>=sd)||(month===em&&day<=ed)){
      return zodiacData[i][1];
    }
  }
  return "";
}

function getAnimal(year){
  return animals[((year-4)%12+12)%12];
}

function updateBirthInfo(){
  const CONFIG=window.STAR_FATE_CONFIG||{};
  const MIN_YEAR=Number(CONFIG.minBirthYear)||1900;
  const y=Number(document.getElementById("birthYear").value);
  const m=Number(document.getElementById("birthMonth").value);
  const d=Number(document.getElementById("birthDay").value);
  if(y>=MIN_YEAR&&y<=new Date().getFullYear()) document.getElementById("animalResult").textContent=animalIcons[((y-4)%12+12)%12]+" "+getAnimal(y);
  else document.getElementById("animalResult").textContent="等待出生年份";
  if(m>=1&&m<=12&&d>=1&&d<=31){
    const z=getZodiac(m,d);
    document.getElementById("zodiacResult").textContent=z||"請確認日期";
  }else document.getElementById("zodiacResult").textContent="等待出生日期";
}
["birthYear","birthMonth","birthDay"].forEach(id=>{const el=document.getElementById(id);if(el)el.addEventListener("input",updateBirthInfo)});

function setQuestion(q){document.getElementById("question").value=q;document.getElementById("question").focus();}
function scrollToOracle(){document.getElementById("oracle").scrollIntoView({behavior:"smooth"});}

function getCategory(q){
  q=q.toLowerCase();
  if(/愛|感情|戀|喜歡|男友|女友|曖昧|正緣|復合|分手|他|她/.test(q)) return "愛情";
  if(/工作|職|事業|公司|老闆|同事|升職|轉職|面試|創業/.test(q)) return "事業";
  if(/錢|財|收入|薪水|投資|賺|存款|生意/.test(q)) return "財運";
  if(/朋友|人際|家人|父母|兄弟|姊妹|相處/.test(q)) return "人際";
  return "人生";
}

function seededIndex(year,month,day,question){
  let n=year*31+month*17+day*13;
  for(let i=0;i<question.length;i++) n=(n*31+question.charCodeAt(i))%1000003;
  return Math.abs(n)%48;
}

function score(seed,offset){
  return 55+((seed*17+offset*29)%42);
}

// 個人占卜的唯一入口由 fortune-engine.js 提供 window.drawFortune。

function legacyDrawAgain(){if(window.drawFortune)window.drawFortune();}
function backToOracle(){
  document.getElementById("result").classList.remove("active");
  document.getElementById("oracle").style.display="";
  document.getElementById("oracle").scrollIntoView({behavior:"smooth"});
}


// CSP-safe handlers for the homepage oracle controls.
(function bindIndexActions(){
  const bind=()=>{
    document.querySelectorAll('[data-sf-question]').forEach(btn=>btn.addEventListener('click',()=>setQuestion(btn.dataset.sfQuestion)));
    const start=document.querySelector('[data-sf-action="scroll-oracle"]');
    if(start)start.addEventListener('click',scrollToOracle);
    const draw=document.querySelector('[data-sf-action="draw-fortune"]');
    if(draw)draw.addEventListener('click',()=>window.drawFortune?.());
    const again=document.querySelector('[data-sf-action="draw-again"]');
    if(again)again.addEventListener('click',()=>window.drawAgain?.());
    const back=document.querySelector('[data-sf-action="back-oracle"]');
    if(back)back.addEventListener('click',backToOracle);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();
