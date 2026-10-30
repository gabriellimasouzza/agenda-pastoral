/**
 * SOBRE ESTA ABORDAGEM (leia antes de confiar 100%):
 *
 * O Android limpa os alarmes agendados quando o celular reinicia — isso é uma
 * limitação da própria plataforma, não do Expo. Existem duas formas de
 * mitigar isso:
 *
 *  1) Reagendar toda vez que o app é aberto (App.js já faz isso). Garantido,
 *     mas só funciona se você abrir o app de tempos em tempos.
 *
 *  2) Uma tarefa em segundo plano que o Android executa periodicamente
 *     (não instantaneamente no boot, mas em intervalos — o sistema decide o
 *     intervalo real com base em bateria/uso, tipicamente a cada poucas
 *     horas). É o que está implementado aqui, via expo-task-manager +
 *     expo-background-fetch, que são suportados oficialmente pelo Expo em
 *     managed workflow — ao contrário de um BroadcastReceiver nativo
 *     escrito à mão, que eu decidi não te entregar sem poder testar.
 *
 * Isso NÃO é uma garantia absoluta de disparo exatamente no boot. É uma rede
 * de segurança adicional. Teste na prática: reinicie o celular, espere
 * algumas horas sem abrir o app, e confira se as notificações continuam
 * agendadas (dá pra conferir isso com Notifications.getAllScheduledNotificationsAsync()
 * numa tela de debug, por exemplo).
 */
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { reagendarTudo } from './notificationService';

const TASK_NAME = 'agenda-pastoral-reagendar-notificacoes';

TaskManager.defineTask(TASK_NAME, async () => {
  try {
    await reagendarTudo();
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (erro) {
    console.error('Falha ao reagendar em segundo plano:', erro);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registrarTarefaEmSegundoPlano() {
  const jaRegistrada = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
  if (jaRegistrada) return;
  await BackgroundFetch.registerTaskAsync(TASK_NAME, {
    minimumInterval: 60 * 60 * 6, // pede a cada 6h; o sistema decide o intervalo real
    stopOnTerminate: false,
    startOnBoot: true,
  });
}
