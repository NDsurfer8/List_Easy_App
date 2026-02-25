import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Video } from 'expo-av';
import * as VideoThumbnails from 'expo-video-thumbnails';
import type { AVPlaybackStatus } from 'expo-av';
import { useListEasy } from '../context/ListEasyContext';
import { FrameSelector } from '../components/FrameSelector';
import { getAIValuation } from '../lib/ai';
import type { SelectionBox } from '../lib/types';
import { theme } from '../lib/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const { colors, spacing, radius } = theme;

type PendingItem = {
  id: string;
  box: SelectionBox;
  label: string;
  description: string;
  estimatedValue: number;
  category: string;
};

export default function SelectFrame() {
  const { uri, mediaType } = useLocalSearchParams<{ uri: string; mediaType: 'image' | 'video' }>();
  const router = useRouter();
  const { addListingWithItems } = useListEasy();
  const videoRef = useRef<Video>(null);

  const isVideo = mediaType === 'video';
  const mediaUri = uri ?? '';

  const [frameTimeMs, setFrameTimeMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);
  const [thumbSize, setThumbSize] = useState({ width: 400, height: 300 });
  const [loadingThumb, setLoadingThumb] = useState(true);
  const [loadingAi, setLoadingAi] = useState(false);
  const [pendingBoxes, setPendingBoxes] = useState<SelectionBox[]>([]);
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [title, setTitle] = useState('My room');
  const [zipCode, setZipCode] = useState('');

  const loadThumbnailFromVideo = useCallback(
    async (atTimeMs?: number) => {
      if (!mediaUri || !isVideo) return;
      setLoadingThumb(true);
      try {
        const time = Math.min(
          Math.max(0, atTimeMs ?? frameTimeMs),
          durationMs || 0
        );
        const { uri: thumbUri, width, height } = await VideoThumbnails.getThumbnailAsync(mediaUri, {
          time,
          quality: 0.8,
        });
        setThumbnailUri(thumbUri);
        setThumbSize({ width: width ?? 400, height: height ?? 300 });
      } catch (e) {
        Alert.alert('Error', 'Could not load video frame. Try a different time.');
      } finally {
        setLoadingThumb(false);
      }
    },
    [mediaUri, isVideo, frameTimeMs, durationMs]
  );

  const loadImageDimensions = useCallback((imageUri: string) => {
    Image.getSize(
      imageUri,
      (width, height) => setThumbSize({ width, height }),
      () => setThumbSize({ width: 400, height: 300 })
    );
  }, []);

  useEffect(() => {
    if (!mediaUri) return;
    if (isVideo) {
      loadThumbnailFromVideo();
    } else {
      setThumbnailUri(mediaUri);
      loadImageDimensions(mediaUri);
      setLoadingThumb(false);
    }
  }, [mediaUri, isVideo, loadImageDimensions]);

  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    if (status.durationMillis != null) setDurationMs((d) => (d === 0 ? status.durationMillis ?? 0 : d));
    setFrameTimeMs((prev) => {
      const pos = status.positionMillis ?? 0;
      if (Math.abs(prev - pos) > 200) return pos;
      return prev;
    });
    setIsPlaying(!!status.isPlaying);
  }, []);

  const seekTo = useCallback(
    (ms: number) => {
      const clamped = Math.min(Math.max(0, ms), durationMs || 0);
      setFrameTimeMs(clamped);
      videoRef.current?.setPositionAsync(clamped);
      if (isVideo && mediaUri) {
        loadThumbnailFromVideo(clamped);
      }
    },
    [durationMs, isVideo, mediaUri, loadThumbnailFromVideo]
  );

  const stepSec = (delta: number) => {
    seekTo(frameTimeMs + delta * 1000);
  };

  const togglePlayPause = useCallback(async () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
  }, [isPlaying]);

  const handleBoxAdd = useCallback(
    async (box: { x: number; y: number; width: number; height: number }) => {
      if (!thumbnailUri) return;
      const id = `box_${Date.now()}`;
      setPendingBoxes((prev) => [...prev, { id, ...box }]);
      setLoadingAi(true);
      try {
        const result = await getAIValuation(thumbnailUri, {
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height,
        });
        setPendingItems((prev) => [
          ...prev,
          {
            id,
            box: { id, ...box },
            label: result.label,
            description: result.description,
            estimatedValue: result.estimatedValue,
            category: result.category,
          },
        ]);
      } catch (_) {
        setPendingItems((prev) => [
          ...prev,
          {
            id,
            box: { id, ...box },
            label: 'Unknown item',
            description: 'Could not get value.',
            estimatedValue: 0,
            category: 'Furniture',
          },
        ]);
      } finally {
        setLoadingAi(false);
      }
    },
    [thumbnailUri]
  );

  const saveListing = useCallback(() => {
    if (!mediaUri || !thumbnailUri || pendingItems.length === 0) {
      Alert.alert('Add items', 'Draw at least one box on the frame to list an item.');
      return;
    }
    const listingId = addListingWithItems(
      {
        videoUri: mediaUri,
        thumbnailUri,
        frameTimeMs,
        title: title.trim() || 'My room',
        zipCode: zipCode.trim() ? zipCode.trim().replace(/\D/g, '').slice(0, 5) : undefined,
        isVideo: isVideo,
      },
      pendingItems.map((p) => ({
        imageUri: thumbnailUri,
        box: p.box,
        label: p.label,
        description: p.description,
        estimatedValue: p.estimatedValue,
        category: p.category,
      }))
    );
    router.replace(`/listing/${listingId}`);
  }, [mediaUri, thumbnailUri, frameTimeMs, title, zipCode, pendingItems, addListingWithItems, router]);

  if (!mediaUri) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>No media provided.</Text>
      </View>
    );
  }

  if (loadingThumb && !thumbnailUri) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0f172a" />
        <Text style={styles.loadingLabel}>Loading…</Text>
      </View>
    );
  }

  if (!thumbnailUri) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Could not load frame.</Text>
      </View>
    );
  }

  const durationSec = Math.floor((durationMs || 0) / 1000);
  const currentSec = Math.floor(frameTimeMs / 1000);
  const formatTime = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {isVideo && (
        <View style={styles.videoSection}>
          <Video
            ref={videoRef}
            source={{ uri: mediaUri }}
            style={styles.video}
            useNativeControls={false}
            onPlaybackStatusUpdate={onPlaybackStatusUpdate}
            progressUpdateIntervalMillis={500}
          />
          <View style={styles.controls}>
            <TouchableOpacity style={styles.playPauseBtn} onPress={togglePlayPause} activeOpacity={0.8}>
              <Text style={styles.playPauseText}>{isPlaying ? 'Pause' : 'Play'}</Text>
            </TouchableOpacity>
            <Text style={styles.timeText}>
              {formatTime(currentSec)} / {formatTime(durationSec)}
            </Text>
            <View style={styles.stepRow}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => stepSec(-1)}>
                <Text style={styles.stepBtnText}>−1s</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.stepBtn} onPress={() => stepSec(1)}>
                <Text style={styles.stepBtnText}>+1s</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.sliderRow}>
              <Text style={styles.sliderLabel}>Frame:</Text>
              <TextInput
                style={styles.timeInput}
                value={String(currentSec)}
                keyboardType="number-pad"
                onChangeText={(t) => {
                  const sec = Math.max(0, parseInt(t, 10) || 0);
                  seekTo(sec * 1000);
                }}
              />
              <Text style={styles.sliderSuffix}>sec</Text>
            </View>
            <TouchableOpacity style={styles.refreshBtn} onPress={() => loadThumbnailFromVideo()}>
              <Text style={styles.refreshBtnText}>Update frame below</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!isVideo && (
        <Text style={styles.hint}>Draw a box around each item you want to list. AI will value it.</Text>
      )}
      {isVideo && (
        <Text style={styles.hint}>
          Set the time above, then draw boxes on the frame below. Tap “Update frame below” if the
          image doesn’t match.
        </Text>
      )}

      <FrameSelector
        imageUri={thumbnailUri}
        imageWidth={thumbSize.width}
        imageHeight={thumbSize.height}
        boxes={pendingBoxes}
        onBoxAdd={handleBoxAdd}
        loading={loadingAi}
      />

      {pendingItems.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items to list ({pendingItems.length})</Text>
          {pendingItems.map((p) => (
            <View key={p.id} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemLabel}>{p.label}</Text>
                <Text style={styles.itemValue}>Est. ${p.estimatedValue}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.titleLabel}>Listing title</Text>
      <TextInput
        style={styles.titleInput}
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Living room"
        placeholderTextColor="#94a3b8"
      />

      <Text style={styles.titleLabel}>Zip code (for buyers searching by area)</Text>
      <TextInput
        style={styles.titleInput}
        value={zipCode}
        onChangeText={(t) => setZipCode(t.replace(/\D/g, '').slice(0, 5))}
        placeholder="e.g. 11201"
        placeholderTextColor="#94a3b8"
        keyboardType="number-pad"
        maxLength={5}
      />

      <TouchableOpacity
        style={[styles.saveBtn, pendingItems.length === 0 && styles.saveBtnDisabled]}
        onPress={saveListing}
        disabled={pendingItems.length === 0}
        activeOpacity={0.85}
      >
        <Text style={styles.saveBtnText}>Save listing</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingLabel: { marginTop: 12, color: '#64748b' },
  error: { color: '#dc2626', fontSize: 16 },
  videoSection: { marginBottom: 16 },
  video: {
    width: SCREEN_WIDTH - 32,
    height: 200,
    backgroundColor: '#000',
    borderRadius: 12,
    alignSelf: 'center',
  },
  controls: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  playPauseBtn: {
    backgroundColor: '#0f172a',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  playPauseText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  timeText: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 8 },
  stepRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 8 },
  stepBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  stepBtnText: { fontSize: 15, fontWeight: '600', color: '#334155' },
  sliderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  sliderLabel: { fontSize: 14, color: '#475569', marginRight: 8 },
  timeInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    width: 56,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  sliderSuffix: { fontSize: 14, color: '#64748b', marginLeft: 4 },
  refreshBtn: { alignSelf: 'center', paddingVertical: 6 },
  refreshBtnText: { color: '#3b82f6', fontWeight: '600', fontSize: 14 },
  hint: { fontSize: 13, color: '#64748b', marginBottom: 8 },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#334155', marginBottom: 8 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 6,
  },
  itemInfo: {},
  itemLabel: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
  itemValue: { fontSize: 13, color: '#22c55e', marginTop: 2 },
  titleLabel: { fontSize: 14, fontWeight: '600', color: '#334155', marginTop: 16, marginBottom: 6 },
  titleInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radius.lg,
    alignItems: 'center',
    marginTop: 24,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: colors.textOnPrimary, fontSize: 16, fontWeight: '700' },
});
