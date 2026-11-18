import React, { useCallback, useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { listarMinisterios, criarMinisterio, renomearMinisterio, apagarMinisterio } from '../db/ministerios';
import { exportarBackup, importarBackup, obterUltimoBackup } from '../db/backup';
import { reagendarTudo } from '../notifications/notificationService';
import { HORARIOS_PADRAO, lerHorarios, salvarHorario, hhmmParaHM, formatarHM } from '../db/horarios';

export default function SettingsScreen() {
  const { colors, fonts, radius } = useTheme();
  const [ministerios, setMinisterios] = useState([]);
  const [novoNome, setNovoNome] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [nomeEditado, setNomeEditado] = useState('');
  const [ultimoBackup, setUltimoBackup] = useState(null);
  const [carregouBackup, setCarregouBackup] = useState(false);
  const [horarios, setHorarios] = useState(HORARIOS_PADRAO);
  const [editandoHorario, setEditandoHorario] = useState(null); // chave do horário com o seletor aberto

  const carregar = useCallback(() => {
    listarMinisterios().then(setMinisterios);
    lerHorarios().then(setHorarios);
    obterUltimoBackup().then((d) => { setUltimoBackup(d); setCarregouBackup(true); });
  }, []);
  useFocusEffect(carregar);

  async function adicionar() {
    if (!novoNome.trim()) return;
    await criarMinisterio(novoNome);
    setNovoNome('');
    carregar();
  }

  async function salvarEdicao(id) {
    if (!nomeEditado.trim()) return;
    await renomearMinisterio(id, nomeEditado);
    setEditandoId(null);
    carregar();
  }

  function confirmarApagar(m) {
    Alert.alert(
      'Remover ministério',
      `Remover "${m.nome}" da lista? Compromissos e pendências antigos continuam mostrando esse nome normalmente.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => apagarMinisterio(m.id).then(carregar) },
      ]
    );
  }

  async function mudarHorario(chave, date) {
    const hhmm = formatarHM(date.getHours(), date.getMinutes());
    await salvarHorario(chave, hhmm);
    setHorarios((h) => ({ ...h, [chave]: hhmm }));
    await reagendarTudo();
  }

  async function exportar() {
    try {
      const r = await exportarBackup();
      if (r.salvo) Alert.alert('Backup salvo', 'O arquivo foi salvo na pasta que você escolheu.');
    } catch (e) {
      Alert.alert('Não foi possível exportar', String(e?.message || e));
    }
    carregar();
  }

  async function confirmarImportar() {
    Alert.alert(
      'Importar backup',
      'Isso vai SUBSTITUIR todos os dados atuais do app pelos dados do arquivo escolhido. Essa ação não pode ser desfeita. Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Substituir tudo', style: 'destructive', onPress: async () => {
            const r = await importarBackup();
            if (r.importado) {
              await reagendarTudo();
              Alert.alert('Pronto', 'Backup importado com sucesso.');
            }
          },
        },
      ]
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        data={ministerios}
        keyExtractor={(m) => String(m.id)}
        ListHeaderComponent={
          <>
            <SecaoBackup colors={colors} fonts={fonts} radius={radius} ultimoBackup={ultimoBackup} carregou={carregouBackup} onExportar={exportar} onImportar={confirmarImportar} />
            <SecaoHorarios
              colors={colors} fonts={fonts} radius={radius} horarios={horarios}
              editando={editandoHorario} setEditando={setEditandoHorario} onMudar={mudarHorario}
            />
            <Text style={[styles.tituloSecao, { color: colors.textPrimary, fontFamily: fonts.title }]}>Ministérios</Text>
            <View style={styles.linhaNovo}>
              <TextInput
                value={novoNome}
                onChangeText={setNovoNome}
                placeholder="Novo ministério"
                placeholderTextColor={colors.textSecondary}
                style={[styles.input, { borderColor: colors.border, color: colors.textPrimary, fontFamily: fonts.body, backgroundColor: colors.inputBackground, flex: 1 }]}
              />
              <Pressable onPress={adicionar} style={[styles.botaoAdicionar, { backgroundColor: colors.primary, borderRadius: radius.sm }]}>
                <Ionicons name="add" size={22} color={colors.onPrimary} />
              </Pressable>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <View style={[styles.itemMinisterio, { backgroundColor: colors.card, borderRadius: radius.md }]}>
            {editandoId === item.id ? (
              <TextInput
                value={nomeEditado}
                onChangeText={setNomeEditado}
                autoFocus
                onSubmitEditing={() => salvarEdicao(item.id)}
                style={[styles.inputInline, { color: colors.textPrimary, fontFamily: fonts.body, borderBottomColor: colors.border }]}
              />
            ) : (
              <Text style={{ color: colors.textPrimary, fontFamily: fonts.body, flex: 1 }}>{item.nome}</Text>
            )}
            <View style={{ flexDirection: 'row', gap: 16 }}>
              {editandoId === item.id ? (
                <Pressable onPress={() => salvarEdicao(item.id)}><Ionicons name="checkmark" size={20} color={colors.primary} /></Pressable>
              ) : (
                <Pressable onPress={() => { setEditandoId(item.id); setNomeEditado(item.nome); }}>
                  <Ionicons name="pencil-outline" size={18} color={colors.textSecondary} />
                </Pressable>
              )}
              <Pressable onPress={() => confirmarApagar(item)}>
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              </Pressable>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const LINHAS_HORARIO = [
  { chave: 'vespera', rotulo: 'Aniversários e datas: véspera' },
  { chave: 'dia', rotulo: 'Aniversários e datas: no dia' },
  { chave: 'compromissos', rotulo: 'Compromissos' },
  { chave: 'pendencias', rotulo: 'Pendências (todo dia)' },
];

function SecaoHorarios({ colors, fonts, radius, horarios, editando, setEditando, onMudar }) {
  return (
    <View style={{ marginBottom: 28 }}>
      <Text style={[styles.tituloSecao, { color: colors.textPrimary, fontFamily: fonts.title }]}>Horário dos avisos</Text>
      {LINHAS_HORARIO.map(({ chave, rotulo }) => {
        const hm = hhmmParaHM(horarios[chave]) || hhmmParaHM(HORARIOS_PADRAO[chave]);
        const valor = new Date();
        valor.setHours(hm.h, hm.m, 0, 0);
        const alterado = horarios[chave] !== HORARIOS_PADRAO[chave];
        return (
          <View key={chave}>
            <Pressable
              style={[styles.botaoBackup, { backgroundColor: colors.card, borderRadius: radius.md, marginBottom: 8, justifyContent: 'space-between' }]}
              onPress={() => setEditando(chave)}
            >
              <Text style={{ color: colors.textPrimary, fontFamily: fonts.body, flex: 1 }}>{rotulo}</Text>
              <Text style={{ color: colors.primary, fontFamily: fonts.bodyBold, fontSize: 16 }}>{horarios[chave]}</Text>
              {alterado ? (
                <Pressable
                  onPress={() => onMudar(chave, (() => { const d = new Date(); const p = hhmmParaHM(HORARIOS_PADRAO[chave]); d.setHours(p.h, p.m, 0, 0); return d; })())}
                  hitSlop={8}
                  style={{ marginLeft: 12 }}
                  accessibilityLabel="Voltar ao padrão"
                >
                  <Ionicons name="refresh-outline" size={18} color={colors.textSecondary} />
                </Pressable>
              ) : null}
            </Pressable>
            {editando === chave && (
              <DateTimePicker
                value={valor}
                mode="time"
                is24Hour
                onChange={(ev, d) => {
                  setEditando(Platform.OS === 'ios' ? chave : null);
                  if (ev.type !== 'dismissed' && d) onMudar(chave, d);
                }}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

function diasDesde(data) {
  return Math.floor((Date.now() - data.getTime()) / (1000 * 60 * 60 * 24));
}

function SecaoBackup({ colors, fonts, radius, ultimoBackup, carregou, onExportar, onImportar }) {
  const dias = ultimoBackup ? diasDesde(ultimoBackup) : null;
  const atrasado = carregou && (!ultimoBackup || dias >= 30);

  let status = '';
  if (carregou) {
    if (!ultimoBackup) status = 'Você ainda não fez nenhum backup.';
    else {
      const d = ultimoBackup;
      const data = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
      status = `Último backup: ${data}` + (dias === 0 ? ' (hoje)' : dias === 1 ? ' (ontem)' : ` (há ${dias} dias)`);
    }
  }

  return (
    <View style={{ marginBottom: 28 }}>
      <Text style={[styles.tituloSecao, { color: colors.textPrimary, fontFamily: fonts.title }]}>Backup</Text>

      {carregou && (
        <View style={[styles.statusBackup, { backgroundColor: atrasado ? colors.banner : colors.card, borderRadius: radius.md }]}>
          <Ionicons
            name={atrasado ? 'alert-circle-outline' : 'checkmark-circle-outline'}
            size={20}
            color={atrasado ? colors.warning : colors.success}
          />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={{ color: colors.textPrimary, fontFamily: fonts.bodyMedium, fontSize: 14 }}>{status}</Text>
            {atrasado && (
              <Text style={{ color: colors.textSecondary, fontFamily: fonts.body, fontSize: 13, marginTop: 2 }}>
                Recomendado: um backup por mês.
              </Text>
            )}
          </View>
        </View>
      )}

      <Pressable style={[styles.botaoBackup, { backgroundColor: colors.card, borderRadius: radius.md }]} onPress={onExportar}>
        <Ionicons name="cloud-upload-outline" size={20} color={colors.primary} />
        <Text style={{ color: colors.textPrimary, fontFamily: fonts.bodyMedium, marginLeft: 10 }}>Exportar dados</Text>
      </Pressable>
      <Pressable style={[styles.botaoBackup, { backgroundColor: colors.card, borderRadius: radius.md, marginTop: 8 }]} onPress={onImportar}>
        <Ionicons name="cloud-download-outline" size={20} color={colors.primary} />
        <Text style={{ color: colors.textPrimary, fontFamily: fonts.bodyMedium, marginLeft: 10 }}>Importar backup (substitui tudo)</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  tituloSecao: { fontSize: 20, marginBottom: 12 },
  linhaNovo: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 15 },
  inputInline: { flex: 1, fontSize: 15, borderBottomWidth: 1 },
  botaoAdicionar: { width: 46, alignItems: 'center', justifyContent: 'center' },
  itemMinisterio: { flexDirection: 'row', alignItems: 'center', padding: 14, marginBottom: 8 },
  botaoBackup: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  statusBackup: { flexDirection: 'row', alignItems: 'center', padding: 14, marginBottom: 10 },
});
