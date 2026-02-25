import { Text, View, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useListEasy } from '../context/ListEasyContext';

export default function Home() {
  const router = useRouter();
  const { listings } = useListEasy();

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Sell what you see</Text>
        <Text style={styles.heroSub}>
          Film your room, tap items to get AI values, and let buyers make offers & pick up.
        </Text>
        <TouchableOpacity
          style={styles.uploadBtn}
          onPress={() => router.push('/upload')}
          activeOpacity={0.85}
        >
          <Text style={styles.uploadBtnText}>Upload room video</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your listings</Text>
        {listings.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No room videos yet.</Text>
            <Text style={styles.emptySub}>Upload a video to start listing items.</Text>
          </View>
        ) : (
          <FlatList
            data={listings}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/listing/${item.id}`)}
                activeOpacity={0.9}
              >
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.title || 'Room listing'}
                  </Text>
                  <Text style={styles.cardMeta}>
                    {item.items.length} item{item.items.length !== 1 ? 's' : ''}
                  </Text>
                </View>
                <Text style={styles.cardArrow}>→</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      <TouchableOpacity
        style={styles.offersLink}
        onPress={() => router.push('/offers')}
        activeOpacity={0.8}
      >
        <Text style={styles.offersLinkText}>View offers & pickups</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  hero: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 15,
    color: '#94a3b8',
    lineHeight: 22,
    marginBottom: 20,
  },
  uploadBtn: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  uploadBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 12,
  },
  empty: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 14,
    color: '#94a3b8',
  },
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  cardMeta: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  cardArrow: {
    fontSize: 18,
    color: '#94a3b8',
  },
  offersLink: {
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  offersLinkText: {
    fontSize: 15,
    color: '#3b82f6',
    fontWeight: '500',
  },
});
