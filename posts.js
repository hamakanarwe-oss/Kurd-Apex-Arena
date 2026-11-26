const POSTS_MODULE = {
  enabled: false, // بۆ کردنەوە لە داهاتوودا تەنها ئەمە بکە بە true

  posts: [
    {
      user: "KurdApex_Pro",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
      type: "image",
      mediaUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
      caption: "ئامادەکارییەکان بۆ خولی گەورەی ئەم هەفتەیە",
      likes: 48,
      comments: ["شازە!"]
    }
  ]
};

function renderPostsModule() {
  const container = document.getElementById('tab-posts');
  if (!container) return;

  if (!POSTS_MODULE.enabled) {
    container.innerHTML = `
      <div class="glass-card rounded-3xl p-10 text-center space-y-3 neon-glow mt-6">
        <div class="w-14 h-14 mx-auto rounded-2xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400">
          <i data-lucide="lock" class="w-7 h-7"></i>
        </div>
        <h3 class="text-base font-black text-white">بەشی پۆست و کلیپەکان</h3>
        <p class="text-xs text-pink-300 font-bold">لە ئێستادا بەردەست نییە — بەم زووانە دەکرێتەوە</p>
      </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
    return;
  }

  const lang = document.getElementById('langSelect')?.value || 'ku';
  container.innerHTML = `
    <div class="flex items-center justify-between">
      <h2 class="text-sm font-black vice-text">${translations[lang].postsTitle}</h2>
      <button onclick="openModal('newPostModal')" class="vice-gradient px-3 py-1.5 rounded-xl text-xs font-bold">+ بڵاوکردنەوە</button>
    </div>
    <div id="postsFeed" class="space-y-4">
      ${POSTS_MODULE.posts.map((p, idx) => `
        <div class="glass-card rounded-2xl overflow-hidden">
          <div class="p-3 flex items-center gap-2.5">
            <img src="${p.avatar}" class="w-8 h-8 rounded-full object-cover border border-pink-500">
            <span class="text-xs font-bold text-white">${p.user}</span>
          </div>
          ${p.type === 'video' ? `<video src="${p.mediaUrl}" controls playsinline class="w-full max-h-96 object-cover bg-black"></video>` : `<img src="${p.mediaUrl}" class="w-full max-h-96 object-cover">`}
          <div class="p-3 space-y-2">
            <p class="text-xs text-gray-200">${p.caption}</p>
            <div class="flex items-center gap-5 pt-2 border-t border-purple-900/40 text-xs">
              <button onclick="POSTS_MODULE.posts[${idx}].likes++; renderPostsModule()" class="flex items-center gap-1.5 text-pink-400 font-bold"><i data-lucide="heart" class="w-4 h-4 fill-pink-500"></i> <span>${p.likes}</span></button>
              <button onclick="addCommentToModulePost(${idx})" class="flex items-center gap-1.5 text-gray-300"><i data-lucide="message-circle" class="w-4 h-4"></i> <span>${p.comments.length} ${translations[lang].commentBtn}</span></button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function addCommentToModulePost(idx) {
  const txt = prompt("کۆمێنتەکەت بنووسە:");
  if (!txt) return;
  POSTS_MODULE.posts[idx].comments.push(txt);
  renderPostsModule();
}

const origSwitchTabPosts = window.switchTab;
window.switchTab = function(tabName) {
  if (origSwitchTabPosts) origSwitchTabPosts(tabName);
  if (tabName === 'posts') renderPostsModule();
};

renderPostsModule();
