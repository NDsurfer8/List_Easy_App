import { useState } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

type MediaType = 'image' | 'video';

export default function Upload() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const pickMedia = async (mediaTypes: ImagePicker.MediaType[]) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow access to your media library to pick a video or photo.');
      return;
    }
    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes,
        allowsEditing: false,
        quality: 1,
      });
      if (result.canceled || !result.assets?.[0]?.uri) {
        setLoading(false);
        return;
      }
      const asset = result.assets[0];
      const uri = asset.uri;
      const type: MediaType = asset.type === 'video' ? 'video' : 'image';
      router.replace({
        pathname: '/select-frame',
        params: { uri, mediaType: type },
      });
    } catch (e) {
      Alert.alert('Error', 'Could not open file. Try another.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>
        Choose a video or photo of the room. For video, you can scrub second-by-second or play and
        pause to pick a frame. For a photo, you’ll draw boxes on it directly.
      </Text>
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={() => pickMedia(['videos'])}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Pick video</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.buttonSecondary, loading && styles.buttonDisabled]}
        onPress={() => pickMedia(['images'])}
        disabled={loading}
        activeOpacity={0.85}
      >
        <Text style={styles.buttonTextSecondary}>Pick photo</Text>
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
    marginBottom: 12,
  },
  buttonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#0f172a',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '600',
  },
});
