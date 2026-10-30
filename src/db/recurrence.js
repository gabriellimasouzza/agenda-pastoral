// Gera ocorrências de um compromisso dentro de uma janela de datas [inicio, fim],
// já aplicando exceções (edição/cancelamento de uma ocorrência específica).
// Datas são strings 'YYYY-MM-DD' para evitar problemas de fuso horário.

function toDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function toStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function nthWeekdayOfMonth(year, month, weekday, position) {
  // position: 1..4 = primeira..quarta ocorrência; -1 = última
  if (position === -1) {
    const last = new Date(year, month + 1, 0);
    const diff = (last.getDay() - weekday + 7) % 7;
    return new Date(year, month, last.getDate() - diff);
  }
  const first = new Date(year, month, 1);
  const diff = (weekday - first.getDay() + 7) % 7;
  const day = 1 + diff + (position - 1) * 7;
  const date = new Date(year, month, day);
  if (date.getMonth() !== month) return null; // esse mês não tem essa ocorrência
  return date;
}

export function gerarOcorrencias(compromisso, excecoes, inicioStr, fimStr) {
  const inicio = toDate(inicioStr);
  const fim = toDate(fimStr);
  const dataBase = toDate(compromisso.data);
  const excecoesPorData = new Map(excecoes.map((e) => [e.data_original, e]));
  const ocorrencias = [];

  function push(dataOcorrencia) {
    const str = toStr(dataOcorrencia);
    const excecao = excecoesPorData.get(str);
    if (excecao && excecao.cancelada) return;
    ocorrencias.push({
      ...compromisso,
      data: str,
      titulo: excecao?.titulo ?? compromisso.titulo,
      horario: excecao?.horario ?? compromisso.horario,
      local: excecao?.local ?? compromisso.local,
      observacao: excecao?.observacao ?? compromisso.observacao,
      isExcecao: !!excecao,
    });
  }

  if (compromisso.recorrencia_tipo === 'nenhuma') {
    if (dataBase >= inicio && dataBase <= fim) push(dataBase);
    return ocorrencias;
  }

  if (compromisso.recorrencia_tipo === 'semanal') {
    let cursor = new Date(Math.max(dataBase, inicio));
    // avança até o dia da semana correto
    const alvo = compromisso.recorrencia_dia_semana;
    while (cursor.getDay() !== alvo) cursor.setDate(cursor.getDate() + 1);
    while (cursor <= fim) {
      if (cursor >= dataBase) push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 7);
    }
    return ocorrencias;
  }

  if (compromisso.recorrencia_tipo === 'mensal_dia_fixo') {
    const dia = dataBase.getDate();
    let cursor = new Date(inicio.getFullYear(), inicio.getMonth(), 1);
    while (cursor <= fim) {
      const candidato = new Date(cursor.getFullYear(), cursor.getMonth(), dia);
      if (candidato.getMonth() === cursor.getMonth() && candidato >= dataBase && candidato >= inicio && candidato <= fim) {
        push(candidato);
      }
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return ocorrencias;
  }

  if (compromisso.recorrencia_tipo === 'mensal_posicao') {
    let cursor = new Date(inicio.getFullYear(), inicio.getMonth(), 1);
    while (cursor <= fim) {
      const candidato = nthWeekdayOfMonth(
        cursor.getFullYear(),
        cursor.getMonth(),
        compromisso.recorrencia_dia_semana,
        compromisso.recorrencia_posicao
      );
      if (candidato && candidato >= dataBase && candidato >= inicio && candidato <= fim) {
        push(candidato);
      }
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return ocorrencias;
  }

  return ocorrencias;
}
