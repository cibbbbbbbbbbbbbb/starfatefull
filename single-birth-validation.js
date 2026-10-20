/* STAR FATE — single-person birth-date validation only.
 * Birthdays are calendar dates, not timestamps. This validator never parses
 * the birth date through new Date("YYYY-MM-DD"), so UTC/Taiwan offsets cannot shift it.
 * 優先讀取 window.STAR_FATE_CONFIG，其次回退內建預設值
 */
(function(){
  const GLOBAL=window.STAR_FATE_CONFIG||{};
  const MIN_YEAR=Number(GLOBAL.minBirthYear)||1900;
  function daysInMonth(year,month){
    const days=[31,28,31,30,31,30,31,31,30,31,30,31];
    if(month===2){
      const leap=(year%4===0&&year%100!==0)||(year%400===0);
      return leap?29:28;
    }
    return days[month-1]||0;
  }
  function validateSingleBirthDate(year,month,day){
    const rawY=String(year??'').trim(),rawM=String(month??'').trim(),rawD=String(day??'').trim();
    if(!rawY||!rawM||!rawD) return {ok:false,code:'empty',message:'請輸入出生日期。'};
    if(!/^\d{4}$/.test(rawY)||!/^\d{1,2}$/.test(rawM)||!/^\d{1,2}$/.test(rawD)){
      return {ok:false,code:'format',message:'出生日期格式不正確。'};
    }
    const y=Number(rawY),m=Number(rawM),d=Number(rawD);
    if(!Number.isFinite(y)||!Number.isFinite(m)||!Number.isFinite(d)){
      return {ok:false,code:'format',message:'出生日期格式不正確。'};
    }
    const today=new Date(),ty=today.getFullYear(),tm=today.getMonth()+1,td=today.getDate();
    if(y<MIN_YEAR) return {ok:false,code:'year_min',message:`出生年份需介於 ${MIN_YEAR} 年至今年。`};
    if(y>ty) return {ok:false,code:'year_future',message:'出生日期不能晚於今天。'};
    if(m<1||m>12||d<1||d>daysInMonth(y,m)) return {ok:false,code:'day_invalid',message:'出生日期不存在，請確認日期是否正確。'};
    if(y===ty&&(m>tm||(m===tm&&d>td))) return {ok:false,code:'date_future',message:'出生日期不能晚於今天。'};
    return {ok:true,year:y,month:m,day:d,iso:`${rawY}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`};
  }
  function syncSingleBirthDateLimits(){
    const now=new Date(),max=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    const y=document.getElementById('birthYear'),m=document.getElementById('birthMonth'),d=document.getElementById('birthDay');
    if(y){y.min=String(MIN_YEAR);y.max=String(now.getFullYear());}
    if(m){m.min='1';m.max='12';}
    if(d){d.min='1';d.max='31';}
    return max;
  }
  window.validateSingleBirthDate=validateSingleBirthDate;
  window.syncSingleBirthDateLimits=syncSingleBirthDateLimits;
})();
