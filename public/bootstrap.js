// A failed module import otherwise leaves the initial loading message on screen forever.
// Keep this as a classic script so it still runs when app.js or one of its imports fails.
window.addEventListener('load', () => {
  setTimeout(() => {
    const app = document.querySelector('#app');
    if (!app?.querySelector('.loading')) return;
    app.innerHTML = `<div class="fatal" role="alert">
      <strong>The app could not finish loading.</strong>
      <p>Restart the server, then open the URL printed in its terminal.</p>
      <p>アプリを読み込めませんでした。サーバーを再起動し、ターミナルに表示されたURLを開いてください。</p>
    </div>`;
  }, 8000);
});
