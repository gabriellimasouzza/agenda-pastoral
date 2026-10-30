import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../theme/ThemeContext';

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

function HomeStack() {
  const { colors, fonts } = useTheme();
  const screenOptions = {
    headerStyle: { backgroundColor: colors.header },
    headerTintColor: colors.textPrimary,
    headerTitleStyle: { fontFamily: fonts.bodyMedium },
    headerShadowVisible: false,
    contentStyle: { backgroundColor: colors.background },
  };
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ headerShown: false }} />

      <Stack.Screen name="AniversariantesLista" component={AniversariantesListScreen} options={{ title: 'Aniversariantes' }} />
      <Stack.Screen name="AniversarianteForm" component={AniversarianteFormScreen} />

      <Stack.Screen name="DatasImportantesLista" component={DatasImportantesListScreen} options={{ title: 'Datas importantes' }} />
      <Stack.Screen name="DataImportanteForm" component={DataImportanteFormScreen} />

      <Stack.Screen name="CompromissosLista" component={CompromissosListScreen} options={{ title: 'Compromissos' }} />
      <Stack.Screen name="CompromissoForm" component={CompromissoFormScreen} />

      <Stack.Screen name="PendenciasLista" component={PendenciasListScreen} options={{ title: 'Pendências' }} />
      <Stack.Screen name="PendenciaForm" component={PendenciaFormScreen} />
    </Stack.Navigator>
  );
}

export default function RootNavigation() {
  const { colors, fonts, scheme } = useTheme();
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
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          headerStyle: { backgroundColor: colors.header },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: { fontFamily: fonts.bodyMedium },
          headerShadowVisible: false,
          tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
          tabBarActiveTintColor: colors.tabActive,
          tabBarInactiveTintColor: colors.tabInactive,
          tabBarLabelStyle: { fontFamily: fonts.body, fontSize: 11 },
        }}
      >
        <Tab.Screen
          name="Início"
          component={HomeStack}
          options={{ tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} /> }}
        />
        <Tab.Screen
          name="Configurações"
          component={SettingsScreen}
          options={{
            headerShown: true,
            title: 'Configurações',
            tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
