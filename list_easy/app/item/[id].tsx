import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { ListedItem } from '../../lib/types';
import { useListEasy } from '../../context/ListEasyContext';
import { getSimilarCategory } from '../../lib/ai';
import { theme } from '../../lib/theme';

const { colors, spacing, radius, typography, shadow } = theme;

export default function ItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getItem, getListing, getSimilarItems, addOffer } = useListEasy();
  const item = id ? getItem(id) : undefined;
  const listing = item ? getListing(item.listingId) : undefined;
  const similar = item ? getSimilarItems(item.category, item.id) : [];
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleMakeOffer = () => {
    if (!item || item.status !== 'available') return;
    const amount = parseInt(offerAmount, 10);
    if (isNaN(amount) || amount < 1) {
      Alert.alert('Invalid offer', 'Enter a valid amount in dollars.');
      return;
    }
    setSending(true);
    addOffer({
      itemId: item.id,
      listingId: item.listingId,
      amount,
      message: offerMessage.trim(),
      buyerName: 'You',
    });
    setSending(false);
    setOfferAmount('');
    setOfferMessage('');
    Alert.alert('Offer sent', 'The seller will review your offer.');
  };

  if (!item) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Item not found.</Text>
      </View>
    );
  }

  const similarLabels = getSimilarCategory(item.category);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Image source={{ uri: item.imageUri }} style={styles.image} resizeMode="cover" />
      <View style={styles.main}>
        <Text style={styles.label}>{item.label}</Text>
        <View style={styles.valueRow}>
          <Text style={styles.valueLabel}>Est. value</Text>
          <Text style={styles.value}>${item.estimatedValue}</Text>
        </View>
        <Text style={styles.description}>{item.description}</Text>
        <View style={styles.badgeWrap}>
          <View style={[styles.badge, item.status !== 'available' && styles.badgeSold]}>
            <Text style={styles.badgeText}>{item.status}</Text>
          </View>
          <Text style={styles.category}>{item.category}</Text>
        </View>
        <TouchableOpacity
          style={styles.editItemBtn}
          onPress={() => router.push(`/item/edit/${item.id}`)}
          activeOpacity={0.88}
        >
          <Text style={styles.editItemBtnText}>Edit item</Text>
        </TouchableOpacity>
      </View>

      {item.status === 'available' && (
        <View style={styles.offerSection}>
          <Text style={styles.sectionTitle}>Make an offer</Text>
          <TextInput
            style={styles.input}
            value={offerAmount}
            onChangeText={setOfferAmount}
            placeholder="Your offer ($)"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
          />
          <TextInput
            style={[styles.input, styles.messageInput]}
            value={offerMessage}
            onChangeText={setOfferMessage}
            placeholder="Message (optional)"
            placeholderTextColor={colors.textMuted}
            multiline
          />
          <TouchableOpacity
            style={[styles.offerBtn, sending && styles.disabled]}
            onPress={handleMakeOffer}
            disabled={sending}
            activeOpacity={0.88}
          >
            <Text style={styles.offerBtnText}>Submit offer</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.similarSection}>
        <Text style={styles.sectionTitle}>Similar items</Text>
        <Text style={styles.similarHint}>
          In this category: {similarLabels.slice(0, 5).join(', ')}
        </Text>
        {similar.length > 0 && (
          <View style={styles.similarList}>
            {similar.slice(0, 4).map((s: ListedItem) => (
              <TouchableOpacity
                key={s.id}
                style={styles.similarCard}
                onPress={() => router.push(`/item/${s.id}`)}
                activeOpacity={0.92}
              >
                <Text style={styles.similarLabel}>{s.label}</Text>
                <Text style={styles.similarValue}>${s.estimatedValue}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { ...typography.body, color: colors.error },
  image: {
    width: '100%',
    height: 240,
    backgroundColor: colors.surfaceMuted,
  },
  main: {
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: { ...typography.h1, color: colors.text, fontSize: 22 },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: spacing.sm },
  valueLabel: { ...typography.bodySmall, color: colors.textMuted, marginRight: spacing.sm },
  value: { fontSize: 26, fontWeight: '800', color: colors.success },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  badgeWrap: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md, gap: spacing.md },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: colors.successBg,
  },
  badgeSold: { backgroundColor: colors.warningBg },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
    textTransform: 'capitalize',
  },
  category: { ...typography.caption, color: colors.textMuted },
  editItemBtn: {
    marginTop: spacing.lg,
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  editItemBtnText: { fontSize: 14, fontWeight: '600', color: colors.text },
  offerSection: {
    padding: spacing.xl,
    backgroundColor: colors.surface,
    marginTop: spacing.md,
  },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.md },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: colors.background,
    marginBottom: spacing.md,
  },
  messageInput: { minHeight: 80 },
  offerBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  offerBtnText: { color: colors.textOnAccent, fontSize: 16, fontWeight: '700' },
  disabled: { opacity: 0.6 },
  similarSection: { padding: spacing.xl },
  similarHint: { ...typography.bodySmall, color: colors.textMuted, marginBottom: spacing.md },
  similarList: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  similarCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.lg,
    minWidth: 140,
    ...shadow.sm,
  },
  similarLabel: { ...typography.h3, color: colors.text, fontSize: 14 },
  similarValue: { fontSize: 14, fontWeight: '700', color: colors.success, marginTop: 2 },
});
