import { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useListEasy } from '../context/ListEasyContext';
import { theme } from '../lib/theme';

const { colors, spacing, radius, typography, shadow } = theme;
const ALL = '';

export default function BrowseScreen() {
  const router = useRouter();
  const { getZipCodes, getListingsByZipCode } = useListEasy();
  const [zipInput, setZipInput] = useState('');
  const [searchZip, setSearchZip] = useState<string | null>(ALL);

  const zipCodes = useMemo(() => getZipCodes(), [getZipCodes]);
  const listings = useMemo(
    () => getListingsByZipCode(searchZip),
    [getListingsByZipCode, searchZip]
  );

  const normalizedZip = zipInput.replace(/\D/g, '').slice(0, 5);
  const showAll = searchZip === ALL;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Browse by zip</Text>
        <Text style={styles.headerSub}>
          Find room listings near you. Tap one to see items and make offers.
        </Text>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.zipInput}
          value={zipInput}
          onChangeText={(t) => setZipInput(t.replace(/\D/g, '').slice(0, 5))}
          placeholder="ZIP code"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          maxLength={5}
        />
        <TouchableOpacity
          style={styles.searchBtn}
          onPress={() => setSearchZip(normalizedZip || ALL)}
          activeOpacity={0.88}
        >
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.chipRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipScroll}
        >
          <TouchableOpacity
            style={[styles.chip, showAll && styles.chipSelected]}
            onPress={() => setSearchZip(ALL)}
            activeOpacity={0.88}
          >
            <Text style={[styles.chipText, showAll && styles.chipTextSelected]}>All</Text>
          </TouchableOpacity>
          {zipCodes.map((zip) => (
            <TouchableOpacity
              key={zip}
              style={[styles.chip, searchZip === zip && styles.chipSelected]}
              onPress={() => setSearchZip(zip)}
              activeOpacity={0.88}
            >
              <Text style={[styles.chipText, searchZip === zip && styles.chipTextSelected]}>
                {zip}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {!showAll && searchZip ? (
        <Text style={styles.resultLabel}>In {searchZip}</Text>
      ) : null}

      {listings.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>No listings here</Text>
          <Text style={styles.emptySub}>
            {showAll
              ? 'When sellers list rooms with a zip code, they’ll show up here.'
              : `Nothing in ${searchZip}. Try another zip or "All".`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/listing/${item.id}`)}
              activeOpacity={0.92}
            >
              <Image
                source={{ uri: item.thumbnailUrl ?? item.thumbnailUri }}
                style={styles.cardThumb}
                resizeMode="cover"
              />
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.title || 'Room listing'}
                </Text>
                {item.zipCode ? (
                  <Text style={styles.cardZip}>{item.zipCode}</Text>
                ) : null}
                <Text style={styles.cardMeta}>
                  {item.items.length} item{item.items.length !== 1 ? 's' : ''}
                </Text>
              </View>
              <Text style={styles.cardArrow}>›</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.textOnPrimary,
    fontSize: 22,
  },
  headerSub: {
    ...typography.bodySmall,
    color: colors.textOnPrimaryMuted,
    marginTop: spacing.sm,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  zipInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    fontSize: 18,
    backgroundColor: colors.background,
  },
  searchBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
  },
  searchBtnText: { color: colors.textOnAccent, fontSize: 16, fontWeight: '700' },
  chipRow: { maxHeight: 48 },
  chipScroll: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    marginRight: spacing.sm,
  },
  chipSelected: { backgroundColor: colors.primary },
  chipText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  chipTextSelected: { color: colors.textOnPrimary },
  resultLabel: {
    ...typography.caption,
    color: colors.textMuted,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  empty: {
    flex: 1,
    padding: spacing.xxl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: { fontSize: 40, marginBottom: spacing.lg },
  emptyTitle: { ...typography.h3, color: colors.textSecondary, marginBottom: spacing.sm },
  emptySub: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  list: { padding: spacing.lg, paddingBottom: 40 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadow.sm,
  },
  cardThumb: { width: 88, height: 88, backgroundColor: colors.surfaceMuted },
  cardBody: { flex: 1, padding: spacing.lg },
  cardTitle: { ...typography.h3, color: colors.text, fontSize: 16 },
  cardZip: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  cardMeta: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  cardArrow: {
    fontSize: 22,
    color: colors.textMuted,
    paddingRight: spacing.lg,
    fontWeight: '300',
  },
});
