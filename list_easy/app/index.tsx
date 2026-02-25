import { Text, View, TouchableOpacity, FlatList, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useListEasy } from '../context/ListEasyContext';
import { theme } from '../lib/theme';

const { colors, spacing, radius, typography, shadow } = theme;

export default function Home() {
  const router = useRouter();
  const { listings } = useListEasy();

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>List Easy</Text>
        <Text style={styles.heroTitle}>Sell what you see</Text>
        <Text style={styles.heroSub}>
          Film your room, tap items for AI values, and let buyers make offers and pick up.
        </Text>
        <View style={styles.heroActions}>
          <TouchableOpacity
            style={styles.uploadBtn}
            onPress={() => router.push('/upload')}
            activeOpacity={0.88}
          >
            <Text style={styles.uploadBtnText}>List your room</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => router.push('/browse')}
            activeOpacity={0.88}
          >
            <Text style={styles.browseBtnText}>Browse by zip</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your listings</Text>
        {listings.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>📦</Text>
            </View>
            <Text style={styles.emptyTitle}>No listings yet</Text>
            <Text style={styles.emptySub}>List your room to start selling. It only takes a minute.</Text>
          </View>
        ) : (
          <FlatList
            data={listings}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/listing/${item.id}`)}
                activeOpacity={0.92}
              >
                <Image
                  source={{ uri: item.thumbnailUrl ?? item.thumbnailUri }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.title || 'Room listing'}
                  </Text>
                  <Text style={styles.cardMeta}>
                    {item.items.length} item{item.items.length !== 1 ? 's' : ''}
                    {item.zipCode ? ` · ${item.zipCode}` : ''}
                  </Text>
                </View>
                <Text style={styles.cardArrow}>›</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      <TouchableOpacity
        style={styles.footerLink}
        onPress={() => router.push('/offers')}
        activeOpacity={0.8}
      >
        <Text style={styles.footerLinkText}>Offers & pickups</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingTop: 32,
    paddingBottom: 36,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    ...shadow.md,
  },
  heroLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accentMuted,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  heroTitle: {
    ...typography.hero,
    color: colors.textOnPrimary,
    marginBottom: spacing.sm,
  },
  heroSub: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  heroActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  uploadBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: radius.md,
  },
  uploadBtnText: {
    color: colors.textOnAccent,
    fontSize: 16,
    fontWeight: '700',
  },
  browseBtn: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  browseBtnText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    flex: 1,
    padding: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  empty: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyIconText: { fontSize: 32 },
  emptyTitle: {
    ...typography.h3,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  emptySub: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadow.sm,
  },
  cardImage: {
    width: 72,
    height: 72,
    backgroundColor: colors.surfaceMuted,
  },
  cardContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.text,
    fontSize: 16,
  },
  cardMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  cardArrow: {
    fontSize: 24,
    color: colors.textMuted,
    paddingRight: spacing.lg,
    fontWeight: '300',
  },
  footerLink: {
    padding: spacing.xl,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerLinkText: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: '600',
  },
});
