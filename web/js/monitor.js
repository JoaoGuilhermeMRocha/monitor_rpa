// Telas do monitor: Painel (Fila | Agora nas VMs | Necessária ação manual, e as últimas finalizadas),
// Automações (lista e detalhe com log), Indicadores (com resumos executivos) e modo TV.
(function () {
  'use strict';

  const D = window.DADOS_DEMO;

  const ESTADOS = {
    falha: { rotulo: 'Com falha', curto: 'Falhou', ordem: 1 },
    atrasado: { rotulo: 'Atrasadas', curto: 'Atrasada', ordem: 2 },
    rodando: { rotulo: 'Rodando agora', curto: 'Rodando', ordem: 3 },
    ressalva: { rotulo: 'Com ressalva', curto: 'Com ressalva', ordem: 4 },
    ok: { rotulo: 'Em dia', curto: 'Em dia', ordem: 5 },
    pausado: { rotulo: 'Pausadas', curto: 'Pausada', ordem: 6 },
  };
  const STATUS_EXEC = { sucesso: 'Sucesso', falha: 'Falha', ressalva: 'Com ressalva', rodando: 'Rodando' };
  const EXEC_PARA_ESTADO = { sucesso: 'ok', falha: 'falha', ressalva: 'ressalva', rodando: 'rodando' };

  // Ícones desenhados em grade de 24px, traço arredondado (premissa do manual de ícones).
  const ICONES = {
    falha: '<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>',
    atrasado: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
    rodando: '<circle cx="12" cy="12" r="9"/><path d="M10 8.5v7l5.5-3.5z"/>',
    ressalva: '<path d="M12 3.5l9 16H3z"/><path d="M12 10v4.5M12 17.2v.1"/>',
    ok: '<circle cx="12" cy="12" r="9"/><path d="M8 12.3l2.8 2.7L16.2 9.5"/>',
    pausado: '<circle cx="12" cy="12" r="9"/><path d="M10 8.5v7M14 8.5v7"/>',
    duracao: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 1.5M9.5 2.5h5"/>',
    geral: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
    indicadores: '<path d="M4 20.5h16"/><path d="M7 17v-5M12 17V7M17 17v-8"/>',
    busca: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5l5 5"/>',
    tv: '<rect x="3" y="4.5" width="18" height="12.5" rx="1.5"/><path d="M8.5 20.5h7M12 17v3.5"/>',
    fechar: '<path d="M6 6l12 12M18 6L6 18"/>',
    copiar: '<rect x="8.5" y="8.5" width="11" height="11" rx="1.5"/><path d="M15.5 8.5V5.5a1 1 0 00-1-1h-9a1 1 0 00-1 1v9a1 1 0 001 1h3"/>',
    ordenar: '<path d="M8 9.5l4-4 4 4M8 14.5l4 4 4-4"/>',
    sair: '<path d="M14 4.5h4.5a1 1 0 011 1v13a1 1 0 01-1 1H14"/><path d="M10 8l-4 4 4 4M6 12h10"/>',
    log: '<path d="M6.5 3.5h8l4 4v13h-12z"/><path d="M9.5 11.5h6M9.5 14.5h6M9.5 17.5h4"/>',
    sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
    lua: '<path d="M19.5 14.5A8 8 0 019.5 4.5a8 8 0 1010 10z"/>',
    filtro: '<path d="M4 5.5h16l-6.2 7.2v5.6l-3.6 1.9v-7.5z"/>',
    inicio: '<path d="M8 5.5v13l10-6.5z"/>',
    maquina: '<rect x="3.5" y="4.5" width="17" height="11" rx="1.5"/><path d="M8 19.5h8M12 15.5v4"/>',
    automacoes: '<path d="M9.5 6.5h10M9.5 12h10M9.5 17.5h10"/><circle cx="5" cy="6.5" r="1.2"/><circle cx="5" cy="12" r="1.2"/><circle cx="5" cy="17.5" r="1.2"/>',
    abaixo: '<path d="M7 10l5 5 5-5"/>',
    imprimir: '<path d="M7 9V3.5h10V9"/><rect x="3.5" y="9" width="17" height="8" rx="1.5"/><path d="M7 14h10v6.5H7z"/>',
  };
  const ico = (nome, extra) => '<svg class="ico' + (extra ? ' ' + extra : '') + '" viewBox="0 0 24 24" aria-hidden="true">' + ICONES[nome] + '</svg>';

  // ---------- Formatação ----------
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const nf = new Intl.NumberFormat('pt-BR');
  const num = (n) => nf.format(Math.round(n));
  const pct = (x, casas = 1) => (x * 100).toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas }) + '%';
  const hora = (iso) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const mesmoDia = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  function dataHora(iso) {
    const d = new Date(iso); const hoje = new Date(); const ontem = new Date(); ontem.setDate(hoje.getDate() - 1);
    const amanha = new Date(); amanha.setDate(hoje.getDate() + 1);
    if (mesmoDia(d, hoje)) return 'hoje ' + hora(iso);
    if (mesmoDia(d, ontem)) return 'ontem ' + hora(iso);
    if (mesmoDia(d, amanha)) return 'amanhã ' + hora(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' ' + hora(iso);
  }
  function duracao(seg) {
    seg = Math.max(0, Math.round(seg));
    if (seg < 60) return seg + ' s';
    const m = Math.floor(seg / 60); const s = seg % 60;
    if (m < 10) return m + ' min' + (s ? ' ' + s + ' s' : '');
    if (m < 60) return m + ' min';
    return Math.floor(m / 60) + ' h' + (m % 60 ? ' ' + (m % 60) + ' min' : '');
  }
  function relativo(iso) {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    const futuro = diff < 0; const s = Math.abs(diff);
    let t;
    if (s < 60) t = 'menos de 1 min';
    else if (s < 3600) t = Math.floor(s / 60) + ' min';
    else if (s < 86400) t = Math.floor(s / 3600) + ' h' + (Math.floor((s % 3600) / 60) ? ' ' + Math.floor((s % 3600) / 60) + ' min' : '');
    else t = Math.floor(s / 86400) + (Math.floor(s / 86400) === 1 ? ' dia' : ' dias');
    return futuro ? 'em ' + t : 'há ' + t;
  }
  const rel = (iso, prefixo = '') => '<span data-rel="' + esc(iso) + '" data-prefixo="' + esc(prefixo) + '">' + prefixo + relativo(iso) + '</span>';

  // ---------- Estado da tela ----------
  const S = {
    rota: 'geral', sel: null, execSel: null,
    filtroEstados: new Set(), tec: 'todas', area: 'todas', busca: '',
    agrupar: true,
    periodo: '7d', nivelLog: 'todos', execsVisiveis: 12,
    reconhecidos: {}, reconhecendo: null,
    // Painel: aba do celular, fila e ações; Indicadores: resumos executivos.
    aba: 'agora', filaOrdem: 'prioridade', filaTec: 'todas', filaArea: 'todas', filaFiltros: false,
    menuFila: null, acaoForm: null, verIgnoradas: false, execPendente: null,
    indAba: 'graficos', resumo: 'dia', resumoArea: null, soDivergentes: false, validadas: {},
  };
  const porId = Object.fromEntries(D.automacoes.map((a) => [a.id, a]));
  const AREAS = [...new Set(D.automacoes.map((a) => a.area))];
  const alertaDe = (id) => D.alertas.find((x) => x.automacao_id === id && x.tipo !== 'duracao') || D.alertas.find((x) => x.automacao_id === id);
  const reconhecimento = (al) => S.reconhecidos[al.id] || (al.reconhecido_por ? { por: al.reconhecido_por, em: al.reconhecido_em, nota: al.nota } : null);
  const execsDe = (id) => D.execucoes[id] || [];
  const ehCelular = () => window.matchMedia('(max-width: 899px)').matches;
  // A aba Automações mostra lista e detalhe lado a lado (no celular o detalhe abre por cima).
  const ehMestre = (rota) => rota === 'automacoes';

  function filtradas() {
    const b = S.busca.trim().toLowerCase();
    return D.automacoes.filter((a) => {
      if (S.filtroEstados.size && !S.filtroEstados.has(a.estado)) return false;
      if (S.tec !== 'todas' && a.tecnologia !== S.tec) return false;
      if (S.area !== 'todas' && a.area !== S.area) return false;
      if (b && !(a.nome + ' ' + a.area + ' ' + a.maquina + ' ' + a.responsavel + ' ' + a.id + ' ' + a.tecnologia).toLowerCase().includes(b)) return false;
      return true;
    });
  }

  // Ordem da lista de automações: primeiro quem precisa de atenção, depois por nome.
  const ordenadas = (lista) => lista.slice().sort((x, y) => ESTADOS[x.estado].ordem - ESTADOS[y.estado].ordem || x.nome.localeCompare(y.nome, 'pt-BR'));
  function agrupadas(lista) {
    if (!S.agrupar) return [{ area: null, itens: ordenadas(lista) }];
    return AREAS.map((area) => ({ area, itens: ordenadas(lista.filter((a) => a.area === area)) })).filter((g) => g.itens.length);
  }

  function alertasAbertos() {
    return D.alertas.filter((al) => !reconhecimento(al)).sort((x, y) => x.gravidade - y.gravidade || new Date(x.desde) - new Date(y.desde));
  }

  // ---------- Pedaços reutilizados ----------
  const chip = (estado, texto) => '<span class="chip chip--' + estado + '">' + ico(estado) + '<span>' + esc(texto || ESTADOS[estado].curto) + '</span></span>';

  function ultimaTexto(a) {
    const u = a.ultima_execucao;
    if (a.estado === 'rodando') return rel(u.inicio, 'Rodando ');
    if (a.estado === 'atrasado') return 'Esperada às ' + hora(a.esperado_em) + ', sem sinal';
    if (a.estado === 'pausado') return 'Pausada · última ' + dataHora(u.inicio);
    return dataHora(u.inicio) + ' · ' + duracao(u.duracao_s);
  }

  function logoSlot(variante) {
    return '<span class="logo-slot' + (variante ? ' logo-slot--' + variante : '') + '" title="Espaço reservado: coloque aqui o arquivo oficial do logo Sicredi (assets/marca/)">' +
      '<span class="logo-slot__simbolo" aria-hidden="true"></span><span class="logo-slot__texto">Logo oficial</span></span>';
  }

  function barraFiltros(total, mostrando) {
    const tecs = ['todas', 'UiPath', 'Python'];
    const temFiltro = S.filtroEstados.size || S.tec !== 'todas' || S.area !== 'todas' || S.busca;
    return '<div class="filtros">' +
      '<div class="segmentado" role="group" aria-label="Tecnologia">' + tecs.map((t) =>
        '<button type="button" data-tec="' + t + '" aria-pressed="' + (S.tec === t) + '">' + (t === 'todas' ? 'Todas' : t) + '</button>').join('') + '</div>' +
      '<label class="campo-select"><span class="sr">Área</span><select id="filtro-area">' +
        '<option value="todas">Todas as áreas</option>' + AREAS.map((ar) => '<option' + (S.area === ar ? ' selected' : '') + '>' + esc(ar) + '</option>').join('') +
      '</select></label>' +
      ('<label class="campo-select"><span class="sr">Estado</span><select id="filtro-estado"><option value="todos">Todos os estados</option>' +
        Object.keys(ESTADOS).map((e) => '<option value="' + e + '"' + (S.filtroEstados.has(e) && S.filtroEstados.size === 1 ? ' selected' : '') + '>' + ESTADOS[e].rotulo + '</option>').join('') + '</select></label>') +
      '<label class="alternar"><input type="checkbox" id="agrupar"' + (S.agrupar ? ' checked' : '') + '><span>Agrupar por área</span></label>' +
      '<span class="filtros__conta">' + (temFiltro ? mostrando + ' de ' + total + ' · <button type="button" class="link" data-acao="limpar">Limpar filtros</button>' : total + ' automações') + '</span>' +
    '</div>';
  }

  function vazioFiltro() {
    return '<div class="vazio vazio--grande"><p><strong>Nenhuma automação com esses filtros.</strong></p><p>Tire algum filtro ou busque por outro nome.</p><button type="button" class="botao botao--sec" data-acao="limpar">Limpar filtros</button></div>';
  }

  function listaMestre(lista) {
    const abertos = alertasAbertos();
    const ids = new Set();
    let html = '';
    if (!S.filtroEstados.size && !S.busca && S.tec === 'todas' && S.area === 'todas' && abertos.length) {
      html += '<section class="mestre__grupo mestre__grupo--atencao"><h3 class="mestre__area">Precisa de atenção <span>' + abertos.length + '</span></h3><ul>' +
        abertos.map((al) => { ids.add(al.automacao_id); return itemMestre(porId[al.automacao_id], al); }).join('') + '</ul></section>';
    }
    agrupadas(lista).forEach((g) => {
      html += '<section class="mestre__grupo">' + (g.area ? '<h3 class="mestre__area">' + esc(g.area) + ' <span>' + g.itens.length + '</span></h3>' : '') +
        '<ul>' + g.itens.map((a) => itemMestre(a)).join('') + '</ul></section>';
    });
    return html;
  }
  function itemMestre(a, al) {
    return '<li><button type="button" class="mitem mitem--' + a.estado + '" data-abrir="' + a.id + '" aria-current="' + (S.sel === a.id && !ehCelular()) + '">' +
      '<span class="mitem__ico">' + ico(al && al.tipo === 'duracao' ? 'duracao' : a.estado) + '</span>' +
      '<span class="mitem__corpo"><span class="mitem__nome">' + esc(a.nome) + '</span>' +
      '<span class="mitem__sub">' + (al ? esc(al.titulo) + ' · ' + relativo(al.desde) : ultimaTexto(a)) + '</span></span>' +
      '<span class="tec tec--' + a.tecnologia.toLowerCase() + '">' + (a.tecnologia === 'UiPath' ? 'UiP' : 'Py') + '</span>' +
    '</button></li>';
  }

  // ---------- Painel: Fila | Agora (VMs) | Necessária ação manual, e as finalizadas embaixo ----------
  const numero = (execId) => '#' + execId.slice(1);
  const quandoTxt = (iso) => (mesmoDia(new Date(iso), new Date()) ? hora(iso) : dataHora(iso));
  const EU = 'você'; // No sistema real, o usuário logado (login corporativo).
  function buscaCasa(a, extra) {
    const b = S.busca.trim().toLowerCase();
    return !b || (a.nome + ' ' + a.area + ' ' + a.maquina + ' ' + a.responsavel + ' ' + a.id + ' ' + a.tecnologia + ' ' + (extra || '')).toLowerCase().includes(b);
  }

  function botaoTema() {
    const escuro = document.documentElement.dataset.tema === 'escuro';
    return ico(escuro ? 'sol' : 'lua') + '<span class="sr">' + (escuro ? 'Usar tema claro' : 'Usar tema escuro') + '</span>';
  }
  function trocarTema() {
    const novo = document.documentElement.dataset.tema === 'escuro' ? 'claro' : 'escuro';
    document.documentElement.dataset.tema = novo;
    try { localStorage.setItem('monitor-tema', novo); } catch (e) { /* sem armazenamento: vale só nesta visita */ }
    const b = document.getElementById('botao-tema');
    if (b) { b.innerHTML = botaoTema(); b.title = novo === 'escuro' ? 'Usar tema claro' : 'Usar tema escuro'; }
  }

  function casca() {
    const app = document.getElementById('app');
    const escuro = document.documentElement.dataset.tema === 'escuro';
    app.className = 'shell shell--op visao--operacao detalhe--gaveta';
    app.innerHTML =
      '<header class="topo topo--op">' +
        '<div class="topo__cel topo__marca">' + logoSlot('tema') + '</div>' +
        '<div class="topo__cel topo__cel--nome"><span class="topo__produto">Monitor de Automações</span></div>' +
        '<nav class="nav topo__cel topo__cel--nav" aria-label="Visões">' +
          '<a class="nav__item" href="#/geral" data-rota="geral" title="Painel">' + ico('geral') + '<span class="nav__rot">Painel</span><span class="nav__badge" id="badge-alertas" title="Necessária ação manual"></span></a>' +
          '<a class="nav__item" href="#/automacoes" data-rota="automacoes" title="Automações">' + ico('automacoes') + '<span class="nav__rot">Automações</span></a>' +
          '<a class="nav__item" href="#/indicadores" data-rota="indicadores" title="Indicadores">' + ico('indicadores') + '<span class="nav__rot">Indicadores</span></a>' +
        '</nav>' +
        '<div class="topo__cel topo__cel--busca"><label class="busca">' + ico('busca') + '<span class="sr">Buscar automação</span><input id="busca" type="search" placeholder="Buscar automação, VM ou processo" autocomplete="off"></label></div>' +
        '<div class="topo__cel topo__acoes">' +
          '<span class="atualizado" aria-live="polite"><span class="atualizado__pulso" aria-hidden="true"></span><span><span class="atualizado__rot">Atualizado às </span><time id="atualizado-hora"></time></span></span>' +
          '<button type="button" class="botao-ico" id="botao-tema" data-acao="tema" title="' + (escuro ? 'Usar tema claro' : 'Usar tema escuro') + '">' + botaoTema() + '</button>' +
          '<button type="button" class="botao botao--sec botao--tv" data-acao="tv" title="Modo TV">' + ico('tv') + '<span>Modo TV</span></button>' +
        '</div>' +
      '</header>' +
      '<main class="conteudo" id="conteudo" tabindex="-1"></main>' +
      '<div class="gaveta__fundo" id="gaveta-fundo" hidden></div>' +
      '<aside class="gaveta" id="gaveta" aria-label="Detalhe da automação" hidden></aside>' +
      '<div class="tv" id="tv" hidden></div>' +
      '<div class="recado" id="recado" role="status" aria-live="polite" hidden></div>';
  }

  // Recado curto depois de uma ação (some sozinho).
  let tRecado;
  function recado(msg, erro) {
    const r = document.getElementById('recado');
    if (!r) return;
    r.textContent = msg; r.className = 'recado' + (erro ? ' recado--erro' : ''); r.hidden = false;
    clearTimeout(tRecado); tRecado = setTimeout(() => { r.hidden = true; }, 4200);
  }

  // ----- Fila -----
  function itensFila(tv) {
    return D.fila.filter((f) => !f.ignorada).map((f) => Object.assign({ a: porId[f.automacao_id] }, f)).filter((f) => tv || (
      (S.filaTec === 'todas' || f.a.tecnologia === S.filaTec) && (S.filaArea === 'todas' || f.a.area === S.filaArea) && buscaCasa(f.a, numero(f.id))));
  }
  const momentoFila = (f) => new Date(f.entrou_em || f.previsto_para).getTime();
  const ordenaFila = (l) => l.sort((x, y) => (y.atender_agora ? 1 : 0) - (x.atender_agora ? 1 : 0) || (S.filaOrdem === 'prioridade' ? x.prioridade - y.prioridade : 0) || momentoFila(x) - momentoFila(y));

  const ACOES_FILA = [
    ['assumir', 'Assumir'], ['ignorar', 'Ignorar'], ['atender', 'Atender agora'], ['agendar', 'Agendar…'], ['comentar', 'Adicionar comentário…'],
  ];

  function menuFila(f) {
    const aberto = S.menuFila === f.id;
    return '<div class="acoes-fila">' +
      '<button type="button" class="botao botao--sec botao--peq acoes-fila__botao" data-menu-fila="' + f.id + '" aria-haspopup="menu" aria-expanded="' + aberto + '"' + (aberto ? ' aria-controls="menu-' + f.id + '"' : '') + '>' +
        '<span>Ações</span>' + ico('abaixo') + '<span class="sr"> para ' + numero(f.id) + '</span></button>' +
      (aberto ? '<ul class="menu" id="menu-' + f.id + '" role="menu" aria-label="Ações para ' + numero(f.id) + '">' + ACOES_FILA.map(([k, rot]) =>
        '<li role="none"><button type="button" role="menuitem" class="menu__i' + (k === 'ignorar' ? ' menu__i--perigo' : '') + '" data-acao-fila="' + k + '" data-id="' + f.id + '">' +
          (k === 'assumir' && f.assumida_por ? 'Soltar (deixar de assumir)' : k === 'atender' && f.atender_agora ? 'Atender agora (já é a próxima)' : rot) + '</button></li>').join('') + '</ul>' : '') +
    '</div>';
  }

  function formFila(f) {
    if (!S.acaoForm || S.acaoForm.id !== f.id) return '';
    if (S.acaoForm.tipo === 'agendar') {
      const d = new Date(Date.now() + 30 * 60000); d.setSeconds(0, 0);
      const local = (x) => new Date(x.getTime() - x.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      return '<form class="form-fila" data-form-fila="agendar" data-id="' + f.id + '">' +
        '<label for="quando-' + f.id + '">Agendar ' + numero(f.id) + ' para</label>' +
        '<input id="quando-' + f.id + '" name="quando" type="datetime-local" required min="' + local(new Date()) + '" value="' + local(d) + '">' +
        '<div class="form-fila__acoes"><button type="submit" class="botao botao--pri botao--peq">Agendar</button><button type="button" class="botao botao--sec botao--peq" data-acao="cancelar-fila">Cancelar</button></div></form>';
    }
    return '<form class="form-fila" data-form-fila="comentar" data-id="' + f.id + '">' +
      '<label for="coment-' + f.id + '">Comentário para o time</label>' +
      '<textarea id="coment-' + f.id + '" name="texto" rows="2" maxlength="500" required placeholder="Ex.: segurar até o arquivo da administradora chegar"></textarea>' +
      '<div class="form-fila__acoes"><button type="submit" class="botao botao--pri botao--peq">Salvar</button><button type="button" class="botao botao--sec botao--peq" data-acao="cancelar-fila">Cancelar</button></div></form>';
  }

  function itemFila(f, tv) {
    const ag = f.situacao === 'aguardando';
    const espera = ag ? (Date.now() - new Date(f.entrou_em).getTime()) / 60000 : 0;
    const quando = ag
      ? '<span class="fitem__quando fitem__quando--aguardando' + (espera > 10 ? ' fitem__quando--demora' : '') + '">Aguardando robô ' + rel(f.entrou_em) + '</span>'
      : '<span class="fitem__quando">Agendada ' + quandoTxt(f.previsto_para) + ' · ' + rel(f.previsto_para) + '</span>';
    const origem = !ag && f.origem === 'agenda' ? '' : (f.origem === 'manual' ? (ag ? 'Disparada por ' : 'Agendada por ') : 'Gatilho: ') + f.disparada_por;
    const marcas = (f.atender_agora ? '<span class="marca marca--proxima">Próxima a rodar</span>' : '') +
      (f.assumida_por ? '<span class="marca">Assumida por ' + esc(f.assumida_por) + '</span>' : '');
    const coms = f.comentarios || [];
    const comentarios = tv || !coms.length ? '' : '<ul class="fitem__coments">' + (coms.length > 2 ? '<li class="fitem__coment-mais">+' + (coms.length - 2) + ' comentários antes</li>' : '') +
      coms.slice(-2).map((c) => '<li><strong>' + esc(c.por) + '</strong> <span class="fraco">' + relativo(c.em) + '</span>: ' + esc(c.texto) + '</li>').join('') + '</ul>';
    const abre = tv ? 'div' : 'button';
    return '<li class="fitem fitem--' + f.situacao + (f.atender_agora ? ' fitem--proxima' : '') + (S.menuFila === f.id ? ' fitem--menu' : '') + '">' +
      '<' + abre + (tv ? '' : ' type="button" data-abrir="' + f.a.id + '"') + ' class="fitem__in"' + (origem && !tv ? ' title="' + esc(origem) + '"' : '') + '>' +
        '<span class="fitem__l1"><span class="fitem__nome">' + esc(f.a.nome) + '</span><span class="fitem__num">' + numero(f.id) + '</span></span>' +
        '<span class="fitem__l2"><span class="tec tec--' + f.a.tecnologia.toLowerCase() + '">' + f.a.tecnologia + '</span><span class="fitem__area">' + esc(f.a.area) + '</span>' +
          '<span class="prio prio--' + f.prioridade + '" title="Prioridade ' + f.prioridade + ' (1 é a mais alta)">Prioridade ' + f.prioridade + '</span></span>' +
        quando +
      '</' + abre + '>' +
      (tv ? '' : (ag ? menuFila(f) : '') + (marcas || comentarios ? '<div class="fitem__pe">' + (marcas ? '<span class="fitem__marcas">' + marcas + '</span>' : '') + comentarios + '</div>' : '') + formFila(f)) +
    '</li>';
  }

  function cabFila() {
    const n = itensFila().length;
    const ativos = (S.filaTec !== 'todas' ? 1 : 0) + (S.filaArea !== 'todas' ? 1 : 0);
    const tecs = ['todas', 'UiPath', 'Python'];
    return '<div class="fila__cab"><h2 class="op__h" id="t-fila">Fila <span class="op__conta">' + n + '</span></h2>' +
      '<button type="button" class="botao-ico' + (ativos ? ' botao-ico--ativo' : '') + '" data-acao="fila-filtros" aria-expanded="' + S.filaFiltros + '" aria-controls="fila-filtros" title="Filtrar a fila">' + ico('filtro') + '<span class="sr">Filtrar a fila</span>' + (ativos ? '<span class="botao-ico__n">' + ativos + '</span>' : '') + '</button>' +
      '<button type="button" class="botao botao--sec botao--peq fila__ordem" data-acao="fila-ordem" title="Trocar a ordem da fila">' + ico('ordenar') + '<span><span class="sr">Ordenada por </span>' + (S.filaOrdem === 'prioridade' ? 'Prioridade' : 'Horário') + '</span></button>' +
    '</div>' +
    (S.filaFiltros ? '<div class="fila__filtros" id="fila-filtros">' +
      '<div class="segmentado segmentado--peq" role="group" aria-label="Tecnologia">' + tecs.map((t) => '<button type="button" data-fila-tec="' + t + '" aria-pressed="' + (S.filaTec === t) + '">' + (t === 'todas' ? 'Todas' : t) + '</button>').join('') + '</div>' +
      '<label class="campo-select"><span class="sr">Área</span><select id="fila-area"><option value="todas">Todas as áreas</option>' + AREAS.map((ar) => '<option' + (S.filaArea === ar ? ' selected' : '') + '>' + esc(ar) + '</option>').join('') + '</select></label>' +
    '</div>' : '');
  }

  function painelFila() {
    const todos = itensFila();
    const ignoradas = D.fila.filter((f) => f.ignorada);
    const comFiltro = S.busca || S.filaTec !== 'todas' || S.filaArea !== 'todas';
    const blocoIgn = ignoradas.length ? '<div class="fila__ign"><button type="button" class="link" data-acao="ver-ignoradas" aria-expanded="' + S.verIgnoradas + '">' + ignoradas.length + (ignoradas.length === 1 ? ' ignorada' : ' ignoradas') + (S.verIgnoradas ? ' · esconder' : ' · mostrar') + '</button>' +
      (S.verIgnoradas ? '<ul>' + ignoradas.map((f) => '<li><span><strong>' + esc(porId[f.automacao_id].nome) + '</strong> ' + numero(f.id) + '<br><span class="fraco">ignorada por ' + esc(f.ignorada.por) + ' ' + relativo(f.ignorada.em) + '</span></span>' +
        '<button type="button" class="botao botao--sec botao--peq" data-acao-fila="desfazer-ignorar" data-id="' + f.id + '">Desfazer</button></li>').join('') + '</ul>' : '') + '</div>' : '';
    if (!todos.length) return '<div class="vazio vazio--grande"><p><strong>Nada na fila' + (comFiltro ? ' com esses filtros' : '') + '.</strong></p>' +
      (comFiltro ? '<button type="button" class="botao botao--sec botao--peq" data-acao="limpar">Limpar filtros</button>' : '<p>Nenhuma execução esperando robô nem agendada para as próximas horas.</p>') + '</div>' + blocoIgn;
    const grupo = (titulo, l, extra) => (l.length || extra ? '<section class="fila__grupo"><h3 class="fila__titulo">' + titulo + ' <span>' + l.length + '</span></h3>' + (l.length ? '<ol class="fila__lista">' + l.map((f) => itemFila(f)).join('') + '</ol>' : '') + (extra || '') + '</section>' : '');
    return grupo('Aguardando robô', ordenaFila(todos.filter((f) => f.situacao === 'aguardando')), blocoIgn) +
      grupo('Próximas na agenda', ordenaFila(todos.filter((f) => f.situacao === 'agendada')));
  }

  // ----- Agora: as VMs fixas, cada uma com o que roda nela -----
  function finalizadas() {
    const t = Date.now(); const l = [];
    Object.values(D.execucoes).forEach((execs) => execs.forEach((e) => { if (e.fim && e.status !== 'rodando' && new Date(e.fim).getTime() <= t) l.push(e); }));
    return l.sort((x, y) => new Date(y.fim) - new Date(x.fim));
  }

  function blocoVM(vm, fins, tv) {
    const a = vm.automacao_id ? porId[vm.automacao_id] : null;
    const b = tv ? '' : S.busca.trim().toLowerCase();
    if (!a) {
      const ult = fins.find((e) => e.maquina === vm.id);
      const casa = !b || vm.id.toLowerCase().includes(b);
      return '<li class="vm vm--livre' + (casa ? '' : ' vm--apagada') + '"><div class="vm__in">' +
        '<span class="vm__cab">' + ico('maquina') + '<span class="vm__nome">' + vm.id + '</span><span class="vm__sit">Livre</span></span>' +
        '<span class="vm__livre">Sem automação rodando ' + rel(vm.livre_desde) + '</span>' +
        (ult ? '<span class="vm__ult">Última: <strong>' + esc(porId[ult.automacao_id].nome) + '</strong> · ' + (ult.status === 'falha' ? 'falhou' : 'terminou') + ' às ' + hora(ult.fim) + '</span>' : '') +
        (itensFila(true).some((f) => f.situacao === 'aguardando') ? '' : '<span class="vm__ult">Nada aguardando robô na fila.</span>') +
      '</div></li>';
    }
    const u = a.ultima_execucao;
    const razao = u.duracao_s / a.duracao_media_s;
    const lenta = razao > 2.5;
    const casa = !b || buscaCasa(a, numero(u.id) + ' ' + vm.id);
    const p = u.itens_previstos > 1 ? Math.min(1, u.itens_ok / u.itens_previstos) : null;
    const abre = tv ? 'div' : 'button';
    return '<li class="vm vm--rodando' + (lenta ? ' vm--lenta' : '') + (casa ? '' : ' vm--apagada') + '">' +
      '<' + abre + (tv ? '' : ' type="button" data-abrir="' + a.id + '"') + ' class="vm__in">' +
        '<span class="vm__cab">' + ico('maquina') + '<span class="vm__nome">' + vm.id + '</span><span class="vm__sit">' + ico('rodando') + 'Rodando</span></span>' +
        '<span class="vm__auto">' + esc(a.nome) + '</span>' +
        '<span class="vm__sub"><strong>' + numero(u.id) + '</strong> · ' + esc(a.area) + ' · <span class="tec tec--' + a.tecnologia.toLowerCase() + '">' + a.tecnologia + '</span></span>' +
        '<span class="vm__etapa"><span class="fraco">Etapa:</span> ' + esc(u.etapa || 'Processando') + '</span>' +
        (p != null ? '<span class="vm__prog"><span class="progresso" aria-hidden="true"><span style="width:' + (p * 100).toFixed(0) + '%"></span></span><span class="vm__mini">item ' + num(u.itens_ok) + ' de ' + num(u.itens_previstos) + '</span></span>' : '') +
        '<span class="vm__tempo">' + ico('inicio') + '<span class="vm__hora">' + hora(u.inicio) + '</span><span class="vm__dur">' + rel(u.inicio, '') + '</span>' +
          (lenta ? '<span class="vm__alerta">' + razao.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '× o tempo normal</span>' : '<span class="vm__dur' + (razao > 1.2 ? ' vm__dur--aviso' : '') + '">normal ' + duracao(a.duracao_media_s) + '</span>') + '</span>' +
      '</' + abre + '></li>';
  }

  function gradeVMs(tv) {
    const fins = finalizadas();
    return '<ul class="vms' + (tv ? ' vms--tv' : '') + '">' + D.vms.map((vm) => blocoVM(vm, fins, tv)).join('') + '</ul>';
  }
  const textoVMs = () => { const o = D.vms.filter((v) => v.situacao === 'ocupada').length; return o + ' de ' + D.vms.length + ' VMs rodando'; };

  // ----- Necessária ação manual (o que antes era a aba Alertas) -----
  function itemManual(al, tv) {
    const a = porId[al.automacao_id]; const r = reconhecimento(al); const u = a.ultima_execucao;
    const est = al.tipo === 'atraso' ? 'atrasado' : al.tipo === 'duracao' ? 'rodando' : al.tipo;
    return '<li class="manual manual--' + est + (al.tipo === 'duracao' ? ' manual--duracao' : '') + (r ? ' manual--rec' : '') + '">' +
      '<p class="manual__tipo">' + ico(al.tipo === 'duracao' ? 'duracao' : est) + '<span>' + esc(al.titulo) + '</span><span class="manual__desde">' + rel(al.desde) + '</span></p>' +
      (tv ? '<p class="manual__nome">' + esc(a.nome) + '</p>' : '<button type="button" class="manual__nome" data-abrir="' + a.id + '">' + esc(a.nome) + '</button>') +
      '<p class="manual__sub">' + (al.tipo === 'atraso' ? a.id : numero(u.id)) + ' · ' + esc(a.maquina) + ' · ' + a.tecnologia + '</p>' +
      '<p class="manual__msg">' + esc(al.mensagem) + '</p>' +
      (r && !tv ? '<p class="manual__rec">Reconhecido por ' + esc(r.por) + ' ' + relativo(r.em) + (r.nota ? ': “' + esc(r.nota) + '”' : '') + '</p>' : '') +
      (tv ? '' : (S.reconhecendo === al.id ? formReconhecer(al) :
        '<div class="manual__acoes">' + (r ? '' : '<button type="button" class="botao botao--pri botao--peq" data-reconhecer="' + al.id + '">Reconhecer</button>') +
        '<button type="button" class="botao botao--sec botao--peq" data-abrir="' + a.id + '">' + ico('log') + '<span>Log completo</span></button></div>')) +
    '</li>';
  }

  function colunaManual(tv) {
    const casa = (al) => tv || buscaCasa(porId[al.automacao_id], numero(porId[al.automacao_id].ultima_execucao.id));
    const abertos = alertasAbertos().filter(casa);
    const rec = tv ? [] : D.alertas.filter((al) => reconhecimento(al)).filter(casa);
    if (!abertos.length && !rec.length) return '<p class="vazio">' + ico('ok') + (S.busca && !tv ? ' Nada com essa busca.' : ' Nenhuma automação precisa de ação manual agora.') + '</p>';
    return (abertos.length ? '<ol class="manuais">' + abertos.map((al) => itemManual(al, tv)).join('') + '</ol>' : '<p class="vazio">' + ico('ok') + ' Nada em aberto.</p>') +
      (rec.length ? '<h3 class="fila__titulo manual__h-rec">Já reconhecidos <span>' + rec.length + '</span></h3><ol class="manuais">' + rec.map((al) => itemManual(al)).join('') + '</ol>' : '');
  }

  // ----- Últimas finalizadas, discreta, no pé da tela -----
  function faixaFinalizadas(tv) {
    const l = finalizadas().filter((e) => tv || buscaCasa(porId[e.automacao_id], numero(e.id))).slice(0, tv ? 8 : 16);
    return '<section class="op__fim' + (tv ? ' op__fim--tv' : '') + '" aria-labelledby="t-fim' + (tv ? '-tv' : '') + '"><h2 class="fim__h" id="t-fim' + (tv ? '-tv' : '') + '">Últimas finalizadas</h2>' +
      (l.length ? '<ol class="fim__lista">' + l.map((e) => {
        const a = porId[e.automacao_id]; const est = EXEC_PARA_ESTADO[e.status];
        const tag = tv ? 'div' : 'button';
        return '<li><' + tag + (tv ? '' : ' type="button" data-abrir="' + a.id + '" data-abrir-exec="' + e.id + '"') + ' class="fim__i fim__i--' + est + '" title="' + esc(a.nome + ' · ' + STATUS_EXEC[e.status]) + '">' +
          '<time>' + hora(e.fim) + '</time>' + ico(est) + '<span class="sr">' + STATUS_EXEC[e.status] + ': </span><span class="fim__nome">' + esc(a.nome) + '</span>' +
          '<span class="fim__meta">' + numero(e.id) + ' · ' + duracao(e.duracao_s) + ' · ' + esc(e.maquina) + '</span></' + tag + '></li>';
      }).join('') + '</ol>' : '<p class="fim__vazio">Nada com essa busca.</p>') +
    '</section>';
  }

  function telaPainel() {
    const nFila = itensFila().length; const nManual = alertasAbertos().length;
    const aba = (k, rot, n) => '<button type="button" data-aba="' + k + '" aria-pressed="' + (S.aba === k) + '">' + rot + ' <span class="op__n">' + n + '</span></button>';
    return '<h1 class="sr">Painel</h1><div class="op" data-mostrando="' + S.aba + '">' +
      '<div class="op__abas"><div class="segmentado" role="group" aria-label="Mostrar">' + aba('fila', 'Fila', nFila) + aba('agora', 'Agora', D.vms.filter((v) => v.situacao === 'ocupada').length + '/' + D.vms.length) + aba('manual', 'Ação manual', nManual) + '</div></div>' +
      '<div class="op__cab op__cab--fila">' + cabFila() + '</div>' +
      '<div class="op__cab op__cab--agora"><h2 class="op__h" id="t-agora">Agora <span class="op__conta" id="conta-vms">' + textoVMs() + '</span></h2></div>' +
      '<div class="op__cab op__cab--manual"><h2 class="op__h" id="t-manual">Necessária ação manual <span class="op__conta">' + nManual + '</span></h2></div>' +
      '<section class="op__fila" data-rolagem="fila" aria-labelledby="t-fila">' + painelFila() + '</section>' +
      '<section class="op__agora" data-rolagem="agora" aria-labelledby="t-agora">' + gradeVMs() + '</section>' +
      '<section class="op__manual" data-rolagem="manual" aria-labelledby="t-manual">' + colunaManual() + '</section>' +
      faixaFinalizadas() +
    '</div>';
  }

  function telaTV() {
    const fila = itensFila(true);
    const ordenada = ordenaFila(fila.filter((f) => f.situacao === 'aguardando')).concat(ordenaFila(fila.filter((f) => f.situacao === 'agendada')));
    const abertos = alertasAbertos();
    return '<header class="tv__cab">' + logoSlot('tema') + '<h1 class="tv__titulo">Automações</h1>' +
        '<span class="tv__atualizado">Atualizado às <time data-atualizado></time></span><time class="tv__relogio" id="tv-relogio"></time>' +
        '<button type="button" class="botao botao--sec botao--peq tv__sair" data-acao="sair-tv">' + ico('sair') + '<span>Sair (Esc)</span></button></header>' +
      '<div class="tv__corpo tv__corpo--op">' +
        '<section class="tv__fila" aria-labelledby="t-tv-fila"><h2 id="t-tv-fila">Fila <span>' + fila.length + '</span></h2><ol class="fila__lista">' + ordenada.map((f) => itemFila(f, true)).join('') + '</ol></section>' +
        '<section class="tv__agora" aria-labelledby="t-tv-agora"><h2 id="t-tv-agora">Agora <span>' + textoVMs() + '</span></h2>' + gradeVMs(true) + '</section>' +
        '<section class="tv__manual" aria-labelledby="t-tv-manual"><h2 id="t-tv-manual">Ação manual <span>' + abertos.length + '</span></h2>' + colunaManual(true) + '</section>' +
      '</div>' + faixaFinalizadas(true);
  }

  // ----- Automações: lista à esquerda e detalhe à direita, como na V3 -----
  function telaAutomacoes() {
    const lista = filtradas();
    if (!S.sel && !ehCelular()) { const al = alertasAbertos()[0]; S.sel = al ? al.automacao_id : D.automacoes[0].id; }
    return '<h1 class="sr">Automações</h1>' +
      '<div class="mestre mestre--op"><section class="mestre__lista" aria-label="Automações">' +
        '<div class="mestre__filtros">' + barraFiltros(D.automacoes.length, lista.length) + '</div>' +
        (lista.length ? listaMestre(lista) : vazioFiltro()) +
      '</section><section class="mestre__detalhe" id="detalhe-fixo" aria-label="Detalhe da automação">' + (S.sel ? detalhe(porId[S.sel], true) : '') + '</section></div>';
  }

  // ---------- Detalhe ----------
  function graficoDuracao(a, execs) {
    const l = execs.slice(0, 30).reverse();
    if (!l.length) return '';
    const W = 600; const H = 150; const pad = { t: 12, r: 8, b: 22, l: 40 };
    const max = Math.max(a.duracao_media_s * 1.6, ...l.map((e) => e.duracao_s));
    const bw = (W - pad.l - pad.r) / l.length;
    const y = (v) => pad.t + (H - pad.t - pad.b) * (1 - v / max);
    const yMed = y(a.duracao_media_s);
    const ticks = [0, max / 2, max];
    return '<figure class="grafico"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Duração das últimas ' + l.length + ' execuções; média de ' + duracao(a.duracao_media_s) + '">' +
      ticks.map((t) => '<line class="grafico__grade" x1="' + pad.l + '" x2="' + (W - pad.r) + '" y1="' + y(t) + '" y2="' + y(t) + '"/><text class="grafico__eixo" x="' + (pad.l - 6) + '" y="' + (y(t) + 4) + '" text-anchor="end">' + Math.round(t / 60) + ' min</text>').join('') +
      l.map((e, i) => {
        const x = pad.l + i * bw + 1.5; const h = Math.max(2, H - pad.b - y(e.duracao_s));
        return '<rect class="grafico__barra grafico__barra--' + e.status + (S.execSel === e.id ? ' grafico__barra--sel' : '') + '" data-exec="' + e.id + '" x="' + x.toFixed(1) + '" y="' + (H - pad.b - h).toFixed(1) + '" width="' + Math.max(2, bw - 3).toFixed(1) + '" height="' + h.toFixed(1) + '"><title>' + dataHora(e.inicio) + ': ' + duracao(e.duracao_s) + ' (' + STATUS_EXEC[e.status] + ')</title></rect>';
      }).join('') +
      '<line class="grafico__media" x1="' + pad.l + '" x2="' + (W - pad.r) + '" y1="' + yMed + '" y2="' + yMed + '"/>' +
      '<text class="grafico__eixo grafico__eixo--fim" x="' + pad.l + '" y="' + (H - 6) + '">' + dataHora(l[0].inicio) + '</text>' +
      '<text class="grafico__eixo grafico__eixo--fim" x="' + (W - pad.r) + '" y="' + (H - 6) + '" text-anchor="end">' + dataHora(l[l.length - 1].inicio) + '</text>' +
    '</svg><figcaption class="legenda"><span class="legenda__i legenda__i--sucesso">Sucesso</span><span class="legenda__i legenda__i--ressalva">Com ressalva</span><span class="legenda__i legenda__i--falha">Falha</span><span class="legenda__i legenda__i--media">Média ' + duracao(a.duracao_media_s) + '</span></figcaption></figure>';
  }

  function blocoLog(a, ex) {
    if (!ex) return '';
    const linhas = D.logDaExecucao(ex.id).filter((l) => S.nivelLog === 'todos' || (S.nivelLog === 'avisos' ? l.nivel !== 'INFO' : l.nivel === 'ERROR'));
    const niveis = [['todos', 'Tudo'], ['avisos', 'Avisos e erros'], ['erros', 'Só erros']];
    return '<section class="detalhe__bloco bloco-log" id="bloco-log" aria-labelledby="t-log">' +
      '<div class="bloco-log__cab"><h3 id="t-log">Log da execução de ' + dataHora(ex.inicio) + '</h3>' +
        '<div class="segmentado segmentado--peq" role="group" aria-label="Filtrar log">' + niveis.map((n) => '<button type="button" data-nivel="' + n[0] + '" aria-pressed="' + (S.nivelLog === n[0]) + '">' + n[1] + '</button>').join('') + '</div>' +
        '<button type="button" class="botao botao--sec botao--peq" data-copiar="' + ex.id + '">' + ico('copiar') + '<span>Copiar</span></button></div>' +
      (linhas.length ? '<pre class="log" tabindex="0">' + linhas.map((l) => '<span class="log__l log__l--' + l.nivel.toLowerCase() + '"><span class="log__h">' + new Date(l.hora).toLocaleTimeString('pt-BR') + '</span> <span class="log__n">' + l.nivel.padEnd(5) + '</span> ' + esc(l.msg) + '</span>').join('\n') + '</pre>'
        : '<p class="vazio">Nenhuma linha desse nível nesta execução.</p>') +
      '<p class="bloco-log__fonte">Fonte: ' + (a.tecnologia === 'Python' ? 'logs\\' + a.id.toLowerCase() + '\\' + ex.id + '.log em ' + a.maquina : 'banco do Orchestrator, tabela de logs do robô ' + a.maquina) + '</p>' +
    '</section>';
  }

  function detalhe(a, fixo) {
    if (!a) return '';
    const execs = execsDe(a.id);
    // execSel vazio ('') = o time fechou de propósito a execução que estava aberta.
    if (S.execSel == null || (S.execSel !== '' && !execs.find((e) => e.id === S.execSel))) S.execSel = execs[0] ? execs[0].id : null;
    const exSel = execs.find((e) => e.id === S.execSel);
    const al = alertaDe(a.id);
    const r = al && reconhecimento(al);
    const fin = execs.filter((e) => e.status !== 'rodando');
    const itens30 = fin.reduce((s, e) => s + e.itens_ok, 0);
    const horas = itens30 * a.minutos_poupados_por_item / 60;
    const u = a.ultima_execucao;
    const estadoTxt = a.estado === 'rodando' ? 'Rodando' : a.estado === 'atrasado' ? 'Atrasada' : ESTADOS[a.estado].curto;

    let alertaHtml = '';
    if (al) {
      const est = al.tipo === 'atraso' ? 'atrasado' : al.tipo === 'duracao' ? 'rodando' : al.tipo;
      alertaHtml = '<div class="caixa-alerta caixa-alerta--' + est + '" role="status">' +
        '<div class="caixa-alerta__txt"><strong>' + esc(al.titulo) + '</strong> <span>' + rel(al.desde) + '</span><p>' + esc(al.mensagem) + '</p>' +
        (r ? '<p class="caixa-alerta__rec">Reconhecido por ' + esc(r.por) + ' ' + relativo(r.em) + (r.nota ? ': “' + esc(r.nota) + '”' : '') + '</p>' : '') + '</div>' +
        '<div class="caixa-alerta__acoes">' +
          (S.reconhecendo === al.id ? formReconhecer(al) : (r ? '' : '<button type="button" class="botao botao--pri botao--peq" data-reconhecer="' + al.id + '">Reconhecer</button>')) +
          (exSel ? '<a class="botao botao--sec botao--peq" href="#bloco-log" data-ir-log>' + ico('log') + '<span>Ver log</span></a>' : '') +
        '</div></div>';
    }

    const visiveis = execs.slice(0, S.execsVisiveis);
    return '<article class="detalhe' + (fixo ? ' detalhe--fixo' : '') + '">' +
      '<header class="detalhe__cab">' +
        (fixo ? '' : '<button type="button" class="detalhe__fechar" data-acao="fechar" aria-label="Fechar detalhe">' + ico('fechar') + '</button>') +
        '<div class="detalhe__estado">' + chip(a.estado, estadoTxt) + '<span class="tec tec--' + a.tecnologia.toLowerCase() + '">' + a.tecnologia + '</span><span class="detalhe__id">' + a.id + '</span></div>' +
        '<h2 class="detalhe__titulo" id="detalhe-titulo" tabindex="-1">' + esc(a.nome) + '</h2>' +
        '<p class="detalhe__sub">' + esc(a.area) + ' · ' + esc(a.maquina) + ' · responsável ' + esc(a.responsavel) + '</p>' +
        (a.pausada_por ? '<p class="detalhe__pausa">' + ico('pausado') + ' Pausada por ' + esc(a.pausada_por) + '</p>' : '') +
      '</header>' +
      alertaHtml +
      '<dl class="ficha">' +
        '<div><dt>Agenda</dt><dd>' + esc(a.agenda) + '</dd></div>' +
        '<div><dt>Próxima execução</dt><dd>' + (a.proxima_execucao ? dataHora(a.proxima_execucao) + ' <span class="fraco">(' + relativo(a.proxima_execucao) + ')</span>' : '—') + '</dd></div>' +
        '<div><dt>Última execução</dt><dd>' + (a.estado === 'rodando' ? 'começou ' + dataHora(u.inicio) + ', ' + rel(u.inicio, '') : dataHora(u.inicio) + ', ' + duracao(u.duracao_s)) + '</dd></div>' +
        '<div><dt>Duração média</dt><dd class="num">' + duracao(a.duracao_media_s) + '</dd></div>' +
        '<div><dt>Sucesso (30 dias)</dt><dd class="num">' + pct(a.taxa_sucesso) + ' <span class="fraco">de ' + fin.length + '</span></dd></div>' +
        '<div><dt>Horas poupadas (30 dias)</dt><dd class="num">' + num(horas) + ' h <span class="fraco">' + num(itens30) + ' itens</span></dd></div>' +
        ('<div><dt>Última VM</dt><dd>' + esc(a.maquina) + '</dd></div>' +
          '<div><dt>Prioridade na fila</dt><dd class="num">' + a.prioridade + ' <span class="fraco">(1 é a mais alta)</span></dd></div>' +
          '<div><dt>Hoje</dt><dd class="num">' + execs.filter((e) => mesmoDia(new Date(e.inicio), new Date())).length + ' de ' + a.previstas.hoje + ' <span class="fraco">previstas na agenda</span></dd></div>') +
      '</dl>' +
      '<section class="detalhe__bloco" aria-labelledby="t-dur"><h3 id="t-dur">Duração das últimas execuções</h3>' + graficoDuracao(a, execs) + '</section>' +
      '<section class="detalhe__bloco" aria-labelledby="t-execs"><h3 id="t-execs">Execuções</h3>' +
        '<div class="tabela-rolagem"><table class="execs"><thead><tr><th scope="col">Início</th><th scope="col">Duração</th><th scope="col">Resultado</th><th scope="col" class="num">Itens</th><th scope="col" class="c-msg">Mensagem</th></tr></thead><tbody>' +
        visiveis.map((e) => '<tr class="execs__l' + (e.id === S.execSel ? ' execs__l--sel' : '') + '" data-exec="' + e.id + '" aria-selected="' + (e.id === S.execSel) + '">' +
          '<td><button type="button" class="link-exec" data-exec="' + e.id + '" aria-expanded="' + (e.id === S.execSel) + '">' + ico('abaixo', 'link-exec__seta') + dataHora(e.inicio) + '</button></td>' +
          '<td class="num">' + (e.status === 'rodando' ? rel(e.inicio, '') : duracao(e.duracao_s)) + '</td>' +
          '<td>' + chip(EXEC_PARA_ESTADO[e.status], STATUS_EXEC[e.status]) + '</td>' +
          '<td class="num">' + num(e.itens_ok) + (e.itens_erro ? ' <span class="fraco">+' + e.itens_erro + '</span>' : '') + '</td>' +
          '<td class="c-msg">' + esc(e.mensagem) + '</td></tr>' + (e.id === S.execSel ? maisExec(a, e) : '')).join('') +
        '</tbody></table></div>' +
        (execs.length > S.execsVisiveis ? '<button type="button" class="botao botao--sec botao--peq botao--mais" data-acao="mais-execs">Mostrar mais ' + Math.min(12, execs.length - S.execsVisiveis) + ' de ' + (execs.length - S.execsVisiveis) + '</button>' : '') +
      '</section>' +
    '</article>';
  }

  // A linha da execução abre ("boxdrop") com tudo o que se sabe dela e o log completo.
  function maisExec(a, e) {
    const origem = { agenda: 'Agenda', manual: 'Disparo manual', gatilho: 'Gatilho' };
    const campos = [
      ['Número', numero(e.id)], ['Resultado', STATUS_EXEC[e.status]], ['Início', dataHora(e.inicio)], ['Fim', e.fim ? dataHora(e.fim) : 'ainda rodando'],
      ['Duração', (e.status === 'rodando' ? relativo(e.inicio).replace('há ', '') : duracao(e.duracao_s)) + ' · média ' + duracao(a.duracao_media_s)], ['VM', e.maquina || a.maquina],
      ['Itens OK', num(e.itens_ok) + (e.itens_previstos ? ' de ' + num(e.itens_previstos) : '')], ['Itens com exceção', num(e.itens_erro)],
    ];
    if (e.etapa) campos.push(['Etapa', e.etapa]);
    if (e.erro_tipo) campos.push(['Tipo do erro', e.erro_tipo]);
    campos.push(['Origem', e.origem ? origem[e.origem] + (e.disparada_por ? ': ' + e.disparada_por : '') : 'Agenda']);
    return '<tr class="execs__mais"><td colspan="5"><div class="exec-mais">' +
      '<dl class="exec-ficha">' + campos.map((c) => '<div><dt>' + c[0] + '</dt><dd>' + esc(c[1]) + '</dd></div>').join('') + '</dl>' +
      (e.mensagem ? '<p class="exec-msg exec-msg--' + EXEC_PARA_ESTADO[e.status] + '">' + esc(e.mensagem) + '</p>' : '') +
      blocoLog(a, e) + '</div></td></tr>';
  }

  function formReconhecer(al) {
    return '<form class="reconhecer" data-form-reconhecer="' + al.id + '">' +
      '<label for="nota-rec">Nota para o time (opcional)</label>' +
      '<textarea id="nota-rec" rows="2" placeholder="Ex.: abri o chamado 4471, investigando o seletor"></textarea>' +
      '<div class="reconhecer__acoes"><button type="submit" class="botao botao--pri botao--peq">Confirmar</button><button type="button" class="botao botao--sec botao--peq" data-acao="cancelar-rec">Cancelar</button></div></form>';
  }

  // ---------- Indicadores ----------
  function telaIndicadores() {
    if (S.indAba === 'resumos') return telaResumos();
    const dias = S.periodo === 'hoje' ? 1 : S.periodo === '7d' ? 7 : 30;
    const ini = new Date(); ini.setHours(0, 0, 0, 0); ini.setDate(ini.getDate() - (dias - 1));
    const execs = [];
    Object.entries(D.execucoes).forEach(([id, l]) => l.forEach((e) => { if (new Date(e.inicio) >= ini && e.status !== 'rodando') execs.push(Object.assign({ a: porId[id] }, e)); }));
    const tot = execs.length;
    const falhas = execs.filter((e) => e.status === 'falha').length;
    const ress = execs.filter((e) => e.status === 'ressalva').length;
    const itens = execs.reduce((s, e) => s + e.itens_ok, 0);
    const horas = execs.reduce((s, e) => s + e.itens_ok * e.a.minutos_poupados_por_item / 60, 0);

    // Série por dia (ou por hora, quando é só hoje).
    const baldes = [];
    if (dias === 1) for (let h = 0; h < 24; h++) baldes.push({ rot: String(h).padStart(2, '0') + 'h', ok: 0, ress: 0, falha: 0, t: (e) => new Date(e.inicio).getHours() === h });
    else for (let d = 0; d < dias; d++) { const dia = new Date(ini); dia.setDate(ini.getDate() + d); baldes.push({ rot: dia.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), ok: 0, ress: 0, falha: 0, t: (e) => mesmoDia(new Date(e.inicio), dia) }); }
    execs.forEach((e) => { const b = baldes.find((x) => x.t(e)); if (b) { if (e.status === 'falha') b.falha++; else if (e.status === 'ressalva') b.ress++; else b.ok++; } });

    const porArea = AREAS.map((ar) => {
      const l = execs.filter((e) => e.a.area === ar);
      const boas = l.filter((e) => e.status !== 'falha').length;
      return { ar, n: l.length, taxa: l.length ? boas / l.length : 1, horas: l.reduce((s, e) => s + e.itens_ok * e.a.minutos_poupados_por_item / 60, 0) };
    });
    const ranking = D.automacoes.map((a) => {
      const l = execs.filter((e) => e.a.id === a.id);
      const f = l.filter((e) => e.status === 'falha');
      return { a, falhas: f.length, n: l.length, ultima: f[0] };
    }).filter((x) => x.falhas).sort((x, y) => y.falhas - x.falhas).slice(0, 6);
    const tec = ['UiPath', 'Python'].map((t) => {
      const l = execs.filter((e) => e.a.tecnologia === t);
      return { t, qtd: D.automacoes.filter((a) => a.tecnologia === t).length, n: l.length, taxa: l.length ? l.filter((e) => e.status !== 'falha').length / l.length : 1, dur: l.length ? l.reduce((s, e) => s + e.duracao_s, 0) / l.length : 0 };
    });

    const periodos = [['hoje', 'Hoje'], ['7d', '7 dias'], ['30d', '30 dias']];
    return '<div class="pagina pagina--larga">' +
      '<header class="pagina__cab"><h1>Indicadores</h1>' + abasInd() +
        '<div class="segmentado" role="group" aria-label="Período">' + periodos.map((p) => '<button type="button" data-periodo="' + p[0] + '" aria-pressed="' + (S.periodo === p[0]) + '">' + p[1] + '</button>').join('') + '</div></header>' +
      '<dl class="resumo">' +
        '<div><dt>Execuções</dt><dd>' + num(tot) + '</dd></div>' +
        '<div><dt>Sem falha</dt><dd>' + pct(tot ? (tot - falhas) / tot : 1) + '</dd></div>' +
        '<div><dt>Falhas</dt><dd>' + num(falhas) + '<span class="resumo__extra">' + num(ress) + ' com ressalva</span></dd></div>' +
        '<div><dt>Itens processados</dt><dd>' + num(itens) + '</dd></div>' +
        '<div><dt>Horas poupadas</dt><dd>' + num(horas) + ' h<span class="resumo__extra">≈ ' + num(horas / 8) + ' dias de trabalho</span></dd></div>' +
      '</dl>' +
      '<div class="ind-grade">' +
        '<section class="ind ind--largo" aria-labelledby="t-serie"><h2 id="t-serie">Execuções por ' + (dias === 1 ? 'hora' : 'dia') + '</h2>' + barrasEmpilhadas(baldes) + '</section>' +
        '<section class="ind" aria-labelledby="t-area"><h2 id="t-area">Execuções sem falha por área</h2>' + barrasH(porArea.slice().sort((x, y) => x.taxa - y.taxa).map((x) => ({ rot: x.ar, v: x.taxa, txt: pct(x.taxa), alerta: x.taxa < 0.95 })), 1) + '<p class="nota">Abaixo de 95% fica destacado.</p></section>' +
        '<section class="ind" aria-labelledby="t-horas"><h2 id="t-horas">Horas poupadas por área</h2>' + barrasH(porArea.slice().sort((x, y) => y.horas - x.horas).map((x) => ({ rot: x.ar, v: x.horas, txt: num(x.horas) + ' h' })), Math.max(...porArea.map((x) => x.horas)) || 1) + '</section>' +
        '<section class="ind" aria-labelledby="t-rank"><h2 id="t-rank">Automações que mais falharam</h2>' + (ranking.length ? '<ol class="ranking">' + ranking.map((x) =>
          '<li><button type="button" class="ranking__l" data-abrir="' + x.a.id + '"><span class="ranking__nome">' + esc(x.a.nome) + '</span><span class="ranking__sub">' + esc(x.a.area) + ' · última falha ' + dataHora(x.ultima.inicio) + '</span></button><span class="ranking__n num">' + x.falhas + '<span class="fraco"> de ' + x.n + '</span></span></li>').join('') + '</ol>' : '<p class="vazio">' + ico('ok') + ' Nenhuma falha no período.</p>') + '</section>' +
        '<section class="ind" aria-labelledby="t-tec"><h2 id="t-tec">UiPath e Python</h2><div class="tabela-rolagem"><table class="comparativo"><thead><tr><th scope="col"></th><th scope="col" class="num">Automações</th><th scope="col" class="num">Execuções</th><th scope="col" class="num">Sem falha</th><th scope="col" class="num">Duração média</th></tr></thead><tbody>' +
          tec.map((x) => '<tr><th scope="row"><span class="tec tec--' + x.t.toLowerCase() + '">' + x.t + '</span></th><td class="num">' + x.qtd + '</td><td class="num">' + num(x.n) + '</td><td class="num">' + pct(x.taxa) + '</td><td class="num">' + duracao(x.dur) + '</td></tr>').join('') + '</tbody></table></div></section>' +
      '</div>' +
      '<p class="nota">Horas poupadas = itens processados × tempo manual estimado por item, cadastrado em cada automação.</p>' +
    '</div>';
  }

  function barrasEmpilhadas(baldes) {
    const W = 900; const H = 220; const pad = { t: 10, r: 6, b: 26, l: 40 };
    const max = Math.max(1, ...baldes.map((b) => b.ok + b.ress + b.falha));
    const esc2 = Math.ceil(max / 50) * 50 || 10;
    const bw = (W - pad.l - pad.r) / baldes.length;
    const y = (v) => pad.t + (H - pad.t - pad.b) * (1 - v / esc2);
    const saltoRot = baldes.length > 14 ? Math.ceil(baldes.length / 10) : 1;
    let svg = [0, esc2 / 2, esc2].map((t) => '<line class="grafico__grade" x1="' + pad.l + '" x2="' + (W - pad.r) + '" y1="' + y(t) + '" y2="' + y(t) + '"/><text class="grafico__eixo" x="' + (pad.l - 6) + '" y="' + (y(t) + 4) + '" text-anchor="end">' + num(t) + '</text>').join('');
    baldes.forEach((b, i) => {
      const x = pad.l + i * bw + bw * 0.15; const w = bw * 0.7;
      let base = H - pad.b;
      [['ok', 'sucesso'], ['ress', 'ressalva'], ['falha', 'falha']].forEach(([k, cls]) => {
        if (!b[k]) return;
        const h = (H - pad.t - pad.b) * b[k] / esc2;
        base -= h;
        svg += '<rect class="grafico__barra grafico__barra--' + cls + '" x="' + x.toFixed(1) + '" y="' + base.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + Math.max(1, h - 1).toFixed(1) + '"><title>' + b.rot + ': ' + b[k] + ' ' + (cls === 'sucesso' ? 'com sucesso' : cls === 'ressalva' ? 'com ressalva' : 'com falha') + '</title></rect>';
      });
      if (i % saltoRot === 0) svg += '<text class="grafico__eixo" x="' + (x + w / 2).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle">' + b.rot + '</text>';
    });
    return '<figure class="grafico"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Execuções por período, separadas por resultado">' + svg + '</svg>' +
      '<figcaption class="legenda"><span class="legenda__i legenda__i--sucesso">Sucesso</span><span class="legenda__i legenda__i--ressalva">Com ressalva</span><span class="legenda__i legenda__i--falha">Falha</span></figcaption></figure>';
  }

  function barrasH(itens, max) {
    return '<ul class="barras">' + itens.map((x) => '<li class="barras__l' + (x.alerta ? ' barras__l--alerta' : '') + '"><span class="barras__rot">' + esc(x.rot) + '</span>' +
      '<span class="barras__trilho"><span class="barras__val" style="width:' + Math.max(1, (x.v / max) * 100).toFixed(1) + '%"></span></span><span class="barras__num num">' + x.txt + '</span></li>').join('') + '</ul>';
  }

  // ---------- Resumos executivos (dentro de Indicadores) ----------
  // Cada resumo é um texto pronto para levar à gestão ou para conferir o dia. No sistema real os números
  // vêm do servidor (mesmas regras dos indicadores); aqui são calculados sobre os dados de demonstração.
  const TIPOS_RESUMO = [
    { id: 'dia', nome: 'Operação do dia', desc: 'O que rodou hoje, o que falhou e o que ainda depende de alguém.', periodos: ['hoje'] },
    { id: 'semana', nome: 'Semana para a gestão', desc: 'Últimos 7 dias comparados com os 7 anteriores.', periodos: ['7d'] },
    { id: 'area', nome: 'Por área', desc: 'Os números de uma área, para mandar ao gestor dela.', periodos: ['hoje', '7d', '30d'] },
    { id: 'conferencia', nome: 'Conferência: previsto × realizado', desc: 'Quantas execuções a agenda previa e quantas rodaram. Marque o que já conferiu.', periodos: ['hoje', '7d', '30d'] },
    { id: 'incidentes', nome: 'Falhas e tratativas', desc: 'Cada falha do período, quem reconheceu e quando voltou a dar certo.', periodos: ['hoje', '7d', '30d'] },
  ];
  const NOME_PERIODO = { hoje: 'Hoje', '7d': 'Últimos 7 dias', '30d': 'Últimos 30 dias' };
  const DIAS_PERIODO = { hoje: 1, '7d': 7, '30d': 30 };

  function inicioDe(dias) { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (dias - 1)); return d; }
  function execsEntre(ini, fim) {
    const l = [];
    Object.entries(D.execucoes).forEach(([id, ex]) => ex.forEach((e) => { const t = new Date(e.inicio); if (t >= ini && t < fim && e.status !== 'rodando') l.push(Object.assign({ a: porId[id] }, e)); }));
    return l;
  }
  function contas(l) {
    const falhas = l.filter((e) => e.status === 'falha').length;
    return {
      tot: l.length, falhas, ress: l.filter((e) => e.status === 'ressalva').length,
      taxa: l.length ? (l.length - falhas) / l.length : 1,
      itens: l.reduce((s, e) => s + e.itens_ok, 0),
      horas: l.reduce((s, e) => s + e.itens_ok * e.a.minutos_poupados_por_item / 60, 0),
    };
  }
  const pp = (x) => (x >= 0 ? '+' : '−') + Math.abs(x * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' p.p.';
  const varPct = (a, b) => (b ? (a - b) / b : 0);
  const sinal = (x) => (x >= 0 ? '+' : '−') + Math.abs(Math.round(x * 100)) + '%';
  function tabelaRes(cab, linhas, numCols) {
    return '<div class="tabela-rolagem"><table class="comparativo doc__tabela"><thead><tr>' + cab.map((c, i) => '<th scope="col"' + (numCols.includes(i) ? ' class="num"' : '') + '>' + c + '</th>').join('') + '</tr></thead><tbody>' +
      linhas.map((l) => '<tr' + (l.cls ? ' class="' + l.cls + '"' : '') + '>' + l.c.map((v, i) => (i === 0 ? '<th scope="row">' : '<td' + (numCols.includes(i) ? ' class="num"' : '') + '>') + v + (i === 0 ? '</th>' : '</td>')).join('') + '</tr>').join('') + '</tbody></table></div>';
  }

  function montarResumo(tipo, periodo) {
    const agoraD = new Date();
    const ini = inicioDe(DIAS_PERIODO[periodo]);
    const execs = execsEntre(ini, new Date(agoraD.getTime() + 1));
    const c = contas(execs);
    const R = { nums: [], secoes: [] };
    const sec = (titulo, html, texto) => R.secoes.push({ titulo, html, texto });
    const lista = (itens) => (itens.length ? '<ul class="doc__lista">' + itens.map((x) => '<li>' + x.h + '</li>').join('') + '</ul>' : '');

    if (tipo === 'dia' || tipo === 'semana') {
      const abertos = alertasAbertos();
      if (tipo === 'dia') {
        R.titulo = 'Operação do dia';
        R.frase = 'Hoje rodaram ' + num(c.tot) + ' execuções, ' + pct(c.taxa) + ' sem falha. ' +
          (abertos.length ? abertos.length + (abertos.length === 1 ? ' automação precisa' : ' automações precisam') + ' de ação manual' : 'Nada depende de ação manual') +
          ', e ' + D.fila.filter((f) => f.situacao === 'aguardando' && !f.ignorada).length + ' execuções esperam robô.';
        R.nums = [['Execuções', num(c.tot)], ['Sem falha', pct(c.taxa)], ['Itens processados', num(c.itens)], ['Horas poupadas', num(c.horas) + ' h']];
      } else {
        const ant = contas(execsEntre(new Date(ini.getTime() - 7 * 864e5), ini));
        R.titulo = 'Semana para a gestão';
        R.frase = 'Nos últimos 7 dias as automações rodaram ' + num(c.tot) + ' vezes, ' + pct(c.taxa) + ' sem falha (' + pp(c.taxa - ant.taxa) + ' sobre a semana anterior), e pouparam ' + num(c.horas) + ' horas de trabalho manual, cerca de ' + num(c.horas / 8) + ' dias de uma pessoa.';
        R.nums = [['Execuções', num(c.tot), sinal(varPct(c.tot, ant.tot)) + ' na semana'], ['Sem falha', pct(c.taxa), pp(c.taxa - ant.taxa)], ['Horas poupadas', num(c.horas) + ' h', sinal(varPct(c.horas, ant.horas))], ['Falhas', num(c.falhas), (c.falhas - ant.falhas >= 0 ? '+' : '−') + Math.abs(c.falhas - ant.falhas) + ' na semana']];
        const porAuto = D.automacoes.map((a) => { const l = execs.filter((e) => e.a.id === a.id); return { a, ...contas(l) }; });
        const top = porAuto.slice().sort((x, y) => y.horas - x.horas).slice(0, 3);
        sec('Destaques', lista(top.map((x) => ({ h: '<strong>' + esc(x.a.nome) + '</strong>: ' + num(x.horas) + ' h poupadas em ' + num(x.tot) + ' execuções' }))),
          top.map((x) => '- ' + x.a.nome + ': ' + num(x.horas) + ' h poupadas em ' + num(x.tot) + ' execuções').join('\n'));
        const piores = porAuto.filter((x) => x.falhas).sort((x, y) => y.falhas - x.falhas).slice(0, 3);
        const areasBaixas = AREAS.map((ar) => ({ ar, ...contas(execs.filter((e) => e.a.area === ar)) })).filter((x) => x.taxa < 0.95);
        const pts = piores.map((x) => ({ h: '<strong>' + esc(x.a.nome) + '</strong> falhou ' + x.falhas + ' de ' + x.tot + ' vezes', t: x.a.nome + ' falhou ' + x.falhas + ' de ' + x.tot + ' vezes' }))
          .concat(areasBaixas.map((x) => ({ h: 'Área <strong>' + esc(x.ar) + '</strong> abaixo de 95% sem falha (' + pct(x.taxa) + ')', t: 'Área ' + x.ar + ' abaixo de 95% sem falha (' + pct(x.taxa) + ')' })));
        sec('Pontos de atenção', pts.length ? lista(pts) : '<p>Nenhum ponto de atenção na semana.</p>', pts.length ? pts.map((x) => '- ' + x.t).join('\n') : 'Nenhum ponto de atenção na semana.');
      }
      if (tipo === 'dia') {
        const itens = abertos.map((al) => { const a = porId[al.automacao_id]; return { h: '<strong>' + esc(a.nome) + '</strong>: ' + esc(al.titulo.toLowerCase()) + ' desde ' + hora(al.desde) + ' <span class="fraco">(' + esc(al.mensagem) + ')</span>', t: a.nome + ': ' + al.titulo.toLowerCase() + ' desde ' + hora(al.desde) + ' (' + al.mensagem + ')' }; });
        sec('Precisa de decisão', itens.length ? lista(itens) : '<p>Nada em aberto.</p>', itens.length ? itens.map((x) => '- ' + x.t).join('\n') : 'Nada em aberto.');
        const ag = D.fila.filter((f) => f.situacao === 'aguardando' && !f.ignorada);
        const maior = ag.length ? Math.max(...ag.map((f) => Date.now() - new Date(f.entrou_em).getTime())) / 60000 : 0;
        const filaTxt = textoVMs() + '. ' + (ag.length ? ag.length + ' esperando robô, a mais antiga há ' + Math.round(maior) + ' min.' : 'Ninguém esperando robô.') + ' ' + D.fila.filter((f) => f.situacao === 'agendada').length + ' agendadas para as próximas horas.';
        sec('VMs e fila agora', '<p>' + esc(filaTxt) + '</p>', filaTxt);
      }
      const porArea = AREAS.map((ar) => ({ ar, ...contas(execs.filter((e) => e.a.area === ar)) })).filter((x) => x.tot).sort((x, y) => x.taxa - y.taxa);
      sec('Por área', tabelaRes(['Área', 'Execuções', 'Falhas', 'Sem falha', 'Horas poupadas'], porArea.map((x) => ({ cls: x.taxa < 0.95 ? 'doc__l--alerta' : '', c: [esc(x.ar), num(x.tot), num(x.falhas), pct(x.taxa), num(x.horas) + ' h'], t: x.ar + ': ' + num(x.tot) + ' execuções, ' + pct(x.taxa) + ' sem falha, ' + num(x.horas) + ' h poupadas' })), [1, 2, 3, 4]),
        porArea.map((x) => '- ' + x.ar + ': ' + num(x.tot) + ' execuções, ' + pct(x.taxa) + ' sem falha, ' + num(x.horas) + ' h poupadas').join('\n'));
    }

    if (tipo === 'area') {
      const ar = S.resumoArea || AREAS[0];
      const doArea = D.automacoes.filter((a) => a.area === ar);
      const l = execs.filter((e) => e.a.area === ar); const ca = contas(l);
      const abertos = alertasAbertos().filter((al) => porId[al.automacao_id].area === ar);
      R.titulo = 'Área ' + ar;
      R.frase = NOME_PERIODO[periodo] + ', as ' + doArea.length + ' automações de ' + ar + ' rodaram ' + num(ca.tot) + ' vezes, ' + pct(ca.taxa) + ' sem falha, e pouparam ' + num(ca.horas) + ' h. ' +
        (abertos.length ? abertos.length + ' precisam de ação manual agora.' : 'Nenhuma precisa de ação manual agora.');
      R.nums = [['Automações', num(doArea.length)], ['Execuções', num(ca.tot)], ['Sem falha', pct(ca.taxa)], ['Horas poupadas', num(ca.horas) + ' h']];
      const linhas = doArea.map((a) => { const x = contas(l.filter((e) => e.a.id === a.id)); return { cls: x.falhas ? 'doc__l--alerta' : '', c: [esc(a.nome), num(x.tot), num(x.falhas), num(x.itens), num(x.horas) + ' h', chip(a.estado)], t: a.nome + ': ' + num(x.tot) + ' execuções, ' + x.falhas + ' falhas, ' + num(x.horas) + ' h poupadas, agora ' + ESTADOS[a.estado].curto.toLowerCase() }; });
      sec('Automações da área', tabelaRes(['Automação', 'Execuções', 'Falhas', 'Itens', 'Horas poupadas', 'Agora'], linhas, [1, 2, 3, 4]), linhas.map((x) => '- ' + x.t).join('\n'));
      if (abertos.length) sec('Pendências', lista(abertos.map((al) => ({ h: '<strong>' + esc(porId[al.automacao_id].nome) + '</strong>: ' + esc(al.titulo) }))), abertos.map((al) => '- ' + porId[al.automacao_id].nome + ': ' + al.titulo).join('\n'));
    }

    if (tipo === 'conferencia') {
      const linhas = D.automacoes.map((a) => {
        const real = execsDe(a.id).filter((e) => new Date(e.inicio) >= ini).length;
        const falhas = execsDe(a.id).filter((e) => new Date(e.inicio) >= ini && e.status === 'falha').length;
        const prev = a.previstas[periodo];
        const faltou = Math.max(0, prev - real);
        const sit = a.estado === 'pausado' && !prev ? 'pausada' : faltou ? 'faltou' : falhas ? 'falha' : 'confere';
        const val = S.validadas[periodo + ':' + a.id];
        return { a, real, falhas, prev, faltou, extra: Math.max(0, real - prev), sit, val };
      });
      const ordem = { faltou: 0, falha: 1, confere: 2, pausada: 3 };
      linhas.sort((x, y) => ordem[x.sit] - ordem[y.sit] || x.a.nome.localeCompare(y.a.nome, 'pt-BR'));
      const div = linhas.filter((x) => x.sit === 'faltou' || x.sit === 'falha');
      const validadas = linhas.filter((x) => x.val).length;
      R.titulo = 'Conferência: previsto × realizado';
      R.frase = (linhas.length - div.length) + ' de ' + linhas.length + ' automações rodaram tudo o que a agenda previa, sem falha. ' + (div.length ? div.length + ' têm divergência para conferir.' : 'Nenhuma divergência.') + ' ' + (validadas === 1 ? '1 já foi conferida' : validadas + ' já foram conferidas') + ' por alguém do time.';
      R.nums = [['Previstas', num(linhas.reduce((s, x) => s + x.prev, 0))], ['Realizadas', num(linhas.reduce((s, x) => s + x.real, 0))], ['Com divergência', num(div.length)], ['Conferidas', validadas + ' de ' + linhas.length]];
      const SIT = { confere: ['ok', 'Confere'], falha: ['falha', 'Teve falha'], faltou: ['atrasado', 'Faltou executar'], pausada: ['pausado', 'Pausada'] };
      const mostrar = S.soDivergentes ? div : linhas;
      R.extraCtrl = '<label class="alternar"><input type="checkbox" id="so-divergentes"' + (S.soDivergentes ? ' checked' : '') + '><span>Só divergências</span></label>';
      sec('Automação por automação', mostrar.length ? tabelaRes(['Automação', 'Previstas', 'Realizadas', 'Falhas', 'Faltaram', 'Situação', 'Conferido'], mostrar.map((x) => ({
        cls: x.sit === 'faltou' || x.sit === 'falha' ? 'doc__l--alerta' : '',
        c: ['<button type="button" class="link link--texto" data-abrir="' + x.a.id + '">' + esc(x.a.nome) + '</button>', num(x.prev), num(x.real) + (x.extra ? ' <span class="fraco">(+' + x.extra + ' fora da agenda)</span>' : ''), num(x.falhas), num(x.faltou), chip(SIT[x.sit][0], SIT[x.sit][1]),
          '<label class="validar"><input type="checkbox" data-validar="' + periodo + ':' + x.a.id + '"' + (x.val ? ' checked' : '') + '><span>' + (x.val ? esc(x.val.por) + ' ' + hora(x.val.em) : 'Conferir') + '</span><span class="sr"> ' + esc(x.a.nome) + '</span></label>'],
      })), [1, 2, 3, 4]) : '<p>Nenhuma divergência no período.</p>',
      linhas.map((x) => '- ' + x.a.nome + ': ' + x.real + ' de ' + x.prev + ' previstas, ' + x.falhas + ' falhas · ' + SIT[x.sit][1] + (x.val ? ' · conferido por ' + x.val.por : '')).join('\n'));
    }

    if (tipo === 'incidentes') {
      const fal = execs.filter((e) => e.status === 'falha').sort((x, y) => new Date(y.inicio) - new Date(x.inicio));
      const comVolta = fal.map((e) => {
        const l = execsDe(e.a.id);
        const i = l.findIndex((x) => x.id === e.id);
        const volta = l.slice(0, i).reverse().find((x) => x.status !== 'falha' && x.status !== 'rodando');
        const al = D.alertas.find((x) => x.automacao_id === e.a.id && x.tipo === 'falha');
        return { e, volta, rec: !volta && al ? reconhecimento(al) : null };
      });
      const resolvidas = comVolta.filter((x) => x.volta);
      const tempoMed = resolvidas.length ? resolvidas.reduce((s, x) => s + (new Date(x.volta.fim) - new Date(x.e.fim)), 0) / resolvidas.length / 1000 : 0;
      const atrasos = alertasAbertos().filter((al) => al.tipo === 'atraso');
      R.titulo = 'Falhas e tratativas';
      R.frase = NOME_PERIODO[periodo] + ' foram ' + fal.length + ' falhas em ' + new Set(fal.map((x) => x.a.id)).size + ' automações. ' + resolvidas.length + ' já voltaram a dar certo, em média ' + duracao(tempoMed) + ' depois. ' +
        (comVolta.length - resolvidas.length ? (comVolta.length - resolvidas.length) + ' seguem em aberto.' : 'Nenhuma segue em aberto.') + (atrasos.length ? ' Além disso, ' + atrasos.length + ' automações estão atrasadas, sem sinal.' : '');
      R.nums = [['Falhas', num(fal.length)], ['Automações afetadas', num(new Set(fal.map((x) => x.a.id)).size)], ['Voltaram a dar certo', num(resolvidas.length)], ['Tempo médio até voltar', resolvidas.length ? duracao(tempoMed) : '—']];
      const vis = comVolta.slice(0, 40);
      sec('Falha por falha', comVolta.length ? tabelaRes(['Quando', 'Automação', 'Erro', 'Situação'], vis.map((x) => ({
        cls: x.volta ? '' : 'doc__l--alerta',
        c: [dataHora(x.e.inicio), '<button type="button" class="link link--texto" data-abrir="' + x.e.a.id + '" data-abrir-exec="' + x.e.id + '">' + esc(x.e.a.nome) + '</button> <span class="fraco">' + numero(x.e.id) + '</span>', esc(x.e.mensagem),
          x.volta ? 'Voltou ' + dataHora(x.volta.inicio) : 'Em aberto' + (x.rec ? ' · reconhecida por ' + esc(x.rec.por) + (x.rec.nota ? ': “' + esc(x.rec.nota) + '”' : '') : ' · ninguém reconheceu')],
      })), []) + (comVolta.length > vis.length ? '<p class="nota">e mais ' + (comVolta.length - vis.length) + ' falhas mais antigas no período.</p>' : '') : '<p>Nenhuma falha no período.</p>',
      comVolta.map((x) => '- ' + dataHora(x.e.inicio) + ' · ' + x.e.a.nome + ' (' + numero(x.e.id) + '): ' + x.e.mensagem + ' · ' + (x.volta ? 'voltou ' + dataHora(x.volta.inicio) : 'em aberto')).join('\n'));
      if (atrasos.length) sec('Atrasadas agora', lista(atrasos.map((al) => ({ h: '<strong>' + esc(porId[al.automacao_id].nome) + '</strong>: ' + esc(al.mensagem) }))), atrasos.map((al) => '- ' + porId[al.automacao_id].nome + ': ' + al.mensagem).join('\n'));
    }
    return R;
  }

  function telaResumos() {
    const tipo = TIPOS_RESUMO.find((t) => t.id === S.resumo) || TIPOS_RESUMO[0];
    const periodo = tipo.periodos.includes(S.periodo) ? S.periodo : tipo.periodos[0];
    const R = montarResumo(tipo.id, periodo);
    const gerado = new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    return '<div class="pagina pagina--larga">' +
      '<header class="pagina__cab"><h1>Indicadores</h1>' + abasInd() + '</header>' +
      '<div class="resumos">' +
        '<nav class="resumos__tipos" aria-label="Tipo de resumo"><p class="resumos__rot">Escolha o resumo</p>' + TIPOS_RESUMO.map((t) =>
          '<button type="button" class="resumos__tipo" data-resumo="' + t.id + '" aria-pressed="' + (t.id === tipo.id) + '"><strong>' + t.nome + '</strong><span>' + t.desc + '</span></button>').join('') + '</nav>' +
        '<div class="resumos__corpo">' +
          '<div class="resumos__ctrl">' +
            (tipo.periodos.length > 1 ? '<div class="segmentado segmentado--peq" role="group" aria-label="Período">' + tipo.periodos.map((p) => '<button type="button" data-periodo="' + p + '" aria-pressed="' + (p === periodo) + '">' + NOME_PERIODO[p].replace('Últimos ', '') + '</button>').join('') + '</div>' : '') +
            (tipo.id === 'area' ? '<label class="campo-select"><span class="sr">Área</span><select id="resumo-area">' + AREAS.map((ar) => '<option' + ((S.resumoArea || AREAS[0]) === ar ? ' selected' : '') + '>' + esc(ar) + '</option>').join('') + '</select></label>' : '') +
            (R.extraCtrl || '') +
            '<span class="resumos__botoes"><button type="button" class="botao botao--sec botao--peq" data-acao="copiar-resumo">' + ico('copiar') + '<span>Copiar texto</span></button>' +
            '<button type="button" class="botao botao--sec botao--peq" data-acao="imprimir">' + ico('imprimir') + '<span>Imprimir ou PDF</span></button></span>' +
          '</div>' +
          '<article class="doc" aria-labelledby="t-doc">' +
            '<header class="doc__cab"><p class="doc__kicker">Resumo executivo · Monitor de Automações</p><h2 id="t-doc">' + esc(R.titulo) + '</h2><p class="doc__meta">' + NOME_PERIODO[periodo] + ' · gerado em ' + gerado + ' · dados de demonstração</p></header>' +
            '<p class="doc__frase">' + esc(R.frase) + '</p>' +
            '<dl class="doc__nums">' + R.nums.map((n) => '<div><dt>' + n[0] + '</dt><dd>' + n[1] + (n[2] ? '<span class="doc__var">' + n[2] + '</span>' : '') + '</dd></div>').join('') + '</dl>' +
            R.secoes.map((s) => '<section class="doc__sec"><h3>' + s.titulo + '</h3>' + s.html + '</section>').join('') +
          '</article>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function textoResumo() {
    const tipo = TIPOS_RESUMO.find((t) => t.id === S.resumo) || TIPOS_RESUMO[0];
    const periodo = tipo.periodos.includes(S.periodo) ? S.periodo : tipo.periodos[0];
    const R = montarResumo(tipo.id, periodo);
    return [R.titulo + ' · ' + NOME_PERIODO[periodo], '', R.frase, '', R.nums.map((n) => n[0] + ': ' + n[1] + (n[2] ? ' (' + n[2] + ')' : '')).join(' · ')]
      .concat(R.secoes.map((s) => '\n' + s.titulo.toUpperCase() + '\n' + s.texto)).join('\n');
  }

  function abasInd() {
    return '<div class="segmentado" role="group" aria-label="Indicadores">' +
      '<button type="button" data-ind-aba="graficos" aria-pressed="' + (S.indAba === 'graficos') + '">Painel de indicadores</button>' +
      '<button type="button" data-ind-aba="resumos" aria-pressed="' + (S.indAba === 'resumos') + '">Resumos executivos</button></div>';
  }

  // TV: as VMs diminuem a letra até caber; a fila e a ação manual mostram só o que cabe.
  function ajustarTV() {
    const agora = document.querySelector('.tv__agora');
    if (!agora) return;
    let tam = 100;
    agora.style.fontSize = '';
    while (agora.scrollHeight > agora.clientHeight + 1 && tam > 60) { tam -= 4; agora.style.fontSize = tam + '%'; }
    [['.tv__fila', '.fila__lista', ' na fila'], ['.tv__manual', '.manuais', ' para ação manual (veja no painel)']].forEach(([col, ls, txt]) => {
      const c = document.querySelector(col); const lista = c && c.querySelector(ls);
      if (!lista) return;
      const total = lista.children.length; let mais = null;
      while (c.scrollHeight > c.clientHeight + 1 && lista.children.length > 1) {
        lista.lastElementChild.remove();
        if (!mais) { mais = document.createElement('p'); mais.className = 'atencao__mais'; c.appendChild(mais); }
        mais.textContent = 'e mais ' + (total - lista.children.length) + txt;
      }
    });
  }

  // ---------- Roteamento e render ----------
  function lerRota() {
    const partes = (location.hash || '#/geral').replace(/^#\/?/, '').split('/');
    const rotas = ['geral', 'automacoes', 'indicadores', 'tv'];
    const rota = rotas.includes(partes[0]) ? partes[0] : 'geral';
    return { rota, id: partes[1] && porId[partes[1]] ? partes[1] : null };
  }

  let focoAntes = null;
  function render(opcoes = {}) {
    const { rota, id } = lerRota();
    const mudouRota = rota !== S.rota;
    S.rota = rota;
    const tv = document.getElementById('tv');
    document.body.classList.toggle('modo-tv', rota === 'tv');
    if (rota === 'tv') { tv.hidden = false; tv.className = 'tv tv--op'; tv.innerHTML = telaTV(); atualizarRelogios(); ajustarTV(); return; }
    tv.hidden = true; tv.innerHTML = '';

    if (id !== S.sel && !(ehMestre(rota) && !id)) { S.sel = id; S.execSel = null; S.execsVisiveis = 12; S.nivelLog = 'todos'; }
    if (S.execPendente) { S.execSel = S.execPendente; S.execPendente = null; }
    document.querySelectorAll('.nav__item').forEach((n) => { if (n.dataset.rota === rota) n.setAttribute('aria-current', 'page'); else n.removeAttribute('aria-current'); });
    const abertos = alertasAbertos().length;
    const badge = document.getElementById('badge-alertas');
    badge.textContent = abertos || ''; badge.hidden = !abertos;
    badge.setAttribute('aria-label', abertos + ' para ação manual');

    const conteudo = document.getElementById('conteudo');
    const rolagem = window.scrollY;
    // Painéis com rolagem própria (fila e cartões) voltam para onde estavam.
    const rolagens = { conteudo: conteudo.scrollTop };
    conteudo.querySelectorAll('[data-rolagem]').forEach((el) => { rolagens[el.dataset.rolagem] = el.scrollTop; });
    conteudo.className = 'conteudo conteudo--' + rota;
    conteudo.innerHTML = rota === 'indicadores' ? telaIndicadores() : rota === 'automacoes' ? telaAutomacoes() : telaPainel();
    if (!mudouRota || opcoes.manterRolagem) {
      window.scrollTo(0, rolagem);
      conteudo.scrollTop = rolagens.conteudo;
      conteudo.querySelectorAll('[data-rolagem]').forEach((el) => { if (rolagens[el.dataset.rolagem]) el.scrollTop = rolagens[el.dataset.rolagem]; });
    } else { window.scrollTo(0, 0); conteudo.scrollTop = 0; }

    const gaveta = document.getElementById('gaveta');
    const fundo = document.getElementById('gaveta-fundo');
    const usaGaveta = !ehMestre(rota) || ehCelular();
    if (id && usaGaveta) {
      const rolGaveta = gaveta.hidden ? 0 : gaveta.scrollTop;
      const estavaFechada = gaveta.hidden;
      gaveta.innerHTML = detalhe(porId[S.sel]);
      gaveta.hidden = false; fundo.hidden = false;
      document.body.classList.add('gaveta-aberta');
      if (estavaFechada) { focoAntes = document.activeElement; const t = document.getElementById('detalhe-titulo'); if (t) t.focus({ preventScroll: true }); gaveta.scrollTop = 0; }
      else gaveta.scrollTop = rolGaveta;
    } else {
      fecharGavetaVisual();
    }
    atualizarRelogios();
  }
  function fecharGavetaVisual() {
    const gaveta = document.getElementById('gaveta');
    if (gaveta.hidden) return;
    gaveta.hidden = true; document.getElementById('gaveta-fundo').hidden = true; gaveta.innerHTML = '';
    document.body.classList.remove('gaveta-aberta');
    if (focoAntes && document.contains(focoAntes)) focoAntes.focus({ preventScroll: true });
  }
  function abrir(id) {
    const rota = S.rota === 'tv' ? 'geral' : S.rota;
    if (ehMestre(rota) && !ehCelular()) {
      S.sel = id; S.execSel = null; S.execsVisiveis = 12;
      if (S.execPendente) { S.execSel = S.execPendente; S.execPendente = null; }
      history.replaceState(null, '', '#/' + rota + '/' + id);
      const alvo = document.getElementById('detalhe-fixo');
      document.querySelectorAll('.mitem').forEach((m) => m.setAttribute('aria-current', String(m.dataset.abrir === id)));
      if (alvo) { alvo.innerHTML = detalhe(porId[id], true); alvo.scrollTop = 0; atualizarRelogios(); }
      return;
    }
    location.hash = '#/' + rota + '/' + id;
  }
  function fechar() { location.hash = '#/' + (S.rota === 'tv' ? 'geral' : S.rota); }

  function rerenderDetalhe() {
    const fixo = document.getElementById('detalhe-fixo');
    const gaveta = document.getElementById('gaveta');
    if (fixo && ehMestre(S.rota) && gaveta.hidden) { const r = fixo.scrollTop; fixo.innerHTML = detalhe(porId[S.sel], true); fixo.scrollTop = r; }
    else if (!gaveta.hidden) { const r = gaveta.scrollTop; gaveta.innerHTML = detalhe(porId[S.sel]); gaveta.scrollTop = r; }
    atualizarRelogios();
  }

  // ---------- Relógios ----------
  let ultimaColeta = new Date();
  function atualizarRelogios() {
    const h = ultimaColeta.toLocaleTimeString('pt-BR');
    const a = document.getElementById('atualizado-hora'); if (a) a.textContent = h;
    document.querySelectorAll('[data-atualizado]').forEach((t) => { t.textContent = ultimaColeta.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); });
    const r = document.getElementById('tv-relogio'); if (r) r.textContent = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    document.querySelectorAll('[data-rel]').forEach((el) => { el.textContent = el.dataset.prefixo + relativo(el.dataset.rel); });
  }

  // ---------- Ações da fila ----------
  function acaoFila(id, tipo) {
    S.menuFila = null;
    if (tipo === 'agendar' || tipo === 'comentar') {
      S.acaoForm = { id, tipo }; render({ manterRolagem: true });
      const c = document.querySelector('[data-form-fila][data-id="' + id + '"] input, [data-form-fila][data-id="' + id + '"] textarea');
      if (c) c.focus();
      return;
    }
    const r = D.acaoNaFila(id, tipo, null, EU);
    recado(r.ok ? r.msg : r.erro, !r.ok);
    render({ manterRolagem: true });
    focarMenu(id, -1);
  }
  // idx >= 0 foca um item do menu aberto; -1 devolve o foco ao botão "Ações".
  function focarMenu(id, idx) {
    if (!id) return;
    if (idx >= 0) { const it = document.querySelectorAll('#menu-' + id + ' [role="menuitem"]')[idx]; if (it) { it.focus(); it.closest('.menu').scrollIntoView({ block: 'nearest' }); } return; }
    const b = document.querySelector('[data-menu-fila="' + id + '"]'); if (b) b.focus();
  }

  // A cada coleta o painel se redesenha, sem atrapalhar quem está mexendo: com menu, formulário ou campo
  // em uso, só as VMs e as finalizadas mudam. O foco volta para o mesmo botão.
  function atualizarPainel() {
    if (S.rota === 'tv') { const tv = document.getElementById('tv'); tv.innerHTML = telaTV(); atualizarRelogios(); ajustarTV(); return; }
    if (S.rota !== 'geral') { atualizarRelogios(); return; }
    const ativo = document.activeElement;
    const ocupado = S.menuFila || S.acaoForm || S.reconhecendo || (ativo && /^(INPUT|TEXTAREA|SELECT)$/.test(ativo.tagName));
    if (!ocupado) {
      let sel = null; let idx = 0;
      if (ativo && ativo !== document.body) {
        const attr = ['data-abrir', 'data-menu-fila', 'data-acao', 'data-aba', 'data-reconhecer'].find((x) => ativo.hasAttribute(x));
        if (attr) { sel = '[' + attr + '="' + ativo.getAttribute(attr) + '"]'; idx = [...document.querySelectorAll(sel)].indexOf(ativo); }
      }
      render({ manterRolagem: true });
      if (sel) { const alvo = document.querySelectorAll(sel)[Math.max(0, idx)]; if (alvo) alvo.focus({ preventScroll: true }); }
      return;
    }
    const ag = document.querySelector('.op__agora'); if (ag) ag.innerHTML = gradeVMs();
    const cv = document.getElementById('conta-vms'); if (cv) cv.textContent = textoVMs();
    const fim = document.querySelector('.op__fim'); if (fim) fim.outerHTML = faixaFinalizadas();
    atualizarRelogios();
  }

  // ---------- Eventos ----------
  function eventos() {
    document.addEventListener('click', (ev) => {
      const t = ev.target;
      const alvo = (sel) => t.closest(sel);
      let el;
      // Menu de ações da fila: clicar fora fecha.
      if (S.menuFila && !alvo('.acoes-fila')) { S.menuFila = null; render({ manterRolagem: true }); if (!alvo('[data-abrir], [data-acao], [data-aba]')) return; }
      if ((el = alvo('[data-menu-fila]'))) { const id = el.dataset.menuFila; S.menuFila = S.menuFila === id ? null : id; render({ manterRolagem: true }); focarMenu(id, S.menuFila ? 0 : -1); return; }
      if ((el = alvo('[data-acao-fila]'))) { acaoFila(el.dataset.idFila || el.dataset.id, el.dataset.acaoFila); return; }
      if ((el = alvo('[data-ind-aba]'))) { S.indAba = el.dataset.indAba; return render(); }
      if ((el = alvo('[data-resumo]'))) { S.resumo = el.dataset.resumo; render({ manterRolagem: true }); const b = document.querySelector('[data-resumo="' + S.resumo + '"]'); if (b) b.focus(); return; }
      if ((el = alvo('[data-aba]'))) { S.aba = el.dataset.aba; return render({ manterRolagem: true }); }
      if ((el = alvo('[data-fila-tec]'))) { S.filaTec = el.dataset.filaTec; return render({ manterRolagem: true }); }
      if ((el = alvo('[data-tec]'))) { S.tec = el.dataset.tec; return render({ manterRolagem: true }); }
      if ((el = alvo('[data-periodo]'))) { S.periodo = el.dataset.periodo; return render({ manterRolagem: true }); }
      if ((el = alvo('[data-nivel]'))) { S.nivelLog = el.dataset.nivel; return rerenderDetalhe(); }
      if ((el = alvo('[data-exec]'))) { S.execSel = S.execSel === el.dataset.exec ? '' : el.dataset.exec; rerenderDetalhe(); const b = document.querySelector('.gaveta:not([hidden]) #bloco-log, #detalhe-fixo #bloco-log'); if (b && ev.target.closest('.execs, .grafico')) b.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); return; }
      if ((el = alvo('[data-reconhecer]'))) { S.reconhecendo = el.dataset.reconhecer; if (document.getElementById('gaveta').hidden && !document.getElementById('detalhe-fixo')) render({ manterRolagem: true }); else rerenderDetalhe(); const n = document.getElementById('nota-rec'); if (n) n.focus(); return; }
      if ((el = alvo('[data-copiar]'))) {
        const linhas = D.logDaExecucao(el.dataset.copiar).map((l) => new Date(l.hora).toLocaleTimeString('pt-BR') + ' ' + l.nivel + ' ' + l.msg).join('\n');
        const ok = () => { el.querySelector('span').textContent = 'Copiado'; setTimeout(() => { if (el.isConnected) el.querySelector('span').textContent = 'Copiar'; }, 1600); };
        try { navigator.clipboard.writeText(linhas).then(ok, () => {}); } catch (e) { /* sem área de transferência */ }
        return;
      }
      if (alvo('[data-ir-log]')) {
        ev.preventDefault();
        const caixa = t.closest('.gaveta, #detalhe-fixo') || document;
        if (!caixa.querySelector('#bloco-log')) { S.execSel = null; rerenderDetalhe(); }
        const b = (document.querySelector('.gaveta:not([hidden])') || document.getElementById('detalhe-fixo') || document).querySelector('#bloco-log'); if (b) b.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
      if ((el = alvo('[data-abrir]'))) { if (el.dataset.abrirExec) S.execPendente = el.dataset.abrirExec; abrir(el.dataset.abrir); return; }
      if ((el = alvo('[data-acao]'))) {
        const a = el.dataset.acao;
        if (a === 'fechar') return fechar();
        if (a === 'limpar') { S.filtroEstados.clear(); S.tec = 'todas'; S.area = 'todas'; S.filaTec = 'todas'; S.filaArea = 'todas'; S.busca = ''; document.getElementById('busca').value = ''; return render({ manterRolagem: true }); }
        if (a === 'tema') return trocarTema();
        if (a === 'ver-ignoradas') { S.verIgnoradas = !S.verIgnoradas; render({ manterRolagem: true }); const b = document.querySelector('[data-acao="ver-ignoradas"]'); if (b) b.focus(); return; }
        if (a === 'cancelar-fila') { const id = S.acaoForm && S.acaoForm.id; S.acaoForm = null; render({ manterRolagem: true }); focarMenu(id, -1); return; }
        if (a === 'copiar-resumo') {
          const ok = () => { el.querySelector('span').textContent = 'Copiado'; setTimeout(() => { if (el.isConnected) el.querySelector('span').textContent = 'Copiar texto'; }, 1600); };
          try { navigator.clipboard.writeText(textoResumo()).then(ok, () => recado('O navegador não deixou copiar. Use Imprimir ou PDF.', true)); } catch (e) { recado('O navegador não deixou copiar. Use Imprimir ou PDF.', true); }
          return;
        }
        if (a === 'imprimir') { window.print(); return; }
        if (a === 'fila-ordem') { S.filaOrdem = S.filaOrdem === 'prioridade' ? 'horario' : 'prioridade'; render({ manterRolagem: true }); const b = document.querySelector('[data-acao="fila-ordem"]'); if (b) b.focus(); return; }
        if (a === 'fila-filtros') { S.filaFiltros = !S.filaFiltros; render({ manterRolagem: true }); const b = document.querySelector('[data-acao="fila-filtros"]'); if (b) b.focus(); return; }
        if (a === 'tv') { location.hash = '#/tv'; try { document.documentElement.requestFullscreen && document.documentElement.requestFullscreen().catch(() => {}); } catch (e) { /* tela cheia é opcional */ } return; }
        if (a === 'sair-tv') { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); location.hash = '#/geral'; return; }
        if (a === 'mais-execs') { S.execsVisiveis += 12; return rerenderDetalhe(); }
        if (a === 'cancelar-rec') { S.reconhecendo = null; if (document.getElementById('gaveta').hidden && !document.getElementById('detalhe-fixo')) render({ manterRolagem: true }); else rerenderDetalhe(); return; }
      }
    });
    document.getElementById('gaveta-fundo').addEventListener('click', fechar);
    document.addEventListener('submit', (ev) => {
      const ff = ev.target.closest('[data-form-fila]');
      if (ff) {
        ev.preventDefault();
        const dados = ff.dataset.formFila === 'agendar' ? { quando: ff.elements.quando.value } : { texto: ff.elements.texto.value };
        const r = D.acaoNaFila(ff.dataset.id, ff.dataset.formFila, dados, EU);
        recado(r.ok ? r.msg : r.erro, !r.ok);
        if (r.ok) { S.acaoForm = null; render({ manterRolagem: true }); }
        return;
      }
      const f = ev.target.closest('[data-form-reconhecer]');
      if (!f) return;
      ev.preventDefault();
      // No sistema real isso vai para o servidor, que registra quem reconheceu e quando.
      S.reconhecidos[f.dataset.formReconhecer] = { por: 'você', em: new Date().toISOString(), nota: f.querySelector('textarea').value.trim() };
      S.reconhecendo = null;
      render({ manterRolagem: true });
    });
    document.addEventListener('change', (ev) => {
      if (ev.target.id === 'filtro-area') { S.area = ev.target.value; render({ manterRolagem: true }); }
      if (ev.target.id === 'agrupar') { S.agrupar = ev.target.checked; render({ manterRolagem: true }); }
      if (ev.target.id === 'filtro-estado') { S.filtroEstados.clear(); if (ev.target.value !== 'todos') S.filtroEstados.add(ev.target.value); render({ manterRolagem: true }); const f = document.getElementById('filtro-estado'); if (f) f.focus(); }
      if (ev.target.id === 'resumo-area') { S.resumoArea = ev.target.value; render({ manterRolagem: true }); const f = document.getElementById('resumo-area'); if (f) f.focus(); }
      if (ev.target.id === 'so-divergentes') { S.soDivergentes = ev.target.checked; render({ manterRolagem: true }); const f = document.getElementById('so-divergentes'); if (f) f.focus(); }
      if (ev.target.dataset.validar) {
        // No sistema real: o servidor grava quem conferiu e quando.
        const k = ev.target.dataset.validar;
        if (ev.target.checked) S.validadas[k] = { por: EU, em: new Date().toISOString() }; else delete S.validadas[k];
        render({ manterRolagem: true }); const f = document.querySelector('[data-validar="' + k + '"]'); if (f) f.focus();
      }
      if (ev.target.id === 'fila-area') { S.filaArea = ev.target.value; render({ manterRolagem: true }); const f = document.getElementById('fila-area'); if (f) f.focus(); }
    });
    let t;
    document.getElementById('busca').addEventListener('input', (ev) => {
      clearTimeout(t);
      t = setTimeout(() => {
        S.busca = ev.target.value;
        if (S.rota !== 'geral' && S.rota !== 'automacoes') location.hash = '#/geral'; else render({ manterRolagem: true });
        const b = document.getElementById('busca'); if (document.activeElement !== b) b.focus();
      }, 150);
    });
    document.addEventListener('keydown', (ev) => {
      if (S.menuFila && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(ev.key) && ev.target.closest('.acoes-fila')) {
        ev.preventDefault();
        const itens = [...document.querySelectorAll('#menu-' + S.menuFila + ' [role="menuitem"]')];
        const i = itens.indexOf(document.activeElement);
        const n = ev.key === 'Home' ? 0 : ev.key === 'End' ? itens.length - 1 : ev.key === 'ArrowDown' ? (i + 1) % itens.length : (i - 1 + itens.length) % itens.length;
        if (itens[n]) itens[n].focus();
        return;
      }
      if (ev.key === 'Escape') {
        if (S.menuFila) { const id = S.menuFila; S.menuFila = null; render({ manterRolagem: true }); focarMenu(id, -1); return; }
        if (S.acaoForm) { const id = S.acaoForm.id; S.acaoForm = null; render({ manterRolagem: true }); focarMenu(id, -1); return; }
        if (S.rota === 'tv') { location.hash = '#/geral'; return; }
        if (S.reconhecendo) { S.reconhecendo = null; if (document.getElementById('gaveta').hidden) render({ manterRolagem: true }); else rerenderDetalhe(); return; }
        if (!document.getElementById('gaveta').hidden) fechar();
      }
      if (ev.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') { ev.preventDefault(); document.getElementById('busca').focus(); }
    });
    window.addEventListener('hashchange', () => render());
    let largura = window.innerWidth;
    window.addEventListener('resize', () => { if (S.rota === 'tv') { render(); return; } if ((largura < 900) !== (window.innerWidth < 900)) { largura = window.innerWidth; render({ manterRolagem: true }); } });
    // Simula a coleta: no sistema real, a cada 30 s o front busca /api/situacao.
    // Na demonstração a coleta é a cada 15 s e as VMs andam (D.tique faz o papel do servidor).
    setInterval(() => {
      D.tique(); ultimaColeta = new Date();
      atualizarPainel();
      const p = document.querySelector('.atualizado__pulso');
      if (p) { p.classList.remove('pulsou'); void p.offsetWidth; p.classList.add('pulsou'); }
    }, 15000);
    setInterval(atualizarRelogios, 15000);
  }

  casca();
  eventos();
  render();
})();
