lucide.createIcons();

let balance = KX_CONFIG.initialBalance;
let currentGeneratedOTP = "";
let selectedReceiptFile = null;
let selectedMediaData = null;
let selectedMediaType = 'image';

// پڕکردنەوەی زانیارییە سەرەتاییەکان لە data.jsـەوە
document.getElementById('fibNumberDisplay').innerText = KX_CONFIG.fibNumber;
updateBalanceUI();

function updateBalanceUI() {
  document.getElementById('walletBalance').innerText = balance.toLocaleString() + " IQD";
  document.getElementById('walletMainDisplay').innerText = balance.toLocaleString() + " IQD";
}

// ١. سیستەمی چوونەژوورەوە و ڤێریفای توند
function goToStep2() {
  const email = document.getElementById('regEmail').value.trim();
  const pass = document.getElementById('regPass').value.trim();
  if (!email.includes('@') || pass.length < 6) return alert('ئیمەیڵ و پاسۆرد (لانیکەم ٦ پیت) بنووسە.');
  document.getElementById('authStep1').classList.add('hidden');
  document.getElementById('authStep2').classList.remove('hidden');
}

function sendOTPCode() {
  const uname = document.getElementById('regUsername').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  if (!uname || phone.length < 7) return alert('ناوی یوزەر و ژمارە مۆبایل بنووسە.');
  currentGeneratedOTP = Math.floor(100000 + Math.random() * 900000).toString();
  document.getElementById('generatedOtpDisplay').innerText = currentGeneratedOTP;
  document.getElementById('authStep2').classList.add('hidden');
  document.getElementById('authStep3').classList.remove('hidden');
}

function completeAuth() {
  if (document.getElementById('otpInput').value.trim() !== currentGeneratedOTP) {
    document.getElementById('otpError').classList.remove('hidden');
    return;
  }
  const uname = document.getElementById('regUsername').value.trim();
  document.getElementById('headerUsername').innerText = uname;
  document.getElementById('editUsernameInput').value = uname;
  document.getElementById('voiceMyName').innerText = uname;
  document.getElementById('authScreen').classList.add('hidden');
}

// ٢. پرۆفایل
function uploadProfilePic(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById('headerAvatar').src = e.target.result;
    document.getElementById('modalAvatar').src = e.target.result;
    document.getElementById('voiceMyAvatar').src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function saveProfile() {
  const newName = document.getElementById('editUsernameInput').value.trim();
  if (newName) {
    document.getElementById('headerUsername').innerText = newName;
    document.getElementById('voiceMyName').innerText = newName;
  }
  closeModal('profileModal');
}

// ٣. ڕادیۆی GTA VI
let trackIdx = 0;
const radioAudio = new Audio(KX_CONFIG.tracks[0].url);
radioAudio.loop = true;
document.getElementById('trackName').innerText = KX_CONFIG.tracks[0].title;

function togglePlayMusic() {
  const btn = document.getElementById('playMusicBtn');
  if (radioAudio.paused) {
    radioAudio.play();
    btn.innerHTML = `<i data-lucide="pause" class="w-3.5 h-3.5 text-white fill-white"></i>`;
  } else {
    radioAudio.pause();
    btn.innerHTML = `<i data-lucide="play" class="w-3.5 h-3.5 text-white fill-white"></i>`;
  }
  lucide.createIcons();
}

function nextTrack() {
  trackIdx = (trackIdx + 1) % KX_CONFIG.tracks.length;
  document.getElementById('trackName').innerText = KX_CONFIG.tracks[trackIdx].title;
  const wasPlaying = !radioAudio.paused;
  radioAudio.src = KX_CONFIG.tracks[trackIdx].url;
  if (wasPlaying) radioAudio.play();
}

// ٤. گۆڕینی بەشەکان
function switchTab(tabName) {
  document.querySelectorAll('.tab-section').forEach(sec => sec.classList.add('hidden'));
  document.getElementById('tab-' + tabName).classList.remove('hidden');

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('text-pink-400');
    btn.classList.add('text-gray-400');
  });
  document.getElementById('nav-' + tabName).classList.remove('text-gray-400');
  document.getElementById('nav-' + tabName).classList.add('text-pink-400');

  const musicWidget = document.getElementById('musicWidget');
  if (tabName === 'voice') {
    radioAudio.pause();
    document.getElementById('playMusicBtn').innerHTML = `<i data-lucide="play" class="w-3.5 h-3.5 text-white fill-white"></i>`;
    lucide.createIcons();
    musicWidget.classList.add('hidden');
  } else {
    musicWidget.classList.remove('hidden');
  }
}

