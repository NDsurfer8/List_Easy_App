import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useListEasy } from '../../context/ListEasyContext';

export default function ListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getListing } = useListEasy();
  const listing = id ? getListing(id) : undefined;

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
          source={{ uri: listing.thumbnailUri }}
          style={styles.thumb}
          resizeMode="cover"
        />
        {listing.isVideo ? (
          <TouchableOpacity
            style={styles.playVideoBtn}
            onPress={() => router.push(`/video/${listing.id}`)}
            activeOpacity={0.85}
          >
            <Text style={styles.playVideoBtnText}>▶ Play room video</Text>
          </TouchableOpacity>
        ) : null}
        <Text style={styles.title}>{listing.title}</Text>
        {listing.zipCode ? (
          <Text style={styles.location}>ZIP {listing.zipCode}</Text>
        ) : null}
        <Text style={styles.meta}>
          {listing.items.length} item{listing.items.length !== 1 ? 's' : ''} · Tap to view & make offers
        </Text>
      </View>
      <FlatList
        data={listing.items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/item/${item.id}`)}
            activeOpacity={0.9}
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardLabel}>{item.label}</Text>
              <Text style={styles.cardValue}>Est. ${item.estimatedValue}</Text>
              <View style={[styles.badge, item.status !== 'available' && styles.badgeSold]}>
                <Text style={styles.badgeText}>{item.status}</Text>
              </View>
            </View>
            <Text style={styles.cardArrow}>→</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { color: '#dc2626', fontSize: 16 },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  thumb: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
  },
  playVideoBtn: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#0f172a',
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  playVideoBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '700', color: '#1e293b', marginTop: 12 },
  location: { fontSize: 14, color: '#64748b', marginTop: 4 },
  meta: { fontSize: 14, color: '#64748b', marginTop: 4 },
  list: { padding: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  cardContent: {},
  cardLabel: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  cardValue: { fontSize: 14, color: '#22c55e', marginTop: 2 },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#dcfce7',
  },
  badgeSold: { backgroundColor: '#fef3c7' },
  badgeText: { fontSize: 12, color: '#166534', fontWeight: '500', textTransform: 'capitalize' },
  cardArrow: { fontSize: 18, color: '#94a3b8' },
});
