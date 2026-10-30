import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { getDb } from '../db/database';
import {
  criarDataImportante, atualizarDataImportante, apagarDataImportante, TIPOS_DATA_IMPORTANTE,
} from '../db/datasImportantes';
import { reagendarTudo } from '../notifications/notificationService';

export default function DataImportanteFormScreen({ route, navigation }) {
  const { colors, fonts, radius } = useTheme();
  const { id } = route.params || {};
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('casamento');
  const [dia, setDia] = useState('');
  const [mes, setMes] = useState('');
  const [ano, setAno] = useState('');
  const [observacao, setObservacao] = useState('');

  useEffect(() => {
    navigation.setOptions({ title: id ? 'Editar data importante' : 'Nova data importante' });
    if (id) {
      (async () => {
        const db = await getDb();
        const item = await db.getFirstAsync('SELECT * FROM datas_importantes WHERE id=?', id);
        if (item) {
          setNome(item.nome); setTipo(item.tipo);
          setDia(String(item.dia)); setMes(String(item.mes));
          setAno(item.ano ? String(item.ano) : ''); setObservacao(item.observacao || '');
        }
      })();
    }
  }, [id]);

  async function salvar() {
    const diaNum = parseInt(dia, 10), mesNum = parseInt(mes, 10);
    if (!nome.trim() || !diaNum || !mesNum) {
      Alert.alert('Confira os dados', 'Nome, dia e mês são obrigatórios.');
      return;
    }
    const dados = { nome, tipo, dia: diaNum, mes: mesNum, ano: ano ? parseInt(ano, 10) : null, observacao };
    if (id) await atualizarDataImportante(id, dados);
    else await criarDataImportante(dados);
    await reagendarTudo();
    navigation.goBack();
  }

  function confirmarExclusao() {
    Alert.alert('Apagar', `Apagar "${nome}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar', style: 'destructive', onPress: async () => { await apagarDataImportante(id); await reagendarTudo(); navigation.goBack(); } },
    ]);
  }

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ padding: 20 }}>
      <Campo label="Nome" value={nome} onChangeText={setNome} colors={colors} fonts={fonts} />

      <Text style={[styles.label, { color: colors.textSecondary, fontFamily: fonts.bodyMedium }]}>Tipo</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        {TIPOS_DATA_IMPORTANTE.map((t) => (
          <Pressable
            key={t.valor}
            onPress={() => setTipo(t.valor)}
            style={[
              styles.chip,
              { borderColor: colors.border, backgroundColor: tipo === t.valor ? colors.primary : colors.card },
            ]}
          >
            <Text style={{ color: tipo === t.valor ? colors.onPrimary : colors.textPrimary, fontFamily: fonts.body }}>{t.rotulo}</Text>
          </Pressable>
        ))}
      </View>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Campo label="Dia" value={dia} onChangeText={setDia} keyboardType="number-pad" colors={colors} fonts={fonts} style={{ flex: 1 }} />
        <Campo label="Mês" value={mes} onChangeText={setMes} keyboardType="number-pad" colors={colors} fonts={fonts} style={{ flex: 1 }} />
        <Campo label="Ano (opcional)" value={ano} onChangeText={setAno} keyboardType="number-pad" colors={colors} fonts={fonts} style={{ flex: 1.4 }} />
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

const styles = StyleSheet.create({
  label: { fontSize: 13, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 15 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1 },
  botaoPrimario: { padding: 14, alignItems: 'center', marginTop: 8 },
  botaoSecundario: { padding: 14, alignItems: 'center', marginTop: 12, borderWidth: 1 },
});
