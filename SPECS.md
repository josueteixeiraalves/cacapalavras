# Documento de Projeto Técnico
## Palaviva — Jogo Diário de Adivinhação de Palavras

**Versão:** 1.0  
**Data:** 20 de outubro de 2026  
**Status:** Especificação técnica para implementação do MVP  
**Plataforma:** Web responsiva, mobile-first  
**Público-alvo:** Crianças e jovens, aproximadamente de 8 a 18 anos  
**Modelo de negócio:** Gratuito, sem anúncios ou monetização no MVP

---

# 1. Resumo executivo

O Palaviva é um jogo casual de adivinhação de palavras que oferece um desafio diário baseado em uma categoria temática. O jogador dispõe de até seis tentativas para descobrir uma palavra secreta, recebendo feedback visual e textual sobre cada letra.

O projeto será desenvolvido a partir da identidade visual Fresh Play, combinando cores acolhedoras, elementos gráficos amigáveis e uma mecânica de jogo simples, inspirada em interfaces minimalistas de adivinhação de palavras.

A implementação deverá priorizar:

- Carregamento rápido e boa experiência em dispositivos móveis.
- Uma partida diária compartilhada por todos os jogadores.
- Feedback imediato e compreensível.
- Persistência de progresso sem exigir cadastro.
- Acessibilidade por teclado, leitores de tela e dispositivos com telas pequenas.
- Arquitetura modular, preparada para futuras expansões.

## 1.1 Decisões fundamentais

| Área | Decisão |
|---|---|
| Interface | Fresh Play |
| Tecnologia de interface | React + TypeScript + Vite |
| Estilização | CSS modular e variáveis de design |
| Backend | API serverless para servir o desafio diário |
| Banco de dados | PostgreSQL gerenciado, quando necessário |
| Persistência local | localStorage |
| Autenticação | Não obrigatória |
| Validação de palavras | Lista permitida e validação no servidor |
| Compartilhamento | Web Share API e alternativa de copiar |
| Acessibilidade | WCAG 2.2 nível AA como referência |
| Hospedagem | Plataforma estática com suporte a funções serverless |

A arquitetura proposta mantém a interface simples, mas evita depender exclusivamente do navegador para informações que precisam ser protegidas, como a resposta secreta do dia.

# 2. Objetivos e limites do MVP

## 2.1 Objetivos funcionais

O MVP deverá permitir que o jogador:

1. Acesse a tela inicial.
2. Consulte o tema e as regras.
3. Inicie o desafio diário.
4. Digite palavras por teclado físico ou virtual.
5. Receba feedback por letra.
6. Ganhe ao descobrir a palavra ou encerre a partida após seis erros.
7. Consulte o resultado.
8. Visualize estatísticas básicas.
9. Compartilhe o resultado sem revelar a resposta.
10. Retorne em outro dia para continuar sua sequência.

## 2.2 Fora do escopo inicial

Não serão implementados nesta versão:

- Ranking global.
- Partidas simultâneas ou multiplayer.
- Cadastro obrigatório.
- Loja, compras ou assinaturas.
- Sistema avançado de avatares.
- Economia de moedas, XP ou recompensas complexas.
- Personalização avançada de dificuldade.
- Aplicativos nativos para Android ou iOS.

Esses itens poderão ser considerados em versões futuras após a avaliação do uso real do jogo.

# 3. Identidade visual e sistema de design

## 3.1 Direção visual escolhida

A identidade principal será a do Fresh Play, com o tabuleiro organizado e objetivo do Wordle Focus.

O resultado deverá transmitir diversão e aprendizagem sem exagerar na quantidade de elementos decorativos.

### Paleta inicial

| Elemento | Cor sugerida | Aplicação |
|---|---|---|
| Fundo | `#F2F8FF` | Fundo geral |
| Texto principal | `#182B49` | Títulos e conteúdo |
| Azul principal | `#315CE7` | Botões e elementos ativos |
| Verde | `#25865B` | Letra correta e na posição correta |
| Amarelo | `#F2C94C` | Letra presente em outra posição |
| Cinza-azulado | `#67758B` | Letra ausente |
| Azul claro | `#DDE8FF` | Etiquetas e superfícies secundárias |
| Branco | `#FFFFFF` | Cartões e áreas de conteúdo |

As cores deverão passar por verificação de contraste antes da implementação final. A paleta acima é uma proposta inicial, não uma certificação de acessibilidade.

## 3.2 Tipografia

