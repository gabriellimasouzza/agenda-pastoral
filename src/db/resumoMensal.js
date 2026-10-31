import { listarOcorrenciasNaJanela } from './compromissos';
import { listarAniversariantes, dataEfetivaNoAno } from './aniversariantes';
import { listarDatasImportantes } from './datasImportantes';
import { listarPendenciasAbertas } from './pendencias';
import { dataLocalStr } from '../utils/datas';

/**
 * Dados da aba Resumo: o MÊS DE CALENDÁRIO de `hoje` inteiro (dia 1 ao último dia,
 * inclusive dias que já passaram) + todas as pendências em aberto (não têm data).
 */
export async function montarResumoDoMes(hoje = new Date()) {
  const ano = hoje.getFullYear();
  const mesIdx = hoje.getMonth(); // 0-11
  const primeiro = new Date(ano, mesIdx, 1);
  const ultimo = new Date(ano, mesIdx + 1, 0);

  const [compromissos, aniversariantes, datas, pendencias] = await Promise.all([
    listarOcorrenciasNaJanela(dataLocalStr(primeiro), dataLocalStr(ultimo)),
    listarAniversariantes(),
    listarDatasImportantes(),
    listarPendenciasAbertas(),
  ]);

  // Dia/mês efetivos neste ano (29/fev vira 28/fev em ano não bissexto).
  const doMes = (lista) =>
    lista
      .map((x) => {
        const ef = dataEfetivaNoAno(x.dia, x.mes, ano);
        return { ...x, diaNoMes: ef.dia, mesNoAno: ef.mes };
      })
      .filter((x) => x.mesNoAno === mesIdx + 1)
      .sort((a, b) => a.diaNoMes - b.diaNoMes || a.nome.localeCompare(b.nome, 'pt-BR'));

  return {
    ano,
    mes: mesIdx + 1,
    primeiroDia: dataLocalStr(primeiro),
    ultimoDia: dataLocalStr(ultimo),
    pendencias,
    compromissos, // já vêm ordenados por data e hora
    aniversariantes: doMes(aniversariantes),
    datasImportantes: doMes(datas),
  };
}
