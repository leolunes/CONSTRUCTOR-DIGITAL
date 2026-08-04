(() => {
  const button = document.getElementById('menuButton');
  const menu = document.getElementById('mainMenu');
  const year = document.getElementById('year');

  if (year) year.textContent = new Date().getFullYear();

  if (button && menu) {
    button.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      button.setAttribute('aria-expanded', String(open));
      button.textContent = open ? '✕ Cerrar' : '☰ Menú';
    });

    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.remove('open');
        button.setAttribute('aria-expanded', 'false');
        button.textContent = '☰ Menú';
      });
    });
  }
})();