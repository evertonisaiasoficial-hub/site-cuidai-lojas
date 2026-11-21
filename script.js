// Cuida Aí Lojas — extras opcionais (o site funciona sem JavaScript)
(function () {
  var d = document, root = d.documentElement;
  var ano = d.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();

  // Fecha o menu do celular ao tocar num link
  var chk = d.getElementById('menu');
  if (chk) d.querySelectorAll('.nav a').forEach(function (a) {
    a.addEventListener('click', function () { chk.checked = false; });
  });

  // Revelar ao rolar
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  root.classList.add('js');
  var io = new IntersectionObserver(function (itens) {
    itens.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('visivel'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  d.querySelectorAll('.revela').forEach(function (el) { io.observe(el); });
})();
