import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Animated, StyleSheet, BackHandler, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

// Ordem de cima para baixo; "Compromisso" fica mais perto do botão (o mais usado).
const OPCOES = [
  { rotulo: 'Pendência', icone: 'checkbox-outline', tela: 'PendenciaForm' },
  { rotulo: 'Data importante', icone: 'heart-outline', tela: 'DataImportanteForm' },
  { rotulo: 'Aniversariante', icone: 'gift-outline', tela: 'AniversarianteForm' },
  { rotulo: 'Compromisso', icone: 'calendar-outline', tela: 'CompromissoForm' },
];

/**
 * Botão flutuante "+" no canto inferior direito. Ao tocar, abre as opções de
 * cadastro (estilo Google Keep). Deve ser renderizado dentro de uma tela
 * (position absolute), por cima do conteúdo.
 */
export default function FabMenu({ navigation }) {
  const { colors, fonts } = useTheme();
  const [aberto, setAberto] = useState(false);
  const progresso = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progresso, {
      toValue: aberto ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [aberto]);

  // Botão "voltar" do Android fecha o menu em vez de sair da tela.
  useEffect(() => {
    if (!aberto) return undefined;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setAberto(false);
      return true;
    });
    return () => sub.remove();
  }, [aberto]);

  function escolher(tela) {
    setAberto(false);
    navigation.navigate(tela, {});
  }

  const rotacao = progresso.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View
        pointerEvents={aberto ? 'auto' : 'none'}
        style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.35)', opacity: progresso }]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setAberto(false)} accessibilityLabel="Fechar menu" />
      </Animated.View>

      <View style={styles.pilha} pointerEvents="box-none">
        {OPCOES.map((op, i) => (
          <Animated.View
            key={op.tela}
            pointerEvents={aberto ? 'auto' : 'none'}
            style={{
              opacity: progresso,
              transform: [{ translateY: progresso.interpolate({ inputRange: [0, 1], outputRange: [12 * (OPCOES.length - i), 0] }) }],
            }}
          >
            <Pressable
              onPress={() => escolher(op.tela)}
              accessibilityRole="button"
              accessibilityLabel={`Adicionar ${op.rotulo}`}
              style={styles.linhaOpcao}
            >
              <View style={[styles.rotulo, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}>
                <Text style={{ color: colors.textPrimary, fontFamily: fonts.bodyMedium, fontSize: 14 }}>{op.rotulo}</Text>
              </View>
              <View style={[styles.miniBotao, { backgroundColor: colors.primary }]}>
                <Ionicons name={op.icone} size={22} color={colors.onPrimary} />
              </View>
            </Pressable>
          </Animated.View>
        ))}

        <Pressable
          onPress={() => setAberto((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel={aberto ? 'Fechar menu de adicionar' : 'Adicionar'}
          style={[styles.fab, { backgroundColor: colors.primary }]}
        >
          <Animated.View style={{ transform: [{ rotate: rotacao }] }}>
            <Ionicons name="add" size={32} color={colors.onPrimary} />
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pilha: { position: 'absolute', right: 20, bottom: 20, alignItems: 'flex-end' },
  linhaOpcao: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  rotulo: {
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, marginRight: 12,
    elevation: 3, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6,
  },
  miniBotao: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', elevation: 3 },
  fab: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', elevation: 5 },
});
