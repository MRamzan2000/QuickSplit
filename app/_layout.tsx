import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SplitProvider } from "@/contexts/SplitContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ 
      headerBackTitle: "Back",
      headerStyle: {
        backgroundColor: '#f8fafc',
      },
      headerTintColor: '#0f766e',
      headerTitleStyle: {
        fontWeight: '600',
      },
    }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="add-people" options={{ title: "Add People" }} />
      <Stack.Screen name="add-expenses" options={{ title: "Add Expenses" }} />
      <Stack.Screen name="results" options={{ title: "Split Results" }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SplitProvider>
          <RootLayoutNav />
        </SplitProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}