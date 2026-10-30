import { getDb } from './database';

export async function listarMinisterios({ apenasAtivos = true } = {}) {
  const db = await getDb();
  const sql = apenasAtivos
    ? 'SELECT * FROM ministerios WHERE ativo = 1 ORDER BY nome'
    : 'SELECT * FROM ministerios ORDER BY nome';
  return db.getAllAsync(sql);
}

export async function criarMinisterio(nome) {
  const db = await getDb();
  return db.runAsync('INSERT INTO ministerios (nome, ativo) VALUES (?, 1)', nome.trim());
}

export async function renomearMinisterio(id, novoNome) {
  const db = await getDb();
  return db.runAsync('UPDATE ministerios SET nome = ? WHERE id = ?', novoNome.trim(), id);
}

// Não apaga de fato: só marca como inativo. Os compromissos/pendências antigos
// já guardam o NOME em texto (não uma referência), então continuam mostrando
// o ministério normalmente mesmo depois disso — é a regra que definimos.
export async function apagarMinisterio(id) {
  const db = await getDb();
  return db.runAsync('UPDATE ministerios SET ativo = 0 WHERE id = ?', id);
}
