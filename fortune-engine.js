/* STAR FATE deterministic destiny-star engine + cinematic reveal */
(function(){
  const safe=(v)=>String(v??'').trim();
  const hash=(text)=>{let h=2166136261>>>0;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
  const buildSeed=(data)=>hash([data.year,data.month,data.day,data.time,data.gender,data.blood,data.zodiac,data.animal].join('|'));
  const pick=(seed,len)=>seed%len;
  const score=(seed,offset)=>55+((seed*17+offset*29)%42);
  const category=(q)=>{q=safe(q).toLowerCase();if(/愛|感情|戀|喜歡|男友|女友|曖昧|正緣|復合|分手|他|她/.test(q))return'感情';if(/工作|職|事業|公司|老闆|同事|升職|轉職|面試|創業/.test(q))return'事業';if(/錢|財|收入|薪水|投資|賺|存款|生意/.test(q))return'財運';if(/朋友|人際|家人|父母|兄弟|姊妹|相處/.test(q))return'人際';return'人生'};
  const SINGLE_VARIANTS=[
    {name:'看清關係',love:'這一版特別把注意力放在你如何愛人、如何接受愛，以及你在關係裡最容易誤會自己的地方。你真正需要的通常不是更強烈的情緒，而是更穩定的回應。當一個人讓你長期猜測、忽冷忽熱，或只有在你主動時才靠近，請不要把那種不確定誤認成心動。真正適合你的關係，會讓你逐漸放鬆，而不是每天都在解讀訊號。',money:'財運部分提醒你，收入高低只是表面，更重要的是你能不能把能力變成可重複的價值。你可能有一種先把事情做好、之後再談報酬的傾向，但長期下來容易讓自己的時間被低估。接下來若有加薪、接案、合作或創業機會，請先把價格、範圍、責任與付款條件說清楚。錢不是俗氣的問題，模糊的金錢界線才容易成為關係與工作的問題。',self:'自我探索的核心是：你到底是在追求自己想要的人生，還是在努力成為一個「看起來應該成功」的人？你可能已經知道自己不喜歡什麼，但還沒有把真正想要的生活說得足夠具體。不要急著找到唯一答案，先確認什麼事情做久了仍然讓你覺得值得。當你開始把時間留給真正重要的事情，你會比一直尋找新的方向更快找到方向。',action:'接下來三十天，請只做一件能同時改善生活與自我信任的事情：把一個反覆拖延的問題寫下來，拆成三個可完成的小步驟，並在本週完成第一步。不要等待完美的時機。'},
    {name:'重新定位',love:'感情上你需要重新定義「被愛」這件事。不是對方每天說多少甜言蜜語，而是對方是否願意在重要時刻出現、是否尊重你的界線、是否願意把問題拿到桌面上談。若你目前單身，不要因為寂寞就降低標準；若你正在一段關係裡，也不要因為害怕失去而把所有需求吞回去。真正健康的靠近，是兩個人都可以保持自己，同時願意為彼此調整。',money:'財運並不是突然發財的故事，而是你如何管理選擇的故事。近期尤其適合重新盤點固定支出、收入來源與那些看似小卻持續流失的成本。如果你正在考慮投資、轉職或創業，先問自己最壞情況能不能承受，再談報酬率。你的財務優勢來自穩定累積，而不是一次押中。能守住現金流的人，才有資格等待真正值得下注的機會。',self:'你現在最需要的不是更多別人的意見，而是建立自己的判斷標準。當你每遇到選擇就問「別人會怎麼看」，你很容易把人生交給外界評分。請開始記錄三件讓你感到有成就感、三件讓你長期消耗、三件即使沒人稱讚你仍願意做的事情。這三組答案會比任何一句漂亮的命理形容更接近真正的你。',action:'今天就把你目前最重要的一個選擇寫成「我要的是什麼／我不接受什麼／我願意付出什麼代價」三欄，答案越具體，下一步就越清楚。'},
    {name:'界線課題',love:'你在感情裡容易把理解變成包容，把包容變成退讓，最後才發現自己已經委屈很久。這次的提醒很直接：喜歡一個人，不代表要替對方解釋所有不合理的行為。你可以體諒對方有難處，但仍然要求基本的尊重、誠實與一致。如果一段關係只能靠你不斷降低需求才能維持，那麼真正需要被檢討的不是你的需求，而是這段關係的結構。',money:'金錢上的界線也值得注意。你可能不喜歡談價格、不好意思拒絕別人的要求，或容易因為情面答應不划算的合作。長期來看，這會讓你把善良變成成本。請開始把「朋友」與「合作夥伴」分開，把「想幫忙」與「必須負責」分開。真正成熟的財務觀，不是只會賺錢，而是知道什麼錢可以收、什麼錢不能亂花、什麼合作根本不值得接。',self:'自我探索的重點，是承認你其實比自己想像中更有主見。你真正困住自己的地方，可能不是能力不足，而是害怕做出選擇後讓別人失望。可是每一次為了避免別人失望而放棄自己，最後都會變成對自己的失望。你可以溫柔，也可以堅定；成熟不是變得冷漠，而是知道什麼事情值得堅持。',action:'本週至少拒絕一件你其實不想答應的事情。拒絕時不用寫長篇理由，只要清楚、禮貌、完整地表達即可。'},
    {name:'行動窗口',love:'感情上，現在最忌諱一直等待對方先表態。你如果有想說的話，應該把猜測轉成一次成熟的對話；如果對方長期沒有回應，也要允許自己接受這就是答案的一部分。單身者適合增加真實互動，不要只停留在訊息與想像；有伴者則適合討論下一階段的生活安排。感情不是靠預測走遠，而是靠兩個人一次又一次做出選擇。',money:'財運上是可以動的一段時間，但「動」不等於衝動。適合整理作品集、談合作、爭取加薪、建立第二收入，或把已經有能力完成的服務正式商品化。若你有創業想法，先用小規模測試驗證需求，再決定是否投入更多成本。真正的機會通常不會要求你一次把全部籌碼押上。',self:'你的成長關鍵在於從「我應該準備好了嗎」轉成「我能不能先做一個小版本」。很多人不是輸在能力，而是輸在一直把開始延後。你不需要一次改變人生，只需要讓今天的你比昨天更靠近那個想成為的人。行動會產生新的資訊，而資訊會讓你做出更好的決定。',action:'選一件你已經思考超過兩週的事情，設定七天測試期，不求結果完美，只求拿到真實回饋。'},
    {name:'慢下來',love:'感情上不要把速度當成真心的證明。有人很快靠近，也有人需要時間建立信任；真正重要的是對方是否持續一致。如果你正在曖昧，不要因為幾次熱烈互動就急著定義未來；如果你正在關係裡，也不要用一次爭吵判定整段關係。先看模式，再看單一事件。你需要的是能夠長期相處的安全感，而不是短時間內讓心跳很快的人。',money:'財運方面更適合穩健，而不是追逐短期刺激。任何看起來「現在不買就會錯過」的機會，都值得多問一次：我真的理解它嗎？最壞情況是什麼？這筆錢即使暫時拿不回來，我能不能承受？把這三個問題問完，通常能替你避掉很多情緒性決策。穩定的現金流與可預期的支出，比漂亮的帳面報酬更重要。',self:'你可能正在從一個過度用力的階段退下來。過去你也許習慣靠努力證明價值，現在則需要學習辨認「值得努力」與「只是害怕停下來」。休息不是退步，重新整理也不是浪費時間。當你的生活空間變乾淨，你會更容易聽見自己的真正想法。',action:'給自己一週的「減法實驗」：刪掉一個無效承諾、一個不必要支出、一個每天消耗注意力的習慣，觀察你的狀態會怎麼變。'},
    {name:'真實選擇',love:'感情裡最需要被處理的，是你真正想要什麼，而不是誰比較喜歡你。你可能容易被有吸引力的人牽動，但長期幸福需要的是價值觀、生活方式與情緒安全能不能對上。如果對方讓你一直懷疑自己的價值，這不是高級的愛情；如果一個人能讓你安心做自己，反而更值得認真看待。別再用「他到底愛不愛我」取代「這段關係適不適合我」。',money:'財運的關鍵在於價值交換。你有能力，但是否有把能力包裝、定價並讓市場看見？如果收入卡住，先不要只怪環境，也看看自己是否缺少清楚的產品、專業定位或談判習慣。錢會放大你的選擇：當你知道自己提供什麼價值，就比較不容易因為急著成交而犧牲長期利益。',self:'這是一個適合重新寫人生規則的階段。你可以保留家人、朋友、社會期待帶給你的好東西，但不必把所有規則照單全收。你真正需要建立的是自己的成功定義：什麼叫做有錢、什麼叫做自由、什麼叫做幸福、什麼叫做值得。沒有自己的定義，就很容易一直追別人的標準。',action:'寫下你的「五年後理想生活」時，不要寫職稱或頭銜，改寫每天怎麼生活、和誰相處、時間花在哪裡、收入從哪裡來。'},
    {name:'轉化成長',love:'你在感情裡的下一個成長，不是找到一個永遠不會讓你受傷的人，而是建立即使遇到問題，也能保護自己、說出需求並做出選擇的能力。過去的關係經驗可以是資料，不必成為判決。如果曾經被忽略，不代表下一個人也會忽略你；如果曾經失敗，也不代表你沒有愛人的能力。真正的成熟，是從經驗中學會辨識，而不是從經驗中學會恐懼。',money:'財運與你的自我價值感有很深的關係。當你覺得自己不夠好，就容易低估價格；當你害怕失去機會，就容易接受不公平的條件。接下來應該練習把收入當成系統，而不是運氣：固定儲蓄、分散收入來源、提升可變現技能、建立緊急預備金。真正讓人自由的不是某一次賺很多，而是有能力在不順時仍然保持選擇。',self:'你正在進入一個「重新認識自己」的階段。以前有效的方法，現在可能已經不適用；以前追求的東西，現在可能也沒有那麼重要。這不是迷失，而是更新。允許自己改變答案，允許自己承認曾經選錯，也允許自己重新開始。人生不是一次性的企劃案，沒有必要為舊版本的自己一直續約。',action:'整理過去一年最重要的三次失敗與三次成功，每一件都寫下「我學到什麼、我現在會怎麼做」，把經驗變成下一階段的決策資產。'},
    {name:'長期建設',love:'如果你想要的是穩定關係，那麼接下來比浪漫更重要的是一致。看對方是否願意一起規劃生活、處理金錢、面對衝突、尊重彼此的工作與私人空間。單身者也應該先把自己的生活建立好，因為當你沒有自己的節奏，就很容易把戀愛變成全部。好的關係不是互相填補空洞，而是兩個完整的人願意共享人生。',money:'財運最值得投資的地方，是能持續產生收入的能力。你可以把錢放進短期享受，也可以拿一部分建立技能、設備、作品、品牌、人脈或可複製的系統。這顆命運星更支持後者。尤其如果你有創作、專業或個人品牌，現在比起追逐快速曝光，更值得建立長期資產。慢一點沒有關係，前提是方向正確。',self:'人生方向正在從「證明自己」轉向「建立自己的世界」。這兩件事看起來很像，實際上完全不同。證明自己需要觀眾，建立自己的世界需要系統。你需要開始思考：哪些事情可以累積、哪些關係值得經營、哪些能力可以變成長期資產。當你開始建立自己的系統，外界的評價會慢慢變成參考，而不是命令。',action:'選一項能力，制定九十天累積計畫；每週固定投入時間，留下作品或紀錄。三個月後，你會看到真正的差距不是天賦，而是累積。'}
  ];
  const buildSingleReading=(star,data,seed)=>{
    const variant=SINGLE_VARIANTS[seed%SINGLE_VARIANTS.length], idx=seed%480;
    const focus=variant.name;
    const question=data.question?`你這次提出的問題是「${data.question}」。因此這份解讀不會只回答表面上的吉凶，而是把問題背後真正需要被看見的需求一起放進來。請注意，你不需要把任何一句話當成注定發生的事件；更值得參考的是其中指出的行為模式、選擇與盲點。`:'這次沒有指定問題，因此解讀會從你的整體狀態切入。你可以把它當成一份自我盤點，而不是不可改變的預言。真正有價值的地方，是它能不能幫你把模糊的感受說清楚。';
    const identity=`你的命運星是 ${star.name}（${star.english}），這顆星代表「${star.symbol}」。從 ${data.zodiac}、${data.animal}、${data.blood} 型與你目前的提問放在一起看，最值得留意的不是某一個標籤，而是你在面對選擇時反覆出現的節奏。${star.personality} 你可能比自己承認的更在意掌控感與方向感；一旦事情失去預期，你就容易開始反覆分析。這份結果給你的第一個提醒是：不要把想得很清楚誤認成真的做出選擇。很多答案必須透過行動才能驗證。`;
    const love=`【感情｜${focus}】\n${variant.love}\n\n再往深一層看，${star.love}。如果你目前有對象，請觀察三件事：對方是否願意回應你的重要需求、遇到問題時是否願意處理、以及你在這段關係裡能不能保留自己的生活。如果三件事長期都做不到，就不要只靠回憶與想像替關係續命。如果你單身，則不需要急著問「何時遇到正緣」，更重要的是你現在是否知道自己不能接受什麼、真正重視什麼。當標準清楚，你遇見的人才更容易被你正確辨識。`;
    const money=`【財運｜${focus}】\n${variant.money}\n\n${star.career} 這裡也提醒你，收入往往與你的專業定位、談判能力與長期累積有關。如果你最近正在換工作、接案、創業或考慮新的收入來源，不要只看表面的金額，還要計算時間成本、風險、可持續性與未來成長空間。尤其不要為了證明自己而免費做太多事情，也不要因為害怕失去機會就接受不合理條件。你的財運真正變好的訊號，是你開始能夠更清楚地管理自己的時間、能力與現金流。`;
    const self=`【自我探索｜${focus}】\n${variant.self}\n\n${star.reminder} 你可以把這句話當成這次占卜的核心問題：如果沒有人知道你的選擇，你還會選同一條路嗎？如果答案是會，代表這件事很可能真的重要；如果答案是不會，那麼你需要重新檢查自己是不是被比較、期待或恐懼推著走。自我探索不是一直挖掘缺點，而是越來越清楚知道自己的優勢、界線、價值觀與真正願意承擔的代價。`;
    const action=`【直接建議】\n${variant.action}\n\n最後給你一個很實際的判斷標準：接下來遇到感情、金錢或人生選擇時，不要只問「這件事好不好」，改問「它會把我帶向哪一種生活」。如果答案讓你更自由、更穩定、更有能力、更接近自己，就值得投入；如果它只讓你短暫舒服，卻長期消耗你的時間、尊嚴與選擇權，就應該重新評估。`;
    const summaryTemplates=[
      `你的命運星${star.name}把「${focus}」放在這次結果的中心。感情上要看清自己的需求與界線，財運上要把能力、時間與金錢管理好，自我探索則要停止只迎合外界標準。${star.reminder}這不是替你下定論，而是提醒你把選擇權拿回來。`,
      `這顆${star.constellation}的命運星提醒你：${star.symbol}不是一句漂亮形容，而是一種需要被實踐的生活方式。感情要看一致性，財運要看長期累積，自我成長要看你是否真的願意改變。${star.reminder}近期最重要的不是求快，而是做對下一步。`,
      `如果把這次占卜濃縮成一句話，就是「${focus}」。你在感情裡要更誠實，在財務上要更務實，在自我探索上要更相信自己的判斷。${star.personality}${star.reminder}請把這份結果當成一面鏡子，留下真正符合你現況的部分，再用行動驗證。`,
      `這次的重點不是預測某件事何時發生，而是看見你現在的選擇模式。${focus}會同時影響你的感情、財運與人生方向：關係需要清楚、金錢需要紀律、成長需要行動。${star.reminder}當你開始做出更符合自己價值觀的選擇，結果才會真正改變。`,
      `命運星${star.name}帶來的核心提醒很直接：你不需要把所有答案一次找完，但必須停止逃避真正重要的問題。感情請看尊重與回應，財運請看現金流與價值交換，自我探索請看你真正想要的生活。${star.reminder}先處理最重要的一件事，方向自然會變清楚。`,
      `這份結果比較像一個人生檢查點。${focus}代表你現在值得重新整理的課題：感情不要只看情緒，財運不要只看收入，自我探索不要只看別人怎麼評價你。${star.personality}${star.reminder}你真正需要的不是更多預言，而是更好的判斷標準。`,
      `從${star.name}的象徵來看，這次最值得留意的是「${star.symbol}」。它落在感情上是關係品質，落在財運上是資源配置，落在自我探索上則是選擇與界線。${star.reminder}接下來不必急著證明自己，只要讓每一個重要決定更接近你想過的生活。`,
      `如果你最近正卡在選擇裡，這個結果給你的方向很清楚：先把「我真正要什麼」說明白，再決定要付出多少代價。感情需要真實，財運需要穩定，自我探索需要勇氣。${star.reminder}${focus}不是終點，而是你下一階段可以開始練習的能力。`
    ];
    const summary=summaryTemplates[(seed>>3)%summaryTemplates.length];
    return {resultId:`SINGLE-${String(idx+1).padStart(3,'0')}`,variant:focus,personality:identity,summary,love,money,self,career:money,social:self,notice:action,message:action};
  };
  const buildSingleCatalog=()=>{const out=[];for(let starIndex=0;starIndex<60;starIndex++)for(let v=0;v<8;v++)out.push({resultId:`SINGLE-${String(starIndex*8+v+1).padStart(3,'0')}`,starIndex,variant:v});return out};
  window.STAR_FATE_SINGLE_RESULT_CATALOG=buildSingleCatalog();
  const interpretation=(star,data,seed)=>buildSingleReading(star,data,seed);
  function collect(){
    const yearRaw=document.getElementById('birthYear')?.value??'',
          monthRaw=document.getElementById('birthMonth')?.value??'',
          dayRaw=document.getElementById('birthDay')?.value??'';
    const gender=document.querySelector('input[name="gender"]:checked')?.value??'',
          blood=document.querySelector('input[name="blood"]:checked')?.value??'',
          time=(()=>{const h=document.getElementById('birthHour')?.value||'不詳',m=document.getElementById('birthMinute')?.value||'不詳';return(h==='不詳'||m==='不詳')?'不詳':`${h}:${m}`})(),
          question=safe(document.getElementById('question')?.value);

    const v=window.validateSingleBirthDate?.(yearRaw,monthRaw,dayRaw);
    if(!v){
      console.error('[STAR FATE] 個人占卜日期驗證器未載入。');
      alert('占卜資料建立失敗，請重新整理頁面後再試。');
      return null;
    }
    if(!v.ok){alert(v.message||'出生日期格式不正確。');return null;}
    if(!gender||!blood||!question){
      alert('請完成所有必要資料。');
      return null;
    }

    const zodiac=window.getZodiac?.(v.month,v.day),
          animal=window.getAnimal?.(v.year);
    if(!zodiac||!animal){
      console.error('[STAR FATE] 個人占卜資料建立失敗：星座／生肖計算結果為空。',{year:v.year,month:v.month,day:v.day,zodiac,animal});
      alert('占卜資料建立失敗，請重新輸入。');
      return null;
    }

    const data={year:v.year,month:v.month,day:v.day,birthDate:v.iso,time,gender,blood,question,zodiac,animal};
    console.log('PERSONAL DIVINATION DATA',data);
    window.__starFatePersonalData=data;
    return data;
  }

  function createOverlay(){
    let el=document.getElementById('destinyOverlay');
    if(el)return el;
    el=document.createElement('div');
    el.id='destinyOverlay';
    el.className='destiny-overlay';
    el.innerHTML=`
      <canvas id="destinyCanvas" class="destiny-canvas" aria-hidden="true"></canvas>
      <div class="destiny-vignette" aria-hidden="true"></div>
      <div class="destiny-hud">
        <div class="destiny-step" id="destinyStep">STEP 01</div>
        <h2 id="destinyText">正在建立你的命運座標</h2>
        <p id="destinyEn">BUILDING YOUR DESTINY COORDINATE</p>
        <div class="destiny-progress"><i id="destinyProgress"></i></div>
      </div>`;
    document.body.appendChild(el);
    return el;
  }
  function setStep(overlay,step,text,en,pct){
    const stepEl=overlay.querySelector('#destinyStep'),textEl=overlay.querySelector('#destinyText'),enEl=overlay.querySelector('#destinyEn'),bar=overlay.querySelector('#destinyProgress');
    stepEl.textContent=step;textEl.textContent=text;enEl.textContent=en;bar.style.width=pct+'%';
    textEl.classList.remove('destiny-copy-in');void textEl.offsetWidth;textEl.classList.add('destiny-copy-in');
  }
  function buildStarField(){ return null; }
  function showStarResult(star,data,seed){
    const result=document.getElementById('result');result.classList.add('active');document.getElementById('loading').classList.remove('active');document.getElementById('oracle').style.display='none';
    const reading=interpretation(star,data,seed),scores=[score(seed,1),score(seed,2),score(seed,3),score(seed,4)];
    document.getElementById('fortuneNumber').textContent=String(Number(star.id.replace('STAR-',''))).padStart(3,'0');document.getElementById('fortuneTitle').textContent=star.name;document.getElementById('fortuneSubtitle').textContent=reading.variant+' · '+star.english;document.getElementById('resultZodiac').textContent=data.zodiac;document.getElementById('resultAnimal').textContent=data.animal;document.getElementById('resultBlood').textContent=data.blood;document.getElementById('fortuneQuote').textContent=`「${star.symbol}」`;
    ['love','career','money','social'].forEach((id,i)=>{document.getElementById(id+'Score').textContent=scores[i]+'%';document.getElementById(id+'Bar').style.width=scores[i]+'%'});
    document.getElementById('fortuneKeyword').textContent=star.symbol.split('、')[0];
    document.getElementById('fortuneSummary').textContent=reading.summary;
    let panel=document.getElementById('destinyStarPanel');if(!panel){panel=document.createElement('section');panel.id='destinyStarPanel';panel.className='destiny-star-panel';document.querySelector('#result .result-card').insertBefore(panel,document.querySelector('#result .result-content'))}
    panel.innerHTML=`<div class="star-result-kicker">你的命運星</div><div class="star-orb"><span>✦</span></div><div class="star-id">${star.id} · 結果 ${reading.resultId}</div><h2>${star.name}</h2><div class="star-english">${star.english}</div><div class="star-meta"><div><span>星座</span><strong>${star.constellation}</strong></div><div><span>天文分類</span><strong>${star.classification}</strong></div><div><span>距離</span><strong>${star.distance}</strong></div><div><span>亮度</span><strong>${star.magnitude}</strong></div></div><div class="star-detail"><h3>名稱來源與命名原因</h3><p>${star.namingReason||star.origin}</p><h3>發現／記錄故事</h3><p>${star.discoveryStory||'這顆星沒有單一現代「發現者」；它在望遠鏡時代以前便已被人類觀測與記錄，後來才由現代天文學建立標準資料。'}</p><h3>這顆星的故事</h3><p>${star.starStory||star.culture}</p><h3>位置資訊</h3><p>${star.position}</p><h3>文化背景</h3><p>${star.culture}</p><h3>代表意義</h3><p>${star.symbol}</p><h3>完整判讀</h3><p>${reading.personality}</p><h3>感情</h3><p>${reading.love}</p><h3>財運</h3><p>${reading.money}</p><h3>自我探索</h3><p>${reading.self}</p><h3>直接建議</h3><p>${reading.notice}</p></div><div class="favorite-inline"><button id="favoriteCurrentBtn" type="button" data-sf-fortune-action="toggle-favorite">☆ 收藏這顆星</button><button type="button" data-sf-fortune-action="save-current">保存到我的占卜</button><a class="cta-button" href="account.html">查看我的占卜</a></div><p class="star-source-note">天文資料採用真實恆星資訊；本站結果內容用於自我觀察、問題整理與生活參考，不構成專業醫療、法律或財務建議。</p>`;
    window.__starFateCurrent={star,data,seed,interpretation:reading};
    const favoriteBtn=panel.querySelector('[data-sf-fortune-action="toggle-favorite"]'),saveBtn=panel.querySelector('[data-sf-fortune-action="save-current"]');if(favoriteBtn)favoriteBtn.addEventListener('click',()=>window.toggleCurrentFavorite?.());if(saveBtn)saveBtn.addEventListener('click',()=>window.saveCurrentFortune?.());
    if(window.currentUser?.()&&window.saveFortuneHistory){const recent=window.userHistory?.()[0],same=recent&&recent.star?.id===star.id&&recent.interpretation?.resultId===reading.resultId&&recent.birth?.date===`${data.year}/${String(data.month).padStart(2,'0')}/${String(data.day).padStart(2,'0')}`;if(!same)window.saveFortuneHistory({date:new Date().toISOString(),birth:{date:`${data.year}/${String(data.month).padStart(2,'0')}/${String(data.day).padStart(2,'0')}`,time:data.time,gender:data.gender,blood:data.blood,zodiac:data.zodiac,animal:data.animal},star,question:data.question,interpretation:reading});}
    if(window.renderSharePanel){let share=document.getElementById('sharePanel');if(!share){share=document.createElement('section');share.id='sharePanel';share.className='share-panel';result.querySelector('.result-card').appendChild(share)}window.renderSharePanel();}
    if(window.updateCurrentFavoriteButton)window.updateCurrentFavoriteButton();window.scrollTo({top:result.offsetTop-35,behavior:'smooth'});
  }
  function runAnimation(data,star,seed){
    const overlay=createOverlay();
    const canvas=overlay.querySelector('#destinyCanvas'),ctx=canvas.getContext('2d',{alpha:false,desynchronized:true});
    if(!ctx){showStarResult(star,data,seed);return}
    overlay.classList.add('active');document.body.classList.add('destiny-lock');
    const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const quality=Math.min(1,Math.max(.45,(navigator.hardwareConcurrency||4)/8));
    const starCount=Math.round((reduced?90:Math.min(180,Math.max(105,130*quality))));
    const stars=[];let w=0,h=0,dpr=1,last=performance.now(),raf=0,start=last,disposed=false;
    const targetAngle=((seed%1000)/1000)*Math.PI*2-Math.PI;
    const targetBias=Math.sin(targetAngle)*.32;
    const targetTilt=Math.cos(targetAngle)*.18;
    function resize(){
      const rect=overlay.getBoundingClientRect();w=rect.width;h=rect.height;dpr=Math.min(2,window.devicePixelRatio||1);
      canvas.width=Math.floor(w*dpr);canvas.height=Math.floor(h*dpr);canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0);
    }
    function seedRand(n){let x=(n>>>0)||1;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return ((x>>>0)%100000)/100000}}
    const rnd=seedRand(seed^0x9e3779b9);
    function resetStar(s,near=false){
      const spread=near?1.25:2.8;
      s.x=(rnd()*2-1)*spread;s.y=(rnd()*2-1)*spread;s.z=.12+rnd()*.95;s.pz=s.z;
      s.size=.45+rnd()*1.25;s.alpha=.18+rnd()*.55;s.twinkle=rnd()*Math.PI*2;
    }
    for(let i=0;i<starCount;i++){const s={};resetStar(s);stars.push(s)}
    resize();window.addEventListener('resize',resize,{passive:true});
    let phase=0,phaseChanged=-1,travel=0,pulse=0,heading=0,roll=0,fov=55,targetX=targetBias,targetY=targetTilt;
    const easeIn=t=>t*t*t, easeOut=t=>1-Math.pow(1-t,4), clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
    function phaseFor(t){if(t<1.5)return 0;if(t<4)return 1;if(t<5.5)return 2;if(t<7)return 3;if(t<8)return 4;return 5}
    function stepText(ph,t){
      const map=[['STEP 01','正在建立你的命運座標','BUILDING YOUR DESTINY COORDINATE',Math.min(17,t/1.5*17)],['STEP 02','正在尋找你的星','SEARCHING FOR YOUR STAR',17+(t-1.5)/2.5*43],['STEP 03','正在調整航向','ADJUSTING YOUR COURSE',60+(t-4)/1.5*17],['STEP 04','命運座標已鎖定','DESTINY LOCKED',77+(t-5.5)/1.5*13],['STEP 05','CONNECTED','CONNECTED',100],['','', '',100]];
      const m=map[Math.min(ph,4)];setStep(overlay,m[0],m[1],m[2],clamp(m[3],0,100));
    }
    function project(s,cam){
      const focal=Math.min(w,h)/(2*Math.tan((fov*Math.PI/180)/2));
      const z=Math.max(.035,s.z);return {x:w/2+(s.x-cam.x)*focal/z,y:h/2+(s.y-cam.y)*focal/z,scale:focal/z};
    }
    function drawEarth(t){
      if(t>1.75)return;
      const p=clamp(t/1.5,0,1),a=easeIn(p),x=w*.62-a*w*.78,y=h*.48-a*h*.12,r=Math.max(2,Math.min(w,h)*.09*(1-a*.75));
      const g=ctx.createRadialGradient(x-r*.3,y-r*.35,r*.04,x,y,r*1.5);g.addColorStop(0,'#b8c0c8');g.addColorStop(.3,'#536579');g.addColorStop(.7,'#17283b');g.addColorStop(1,'#03070e');
      ctx.save();ctx.globalAlpha=1-a*.75;ctx.shadowBlur=r*1.2;ctx.shadowColor='rgba(145,170,200,.28)';ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();ctx.shadowBlur=0;
      ctx.beginPath();ctx.arc(x,y,r*.82,-.8,.75);ctx.strokeStyle='rgba(220,230,235,.08)';ctx.lineWidth=Math.max(1,r*.035);ctx.stroke();
      ctx.restore();
    }
    function drawStars(t,dt){
      const speed=phase===0?0.18+easeIn(clamp(t/1.5,0,1))*.55:phase===1?1.35+easeIn(clamp((t-1.5)/2.5,0,1))*3.1:phase===2?4.6:phase===3?3.2:phase===4?1.1:.35;
      const cam={x:heading*.08,y:targetY*.04};
      const sorted=stars.slice().sort((a,b)=>b.z-a.z);
      for(const s of sorted){
        s.pz=s.z;s.z-=dt*speed*.92;
        if(s.z<.045){resetStar(s,true);s.z=.95+rnd()*.2}
        const q=project(s,cam),oldZ=Math.max(.05,s.z+speed*dt*.95),old={x:s.x,y:s.y,z:oldZ};const op=clamp(s.alpha*(phase>=1?1.1:0.8),.04,.8);
        ctx.globalAlpha=op*(1-.28*Math.min(1,Math.abs(q.x-w/2)/(w*.7)));
        if(phase>=1&&speed>2.5){const oq=project(old,cam);ctx.beginPath();ctx.moveTo(oq.x,oq.y);ctx.lineTo(q.x,q.y);ctx.strokeStyle='rgba(220,226,225,.55)';ctx.lineWidth=Math.max(.35,Math.min(1.4,q.scale*s.size*.08));ctx.stroke()}
        ctx.beginPath();ctx.arc(q.x,q.y,Math.max(.35,Math.min(2.2,q.scale*s.size*.012)),0,Math.PI*2);ctx.fillStyle='#eee9dc';ctx.fill();
      }
      ctx.globalAlpha=1;
    }
    function drawTarget(t){
      const appear=clamp((t-3.65)/1.5,0,1),steer=clamp((t-4)/2.0,0,1),approach=clamp((t-5.5)/2.5,0,1);
      if(appear<=0)return;
      const x=w/2+targetBias*w*.42*(1-steer),y=h/2+targetTilt*h*.28*(1-steer);
      const r=(3+18*easeOut(appear))*(1+approach*7);
      const glow=ctx.createRadialGradient(x,y,0,x,y,r*5);glow.addColorStop(0,'rgba(250,235,190,.95)');glow.addColorStop(.06,'rgba(235,213,160,.85)');glow.addColorStop(.24,'rgba(221,201,150,.25)');glow.addColorStop(1,'rgba(221,201,150,0)');
      ctx.save();ctx.globalAlpha=appear;ctx.fillStyle=glow;ctx.beginPath();ctx.arc(x,y,r*5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f5e7bd';ctx.shadowBlur=r*2.2;ctx.shadowColor='rgba(235,210,160,.9)';ctx.beginPath();ctx.arc(x,y,Math.max(1.2,r*.12),0,Math.PI*2);ctx.fill();ctx.restore();
      if(t>5.4){ctx.save();ctx.translate(x,y);ctx.rotate(-.2);ctx.globalAlpha=.5*approach;ctx.strokeStyle='rgba(240,222,175,.7)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-r*2.5,0);ctx.lineTo(r*2.5,0);ctx.moveTo(0,-r*2.5);ctx.lineTo(0,r*2.5);ctx.stroke();ctx.restore()}
      return {x,y,r,approach};
    }
    function drawOriginThread(t,target){
      if(t<6.5||!target)return;
      const p=clamp((t-6.5)/1.0,0,1),a=easeOut(p),sx=w*.62,sy=h*.48,tx=target.x,ty=target.y;
      ctx.save();ctx.globalAlpha=.62*a;ctx.strokeStyle='rgba(226,210,165,.75)';ctx.lineWidth=1;ctx.shadowBlur=9;ctx.shadowColor='rgba(226,210,165,.35)';ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx+(tx-sx)*a,sy+(ty-sy)*a);ctx.stroke();ctx.restore();
      if(p>0&&p<1){pulse=p}
    }
    function drawImpact(t,target){
      if(t<7.25||!target)return;const p=clamp((t-7.25)/.55,0,1),a=Math.sin(p*Math.PI);ctx.save();ctx.globalAlpha=.14*a;ctx.fillStyle='rgba(240,225,185,.8)';ctx.beginPath();ctx.arc(target.x,target.y,Math.min(w,h)*.32*a,0,Math.PI*2);ctx.fill();ctx.restore();
    }
    function render(now){
      if(disposed)return;const elapsed=(now-start)/1000,dt=Math.min(.033,Math.max(.001,(now-last)/1000));last=now;
      phase=phaseFor(elapsed);if(phase!==phaseChanged){phaseChanged=phase;stepText(phase,elapsed)}
      const speedNorm=phase===0?easeIn(clamp(elapsed/1.5,0,1)):phase===1?clamp((elapsed-1.5)/2.5,0,1):phase===2?1:phase===3?.65:phase===4?.28:0;
      fov=55+20*speedNorm;heading += (targetX-heading)*dt*(phase>=2?1.8:.7);roll=Math.sin(elapsed*1.15)*(.02+speedNorm*.035);
      ctx.save();ctx.clearRect(0,0,w,h);ctx.translate(w/2,h/2);ctx.rotate(roll);ctx.translate(-w/2,-h/2);
      const bg=ctx.createRadialGradient(w*.5,h*.48,0,w*.5,h*.5,Math.max(w,h)*.72);bg.addColorStop(0,'#10172a');bg.addColorStop(.48,'#050811');bg.addColorStop(1,'#020308');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
      drawStars(elapsed,dt);drawEarth(elapsed);const target=drawTarget(elapsed);drawOriginThread(elapsed,target);drawImpact(elapsed,target);ctx.restore();
      if(elapsed>=8.85){finish()}else{raf=requestAnimationFrame(render)}
    }
    function finish(){
      if(disposed)return;disposed=true;cancelAnimationFrame(raf);window.removeEventListener('resize',resize);overlay.classList.add('destiny-complete');overlay.querySelector('.destiny-hud').classList.add('is-hidden');
      setTimeout(()=>{overlay.classList.remove('active','destiny-complete');document.body.classList.remove('destiny-lock');showStarResult(star,data,seed)},260);
    }
    setStep(overlay,'STEP 01','正在建立你的命運座標','BUILDING YOUR DESTINY COORDINATE',0);
    raf=requestAnimationFrame(render);
  }
  if(window.syncSingleBirthDateLimits) window.syncSingleBirthDateLimits();
  window.drawFortune=async function(){
    const data=collect();
    if(!data)return;

    // The deterministic local engine is the primary path. The backend endpoint is
    // only a consistency check and must never make a valid local reading unusable
    // when the optional API is absent or unavailable.
    try{
      const controller=new AbortController();
      const timer=setTimeout(()=>controller.abort(),3500);
      let r;
      try{
        r=await fetch('/api/validate-birth',{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({birthDate:data.birthDate,year:data.year,month:data.month,day:data.day}),
          signal:controller.signal
        });
      }finally{clearTimeout(timer)}
      if(r.status===400){
        const j=await r.json().catch(()=>({}));
        alert(j.message||'出生日期格式不正確。');
        return;
      }
      if(r.ok===false&&r.status!==404){
        console.warn('[STAR FATE] /api/validate-birth 非預期回應，改用本地占卜引擎。',{status:r.status});
      }
    }catch(e){
      console.warn('[STAR FATE] /api/validate-birth 無法使用，改用本地占卜引擎。',e);
    }

    try{
      if(!Array.isArray(window.STAR_DATABASE)||window.STAR_DATABASE.length===0){
        throw new Error('STAR_DATABASE 未載入');
      }
      const seed=buildSeed(data),star=window.STAR_DATABASE[pick(seed,window.STAR_DATABASE.length)];
      if(!star)throw new Error('找不到對應命運星');
      window.__starFatePending={star,data,seed};
      document.getElementById('result').classList.remove('active');
      document.getElementById('loading').classList.remove('active');
      window.scrollTo({top:0,behavior:'smooth'});
      runAnimation(data,star,seed);
    }catch(e){
      console.error('[STAR FATE] 個人占卜執行失敗',e,{data});
      document.getElementById('destinyOverlay')?.classList.remove('active');
      document.body.classList.remove('destiny-lock');
      alert('結果生成失敗，請重新嘗試。');
    }
  };
  window.updateCurrentFavoriteButton=function(){
    const b=document.getElementById('favoriteCurrentBtn'),cur=window.__starFateCurrent;
    if(!b||!cur||!cur.star)return;
    const fav=!!(window.isFavoriteStar&&window.isFavoriteStar(cur.star));
    b.textContent=fav?'★ 已收藏':'☆ 收藏這顆星';
    b.classList.toggle('is-favorited',fav);
  };
  window.toggleCurrentFavorite=function(){
    const cur=window.__starFateCurrent;
    if(!cur||!cur.star){if(!window.currentUser?.()&&confirm('登入後即可收藏命運之星，前往登入嗎？'))location.href='login.html';return}
    if(!window.toggleFavorite)return;
    const wasFav=!!(window.isFavoriteStar&&window.isFavoriteStar(cur.star));
    window.toggleFavorite(cur.star);
    const nowFav=!!(window.isFavoriteStar&&window.isFavoriteStar(cur.star));
    window.updateCurrentFavoriteButton();
    if(nowFav!==wasFav){try{const b=document.getElementById('favoriteCurrentBtn');if(b){b.classList.remove('fav-pulse');void b.offsetWidth;b.classList.add('fav-pulse')}}catch(e){}}
  };
  window.collectCurrentStar=window.toggleCurrentFavorite;
  window.saveCurrentFortune=function(){const cur=window.__starFateCurrent;if(!cur)return;const u=window.currentUser();if(!u){if(confirm('登入後即可保存你的命運星。現在前往登入嗎？'))window.location.href='login.html';return}const rec={date:new Date().toISOString(),birth:{date:`${cur.data.year}/${String(cur.data.month).padStart(2,'0')}/${String(cur.data.day).padStart(2,'0')}`,time:cur.data.time,gender:cur.data.gender,blood:cur.data.blood,zodiac:cur.data.zodiac,animal:cur.data.animal},star:cur.star,question:cur.data.question,interpretation:cur.interpretation};if(window.saveFortuneHistory(rec)){alert('已保存到我的占卜紀錄。');window.updateAccountNav()}};
  window.drawAgain=function(){document.getElementById('result').classList.remove('active');document.getElementById('oracle').style.display='';window.scrollTo({top:document.getElementById('oracle').offsetTop-30,behavior:'smooth'})};
})();
