// A failed module import otherwise leaves the initial loading message on screen forever.
// Keep this as a classic script so it still runs when app.js or one of its imports fails.
window.addEventListener('load', () => {
  setTimeout(() => {
    const app = document.querySelector('#app');
    if (!app?.querySelector('.loading')) return;
    if (window.civBootStarted) {
      app.innerHTML = `<div class="loading" role="status">
        <strong>Connecting to the classroom…</strong>
        <p>The server is taking longer than usual. Please wait.</p>
        <p>教室に接続しています。サーバーの応答に時間がかかっています。しばらくお待ちください。</p>
      </div>`;
      return;
    }
    app.innerHTML = `<div class="fatal" role="alert">
      <strong>The app could not finish loading.</strong>
      <p>Reload the page to try again. If this continues, ask the teacher to check the website deployment.</p>
      <p>ページを再読み込みしてください。解決しない場合は、先生にウェブサイトの動作確認を依頼してください。</p>
      <button type="button" id="reload-app">Reload / 再読み込み</button>
    </div>`;
    document.querySelector('#reload-app').addEventListener('click', () => window.location.reload());
  }, 8000);
});
