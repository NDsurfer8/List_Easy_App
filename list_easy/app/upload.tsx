import { useState } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../lib/theme';

const { colors, spacing, radius, typography, shadow } = theme;

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
      const type = asset.type === 'video' ? 'video' : 'image';
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
      <View style={styles.card}>
        <Text style={styles.title}>Add a room to list</Text>
        <Text style={styles.instruction}>
          Choose a video or photo of the room. For video, scrub or play to pick a frame. For a photo,
          you’ll draw boxes on it. We’ll suggest values for each item.
        </Text>
        <TouchableOpacity
          style={[styles.primaryBtn, loading && styles.disabled]}
          onPress={() => pickMedia(['videos'])}
          disabled={loading}
          activeOpacity={0.88}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.primaryBtnEmoji}>🎬</Text>
              <Text style={styles.primaryBtnText}>Pick video</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.secondaryBtn, loading && styles.disabled]}
          onPress={() => pickMedia(['images'])}
          disabled={loading}
          activeOpacity={0.88}
        >
          <Text style={styles.secondaryBtnEmoji}>📷</Text>
          <Text style={styles.secondaryBtnText}>Pick photo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xxl,
    ...shadow.sm,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
  },
  instruction: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.xxl,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  primaryBtnEmoji: { fontSize: 18 },
  primaryBtnText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
    paddingVertical: 16,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  secondaryBtnEmoji: { fontSize: 18 },
  secondaryBtnText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: { opacity: 0.6 },
});
