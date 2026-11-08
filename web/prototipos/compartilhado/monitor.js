// Telas do monitor: visão geral, detalhe da automação com log, alertas, indicadores e modo TV.
// Cada versão do protótipo define window.MONITOR_CONFIG (organização da tela) e um tema.css (visual).
(function () {
  'use strict';

  const D = window.DADOS_DEMO;
  const cfg = Object.assign({ visao: 'cartoes', detalhe: 'gaveta', nav: 'abas', versao: '', nomeVersao: '' }, window.MONITOR_CONFIG || {});

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
    alertas: '<path d="M6 16.5V11a6 6 0 0112 0v5.5l1.5 2h-15z"/><path d="M10 20.5a2.2 2.2 0 004 0"/>',
    indicadores: '<path d="M4 20.5h16"/><path d="M7 17v-5M12 17V7M17 17v-8"/>',
    busca: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5l5 5"/>',
    tv: '<rect x="3" y="4.5" width="18" height="12.5" rx="1.5"/><path d="M8.5 20.5h7M12 17v3.5"/>',
    fechar: '<path d="M6 6l12 12M18 6L6 18"/>',
    copiar: '<rect x="8.5" y="8.5" width="11" height="11" rx="1.5"/><path d="M15.5 8.5V5.5a1 1 0 00-1-1h-9a1 1 0 00-1 1v9a1 1 0 001 1h3"/>',
    voltar: '<path d="M14.5 6l-6 6 6 6"/>',
    seta: '<path d="M9.5 6l6 6-6 6"/>',
    ordenar: '<path d="M8 9.5l4-4 4 4M8 14.5l4 4 4-4"/>',
    sair: '<path d="M14 4.5h4.5a1 1 0 011 1v13a1 1 0 01-1 1H14"/><path d="M10 8l-4 4 4 4M6 12h10"/>',
    log: '<path d="M6.5 3.5h8l4 4v13h-12z"/><path d="M9.5 11.5h6M9.5 14.5h6M9.5 17.5h4"/>',
    sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
    lua: '<path d="M19.5 14.5A8 8 0 019.5 4.5a8 8 0 1010 10z"/>',
    filtro: '<path d="M4 5.5h16l-6.2 7.2v5.6l-3.6 1.9v-7.5z"/>',
    inicio: '<path d="M8 5.5v13l10-6.5z"/>',
    maquina: '<rect x="3.5" y="4.5" width="17" height="11" rx="1.5"/><path d="M8 19.5h8M12 15.5v4"/>',
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
    ordem: { col: null, dir: 1 }, agrupar: cfg.agrupar !== false,
    periodo: '7d', nivelLog: 'todos', execsVisiveis: 12,
    reconhecidos: {}, reconhecendo: null,
    // Só na organização "operacao": fila à esquerda, execução à direita.
    verTodas: false, aba: 'agora', filaOrdem: 'prioridade', filaTec: 'todas', filaArea: 'todas', filaFiltros: false,
  };
  const OP = cfg.visao === 'operacao';
  const porId = Object.fromEntries(D.automacoes.map((a) => [a.id, a]));
  const AREAS = [...new Set(D.automacoes.map((a) => a.area))];
  const alertaDe = (id) => D.alertas.find((x) => x.automacao_id === id && x.tipo !== 'duracao') || D.alertas.find((x) => x.automacao_id === id);
  const reconhecimento = (al) => S.reconhecidos[al.id] || (al.reconhecido_por ? { por: al.reconhecido_por, em: al.reconhecido_em, nota: al.nota } : null);
  const execsDe = (id) => D.execucoes[id] || [];
  const ehCelular = () => window.matchMedia('(max-width: 899px)').matches;

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

  const VALOR_ORDEM = {
    estado: (a) => ESTADOS[a.estado].ordem,
    nome: (a) => a.nome,
    tecnologia: (a) => a.tecnologia,
    ultima: (a) => -new Date(a.ultima_execucao.inicio).getTime(),
    duracao: (a) => -a.ultima_execucao.duracao_s,
    proxima: (a) => (a.proxima_execucao ? new Date(a.proxima_execucao).getTime() : Infinity),
    sucesso: (a) => a.taxa_sucesso,
  };
  function ordenadas(lista) {
    const col = S.ordem.col;
    const f = col ? VALOR_ORDEM[col] : VALOR_ORDEM.estado;
    return lista.slice().sort((x, y) => {
      const a = f(x); const b = f(y);
      const r = typeof a === 'string' ? a.localeCompare(b, 'pt-BR') : a - b;
      return (r || x.nome.localeCompare(y.nome, 'pt-BR')) * (col ? S.ordem.dir : 1);
    });
  }
  function agrupadas(lista) {
    if (!S.agrupar) return [{ area: null, itens: ordenadas(lista) }];
    return AREAS.map((area) => ({ area, itens: ordenadas(lista.filter((a) => a.area === area)) })).filter((g) => g.itens.length);
  }

  function contagem() {
    const c = { falha: 0, atrasado: 0, rodando: 0, ressalva: 0, ok: 0, pausado: 0 };
    D.automacoes.forEach((a) => { c[a.estado] += 1; });
    return c;
  }
  function execsHoje() {
    const hoje = new Date(); let total = 0; let boas = 0;
    Object.values(D.execucoes).forEach((l) => l.forEach((e) => {
      if (e.status === 'rodando' || !mesmoDia(new Date(e.inicio), hoje)) return;
      total += 1; if (e.status !== 'falha') boas += 1;
    }));
    return { total, taxa: total ? boas / total : 1 };
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

  function trilha(a, qtd = 20) {
    const l = execsDe(a.id).slice(0, qtd).reverse();
    const c = { sucesso: 0, ressalva: 0, falha: 0, rodando: 0 };
    l.forEach((e) => { c[e.status] += 1; });
    const desc = 'Últimas ' + l.length + ' execuções: ' + c.sucesso + ' com sucesso, ' + c.ressalva + ' com ressalva, ' + c.falha + ' com falha';
    return '<span class="trilha" role="img" aria-label="' + desc + '" title="' + desc + '">' +
      l.map((e) => '<i class="trilha__t trilha__t--' + e.status + '"></i>').join('') + '</span>';
  }

  function logoSlot(variante) {
    return '<span class="logo-slot' + (variante ? ' logo-slot--' + variante : '') + '" title="Espaço reservado: coloque aqui o arquivo oficial do logo Sicredi (assets/marca/)">' +
      '<span class="logo-slot__simbolo" aria-hidden="true"></span><span class="logo-slot__texto">Logo oficial</span></span>';
  }

  // ---------- Casca ----------
  function casca() {
    if (OP) return cascaOp();
    const app = document.getElementById('app');
    app.className = 'shell shell--' + cfg.nav + ' visao--' + cfg.visao + ' detalhe--' + cfg.detalhe;
    app.innerHTML =
      '<header class="topo">' +
        '<div class="topo__marca">' + logoSlot(cfg.logo) + '<span class="topo__produto">Monitor de Automações</span></div>' +
        '<nav class="nav" aria-label="Seções">' +
          '<a class="nav__item" href="#/geral" data-rota="geral">' + ico('geral') + '<span>Visão geral</span></a>' +
          '<a class="nav__item" href="#/alertas" data-rota="alertas">' + ico('alertas') + '<span>Alertas</span><span class="nav__badge" id="badge-alertas"></span></a>' +
          '<a class="nav__item" href="#/indicadores" data-rota="indicadores">' + ico('indicadores') + '<span>Indicadores</span></a>' +
        '</nav>' +
        '<div class="topo__acoes">' +
          '<label class="busca">' + ico('busca') + '<span class="sr">Buscar automação</span><input id="busca" type="search" placeholder="Buscar automação, área, máquina…" autocomplete="off"></label>' +
          '<span class="atualizado" aria-live="polite"><span class="atualizado__pulso" aria-hidden="true"></span><span><span class="atualizado__rot">Atualizado às </span><time id="atualizado-hora"></time></span></span>' +
          '<button type="button" class="botao botao--sec botao--tv" data-acao="tv">' + ico('tv') + '<span>Modo TV</span></button>' +
        '</div>' +
      '</header>' +
      '<p class="demo-aviso">' + ico('ressalva') + '<span><strong>Dados de demonstração.</strong> ' + esc(cfg.versao + ' · ' + cfg.nomeVersao) + '</span><a href="../index.html">Comparar versões</a></p>' +
      '<main class="conteudo" id="conteudo" tabindex="-1"></main>' +
      '<div class="gaveta__fundo" id="gaveta-fundo" hidden></div>' +
      '<aside class="gaveta" id="gaveta" aria-label="Detalhe da automação" hidden></aside>' +
      '<div class="tv" id="tv" hidden></div>';
  }

  // ---------- Visão geral ----------
  function faixa(grande) {
    const c = contagem(); const h = execsHoje();
    const ordem = OP ? ['ok', 'rodando', 'falha', 'atrasado', 'ressalva', 'pausado'] : ['falha', 'atrasado', 'rodando', 'ressalva', 'ok', 'pausado'];
    if (OP) {
      return '<section class="faixa faixa--op' + (grande ? ' faixa--tv' : '') + '" aria-label="Situação agora">' +
        ordem.map((e) => {
          const ativo = S.filtroEstados.has(e);
          const tag = grande ? 'div' : 'button';
          return '<' + tag + (grande ? '' : ' type="button" data-filtro="' + e + '" aria-pressed="' + ativo + '"') + ' class="contador contador--' + e + (c[e] ? '' : ' contador--zero') + (ativo ? ' contador--ativo' : '') + '">' +
            '<span class="contador__ico">' + ico(e) + '</span><span class="contador__num">' + c[e] + '</span><span class="contador__rot">' + ESTADOS[e].rotulo + '</span></' + tag + '>';
        }).join('') +
        '<div class="faixa__hoje" title="Execuções concluídas hoje, de todas as automações"><span class="faixa__hoje-num">' + num(h.total) + '</span><span class="faixa__hoje-rot">atendidas hoje · ' + pct(h.taxa, 0) + ' sem falha</span></div>' +
      '</section>';
    }
    return '<section class="faixa' + (grande ? ' faixa--tv' : '') + '" aria-label="Situação agora">' +
      ordem.map((e) => {
        const ativo = S.filtroEstados.has(e);
        const tag = grande ? 'div' : 'button type="button"';
        return '<' + tag + ' class="contador contador--' + e + (c[e] ? '' : ' contador--zero') + (ativo ? ' contador--ativo' : '') + '"' +
          (grande ? '' : ' data-filtro="' + e + '" aria-pressed="' + ativo + '"') + '>' +
          '<span class="contador__ico">' + ico(e) + '</span>' +
          '<span class="contador__num">' + c[e] + '</span>' +
          '<span class="contador__rot">' + ESTADOS[e].rotulo + '</span>' +
        '</' + (grande ? 'div' : 'button') + '>';
      }).join('') +
      '<div class="faixa__hoje"><span class="faixa__hoje-num">' + num(h.total) + '</span><span class="faixa__hoje-rot">execuções hoje · ' + pct(h.taxa) + ' sem falha</span></div>' +
    '</section>';
  }

  function itemAtencao(al, grande) {
    const a = porId[al.automacao_id];
    const r = reconhecimento(al);
    const estado = al.tipo === 'atraso' ? 'atrasado' : al.tipo === 'duracao' ? 'rodando' : al.tipo;
    return '<li class="aviso aviso--' + estado + (al.tipo === 'duracao' ? ' aviso--duracao' : '') + (r ? ' aviso--reconhecido' : '') + '">' +
      '<button type="button" class="aviso__abrir" data-abrir="' + a.id + '">' +
        '<span class="aviso__ico">' + ico(al.tipo === 'duracao' ? 'duracao' : estado) + '</span>' +
        '<span class="aviso__corpo">' +
          '<span class="aviso__nome">' + esc(a.nome) + '</span>' +
          '<span class="aviso__motivo"><strong>' + esc(al.titulo) + '</strong> · ' + (al.tipo === 'duracao' ? rel(al.desde, 'começou ') : rel(al.desde)) + '</span>' +
          (grande ? '' : '<span class="aviso__msg">' + esc(al.mensagem) + '</span>') +
          (r && !grande ? '<span class="aviso__rec">Reconhecido por ' + esc(r.por) + ' ' + relativo(r.em) + '</span>' : '') +
        '</span>' +
        (grande ? '' : '<span class="aviso__seta">' + ico('seta') + '</span>') +
      '</button></li>';
  }

  function listaAtencao(grande, max) {
    const abertos = alertasAbertos();
    const rec = D.alertas.filter((al) => reconhecimento(al));
    let todos = abertos.concat(grande ? [] : rec);
    const resto = max && todos.length > max ? todos.length - max : 0;
    if (resto) todos = todos.slice(0, max);
    if (!todos.length) return '<p class="vazio">' + ico('ok') + ' Nenhuma automação precisa de atenção agora.</p>';
    return '<ol class="atencao__lista">' + todos.map((al) => itemAtencao(al, grande)).join('') + '</ol>' +
      (resto ? '<p class="atencao__mais">e mais ' + resto + (resto === 1 ? ' alerta' : ' alertas') + '</p>' : '');
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
      '<label class="alternar"><input type="checkbox" id="agrupar"' + (S.agrupar ? ' checked' : '') + '><span>Agrupar por área</span></label>' +
      '<span class="filtros__conta">' + (temFiltro ? mostrando + ' de ' + total + ' · <button type="button" class="link" data-acao="limpar">Limpar filtros</button>' : total + ' automações') + '</span>' +
    '</div>';
  }

  function vazioFiltro() {
    return '<div class="vazio vazio--grande"><p><strong>Nenhuma automação com esses filtros.</strong></p><p>Tire algum filtro ou busque por outro nome.</p><button type="button" class="botao botao--sec" data-acao="limpar">Limpar filtros</button></div>';
  }

  function cartao(a) {
    const prox = a.proxima_execucao ? 'Próxima ' + dataHora(a.proxima_execucao) : 'Sem próxima execução';
    return '<li class="cartao cartao--' + a.estado + '"><button type="button" class="cartao__abrir" data-abrir="' + a.id + '">' +
      '<span class="cartao__topo">' + chip(a.estado) + '<span class="tec tec--' + a.tecnologia.toLowerCase() + '">' + a.tecnologia + '</span></span>' +
      '<span class="cartao__nome">' + esc(a.nome) + '</span>' +
      '<span class="cartao__linha">' + ultimaTexto(a) + '</span>' +
      '<span class="cartao__pe"><span class="cartao__prox">' + prox + '</span>' + trilha(a, 16) + '</span>' +
    '</button></li>';
  }

  function cabOrdem(col, rotulo, classe) {
    const ativo = S.ordem.col === col;
    const aria = ativo ? (S.ordem.dir === 1 ? 'ascending' : 'descending') : 'none';
    return '<th scope="col" class="' + (classe || '') + '" aria-sort="' + aria + '"><button type="button" class="ordenar" data-ordem="' + col + '">' + rotulo + ico('ordenar') + '</button></th>';
  }

  function tabela(grupos) {
    return '<div class="tabela-rolagem"><table class="tabela">' +
      '<thead><tr>' + cabOrdem('estado', 'Estado', 'c-estado') + cabOrdem('nome', 'Automação', 'c-nome') + cabOrdem('tecnologia', 'Tecnologia', 'c-tec') +
        cabOrdem('ultima', 'Última execução', 'c-ultima') + cabOrdem('proxima', 'Próxima', 'c-prox') +
        '<th scope="col" class="c-trilha">Últimas 20</th>' + cabOrdem('sucesso', 'Sucesso 30 dias', 'c-sucesso num') + '</tr></thead>' +
      grupos.map((g) => '<tbody>' + (g.area ? '<tr class="tabela__grupo"><th colspan="7" scope="rowgroup">' + esc(g.area) + ' <span>' + g.itens.length + '</span></th></tr>' : '') +
        g.itens.map((a) => '<tr class="linha linha--' + a.estado + (S.sel === a.id ? ' linha--sel' : '') + '" data-abrir="' + a.id + '">' +
          '<td class="c-estado">' + chip(a.estado) + '</td>' +
          '<td class="c-nome"><button type="button" class="linha__nome" data-abrir="' + a.id + '">' + esc(a.nome) + '</button>' + (g.area ? '' : '<span class="linha__area">' + esc(a.area) + '</span>') + '</td>' +
          '<td class="c-tec"><span class="tec tec--' + a.tecnologia.toLowerCase() + '">' + a.tecnologia + '</span></td>' +
          '<td class="c-ultima">' + ultimaTexto(a) + '</td>' +
          '<td class="c-prox">' + (a.proxima_execucao ? dataHora(a.proxima_execucao) : '—') + '</td>' +
          '<td class="c-trilha">' + trilha(a) + '</td>' +
          '<td class="c-sucesso num">' + pct(a.taxa_sucesso, 0) + '</td>' +
        '</tr>').join('') + '</tbody>').join('') +
    '</table></div>';
  }

  function mural(grupos, tv) {
    return '<div class="mural' + (tv ? ' mural--tv' : '') + '">' + grupos.map((g) =>
      '<section class="mural__grupo">' + (g.area ? '<h3 class="mural__area">' + esc(g.area) + '</h3>' : '') +
      '<ul class="mural__lista">' + g.itens.map((a) =>
        '<li class="tile tile--' + a.estado + '">' + (tv ? '<div class="tile__in">' : '<button type="button" class="tile__in" data-abrir="' + a.id + '">') +
          '<span class="tile__estado">' + ico(a.estado) + '<span>' + ESTADOS[a.estado].curto + '</span></span>' +
          '<span class="tile__nome">' + esc(a.nome) + '</span>' +
          '<span class="tile__info">' + tileInfo(a) + '</span>' +
        (tv ? '</div>' : '</button>') + '</li>').join('') + '</ul></section>').join('') + '</div>';
  }
  function tileInfo(a) {
    const u = a.ultima_execucao;
    if (a.estado === 'rodando') return rel(u.inicio, '');
    if (a.estado === 'atrasado') return 'esperada ' + hora(a.esperado_em);
    if (a.estado === 'falha') return rel(u.fim || u.inicio);
    if (a.estado === 'pausado') return 'desde ' + dataHora(u.inicio);
    return 'última ' + hora(u.inicio) + (a.proxima_execucao ? ' · próxima ' + dataHora(a.proxima_execucao).replace('hoje ', '') : '');
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

  function telaGeral() {
    if (OP) return telaOperacao();
    const lista = filtradas();
    const grupos = agrupadas(lista);
    if (cfg.visao === 'mestre') {
      if (!S.sel) { const al = alertasAbertos()[0]; S.sel = al ? al.automacao_id : D.automacoes[0].id; }
      // No celular a lista ocupa a tela e o detalhe abre por cima, só quando alguém toca num item.
      return '<h1 class="sr">Visão geral</h1>' + faixa() +
        '<div class="mestre"><section class="mestre__lista" aria-label="Automações">' +
          '<div class="mestre__filtros">' + barraFiltros(D.automacoes.length, lista.length) + '</div>' +
          (lista.length ? listaMestre(lista) : vazioFiltro()) +
        '</section><section class="mestre__detalhe" id="detalhe-fixo" aria-label="Detalhe da automação">' + detalhe(porId[S.sel], true) + '</section></div>';
    }
    let corpo;
    if (!lista.length) corpo = vazioFiltro();
    else if (cfg.visao === 'tabela') corpo = tabela(grupos);
    else if (cfg.visao === 'mural') corpo = mural(grupos);
    else corpo = grupos.map((g) => '<section class="grupo">' + (g.area ? '<h3 class="grupo__titulo">' + esc(g.area) + ' <span>' + g.itens.length + '</span></h3>' : '') + '<ul class="cartoes">' + g.itens.map(cartao).join('') + '</ul></section>').join('');
    return '<h1 class="sr">Visão geral</h1>' + faixa() +
      '<div class="geral">' +
        '<section class="atencao" aria-labelledby="t-atencao"><header class="secao__cab"><h2 id="t-atencao">Precisa de atenção</h2><span class="secao__meta">' + alertasAbertos().length + ' abertos</span></header>' + listaAtencao(false) + '</section>' +
        '<section class="todas" aria-labelledby="t-todas"><header class="secao__cab"><h2 id="t-todas">Todas as automações</h2></header>' + barraFiltros(D.automacoes.length, lista.length) + '<div class="todas__corpo">' + corpo + '</div></section>' +
      '</div>';
  }

  // ---------- Organização "operacao": fila à esquerda, o que está acontecendo à direita ----------
  const AGORA = ['falha', 'atrasado', 'rodando'];
  const numero = (execId) => '#' + execId.slice(1);
  const quandoTxt = (iso) => (mesmoDia(new Date(iso), new Date()) ? hora(iso) : dataHora(iso));
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

  function cascaOp() {
    const app = document.getElementById('app');
    const escuro = document.documentElement.dataset.tema === 'escuro';
    app.className = 'shell shell--op visao--operacao detalhe--gaveta';
    app.innerHTML =
      '<header class="topo topo--op">' +
        '<div class="topo__cel topo__marca">' + logoSlot('tema') + '</div>' +
        '<div class="topo__cel topo__cel--nome"><span class="topo__produto">Monitor de Automações</span></div>' +
        '<nav class="nav topo__cel topo__cel--nav" aria-label="Visões">' +
          '<a class="nav__item" href="#/geral" data-rota="geral" title="Painel">' + ico('geral') + '<span class="nav__rot">Painel</span></a>' +
          '<a class="nav__item" href="#/alertas" data-rota="alertas" title="Alertas">' + ico('alertas') + '<span class="nav__rot">Alertas</span><span class="nav__badge" id="badge-alertas"></span></a>' +
          '<a class="nav__item" href="#/indicadores" data-rota="indicadores" title="Indicadores">' + ico('indicadores') + '<span class="nav__rot">Indicadores</span></a>' +
        '</nav>' +
        '<div class="topo__cel topo__cel--busca"><label class="busca">' + ico('busca') + '<span class="sr">Buscar automação</span><input id="busca" type="search" placeholder="Buscar automação, VM ou número…" autocomplete="off"></label></div>' +
        '<div class="topo__cel topo__acoes">' +
          '<span class="atualizado" aria-live="polite"><span class="atualizado__pulso" aria-hidden="true"></span><span><span class="atualizado__rot">Atualizado às </span><time id="atualizado-hora"></time></span></span>' +
          '<button type="button" class="botao-ico" id="botao-tema" data-acao="tema" title="' + (escuro ? 'Usar tema claro' : 'Usar tema escuro') + '">' + botaoTema() + '</button>' +
          '<button type="button" class="botao botao--sec botao--tv" data-acao="tv" title="Modo TV">' + ico('tv') + '<span>Modo TV</span></button>' +
        '</div>' +
      '</header>' +
      '<p class="demo-aviso">' + ico('ressalva') + '<span><strong>Dados de demonstração.</strong> ' + esc(cfg.versao + ' · ' + cfg.nomeVersao) + '</span><a href="../index.html">Comparar versões</a></p>' +
      '<main class="conteudo" id="conteudo" tabindex="-1"></main>' +
      '<div class="gaveta__fundo" id="gaveta-fundo" hidden></div>' +
      '<aside class="gaveta" id="gaveta" aria-label="Detalhe da automação" hidden></aside>' +
      '<div class="tv" id="tv" hidden></div>';
  }

  function listaAgora(tv) {
    const busca = tv ? '' : S.busca.trim();
    const peso = (a) => (a.estado === 'rodando' ? -a.ultima_execucao.duracao_s / a.duracao_media_s : 0);
    return D.automacoes.filter((a) => {
      if (tv) return AGORA.includes(a.estado);
      if (!buscaCasa(a, a.ultima_execucao ? numero(a.ultima_execucao.id) : '')) return false;
      if (S.filtroEstados.size) return S.filtroEstados.has(a.estado);
      return busca || S.verTodas || AGORA.includes(a.estado);
    }).sort((x, y) => ESTADOS[x.estado].ordem - ESTADOS[y.estado].ordem || peso(x) - peso(y) || x.nome.localeCompare(y.nome, 'pt-BR'));
  }

  // Cartão na ordem do rascunho do time: automação e número | estado | início | máquina.
  function cartaoOp(a, tv) {
    const u = a.ultima_execucao;
    const al = alertaDe(a.id); const r = al && reconhecimento(al);
    const razao = u.duracao_s / a.duracao_media_s;
    let rot; let val; let extra = ''; let quando; let sub; let subCls = '';
    if (a.estado === 'rodando') {
      rot = 'Rodando'; val = esc(u.etapa || 'Processando');
      if (u.itens_previstos > 1) {
        const p = Math.min(1, u.itens_ok / u.itens_previstos);
        extra = '<span class="op-card__prog"><span class="progresso" aria-hidden="true"><span style="width:' + (p * 100).toFixed(0) + '%"></span></span><span class="op-card__mini">item ' + num(u.itens_ok) + ' de ' + num(u.itens_previstos) + '</span></span>';
      }
      quando = hora(u.inicio);
      if (razao > 2.5) { sub = rel(u.inicio, '') + '</span><span class="op-card__sub op-card__sub--alerta">' + razao.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '× o tempo normal'; }
      else { sub = rel(u.inicio, '') + ' · normal ' + duracao(a.duracao_media_s); if (razao > 1.2) subCls = ' op-card__sub--aviso'; }
    } else if (a.estado === 'falha') {
      rot = 'Falhou'; val = esc(u.mensagem); quando = quandoTxt(u.inicio); sub = 'parou ' + rel(u.fim || u.inicio);
    } else if (a.estado === 'atrasado') {
      rot = 'Atrasada'; val = 'Sem sinal no log nem no banco'; quando = hora(a.esperado_em); sub = 'esperada ' + rel(a.esperado_em);
    } else if (a.estado === 'ressalva') {
      rot = 'Com ressalva'; val = esc(u.mensagem); quando = quandoTxt(u.inicio); sub = duracao(u.duracao_s) + ' · ' + num(u.itens_ok) + ' itens OK';
    } else if (a.estado === 'pausado') {
      rot = 'Pausada'; val = esc(a.pausada_por); quando = quandoTxt(u.inicio); sub = 'última execução';
    } else {
      rot = 'Concluída'; val = num(u.itens_ok) + (u.itens_ok === 1 ? ' item processado' : ' itens processados'); quando = quandoTxt(u.inicio);
      sub = duracao(u.duracao_s) + (a.proxima_execucao ? ' · próxima ' + dataHora(a.proxima_execucao).replace('hoje ', '') : '');
    }
    if (r && !tv) extra += '<span class="op-card__rec">Reconhecido por ' + esc(r.por) + '</span>';
    const numTxt = a.estado === 'atrasado' ? a.id : numero(u.id);
    const abre = tv ? 'div' : 'button';
    return '<li class="op-card op-card--' + a.estado + (a.estado === 'rodando' && razao > 2.5 ? ' op-card--lenta' : '') + (r ? ' op-card--reconhecido' : '') + '">' +
      '<' + abre + (tv ? '' : ' type="button" data-abrir="' + a.id + '"') + ' class="op-card__in">' +
        '<span class="op-card__c op-card__c--nome"><span class="op-card__nome">' + esc(a.nome) + '</span><span class="op-card__sub"><span class="op-card__num">' + numTxt + '</span> · ' + esc(a.area) + '</span></span>' +
        '<span class="op-card__c op-card__c--estado"><span class="op-card__rot">' + ico(a.estado) + '<span>' + rot + ':</span></span><span class="op-card__val">' + val + '</span>' + extra + '</span>' +
        '<span class="op-card__c op-card__c--tempo"><span class="op-card__hora">' + ico(a.estado === 'atrasado' ? 'atrasado' : 'inicio') + '<span>' + quando + '</span></span><span class="op-card__sub' + subCls + '">' + sub + '</span></span>' +
        '<span class="op-card__c op-card__c--vm"><span class="op-card__vm" title="Máquina">' + ico('maquina') + '<span><span class="sr">Máquina </span>' + esc(a.maquina) + '</span></span><span class="tec tec--' + a.tecnologia.toLowerCase() + '">' + a.tecnologia + '</span></span>' +
      '</' + abre + '></li>';
  }

  function itensFila(tv) {
    return D.fila.map((f) => Object.assign({ a: porId[f.automacao_id] }, f)).filter((f) => tv || (
      (S.filaTec === 'todas' || f.a.tecnologia === S.filaTec) && (S.filaArea === 'todas' || f.a.area === S.filaArea) && buscaCasa(f.a, numero(f.id))));
  }
  const momentoFila = (f) => new Date(f.entrou_em || f.previsto_para).getTime();
  const ordenaFila = (l) => l.sort((x, y) => (S.filaOrdem === 'prioridade' ? x.prioridade - y.prioridade : 0) || momentoFila(x) - momentoFila(y));

  function itemFila(f, tv) {
    const ag = f.situacao === 'aguardando';
    const espera = ag ? (Date.now() - new Date(f.entrou_em).getTime()) / 60000 : 0;
    const quando = ag
      ? '<span class="fitem__quando fitem__quando--aguardando' + (espera > 10 ? ' fitem__quando--demora' : '') + '">Aguardando robô ' + rel(f.entrou_em) + '</span>'
      : '<span class="fitem__quando">Agendada ' + quandoTxt(f.previsto_para) + ' · ' + rel(f.previsto_para) + '</span>';
    const origem = !ag || tv ? '' : '<span class="fitem__origem">' + (f.origem === 'manual' ? 'Disparada por ' : 'Gatilho: ') + esc(f.disparada_por) + '</span>';
    const abre = tv ? 'div' : 'button';
    return '<li class="fitem fitem--' + f.situacao + '"><' + abre + (tv ? '' : ' type="button" data-abrir="' + f.a.id + '"') + ' class="fitem__in">' +
      '<span class="fitem__l1"><span class="fitem__nome">' + esc(f.a.nome) + '</span><span class="fitem__num">' + numero(f.id) + '</span></span>' +
      '<span class="fitem__l2"><span class="tec tec--' + f.a.tecnologia.toLowerCase() + '">' + f.a.tecnologia + '</span><span class="fitem__area">' + esc(f.a.area) + '</span>' +
        '<span class="prio prio--' + f.prioridade + '" title="Prioridade ' + f.prioridade + ' (1 é a mais alta)">Prioridade ' + f.prioridade + '</span></span>' +
      quando + origem +
    '</' + abre + '></li>';
  }

  function cabFila() {
    const n = itensFila().length;
    const ativos = (S.filaTec !== 'todas' ? 1 : 0) + (S.filaArea !== 'todas' ? 1 : 0);
    const tecs = ['todas', 'UiPath', 'Python'];
    return '<div class="fila__cab"><h2 class="fila__h">Fila <span class="fila__conta">' + n + '</span></h2>' +
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
    if (!todos.length) return '<div class="vazio vazio--grande"><p><strong>Nada na fila' + (S.busca || S.filaTec !== 'todas' || S.filaArea !== 'todas' ? ' com esses filtros' : '') + '.</strong></p>' +
      (S.busca || S.filaTec !== 'todas' || S.filaArea !== 'todas' ? '<button type="button" class="botao botao--sec botao--peq" data-acao="limpar">Limpar filtros</button>' : '<p>Nenhuma execução esperando robô nem agendada para as próximas horas.</p>') + '</div>';
    const grupo = (titulo, l) => (l.length ? '<section class="fila__grupo"><h3 class="fila__titulo">' + titulo + ' <span>' + l.length + '</span></h3><ol class="fila__lista">' + l.map((f) => itemFila(f)).join('') + '</ol></section>' : '');
    return grupo('Aguardando robô', ordenaFila(todos.filter((f) => f.situacao === 'aguardando'))) +
      grupo('Próximas na agenda', ordenaFila(todos.filter((f) => f.situacao === 'agendada')));
  }

  function telaOperacao() {
    const lista = listaAgora();
    const busca = S.busca.trim();
    let titulo = 'Agora';
    if (S.filtroEstados.size) titulo = [...S.filtroEstados].map((e) => ESTADOS[e].rotulo).join(' + ');
    else if (busca) titulo = 'Busca: “' + busca + '”';
    else if (S.verTodas) titulo = 'Todas as automações';
    const desc = !S.filtroEstados.size && !busca && !S.verTodas ? '<span class="op__desc">falhas, atrasos e o que está rodando</span>' : '';
    const acao = S.filtroEstados.size || S.verTodas || busca
      ? '<button type="button" class="link" data-acao="ver-agora">Voltar para o agora</button>'
      : '<button type="button" class="link" data-acao="ver-todas">Ver todas as ' + D.automacoes.length + '</button>';
    let corpo;
    if (lista.length) corpo = '<ul class="op-cards">' + lista.map((a) => cartaoOp(a)).join('') + '</ul>';
    else if (busca || S.filtroEstados.size) corpo = vazioFiltro();
    else corpo = '<p class="vazio vazio--grande">' + ico('ok') + ' <strong>Tudo em dia.</strong> Nenhuma automação rodando, atrasada ou com falha agora.</p>';
    return '<h1 class="sr">Painel</h1><div class="op" data-mostrando="' + S.aba + '">' +
      '<div class="op__fila-cab">' + cabFila() + '</div>' +
      '<div class="op__faixa">' + faixa() + '</div>' +
      '<div class="op__abas"><div class="segmentado" role="group" aria-label="Mostrar">' +
        '<button type="button" data-aba="agora" aria-pressed="' + (S.aba === 'agora') + '">' + esc(titulo.length > 18 ? 'Painel' : titulo) + ' <span class="op__n">' + lista.length + '</span></button>' +
        '<button type="button" data-aba="fila" aria-pressed="' + (S.aba === 'fila') + '">Fila <span class="op__n">' + itensFila().length + '</span></button></div></div>' +
      '<section class="op__fila" data-rolagem="fila" aria-label="Fila de execuções">' + painelFila() + '</section>' +
      '<section class="op__agora" data-rolagem="agora" aria-labelledby="t-agora">' +
        '<header class="op__agora-cab"><h2 id="t-agora">' + esc(titulo) + ' <span class="op__conta">' + lista.length + '</span></h2>' + desc + acao + '</header>' +
        corpo +
      '</section>' +
    '</div>';
  }

  function telaTVOp() {
    const lista = listaAgora(true);
    const fila = itensFila(true);
    const ordenada = ordenaFila(fila.filter((f) => f.situacao === 'aguardando')).concat(ordenaFila(fila.filter((f) => f.situacao === 'agendada')));
    return '<header class="tv__cab">' + logoSlot('tema') + '<h1 class="tv__titulo">Automações</h1>' +
        '<span class="tv__atualizado">Atualizado às <time data-atualizado></time></span><time class="tv__relogio" id="tv-relogio"></time>' +
        '<button type="button" class="botao botao--sec botao--peq tv__sair" data-acao="sair-tv">' + ico('sair') + '<span>Sair (Esc)</span></button></header>' +
      faixa(true) +
      '<div class="tv__corpo tv__corpo--op">' +
        '<section class="tv__fila" aria-labelledby="t-tv-fila"><h2 id="t-tv-fila">Fila <span>' + fila.length + '</span></h2><ol class="fila__lista">' + ordenada.map((f) => itemFila(f, true)).join('') + '</ol></section>' +
        '<section class="tv__agora" aria-labelledby="t-tv-agora"><h2 id="t-tv-agora">Agora <span>' + lista.length + '</span></h2>' +
          (lista.length ? '<ul class="op-cards op-cards--tv">' + lista.map((a) => cartaoOp(a, true)).join('') + '</ul>' : '<p class="vazio">' + ico('ok') + ' Tudo em dia.</p>') + '</section>' +
      '</div>';
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
    if (!S.execSel || !execs.find((e) => e.id === S.execSel)) S.execSel = execs[0] ? execs[0].id : null;
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
      '</dl>' +
      '<section class="detalhe__bloco" aria-labelledby="t-dur"><h3 id="t-dur">Duração das últimas execuções</h3>' + graficoDuracao(a, execs) + '</section>' +
      '<section class="detalhe__bloco" aria-labelledby="t-execs"><h3 id="t-execs">Execuções</h3>' +
        '<div class="tabela-rolagem"><table class="execs"><thead><tr><th scope="col">Início</th><th scope="col">Duração</th><th scope="col">Resultado</th><th scope="col" class="num">Itens</th><th scope="col" class="c-msg">Mensagem</th></tr></thead><tbody>' +
        visiveis.map((e) => '<tr class="execs__l' + (e.id === S.execSel ? ' execs__l--sel' : '') + '" data-exec="' + e.id + '" aria-selected="' + (e.id === S.execSel) + '">' +
          '<td><button type="button" class="link-exec" data-exec="' + e.id + '">' + dataHora(e.inicio) + '</button></td>' +
          '<td class="num">' + (e.status === 'rodando' ? rel(e.inicio, '') : duracao(e.duracao_s)) + '</td>' +
          '<td>' + chip(EXEC_PARA_ESTADO[e.status], STATUS_EXEC[e.status]) + '</td>' +
          '<td class="num">' + num(e.itens_ok) + (e.itens_erro ? ' <span class="fraco">+' + e.itens_erro + '</span>' : '') + '</td>' +
          '<td class="c-msg">' + esc(e.mensagem) + '</td></tr>').join('') +
        '</tbody></table></div>' +
        (execs.length > S.execsVisiveis ? '<button type="button" class="botao botao--sec botao--peq botao--mais" data-acao="mais-execs">Mostrar mais ' + Math.min(12, execs.length - S.execsVisiveis) + ' de ' + (execs.length - S.execsVisiveis) + '</button>' : '') +
      '</section>' +
      blocoLog(a, exSel) +
    '</article>';
  }

  function formReconhecer(al) {
    return '<form class="reconhecer" data-form-reconhecer="' + al.id + '">' +
      '<label for="nota-rec">Nota para o time (opcional)</label>' +
      '<textarea id="nota-rec" rows="2" placeholder="Ex.: abri o chamado 4471, investigando o seletor"></textarea>' +
      '<div class="reconhecer__acoes"><button type="submit" class="botao botao--pri botao--peq">Confirmar</button><button type="button" class="botao botao--sec botao--peq" data-acao="cancelar-rec">Cancelar</button></div></form>';
  }

  // ---------- Alertas ----------
  function telaAlertas() {
    const abertos = alertasAbertos();
    const rec = D.alertas.filter((al) => reconhecimento(al));
    const item = (al) => {
      const a = porId[al.automacao_id]; const r = reconhecimento(al);
      const est = al.tipo === 'atraso' ? 'atrasado' : al.tipo === 'duracao' ? 'rodando' : al.tipo;
      return '<li class="alerta alerta--' + est + '">' +
        '<span class="alerta__ico">' + ico(al.tipo === 'duracao' ? 'duracao' : est) + '</span>' +
        '<div class="alerta__corpo"><p class="alerta__titulo">' + esc(al.titulo) + ' <span class="fraco">· desde ' + dataHora(al.desde) + ', ' + rel(al.desde) + '</span></p>' +
          '<p class="alerta__auto"><button type="button" class="link" data-abrir="' + a.id + '">' + esc(a.nome) + '</button> <span class="fraco">' + esc(a.area) + ' · ' + a.tecnologia + ' · ' + esc(a.responsavel) + '</span></p>' +
          '<p class="alerta__msg">' + esc(al.mensagem) + '</p>' +
          (r ? '<p class="alerta__rec">Reconhecido por ' + esc(r.por) + ' ' + relativo(r.em) + (r.nota ? ': “' + esc(r.nota) + '”' : '') + '</p>' : '') +
          (S.reconhecendo === al.id ? formReconhecer(al) : '') +
        '</div>' +
        '<div class="alerta__acoes">' + (r || S.reconhecendo === al.id ? '' : '<button type="button" class="botao botao--pri botao--peq" data-reconhecer="' + al.id + '">Reconhecer</button>') +
          '<button type="button" class="botao botao--sec botao--peq" data-abrir="' + a.id + '">' + ico('log') + '<span>Abrir log</span></button></div>' +
      '</li>';
    };
    return '<div class="pagina">' +
      '<header class="pagina__cab"><h1>Alertas</h1><p>' + abertos.length + ' abertos · ' + rec.length + ' reconhecidos</p></header>' +
      '<section aria-labelledby="t-abertos"><h2 id="t-abertos" class="pagina__sec">Abertos</h2>' + (abertos.length ? '<ul class="alertas">' + abertos.map(item).join('') + '</ul>' : '<p class="vazio">' + ico('ok') + ' Nenhum alerta aberto. Quando uma automação falhar ou atrasar, ela aparece aqui.</p>') + '</section>' +
      (rec.length ? '<section aria-labelledby="t-rec"><h2 id="t-rec" class="pagina__sec">Reconhecidos</h2><ul class="alertas alertas--rec">' + rec.map(item).join('') + '</ul></section>' : '') +
      '<aside class="regras"><h2>Quando o monitor abre um alerta</h2><ul>' +
        '<li>A execução terminou com erro.</li><li>A automação não deu sinal no log nem no banco até 10 min depois do horário da agenda.</li>' +
        '<li>Está rodando há mais de 2,5 vezes a duração média.</li><li>Terminou, mas mandou itens para tratamento manual.</li></ul>' +
        '<p>Reconhecer avisa o time que alguém já está cuidando. O alerta continua no histórico até a próxima execução dar certo.</p></aside>' +
    '</div>';
  }

  // ---------- Indicadores ----------
  function telaIndicadores() {
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
      '<header class="pagina__cab"><h1>Indicadores</h1>' +
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

  // ---------- Modo TV ----------
  function telaTV() {
    if (OP) return telaTVOp();
    const grupos = AREAS.map((area) => ({ area, itens: D.automacoes.filter((a) => a.area === area).sort((x, y) => ESTADOS[x.estado].ordem - ESTADOS[y.estado].ordem) }));
    return '<header class="tv__cab">' + logoSlot(cfg.logoTV || cfg.logo) + '<h1 class="tv__titulo">Automações</h1>' +
        '<span class="tv__atualizado">Atualizado às <time data-atualizado></time></span><time class="tv__relogio" id="tv-relogio"></time>' +
        '<button type="button" class="botao botao--sec botao--peq tv__sair" data-acao="sair-tv">' + ico('sair') + '<span>Sair (Esc)</span></button></header>' +
      faixa(true) +
      '<div class="tv__corpo"><section class="tv__atencao" aria-labelledby="t-tv-at"><h2 id="t-tv-at">Precisa de atenção</h2>' + listaAtencao(true) + '</section>' +
      '<section class="tv__mural" aria-label="Todas as automações">' + mural(grupos, true) + '</section></div>';
  }

  // A TV não rola: o mural diminui a letra até caber e a lista de atenção mostra só o que cabe.
  function ajustarTV() {
    if (OP) return ajustarTVOp();
    const mural = document.querySelector('.tv__mural');
    const at = document.querySelector('.tv__atencao');
    if (!mural || !at) return;
    let tam = 100;
    mural.style.fontSize = '';
    while (mural.scrollHeight > mural.clientHeight + 1 && tam > 55) { tam -= 4; mural.style.fontSize = tam + '%'; }
    const lista = at.querySelector('.atencao__lista');
    if (!lista) return;
    const total = alertasAbertos().length;
    let mais = at.querySelector('.atencao__mais');
    while (at.scrollHeight > at.clientHeight + 1 && lista.children.length > 1) {
      lista.lastElementChild.remove();
      const resto = total - lista.children.length;
      if (!mais) { mais = document.createElement('p'); mais.className = 'atencao__mais'; at.appendChild(mais); }
      mais.textContent = 'e mais ' + resto + (resto === 1 ? ' alerta' : ' alertas') + ' (veja no painel)';
    }
  }

  // Na organização "operacao": os cartões diminuem até caber e a fila mostra só o que cabe.
  function ajustarTVOp() {
    const agora = document.querySelector('.tv__agora');
    const fila = document.querySelector('.tv__fila');
    if (!agora || !fila) return;
    let tam = 100;
    agora.style.fontSize = '';
    while (agora.scrollHeight > agora.clientHeight + 1 && tam > 60) { tam -= 4; agora.style.fontSize = tam + '%'; }
    const lista = fila.querySelector('.fila__lista');
    const total = lista ? lista.children.length : 0;
    let mais = null;
    while (lista && fila.scrollHeight > fila.clientHeight + 1 && lista.children.length > 1) {
      lista.lastElementChild.remove();
      if (!mais) { mais = document.createElement('p'); mais.className = 'atencao__mais'; fila.appendChild(mais); }
      const resto = total - lista.children.length;
      mais.textContent = 'e mais ' + resto + ' na fila';
    }
  }

  // ---------- Roteamento e render ----------
  function lerRota() {
    const partes = (location.hash || '#/geral').replace(/^#\/?/, '').split('/');
    const rota = ['geral', 'alertas', 'indicadores', 'tv'].includes(partes[0]) ? partes[0] : 'geral';
    return { rota, id: partes[1] && porId[partes[1]] ? partes[1] : null };
  }

  let focoAntes = null;
  function render(opcoes = {}) {
    const { rota, id } = lerRota();
    const mudouRota = rota !== S.rota;
    S.rota = rota;
    const tv = document.getElementById('tv');
    document.body.classList.toggle('modo-tv', rota === 'tv');
    if (rota === 'tv') { tv.hidden = false; tv.innerHTML = telaTV(); atualizarRelogios(); ajustarTV(); return; }
    tv.hidden = true; tv.innerHTML = '';

    if (id !== S.sel && !(cfg.visao === 'mestre' && !id)) { S.sel = id; S.execSel = null; S.execsVisiveis = 12; S.nivelLog = 'todos'; }
    document.querySelectorAll('.nav__item').forEach((n) => { if (n.dataset.rota === rota) n.setAttribute('aria-current', 'page'); else n.removeAttribute('aria-current'); });
    const abertos = alertasAbertos().length;
    const badge = document.getElementById('badge-alertas');
    badge.textContent = abertos || ''; badge.hidden = !abertos;
    badge.setAttribute('aria-label', abertos + ' alertas abertos');

    const conteudo = document.getElementById('conteudo');
    const rolagem = window.scrollY;
    // Painéis com rolagem própria (fila e cartões) voltam para onde estavam.
    const rolagens = { conteudo: conteudo.scrollTop };
    conteudo.querySelectorAll('[data-rolagem]').forEach((el) => { rolagens[el.dataset.rolagem] = el.scrollTop; });
    conteudo.className = 'conteudo conteudo--' + rota;
    conteudo.innerHTML = rota === 'alertas' ? telaAlertas() : rota === 'indicadores' ? telaIndicadores() : telaGeral();
    if (!mudouRota || opcoes.manterRolagem) {
      window.scrollTo(0, rolagem);
      conteudo.scrollTop = rolagens.conteudo;
      conteudo.querySelectorAll('[data-rolagem]').forEach((el) => { if (rolagens[el.dataset.rolagem]) el.scrollTop = rolagens[el.dataset.rolagem]; });
    } else { window.scrollTo(0, 0); conteudo.scrollTop = 0; }

    const gaveta = document.getElementById('gaveta');
    const fundo = document.getElementById('gaveta-fundo');
    const usaGaveta = !(cfg.visao === 'mestre' && rota === 'geral') || window.matchMedia('(max-width: 899px)').matches;
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
    if (cfg.visao === 'mestre' && rota === 'geral' && !window.matchMedia('(max-width: 899px)').matches) {
      S.sel = id; S.execSel = null; S.execsVisiveis = 12;
      history.replaceState(null, '', '#/geral/' + id);
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
    if (fixo && cfg.visao === 'mestre' && S.rota === 'geral' && gaveta.hidden) { const r = fixo.scrollTop; fixo.innerHTML = detalhe(porId[S.sel], true); fixo.scrollTop = r; }
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

  // ---------- Eventos ----------
  function eventos() {
    document.addEventListener('click', (ev) => {
      const t = ev.target;
      const alvo = (sel) => t.closest(sel);
      let el;
      if ((el = alvo('[data-filtro]'))) { const e = el.dataset.filtro; if (S.filtroEstados.has(e)) S.filtroEstados.delete(e); else S.filtroEstados.add(e); S.verTodas = false; S.aba = 'agora'; const ag = document.querySelector('[data-rolagem="agora"]'); if (ag) ag.scrollTop = 0; return render({ manterRolagem: true }); }
      if ((el = alvo('[data-aba]'))) { S.aba = el.dataset.aba; return render({ manterRolagem: true }); }
      if ((el = alvo('[data-fila-tec]'))) { S.filaTec = el.dataset.filaTec; return render({ manterRolagem: true }); }
      if ((el = alvo('[data-tec]'))) { S.tec = el.dataset.tec; return render({ manterRolagem: true }); }
      if ((el = alvo('[data-ordem]'))) { const c = el.dataset.ordem; S.ordem = S.ordem.col === c ? (S.ordem.dir === 1 ? { col: c, dir: -1 } : { col: null, dir: 1 }) : { col: c, dir: 1 }; return render({ manterRolagem: true }); }
      if ((el = alvo('[data-periodo]'))) { S.periodo = el.dataset.periodo; return render({ manterRolagem: true }); }
      if ((el = alvo('[data-nivel]'))) { S.nivelLog = el.dataset.nivel; return rerenderDetalhe(); }
      if ((el = alvo('[data-exec]'))) { S.execSel = el.dataset.exec; rerenderDetalhe(); const b = document.querySelector('.gaveta:not([hidden]) #bloco-log, #detalhe-fixo #bloco-log'); if (b && ev.target.closest('.execs, .grafico')) b.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); return; }
      if ((el = alvo('[data-reconhecer]'))) { S.reconhecendo = el.dataset.reconhecer; if (S.rota === 'alertas' && document.getElementById('gaveta').hidden) render({ manterRolagem: true }); else rerenderDetalhe(); const n = document.getElementById('nota-rec'); if (n) n.focus(); return; }
      if ((el = alvo('[data-copiar]'))) {
        const linhas = D.logDaExecucao(el.dataset.copiar).map((l) => new Date(l.hora).toLocaleTimeString('pt-BR') + ' ' + l.nivel + ' ' + l.msg).join('\n');
        const ok = () => { el.querySelector('span').textContent = 'Copiado'; setTimeout(() => { if (el.isConnected) el.querySelector('span').textContent = 'Copiar'; }, 1600); };
        try { navigator.clipboard.writeText(linhas).then(ok, () => {}); } catch (e) { /* sem área de transferência */ }
        return;
      }
      if (alvo('[data-ir-log]')) { ev.preventDefault(); const b = (t.closest('.gaveta, #detalhe-fixo') || document).querySelector('#bloco-log'); if (b) b.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
      if ((el = alvo('[data-abrir]'))) { abrir(el.dataset.abrir); return; }
      if ((el = alvo('[data-acao]'))) {
        const a = el.dataset.acao;
        if (a === 'fechar') return fechar();
        if (a === 'limpar') { S.filtroEstados.clear(); S.tec = 'todas'; S.area = 'todas'; S.filaTec = 'todas'; S.filaArea = 'todas'; S.verTodas = false; S.busca = ''; document.getElementById('busca').value = ''; return render({ manterRolagem: true }); }
        if (a === 'tema') return trocarTema();
        if (a === 'ver-todas') { S.verTodas = true; S.filtroEstados.clear(); return render({ manterRolagem: true }); }
        if (a === 'ver-agora') { S.verTodas = false; S.filtroEstados.clear(); S.busca = ''; document.getElementById('busca').value = ''; return render({ manterRolagem: true }); }
        if (a === 'fila-ordem') { S.filaOrdem = S.filaOrdem === 'prioridade' ? 'horario' : 'prioridade'; render({ manterRolagem: true }); const b = document.querySelector('[data-acao="fila-ordem"]'); if (b) b.focus(); return; }
        if (a === 'fila-filtros') { S.filaFiltros = !S.filaFiltros; render({ manterRolagem: true }); const b = document.querySelector('[data-acao="fila-filtros"]'); if (b) b.focus(); return; }
        if (a === 'tv') { location.hash = '#/tv'; try { document.documentElement.requestFullscreen && document.documentElement.requestFullscreen().catch(() => {}); } catch (e) { /* tela cheia é opcional */ } return; }
        if (a === 'sair-tv') { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); location.hash = '#/geral'; return; }
        if (a === 'mais-execs') { S.execsVisiveis += 12; return rerenderDetalhe(); }
        if (a === 'cancelar-rec') { S.reconhecendo = null; if (S.rota === 'alertas' && document.getElementById('gaveta').hidden) render({ manterRolagem: true }); else rerenderDetalhe(); return; }
      }
    });
    document.getElementById('gaveta-fundo').addEventListener('click', fechar);
    document.addEventListener('submit', (ev) => {
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
      if (ev.target.id === 'fila-area') { S.filaArea = ev.target.value; render({ manterRolagem: true }); const f = document.getElementById('fila-area'); if (f) f.focus(); }
    });
    let t;
    document.getElementById('busca').addEventListener('input', (ev) => {
      clearTimeout(t);
      t = setTimeout(() => {
        S.busca = ev.target.value;
        if (S.rota !== 'geral') location.hash = '#/geral'; else render({ manterRolagem: true });
        const b = document.getElementById('busca'); if (document.activeElement !== b) b.focus();
      }, 150);
    });
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') {
        if (S.rota === 'tv') { location.hash = '#/geral'; return; }
        if (S.reconhecendo) { S.reconhecendo = null; rerenderDetalhe(); return; }
        if (!document.getElementById('gaveta').hidden) fechar();
      }
      if (ev.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') { ev.preventDefault(); document.getElementById('busca').focus(); }
    });
    window.addEventListener('hashchange', () => render());
    let largura = window.innerWidth;
    window.addEventListener('resize', () => { if (S.rota === 'tv') { render(); return; } if ((largura < 900) !== (window.innerWidth < 900)) { largura = window.innerWidth; render({ manterRolagem: true }); } });
    // Simula a coleta: no sistema real, a cada 30 s o front busca /api/situacao.
    setInterval(() => {
      ultimaColeta = new Date(); atualizarRelogios();
      const p = document.querySelector('.atualizado__pulso');
      if (p) { p.classList.remove('pulsou'); void p.offsetWidth; p.classList.add('pulsou'); }
    }, 30000);
    setInterval(atualizarRelogios, 15000);
  }

  casca();
  eventos();
  render();
})();