// ٥. جزدان و پسوولە
function previewReceipt(event) {
  selectedReceiptFile = event.target.files[0];
  if (selectedReceiptFile) {
    document.getElementById('receiptFileName').innerText = "✅ " + selectedReceiptFile.name;
  }
}

function handleDeposit() {
  const amt = parseInt(document.getElementById('depositInput').value);
  const txId = document.getElementById('txRefInput').value.trim();
  if (!amt || amt < 1000 || !txId || !selectedReceiptFile) {
    return alert('تکایە بڕی پارە، ژمارەی مامەڵە، و وێنەی پسوولەی FIB دابنێ!');
  }
  document.getElementById('receiptsHistory').innerHTML = `
    <div class="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 flex justify-between items-center text-[11px]">
      <div><span class="font-bold text-white block">FIB: ${amt.toLocaleString()} IQD</span><span class="text-gray-400 font-mono">#${txId}</span></div>
      <span class="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">لە ژێر پشکنیندایە</span>
    </div>` + document.getElementById('receiptsHistory').innerHTML;

  document.getElementById('depositInput').value = '';
  document.getElementById('txRefInput').value = '';
  selectedReceiptFile = null;
  document.getElementById('receiptFileName').innerText = 'وێنەی پسوولەی FIB هەڵبژێرە';
  alert('پسوولەکەت تۆمارکرا و دوای پشکنین باڵانس زیاد دەبێت.');
}

function handleTransfer() {
  const user = document.getElementById('transferUser').value.trim();
  const amt = parseInt(document.getElementById('transferAmount').value);
  if (!user || !amt || amt > balance) return alert('زانیارییەکان هەڵەن یان باڵانس بەش ناکات.');
  balance -= amt;
  updateBalanceUI();
  alert(`بڕی ${amt.toLocaleString()} IQD حەواڵە کرا بۆ ${user}`);
}

// ٦. پیشاندانی ئیڤێنتەکان و هەواڵەکان لە data.js
function renderEvents() {
  const container = document.getElementById('eventsContainer');
  container.innerHTML = KX_CONFIG.events.map(ev => `
    <div class="glass-card rounded-2xl overflow-hidden neon-glow">
      <div class="relative h-44">
        <img src="${ev.image}" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-[#140b26] via-black/40 to-transparent"></div>
        <span class="absolute top-3 right-3 vice-gradient text-[10px] font-black px-2.5 py-1 rounded-lg">${ev.game}</span>
        <div class="absolute bottom-3 right-3 left-3">
          <h3 class="text-sm font-black text-white">${ev.title}</h3>
          <p class="text-[11px] text-pink-300 font-bold mt-0.5">${ev.startDate}</p>
        </div>
      </div>
      <div class="p-4 space-y-3">
        <div class="bg-black/50 border border-purple-800/60 rounded-xl p-2 text-center">
          <span id="timer-${ev.id}" class="font-mono text-xs font-black text-pink-400" dir="ltr">--:--:--</span>
        </div>
        <div class="flex items-center justify-between">
          <div><span class="block text-[10px] text-gray-400">خەڵات</span><span class="text-sm font-black text-emerald-400">${ev.prize}</span></div>
          <button onclick="joinEvent(${ev.entry})" class="vice-gradient px-4 py-2 rounded-xl text-xs font-black">بەشداریکردن (${ev.entry.toLocaleString()} IQD)</button>
        </div>
      </div>
    </div>
  `).join('');
}

