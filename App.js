import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';

import { ThemeProvider } from './src/theme/ThemeContext';
import RootNavigation from './src/navigation/index';
import { getDb } from './src/db/database';
import { pedirPermissao, reagendarTudo } from './src/notifications/notificationService';
import { registrarTarefaEmSegundoPlano } from './src/notifications/backgroundTask';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [pronto, setPronto] = useState(false);
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_700Bold,
  });

  useEffect(() => {
    (async () => {
      await getDb();
      await pedirPermissao();
      // Reagenda tudo toda vez que o app abre — é a garantia real contra o
      // problema do Android limpar alarmes no reboot (ver notas em backgroundTask.js).
      await reagendarTudo();
      await registrarTarefaEmSegundoPlano();
      setPronto(true);
    })();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && pronto) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, pronto]);

  if (!fontsLoaded || !pronto) return null;

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <ThemeProvider>
        <RootNavigation />
      </ThemeProvider>
    </View>
  );
}
