(function(){
'use strict';
if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
function boot(){
 document.body.classList.add('cosmic-enhanced');
 const field=document.createElement('div');field.className='cosmic-field';field.setAttribute('aria-hidden','true');document.body.appendChild(field);
 const dust=document.createElement('div');dust.className='cosmic-dust';dust.setAttribute('aria-hidden','true');document.body.appendChild(dust);
 const galaxies=document.createElement('div');galaxies.className='cosmic-galaxies';galaxies.setAttribute('aria-hidden','true');document.body.appendChild(galaxies);
}
document.addEventListener('DOMContentLoaded',boot);
})();
