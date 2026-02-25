import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import { useRef, useState } from 'react';
import { useListEasy } from '../../context/ListEasyContext';

export default function VideoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getListing } = useListEasy();
  const listing = id ? getListing(id) : undefined;
  const videoRef = useRef<Video>(null);
  const [error, setError] = useState(false);

  if (!listing) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Listing not found.</Text>
      </View>
    );
  }

  if (!listing.isVideo) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>This listing has a photo, not a video.</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Could not play video.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ uri: listing.videoUri }}
        style={styles.video}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        onError={() => setError(true)}
      />
      <Text style={styles.caption}>{listing.title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1f5f9' },
  error: { color: '#dc2626', fontSize: 16 },
  video: { flex: 1, width: '100%' },
  caption: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    color: '#fff',
    fontSize: 14,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
