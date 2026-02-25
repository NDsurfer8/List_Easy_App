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
        <Text style={styles.headerTitle}>Browse by zip code</Text>
        <Text style={styles.headerSub}>
          Search by zip to view listings and room videos. Tap a listing to see items and make offers.
        </Text>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.zipInput}
          value={zipInput}
          onChangeText={(t) => setZipInput(t.replace(/\D/g, '').slice(0, 5))}
          placeholder="Enter zip code"
          placeholderTextColor="#94a3b8"
          keyboardType="number-pad"
          maxLength={5}
        />
        <TouchableOpacity
          style={styles.searchBtn}
          onPress={() => setSearchZip(normalizedZip || ALL)}
          activeOpacity={0.85}
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
            activeOpacity={0.8}
          >
            <Text style={[styles.chipText, showAll && styles.chipTextSelected]}>All listings</Text>
          </TouchableOpacity>
          {zipCodes.map((zip) => (
            <TouchableOpacity
              key={zip}
              style={[styles.chip, searchZip === zip && styles.chipSelected]}
              onPress={() => setSearchZip(zip)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, searchZip === zip && styles.chipTextSelected]}>
                {zip}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {!showAll && searchZip && (
        <Text style={styles.resultLabel}>Listings in {searchZip}</Text>
      )}

      {listings.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No listings found</Text>
          <Text style={styles.emptySub}>
            {showAll
              ? 'Listings will show up when sellers add room videos or photos and set a zip code.'
              : searchZip
                ? `No listings in zip ${searchZip}. Try "All listings" or another zip.`
                : 'Enter a zip code and tap Search, or choose "All listings".'}
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
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: item.thumbnailUri }}
                style={styles.cardThumb}
                resizeMode="cover"
              />
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.title || 'Room listing'}
                </Text>
                {item.zipCode ? (
                  <Text style={styles.cardZip}>ZIP {item.zipCode}</Text>
                ) : null}
                <Text style={styles.cardMeta}>
                  {item.items.length} item{item.items.length !== 1 ? 's' : ''} · Tap to view & make
                  offers
                </Text>
              </View>
              <Text style={styles.cardArrow}>→</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#f8fafc' },
  headerSub: { fontSize: 14, color: '#94a3b8', marginTop: 6, lineHeight: 20 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 10,
  },
  zipInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 18,
    backgroundColor: '#f8fafc',
  },
  searchBtn: {
    backgroundColor: '#0f172a',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  searchBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  chipRow: { maxHeight: 48 },
  chipScroll: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
    marginRight: 8,
  },
  chipSelected: { backgroundColor: '#0f172a' },
  chipText: { fontSize: 14, fontWeight: '600', color: '#475569' },
  chipTextSelected: { color: '#fff' },
  resultLabel: {
    fontSize: 14,
    color: '#64748b',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
  empty: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#334155', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 22 },
  list: { padding: 16, paddingBottom: 32 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardThumb: { width: 100, height: 100, backgroundColor: '#e2e8f0' },
  cardBody: { flex: 1, padding: 14 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  cardZip: { fontSize: 13, color: '#64748b', marginTop: 2 },
  cardMeta: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  cardArrow: { fontSize: 18, color: '#94a3b8', paddingRight: 14 },
});