Recomenda-se utilizar uma fonte sem serifa, como Inter ou uma fonte de sistema equivalente.

Hierarquia sugerida:

- Título do jogo: 28–32 px em telas maiores; 24–28 px em telas pequenas.
- Títulos de seção: 20–24 px.
- Texto principal: 16 px.
- Instruções auxiliares: preferencialmente 14–16 px.
- Letras do tabuleiro: 20–28 px, conforme a largura disponível.
- Botões: texto de 16 px, com peso visual suficiente.

A interface não deverá depender de fontes externas para funcionar. Caso uma fonte remota seja utilizada, deverá existir uma alternativa local adequada.

## 3.3 Componentes reutilizáveis

Os componentes deverão ser implementados de maneira independente para facilitar manutenção e testes.

| Componente | Responsabilidade |
|---|---|
| `AppHeader` | Logotipo, acesso às estatísticas e instruções |
| `DailyChallengeCard` | Tema e apresentação do desafio |
| `GameBoard` | Organização das seis tentativas |
| `GuessRow` | Representação de uma tentativa |
| `LetterTile` | Exibição de uma letra e seu estado |
| `VirtualKeyboard` | Entrada por teclado na tela |
| `GameFeedback` | Mensagens de validação e resultado |
| `ResultDialog` | Resultado final da partida |
| `StatsPanel` | Estatísticas pessoais |
| `ShareResultButton` | Compartilhamento do resultado |
| `HowToPlayDialog` | Instruções breves |
| `DailyCountdown` | Tempo restante até o próximo desafio |

Os componentes deverão receber dados por propriedades e evitar armazenar regras do jogo diretamente dentro dos elementos visuais.

# 4. Arquitetura técnica

## 4.1 Visão geral

A arquitetura será dividida em quatro camadas principais:

1. **Interface:** telas, componentes, estilos e acessibilidade.
2. **Lógica de domínio:** regras, tentativas, feedback e encerramento.
3. **Persistência:** progresso local, estatísticas e histórico.
4. **Serviços:** desafio diário, validação e armazenamento centralizado quando necessário.

Fluxo lógico:

```text
Jogador
   |
   v
Interface React
   |
   v
Estado da partida
   |
   +------> Motor de regras
   |             |
   |             v
   |       Feedback por letra
   |
   +------> Persistência local
   |             |
   |             v
   |       Histórico e estatísticas
   |
   +------> API do desafio diário
                 |
                 v
          Banco de palavras
```

O navegador será responsável pela apresentação e pela interação. O servidor será responsável por fornecer o desafio oficial e validar as tentativas quando houver comunicação com o backend.

## 4.2 Tecnologias recomendadas

### Frontend

**React:** construção da interface a partir de componentes reutilizáveis.

**TypeScript:** identificação antecipada de erros relacionados a tipos, estados e estruturas de dados.

**Vite:** desenvolvimento local e geração da versão de produção.

**CSS:** implementação do sistema visual, dos estados do tabuleiro e do layout responsivo.

**Vitest e Testing Library:** testes unitários e testes de componentes.

### Backend

Recomenda-se uma função serverless com uma API HTTP para disponibilizar o desafio diário e validar tentativas.

Uma opção de implementação é utilizar funções serverless da plataforma de hospedagem e PostgreSQL gerenciado, como Supabase, se for necessário manter dados centralizados.

O backend não deverá retornar a palavra secreta antes do encerramento da partida.

### Ferramentas complementares

- Playwright para testes de navegação de ponta a ponta.
- Lighthouse para avaliação de desempenho e acessibilidade.
- axe-core para auxiliar na identificação de problemas de acessibilidade.
- Git para versionamento do código.
- CI para executar testes antes da publicação.

# 5. Estrutura de diretórios

Uma organização sugerida para o projeto:

```text
palaviva/
├── public/
│   ├── favicon.svg
│   └── manifest.webmanifest
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   └── routes.tsx
│   ├── components/
│   │   ├── AppHeader.tsx
│   │   ├── GameBoard.tsx
│   │   ├── GuessRow.tsx
│   │   ├── LetterTile.tsx
│   │   ├── VirtualKeyboard.tsx
│   │   ├── ResultDialog.tsx
│   │   └── StatsPanel.tsx
│   ├── features/
│   │   └── game/
│   │       ├── game-engine.ts
│   │       ├── game-state.ts
│   │       ├── game-types.ts
│   │       ├── normalization.ts
│   │       └── validation.ts
│   ├── services/
│   │   ├── daily-challenge.ts
│   │   ├── storage.ts
│   │   └── sharing.ts
│   ├── hooks/
│   │   └── useGame.ts
│   ├── styles/
│   │   ├── tokens.css
│   │   ├── global.css
│   │   └── game.css
│   ├── test/
│   └── main.tsx
├── api/
│   └── daily-challenge.ts
├── tests/
│   ├── game-engine.test.ts
│   └── game-flow.spec.ts
├── package.json
├── tsconfig.json
└── vite.config.ts
```

