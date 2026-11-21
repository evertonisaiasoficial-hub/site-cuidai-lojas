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
  var cta = null;
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

  // formulário de contato: envia para /api/contato (Cloudflare) com Turnstile; sem servidor, cai no e-mail
  var SITEKEY = '';   // TROCAR: chave pública (Site Key) do Turnstile; vazia = formulário usa o e-mail
  var form = d.getElementById('form-contato'), msg = d.getElementById('fc-msg');
  if (form) {
    var tsBox = d.getElementById('ts-box'), tsToken = '';
    function dizer(t, erro) { if (msg) { msg.textContent = t; msg.className = 'fc-msg' + (erro ? ' erro' : ''); } }
    if (SITEKEY) {
      window.__tsOk = function (t) { tsToken = t; };
      window.__tsFim = function () { tsToken = ''; };
      var sc = d.createElement('script');
      sc.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'; sc.async = true; sc.defer = true;
      sc.onload = function () { if (window.turnstile) window.turnstile.render(tsBox, { sitekey: SITEKEY, callback: window.__tsOk, 'expired-callback': window.__tsFim, 'error-callback': window.__tsFim, language: 'pt-br' }); };
      d.head.appendChild(sc);
    }
    var plano0 = '';
    d.querySelectorAll('[data-plano]').forEach(function (a) {
      a.addEventListener('click', function () { plano0 = a.getAttribute('data-plano'); if (form.plano) form.plano.value = plano0; });
    });
    form.addEventListener('submit', function (ev) {
      var f = form, nome = f.nome.value.trim(), contato = f.contato.value.trim();
      var mail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contato), digs = contato.replace(/\D/g, '');
      var fone = /^[\d\s()+\-.]+$/.test(contato) && digs.length >= 10 && digs.length <= 13;
      if (nome.length < 2) { ev.preventDefault(); dizer('Informe seu nome.', true); f.nome.focus(); return; }
      if (!mail && !fone) { ev.preventDefault(); dizer('Informe um WhatsApp com DDD ou um e-mail válido.', true); f.contato.focus(); return; }
      if (!f.aceite.checked) { ev.preventDefault(); dizer('Marque a autorização para responder seu contato.', true); return; }
      if (!SITEKEY) { // sem servidor: abre o e-mail já preenchido
        ev.preventDefault();
        var corpo = 'Nome: ' + nome + '\nContato: ' + contato + '\nLoja: ' + f.plataforma.value + '\nPlano: ' + f.plano.value + '\n' + f.mensagem.value;
        location.href = 'mailto:contato@cuidaailojas.com.br?subject=' + encodeURIComponent('Quero testar 7 dias grátis') + '&body=' + encodeURIComponent(corpo);
        return;
      }
      ev.preventDefault();
      if (!tsToken) { dizer('Aguarde a verificação "não sou um robô" e envie de novo.', true); return; }
      var btn = f.querySelector('button[type=submit]'); btn.disabled = true; dizer('Enviando…');
      fetch('/api/contato', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({
        nome: nome, contato: contato, plataforma: f.plataforma.value, plano: f.plano.value, mensagem: f.mensagem.value, site: f.site.value, aceite: true, turnstile: tsToken }) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (x) {
          if (x.ok) { f.reset(); dizer('Recebemos! Vamos responder o mais rápido possível.'); }
          else { dizer(x.j.erro || 'Não deu para enviar. Escreva para o e-mail abaixo.', true); btn.disabled = false; }
          if (window.turnstile) window.turnstile.reset(); tsToken = '';
        })
        .catch(function () { dizer('Sem conexão. Tente de novo ou escreva para o e-mail abaixo.', true); btn.disabled = false; });
    });
  }

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
