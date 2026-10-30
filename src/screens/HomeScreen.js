import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import SectionCard from '../components/SectionCard';
import { listarOcorrenciasNaJanela } from '../db/compromissos';
import { listarAniversariantes, calcularIdade, dataEfetivaNoAno } from '../db/aniversariantes';
import { listarDatasImportantes } from '../db/datasImportantes';
import { listarPendenciasAbertas } from '../db/pendencias';
import { precisaLembrarBackup, exportarBackup } from '../db/backup';

function hojeStr() {
  return new Date().toISOString().slice(0, 10);
}
function daquiSeteDiasStr() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
}

function ocorreNosProximos7Dias(dia, mes) {
  const hoje = new Date();
  const { dia: d, mes: m } = dataEfetivaNoAno(dia, mes, hoje.getFullYear());
  let alvo = new Date(hoje.getFullYear(), m - 1, d);
  if (alvo < new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())) {
    alvo = new Date(hoje.getFullYear() + 1, m - 1, d);
  }
  const limite = new Date();
  limite.setDate(limite.getDate() + 7);
  return alvo <= limite;
}

export default function HomeScreen({ navigation }) {
  const { colors, spacing, fonts } = useTheme();
  const [compromissos, setCompromissos] = useState([]);
  const [aniversariantes, setAniversariantes] = useState([]);
  const [datasImportantes, setDatasImportantes] = useState([]);
  const [pendencias, setPendencias] = useState([]);
  const [avisoBackup, setAvisoBackup] = useState(false);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const [ocs, anivs, datas, pends, precisaBackup] = await Promise.all([
          listarOcorrenciasNaJanela(hojeStr(), daquiSeteDiasStr()),
          listarAniversariantes(),
          listarDatasImportantes(),
          listarPendenciasAbertas(),
          precisaLembrarBackup(),
        ]);
        setCompromissos(ocs);
        setAniversariantes(anivs.filter((a) => ocorreNosProximos7Dias(a.dia, a.mes)));
        setDatasImportantes(datas.filter((d) => ocorreNosProximos7Dias(d.dia, d.mes)));
        setPendencias(pends);
        setAvisoBackup(precisaBackup);
      })();
    }, [])
  );

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.container}>
      <Text style={[styles.header, { color: colors.textPrimary, fontFamily: fonts.titleBold }]}>
        Agenda Pastoral
      </Text>

      {avisoBackup && (
        <Pressable
          onPress={exportarBackup}
          style={[styles.avisoBackup, { backgroundColor: colors.banner }]}
        >
          <Ionicons name="cloud-upload-outline" size={18} color={colors.textPrimary} />
          <Text style={[styles.avisoBackupTexto, { color: colors.textPrimary, fontFamily: fonts.bodyMedium }]}>
            Já faz um tempo desde o último backup. Toque aqui pra exportar agora.
          </Text>
        </Pressable>
      )}

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
              {String(a.dia).padStart(2, '0')}/{String(a.mes).padStart(2, '0')}
              {a.ano ? ` · completa ${calcularIdade(a.ano, a.mes, a.dia) + 1} anos` : ''}
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
  container: { padding: 20, paddingBottom: 48 },
  header: { fontSize: 28, marginBottom: 20 },
  avisoBackup: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 12, borderRadius: 12, marginBottom: 20,
  },
  avisoBackupTexto: { fontSize: 13, flex: 1 },
  item: { paddingVertical: 12, paddingHorizontal: 14 },
  itemTitulo: { fontSize: 15 },
  itemDetalhe: { fontSize: 13, marginTop: 2 },
});