A estrutura poderá variar conforme a plataforma de hospedagem escolhida. O diretório de API representa uma função serverless conceitual, e não uma convenção universal do Vite.

# 6. Modelo de dados

## 6.1 Desafio diário

O desafio deverá possuir uma identificação baseada na data civil utilizada pelo jogo.

Exemplo conceitual:

```json
{
  "date": "2026-10-20",
  "category": "animais",
  "wordLength": 5,
  "maxAttempts": 6,
  "challengeId": "daily-2026-10-20"
}
```

A resposta secreta será mantida no servidor. O exemplo acima representa apenas os metadados públicos.

## 6.2 Estrutura de uma tentativa

```ts
type LetterStatus =
  | "correct"
  | "present"
  | "absent";

interface Guess {
  word: string;
  feedback: LetterStatus[];
  submittedAt: string;
}
```

O feedback de cada letra deverá preservar a ordem original da tentativa.

## 6.3 Estado da partida

```ts
type GameStatus =
  | "playing"
  | "won"
  | "lost";

interface GameState {
  challengeId: string;
  guesses: Guess[];
  status: GameStatus;
  startedAt: string;
  completedAt?: string;
}
```

Uma partida concluída não poderá aceitar novas tentativas.

## 6.4 Estatísticas do jogador

```ts
interface PlayerStats {
  currentStreak: number;
  bestStreak: number;
  totalGames: number;
  totalWins: number;
  lastPlayedDate?: string;
  lastSolvedWord?: string;
  guessDistribution: Record<number, number>;
}
```

O campo `lastSolvedWord` deverá respeitar a regra de divulgação da resposta somente após o encerramento. Ele não será utilizado para expor a palavra atual antes do fim da partida.

## 6.5 Histórico local

Para o MVP sem cadastro, o histórico poderá ser armazenado no `localStorage`.

Cada registro deverá incluir:

- Identificador do desafio.
- Data do desafio.
- Tentativas realizadas.
- Estado final.
- Número de tentativas utilizadas.
- Horário de conclusão.

O histórico não deverá guardar dados pessoais desnecessários.

# 7. Regras do jogo e motor de feedback

## 7.1 Regras fundamentais

- Cada desafio possui uma palavra de tamanho fixo.
- O tema é definido para cada data.
- O jogador possui até seis tentativas.
- Cada tentativa deve conter exatamente o número exigido de letras.
- Palavras inválidas não consomem tentativas.
- Uma tentativa repetida não será aceita.
- O jogador vence quando acerta a palavra.
- O jogador perde quando utiliza as seis tentativas sem acertar.
- Após a conclusão, o tabuleiro fica bloqueado.
- A resposta é revelada somente ao final.

## 7.2 Normalização de palavras

A entrada deverá ser normalizada antes da validação.

A normalização deve:

1. Remover espaços no início e no fim.
2. Converter o texto para maiúsculas.
3. Normalizar caracteres Unicode.
4. Aplicar uma política consistente para acentos.
5. Validar o comprimento em letras.
6. Verificar se a palavra pertence à lista permitida.

Para a primeira versão, recomenda-se aceitar letras de A a Z e considerar as letras acentuadas equivalentes à letra-base na comparação, se essa for a regra definida para o dicionário.

Exemplo conceitual:

- `ÁRVORE` → `ARVORE`
- `PÁSSARO` → `PASSARO`

A mesma política deverá ser utilizada na palavra secreta, na lista de palavras válidas e nas tentativas. O comprimento deverá ser calculado após a normalização.

A remoção de acentos não deverá ser aplicada indiscriminadamente a todos os conteúdos da interface: nomes de categorias e mensagens devem preservar a ortografia portuguesa correta.

## 7.3 Algoritmo de feedback por letra

O cálculo precisa tratar letras repetidas corretamente. Não basta verificar se cada letra existe na palavra, porque isso pode indicar incorretamente letras amarelas quando todas as ocorrências já foram utilizadas.

O algoritmo recomendado é realizado em duas passagens:

