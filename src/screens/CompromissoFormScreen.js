import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet, Alert, Switch, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { getDb } from '../db/database';
import {
  criarCompromisso, atualizarCompromisso, apagarCompromisso, existeConflito,
  DIAS_SEMANA, POSICOES_MES,
} from '../db/compromissos';
import { listarMinisterios } from '../db/ministerios';
import { reagendarTudo } from '../notifications/notificationService';

const TIPOS_RECORRENCIA = [
  { valor: 'nenhuma', rotulo: 'Não se repete' },
  { valor: 'semanal', rotulo: 'Semanal' },
  { valor: 'mensal_dia_fixo', rotulo: 'Mensal (dia fixo)' },
  { valor: 'mensal_posicao', rotulo: 'Mensal (ex: 1ª segunda)' },
];

export default function CompromissoFormScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { colors, fonts, radius } = useTheme();
  const { id, data: dataOcorrenciaClicada } = route.params || {};

  const [titulo, setTitulo] = useState('');
  const [data, setData] = useState(new Date());
  const [mostrarDatePicker, setMostrarDatePicker] = useState(false);
  const [temHorario, setTemHorario] = useState(false);
  const [horario, setHorario] = useState(new Date());
  const [mostrarTimePicker, setMostrarTimePicker] = useState(false);
  const [local, setLocal] = useState('');
  const [ministerio, setMinisterio] = useState(null);
  const [observacao, setObservacao] = useState('');
  const [recorrenciaTipo, setRecorrenciaTipo] = useState('nenhuma');
  const [diaSemana, setDiaSemana] = useState(new Date().getDay());
  const [posicaoMes, setPosicaoMes] = useState(1);
  const [lembreteAtivo, setLembreteAtivo] = useState(true);
  const [lembreteDias, setLembreteDias] = useState('1');
  const [ministerios, setMinisterios] = useState([]);

  useEffect(() => {
    navigation.setOptions({ title: id ? 'Editar compromisso' : 'Novo compromisso' });
    listarMinisterios().then(setMinisterios);
    if (id) {
      (async () => {
        const db = await getDb();
        const item = await db.getFirstAsync('SELECT * FROM compromissos WHERE id=?', id);
        if (item) {
          setTitulo(item.titulo);
          setData(new Date(item.data + 'T00:00:00'));
          if (item.horario) {
            setTemHorario(true);
            const [h, m] = item.horario.split(':').map(Number);
            const d = new Date(); d.setHours(h, m, 0, 0);
            setHorario(d);
          }
          setLocal(item.local || '');
          setMinisterio(item.ministerio_nome);
          setObservacao(item.observacao || '');
          setRecorrenciaTipo(item.recorrencia_tipo);
          if (item.recorrencia_dia_semana != null) setDiaSemana(item.recorrencia_dia_semana);
          if (item.recorrencia_posicao != null) setPosicaoMes(item.recorrencia_posicao);
          setLembreteAtivo(!!item.lembrete_ativo);
          setLembreteDias(String(item.lembrete_dias_antes ?? 1));
        }
      })();
    }
  }, [id]);

  function horarioStr() {
    if (!temHorario) return null;
    return `${String(horario.getHours()).padStart(2, '0')}:${String(horario.getMinutes()).padStart(2, '0')}`;
  }
  function dataStr(d = data) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  async function montarDados() {
    return {
      titulo, data: dataStr(), horario: horarioStr(), local, ministerio_nome: ministerio, observacao,
      recorrencia_tipo: recorrenciaTipo,
      recorrencia_dia_semana: (recorrenciaTipo === 'semanal' || recorrenciaTipo === 'mensal_posicao') ? diaSemana : null,
      recorrencia_posicao: recorrenciaTipo === 'mensal_posicao' ? posicaoMes : null,
      lembrete_ativo: lembreteAtivo, lembrete_dias_antes: parseInt(lembreteDias, 10) || 1,
    };
  }

  async function salvar() {
    if (!titulo.trim()) { Alert.alert('Confira os dados', 'O título é obrigatório.'); return; }

    const conflito = await existeConflito({ data: dataStr(), horario: horarioStr(), ignorarCompromissoId: id });
    if (conflito) {
      Alert.alert(
        'Já existe algo nesse horário',
        'Você já tem outro compromisso marcado nesse mesmo dia e horário. Quer salvar assim mesmo?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Salvar assim mesmo', onPress: confirmarSalvar },
        ]
      );
      return;
    }
    await confirmarSalvar();
  }

  async function confirmarSalvar() {
    const dados = await montarDados();

    if (id && dataOcorrenciaClicada && recorrenciaTipo !== 'nenhuma') {
      Alert.alert('O que você quer alterar?', 'Este é um compromisso recorrente.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Só esta ocorrência', onPress: () => salvarComEscopo('ocorrencia', dados) },
        { text: 'A série toda', onPress: () => salvarComEscopo('serie', dados) },
      ]);
      return;
    }
    await salvarComEscopo('serie', dados);
  }

  async function salvarComEscopo(escopo, dados) {
    if (id) {
      if (escopo === 'ocorrencia') {
        await atualizarCompromisso(id, {
          dataOriginal: dataOcorrenciaClicada, titulo: dados.titulo, horario: dados.horario,
          local: dados.local, observacao: dados.observacao,
        }, 'ocorrencia');
      } else {
        await atualizarCompromisso(id, dados, 'serie');
      }
    } else {
      await criarCompromisso(dados);
    }
    await reagendarTudo();
    navigation.goBack();
  }

  function confirmarExclusao() {
    if (id && dataOcorrenciaClicada && recorrenciaTipo !== 'nenhuma') {
      Alert.alert('O que você quer apagar?', '', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Só esta ocorrência', style: 'destructive', onPress: () => apagarComEscopo('ocorrencia') },
        { text: 'A série toda', style: 'destructive', onPress: () => apagarComEscopo('serie') },
      ]);
      return;
    }
    Alert.alert('Apagar', `Apagar "${titulo}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar', style: 'destructive', onPress: () => apagarComEscopo('serie') },
    ]);
  }

  async function apagarComEscopo(escopo) {
    await apagarCompromisso(id, escopo, dataOcorrenciaClicada);
    await reagendarTudo();
    navigation.goBack();
  }

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ padding: 20, paddingBottom: 40 + insets.bottom }}>
      <Campo label="Título" value={titulo} onChangeText={setTitulo} colors={colors} fonts={fonts} />

      <Text style={[styles.label, { color: colors.textSecondary, fontFamily: fonts.bodyMedium }]}>Data</Text>
      <Pressable style={[styles.input, { borderColor: colors.border, backgroundColor: colors.inputBackground, marginBottom: 16 }]} onPress={() => setMostrarDatePicker(true)}>
        <Text style={{ color: colors.textPrimary, fontFamily: fonts.body }}>{dataStr()}</Text>
      </Pressable>
      {mostrarDatePicker && (
        <DateTimePicker
          value={data}
          mode="date"
          onChange={(_, d) => { setMostrarDatePicker(Platform.OS === 'ios'); if (d) setData(d); }}
        />
      )}

      <View style={styles.linhaSwitch}>
        <Text style={[styles.label, { color: colors.textSecondary, fontFamily: fonts.bodyMedium, marginBottom: 0 }]}>Tem horário definido?</Text>
        <Switch value={temHorario} onValueChange={setTemHorario} trackColor={{ true: colors.primary }} />
      </View>
      {temHorario && (
        <>
          <Pressable style={[styles.input, { borderColor: colors.border, backgroundColor: colors.inputBackground, marginTop: 8, marginBottom: 16 }]} onPress={() => setMostrarTimePicker(true)}>
            <Text style={{ color: colors.textPrimary, fontFamily: fonts.body }}>
              {String(horario.getHours()).padStart(2, '0')}:{String(horario.getMinutes()).padStart(2, '0')}
            </Text>
          </Pressable>
          {mostrarTimePicker && (
            <DateTimePicker
              value={horario}
              mode="time"
              is24Hour
              onChange={(_, d) => { setMostrarTimePicker(Platform.OS === 'ios'); if (d) setHorario(d); }}
            />
          )}
        </>
      )}

      <Campo label="Local (opcional)" value={local} onChangeText={setLocal} colors={colors} fonts={fonts} />

      <Text style={[styles.label, { color: colors.textSecondary, fontFamily: fonts.bodyMedium }]}>Ministério (opcional)</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        <Chip texto="Nenhum" ativo={!ministerio} onPress={() => setMinisterio(null)} colors={colors} fonts={fonts} />
        {ministerios.map((m) => (
          <Chip key={m.id} texto={m.nome} ativo={ministerio === m.nome} onPress={() => setMinisterio(m.nome)} colors={colors} fonts={fonts} />
        ))}
      </View>

      <Campo label="Observação (opcional)" value={observacao} onChangeText={setObservacao} multiline colors={colors} fonts={fonts} />

      <Text style={[styles.label, { color: colors.textSecondary, fontFamily: fonts.bodyMedium }]}>Repetição</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {TIPOS_RECORRENCIA.map((t) => (
          <Chip key={t.valor} texto={t.rotulo} ativo={recorrenciaTipo === t.valor} onPress={() => setRecorrenciaTipo(t.valor)} colors={colors} fonts={fonts} />
        ))}
      </View>

      {(recorrenciaTipo === 'semanal' || recorrenciaTipo === 'mensal_posicao') && (
        <>
          <Text style={[styles.label, { color: colors.textSecondary, fontFamily: fonts.bodyMedium }]}>Dia da semana</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {DIAS_SEMANA.map((nome, i) => (
              <Chip key={i} texto={nome} ativo={diaSemana === i} onPress={() => setDiaSemana(i)} colors={colors} fonts={fonts} />
            ))}
          </View>
        </>
      )}

      {recorrenciaTipo === 'mensal_posicao' && (
        <>
          <Text style={[styles.label, { color: colors.textSecondary, fontFamily: fonts.bodyMedium }]}>Qual ocorrência do mês</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {POSICOES_MES.map((p) => (
              <Chip key={p.valor} texto={p.rotulo} ativo={posicaoMes === p.valor} onPress={() => setPosicaoMes(p.valor)} colors={colors} fonts={fonts} />
            ))}
          </View>
        </>
      )}

      <View style={styles.linhaSwitch}>
        <Text style={[styles.label, { color: colors.textSecondary, fontFamily: fonts.bodyMedium, marginBottom: 0 }]}>Quero lembrete deste compromisso</Text>
        <Switch value={lembreteAtivo} onValueChange={setLembreteAtivo} trackColor={{ true: colors.primary }} />
      </View>
      {lembreteAtivo && (
        <Campo
          label="Quantos dias antes (lembrete sempre às 7h)"
          value={lembreteDias}
          onChangeText={setLembreteDias}
          keyboardType="number-pad"
          colors={colors}
          fonts={fonts}
          style={{ marginTop: 8 }}
        />
      )}

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
  linhaSwitch: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  botaoPrimario: { padding: 14, alignItems: 'center', marginTop: 8 },
  botaoSecundario: { padding: 14, alignItems: 'center', marginTop: 12, borderWidth: 1 },
});
