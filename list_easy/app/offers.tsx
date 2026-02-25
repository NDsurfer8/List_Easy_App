import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useListEasy } from '../context/ListEasyContext';
import { theme } from '../lib/theme';

const { colors, spacing, radius, typography, shadow } = theme;

export default function OffersScreen() {
  const router = useRouter();
  const { offers, getItem, getListing, acceptOffer, declineOffer } = useListEasy();

  const pendingOffers = offers.filter((o) => o.status === 'pending');
  const acceptedOffers = offers.filter((o) => o.status === 'accepted');

  const handleAccept = (offerId: string) => {
    acceptOffer(offerId);
    Alert.alert('Offer accepted', 'You can schedule pickup with the buyer.');
  };

  const handleDecline = (offerId: string) => {
    declineOffer(offerId);
  };

  const renderOffer = ({
    item: offer,
    isPending,
  }: {
    item: (typeof offers)[0];
    isPending: boolean;
  }) => {
    const item = getItem(offer.itemId);
    const listing = getListing(offer.listingId);
    if (!item) return null;
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={styles.itemName}>{item.label}</Text>
          <Text style={styles.amount}>${offer.amount}</Text>
        </View>
        {offer.message ? (
          <Text style={styles.message} numberOfLines={2}>
            "{offer.message}"
          </Text>
        ) : null}
        <View style={styles.meta}>
          <Text style={styles.metaText}>
            {listing?.title ?? 'Listing'} · {offer.buyerName ?? 'Buyer'}
          </Text>
        </View>
        {isPending && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.acceptBtn}
              onPress={() => handleAccept(offer.id)}
              activeOpacity={0.88}
            >
              <Text style={styles.acceptBtnText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.declineBtn}
              onPress={() => handleDecline(offer.id)}
              activeOpacity={0.88}
            >
              <Text style={styles.declineBtnText}>Decline</Text>
            </TouchableOpacity>
          </View>
        )}
        {offer.status === 'accepted' && (
          <View style={styles.pickupRow}>
            <Text style={styles.pickupLabel}>Pickup</Text>
            <Text style={styles.pickupText}>
              {offer.pickupScheduledAt
                ? new Date(offer.pickupScheduledAt).toLocaleDateString()
                : 'Schedule pickup with buyer'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pending</Text>
        {pendingOffers.length === 0 ? (
          <Text style={styles.empty}>No pending offers.</Text>
        ) : (
          pendingOffers.map((offer) => (
            <View key={offer.id}>{renderOffer({ item: offer, isPending: true })}</View>
          ))
        )}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Accepted & pickups</Text>
        {acceptedOffers.length === 0 ? (
          <Text style={styles.empty}>No accepted offers yet.</Text>
        ) : (
          acceptedOffers.map((offer) => (
            <View key={offer.id}>{renderOffer({ item: offer, isPending: false })}</View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: 40 },
  section: { marginBottom: spacing.xxl },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.md },
  empty: { ...typography.bodySmall, color: colors.textMuted, paddingVertical: spacing.sm },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    ...shadow.sm,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemName: { ...typography.h3, color: colors.text, fontSize: 16 },
  amount: { fontSize: 18, fontWeight: '800', color: colors.success },
  message: {
    ...typography.bodySmall,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  meta: { marginTop: spacing.sm },
  metaText: { ...typography.caption, color: colors.textMuted },
  actions: { flexDirection: 'row', marginTop: spacing.md, gap: spacing.md },
  acceptBtn: {
    flex: 1,
    backgroundColor: colors.success,
    paddingVertical: 12,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  acceptBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  declineBtn: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    paddingVertical: 12,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  declineBtnText: { color: colors.textSecondary, fontWeight: '600', fontSize: 14 },
  pickupRow: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  pickupLabel: { ...typography.label, color: colors.textMuted, marginBottom: 2 },
  pickupText: { ...typography.bodySmall, color: colors.text },
});