**Primeira passagem:** marcar as letras que estão na posição correta e descontar essas ocorrências do conjunto disponível.

**Segunda passagem:** para cada letra ainda não marcada, verificar se existe alguma ocorrência restante. Se existir, marcar como presente em outra posição e descontar uma ocorrência. Caso contrário, marcar como ausente.

Pseudocódigo:

```text
função avaliar(tentativa, resposta):
    resultado = [ausente para cada letra]
    restantes = contar ocorrências de cada letra na resposta

    para cada posição:
        se tentativa[posição] == resposta[posição]:
            resultado[posição] = correta
            restantes[letra] -= 1

    para cada posição:
        se resultado[posição] já é correta:
            continuar

        letra = tentativa[posição]

        se restantes[letra] > 0:
            resultado[posição] = presente
            restantes[letra] -= 1

    retornar resultado
```

Esse procedimento garante que as ocorrências de cada letra sejam distribuídas corretamente.

## 7.4 Validação da tentativa

O envio de uma tentativa deverá seguir esta sequência:

1. Verificar se a partida está ativa.
2. Normalizar a palavra.
3. Conferir o comprimento.
4. Conferir se a palavra é válida.
5. Conferir se já foi utilizada.
6. Solicitar validação ao servidor, quando disponível.
7. Calcular o feedback.
8. Adicionar a tentativa ao estado da partida.
9. Verificar vitória ou derrota.
10. Atualizar estatísticas e persistência.
11. Exibir feedback visual e textual.

A validação da interface melhora a experiência, mas não substitui a validação no servidor.

# 8. Seleção da palavra diária

## 8.1 Requisito de consistência

A palavra deverá ser a mesma para todos os jogadores na mesma data oficial do jogo.

A seleção não poderá depender de `Math.random()` executado isoladamente em cada navegador.

## 8.2 Estratégia recomendada

Manter um calendário de desafios no banco de dados ou em um arquivo de configuração controlado.

Cada registro deverá associar:

- Data do desafio.
- Palavra secreta.
- Categoria.
- Comprimento.
- Versão do conjunto de palavras.
- Estado de publicação.

O servidor deverá consultar a data oficial do jogo e retornar somente os metadados públicos.

Se for utilizada uma seleção determinística baseada em hash, o algoritmo e o conjunto de palavras deverão ser versionados. Uma alteração no banco de palavras não poderá mudar retroativamente os desafios já publicados.

## 8.3 Fuso horário

O projeto deverá definir um fuso horário oficial para a mudança diária. Para um lançamento brasileiro, pode-se adotar inicialmente `America/Sao_Paulo`.

A data deverá ser calculada no servidor, e o cliente deverá utilizar o identificador e a data retornados pela API.

Não se deve confiar exclusivamente no relógio do dispositivo, pois ele pode estar incorreto ou configurado em outro fuso.

## 8.4 Proteção da resposta

A resposta secreta não deverá ser incluída:

- No HTML inicial.
- Em variáveis públicas do frontend.
- No arquivo JavaScript enviado ao navegador.
- Nos metadados públicos do desafio.
- Nas respostas da API antes do fim da partida.

O servidor deverá comparar as tentativas com a palavra secreta e devolver somente o feedback necessário.

Essa proteção reduz a exposição da resposta, embora um sistema sem autenticação não consiga impedir completamente manipulações realizadas por usuários determinados.

# 9. API do jogo

## 9.1 Endpoints propostos

### `GET /api/daily-challenge`

Retorna os dados públicos do desafio atual.

Resposta ilustrativa:

```json
{
  "challengeId": "daily-2026-10-20",
  "date": "2026-10-20",
  "category": "animais",
  "wordLength": 5,
  "maxAttempts": 6
}
```

### `POST /api/daily-challenge/guess`

Recebe uma tentativa para validação.

Requisição conceitual:

```json
{
  "challengeId": "daily-2026-10-20",
  "guess": "TIGRE",
  "attemptNumber": 2
}
```

Resposta conceitual:

```json
{
  "valid": true,
  "feedback": [
    "correct",
    "absent",
    "present",
    "absent",
    "absent"
  ],
  "status": "playing"
}
```

Os valores de feedback acima são ilustrativos e não representam uma palavra real do calendário.

### `POST /api/daily-challenge/finish`

Registra o resultado final, quando houver persistência centralizada.

### Observação sobre identidade

Sem autenticação ou um identificador persistente confiável, o servidor não consegue garantir perfeitamente uma única partida por pessoa. Um identificador anônimo pode ajudar a distinguir navegadores, mas não prova a identidade do jogador.

