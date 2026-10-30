import React, { useCallback, useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { listarMinisterios, criarMinisterio, renomearMinisterio, apagarMinisterio } from '../db/ministerios';
import { exportarBackup, importarBackup } from '../db/backup';
import { reagendarTudo } from '../notifications/notificationService';

export default function SettingsScreen() {
  const { colors, fonts, radius } = useTheme();
  const [ministerios, setMinisterios] = useState([]);
  const [novoNome, setNovoNome] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [nomeEditado, setNomeEditado] = useState('');

  const carregar = useCallback(() => { listarMinisterios().then(setMinisterios); }, []);
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
        contentContainerStyle={{ padding: 20 }}
        data={ministerios}
        keyExtractor={(m) => String(m.id)}
        ListHeaderComponent={
          <>
            <SecaoBackup colors={colors} fonts={fonts} radius={radius} onExportar={exportarBackup} onImportar={confirmarImportar} />
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

function SecaoBackup({ colors, fonts, radius, onExportar, onImportar }) {
  return (
    <View style={{ marginBottom: 28 }}>
      <Text style={[styles.tituloSecao, { color: colors.textPrimary, fontFamily: fonts.title }]}>Backup</Text>
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
});
