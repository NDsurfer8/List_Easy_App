import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { useListEasy } from '../context/ListEasyContext';
import { FrameSelector } from '../components/FrameSelector';
import { getAIValuation } from '../lib/ai';
import type { SelectionBox } from '../lib/types';

type PendingItem = {
  id: string;
  box: SelectionBox;
  label: string;
  description: string;
  estimatedValue: number;
  category: string;
};

export default function SelectFrame() {
  const { videoUri } = useLocalSearchParams<{ videoUri: string }>();
  const router = useRouter();
  const { addListing, addItem } = useListEasy();

  const [frameTimeMs, setFrameTimeMs] = useState(0);
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);
  const [thumbSize, setThumbSize] = useState({ width: 400, height: 300 });
  const [loadingThumb, setLoadingThumb] = useState(true);
  const [loadingAi, setLoadingAi] = useState(false);
  const [pendingBoxes, setPendingBoxes] = useState<SelectionBox[]>([]);
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [title, setTitle] = useState('My room');

  const loadThumbnail = useCallback(async () => {
    if (!videoUri) return;
    setLoadingThumb(true);
    try {
      const { uri, width, height } = await VideoThumbnails.getThumbnailAsync(videoUri, {
        time: frameTimeMs,
        quality: 0.8,
      });
      setThumbnailUri(uri);
      setThumbSize({ width: width ?? 400, height: height ?? 300 });
    } catch (e) {
      Alert.alert('Error', 'Could not load video frame. Try a different time.');
    } finally {
      setLoadingThumb(false);
    }
  }, [videoUri, frameTimeMs]);

  useEffect(() => {
    loadThumbnail();
  }, [loadThumbnail]);

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
    if (!videoUri || !thumbnailUri || pendingItems.length === 0) {
      Alert.alert('Add items', 'Draw at least one box on the frame to list an item.');
      return;
    }
    const listingId = addListing({
      videoUri,
      thumbnailUri,
      frameTimeMs,
      title: title.trim() || 'My room',
      items: [],
    });
    pendingItems.forEach((p) => {
      addItem(listingId, {
        imageUri: thumbnailUri,
        box: p.box,
        label: p.label,
        description: p.description,
        estimatedValue: p.estimatedValue,
        category: p.category,
      });
    });
    router.replace(`/listing/${listingId}`);
  }, [videoUri, thumbnailUri, frameTimeMs, title, pendingItems, addListing, addItem, router]);

  if (!videoUri) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>No video provided.</Text>
      </View>
    );
  }

  if (loadingThumb && !thumbnailUri) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0f172a" />
        <Text style={styles.loadingLabel}>Loading frame…</Text>
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.timeRow}>
        <Text style={styles.timeLabel}>Frame time (sec):</Text>
        <TextInput
          style={styles.timeInput}
          value={String(Math.round(frameTimeMs / 1000))}
          keyboardType="number-pad"
          onChangeText={(t) => setFrameTimeMs(Math.max(0, parseInt(t, 10) || 0) * 1000)}
        />
        <TouchableOpacity style={styles.refreshBtn} onPress={loadThumbnail}>
          <Text style={styles.refreshBtnText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>Draw a box around each item you want to list. AI will value it.</Text>

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
  timeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  timeLabel: { fontSize: 14, color: '#475569', marginRight: 8 },
  timeInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: 70,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  refreshBtn: { marginLeft: 12, paddingVertical: 8, paddingHorizontal: 12 },
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
    backgroundColor: '#0f172a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
