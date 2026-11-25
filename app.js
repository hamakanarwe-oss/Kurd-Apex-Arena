lucide.createIcons();

const sb = window.supabase.createClient(KX_CONFIG.supabaseUrl, KX_CONFIG.supabaseKey);

let currentUser = null;
let balance = 0;
let selectedReceiptFile = null;
let selectedMediaData = null;
let selectedMediaType = 'image';
let isMicMuted = false;

document.getElementById('fibNumberDisplay').innerText = KX_CONFIG.fibNumber;

async function checkExistingSession() {
  const { data: { session } } = await sb.auth.getSession();
  if (session) {
    await loadUserProfile(session.user);
  }
}

async function registerRealAccount() {
  const email = document.getElementById('regEmail').value.trim();
  const pass = document.getElementById('regPass').value.trim();
  const uname = document.getElementById('regUsername').value.trim();
  const rawPhone = document.getElementById('regPhone').value.trim().replace(/\s+/g, '');

  if (!email.includes('@') || !email.includes('.')) {
    return showAuthError('تکایە ئیمەیڵێکی دروست بنووسە (نموونە: name@gmail.com).');
  }
  if (pass.length < 6) {
    return showAuthError('پاسۆرد دەبێت لانیکەم ٦ پیت یان ژمارە بێت.');
  }
  if (uname.length < 3 || !/^[a-zA-Z0-9_]+$/.test(uname)) {
    return showAuthError('ناوی یوزەر دەبێت بە ئینگلیزی بێت (لانیکەم ٣ پیت، تەنها پیت و ژمارە و _ بێ @).');
  }

  const phoneNormalized = rawPhone.startsWith('0') ? rawPhone : '0' + rawPhone;
  if (!/^07[578]\d{8}$/.test(phoneNormalized)) {
    return showAuthError('ژمارەی مۆبایل هەڵەیە! دەبێت بە 077 یان 075 یان 078 دەستپێبکات و ڕێک ١١ ژمارە بێت.');
  }

  const { data: existingUser } = await sb.from('profiles').select('username, phone').or(`username.eq.${uname},phone.eq.${phoneNormalized}`);
  if (existingUser && existingUser.length > 0) {
    return showAuthError('ئەم ناوی یوزەرە یان ژمارە مۆبایلە پێشتر تۆمارکراوە! دانەیەکی تر هەڵبژێرە.');
  }

  setAuthLoading(true);

  const { data, error } = await sb.auth.signUp({
    email: email,
    password: pass,
    options: {
      emailRedirectTo: window.location.href,
      data: { username: uname, phone: phoneNormalized }
    }
  });

  setAuthLoading(false);

  if (error) {
    return showAuthError('هەڵە: ' + error.message);
  }

  if (data.user && !data.session) {
    document.getElementById('authRegisterBox').classList.add('hidden');
    document.getElementById('authVerifyBox').classList.remove('hidden');
    document.getElementById('verifyEmailTarget').innerText = email;
  } else if (data.session) {
    await createProfileRow(data.user, uname, phoneNormalized);
    await loadUserProfile(data.user);
  }
}

async function loginRealAccount() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPass').value.trim();
  if (!email || !pass) return showAuthError('ئیمەیڵ و پاسۆرد بنووسە.');

  setAuthLoading(true);
  const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
  setAuthLoading(false);

  if (error) return showAuthError('ئیمەیڵ یان پاسۆرد هەڵەیە، یان هێشتا لە ناو Gmail کلیکت لە Confirm email address نەکردووە!');
  await loadUserProfile(data.user);
}

async function createProfileRow(user, username, phone) {
  await sb.from('profiles').upsert({
    id: user.id,
    username: username,
    phone: phone,
    balance: KX_CONFIG.initialBalance
  });
}

async function loadUserProfile(user) {
  currentUser = user;
  const { data: profile } = await sb.from('profiles').select('*').eq('id', user.id).single();

  if (profile) {
    balance = profile.balance;
    document.getElementById('headerUsername').innerText = profile.username;
    document.getElementById('editUsernameInput').value = profile.username;
    document.getElementById('voiceMyName').innerText = profile.username;
    if (profile.avatar_url) {
      document.getElementById('headerAvatar').src = profile.avatar_url;
      document.getElementById('modalAvatar').src = profile.avatar_url;
      document.getElementById('voiceMyAvatar').src = profile.avatar_url;
    }
  } else {
    const meta = user.user_metadata || {};
    await createProfileRow(user, meta.username || 'Player_' + Math.floor(Math.random()*999), meta.phone || '0770' + Math.floor(1000000 + Math.random()*8999999));
    balance = KX_CONFIG.initialBalance;
    document.getElementById('headerUsername').innerText = meta.username || 'Player';
    document.getElementById('voiceMyName').innerText = meta.username || 'Player';
  }

  updateBalanceUI();
  await loadUserDeposits();
  document.getElementById('authScreen').classList.add('hidden');
}