function renderNews() {
  document.getElementById('newsContainer').innerHTML = KX_CONFIG.news.map(n => `
    <div class="glass-card rounded-2xl overflow-hidden">
      <img src="${n.image}" class="w-full h-44 object-cover">
      <div class="p-4 space-y-2">
        <span class="text-[10px] bg-pink-500/20 text-pink-400 px-2 py-0.5 rounded font-bold">${n.tag}</span>
        <h3 class="text-sm font-bold text-white">${n.title}</h3>
        <p class="text-xs text-gray-300 leading-relaxed">${n.body}</p>
      </div>
    </div>
  `).join('');
}

setInterval(() => {
  KX_CONFIG.events.forEach(ev => {
    const el = document.getElementById(`timer-${ev.id}`);
    if (!el) return;
    const diff = ev.targetTime - Date.now();
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff / 3600000) % 24);
    const m = Math.floor((diff / 60000) % 60);
    const s = Math.floor((diff / 1000) % 60);
    el.innerText = `${d}d : ${h}h : ${m}m : ${s}s`;
  });
}, 1000);

function joinEvent(cost) {
  if (balance < cost) return alert('باڵانسی پێویستت نییە!');
  balance -= cost;
  updateBalanceUI();
  alert('بە سەرکەوتوویی تۆمارکرایت لە خولەکەدا!');
}

// ٧. پۆستی وێنە و ڤیدیۆ
const mediaPosts = [{
  user: "KurdApex_Pro",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
  type: "image",
  mediaUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
  caption: "ئامادەکارییەکان بۆ خولی گەورەی ئەم هەفتەیە 🔥🏆",
  likes: 48
}];

function handleMediaSelect(event) {
  const file = event.target.files[0];
  if (!file) return;
  selectedMediaType = file.type.startsWith('video') ? 'video' : 'image';
  document.getElementById('mediaUploadLabel').innerText = "✅ " + file.name;
  const reader = new FileReader();
  reader.onload = e => { selectedMediaData = e.target.result; };
  reader.readAsDataURL(file);
}

function publishMediaPost() {
  if (!selectedMediaData) return alert('وێنە یان ڤیدیۆ هەڵبژێرە!');
  mediaPosts.unshift({
    user: document.getElementById('headerUsername').innerText,
    avatar: document.getElementById('headerAvatar').src,
    type: selectedMediaType,
    mediaUrl: selectedMediaData,
    caption: document.getElementById('postCaptionInput').value.trim() || "کلیپێکی نوێ",
    likes: 1
  });
  selectedMediaData = null;
  closeModal('newPostModal');
  renderMediaFeed();
}

function renderMediaFeed() {
  document.getElementById('postsFeed').innerHTML = mediaPosts.map((p, idx) => `
    <div class="glass-card rounded-2xl overflow-hidden">
      <div class="p-3 flex items-center gap-2.5">
        <img src="${p.avatar}" class="w-8 h-8 rounded-full object-cover border border-pink-500">
        <span class="text-xs font-bold text-white">${p.user}</span>
      </div>
      ${p.type === 'video' ? `<video src="${p.mediaUrl}" controls class="w-full max-h-80 object-cover bg-black"></video>` : `<img src="${p.mediaUrl}" class="w-full max-h-80 object-cover">`}
      <div class="p-3 space-y-2">
        <p class="text-xs text-gray-200">${p.caption}</p>
        <button onclick="mediaPosts[${idx}].likes++; renderMediaFeed()" class="flex items-center gap-1 text-pink-400 font-bold text-xs">
          <i data-lucide="heart" class="w-4 h-4 fill-pink-500"></i> <span>${p.likes}</span>
        </button>
      </div>
    </div>
  `).join('');
  lucide.createIcons();
}

