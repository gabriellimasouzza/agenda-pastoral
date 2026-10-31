import { listarOcorrenciasNaJanela } from './compromissos';
import { listarAniversariantes, dataEfetivaNoAno } from './aniversariantes';
import { listarDatasImportantes } from './datasImportantes';
import { dataLocalStr, somarDias } from '../utils/datas';

// Quantos dias cabem numa "semana" da agenda: hoje + 7 seguintes.
export const DIAS_POR_BLOCO = 8;

const ROTULO_TIPO_DATA = { casamento: 'Casamento', falecimento: 'Falecimento', outro: 'Outro' };

// Ordem dentro do dia: compromissos com horário (por hora), depois compromissos
// sem horário, depois aniversários, depois datas importantes.
function chaveOrdem(item) {
  if (item.tipo === 'compromisso') return item.horario ? `0-${item.horario}` : '1-';
  if (item.tipo === 'aniversario') return '2-';
  return '3-';
}

/**
 * Monta a agenda de `dias` dias a partir de `inicio` (Date).
 * Retorna só os dias que têm algo: [{ data: 'YYYY-MM-DD', itens: [...] }].
 * Pendências NÃO entram (não têm data).
 */
export async function montarAgenda(inicio, dias = DIAS_POR_BLOCO) {
  const fim = somarDias(inicio, dias - 1);
  const [ocorrencias, aniversariantes, datas] = await Promise.all([
    listarOcorrenciasNaJanela(dataLocalStr(inicio), dataLocalStr(fim)),
    listarAniversariantes(),
    listarDatasImportantes(),
  ]);

  const porDia = new Map();
  const adicionar = (data, item) => {
    if (!porDia.has(data)) porDia.set(data, []);
    porDia.get(data).push(item);
  };

  for (const o of ocorrencias) {
    adicionar(o.data, {
      tipo: 'compromisso',
      id: o.id,
      data: o.data,
      titulo: o.titulo,
      horario: o.horario || null,
      local: o.local || null,
      ministerio: o.ministerio_nome || null,
    });
  }

  for (let i = 0; i < dias; i++) {
    const dia = somarDias(inicio, i);
    const str = dataLocalStr(dia);
    const ano = dia.getFullYear();
    const mes = dia.getMonth() + 1;
    const diaMes = dia.getDate();

    for (const a of aniversariantes) {
      const ef = dataEfetivaNoAno(a.dia, a.mes, ano); // 29/fev -> 28/fev em ano não bissexto
      if (ef.dia === diaMes && ef.mes === mes) {
        adicionar(str, {
          tipo: 'aniversario',
          id: a.id,
          data: str,
          titulo: `Aniversário de ${a.nome}`,
          detalhe: a.ano ? `completa ${ano - a.ano} anos` : null,
        });
      }
    }

    for (const d of datas) {
      const ef = dataEfetivaNoAno(d.dia, d.mes, ano);
      if (ef.dia === diaMes && ef.mes === mes) {
        const rotulo = ROTULO_TIPO_DATA[d.tipo] || 'Outro';
        const anos = d.ano && d.tipo !== 'outro' ? ` · ${ano - d.ano} anos` : '';
        adicionar(str, {
          tipo: 'data',
          id: d.id,
          data: str,
          titulo: d.nome,
          detalhe: `${rotulo}${anos}`,
        });
      }
    }
  }

  return [...porDia.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([data, itens]) => ({
      data,
      itens: itens
        .map((item, idx) => ({ item, idx }))
        .sort((x, y) => chaveOrdem(x.item).localeCompare(chaveOrdem(y.item)) || x.idx - y.idx)
        .map((x) => x.item),
    }));
}
