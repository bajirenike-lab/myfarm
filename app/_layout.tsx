import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { Platform } from 'react-native';

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const styleId = 'myfarm-web-responsive-viewport';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
          /* Mobile Web Viewport & Safe Area Optimization */
          html, body {
            height: 100% !important;
            height: 100dvh !important;
            width: 100% !important;
            max-width: 100vw !important;
            overflow-x: hidden !important;
            margin: 0;
            padding: 0;
            -webkit-text-size-adjust: 100%;
          }
          #root {
            display: flex;
            height: 100% !important;
            height: 100dvh !important;
            max-height: 100dvh !important;
            width: 100% !important;
            max-width: 100vw !important;
            overflow-x: hidden !important;
          }
          /* Prevent any horizontal layout shifting or white blank space on sides */
          * {
            box-sizing: border-box;
          }
          /* Ensure footer navigation buttons and text are elevated and visible */
          [role="tablist"] {
            padding-bottom: max(20px, env(safe-area-inset-bottom, 20px)) !important;
            box-sizing: border-box !important;
            width: 100% !important;
            max-width: 100vw !important;
          }
          [role="tab"] {
            overflow: visible !important;
          }
          [role="tab"] * {
            overflow: visible !important;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={Colors.primary} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.text.inverse,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: Colors.background },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen
          name="farm/[id]"
          options={{ title: 'Farm Profile', presentation: 'card' }}
        />
        <Stack.Screen
          name="crop/[id]"
          options={{ title: 'Crop Details', presentation: 'card' }}
        />
        <Stack.Screen
          name="calculator"
          options={{ title: 'Production Calculator', presentation: 'modal' }}
        />
        <Stack.Screen
          name="checkout"
          options={{ title: 'Confirm & Fund Farm', presentation: 'card' }}
        />
        <Stack.Screen
          name="cycle/[id]"
          options={{ title: 'Farm Progress Timeline', presentation: 'card' }}
        />
        <Stack.Screen
          name="harvest/[id]"
          options={{ title: 'Harvest Decision', presentation: 'card' }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
