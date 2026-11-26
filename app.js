// چوونەژوورەوە لە ڕێگەی Google
async function loginWithGoogle() {
  const loader = document.getElementById('authLoader');
  const errBox = document.getElementById('authErrorBox');
  if (loader) loader.classList.remove('hidden');
  if (errBox) errBox.classList.add('hidden');

  // دەستنیشانکردنی ناوی گۆڕاوەکەی supabase لە ناو app.js
  const client = typeof supabaseClient !== 'undefined' ? supabaseClient : (typeof _supabase !== 'undefined' ? _supabase : supabase);

  const { error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'https://kx-arena.vercel.app'
    }
  });

  if (error && errBox) {
    if (loader) loader.classList.add('hidden');
    errBox.textContent = 'هەڵە لە چوونەژوورەوە بە گووگڵ: ' + error.message;
    errBox.classList.remove('hidden');
  }
}

// پشکنینی خۆکار کاتێک یاریزانەکە لە گووگڵ دەگەڕێتەوە ناو وێبسایتەکە
window.addEventListener('DOMContentLoaded', async () => {
  const client = typeof supabaseClient !== 'undefined' ? supabaseClient : (typeof _supabase !== 'undefined' ? _supabase : supabase);
  if (!client || !client.auth) return;

  const { data: { session } } = await client.auth.getSession();
  if (session && session.user) {
    const authScreen = document.getElementById('authScreen');
    if (authScreen) authScreen.classList.add('hidden');

    const user = session.user;
    const displayName = user.user_metadata?.full_name || user.email.split('@')[0];
    const avatarUrl = user.user_metadata?.avatar_url;

    const headerUser = document.getElementById('headerUsername');
    if (headerUser) headerUser.textContent = displayName;

    if (avatarUrl) {
      ['headerAvatar', 'modalAvatar', 'voiceMyAvatar'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.src = avatarUrl;
      });
    }
  }
});
