import { getDb } from './database';

// ---- Config simples (rascunho da mensagem e sigla da busca) ----
export async function lerConfig(chave) {
  const db = await getDb();
  const r = await db.getFirstAsync('SELECT valor FROM config WHERE chave=?', chave);
  return r ? r.valor : '';
}
export async function salvarConfig(chave, valor) {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO config (chave, valor) VALUES (?, ?) ON CONFLICT(chave) DO UPDATE SET valor=excluded.valor',
    chave, valor
  );
}

// ---- Modelos ----
export async function listarModelos() {
  const db = await getDb();
  return db.getAllAsync('SELECT * FROM msg_modelos ORDER BY nome COLLATE NOCASE');
}
// Mesmo nome (sem diferenciar maiúsculas) atualiza o modelo existente.
export async function salvarModelo(nome, texto) {
  const db = await getDb();
  const ex = await db.getFirstAsync('SELECT id FROM msg_modelos WHERE lower(nome)=lower(?)', nome.trim());
  if (ex) {
    await db.runAsync('UPDATE msg_modelos SET texto=? WHERE id=?', texto, ex.id);
    return ex.id;
  }
  const r = await db.runAsync('INSERT INTO msg_modelos (nome, texto) VALUES (?, ?)', nome.trim(), texto);
  return r.lastInsertRowId;
}
export async function excluirModelo(id) {
  const db = await getDb();
  await db.runAsync('DELETE FROM msg_modelos WHERE id=?', id);
}

// ---- Contatos ----
export async function listarContatosMsg() {
  const db = await getDb();
  return db.getAllAsync('SELECT * FROM msg_contatos ORDER BY id');
}

// Só dígitos; 10-11 dígitos ganham o 55 do Brasil. Retorna null se for curto demais.
export function normalizarTelefone(bruto) {
  let t = String(bruto || '').replace(/\D/g, '');
  if (t.length < 10) return null;
  if (t.length <= 11) t = '55' + t;
  return t;
}

// Adiciona só os que ainda não existem (pelo telefone). Retorna quantos entraram.
export async function adicionarContatosMsg(lista) {
  const db = await getDb();
  let novos = 0;
  for (const c of lista) {
    const r = await db.runAsync(
      'INSERT OR IGNORE INTO msg_contatos (nome, telefone, enviado, selecionado) VALUES (?, ?, 0, 1)',
      c.nome, c.telefone
    );
    if (r.changes > 0) novos++;
  }
  return novos;
}

export async function marcarEnviado(id) {
  const db = await getDb();
  await db.runAsync('UPDATE msg_contatos SET enviado=1 WHERE id=?', id);
}
export async function alternarSelecionado(id) {
  const db = await getDb();
  await db.runAsync('UPDATE msg_contatos SET selecionado = 1 - selecionado WHERE id=?', id);
}
export async function definirSelecionados(ids, valor) {
  const db = await getDb();
  for (const id of ids) await db.runAsync('UPDATE msg_contatos SET selecionado=? WHERE id=?', valor ? 1 : 0, id);
}
export async function limparEnvios() {
  const db = await getDb();
  await db.runAsync('UPDATE msg_contatos SET enviado=0');
}
export async function removerContatoMsg(id) {
  const db = await getDb();
  await db.runAsync('DELETE FROM msg_contatos WHERE id=?', id);
}
export async function apagarListaMsg() {
  const db = await getDb();
  await db.runAsync('DELETE FROM msg_contatos');
}
