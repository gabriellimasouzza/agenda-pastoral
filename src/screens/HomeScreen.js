import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import SectionCard from '../components/SectionCard';
import FabMenu from '../components/FabMenu';
import PendenciaItem from '../components/PendenciaItem';
import { montarResumoDoMes } from '../db/resumoMensal';
import { dataLocalStr } from '../utils/datas';

const MESES_NOME = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export default function HomeScreen({ navigation }) {
  const { colors, fonts } = useTheme();
  const insets = useSafeAreaInsets();
  const [resumo, setResumo] = useState(null);
  // Mês exibido (mes = 0-11). Começa no mês atual; as setas mudam.
  const [ref, setRef] = useState(() => {
    const d = new Date();
    return { ano: d.getFullYear(), mes: d.getMonth() };
  });

  const recarregar = useCallback(() => {
    return montarResumoDoMes(new Date(ref.ano, ref.mes, 1)).then(setResumo);
  }, [ref]);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      montarResumoDoMes(new Date(ref.ano, ref.mes, 1)).then((r) => { if (ativo) setResumo(r); });
      return () => { ativo = false; };
    }, [ref])
  );

  const hoje = new Date();
  const hojeStr = dataLocalStr(hoje);
  const ehMesAtual = ref.ano === hoje.getFullYear() && ref.mes === hoje.getMonth();
  const mover = (delta) => {
    const d = new Date(ref.ano, ref.mes + delta, 1);
    setRef({ ano: d.getFullYear(), mes: d.getMonth() });
  };
  const voltarHoje = () => setRef({ ano: hoje.getFullYear(), mes: hoje.getMonth() });
  // Dias que já passaram ficam apagados (só faz sentido comparar por data completa).
  const passou = (ano, mes, dia) =>
    `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}` < hojeStr;
  const apagado = (flag) => (flag ? { opacity: 0.45 } : null);

  const pendencias = resumo?.pendencias ?? [];
  const compromissos = resumo?.compromissos ?? [];
  const aniversariantes = resumo?.aniversariantes ?? [];
  const datasImportantes = resumo?.datasImportantes ?? [];
  const nomeMes = resumo ? `${MESES_NOME[resumo.mes - 1]} de ${resumo.ano}` : '';

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + 12 }]}>
        <Text style={[styles.header, { color: colors.textPrimary, fontFamily: fonts.titleBold }]}>
          Resumo
        </Text>
        <View style={styles.navMes}>
          <Pressable onPress={() => mover(-1)} hitSlop={12} accessibilityLabel="Mês anterior">
            <Ionicons name="chevron-back" size={24} color={colors.primary} />
          </Pressable>
          <Text style={[styles.mes, { color: colors.textPrimary, fontFamily: fonts.bodyMedium }]}>
            {nomeMes}
          </Text>
          <Pressable onPress={() => mover(1)} hitSlop={12} accessibilityLabel="Próximo mês">
            <Ionicons name="chevron-forward" size={24} color={colors.primary} />
          </Pressable>
          {!ehMesAtual ? (
            <Pressable onPress={voltarHoje} hitSlop={8} style={[styles.btnHoje, { borderColor: colors.primary }]}>
              <Text style={{ color: colors.primary, fontFamily: fonts.bodyMedium, fontSize: 13 }}>Hoje</Text>
            </Pressable>
          ) : null}
        </View>

        <SectionCard
          titulo="Pendências"
          itens={pendencias}
          vazio="Nenhuma pendência em aberto."
          onVerTodos={() => navigation.navigate('PendenciasLista')}
          index={0}
          chave={(p) => p.id}
          renderItem={(p) => (
            <PendenciaItem
              item={p}
              onEditar={(it) => navigation.navigate('PendenciaForm', { id: it.id })}
              onConcluida={recarregar}
            />
          )}
        />

        <SectionCard
          titulo="Compromissos"
          itens={compromissos}
          vazio="Nenhum compromisso neste mês."
          onVerTodos={() => navigation.navigate('CompromissosLista')}
          index={1}
          renderItem={(c) => (
            <Pressable
              style={[styles.item, apagado(c.data < hojeStr)]}
              onPress={() => navigation.navigate('CompromissoForm', { id: c.id, data: c.data })}
            >
              <Text style={[styles.itemTitulo, { color: colors.textPrimary, fontFamily: fonts.bodyMedium }]}>
                {c.titulo}
              </Text>
              <Text style={[styles.itemDetalhe, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                {formatarDataCurta(c.data)}{c.horario ? ` às ${c.horario}` : ''}
                {c.local ? ` · ${c.local}` : ''}
                {c.ministerio_nome ? ` · ${c.ministerio_nome}` : ''}
              </Text>
            </Pressable>
          )}
        />

        <SectionCard
          titulo="Aniversariantes"
          itens={aniversariantes}
          vazio="Ninguém faz aniversário neste mês."
          onVerTodos={() => navigation.navigate('AniversariantesLista')}
          index={2}
          renderItem={(a) => (
            <Pressable
              style={[styles.item, apagado(passou(resumo.ano, a.mesNoAno, a.diaNoMes))]}
              onPress={() => navigation.navigate('AniversarianteForm', { id: a.id })}
            >
              <Text style={[styles.itemTitulo, { color: colors.textPrimary, fontFamily: fonts.bodyMedium }]}>
                {a.nome}
              </Text>
              <Text style={[styles.itemDetalhe, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                {String(a.diaNoMes).padStart(2, '0')}/{String(a.mesNoAno).padStart(2, '0')}
                {a.ano ? ` · completa ${resumo.ano - a.ano} anos` : ''}
              </Text>
            </Pressable>
          )}
        />

        <SectionCard
          titulo="Datas importantes"
          itens={datasImportantes}
          vazio="Nenhuma data importante neste mês."
          onVerTodos={() => navigation.navigate('DatasImportantesLista')}
          index={3}
          renderItem={(d) => (
            <Pressable
              style={[styles.item, apagado(passou(resumo.ano, d.mesNoAno, d.diaNoMes))]}
              onPress={() => navigation.navigate('DataImportanteForm', { id: d.id })}
            >
              <Text style={[styles.itemTitulo, { color: colors.textPrimary, fontFamily: fonts.bodyMedium }]}>
                {d.nome}
              </Text>
              <Text style={[styles.itemDetalhe, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                {rotuloTipo(d.tipo)} · {String(d.diaNoMes).padStart(2, '0')}/{String(d.mesNoAno).padStart(2, '0')}
              </Text>
            </Pressable>
          )}
        />
      </ScrollView>

      <FabMenu navigation={navigation} />
    </View>
  );
}

function formatarDataCurta(dataStr) {
  const [, m, d] = dataStr.split('-');
  return `${d}/${m}`;
}

function rotuloTipo(tipo) {
  return { casamento: 'Casamento', falecimento: 'Falecimento', outro: 'Data importante' }[tipo] || tipo;
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingBottom: 130 },
  header: { fontSize: 28 },
  navMes: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6, marginBottom: 22 },
  mes: { fontSize: 16, minWidth: 150, textAlign: 'center' },
  btnHoje: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 3, marginLeft: 'auto' },
  item: { paddingVertical: 12, paddingHorizontal: 14 },
  itemTitulo: { fontSize: 15 },
  itemDetalhe: { fontSize: 13, marginTop: 2 },
});
