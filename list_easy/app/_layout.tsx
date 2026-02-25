import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ListEasyProvider } from '../context/ListEasyContext';
import { StatusBar } from 'expo-status-bar';
import { theme } from '../lib/theme';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ListEasyProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: theme.colors.textOnPrimary,
          headerTitleStyle: { fontWeight: '700', fontSize: 17 },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="index" options={{ title: 'List Easy' }} />
        <Stack.Screen name="browse" options={{ title: 'Browse by zip code' }} />
        <Stack.Screen name="upload" options={{ title: 'Upload Room Video' }} />
        <Stack.Screen name="select-frame" options={{ title: 'Select Items' }} />
        <Stack.Screen name="listing/[id]" options={{ title: 'Room Listing' }} />
        <Stack.Screen name="listing/edit/[id]" options={{ title: 'Edit listing' }} />
        <Stack.Screen name="item/[id]" options={{ title: 'Item' }} />
        <Stack.Screen name="item/edit/[id]" options={{ title: 'Edit item' }} />
        <Stack.Screen name="offers" options={{ title: 'Offers & Pickups' }} />
        <Stack.Screen name="video/[id]" options={{ title: 'Room video' }} />
      </Stack>
      </ListEasyProvider>
    </GestureHandlerRootView>
  );
}
