import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { listarAniversariantes, dataEfetivaNoAno } from '../db/aniversariantes';
import { listarDatasImportantes } from '../db/datasImportantes';
import { listarOcorrenciasNaJanela } from '../db/compromissos';
import { listarPendenciasAbertas } from '../db/pendencias';
import { dataLocalStr } from '../utils/datas';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false, // barra de notificação, sem alarme/som
    shouldSetBadge: false,
  }),
});

export async function pedirPermissao() {
  const { status: atual } = await Notifications.getPermissionsAsync();
  if (atual === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// Janela de geração: próximos 60 dias é suficiente pra cobrir qualquer combinação
// de "dias de antecedência" configurada nos compromissos, sem gerar volume excessivo.
const DIAS_JANELA = 60;

export async function reagendarTudo() {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const hoje = new Date();
  const fim = new Date(hoje);
  fim.setDate(fim.getDate() + DIAS_JANELA);

  await agendarAniversarios(hoje, fim);
  await agendarDatasImportantes(hoje, fim);
  await agendarCompromissos(hoje, fim);
  await agendarPendencias();
}

// Enquanto houver pendência em aberto: um aviso todo dia às 07h (repete sozinho).
// Se não houver nenhuma, nada é agendado. Toda criação/edição/conclusão chama reagendarTudo.
async function agendarPendencias() {
  const abertas = await listarPendenciasAbertas();
  if (abertas.length === 0) return;
  const n = abertas.length;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Pendências',
      body: n === 1 ? 'Você tem 1 pendência em aberto.' : `Você tem ${n} pendências em aberto.`,
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 7, minute: 0 },
  });
}

function proximaOcorrenciaAnual(dia, mes, hoje) {
  let data = new Date(hoje.getFullYear(), mes - 1, dia);
  if (data < new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())) {
    data = new Date(hoje.getFullYear() + 1, mes - 1, dia);
  }
  return data;
}

async function agendarNotificacaoVesperaEDia(titulo, corpo, diaAlvo, mesAlvo, hoje, fim) {
  const dataAlvo = proximaOcorrenciaAnual(diaAlvo, mesAlvo, hoje);
  if (dataAlvo > fim) return;

  const vespera = new Date(dataAlvo);
  vespera.setDate(vespera.getDate() - 1);
  vespera.setHours(18, 0, 0, 0);
  if (vespera > new Date()) {
    await Notifications.scheduleNotificationAsync({
      content: { title: titulo, body: corpo },
      trigger: vespera,
    });
  }

  const diaDe = new Date(dataAlvo);
  diaDe.setHours(7, 0, 0, 0);
  if (diaDe > new Date()) {
    await Notifications.scheduleNotificationAsync({
      content: { title: titulo, body: corpo },
      trigger: diaDe,
    });
  }
}

async function agendarAniversarios(hoje, fim) {
  const lista = await listarAniversariantes();
  for (const pessoa of lista) {
    const { dia, mes } = dataEfetivaNoAno(pessoa.dia, pessoa.mes, hoje.getFullYear());
    await agendarNotificacaoVesperaEDia(
      'Aniversário',
      `${pessoa.nome} faz aniversário`,
      dia, mes, hoje, fim
    );
  }
}

async function agendarDatasImportantes(hoje, fim) {
  const lista = await listarDatasImportantes();
  const rotulos = { casamento: 'Casamento', falecimento: 'Falecimento', outro: 'Data importante' };
  for (const item of lista) {
    await agendarNotificacaoVesperaEDia(
      rotulos[item.tipo] || 'Data importante',
      item.nome,
      item.dia, item.mes, hoje, fim
    );
  }
}

async function agendarCompromissos(hoje, fim) {
  const ocorrencias = await listarOcorrenciasNaJanela(
    dataLocalStr(hoje),
    dataLocalStr(fim)
  );
  for (const oc of ocorrencias) {
    if (!oc.lembrete_ativo) continue;
    const [y, m, d] = oc.data.split('-').map(Number);
    const dataCompromisso = new Date(y, m - 1, d);
    const disparo = new Date(dataCompromisso);
    disparo.setDate(disparo.getDate() - (oc.lembrete_dias_antes ?? 1));
    disparo.setHours(7, 0, 0, 0);
    if (disparo > new Date()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Compromisso',
          body: oc.horario ? `${oc.titulo} às ${oc.horario}` : oc.titulo,
        },
        trigger: disparo,
      });
    }
  }
}
