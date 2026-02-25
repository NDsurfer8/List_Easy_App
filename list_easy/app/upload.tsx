import { useState } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function Upload() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow access to your media library to pick a video.');
      return;
    }
    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        allowsEditing: false,
        quality: 1,
      });
      if (result.canceled || !result.assets?.[0]?.uri) {
        setLoading(false);
        return;
      }
      const uri = result.assets[0].uri;
      router.replace({ pathname: '/select-frame', params: { videoUri: uri } });
    } catch (e) {
      Alert.alert('Error', 'Could not open video. Try another file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>
        Choose a video of the room you want to list items from. You’ll pick a frame and then select
        items (draw boxes) to get AI values.
      </Text>
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={pickVideo}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Pick video from library</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    padding: 24,
  },
  instruction: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#0f172a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
