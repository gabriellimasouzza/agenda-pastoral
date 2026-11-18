import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { getDb } from './database';

const TABELAS = [
  'ministerios', 'aniversariantes', 'datas_importantes',
  'compromissos', 'compromisso_excecoes', 'pendencias',
  'msg_modelos', 'msg_contatos',
];

export async function exportarBackup() {
  const db = await getDb();
  const dump = { versao: 1, exportadoEm: new Date().toISOString(), dados: {} };
  for (const tabela of TABELAS) {
    dump.dados[tabela] = await db.getAllAsync(`SELECT * FROM ${tabela}`);
  }

  const nomeArquivo = `agenda-pastoral-backup-${dump.exportadoEm.slice(0, 10)}`;

  // Abre o seletor de pastas do Android (armazenamento) para o usuário escolher onde salvar.
  const SAF = FileSystem.StorageAccessFramework;
  const permissao = await SAF.requestDirectoryPermissionsAsync();
  if (!permissao.granted) return { salvo: false };

  const uri = await SAF.createFileAsync(permissao.directoryUri, nomeArquivo, 'application/json');
  await FileSystem.writeAsStringAsync(uri, JSON.stringify(dump, null, 2), {
    encoding: FileSystem.EncodingType.UTF8,
  });
  await marcarBackupFeitoAgora();
  return { salvo: true, uri };
}

// Importação SUBSTITUI tudo, conforme decidido.
export async function importarBackup() {
  const resultado = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
  if (resultado.canceled) return { importado: false };

  const conteudo = await FileSystem.readAsStringAsync(resultado.assets[0].uri);
  const dump = JSON.parse(conteudo);

  const db = await getDb();
  await db.execAsync('BEGIN TRANSACTION;');
  try {
    for (const tabela of TABELAS) {
      await db.runAsync(`DELETE FROM ${tabela}`);
    }
    for (const tabela of TABELAS) {
      const linhas = dump.dados[tabela] || [];
      for (const linha of linhas) {
        const colunas = Object.keys(linha);
        const placeholders = colunas.map(() => '?').join(',');
        const valores = colunas.map((c) => linha[c]);
        await db.runAsync(
          `INSERT INTO ${tabela} (${colunas.join(',')}) VALUES (${placeholders})`,
          ...valores
        );
      }
    }
    await db.execAsync('COMMIT;');
    return { importado: true };
  } catch (erro) {
    await db.execAsync('ROLLBACK;');
    throw erro;
  }
}

// --- Lembrete mensal de backup ---

export async function obterUltimoBackup() {
  const db = await getDb();
  const row = await db.getFirstAsync("SELECT valor FROM config WHERE chave='ultimo_backup'");
  return row ? new Date(row.valor) : null;
}

export async function precisaLembrarBackup() {
  const db = await getDb();
  const row = await db.getFirstAsync("SELECT valor FROM config WHERE chave='ultimo_backup'");
  if (!row) return true;
  const ultima = new Date(row.valor);
  const diffDias = (Date.now() - ultima.getTime()) / (1000 * 60 * 60 * 24);
  return diffDias >= 30;
}

async function marcarBackupFeitoAgora() {
  const db = await getDb();
  await db.runAsync(
    "INSERT INTO config (chave, valor) VALUES ('ultimo_backup', ?) ON CONFLICT(chave) DO UPDATE SET valor=excluded.valor",
    new Date().toISOString()
  );
}
