/* Cuida Aí Lojas — extras da página inicial. O site funciona sem este arquivo. */
(function () {
  'use strict';
  /* TROCAR: número do WhatsApp com DDI e DDD, só dígitos (ex.: '5511999998888').
     Vazio = os botões de WhatsApp abrem o e-mail de contato. */
  var WHATSAPP = '';

  var d = document, raiz = d.documentElement;
  raiz.classList.add('js');
  var reduz = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var ano = d.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();

  // WhatsApp: só liga quando o número estiver preenchido (só dígitos, 12 ou 13)
  var numero = String(WHATSAPP).replace(/\D/g, '');
  if (/^\d{12,13}$/.test(numero)) {
    d.querySelectorAll('[data-whats]').forEach(function (a) {
      a.href = 'https://wa.me/' + numero + '?text=' + encodeURIComponent(a.getAttribute('data-whats'));
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    });
  } else {
    var w = d.querySelector('.whats span');
    if (w) w.textContent = 'Tirar dúvidas';
    var wl = d.querySelector('.whats');
    if (wl) wl.setAttribute('aria-label', 'Tirar dúvidas por e-mail');
  }

  // botão de plano: leva o nome do plano para o pedido de teste
  var cta = d.querySelector('#comecar [data-whats]');
  d.querySelectorAll('[data-plano]').forEach(function (a) {
    a.addEventListener('click', function () {
      if (!cta) return;
      var plano = a.getAttribute('data-plano').replace(/[^\wÀ-ú ]/g, '').slice(0, 20);
      var txt = 'Olá! Quero testar o Cuida Aí Lojas por 7 dias grátis (plano ' + plano + ').';
      cta.setAttribute('data-whats', txt);
      if (/^https:\/\/wa\.me\//.test(cta.href)) cta.href = 'https://wa.me/' + numero + '?text=' + encodeURIComponent(txt);
      else cta.href = 'mailto:contato@cuidaailojas.com.br?subject=' + encodeURIComponent('Quero testar 7 dias grátis (plano ' + plano + ')');
    });
  });

  // barra de progresso
  var barra = d.querySelector('.progresso'), pedido = false;
  function rolagem() {
    pedido = false;
    var max = raiz.scrollHeight - window.innerHeight;
    if (barra) barra.style.width = (max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0) + '%';
  }
  window.addEventListener('scroll', function () { if (!pedido) { pedido = true; requestAnimationFrame(rolagem); } }, { passive: true });
  rolagem();

  // revelar ao rolar
  var itens = d.querySelectorAll('.revela');
  if ('IntersectionObserver' in window && !reduz) {
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('vis'); obs.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    itens.forEach(function (el) { obs.observe(el); });
  } else {
    itens.forEach(function (el) { el.classList.add('vis'); });
  }

  // fechar o menu do celular ao tocar num link
  var chk = d.getElementById('menu');
  d.querySelectorAll('.nav a').forEach(function (a) {
    a.addEventListener('click', function () { if (chk) chk.checked = false; });
  });
})();
