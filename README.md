# Palaviva — MVP de jogo diário de palavras

Protótipo funcional em React + TypeScript + Vite com identidade visual Fresh Play.

## Rodar localmente

Requer Node.js 20+.

```bash
npm install
npm run dev
```

## Build de produção

```bash
npm run build
npm run preview
```

## Recursos implementados

- Tela inicial, desafio, instruções e estatísticas.
- Seis tentativas por partida.
- Entrada por teclado físico, campo de texto e teclado virtual.
- Feedback verde/amarelo/cinza com tratamento de letras repetidas.
- Validação de comprimento, palavras permitidas e tentativas duplicadas.
- Persistência local de partida e estatísticas.
- Sequência diária básica.
- Compartilhamento via Web Share API ou cópia quando disponível.
- Layout responsivo e preferência por movimento reduzido.

## Limitações conhecidas

Este é um protótipo de frontend para validar a experiência, não um serviço pronto para produção. A palavra do dia está no bundle do cliente e pode ser inspecionada. Para lançamento real, mova o calendário secreto e a validação para uma API serverless; a API deve retornar apenas metadados públicos e feedback por letra. A lista de palavras permitidas é deliberadamente pequena e precisa ser substituída por um dicionário curado, com revisão de categorias e acentuação. Sem identidade no servidor, não é possível garantir uma única partida por pessoa em vários dispositivos.

## Revisões de agentes simuladas

### Agente de conformidade com requisitos
- **Parcialmente conforme:** UI mobile-first, seis tentativas, feedback, estatísticas locais e compartilhamento estão contemplados.
- **Parcialmente conforme:** o calendário é determinístico no protótipo, mas não é uma agenda oficial no servidor.
- **Não conforme para produção:** a resposta secreta é entregue no bundle do cliente.
- **Parcialmente conforme:** validação de palavras utiliza lista pequena; não cobre adequadamente o português.
- **Parcialmente conforme:** streak é atualizado ao concluir uma partida; precisa de testes de fuso, lacunas e atualização de dia.
- **Atenção:** a categoria do dia é definida pela lista de protótipo e algumas entradas de demonstração não são palavras adequadas para publicação. Substituir por conteúdo revisado.

### Agente de revisão de código
- **Corrigir antes de produção:** a lógica do desafio diário deve usar data civil oficial e fonte de dados no servidor.
- **Corrigir antes de produção:** o estado de fim de partida e estatísticas precisam de persistência atômica e proteção contra atualizações concorrentes.
- **Corrigir antes de produção:** ampliar testes para letras duplicadas, normalização Unicode, palavras inválidas e recuperação após recarregar.
- **Melhorar:** centralizar strings e dicionário; remover importações/variáveis não utilizadas.
- **Melhorar:** adicionar testes automatizados de unidade e E2E, além de verificação de acessibilidade.
- **Melhorar:** a janela de instruções deve devolver foco ao controle anterior e gerir foco de diálogo.
- **Melhorar:** a lista de palavras deve ser revisada por língua, tamanho e categoria.

Essas duas revisões são análises estáticas documentadas, não execução real de agentes externos ou auditoria automatizada.
