import { getDb } from './database';

export async function listarAniversariantes() {
  const db = await getDb();
  return db.getAllAsync('SELECT * FROM aniversariantes ORDER BY mes, dia');
}

export async function criarAniversariante({ nome, dia, mes, ano, observacao }) {
  const db = await getDb();
  return db.runAsync(
    'INSERT INTO aniversariantes (nome, dia, mes, ano, observacao) VALUES (?, ?, ?, ?, ?)',
    nome.trim(), dia, mes, ano || null, observacao || null
  );
}

export async function atualizarAniversariante(id, { nome, dia, mes, ano, observacao }) {
  const db = await getDb();
  return db.runAsync(
    'UPDATE aniversariantes SET nome=?, dia=?, mes=?, ano=?, observacao=? WHERE id=?',
    nome.trim(), dia, mes, ano || null, observacao || null, id
  );
}

export async function apagarAniversariante(id) {
  const db = await getDb();
  return db.runAsync('DELETE FROM aniversariantes WHERE id=?', id);
}

export function calcularIdade(ano, mes, dia, hoje = new Date()) {
  if (!ano) return null;
  let idade = hoje.getFullYear() - ano;
  const aindaNaoFezAniversario =
    hoje.getMonth() + 1 < mes || (hoje.getMonth() + 1 === mes && hoje.getDate() < dia);
  if (aindaNaoFezAniversario) idade -= 1;
  return idade;
}

// 29/fev em ano não bissexto: a data de referência (pra ordenação e notificação)
// vira 28/fev, conforme decidido na especificação.
export function dataEfetivaNoAno(dia, mes, ano) {
  if (mes === 2 && dia === 29 && !bissexto(ano)) return { dia: 28, mes: 2 };
  return { dia, mes };
}

function bissexto(ano) {
  return (ano % 4 === 0 && ano % 100 !== 0) || ano % 400 === 0;
}