No MVP, a restrição de uma partida diária poderá ser aplicada localmente por navegador e dispositivo. Uma garantia mais forte exigirá uma estratégia adicional de identidade, com implicações de privacidade e segurança.

# 10. Persistência e estatísticas

## 10.1 localStorage

O `localStorage` poderá manter:

- Partida atual.
- Histórico de partidas.
- Estatísticas agregadas.
- Data da última partida.
- Sequência atual e melhor sequência.

Os dados deverão ser versionados, por exemplo:

```text
palaviva:v1:game
palaviva:v1:stats
palaviva:v1:history
```

A aplicação deverá tratar erros de leitura, dados corrompidos, ausência de espaço e indisponibilidade do armazenamento. Uma falha de persistência não deverá bloquear completamente a partida.

## 10.2 Cálculo da sequência diária

A sequência deverá ser atualizada uma única vez por desafio diário concluído.

Regras propostas:

- Se a última data concluída for o dia anterior, incrementar a sequência.
- Se a data já estiver registrada, não incrementar novamente.
- Se houver uma lacuna de dias, reiniciar a sequência.
- Atualizar a melhor sequência quando a atual ultrapassá-la.
- Não contar várias ações no mesmo dia como dias adicionais.

A data deve seguir o calendário oficial do jogo. Uma partida perdida também conta como participação diária, mas não como vitória.

## 10.3 Percentual de acerto

Fórmula:

`percentual = vitórias / partidas concluídas × 100`

Se nenhuma partida tiver sido concluída, o valor será apresentado como zero ou como ausência de histórico, conforme a decisão visual adotada.

O sistema deverá diferenciar partidas iniciadas de partidas concluídas para evitar distorções nas estatísticas.

## 10.4 Limitações do armazenamento local

Os dados podem ser apagados quando o usuário limpa o navegador, troca de dispositivo ou utiliza uma sessão privada.

A sincronização entre dispositivos ficará fora do MVP sem cadastro. Caso seja adicionada posteriormente, deverá ser projetada com regras de privacidade e controle de acesso.

# 11. Fluxo e estados da interface

## 11.1 Tela inicial

Deverá apresentar:

- Marca Palaviva.
- Tema do dia.
- Indicação de seis tentativas.
- Explicação breve.
- Botão principal “Jogar agora”.
- Acesso às estatísticas.
- Acesso às instruções.

O usuário deverá entender o objetivo sem precisar concluir um tutorial longo.

## 11.2 Tela de partida

Deverá conter:

- Categoria.
- Tabuleiro de seis linhas.
- Teclado virtual.
- Feedback de validação.
- Indicador de tentativas.
- Acesso às instruções.

O botão de envio deverá permanecer claramente identificável. Letras e teclas não deverão ficar pequenas demais em dispositivos móveis.

## 11.3 Tela de resultado

Na vitória:

- Mensagem positiva.
- Quantidade de tentativas utilizadas.
- Palavra revelada.
- Estatísticas atualizadas.
- Botão de compartilhamento.

Na derrota:

- Mensagem acolhedora.
- Palavra correta revelada.
- Quantidade de tentativas utilizadas.
- Opção de compartilhar o resultado.

O jogo deverá evitar mensagens que ridicularizem ou culpem o jogador.

## 11.4 Estados técnicos

A aplicação deverá tratar explicitamente:

- Carregamento do desafio.
- Falha de conexão.
- Tentativa inválida.
- Tentativa repetida.
- Envio em andamento.
- Vitória.
- Derrota.
- Partida já concluída.
- Erro de persistência.
- Desafio indisponível.

As mensagens de erro deverão explicar o que aconteceu e, quando possível, oferecer uma ação de recuperação.

# 12. Acessibilidade web

A acessibilidade deverá fazer parte da implementação inicial, e não ser tratada como um ajuste posterior.

## 12.1 Contraste e cores

A referência será WCAG 2.2 AA.

Como objetivo mínimo:

- Contraste de 4,5:1 para texto normal.
- Contraste de 3:1 para texto grande.
- Contraste suficiente para componentes e indicadores relevantes.

O estado de uma letra não poderá ser comunicado somente pela cor. O feedback deverá ser oferecido também por texto acessível, símbolos ou mensagens complementares.

## 12.2 Navegação por teclado

O jogo deverá aceitar:

- Letras digitadas no teclado físico.
- Enter para enviar uma tentativa.
- Backspace para remover a última letra.
- Tab e Shift+Tab para navegar pelos controles.
- Escape para fechar diálogos, quando apropriado.

