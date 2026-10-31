import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';

export default function RootLayout() {
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
