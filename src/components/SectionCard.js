import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import FadeInView from './FadeInView';

export default function SectionCard({ titulo, itens, renderItem, vazio, onVerTodos, index = 0, chave }) {
  const { colors, spacing, radius, fonts } = useTheme();

  return (
    <FadeInView delay={index * 60} style={{ marginBottom: spacing.lg }}>
      <View style={styles.headerRow}>
        <Text style={[styles.titulo, { color: colors.textPrimary, fontFamily: fonts.title }]}>
          {titulo}
        </Text>
        {onVerTodos && (
          <Pressable onPress={onVerTodos} hitSlop={8}>
            <Text style={[styles.verTodos, { color: colors.primary, fontFamily: fonts.bodyMedium }]}>
              Ver todos
            </Text>
          </Pressable>
        )}
      </View>

      {itens.length === 0 ? (
        <Text style={[styles.vazio, { color: colors.textSecondary, fontFamily: fonts.body }]}>
          {vazio}
        </Text>
      ) : (
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderRadius: radius.md, shadowColor: colors.cardShadow },
          ]}
        >
          {itens.map((item, i) => (
            <View key={chave ? chave(item) : i}>
              {renderItem(item)}
              {i < itens.length - 1 && <View style={[styles.divisor, { backgroundColor: colors.border }]} />}
            </View>
          ))}
        </View>
      )}
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  titulo: { fontSize: 20 },
  verTodos: { fontSize: 13 },
  vazio: { fontSize: 14, fontStyle: 'italic' },
  card: {
    padding: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  divisor: { height: 1, marginHorizontal: 12 },
});