A aplicação deverá preservar o foco de teclado e evitar capturar teclas enquanto o usuário estiver digitando em outro campo ou utilizando um diálogo.

## 12.3 Leitores de tela

O tabuleiro deverá possuir uma descrição acessível.

Após o envio de uma tentativa, o sistema deverá anunciar uma mensagem resumida com a quantidade de letras corretas e as informações relevantes, sem repetir desnecessariamente todo o tabuleiro.

Uma região de anúncio acessível poderá ser implementada com `aria-live="polite"`. Mensagens urgentes poderão usar um mecanismo mais assertivo somente quando necessário.

O foco não deverá ser deslocado de maneira inesperada após cada tentativa.

## 12.4 Alvos de toque

Os botões deverão possuir áreas de interação confortáveis. Como meta de projeto, recomenda-se uma dimensão de aproximadamente 44 × 44 CSS pixels para controles principais sempre que o layout permitir.

O teclado virtual deverá se adaptar à largura da tela e manter o botão de apagar e o botão de envio fáceis de identificar.

## 12.5 Movimento e animações

As animações deverão ser discretas e não bloquear a interação.

A preferência do sistema por movimento reduzido deverá ser respeitada por meio de `prefers-reduced-motion`.

Nenhuma informação essencial deverá depender de uma animação para ser percebida.

# 13. Compartilhamento

O resultado compartilhado deverá conter o identificador do desafio, a quantidade de tentativas e uma representação visual das tentativas, sem revelar a resposta.

Exemplo:

```text
Palaviva · Desafio diário
Tema: Animais
Resultado: 4/6

🟩⬜🟨⬜⬜
🟩🟨⬜⬜⬜
🟩🟩🟨⬜⬜
🟩🟩🟩🟩🟩

Consegue descobrir a palavra de hoje?
```

O exemplo é ilustrativo. O compartilhamento real deverá usar o feedback efetivamente produzido pelo jogo.

A implementação deverá:

1. Preparar uma mensagem sem a palavra secreta.
2. Tentar utilizar a Web Share API quando disponível.
3. Oferecer uma alternativa para copiar o texto.
4. Exibir confirmação acessível após a cópia.
5. Tratar cancelamento ou falha sem encerrar a partida.

O jogo não deverá exigir login em redes sociais para compartilhar.

# 14. Segurança e privacidade

## 14.1 Proteção da API

A API deverá:

- Validar tipos e tamanhos dos dados recebidos.
- Limitar o tamanho das requisições.
- Aplicar limites de frequência quando necessário.
- Não expor a resposta secreta.
- Não confiar no número de tentativas informado pelo cliente.
- Verificar o estado da partida no servidor quando existir sessão identificável.
- Evitar registrar informações pessoais desnecessárias em logs.

O número da tentativa deverá ser determinado pelo estado validado da partida, e não aceito cegamente do navegador.

## 14.2 Privacidade

Como o público inclui menores de idade, o projeto deverá adotar coleta mínima de dados.

O MVP não deverá solicitar nome completo, localização precisa, contatos ou data de nascimento para jogar.

Estatísticas locais deverão permanecer no dispositivo. Caso métricas de uso sejam adicionadas, será necessário documentar a finalidade, limitar a coleta e avaliar as exigências legais aplicáveis, incluindo a LGPD e as regras relacionadas à proteção de crianças e adolescentes.

## 14.3 Limitações contra fraude

Sem cadastro, o sistema não poderá garantir uma única partida por pessoa em todos os dispositivos.

A limitação local evita repetições acidentais, mas pode ser contornada pela remoção dos dados do navegador. Essa limitação deverá ser aceita conscientemente no MVP, em vez de prometer uma proteção que a arquitetura não oferece.

# 15. Desempenho e responsividade

## 15.1 Metas de desempenho

O projeto deverá buscar:

- Carregamento inicial inferior a dois segundos em uma conexão estável e em um dispositivo de referência definido para testes.
- JavaScript e CSS enxutos.
- Ausência de imagens grandes desnecessárias.
- Interface utilizável em telas de baixa largura.
- Resposta visual imediata após uma interação local.
- Tratamento de falhas de rede sem perda desnecessária de progresso.

As metas deverão ser medidas em condições documentadas. Não se deve considerar o limite de dois segundos garantido em qualquer rede ou dispositivo.

## 15.2 Layout responsivo

A interface deverá ser construída primeiro para telas pequenas.

