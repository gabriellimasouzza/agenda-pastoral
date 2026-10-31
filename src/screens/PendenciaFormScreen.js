import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { getDb } from '../db/database';
import { criarPendencia, atualizarPendencia, apagarPendencia } from '../db/pendencias';
import { listarMinisterios } from '../db/ministerios';

export default function PendenciaFormScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { colors, fonts, radius } = useTheme();
  const { id } = route.params || {};
  const [titulo, setTitulo] = useState('');
  const [ministerio, setMinisterio] = useState(null);
  const [observacao, setObservacao] = useState('');
  const [ministerios, setMinisterios] = useState([]);

  useEffect(() => {
    navigation.setOptions({ title: id ? 'Editar pendência' : 'Nova pendência' });
    listarMinisterios().then(setMinisterios);
    if (id) {
      (async () => {
        const db = await getDb();
        const item = await db.getFirstAsync('SELECT * FROM pendencias WHERE id=?', id);
        if (item) {
          setTitulo(item.titulo); setMinisterio(item.ministerio_nome); setObservacao(item.observacao || '');
        }
      })();
    }
  }, [id]);

  async function salvar() {
    if (!titulo.trim()) { Alert.alert('Confira os dados', 'O título é obrigatório.'); return; }
    const dados = { titulo, ministerio_nome: ministerio, observacao };
    if (id) await atualizarPendencia(id, dados);
    else await criarPendencia(dados);
    navigation.goBack();
  }

  function confirmarExclusao() {
    Alert.alert('Apagar', `Apagar "${titulo}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar', style: 'destructive', onPress: async () => { await apagarPendencia(id); navigation.goBack(); } },
    ]);
  }

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ padding: 20, paddingBottom: 40 + insets.bottom }}>
      <Campo label="Título" value={titulo} onChangeText={setTitulo} colors={colors} fonts={fonts} />

      <Text style={[styles.label, { color: colors.textSecondary, fontFamily: fonts.bodyMedium }]}>Ministério (opcional)</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        <Chip texto="Nenhum" ativo={!ministerio} onPress={() => setMinisterio(null)} colors={colors} fonts={fonts} />
        {ministerios.map((m) => (
          <Chip key={m.id} texto={m.nome} ativo={ministerio === m.nome} onPress={() => setMinisterio(m.nome)} colors={colors} fonts={fonts} />
        ))}
      </View>

      <Campo label="Observação (opcional)" value={observacao} onChangeText={setObservacao} multiline colors={colors} fonts={fonts} />

      <Pressable style={[styles.botaoPrimario, { backgroundColor: colors.primary, borderRadius: radius.md }]} onPress={salvar}>
        <Text style={{ color: colors.onPrimary, fontSize: 15, fontFamily: fonts.bodyBold }}>Salvar</Text>
      </Pressable>
      {id && (
        <Pressable style={[styles.botaoSecundario, { borderColor: colors.danger, borderRadius: radius.md }]} onPress={confirmarExclusao}>
          <Text style={{ color: colors.danger, fontSize: 15, fontFamily: fonts.bodyMedium }}>Apagar</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

function Campo({ label, colors, fonts, style, ...props }) {
  return (
    <View style={[{ marginBottom: 16 }, style]}>
      <Text style={[styles.label, { color: colors.textSecondary, fontFamily: fonts.bodyMedium }]}>{label}</Text>
      <TextInput {...props} style={[styles.input, { borderColor: colors.border, color: colors.textPrimary, fontFamily: fonts.body, backgroundColor: colors.inputBackground }]} placeholderTextColor={colors.textSecondary} />
    </View>
  );
}

function Chip({ texto, ativo, onPress, colors, fonts }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, { borderColor: colors.border, backgroundColor: ativo ? colors.primary : colors.card }]}>
      <Text style={{ color: ativo ? colors.onPrimary : colors.textPrimary, fontFamily: fonts.body, fontSize: 13 }}>{texto}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 15 },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1 },
  botaoPrimario: { padding: 14, alignItems: 'center', marginTop: 8 },
  botaoSecundario: { padding: 14, alignItems: 'center', marginTop: 12, borderWidth: 1 },
});
