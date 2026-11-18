# Agenda Pastoral

App pessoal, 100% local (SQLite), sem backend, para aniversariantes, compromissos,
datas importantes e pendências pastorais. Android apenas.

---

## Gerar o APK pelo GitHub (passo a passo)

O GitHub compila o app sozinho (arquivo `.github/workflows/build-apk.yml`).
Você não precisa de conta Expo, nem de EAS, nem de Android Studio.

### 1. Criar o repositório
1. Entre em https://github.com/new
2. Nome: `agenda-pastoral`. Marque **Private**.
3. **Não** marque "Add a README" nem outros arquivos. Clique em *Create repository*.

### 2. Enviar o projeto
Extraia o zip, abra o terminal dentro da pasta `agenda-pastoral` e rode
(troque `SEU_USUARIO` pelo seu usuário do GitHub):

```bash
git init
git add .
git commit -m "Agenda Pastoral"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/agenda-pastoral.git
git push -u origin main
```

Dica: a pasta `.github` começa com ponto e fica oculta em alguns sistemas
(no Mac: Cmd+Shift+. para exibir). Ela precisa ir junto; por isso o caminho
pelo terminal acima é mais seguro do que arrastar arquivos no navegador.

### 3. Acompanhar o build
1. No repositório, abra a aba **Actions**.
2. O workflow **Build APK** começa sozinho depois do push. Se não começar,
   clique em *Build APK* → **Run workflow**.
3. Espere ficar com o ícone verde. A primeira vez costuma demorar mais
   (estimativa minha: algo entre 10 e 25 minutos).

### 4. Baixar o APK
1. Clique na execução concluída.
2. Role até **Artifacts** e baixe **agenda-pastoral-apk** (vem num .zip).
3. Extraia: dentro está o `app-release.apk`.

### 5. Instalar no celular
1. Passe o `.apk` para o celular (Drive, WhatsApp pra você mesmo, cabo...).
   Também dá para baixar o artifact direto pelo navegador do celular, logado no GitHub.
2. Ao abrir o arquivo, o Android pede para permitir "instalar apps desta fonte". Permita.
3. Na primeira abertura do app, **permita as notificações**.

### 6. Atualizar o app depois
Mude o código → `git add . && git commit -m "..." && git push` → baixe o novo APK
e instale por cima. O keystore usado é o mesmo em todo build (conferi que é idêntico
entre duas gerações do projeto), então a atualização deve instalar por cima e manter
os dados. Mesmo assim, **exporte um backup antes** de atualizar.

### Se o build falhar
Abra a execução → clique no passo marcado com ✗ → copie as últimas ~40 linhas do log
e me mande. Eu não consegui rodar a compilação final (Gradle) no meu ambiente por não
haver Android SDK; o que validei foi `npm ci` e `expo prebuild`, que passaram.

### Observações importantes
- **Assinatura:** o APK sai assinado com a chave de debug padrão do Expo. Serve para uso
  pessoal e instalação direta, mas **não serve para publicar na Play Store**.
- **Arquitetura:** o workflow compila só para `arm64-v8a` (praticamente todos os celulares
  atuais) para ficar mais rápido e menor. Se algum aparelho muito antigo (32 bits) não
  instalar, apague `-PreactNativeArchitectures=arm64-v8a` da linha do Gradle no workflow.
- **Ícone:** os arquivos em `assets/` são provisórios (cruz simples, verde e creme).
  Troque pelos seus mantendo os mesmos nomes e tamanhos.

---

## Alternativa: EAS Build (como no Ezer.app)

O `eas.json` continua no projeto. Se preferir: `npx eas login`, `npx eas build:configure`
e `npx eas build -p android --profile preview`.

## Como o app está organizado

Quatro abas, só com ícones, na barra de baixo:
- **Agenda** (inicial): hoje + 7 dias, dia a dia, só os dias que têm algo. Setas para
  ver os 8 dias anteriores/seguintes e botão "Hoje" para voltar. Não mostra pendências.
- **Resumo**: o mês de calendário inteiro (dia 1 ao último dia), em quatro seções, nesta
  ordem: Pendências (todas as em aberto), Compromissos, Aniversariantes e Datas
  importantes, cada uma com "Ver todos". Ao tocar numa pendência, o card se abre em
  dois botões: Concluída (apaga de vez, sem restaurar) e Editar. Setas ao lado do nome do mês navegam entre meses
  (botão "Hoje" aparece fora do mês atual). Itens de dias que já passaram ficam apagados.
- **Mensagens**: envio de mensagem em lote pelo WhatsApp (modelos com {nome}, busca de
  contatos da agenda por sigla ou colagem manual, botão Próximo, marcação de enviados).
  Modelos e lista entram no backup. Cada envio abre o WhatsApp com o texto pronto; você
  só toca em enviar lá.
- **Configurações**: backup (com data do último e aviso após 30 dias) e ministérios.

O botão flutuante "+" (canto inferior direito, nas abas Agenda e Resumo) abre as
opções de cadastro: Compromisso, Aniversariante, Data importante e Pendência.

## O que testar no aparelho (não validado no meu ambiente)

- Barra de gestos: conferir se o rodapé e o topo não ficam mais sob a barra do Android.
- Botão "+": abrir, escolher uma opção, cancelar tocando fora e com o botão voltar.

- Notificações: criar um aniversário para amanhã e conferir o aviso das 18h/7h. Depois
  reiniciar o celular e conferir se os avisos continuam (a biblioteca de notificações
  registra um receptor de reinício, mas não testei num aparelho real).
- Modo escuro: trocar o tema do sistema e ver se o app acompanha.
- Seletor de data/hora (visual varia entre versões do Android).
- Exportar → apagar um dado → importar de volta.

## Estrutura

```
App.js                      entrada: fontes, permissão, reagendamento
app.json / eas.json         configuração Expo / EAS
.github/workflows/          build do APK no GitHub Actions
assets/                     ícone, splash e ícone de notificação (provisórios)
src/theme/                  paleta "Moderno" (claro e escuro) + tipografia
src/db/                     SQLite, CRUD, recorrência, backup
src/notifications/          agendamento local + tarefa em segundo plano
src/navigation/             4 abas (ícones) + telas empilhadas
src/screens/                Agenda, Resumo, Configurações, listas e formulários
src/components/             FabMenu (botão +), SectionCard, FadeInView
src/utils/datas.js          datas no fuso local do aparelho
```

## Decisões registradas

- Tudo local, sem backend. Importação de backup **substitui tudo**.
- Ministério removido fica inativo na lista; o nome continua nos registros antigos.
- 29/fev em ano não bissexto → notifica em 28/fev.
- Pendências: enquanto houver alguma em aberto, um aviso diário às 07h ("Você tem N pendências em aberto"); sem pendências, sem aviso.
- Notificação sempre na barra, nunca alarme sonoro.
- Agenda semanal = hoje + 7 dias (8 dias), relativa a hoje; navegação em blocos de 8 dias.
- Aviso de backup fica nas Configurações, não na tela inicial.
- Pendência concluída é apagada de vez (não há arquivo nem restaurar).
- Resumo = mês de calendário inteiro, com as pendências em primeiro lugar.
- Tema: paleta "Moderno" (verde `#43614A`, marrom `#8F5F3B`, fundo `#EFE8DB`);
  modo escuro derivado dela (verde clareado sobre marrom escuro).
