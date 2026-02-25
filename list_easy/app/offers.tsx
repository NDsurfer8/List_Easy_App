import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useListEasy } from '../context/ListEasyContext';

export default function OffersScreen() {
  const router = useRouter();
  const { offers, getItem, getListing, acceptOffer, declineOffer } = useListEasy();

  const pendingOffers = offers.filter((o) => o.status === 'pending');
  const acceptedOffers = offers.filter((o) => o.status === 'accepted');

  const handleAccept = (offerId: string) => {
    acceptOffer(offerId);
    Alert.alert('Offer accepted', 'You can schedule pickup in the listing.');
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
              activeOpacity={0.85}
            >
              <Text style={styles.acceptBtnText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.declineBtn}
              onPress={() => handleDecline(offer.id)}
              activeOpacity={0.85}
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
        <Text style={styles.sectionTitle}>Pending offers</Text>
        {pendingOffers.length === 0 ? (
          <Text style={styles.empty}>No pending offers.</Text>
        ) : (
          pendingOffers.map((offer) => (
            <View key={offer.id}>{renderOffer({ item: offer, isPending: true })}</View>
          ))
        )}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Accepted / Pickups</Text>
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
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  content: { padding: 20, paddingBottom: 40 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#334155', marginBottom: 12 },
  empty: { fontSize: 15, color: '#64748b', paddingVertical: 8 },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemName: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  amount: { fontSize: 18, fontWeight: '700', color: '#22c55e' },
  message: { fontSize: 14, color: '#64748b', fontStyle: 'italic', marginTop: 6 },
  meta: { marginTop: 6 },
  metaText: { fontSize: 13, color: '#94a3b8' },
  actions: { flexDirection: 'row', marginTop: 12, gap: 10 },
  acceptBtn: {
    flex: 1,
    backgroundColor: '#22c55e',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  declineBtn: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  declineBtnText: { color: '#64748b', fontWeight: '600', fontSize: 14 },
  pickupRow: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  pickupLabel: { fontSize: 12, color: '#64748b', marginBottom: 2 },
  pickupText: { fontSize: 14, color: '#1e293b' },
});
