import { getDb } from './database';

export async function listarDatasImportantes() {
  const db = await getDb();
  return db.getAllAsync('SELECT * FROM datas_importantes ORDER BY mes, dia');
}

export async function criarDataImportante({ nome, tipo, dia, mes, ano, observacao }) {
  const db = await getDb();
  return db.runAsync(
    'INSERT INTO datas_importantes (nome, tipo, dia, mes, ano, observacao) VALUES (?, ?, ?, ?, ?, ?)',
    nome.trim(), tipo, dia, mes, ano || null, observacao || null
  );
}

export async function atualizarDataImportante(id, { nome, tipo, dia, mes, ano, observacao }) {
  const db = await getDb();
  return db.runAsync(
    'UPDATE datas_importantes SET nome=?, tipo=?, dia=?, mes=?, ano=?, observacao=? WHERE id=?',
    nome.trim(), tipo, dia, mes, ano || null, observacao || null, id
  );
}

export async function apagarDataImportante(id) {
  const db = await getDb();
  return db.runAsync('DELETE FROM datas_importantes WHERE id=?', id);
}

export const TIPOS_DATA_IMPORTANTE = [
  { valor: 'casamento', rotulo: 'Casamento' },
  { valor: 'falecimento', rotulo: 'Falecimento' },
  { valor: 'outro', rotulo: 'Outro' },
];
