import { getDb } from './database';

export async function listarPendenciasAbertas() {
  const db = await getDb();
  return db.getAllAsync('SELECT * FROM pendencias WHERE concluida=0 ORDER BY criada_em');
}

export async function criarPendencia({ titulo, ministerio_nome, observacao }) {
  const db = await getDb();
  return db.runAsync(
    'INSERT INTO pendencias (titulo, ministerio_nome, observacao, concluida, criada_em) VALUES (?,?,?,0,?)',
    titulo.trim(), ministerio_nome || null, observacao || null, new Date().toISOString()
  );
}

export async function atualizarPendencia(id, { titulo, ministerio_nome, observacao }) {
  const db = await getDb();
  return db.runAsync(
    'UPDATE pendencias SET titulo=?, ministerio_nome=?, observacao=? WHERE id=?',
    titulo.trim(), ministerio_nome || null, observacao || null, id
  );
}

// Concluir uma pendência = apagá-la de vez (sem arquivo, sem restaurar).
export async function apagarPendencia(id) {
  const db = await getDb();
  return db.runAsync('DELETE FROM pendencias WHERE id=?', id);
}
