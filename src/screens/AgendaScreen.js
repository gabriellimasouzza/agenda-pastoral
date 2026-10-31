import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import FadeInView from '../components/FadeInView';
import FabMenu from '../components/FabMenu';
import { montarAgenda, DIAS_POR_BLOCO } from '../db/agendaSemanal';
import {
  dataLocalStr, strParaData, somarDias, inicioDoDia, DIAS_SEMANA_NOME, MESES_ABREV,
} from '../utils/datas';

function curto(date) {
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export default function AgendaScreen({ navigation }) {
  const { colors, fonts, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const [bloco, setBloco] = useState(0); // 0 = a partir de hoje; ±1 = 8 dias adiante/atrás
  const [dias, setDias] = useState(null);

  const inicio = somarDias(inicioDoDia(), bloco * DIAS_POR_BLOCO);
  const fim = somarDias(inicio, DIAS_POR_BLOCO - 1);
  const hojeStr = dataLocalStr(new Date());
  const amanhaStr = dataLocalStr(somarDias(new Date(), 1));

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      const ini = somarDias(inicioDoDia(), bloco * DIAS_POR_BLOCO);
      montarAgenda(ini).then((r) => { if (ativo) setDias(r); });
      return () => { ativo = false; };
    }, [bloco])
  );

  function abrir(item) {
    if (item.tipo === 'compromisso') navigation.navigate('CompromissoForm', { id: item.id, data: item.data });
    else if (item.tipo === 'aniversario') navigation.navigate('AniversarianteForm', { id: item.id });
    else navigation.navigate('DataImportanteForm', { id: item.id });
  }

  function corDoTipo(tipo) {
    if (tipo === 'compromisso') return colors.primary;
    if (tipo === 'aniversario') return colors.accent;
    return colors.warning;
  }

  function linhaTipo(item) {
    if (item.tipo === 'compromisso') {
      return ['Compromisso', item.horario, item.local, item.ministerio].filter(Boolean).join(' · ');
    }
    if (item.tipo === 'aniversario') return item.detalhe || 'Aniversário';
    return ['Data importante', item.detalhe].filter(Boolean).join(' · ');
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 130 }}>
        <Text style={[styles.titulo, { color: colors.textPrimary, fontFamily: fonts.titleBold }]}>Agenda Pastoral</Text>

        <View style={styles.linhaPeriodo}>
          <Pressable onPress={() => setBloco((b) => b - 1)} hitSlop={12} accessibilityLabel="Período anterior">
            <Ionicons name="chevron-back" size={26} color={colors.primary} />
          </Pressable>
          <Text style={[styles.periodo, { color: colors.textSecondary, fontFamily: fonts.bodyMedium }]}>
            {curto(inicio)} a {curto(fim)}
          </Text>
          <Pressable onPress={() => setBloco((b) => b + 1)} hitSlop={12} accessibilityLabel="Próximo período">
            <Ionicons name="chevron-forward" size={26} color={colors.primary} />
          </Pressable>
          {bloco !== 0 && (
            <Pressable onPress={() => setBloco(0)} style={[styles.botaoHoje, { borderColor: colors.primary }]}>
              <Text style={{ color: colors.primary, fontFamily: fonts.bodyMedium, fontSize: 13 }}>Hoje</Text>
            </Pressable>
          )}
        </View>

        {dias && dias.length === 0 && (
          <Text style={[styles.vazio, { color: colors.textSecondary, fontFamily: fonts.body }]}>
            Nada marcado neste período. Toque no + para adicionar.
          </Text>
        )}

        {(dias || []).map((dia, i) => {
          const d = strParaData(dia.data);
          const ehHoje = dia.data === hojeStr;
          const sufixo = ehHoje ? ' · Hoje' : dia.data === amanhaStr ? ' · Amanhã' : '';
          return (
            <FadeInView key={dia.data} delay={i * 40} style={styles.dia}>
              <View style={styles.colNumero}>
                <Text style={[styles.numero, { color: ehHoje ? colors.primary : colors.textPrimary, fontFamily: fonts.titleBold }]}>
                  {d.getDate()}
                </Text>
                <Text style={[styles.mes, { color: colors.textSecondary, fontFamily: fonts.bodyMedium }]}>
                  {MESES_ABREV[d.getMonth()]}
                </Text>
              </View>

              <View style={[styles.cartao, { backgroundColor: colors.card, borderRadius: radius.md, shadowColor: colors.cardShadow }]}>
                <Text style={[styles.diaSemana, { color: colors.textPrimary, fontFamily: fonts.bodyBold }]}>
                  {DIAS_SEMANA_NOME[d.getDay()]}{sufixo}
                </Text>
                {dia.itens.map((item, k) => (
                  <Pressable
                    key={`${item.tipo}-${item.id}-${k}`}
                    onPress={() => abrir(item)}
                    style={[styles.item, k > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}
                  >
                    <Text style={[styles.itemTitulo, { color: colors.textPrimary, fontFamily: fonts.bodyMedium }]}>
                      {item.titulo}
                    </Text>
                    <View style={styles.linhaTipo}>
                      <View style={[styles.ponto, { backgroundColor: corDoTipo(item.tipo) }]} />
                      <Text style={[styles.tipoTexto, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                        {linhaTipo(item)}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </FadeInView>
          );
        })}
      </ScrollView>

      <FabMenu navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  titulo: { fontSize: 28 },
  linhaPeriodo: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 20 },
  periodo: { fontSize: 15, marginHorizontal: 10 },
  botaoHoje: { marginLeft: 'auto', borderWidth: 1, borderRadius: 16, paddingVertical: 4, paddingHorizontal: 12 },
  vazio: { fontSize: 14, fontStyle: 'italic', marginTop: 24 },
  dia: { flexDirection: 'row', marginBottom: 16 },
  colNumero: { width: 58, alignItems: 'center', paddingTop: 8 },
  numero: { fontSize: 34, lineHeight: 38 },
  mes: { fontSize: 11, letterSpacing: 1, marginTop: 2 },
  cartao: {
    flex: 1, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 4,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2,
  },
  diaSemana: { fontSize: 14, marginBottom: 6 },
  item: { paddingVertical: 10 },
  itemTitulo: { fontSize: 15 },
  linhaTipo: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  ponto: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  tipoTexto: { fontSize: 13, flexShrink: 1 },
});