Regras:

- O tabuleiro deverá caber sem rolagem horizontal.
- O teclado virtual deverá acompanhar a largura disponível.
- Os controles deverão permanecer visíveis em alturas reduzidas.
- O conteúdo deverá funcionar em orientação vertical e horizontal.
- A interface deverá continuar legível com ampliação de texto.
- A página deverá evitar elementos que provoquem deslocamento excessivo do layout.

Os testes deverão incluir larguras de aproximadamente 320, 375, 768 e 1280 CSS pixels.

# 16. Estratégia de testes

## 16.1 Testes unitários

Deverão verificar:

- Normalização de caracteres.
- Validação de comprimento.
- Rejeição de palavras inválidas.
- Rejeição de tentativas repetidas.
- Feedback para letras duplicadas.
- Vitória e derrota.
- Bloqueio após a conclusão.
- Cálculo de sequência diária.
- Cálculo do percentual de acerto.
- Formatação do resultado compartilhado.

## 16.2 Testes de integração

Deverão verificar:

- Comunicação com a API.
- Tratamento de falha de conexão.
- Persistência da partida.
- Recuperação de dados após recarregar a página.
- Atualização das estatísticas.
- Compatibilidade entre o desafio retornado e a interface.

## 16.3 Testes de ponta a ponta

Cenários prioritários:

1. Jogador inicia uma partida e vence.
2. Jogador utiliza as seis tentativas e perde.
3. Jogador envia uma palavra inválida.
4. Jogador tenta repetir uma palavra.
5. Jogador atualiza a página durante a partida.
6. Jogador abre uma partida já concluída.
7. Jogador compartilha um resultado.
8. Jogador navega usando somente o teclado.
9. Jogador utiliza uma tela estreita.
10. A API fica indisponível temporariamente.

## 16.4 Testes manuais de acessibilidade

Deverão incluir:

- Navegação por teclado.
- Leitura com leitor de tela.
- Verificação de contraste.
- Zoom e ampliação de texto.
- Preferência por movimento reduzido.
- Testes em dispositivos móveis.
- Avaliação da clareza das mensagens de erro.

Ferramentas automatizadas ajudam a encontrar problemas, mas não substituem testes manuais.

# 17. Critérios de aceitação

O MVP será considerado pronto para avaliação quando cumprir os seguintes critérios:

- [ ] A tela inicial apresenta tema, instruções e botão de início.
- [ ] O desafio é consistente para a mesma data oficial.
- [ ] O jogador dispõe de seis tentativas.
- [ ] Palavras inválidas não consomem tentativas.
- [ ] Letras duplicadas recebem feedback correto.
- [ ] O resultado é apresentado imediatamente após a conclusão.
- [ ] A resposta não é divulgada antes do fim.
- [ ] Uma partida concluída não aceita novas tentativas.
- [ ] O histórico e as estatísticas são atualizados corretamente.
- [ ] A sequência diária é calculada de forma consistente.
- [ ] O compartilhamento não revela a solução.
- [ ] A interface funciona em dispositivos móveis e desktop.
- [ ] A navegação por teclado funciona.
- [ ] O feedback não depende somente de cores.
- [ ] Os erros de rede e armazenamento são tratados.
- [ ] Os testes automatizados essenciais passam.
- [ ] As metas de desempenho são verificadas em ambiente de teste.
- [ ] A aplicação não exige cadastro nem contém monetização.

# 18. Plano de implementação

## Fase 1 — Fundação do projeto

**Entregas:**

- Configuração do React, TypeScript e Vite.
- Organização das pastas.
- Sistema de cores e tipografia.
- Componentes básicos.
- Layout responsivo inicial.

**Condição para avançar:** estrutura compilando e tela inicial funcionando.

## Fase 2 — Motor do jogo

**Entregas:**

- Normalização de palavras.
- Validação das tentativas.
- Cálculo de feedback.
- Estados de vitória e derrota.
- Bloqueio após seis tentativas.
- Testes unitários.

**Condição para avançar:** regras essenciais cobertas por testes automatizados.

## Fase 3 — Desafio diário e persistência

**Entregas:**

- Calendário de palavras.
- API do desafio diário.
- Validação segura das tentativas.
- Persistência local.
- Estatísticas e streak.
- Tratamento de indisponibilidade da API.

**Condição para avançar:** o desafio permanece consistente e o progresso é recuperado corretamente.

## Fase 4 — Acessibilidade e acabamento visual

**Entregas:**

