const VOICE_MODULE = {
  enabled: false, // بۆ کردنەوە لە داهاتوودا تەنها ئەمە بکە بە true

  rooms: [
    { id: 1, name: "ژووری گشتی یاریزانانی کورد", count: 18, tag: "PUBG & Chill" },
    { id: 2, name: "ژووری سکوادەکانی Erangel", count: 9, tag: "Competitive" }
  ]
};

function renderVoiceModule() {
  const container = document.getElementById('tab-voice');
  if (!container) return;

  if (!VOICE_MODULE.enabled) {
    container.innerHTML = `
      <div class="glass-card rounded-3xl p-10 text-center space-y-3 neon-glow mt-6">
        <div class="w-14 h-14 mx-auto rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
          <i data-lucide="mic-off" class="w-7 h-7"></i>
        </div>
        <h3 class="text-base font-black text-white">ژوورە دەنگییەکان</h3>
        <p class="text-xs text-pink-300 font-bold">لە ئێستادا بەردەست نییە — بەم زووانە دەکرێتەوە</p>
      </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
    return;
  }

  const lang = document.getElementById('langSelect')?.value || 'ku';
  container.innerHTML = `
    <div class="flex items-center justify-between">
      <h2 class="text-sm font-black vice-text">${translations[lang].voiceTitle}</h2>
      <button onclick="createNewModuleVoiceRoom()" class="bg-purple-900/80 border border-pink-500/40 px-3 py-1 rounded-xl text-[11px] font-bold">+ دروستکردنی ژوور</button>
    </div>
    <div class="space-y-3">
      ${VOICE_MODULE.rooms.map(r => `
        <div class="glass-card rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span class="text-[9px] bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded font-bold">${r.tag}</span>
            <h3 class="text-xs font-bold text-white mt-1">${r.name}</h3>
            <span class="text-[10px] text-emerald-400">● ${r.count} ${translations[lang].playersOnline}</span>
          </div>
          <button onclick="joinVoiceRoom('${r.name}')" class="vice-gradient px-3.5 py-2 rounded-xl text-xs font-bold">${translations[lang].joinRoomBtn}</button>
        </div>
      `).join('')}
    </div>
  `;
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function createNewModuleVoiceRoom() {
  const rName = prompt("ناوی ژوورە دەنگییە نوێیەکەت بنووسە:");
  if (!rName) return;
  VOICE_MODULE.rooms.unshift({ id: Date.now(), name: rName, count: 1, tag: "Live" });
  renderVoiceModule();
}

// پەیوەستکردن بە فەنکشنی گۆڕینی تابەکان تا هەمیشە دایبخات
const origSwitchTabVoice = window.switchTab;
window.switchTab = function(tabName) {
  if (origSwitchTabVoice) origSwitchTabVoice(tabName);
  if (tabName === 'voice') renderVoiceModule();
};

renderVoiceModule();

