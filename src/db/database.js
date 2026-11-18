import * as SQLite from 'expo-sqlite';

let dbInstance = null;

export async function getDb() {
  if (dbInstance) return dbInstance;
  dbInstance = await SQLite.openDatabaseAsync('agenda_pastoral.db');
  await migrate(dbInstance);
  return dbInstance;
}

const MINISTERIOS_PADRAO = [
  'Patrimônio e Finanças',
  'Crianças',
  'Mulheres',
  'Homens',
  'Intercessão',
  'Ministério de Música',
  'Ação Social',
  'Diaconia',
  'Juvenis',
  'Jovens',
  'Apoio Pastoral',
];

async function migrate(db) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS ministerios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL UNIQUE,
      ativo INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS aniversariantes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      dia INTEGER NOT NULL,
      mes INTEGER NOT NULL,
      ano INTEGER,
      observacao TEXT
    );

    CREATE TABLE IF NOT EXISTS datas_importantes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      tipo TEXT NOT NULL CHECK (tipo IN ('casamento','falecimento','outro')),
      dia INTEGER NOT NULL,
      mes INTEGER NOT NULL,
      ano INTEGER,
      observacao TEXT
    );

    -- Compromissos: a linha "mestre" define a regra (inclusive pontuais, que
    -- simplesmente não têm recorrência). Exceções de uma ocorrência específica
    -- (editar/apagar só aquele dia de uma série) vão na tabela de exceções.
    CREATE TABLE IF NOT EXISTS compromissos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      data TEXT NOT NULL,          -- data de início, formato YYYY-MM-DD
      horario TEXT,                -- HH:MM, opcional
      local TEXT,
      ministerio_nome TEXT,        -- guarda o nome (congela se o ministério for apagado)
      observacao TEXT,
      recorrencia_tipo TEXT NOT NULL DEFAULT 'nenhuma'
        CHECK (recorrencia_tipo IN ('nenhuma','semanal','mensal_dia_fixo','mensal_posicao')),
      recorrencia_dia_semana INTEGER,   -- 0=domingo..6=sábado (semanal e mensal_posicao)
      recorrencia_posicao INTEGER,      -- 1..4 ou -1 (última) — só mensal_posicao
      lembrete_ativo INTEGER NOT NULL DEFAULT 1,
      lembrete_dias_antes INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS compromisso_excecoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      compromisso_id INTEGER NOT NULL REFERENCES compromissos(id) ON DELETE CASCADE,
      data_original TEXT NOT NULL,   -- qual ocorrência da série está sendo alterada
      cancelada INTEGER NOT NULL DEFAULT 0,
      titulo TEXT,
      horario TEXT,
      local TEXT,
      observacao TEXT
    );

    CREATE TABLE IF NOT EXISTS pendencias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      ministerio_nome TEXT,
      observacao TEXT,
      concluida INTEGER NOT NULL DEFAULT 0,
      criada_em TEXT NOT NULL,
      concluida_em TEXT
    );

    CREATE TABLE IF NOT EXISTS msg_modelos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      texto TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS msg_contatos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      telefone TEXT NOT NULL UNIQUE,
      enviado INTEGER NOT NULL DEFAULT 0,
      selecionado INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS config (
      chave TEXT PRIMARY KEY,
      valor TEXT
    );
  `);

  const row = await db.getFirstAsync('SELECT COUNT(*) as total FROM ministerios');
  if (row.total === 0) {
    for (const nome of MINISTERIOS_PADRAO) {
      await db.runAsync('INSERT INTO ministerios (nome, ativo) VALUES (?, 1)', nome);
    }
  }
}