// ٨. ژوورە دەنگییەکان
function renderVoiceRooms() {
  document.getElementById('voiceRoomsList').innerHTML = KX_CONFIG.voiceRooms.map(r => `
    <div class="glass-card rounded-2xl p-4 flex items-center justify-between">
      <div>
        <span class="text-[9px] bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded font-bold">${r.tag}</span>
        <h3 class="text-xs font-bold text-white mt-1">${r.name}</h3>
        <span class="text-[10px] text-emerald-400">● ${r.count} یاریزان</span>
      </div>
      <button onclick="joinVoiceRoom('${r.name}')" class="vice-gradient px-3.5 py-2 rounded-xl text-xs font-bold">چوونە ژوورەوە</button>
    </div>
  `).join('');
}

function createNewVoiceRoom() {
  const rName = prompt("ناوی ژوورە دەنگییە نوێیەکەت بنووسە:");
  if (!rName) return;
  KX_CONFIG.voiceRooms.unshift({ name: rName, count: 1, tag: "New" });
  renderVoiceRooms();
  joinVoiceRoom(rName);
}

function joinVoiceRoom(name) {
  document.getElementById('activeRoomName').innerText = name;
  document.getElementById('activeVoicePanel').classList.remove('hidden');
}

function leaveVoiceRoom() {
  document.getElementById('activeVoicePanel').classList.add('hidden');
}

function toggleMic(btn) {
  btn.classList.toggle('text-emerald-400');
  btn.classList.toggle('text-red-400');
}

// ٩. زمانەکان
const translations = {
  ku: { balance: "باڵانس", srvKurd: "سێرڤەری کوردی", srvIraq: "سێرڤەری عێراقی", srvEu: "سێرڤەری ئەوروپی", eventsTitle: "ئیڤێنت و پاڵەوانێتییەکان", newsTitle: "هەواڵ و زانیاری", walletTitle: "جزدانی دارایی", postsTitle: "کلیپ و وێنە", voiceTitle: "ژوورە دەنگییەکان", navNews: "هەواڵ", navWallet: "جزدان", navEvents: "ئیڤێنتەکان", navPosts: "پۆست", navVoice: "ژووری دەنگی" },
  ar: { balance: "الرصيد", srvKurd: "سيرفر كردستان", srvIraq: "السيرفر العراقي", srvEu: "السيرفر الأوروبي", eventsTitle: "البطولات والأحداث", newsTitle: "الأخبار والمعلومات", walletTitle: "المحفظة المالية", postsTitle: "مقاطع وصور", voiceTitle: "الغرف الصوتية", navNews: "الأخبار", navWallet: "المحفظة", navEvents: "البطولات", navPosts: "المنشورات", navVoice: "غرف صوتية" },
  en: { balance: "Balance", srvKurd: "Kurdistan Server", srvIraq: "Iraq Server", srvEu: "Europe Server", eventsTitle: "Tournaments & Events", newsTitle: "News & Info", walletTitle: "Wallet", postsTitle: "Media Feed", voiceTitle: "Voice Rooms", navNews: "News", navWallet: "Wallet", navEvents: "Events", navPosts: "Feed", navVoice: "Voice" }
};

function changeLanguage(lang) {
  document.documentElement.dir = (lang === 'en') ? 'ltr' : 'rtl';
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang][key]) el.innerText = translations[lang][key];
  });
  changeServer(document.getElementById('serverSelect').value);
}

function changeServer(srv) {
  const lang = document.getElementById('langSelect').value;
  const keyMap = { kurd: 'srvKurd', iraq: 'srvIraq', eu: 'srvEu' };
  document.getElementById('activeServerBadge').innerText = translations[lang][keyMap[srv]];
}

function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

renderEvents();
renderNews();
renderMediaFeed();
renderVoiceRooms();
lucide.createIcons();

