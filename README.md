# Monitor de Automações

Painel para acompanhar as automações do Sicredi, tanto os robôs UiPath quanto os scripts Python, num lugar só. Ele mostra:

- o que está rodando agora, em qual máquina e em que etapa;
- o que falhou, atrasou ou terminou com itens para tratar;
- a fila de execuções, com o que espera robô livre e o que vem na agenda;
- o histórico e o log de cada execução;
- alertas e indicadores (taxa de sucesso, tempo médio, itens processados, horas poupadas);
- um modo TV para a tela da sala do time.

O monitor observa logs e banco. A única coisa em que ele age é a fila, e só quando alguém escolhe uma ação (assumir, ignorar, atender agora, agendar, comentar).

> **Fase atual: telas prontas para validar, com dados de demonstração.** Funcionam com **dados fictícios** (44 automações e 30 dias de histórico, gerados no navegador). Ainda não há servidor nem leitura dos dados reais.

## Dependências

- **Python 3**, só para servir os arquivos. Qualquer servidor de arquivos estáticos serve.
- **Um navegador atual**: Chrome ou Edge 111+, Firefox 113+, Safari 16.4+.

Não tem `npm`, framework nem build: é HTML, CSS e JavaScript puro. As fontes da marca (Exo 2 e Nunito) estão no próprio projeto, então funciona sem internet.

## Como iniciar

```bash
cd web
python3 -m http.server 8001
```

Depois abra `http://localhost:8001/`. Acrescente `#/tv` no fim do endereço para o modo TV.

Para outras pessoas da rede acessarem, troque `localhost` pelo nome ou IP da máquina. Abrir o `index.html` direto do disco, sem servidor, pode impedir o carregamento das fontes.

## O que tem na tela

- **Painel**: Fila (com ações em quem aguarda robô) | Agora (as 6 VMs e o que roda em cada uma) | Necessária ação manual (com o Reconhecer e o atalho para o log completo). No pé, as últimas finalizadas.
- **Automações**: lista e detalhe, com o histórico de execuções; cada execução abre com todos os dados e o log.
- **Indicadores**: gráficos e resumos executivos (operação do dia, semana para a gestão, por área, conferência previsto × realizado, falhas e tratativas), para copiar ou imprimir.
- **Modo TV**: o painel em tela cheia, para ler de longe.
- Tema claro (manual da marca) e escuro (sala de operação), trocados no botão de sol/lua.

## Estrutura

```
web/
  index.html          a página do monitor
  css/base.css        estrutura, estados e responsivo
  css/tema.css        temas claro e escuro
  js/monitor.js       telas, rotas e interações
  js/dados-demo.js    dados fictícios (o formato deles é o contrato da futura API)
                      e a simulação do que o servidor vai fazer (VMs andando, ações na fila)
  assets/fontes/      fontes da marca, servidas localmente
arquivo/
  prototipos-de-layout/   as 6 versões de layout que levaram ao desenho atual (só histórico)
```

## Como chegamos aqui

Foram feitas 6 versões de layout, da que segue o manual da marca à risca até a que usa só o mínimo. O time gostou do visual da V1 (claro) e da V4 (escuro), mas não da organização, e mandou um rascunho próprio, que virou a V6. Em 15/11/2026 a V6 foi escolhida como base e virou o monitor. As versões antigas estão em `arquivo/prototipos-de-layout/`.

## Próximos passos

- Servidor na porta 8001:
  - ler o banco do UiPath Orchestrator e os logs dos scripts Python;
  - aplicar no servidor as regras de alerta: falha, atraso em relação à agenda, duração muito acima do normal e itens enviados para tratamento manual;
  - receber as ações da fila com login e registro de quem fez;
  - entregar os dados no mesmo formato de `dados-demo.js`.
- Colocar o logo oficial (versões positiva e negativa) em `web/assets/marca/`.
