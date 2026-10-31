import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import PendenciaItem from '../components/PendenciaItem';
import { listarPendenciasAbertas } from '../db/pendencias';

export default function PendenciasListScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors, fonts } = useTheme();
  const [lista, setLista] = useState([]);

  const carregar = useCallback(() => {
    listarPendenciasAbertas().then(setLista);
  }, []);

  useFocusEffect(carregar);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={lista}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 + insets.bottom }}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <PendenciaItem
              item={item}
              onEditar={(it) => navigation.navigate('PendenciaForm', { id: it.id })}
              onConcluida={carregar}
            />
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ color: colors.textSecondary, fontFamily: fonts.body, textAlign: 'center', marginTop: 40 }}>
            Nenhuma pendência.
          </Text>
        }
      />
      <Pressable style={[styles.fab, { backgroundColor: colors.primary, bottom: 20 + insets.bottom }]} onPress={() => navigation.navigate('PendenciaForm', {})}>
        <Ionicons name="add" size={28} color={colors.onPrimary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, marginBottom: 10 },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4 },
});
