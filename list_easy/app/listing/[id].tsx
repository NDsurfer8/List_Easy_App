import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { useListEasy } from '../../context/ListEasyContext';
import { theme } from '../../lib/theme';

const { colors, spacing, radius, typography, shadow } = theme;

export default function ListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getListing, deleteListing } = useListEasy();
  const listing = id ? getListing(id) : undefined;

  const handleDelete = () => {
    if (!id || !listing) return;
    Alert.alert(
      'Delete listing',
      `Remove "${listing.title}" and all ${listing.items.length} item(s)? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteListing(id);
            router.replace('/');
          },
        },
      ]
    );
  };

  if (!listing) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Listing not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: listing.thumbnailUrl ?? listing.thumbnailUri }}
          style={styles.thumb}
          resizeMode="cover"
        />
        {listing.isVideo ? (
          <TouchableOpacity
            style={styles.playVideoBtn}
            onPress={() => router.push(`/video/${listing.id}`)}
            activeOpacity={0.88}
          >
            <Text style={styles.playVideoBtnText}>▶ Play room video</Text>
          </TouchableOpacity>
        ) : null}
        <Text style={styles.title}>{listing.title}</Text>
        {listing.zipCode ? (
          <Text style={styles.location}>{listing.zipCode}</Text>
        ) : null}
        <Text style={styles.meta}>
          {listing.items.length} item{listing.items.length !== 1 ? 's' : ''} · Tap to view & make offers
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => router.push(`/listing/edit/${id}`)}
            activeOpacity={0.88}
          >
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.88}>
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={listing.items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/item/${item.id}`)}
            activeOpacity={0.92}
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardLabel}>{item.label}</Text>
              <Text style={styles.cardValue}>${item.estimatedValue}</Text>
              <View style={[styles.badge, item.status !== 'available' && styles.badgeSold]}>
                <Text style={styles.badgeText}>{item.status}</Text>
              </View>
            </View>
            <Text style={styles.cardArrow}>›</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { ...typography.body, color: colors.error },
  header: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  thumb: {
    width: '100%',
    height: 200,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
  },
  playVideoBtn: {
    marginTop: spacing.md,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  playVideoBtnText: { color: colors.textOnAccent, fontSize: 14, fontWeight: '700' },
  title: { ...typography.h2, color: colors.text, marginTop: spacing.lg },
  location: { ...typography.bodySmall, color: colors.textMuted, marginTop: spacing.xs },
  meta: { ...typography.bodySmall, color: colors.textMuted, marginTop: spacing.xs },
  actions: { flexDirection: 'row', marginTop: spacing.lg, gap: spacing.md },
  editBtn: {
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
  },
  editBtnText: { color: colors.textOnPrimary, fontSize: 14, fontWeight: '600' },
  deleteBtn: {
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.errorBg,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  deleteBtnText: { color: colors.error, fontSize: 14, fontWeight: '600' },
  list: { padding: spacing.lg },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    ...shadow.sm,
  },
  cardContent: {},
  cardLabel: { ...typography.h3, color: colors.text, fontSize: 16 },
  cardValue: { fontSize: 16, fontWeight: '700', color: colors.success, marginTop: 2 },
  badge: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: colors.successBg,
  },
  badgeSold: { backgroundColor: colors.warningBg },
  badgeText: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  cardArrow: { fontSize: 22, color: colors.textMuted, fontWeight: '300' },
});
