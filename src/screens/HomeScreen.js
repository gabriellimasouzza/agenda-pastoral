import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import SectionCard from '../components/SectionCard';
import FabMenu from '../components/FabMenu';
import { listarOcorrenciasNaJanela } from '../db/compromissos';
import { listarAniversariantes, dataEfetivaNoAno } from '../db/aniversariantes';
import { listarDatasImportantes } from '../db/datasImportantes';
import { listarPendenciasAbertas } from '../db/pendencias';
import { dataLocalStr, somarDias, inicioDoDia } from '../utils/datas';

// Próxima vez que dia/mês acontece, a partir de hoje (29/fev -> 28/fev em ano não bissexto).
function proximaData(dia, mes) {
  const hoje = inicioDoDia();
  const ef = dataEfetivaNoAno(dia, mes, hoje.getFullYear());
  let alvo = new Date(hoje.getFullYear(), ef.mes - 1, ef.dia);
  if (alvo < hoje) {
    const ef2 = dataEfetivaNoAno(dia, mes, hoje.getFullYear() + 1);
    alvo = new Date(hoje.getFullYear() + 1, ef2.mes - 1, ef2.dia);
  }
  return alvo;
}

export default function HomeScreen({ navigation }) {
  const { colors, fonts } = useTheme();
  const insets = useSafeAreaInsets();
  const [compromissos, setCompromissos] = useState([]);
  const [aniversariantes, setAniversariantes] = useState([]);
  const [datasImportantes, setDatasImportantes] = useState([]);
  const [pendencias, setPendencias] = useState([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const hoje = inicioDoDia();
        const limite = somarDias(hoje, 7); // hoje + 7 dias, igual à agenda
        const [ocs, anivs, datas, pends] = await Promise.all([
          listarOcorrenciasNaJanela(dataLocalStr(hoje), dataLocalStr(limite)),
          listarAniversariantes(),
          listarDatasImportantes(),
          listarPendenciasAbertas(),
        ]);
        setCompromissos(ocs);
        setAniversariantes(
          anivs
            .map((a) => ({ ...a, alvo: proximaData(a.dia, a.mes) }))
            .filter((a) => a.alvo <= limite)
        );
        setDatasImportantes(datas.filter((d) => proximaData(d.dia, d.mes) <= limite));
        setPendencias(pends);
      })();
    }, [])
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + 12 }]}>
        <Text style={[styles.header, { color: colors.textPrimary, fontFamily: fonts.titleBold }]}>
          Resumo
        </Text>

        <SectionCard
          titulo="Compromissos"
          itens={compromissos}
          vazio="Nada marcado pros próximos 7 dias."
          onVerTodos={() => navigation.navigate('CompromissosLista')}
          index={0}
          renderItem={(c) => (
            <Pressable
              style={styles.item}
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
          vazio="Ninguém faz aniversário nos próximos 7 dias."
          onVerTodos={() => navigation.navigate('AniversariantesLista')}
          index={1}
          renderItem={(a) => (
            <Pressable
              style={styles.item}
              onPress={() => navigation.navigate('AniversarianteForm', { id: a.id })}
            >
              <Text style={[styles.itemTitulo, { color: colors.textPrimary, fontFamily: fonts.bodyMedium }]}>
                {a.nome}
              </Text>
              <Text style={[styles.itemDetalhe, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                {String(a.alvo.getDate()).padStart(2, '0')}/{String(a.alvo.getMonth() + 1).padStart(2, '0')}
                {a.ano ? ` · completa ${a.alvo.getFullYear() - a.ano} anos` : ''}
              </Text>
            </Pressable>
          )}
        />

        <SectionCard
          titulo="Datas importantes"
          itens={datasImportantes}
          vazio="Nada nos próximos 7 dias."
          onVerTodos={() => navigation.navigate('DatasImportantesLista')}
          index={2}
          renderItem={(d) => (
            <Pressable
              style={styles.item}
              onPress={() => navigation.navigate('DataImportanteForm', { id: d.id })}
            >
              <Text style={[styles.itemTitulo, { color: colors.textPrimary, fontFamily: fonts.bodyMedium }]}>
                {d.nome}
              </Text>
              <Text style={[styles.itemDetalhe, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                {rotuloTipo(d.tipo)} · {String(d.dia).padStart(2, '0')}/{String(d.mes).padStart(2, '0')}
              </Text>
            </Pressable>
          )}
        />

        <SectionCard
          titulo="Pendências"
          itens={pendencias}
          vazio="Nenhuma pendência em aberto."
          onVerTodos={() => navigation.navigate('PendenciasLista')}
          index={3}
          renderItem={(p) => (
            <Pressable
              style={styles.item}
              onPress={() => navigation.navigate('PendenciaForm', { id: p.id })}
            >
              <Text style={[styles.itemTitulo, { color: colors.textPrimary, fontFamily: fonts.bodyMedium }]}>
                {p.titulo}
              </Text>
              {p.ministerio_nome ? (
                <Text style={[styles.itemDetalhe, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                  {p.ministerio_nome}
                </Text>
              ) : null}
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
  header: { fontSize: 28, marginBottom: 20 },
  item: { paddingVertical: 12, paddingHorizontal: 14 },
  itemTitulo: { fontSize: 15 },
  itemDetalhe: { fontSize: 13, marginTop: 2 },
});
