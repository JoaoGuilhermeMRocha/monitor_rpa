// Dados de demonstração: 44 automações fictícias, no mesmo formato que a API do monitor vai devolver.
// Nomes, responsáveis e números são inventados. Gerador com semente fixa para todas as versões mostrarem o mesmo cenário.
(function () {
  'use strict';

  let semente = 20261108;
  const rnd = () => { semente = (semente * 1664525 + 1013904223) % 4294967296; return semente / 4294967296; };
  const entre = (a, b) => a + rnd() * (b - a);
  const inteiro = (a, b) => Math.round(entre(a, b));
  const escolhe = (lista) => lista[Math.floor(rnd() * lista.length)];

  const MIN = 60 * 1000;
  const agora = new Date();
  agora.setSeconds(0, 0);

  const RESP = ['Ana Paula R.', 'Bruno K.', 'Carla M.', 'Diego S.', 'Fernanda T.', 'Gustavo L.', 'Juliana B.', 'Marcos V.'];

  // [nome, área, tecnologia, intervalo em minutos, hora inicial, duração média (min), itens médios, minutos poupados por item]
  const CATALOGO = [
    ['Conciliação de boletos liquidados', 'Cobrança', 'UiPath', 60, 7, 6, 420, 1.5],
    ['Baixa de títulos pagos em cartório', 'Cobrança', 'Python', 1440, 6.5, 14, 85, 4],
    ['Envio de segunda via de boletos vencidos', 'Cobrança', 'Python', 240, 8, 9, 260, 2],
    ['Renegociação: geração de minutas', 'Cobrança', 'UiPath', 120, 8, 22, 40, 12],
    ['Análise de documentos de abertura de conta PJ', 'Cadastro', 'UiPath', 30, 7, 11, 35, 9],
    ['Atualização cadastral por comprovante de renda', 'Cadastro', 'UiPath', 60, 7, 8, 60, 6],
    ['Validação de CPF e CNPJ na Receita', 'Cadastro', 'Python', 30, 7, 3, 180, 1],
    ['Encerramento de contas inativas', 'Cadastro', 'Python', 1440, 5, 18, 120, 5],
    ['Liberação de crédito pessoal pré-aprovado', 'Crédito', 'UiPath', 30, 7, 7, 55, 8],
    ['Formalização de cédulas de crédito', 'Crédito', 'UiPath', 60, 8, 16, 30, 15],
    ['Cálculo de provisão para devedores duvidosos', 'Crédito', 'Python', 1440, 4, 35, 1, 240],
    ['Conferência de garantias em imóveis', 'Crédito', 'UiPath', 240, 8, 28, 18, 20],
    ['Custeio agrícola: conferência de laudos', 'Crédito Rural', 'UiPath', 120, 7, 19, 24, 18],
    ['Atualização de índices do Proagro', 'Crédito Rural', 'Python', 1440, 6, 5, 1, 90],
    ['Baixa de parcelas do crédito rural', 'Crédito Rural', 'UiPath', 240, 7, 25, 140, 3],
    ['Lançamentos contábeis de tarifas', 'Contabilidade', 'Python', 1440, 5.5, 12, 3200, 0.2],
    ['Conciliação contábil de contas transitórias', 'Contabilidade', 'UiPath', 1440, 6, 41, 900, 0.5],
    ['Fechamento diário de caixa das agências', 'Contabilidade', 'Python', 1440, 20, 8, 112, 3],
    ['Apuração de impostos retidos (IR e IOF)', 'Contabilidade', 'Python', 1440, 7, 17, 1, 180],
    ['Contratos de câmbio: registro e conferência', 'Câmbio', 'UiPath', 60, 9, 13, 12, 14],
    ['Cotação diária de moedas', 'Câmbio', 'Python', 60, 9, 1, 8, 1],
    ['Emissão de apólices de seguro de vida', 'Seguros', 'UiPath', 120, 8, 15, 45, 7],
    ['Sinistros: abertura de processo', 'Seguros', 'UiPath', 60, 8, 10, 14, 11],
    ['Renovação automática de seguro residencial', 'Seguros', 'Python', 1440, 6, 21, 230, 2],
    ['Contemplações de consórcio: notificação', 'Consórcio', 'Python', 1440, 10, 6, 70, 3],
    ['Lances de consórcio: apuração', 'Consórcio', 'UiPath', 1440, 14, 26, 1, 120],
    ['Aplicações em fundos: conciliação', 'Investimentos', 'Python', 120, 9, 8, 640, 0.6],
    ['Resgates de RDC e LCA programados', 'Investimentos', 'UiPath', 60, 9, 12, 75, 4],
    ['Informe de rendimentos: geração em lote', 'Investimentos', 'Python', 1440, 2, 48, 5200, 0.3],
    ['Contestações de cartão: triagem', 'Cartões', 'UiPath', 60, 8, 9, 38, 7],
    ['Limites de cartão: reavaliação', 'Cartões', 'Python', 1440, 3, 30, 2100, 0.4],
    ['Bloqueio de cartões por suspeita de fraude', 'Cartões', 'Python', 30, 0, 2, 14, 5],
    ['Monitoramento de PLD: alertas atípicos', 'Compliance', 'Python', 120, 7, 18, 90, 6],
    ['Ofícios judiciais: bloqueio de valores', 'Compliance', 'UiPath', 60, 8, 14, 22, 16],
    ['Listas restritivas: checagem de associados', 'Compliance', 'Python', 1440, 4.5, 23, 15000, 0.05],
    ['Folha de pagamento: conferência de rubricas', 'Pessoas', 'UiPath', 1440, 9, 31, 640, 0.8],
    ['Admissões: cadastro no sistema de ponto', 'Pessoas', 'UiPath', 240, 9, 7, 6, 18],
    ['Reembolso de despesas: validação de notas', 'Pessoas', 'Python', 120, 8, 6, 48, 4],
    ['Pix devolvidos: conciliação', 'Operações', 'Python', 30, 0, 2, 120, 1],
    ['Malote digital das agências', 'Operações', 'UiPath', 120, 8, 17, 80, 4],
    ['Arquivos CNAB: recepção e validação', 'Operações', 'Python', 60, 6, 4, 34, 6],
    ['TED agendadas: conferência de saldo', 'Operações', 'UiPath', 60, 7, 11, 95, 2],
    ['Relatório gerencial de produtividade', 'Operações', 'Python', 1440, 7.5, 9, 1, 60],
    ['Backup de evidências das execuções', 'Operações', 'Python', 1440, 1, 27, 1, 30],
  ];

  // Cenário do momento: índices do catálogo e o estado atual forçado.
  const CENARIO = {
    0: 'falha', 9: 'falha', 19: 'falha', 33: 'falha',
    4: 'atrasado', 27: 'atrasado',
    5: 'rodando', 12: 'rodando', 22: 'rodando', 38: 'rodando', 41: 'rodando',
    15: 'ressalva', 29: 'ressalva', 36: 'ressalva',
    25: 'pausado', 31: 'pausado',
  };

  const FALHAS = [
    ['Timeout aguardando o elemento "btnConfirmar" (30 s) na tela de liquidação', 'UiPath.Core.Activities.SelectorNotFoundException'],
    ['Seletor não encontrado: a tela de login do sistema legado mudou de layout', 'UiPath.Core.Activities.SelectorNotFoundException'],
    ['Credencial expirada para o usuário de serviço svc_rpa_cred', 'System.UnauthorizedAccessException'],
    ['Arquivo de entrada não encontrado: \\\\fs01\\cobranca\\retorno_' + ymd(agora) + '.ret', 'FileNotFoundError'],
    ['Conexão recusada pelo banco 10.0.4.21:1433 (3 tentativas)', 'pyodbc.OperationalError'],
    ['Planilha de origem com coluna "Valor Líquido" ausente', 'KeyError'],
  ];
  const RESSALVAS = [
    'itens com dados inconsistentes foram para a fila de tratamento manual',
    'registros sem documento anexo foram separados para revisão',
    'linhas com CPF inválido foram ignoradas',
  ];

  // Prioridade na fila (1 = mais alta), definida por área. No sistema real vem do Orchestrator ou do cadastro.
  const PRIORIDADE_AREA = { Compliance: 1, 'Crédito': 2, 'Cartões': 2, 'Câmbio': 2, 'Cobrança': 3, Cadastro: 3, 'Crédito Rural': 3, 'Operações': 3, Investimentos: 3, Contabilidade: 4, Seguros: 4, 'Consórcio': 4, Pessoas: 5 };

  // As 6 VMs fixas onde os robôs e os scripts rodam. No sistema real a lista vem do cadastro de máquinas do Orchestrator.
  const VMS = ['VM-RPA-01', 'VM-RPA-02', 'VM-RPA-03', 'VM-RPA-04', 'VM-RPA-05', 'VM-RPA-06'];
  // Máquina de origem de cada automação (i % 6), com ajuste para duas que estão rodando não caírem na mesma VM.
  const MAQUINA_FORCADA = { 41: 'VM-RPA-02' };
  const maquinaDe = (i) => MAQUINA_FORCADA[i] || VMS[i % VMS.length];

  // Início de cada período usado nos indicadores: hoje, 7 e 30 dias (sempre a partir da meia-noite).
  function inicioPeriodo(dias) { const d = new Date(agora); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (dias - 1)); return d; }
  const PERIODOS = { hoje: inicioPeriodo(1), '7d': inicioPeriodo(7), '30d': inicioPeriodo(30) };

  function ymd(d) { return d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0'); }

  // Horários de execução dos últimos `dias` dias, do mais recente para o mais antigo.
  function horariosPassados(intervalo, horaIni, dias, limite) {
    const desde = new Date(agora.getTime() - dias * 1440 * MIN);
    const lista = [];
    const base = new Date(limite);
    if (intervalo >= 1440) {
      base.setHours(Math.floor(horaIni), Math.round((horaIni % 1) * 60), 0, 0);
      if (base > limite) base.setDate(base.getDate() - 1);
      while (base > desde) { lista.push(new Date(base)); base.setDate(base.getDate() - 1); }
      return lista;
    }
    // Intradiário: alinha ao intervalo, só entre a hora inicial e 20h.
    const t = new Date(base);
    t.setMinutes(Math.floor(t.getMinutes() / Math.min(intervalo, 60)) * Math.min(intervalo, 60));
    while (t > desde) {
      const h = t.getHours() + t.getMinutes() / 60;
      const dentro = horaIni === 0 ? true : (h >= horaIni && h < 20);
      if (dentro && t <= limite) lista.push(new Date(t));
      t.setTime(t.getTime() - intervalo * MIN);
    }
    return lista;
  }

  function proximoHorario(intervalo, horaIni) {
    const t = new Date(agora);
    if (intervalo >= 1440) {
      t.setHours(Math.floor(horaIni), Math.round((horaIni % 1) * 60), 0, 0);
      if (t <= agora) t.setDate(t.getDate() + 1);
      return t;
    }
    const passo = Math.min(intervalo, 60);
    t.setMinutes(Math.floor(t.getMinutes() / passo) * passo);
    do { t.setTime(t.getTime() + intervalo * MIN); }
    while (horaIni !== 0 && (t.getHours() < horaIni || t.getHours() >= 20));
    return t;
  }

  function descreveAgenda(intervalo, horaIni) {
    const hh = String(Math.floor(horaIni)).padStart(2, '0') + ':' + String(Math.round((horaIni % 1) * 60)).padStart(2, '0');
    if (intervalo >= 1440) return 'Todo dia às ' + hh;
    const janela = horaIni === 0 ? '24 horas' : 'das ' + hh + ' às 20:00';
    if (intervalo < 60) return 'A cada ' + intervalo + ' min, ' + janela;
    return 'A cada ' + (intervalo / 60) + ' h, ' + janela;
  }

  const automacoes = [];
  const execucoesPorAutomacao = {};
  let seqExec = 90000;

  CATALOGO.forEach((c, i) => {
    const [nome, area, tecnologia, intervalo, horaIni, durMed, itensMed, minItem] = c;
    const id = 'A' + String(i + 1).padStart(3, '0');
    const estadoForcado = CENARIO[i] || 'ok';
    // Só entram horários cuja execução já teria terminado; a que está rodando é ajustada pelo cenário.
    const limite = new Date(agora.getTime() - (durMed * 1.6 + 1) * MIN);
    const horarios = horariosPassados(intervalo, horaIni, 30, limite);
    const taxaFalhaBase = [0, 9, 19, 33].includes(i) ? 0.07 : (i % 7 === 3 ? 0.035 : 0.01);
    const execs = horarios.map((inicio, k) => {
      let status = 'sucesso';
      const r = rnd();
      if (r < taxaFalhaBase) status = 'falha';
      else if (r < taxaFalhaBase + 0.05) status = 'ressalva';
      const dur = Math.max(0.5, durMed * entre(0.75, 1.3)) * (status === 'falha' ? entre(0.3, 1.6) : 1);
      const itens = Math.max(itensMed > 1 ? 0 : 1, Math.round(itensMed * entre(0.6, 1.35)));
      const erroItens = status === 'ressalva' ? Math.max(1, Math.round(itens * entre(0.02, 0.09))) : 0;
      seqExec += 1;
      const ex = {
        id: 'E' + seqExec,
        automacao_id: id,
        maquina: maquinaDe(i),
        inicio: inicio.toISOString(),
        fim: new Date(inicio.getTime() + dur * MIN).toISOString(),
        duracao_s: Math.round(dur * 60),
        status,
        itens_ok: status === 'falha' ? Math.round(itens * entre(0, 0.5)) : itens - erroItens,
        itens_erro: erroItens,
        mensagem: '',
        erro_tipo: '',
      };
      if (status === 'falha') { const f = escolhe(FALHAS); ex.mensagem = f[0]; ex.erro_tipo = f[1]; }
      if (status === 'ressalva') ex.mensagem = erroItens + ' ' + escolhe(RESSALVAS);
      return ex;
    });

    // Ajusta a execução mais recente ao cenário.
    const ult = execs[0];
    if (estadoForcado === 'falha') {
      const f = FALHAS[[0, 9, 19, 33].indexOf(i) % FALHAS.length];
      ult.status = 'falha'; ult.mensagem = f[0]; ult.erro_tipo = f[1]; ult.itens_erro = 0;
      ult.itens_ok = Math.round(itensMed * 0.3);
      if (i === 9) { execs[1].status = 'falha'; execs[1].mensagem = f[0]; execs[1].erro_tipo = f[1]; execs[2].status = 'falha'; execs[2].mensagem = f[0]; execs[2].erro_tipo = f[1]; }
    } else if (estadoForcado === 'ressalva') {
      ult.status = 'ressalva'; ult.itens_erro = Math.max(2, Math.round(itensMed * 0.06)); ult.itens_ok = itensMed - ult.itens_erro;
      ult.mensagem = ult.itens_erro + ' ' + RESSALVAS[i % RESSALVAS.length];
    } else if (estadoForcado === 'rodando') {
      const inicio = new Date(agora.getTime() - (i === 22 ? durMed * 4.1 : durMed * entre(0.2, 0.8)) * MIN);
      ult.inicio = inicio.toISOString(); ult.fim = null; ult.duracao_s = Math.round((agora - inicio) / 1000);
      ult.status = 'rodando'; ult.itens_ok = Math.round(itensMed * 0.4); ult.itens_erro = 0; ult.mensagem = '';
    } else if (estadoForcado === 'atrasado') {
      // As duas últimas execuções previstas não aconteceram: o robô está sem sinal há mais de um ciclo.
      execs.splice(0, 2);
    } else if (ult.status !== 'sucesso') {
      ult.status = 'sucesso'; ult.mensagem = ''; ult.itens_erro = 0;
    }

    // Automação pausada não roda desde a pausa (dois dias atrás, no cenário).
    if (estadoForcado === 'pausado') {
      const pausa = agora.getTime() - 2 * 1440 * MIN;
      while (execs.length > 1 && new Date(execs[0].inicio).getTime() > pausa) execs.shift();
      if (execs[0].status !== 'sucesso') { execs[0].status = 'sucesso'; execs[0].mensagem = ''; execs[0].itens_erro = 0; }
    }

    const ultima = execs[0];
    let esperadoEm = null;
    if (estadoForcado === 'atrasado') esperadoEm = horarios[1];

    // Execuções previstas pela agenda em cada período (o servidor calcula a partir da agenda cadastrada).
    // Pausada não conta como prevista depois da pausa.
    const pausaEm = estadoForcado === 'pausado' ? agora.getTime() - 2 * 1440 * MIN : Infinity;
    const previstas = {};
    Object.entries(PERIODOS).forEach(([k, ini]) => { previstas[k] = horarios.filter((h) => h >= ini && h.getTime() < pausaEm).length; });

    const ultimas30d = execs.filter((e) => e.status !== 'rodando');
    const sucesso = ultimas30d.filter((e) => e.status === 'sucesso').length;
    const ressalvas = ultimas30d.filter((e) => e.status === 'ressalva').length;

    automacoes.push({
      id, nome, area, tecnologia,
      maquina: maquinaDe(i),
      responsavel: RESP[i % RESP.length],
      agenda: descreveAgenda(intervalo, horaIni),
      intervalo_min: intervalo,
      proxima_execucao: estadoForcado === 'pausado' ? null : proximoHorario(intervalo, horaIni).toISOString(),
      duracao_media_s: Math.round(durMed * 60),
      minutos_poupados_por_item: minItem,
      estado: estadoForcado,
      prioridade: PRIORIDADE_AREA[area] || 3,
      previstas,
      esperado_em: esperadoEm ? esperadoEm.toISOString() : null,
      pausada_por: estadoForcado === 'pausado' ? (i === 25 ? 'Diego S.: aguardando mudança no portal da administradora' : 'Juliana B.: substituída pela nova versão (A033)') : null,
      ultima_execucao: ultima,
      taxa_sucesso: ultimas30d.length ? (sucesso + ressalvas) / ultimas30d.length : 1,
      taxa_sucesso_limpa: ultimas30d.length ? sucesso / ultimas30d.length : 1,
    });
    execucoesPorAutomacao[id] = execs;
  });

  // Alertas derivados do estado.
  const alertas = [];
  automacoes.forEach((a) => {
    const u = a.ultima_execucao;
    if (a.estado === 'falha') {
      const seguidas = execucoesPorAutomacao[a.id].findIndex((e) => e.status !== 'falha');
      alertas.push({ id: 'AL-' + a.id, automacao_id: a.id, tipo: 'falha', gravidade: 1, desde: u.fim || u.inicio,
        titulo: seguidas > 1 ? 'Falhou ' + seguidas + ' vezes seguidas' : 'Falhou na última execução', mensagem: u.mensagem });
    }
    if (a.estado === 'atrasado') {
      alertas.push({ id: 'AL-' + a.id, automacao_id: a.id, tipo: 'atraso', gravidade: 2, desde: a.esperado_em,
        titulo: 'Não iniciou no horário', mensagem: 'Era esperada às ' + new Date(a.esperado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + ' e não deu sinal no log nem no banco.' });
    }
    if (a.estado === 'rodando' && u.duracao_s > a.duracao_media_s * 2.5) {
      alertas.push({ id: 'AL-D' + a.id, automacao_id: a.id, tipo: 'duracao', gravidade: 3, desde: u.inicio,
        titulo: 'Rodando bem acima do normal', mensagem: 'Normalmente leva ' + Math.round(a.duracao_media_s / 60) + ' min.' });
    }
    if (a.estado === 'ressalva') {
      alertas.push({ id: 'AL-' + a.id, automacao_id: a.id, tipo: 'ressalva', gravidade: 4, desde: u.fim,
        titulo: 'Concluiu com itens para tratar', mensagem: u.mensagem });
    }
  });
  // Um alerta já reconhecido, para mostrar o estado.
  const rec = alertas.find((x) => x.automacao_id === 'A034');
  if (rec) { rec.reconhecido_por = 'Fernanda T.'; rec.reconhecido_em = new Date(agora.getTime() - 9 * MIN).toISOString(); rec.nota = 'Abrindo chamado com o jurídico, o modelo do ofício mudou.'; }

  // Log de uma execução, gerado sob demanda (a API real vai ler o arquivo de log ou o banco).
  function logDaExecucao(execId) {
    let ex = null; let a = null;
    for (const id in execucoesPorAutomacao) {
      const e = execucoesPorAutomacao[id].find((x) => x.id === execId);
      if (e) { ex = e; a = automacoes.find((x) => x.id === id); break; }
    }
    if (!ex) return [];
    const t0 = new Date(ex.inicio).getTime();
    const dur = ex.duracao_s * 1000;
    const linhas = [];
    const L = (frac, nivel, msg) => linhas.push({ hora: new Date(t0 + dur * frac).toISOString(), nivel, msg });
    const py = a.tecnologia === 'Python';
    L(0, 'INFO', py ? 'Iniciando ' + a.id.toLowerCase() + '_main.py (Python 3.12) em ' + a.maquina : 'Robô ' + a.maquina + ' iniciou o processo "' + a.nome + '" (pacote v2.' + (Number(a.id.slice(1)) % 9) + '.0)');
    L(0.01, 'INFO', 'Carregando configuração e credenciais do cofre');
    L(0.04, 'INFO', py ? 'Conectando ao banco de origem' : 'Abrindo aplicação e autenticando com o usuário de serviço');
    L(0.08, 'INFO', 'Lendo entrada: ' + (ex.itens_ok + ex.itens_erro || 'n') + ' itens na fila');
    const total = ex.itens_ok + ex.itens_erro;
    if (ex.status === 'falha') {
      L(0.3, 'INFO', 'Processados ' + ex.itens_ok + ' itens');
      L(0.32, 'WARN', 'Nova tentativa (1/3) após erro transitório');
      L(0.34, 'WARN', 'Nova tentativa (2/3) após erro transitório');
      L(0.36, 'ERROR', ex.mensagem);
      L(0.36, 'ERROR', ex.erro_tipo + ' em ' + (py ? 'etapas/processa.py, linha 148' : 'Main.xaml › Processar item › Confirmar'));
      L(0.37, 'INFO', 'Evidência salva: \\\\fs01\\rpa\\evidencias\\' + ex.id + '.png');
      L(0.38, 'INFO', 'Execução encerrada com erro');
    } else {
      const passos = Math.min(5, Math.max(1, total));
      for (let k = 1; k <= passos; k++) L(0.1 + 0.8 * (k / passos), 'INFO', 'Processados ' + Math.round(total * k / passos) + ' de ' + total + ' itens');
      if (ex.status === 'ressalva') {
        L(0.5, 'WARN', ex.itens_erro + ' itens com exceção de negócio enviados para tratamento manual');
        L(0.92, 'WARN', 'Relatório de exceções gerado: excecoes_' + ex.id + '.xlsx');
      }
      if (ex.status === 'rodando') { linhas.splice(-2); L(1, 'INFO', 'Processando item ' + ex.itens_ok + '…'); }
      else L(1, 'INFO', 'Execução concluída: ' + ex.itens_ok + ' itens OK, ' + ex.itens_erro + ' com exceção');
    }
    return linhas;
  }

  // Etapa atual de quem está rodando (o robô informa no log; nos scripts Python, a última linha de etapa).
  const ETAPAS = ['Lendo a fila de entrada', 'Conferindo documentos', 'Lançando no sistema', 'Validando retorno do sistema', 'Gerando evidências'];
  automacoes.filter((a) => a.estado === 'rodando').forEach((a, k) => {
    const u = a.ultima_execucao;
    const itensMed = CATALOGO[Number(a.id.slice(1)) - 1][6];
    u.etapa = ETAPAS[k % ETAPAS.length];
    u.itens_previstos = Math.max(u.itens_ok + 1, itensMed);
  });

  // Fila: execuções que ainda não começaram. "aguardando" já foi disparada e espera um robô livre;
  // "agendada" é a próxima da agenda. Numeração segue a das execuções, como no Orchestrator.
  const fila = [];
  const AGUARDANDO = [
    { idx: 8, min: 3, origem: 'gatilho', por: 'arquivo de propostas chegou no \\\\fs01\\credito' },
    { idx: 34, min: 7, origem: 'manual', por: 'Bruno K.', prioridade: 1 },
    { idx: 2, min: 12, origem: 'gatilho', por: 'lote de boletos vencidos liberado' },
    { idx: 23, min: 1, origem: 'manual', por: 'Gustavo L.' },
  ];
  AGUARDANDO.forEach((x) => {
    const a = automacoes[x.idx];
    fila.push({ automacao_id: a.id, situacao: 'aguardando', prioridade: x.prioridade || a.prioridade, entrou_em: new Date(agora.getTime() - x.min * MIN).toISOString(), previsto_para: null, origem: x.origem, disparada_por: x.por });
  });
  automacoes
    .filter((a) => a.proxima_execucao && a.estado !== 'rodando')
    .sort((x, y) => new Date(x.proxima_execucao) - new Date(y.proxima_execucao))
    .slice(0, 16)
    .forEach((a) => fila.push({ automacao_id: a.id, situacao: 'agendada', prioridade: a.prioridade, entrou_em: null, previsto_para: a.proxima_execucao, origem: 'agenda', disparada_por: null }));
  fila.forEach((f, k) => { f.id = 'E' + (seqExec + 1 + k); });

  fila.forEach((f) => { f.comentarios = []; f.historico = []; });

  // VMs: cada uma diz o que está rodando nela agora (execucao_id) ou desde quando está livre.
  const porId = Object.fromEntries(automacoes.map((a) => [a.id, a]));
  const vms = VMS.map((id) => {
    const a = automacoes.find((x) => x.estado === 'rodando' && x.maquina === id);
    const fins = Object.values(execucoesPorAutomacao).flat().filter((e) => e.maquina === id && e.fim).map((e) => new Date(e.fim).getTime());
    return {
      id,
      situacao: a ? 'ocupada' : 'livre',
      automacao_id: a ? a.id : null,
      execucao_id: a ? a.ultima_execucao.id : null,
      livre_desde: a ? null : new Date(Math.max(agora.getTime() - 6 * MIN, ...fins.filter((t) => t <= agora.getTime()))).toISOString(),
    };
  });

  // ----- Daqui para baixo é o que o SERVIDOR faz. No protótipo roda no navegador para a tela ter movimento. -----

  // Põe uma execução da fila para rodar numa VM livre.
  function iniciarNaVM(f, vm) {
    const a = porId[f.automacao_id];
    const itensMed = CATALOGO[Number(a.id.slice(1)) - 1][6];
    const ex = {
      id: f.id, automacao_id: a.id, maquina: vm.id, inicio: new Date().toISOString(), fim: null, duracao_s: 0, status: 'rodando',
      itens_ok: 0, itens_erro: 0, mensagem: '', erro_tipo: '', etapa: ETAPAS[0], itens_previstos: Math.max(1, itensMed), origem: f.origem, disparada_por: f.disparada_por,
    };
    execucoesPorAutomacao[a.id].unshift(ex);
    a.ultima_execucao = ex; a.estado = 'rodando'; a.maquina = vm.id;
    vm.situacao = 'ocupada'; vm.automacao_id = a.id; vm.execucao_id = ex.id; vm.livre_desde = null;
    fila.splice(fila.indexOf(f), 1);
  }

  const proximaDaFila = () => fila.filter((f) => f.situacao === 'aguardando' && !f.ignorada)
    .sort((x, y) => (y.atender_agora ? 1 : 0) - (x.atender_agora ? 1 : 0) || x.prioridade - y.prioridade || new Date(x.entrou_em) - new Date(y.entrou_em))[0];

  // Um ciclo de coleta: o que estava rodando anda, o que terminou libera a VM, a VM livre pega o próximo da fila
  // e o que estava agendado e chegou a hora passa para "aguardando robô".
  function tique() {
    const t = Date.now();
    fila.forEach((f) => { if (f.situacao === 'agendada' && new Date(f.previsto_para).getTime() <= t) { f.situacao = 'aguardando'; f.entrou_em = f.previsto_para; } });
    vms.forEach((vm) => {
      if (vm.situacao !== 'ocupada') return;
      const a = porId[vm.automacao_id]; const ex = a.ultima_execucao;
      ex.duracao_s = Math.round((t - new Date(ex.inicio).getTime()) / 1000);
      if (ex.duracao_s > a.duracao_media_s * 2.5) return; // travada: é justamente o caso do alerta de duração
      const frac = ex.duracao_s / a.duracao_media_s;
      ex.itens_ok = Math.max(ex.itens_ok, Math.min(ex.itens_previstos, Math.floor(frac * ex.itens_previstos)));
      ex.etapa = ETAPAS[Math.min(ETAPAS.length - 1, Math.floor(frac * ETAPAS.length))];
      if (frac < 1) return;
      ex.status = 'sucesso'; ex.fim = new Date(t).toISOString(); ex.itens_ok = ex.itens_previstos; delete ex.etapa;
      a.estado = 'ok';
      for (let k = alertas.length - 1; k >= 0; k--) if (alertas[k].automacao_id === a.id) alertas.splice(k, 1); // deu certo: alerta resolvido
      vm.situacao = 'livre'; vm.automacao_id = null; vm.execucao_id = null; vm.livre_desde = ex.fim;
    });
    vms.forEach((vm) => { if (vm.situacao !== 'livre') return; const f = proximaDaFila(); if (f) iniciarNaVM(f, vm); });
  }

  // Ações do time sobre uma execução que espera robô. No sistema real: POST /api/fila/{id}/acao,
  // com o servidor conferindo a permissão e gravando quem fez, quando e o quê (auditoria).
  function acaoNaFila(id, acao, dados, por) {
    const f = fila.find((x) => x.id === id);
    if (!f) return { ok: false, erro: 'Essa execução já saiu da fila.' };
    if (f.situacao !== 'aguardando' && acao !== 'desfazer-ignorar' && acao !== 'comentar') return { ok: false, erro: 'Só dá para agir em quem está aguardando robô.' };
    const em = new Date().toISOString();
    let msg = '';
    if (acao === 'assumir') { f.assumida_por = f.assumida_por ? null : por; msg = f.assumida_por ? 'Você assumiu ' + numeroDe(f) : 'Você soltou ' + numeroDe(f); }
    else if (acao === 'ignorar') { f.ignorada = { por, em }; msg = numeroDe(f) + ' ignorada: não vai para nenhuma VM'; }
    else if (acao === 'desfazer-ignorar') { f.ignorada = null; msg = numeroDe(f) + ' voltou para a fila'; }
    else if (acao === 'atender') {
      const vm = vms.find((v) => v.situacao === 'livre');
      if (vm) { f.historico.push({ acao, por, em }); iniciarNaVM(f, vm); return { ok: true, msg: numeroDe(f) + ' começou na ' + vm.id }; }
      f.atender_agora = true; msg = 'Nenhuma VM livre: ' + numeroDe(f) + ' é a próxima a rodar';
    } else if (acao === 'agendar') {
      const quando = new Date(dados && dados.quando);
      if (isNaN(quando) || quando.getTime() <= Date.now()) return { ok: false, erro: 'Escolha um horário daqui para a frente.' };
      f.situacao = 'agendada'; f.previsto_para = quando.toISOString(); f.entrou_em = null; f.origem = 'manual'; f.disparada_por = por; f.atender_agora = false;
      msg = numeroDe(f) + ' agendada para ' + quando.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    } else if (acao === 'comentar') {
      const texto = String((dados && dados.texto) || '').trim().slice(0, 500);
      if (!texto) return { ok: false, erro: 'Escreva o comentário.' };
      f.comentarios.push({ por, em, texto }); msg = 'Comentário salvo';
    } else return { ok: false, erro: 'Ação desconhecida.' };
    f.historico.push({ acao, por, em });
    return { ok: true, msg };
  }
  function numeroDe(f) { return '#' + f.id.slice(1); }

  window.DADOS_DEMO = {
    gerado_em: agora.toISOString(),
    automacoes,
    execucoes: execucoesPorAutomacao,
    alertas,
    fila,
    vms,
    logDaExecucao,
    // Só do protótipo (o servidor faz):
    tique,
    acaoNaFila,
  };
})();
