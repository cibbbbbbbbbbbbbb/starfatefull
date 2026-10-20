/* STAR FATE register page bindings.
 * CSP-safe: no inline event handlers. Validation/submission remains in auth.js.
 */
(function(){
  function isValidRegisterForm(){
    const name=(document.getElementById('displayName')?.value||'').trim();
    const email=(document.getElementById('authEmail')?.value||'').trim();
    const password=document.getElementById('authPassword')?.value||'';
    const confirm=document.getElementById('authConfirm')?.value||'';
    const consent=!!document.getElementById('privacyConsent')?.checked;
    return name.length>0 && /^\S+@\S+\.\S+$/.test(email) && password.length>=8 && password===confirm && consent;
  }

  function updateSubmitState(){
    const button=document.getElementById('registerSubmit');
    if(!button)return;
    // Keep the existing clickable UX; this only exposes the current validation state.
    button.setAttribute('aria-disabled', isValidRegisterForm() ? 'false' : 'true');
  }

  document.addEventListener('DOMContentLoaded',()=>{
    const submit=document.getElementById('registerSubmit');
    const google=document.getElementById('googleLoginButton');
    const fields=['displayName','authEmail','authPassword','authConfirm','privacyConsent']
      .map(id=>document.getElementById(id)).filter(Boolean);

    fields.forEach(field=>{
      field.addEventListener('input',updateSubmitState);
      field.addEventListener('change',updateSubmitState);
    });

    if(submit){
      submit.addEventListener('click',()=>{
        // authSubmit performs the authoritative validation and calls POST /api/auth/register.
        window.authSubmit('register');
      });
    }

    if(google){
      google.addEventListener('click',()=>{
        window.googleLogin();
      });
    }

    updateSubmitState();
  });
})();
