import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { listarAniversariantes } from '../db/aniversariantes';

export default function AniversariantesListScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors, fonts, spacing } = useTheme();
  const [lista, setLista] = useState([]);

  useFocusEffect(
    useCallback(() => {
      listarAniversariantes().then(setLista);
    }, [])
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={lista}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 + insets.bottom }}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.card, { backgroundColor: colors.card }]}
            onPress={() => navigation.navigate('AniversarianteForm', { id: item.id })}
          >
            <Text style={[styles.nome, { color: colors.textPrimary, fontFamily: fonts.bodyMedium }]}>
              {item.nome}
            </Text>
            <Text style={[styles.data, { color: colors.textSecondary, fontFamily: fonts.body }]}>
              {String(item.dia).padStart(2, '0')}/{String(item.mes).padStart(2, '0')}
              {item.ano ? `/${item.ano}` : ''}
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={{ color: colors.textSecondary, fontFamily: fonts.body, textAlign: 'center', marginTop: 40 }}>
            Nenhum aniversariante cadastrado ainda.
          </Text>
        }
      />
      <Pressable
        style={[styles.fab, { backgroundColor: colors.primary, bottom: 20 + insets.bottom }]}
        onPress={() => navigation.navigate('AniversarianteForm', {})}
      >
        <Ionicons name="add" size={28} color={colors.onPrimary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 14, borderRadius: 12, marginBottom: 10 },
  nome: { fontSize: 16 },
  data: { fontSize: 13, marginTop: 2 },
  fab: {
    position: 'absolute', right: 20, bottom: 20, width: 56, height: 56,
    borderRadius: 28, alignItems: 'center', justifyContent: 'center',
    elevation: 4,
  },
});
