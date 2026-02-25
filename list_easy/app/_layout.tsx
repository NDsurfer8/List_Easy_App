import { Stack } from 'expo-router';
import { ListEasyProvider } from '../context/ListEasyContext';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <ListEasyProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0f172a' },
          headerTintColor: '#f8fafc',
          headerTitleStyle: { fontWeight: '600', fontSize: 18 },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'List Easy' }} />
        <Stack.Screen name="upload" options={{ title: 'Upload Room Video' }} />
        <Stack.Screen name="select-frame" options={{ title: 'Select Items' }} />
        <Stack.Screen name="listing/[id]" options={{ title: 'Room Listing' }} />
        <Stack.Screen name="item/[id]" options={{ title: 'Item' }} />
        <Stack.Screen name="offers" options={{ title: 'Offers & Pickups' }} />
      </Stack>
    </ListEasyProvider>
  );
}
