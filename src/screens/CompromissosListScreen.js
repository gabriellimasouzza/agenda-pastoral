import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { listarOcorrenciasNaJanela } from '../db/compromissos';
import { dataLocalStr, somarDias } from '../utils/datas';

function hojeStr() {
  return dataLocalStr(new Date());
}
function daquiXDiasStr(x) {
  return dataLocalStr(somarDias(new Date(), x));
}

export default function CompromissosListScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors, fonts } = useTheme();
  const [lista, setLista] = useState([]);

  useFocusEffect(
    useCallback(() => {
      // Janela de 6 meses pra frente — suficiente pra uma tela de "gestão geral".
      listarOcorrenciasNaJanela(hojeStr(), daquiXDiasStr(180)).then(setLista);
    }, [])
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={lista}
        keyExtractor={(item, i) => `${item.id}-${item.data}-${i}`}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 + insets.bottom }}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.card, { backgroundColor: colors.card }]}
            onPress={() => navigation.navigate('CompromissoForm', { id: item.id, data: item.data })}
          >
            <Text style={[styles.titulo, { color: colors.textPrimary, fontFamily: fonts.bodyMedium }]}>{item.titulo}</Text>
            <Text style={[styles.sub, { color: colors.textSecondary, fontFamily: fonts.body }]}>
              {formatarData(item.data)}{item.horario ? ` às ${item.horario}` : ''}
              {item.local ? ` · ${item.local}` : ''}
              {item.ministerio_nome ? ` · ${item.ministerio_nome}` : ''}
              {item.recorrencia_tipo !== 'nenhuma' ? ' · recorrente' : ''}
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={{ color: colors.textSecondary, fontFamily: fonts.body, textAlign: 'center', marginTop: 40 }}>
            Nenhum compromisso nos próximos 6 meses.
          </Text>
        }
      />
      <Pressable style={[styles.fab, { backgroundColor: colors.primary, bottom: 20 + insets.bottom }]} onPress={() => navigation.navigate('CompromissoForm', {})}>
        <Ionicons name="add" size={28} color={colors.onPrimary} />
      </Pressable>
    </View>
  );
}

function formatarData(dataStr) {
  const [, m, d] = dataStr.split('-');
  return `${d}/${m}`;
}

const styles = StyleSheet.create({
  card: { padding: 14, borderRadius: 12, marginBottom: 10 },
  titulo: { fontSize: 16 },
  sub: { fontSize: 13, marginTop: 2 },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4 },
});