- Navegação por teclado.
- Feedback para leitores de tela.
- Contraste e foco visível.
- Animações reduzidas conforme preferência.
- Ajustes em telas pequenas.
- Estados de erro e carregamento.

**Condição para avançar:** verificações automatizadas e manuais concluídas.

## Fase 5 — Compartilhamento e publicação

**Entregas:**

- Formatação do resultado.
- Web Share API.
- Alternativa de cópia.
- Testes de ponta a ponta.
- Configuração de hospedagem.
- Monitoramento de erros técnicos.
- Verificação dos critérios de aceitação.

**Condição de lançamento:** nenhum problema crítico conhecido nas regras, acessibilidade ou proteção da palavra secreta.

# 19. Métricas de avaliação

Após a publicação, deverão ser acompanhadas as métricas definidas no PRD.

| Métrica | Objetivo |
|---|---|
| Retenção em 1, 3 e 7 dias | Avaliar retorno dos jogadores |
| Taxa de conclusão | Identificar abandono durante a partida |
| Taxa de vitória | Avaliar a dificuldade das palavras |
| Média de tentativas | Compreender a experiência de resolução |
| Tempo até a primeira jogada | Avaliar clareza da tela inicial |
| Tentativas inválidas | Identificar problemas no dicionário ou nas instruções |
| Compartilhamentos | Avaliar o potencial de divulgação |
| Erros técnicos | Detectar problemas de funcionamento |

A instrumentação deverá ser proporcional ao objetivo. O MVP pode começar com métricas técnicas e estatísticas locais, sem rastreamento comportamental detalhado.

# 20. Riscos técnicos e mitigação

**Risco: resposta secreta exposta no frontend.**  
Mitigação: manter a resposta no servidor e retornar somente o feedback necessário.

**Risco: palavras duplicadas ou feedback incorreto.**  
Mitigação: algoritmo em duas passagens e testes com ocorrências repetidas.

**Risco: perda do histórico.**  
Mitigação: validação dos dados locais, versão de esquema e tratamento de falhas.

**Risco: sequência diária inconsistente.**  
Mitigação: definir um fuso oficial e calcular as datas com uma regra única.

**Risco: baixa acessibilidade.**  
Mitigação: projetar foco, contraste e anúncios acessíveis desde a primeira fase.

**Risco: dificuldade excessiva.**  
Mitigação: manter um conjunto curado de palavras por tema e acompanhar a taxa de vitória.

**Risco: abuso da API.**  
Mitigação: validação no servidor, limites de frequência e monitoramento técnico.

**Risco: coleta excessiva de dados de menores.**  
Mitigação: não exigir cadastro, minimizar dados e avaliar as obrigações legais antes de adicionar análises.

# 21. Evolução após o MVP

Depois de validar a experiência básica, poderão ser avaliadas:

- Novas categorias temáticas.
- Desafios semanais.
- Dificuldade adaptativa.
- Histórico detalhado.
- Sincronização entre dispositivos.
- Opções de contraste e aparência.
- Instalação como PWA.
- Modo de aprendizagem com explicação da palavra após a partida.
- Funcionalidades sociais leves.

Essas expansões deverão ser priorizadas com base nos dados de uso, na qualidade da experiência e na complexidade de manutenção.

# 22. Conclusão técnica

O Palaviva deverá ser implementado como uma aplicação web modular, responsiva e acessível, com separação entre interface, regras de negócio, persistência e serviços.

A identidade Fresh Play fornece uma base visual acolhedora, enquanto a estrutura minimalista mantém o foco na adivinhação. O motor de feedback deverá ser rigorosamente testado, principalmente no tratamento de letras repetidas. O desafio diário deverá ser consistente, e a palavra secreta deverá permanecer no servidor.

Para o MVP, o armazenamento local atende às estatísticas básicas sem cadastro. A arquitetura serverless permite proteger a resposta e validar as tentativas, enquanto mantém a operação relativamente simples. A limitação de uma partida por pessoa em múltiplos dispositivos não poderá ser garantida sem uma estratégia adicional de identidade.

A implementação deverá avançar por etapas, com critérios de aceitação verificáveis em cada fase. O objetivo final é entregar uma experiência rápida, clara, inclusiva e preparada para evoluir com segurança.

**Próxima entrega recomendada:** protótipo funcional em React e TypeScript, com motor de regras testado, tabuleiro de seis tentativas, teclado físico e virtual, persistência local e interface Fresh Play. A integração da API deverá ser concluída antes da publicação do desafio diário real.