async function logoutAccount() {
  await sb.auth.signOut();
  location.reload();
}

function showAuthError(msg) {
  const el = document.getElementById('authErrorBox');
  el.innerText = msg;
  el.classList.remove('hidden');
}

function setAuthLoading(isLoading) {
  document.getElementById('authLoader').classList.toggle('hidden', !isLoading);
  document.getElementById('authErrorBox').classList.add('hidden');
}

function toggleAuthMode(mode) {
  document.getElementById('authErrorBox').classList.add('hidden');
  document.getElementById('authVerifyBox').classList.add('hidden');
  document.getElementById('authRegisterBox').classList.toggle('hidden', mode !== 'register');
  document.getElementById('authLoginBox').classList.toggle('hidden', mode !== 'login');
}

function updateBalanceUI() {
  document.getElementById('walletBalance').innerText = balance.toLocaleString() + " IQD";
  document.getElementById('walletMainDisplay').innerText = balance.toLocaleString() + " IQD";
}

function uploadProfilePic(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async e => {
    const base64Img = e.target.result;
    document.getElementById('headerAvatar').src = base64Img;
    document.getElementById('modalAvatar').src = base64Img;
    document.getElementById('voiceMyAvatar').src = base64Img;
    if (currentUser) {
      await sb.from('profiles').update({ avatar_url: base64Img }).eq('id', currentUser.id);
    }
  };
  reader.readAsDataURL(file);
}

async function saveProfile() {
  const newName = document.getElementById('editUsernameInput').value.trim();
  if (newName && currentUser) {
    const { error } = await sb.from('profiles').update({ username: newName }).eq('id', currentUser.id);
    if (error) return alert('ئەم ناوی یوزەرە پێشتر گیراوە!');
    document.getElementById('headerUsername').innerText = newName;
    document.getElementById('voiceMyName').innerText = newName;
  }
  closeModal('profileModal');
}

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

function previewReceipt(event) {
  selectedReceiptFile = event.target.files[0];
  if (selectedReceiptFile) {
    document.getElementById('receiptFileName').innerText = "✅ پسوولە: " + selectedReceiptFile.name;
  }
}

async function handleDeposit() {
  const amt = parseInt(document.getElementById('depositInput').value);
  const txId = document.getElementById('txRefInput').value.trim();

  if (!amt || amt < 1000) return alert('بڕی پارەکە بنووسە (کەمترین بڕ ١,٠٠٠ دینارە).');
  if (!txId || txId.length < 4) return alert('ژمارەی مامەڵە (Transaction ID) بنووسە.');
  if (!selectedReceiptFile) return alert('ناتوانیت باڵانس زیاد بکەیت بێ بارکردنی وێنەی پسوولەی FIB!');

  const { error } = await sb.from('deposits').insert({
    user_id: currentUser.id,
    amount: amt,
    tx_id: txId,
    receipt_name: selectedReceiptFile.name,
    status: 'pending'
  });

  if (error) return alert('هەڵە: ئەم ژمارە مامەڵەیە پێشتر بەکارهاتووە!');

  document.getElementById('depositInput').value = '';
  document.getElementById('txRefInput').value = '';
  selectedReceiptFile = null;
  document.getElementById('receiptFileName').innerText = 'وێنەی پسوولەی FIB هەڵبژێرە (پێویستە)';
  await loadUserDeposits();
  alert('پسوولەکەت لە داتابەیس تۆمارکرا! دوای پشکنین باڵانسەکەت زیاد دەبێت.');
}

async function loadUserDeposits() {
  if (!currentUser) return;
  const { data } = await sb.from('deposits').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false });
  if (!data) return;
  document.getElementById('receiptsHistory').innerHTML = data.map(d => `
    <div class="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 flex justify-between items-center text-[11px]">
      <div><span class="font-bold text-white block">FIB: ${d.amount.toLocaleString()} IQD</span><span class="text-gray-400 font-mono">TX: #${d.tx_id}</span></div>
      <span class="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">${d.status === 'approved' ? 'پەسەندکرا ✅' : 'لە ژێر پشکنیندایە'}</span>
    </div>
  `).join('');
}

