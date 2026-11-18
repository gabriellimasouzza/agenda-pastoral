<div align="center">

# ✝️ Agenda Pastoral

**Uma agenda simples, bonita e 100% local para o dia a dia de quem pastoreia.**
Aniversariantes, compromissos, datas importantes, pendências e mensagens em lote, tudo no seu celular, sem conta, sem nuvem e sem internet.

![Android](https://img.shields.io/badge/Android-apenas-43614A?style=for-the-badge&logo=android&logoColor=white)
![Expo SDK 52](https://img.shields.io/badge/Expo-SDK%2052-8F5F3B?style=for-the-badge&logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-0.76-43614A?style=for-the-badge&logo=react&logoColor=white)
![100% local](https://img.shields.io/badge/dados-100%25%20locais-8F5F3B?style=for-the-badge)

*Feito por [Souza Apps](#sobre) para uso pessoal, compartilhado para ajudar quem precisar.*

</div>

---

## 📖 Índice

- [Por que existe](#-por-que-existe)
- [O que o app faz](#-o-que-o-app-faz)
- [Privacidade](#-privacidade)
- [Instalar o app (sem programar)](#-instalar-o-app-sem-programar)
- [Gerar o APK pelo GitHub (passo a passo)](#-gerar-o-apk-pelo-github-passo-a-passo)
- [Atualizar o app depois](#-atualizar-o-app-depois)
- [Backup e restauração](#-backup-e-restauração)
- [Rodar em modo de desenvolvimento](#-rodar-em-modo-de-desenvolvimento)
- [Se algo der errado](#-se-algo-der-errado)
- [Decisões de projeto](#-decisões-de-projeto)
- [Limitações conhecidas](#-limitações-conhecidas)
- [Estrutura do projeto](#-estrutura-do-projeto)
- [Contribuir](#-contribuir)
- [Sobre](#sobre)

---

## 🌿 Por que existe

Quem pastoreia lida com muita gente e muita data: aniversário da irmã, bodas do casal, o dia em que alguém perdeu um ente querido, a reunião do ministério, a visita que ficou para depois. Isso costuma ficar espalhado entre agenda, caderno e memória.

O **Agenda Pastoral** junta isso num só lugar, avisa na hora certa e **não depende de servidor nenhum**. Os dados nunca saem do aparelho, a não ser que você mesmo exporte um backup.

---

## ✨ O que o app faz

O app tem quatro abas, só com ícones, na barra de baixo. Um botão **+** flutuante (canto inferior direito, nas abas Agenda e Resumo) abre o cadastro rápido de compromisso, aniversariante, data importante ou pendência.

### 📅 Agenda
A tela inicial. Mostra **hoje + os próximos 7 dias**, dia a dia, só os dias que têm algo. O dia aparece com número grande à esquerda e o dia da semana ao lado. Setas levam aos 8 dias anteriores ou seguintes, e o botão **Hoje** volta ao início.

### 🗓️ Resumo
O **mês inteiro** de relance, em quatro seções, nesta ordem:

1. **Pendências** (todas as que estão em aberto)
2. **Compromissos**
3. **Aniversariantes**
4. **Datas importantes**

Setas ao lado do nome do mês navegam entre os meses. Itens de dias que já passaram ficam **apagados**, para você enxergar rápido o que ainda falta. Cada seção tem "Ver todos".

Nas pendências, **toque no card** e ele se divide em dois botões: **Concluída** (apaga de vez) e **Editar**.

### 💬 Mensagens
Envio de mensagem em lote pelo WhatsApp, um contato por vez:

- **Modelos** salvos, com `{nome}` trocado pelo primeiro nome da pessoa.
- **Busca na agenda do celular** pela sigla da igreja ou grupo (por exemplo, todos os contatos que têm "IMPB" no nome), ou **colagem manual** no formato `Nome;telefone`.
- O botão **Próximo** abre o WhatsApp já com o texto pronto. Você só toca em enviar lá.
- Marca quem já recebeu, permite selecionar e desmarcar contatos, buscar na lista e limpar os envios.

> O app **não envia nada sozinho**: ele abre o WhatsApp com a mensagem preenchida e você confirma cada envio.

### ⚙️ Configurações
- **Backup**: exportar para uma pasta à sua escolha e importar. Mostra a data do último backup e avisa depois de 30 dias.
- **Ministérios**: lista editável, usada nos compromissos e pendências.

### 🔔 Notificações

Todas são locais, aparecem na barra de notificação e **nunca tocam som ou alarme**.

| O quê | Quando avisa |
|---|---|
| Aniversários e datas importantes | **18h da véspera** e **7h do dia** |
| Compromissos | **7h**, com a antecedência (em dias) que você escolher em cada compromisso |
| Pendências | **Todo dia às 7h**, enquanto existir ao menos uma em aberto |

### Outros detalhes pensados para a rotina

- **Compromissos** com horário, local, ministério e observação.
- **Recorrência** semanal e mensal (por exemplo, "toda quinta" ou "1º domingo do mês"). Ao editar ou apagar, o app sempre pergunta se vale **só para esta ocorrência** ou para **a série toda**.
- **Aviso de conflito** quando dois compromissos caem no mesmo horário.
- **Aniversariante de 29/fev** em ano não bissexto é lembrado em 28/fev.
- **Datas importantes** (casamento, falecimento, outras) e **pendências** não precisam de data.
- **Ministério removido** continua aparecendo nos registros antigos, mas deixa de ser opção para novos.
- **Modo claro e escuro**, acompanhando o tema do celular.

---

## 🔒 Privacidade

- Todos os dados ficam em um banco **SQLite no próprio aparelho**.
- **Sem conta, sem login, sem servidor, sem anúncios, sem rastreamento.**
- O app só pede estas permissões: **notificações** (para os avisos), **alarmes exatos** (para avisar na hora marcada) e **contatos** (apenas quando você toca em buscar por sigla na aba Mensagens).
- A leitura dos contatos acontece só no aparelho e só quando você pede.
- Não há PIN nem bloqueio próprio. Se o celular estiver desbloqueado, o app abre. Se isso for importante para você, use o bloqueio de tela do Android.

---

## 📲 Instalar o app (sem programar)

Se alguém já te passou o arquivo `.apk`:

1. Copie o `.apk` para o celular (Drive, WhatsApp para você mesmo, cabo USB).
2. Toque no arquivo. O Android vai pedir para permitir **"instalar apps desta fonte"**. Permita.
3. Abra o app e **permita as notificações** na primeira vez.

Se não tiver o `.apk`, siga o passo a passo abaixo para gerar o seu. É gratuito.

---

## 🛠️ Gerar o APK pelo GitHub (passo a passo)

O GitHub compila o app sozinho (arquivo `.github/workflows/build-apk.yml`). Você **não precisa** de conta Expo, de EAS nem de Android Studio.

### 1. Criar o repositório
1. Entre em <https://github.com/new>.
2. Nome: `agenda-pastoral`. Marque **Private** (ou Public, como preferir).
3. **Não** marque "Add a README" nem outros arquivos. Clique em *Create repository*.

### 2. Enviar o projeto
Extraia o projeto, abra o terminal dentro da pasta `agenda-pastoral` e rode (troque `SEU_USUARIO` pelo seu usuário do GitHub):

```bash
git init
git add .
git commit -m "Agenda Pastoral"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/agenda-pastoral.git
git push -u origin main
```

> 💡 A pasta `.github` começa com ponto e fica oculta em alguns sistemas (no Mac: `Cmd+Shift+.` para exibir). Ela precisa ir junto, por isso o caminho pelo terminal é mais seguro do que arrastar arquivos pelo navegador.

### 3. Acompanhar o build
1. No repositório, abra a aba **Actions**.
2. O workflow **Build APK** começa sozinho depois do push. Se não começar, clique em *Build APK* → **Run workflow**.
3. Espere o ícone ficar verde. A primeira vez demora mais (estimativa: entre 10 e 25 minutos).

### 4. Baixar o APK
1. Clique na execução concluída.
2. Role até **Artifacts** e baixe **agenda-pastoral-apk** (vem num `.zip`).
3. Extraia: dentro está o `app-release.apk`.

### 5. Instalar no celular
Siga a seção [Instalar o app](#-instalar-o-app-sem-programar). Também dá para baixar o artifact direto pelo navegador do celular, logado no GitHub.

### Observações importantes

- **Assinatura:** o APK sai assinado com a chave de *debug* padrão do Expo. Serve para uso pessoal e instalação direta, mas **não serve para publicar na Play Store**.
- **Arquitetura:** o workflow compila só para `arm64-v8a` (praticamente todos os celulares atuais), o que deixa o build mais rápido e o APK menor. Se um aparelho muito antigo (32 bits) não instalar, apague `-PreactNativeArchitectures=arm64-v8a` da linha do Gradle no workflow.
- **Ícone:** os arquivos em `assets/` são provisórios (cruz simples, verde e creme). Troque pelos seus mantendo os mesmos nomes e tamanhos.

---

## 🔄 Atualizar o app depois

1. **Exporte um backup** antes de qualquer atualização.
2. Mude o código e rode:
   ```bash
   git add .
   git commit -m "Descrição da mudança"
   git push
   ```
3. Baixe o novo APK em *Actions* e instale **por cima** do app atual.

O APK é sempre assinado com a mesma chave, então a atualização deve instalar por cima e **manter os dados**. Mesmo assim, o backup é a garantia.

---

## 💾 Backup e restauração

- **Exportar:** Configurações → Exportar. O Android abre o seletor de pastas e o app grava um arquivo `agenda-pastoral-backup-AAAA-MM-DD.json` na pasta escolhida.
  - Em Androids mais novos, o sistema pode recusar a raiz do armazenamento ou a pasta Downloads. Se aparecer "não é possível usar esta pasta", escolha ou crie uma subpasta (por exemplo, `Documents/Backup`).
- **Importar:** Configurações → Importar e escolha o arquivo `.json`.
  - ⚠️ A importação **substitui tudo** o que está no app. Não dá para desfazer.
  - Um backup feito em uma versão antiga, que ainda não tinha a aba Mensagens, não contém modelos nem contatos. Importá-lo apaga os modelos e a lista de Mensagens que já existirem.
- O backup inclui ministérios, aniversariantes, datas importantes, compromissos (com exceções), pendências, modelos de mensagem e lista de contatos de Mensagens.
- O app avisa nas Configurações quando o último backup tiver mais de 30 dias.

---

## 💻 Rodar em modo de desenvolvimento

Requisitos: **Node 20** e, para compilar localmente, **Java 17** e o Android SDK.

```bash
npm ci
npx expo prebuild --platform android
npx expo run:android      # com um aparelho ou emulador conectado
```

Para só conferir se o código empacota, sem Android SDK:

```bash
npx expo export --platform android
```

Pontos de atenção:

- O projeto usa **Expo SDK 52** e **React Native 0.76**. Ao adicionar pacotes, prefira `npx expo install <pacote>` para respeitar as versões do SDK.
- `expo-asset` precisa estar declarado na raiz do `package.json`. Sem isso, o build pode falhar com "The required package `expo-asset` cannot be found".
- `package.json` e `package-lock.json` devem ir sempre juntos no commit, porque o workflow usa `npm ci`.

---

## 🩺 Se algo der errado

| Sintoma | O que fazer |
|---|---|
| Build com ✗ no GitHub | Abra a execução, clique no passo marcado com ✗ e copie as últimas ~40 linhas do log para pedir ajuda. |
| `expo-asset` não encontrado | Rode `npm install expo-asset@~11.0.5` e faça commit do `package.json` e do `package-lock.json` juntos. |
| O app não instala por cima | Veja se o APK novo foi gerado pelo mesmo projeto e se você permitiu instalar de fontes desconhecidas. Como último recurso, exporte o backup, desinstale, instale o novo e importe. |
| Notificações não chegam | Confirme a permissão de notificações do app. Em alguns celulares, a economia de bateria atrapalha: libere o app dessa restrição e **abra o app uma vez** para ele reagendar os avisos. |
| Notificações sumiram depois de reiniciar o celular | Abra o app uma vez. Ele reagenda tudo ao abrir. |
| Seletor de pastas recusa a pasta no backup | Escolha uma subpasta, não a raiz do armazenamento. |
| Busca de contatos não acha ninguém | Confira se a permissão de contatos foi concedida e se a sigla realmente aparece no **nome** do contato. |

---

## 🧭 Decisões de projeto

- Tudo local, sem backend. Importação de backup **substitui tudo**.
- Datas guardadas como texto `AAAA-MM-DD` no **fuso local** do aparelho, nunca em UTC, para o aviso cair no dia certo.
- Agenda semanal = hoje + 7 dias (8 dias), navegando em blocos de 8 dias.
- Resumo = mês de calendário inteiro, com as pendências em primeiro lugar.
- Pendência concluída é **apagada de vez** (não há arquivo nem restaurar).
- Notificação sempre na barra de notificação, nunca alarme sonoro.
- Aviso de backup fica nas Configurações, não na tela inicial.
- Paleta "Moderno": verde `#43614A`, marrom `#8F5F3B`, fundo creme `#EFE8DB`. O modo escuro é derivado dela (verde clareado sobre marrom escuro).
- Tipografia: **Playfair Display** nos títulos e **Manrope** no texto.

---

## ⚠️ Limitações conhecidas

- **Só Android.** Não há versão para iPhone.
- **Não há sincronização entre aparelhos** nem integração com o Google Agenda. É uma escolha, por ser 100% local.
- As notificações são agendadas dentro do aparelho. O Android pode apagar avisos agendados em certas situações (reinício, economia agressiva de bateria). O app reagenda tudo **sempre que é aberto** e por uma tarefa em segundo plano, mas isso não é garantia absoluta.
- O envio de mensagens depende do WhatsApp instalado e é feito **um contato por vez**, com confirmação sua.
- O APK de debug assinado não serve para a Play Store.
- A compilação final (Gradle) e o visual no aparelho não foram validados em todos os modelos de celular. Se você achar um problema, abra uma *issue*.

---

## 🗂️ Estrutura do projeto

```
App.js                      entrada: fontes, permissão, reagendamento
app.json / eas.json         configuração Expo / EAS
.github/workflows/          build do APK no GitHub Actions
assets/                     ícone, splash e ícone de notificação (provisórios)
src/theme/                  paleta "Moderno" (claro e escuro) e tipografia
src/db/                     SQLite, CRUD, recorrência, backup, resumo mensal, mensagens
src/notifications/          agendamento local e tarefa em segundo plano
src/navigation/             4 abas (ícones) e telas empilhadas
src/screens/                Agenda, Resumo, Mensagens, Configurações, listas e formulários
src/components/             FabMenu (botão +), SectionCard, PendenciaItem, FadeInView
src/utils/datas.js          datas no fuso local do aparelho
```

**Tecnologias:** React Native, Expo (managed + `expo prebuild`), React Navigation, `expo-sqlite`, `expo-notifications`, `expo-task-manager`, `expo-background-fetch`, `expo-file-system`, `expo-document-picker`, `expo-contacts`, `@react-native-community/datetimepicker`, `@expo/vector-icons`.

---

## 🤝 Contribuir

Este é um projeto pessoal, mantido no tempo livre, então não prometo prazo. Mesmo assim, ajuda é bem-vinda:

- **Achou um bug?** Abra uma *issue* dizendo o modelo do celular, a versão do Android e o que aconteceu.
- **Quer sugerir algo?** Abra uma *issue* explicando a necessidade do dia a dia pastoral por trás da ideia.
- **Quer mexer no código?** Faça um *fork* e abra um *pull request* pequeno e focado. Antes de enviar, rode `npx expo export --platform android` para garantir que o código empacota.

---

## Sobre

Feito por **Gabriel**, pastor e desenvolvedor, sob a marca **Souza Apps**, para uso pessoal no ministério. Compartilhado na esperança de que ajude outros pastores, líderes e secretários a cuidar melhor das pessoas.

> *"Tudo, porém, seja feito com decência e ordem."* (1 Coríntios 14.40)

<!--
  Licença: ainda não definida. Antes de tornar o repositório público, escolha uma
  (por exemplo MIT) e adicione um arquivo LICENSE. Sem licença, o código fica com
  todos os direitos reservados, e outras pessoas não têm permissão formal de reutilizá-lo.
-->
