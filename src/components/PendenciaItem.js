import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { apagarPendencia } from '../db/pendencias';

/**
 * Pendência com "card que se divide": ao tocar, abre embaixo uma faixa com dois
 * botões, Concluída e Editar. Concluída apaga a pendência de vez (sem restaurar).
 */
export default function PendenciaItem({ item, onEditar, onConcluida }) {
  const { colors, fonts } = useTheme();
  const [aberto, setAberto] = useState(false);

  const concluir = async () => {
    await apagarPendencia(item.id);
    onConcluida && onConcluida(item.id);
  };

  return (
    <View>
      <Pressable style={styles.corpo} onPress={() => setAberto((v) => !v)}>
        <Text style={[styles.titulo, { color: colors.textPrimary, fontFamily: fonts.bodyMedium }]}>
          {item.titulo}
        </Text>
        {item.ministerio_nome ? (
          <Text style={[styles.detalhe, { color: colors.textSecondary, fontFamily: fonts.body }]}>
            {item.ministerio_nome}
          </Text>
        ) : null}
      </Pressable>

      {aberto ? (
        <View style={[styles.acoes, { borderTopColor: colors.border }]}>
          <Pressable style={styles.botao} onPress={concluir} accessibilityLabel="Marcar como concluída">
            <Ionicons name="checkmark-circle-outline" size={20} color={colors.primary} />
            <Text style={[styles.rotulo, { color: colors.primary, fontFamily: fonts.bodyMedium }]}>Concluída</Text>
          </Pressable>
          <View style={[styles.sep, { backgroundColor: colors.border }]} />
          <Pressable style={styles.botao} onPress={() => onEditar(item)} accessibilityLabel="Editar pendência">
            <Ionicons name="create-outline" size={20} color={colors.textPrimary} />
            <Text style={[styles.rotulo, { color: colors.textPrimary, fontFamily: fonts.bodyMedium }]}>Editar</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  corpo: { paddingVertical: 12, paddingHorizontal: 14 },
  titulo: { fontSize: 15 },
  detalhe: { fontSize: 13, marginTop: 2 },
  acoes: { flexDirection: 'row', borderTopWidth: 1, marginHorizontal: 12 },
  botao: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 11 },
  sep: { width: 1, marginVertical: 8 },
  rotulo: { fontSize: 14 },
});
