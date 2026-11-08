# Monitor de Automações

Painel para acompanhar as automações do Sicredi, tanto os robôs UiPath quanto os scripts Python, num lugar só. Ele mostra:

- o que está rodando agora, em qual máquina e em que etapa;
- o que falhou, atrasou ou terminou com itens para tratar;
- a fila de execuções, com o que espera robô livre e o que vem na agenda;
- o histórico e o log de cada execução;
- alertas e indicadores (taxa de sucesso, tempo médio, itens processados, horas poupadas);
- um modo TV para a tela da sala do time.

O monitor só **lê**: logs e banco. Ele não liga, para nem altera nenhum robô.

> **Fase atual: protótipo de layout.** As telas funcionam, mas com **dados fictícios** (44 automações e 30 dias de histórico, gerados no navegador). Ainda não há servidor nem leitura dos dados reais.

## Dependências

- **Python 3**, só para servir os arquivos. Qualquer servidor de arquivos estáticos serve.
- **Um navegador atual**: Chrome ou Edge 111+, Firefox 113+, Safari 16.4+.

Não tem `npm`, framework nem build: é HTML, CSS e JavaScript puro. As fontes da marca (Exo 2 e Nunito) estão no próprio projeto, então funciona sem internet.

## Como iniciar

```bash
cd web
python3 -m http.server 8001
```

Depois abra no navegador:

- `http://localhost:8001/prototipos/`: página de comparação de todas as versões
- `http://localhost:8001/prototipos/v6-fila-e-execucao/`: versão atual
- Acrescente `#/tv` no fim do endereço de qualquer versão para abrir o modo TV.

Para outras pessoas da rede acessarem, troque `localhost` pelo nome ou IP da máquina. Abrir o `index.html` direto do disco, sem servidor, pode impedir o carregamento das fontes.

## Estrutura

```
web/
  assets/fontes/               fontes da marca, servidas localmente
  prototipos/
    index.html                 comparação das versões, com prints
    compartilhado/
      dados-demo.js            dados fictícios (o formato deles é o contrato da futura API)
      monitor.js               telas, rotas e interações
      base.css                 estrutura, estados e responsivo
    v1-… a v6-…/               cada versão: index.html (configuração) + tema.css (visual)
    capturas/                  prints usados na página de comparação
```

## Como chegamos nas 6 versões

1. **Marca primeiro.** O ponto de partida foi o manual da marca Sicredi (marca.sicredi.com.br): Verde Sicredi e verde-escuro, Exo 2 e Nunito, o box com um canto reto e as cores de apoio só como coadjuvantes.
2. **Cinco versões numa escala de aderência ao manual.** Todas têm as mesmas funções e os mesmos dados. Muda o quanto da marca aparece e como a tela se organiza:
   - **V1 · Manual 100%**: fundo branco, box verde em degradê, cartões por área.
   - **V2 · Manual digital**: menu lateral verde-escuro, cantos retos, tabela.
   - **V3 · Equilíbrio**: lista à esquerda e detalhe sempre aberto à direita.
   - **V4 · Sala de operação**: tema escuro em mural, em que o que tem problema "acende".
   - **V5 · Limite mínimo**: Calibri/Arial, tabela densa, marca só no obrigatório.
3. **Retorno do time.** O time gostou do visual da V1 e da V4, mas não da distribuição das informações, e mandou um rascunho próprio: fila de execuções à esquerda, contadores no topo e, à direita, um cartão por execução (automação e número, etapa, início e duração, máquina).
4. **V6 · Fila e execução.** É o rascunho do time implementado. Usa o visual da V1 no tema claro e o da V4 no tema escuro, trocados por um botão no topo; cada pessoa fica com a sua escolha. É a versão candidata. As outras ficam para comparação até a escolha final.

## Próximos passos

- Validar a V6 com o time e apagar as versões descartadas.
- Servidor na porta 8001:
  - ler o banco do UiPath Orchestrator e os logs dos scripts Python;
  - aplicar no servidor as regras de alerta: falha, atraso em relação à agenda, duração muito acima do normal e itens enviados para tratamento manual;
  - entregar os dados no mesmo formato de `dados-demo.js`.
- Colocar o logo oficial (versões positiva e negativa) em `web/assets/marca/`. Os protótipos têm um espaço reservado, porque o manual proíbe redesenhar o logo.
