import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { listarPendenciasAbertas, listarPendenciasArquivadas, concluirPendencia, reabrirPendencia } from '../db/pendencias';

export default function PendenciasListScreen({ navigation }) {
  const { colors, fonts } = useTheme();
  const [abertas, setAbertas] = useState([]);
  const [arquivadas, setArquivadas] = useState([]);
  const [mostrarArquivadas, setMostrarArquivadas] = useState(false);

  const carregar = useCallback(() => {
    listarPendenciasAbertas().then(setAbertas);
    listarPendenciasArquivadas().then(setArquivadas);
  }, []);

  useFocusEffect(carregar);

  const lista = mostrarArquivadas ? arquivadas : abertas;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.abas}>
        <Aba texto="Em aberto" ativa={!mostrarArquivadas} onPress={() => setMostrarArquivadas(false)} colors={colors} fonts={fonts} />
        <Aba texto="Arquivadas" ativa={mostrarArquivadas} onPress={() => setMostrarArquivadas(true)} colors={colors} fonts={fonts} />
      </View>
      <FlatList
        data={lista}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Pressable style={{ flex: 1 }} onPress={() => navigation.navigate('PendenciaForm', { id: item.id })}>
              <Text style={[styles.titulo, { color: colors.textPrimary, fontFamily: fonts.bodyMedium }]}>{item.titulo}</Text>
              {item.ministerio_nome ? (
                <Text style={[styles.sub, { color: colors.textSecondary, fontFamily: fonts.body }]}>{item.ministerio_nome}</Text>
              ) : null}
            </Pressable>
            <Pressable onPress={() => (mostrarArquivadas ? reabrirPendencia(item.id) : concluirPendencia(item.id)).then(carregar)} hitSlop={8}>
              <Ionicons
                name={mostrarArquivadas ? 'arrow-undo-outline' : 'checkmark-circle-outline'}
                size={24}
                color={colors.primary}
              />
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ color: colors.textSecondary, fontFamily: fonts.body, textAlign: 'center', marginTop: 40 }}>
            {mostrarArquivadas ? 'Nenhuma pendência arquivada ainda.' : 'Nenhuma pendência em aberto.'}
          </Text>
        }
      />
      <Pressable style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('PendenciaForm', {})}>
        <Ionicons name="add" size={28} color={colors.onPrimary} />
      </Pressable>
    </View>
  );
}

function Aba({ texto, ativa, onPress, colors, fonts }) {
  return (
    <Pressable onPress={onPress} style={[styles.aba, ativa && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}>
      <Text style={{ color: ativa ? colors.primary : colors.textSecondary, fontFamily: fonts.bodyMedium }}>{texto}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  abas: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 12 },
  aba: { marginRight: 20, paddingBottom: 8 },
  card: { padding: 14, borderRadius: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  titulo: { fontSize: 16 },
  sub: { fontSize: 13, marginTop: 2 },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4 },
});
