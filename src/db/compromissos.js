import { getDb } from './database';
import { gerarOcorrencias } from './recurrence';

export async function listarCompromissosBrutos() {
  const db = await getDb();
  return db.getAllAsync('SELECT * FROM compromissos');
}

export async function listarExcecoes(compromissoId) {
  const db = await getDb();
  return db.getAllAsync('SELECT * FROM compromisso_excecoes WHERE compromisso_id=?', compromissoId);
}

// Retorna todas as ocorrências (já expandindo recorrência) dentro de uma janela.
export async function listarOcorrenciasNaJanela(inicioStr, fimStr) {
  const db = await getDb();
  const compromissos = await db.getAllAsync('SELECT * FROM compromissos');
  const todasExcecoes = await db.getAllAsync('SELECT * FROM compromisso_excecoes');

  const resultado = [];
  for (const c of compromissos) {
    const excecoesDoCompromisso = todasExcecoes.filter((e) => e.compromisso_id === c.id);
    resultado.push(...gerarOcorrencias(c, excecoesDoCompromisso, inicioStr, fimStr));
  }
  resultado.sort((a, b) => (a.data + (a.horario || '')).localeCompare(b.data + (b.horario || '')));
  return resultado;
}

// Verifica se já existe algo marcado no mesmo dia/horário (aviso de conflito).
export async function existeConflito({ data, horario, ignorarCompromissoId }) {
  if (!horario) return false;
  const ocorrencias = await listarOcorrenciasNaJanela(data, data);
  return ocorrencias.some((o) => o.horario === horario && o.id !== ignorarCompromissoId);
}

export async function criarCompromisso(dados) {
  const db = await getDb();
  const {
    titulo, data, horario, local, ministerio_nome, observacao,
    recorrencia_tipo, recorrencia_dia_semana, recorrencia_posicao,
    lembrete_ativo, lembrete_dias_antes,
  } = dados;
  const result = await db.runAsync(
    `INSERT INTO compromissos
      (titulo, data, horario, local, ministerio_nome, observacao,
       recorrencia_tipo, recorrencia_dia_semana, recorrencia_posicao,
       lembrete_ativo, lembrete_dias_antes)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    titulo.trim(), data, horario || null, local || null, ministerio_nome || null, observacao || null,
    recorrencia_tipo || 'nenhuma', recorrencia_dia_semana ?? null, recorrencia_posicao ?? null,
    lembrete_ativo ? 1 : 0, lembrete_dias_antes ?? 1
  );
  return result.lastInsertRowId;
}

export async function atualizarCompromisso(id, dados, escopo = 'serie') {
  const db = await getDb();
  if (escopo === 'serie') {
    const {
      titulo, data, horario, local, ministerio_nome, observacao,
      recorrencia_tipo, recorrencia_dia_semana, recorrencia_posicao,
      lembrete_ativo, lembrete_dias_antes,
    } = dados;
    return db.runAsync(
      `UPDATE compromissos SET titulo=?, data=?, horario=?, local=?, ministerio_nome=?, observacao=?,
        recorrencia_tipo=?, recorrencia_dia_semana=?, recorrencia_posicao=?,
        lembrete_ativo=?, lembrete_dias_antes=? WHERE id=?`,
      titulo.trim(), data, horario || null, local || null, ministerio_nome || null, observacao || null,
      recorrencia_tipo || 'nenhuma', recorrencia_dia_semana ?? null, recorrencia_posicao ?? null,
      lembrete_ativo ? 1 : 0, lembrete_dias_antes ?? 1, id
    );
  }
  // escopo === 'ocorrencia': cria/atualiza uma exceção pra essa data específica
  const { dataOriginal, titulo, horario, local, observacao } = dados;
  const existente = await db.getFirstAsync(
    'SELECT id FROM compromisso_excecoes WHERE compromisso_id=? AND data_original=?',
    id, dataOriginal
  );
  if (existente) {
    return db.runAsync(
      'UPDATE compromisso_excecoes SET titulo=?, horario=?, local=?, observacao=? WHERE id=?',
      titulo, horario, local, observacao, existente.id
    );
  }
  return db.runAsync(
    'INSERT INTO compromisso_excecoes (compromisso_id, data_original, titulo, horario, local, observacao) VALUES (?,?,?,?,?,?)',
    id, dataOriginal, titulo, horario, local, observacao
  );
}

export async function apagarCompromisso(id, escopo = 'serie', dataOriginal = null) {
  const db = await getDb();
  if (escopo === 'serie') {
    return db.runAsync('DELETE FROM compromissos WHERE id=?', id);
  }
  const existente = await db.getFirstAsync(
    'SELECT id FROM compromisso_excecoes WHERE compromisso_id=? AND data_original=?',
    id, dataOriginal
  );
  if (existente) {
    return db.runAsync('UPDATE compromisso_excecoes SET cancelada=1 WHERE id=?', existente.id);
  }
  return db.runAsync(
    'INSERT INTO compromisso_excecoes (compromisso_id, data_original, cancelada) VALUES (?,?,1)',
    id, dataOriginal
  );
}

export const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
export const POSICOES_MES = [
  { valor: 1, rotulo: '1ª' }, { valor: 2, rotulo: '2ª' },
  { valor: 3, rotulo: '3ª' }, { valor: 4, rotulo: '4ª' },
  { valor: -1, rotulo: 'Última' },
];