async function handleTransfer() {
  const targetUser = document.getElementById('transferUser').value.trim();
  const amt = parseInt(document.getElementById('transferAmount').value);
  if (!targetUser || !amt || amt < 1000 || amt > balance) return alert('زانیارییەکان هەڵەن یان باڵانس بەش ناکات.');

  const { data: recipient } = await sb.from('profiles').select('id, balance').eq('username', targetUser).single();
  if (!recipient) return alert('ئەم ناوی یوزەرە بوونی نییە لە KX Arena!');

  balance -= amt;
  await sb.from('profiles').update({ balance: balance }).eq('id', currentUser.id);
  await sb.from('profiles').update({ balance: recipient.balance + amt }).eq('id', recipient.id);

  updateBalanceUI();
  document.getElementById('transferUser').value = '';
  document.getElementById('transferAmount').value = '';
  alert(`بڕی ${amt.toLocaleString()} IQD حەواڵە کرا بۆ ${targetUser}`);
}

function renderEvents() {
  const lang = document.getElementById('langSelect').value;
  document.getElementById('eventsContainer').innerHTML = KX_CONFIG.events.map(ev => `
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
          <span class="block text-[9px] text-gray-400 mb-0.5">${translations[lang].timeRemaining}</span>
          <span id="timer-${ev.id}" class="font-mono text-xs font-black text-pink-400" dir="ltr">--:--:--</span>
        </div>
        <div class="flex items-center justify-between">
          <div><span class="block text-[10px] text-gray-400">${translations[lang].prizeLabel}</span><span class="text-sm font-black text-emerald-400">${ev.prize}</span></div>
          <button onclick="joinEvent(${ev.entry})" class="vice-gradient px-4 py-2 rounded-xl text-xs font-black">${translations[lang].joinBtn} (${ev.entry.toLocaleString()} IQD)</button>
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

async function joinEvent(cost) {
  if (balance < cost) return alert('باڵانسی پێویستت نییە!');
  balance -= cost;
  await sb.from('profiles').update({ balance: balance }).eq('id', currentUser.id);
  updateBalanceUI();
  alert('بە سەرکەوتوویی تۆمارکرایت لە خولەکەدا!');
}

const mediaPosts = [{
  user: "KurdApex_Pro",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
  type: "image",
  mediaUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
  caption: "ئامادەکارییەکان بۆ خولی گەورەی ئەم هەفتەیە",
  likes: 48,
  comments: ["شازە!"]
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
  if (!selectedMediaData) return alert('تکایە وێنە یان ڤیدیۆیەک هەڵبژێرە!');
  mediaPosts.unshift({
    user: document.getElementById('headerUsername').innerText,
    avatar: document.getElementById('headerAvatar').src,
    type: selectedMediaType,
    mediaUrl: selectedMediaData,
    caption: document.getElementById('postCaptionInput').value.trim() || "KX Arena Highlight",
    likes: 1,
    comments: []
  });
  selectedMediaData = null;
  closeModal('newPostModal');
  renderMediaFeed();
}

function addCommentToPost(idx) {
  const txt = prompt("کۆمێنتەکەت بنووسە:");
  if (!txt) return;
  mediaPosts[idx].comments.push(txt);
  renderMediaFeed();
}

function renderMediaFeed() {
  const lang = document.getElementById('langSelect').value;
  document.getElementById('postsFeed').innerHTML = mediaPosts.map((p, idx) => `
    <div class="glass-card rounded-2xl overflow-hidden">
      <div class="p-3 flex items-center gap-2.5">
        <img src="${p.avatar}" class="w-8 h-8 rounded-full object-cover border border-pink-500">
        <span class="text-xs font-bold text-white">${p.user}</span>
      </div>
      ${p.type === 'video' ? `<video src="${p.mediaUrl}" controls playsinline class="w-full max-h-96 object-cover bg-black"></video>` : `<img src="${p.mediaUrl}" class="w-full max-h-96 object-cover">`}
      <div class="p-3 space-y-2">
        <p class="text-xs text-gray-200">${p.caption}</p>
        <div class="flex items-center gap-5 pt-2 border-t border-purple-900/40 text-xs">
          <button onclick="mediaPosts[${idx}].likes++; renderMediaFeed()" class="flex items-center gap-1.5 text-pink-400 font-bold"><i data-lucide="heart" class="w-4 h-4 fill-pink-500"></i> <span>${p.likes}</span></button>
          <button onclick="addCommentToPost(${idx})" class="flex items-center gap-1.5 text-gray-300"><i data-lucide="message-circle" class="w-4 h-4"></i> <span>${p.comments.length} ${translations[lang].commentBtn}</span></button>
        </div>
      </div>
    </div>
  `).join('');
  lucide.createIcons();
}

function renderVoiceRooms() {
  const lang = document.getElementById('langSelect').value;
  document.getElementById('voiceRoomsList').innerHTML = KX_CONFIG.voiceRooms.map(r => `
    <div class="glass-card rounded-2xl p-4 flex items-center justify-between">
      <div>
        <span class="text-[9px] bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded font-bold">${r.tag}</span>
        <h3 class="text-xs font-bold text-white mt-1">${r.name}</h3>
        <span class="text-[10px] text-emerald-400">● ${r.count} ${translations[lang].playersOnline}</span>
      </div>
      <button onclick="joinVoiceRoom('${r.name}')" class="vice-gradient px-3.5 py-2 rounded-xl text-xs font-bold">${translations[lang].joinRoomBtn}</button>
    </div>
  `).join('');
}

function createNewVoiceRoom() {
  const rName = prompt("ناوی ژوورە دەنگییە نوێیەکەت بنووسە:");
  if (!rName) return;
  KX_CONFIG.voiceRooms.unshift({ id: Date.now(), name: rName, count: 1, tag: "Live" });
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
  isMicMuted = !isMicMuted;
  btn.classList.toggle('text-emerald-400', !isMicMuted);
  btn.classList.toggle('text-red-400', isMicMuted);
}

function sendVoiceChat() {
  const input = document.getElementById('voiceChatInput');
  const msg = input.value.trim();
  if (!msg) return;
  const myName = document.getElementById('headerUsername').innerText;
  const box = document.getElementById('voiceChatMessages');
  box.innerHTML += `<div class="text-[11px]"><strong class="text-pink-400">${myName}:</strong> <span class="text-gray-200">${msg}</span></div>`;
  input.value = '';
}

const translations = {
  ku: { balance: "باڵانس", srvKurd: "سێرڤەری کوردی", srvIraq: "سێرڤەری عێراقی", srvEu: "سێرڤەری ئەوروپی", eventsTitle: "ئیڤێنت و پاڵەوانێتییەکان", newsTitle: "هەواڵ و زانیاری", walletTitle: "جزدانی دارایی", postsTitle: "کلیپ و وێنە", voiceTitle: "ژوورە دەنگییەکان", navNews: "هەواڵ", navWallet: "جزدان", navEvents: "ئیڤێنتەکان", navPosts: "پۆست", navVoice: "ژووری دەنگی", timeRemaining: "کاتی ماوە بۆ دەستپێکردن", prizeLabel: "خەڵات", joinBtn: "بەشداریکردن", commentBtn: "کۆمێنت", playersOnline: "یاریزان", joinRoomBtn: "چوونە ژوورەوە" },
  ar: { balance: "الرصيد", srvKurd: "سيرفر كردستان", srvIraq: "السيرفر العراقي", srvEu: "السيرفر الأوروبي", eventsTitle: "البطولات والأحداث", newsTitle: "الأخبار والمعلومات", walletTitle: "المحفظة المالية", postsTitle: "مقاطع وصور", voiceTitle: "الغرف الصوتية", navNews: "الأخبار", navWallet: "المحفظة", navEvents: "البطولات", navPosts: "المنشورات", navVoice: "غرف صوتية", timeRemaining: "الوقت المتبقي", prizeLabel: "الجائزة", joinBtn: "مشاركة", commentBtn: "تعليق", playersOnline: "لاعب", joinRoomBtn: "دخول" },
  en: { balance: "Balance", srvKurd: "Kurdistan Server", srvIraq: "Iraq Server", srvEu: "Europe Server", eventsTitle: "Tournaments & Events", newsTitle: "News & Info", walletTitle: "Wallet", postsTitle: "Media Feed", voiceTitle: "Voice Rooms", navNews: "News", navWallet: "Wallet", navEvents: "Events", navPosts: "Feed", navVoice: "Voice", timeRemaining: "Starts In", prizeLabel: "Prize", joinBtn: "Join", commentBtn: "Comments", playersOnline: "Online", joinRoomBtn: "Join" }
};

function changeLanguage(lang) {
  document.documentElement.dir = (lang === 'en') ? 'ltr' : 'rtl';
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang][key]) el.innerText = translations[lang][key];
  });
  changeServer(document.getElementById('serverSelect').value);
  renderEvents();
  renderMediaFeed();
  renderVoiceRooms();
}

function changeServer(srv) {
  const lang = document.getElementById('langSelect').value;
  const keyMap = { kurd: 'srvKurd', iraq: 'srvIraq', eu: 'srvEu' };
  document.getElementById('activeServerBadge').innerText = translations[lang][keyMap[srv]];
}

function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

checkExistingSession();
renderEvents();
renderNews();
renderMediaFeed();
renderVoiceRooms();
lucide.createIcons();
