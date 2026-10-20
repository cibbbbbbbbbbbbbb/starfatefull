/* STAR FATE unified birth-date validation. Shared by all client forms.
 * 優先讀取 window.STAR_FATE_CONFIG，其次回退內建預設值
 */
(function(){
  const GLOBAL=window.STAR_FATE_CONFIG||{};
  const CONFIG={minYear:Number(GLOBAL.minBirthYear)||1901};
  function daysInMonth(y,m){
    const d=[31,28,31,30,31,30,31,31,30,31,30,31];
    if(m===2)return((y%4===0&&y%100!==0)||(y%400===0))?29:28;
    return d[m-1]||0;
  }
  function validate(year,month,day){
    const rawY=String(year??'').trim(),rawM=String(month??'').trim(),rawD=String(day??'').trim();
    if(!rawY||!rawM||!rawD) return {ok:false,code:'empty',message:'請完整輸入出生年月日。'};
    if(!/^\d{4}$/.test(rawY)||!/^\d{1,2}$/.test(rawM)||!/^\d{1,2}$/.test(rawD)) return {ok:false,code:'format',message:'出生年月日格式不正確，年份請輸入四位數。'};
    const y=Number(rawY),m=Number(rawM),d=Number(rawD),now=new Date(),maxYear=now.getFullYear();
    if(y<CONFIG.minYear||y>maxYear) return {ok:false,code:'year',message:`出生年份需介於 ${CONFIG.minYear} 年與今年之間。`};
    if(m<1||m>12||d<1||d>daysInMonth(y,m)) return {ok:false,code:'date',message:'出生月份或日期不合理，請確認實際日曆日期。'};
    const tm=now.getMonth()+1,td=now.getDate();
    if(y===maxYear&&(m>tm||(m===tm&&d>td))) return {ok:false,code:'future',message:'出生日期不能是未來日期。'};
    return {ok:true,year:y,month:m,day:d,iso:`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`};
  }
  window.BIRTH_DATE_CONFIG=CONFIG;window.validateBirthDate=validate;
})();
