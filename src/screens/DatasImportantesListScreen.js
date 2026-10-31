import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { listarDatasImportantes } from '../db/datasImportantes';

const ROTULOS = { casamento: 'Casamento', falecimento: 'Falecimento', outro: 'Outro' };

export default function DatasImportantesListScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors, fonts } = useTheme();
  const [lista, setLista] = useState([]);

  useFocusEffect(useCallback(() => { listarDatasImportantes().then(setLista); }, []));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={lista}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 + insets.bottom }}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.card, { backgroundColor: colors.card }]}
            onPress={() => navigation.navigate('DataImportanteForm', { id: item.id })}
          >
            <Text style={[styles.nome, { color: colors.textPrimary, fontFamily: fonts.bodyMedium }]}>{item.nome}</Text>
            <Text style={[styles.data, { color: colors.textSecondary, fontFamily: fonts.body }]}>
              {ROTULOS[item.tipo]} · {String(item.dia).padStart(2, '0')}/{String(item.mes).padStart(2, '0')}
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={{ color: colors.textSecondary, fontFamily: fonts.body, textAlign: 'center', marginTop: 40 }}>
            Nenhuma data importante cadastrada ainda.
          </Text>
        }
      />
      <Pressable style={[styles.fab, { backgroundColor: colors.primary, bottom: 20 + insets.bottom }]} onPress={() => navigation.navigate('DataImportanteForm', {})}>
        <Ionicons name="add" size={28} color={colors.onPrimary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 14, borderRadius: 12, marginBottom: 10 },
  nome: { fontSize: 16 },
  data: { fontSize: 13, marginTop: 2 },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4 },
});
