import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../theme/ThemeContext';

import AgendaScreen from '../screens/AgendaScreen';
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';

import AniversariantesListScreen from '../screens/AniversariantesListScreen';
import AniversarianteFormScreen from '../screens/AniversarianteFormScreen';
import DatasImportantesListScreen from '../screens/DatasImportantesListScreen';
import DataImportanteFormScreen from '../screens/DataImportanteFormScreen';
import CompromissosListScreen from '../screens/CompromissosListScreen';
import CompromissoFormScreen from '../screens/CompromissoFormScreen';
import PendenciasListScreen from '../screens/PendenciasListScreen';
import PendenciaFormScreen from '../screens/PendenciaFormScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const ALTURA_BASE_ABAS = 56;

function Abas() {
  const { colors, fonts } = useTheme();
  const insets = useSafeAreaInsets();

  const icone = (nome, nomeAtivo) =>
    ({ color, focused }) => <Ionicons name={focused ? nomeAtivo : nome} size={26} color={color} />;

  return (
    <Tab.Navigator
      initialRouteName="Agenda"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false, // só ícones
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          // altura e respiro de baixo calculados pela área segura (barra de gestos do Android)
          height: ALTURA_BASE_ABAS + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
      }}
    >
      <Tab.Screen
        name="Agenda"
        component={AgendaScreen}
        options={{ tabBarAccessibilityLabel: 'Agenda', tabBarIcon: icone('calendar-outline', 'calendar') }}
      />
      <Tab.Screen
        name="Resumo"
        component={HomeScreen}
        options={{ tabBarAccessibilityLabel: 'Resumo', tabBarIcon: icone('grid-outline', 'grid') }}
      />
      <Tab.Screen
        name="Configurações"
        component={SettingsScreen}
        options={{
          tabBarAccessibilityLabel: 'Configurações',
          headerShown: true,
          title: 'Configurações',
          headerStyle: { backgroundColor: colors.header },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: { fontFamily: fonts.bodyMedium },
          headerShadowVisible: false,
          tabBarIcon: icone('settings-outline', 'settings'),
        }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigation() {
  const { colors, fonts, scheme } = useTheme();

  const screenOptions = {
    headerStyle: { backgroundColor: colors.header },
    headerTintColor: colors.textPrimary,
    headerTitleStyle: { fontFamily: fonts.bodyMedium },
    headerShadowVisible: false,
    contentStyle: { backgroundColor: colors.background },
  };

  return (
    <NavigationContainer
      theme={{
        dark: scheme === 'dark',
        colors: {
          primary: colors.primary,
          background: colors.background,
          card: colors.card,
          text: colors.textPrimary,
          border: colors.border,
          notification: colors.primary,
        },
      }}
    >
      {/* Ícones da barra de status: escuros no tema claro, claros no escuro */}
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen name="Abas" component={Abas} options={{ headerShown: false }} />

        <Stack.Screen name="AniversariantesLista" component={AniversariantesListScreen} options={{ title: 'Aniversariantes' }} />
        <Stack.Screen name="AniversarianteForm" component={AniversarianteFormScreen} />

        <Stack.Screen name="DatasImportantesLista" component={DatasImportantesListScreen} options={{ title: 'Datas importantes' }} />
        <Stack.Screen name="DataImportanteForm" component={DataImportanteFormScreen} />

        <Stack.Screen name="CompromissosLista" component={CompromissosListScreen} options={{ title: 'Compromissos' }} />
        <Stack.Screen name="CompromissoForm" component={CompromissoFormScreen} />

        <Stack.Screen name="PendenciasLista" component={PendenciasListScreen} options={{ title: 'Pendências' }} />
        <Stack.Screen name="PendenciaForm" component={PendenciaFormScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
