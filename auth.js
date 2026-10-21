import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
const cfg = window.AHMED_CONFIG?.FIREBASE || {};
const overlay = document.getElementById('authOverlay');
const statusEl = document.getElementById('authStatus');
const loginBtn = document.getElementById('googleLoginBtn');
const actionBtn = document.getElementById('googleSignInAction');
const closeBtn = document.getElementById('authClose');
const logoutBtn = document.getElementById('googleLogoutBtn');
const buttonText = document.getElementById('authButtonText');
const profileName = document.getElementById('profileName');
const avatar = document.getElementById('profileAvatar');
let auth = null;
const setStatus = (msg, kind='') => { if(statusEl){statusEl.textContent=msg;statusEl.className='auth-status '+kind;} };
const openModal = () => {overlay.hidden=false;document.body.style.overflow='hidden';};
const closeModal = () => {overlay.hidden=true;document.body.style.overflow='';};
loginBtn?.addEventListener('click',openModal);closeBtn?.addEventListener('click',closeModal);
overlay?.addEventListener('click',e=>{if(e.target===overlay)closeModal()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay&&!overlay.hidden)closeModal()});
function configReady(){return Boolean(cfg.apiKey&&cfg.authDomain&&cfg.projectId&&cfg.appId)}
if(!configReady()){
  setStatus('إعداد مطلوب: أضف بيانات تطبيق Firebase في config.js ثم فعّل Google من Authentication.','');
  actionBtn?.addEventListener('click',()=>setStatus('لسه بيانات Firebase ناقصة. راجع ملف README.txt واتبع خطوات إعداد Google Login.','error'));
  loginBtn?.addEventListener('click',()=>setStatus('زر الدخول جاهز، لكنه لن يعمل قبل إضافة بيانات مشروع Firebase الخاص بك.','error'));
}else{
  try{
    const app=initializeApp(cfg);auth=getAuth(app);const provider=new GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});
    actionBtn?.addEventListener('click',async()=>{actionBtn.disabled=true;setStatus('جاري فتح تسجيل الدخول الآمن من Google…');try{await signInWithPopup(auth,provider)}catch(e){setStatus(e.code==='auth/unauthorized-domain'?'أضف عنوان الموقع إلى Authorized domains في Firebase.':e.code==='auth/popup-blocked'?'المتصفح منع النافذة المنبثقة؛ اسمح بالنوافذ المنبثقة وجرب تاني.':'تعذر تسجيل الدخول: '+(e.message||e.code),'error')}finally{actionBtn.disabled=false}});
    logoutBtn?.addEventListener('click',async()=>{try{await signOut(auth);setStatus('تم تسجيل الخروج.')}catch(e){setStatus('تعذر تسجيل الخروج.','error')}});
    onAuthStateChanged(auth,user=>{
      if(user){const name=user.displayName||user.email||'مستخدم Google';if(profileName)profileName.textContent=name;if(avatar){avatar.textContent=(name.trim()[0]||'أ').toLocaleUpperCase('ar-EG');if(user.photoURL){avatar.style.backgroundImage=`url("${user.photoURL.replace(/["\\\\]/g,'')}")`;avatar.style.backgroundSize='cover';avatar.textContent=''}}if(buttonText)buttonText.textContent='الحساب';if(logoutBtn)logoutBtn.hidden=false;setStatus('تم تسجيل الدخول بنجاح باسم '+name,'success');closeModal();
      }else{if(profileName)profileName.textContent='أحمد';if(avatar){avatar.textContent='أ';avatar.style.backgroundImage=''}if(buttonText)buttonText.textContent='تسجيل الدخول بجوجل';if(logoutBtn)logoutBtn.hidden=true;}
    });
  }catch(e){setStatus('تعذر تهيئة Firebase. راجع بيانات config.js.','error')}
}
