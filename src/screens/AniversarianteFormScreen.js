import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { getDb } from '../db/database';
import {
  criarAniversariante, atualizarAniversariante, apagarAniversariante,
} from '../db/aniversariantes';
import { reagendarTudo } from '../notifications/notificationService';

export default function AniversarianteFormScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { colors, fonts, spacing, radius } = useTheme();
  const { id } = route.params || {};
  const [nome, setNome] = useState('');
  const [dia, setDia] = useState('');
  const [mes, setMes] = useState('');
  const [ano, setAno] = useState('');
  const [observacao, setObservacao] = useState('');

  useEffect(() => {
    navigation.setOptions({ title: id ? 'Editar aniversariante' : 'Novo aniversariante' });
    if (id) {
      (async () => {
        const db = await getDb();
        const item = await db.getFirstAsync('SELECT * FROM aniversariantes WHERE id=?', id);
        if (item) {
          setNome(item.nome);
          setDia(String(item.dia));
          setMes(String(item.mes));
          setAno(item.ano ? String(item.ano) : '');
          setObservacao(item.observacao || '');
        }
      })();
    }
  }, [id]);

  async function salvar() {
    const diaNum = parseInt(dia, 10);
    const mesNum = parseInt(mes, 10);
    if (!nome.trim() || !diaNum || !mesNum || mesNum < 1 || mesNum > 12 || diaNum < 1 || diaNum > 31) {
      Alert.alert('Confira os dados', 'Nome, dia e mês são obrigatórios.');
      return;
    }
    const dados = { nome, dia: diaNum, mes: mesNum, ano: ano ? parseInt(ano, 10) : null, observacao };
    if (id) await atualizarAniversariante(id, dados);
    else await criarAniversariante(dados);
    await reagendarTudo();
    navigation.goBack();
  }

  function confirmarExclusao() {
    Alert.alert('Apagar aniversariante', `Tem certeza que quer apagar ${nome}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Apagar', style: 'destructive', onPress: async () => {
          await apagarAniversariante(id);
          await reagendarTudo();
          navigation.goBack();
        },
      },
    ]);
  }

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ padding: 20, paddingBottom: 40 + insets.bottom }}>
      <Campo label="Nome" value={nome} onChangeText={setNome} colors={colors} fonts={fonts} />
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Campo label="Dia" value={dia} onChangeText={setDia} keyboardType="number-pad" colors={colors} fonts={fonts} style={{ flex: 1 }} />
        <Campo label="Mês" value={mes} onChangeText={setMes} keyboardType="number-pad" colors={colors} fonts={fonts} style={{ flex: 1 }} />
        <Campo label="Ano (opcional)" value={ano} onChangeText={setAno} keyboardType="number-pad" colors={colors} fonts={fonts} style={{ flex: 1.4 }} />
      </View>
      <Campo label="Observação (opcional)" value={observacao} onChangeText={setObservacao} multiline colors={colors} fonts={fonts} />

      <Pressable style={[styles.botaoPrimario, { backgroundColor: colors.primary, borderRadius: radius.md }]} onPress={salvar}>
        <Text style={[styles.botaoTexto, { color: colors.onPrimary, fontFamily: fonts.bodyBold }]}>Salvar</Text>
      </Pressable>

      {id && (
        <Pressable style={[styles.botaoSecundario, { borderColor: colors.danger, borderRadius: radius.md }]} onPress={confirmarExclusao}>
          <Text style={[styles.botaoSecundarioTexto, { color: colors.danger, fontFamily: fonts.bodyMedium }]}>Apagar</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

function Campo({ label, colors, fonts, style, ...props }) {
  return (
    <View style={[{ marginBottom: 16 }, style]}>
      <Text style={[styles.label, { color: colors.textSecondary, fontFamily: fonts.bodyMedium }]}>{label}</Text>
      <TextInput
        {...props}
        style={[
          styles.input,
          { borderColor: colors.border, color: colors.textPrimary, fontFamily: fonts.body, backgroundColor: colors.inputBackground },
        ]}
        placeholderTextColor={colors.textSecondary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 15 },
  botaoPrimario: { padding: 14, alignItems: 'center', marginTop: 8 },
  botaoTexto: { fontSize: 15 },
  botaoSecundario: { padding: 14, alignItems: 'center', marginTop: 12, borderWidth: 1 },
  botaoSecundarioTexto: { fontSize: 15 },
});
